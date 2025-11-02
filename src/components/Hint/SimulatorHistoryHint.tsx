import { useContext } from "react";
import SiteContext from "@/context/SiteContext";
import AffixName from "@/data/AffixName";
import { SimulatorHistory } from "@/interface/simulator";
import Image from "next/image";

interface PastPreview_SimulatorProps{
    index:number,
    data:SimulatorHistory
}

function SimulatorHistoryHint({index,data}:PastPreview_SimulatorProps){
    const {checkDetails,deleteHistoryData,isChangeAble} = useContext(SiteContext);


    const hue = data.expRate * 120;
    const textColor =`hsl(${hue}, 100%, 50%)`;
    const MainAffix = AffixName.find((a)=>a.name === data.mainaffix)!.icon;
    const isLock = data.isLock;
    const BaseLink=`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/character/${data.char.charID}.png`;
    const MainAffixLink=`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/property/${MainAffix}.png`;
    const LoadImgLink = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/image/unknown.png`;
    
    return(
        <div className='flex flex-col min-w-[200px] max-[900px]:min-w-[150px]'>
            <div className='flex justify-start [&>span]:max-[400px]:text-sm'>
                <span className='w-[60px] max-[400px]:w-[60px] break-keep text-stone-400 font-bold'>腳色:</span>
                <span className='text-white'>{data.char.name}</span>
            </div>
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
                <button className='deleteBtn px-1 ' onClick={()=>deleteHistoryData(index)} disabled={!isChangeAble}>刪除</button>
            </div>
        </div>
    )
}

export default SimulatorHistoryHint;