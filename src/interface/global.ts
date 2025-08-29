//這裡放共用類別

//standDetails跟selfStand
export interface standDetailsItem{
    name:string,
    value:number
}

export type standDetails = standDetailsItem[];
export type selfStand = standDetailsItem[];


//遺器評級
export interface relicRank {
    rank:string,
    tag:string,
    stand:number,
    color:string
}


//PieNums 圓餅圖資料
export interface PieNumsItem{
    label: string, 
    value: number, 
    color: string, 
    tag: string
}

//characters 腳色select物件
export interface characterItem{
    charID: number 
    name: string 
    eng_name: string
}

//AffixList 詞條可能範圍
export interface AffixListItem {
    id:number,
    main: string[];
    sub: string[];
}

//Affix 詞條種類物件
export interface AffixItem {
    fieldName: string;
    icon: string;
    type: string;
    name: string;
    percent: boolean;
    range?: number[];    
    isMain?: boolean;   
}

//charSelect
export interface CharacterOption {
    value: number;
    label: string;
    engLabel: string;
    icon: string;
}

export interface updateDetailsItem{
    type:string,
    updateKey:string,
    updateType:string,
    updateDate: Date,
    updateTitle: string,
    updateContent:string[]
}

