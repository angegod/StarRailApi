import standard from '../data/standard';
import weight, { StatKey } from '../data/weight';
import AffixName from '../data/AffixName';
import {findCombinations,EnchanceAllCombinations} from '../data/combination';
import { relicSubData } from '@/interface/simulator';
import { AffixItem, relicRank, standDetails } from '@/interface/global';
import { calTypeItem, coeEfficentItem, enchantNewSubAffixItem } from '@/interface/worker';


//模擬計算在用的
onmessage = function (event) {
    //宣告變數
    let SubData=event.data.SubData as relicSubData[];
    let partsIndex=parseInt(event.data.partsIndex) as number;
    let MainAffix=AffixName.find((a)=>a.name===event.data.MainData) as AffixItem;
    //let deviation=(event.data.deviation!==undefined)?event.data.deviation:0;
    

    //計算可用強化次數
    let enchanceCount=0;
    let lockArr = [] as number[];//被排除的詞條
    SubData.forEach(sb=>{    
        enchanceCount=enchanceCount+Number(sb.count);
        if(sb.locked)
            lockArr.push(sb.index);
    });

    //計算可能的強化組合
    let combination=findCombinations(enchanceCount,SubData.length,lockArr);

    //根據強化組合的個數，隨機抽取一個(這個數值已經是索引值)
    let randomNum = Math.floor(Math.random() * combination.length);


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

    let MainData=charStandard[MainAffix.type];
    let result = 0;
    //先算原本的遺器的分數

    let p1=new Promise(async (resolve,reject)=>{
        
        let randomCombination=combination[randomNum];

        //獲得所有可能的強化幅度組合
        let subcombination=EnchanceAllCombinations(randomCombination);

        //獲取隨機一種強化幅度的組合
        let randomNum2 =Math.floor(Math.random() * subcombination.length);

        let ran_subcombination=subcombination[randomNum2] as number[][];

        let res=0;
        if(partsIndex!==1&&partsIndex!==2)
            res=3*MainData;
        
        
        let caltype=[] as calTypeItem[];//已經計算過的詞條種類

        let newSubaffix=[] as enchantNewSubAffixItem[];

        ran_subcombination.forEach((el,i) => {//對每個屬性詞條開始進行模擬計算
            let total=0;
            let sub=coeEfficent[i];
            
            let targetAffix = AffixName.find((st)=>st.fieldName===sub.fieldName) as AffixItem;
            let targetRange=targetAffix.range!;

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
            
            newSubaffix.push({
                index:newSubaffix.length,
                subaffix:SubData[i].subaffix,
                data:parseFloat(total.toFixed(1)),
                count:randomCombination[i]
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
        result=IdealyScore;

        resolve(newSubaffix);
    })

    p1.then((newSubaffix)=>{
        //設立分數標準
        let scoreStand=[
            {rank:'S+',stand:85,color:'rgb(239, 68, 68)',tag:'S+'},
            {rank:'S',stand:70,color:'rgb(239, 68, 68)',tag:'S'},
            {rank:'A',stand:50,color:'rgb(234, 179, 8)',tag:'A'},
            {rank:'B',stand:35,color:'rgb(234, 88 , 12)',tag:'B'},
            {rank:'C',stand:15,color:'rgb(163, 230, 53)',tag:'C'},
            {rank:'D',stand:0 ,color:'rgb(22,163,74)',tag:'D'}
        ];
        //標準排序顛倒
        scoreStand.reverse();
       
        let relicrank:relicRank|undefined = undefined;
        let match = true; 
        
        //console.log(result);
        //根據標準去分類
        scoreStand.forEach((stand,i)=>{

            //如果當前的分數超過目前的標準 則繼續往下找
            if(result<stand.stand&&match&&i!==0){
                match = false;
                relicrank =scoreStand[i-1];
            }

            //如果目前分數超過最終標準
            if(i===scoreStand.length-1&&match){
                match = false ;
                relicrank=scoreStand[i];
            }
           
            //接著去找尋這個分數所屬的區間
            if(stand.stand<=Number(origin)&&relicrank===undefined)
                relicrank=stand;

        });
        this.postMessage({
            relicscore:result.toFixed(1),//遺器分數
            relicrank:relicrank,//遺器區間
            returnData:newSubaffix //該次模擬強化後各項數據
        });
        
    });
};

//計算裝備權重
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

    return model;
}

//計算將會移置後台worker運作

//所需資料
//2.遺器本身數據(SubData) 3.遺器部位
