import React, { Component, useContext, useEffect, useRef,createContext } from 'react';
import AffixName from '../data/AffixName';
import { useState } from 'react';
import '../css/enchant.css';
import { useLocation } from 'react-router-dom';
import { jsx } from '@emotion/react';
import { StandDetails } from './StandDetails';
import { barElementClasses } from '@mui/x-charts';
import { RelicData, RelicData_simuldate } from './RelicData';


const EnchantContext = createContext();

//此物件為單次模擬隨機強化後的結果
const Enchant=React.memo(()=>{
    //const {simulatorData,standDetails,simulate,isChangeAble} =useContext(context);

    const location = useLocation();
    const data = location.state;
    const {relic,standDetails,Rscore,Rrank,mode}=data || {};
    
    const relicBackUp =useRef({});
    const [isChangeAble,setIsChangeAble]=useState(true);
    //模擬強化相關數據
    const [simulatorData,setSimulatorData]=useState({oldData:null,newData:null});

    //強化次數
    const [count,setCount]=useState(0);

    //進入頁面初始化自動執行一次
    useEffect(()=>{
        relicBackUp.current=JSON.parse(JSON.stringify(relic));

        execute();
    },[])

    //模擬強化--Importer
    function simulate(){
        let isCheck=true;

        //將運行結果丟到背景執行 跟模擬所有組合的worker分開
        let worker=new Worker(new URL('../worker/worker2.js', import.meta.url));
        let MainAffix=AffixName.find((a)=>a.fieldName===relic.main_affix.type);
        let SubData=[];
          
        if(simulatorData.oldData===null){
            relic.sub_affix.forEach((s,i)=>{
                let typeName=AffixName.find((a)=>a.fieldName===s.type);
                let val=(!typeName.percent)?Number(s.value.toFixed(1)):Number((s.value*100).toFixed(1));
                
                let data={
                    index:i, 
                    subaffix:typeName.name,
                    data:val, //詞條數值    
                    count:s.count-1//強化次數
                }
    
                SubData.push(data);
            });
        }else{
            SubData = simulatorData.oldData.returnData;
        }
        console.log(SubData);
        

        //檢查標準是否合法
        standDetails.forEach((s)=>{
            if(s.value===''){
                isCheck=false;
            }
        });
        
        //如果篩選有速度詞條 需給予0.5誤差計算 
        let deviation=(SubData.includes((s)=>s.subaffix==='速度'))?0.5*(standDetails.find((s)=>s.name==='速度').value):0;
        SubData.forEach(s=>{
            if(s.subaffix!=='spd'&&s.count!==0)//如果有其他無法判斷初始詞條的 一律給0.2誤差
                deviation+=0.2;
        });

        //制定送出資料格式
        let postData={
            MainData:MainAffix.name,
            SubData:SubData,
            partsIndex:(relic.type===5)?6:(relic.type===6)?5:relic.type,
            standard:standDetails,
            deviation:0.5
        };

        if(isCheck){
            worker.postMessage(postData);
            console.log(simulatorData);
            // 接收 Worker 返回的訊息
            worker.onmessage = function (event) {

                setSimulatorData({
                    oldData:{
                        relicscore:(simulatorData.oldData===null)?Rscore:simulatorData.oldData.relicscore,
                        relicrank:(simulatorData.newData===null)?Rrank:simulatorData.oldData.relicrank,
                        returnData:SubData
                    },
                    newData:event.data
                });
            };

            setCount((c)=>c+=1);
        }
    }

    //模擬強化--Simulator
    function simulate2(){
        let isCheck=true;
        //將運行結果丟到背景執行 跟模擬所有組合的worker分開
        let worker=new Worker(new URL('../worker/worker2.js', import.meta.url));
        let MainAffix=AffixName.find((a)=>a.name===relic.main_affix);
        let SubData=[];


        if(simulatorData.oldData===null){
            relic.subaffix.forEach((s,i)=>{
                let typeName=AffixName.find((a)=>a.name===s.subaffix);
               
                let data={
                    index:i, 
                    subaffix:typeName.name,
                    data:s.data, //詞條數值    
                    count:s.count//強化次數
                }
    
                SubData.push(data);
            });

        }else{
            SubData = simulatorData.oldData.returnData;
        }
        

        //檢查標準是否合法
        standDetails.forEach((s)=>{
            if(s.value===''){
                isCheck=false;
            }
        });
        
        //如果篩選有速度詞條 需給予0.5誤差計算 
        /*let deviation=(SubData.includes((s)=>s.subaffix==='spd'))?0.5*(selfStand.find((s)=>s.name==='速度').value):0;
        SubData.forEach(s=>{
            if(s.subaffix!=='spd'&&s.count!==0)//如果有其他無法判斷初始詞條的 一律給0.2誤差
                deviation+=0.2;
        })*/

        //制定送出資料格式
        let postData={
            MainData:MainAffix.name,
            SubData:SubData,
            partsIndex:relic.type,
            standard:standDetails,
            deviation:0.5
        };
        
        if(isCheck){
            worker.postMessage(postData);

            // 接收 Worker 返回的訊息
            worker.onmessage = function (event) {
                setSimulatorData({
                    oldData:{
                        relicscore:(simulatorData.oldData===null)?Rscore:simulatorData.oldData.relicscore,
                        relicrank:(simulatorData.newData===null)?Rrank:simulatorData.oldData.relicrank,
                        returnData:SubData
                    },
                    newData:event.data
                });

                setCount((c)=>c+=1);
            };
        }
    }

    //套用模擬強化的資料
    function changeToNew(){
        if(simulatorData.newData!==null){
            setSimulatorData({
                oldData:simulatorData.newData,
                newData:null
            });
        }
    }

    function execute(){
        //根據傳入模式執行對應模擬
        switch(mode){
            case 'Importer':
                simulate();
                break;
            case 'Simulator':
                simulate2();
                break;
            default:
                break;
        }
    }

    //回到初始狀態
    function reInit(){
        //將counter歸0
        setCount(0);

        //還原至一開始記錄
        setSimulatorData({oldData:null,newData:null});
    }

    const ResultSection=(simulatorData.newData!==undefined&&simulatorData.oldData!==undefined)?(
        <div className='flex flex-row flex-wrap  max-[600px]:!flex-col'>
            <DataList standDetails={standDetails} data={simulatorData.oldData} title={'重洗前'} />
            <div className={`flex my-auto w-[30px] moveAnimate moveAnimate2 max-[600px]:w-1/2 max-[600px]:justify-center h-[30px] ${(simulatorData.newData===null)?'hidden':''}`} >
                <svg xmlns="http://www.w3.org/2000/svg" className='max-[600px]:hidden'
                    height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="m560-240-56-58 142-142H160v-80h486L504-662l56-58 240 240-240 240Z"/></svg>
                <svg xmlns="http://www.w3.org/2000/svg" className='min-[600px]:hidden'
                    height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M440-800v487L216-537l-56 57 320 320 320-320-56-57-224 224v-487h-80Z"/></svg>
            </div>
            <DataList standDetails={standDetails} data={simulatorData.newData} title={'重洗後'} />          
        </div>
    ):(<></>);

    const EnchantStatus ={
        relic:relic,
        Rrank:Rrank,
        Rscore:Rscore,
        standDetails:standDetails,
        isChangeAble:isChangeAble,
        standDetails:standDetails
    };
    
    return(
        <EnchantContext.Provider value={EnchantStatus}>
            <div className='flex flex-col w-4/5 mx-auto max-[600px]:w-[90%]'>
                <div className="w-[100%] border-gray-600 my-4 justify-center flex flex-col">
                    <div className='flex flex-row'>
                        <span className='text-red-600 text-lg font-bold'>模擬強化 BETA</span>
                        <button className='processBtn ml-2' onClick={()=>execute()} >再洗一次</button>
                        <button className='processBtn ml-2' onClick={()=>changeToNew()}>套用新強化</button>
                        <button className='processBtn ml-2' onClick={()=>reInit()}>還原至初始</button>
                    </div>
                    <div className='my-2'>
                        <span>目前重洗次數:<span className='text-white ml-1'>{count}</span></span>
                    </div>
                    <div className='flex flex-row'>
                        {(mode==="Importer")?<RelicData context={EnchantContext} />:<RelicData_simuldate context={EnchantContext} />}
                        <StandDetails context={EnchantContext}/>
                    </div>
                    {ResultSection}
                </div>
            </div>
        </EnchantContext.Provider>
    )
     
});

//強化前後的數據顯示
const DataList=React.memo(({standDetails,data,title})=>{
    let list=[];
    if(data!==null){
        data.returnData.map((d,i)=>{
            let markcolor="";
            var targetAffix = AffixName.find((a)=>a.name===d.subaffix);
            let isBold=(standDetails.find((st)=>st.name===d.subaffix)!==undefined)?true:false;
            let showData;
            //檢查是否要顯示%數
            if(targetAffix.percent&&!d.data.toString().includes('%'))
                showData=d.data+'%';
                    
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
                case 5:
                    markcolor='#FF55FF';
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
                    <span className='flex w-[70px]'>:<span className='ml-2 text-white '>{showData}</span></span>
                </div>
                
            )
        });
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
            </div>
        )
    }else{
        return(<></>)
    }
    
    
    
    
});

export default Enchant;

//data資料包含著 既定結果跟模擬結果
//兩個都需要 1.詞條數據 2.強化次數 3.遺器分數跟評級