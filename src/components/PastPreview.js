import React, { useContext, useRef, useState } from 'react';
import '../css/simulator.css';
import SiteContext from '../context/SiteContext';
import Image from 'next/image';
import LazyImage from './LazyImage';
import AffixList from '@/data/AffixList';
import AffixName from '@/data/AffixName';


//簡易瀏覽
const PastPreview=React.memo(({index,data})=>{
    const {checkDetails,updateDetails,deleteHistoryData,isChangeAble} = useContext(SiteContext);
    const hue = data.expRate * 120;
    const BaseLink =  `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/character/${data.char.charID}.png`;
    const LoadImgLink = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/image/unknown.png`;

    const bgColor =`hsl(${(data.avgRate/100)*120}, 100%, 50%)`;

    return(
        <div className={`PastPreview clip-both-corners`}>
            <div className='flex flex-col'>
                <LazyImage 
                    BaseLink={BaseLink} 
                    LoadImg={LoadImgLink}
                    width={70}
                    height={70}
                    style={`w-[70px] rounded-[50px] max-[400px]:min-w-[50px] max-[400px]:w-[50px]`}/>
                <div className='text-center'>
                    <span style={{color:data.avgRank.color}} className='font-bold text-xl max-[400px]:text-lg'>{data.avgScore}</span>
                </div>
            </div>
            <div className={`flex flex-col mx-1 min-w-[200px] max-[900px]:min-w-[150px]`} >
                <div className='flex flex-row justify-start [&>span]:max-[400px]:text-sm'>
                    <span className='w-[70px] max-[400px]:w-[60px] break-keep text-stone-400 font-bold'>查詢時間:</span>
                    <span className='pl-1 text-white'>{formatRelativeDate(data.calDate)}</span>
                </div>
                <div className='flex flex-row justify-start [&>span]:max-[400px]:text-sm'>
                    <span className='w-[70px] max-[400px]:w-[60px] break-keep text-stone-400 font-bold'>玩家UID:</span>
                    <span className='pl-1 text-white'>{data.userID}</span>
                </div>
                <div className='flex flex-row justify-start [&>span]:max-[400px]:text-sm'>
                    <span className='w-[70px] max-[400px]:w-[60px] break-keep text-stone-400 font-bold'>平均期望:</span>
                    <span className='pl-1 font-bold text-white' style={{color:bgColor}}>{data.avgRate}%</span>
                </div>
                <div className='[&>button]:max-[400px]:text-sm flex flex-row max-[400px]:justify-evenly'>
                    <button className='processBtn mr-2 px-1' onClick={()=>checkDetails(index)} disabled={!isChangeAble}>檢視</button>
                    <button className='processBtn mr-2 px-1' onClick={()=>updateDetails(index)} disabled={!isChangeAble}>更新</button>
                    <button className='deleteBtn px-1' onClick={()=>deleteHistoryData(index)} disabled={!isChangeAble}>刪除</button>
                </div>
            </div>
        </div>        
    )
});

//簡易瀏覽_模擬器版本
const PastPreview_simulator=React.memo(({data,index})=>{
    const {checkDetails,deleteHistoryData,isChangeAble} = useContext(SiteContext);
    const hue = data.expRate * 120;
    const textColor =`hsl(${hue}, 100%, 50%)`;
    let BaseLink=`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/character/${data.char.charID}.png`;
    const MainAffix =AffixName.find((a)=>a.name === data.mainaffix).icon;

    let MainAffixLink=`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/property/${MainAffix}.png`;
    const LoadImgLink = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/image/unknown.png`;
    return(
        <div className='PastPreview clip-both-corners'>
            <div className='flex flex-col mr-1'>
                <div>
                    <LazyImage 
                        BaseLink={BaseLink} 
                        LoadImg={LoadImgLink}
                        width={70}
                        height={70}
                        style={`w-[70px] rounded-[50px] max-[400px]:min-w-[50px] max-[400px]:w-[50px]`}/>
                </div>
                <div className='text-center'>
                    <span style={{color:data.rank.color}} className='font-bold text-xl'>{data.score}</span>
                </div>
            </div>
            <div className='flex flex-col min-w-[200px] max-[900px]:min-w-[150px]'>
                <div className='flex justify-start [&>span]:max-[400px]:text-sm'>
                    <span className='w-[60px] max-[400px]:w-[60px] break-keep text-stone-400 font-bold'>部位:</span>
                    <span className='text-white'>{data.part}</span>
                </div>
                <div className='flex justify-start [&>span]:max-[400px]:text-sm'>
                    <span className='w-[60px] max-[400px]:w-[60px] break-keep text-stone-400 font-bold'>主詞條:</span>
                    <div className='flex flex-row'>
                        <img src={MainAffixLink} alt="icon" width={24} height={24} />
                        <span className='w-[110px] text-white whitespace-nowrap overflow-hidden text-ellipsis'
                                title={data.mainaffix}>
                            {data.mainaffix}
                        </span>
                    </div>
                </div>
                <div className='flex justify-start [&>span]:max-[400px]:text-sm'>
                    <span className='w-[60px] max-[400px]:w-[60px] break-keep text-stone-400 font-bold'>機率:</span>
                    <span style={{color:textColor}} className='pl-1 font-bold text-white'>{(data.expRate*100).toFixed(1)}%</span>
                </div>
                <div className='[&>button]:max-[400px]:text-sm'>
                    <button className='processBtn mr-2 px-1' onClick={()=>checkDetails(index)} disabled={!isChangeAble}>檢視</button>
                    <button className='deleteBtn px-1 ' onClick={()=>deleteHistoryData(index)} disabled={!isChangeAble}>刪除</button>
                </div>
            </div>
        </div>
    
    )
});


function formatRelativeDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    let relative = "";
    if (diffDays === 0) {
        relative = "今天";
    } else if (diffDays === 1) {
        relative = "昨天";
    } else {
        relative = `${diffDays} 天前`;
    }

    // 格式化日期 → YYYY/MM/DD
    const formattedDate = `${date.getFullYear()}/${
        String(date.getMonth() + 1).padStart(2, "0")
    }/${String(date.getDate()).padStart(2, "0")}`;

    return `${formattedDate}`;
}


export {PastPreview,PastPreview_simulator};