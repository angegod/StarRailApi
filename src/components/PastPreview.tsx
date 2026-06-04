import React, { useContext, useRef, useState } from 'react';
import '../css/simulator.css';
import SiteContext from '../context/SiteContext';
import Image from 'next/image';
import LazyImage from './LazyImage';
import AffixName from '@/data/AffixName';
import { ImporterHistory } from '@/interface/importer';
import { SimulatorHistory } from '@/interface/simulator';
import { Tooltip } from 'react-tooltip';
import SimulatorHistoryHint from './Hint/SimulatorHistoryHint';
import ImporterHistoryHint from './Hint/ImporterHistoryHint';

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
    const {checkDetails,isChangeAble} = useContext(SiteContext);
    const BaseLink =  `https://enka.network/ui/hsr/SpriteOutput/AvatarRoundIcon/${data.char.charID}.png`;
    const LoadImgLink = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/image/unknown.png`;
    const toolTipId = 'ImporterHistoryDetails'+index;
    
    return(
        <div className={`PastPreview clip-both-corners`}>
            <div className='flex flex-col'
                data-tooltip-id={toolTipId} onClick={isChangeAble?()=>checkDetails(index):undefined}>
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
            <Tooltip
                    id={toolTipId}
                    place='bottom-start'
                    arrowColor='gray' 
                    style={{zIndex:9999}}
                    clickable={true}
                    render={()=>
                        <ImporterHistoryHint index={index} data={data} />
                    } />
        </div>        
    )
});

//簡易瀏覽_模擬器版本
const PastPreview_simulator=React.memo(({data,index}:PastPreview_SimulatorProps)=>{
    const {checkDetails,isChangeAble} = useContext<PastPreviewType>(SiteContext);

    const MainAffix = AffixName.find((a)=>a.name === data.mainaffix)!.icon;

    const BaseLink=`https://enka.network/ui/hsr/SpriteOutput/AvatarRoundIcon/${data.char.charID}.png`;
    //const MainAffixLink=`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/property/${MainAffix}.png`;
    const LoadImgLink = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/image/unknown.png`;
    

    const toolTipId = 'SimulatorHistoryDetails'+index;
    return(
        <div className='PastPreview clip-both-corners' >
            <div className='flex flex-col justify-center' 
                data-tooltip-id={toolTipId} onClick={isChangeAble?()=>checkDetails(index):undefined}>
                <div className='mx-auto'>
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
            <Tooltip
                    id={toolTipId}
                    place='bottom-start'
                    arrowColor='gray' 
                    style={{zIndex:9999}}
                    clickable={true}
                    render={()=>
                        <SimulatorHistoryHint index={index} data={data} />
                    } />
        </div>
    )
});

export {PastPreview,PastPreview_simulator};