"use client";
import AffixList from '../../data/AffixList';
import characters from '../../data/characters';
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import '@/css/simulator.css';
import '@/css/intro.css';

import Result from '@/components/Result';
import { StandDetails ,ShowStand } from '@/components/StandDetails';
import { RelicData_simulate as RelicData} from '@/components/RelicData';
import { PastPreviewList_simulator } from '@/components/PastPreviewList';
import { CharSelect,PartSelect,StandardSelect,MainAffixSelect,SubAffixSelect } from '@/components/Select';

import SubAffixHint from '@/components/Hint/SubAffixHint';
import HintSimulator from '@/components/Hint/HintSimulator';
import HintHistory from '@/components/Hint/HintHistory';
import HintAffixLock from '@/components/Hint/HintAffixLock';
import { Tooltip } from 'react-tooltip';

import SiteContext from '@/context/SiteContext';
import { useStatusToast } from '@/context/StatusMsg';
import { useSelector, useDispatch } from 'react-redux';
import { createHistory,addHistory,limitHistory,deleteHistory,resetHistory } from '../../model/historySlice';
import { openWindow } from '@/model/updateDetailsSlice';
import { relicSubData, SimulatorHistory, simulatorRelic } from '@/interface/simulator';
import { characterItem, PieNumsItem, relicRank, selfStand, standDetails } from '@/interface/global';
import { RootState } from '@/model/reducer';



//遺器強化模擬器
function Simulator(){
    //版本代號
    const version="1.5";

    const maxHistoryLength = 6;

    //部位選擇 跟主詞條選擇
    const [partsIndex,setPartsIndex]=useState<number|undefined>(undefined);
    const [MainSelectOptions,setMainSelectOptions]=useState<string>();
    
    const [ExpRate,setExpRate]=useState<number|undefined>(undefined);
    const [Rscore,setRscore]=useState<string|undefined>(undefined);
    const [Rrank,setRank]=useState<relicRank|null>(null);
    const [processBtn,setProcessBtn]=useState<boolean>(true);
    const standDetails=useRef<standDetails>([]);

    //const SubData=useRef([]);
    const [SubData,setSubData]=useState<relicSubData[]>([]);
    const [charID,setCharID]=useState<number|undefined>(undefined);
    const [PieNums,setPieNums]=useState<PieNumsItem[]|undefined>(undefined);  

    //自訂義標準
    const [selfStand,setSelfStand]=useState<selfStand>([]);

    //鎖定功能是否啟用
    const [Lock,setLock]=useState<boolean>(false);
    const isLock = useRef<boolean>(false);

    //共用statusMsg
    const {showStatus,updateStatus,hideStatus}=useStatusToast();

    //找到的遺器
    const [relic,setRelic]=useState<simulatorRelic>();

    //歷史紀錄
    const dispatch = useDispatch();
    const historyData = useSelector((state:RootState) => state.history.historyData);
    const [isLoad,setIsLoad] = useState<boolean>(false);

    //部位
    const partArr=['Head 頭部','Hand 手部','Body 軀幹','Feet 腳部','Ball 位面球','Rope 連結繩'];
    
    //是否可以儲存(防呆用)、是否可以立馬變更
    const [isSaveAble,setIsSaveAble]=useState<boolean>(false);
    const [isChangeAble,setIsChangeAble]=useState<boolean>(true);

    const pathname = usePathname();

    useEffect(()=>{
        init();
    },[pathname]);

    useEffect(() => {
        if(partsIndex!==undefined&&Number.isInteger(partsIndex)){
            const foundRange = AffixList.find(s => s.id === partsIndex);
            if (!foundRange) return;
            let range = foundRange.main;
            const targetAffix = range[0];
            setMainSelectOptions(targetAffix); 
        }
    }, [partsIndex]); 

    //防止資料變更時還要儲存之防呆
    useEffect(()=>{
        setIsSaveAble(false);
    },[partsIndex,charID,MainSelectOptions]);

    function init(){
        //歷史紀錄標記尚未載入
        setIsLoad(false);
        dispatch(resetHistory());

        let tempArr:relicSubData[] = [];
        for(var i=0;i<=3;i++){
            let data={
                index:i, 
                subaffix:'', //詞條種類
                data:0,     //詞條數值
                count:0,    //強化次數
                stand:0,    //加權
                locked:false
            }

            tempArr.push(data);
        }
        setSubData(tempArr);
        
        let localhistory=localStorage.getItem('HistoryData');

        if(!localhistory) {
            updateStatus('尚未有任何操作紀錄!!','default');
            return;
        }
        showStatus('正在載入過往紀錄中......');
        
        //為了避免更新迭代而造成歷史紀錄格式上的問題 
        //必須要核對重大版本代號 如果版本不一致也不予顯示並且刪除
        
        let history:SimulatorHistory[] = JSON.parse(localhistory);
        if(history!=null&&history.length>0){
            history=history.filter((h)=>h.version===version);
            localStorage.setItem('HistoryData',JSON.stringify(history));
            dispatch(createHistory(history));

            updateStatus('先前紀錄已匯入!!','success');
        }else{
            updateStatus('尚未有任何操作紀錄!!','default');
        }

        //標記已經處理歷史紀錄完畢
        setIsLoad(true);
    }

    //刪除過往紀錄
    function deleteHistoryData(index:number){
        //如果刪除紀錄是目前顯示的 則會清空目前畫面上的
        dispatch(deleteHistory(index));
        showStatus('正在處理中......');
        //強制觸發刷新紀錄
        setTimeout(() => {
            updateStatus('成功刪除該紀錄!!','success');
            localStorage.setItem('HistoryData',JSON.stringify(historyData));
        }, 0);
    }
    //清除相關資料
    function clearData(){
        setExpRate(undefined);
        setRank(null);
        setPieNums(undefined);
        setRscore(undefined);
        setRelic(undefined);
    }

    //儲存紀錄
    function saveRecord(){
        let partName=partArr[partsIndex!-1];
        let selectChar=characters.find((c)=>c.charID===charID) as characterItem;

        //如果目前則沒有紀錄 則初始化
        if(!historyData)
            dispatch(createHistory([]));
        else if(historyData.length>=maxHistoryLength)//如果原本紀錄超過6個 要先刪除原有紀錄
            dispatch(limitHistory());
        
        //如果當前沒有任何資料則不予匯入
        if(!PieNums||ExpRate===undefined||!Rrank||Rscore===undefined){
            updateStatus('當前沒有任何數據，不予儲存!!','error');
            return;
        }
         //如果沒有選擇沒有任何腳色
        if(!charID){
            updateStatus("沒有選擇任何腳色!!",'error');
            return;
        }
        
        //將部位資料丟進遺器資料中
        let savedRelic = relic!;
        savedRelic.type = partsIndex!;

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
            relic:relic,
            isLock:isLock.current
        };

        //利用深拷貝區分原有資料
        dispatch(addHistory(data));
        updateStatus("已儲存",'success');
        const targetElement = document.getElementById('historyData');
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
        
        //將歷史紀錄合併至緩存數據中
        localStorage.setItem('HistoryData',JSON.stringify(historyData));
        setIsSaveAble(false);
    }

    //檢視過往紀錄
    function checkDetails(index:number){
        let data=historyData[index] as SimulatorHistory;
        setRank(data.rank);
        setExpRate(data.expRate);
        setRscore(data.score);
        updateStatus('資料替換完畢!!','success');
        setPieNums(data.pieData);
        setRelic(data.relic);
        standDetails.current=data.stand;
        isLock.current=data.isLock;

        requestAnimationFrame(()=>{
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
        })
    }

    //整合並儲存遺器資訊
    function saveRelic(getSubData:relicSubData[]){
        let data={
            main_affix:MainSelectOptions!,
            subaffix:[],
            type:0,
            affixLock:false
        }

        let tempArr = JSON.parse(JSON.stringify(getSubData));

        tempArr.forEach((s:relicSubData)=>{
            if(!['生命值','攻擊力','防禦力','速度'].includes(s.subaffix))
                s.display=s.data.toString()+'%';
            else
                s.display=s.data.toString();
        });

        //這邊複製出去一定得用深拷貝
        data.subaffix=JSON.parse(JSON.stringify(tempArr));
        data.type = partsIndex!;
        data.affixLock = isLock.current;

        setRelic(data);
        setSubData(tempArr);
    }


    //計算遺器分數等細節
    function calScore(){
        //先驗證選擇是否有誤
        //副詞條是否有空值?
        //副詞條是否有跟主詞條重複?

        let errors=false;
        //複製一份Subdata做檢查
        let getSubData:relicSubData[] = JSON.parse(JSON.stringify(SubData));
        if(!charID){
            errors=true;
            updateStatus("沒有選擇任何腳色!!",'error');
            return;
        }

        getSubData.some((s:relicSubData,i:number)=>{
            if(s.subaffix===MainSelectOptions){
                //alert(`第${i+1}個詞條選擇\n副詞條不可選擇與主詞條相同的詞條\n請再重新選擇!!`);
                updateStatus(`第${i+1}個詞條:副詞條不可選擇與主詞條相同的詞條\n請再重新選擇!!`,'error');
                errors=true;
                return true;
            }
            else if(s.subaffix==='undefined'||!s.subaffix){
                updateStatus(`您還有副詞條沒有選擇\n請再重新選擇!!`,'error');
                errors=true;
                return true;
            }
        })

        if(errors) return;
        //輸入的副詞條之間是否重複?
        const seen = new Set();
        for (const obj of getSubData) {
            if (seen.has(obj['subaffix'])) {
                alert(`副詞條之間不可以選擇重複\n請再重新選擇!!`);
                errors=true;
                return;
            }
            seen.add(obj['subaffix']);
        }

        //檢查標準是否合法
        /*selfStand.forEach((s)=>{
            if(s.value===''){
                errors=true;
                alert('加權指數不可為空或其他非法型式');
            }     
        });*/

        if(errors) return;

        //如果篩選有速度詞條 需給予0.5誤差計算 
        let deviation = getSubData.some((s) => s.subaffix === 'spd')
            ? 0.5 * (selfStand.find((s) => s.name === '速度')?.value ?? 0)
            : 0;

        if(Lock){
            getSubData.forEach(s=>{
                if(s.subaffix!=='速度'&&s.count!==0)//如果有其他無法判斷初始詞條的 一律給0.2誤差
                    deviation+=0.2;

                let stand = selfStand.find((st)=>st.name === s.subaffix);
                s.stand = (!stand)?0:stand.value;
            });

            // 找出stand最小的詞條
            let LockAffix = getSubData.reduce((min, curr) => curr.stand < min.stand ? curr : min);

            // 設定該詞條lock為true
            LockAffix.locked = true;
        }else{ //如果現在是不鎖定 則強制取消所有鎖定
            getSubData.forEach((s)=>s.locked = false);
        }
        //將運行結果丟到背景執行
        let worker=new Worker(new URL('../../worker/worker.js', import.meta.url));
        let postData={
            charID:charID,
            MainData:MainSelectOptions,
            SubData:getSubData,
            partsIndex:partsIndex,
            standard:selfStand,
            deviation:deviation
        };

        //將按鈕disable
        setIsSaveAble(false);
        setProcessBtn(false);
        setIsChangeAble(false);
        showStatus('數據計算處理中!!');
        clearData();
        worker.postMessage(postData);

        // 接收 Worker 返回的訊息
        worker.onmessage = function (event) {
            setExpRate(event.data.expRate);
            setRscore(event.data.relicscore)
            updateStatus('計算完畢!!','success');
            setPieNums(event.data.returnData);
            setRank(event.data.relicrank);
            standDetails.current=selfStand;
            isLock.current=Lock;
            saveRelic(getSubData);
            
            
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
        };
    }

    let SimulatorStatus = {
        charID:charID,
        standDetails:standDetails.current,
        partArr:partArr,
        historyData:historyData,
        isChangeAble:isChangeAble,
        selfStand:selfStand,
        partsIndex:partsIndex,
        MainSelectOptions:MainSelectOptions,
        SubData:SubData,
        relic:relic,
        isLoad:isLoad,
        affixLock:isLock.current,
        
        mode:"Simulator",
        relicDataButton:true,
        
        //RelicData for Result
        Rscore:Rscore,
        Rrank:Rrank,
        ExpRate:ExpRate,
        PieNums:PieNums,

        checkDetails:checkDetails,
        deleteHistoryData:deleteHistoryData,

        setSubData:setSubData,
        setCharID:setCharID,
        setIsChangeAble:setIsChangeAble,
        setIsSaveAble:setIsSaveAble,
        setSelfStand:setSelfStand,
        setPartsIndex:setPartsIndex,
        setMainSelectOptions:setMainSelectOptions,
    }
    
    return(
    <SiteContext.Provider value={SimulatorStatus}>
        <div className='w-4/5 mx-auto max-[600px]:w-[90%] flex flex-row flex-wrap'>
            <div className='flex flex-col w-2/5 bg-black/50 p-2 rounded-md max-[1200px]:w-full'>
                <div className='flex flex-row items-center'>
                    <h1 className='text-red-600 font-bold text-2xl'>遺器重洗模擬器</h1>
                    <div className='hintIcon ml-2 overflow-visible'
                        data-tooltip-id="SimulatorHint">
                        <span className='text-white'>?</span>
                    </div>
                    <div className='relative ml-auto mr-3' onClick={()=>dispatch(openWindow())}>
                        <span className='text-white underline cursor-pointer'>最新更新</span>
                    </div>
                </div>
                <div className='flex flex-row flex-wrap'>
                    <div className='flex flex-row flex-wrap w-1/2 max-[1200px]:w-full'>
                        <div className='flex flex-col mt-2'>
                            <div className='flex flex-row [&>*]:mr-2 my-3 items-center max-[400px]:!flex-col max-[400px]:items-start'>
                                <div className='text-right w-[200px] max-[600px]:max-w-[120px] max-[400px]:text-left'>
                                    <span className='text-white'>Characters 腳色:</span>
                                </div>
                                <div className='flex flex-row items-center'>
                                    <CharSelect />
                                    <div className='hintIcon ml-1 overflow-visible'data-tooltip-id="CharHint">
                                        <span className='text-white'>?</span>
                                    </div>
                                </div>
                            </div>
                            <div className={`my-1 mt-2 [&>*]:mr-2 flex flex-row max-[400px]:!flex-col max-[400px]:items-start`}>
                                <div className='text-right w-[200px] max-[600px]:max-w-[120px] max-[400px]:text-left'>
                                    <span className='text-white'>Parts 部位:</span>
                                </div>
                                <div className='flex flex-row items-center'>
                                    <PartSelect />
                                    <div className='hintIcon ml-1 overflow-visible'data-tooltip-id="PartSelectHint">
                                        <span className='text-white'>?</span>
                                    </div>   
                                </div>
                            </div>
                            <div className={`my-1 ${(partsIndex)?'':'hidden'} mt-2 [&>*]:mr-2 flex flex-row max-[400px]:items-start max-[400px]:!flex-col`}>
                                <div className='text-right w-[200px] max-[600px]:max-w-[120px] max-[400px]:text-left'>
                                    <span className='text-white'>Main 主屬性:</span>
                                </div>
                                <div className='flex flex-row items-center'>
                                    <MainAffixSelect />
                                </div>
                            </div>
                            <div className={`my-1 ${(MainSelectOptions!==undefined&&MainSelectOptions!=='undefined'&&partsIndex!==undefined)?'':'hidden'} mt-2 [&>*]:mr-2 flex flex-row max-[600px]:!flex-col max-[600px]:text-center max-[400px]:text-left`}>
                                <div className='text-right w-[200px] max-[600px]:w-full max-[600px]:text-center max-[400px]:text-left'>
                                    <span className='text-white'>SubAffix 副屬性:</span>
                                </div>
                                <div className='flex flex-row items-start justify-center'>
                                    <div className='flex flex-col'>
                                        <SubAffixSelect index={0} />
                                        <SubAffixSelect index={1} />
                                        <SubAffixSelect index={2} />
                                        <SubAffixSelect index={3} />
                                    </div>
                                    <div className='hintIcon ml-1 mt-1 overflow-visible'data-tooltip-id="SubAffixHint">
                                        <span className='text-white'>?</span>
                                    </div>  
                                </div>
                            </div>
                            {
                                (partsIndex)?
                                <div className={`mt-4 [&>*]:mr-2 flex flex-row items-baseline max-[400px]:!flex-col`}>
                                    <div className='text-right w-[200px]  max-[400px]:text-left max-[600px]:w-[120px]'>
                                        <span className='text-white'>Affix 有效詞條:</span>
                                    </div>
                                    <div className='flex flex-row items-center'>
                                        <StandardSelect />
                                    </div>
                                </div>:null
                            }
                            {
                                (selfStand.length!==0)?
                                <div className={`mt-2 [&>*]:mr-2 flex flex-row max-[400px]:!flex-col`} >
                                    <div className='text-right w-[200px] max-[600px]:max-w-[120px] max-[400px]:text-left'>
                                        <span className='text-white'>Params 參數:</span>
                                    </div>
                                    <ShowStand />
                                </div>:null
                            }
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
                            <div className={`${(partsIndex)?'':'hidden'} mt-2 mb-2 max-w-[400px] flex flex-row [&>*]:mr-2 justify-end max-[400px]:justify-start`}>
                                <div className='flex flex-row mt-1'>
                                    <button className='processBtn mr-2 whitespace-nowrap' 
                                        onClick={()=>calScore()} 
                                        disabled={!processBtn}>計算分數</button>
                                    <button className='processBtn mr-2 whitespace-nowrap' 
                                    onClick={()=>saveRecord()} disabled={!isSaveAble}>儲存紀錄</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
            <div className={`w-[55%] ml-2 bg-black/50 rounded-md p-2 h-fit max-[1200px]:w-full max-[1200px]:ml-0 max-[1200px]:mt-2`} id="historyData" >
                <div className='flex flex-row items-baseline px-2 max-[600px]:justify-center'>
                    <span className='text-red-600 text-lg font-bold'>過往紀錄</span>
                    <div className='hintIcon ml-2 overflow-visible'
                        data-tooltip-id="HistoryHint"> 
                        <span className='text-white'>?</span>
                    </div>
                </div>
                <div className='flex flex-row flex-wrap h-max max-h-[300px] overflow-y-scroll hiddenScrollBar max-[600px]:!flex-col max-[600px]:!flex-nowrap max-[600px]:items-center'>
                    <PastPreviewList_simulator />
                </div>
            </div>
            {
                (PieNums)?
                <div className={`flex flex-row my-3 flex-wrap shadowBox bg-black/50 w-full p-2 rounded-md`}>
                    <div className={`w-full flex flex-row flex-wrap`}>
                        <div className={`flex flex-row flex-wrap w-[18vw]  max-[700px]:w-[50%] max-[500px]:w-4/5 max-[500px]:mx-auto`} >
                            <RelicData />
                        </div>
                        <div className={`w-1/4 max-[700px]:w-[50%] max-[500px]:w-4/5 max-[500px]:mx-auto`} >
                            <StandDetails />
                        </div>
                        <div className='flex flex-row flex-wrap w-1/2 max-[700px]:w-full max-[500px]:w-4/5 max-[500px]:mx-auto ' id="resultDetails">
                            <Result />
                        </div>
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
            <Tooltip id="PartSelectHint"  
                    place="right-start" 
                    render={()=>
                        <div className='flex flex-col max-w-[230px]'>
                            <span className='text-white'>選擇遺器部位</span>
                            <span className='text-white'>"主詞條"跟"副詞條"區塊中會自動帶入該部位詞條種類</span>
                        </div>
                    }/>

            <Tooltip id="SubAffixHint"  
                    place="right-start" 
                    render={()=>
                        <SubAffixHint />
                    }/>
            <Tooltip id="HistoryHint"  
                place="top-start"
                render={()=>
                    <HintHistory />
                }/>
            <Tooltip id="SimulatorHint"
                    place='right-start'
                    render={()=><HintSimulator/>}
                    clickable={true}/>
            <Tooltip id="AffixLockHint"
                    place='right-start'
                    render={()=><HintAffixLock/>} />
            
        </div>
    </SiteContext.Provider>)
}




export default Simulator;