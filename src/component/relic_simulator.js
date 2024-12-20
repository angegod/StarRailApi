import AffixList from '../data/AffixList';
import characters from '../data/characters';
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { useState} from 'react';
import {Button} from 'react-bootstrap';
import Select from 'react-select'
import { useLocation } from 'react-router-dom';
import { Col } from 'react-bootstrap';
import { colors } from '@mui/material';
import { Helmet } from 'react-helmet';
import Result from './Result';
import '../css/simulator.css';

//遺器強化模擬器
function Simulator(){
    //部位選擇 跟主詞條選擇
    const [partsIndex,setPartsIndex]=useState(undefined);
    const [MainSelectOptions,setMainSelectOptions]=useState();
    
    const [ExpRate,setExpRate]=useState(undefined);
    const [Rscore,setRscore]=useState(undefined);
    const [Rrank,setRank]=useState({color:undefined,rank:undefined});
    const [statusMsg,setStatusMsg]=useState(undefined);
    const [processBtn,setProcessBtn]=useState(true);

    const SubData=useRef([]);
    const [charID,setCharID]=useState(undefined);
    const [PieNums,setPieNums]=useState(undefined);

    //歷史紀錄
    const [historyData,setHistoryData]=useState([]);
    const partArr=['Head 頭部','Hands 手部','Body 軀幹','Feet 腳部','Link Rope 連結繩','Planar Sphere 位面球'];
    
    //是否可以儲存(防呆用)
    const [isSaveAble,setIsSaveAble]=useState(false);

    //當前路由
    const location = useLocation();

    useEffect(()=>{
        //初始化歷史紀錄
        init();
        //console.log(historyData);
    },[location])
    
    

    function init(){
        SubData.current=[];
        for(var i=0;i<=3;i++){
            let data={
                index:i, 
                subaffix:0,
                data:0, //詞條數值
                count:0 //強化次數
            }

            SubData.current.push(data);
        }

        let history=localStorage.getItem('HistoryData');
        //console.log(JSON.parse(history));
        if(history!=null){
            setHistoryData(JSON.parse(history));
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
        setHistoryData((old)=>old.filter((item,i)=>i!==index));
        setStatusMsg('成功刪除該紀錄!!');

        let oldHistory=historyData;
        oldHistory=oldHistory.filter((item,i)=>i!==index);
        localStorage.setItem('HistoryData',JSON.stringify(oldHistory));
    }

    //儲存紀錄
    function saveRecord(){
        let partName=partArr[partsIndex-1];
        let selectChar=characters.find((c)=>c.charID===charID);

        //如果目前則沒有紀錄 則初始化
        if(!historyData)
            setHistoryData([]);
        else if(historyData.length>=6)//如果原本紀錄超過6個 要先刪除原有紀錄
            setHistoryData((old)=>old.filter((item,i)=>i!==0));
         
        //如果當前沒有任何資料則不予匯入
        if(!PieNums||!ExpRate||!Rrank||!Rscore){
            setStatusMsg("當前沒有任何數據，不予儲存!!");
            return;
        }
         //如果沒有選擇沒有任何腳色
        if(!charID){
            setStatusMsg("沒有選擇任何腳色!!");
            return;
        }


        //儲存紀錄
        let data={
            char:selectChar,
            part:partName,
            mainaffix:MainSelectOptions,
            expRate:ExpRate,
            score:Rscore,
            rank:Rrank,
            pieData:PieNums
        };

        //利用深拷貝區分原有資料
        let oldHistory=JSON.parse(JSON.stringify(historyData));
        setHistoryData((old)=>[...old,data]);
      
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
        let data=historyData[index];
        console.log(data);
        setRank(data.rank);
        setExpRate(data.expRate);
        setRscore(data.score)
        setStatusMsg('資料替換完畢!!');
        setPieNums(data.pieData);
    }

    //部位選擇器
    const PartSelect=()=>{
        
        let options=[<option value={'undefined'} key={'Parts'+'undefined'}>請選擇</option>];

        partArr.map((a,i)=>{
            options.push(<>
                <option value={i+1} key={'Parts'+i} >{a}</option>       
            </>)
        })

        return(
            <select value={partsIndex} onChange={(event)=>setPartsIndex(event.target.value)}>{options}</select>
        )
    }

    const MainAffixSelect=()=>{
        if(Number.isInteger(parseInt(partsIndex))){
            let range=AffixList.find((s)=>s.id===(parseInt(partsIndex))).main;
            
            //如果只有固定一個主屬性的情況下
            if(range.length===1){
                let targetAffix=range[0];
                setMainSelectOptions(targetAffix);

                return(<span className='text-white'>{targetAffix}</span>)
            }else{
                //如果超過一個的情況下
                let options=[<option value={'undefined'}>請選擇</option>];

                range.map((s,i)=>{
                    options.push(<><option value={s} key={'Mainaffix'+i}>{s}</option></>)
                });

                return(<select defaultValue={MainSelectOptions} 
                    onChange={(event)=>setMainSelectOptions(event.target.value)}>{options}</select>)
            }
        }else{
            return(<></>)
        }
    }

    const SubAffixSelect=({index})=>{
        if(MainSelectOptions!==undefined&&MainSelectOptions!=='undefined'){
            let range=AffixList.find((s)=>s.id===parseInt(partsIndex)).sub;
            let options=[<option value={'undefined'}>請選擇</option>];

            range.map((s,i)=>{
                options.push(<><option value={s} key={`Subaffix${i}`}>{s}</option></>)
            });
            

            return(<><div className='my-1 '>
                <select defaultValue={SubData.current[index].subaffix} 
                        onChange={(event)=>updateSubAffix(event.target.value,index)} className=''>
                            {options}

                </select>
                <input type='number' defaultValue={SubData.current[index].data}
                        onChange={(event)=>updateSubData(event.target.value,index)}
                        className='ml-2 max-w-[70px] pl-2' min={0} title='詞條數值'/>
                <input type='number' defaultValue={SubData.current[index].count}
                        onChange={(event)=>updateSubCount(event.target.value,index)}
                        className='ml-2 text-center' min={0} max={5} title='強化次數'/>
                </div></>)
        }else{
            return(<></>)
        }   
    }

    //腳色選擇
    const CharSelect=()=>{
        let options=[];
        
        characters.map((c)=>{
            options.push({
                value: c.charID, label: c.name
            })
        })
        const selectedOption = options.find((option) => option.value === charID);
        return(<Select options={options} 
                    className='w-[200px]' 
                    onChange={(option)=>setCharID(option.value)}
                    value={selectedOption} />)
    }

    

    //簡易瀏覽
    const PastPreview=({index})=>{
        let data=historyData[index];
        let BaseLink=`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/character/${data.char.charID}.png`;

        return(<>
            <div className='flex flex-row flex-wrap w-[300px] max-h-[120px] bg-slate-700 rounded-md p-2 m-2'>
                <div className='flex flex-col mr-3'>
                    <div>
                        <img src={BaseLink} alt='iconChar' className='w-[70px] rounded-[50px]'/>
                    </div>
                    <div className='text-center'>
                        <span style={{color:data.rank.color}} className='font-bold text-xl'>{data.score}</span>
                    </div>
                </div>
                <div className='flex flex-col'>
                    <div>
                        <span className='text-white'>部位:{data.part}</span>
                    </div>
                    <div>
                        <span className='text-white'>主詞條:{data.mainaffix}</span>
                    </div>
                    <div>
                        <span className='text-white'>期望機率:{(data.expRate*100).toFixed(1)}%</span>
                    </div>
                    <div>
                        <button className='processBtn mr-2' onClick={()=>checkDetails(index)}>檢視</button>
                        <button className='deleteBtn' onClick={()=>updateHistory(index)}>刪除</button>
                    </div>
                </div>
            </div>
        
        </>)
    };
        
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
        //副詞條之間是否重複?
        const seen = new Set();
        for (const obj of SubData.current) {
            if (seen.has(obj['subaffix'])) {
                alert(`副詞條之間不可以選擇重複\n請再重新選擇!!`);
                errors=true;
                return;
            }
            seen.add(obj['subaffix']);
        }

        if(errors) return;
        
        //將運行結果丟到背景執行
        let worker=new Worker(new URL('../worker/worker.js', import.meta.url));
        let postData={
            charID:charID,
            MainData:MainSelectOptions,
            SubData:SubData.current,
            partsIndex:partsIndex
        };

        //將按鈕disable
        setIsSaveAble(false);
        setProcessBtn(false);
        setStatusMsg('數據計算處理中!!');
        setPieNums(undefined);
        worker.postMessage(postData);

        // 接收 Worker 返回的訊息
        worker.onmessage = function (event) {
            console.log(event.data);
            setExpRate(event.data.expRate);
            setRscore(event.data.relicscore)
            setStatusMsg('計算完畢!!');
            setPieNums(event.data.returnData);
            setRank(event.data.relicrank);
            //恢復點擊
            setProcessBtn(true);
            setIsSaveAble(true);
        };
    }

    const HistoryList=()=>{
        if(historyData){
            return(
                historyData.map((item,i)=>
                    <PastPreview index={i} />
                )
            )
        }else{
            return <></>
        }
    }

    
    return(<>
        <div className='w-4/5 mx-auto '>
            <Helmet>
                <title>星鐵--遺器強化模擬器</title>
                <meta name="description" content="星鐵--遺器強化模擬器。" />
                <meta name="keywords" content="遺器強化、遺器強化模擬器" />
            </Helmet>
            <h1 className='text-red-500 font-bold text-2xl'>遺器強化模擬器</h1>
            <div className='flex flex-row flex-wrap'>
                <div className='flex flex-col mt-2 min-w-[600px] w-1/2 max-[600px]:w-[100%] max-[600px]:min-w-[275px]'>
                    <div className='flex flex-row [&>*]:mr-2 my-3'>
                        <div className='text-right w-[200px] max-[600px]:max-w-[150px]'><span className='text-white'>Characters 腳色:</span></div>
                        <CharSelect />
                    </div>
                    <div className={`${(Number.isInteger(charID)&&charID!==undefined)?'':'hidden'} mt-2 [&>*]:mr-2 flex flex-row`}>
                        <div className='text-right w-[200px] max-[600px]:max-w-[150px]'><span className='text-white'>Parts 部位:</span></div>
                        <PartSelect />   
                    </div>
                    <div className={`${(Number.isInteger(parseInt(partsIndex)))?'':'hidden'} mt-2 [&>*]:mr-2 flex flex-row`}>
                        <div className='text-right w-[200px] max-[600px]:max-w-[150px]'><span className='text-white'>MainAffix 主屬性:</span></div>
                        <MainAffixSelect />
                    </div>
                    <div className={`${(MainSelectOptions!==undefined&&MainSelectOptions!=='undefined')?'':'hidden'} 
                            mt-2 [&>*]:mr-2 flex flex-row max-[600px]:!flex-col max-[600px]:text-center`}>
                        <div className='text-right w-[200px] max-[600px]:w-[100%] max-[600px]:text-center'>
                            <span className='text-white'>SubAffix 副屬性:</span>
                        </div>
                        <div className='flex flex-col'>
                            <SubAffixSelect index={0}/>
                            <SubAffixSelect index={1}/>
                            <SubAffixSelect index={2}/>
                            <SubAffixSelect index={3}/>
                        </div>
                    </div>
                    <div className={`${(Number.isInteger(parseInt(partsIndex)))?'':'hidden'} mt-2 mb-2 text-center max-[600px]:text-left 
                                flex flex-row justify-end`}>
                        
                            <button className='processBtn mr-2' 
                                onClick={calScore} 
                                disabled={!processBtn}>計算儀器分數</button>
                            <button className='processBtn mr-2' onClick={saveRecord} disabled={!isSaveAble}>儲存紀錄</button>
                        
                    </div>
                </div>
                <div className='w-1/2 max-w-[400px] flex flex-col max-[600px]:w-[100%] max-[600px]:mt-3'>
                    <h2 className='text-red-600 font-bold text-lg'>使用說明</h2>
                    <ul className='[&>li]:text-white list-decimal [&>li]:ml-2'>
                        <li>此工具主要目的是給予一些想要重洗詞條的人參考</li>
                        <li>此工具的一些數據以及標準是參考
                            <a href='https://www.otameta.com/hub/honkai-starrail/relic-scorer' className='underline'>relic scorer</a>
                        </li>
                        <li>翻盤機率是指說該遺器透過重洗詞條道具後導致遺器分數變高的機率為何</li>
                        <li>目前遺器只支援計算五星遺器</li>
                        <li>此工具目前處於BETA階段，相關數據仍有更改的可能</li>
                    </ul>
                </div>
            </div>
            <div className='flex flex-row mb-3 flex-wrap'>
                <Result ExpRate={ExpRate} Rscore={Rscore} statusMsg={statusMsg} Rrank={Rrank} PieNums={PieNums} />
                <div className={`${(!historyData||historyData.length===0)?'hidden':''} w-[35%] max-[930px]:w-[100%] border-t-4 border-gray-600 p-2 my-2`}
                    id="historyData">
                    <div>
                        <span className='text-red-500 text-lg font-bold'>過往紀錄</span>
                    </div>
                    <div className='flex flex-row flex-wrap h-[300px] overflow-y-scroll hiddenScrollBar'>
                        <HistoryList />
                    </div>
                </div>
            </div>
            
            
        </div>
    
    </>)


}







export default Simulator;

