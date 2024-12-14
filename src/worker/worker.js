import score from '../data/score';
import standard from '../data/standard';
import weight from '../data/weight';
import Stats from '../data/Stats';
import AffixName from '../data/AffixName';
import AffixList from '../data/AffixList';
import {findCombinations,EnchanceAllCombinations} from '../data/combination';


onmessage = function (event) {
    //宣告變數
    let SubData=event.data.SubData;
    let partsIndex=parseInt(event.data.partsIndex);
    let charID=event.data.charID;
    let MainAffix=AffixName.find((a)=>a.name==event.data.MainData);
    console.log(partsIndex);

    //計算可用強化次數
    var enchanceCount=0;
    SubData.forEach(sb=>{    
        enchanceCount=enchanceCount+Number(sb.count);
    });

    //計算可能的強化組合
    let combination=findCombinations(enchanceCount+4,4);
    
    var charStandard=score.find((item)=>parseInt(Object.keys(item)[0])===parseInt(charID))[charID];
    let coeEfficent=[];//當前遺器係數arr
    SubData.forEach((sub)=>{
        let SubAffixType=AffixName.find((s)=>s.name===sub.subaffix);
        //console.log(SubAffixType);
        coeEfficent.push({
            type:SubAffixType.type,
            fieldName:SubAffixType.fieldName,
            num:Number(charStandard[SubAffixType.type])
        });
    });
    let MainData=charStandard[MainAffix.type];
    let result =[];
    let origin = relicScore(partsIndex,charID,SubData,MainData);
    //先算原本的遺器的分數

    let p1=new Promise(async (resolve,reject)=>{
        combination.forEach((c,i)=>{
            //計算各種強化程度的組合
            let subcombination=EnchanceAllCombinations(c);
            

            subcombination.forEach((s)=>{
                let res=0;
                if(partsIndex!==1&&partsIndex!==2)
                    res=3*MainData;
                
                let total=0;
                let caltype=[];//已經計算過的詞條種類

                s.forEach((el,i) => {//對每個屬性詞條開始進行模擬計算
                    total=0;//詞條模擬出來的總和

                    let sub=coeEfficent[i];
                    let targetRange=AffixName.find((st)=>st.fieldName===sub.fieldName).range;
                    el.forEach((num)=>total+=targetRange[num]);

                    //計算有效詞條數
                    let affixStandard=standard.find((t)=>t.type==='sub').data.find((d)=>d.name===sub.fieldName).data;
                    let cal=parseFloat(total/affixStandard).toFixed(2);

                    //獲得加權有效詞條數 並加上去
                    let affixmutl=parseFloat(charStandard[sub.type]*cal);
                    
                    let smallAffix=caltype.find((ct)=>ct.type===sub.type);//碰到同一種類的詞條需要擇優處理
                    
                    //如果沒有計算過此種類詞條
                    if(smallAffix===undefined){
                        caltype.push({
                            type:sub.type,
                            affixmutl:affixmutl
                        });
                    }else if(smallAffix.affixmutl<affixmutl){//如果目前計算詞條數大於現有詞條數 則覆蓋處理
                        caltype.find((ct)=>ct.type===sub.type).affixmutl=affixmutl;
                    }   
                });

                caltype.forEach((ms)=>{
                    res+=ms.affixmutl;
                });
            
                //理想分數
                let IdealyScore=Number((parseFloat(55/calPartWeights(charStandard,partsIndex))*res).toFixed(1));
                result.push(IdealyScore);
                
            });
        });

        resolve(origin);
    })

    p1.then((score)=>{
        let scoreStand=[
            {rank:'SSS',stand:43,color:'rgb(185, 28, 28)'},
            {rank:'SS',stand:38,color:'rgb(220, 38, 38 )'},
            {rank:'S',stand:33,color:'rgb(239, 68, 68)'},
            {rank:'A',stand:29,color:'rgb(234, 179, 8)'},
            {rank:'B',stand:23,color:'rgb(234, 88, 12)'},
            {rank:'C',stand:18,color:'rgb(163, 230, 53)'}
        ];
        let overScoreList=result.filter((num)=>num>=Number(origin));
        let expRate=parseFloat((overScoreList.length)/(result.length)).toFixed(2);
        let copy=[...result];
        let relicrank=undefined;
        let returnData=[]
        
        //根據標準去分類
        scoreStand.forEach((stand,i)=>{
            //區分符合區間跟不符合的 並一步步拿掉前面篩選過的區間
            
            let match=copy.filter((num)=>num>=stand.stand);
            copy=copy.filter((num)=>num<stand.stand);

            returnData.push({
                label:stand.rank,
                value:Number((parseFloat(match.length/result.length)*100).toFixed(2)),
                color:stand.color
            });

            //接著去找尋這個分數所屬的區間
            if(stand.stand<=origin&&relicrank==undefined)
                relicrank=stand;

        });
        /*
        //如果區間數量為0 則不予顯示
        returnData=returnData.filter((r)=>r.value>0);*/

        this.postMessage({
            expRate:expRate,//期望值
            relicscore:score,//遺器分數
            relicrank:relicrank,
            returnData:returnData//區間機率        
        })
        
    });
};

function relicScore(partsIndex,charID,SubData,MainData){
    let weight = 0
    var charStandard=score.find((item)=>parseInt(Object.keys(item)[0])===parseInt(charID))[charID];
    var mutl=3*MainData;//直接默認強化至滿等
    let caltype=[];

    //如果是手跟頭則不套用主詞條加分
    if(partsIndex!==1&&partsIndex!==2){
        weight+=mutl;
    }
    SubData.forEach(a => {
        //去除%數
        var affix=parseFloat(a.data).toFixed(2);//實際數值
        let SubAffixType=AffixName.find((s)=>s.name===a.subaffix);
        
        //計算有效詞條數
        var affixStandard=standard.find((t)=>t.type==='sub').data.find((d)=>d.name===SubAffixType.fieldName).data;
        var cal=parseFloat(affix/affixStandard).toFixed(2);
        
        //獲得有效詞條
        let affixmutl=parseFloat(charStandard[SubAffixType.type]*cal);
        let smallAffix=caltype.find((ct)=>ct.type===SubAffixType.type);


        if(smallAffix===undefined){
            caltype.push({
                type:SubAffixType.type,
                affixmutl:affixmutl,
            })
        }else if(smallAffix.affixmutl<affixmutl){
            smallAffix.affixmutl=affixmutl;
        }
    });
    console.log(caltype);
    console.log(calPartWeights(charStandard,partsIndex));
    //計算分數
    caltype.forEach((ms)=>{
        weight+=ms.affixmutl;
    });

    let relicscore=0;

    //接下來根據部位調整分數
    relicscore=parseFloat(55/calPartWeights(charStandard,partsIndex))*weight;
    return parseFloat(relicscore).toFixed(1);
    
}

//計算裝備權重
function calPartWeights(charstandard,partIndex){
    let partWeight = 5;//起始分數為5
    let mainkey='';
   
    //先將標準倒序
    charstandard=Object.entries(charstandard)
    .sort((a, b) => b[1] - a[1]);

    //主詞條 抓最大*3 剩下依序遞補 最多四個
    //頭跟手會跳過
    if(partIndex!==1&&partIndex!==2){

        charstandard.forEach(([key,value])=>{
            let unique=!weight[partIndex].sub.includes(key);
            //要優先計算只出現在主詞條的
            if(weight[partIndex].main.includes(key)&&mainkey===''&&unique&&value!==0){
                mainkey=key;
                partWeight=partWeight+value*3;
            }
        });

        if(mainkey===''){
            charstandard.forEach(([key,value])=>{
                if(weight[partIndex].main.includes(key)&&mainkey===''){
                    mainkey=key;
                    partWeight=partWeight+value*3;
                }
            });
        }
    }
    
    //計算副詞條最大權重 最多計入四個
    let calcount=0
    charstandard.forEach(([key,value])=>{
        if(key!==mainkey && calcount<4 && weight[partIndex].sub.includes(key)){
            partWeight=partWeight+value;
            calcount+=1;
        }
    });
    return partWeight;

}

//計算將會移置後台worker運作

//所需資料
//2.遺器本身數據(SubData) 3.遺器部位

//回傳資料
//1.遺器本身分數 2.期望值  