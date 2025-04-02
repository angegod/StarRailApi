import React, { Component } from 'react';
import AffixName from '../data/AffixName';

const StandDetails=React.memo(({standDetails})=>{
    if(standDetails!==undefined){
        const list=standDetails.map((s)=>{
            var IconName = AffixName.find((a)=>a.name===s.name).icon;

            var imglink=`https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/property/${IconName}.png`;
            
            
            return(
                <div className='flex flex-row' key={'StandDetails_'+s.name}>
                    <div className='flex justify-between w-[15vw] min-w-[150px] mt-0.5'>
                        <div className='flex flex-row'>
                            <img src={imglink} alt="icon" width={24} height={24}/>
                            <span>{s.name}</span>
                        </div>
                        <span>{s.value}</span>
                    </div>
                </div>
            )
        })

        return(<>
            <div className={`w-[100%] mb-5 border-t-4 border-gray-600 my-2 pt-2 
                max-[600px]:!min-w-[0px]`}>
                <div>
                    <span className='text-red-600 text-lg font-bold'>標準加權</span>
                </div>
                <div>
                    {list}
                </div>
            </div>
        
        </>)
    }
})

export default StandDetails;