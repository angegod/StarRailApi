import React, { useRef } from 'react';
import { useState} from 'react';
import {Button} from 'react-bootstrap';

import score from './data/score';
import standard from './data/standard';
import weight from './data/weight';

import 'bootstrap/dist/css/bootstrap.min.css';
import './css/main.css';
import loading from '../src/gif/loading.gif';

import RankS from '../src/images/RankS.jpg';
import RankA from '../src/images/RankA.jpg';
import RankB from '../src/images/RankB.jpg';
import RankC from '../src/images/RankC.jpg';
import RankD from '../src/images/RankD.jpg';

function App() {
    const [mainCharacters,setMainCharacters]=useState(undefined);//所有腳色資訊
    //const [characters,setCharacters]=useState([]);//只會有一個腳色
    const [userName,setUserName]=useState("");
    const userID=useRef('');
    const [resultLabel,setResultLabel]=useState('No data Found!');
    const [Index,setIndex]=useState(0);//檢視腳色索引 預設為0 
    const [vaildSubaffix,setVaildSubaffix]=useState(['CriticalChanceBase','CriticalDamageBase']);//有效詞條預設為雙爆
    const [checked,setChecked]=useState([0,0,0,0,0,0,1,1,0,0,0,0]);


    
    async function getRecord(){
        setIndex(0);
        setResultLabel('Data searching...');
        setVaildSubaffix(['CriticalChanceBase','CriticalDamageBase']);
        setChecked([0,0,0,0,0,0,1,1,0,0,0,0]);
        //顯示loading gif
        document.getElementById('loading').classList.remove('hidden');
        console.log('remove');

        //載入評分標準
        console.log(score);
        
        let apiLink=(window.location.origin==='http://localhost:3000')?`http://localhost:5000/get/${userID.current}`:`https://expressapi-o9du.onrender.com/get/${userID.current}`;

        await fetch(apiLink,
           )
            .then((response) => response.json())
            .then((responseJson) => {
                console.log(responseJson);

                setMainCharacters(responseJson.characters);
                setUserName(responseJson.player.nickname);
                document.getElementById('loading').classList.add('hidden');

            })
            .catch((error) => {
            console.error(error);
            document.getElementById('loading').classList.add('hidden');
            setResultLabel('Server is not work!');
        });
    }

    //顯示腳色的列表
    function Charmenu(){

        if(mainCharacters!==undefined){
            var BaseLink="https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/";
            const list=mainCharacters.map((c,i)=><>
                <div className='charIcon' onClick={(e)=>setIndex(i)} key={'char'+i}>
                    <img src={BaseLink+c.icon} alt={c.name}/>
                </div>
            </>)
            
            return(<>
                <div className='userName'>
                    <span style={{color:'white',fontSize:'25px'}} key={'username'}>{userName}的角色面板</span>
                </div>
                <div className='charmenu scrollable-container'>
                    {list}
                </div>
            </>)
        }     
    }

    function checkHandler(e,i){
        let status=e.target.checked;
        let array=vaildSubaffix;
        let array2=checked;
        if(status&&!array.includes(e.target.value)){//加入vaild清單之中
            array.push(e.target.value);
            array2[i]=1;      
        }else if(!status&&array.includes(e.target.value)){     
            array=array.filter((item)=>item!==e.target.value);
            array2[i]=0;
        }
        
        console.log(array);
        setVaildSubaffix([...array]);
        
    }

    //勾選有效詞條
    function VaildSubaffixSections(){
        const array=[['生命力','HPDelta'],['生命力%數','HPAddedRatio'],['攻擊力','AttackDelta'],['攻擊力%數','AttackAddedRatio'],
                    ['防禦力','DefenceDelta'],['防禦力%數','DefenceAddedRatio'],['暴擊率','CriticalChanceBase'],['暴擊傷害','CriticalDamageBase'],
                    ['擊破特攻','BreakDamageAddedRatioBase'],['速度','SpeedDelta'],
                    ['效果命中','StatusProbabilityBase'],['效果抗性','StatusResistanceBase']
                ];

        const list=array.map((subaffix,i)=><>
            <div className='cktbox mr-8'>
                <input type='checkbox' value={subaffix[1]} onChange={(e)=>checkHandler(e,i)} key={'check'+i} checked={checked[i]}/><span>{subaffix[0]}</span>
            </div>
        </>)

        if(mainCharacters!==undefined){
            return(<>
                <div className='checkboxTotal mb-4'>
                    <span style={{color:'white',fontSize:'25px'}}>自訂有效詞條</span>
                    <div className='max-h-36 flex flex-col flex-wrap w-64'>
                        {list}
                    </div>
                </div>
            </>)
        }else{
            return(<></>)
        }

        
    }
     
    function returnAttr(char,fieldName){
        if(char.additions.find((item)=>item.field===fieldName)!==undefined)
            return parseInt(char.additions.find((item)=>item.field===fieldName).display)+parseInt(char.attributes.find((item)=>item.field===fieldName).display)
        else
            return parseInt(char.attributes.find((item)=>item.field===fieldName).display)
    }
    
    function returnFloatAttr(char,fieldName){

        if(char.additions===undefined)
            return;
        if(char.attributes===undefined)
            return;

        let targetAtt=char.attributes.find((item)=>item.field===fieldName);
        let targetAdd=char.additions.find((item)=>item.field===fieldName);
        
        if(targetAdd!==undefined&&targetAtt!==undefined)
            return parseFloat(targetAdd.display)+parseFloat(targetAtt.display);
        else if(targetAtt!==undefined)
            return parseFloat(targetAtt.display);
        else if(targetAdd!==undefined)
            return parseFloat(targetAdd.display);
        else
            return 0;
    }

    function returnFloatSubaffix(relic,typeName){
        if(relic.sub_affix.find((item)=>item.type===typeName)!==undefined)
            return parseFloat(relic.sub_affix.find((item)=>item.type===typeName).display);
        else 
            return 0
    }

    function StatsIcon({char,fieldName}){
        var BaseLink="https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/";
        var Imglink=`icon/property/${fieldName}.png`;
       
        
        return(<><img src={BaseLink+Imglink} alt={fieldName} width={30} height={30} className='Statsicon'/></>)
    }

    //計算分數
    function calScore(relic,char){
       
        //console.log(char.name);
        //先抓腳色標準 在開始計算
        if(char.id!==undefined) {
            let weight = 0

            var charStandard=score.find((item)=>parseInt(Object.keys(item)[0])===parseInt(char.id))[char.id];
            var mainAffixStandard=standard.find((td)=>td.type==='main').data.find((td)=>td.name===relic.main_affix.type).data;
            var mainAffix=parseInt(relic.main_affix.display.split('%')[0]);
            var mainCal=parseFloat(mainAffix/mainAffixStandard).toFixed(2);
            
            var mutl=charStandard[relic.main_affix.field]*mainCal*3;

            //如果是手跟頭則不套用主詞條加分
            if(relic.type!==1&&relic.type!==2){
                weight+=mutl;
                //console.log('MainAffix:'+relic.main_affix.field+' weight:'+mutl);
            }
                
            
            //主詞條計算
            
            relic.sub_affix.forEach(a => {
                //去除%數
                var affix=parseFloat(a.display.split('%')[0]).toFixed(2);//實際數值

                //計算有效詞條數
                var affixStandard=standard.find((t)=>t.type==='sub').data.find((d)=>d.name===a.type).data;
               
                var cal=parseFloat(affix/affixStandard).toFixed(2);
                
                //獲得有效詞條
                var affixmutl=parseFloat(charStandard[a.field]*cal);
                weight+=affixmutl;
                //console.log('SubAffix:'+a.type+" weight:"+affixmutl)
                
            });
            let relicscore=0
            
            //接下來根據部位調整分數
            relicscore=parseFloat(55/calPartWeights(charStandard,relic.type))*weight;
            //console.log('TotalWeight:'+weight);
            //console.log('relicScore:'+relicscore);
            return parseFloat(relicscore).toFixed(1);
        }
        return 0;
        
    }

    function calRelicMaxScore(relic){
        let count=0;
        relic.sub_affix.forEach((s)=>{
            count+=(s.count-1);
        });
        console.log(11*count);
        return 11*count;
    }

    function calRank(score){
        if(score<=10) return 'D';
        else if(score > 10 && score <= 15) return 'C';
        else if(score > 15 && score <=25) return 'B';
        else if(score > 25 && score <=33) return 'A';
        else if(score >33) return 'S';
    }

    function ReturnRankImg(Rank){
        if(Rank==='S') return RankS;
        if(Rank==='A') return RankA;
        if(Rank==='B') return RankB;
        if(Rank==='C') return RankC;
        if(Rank==='D') return RankD;

    }

    //計算裝備權重
    function calPartWeights(charstandard,partIndex){
        let partWeight = 5;//起始分數為5
        let mainkey='';
       
        //先將標準倒序
        charstandard=Object.entries(charstandard)
        .sort((a, b) => b[1] - a[1]);
        //console.log(charstandard);
        

        //主詞條 抓最大*3 剩下依序遞補 最多四個

        //頭跟手會跳過
        if(partIndex!==1&&partIndex!==2){
            charstandard.forEach(([key,value])=>{
                if(weight[partIndex].main.includes(key)&&mainkey==''){
                    mainkey=key;
                    partWeight=partWeight+value*3;
                }
            });
        }
        
        //計算副詞條最大權重 最多計入四個
        let calcount=0
        charstandard.forEach(([key,value])=>{
            if(key!==mainkey && calcount<4 && weight[partIndex].sub.includes(key)){
                partWeight=partWeight+value;
                calcount+=1;
            }
        });
        //console.log("PartIndex:"+partIndex+" Weight:"+partWeight)
        return partWeight;

    }

function ShowCharacterList(){/*腳色列表 */
    
    if(mainCharacters!==undefined){
        
        var BaseLink="https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/";

        const c=mainCharacters[Index];
        
        
        
        let lightcone=<></>;
        if(c!==undefined){
            if(c.light_cone!==null){
                lightcone=<>
                <div className='lightcone'>
                    <div>
                        <img src={`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/image/light_cone_preview/${c.light_cone.id}.png`} className='portrait' alt='not found'/>
                    </div> 
                    <span className={`name ${c.light_cone.rarity===5?'legendary':''} ${c.light_cone.rarity===4?'epic':''}  ${c.light_cone.rarity===3?'rare':''}`} >{c.light_cone.name}(精{c.light_cone.rank})</span>
                    <span className='level '>{c.light_cone.level}等</span>
                </div></>;
            }
        }
        
        return(<>
             
            <div className='charTotal' style={{boxShadow:`0px 0px 50px 10px ${c.element.color}`}}><div className='char'>
                <div className='charBox' >
                    <img src={BaseLink+c.portrait} alt='5555' className='portrait'/>
                    <span className='char_names' style={{color:`${c.element.color}`,fontWeight:'bold'}}>{c.name+`(${c.rank}魂)`}
                    <img  className='elementImg' src={BaseLink+c.element.icon} alt={c.element.name}/></span>
                    <span className='char_level'>{c.level}等</span>
                    <span className='char_rank'></span>
                
                </div>
                <div className='skill'>
                    <div className='mainskill'>
                        <img src={BaseLink+c.skills[0].icon} alt='555' />
                    <div className='skill_level_border'>
                        <span className='skill_level'>{c.skills[0].level}</span>
                    </div>
                </div>
                <div className='mainskill'>
                    <img src={BaseLink+c.skills[1].icon} alt='555' />
                    <div className='skill_level_border'>
                        <span className='skill_level'>{c.skills[1].level}</span>
                    </div>
                </div>
                <div className='mainskill'>
                    <img src={BaseLink+c.skills[2].icon} alt='555' />
                    <div className='skill_level_border'>
                        <span className='skill_level'>{c.skills[2].level}</span>
                    </div>
                </div>
            </div>
            
            <div className='charStats flex-col flex'>
                <span><StatsIcon char={c} fieldName='IconMaxHP'/>生命力:{returnAttr(c,'hp')}</span>
                <span><StatsIcon char={c} fieldName='IconAttack'/>攻擊力:{returnAttr(c,'atk')}</span>
                <span><StatsIcon char={c} fieldName='IconDefence'/>防禦力:{returnAttr(c,'def')}</span>
                <span><StatsIcon char={c} fieldName='IconCriticalChance'/>暴擊率:{returnFloatAttr(c,'crit_rate')}%</span>
                <span><StatsIcon char={c} fieldName='IconCriticalDamage'/>暴擊傷害:{returnFloatAttr(c,'crit_dmg')}%</span>
                <span><StatsIcon char={c} fieldName='IconSpeed'/>速度:{returnAttr(c,'spd')}</span>
                <span><StatsIcon char={c} fieldName='IconBreakUp'/>擊破特攻:{returnFloatAttr(c,'break_dmg')}%</span>
            </div>
            {lightcone}
            <div className='relics max-[650px]:flex-col'>
                {c.relics.map((item,i)=><>
                    <div key={'relics'+i} className='relic_stat max-[650px]:w-[100%] max-[650px]:flex-row max-[400px]:justify-center max-[400px]:flex-col max-[400px]:max-h-[700px]'>
                        <div className='relic w-1/2 max-[400px]:w-[100%]'>
                            <div className='relic_name'>
                                <span>{item.name}</span>
                            </div>
                            <div className={`relic_images ${item.rarity===5?'legendary':''}${item.rarity===4?'epic':''}${item.rarity===3?'rare':''}${item.rarity===2?'ordinary':''}`}>
                                <img src={BaseLink+item.icon} alt='not found'/>
                                <div className='relic_level'>
                                    <span>+{item.level}</span>
                                </div>
                            </div>
                            <div className='subaffix '>
                                <span className='main'>{item.main_affix.name+":"+item.main_affix.display}</span>
                                {item.sub_affix.map((items,j)=>{
                                    var enchanceCount=items.count-1;
                                    let color='';
                                    //根據強化次數做出對應顏色
                                    if(enchanceCount===5)
                                        color='text-orange-800';
                                    else if(enchanceCount===4)
                                        color='text-yellow-500';
                                    else if(enchanceCount===3)
                                        color='text-purple-500';
                                    else if(enchanceCount===2)
                                        color='text-blue-500';
                                    else if(enchanceCount===1)
                                        color='text-green-500';
                                    else if(enchanceCount===0)
                                        color='text-white';

                                    return(<>
                                        <span className={`${(vaildSubaffix.includes(items.type))?`${color} font-bold `:''}flex justify-center items-center`}>
                                            {items.name+":"+items.display}
                                            <label className={`text-white bg-gray-600 rounded-lg w-[20px] h-[20px] leading-[20px] ${(vaildSubaffix.includes(items.type))?'':'hidden'}`}>
                                                {enchanceCount}
                                            </label>
                                        </span>
                                        
                                    </>)
                                })} 
                            </div>                        
                        </div>
                        
                                
                        <div className='relic_score mt-2.5 mb-2.5 flex flex-col w-1/2 max-[400px]:w-[100%]' >
                            <span style={{color:`${c.element.color}`}}>Score:{calScore(item,c)}</span>
                            <span>Rank:{calRank(calScore(item,c))}</span>
                            <div className='flex justify-center'>
                                <img src={ReturnRankImg(calRank(calScore(item,c)))} width={100} height={100} alt='5555'/>
                            </div>
                        </div>
                        
                    </div>
                   
                </>)}
            </div>
        </div></div>
      </>)

    }else{
        return(<>
            <div className='alert'>
                <span>{resultLabel}</span>
            </div>
        </>)
    }
      

      
  }

  return (<>
        <div className='app'>
            <div className='input flex flex-row'>
                <input type='text' name='userId' placeholder='HSR player UID' onChange={(e)=>userID.current=e.target.value} className='h-8 rounded text-center'/>
                <button onClick={getRecord} className='bg-blue-500 w-20 h-8 rounded text-white ml-5'>查詢</button>
                <img src={loading} width={50} height={50} alt='5555' className='ml-10 h-8 hidden'  id='loading'/>
            </div>
            <hr/>

            <Charmenu/>
            <VaildSubaffixSections />
            <ShowCharacterList />
        </div>
       
  </>);
}

export default App;
