import AffixList from '../data/AffixList';
import characters from '../data/characters';
import React, { useEffect, useRef } from 'react';
import { useState} from 'react';
import Select from 'react-select'
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Result from './Result';
import '../css/simulator.css';

//遺器強化模擬器
function Simulator(){
    //版本代號
    const version="1.0";

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

    //找到的遺器
    const [relic,setRelic]=useState();

    //歷史紀錄
    const [historyData,setHistoryData]=useState([]);
    const partArr=['Head 頭部','Hands 手部','Body 軀幹','Feet 腳部','Link Rope 連結繩','Planar Sphere 位面球'];
    
    //是否可以儲存(防呆用)、是否可以立馬變更
    const [isSaveAble,setIsSaveAble]=useState(false);
    const [isChangeAble,setIsChangeAble]=useState(true);

    //當前路由
    const location = useLocation();

    useEffect(()=>{
        //初始化歷史紀錄
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
                subaffix:0,
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
            setHistoryData(history);
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
            version:"1.0",
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
        //console.log(data);
        setRank(data.rank);
        setExpRate(data.expRate);
        setRscore(data.score)
        setStatusMsg('資料替換完畢!!');
        setPieNums(data.pieData);
        standDetails.current=data.stand;
        setRelic(data.relic);

        document.getElementById("resultDetails").scrollIntoView({ behavior: "smooth" });
    }

    //儲存遺器資訊
    function saveRelic(){
        let data={
            main_affix:MainSelectOptions,
            subaffix:[]
        }

        SubData.current.forEach((s,i)=>{
            if(!['生命力','攻擊力','防禦力','速度'].includes(s.subaffix))
                s.display=s.data+'%';
            else
                s.display=s.data;
        })
        data.subaffix=SubData.current;

        setRelic(data);
    }

    //部位選擇器
    const PartSelect=()=>{
        
        let options=[<option value={'undefined'} key={'PartsUndefined'}>請選擇</option>];

        partArr.map((a,i)=>{
            options.push(
                <option value={i+1} key={'Parts'+i} >{a}</option>       
            )
        })

        return(
            <select value={partsIndex} 
                    onChange={(event)=>setPartsIndex(event.target.value)}
                    disabled={!isChangeAble}>{options}</select>
        )
    }

    const MainAffixSelect=()=>{
        if(Number.isInteger(parseInt(partsIndex))&&partsIndex!==undefined){
            let range=AffixList.find((s)=>s.id===(parseInt(partsIndex))).main;
            
            //如果只有固定一個主屬性的情況下
            if(range.length===1){
                return(<span className='text-white'>{MainSelectOptions}</span>)
            }else{
                //如果超過一個的情況下
                let options=[<option value={'undefined'} key={"MainAfffixUndefined"}>請選擇</option>];

                range.map((s,i)=>{
                    options.push(<option value={s} key={'Mainaffix'+i}>{s}</option>)
                });

                return(<select  defaultValue={MainSelectOptions} 
                                onChange={(event)=>setMainSelectOptions(event.target.value)}
                                disabled={!isChangeAble}>{options}</select>)
            }
        }else{
            return(<></>)
        }
    }

    const SubAffixSelect=({index})=>{
        if(MainSelectOptions!==undefined&&MainSelectOptions!=='undefined'){
            let range=AffixList.find((s)=>s.id===parseInt(partsIndex)).sub;
            let options=[<option value={'undefined'} key={`SubaffixUndefined`}>請選擇</option>];

            range.map((s,i)=>{
                options.push(<option value={s} key={`Subaffix${i}`}>{s}</option>)
            });
            

            return(<div className='my-1' key={'SubAffixSelect'}>
                <select defaultValue={SubData.current[index].subaffix} 
                        onChange={(event)=>updateSubAffix(event.target.value,index)} 
                        className=''
                        disabled={!isChangeAble}>
                            {options}

                </select>
                <input type='number' defaultValue={SubData.current[index].data}
                        onChange={(event)=>updateSubData(event.target.value,index)}
                        className='ml-2 max-w-[70px] pl-2' 
                        disabled={!isChangeAble} min={0} title='詞條數值'/>
                <input type='number' defaultValue={SubData.current[index].count}
                        onChange={(event)=>updateSubCount(event.target.value,index)}
                        className='ml-2 text-center' disabled={!isChangeAble}
                        min={0} max={5} title='強化次數'/>
                </div>)
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
                    value={selectedOption} 
                    isDisabled={!isChangeAble}/>)
    }

    //顯示你所輸入的標準
    const ShowStand=()=>{
        const list=selfStand.map((s,i)=><>
            <div className='flex flex-row'>
                <div className='flex justify-between w-[200px] mt-0.5 max-[600px]:w-[130px]'>
                    <span className='whitespace-nowrap overflow-hidden'>{s.name}</span>
                    <input type='number' min={0} max={1} 
                        className='ml-2 text-center' defaultValue={selfStand[i].value}
                        title='最小值為0 最大為1'
                        onChange={(event)=>changeVal(i,event.target.value)}/>
                    
                </div>
                <button onClick={()=>removeAffix(i)} className='deleteBtn ml-0.5'>移除</button>
            </div>
        </>)

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

    //顯示儀器分數區間
    const RelicData=()=>{
        //console.log(SubData.current);
        if(relic!==undefined){

            const list=[];

            relic.subaffix.forEach((s)=>{
                list.push(
                    <div className='flex flex-row' key={'Data'+s.subaffix}>
                        <span className='text-white text-left flex w-[80px]'>{s.subaffix}</span>
                        <span className='flex w-[80px]'>:<span className='ml-2 text-white '>{s.display}</span></span>
                    </div>    
                )
            })
            
            return(
                <div className={`w-[100%] min-w-[400px] mb-5 border-t-4 border-gray-600 my-2 pt-2 
                    ${(statusMsg!==undefined)?'':'hidden'} max-[500px]:min-w-[330px]`}>
                    <div>
                        <span className='text-red-600 text-lg font-bold'>遺器資訊</span>
                    </div>
                    <div className='mt-1'>
                        <span>主詞條</span><br/>
                        <span className='text-white'>{relic.main_affix}</span>   
                    </div>
                    <div className='mt-2'>
                        <span>副詞條</span>
                        <div className='flex flex-col w-[160px]'>
                            {list}
                        </div>
                    </div>
                </div>
            )
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
            partsIndex:partsIndex,
            standard:selfStand
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
        };
    }

    const HistoryList=()=>{
        if(historyData){
            return(
                historyData.map((item,i)=>
                    <PastPreview index={i} key={'historyData'+i}/>
                )
            )
        }else{
            return <></>
        }
    }

    const StandardSelect=()=>{
        const [selectAffix,setAffix]=useState(undefined);
        
        //添加標準 目前設定先不超過六個有效 且不重複
        function addAffix(){
            let newItem={
                name:selectAffix,
                value:1
            }

            if(selfStand.length<6&&!(selfStand.findIndex((item)=>item.name===selectAffix)>=0))
                setSelfStand((old)=>[...old,newItem]);
        }

        function clearAffix(){
            setSelfStand([]);
        }

        if(partsIndex!==undefined){
            //依據所選部位 給出不同的選澤
            let target=AffixList.find((a)=>a.id===parseInt(partsIndex));
            //合併所有選項 並且移除重複值
            let mergedArray = [...new Set([...target.main, ...target.sub])];
            mergedArray=mergedArray.filter((item)=>item!=='生命力'&&item!=='攻擊力'&&item!=='防禦力')

            let options=[<option value={'undefined'} key={'PartsUndefined'}>請選擇</option>];

            mergedArray.forEach((a,i)=>{
                options.push(
                    <option value={a} key={'Affix'+i} >{a}</option>       
                )
            });

            return(
                <div className='flex flex-row flex-wrap'>
                    <select value={selectAffix} 
                        onChange={(event)=>{setAffix(event.target.value)}}
                        disabled={!isChangeAble} className='mr-1'>{options}</select>
                    <div className='max-[520px]:mt-1 '>
                        <button className='processBtn' onClick={addAffix}>添加</button>
                        <button className='deleteBtn ml-1' onClick={clearAffix}>清空</button>
                    </div>
                </div>
                
            )
        }else{
            return(<></>)
        }

    }

    //顯示你輸出的標準為何?
    const StandDetails=()=>{
        if(standDetails.current!==undefined){
            const list=standDetails.current.map((s,i)=>
                <div className='flex flex-row' key={'StandDetails'+i}>
                    <div className='flex justify-between w-[200px] mt-0.5'>
                        <span>{s.name}</span>
                        <span>{s.value}</span>
                    </div>
                </div>
            )

            return(<>
                <div className={`w-[100%] min-w-[400px] mb-5 border-t-4 border-gray-600 my-2 pt-2 
                    max-[600px]:!min-w-[0px]`}>
                    <div>
                        <span className='text-red-600 text-lg font-bold'>標準加權</span>
                    </div>
                    <div>
                        {list}
                    </div>
                </div>
            
            </>)
        }
    }
    
    return(<>
        <div className='w-4/5 mx-auto '>
            <Helmet>
                <title>崩鐵--遺器強化模擬器</title>
                <meta name="description" content="崩鐵--遺器強化模擬器" />
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
                    <div className={`mt-2 [&>*]:mr-2 flex flex-row`} hidden={partsIndex===undefined}>
                        <div className='text-right w-[200px] max-[600px]:max-w-[150px]'><span className='text-white'>Affix 有效詞條:</span></div>
                        <StandardSelect />
                    </div>
                    <div className={`mt-2 [&>*]:mr-2 flex flex-row`} hidden={selfStand.length==0}>
                        <div className='text-right w-[200px] max-[600px]:max-w-[150px]'><span className='text-white'>Params 參數:</span></div>
                        <ShowStand />
                    </div>
                    <div className={`${(Number.isInteger(parseInt(partsIndex)))?'':'hidden'} mt-2 mb-2 text-center  
                                flex flex-row [&>*]:mr-2`}>
                            <div className='text-right w-[200px] max-[600px]:w-[100%] max-[600px]:text-center
                            max-[600px]:max-w-[150px]'>
                                
                            </div>
                            <div className='flex flex-row max-[600px]:!flex-col'>
                                <button className='processBtn mr-2' 
                                    onClick={calScore} 
                                    disabled={!processBtn}>計算儀器分數</button>
                                <button className='processBtn mr-2 max-[600px]:mt-2' 
                                onClick={saveRecord} disabled={!isSaveAble}>儲存紀錄</button>
                            </div>
                        
                    </div>
                </div>
                <div className='w-1/2 max-w-[400px] flex flex-col max-[600px]:w-[100%] max-[600px]:mt-3'>
                    <h2 className='text-red-600 font-bold text-lg'>使用說明</h2>
                    <ul className='[&>li]:text-white list-decimal [&>li]:ml-2'>
                        <li>此工具主要目的是給予一些想要重洗詞條的人參考</li>
                        <li>翻盤機率是指說該遺器透過重洗詞條道具後導致遺器分數變高的機率為何</li>
                        <li>目前遺器只支援計算五星遺器</li>
                        <li>此工具目前處於BETA階段，相關數據仍有更改的可能</li>
                        <li>聲明:此工具相關程式邏輯均為本人Ange完成</li>
                    </ul>
                </div>
            </div>
            <div className='flex flex-row mb-3 flex-wrap'>
                <div className={`w-[100%] max-[930px]:w-[100%] border-t-4 border-gray-600 p-2 my-2`}
                    id="historyData" hidden={(!historyData||historyData.length===0)}>
                    <div>
                        <span className='text-red-500 text-lg font-bold'>過往紀錄</span>
                    </div>
                    <div className='flex flex-row flex-wrap h-[300px] overflow-y-scroll hiddenScrollBar'>
                        <HistoryList />
                    </div>
                </div>
                <div className='mt-3 flex flex-row flex-wrap w-1/4  max-[600px]:w-[50%]' hidden={PieNums===undefined}>
                    <RelicData />
                </div>
                <div className='mt-3 w-1/4 max-[600px]:w-[50%]' hidden={PieNums===undefined}>
                    <StandDetails />
                </div>
                <div className='mt-3 flex flex-row flex-wrap w-1/2 max-[600px]:w-[100%]' id="resultDetails">
                    <Result ExpRate={ExpRate} 
                            Rscore={Rscore} 
                            statusMsg={statusMsg} 
                            Rrank={Rrank} 
                            PieNums={PieNums}/>
                </div>
                
            </div>
        </div>
    
    </>)


}

export default Simulator;

