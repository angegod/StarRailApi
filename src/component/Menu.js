import React from 'react';
import {Routes, Route,Link } from 'react-router-dom'
import App from '../App.js';
import Simulator from './relic_simulator.js';
import Importer from './Importer.js';

function Menu(){
    let list=[{
        link:'/',
        name:'遺器強化模擬器',
        engname:'simulator'
    },{
        link:'/import',
        name:'遺器匯入',
        engname:'import'
    }];

    const menuList=list.map((m,i)=>
        <div className='mr-3 flex flex-col bg-gray-700 min-w-[100px] rounded-md justify-center px-2' key={'menu'+i}>
            <Link to={m.link} className='text-center'><span className='text-gray-500 font-bold text-lg'>{m.name}</span></Link>
            <span className='text-md text-gray-400'>{m.engname}</span>
        </div>
    );


    return(<>
        <div className='my-3 sticky top-0 w-[100%] z-[100] pt-2 bg-[rgb(49,48,48)]'>
            <div className='flex flex-row w-4/5 mx-auto'>
                {menuList}
            </div>
        </div>
        <Routes>
            <Route path="/" index element={<Simulator />} />
            <Route path='/import' element={<Importer />} />
        </Routes>
    </>)
}

export default Menu;
