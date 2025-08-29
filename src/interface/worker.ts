export interface standardItem{
    type:string,
    data:standardSubItem[]
}

interface standardSubItem{
    name:string,
    data:number,
    percent:boolean
}

export interface coeEfficentItem{
    type:string,
    fieldName:string,
    num:number
}

//計算哪些已詞條
export interface calTypeItem{
    type:string,
    affixmutl:number
}


export interface enchantNewSubAffixItem{
    index:number,
    subaffix:string,
    data:number,
    count:number
}