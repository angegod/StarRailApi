'use client';
import React, { useContext, useEffect, useState } from 'react';
import AffixName from '../data/AffixName';
import { Tooltip } from 'react-tooltip';
import { useRouter } from 'next/navigation';
import SiteContext from '../context/SiteContext';
import RelicDataHint from './Hint/RelicDataHint';
import { useSelector, useDispatch } from 'react-redux';
import { setEnchantData } from '@/model/enchantDataSlice';
import { AffixItem, relicRank, standDetails, standDetailsItem } from '@/interface/global';
import { relicSubData, simulatorRelic } from '@/interface/simulator';
import { ImportRelic, ImportRelicAffix } from '@/interface/importer';


interface SimulatorRelicDataType{
    relic:simulatorRelic,
    affixLock:boolean,
    Rrank:relicRank,
    Rscore:string,
    standDetails:standDetails,
    isChangeAble:boolean,
    partArr:string[],
    mode:"Simulator",
    relicDataButton:boolean
}

interface ImportRelicDataType{
    relic:ImportRelic,
    affixLock:boolean,
    Rrank:relicRank,
    Rscore:string,
    standDetails:standDetails,
    isChangeAble:boolean,
    partArr:string[],
    mode:"Importer",
    relicDataButton:boolean
}

//顯示儀器分數區間
const RelicData=React.memo(()=>{
    const {relic,affixLock,Rrank,Rscore,standDetails,isChangeAble,partArr,mode,relicDataButton} = useContext<ImportRelicDataType>(SiteContext);
    const router = useRouter();
    //儲存模擬數據
    const dispatch = useDispatch();

    //導航至模擬強化頁面
    function navEnchant(){
        let sendData={
            relic:relic,
            Rrank:Rrank,
            Rscore:Rscore,
            standDetails:standDetails,
            affixLock:affixLock,
            mode:mode
        }

        dispatch(setEnchantData(sendData));
        router.push('./enchant');
    }

    if(relic!==undefined){
        let getRelic = JSON.parse(JSON.stringify(relic)) as ImportRelic;

        const mainAffix = AffixName.find((a)=>a.name===relic.main_affix.name) as AffixItem;
        const mainaffixImglink=mainAffix.icon;

        const mainaffixImg=<img src={`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/property/${mainaffixImglink}.png`} 
            width={24} height={24} />

        const list:React.ReactElement[]=[];
        const reliclink = `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/relic/${parseInt(relic.set_id)}.png`;
        
        let strikeThroughName = "";
        let minIndex = 0;
        let minValue = Infinity;

        //如果有啟用鎖定功能在判定
        if(affixLock){
            //先找出哪個詞條需要加上刪除線
            getRelic.sub_affix.forEach((s:ImportRelicAffix, i:number) => {
                //先改名
                let showAffix = '';
                if(s.name === "攻擊力" && s.display.includes('%')){
                    showAffix = "攻擊力%數";
                } else if(s.name === "防禦力" && s.display.includes('%')){
                    showAffix = "防禦力%數";
                } else if(s.name === "生命值" && s.display.includes('%')){
                    showAffix = "生命值%數";
                }else
                    showAffix = s.name ;
                
                //複寫回去
                //s.name = showAffix;

                const found = standDetails.find((st) => st.name === showAffix);
                const value = found ? found.value : 0; // 沒找到當 0

                if (value < minValue) {
                    minValue = value;
                    minIndex = i; 
                    strikeThroughName = showAffix;
                }
            });
        }
        
        //遍歷所有副詞條渲染
        getRelic.sub_affix.forEach((s:any,i:number)=>{
            let showAffix = '';
            if(s.name === "攻擊力" && s.display.includes('%')){
                showAffix = "攻擊力%數";
            } else if(s.name === "防禦力" && s.display.includes('%')){
                showAffix = "防禦力%數";
            } else if(s.name === "生命值" && s.display.includes('%')){
                showAffix = "生命值%數";
            }else
                showAffix = s.name ;
            
            
            let markcolor="";
            //判斷是否要標記為有效
            let isBold=(standDetails.find((st)=>st.name===showAffix)!==undefined)?true:false;

            let subAffix = AffixName.find((a)=>a.name===s.name) as AffixItem
            let IconName = subAffix.icon;
            
            let imglink=`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/property/${IconName}.png`;
            
            switch(s.count-1){
                case 0:
                    markcolor='rgb(122, 122, 122)';
                    break;
                case 1:
                    markcolor='rgb(67, 143, 67)';
                    break;
                case 2:
                    markcolor='rgb(23, 93, 232)';
                    break;
                case 3:
                    markcolor='rgb(67, 17, 184)';
                    break;
                case 4:
                    markcolor='rgb(219, 171, 15)';
                    break;
                case 5:
                    markcolor='#FF55FF';
                    break;
                default:
                    break;
            }

            list.push(
                <div className={`flex flex-row ${(strikeThroughName===showAffix)?'strikeLine':''}`} key={`Subaffix_${s.name}_${i}`}>
                    <div className='flex justify-center items-center'>
                        <span className='mr-0.5 text-white w-[20px] h-[20px] rounded-[20px]
                            flex justify-center items-center' style={{backgroundColor:markcolor}}>
                            {s.count-1}
                        </span>
                    </div>
                    <div className='w-[150px] flex flex-row'>
                        <div className='flex justify-center items-center'>
                            <img src={imglink} alt='555' width={24} height={24}/>
                        </div>
                        <span
                            className={`${
                                strikeThroughName === showAffix
                                ? 'text-stone-400'
                                : isBold
                                ? 'text-yellow-500 font-bold'
                                : 'text-white'
                            } text-left flex`}>
                            {showAffix}
                        </span>
                    </div>
                    <div className='flex w-[70px]'>
                        <span className='mr-1'>:</span>
                        <span className={`text-right ${(showAffix === strikeThroughName)?' text-stone-400':'text-white'} `}>{s.display}</span>
                    </div>
                </div>
                
            )
        });

        
        return(
            <div className={`w-full my-1 ${(relic!==undefined)?'':'hidden'} max-[500px]:w-[330px] max-[400px]:w-full`}>
                <div className='flex flex-row items-center'>
                    <span className='text-red-600 text-lg font-bold'>遺器資訊</span>
                    <div className='hintIcon ml-2 overflow-visible' data-tooltip-id="RelicDataHint">
                        <span className='text-white'>?</span>
                    </div>
                </div>
                <div>
                    <span className='text-stone-400'>套裝</span><br/>
                    <div className='flex flex-row'>
                        <img src={reliclink} width={24} height={24} alt={relic.set_id}/>
                        <span className='text-white'>{relic.set_name}</span>
                    </div>
                </div>
                <div className='mt-1 flex flex-col'>
                    <span className='text-stone-400'>部位</span>
                    <div className='flex flex-row'>
                        <span className='text-white'>{partArr[relic.type-1]}</span>   
                    </div>
                </div>
                <div className='mt-1'>
                    <span className='text-stone-400'>主詞條</span><br/>
                    <div className='flex flex-row'>
                        <div className='flex flex-row max-w-[140px]'>
                            {mainaffixImg}
                            <span className='text-white whitespace-nowrap overflow-hidden text-ellipsis'>{relic.main_affix.name}</span>
                        </div>
                        <span className='text-stone-400'>:{relic.main_affix.display}</span>
                    </div>
                       
                </div>
                <div className='mt-2'>
                    <span className='text-stone-400'>副詞條</span>
                    <div className='flex flex-col w-[190px]'>
                        {list}
                    </div>
                </div>
                {(relicDataButton)?
                    <div className='mt-3'>
                        <button className='processBtn' onClick={()=>navEnchant()} disabled={!isChangeAble}>重洗模擬</button>
                    </div>:null}
                <Tooltip id="RelicDataHint"  
                        place="right-start"
                        render={()=>
                            <RelicDataHint />
                        }/>
            </div>
        )
    }else{
        return null
    }
});

const RelicData_simulate=React.memo(()=>{
    const {relic,affixLock,Rrank,Rscore,standDetails,isChangeAble,partArr,mode,relicDataButton} = useContext<SimulatorRelicDataType>(SiteContext);
    
    const router = useRouter();

    //儲存模擬數據
    const dispatch = useDispatch();

    //導航至模擬強化頁面
    function navEnchant(){
        let sendData={
            relic:relic,
            Rrank:Rrank,
            Rscore:Rscore,
            standDetails:standDetails,
            mode:mode,
            affixLock:affixLock
        }

        //next專案必須這麼寫
        dispatch(setEnchantData(sendData));
        router.push('./enchant');
    }

    if(relic!==undefined){
        const mainAffix = AffixName.find((a)=>a.name===relic.main_affix) as AffixItem;
        const mainaffixImglink=mainAffix.icon;
        const mainaffixImg=<img src={`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/property/${mainaffixImglink}.png`} width={24} height={24}/>
        const list:React.ReactElement[]=[];

        let strikeThroughName = "";
        let minIndex = 0;
        let minValue = Infinity;

        //如果有啟用鎖定功能在判定
        if(affixLock){
            //先找出哪個詞條需要加上刪除線
            relic.subaffix.forEach((s:relicSubData, i:number) => {
                
                const found = standDetails.find((st) => st.name === s.subaffix);
                const value = found ? found.value : 0; // 沒找到當 0

                if (value < minValue) {
                    minValue = value;
                    minIndex = i; 
                    strikeThroughName = s.subaffix;
                }
            });
        }


        relic.subaffix.forEach((s:relicSubData)=>{
            let isBold=(standDetails.find((st:standDetailsItem)=>st.name===s.subaffix)!==undefined)?true:false;
            
            let markcolor="";

            let subaffix = AffixName.find((a)=>a.name===s.subaffix) as AffixItem
            let IconName = subaffix.icon;

            let imglink=`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/property/${IconName}.png`;
            switch(s.count){
                case 0:
                    markcolor='rgb(122, 122, 122)';
                    break;
                case 1:
                    markcolor='rgb(67, 143, 67)';
                    break;
                case 2:
                    markcolor='rgb(23, 93, 232)';
                    break;
                case 3:
                    markcolor='rgb(67, 17, 184)';
                    break;
                case 4:
                    markcolor='rgb(219, 171, 15)';
                    break;
                case 5:
                    markcolor='#FF55FF';
                    break;
                default:
                    break;
            }
            list.push(
                <div className={`flex flex-row ${(strikeThroughName===s.subaffix)?'strikeLine':''}`} key={`Subaffix_${s.subaffix}`}>
                    <div className='flex justify-center items-center'>
                        <span className='mr-0.5 text-white w-[20px] h-[20px] rounded-[20px]
                            flex justify-center items-center' style={{backgroundColor:markcolor}}>
                            {s.count}
                        </span>
                    </div>
                    <div className='w-[160px] flex flex-row'>
                        <div className='flex justify-center items-center'>
                            <img src={imglink} alt='555' width={24} height={24}/>
                        </div>
                        <span className={`${
                                strikeThroughName === s.subaffix
                                ? 'text-stone-400'
                                : isBold
                                ? 'text-yellow-500 font-bold'
                                : 'text-white'
                            }`}>{s.subaffix}</span>
                    </div>
                    <span className='flex w-[80px]'>:<span className='ml-2 text-white '>{s.display}</span></span>
                </div>    
            )
        })
        
        return(
            <div className={`w-full my-1 max-[500px]:min-w-[250px]`}>
                <div className='flex flex-row items-center'>
                    <span className='text-red-600 text-lg font-bold'>遺器資訊</span>
                    <div className='hintIcon ml-2 overflow-visible'
                        data-tooltip-id="RelicDataHint">
                        <span className='text-white'>?</span>
                    </div>
                </div>
                <div className='mt-1 flex flex-col'>
                    <span>部位</span>
                    <div className='flex flex-row'>
                        <span className='text-white'>{partArr[relic.type-1]}</span>   
                    </div>
                </div>
                <div className='mt-1 flex flex-col'>
                    <span>主詞條</span>
                    <div className='flex flex-row'>
                        {mainaffixImg}
                        <span className='text-white'>{relic.main_affix}</span>   
                    </div>
                </div>
                <div className='mt-2'>
                    <span>副詞條</span>
                    <div className='flex flex-col w-[200px]'>
                        {list}
                    </div>
                </div>
                {
                    (relicDataButton)?
                        <div className='mt-3'>
                            <button className='processBtn' onClick={()=>navEnchant()}  disabled={!isChangeAble}>重洗模擬</button>
                        </div>:null
                }
                <Tooltip id="RelicDataHint"  
                        place="right-start"
                        render={()=><RelicDataHint />}/>
            </div>
        )
    }else{
        return null
    }
})

export  {RelicData,RelicData_simulate};