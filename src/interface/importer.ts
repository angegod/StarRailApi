import { characterItem, PieNumsItem, relicRank, selfStand, standDetails } from "./global";

export  interface dataArrItem{
    ExpRate:number,
    PieNums:PieNumsItem[],
    Rank:relicRank,
    Rscore:string,
    affixLock:boolean,
    relic:ImportRelic 
    standDetails:standDetails
}

//歷史紀錄
export interface ImporterHistory{
    version:string,
    calDate:string,
    userID:string,
    char:characterItem,
    dataArr:dataArrItem[],
    avgScore:number,
    avgRank:relicRank,
    avgRate:number,
    isLock:boolean
}


export interface sendDataType{
    uid:string,
    charID:number,            
    partsIndex:0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
}

export interface ImporterRelicSubDataType{
    index:number, 
    subaffix:string,
    data:number, //詞條數值    
    count:number,//強化次數
    stand:number,
    locked:boolean
}


export interface ImportRelic{
    icon: string,
    id: string
    level: 15,
    main_affix: ImportRelicAffix,
    name: string,
    rarity:5,
    set_id: string,
    set_name: string,
    sub_affix: ImportRelicAffix[],
    type:number
}

export interface ImportRelicAffix{
    count: number,
    display: string,
    field:string, 
    icon: string,
    name: string,
    percent: true,
    step: number,
    type: string,
    value: number
}