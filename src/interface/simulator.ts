//這裡放只有simulator或相關元件 用到的類別

import { characterItem, PieNumsItem, relicRank, selfStand, standDetails } from "./global"

//遺器副詞條
export interface relicSubData{
    index:number, 
    subaffix:string, //詞條種類
    data:number,     //詞條數值
    count:number,         //強化次數
    stand:number,         //加權
    display?:string,
    locked:boolean
}

//模擬遺器物件
export interface simulatorRelic{
    main_affix:string,
    subaffix:relicSubData[],
    affixLock:boolean
    type:number
}

export interface SimulatorHistory{
    version:string,
    char:characterItem,
    part:string,
    mainaffix:string,
    expRate:number,
    score:string,
    rank:relicRank,
    pieData:PieNumsItem[],
    stand:standDetails,
    relic:simulatorRelic,
    isLock:boolean
}

