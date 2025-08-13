import { useContext } from "react";
import SiteContext from "@/context/SiteContext";

function RelicDataHint(){
    const {affixLock} = useContext(SiteContext);

    return(
        <div className='flex flex-col [&>span]:text-white max-w-[250px] p-1'>
            <div>
                <span className='text-white'>下方會顯示出該遺器的</span>
            </div>
            <div>
                <ul className='[&>li]:text-stone-400'>
                    <li>1.所屬套裝</li>
                    <li>2.主屬性及其數值</li>
                    <li>3.副屬性及其數值</li>
                    <li>4.個別副屬性強化次數</li>
                </ul>
            </div>
            {(affixLock)?
                <div className="mt-2">
                    <span>其中副詞條中如果上方有畫上刪除線，代表為鎖定詞條，<span className="text-red-500 font-bold">在重洗過程中不會分配到任何強化次數</span></span>
                </div>:null
            }
            <div className='mt-2'>
                <span className='text-white'>此外下方有個重洗模擬按鈕，此功能將會帶入這個遺器的資訊進行重洗模擬</span>
            </div>
        </div>
    )
}

export default RelicDataHint;