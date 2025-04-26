import React, { Component, useContext } from 'react';
import AffixName from '../data/AffixName';
import { useNavigate } from 'react-router-dom';

//顯示儀器分數區間
const RelicData=React.memo(({context,mode,button})=>{
    const {relic,Rrank,Rscore,standDetails,isChangeAble} = useContext(context)
    const partArr=['Head 頭部','Hand 手部','Body 軀幹','Feet 腳部','Rope 連結繩','Ball 位面球'];
    const navigate = useNavigate();
    //導航至模擬強化頁面
    function navEnchant(){
        let sendData={
            relic:relic,
            Rrank:Rrank,
            Rscore:Rscore,
            standDetails:standDetails,
            mode:mode
        }
        console.log(sendData);
        navigate('../enchant',{state:sendData});
    }

    if(relic!==undefined){
        const mainaffixImglink=AffixName.find((a)=>a.name===relic.main_affix.name).icon;

        const mainaffixImg=<img src={`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/property/${mainaffixImglink}.png`} 
            width={24} height={24} />

        const list=[];
        const reliclink = `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/relic/${parseInt(relic.set_id)}.png`;

        relic.sub_affix.forEach((s)=>{
            let markcolor="";
            let isBold=(standDetails.find((st)=>st.name===s.name)!==undefined)?true:false;
            
            if(s.name==="攻擊力"&&s.display.includes('%')){
                s.name="攻擊力%數";
            }
            else if(s.name==="防禦力"&&s.display.includes('%')){
                s.name="防禦力%數";
            }else if(s.name==="生命值"&&s.display.includes('%')){
                s.name="生命值%數";
            }


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
                <div className='flex flex-row' key={'Subaffix_'+s.name}>
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
                        <span className={`${(isBold)?'text-yellow-500 font-bold':'text-white'} text-left flex` }>{s.name}</span>
                    </div>
                    <span className='flex w-[70px]'>:<span className='ml-2 text-white '>{s.display}</span></span>
                </div>
                
            )
        })
        
        
        return(
            <div className={`w-[100%] mb-5 my-1 ${(relic!==undefined)?'':'hidden'} max-[500px]:w-[330px] max-[400px]:w-[100%]`}>
                <div>
                    <span className='text-red-600 text-lg font-bold'>遺器資訊</span>
                </div>
                <div>
                    <span>套裝:</span><br/>
                    <div className='flex flex-row'>
                        <img src={reliclink} width={24} height={24} alt={relic.set_id}/>
                        <span className='text-white'>{relic.set_name}</span>
                    </div>
                </div>
                <div className='mt-1 flex flex-col'>
                    <span>部位</span>
                    <div className='flex flex-row'>
                        <span className='text-white'>{(relic.type===5)?partArr[5]:(relic.type===6)?partArr[4]:partArr[relic.type-1]}</span>   
                    </div>
                </div>
                <div className='mt-1'>
                    <span>主詞條</span><br/>
                    <div className='flex flex-row'>
                        <div className='flex flex-row max-w-[140px]'>
                            {mainaffixImg}
                            <span className='text-white whitespace-nowrap overflow-hidden text-ellipsis'>{relic.main_affix.name}</span>
                        </div>
                        <span>:{relic.main_affix.display}</span>
                    </div>
                       
                </div>
                <div className='mt-2'>
                    <span>副詞條</span>
                    <div className='flex flex-col w-[190px]'>
                        {list}
                    </div>
                </div>
                {(button)?
                    <div className='mt-3'>
                        <button className='processBtn' onClick={navEnchant} disabled={!isChangeAble}>重洗模擬</button>
                    </div>:<></>}
            </div>
        )
    }else{
        return(<></>)
    }
});

const RelicData_simuldate=React.memo(({context,mode,button})=>{
    const {relic,Rrank,Rscore,standDetails,isChangeAble} = useContext(context);
    const partArr=['Head 頭部','Hand 手部','Body 軀幹','Feet 腳部','Rope 連結繩','Ball 位面球'];
    const navigate = useNavigate();
    //導航至模擬強化頁面
    function navEnchant(){
        let sendData={
            relic:relic,
            Rrank:Rrank,
            Rscore:Rscore,
            standDetails:standDetails,
            mode:mode
        }

        navigate('../enchant',{state:sendData});
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
            <div className={`w-[100%] mb-5 my-1 max-[500px]:min-w-[330px]`}>
                <div>
                    <span className='text-red-600 text-lg font-bold'>遺器資訊</span>
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
            </div>
        )
    }else{
        return(<></>)
    }
})

export  {RelicData,RelicData_simuldate};