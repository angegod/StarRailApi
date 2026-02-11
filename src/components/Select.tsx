"use client"
import React,{useContext, useState,useEffect, useRef} from 'react';
import AffixList from '../data/AffixList';
import characters from '../data/characters';
import dynamic from "next/dynamic";
import { StylesConfig,SingleValue } from 'react-select';
import SiteContext from '../context/SiteContext';
import { Tooltip } from 'react-tooltip';
import LazyImage from './LazyImage';
import SelfDefinedSelectProps, { relicSubData } from '@/interface/simulator';
import { AffixListItem, CharacterOption, selfStand, standDetailsItem } from '@/interface/global';
import AffixName from '@/data/AffixName';

const Select = dynamic(() => import("react-select"), { ssr: false }) as unknown as
    React.ComponentType<import("react-select").Props<CharacterOption, false>>;

//主詞條選擇
const MainAffixSelect = React.memo(() => {
    const { partsIndex, MainSelectOptions, setMainSelectOptions, isChangeAble } = useContext(SiteContext);
    const [range, setRange] = useState<string[]>([]);

    useEffect(() => {
        if (Number.isInteger(parseInt(partsIndex)) && partsIndex !== undefined) {
            const found = AffixList.find((s) => s.id === parseInt(partsIndex));
            if (found) setRange(found.main);
        } else {
            setRange([]);
        }
    }, [partsIndex]);

    // 當 range 是只有一個值時，設定 state（只設定一次）
    useEffect(() => {
        if (range && range.length === 1) {
            setMainSelectOptions(range[0]);
        }
    }, [range]);

    const MainAffixSelectHandler = (value:string) =>{
        setMainSelectOptions(value);
    }

    if (range.length === 0) return null;


    if (range.length === 1) {
        let MainAffixIcon = AffixName.find((a)=>a.name===range[0])?.icon;
        let affixIconUrl=`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/property/${MainAffixIcon}.png`;

        return (
            <span className='text-white flex flex-row gap-1'>
                <img src={affixIconUrl} width={24} height={24} />
                {range[0]}
            </span>
        )
        
    } else {
        const options = [
            <option value={'undefined'} key={'MainAfffixUndefined'}>請選擇</option>,
            ...range.map((s, i) => (
                <option value={s} key={`Mainaffix${i}`}>{s}</option>
            ))
        ];

        return (
            <div className='flex flex-row items-baseline'>
                {
                    (false)?
                    <select
                        defaultValue={MainSelectOptions}
                        onChange={(event) => {
                            const val = event.target.value;
                            setMainSelectOptions(val === 'undefined' ? undefined : val);
                        }}
                        disabled={!isChangeAble}
                        className='w-[150px] graySelect'>
                        {options}
                    </select>:null
                }
                <SelfDefinedSelect 
                    selectName='MainAffixSelect'
                    changeHandler={MainAffixSelectHandler}
                    options={range}
                    selectWidth={180}
                    selectedValue={MainSelectOptions}
                    AffixIcon={true}/>
                <div className={`hintIcon ml-1 overflow-visible ${(parseInt(partsIndex)===1||(parseInt(partsIndex)===2)?'hidden':'')}`} data-tooltip-id="MainAffixHint">
                    <span className='text-white'>?</span>
                </div>
                <Tooltip id="MainAffixHint"  
                    place="right-start" 
                    arrowColor='gray'
                    render={()=>
                        <div className='flex flex-col max-w-[230px] '>
                            <span className='text-white'>選擇遺器的主詞條</span>
                        </div>
                    }/>
            </div>
        );
    }
});

const SubAffixSelect = React.memo(({ index }:{index:number}) => {
    const { SubData, setSubData, MainSelectOptions, partsIndex, isChangeAble } = useContext(SiteContext);

    // 詞條數值（用字串存，才可以退格成空）
    const [inputValue, setInputValue] = useState<string>(
        SubData[index]?.data?.toString() ?? "0"
    );

    // 詞條強化次數（同樣用字串）
    const [inputCount, setInputCount] = useState<string>(
        SubData[index]?.count?.toString() ?? "0"
    );

    function updateSubAffix(val:string, index:number) {
        setSubData((prev:relicSubData[]) => prev.map((item:relicSubData, i:number) =>
            i === +index ? { ...item, subaffix: val } : item
        ));
    }

    function handleBlurValue(index:number) {
        const num = Number(inputValue);

        if (inputValue === "" || isNaN(num)) {
            // 顯示 0，但不存入 SubData
            setInputValue("0");
            return;
        }

        setSubData((prev:relicSubData[]) => {
            const next = [...prev];
            next[index] = { ...next[index], data: num };
            return next;
        });
    }

    function handleBlurCount(index:number) {
        let num = Number(inputCount);

        if (inputCount === "" || isNaN(num)) {
            setInputCount("0");
            return;
        }

        num = Math.min(Math.max(num, 0), 5);

        setSubData((prev:relicSubData[]) => {
            const next = [...prev];
            next[index] = { ...next[index], count: num };
            return next;
        });
    }

    if (MainSelectOptions !== undefined && MainSelectOptions !== 'undefined' && partsIndex !== undefined) {
        let range = AffixList.find((s) => s.id === parseInt(partsIndex))!.sub;
        let options = [<option value={'undefined'} key={`SubaffixUndefined`}>請選擇</option>];

        const filteredRange = range.filter((r) => {
            if (r === '' || r === 'undefined') return true;
            if (r === MainSelectOptions) return false;
            const foundIndex = SubData.findIndex((s:relicSubData) => s.subaffix === r);
            if (foundIndex === -1) return true;
            if (foundIndex === index) return true;

            return false;
        });

        filteredRange.forEach((s) => {
            options.push(<option value={s} key={`Subaffix_${s}`}>{s}</option>)
        });

        return (
            <div className='my-1 flex flex-row' key={'SubAffixSelect' + index}>
                <SelfDefinedSelect
                    options={filteredRange}
                    changeHandler={(val: string) => updateSubAffix(val, index)}
                    selectName={'SubAffix'+index}
                    selectedValue={SubData[index].subaffix} 
                    selectWidth={130}
                    AffixIcon={true}/>

                <input
                    type='number'
                    value={inputValue} // 保證不是 NaN
                    onChange={(event) => setInputValue(event.target.value)}
                    onBlur={() => handleBlurValue(index)}
                    className='ml-2 max-w-[50px] bgInput text-center'
                    disabled={!isChangeAble}
                    min={0}
                    title='詞條數值'/>

                <input
                    type='number'
                    value={inputCount} // 保證不是 NaN
                    onChange={(event) => setInputCount(event.target.value)}
                    onBlur={() => handleBlurCount(index)}
                    className='ml-2 text-center bgInput'
                    disabled={!isChangeAble}
                    min={0}
                    max={5}
                    title='強化次數'/>
            </div>
        )
    } else {
        return null
    }
});


//部位選擇器
const PartSelect=React.memo(()=>{

    const {partArr,partsIndex,setPartsIndex,setIsSaveAble,isChangeAble}=useContext(SiteContext);

    const changeHandler = (value:any)=>{
        let targetIndex = (partArr as string[]).findIndex((p)=>p===value);
        
        console.log(targetIndex);
        if(Number.isInteger(targetIndex)){
            setPartsIndex(targetIndex+1);
            setIsSaveAble(false);
        }else
            setPartsIndex(undefined);
        
    }


    return(
        <SelfDefinedSelect
            selectName="PartSelect" 
            options={partArr} 
            changeHandler={changeHandler} 
            selectedValue={partArr[partsIndex-1]}
            selectWidth={150}/>
    )
});

//自訂義有效詞條種類
const StandardSelect=React.memo(()=>{
    const {partsIndex,selfStand,setSelfStand,isChangeAble}=useContext(SiteContext);
    const [expand,setExpand]=useState(false);

    const selectContainer = useRef<HTMLDivElement>(null);

    //偵測點擊位置 如果點擊非本元件 則直接展開設為false
    useEffect(()=>{
        function handleClickOutside(event:MouseEvent) {
            // 如果 containerRef 有值，且點擊目標不在 container 裡面
            if(event.target){
                if (selectContainer.current &&  event.target instanceof Node &&!selectContainer.current.contains(event.target)) {
                    setExpand(false);
                }
            }
            
        }

        if (expand&&isChangeAble) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        // 清理事件
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    },[expand])

    //添加標準 目前設定先不超過六個有效 且不重複
    function addAffix(selectAffix:string){
        //如果該詞條沒有出現在arr裡則加入 反之則移除
        if(!selfStand.some((s:standDetailsItem) => s.name === selectAffix)){
            //如果為預設選項則不予選擇
            if(selectAffix===undefined)
                return;
            let newItem={
                name:selectAffix,
                value:1
            }
            if(selfStand.length<6&&!(selfStand.findIndex((item:standDetailsItem)=>item.name===selectAffix)>=0))
                setSelfStand((old:selfStand)=>[...old,newItem]);
        }else{
            setSelfStand((arr:selfStand)=>arr.filter((s)=>s.name!==selectAffix));
        }
    }

    if(partsIndex!==undefined){
        //依據所選部位 給出不同的選澤
        let target=AffixList.find((a)=>a.id===parseInt(partsIndex)) as AffixListItem;
        //合併所有選項 並且移除重複值
        let mergedArray = [...new Set([...target.main, ...target.sub])];
        mergedArray=mergedArray.filter((item)=>item!=='生命值'&&item!=='攻擊力'&&item!=='防禦力')

        //模仿原生select標籤 渲染每個option之div
        let optionsList=mergedArray.map((m, i) => {
            const exists = selfStand.some((s:standDetailsItem) => s.name === m);
            const IconName = AffixName.find((a)=>a.name === m)?.icon;
            
            //圖示網址模板
            let imglink=`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/property/${IconName}.png`;
            
            
            return(
                <div className='my-0.5 mx-1 hover:bg-stone-500 hover:text-white cursor-pointer flex flex-row items-center'
                    onClick={()=>addAffix(m)}
                    key={"options"+i}>
                    <div className='mr-1 flex items-center'>
                        <input  type='checkbox' checked={exists} 
                                className='border-[0px] w-4 h-4 accent-[dimgrey]' 
                                onChange={(event)=>console.log(event.target.value)}
                                disabled={!exists&&selfStand.length===6}/>
                        <img src={imglink} alt="icon" width={24} height={24}/>
                    </div>
                    <div>
                        <span className='text-white text-sm'>{m}</span>
                    </div>
                </div>
            )
        });

        return(
                <div className='flex flex-col' ref={selectContainer}>
                    <div className='flex flex-row flex-wrap items-baseline'>
                        <div className='w-[180px] min-w-fit'>
                            <div className='relative border-b-2 border-white flex flex-row justify-between' onClick={()=>(isChangeAble)?setExpand(!expand):''}>
                                <div>
                                    <span className='ml-1 text-white'>請選擇</span>
                                </div>
                                <div>
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/image/arrow_drop.svg`}
                                        className={`transition-transform duration-300 ${(expand&&isChangeAble) ? 'rotate-180' : 'rotate-0'}`}
                                        alt="arrow"/>
                                </div>
                            </div>
                            {(expand&&isChangeAble)&&(
                                <div className="absolute z-10 overflow-y-scroll graySelect w-[inherit] h-[150px] border-[1px] hide-scrollbar border-stone-700 p-1">
                                    {optionsList}
                                </div>
                            )}
                        </div>
                        <div className='hintIcon ml-1 overflow-visible' data-tooltip-id="StandardHint">
                            <span className='text-white'>?</span>
                        </div>
                    </div>
                    <Tooltip id="StandardHint" 
                        place="top-start"
                        arrowColor='gray'
                        render={()=>
                            <div className='flex flex-col'>
                                <span className='text-white'>根據個人需求</span>
                                <span className='text-yellow-400'>選擇不重複的詞條種類(包含主詞條)</span>
                                <div className='flex flex-col mt-2'>
                                    <span className='text-white font-bold'>注意事項</span>
                                    <span className='!text-red-500 font-bold'>"有效詞條"選擇最多保有6個。</span>
                                    <span className='text-red-500 font-bold'>如果已選擇6項，則其餘選項將無法選取。</span>
                                </div>
                            </div>
                        }/>
                </div>
        )
    }else{
        return null
    }
});

//腳色選擇器
const CharSelect=React.memo(()=>{
    const {charID,setCharID,setIsSaveAble,isChangeAble}=useContext(SiteContext)
    let options:CharacterOption[]=[];

    const customStyles: StylesConfig<CharacterOption, false> = {
        control: (provided) => ({
            ...provided,
            backgroundColor: 'inherit', // 繼承背景顏色
            outline: 'none',
        }),
        input: (provided) => ({
            ...provided,
            color: 'white', // 這裡設定 input 文字的顏色為白色
            backgroundColor: 'inherit'
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? 'darkgray'
                : state.isFocused
                    ? 'gray'
                    : 'rgb(36, 36, 36)',
            color: state.isSelected ? 'white' : 'black'
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: 'rgb(36, 36, 36)',
            zIndex: 20,
        })
    }
    
    characters.forEach((c)=>{
        options.push({
            value: c.charID, 
            label: c.name,
            engLabel:c.eng_name,
            icon: `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/character/${c.charID}.png`
        })
    })

    //自訂義篩選
    const customFilterOption = (option:{ data: CharacterOption }, inputValue:string) => {
        const lowerInput = inputValue.toLowerCase();
        return option.data.label.toLowerCase().includes(lowerInput) || option.data.engLabel.toLowerCase().includes(lowerInput);
    };

    const selectedOption = options.find((option) => option.value === charID);
    const LoadImgLink = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/image/unknown.png`;

    return(<Select options={options} 
                className='w-[200px]' 
                onChange={(option: SingleValue<CharacterOption>) => {
                        if (option) {
                            setCharID(option.value);
                            setIsSaveAble(false);
                        }
                    }}
                value={selectedOption} 
                isDisabled={!isChangeAble}
                styles={customStyles}
                formatOptionLabel={(e) => (
                    <div style={{ display: "flex", alignItems: "center"  }}>
                        <LazyImage 
                            BaseLink={e.icon}
                            LoadImg={LoadImgLink}
                            width={30}
                            height={30}
                            style={'mr-2 rounded-[25px]'} />
                        <span className='text-white'>{e.label}</span>
                    </div>
                )}
                filterOption={customFilterOption}/>)
});

//遺器選擇
const RelicSelect=React.memo(()=>{
    const {RelicDataArr,relicIndex,setRelicIndex}=useContext(SiteContext);
    const unknowRelicImg = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/image/unknownRelic.png`;
    if(RelicDataArr.length !==0){
        let list = RelicDataArr.map((r:any,i:number)=>{  
            const reliclink = `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/${r.relic.icon}`;
    
            return(
                <div className={`rounded-[50px] mx-2 mb-2 cursor-pointer p-2 border-[3px] max-[500px]:mx-1 max-[500px]:p-1 max-[500px]:border-[2px] ${(relicIndex === i)?"border-yellow-600":"border-gray-300"}`} 
                    key={'RelicSelect'+r.relic.type}
                    onClick={()=>setRelicIndex(i)}>
                    <LazyImage 
                        BaseLink={reliclink}
                        LoadImg={unknowRelicImg}
                        width={50}
                        height={50}
                        style={'max-[500px]:w-[40px]'} />
                </div>
            )
        })
    
        return(
            <div className='w-4/5 flex flex-col pt-1 max-[500px]:w-full'>
                <div className='flex flex-row items-baseline max-[500px]:w-[90%] max-[500px]:mx-auto'>
                    <span className='text-red-600 font-bold text-lg'>遺器匹配結果</span>
                    <div className='hintIcon ml-2 overflow-visible'
                        data-tooltip-id="RelicSelectHint">
                        <span className='text-white'>?</span>
                    </div>
                </div>
                <div className='flex flex-row flex-wrap max-[500px]:justify-center my-2 max-[900px]:w-full'>
                    {list}
                </div>
            </div>
        )
    }else{
        return null
    }
});

//自訂義單選select
//選項 相關方法 設定state
const SelfDefinedSelect=(props:SelfDefinedSelectProps)=>{
    const {options,changeHandler,selectedValue,selectName,selectWidth,AffixIcon}=props; 
    const {isChangeAble}=useContext(SiteContext);
    const [expand,setExpand]=useState(false);
    const [selectAffixIcon,setSelectAffixIcon]=useState<string|null>(null);
    const iconBaseLink = "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/property/";

    const selectContainer = useRef<HTMLDivElement>(null);

    
    useEffect(()=>{
        if(selectedValue&&selectedValue!==""){
            const selectAffix = AffixName.find((a)=>a.name===selectedValue);
            setSelectAffixIcon((selectAffix)?iconBaseLink+`${selectAffix?.icon}.png`:null);
        }
    },[selectedValue]);

    //偵測點擊位置 如果點擊非本元件 則直接展開設為false
    useEffect(()=>{
        function handleClickOutside(event:MouseEvent) {
            // 如果 containerRef 有值，且點擊目標不在 container 裡面
            if(event.target){
                if (selectContainer.current &&  event.target instanceof Node &&!selectContainer.current.contains(event.target)) {
                    setExpand(false);
                }
            }
            
        }

        if (expand&&isChangeAble) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        // 清理事件
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    },[expand])

    
    function selectHandler(value:any){
        changeHandler(value);
        setExpand(false);
    }

    const optionsList = options.map((option,i)=>{
        let affixIconUrl = "";
        let affixIconName = AffixName.find((a)=>a.name===option)?.icon;

        if(AffixIcon){
            affixIconUrl=iconBaseLink+`${affixIconName}.png`;
        }

        return(
            <div key={`${selectName}_options${i}`} 
                className='cursor-pointer  hover:bg-stone-500 px-1 w-[inherit] flex flex-row gap-2' 
                onClick={()=>selectHandler(option)}>
                {
                    (AffixIcon)?
                    <img src={affixIconUrl} width={24} height={24} />:null
                }
                <span className={`${(option===selectedValue)?'text-yellow-400':'text-white'}`}>{option}</span>
            </div>
        )
    });

    return (
        <div className="relative flex flex-col" ref={selectContainer}>
            <div className={`relative flex flex-row w-[${selectWidth}px] justify-between border-b-2 border-white cursor-pointer`} 
                    onClick={() => setExpand(!expand)}>
                <div className='flex flex-row gap-0.5'>
                    {
                        (selectAffixIcon)?
                        <img src={selectAffixIcon} width={24} height={24} />:null
                    }
                    <span className="ml-1 text-white text-md">
                        {selectedValue || '請選擇'}
                    </span>
                </div>
                <div className='flex items-center'>
                    <img 
                        src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/image/arrow_drop.svg`}
                        className={`transition-transform duration-300 ${expand && isChangeAble ? 'rotate-180' : 'rotate-0'}`}
                        width={15} height={15}
                        alt="arrow"/>
                </div>
            </div>

            {expand && isChangeAble && (
                <div className="absolute top-full left-0 z-10 w-full max-h-[150px]  
                        overflow-y-auto graySelect border border-stone-700 hide-scrollbar flex flex-col gap-0.5 p-1">
                    {optionsList} 
                </div>
            )}
        </div>
    );


}
export {PartSelect,StandardSelect,CharSelect,MainAffixSelect,SubAffixSelect,RelicSelect}