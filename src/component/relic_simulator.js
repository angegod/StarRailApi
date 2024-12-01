import AffixList from '../data/AffixList';
import characters from '../data/characters';
import React, { useEffect, useRef } from 'react';
import { useState} from 'react';
import {Button} from 'react-bootstrap';
import Select from 'react-select'
import { PieChart } from '@mui/x-charts/PieChart';
import { Col } from 'react-bootstrap';
import { colors } from '@mui/material';

import '../css/simulator.css';

//遺器強化模擬器
function Simulator(){
    //部位選擇 跟主詞條選擇
    const [partsIndex,setPartsIndex]=useState(undefined);
    const [MainSelectOptions,setMainSelectOptions]=useState();
    const [SubSelectOptions,setSubSelectOptions]=useState([0,0,0,0]);//預計會用arr表示
    
    const [ExpRate,setExpRate]=useState(undefined);
    const [Rscore,setRscore]=useState(undefined);
    const [statusMsg,setStatusMsg]=useState(undefined);
    const [processBtn,setProcessBtn]=useState(true);

    const SubData=useRef([]);
    const [charID,setCharID]=useState(undefined);
    const [PieNums,setPieNums]=useState(undefined);
    init();

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

    //部位選擇器
    const PartSelect=()=>{
        let arr=['Head 頭部','Hands 手部','Body 軀幹','Feet 腳部','Link Rope 連結繩','Planar Sphere 位面球']
        let options=[<option value={'undefined'} key={'Parts'+'undefined'}>請選擇</option>];

        arr.map((a,i)=>{
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

                return(<select value={MainSelectOptions} 
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
                        className='ml-2' min={0}/>
                <input type='number' defaultValue={SubData.current[index].count}
                        onChange={(event)=>updateSubCount(event.target.value,index)}
                        className='ml-2 text-center' min={0} max={5}/>
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

    //圓餅圖
    const Pie=()=>{
        if(PieNums!==undefined){
            const pieParams = {
                height: 200,
                margin: { left: 2 },
                slotProps: { legend: { hidden: true } },
            };


            return(<>
                <PieChart series={[
                {
                    innerRadius: 20,
                    arcLabelMinAngle: 35,
                    arcLabel: (item) => `${item.value}%`,
                    data: PieNums,
                }
              ]}  {...pieParams}/>
                <div className='flex flex-col w-2/5'>
                    {PieNums.map((p)=><>
                        <div className='my-1 flex flex-row'>
                            <div style={{color:p.color}} className='w-[50px] text-right'>{`${p.label}`}</div>
                            <div style={{color:p.color}} className='w-[50px] ml-2'>{`${p.value}%`}</div>
                        </div>
                    </>)}
                </div>
            </>);
    
        }else{
            return(<></>)
        }
    }

    

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
        console.log(postData);

        //將按鈕disable
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
            //恢復點擊
            setProcessBtn(true);
        };
    }

    
    return(<>
        <div className='w-4/5 mx-auto '>
            <h1 className='text-red-500 font-bold text-2xl'>遺器強化模擬器</h1>
            <div className='flex flex-row flex-wrap'>
                <div className='flex flex-col mt-2 min-w-[600px] w-1/2'>
                    <div className='flex flex-row [&>*]:mr-2 my-3'>
                        <div className='text-right w-[200px]'><span className='text-white'>Characters 腳色:</span></div>
                        <CharSelect />
                    </div>
                    <div className={`${(Number.isInteger(charID)&&charID!==undefined)?'':'hidden'} mt-2 [&>*]:mr-2 flex flex-row`}>
                        <div className='text-right w-[200px]'><span className='text-white'>Parts 部位:</span></div>
                        <PartSelect />   
                    </div>
                    <div className={`${(Number.isInteger(parseInt(partsIndex)))?'':'hidden'} mt-2 [&>*]:mr-2 flex flex-row`}>
                        <div className='text-right w-[200px]'><span className='text-white'>MainAffix 主屬性:</span></div>
                        <MainAffixSelect />
                    </div>
                    <div className={`${(MainSelectOptions!==undefined&&MainSelectOptions!=='undefined')?'':'hidden'} mt-2 [&>*]:mr-2 flex flex-row`}>
                        <div className='text-right w-[200px]'><span className='text-white'>SubAffix 副屬性:</span></div>
                        <div className='flex flex-col'>
                            <SubAffixSelect index={0}/>
                            <SubAffixSelect index={1}/>
                            <SubAffixSelect index={2}/>
                            <SubAffixSelect index={3}/>
                        </div>
                    </div>
                    <div className={`${(Number.isInteger(parseInt(partsIndex)))?'':'hidden'} mt-2 text-center`}>
                        <button className='processBtn' 
                            onClick={calScore} 
                            disabled={!processBtn}>計算儀器分數</button>
                    </div>
                </div>
                <div className='w-1/2 max-w-[400px] flex flex-col'>
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
            <div>
                <div className={`${(statusMsg!==undefined)?'':'hidden'} mt-2`}>
                    <span className='text-white'>{statusMsg}</span>
                </div>
                <div className={`${(ExpRate!==undefined)?'':'hidden'} mt-2`}>
                    <span className='text-white'>遺器分數:{Rscore}</span>
                </div>
                <div className={`${(ExpRate!==undefined)?'':'hidden'} mt-2`}>
                    <span className='text-white'>重洗詞條翻盤機率:{`${(ExpRate*100).toFixed(1)}%`}</span>
                </div>
            </div>
            <div className='max-w-[450px] flex flex-row mb-5'>
                <Pie />
            </div>
            
        </div>
    
    </>)


}

export default Simulator;

