import React, { Component,useCallback,useContext,useMemo } from 'react';
import {PastPreview, PastPreview_simulator} from './PastPreview';
import SiteContext from '../context/SiteContext';
import Link from 'next/link';
const PastPreviewList=React.memo(()=>{
    const {historyData}=useContext(SiteContext);
    console.log(process.env.NEXT_PUBLIC_BASE_PATH);
    let introPath = ( process.env.NODE_ENV ==='production')?`..${process.env.NEXT_PUBLIC_BASE_PATH}/`:'../'
    introPath = introPath +'/intro';

    if(historyData.length===0){
        const renderList=historyData.map((item,i)=>{
            return(
                <PastPreview    index={i}
                                data={item}
                                key={'history' + i} />
            )
        })
        
        return <>{renderList}</>;
    }else{
        return (
            <div className='flex flex-col'>
                <span className='text-stone-300'>這裡沒有任何操作過的紀錄!!</span>
                <span className='text-stone-300'>如果是初次使用的話不妨看看下面簡單的Q&A，能夠更加了解系統</span>
                <div className='justify-start py-1'>
                    <Link href={introPath} className='text-center'>
                            <button className='linedHref'>&rarr;點我了解</button>
                    </Link>
                </div>
            </div>
        )
    }
});


//歷史紀錄清單
const PastPreviewList_simulator=React.memo(()=>{
    const {historyData} = useContext(SiteContext);
    let introPath = ( process.env.NODE_ENV ==='production')?`..${process.env.NEXT_PUBLIC_BASE_PATH}/`:'../'
    introPath = introPath +'/intro';


    if(historyData&&historyData.length>0){
        return(
            historyData.map((item,i)=>
                <PastPreview_simulator 
                            index={i} 
                            data={item}    
                            context={SiteContext}
                            key={'historyData'+i}/>
            )
        )
    }else{
        return (
                <div className='flex flex-col'>
                    <span className='text-stone-300'>這裡沒有任何操作過的紀錄!!</span>
                    <span className='text-stone-300'>如果是初次使用的話不妨看看下面簡單的Q&A，能夠更加了解系統</span>
                    <div className='justify-start py-1'>
                        <Link href={introPath} className='text-center'>
                             <button className='linedHref'>&rarr;點我了解</button>
                        </Link>
                    </div>
                </div> 
        )
    }
});


export {PastPreviewList,PastPreviewList_simulator};