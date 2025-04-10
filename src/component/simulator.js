import AffixList from '../data/AffixList';
import characters from '../data/characters';
import React, { useEffect, useRef } from 'react';
import { useState} from 'react';
import Select from 'react-select'
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import '../css/simulator.css';
import AffixName from '../data/AffixName';


import Result from './Result';
import Enchant from './Enchant';
import StandDetails from './StandDetails';
import {RelicData_simuldate as RelicData} from './RelicData';
import { PastPreview_simulator as PastPreview } from './PastPreview';

//遺器強化模擬器
function Simulator(){
    //版本代號
    const version="1.3";

    //部位選擇 跟主詞條選擇
    const [partsIndex,setPartsIndex]=useState(undefined);
    const [MainSelectOptions,setMainSelectOptions]=useState();
    
    const [ExpRate,setExpRate]=useState(undefined);
    const [Rscore,setRscore]=useState(undefined);
    const [Rrank,setRank]=useState({color:undefined,rank:undefined});
    const [statusMsg,setStatusMsg]=useState(undefined);
    const [processBtn,setProcessBtn]=useState(true);
    const standDetails=useRef([]);

    const SubData=useRef([]);
    const [charID,setCharID]=useState(undefined);
    const [PieNums,setPieNums]=useState(undefined);

    //自訂義標準
    const [selfStand,setSelfStand]=useState([]);

    //模擬強化相關數據
    const [simulatorData,setSimulatorData]=useState({});

    //找到的遺器
    const [relic,setRelic]=useState();

    //歷史紀錄
    //const [historyData,setHistoryData]=useState([]);
    const historyData=useRef([]);
    const partArr=['Head 頭部','Hand 手部','Body 軀幹','Feet 腳部','Rope 連結繩','Ball 位面球'];
    
    //是否可以儲存(防呆用)、是否可以立馬變更
    const [isSaveAble,setIsSaveAble]=useState(false);
    const [isChangeAble,setIsChangeAble]=useState(true);

    //當前路由
    const location = useLocation();

    useEffect(()=>{
        init();
    },[location])

    useEffect(() => {
        if(partsIndex!==undefined&&Number.isInteger(partsIndex)){
            let range=AffixList.find((s)=>s.id===(parseInt(partsIndex))).main;
            const targetAffix = range[0];
            setMainSelectOptions(targetAffix); 
        }
    }, [partsIndex]); 

    function init(){
        SubData.current=[];
        for(var i=0;i<=3;i++){
            let data={
                index:i, 
                subaffix:0,//詞條種類
                data:0, //詞條數值
                count:0 //強化次數
            }

            SubData.current.push(data);
        }
        
        let history=JSON.parse(localStorage.getItem('HistoryData'));
        
        //為了避免更新迭代而造成歷史紀錄格式上的問題 
        //必須要核對重大版本代號 如果版本不一致也不予顯示並且刪除
        
        if(history!=null&&history.length>0){
            history=history.filter((h)=>h.version===version);
            localStorage.setItem('HistoryData',JSON.stringify(history));
            //setHistoryData(prev=>prev != history ? history : prev);
            historyData.current=history;
            setStatusMsg('先前紀錄已匯入!!');
        }
    }


    function updateSubAffix(val,index){
        SubData.current.find((s,i)=>i===parseInt(index)).subaffix=val;
    }

    function updateSubData(val,index){
        SubData.current.find((s,i)=>i===parseInt(index)).data=Number(val);
    }

    function updateSubCount(val,index){
        SubData.current.find((s,i)=>i===parseInt(index)).count=Number(val);
    }

    //刪除過往紀錄
    function updateHistory(index){
        //如果刪除紀錄是目前顯示的 則會清空目前畫面上的
        historyData.current=historyData.current.filter((item,i)=>i!==index);
        setStatusMsg('正在處理中.....');
        //強制觸發刷新紀錄
        setTimeout(() => {
            setStatusMsg('成功刪除該紀錄!!');
        }, 0);
        localStorage.setItem('HistoryData',JSON.stringify(historyData.current));
    }
    //清除相關資料
    function clearData(){
        setExpRate(undefined);
        setRank({color:undefined,rank:undefined});
        setPieNums(undefined);
        setRscore(undefined);
        setRelic(undefined);
    }

    //儲存紀錄
    function saveRecord(){
        let partName=partArr[partsIndex-1];
        let selectChar=characters.find((c)=>c.charID===charID);

        //如果目前則沒有紀錄 則初始化
        if(!historyData.current)
            historyData.current=[];
        else if(historyData.current.length>=6)//如果原本紀錄超過6個 要先刪除原有紀錄
            historyData.current=historyData.current.filter((item,i)=>i!==0);
        
        //如果當前沒有任何資料則不予匯入
        if(!PieNums||ExpRate===undefined||!Rrank||Rscore===undefined){
            setStatusMsg("當前沒有任何數據，不予儲存!!");
            return;
        }
         //如果沒有選擇沒有任何腳色
        if(!charID){
            setStatusMsg("沒有選擇任何腳色!!");
            return;
        }
        
        //將部位資料丟進遺器資料中
        let savedRelic = relic;
        savedRelic.type=parseInt(partsIndex);

        //儲存紀錄
        let data={
            version:version,
            char:selectChar,
            part:partName,
            mainaffix:MainSelectOptions,
            expRate:ExpRate,
            score:Rscore,
            rank:Rrank,
            pieData:PieNums,
            stand:standDetails.current,
            relic:relic
        };

        //利用深拷貝區分原有資料
        let oldHistory=JSON.parse(JSON.stringify(historyData.current));
        historyData.current.push(data);
        setStatusMsg('已儲存');
        const targetElement = document.getElementById('historyData');
        targetElement.scrollIntoView({ behavior: 'smooth' });
        

        //將歷史紀錄合併至緩存數據中
        oldHistory.push(data);
        localStorage.setItem('HistoryData',JSON.stringify(oldHistory));
        setIsSaveAble(false);
    }

    //檢視過往紀錄
    function checkDetails(index){
        let data=historyData.current[index];
        setRank(data.rank);
        setExpRate(data.expRate);
        setRscore(data.score)
        setStatusMsg('資料替換完畢!!');
        setPieNums(data.pieData);
        standDetails.current=data.stand;
        setRelic(data.relic);

        //清空模擬強化紀錄
        setSimulatorData({});

        requestAnimationFrame(()=>{
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
        })
    }

    //整合並儲存遺器資訊
    function saveRelic(){
        let data={
            main_affix:MainSelectOptions,
            subaffix:[]
        }

        SubData.current.forEach((s,i)=>{
            if(!['生命值','攻擊力','防禦力','速度'].includes(s.subaffix))
                s.display=s.data+'%';
            else
                s.display=s.data;
        })
        data.subaffix=SubData.current;
        data.type = parseInt(partsIndex);

        setRelic(data);
    }

    //部位選擇器
    const PartSelect=()=>{
        
        let options=[<option value={'undefined'} key={'PartsUndefined'}>請選擇</option>];

        partArr.forEach((a,i)=>{
            options.push(
                <option value={i+1} key={'Parts'+i} >{a}</option>       
            )
        })

        return(
            <select value={partsIndex} 
                    onChange={(event)=>{
                        if(event.target.value==='undefined')
                            setPartsIndex(undefined)
                        else
                            setPartsIndex(event.target.value)
                    }}
                    disabled={!isChangeAble}
                    className='w-[120px] graySelect'>{options}</select>
        )
    }

    const MainAffixSelect=()=>{
        if(Number.isInteger(parseInt(partsIndex))&&partsIndex!==undefined){
            let range=AffixList.find((s)=>s.id===(parseInt(partsIndex))).main;
            
            //如果只有固定一個主屬性的情況下
            if(range.length===1){
                setMainSelectOptions(range[0]);
                return(<span className='text-white'>{MainSelectOptions}</span>)
            }else{
                //如果超過一個的情況下
                let options=[<option value={'undefined'} key={"MainAfffixUndefined"}>請選擇</option>];

                range.forEach((s,i)=>{
                    options.push(<option value={s} key={'Mainaffix'+i}>{s}</option>)
                });

                return(<select  defaultValue={MainSelectOptions} 
                                onChange={(event)=>{
                                    if(event.target.value==='undefined')
                                        setMainSelectOptions(undefined)
                                    else
                                        setMainSelectOptions(event.target.value)
                                }}
                                disabled={!isChangeAble}
                                className='w-[150px] graySelect'>{options}</select>)
            }
        }else{
            return(<></>)
        }
    }

    const SubAffixSelect=({index})=>{
        if(MainSelectOptions!==undefined&&MainSelectOptions!=='undefined'&&partsIndex!==undefined){
            let range=AffixList.find((s)=>s.id===parseInt(partsIndex)).sub;
            let options=[<option value={'undefined'} key={`SubaffixUndefined`}>請選擇</option>];

            range.forEach((s,i)=>{
                options.push(<option value={s} key={`Subaffix${i}`}>{s}</option>)
            });
            

            return(<div className='my-1' key={'SubAffixSelect'}>
                <select defaultValue={SubData.current[index].subaffix} 
                        onChange={(event)=>updateSubAffix(event.target.value,index)} 
                        className='graySelect'
                        disabled={!isChangeAble}>
                            {options}

                </select>
                <input type='number' defaultValue={SubData.current[index].data}
                        onChange={(event)=>updateSubData(event.target.value,index)}
                        className='ml-2 max-w-[50px] bgInput text-center' 
                        disabled={!isChangeAble} min={0} title='詞條數值'/>
                <input type='number' defaultValue={SubData.current[index].count}
                        onChange={(event)=>updateSubCount(event.target.value,index)}
                        className='ml-2 text-center bgInput' disabled={!isChangeAble}
                        min={0} max={5} title='強化次數'/>
                </div>)
        }else{
            return(<></>)
        }   
    }

    

    //顯示你所輸入的標準
    const ShowStand=()=>{
        const list=selfStand.map((s,i)=>{

            var IconName = AffixName.find((a)=>a.name===s.name).icon;

            var imglink=`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/property/${IconName}.png`;

            return(
                <div className='flex flex-row my-0.5'>
                    <div className='flex justify-between w-[170px] mt-0.5 max-[800px]:w-[150px] max-[400px]:w-[70%]'>
                        <img src={imglink} alt="icon" width={24} height={24}/>
                        <span className='whitespace-nowrap overflow-hidden text-ellipsis text-left w-[100px]'>{s.name}</span>
                        <input type='number' min={0} max={1} 
                            className='ml-2 text-center min-w-[40px] bgInput' defaultValue={selfStand[i].value}
                            title='最小值為0 最大為1'
                            onChange={(event)=>changeVal(i,event.target.value)}
                            disabled={!isChangeAble}/>
                        
                    </div>
                    <button onClick={()=>removeAffix(i)} className='deleteBtn ml-2 px-1' disabled={!isChangeAble}>移除</button>
                </div>
            )

        })

        function removeAffix(index){
            setSelfStand((arr)=>arr.filter((item,i)=>i!==index));
        }

        function changeVal(index,val){
            let stand=selfStand;
            selfStand[index].value=val;

            setSelfStand(stand);
        }

        return(
            <div className='flex flex-col'>
                {list}
            </div>
        )
    }


    //計算遺器分數等細節
    function calScore(){
        //先驗證選擇是否有誤
        //副詞條是否有空值?
        //副詞條是否有跟主詞條重複?
        let errors=false;

        SubData.current.some((s,i)=>{
            if(s.subaffix===MainSelectOptions){
                alert(`第${i+1}個詞條選擇\n副詞條不可選擇與主詞條相同的詞條\n請再重新選擇!!`);
                errors=true;
                return true;
            }
            else if(s.subaffix==='undefined'||s.subaffix===0){
                alert(`您還有副詞條沒有選擇\n請再重新選擇!!`);
                errors=true;
                return true;
            }
        })

        if(errors) return;
        //輸入的副詞條之間是否重複?
        const seen = new Set();
        for (const obj of SubData.current) {
            if (seen.has(obj['subaffix'])) {
                alert(`副詞條之間不可以選擇重複\n請再重新選擇!!`);
                errors=true;
                return;
            }
            seen.add(obj['subaffix']);
        }

        //檢查標準是否合法
        selfStand.forEach((s)=>{
            if(s.value===''){
                errors=true;
                alert('加權指數不可為空或其他非法型式');
            }
                
        })

        if(errors) return;

        //如果篩選有速度詞條 需給予0.5誤差計算 
        let deviation=(SubData.current.includes((s)=>s.subaffix==='spd'))?0.5*(selfStand.find((s)=>s.name==='速度').value):0;
        SubData.current.forEach(s=>{
            if(s.subaffix!=='spd'&&s.count!==0)//如果有其他無法判斷初始詞條的 一律給0.2誤差
                deviation+=0.2;
        })
        
        //將運行結果丟到背景執行
        let worker=new Worker(new URL('../worker/worker.js', import.meta.url));
        let postData={
            charID:charID,
            MainData:MainSelectOptions,
            SubData:SubData.current,
            partsIndex:partsIndex,
            standard:selfStand,
            deviation:deviation
        };

        //將按鈕disable
        setIsSaveAble(false);
        setProcessBtn(false);
        setIsChangeAble(false);
        setStatusMsg('數據計算處理中!!');
        clearData();
        worker.postMessage(postData);

        // 接收 Worker 返回的訊息
        worker.onmessage = function (event) {
            
            setExpRate(event.data.expRate);
            setRscore(event.data.relicscore)
            setStatusMsg('計算完畢!!');
            setPieNums(event.data.returnData);
            setRank(event.data.relicrank);
            saveRelic();
            standDetails.current=selfStand;
            
            //恢復點擊
            setProcessBtn(true);
            setIsSaveAble(true);
            setIsChangeAble(true);
            //將視窗往下滾
            requestAnimationFrame(()=>{
                window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'smooth'
                });
            })

            //清空強化紀錄
            setSimulatorData({});
        };
    }

    //模擬強化
    function simulate(){
        let isCheck=true;
        //將運行結果丟到背景執行 跟模擬所有組合的worker分開
        let worker=new Worker(new URL('../worker/worker2.js', import.meta.url));
        let MainAffix=AffixName.find((a)=>a.name===relic.main_affix);
        let SubData=[];

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

        //檢查標準是否合法
        selfStand.forEach((s)=>{
            if(s.value===''){
                isCheck=false;
                setStatusMsg('加權指數不可為空或其他非法型式');
            }
        });
        
        //如果篩選有速度詞條 需給予0.5誤差計算 
        let deviation=(SubData.includes((s)=>s.subaffix==='spd'))?0.5*(selfStand.find((s)=>s.name==='速度').value):0;
        SubData.forEach(s=>{
            if(s.subaffix!=='spd'&&s.count!==0)//如果有其他無法判斷初始詞條的 一律給0.2誤差
                deviation+=0.2;
        })

        //制定送出資料格式
        let postData={
            MainData:MainAffix.name,
            SubData:SubData,
            partsIndex:relic.type,
            standard:standDetails.current,
            deviation:0.5
        };
        
        if(isCheck){
            worker.postMessage(postData);

            // 接收 Worker 返回的訊息
            worker.onmessage = function (event) {
                setSimulatorData({
                    oldData:{
                        relicscore:Rscore,
                        relicrank:Rrank,
                        returnData:SubData
                    },
                    newData:event.data
                });
                requestAnimationFrame(()=>{
                    window.scrollTo({
                        top: document.getElementById('enchant').offsetTop,
                        behavior: 'smooth'
                    });
                })
                
            };
        }
        
        //將送出按鈕設為可用
        setIsChangeAble(true);
    }

    

    const StandardSelect=()=>{
        const [selectAffix,setAffix]=useState(undefined);
        
        //添加標準 目前設定先不超過六個有效 且不重複
        function addAffix(){
            if(selectAffix===undefined)
                return;
            let newItem={
                name:selectAffix,
                value:1
            }

            if(selfStand.length<6&&!(selfStand.findIndex((item)=>item.name===selectAffix)>=0))
                setSelfStand((old)=>[...old,newItem]);
        }

        //清除所有加權
        function clearAffix(){
            setSelfStand([]);
        }

        if(partsIndex!==undefined){
            //依據所選部位 給出不同的選澤
            let target=AffixList.find((a)=>a.id===parseInt(partsIndex));
            //合併所有選項 並且移除重複值
            let mergedArray = [...new Set([...target.main, ...target.sub])];
            mergedArray=mergedArray.filter((item)=>item!=='生命值'&&item!=='攻擊力'&&item!=='防禦力')

            
            let options=[<option value={'undefined'} key={'PartsUndefined'}>請選擇</option>];

            //如果該標準已被選擇 會顯示勾選圖示於左側選項中
            mergedArray.forEach((a,i)=>{
                options.push(
                    <option value={a} key={'Affix'+i} >
                         <span className='inline-block w-[20px]'>{(selfStand.find((s)=>s.name===a))?'\u2714 ':'\u2003'}</span>
                         <span>{a}</span>                   
                    </option>       
                )
            });

            return(
                <div className='flex flex-row flex-wrap items-center'>
                    <select value={selectAffix} 
                        onChange={(event)=>{setAffix(event.target.value)}}
                        disabled={!isChangeAble} className='mr-1 h-[25px] graySelect'>{options}</select>
                    <div className='max-[520px]:mt-1'>
                        <button className='processBtn px-1' onClick={addAffix} disabled={!isChangeAble}>添加</button>
                        <button className='deleteBtn ml-1 px-1' onClick={clearAffix} disabled={!isChangeAble}>清空</button>
                    </div>
                </div>
                
            )
        }else{
            return(<></>)
        }

    }

    
    return(<>
        <div className='w-4/5 mx-auto max-[600px]:w-[90%]'>
            <Helmet>
                <title>崩鐵--遺器重洗模擬器</title>
                <meta name="description" content="崩鐵--遺器重洗模擬器" />
                <meta name="keywords" content="遺器重洗、遺器重洗模擬器" />
            </Helmet>
            <h1 className='text-red-500 font-bold text-2xl'>遺器重洗模擬器</h1>
            <div className='flex flex-row flex-wrap'>
                <div className='flex flex-col mt-2 w-3/5 max-[900px]:w-[100%]'>
                    <div className='flex flex-row [&>*]:mr-2 my-3 items-center max-[400px]:!flex-col max-[400px]:items-start'>
                        <div className='text-right w-[200px] max-[600px]:max-w-[150px] max-[400px]:text-left'>
                            <span className='text-white'>Characters 腳色:</span>
                        </div>
                        <CharSelect charID={charID} 
                                    setCharID={setCharID} 
                                    setIsSaveAble={setIsSaveAble} 
                                    isChangeAble={isChangeAble}/>
                    </div>
                    <div className={`my-1 ${(Number.isInteger(charID)&&charID!==undefined)?'':'hidden'} mt-2 [&>*]:mr-2 flex flex-row max-[400px]:!flex-col max-[400px]:items-start`}>
                        <div className='text-right w-[200px] max-[600px]:max-w-[150px] max-[400px]:text-left'>
                            <span className='text-white'>Parts 部位:</span>
                        </div>
                        <PartSelect />   
                    </div>
                    <div className={`my-1 ${(Number.isInteger(parseInt(partsIndex)))?'':'hidden'} mt-2 [&>*]:mr-2 flex flex-row max-[400px]:items-start max-[400px]:!flex-col`}>
                        <div className='text-right w-[200px] max-[600px]:max-w-[150px] max-[400px]:text-left'>
                            <span className='text-white'>MainAffix 主屬性:</span>
                        </div>
                        <MainAffixSelect />
                    </div>
                    <div className={`my-1 ${(MainSelectOptions!==undefined&&MainSelectOptions!=='undefined'&&partsIndex!==undefined)?'':'hidden'} 
                            mt-2 [&>*]:mr-2 flex flex-row max-[600px]:!flex-col max-[600px]:text-center max-[400px]:text-left`}>
                        <div className='text-right w-[200px] max-[600px]:w-[100%] max-[600px]:text-center max-[400px]:text-left'>
                            <span className='text-white'>SubAffix 副屬性:</span>
                        </div>
                        <div className='flex flex-col'>
                            <SubAffixSelect index={0}/>
                            <SubAffixSelect index={1}/>
                            <SubAffixSelect index={2}/>
                            <SubAffixSelect index={3}/>
                        </div>
                    </div>
                    <div className={`mt-4 [&>*]:mr-2 flex flex-row items-baseline max-[400px]:!flex-col ${(partsIndex===undefined)?'hidden':''}`}>
                        <div className='text-right w-[200px] max-[600px]:max-w-[150px] max-[400px]:text-left'>
                            <span className='text-white'>Affix 有效詞條:</span>
                        </div>
                        <StandardSelect />
                    </div>
                    <div className={`mt-2 [&>*]:mr-2 flex flex-row max-[400px]:!flex-col ${(selfStand.length===0)?'hidden':''}`} >
                        <div className='text-right w-[200px] max-[600px]:max-w-[150px] max-[400px]:text-left'>
                            <span className='text-white'>Params 參數:</span>
                        </div>
                        <ShowStand />
                    </div>
                    <div className={`${(Number.isInteger(parseInt(partsIndex)))?'':'hidden'} mt-2 mb-2 max-w-[400px]  
                                flex flex-row [&>*]:mr-2 justify-end max-[400px]:justify-start`}>
                            <div className='flex flex-row mt-1'>
                                <button className='processBtn mr-2 whitespace-nowrap' 
                                    onClick={calScore} 
                                    disabled={!processBtn}>計算分數</button>
                                <button className='processBtn mr-2 whitespace-nowrap' 
                                onClick={saveRecord} disabled={!isSaveAble}>儲存紀錄</button>
                            </div>
                        
                    </div>
                </div>
                <div className='w-2/5 max-w-[400px] flex flex-col max-[900px]:w-[100%] max-[600px]:my-3'>
                    <h2 className='text-red-600 font-bold text-lg'>使用說明</h2>
                    <ul className='[&>li]:text-white list-decimal [&>li]:ml-2 max-[400px]:[&>li]:text-sm'>
                        <li>此工具主要目的是給予一些想要重洗詞條的人參考</li>
                        <li>翻盤機率是指說該遺器透過重洗詞條道具後導致遺器分數變高的機率為何</li>
                        <li>目前遺器只支援計算五星遺器</li>
                        <li>此工具相關數據仍有更改的可能，敬請見諒!</li>
                        <li>操作說明可以參考
                        <a href='https://home.gamer.com.tw/artwork.php?sn=6065608' className='!underline'>這篇</a></li>
                    </ul>
                </div>
            </div>
            <div className='flex flex-row mb-3 flex-wrap'>
                <div className={`w-[100%] max-[930px]:w-[100%] border-t-4 border-gray-600 p-2 my-4 ${(!historyData.current||historyData.current.length===0)?'hidden':''}`}
                    id="historyData" >
                    <div>
                        <span className='text-red-500 text-lg font-bold'>過往紀錄</span>
                    </div>
                    <div className='flex flex-row flex-wrap h-[300px] overflow-y-scroll hiddenScrollBar max-[600px]:!flex-col max-[600px]:!flex-nowrap'>
                        <HistoryList historyData={historyData.current}
                                    updateHistory={updateHistory}
                                    checkDetails={checkDetails}
                                    isChangeAble={isChangeAble}/>
                    </div>
                </div>
                <div className={`mt-3 flex flex-row flex-wrap w-[18vw]  max-[700px]:w-[50%] ${(PieNums===undefined)?'hidden':''} max-[400px]:w-[100%]`} >
                    <RelicData  relic={relic}
                                standDetails={standDetails}
                                simulate={simulate}
                                isChangeAble={isChangeAble}
                                statusMsg={statusMsg}/>
                </div>
                <div className={`mt-3 w-1/4 max-[700px]:w-[50%] ${(PieNums===undefined)?'hidden':''} max-[400px]:w-[100%]`} >
                    <StandDetails standDetails={standDetails.current}/>
                </div>
                <div className='mt-3 flex flex-row flex-wrap w-1/2 max-[700px]:w-[100%]' id="resultDetails">
                    <Result ExpRate={ExpRate} 
                            Rscore={Rscore} 
                            statusMsg={statusMsg} 
                            Rrank={Rrank} 
                            PieNums={PieNums}/>
                </div>
                
            </div>
            <div className='w-[100%] border-gray-600 my-4' id='enchant'>
                <Enchant getdata={simulatorData} standDetails={standDetails} />
            </div>
        </div>
    
    </>)
}

//歷史紀錄清單
const HistoryList=({historyData,updateHistory,checkDetails,isChangeAble})=>{
    if(historyData){
        return(
            historyData.map((item,i)=>
                <PastPreview index={i} 
                            data={item}    
                            checkDetails={checkDetails}
                            updateHistory={updateHistory}
                            isChangeAble={isChangeAble}
                            key={'historyData'+i}/>
            )
        )
    }else{
        return <></>
    }
}

const CharSelect=({charID,setCharID,setIsSaveAble,isChangeAble})=>{
    let options=[];

    const customStyles={
        control: (provided) => ({
            ...provided,
            backgroundColor: 'inherit', // 繼承背景顏色
            outline:'none',
        }),
        input: (provided) => ({
            ...provided,
            color: 'white', // 這裡設定 input 文字的顏色為白色
            backgroundColor:'inherit'
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
              ? 'darkgray'
              : state.isFocused
              ? 'gray'
              : 'rgb(36, 36, 36)',
            color: state.isSelected ? 'white' : 'black'
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: 'rgb(36, 36, 36)',
        })
    }
    
    characters.forEach((c)=>{
        options.push({
            value: c.charID, 
            label: c.name,
            icon: `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/character/${c.charID}.png`
        })
    })

    //自訂義篩選
    const customFilterOption = (option, inputValue) => {
        return option.data.label.toLowerCase().includes(inputValue.toLowerCase());
    };

    const selectedOption = options.find((option) => option.value === charID);
    return(<Select options={options} 
                className='w-[200px]' 
                onChange={(option)=>{setCharID(option.value);setIsSaveAble(false);}}
                value={selectedOption} 
                isDisabled={!isChangeAble}
                styles={customStyles}
                getOptionLabel={(e) => (
                    <div style={{ display: "flex", alignItems: "center"  }}>
                        <img src={e.icon} alt={e.label} style={{ width: 30, height: 30, marginRight: 8 ,borderRadius:"25px" }} />
                        <span className='text-white'>{e.label}</span>
                    </div>
                )}
                filterOption={customFilterOption}/>)
}

export default Simulator;

