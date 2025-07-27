import React,{useContext, useMemo} from 'react';
import { Tooltip } from 'react-tooltip';
import { PieChart } from '@mui/x-charts/PieChart';
import SiteContext from '@/context/SiteContext';

const Result = React.memo(() => {
    const { ExpRate, Rrank, PieNums, Rscore } = useContext(SiteContext);

    const hue = ExpRate * 120;
    const bgColor =`hsl(${hue}, 100%, 50%)`;
    const renderContent = useMemo(() => {
        if (ExpRate !== undefined && Rrank !== undefined && PieNums !== undefined && Rscore !== undefined) {
            return (
                <div className="Result">
                    <div className='flex flex-col w-fit max-[500px]:mx-auto'>
                        <div className={`${(ExpRate !== undefined) ? '' : 'hidden'} mt-2 flex flex-row items-center`}>     
                            <div className='text-white flex flex-row'>
                                <span>遺器評級:</span>
                                <span style={{ color: Rrank.color }} className='pl-2'>{Rrank.rank} &nbsp; {Rscore}/100 </span>
                            </div>
                            <div className='hintIcon ml-1 overflow-visible' data-tooltip-id="ScoreHint">
                                <span className='text-white'>?</span>
                            </div>
                        </div>
                        <div className={`${(ExpRate !== undefined) ? '' : 'hidden'} mt-2 flex flex-row items-center`}>
                            <span className={`text-white`}>重洗詞條翻盤機率:
                                <label style={{ color: bgColor, marginLeft: '4px' }} className='font-bold'>{`${(ExpRate * 100).toFixed(1)}%`}</label>
                            </span>
                            <div className='hintIcon ml-1 overflow-visible' data-tooltip-id="ExpRateHint">
                                <span className='text-white'>?</span>
                            </div>
                        </div>
                    </div>
                    <div className='w-fit flex flex-row mt-2 max-[500px]:mx-auto'>
                        <Pie PieNums={PieNums} />
                    </div>
                    <Tooltip id="ExpRateHint"  
                        place="right-start"
                        render={()=>
                            <div className='flex flex-col max-w-[250px] p-1'>
                                <span className='text-white'>此機率代表的是在所有組合中評分超過目前組合的機率</span>
                                <span className='mt-1 text-yellow-500'>此數值可能存在些許誤差，尤其副詞條包含速度</span>
                            </div>
                        }/>
                    <Tooltip id="ScoreHint"  
                        place="right-start"
                        render={()=>
                            
                                <div className='flex flex-col max-w-[250px] p-1'>
                                    <span className='text-white'>評級標準:</span>
                                    <div className='flex flex-col [&>div]:flex [&>div]:flex-row [&>div>span]:text-stone-400'>
                                        <div>
                                            <span className="w-[30px]">S+</span>
                                            <span className="w-[60px]">: ≥ 85</span>
                                        </div>
                                        <div>
                                            <span className="w-[30px]">S</span>
                                            <span className="w-[60px]">: 70–84</span>
                                        </div>
                                        <div>
                                            <span className="w-[30px]">A</span>
                                            <span className="w-[60px]">: 50–69</span>
                                        </div>
                                        <div>
                                            <span className="w-[30px]">B</span>
                                            <span className="w-[60px]">: 35–49</span>
                                        </div>
                                        <div>
                                            <span className="w-[30px]">C</span>
                                            <span className="w-[60px]">: 15–34</span>
                                        </div>
                                        <div>
                                            <span className="w-[30px]">D</span>
                                            <span className="w-[60px]">: &lt; 15</span>
                                        </div>
                                    </div>
                                </div>

                            
                        }/>
                </div>
            );
        } else {
            return null;
        }
    }, [ExpRate, Rrank, PieNums, Rscore, bgColor]);

    return renderContent;
});


//圓餅圖
const Pie=React.memo(({PieNums})=>{;
    if(PieNums!==undefined){
        const pieParams = {
            height: 200,
            margin:{ top: 10, right: 0, bottom: 0, left: 0 },
            slotProps: { legend: { hidden: true } },
        };

        return(
           <div className='w-fit flex flex-row mx-auto max-[500px]:flex-col-reverse'>
                <div className='w-[200px]'>
                    <PieChart  
                    series={[
                        {
                            innerRadius: 20,
                            arcLabelMinAngle: 35,
                            arcLabel: (item) => `${item.value}%`,
                            data: PieNums,
                        }
                    ]}  {...pieParams} />
                </div>
                    <div className='flex flex-col w-fit max-[500px]:mx-auto'>
                        {PieNums.map((p,i)=>{
                            if(p.value!==0)
                                return(
                                    <div className='my-1 w-fit flex flex-row [&>*]:max-[500px]:text-center' key={'pieNums'+i}>
                                        <div style={{color:p.color}} className='w-[30px] text-right '>{`${p.tag}`}</div>
                                        <div style={{color:p.color}} className='w-[70px] ml-2'>{`${p.value}%`}</div>
                                    </div>
                                )
                        })}
                    </div>
               
           </div>
        );

    }else{
        return(<></>)
    }
});


export default Result;