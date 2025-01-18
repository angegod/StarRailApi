import React, { useEffect } from 'react';
import characters from '../data/characters';
import Select from 'react-select';
import AffixName from '../data/AffixName';
import { useState ,useRef} from 'react';
import '../css/simulator.css';
import axios from 'axios';
import Result from './Result';
import { Helmet } from 'react-helmet';
import {useLocation} from 'react-router-dom';
import AffixList from '../data/AffixList';

function Import(){
    //版本序號
    const version="1.0";

    //玩家ID跟腳色ID
    const userID=useRef('');
    const [charID,setCharID]=useState(undefined);

    //部位代碼
    const [partsIndex,setPartsIndex]=useState(undefined);

    //找到的遺器
    const [relic,setRelic]=useState();
    
    //router相關
    const location = useLocation();

    //期望值、儀器分數、評級、圖表資料
    const [ExpRate,setExpRate]=useState(undefined);
    const [Rscore,setRscore]=useState(undefined);
    const [Rrank,setRank]=useState({color:undefined,rank:undefined});
    const [PieNums,setPieNums]=useState(undefined);
    const [historyData,setHistoryData]=useState([]);

    //狀態訊息
    const [statusMsg,setStatusMsg]=useState(undefined);

    //自訂義標準
    const [selfStand,setSelfStand]=useState([]);
    const standDetails=useRef([])

    //元件狀態
    const [isChangeAble,setIsChangeAble]=useState(true);
    const [isSaveAble,setIsSaveAble]=useState(false);
    
    const partArr=['Head 頭部','Hands 手部','Body 軀幹','Feet 腳部','Link Rope 連結繩','Planar Sphere 位面球'];


    useEffect(()=>{
        //初始化歷史紀錄
        initHistory();
    },[location])


    function initHistory(){
        let history=JSON.parse(localStorage.getItem('importData'));
        //先針對過往紀錄作清空
        const today = new Date(); // 當前日期

        if(history===null) return;

        //  過濾三天的紀錄
        history = history.filter((h) => {
          if (!h.calDate) return false; // 如果没有 calDate 属性，直接過濾掉
          
          const calDate = new Date(h.calDate); // 將 calDate 轉换为日期对象
          const diffTime = today - calDate; // 計算時間差，單位為毫秒
          const diffDays = diffTime / (1000 * 60 * 60 * 24); // 轉換為天數
          
          return diffDays <= 3; // 保留日期在 3 天内的记录
        });

        //為了避免更新迭代而造成歷史紀錄格式上的問題 
        //必須要核對重大版本代號 如果版本不一致也不予顯示並且刪除
        history=history.filter((h)=>h.version===version);
        localStorage.setItem('importData',JSON.stringify(history));

        if(history != null && history.length > 0){
            setHistoryData(history);
        }
            
    }
    

    //先獲得遺器資料
    async function getRecord(){
        //如果UID本身就不合理 則直接返回錯誤訊息
        if (!/^\d+$/.test(userID.current)||!userID.current) { // 僅允許數字
            alert('The UID is not vaild');
            setStatusMsg('請輸入有效的UID!!');
            return ;
        }

        //腳色相關防呆
        if(!charID){
            alert('請輸入要查詢的腳色');
            setStatusMsg('未選擇任何腳色');
            return ;
        }

        //部位選擇相關防呆
        if(!partsIndex||partsIndex>6||partsIndex<0){
            setStatusMsg('部位沒有選擇成功!!');
            return;
        }


        //如果是連結繩或位面球 則代號交換
        let realPart=partsIndex;
        if(Number(partsIndex)===5)
            realPart=6;
        else if(Number(partsIndex)===6)
            realPart=5;
        
        let apiLink=(window.location.origin==='http://localhost:3000')?`http://localhost:5000/relic/get`:`https://expressapi-o9du.onrender.com/relic/get`;
        
        let sendData={
            uid:userID.current,
            charID:charID,            
            partsIndex:realPart
        }
        //送出之前先清空一次資料
        setIsSaveAble(false);
        setStatusMsg('正在尋找匹配資料......');
        setIsChangeAble(false);
        clearData();

       await axios.post(apiLink,sendData,{
            headers: {
                'Content-Type': 'application/json',
                'Accept-Encoding':'gzip,deflate,br'
            }
        }).then((response)=>{
            console.log(response.data);

            switch(response.data){
                case 800:
                    setStatusMsg('找不到該腳色。必須要將腳色放在展示區才可以抓到資料!!');
                    setIsChangeAble(true);
                    break;
                case 801:
                    setStatusMsg('找不到該部件的遺器，如果是剛剛才更新的話建議等五分鐘再使用一次!!');
                    setIsChangeAble(true);
                    break;
                case 802:
                    setStatusMsg('該遺器等級尚未強化至滿等，請先強化至滿等後再嘗試');
                    setIsChangeAble(true);
                    break;
                case 803:
                    setStatusMsg('該遺器非五星遺器，請選擇部位為五星強化滿等之遺器');
                    setIsChangeAble(true);
                    break;
                default:
                    calscore(response.data);
                    break;
            }

        }).catch((err)=>{
            setStatusMsg('系統正在維護中 請稍後再試!!');
            setIsChangeAble(true);
        })

    
    }

    function clearData(){
        setExpRate(undefined);
        setRank({color:undefined,rank:undefined});
        setPieNums(undefined);
        setRscore(undefined);
        setRelic();
    }

    //檢視過往紀錄
    function checkDetails(index){
        let data=historyData[index];
       
        setRank(data.rank);
        setExpRate(data.expRate);
        setRscore(data.score)
        setStatusMsg('資料替換完畢!!');
        setPieNums(data.pieData);
        setRelic(data.relic);
        standDetails.current=data.stand;

        document.getElementById("resultDetails").scrollIntoView({ behavior: "smooth" });
    }

    //刪除過往紀錄
    function updateHistory(index){
        //如果刪除紀錄是目前顯示的 則會清空目前畫面上的
        let oldHistory=historyData;
        setHistoryData((old)=>old.filter((item,i)=>i!==index));

        oldHistory=oldHistory.filter((item,i)=>i!==index);
        localStorage.setItem('importData',JSON.stringify(oldHistory));
        setStatusMsg('成功刪除該紀錄!!');
    }

    function calscore(relic){
        //將獲得到遺器先儲存起來
        setRelic(relic);

        //將運行結果丟到背景執行
        let worker=new Worker(new URL('../worker/worker.js', import.meta.url));
        let MainAffix=AffixName.find((a)=>a.fieldName===relic.main_affix.type);
        let SubData=[];

        relic.sub_affix.forEach((s,i)=>{
            let typeName=AffixName.find((a)=>a.fieldName===s.type);
            let val=Number(s.display.split('%')[0]);

            let data={
                index:i, 
                subaffix:typeName.name  ,
                data:val, //詞條數值
                count:s.count-1//強化次數
            }

            SubData.push(data);
        })
        
        let postData={
            charID:charID,
            MainData:MainAffix.name,
            SubData:SubData,
            partsIndex:partsIndex,
            standard:selfStand
        };
        
        setStatusMsg('數據計算處理中......');

        worker.postMessage(postData);

        // 接收 Worker 返回的訊息
        worker.onmessage = function (event) {
            
            //輸入相關數據
            setExpRate(event.data.expRate);
            setRscore(event.data.relicscore)
            setStatusMsg('計算完畢!!');
            setPieNums(event.data.returnData);
            setRank(event.data.relicrank);
            standDetails.current=selfStand;

            //將儲存按鈕設為可用
            setIsSaveAble(true);
            setIsChangeAble(true);
            document.getElementById("resultDetails").scrollIntoView({ behavior: "smooth" });
        };
    }

    //儲存紀錄
    function saveRecord(){
        let partName=partArr[partsIndex-1];
        let selectChar=characters.find((c)=>c.charID===charID);

        //如果原本紀錄超過6個 要先刪除原有紀錄
        if(historyData.length>=6)
            setHistoryData((old)=>old.filter((item,i)=>i!==0));

        //如果當前沒有任何資料則不予匯入
        if(PieNums===undefined||ExpRate===undefined||Rrank===undefined||Rscore===undefined){
            setStatusMsg("當前沒有任何數據，不予儲存!!");
            return;
        }
        //如果玩家ID當前並沒有輸入成功
        if(!userID.current){
            setStatusMsg("沒有輸入玩家ID，請再試一次!!");
            return;
        }
         //如果沒有選擇沒有任何腳色
        if(!charID){
            setStatusMsg("沒有選擇任何腳色!!");
            return;
        }


        let calDate=new Date();
        
        //儲存紀錄
        let data={
            version:version,
            calDate:calDate.toISOString().split('T')[0],
            userID:userID.current,
            char:selectChar,
            part:partName,
            expRate:ExpRate,
            score:Rscore,
            rank:Rrank,
            pieData:PieNums,
            relic:relic,
            stand:standDetails.current
        };
        let oldHistory=historyData;
        console.log(data);
        setHistoryData((old)=>[...old,data]);
        setStatusMsg('已儲存');
        setIsSaveAble(false);
        oldHistory.push(data);
        
        localStorage.setItem('importData',JSON.stringify(oldHistory));
       
    }

    const CharSelect=()=>{
        let options=[];
        
        characters.forEach((c)=>{
            options.push({
                value: c.charID, label: c.name
            })
        })
        const selectedOption = options.find((option) => option.value === charID);
        return(<Select options={options} 
                    className='w-[200px]' 
                    onChange={(option)=>{setCharID(option.value);setIsSaveAble(false);}}
                    value={selectedOption} 
                    isDisabled={!isChangeAble}/>)
    }

    //部位選擇器
    const PartSelect=()=>{
        let options=[<option value={'undefined'} key={'PartsUndefined'}>請選擇</option>];

        partArr.forEach((a,i)=>{
            options.push(
                <option value={i+1} key={`PartSelect${i}`} >{a}</option>       
            )
        })

        return(
            <select value={partsIndex} 
                    onChange={(event)=>{setPartsIndex(event.target.value);setIsSaveAble(false);}}
                    disabled={!isChangeAble}>{options}</select>
        )
    }

    //自訂義有效詞條種類
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
                options.push(<>
                    <option value={a} key={'Affix'+i} >{a}</option>       
                </>)
            });

            return(
                <>
                    <div className='flex flex-col'>
                        <div className='flex flex-row flex-wrap'>
                            <select value={selectAffix} 
                                onChange={(event)=>{setAffix(event.target.value)}}
                                disabled={!isChangeAble} className='mr-1'>{options}</select>
                            <div className='max-[520px]:mt-1 '>
                                <button className='processBtn' onClick={addAffix}>添加</button>
                                <button className='deleteBtn ml-1' onClick={clearAffix}>清空</button>
                            </div>
                        </div>
                    </div>
                </>
            )
        }else{
            return(<></>)
        }

    }

    //顯示儀器分數區間
    const RelicData=()=>{
        if(relic!==undefined){

            const list=[];

            relic.sub_affix.forEach((s)=>{
                list.push(
                    <div className='flex flex-row' key={'Subaffix_'+s.name}>
                        <span className='text-white text-left flex w-[70px]'>{s.name}</span>
                        <span className='flex w-[70px]'>:<span className='ml-2 text-white '>{s.display}</span></span>
                    </div>
                    
                )
            })
            
            
            return(
                <div className={`w-[100%] min-w-[400px] mb-5 border-t-4 border-gray-600 my-2 pt-2 
                    ${(statusMsg!==undefined)?'':'hidden'} max-[500px]:min-w-[330px]`}>
                    <div>
                        <span className='text-red-600 text-lg font-bold'>遺器資訊</span>
                    </div>
                    <div>
                        <span>套裝:</span><br/>
                        <span className='text-white'>{relic.set_name}</span>
                    </div>
                    <div className='mt-1'>
                        <span>主詞條</span><br/>
                        <span className='text-white'>{relic.main_affix.name}:{relic.main_affix.display}</span>   
                    </div>
                    <div className='mt-2'>
                        <span>副詞條</span>
                        <div className='flex flex-col w-[150px]'>
                            {list}
                        </div>
                    </div>
                </div>
            )
        }else{
            return(<></>)
        }
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

        return(<>
            <div className='flex flex-col'>
                {list}
            </div>
        </>)
    }
    
    //顯示你輸出的標準為何?
    const StandDetails=()=>{
        if(standDetails.current!==undefined){
            const list=standDetails.current.map((s)=>
                <div className='flex flex-row' key={'StandDetails_'+s.name}>
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

    //簡易瀏覽
    const PastPreview=React.memo(({index})=>{
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
                        <span className='text-white'>玩家UID:{data.userID}</span>
                    </div>
                    <div>
                        <span className='text-white'>部位:{data.part}</span>
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
    });

    return(<>
        <div className='flex flex-col w-4/5 mx-auto'>
             <Helmet>
                <title>崩鐵--遺器匯入</title>
                <meta name="description" content="崩鐵--遺器匯入" />
                <meta name="keywords" content="遺器強化、遺器強化模擬器" />
            </Helmet>
            <h1 className='text-red-500 font-bold text-2xl'>遺器匯入</h1>
            <div className='flex flex-row flex-wrap'>
                <div className='flex flex-col w-1/2 max-[600px]:w-[100%]'>
                    <div className='flex flex-row [&>*]:mr-2 my-3'>
                        <div className='text-right w-[200px] max-[600px]:max-w-[150px]'><span className='text-white'>玩家UID :</span></div>
                        <input type='text' placeholder='HSR UID' className='h-[40px] w-[200px] rounded-md pl-2' 
                                id="userId"
                                onChange={(e)=>userID.current=e.target.value}
                                disabled={!isChangeAble}/>
                    </div>
                    <div className='flex flex-row [&>*]:mr-2 my-3'>
                        <div className='text-right w-[200px] max-[600px]:max-w-[150px]'><span className='text-white'>Characters 腳色:</span></div>
                        <CharSelect />
                    </div>
                    <div className={`mt-2 [&>*]:mr-2 flex flex-row`}>
                        <div className='text-right w-[200px] max-[600px]:max-w-[150px]'><span className='text-white'>Parts 部位:</span></div>
                        <PartSelect key={"partSelect"}/>   
                    </div>
                    <div className={`mt-2 [&>*]:mr-2 flex flex-row`} hidden={partsIndex===undefined}>
                        <div className='text-right w-[200px] max-[600px]:max-w-[150px]'><span className='text-white'>Affix 有效詞條:</span></div>
                        <StandardSelect />
                    </div>
                    <div className={`mt-2 [&>*]:mr-2 flex flex-row`} hidden={selfStand.length===0}>
                        <div className='text-right w-[200px] max-[600px]:max-w-[150px]'><span className='text-white'>Params 參數:</span></div>
                        <ShowStand />
                    </div>
                    <div className='my-3 flex flex-row [&>*]:mr-2 justify-end max-w-[400px]'>
                        <button className='processBtn' onClick={getRecord}  disabled={!isChangeAble}>開始匹配</button>
                        <button className='processBtn' onClick={saveRecord} disabled={!isSaveAble}>儲存紀錄</button>
                    </div>
                    
                </div>
                <div className='w-1/2 max-w-[400px] flex flex-col max-[600px]:w-[100%] max-[600px]:mt-3'>
                    <h2 className='text-red-600 font-bold text-lg'>使用說明</h2>
                    <ul className='[&>li]:text-white list-decimal [&>li]:ml-2'>
                        <li>此工具會根據放在展示框的腳色做遺器數據分析，讓玩家可以比較方便查看自己的腳色數據</li>
                        <li>此工具是計算該遺器依據您的標準持有的有效詞條數量</li>
                        <li>翻盤機率是指該遺器透過重洗詞條道具後遺器分數變高的機率為何</li>
                        <li>目前遺器只支援計算五星強化至滿等遺器</li>
                        <li>此工具目前處於BETA階段，相關數據仍有更改的可能</li>
                        <li>聲明:此工具相關程式邏輯均為本人Ange完成</li>
                    </ul>
                </div>
            </div>
            <div className={`${(historyData.length===0)?'hidden':''} flex-wrap max-[930px]:w-[100%] border-t-4
                border-gray-600 p-2 my-4 `}
                    id="historyData">
                    <div>
                        <span className='text-red-500 text-lg font-bold'>過往紀錄</span>
                    </div>
                    <div className='h-[300px] overflow-y-scroll hiddenScrollBar flex flex-row max-[600px]:!flex-col'>
                        {historyData.map((item,i)=>
                            <PastPreview index={i} key={'ImportData'+i}/>
                        )}
                    </div>
                </div>
            <div className='flex flex-row flex-wrap w-[100%]' >
                <div className='mt-3 flex flex-row flex-wrap w-1/4  max-[600px]:w-[50%]' hidden={PieNums===undefined}>
                    <RelicData />
                </div>
                <div className='mt-3 w-1/4 max-[600px]:w-[50%]' hidden={PieNums===undefined}>
                    <StandDetails />
                </div>
                <div className='mt-3 flex flex-row flex-wrap w-1/2 max-[600px]:w-[100%]' hidden={statusMsg===undefined}
                    id="resultDetails">
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

export default Import;
