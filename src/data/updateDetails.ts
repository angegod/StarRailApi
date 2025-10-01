import { updateDetailsItem } from "@/interface/global";

//最新公告訊息
let updateDetails:updateDetailsItem = {
    type:"Importer",
    updateKey:'StarRailApi_20251001',
    updateType:'StarRailApiUpdateDetails',
    updateDate: new Date('2025-10-01'),
    updateTitle:"遺器重洗模擬器 崩鐵3.6更新公告",
    updateContent:[
        "新增3.6腳色選項:長夜月、丹恆•騰荒",
        "修正強化模擬分數計算數值錯誤之問題",
        "部分排版優化"
    ]
};

export default updateDetails;