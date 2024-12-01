import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route,Link } from 'react-router-dom'

function Menu(){
    let list=[{
        link:'/',
        name:'遺器查詢器',
        engname:'searcher'
    },{
        link:'/simulate',
        name:'遺器強化模擬器',
        engname:'simulator'
    }];

    const menuList=list.map((m)=><>
        <div className='mr-3 flex flex-col'>
            <Link to={m.link}><span className='text-black font-bold text-lg'>{m.name}</span></Link>
            <span className='text-md text-black'>{m.engname}</span>
        </div>
    </>)


    return(<>
        <div className='my-3 bg-yellow-500'>
            <div className='flex flex-row w-4/5 mx-auto'>
                {menuList}
            </div>
            
        </div>
    </>)
}

export default Menu;
