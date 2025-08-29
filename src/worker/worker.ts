import standard from '../data/standard';
import weight, { StatKey } from '../data/weight';
import AffixName from '../data/AffixName';
import {findCombinations,EnchanceAllCombinations} from '../data/combination';
import { relicSubData } from '@/interface/simulator';
import { AffixItem, PieNumsItem, relicRank, standDetails } from '@/interface/global';
import { calTypeItem, coeEfficentItem } from '@/interface/worker';


onmessage = function (event) {
    //宣告變數
    let SubData=event.data.SubData as relicSubData[];
    let partsIndex=parseInt(event.data.partsIndex) as number;
    let MainAffix=AffixName.find((a)=>a.name===event.data.MainData) as AffixItem;
    let deviation=(event.data.deviation!==undefined)?event.data.deviation:0;
    
    //計算可用強化次數
    let enchanceCount=0;
    let lockArr:number[] = [];
    SubData.forEach(sb=>{    
        enchanceCount=enchanceCount+Number(sb.count);
        if(sb.locked)
            lockArr.push(sb.index);
    });


    //計算可能的強化組合
    let combination=findCombinations(enchanceCount,SubData.length,lockArr);

    let charStandard=calStand(event.data.standard);
    //分數誤差 目前先預設少半個有效詞條

    let coeEfficent=[] as coeEfficentItem[];//當前遺器係數arr
    SubData.forEach((sub)=>{
        let SubAffixType=AffixName.find((s)=>s.name===sub.subaffix) as AffixItem;
        coeEfficent.push({
            type:SubAffixType.type,
            fieldName:SubAffixType.fieldName,
            num:Number(charStandard[SubAffixType.type])
        });
    });

    //將沒有被鎖住不可計算的詞條倒裝

    let MainData=charStandard[MainAffix.type];
    let result =[] as number[];
    let origin=relicScore(partsIndex,charStandard,SubData,MainData);
    //先算原本的遺器的分數

    let p1=new Promise(async (resolve,reject)=>{
        combination.forEach((c,i)=>{
            //計算各種強化程度的組合
            let subcombination=EnchanceAllCombinations(c) as number[][][];

            subcombination.forEach((s)=>{
                let res=0;
                if(partsIndex!==1&&partsIndex!==2)
                    res=3*MainData;
                
                let total=0;
                let caltype=[] as calTypeItem[];//已經計算過的詞條種類

                s.forEach((el,i) => {//對每個屬性詞條開始進行模擬計算
                    let sub=coeEfficent[i];
                    
                    let targetRange=AffixName.find((st)=>st.fieldName===sub.fieldName)!.range!;

                    //如果該詞條所獲得的強化次數為0 可以推測該數值為初始詞條數值 則直接繼承使用
                    if(SubData[i].count===0)
                        total=SubData[i].data;
                    else
                        total=targetRange[1];//詞條模擬出來的總和，初始為最中間的值
                    
                    el.forEach((num)=>total+=targetRange[num]);

                    //計算有效詞條數
                    let affixStandard=standard.find((t)=>t.type==='sub')!.data.find((d)=>d.name===sub.fieldName)!.data;
                    let cal=parseFloat((total/affixStandard).toFixed(2));

                    //獲得加權有效詞條數 並加上去
                    let affixmutl=charStandard[sub.type]*cal;
                    
                    
                    //如果沒有計算過此種類詞條
                    caltype.push({
                        type:sub.fieldName,
                        affixmutl:affixmutl
                    });    
                    
                });

                caltype.forEach((ms)=>{
                    if(ms.type!=='AttackDelta'&&ms.type!=='DefenceDelta'&&ms.type!=='HPDelta')
                        res+=ms.affixmutl;
                });
                

                //理想分數
                const IdealyScore: number = Number(
                    ((res / calPartWeights(charStandard, partsIndex)) * 100).toFixed(2)
                );

                result.push(IdealyScore);
                
            });
        });

        resolve(origin);
    })

    p1.then((score)=>{
        //設立分數標準
        let scoreStand=[
            {rank:'S+',stand:85,color:'rgb(239, 68, 68)',tag:'S+'},
            {rank:'S',stand:70,color:'rgb(239, 68, 68)',tag:'S'},
            {rank:'A',stand:50,color:'rgb(234, 179, 8)',tag:'A'},
            {rank:'B',stand:35,color:'rgb(234, 88 , 12)',tag:'B'},
            {rank:'C',stand:15,color:'rgb(163, 230, 53)',tag:'C'},
            {rank:'D',stand:0 ,color:'rgb(22,163,74)',tag:'D'}
        ];
        let overScoreList=(JSON.parse(JSON.stringify(result)) as number[]).filter((num)=>num-deviation>Number(origin));
        let expRate=((overScoreList.length)/(result.length)).toFixed(4);
        let copy=JSON.parse(JSON.stringify(result)) as number[];
        let relicrank:relicRank|undefined=undefined;
        let returnData=[] as PieNumsItem[];
        
        //console.log(result);
        //根據標準去分類
        scoreStand.forEach((stand,i)=>{
            //區分符合區間跟不符合的 並一步步拿掉前面篩選過的區間
            let match=copy.filter((num)=>num>=stand.stand) as number[];
            copy=copy.filter((num)=>num<stand.stand) as number[];

            returnData.push({
                label:stand.tag,
                value:Number(((match.length / result.length) * 100).toFixed(2)),
                color:stand.color,
                tag:stand.rank
            });


            //接著去找尋這個分數所屬的區間
            if(stand.stand<=origin&&relicrank===undefined)
                relicrank=stand;

        });

        /*
        //如果區間數量為0 則不予顯示
        returnData=returnData.filter((r)=>r.value>0);*/
        this.postMessage({
            expRate:(!expRate)?0:expRate,//期望值
            relicscore:score,//遺器分數
            relicrank:relicrank,//遺器區間
            returnData:returnData//區間機率        
        });
        
    });
};

function relicScore(partsIndex:number,charStandard:Record<string,number>,SubData:relicSubData[],MainData:number){
    let weight = 0
    var mutl=3*MainData;//直接默認強化至滿等
    let caltype=[] as calTypeItem[];

    //如果是手跟頭則不套用主詞條加分
    if(partsIndex!==1&&partsIndex!==2){
        weight+=mutl;
    }
    SubData.forEach(a => {
        //去除%數
        let affix=Number(a.data.toFixed(2));//實際數值
        let SubAffixType=AffixName.find((s)=>s.name===a.subaffix) as AffixItem;
        
        //計算有效詞條數
        let affixStandard=standard.find((t)=>t.type==='sub')!.data.find((d)=>d.name===SubAffixType.fieldName)!.data;
        let cal=Number(parseFloat((affix/affixStandard).toFixed(2)));
        
        //獲得有效詞條
        let affixmutl=charStandard[SubAffixType.type]*cal;

        caltype.push({
            type:SubAffixType.fieldName,
            affixmutl:affixmutl,
        })
       
    });
    
    //計算分數
    caltype.forEach((ms)=>{
        if(ms.type!=='AttackDelta'&&ms.type!=='DefenceDelta'&&ms.type!=='HPDelta')
            weight+=ms.affixmutl;
    });

    let relicscore:number = 0;

    //接下來根據部位調整分數
    //假設最大有效詞條數為10 實際只拿8個 代表你這件有80分以上的水準
    relicscore = Number(
        (weight / calPartWeights(charStandard, partsIndex)).toFixed(2)
    ) * 100;

    return Number(relicscore.toFixed(1));
    
}

//計算裝備權重
function calPartWeights(charstandard:Record<StatKey,number>,partIndex: number){
    let partWeight = 5; // 起始分數為5
    let mainkey: string | null = null;

    // 先將標準倒序 (由大到小)
    const entries:[string, number][] = Object.entries(charstandard).sort((a, b) => b[1] - a[1]);

    // 主詞條：抓最大*3，剩下依序遞補，最多四個
    // partIndex = 1(頭) 或 2(手) 會跳過
    if (partIndex !== 1 && partIndex !== 2) {
        for (const [key, value] of entries) {
            const stat = key as StatKey; // 確保 key 是合法 StatKey
            const unique = !weight[partIndex as 1|2|3|4|5|6].sub.includes(stat);

            if (weight[partIndex as 1|2|3|4|5|6].main.includes(stat) && !mainkey && unique && value !== 0) {
                mainkey = stat;
                partWeight += value * 3;
                break;
            }
        }
    }

    // 如果沒有找到符合的，就隨便抓一個 mainkey
    if (!mainkey) {
        for (const [key, value] of entries) {
            const stat = key as StatKey; // 確保 key 是合法 StatKey
            if (weight[partIndex as 1|2|3|4|5|6].main.includes(stat)) {
                mainkey = key;
                partWeight += value * 3;
                break;
            }
        }
    }
    

    // 計算副詞條最大權重，最多計入四個
    let calcount = 0;
    for (const [key, value] of entries) {
        const stat = key as StatKey; // 確保 key 是合法 StatKey
        if (stat !== mainkey && calcount < 4 && weight[partIndex as 1|2|3|4|5|6 ].sub.includes(stat)) {
            partWeight += value;
            calcount++;
        }
    }

    return partWeight;
}

//製作標準
function calStand(stand:standDetails){

    //設立一個模板 根據使用者填入參數更改
    let model:Record<string,number>={
        hp: 0,
        atk: 0,
        def: 0,
        spd: 0,
        crit_rate: 0,
        crit_dmg: 0,
        break_dmg: 0,
        heal_rate: 0,
        sp_rate: 0,
        effect_hit: 0,
        effect_res: 0,
        physical_dmg: 0,
        fire_dmg: 0,
        ice_dmg: 0,
        lightning_dmg: 0,
        wind_dmg: 0,
        quantum_dmg: 0,
        imaginary_dmg: 0
    };

    //根據有效詞條關鍵字
    stand.forEach((s)=>{
        let target=AffixName.find((a)=>a.name===s.name) as AffixItem;
        let targetType = target.type;
        model[targetType]=s.value;
    });

    console.log(stand);

    return model;
}

//計算將會移置後台worker運作

//所需資料
//2.遺器本身數據(SubData) 3.遺器部位

//回傳資料
//1.遺器本身分數 2.期望值  