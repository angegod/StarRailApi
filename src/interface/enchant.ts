import { relicRank, standDetails } from "./global";
import { ImportRelic } from "./importer";
import { relicSubData, simulatorRelic } from "./simulator";

//強化資料型別
export interface enchantData{
    relic:ImportRelic|simulatorRelic,
    Rrank:relicRank,
    Rscore:string,
    standDetails:standDetails,
    mode:"Importer"|"Simulator",
    affixLock:boolean
}


export interface simulatorDataItem{
    oldData:enchantDataItem|null,
    newData:enchantDataItem|null,
}

export interface enchantDataItem{
    relicrank:relicRank,
    relicscore:string,
    returnData:relicSubData[]
}

export interface StaticsItem{
    label:string,
    value:number,
    color:string
    tag:string
}


export interface MinMaxScoreItem{
    min:number,
    max:number
}

