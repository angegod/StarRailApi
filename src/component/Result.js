import React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';

const Result=React.memo(({ExpRate,Rrank,PieNums,statusMsg,Rscore})=>{

    if(ExpRate!==undefined&&Rrank!==undefined&&PieNums!==undefined&&Rscore!==undefined){
        return(
            <div className={`w-[100%] min-w-[400px] mb-5 border-t-4 border-gray-600 my-2 pt-2 
                ${(statusMsg!==undefined)?'':'hidden'} max-[500px]:min-w-[330px]`}>
                <div className='flex flex-col'>
                    <div className={`${(statusMsg!==undefined)?'':'hidden'} mt-2`}>
                        <span className='text-white'>{statusMsg}</span>
                    </div>
                    <div className={`${(ExpRate!==undefined)?'':'hidden'} mt-2`}>
                        <span className='text-white'>遺器評級:
                            <span style={{color:Rrank.color}} className='pl-2'>{Rrank.rank} &nbsp; {Rscore} </span>
                        </span>
                    </div>
                    <div className={`${(ExpRate!==undefined)?'':'hidden'} mt-2`}>
                        <span className='text-white'>重洗詞條翻盤機率:{`${(ExpRate*100).toFixed(1)}%`}</span>
                    </div>
                </div>
                <div className='max-w-[500px] flex flex-row mt-2'>
                    <Pie PieNums={PieNums}/>
                </div>
            </div>
        )
    }else{
        return(
            <div className={`w-[100%] mb-5 border-t-4 border-gray-600 
                max-[500px]:w-[100%] my-2 pt-2 ${(statusMsg!==undefined)?'':'hidden'}`}>
                <div><span className='text-white'>{statusMsg}</span></div>
            </div>
        )
    }    
});

//圓餅圖
const Pie=React.memo(({PieNums})=>{
    if(PieNums!==undefined){
        const pieParams = {
            height: 200,
            margin: 0,
            slotProps: { legend: { hidden: true } },
        };

        return(<>
           <div className='w-[100%] flex flex-row flex-wrap'>
                <div className='min-w-[300px]'>
                    <PieChart series={[
                        {
                            innerRadius: 20,
                            arcLabelMinAngle: 35,
                            arcLabel: (item) => `${item.value}%`,
                            data: PieNums,
                        }
                    ]}  {...pieParams} />
                </div>
                    <div className='flex flex-col w-2/5 text-center max-[500px]:w-[100%]'>
                        {PieNums.map((p)=>{
                            if(p.value!=0)
                                return(
                                    <div className='my-1 flex flex-row [&>*]:max-[500px]:w-[100px] [&>*]:max-[500px]:text-center'>
                                        <div style={{color:p.color}} className='w-[30px] text-right '>{`${p.tag}`}</div>
                                        <div style={{color:p.color}} className='w-[30px] ml-2'>{`${p.value}%`}</div>
                                    </div>
                                )
                        })}
                    </div>
           </div>
        </>);

    }else{
        return(<></>)
    }
});


export default Result;