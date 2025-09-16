import React, { useContext, useRef, useState } from 'react';
import '../css/simulator.css';
import SiteContext from '../context/SiteContext';
import Image from 'next/image';
import LazyImage from './LazyImage';
import AffixName from '@/data/AffixName';
import { ImporterHistory } from '@/interface/importer';
import { SimulatorHistory } from '@/interface/simulator';
import ProcessBtn from './ProcessBtn';

interface PastPreviewType{
    checkDetails:(index:number)=>void,
    updateDetails:(index:number)=>void,
    deleteHistoryData:(index:number)=>void,
    isChangeAble:Boolean
}

interface PastPreviewProps{
    index:number,
    data:ImporterHistory
}

interface PastPreview_SimulatorProps{
    index:number,
    data:SimulatorHistory
}

//簡易瀏覽
const PastPreview=React.memo(({index,data}:PastPreviewProps)=>{
    const {checkDetails,updateDetails,deleteHistoryData,isChangeAble} = useContext<PastPreviewType>(SiteContext);
    const BaseLink =  `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/character/${data.char.charID}.png`;
    const LoadImgLink = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/image/unknown.png`;

    const bgColor =`hsl(${(data.avgRate/100)*120}, 100%, 50%)`;

    const isLock =data.isLock;

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
                    <span style={{color:data.avgRank.color}} className='font-bold text-xl max-[400px]:text-lg'>{data.avgScore.toFixed(1)}</span>
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
                    {
                        (isLock)?
                        <Image 
                            src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/image/lock.svg`}
                            alt="Logo"
                            width={20}
                            height={20}/>:null
                    }
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
const PastPreview_simulator=React.memo(({data,index}:PastPreview_SimulatorProps)=>{
    const {checkDetails,deleteHistoryData,isChangeAble} = useContext<PastPreviewType>(SiteContext);
    const hue = data.expRate * 120;
    const textColor =`hsl(${hue}, 100%, 50%)`;

    const MainAffix = AffixName.find((a)=>a.name === data.mainaffix)!.icon;
    const isLock = data.isLock;

    const BaseLink=`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/character/${data.char.charID}.png`;
    const MainAffixLink=`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/property/${MainAffix}.png`;
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
                    <span style={{color:data.rank.color}} className='font-bold text-xl'>{Number(data.score).toFixed(1)}</span>
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
                    {
                        (isLock)?
                        <Image 
                            src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/image/lock.svg`}
                            alt="Logo"
                            width={20}
                            height={20}/>:null
                    }
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


function formatRelativeDate(dateString: string): string {
    const date: Date = new Date(dateString);
    const now: Date = new Date();

    const diffMs: number = now.getTime() - date.getTime();
    const diffDays: number = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours: number = Math.floor(diffMs / (1000 * 60 * 60));

    let relative: string = "";
    if (diffDays === 0) {
        relative = "今天";
    } else if (diffDays === 1) {
        relative = "昨天";
    } else {
        relative = `${diffDays} 天前`;
    }

    // 格式化日期 → YYYY/MM/DD
    const formattedDate: string = `${date.getFullYear()}/${
        String(date.getMonth() + 1).padStart(2, "0")
    }/${String(date.getDate()).padStart(2, "0")}`;

    // 如果你要回傳相對時間 + 格式化日期可以這樣：
    // return `${relative} (${formattedDate})`;

    // 如果只回傳格式化日期
    return formattedDate;
}


export {PastPreview,PastPreview_simulator};