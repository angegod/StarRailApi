function HintAffixLock(){
    return(
        <div className="max-w-[240px]">
            <div className="[&>span]:text-stone-400 flex flex-col">
                <span>此按鈕可以開關決定使否啟用鎖定詞條功能</span>
                <span className="mt-1">啟用磁條鎖定後會根據你制定的標準，自動將每件遺器中權重最低的副詞條鎖定住</span>
                <span className="!text-yellow-400">被鎖定的詞條則會用刪除線表示</span>
                <span className="!text-white">例如:<span className="line-through">生命力</span></span>
            </div>
        </div>
    )
}

export default HintAffixLock;