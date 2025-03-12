import React, { Component } from 'react';
import { useState ,useRef} from 'react';
import AffixName from '../data/AffixName';
import '../css/enchant.css';


//此物件為單次模擬隨機強化後的結果
function Enchant({getdata,standDetails}){
    if(getdata.newData===undefined||getdata===undefined){
        return(<></>)
    }else{
        
        return(
            <div className="w-[100%] border-gray-600 my-4 justify-center flex flex-col">
                <div>
                    <span className='text-red-600 text-lg font-bold'>模擬強化 BETA</span>
                </div>
                <div className='flex flex-row flex-wrap  max-[600px]:!flex-col'>
                    <DataList data={getdata.oldData} title={'重洗前'} />
                    <div className='flex my-auto w-[30px] moveAnimate 
                        max-[600px]:w-1/2 max-[600px]:justify-center moveAnimate2'>
                        <svg xmlns="http://www.w3.org/2000/svg" className='max-[600px]:hidden'
                            height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="m560-240-56-58 142-142H160v-80h486L504-662l56-58 240 240-240 240Z"/></svg>
                        <svg xmlns="http://www.w3.org/2000/svg" className='min-[600px]:hidden'
                            height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M440-800v487L216-537l-56 57 320 320 320-320-56-57-224 224v-487h-80Z"/></svg>
                    </div>
                    <DataList data={getdata.newData} title={'重洗後'} />
                    
                </div>
            </div>
        )
    }



    //強化前後的數據顯示
    function DataList({data,title}){
        let list=[];

        data.returnData.map((d,i)=>{
            let markcolor="";
            var targetAffix = AffixName.find((a)=>a.name===d.subaffix);
            let isBold=(standDetails.current.find((st)=>st.name===d.subaffix)!==undefined)?true:false;

            //檢查是否要顯示%數
            if(targetAffix.percent&&!d.data.toString().includes('%'))
                d.data=d.data+'%';
                    
            var imglink=`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/property/${targetAffix.icon}.png`;

            switch(d.count){
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
                <div className='flex flex-row' key={'Subaffix_'+d.subaffix}>
                    <div className='flex justify-center items-center'>
                        <span className='mr-0.5 text-white w-[20px] h-[20px] rounded-[20px]
                            flex justify-center items-center' style={{backgroundColor:markcolor}}>
                            {d.count}
                        </span>
                    </div>
                    <div className='w-[120px] flex flex-row'>
                        <div className='flex justify-center items-center'>
                            <img src={imglink} alt='555' width={24} height={24}/>
                        </div>
                        <span className={`${(isBold)?'text-yellow-500 font-bold':'text-white'} text-left flex` }>{d.subaffix}</span>
                    </div>
                    <span className='flex w-[70px]'>:<span className='ml-2 text-white '>{d.data}</span></span>
                </div>
                
            )
        })
        
        
        return(
        <div className='flex flex-col mx-1'>
            <div>
                <span className='text-amber-700 font-bold text-lg'>{title}</span>
                <div className='flex flex-row'>
                    <span>遺器評級:</span>
                    <span className='pl-2' style={{color:data.relicrank.color}}>
                        {data.relicrank.rank} {data.relicscore}/100 
                    </span>
                </div>
            </div>
            <div>
                {list}
            </div>
        </div>)
    }
}

export default Enchant;

//data資料包含著 既定結果跟模擬結果
//兩個都需要 1.詞條數據 2.強化次數 3.遺器分數跟評級