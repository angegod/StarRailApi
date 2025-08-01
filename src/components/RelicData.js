'use client';
import React, { useContext, useEffect, useState } from 'react';
import AffixName from '../data/AffixName';
import { Tooltip } from 'react-tooltip';
import { useRouter } from 'next/navigation';
import SiteContext from '../context/SiteContext';
import RelicDataHint from './Hint/RelicDataHint';
import { useSelector, useDispatch } from 'react-redux';
import { setEnchantData } from '@/model/enchantDataSlice';
import { jsx } from 'react/jsx-runtime';


//顯示儀器分數區間
const RelicData=React.memo(({mode,button})=>{
    const {relic,setRelic,Rrank,Rscore,standDetails,isChangeAble,partArr} = useContext(SiteContext);
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
            mode:mode
        }
        
        dispatch(setEnchantData(sendData));
        router.push('./enchant');
    }

    if(relic!==undefined){
        const mainaffixImglink=AffixName.find((a)=>a.name===relic.main_affix.name).icon;

        const mainaffixImg=<img src={`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/property/${mainaffixImglink}.png`} 
            width={24} height={24} />

        const list=[];
        const reliclink = `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/relic/${parseInt(relic.set_id)}.png`;
        
        relic.sub_affix.forEach((s,i)=>{

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
            let isBold=(standDetails.find((st)=>st.name===showAffix)!==undefined)?true:false;
            
            var IconName = AffixName.find((a)=>a.name===s.name).icon;
            
            var imglink=`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/property/${IconName}.png`;
            

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
                <div className='flex flex-row' key={`Subaffix_${s.name}_${i}`}>
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
                        <span className={`${(isBold)?'text-yellow-500 font-bold':'text-white'} text-left flex` }>{showAffix}</span>
                    </div>
                    <div className='flex w-[70px]'>
                        <span className='mr-1'>:</span>
                        <span className='text-right text-white '>{s.display}</span>
                    </div>
                </div>
                
            )
        });

        
        return(
            <div className={`w-[100%] my-1 ${(relic!==undefined)?'':'hidden'} max-[500px]:w-[330px] max-[400px]:w-[100%]`}>
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
                {(button)?
                    <div className='mt-3'>
                        <button className='processBtn' onClick={navEnchant} disabled={!isChangeAble}>重洗模擬</button>
                    </div>:<></>}
                <Tooltip id="RelicDataHint"  
                        place="right-start"
                        render={()=>
                            <RelicDataHint />
                        }/>
            </div>
        )
    }else{
        return(<></>)
    }
});

const RelicData_simulate=React.memo(({mode,button})=>{
    const {relic,Rrank,Rscore,standDetails,isChangeAble,partArr} = useContext(SiteContext);
    
    const router = useRouter();

    //儲存模擬數據
    const dispatch = useDispatch();
    //const enchantData = useSelector(state => state.enchant.enchantData);

    //導航至模擬強化頁面
    function navEnchant(){
        let sendData={
            relic:relic,
            Rrank:Rrank,
            Rscore:Rscore,
            standDetails:standDetails,
            mode:mode
        }

        //next專案必須這麼寫
        dispatch(setEnchantData(sendData));
        router.push('./enchant');
    }

    if(relic!==undefined){
        const mainaffixImglink=AffixName.find((a)=>a.name===relic.main_affix).icon;

        const mainaffixImg=<img src={`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/property/${mainaffixImglink}.png`} width={24} height={24}/>

        const list=[];

        relic.subaffix.forEach((s)=>{
            let isBold=(standDetails.find((st)=>st.name===s.subaffix)!==undefined)?true:false;
            
            let markcolor="";

            var IconName = AffixName.find((a)=>a.name===s.subaffix).icon;

            var imglink=`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/property/${IconName}.png`;
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
                <div className='flex flex-row' key={'Data'+s.subaffix}>
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
                        <span className={`${(isBold)?'text-yellow-500 font-bold':'text-white'} text-left flex` }>{s.subaffix}</span>
                    </div>
                    <span className='flex w-[80px]'>:<span className='ml-2 text-white '>{s.display}</span></span>
                </div>    
            )
        })
        
        return(
            <div className={`w-[100%] my-1 max-[500px]:min-w-[250px]`}>
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
                {(button)?<div className='mt-3'>
                    <button className='processBtn' onClick={()=>navEnchant()}  disabled={!isChangeAble}>重洗模擬</button>
                </div>:<></>}
                <Tooltip id="RelicDataHint"  
                        place="right-start"
                        render={()=>
                            <RelicDataHint />
                        }/>
            </div>
        )
    }else{
        return(<></>)
    }
})

export  {RelicData,RelicData_simulate};