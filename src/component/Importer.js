import React from 'react';
import characters from '../data/characters';
import Select from 'react-select';
import AffixName from '../data/AffixName';
import { useState ,useRef} from 'react';
import '../css/simulator.css';
import axios from 'axios';
import Result from './Result';

function Import(){
    const userID=useRef('');
    const [statusMsg,setStatusMsg]=useState(undefined);
    const [charID,setCharID]=useState(undefined);
    const [partsIndex,setPartsIndex]=useState(undefined);

    const [ExpRate,setExpRate]=useState(undefined);
    const [Rscore,setRscore]=useState(undefined);
    const [Rrank,setRank]=useState({color:undefined,rank:undefined});
    const [PieNums,setPieNums]=useState(undefined);
    const [historyData,setHistoryData]=useState([]);
    const partArr=['Head 頭部','Hands 手部','Body 軀幹','Feet 腳部','Link Rope 連結繩','Planar Sphere 位面球'];

    //先獲得遺器資料
    async function getRecord(){
        //如果UID本身就不合理 則直接返回錯誤訊息
        if (!/^\d+$/.test(userID.current)||userID.current===undefined) { // 僅允許數字
            alert('The UID is not vaild');
            setStatusMsg('請輸入有效的UID!!');
            return ;
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
        setStatusMsg('正在尋找匹配資料!!');
        clearData();

       await axios.post(apiLink,sendData,{
            headers: {
                'Content-Type': 'application/json',
                'Accept-Encoding':'gzip,deflate,br'
            }
        }).then((response)=>{
            console.log(response.data);
            //setRelic(response.data);
            // 'Connection':'keep-alive',
            //'Accept': 'application/json',
            if(response.data===800)
                setStatusMsg('找不到該腳色。必須要將腳色放在展示區才可以抓到資料!!');
            else if(response.data===801)
                setStatusMsg('找不到該部件的遺器，如果是剛剛才更新的話建議等五分鐘再使用一次!!');
            else
                calscore(response.data);
        })

    
    }

    function clearData(){
        setExpRate(undefined);
        setRank({color:undefined,rank:undefined});
        setPieNums(undefined);
        setRscore(undefined);
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
    }

    //刪除過往紀錄
    function updateHistory(index){
        //如果刪除紀錄是目前顯示的 則會清空目前畫面上的
        setHistoryData((old)=>old.filter((item,i)=>i!==index));
        setStatusMsg('成功刪除該紀錄!!');
    }

    function calscore(relic){
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
            partsIndex:partsIndex
        };
        setStatusMsg('數據計算處理中!!');
        console.log(postData);
        worker.postMessage(postData);

        // 接收 Worker 返回的訊息
        worker.onmessage = function (event) {
            console.log(event.data);
            setExpRate(event.data.expRate);
            setRscore(event.data.relicscore)
            setStatusMsg('計算完畢!!');
            setPieNums(event.data.returnData);
            setRank(event.data.relicrank);
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

        //儲存紀錄
        let data={
            char:selectChar,
            part:partName,
            expRate:ExpRate,
            score:Rscore,
            rank:Rrank,
            pieData:PieNums
        };
        setHistoryData((old)=>[...old,data]);
      
        setStatusMsg('已儲存');
        /*const targetElement = document.getElementById('historyData');
        targetElement.scrollIntoView({ behavior: 'smooth' });*/
        
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
                    onChange={(option)=>setCharID(option.value)}
                    value={selectedOption} />)
    }

    //部位選擇器
    const PartSelect=()=>{
        
        let options=[<option value={'undefined'} key={'PartsUndefined'}>請選擇</option>];

        partArr.forEach((a,i)=>{
            options.push(<>
                <option value={i+1} key={'Parts'+i} >{a}</option>       
            </>)
        })

        return(
            <select value={partsIndex} onChange={(event)=>setPartsIndex(event.target.value)}>{options}</select>
        )
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
                        <span className='text-white'>玩家UID:{userID.current}</span>
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
            <div className='flex flex-row [&>*]:mr-2 my-3'>
                <div className='text-right w-[200px] max-[600px]:max-w-[150px]'><span className='text-white'>玩家UID :</span></div>
                <input type='text' placeholder='HSR UID' className='h-[40px] w-[200px] rounded-md pl-2' 
                        id="userId"
                        onChange={(e)=>userID.current=e.target.value}/>
            </div>
            <div className='flex flex-row [&>*]:mr-2 my-3'>
                <div className='text-right w-[200px] max-[600px]:max-w-[150px]'><span className='text-white'>Characters 腳色:</span></div>
                <CharSelect />
            </div>
            <div className={`mt-2 [&>*]:mr-2 flex flex-row`}>
                <div className='text-right w-[200px] max-[600px]:max-w-[150px]'><span className='text-white'>Parts 部位:</span></div>
                <PartSelect />   
            </div>
            <div className='my-3 flex flex-row [&>*]:mr-2'>
                <div className='text-right w-[200px] max-[600px]:max-w-[150px]'></div>
                <button className='processBtn' onClick={getRecord}>開始匹配</button>
                <button className='processBtn' onClick={saveRecord}>儲存紀錄</button>
            </div>
            <div className={`mt-3 flex flex-row flex-wrap`}>
                <Result ExpRate={ExpRate} 
                        Rscore={Rscore} 
                        statusMsg={statusMsg} 
                        Rrank={Rrank} 
                        PieNums={PieNums}/>
                <div className={`${(historyData.length===0)?'hidden':''} w-[45%] border-t-4 border-yellow-600 p-2 my-2`}
                    id="historyData">
                    <div>
                        <span className='text-red-500 text-lg font-bold'>過往紀錄</span>
                    </div>
                    <div className='flex flex-row flex-wrap h-[300px] overflow-y-scroll'>
                        {historyData.map((item,i)=>
                            <PastPreview index={i} />
                        )}
                    </div>
                </div>
            </div>

        </div>
    </>)
}

export default Import;
