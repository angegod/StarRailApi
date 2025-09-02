"use client";
import React, { useEffect, useReducer , createContext } from 'react';
import characters from '../../data/characters';
import AffixName from '../../data/AffixName';
import { useState ,useRef,useCallback } from 'react';
import '../../css/simulator.css';
import axios from 'axios';
import { Tooltip } from 'react-tooltip'
import { usePathname } from 'next/navigation';

import {PastPreviewList} from '@/components/PastPreviewList';
import Result from '@/components/Result';
import { StandDetails, ShowStand } from '@/components/StandDetails';
import { RelicData } from '@/components/RelicData';
import { StandardSelect,   CharSelect ,RelicSelect } from '@/components/Select';

import SiteContext from '@/context/SiteContext';
import { useStatusToast } from '@/context/StatusMsg';
import { useSelector, useDispatch } from 'react-redux';
import { createHistory,addHistory,limitHistory,deleteHistory,updateHistory, resetHistory } from '../../model/historySlice';
import { openWindow } from '@/model/updateDetailsSlice';

import HintHistory from '@/components/Hint/HintHistory';
import HintImporter from '@/components/Hint/HintImporter';
import HintAffixLock from '@/components/Hint/HintAffixLock';
import { dataArrItem, ImporterHistory, ImporterRelicSubDataType, ImportRelic, sendDataType } from '@/interface/importer';
import { AffixItem, characterItem, PieNumsItem, relicRank, selfStand, standDetails } from '@/interface/global';
import { RootState } from '@/model/reducer';


function Importer(){
    //版本序號
    const version="1.5";
    const maxHistoryLength = 6;
    const LocalStorageLocation = "importData";

    //玩家ID跟腳色ID
    //const userID=useRef('');
    const [userID,setUserId]=useState<string>('');
    const [charID,setCharID]=useState<number>();

    //部位代碼
    const partsIndex=7;

    //找到的遺器陣列以及目前檢視索引，預設為0
    const [relic,setRelic]=useState<ImportRelic|null>();
    const [relicIndex,setRelicIndex] = useState<number>(0);
    

    //期望值、儀器分數、評級、圖表資料
    const [ExpRate,setExpRate]=useState<number|undefined>(undefined);
    const [Rscore,setRscore]=useState<string|undefined>(undefined);
    const [Rrank,setRank]=useState<relicRank|null>(null);
    const [PieNums,setPieNums]=useState<PieNumsItem[]|undefined>(undefined);

    // 找到所有遺器後計算的所有數據，包含期望值、分數等
    const [RelicDataArr,setRelicDataArr]=useState<dataArrItem[]>([]);
    const RelicDataArrRef = useRef<dataArrItem[]>(null);
    
    // 共用statusMsg
    const {showStatus,updateStatus,hideStatus}=useStatusToast();

    const dispatch = useDispatch();
    const historyData = useSelector((state:RootState) => state.history.historyData);
    const [isLoad,setIsLoad] = useState<boolean>(false);

    //自訂義標準
    const [selfStand,setSelfStand]=useState<selfStand>([]);
    const standDetails=useRef<standDetails>([]);

    //鎖定功能是否啟用
    const [Lock,setLock]=useState<boolean>(false);
    const isLock = useRef<boolean>(false);

    //router相關
    const pathname = usePathname();

    //元件狀態
    const [isChangeAble,setIsChangeAble]=useState<boolean>(true);
    const [isSaveAble,setIsSaveAble]=useState<boolean>(false);
    
    const partArr=['Head 頭部','Hand 手部','Body 軀幹','Feet 腳部','Ball 位面球','Rope 連結繩'];

    //評級標準
    const scoreStand=[
        {rank:'S+',stand:85,color:'rgb(239, 68, 68)',tag:'S+'},
        {rank:'S',stand:70,color:'rgb(239, 68, 68)',tag:'S'},
        {rank:'A',stand:50,color:'rgb(234, 179, 8)',tag:'A'},
        {rank:'B',stand:35,color:'rgb(234, 88 , 12)',tag:'B'},
        {rank:'C',stand:15,color:'rgb(163, 230, 53)',tag:'C'},
        {rank:'D',stand:0 ,color:'rgb(22,163,74)',tag:'D'}
    ];

    
    useEffect(()=>{
        //初始化歷史紀錄
        initHistory();
    },[pathname]);

    //當遺器資料更新時
    useEffect(()=>{
        if(RelicDataArr.length !==0&&RelicDataArr[relicIndex].relic){
            //顯示第一個儀器
            setRelic(RelicDataArr[relicIndex].relic)
            setExpRate(RelicDataArr[relicIndex].ExpRate);
            setRscore(RelicDataArr[relicIndex].Rscore)
            setPieNums(RelicDataArr[relicIndex].PieNums);
            setRank(RelicDataArr[relicIndex].Rank);

            standDetails.current=RelicDataArr[relicIndex].standDetails;
            //還原至初始狀態
            setIsChangeAble(true);
        }
    },[RelicDataArr,relicIndex]);

    //當遺器被選擇時
    useEffect(()=>{
        if(relic){
            requestAnimationFrame(()=>{
                window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'smooth'
                });
            });
        }
    },[relic]);

    //當使用者UID或者腳色有變更時不予儲存
    useEffect(()=>{
        setIsSaveAble(false);
    },[charID,userID])


    function initHistory(){
        //標記歷史紀錄尚未處理完
        setIsLoad(false);

        //清空redux儲存的歷史紀錄
        dispatch(resetHistory());

        let getHistory=localStorage.getItem(LocalStorageLocation);
        if(getHistory===null){
            updateStatus("尚未有任何操作紀錄!!","default");
            setIsLoad(true);
            return;
        }

        let history:ImporterHistory[] = JSON.parse(getHistory);

        showStatus('正在載入過往紀錄中.....','process');
        
        //為了避免更新迭代而造成歷史紀錄格式上的問題 
        //必須要核對重大版本代號 如果版本不一致也不予顯示並且刪除
        history=history.filter((h)=>h.version===version);
        localStorage.setItem(LocalStorageLocation,JSON.stringify(history));

        if(history != null && history.length > 0){
            dispatch(createHistory(history));
            updateStatus("先前紀錄已匯入!!","success");
        }else{
            updateStatus("尚未有任何操作紀錄","default");
        }
        setIsLoad(true);
        
    }
    

    //獲得遺器資料
    async function getRecord(sendData:sendDataType|undefined = undefined ,standard:selfStand|undefined = undefined){
        
        let apiLink=(window.location.origin==='http://localhost:3000')?`http://localhost:5000/relic/get`:`https://expressapi-o9du.onrender.com/relic/get`;

        //如果是非更新紀錄
        if(!sendData){
            //如果UID本身就不合理 則直接返回錯誤訊息
            if (!/^\d+$/.test(userID)||!userID) { // 僅允許數字
                updateStatus("請輸入有效的UID!!",'error');
                return ;
            }

            //腳色相關防呆
            if(!charID){
                updateStatus("未選擇任何腳色!!",'error');
                return ;
            }

            if(!selfStand||selfStand.length ===0){
                updateStatus("至少選擇一項加權!!",'error');
                return ;
            }

            sendData={
                uid:userID,
                charID:charID,            
                partsIndex:7
            }
        }

        if(!standard)
            standard = selfStand;

        //送出之前先清空一次資料
        setIsSaveAble(false);
        showStatus('正在尋找匹配資料......','process');
        setIsChangeAble(false);
        clearData();

        await axios.post(apiLink,sendData,{
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(async (response)=>{
            switch(response.data){
                case 800:
                    updateStatus('找不到該腳色。必須要將腳色放在展示區才可以抓到資料!!','error');
                    setIsChangeAble(true);
                    break;
                case 801:
                    updateStatus('找不到該部件的遺器，如果是剛剛才更新的話建議等五分鐘再使用一次!!','error');
                    setIsChangeAble(true);
                    break;
                case 802:
                    updateStatus('該遺器等級尚未強化至滿等，請先強化至滿等後再嘗試!','error');
                    setIsChangeAble(true);
                    break;
                case 803:
                    updateStatus('該遺器非五星遺器，請選擇部位為五星強化滿等之遺器','error');
                    setIsChangeAble(true);
                    break;
                case 804:
                    updateStatus('該腳色並未穿著五星遺器！！','error');
                    setIsChangeAble(true);
                    break;
                case 810:
                    updateStatus('溝通次數太過於頻繁 請稍後再試!!','error');
                    setIsChangeAble(true);
                    break;
                case 900:
                    updateStatus('系統正在維護\n請稍後再試!','error');
                    setIsChangeAble(true);
                    break;
                default:
                    await process(response.data,standard);
                    break;
            }

        }).catch((error)=>{
            console.log(error);
            if(error.response){
                if(error.response.status===429){
                    updateStatus('請求次數過於頻繁\n請稍後再試!!','error');
                }else{
                    updateStatus('系統正在維護中\n請稍後再試!!','error');
                }
            }else{   
                updateStatus('系統正在維護中\n請稍後再試!!','error');
            }
            
            setIsChangeAble(true);
            return;
        })
    }

    //流程
    const process=useCallback(async(relicArr:ImportRelic[],standard:selfStand)=>{
        let temparr:dataArrItem[] = [];
        //檢查加權標準
        /*standard.forEach((s)=>{
            if(s.value===''){
                updateStatus('加權指數不可為空或其他非法型式','error');
                return;
            }
        });*/

        for (const r of relicArr) {
            const ExpData = await calscore(r,standard) as dataArrItem;  // 等這個做完
            
            temparr.push(ExpData);
        }
        
        setRelicIndex(0);
        setRelicDataArr(temparr);
        setIsSaveAble(true);
        RelicDataArrRef.current = temparr;
        isLock.current = Lock;
        //如果是剛查詢完的 則改成可以儲存
        updateStatus('資料顯示完畢',"success");
       
    },[RelicDataArr,isSaveAble,Lock])

    //刪除紀錄
    function clearData(){
        setExpRate(undefined);
        setRank(null);
        setPieNums(undefined);
        setRscore(undefined);
        setRelic(null);
    }

    //檢視過往紀錄
    const checkDetails=useCallback((index:number)=>{
        let data=historyData[index] as ImporterHistory;
        isLock.current = data.isLock;
        setRelicDataArr([...data.dataArr]);
        setRelicIndex(0);
        setIsSaveAble(false); 

        updateStatus("資料替換完畢!!",'success');

        //避免第一次顯示區塊 而導致滾動失常
        requestAnimationFrame(()=>{
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
        });
    },[historyData]);

    //更新紀錄
    const updateDetails=useCallback(async (index:number)=>{
        showStatus('正在更新資料中......','process');
        let originData = JSON.parse(JSON.stringify(historyData));
        let data = originData[index] as ImporterHistory;

        let sendData:sendDataType={
            uid:data.userID,
            charID:data.char.charID,            
            partsIndex:7
        };

        let cloneDetails = data.dataArr[0].standDetails.map(item => ({ ...item }));

        await getRecord(sendData,cloneDetails).then(()=>{
            //計算平均分數與平均機率

            if(RelicDataArrRef.current){
                let sum = 0;
                let sum2 = 0;

                RelicDataArrRef.current.forEach((r)=>{
                    sum +=Number(r.Rscore);
                    sum2 += Number(r.ExpRate);
                });
                let avgScore = parseFloat((sum / RelicDataArrRef.current.length).toFixed(1));
                let calDate=new Date();
                let avgRank:relicRank|undefined = undefined;
                let avgRate = Number((sum2*100/RelicDataArrRef.current.length).toFixed(1));
                
                scoreStand.forEach((stand)=>{
                    //接著去找尋這個分數所屬的區間
                    if(stand.stand<=avgScore&&avgRank===undefined)
                        avgRank=stand;
                });

                //儲存紀錄
                let newHistorydata:ImporterHistory={
                    version:version,
                    calDate:calDate.toISOString().split('T')[0],
                    userID:data.userID,
                    char:data.char,
                    dataArr:RelicDataArrRef.current,
                    avgScore:avgScore,
                    avgRank:avgRank!,
                    avgRate:avgRate,
                    isLock:data.isLock
                };

                dispatch(updateHistory({ index: index, newData: newHistorydata }));
                updateStatus('已更新','success');
                setIsSaveAble(false);
                let oldHistory=JSON.parse(JSON.stringify(historyData));
                oldHistory[index]=newHistorydata;
                localStorage.setItem(LocalStorageLocation,JSON.stringify(oldHistory));
            }
      
        }).catch((error)=>{
            console.error("錯誤發生：", error);             // 原始錯誤物件
            console.error("錯誤訊息：", error.message);     // 錯誤文字
            console.error("堆疊追蹤：", error.stack);       // 🔥 鎖定發生行數
        });
            
    },[historyData]);

    //刪除過往紀錄 
    const deleteHistoryData=useCallback((index:number)=>{
        //如果刪除紀錄是目前顯示的 則會清空目前畫面上的
        let oldHistory=historyData as ImporterHistory[];
        dispatch(deleteHistory(index));

        oldHistory=oldHistory.filter((item,i)=>i!==index);
        localStorage.setItem(LocalStorageLocation,JSON.stringify(oldHistory));
        //強制觸發刷新紀錄

        setTimeout(() => {
            updateStatus('成功刪除該筆資料','success');
        }, 0);
    },[historyData]);

    //計算遺器分數
    function calscore(relic:ImportRelic,standard:selfStand){
        return new Promise((resolve)=>{
            let isCheck=true;

            //將運行結果丟到背景執行
            let worker=new Worker(new URL('../../worker/worker.ts', import.meta.url));
            let MainAffix=AffixName.find((a)=>a.fieldName===relic.main_affix.type) as AffixItem;

            //從遺器資料提取副詞條並根據是否鎖定標註鎖定詞條
            let SubData=[] as ImporterRelicSubDataType[];
            relic.sub_affix.forEach((s,i:number)=>{
                let typeName=AffixName.find((a)=>a.fieldName===s.type)!;
                let val=(!typeName.percent)?Number(s.value.toFixed(1)):Number((s.value*100).toFixed(1));
                //每個詞條的加權 如果找不到則為0
                let stand = standard.find((st)=>st.name===typeName.name);
                
                let data={
                    index:i, 
                    subaffix:typeName.name,
                    data:val, //詞條數值    
                    count:s.count-1,//強化次數
                    stand:(!stand)?0:stand.value,
                    locked:false
                }

                SubData.push(data);
            });
            if(Lock){
                // 找出stand最小的詞條
                let LockAffix = SubData.reduce((min, curr) => curr.stand < min.stand ? curr : min);

                // 設定該詞條lock為true
                LockAffix.locked = true;
            }

            
            //如果篩選有速度詞條 需給予0.5誤差計算 
            let deviation = SubData.some(s => s.subaffix === '速度')
                ? 0.5 * (selfStand.find(s => s.name === '速度')?.value ?? 0)
                : 0;


            SubData.forEach(s=>{
                if(s.subaffix!=='速度'&&s.count!==0)//如果有其他無法判斷初始詞條的 一律給0.2誤差
                    deviation+=0.2;
            });

            //制定送出資料格式
            let postData={
                charID:charID,
                MainData:MainAffix.name,
                SubData:SubData,
                partsIndex:relic.type,
                standard:standard,
                deviation:Number(deviation.toFixed(2))
            };

            if(isCheck){
                showStatus('數據計算處理中......','process');
                worker.postMessage(postData);

                // 接收 Worker 返回的訊息
                worker.onmessage = function (event) {
                    let returnData = {
                        relic:relic,
                        ExpRate:event.data.expRate,
                        Rscore:event.data.relicscore,
                        PieNums:event.data.returnData,
                        Rank:event.data.relicrank,
                        standDetails:standard,
                        affixLock:Lock
                    };
                    resolve(returnData);
                };
            }
        })
        
    }

    //儲存紀錄
    function saveRecord(){
        let selectChar=characters.find((c)=>c.charID===charID) as characterItem;

        //如果原本紀錄超過6個 要先刪除原有紀錄
        if(historyData.length>=maxHistoryLength)
            dispatch(limitHistory());

        //如果當前沒有任何資料則不予匯入
        if(RelicDataArr.length === 0){
            updateStatus("當前沒有任何數據，不予儲存!!",'error');
            return;
        }
        //如果玩家ID當前並沒有輸入成功
        if(!userID){
            updateStatus("沒有輸入玩家ID，請再試一次!!","error");
            return;
        }
         //如果沒有選擇沒有任何腳色
        if(!charID){
            updateStatus("沒有選擇任何腳色!!","error");
            return;
        }

        //計算平均分數與平均機率
        let sum = 0;
        let sum2 = 0;
        RelicDataArr.forEach((r)=>{
            sum +=Number(r.Rscore);
            sum2 += Number(r.ExpRate);
        });
        let avgScore = parseFloat((sum / RelicDataArr.length).toFixed(1));
        let calDate=new Date();
        let avgRank:relicRank|undefined = undefined;
        let avgRate = Number((sum2*100/RelicDataArr.length).toFixed(1));
        
        scoreStand.forEach((stand)=>{
            //接著去找尋這個分數所屬的區間
            if(stand.stand<=avgScore&&avgRank===undefined)
                avgRank=stand;
        });


        //儲存紀錄
        let data:ImporterHistory={
            version:version,
            calDate:calDate.toISOString().split('T')[0],
            userID:userID,
            char:selectChar,
            dataArr:RelicDataArr,
            avgScore:avgScore,
            avgRank:avgRank!,
            avgRate:avgRate,
            isLock:isLock.current
        };

        //針對原紀錄做深拷貝
        let oldHistory=JSON.parse(JSON.stringify(historyData));
        
        dispatch(addHistory(data));
        oldHistory.push(data);
        updateStatus('已儲存','success');
        setIsSaveAble(false);

        //覆蓋原有紀錄
        localStorage.setItem(LocalStorageLocation,JSON.stringify(oldHistory));
    }
    
    //共用context狀態
    let ImporterStatus={
        //數值資料
        charID:charID,
        selfStand:selfStand,
        partsIndex:partsIndex,
        standDetails:standDetails.current,
        partArr:partArr,
        historyData:historyData,
        isChangeAble:isChangeAble,
        RelicDataArr:RelicDataArr,
        affixLock:isLock.current,
        isLoad:isLoad,
        mode:"Importer",
        relicDataButton:true,
        
        //RelicData
        relic:relic,
        Rscore:Rscore,
        Rrank:Rrank,
        ExpRate:ExpRate,
        PieNums:PieNums,
        relicIndex:relicIndex,
  
        //方法
        deleteHistoryData:deleteHistoryData,
        checkDetails:checkDetails,
        updateDetails:updateDetails,

        //state管理
        setCharID:setCharID,
        setSelfStand:setSelfStand,
        setIsSaveAble:setIsSaveAble,
        setRelicIndex:setRelicIndex,
        setRelic:setRelic
    }
    
    return(
    <SiteContext.Provider value={ImporterStatus}>
        <div className='flex flex-col w-4/5 mx-auto max-[600px]:w-[95%] rounded-md '>
            <div className='rounded-md'>
                <div className='flex flex-row flex-wrap max-[600px]:w-[95%] '>
                    <div className='flex flex-col w-2/5 bg-black/50 rounded-md max-[1250px]:w-full test'>
                        <div className='flex flex-row items-center ml-2 mt-2'>
                            <h1 className='text-red-600 font-bold text-2xl'>遺器匯入</h1>
                            <div className='hintIcon ml-2 overflow-visible' 
                                data-tooltip-id="ImporterHint">
                                <span className='text-white'>?</span>
                            </div>
                            <div className='relative ml-auto mr-3' onClick={()=>dispatch(openWindow())}>
                                <span className='text-white underline cursor-pointer'>最新更新</span>
                            </div>
                        </div>
                        <div className='flex flex-col px-2 rounded-md'>
                            <div className='flex flex-row [&>*]:mr-2 my-3 items-baseline max-[400px]:!flex-col'>
                                <div className='text-right w-[200px] max-[400px]:text-left max-[600px]:w-[120px]'><span className='text-white'>玩家UID :</span></div>
                                <input type='text' placeholder='HSR UID' 
                                        className='h-[40px] max-w-[170px] pl-2 
                                                bg-inherit text-white outline-none border-b border-white' 
                                        id="userId"
                                        onChange={(e)=>setUserId(e.target.value)}
                                        disabled={!isChangeAble}/>
                            </div>
                            <div className='flex flex-row items-center [&>*]:mr-2 my-3 max-[400px]:!flex-col '>
                                <div className='text-right w-[200px]  max-[400px]:text-left max-[600px]:w-[120px]'>
                                    <span className='text-white whitespace-nowrap'>Characters 腳色:</span>
                                </div>                       
                                <div className='flex flex-row items-center'>
                                    <CharSelect  />
                                    <div className='hintIcon ml-1 overflow-visible' data-tooltip-id="CharHint">
                                        <span className='text-white'>?</span>
                                    </div>
                                </div>
                            </div>
                            <div className={`mt-4 [&>*]:mr-2 flex flex-row items-baseline max-[400px]:!flex-col` } >
                                <div className='text-right w-[200px]  max-[400px]:text-left max-[600px]:w-[120px]'>
                                    <span className='text-white whitespace-nowrap'>Affix 有效詞條:</span>
                                </div>
                                <div className='flex flex-row items-center'>
                                    <StandardSelect />
                                </div>
                            </div>
                            <div className={`mt-4 [&>*]:mr-2 flex flex-row items-baseline max-[400px]:!flex-col` } >
                                <div className='text-right w-[200px]  max-[400px]:text-left max-[600px]:w-[120px]'>
                                    <span className='text-white whitespace-nowrap'>Lock 是否鎖定:</span>
                                </div>
                                <div className='flex flex-row items-center'>
                                    <button className='bg-gray-400 text-black rounded-sm px-2 font-bold' onClick={() => setLock(prev => !prev)}>
                                        {Lock ? "啟用" : "不啟用"}
                                    </button>
                                    <div className='hintIcon ml-2 overflow-visible'
                                        data-tooltip-id="AffixLockHint"> 
                                        <span className='text-white'>?</span>
                                    </div>
                                </div>
                            </div>
                            <div className={`mt-2 [&>*]:mr-2 flex flex-row max-[400px]:!flex-col ${(selfStand.length===0)?'hidden':''}`}>
                                <div className='text-right w-[200px] max-[400px]:text-left max-[600px]:w-[120px]'>
                                    <span className='text-white'>Params 參數:</span>
                                </div>
                                <ShowStand />
                            </div>
                            <div className='my-3 flex flex-row [&>*]:mr-2 justify-end max-w-[400px] max-[900px]:justify-center'>
                                <button className='processBtn' onClick={()=>getRecord()}  disabled={!isChangeAble}>開始匹配</button>
                                <button className='processBtn' onClick={()=>saveRecord()} disabled={!isSaveAble}>儲存紀錄</button>
                            </div>
                            
                        </div>
                    </div>
                    <div className={`w-[55%] pb-3 pt-1 h-fit flex-wrap max-[1250px]:w-full max-[1250px]:mb-5 ml-2 bg-black/50 rounded-md max-[1250px]:ml-0 max-[1250px]:mt-2`}>
                        <div className='flex flex-row items-center px-2 max-[600px]:justify-center'>
                            <span className='text-red-600 text-lg font-bold'>過往紀錄</span>
                            <div className='hintIcon ml-2 overflow-visible'
                                data-tooltip-id="HistoryHint">
                                <span className='text-white'>?</span>
                            </div>
                        </div>
                        <div className='max-h-[300px] overflow-y-scroll p-2  hiddenScrollBar flex flex-row flex-wrap max-[600px]:!flex-col max-[600px]:!flex-nowrap max-[600px]:items-center'>
                            <PastPreviewList  />
                        </div> 
                    </div>
                </div>
            </div>
            {
                (PieNums)?
                <div className={`flex flex-row flex-wrap mt-2 w-full bg-black/50 shadowBox px-2 mb-5 rounded-md`} >
                    <div className={`w-full max-[500px]:justify-center`}>
                        <RelicSelect />
                    </div>
                    <div className={`mt-3 flex flex-row flex-wrap w-1/4  max-[700px]:w-[50%] max-[500px]:w-4/5 max-[500px]:mx-auto`}>
                        <RelicData />
                    </div>
                    <div className={`mt-3 w-1/4 max-[700px]:w-[50%] max-[500px]:w-4/5 max-[500px]:mx-auto`} >
                        <StandDetails />
                    </div>
                    <div className={`mt-3 flex flex-row flex-wrap w-1/2 max-[700px]:w-full max-[500px]:w-4/5 max-[500px]:mx-auto`} id="resultDetails">
                        <Result />
                    </div>
                </div>:null
            }
        </div>
        <div>
            <Tooltip id="CharHint"  
                    place="right-start" 
                    render={()=>
                        <div className='flex flex-col'>
                            <span className='text-white'>選擇指定腳色，可以使用中文或英文關鍵字</span>
                            <span className='text-white'>例如:Jingliu&rarr;鏡流</span>
                        </div>
                    }/>
            <Tooltip id="HistoryHint"  
                    place="top-start"
                    render={()=>
                        <HintHistory />
                    }/>
            <Tooltip id="RelicSelectHint"  
                    place="top-start"
                    render={()=>
                        <div className='flex flex-col [&>span]:text-white max-w-[250px] p-1'>
                            <span>下方會顯示出該腳色符合條件的所有遺器</span>
                            <span>點選遺器即可查看個別資訊</span>
                            <span className='!text-red-600 font-bold'>僅顯示符合條件的五星滿等遺器遺器</span>
                        </div>
                    }/>
            <Tooltip id="ImporterHint" 
                    place='right-start'
                    render={()=><HintImporter/>}
                    clickable={true}/>
            <Tooltip id="AffixLockHint"
                    place='right-start'
                    render={()=><HintAffixLock />} />
        </div>
            
    </SiteContext.Provider>)
}




export default Importer;
