import React, { useEffect } from 'react';
import characters from '../data/characters';
import Select from 'react-select';
import AffixName from '../data/AffixName';
import { useState ,useRef,useCallback ,useMemo} from 'react';
import '../css/simulator.css';
import axios from 'axios';
import Result from './Result';
import Enchant from './Enchant';
import { Helmet } from 'react-helmet';
import {useLocation} from 'react-router-dom';
import AffixList from '../data/AffixList';

function Import(){
    //版本序號
    const version="1.3";

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
    const memoizedHistoryData = useMemo(() => historyData, [JSON.stringify(historyData)]);

    //狀態訊息
    const [statusMsg,setStatusMsg]=useState(undefined);

    //自訂義標準
    const [selfStand,setSelfStand]=useState([]);
    const standDetails=useRef([]);

    //模擬強化相關數據
    const [simulatorData,setSimulatorData]=useState({});

    //元件狀態
    const [isChangeAble,setIsChangeAble]=useState(true);
    const [isSaveAble,setIsSaveAble]=useState(false);
    
    const partArr=['Head 頭部','Hand 手部','Body 軀幹','Feet 腳部','Rope 連結繩','Ball 位面球'];


    useEffect(()=>{

        //初始化歷史紀錄
        initHistory();
    },[location.pathname])


    function initHistory(){
        let history=JSON.parse(localStorage.getItem('importData'));
        //先針對過往紀錄作清空

        if(history===null) return;

        //為了避免更新迭代而造成歷史紀錄格式上的問題 
        //必須要核對重大版本代號 如果版本不一致也不予顯示並且刪除
        history=history.filter((h)=>h.version===version);
        localStorage.setItem('importData',JSON.stringify(history));

        if(history != null && history.length > 0){
            setHistoryData(prev=>prev !== history ? history : prev);
            console.log(history);
            setStatusMsg('先前紀錄已匯入!!');
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
                'Content-Type': 'application/json'
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
                case 810:
                    alert('溝通次數太過於頻繁 請稍後再試!!');
                    break;
                default:
                    calscore(response.data);
                    break;
            }

        }).catch((error)=>{
            console.log(error);
            if(error.response){
                if(error.response.status===429){
                    setStatusMsg('請求次數過於頻繁，請稍後再試!!');
                }else{
                    setStatusMsg('系統正在維護中 請稍後再試!!');
                }
            }else{
                setStatusMsg('發生錯誤請稍後再試!!');    
            }
            
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
       
        setRank(prev => prev !== data.rank ? data.rank : prev);
        setExpRate(prev => prev !== data.expRate ? data.expRate : prev);
        setRscore(prev => prev !== data.score ? data.score : prev);
        setPieNums(prev => prev !== data.pieData ? data.pieData : prev);
        setRelic(prev => prev !== data.relic ? data.relic : prev);

        //清空模擬強化紀錄
        setSimulatorData({});

        setStatusMsg('資料替換完畢!!');
        standDetails.current=data.stand;

        //避免第一次顯示區塊 而導致滾動失常
        requestAnimationFrame(()=>{
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
        });
    }

    //刪除過往紀錄
    function updateHistory(index){
        //如果刪除紀錄是目前顯示的 則會清空目前畫面上的
        let oldHistory=historyData;
        setHistoryData((old)=>old.filter((item,i)=>i!==index));

        oldHistory=oldHistory.filter((item,i)=>i!==index);
        localStorage.setItem('importData',JSON.stringify(oldHistory));
        //強制觸發刷新紀錄
        setStatusMsg('正在處理中.....');
        setTimeout(() => {
            setStatusMsg('成功刪除該紀錄!!');
        }, 0);
    }

    function calscore(relic){
        let isCheck=true;
        //將獲得到遺器先儲存起來
        setRelic(relic);

        //將運行結果丟到背景執行
        let worker=new Worker(new URL('../worker/worker.js', import.meta.url));
        let MainAffix=AffixName.find((a)=>a.fieldName===relic.main_affix.type);
        let SubData=[];

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
            charID:charID,
            MainData:MainAffix.name,
            SubData:SubData,
            partsIndex:partsIndex,
            standard:selfStand,
            deviation:0.5
        };
        
        if(isCheck){
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
        
        //將送出按鈕設為可用
        setIsChangeAble(true);
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
        //console.log(data);
        setHistoryData((old)=>[...old,data]);
        setStatusMsg('已儲存');
        setIsSaveAble(false);
        oldHistory.push(data);
        
        localStorage.setItem('importData',JSON.stringify(oldHistory));
       
    }

    //模擬強化
    function simulate(){
        let isCheck=true;

        //將運行結果丟到背景執行 跟模擬所有組合的worker分開
        let worker=new Worker(new URL('../worker/worker2.js', import.meta.url));
        let MainAffix=AffixName.find((a)=>a.fieldName===relic.main_affix.type);
        let SubData=[];

        relic.sub_affix.forEach((s,i)=>{
            let typeName=AffixName.find((a)=>a.fieldName===s.type);
            let val=(!typeName.percent)?Number(s.value.toFixed(1)):Number((s.value*100).toFixed(1));
            
            //如果val是字串(百分比) 則將其去除 並轉換成整數
            //val = typeof val === 'string' && val.includes('%') ? Number(val.replace('%', '')) : Number(val);
            let data={
                index:i, 
                subaffix:typeName.name,
                data:val, //詞條數值    
                count:s.count-1//強化次數
            }

            SubData.push(data);
        });

        console.log(SubData);

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
            partsIndex:(relic.type===5)?relic.type=6:(relic.type===6)?relic.type=5:relic.type=relic.type,
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

    const CharSelect=()=>{
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
                    onChange={(event)=>{
                        if(event.target.value==='undefined')
                            setPartsIndex(undefined)
                        else{
                            setPartsIndex(event.target.value);setIsSaveAble(false);
                        }

                    }}
                    disabled={!isChangeAble} className='h-[25px] w-[150px] graySelect'>{options}</select>
        )
    }

    //自訂義有效詞條種類
    const StandardSelect=()=>{
        const [selectAffix,setAffix]=useState(undefined);
        
        //添加標準 目前設定先不超過六個有效 且不重複
        function addAffix(){
            //如果為預設選項則不予選擇
            if(selectAffix===undefined)
                return;
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
            mergedArray=mergedArray.filter((item)=>item!=='生命值'&&item!=='攻擊力'&&item!=='防禦力')

            let options=[<option value={'undefined'} key={'PartsUndefined'}>請選擇</option>];

            //如果該標準已被選擇 會顯示勾選圖示於左側選項中
            mergedArray.forEach((m,i)=>{
                options.push(
                    <option value={m} key={'Affix'+i} title={m} 
                        className='w-[160px] whitespace-pre'>
                            <span className='inline-block w-[20px]'>{(selfStand.find((s)=>s.name===m))?'\u2714 ':'\u2003'}</span>
                            <span>{m}</span>
                    </option>);
            });

            return(
                    <div className='flex flex-col'>
                        <div className='flex flex-row flex-wrap items-baseline'>
                            <select value={selectAffix}
                                title='選擇標準' 
                                onChange={(event)=>{setAffix(event.target.value)}}
                                disabled={!isChangeAble} className='mr-1 h-[25px] w-[120px] graySelect'>{options}</select>
                            <div className='max-[520px]:mt-1 ml-1'>
                                <button className='processBtn px-1' onClick={addAffix} disabled={!isChangeAble}>添加</button>
                                <button className='deleteBtn ml-2 px-1' onClick={clearAffix} disabled={!isChangeAble}>清空</button>
                            </div>
                        </div>
                    </div>
            )
        }else{
            return(<></>)
        }

    }

    //顯示儀器分數區間
    const RelicData=()=>{
        if(relic!==undefined){

            const mainaffixImglink=AffixName.find((a)=>a.name===relic.main_affix.name).icon;

            const mainaffixImg=<img src={`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/property/${mainaffixImglink}.png`} width={24} height={24}/>

            const list=[];
            relic.sub_affix.forEach((s)=>{
                let markcolor="";
                let isBold=(standDetails.current.find((st)=>st.name===s.name)!==undefined)?true:false;
                
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
                <div className={`w-[100%] mb-5 border-t-4 border-gray-600 my-2 pt-2 
                    ${(statusMsg!==undefined)?'':'hidden'} max-[500px]:w-[330px] max-[400px]:w-[100%]`}>
                    <div>
                        <span className='text-red-600 text-lg font-bold'>遺器資訊</span>
                    </div>
                    <div>
                        <span>套裝:</span><br/>
                        <span className='text-white'>{relic.set_name}</span>
                    </div>
                    <div className='mt-1 flex flex-col'>
                        <span>部位</span>
                        <div className='flex flex-row'>
                            <span className='text-white'>{partArr[relic.type-1]}</span>   
                        </div>
                    </div>
                    <div className='mt-1'>
                        <span>主詞條</span><br/>
                        <div className='flex flex-row'>
                            {mainaffixImg}
                            <span className='text-white'>{relic.main_affix.name}:{relic.main_affix.display}</span>
                        </div>
                           
                    </div>
                    <div className='mt-2'>
                        <span>副詞條</span>
                        <div className='flex flex-col w-[190px]'>
                            {list}
                        </div>
                    </div>
                    <div className='mt-3'>
                        <button className='processBtn' onClick={simulate}   disabled={!isChangeAble}>重洗模擬</button>
                    </div>
                </div>
            )
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
            <div className='flex flex-row'>
                <div className='flex justify-between w-[170px] max-w-[300px] mt-0.5 mr-2 max-[400px]:w-[70%]'>
                    <img src={imglink} alt="icon" width={24} height={24}/>
                    <span className='whitespace-nowrap overflow-hidden  text-ellipsis text-left w-[100px] ' title={s.name}>{s.name}</span>
                    <input type='number' min={0} max={1} 
                        className='ml-2 text-center max-h-[30px] 
                        min-w-[40px] bgInput' 
                        defaultValue={selfStand[i].value}
                        title='最小值為0 最大為1'
                        onChange={(event)=>changeVal(i,event.target.value)}/>
                    
                </div>
                <button onClick={()=>removeAffix(i)} className='deleteBtn px-1 whitespace-nowrap' disabled={!isChangeAble}>移除</button>
            </div>)
        })

        function removeAffix(index){
            setSelfStand((arr)=>arr.filter((item,i)=>i!==index));
        }

        function changeVal(index,val){
            if(val>1||val<0){
                val=1;
                setStatusMsg('加權指數不可高於1或低於0!')
            }

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
            const list=standDetails.current.map((s)=>{
                var IconName = AffixName.find((a)=>a.name===s.name).icon;

                var imglink=`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/property/${IconName}.png`;
                
                
                return(
                    <div className='flex flex-row' key={'StandDetails_'+s.name}>
                        <div className='flex justify-between w-[15vw] min-w-[150px] mt-0.5'>
                            <div className='flex flex-row'>
                                <img src={imglink} alt="icon" width={24} height={24}/>
                                <span>{s.name}</span>
                            </div>
                            <span>{s.value}</span>
                        </div>
                    </div>
                )
            })

            return(<>
                <div className={`w-[100%] mb-5 border-t-4 border-gray-600 my-2 pt-2 
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
        let data=memoizedHistoryData[index];

        //let isBold=(standDetails.current.find((st)=>st.name===data.name)!==undefined)?true:false;
        const hue = data.expRate * 120;
        
        const textColor =`hsl(${hue}, 100%, 50%)`;
       

        let BaseLink=`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/character/${data.char.charID}.png`;

        return(
            <div className='flex flex-row flex-wrap w-[300px] max-h-[120px] bg-slate-700 rounded-md p-2 m-2 max-[400px]:w-[95%] max-[400px]:!flex-nowrap'>
                <div className='flex flex-col mr-3'>
                    <div>
                        <img src={BaseLink} alt='iconChar' className='w-[70px] rounded-[50px] max-[400px]:min-w-[50px] max-[400px]:w-[50px]'/>
                    </div>
                    <div className='text-center'>
                        <span style={{color:data.rank.color}} className='font-bold text-xl max-[400px]:text-lg'>{data.score}</span>
                    </div>
                </div>
                <div className='flex flex-col'>
                    <div className='flex flex-row [&>span]:text-white justify-start '>
                        <span className='w-[70px] max-[400px]:w-[60px] break-keep'>玩家UID:</span>
                        <span className='pl-1'>{data.userID}</span>
                    </div>
                    <div className='flex flex-row [&>span]:text-white justify-start [&>span]:max-[400px]:text-sm'>
                        <span className='w-[70px] max-[400px]:w-[60px] break-keep'>部位:</span>
                        <span className='pl-1'>{data.part}</span>
                    </div>
                    <div className='flex flex-row [&>span]:text-white justify-start [&>span]:max-[400px]:text-sm'>
                        <span className='w-[70px] max-[400px]:w-[60px] break-keep'>期望機率:</span>
                        <span style={{color:textColor}} className='pl-1 font-bold'>{(data.expRate*100).toFixed(1)}%</span>
                    </div>
                    <div className='[&>button]:max-[400px]:text-sm'>
                        <button className='processBtn mr-2 px-1' onClick={()=>checkDetails(index)} disabled={!isChangeAble}>檢視</button>
                        <button className='deleteBtn px-1' onClick={()=>updateHistory(index)} disabled={!isChangeAble}>刪除</button>
                    </div>
                </div>
            </div>
        
        )
    },(prev,next)=>{
        return prev.index === next.index; // 只有 value1 改變才重新渲染
    });

    const PastPreviewList = React.memo(({ historyData }) => {
    
        // 使用 useCallback 確保每個 index 不會因為 map 重新執行而變動
        const renderItem = useCallback((item, i) => (
            <PastPreview index={i} key={'history' + i} />
        ), [historyData]);
    
        return <>{historyData.map(renderItem)}</>;
    }, (prev, next) => {
        return JSON.stringify(prev.historyData) === JSON.stringify(next.historyData); // 只有 historyData 改變才重新渲染
    });
    

    return(<>
        <div className='flex flex-col w-4/5 mx-auto max-[600px]:w-[90%]'>
             <Helmet>
                <title>崩鐵--遺器重洗匯入</title>
                <meta name="description" content="崩鐵--遺器重洗匯入" />
                <meta name="keywords" content="遺器重洗、遺器重洗模擬器" />
            </Helmet>
            <h1 className='text-red-500 font-bold text-2xl'>遺器匯入</h1>
            <div className='flex flex-row flex-wrap '>
                <div className='flex flex-col w-1/2 max-[900px]:w-[100%]'>
                    <div className='flex flex-row [&>*]:mr-2 my-3 items-baseline max-[400px]:!flex-col'>
                        <div className='text-right w-[200px] max-[400px]:text-left max-[600px]:w-[120px]'><span className='text-white'>玩家UID :</span></div>
                        <input type='text' placeholder='HSR UID' 
                                className='h-[40px] max-w-[170px] pl-2 
                                        bg-inherit text-white outline-none border-b border-white' 
                                id="userId"
                                onChange={(e)=>userID.current=e.target.value}
                                disabled={!isChangeAble}/>
                    </div>
                    <div className='flex flex-row [&>*]:mr-2 my-3 max-[400px]:!flex-col'>
                        <div className='text-right w-[200px]  max-[400px]:text-left max-[600px]:w-[120px]'>
                            <span className='text-white whitespace-nowrap'>Characters 腳色:</span>
                        </div>
                        <CharSelect />
                    </div>
                    <div className={`mt-2 [&>*]:mr-2 flex flex-row max-[400px]:!flex-col`}>
                        <div className='text-right w-[200px]  max-[400px]:text-left max-[600px]:w-[120px]'><span className='text-white'>Parts 部位:</span></div>
                        <PartSelect key={"partSelect"}/>   
                    </div>
                    <div className={`mt-4 [&>*]:mr-2 flex flex-row items-baseline max-[400px]:!flex-col ${(partsIndex===undefined)?'hidden':''}`} >
                        <div className='text-right w-[200px]  max-[400px]:text-left max-[600px]:w-[120px]'>
                            <span className='text-white whitespace-nowrap'>Affix 有效詞條:</span>
                        </div>
                        <StandardSelect />
                    </div>
                    <div className={`mt-2 [&>*]:mr-2 flex flex-row max-[400px]:!flex-col ${(selfStand.length===0)?'hidden':''}`}>
                        <div className='text-right w-[200px] max-[400px]:text-left max-[600px]:w-[120px]'>
                            <span className='text-white'>Params 參數:</span>
                        </div>
                        <ShowStand />
                    </div>
                    <div className='my-3 flex flex-row [&>*]:mr-2 justify-end max-w-[400px] max-[400px]:justify-start'>
                        <button className='processBtn' onClick={getRecord}  disabled={!isChangeAble}>開始匹配</button>
                        <button className='processBtn' onClick={saveRecord} disabled={!isSaveAble}>儲存紀錄</button>
                    </div>
                    
                </div>
                <div className='w-1/2 max-w-[400px] flex flex-col max-[900px]:w-[100%] max-[600px]:my-3'>
                    <h2 className='text-red-600 font-bold text-lg'>使用說明</h2>
                    <ul className='[&>li]:text-white list-decimal [&>li]:ml-2 max-[400px]:[&>li]:text-sm'>
                        <li>此工具會根據放在展示框的腳色做遺器數據分析，讓玩家可以比較方便查看自己的腳色數據</li>
                        <li>翻盤機率是指該遺器透過重洗詞條道具後遺器分數變高的機率為何</li>
                        <li>目前遺器只支援計算五星強化至滿等遺器</li>
                        <li>此工具相關數據仍有更改的可能，敬請見諒!</li>
                        <li>操作說明可以參考
                        <a href='https://home.gamer.com.tw/artwork.php?sn=6065608' className='!underline'>這篇</a></li>
                    </ul>
                </div>
            </div>
            <div className={`${(historyData.length===0)?'hidden':''} flex-wrap max-[930px]:w-[100%] border-t-4
                border-gray-600 p-2 my-4 `}
                    id="historyData">
                <div>
                    <span className='text-red-500 text-lg font-bold'>過往紀錄</span>
                </div>
                <div className='h-[300px] overflow-y-scroll hiddenScrollBar flex flex-row flex-wrap max-[600px]:!flex-col max-[600px]:!flex-nowrap'>
                    <PastPreviewList historyData={memoizedHistoryData} />
                </div>
                    
            </div>
            <div className='flex flex-row flex-wrap w-[100%]' >
                <div className={`mt-3 flex flex-row flex-wrap w-1/4  max-[700px]:w-[50%] ${(PieNums===undefined)?'hidden':''} max-[400px]:w-[90%]`}>
                    <RelicData />
                </div>
                <div className={`mt-3 w-1/4 max-[700px]:w-[50%] ${(PieNums===undefined)?'hidden':''} max-[400px]:w-[90%]`} >
                    <StandDetails />
                </div>
                <div className={`mt-3 flex flex-row flex-wrap w-1/2 max-[700px]:w-[100%] ${(statusMsg===undefined)?'hidden':''}`} 
                    id="resultDetails">
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

export default Import;
