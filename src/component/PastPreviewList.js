import React, { Component,useCallback,useMemo } from 'react';
import {PastPreview} from './PastPreview';

const PastPreviewList=React.memo(({historyData,updateHistory,checkDetails,isChangeAble})=>{
    if(historyData.length!==0){
        const renderList=historyData.map((item,i)=>{
            return(
                <PastPreview    data={item}
                    index={i}
                    updateHistory={updateHistory}
                    checkDetails={checkDetails}
                    isChangeAble={isChangeAble} 
                    key={'history' + i} />
            )
        })
        
        return <>{renderList}</>;
    }else{
        return <></>
    }
});

export default PastPreviewList;