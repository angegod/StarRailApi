import SiteContext from "@/context/SiteContext";
import { useContext } from "react";
import Image from "next/image";
import { ImporterHistory } from "@/interface/importer";

interface PastPreviewProps{
    index:number,
    data:ImporterHistory
}

function ImporterHistoryHint({index,data}:PastPreviewProps){
    const {checkDetails,updateDetails,deleteHistoryData,isChangeAble} = useContext(SiteContext);

    const bgColor =`hsl(${(data.avgRate/100)*120}, 100%, 50%)`;
    const isLock =data.isLock;

    return(
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
                <span className='w-[70px] max-[400px]:w-[60px] break-keep text-stone-400 font-bold'>角色:</span>
                <span className='pl-1 text-white'>{data.char.name}</span>
            </div>
            <div className='flex flex-row justify-start [&>span]:max-[400px]:text-sm'>
                <span className='w-[70px] max-[400px]:w-[60px] break-keep text-stone-400 font-bold'>平均分數:</span>
                <span className='pl-1 text-white font-bold' style={{color:data.avgRank.color}}>{data.avgScore.toFixed(1)}</span>
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
                <button className='processBtn mr-2 px-1' onClick={()=>updateDetails(index)} disabled={!isChangeAble}>更新</button>
                <button className='deleteBtn px-1' onClick={()=>deleteHistoryData(index)} disabled={!isChangeAble}>刪除</button>
            </div>
        </div>
    )
}


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


export default ImporterHistoryHint;