import React, { Component } from 'react';
import {Routes, Route,Link } from 'react-router-dom'
import App from '../App.js';
import NotFound from '../component/NotFound.js';
import Simulator from '../component/relic_simulator.js';

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
    </>);


    return(<>
        <div className='my-3 bg-yellow-500 sticky top-0 w-[100%] z-[100]'>
            <div className='flex flex-row w-4/5 mx-auto'>
                {menuList}
            </div>
        </div>
        <Routes>
            <Route path="/" element={<App />} />
            <Route path="/simulate" element={<Simulator />} />
        </Routes>
    </>)
}

export default Menu;
