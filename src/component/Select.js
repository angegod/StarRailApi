import React,{useContext, useState} from 'react';
import AffixList from '../data/AffixList';
import characters from '../data/characters';
import Select from 'react-select';

//主詞條選擇
const MainAffixSelect=React.memo(({context})=>{
    const {partsIndex,MainSelectOptions,setMainSelectOptions,isChangeAble} = useContext(context);

    if(Number.isInteger(parseInt(partsIndex))&&partsIndex!==undefined){
        let range=AffixList.find((s)=>s.id===(parseInt(partsIndex))).main;
        
        //如果只有固定一個主屬性的情況下
        if(range.length===1){
            setMainSelectOptions(range[0]);
            return(<span className='text-white'>{MainSelectOptions}</span>)
        }else{
            //如果超過一個的情況下
            let options=[<option value={'undefined'} key={"MainAfffixUndefined"}>請選擇</option>];

            range.forEach((s,i)=>{
                options.push(<option value={s} key={'Mainaffix'+i}>{s}</option>)
            });

            return(<select  defaultValue={MainSelectOptions} 
                            onChange={(event)=>{
                                if(event.target.value==='undefined')
                                    setMainSelectOptions(undefined)
                                else
                                    setMainSelectOptions(event.target.value)
                            }}
                            disabled={!isChangeAble}
                            className='w-[150px] graySelect'>{options}</select>)
        }
    }else{
        return(<></>)
    }
});

//副詞條選擇
const SubAffixSelect=React.memo(({index,context})=>{
    const {SubData,MainSelectOptions,partsIndex,isChangeAble}=useContext(context)

    function updateSubAffix(val,index){
        SubData.current.find((s,i)=>i===parseInt(index)).subaffix=val;
    }

    function updateSubData(val,index){
        SubData.current.find((s,i)=>i===parseInt(index)).data=Number(val);
    }

    function updateSubCount(val,index){
        SubData.current.find((s,i)=>i===parseInt(index)).count=Number(val);
    }

    if(MainSelectOptions!==undefined&&MainSelectOptions!=='undefined'&&partsIndex!==undefined){
        let range=AffixList.find((s)=>s.id===parseInt(partsIndex)).sub;
        let options=[<option value={'undefined'} key={`SubaffixUndefined`}>請選擇</option>];

        range.forEach((s,i)=>{
            options.push(<option value={s} key={`Subaffix${i}`}>{s}</option>)
        });
        

        return(<div className='my-1' key={'SubAffixSelect'}>
            <select defaultValue={SubData.current[index].subaffix} 
                    onChange={(event)=>updateSubAffix(event.target.value,index)} 
                    className='graySelect'
                    disabled={!isChangeAble}>
                        {options}

            </select>
            <input type='number' defaultValue={SubData.current[index].data}
                    onChange={(event)=>updateSubData(event.target.value,index)}
                    className='ml-2 max-w-[50px] bgInput text-center' 
                    disabled={!isChangeAble} min={0} title='詞條數值'/>
            <input type='number' defaultValue={SubData.current[index].count}
                    onChange={(event)=>updateSubCount(event.target.value,index)}
                    className='ml-2 text-center bgInput' disabled={!isChangeAble}
                    min={0} max={5} title='強化次數'/>
            </div>)
    }else{
        return(<></>)
    }   
});

//部位選擇器
const PartSelect=React.memo(({context})=>{

    const {partArr,partsIndex,setPartsIndex,setIsSaveAble,isChangeAble}=useContext(context);
    let options=[<option value={'undefined'} key={'PartsUndefined'}>請選擇</option>];

    partArr.forEach((a,i)=>{
        options.push(
            <option value={i+1} key={`PartSelect${i}`} >{a}</option>       
        )
    })

    return(
        <select value={partsIndex} 
                onChange={(event)=>{
                    if(event.target.value==='undefined')
                        setPartsIndex(undefined)
                    else{
                        setPartsIndex(event.target.value);setIsSaveAble(false);
                    }

                }}
                disabled={!isChangeAble} className='h-[25px] w-[150px] graySelect'>{options}</select>
    )
});

//自訂義有效詞條種類
const StandardSelect=React.memo(({context})=>{
    const [selectAffix,setAffix]=useState(undefined);
    const {partsIndex,selfStand,setSelfStand,isChangeAble}=useContext(context);
    
    //添加標準 目前設定先不超過六個有效 且不重複
    function addAffix(){
        //如果為預設選項則不予選擇
        if(selectAffix===undefined)
            return;
        let newItem={
            name:selectAffix,
            value:1
        }
        if(selfStand.length<6&&!(selfStand.findIndex((item)=>item.name===selectAffix)>=0))
            setSelfStand((old)=>[...old,newItem]);
    }

    function clearAffix(){
        setSelfStand([]);
    }

    if(partsIndex!==undefined){
        //依據所選部位 給出不同的選澤
        let target=AffixList.find((a)=>a.id===parseInt(partsIndex));
        //合併所有選項 並且移除重複值
        let mergedArray = [...new Set([...target.main, ...target.sub])];
        mergedArray=mergedArray.filter((item)=>item!=='生命值'&&item!=='攻擊力'&&item!=='防禦力')

        let options=[<option value={'undefined'} key={'PartsUndefined'}>請選擇</option>];

        //如果該標準已被選擇 會顯示勾選圖示於左側選項中
        mergedArray.forEach((m,i)=>{
            options.push(
                <option value={m} key={'Affix'+i} title={m} 
                    className='w-[160px] whitespace-pre'>
                        <span className='inline-block w-[20px]'>{(selfStand.find((s)=>s.name===m))?'\u2714 ':'\u2003'}</span>
                        <span>{m}</span>
                </option>);
        });

        return(
                <div className='flex flex-col'>
                    <div className='flex flex-row flex-wrap items-baseline'>
                        <select value={selectAffix}
                            title='選擇標準' 
                            onChange={(event)=>{setAffix(event.target.value)}}
                            disabled={!isChangeAble} className='mr-1 h-[25px] w-[120px] graySelect'>{options}</select>
                        <div className='max-[520px]:mt-1 ml-1'>
                            <button className='processBtn px-1' onClick={addAffix} disabled={!isChangeAble}>添加</button>
                            <button className='deleteBtn ml-2 px-1' onClick={clearAffix} disabled={!isChangeAble}>清空</button>
                        </div>
                    </div>
                </div>
        )
    }else{
        return(<></>)
    }

});

//腳色選擇器
const CharSelect=React.memo(({context})=>{
    const {charID,setCharID,setIsSaveAble,isChangeAble}=useContext(context)
    let options=[];

    const customStyles={
        control: (provided) => ({
            ...provided,
            backgroundColor: 'inherit', // 繼承背景顏色
            outline:'none',
        }),
        input: (provided) => ({
            ...provided,
            color: 'white', // 這裡設定 input 文字的顏色為白色
            backgroundColor:'inherit'
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
        })
    }
    
    characters.forEach((c)=>{
        options.push({
            value: c.charID, 
            label: c.name,
            icon: `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/character/${c.charID}.png`
        })
    })

    //自訂義篩選
    const customFilterOption = (option, inputValue) => {
        return option.data.label.toLowerCase().includes(inputValue.toLowerCase());
    };

    const selectedOption = options.find((option) => option.value === charID);
    return(<Select options={options} 
                className='w-[200px]' 
                onChange={(option)=>{setCharID(option.value);setIsSaveAble(false);}}
                value={selectedOption} 
                isDisabled={!isChangeAble}
                styles={customStyles}
                getOptionLabel={(e) => (
                    <div style={{ display: "flex", alignItems: "center"  }}>
                        <img src={e.icon} alt={e.label} style={{ width: 30, height: 30, marginRight: 8 ,borderRadius:"25px" }} />
                        <span className='text-white'>{e.label}</span>
                    </div>
                )}
                filterOption={customFilterOption}/>)
});

export {PartSelect,StandardSelect,CharSelect,MainAffixSelect,SubAffixSelect}