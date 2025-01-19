import React, { Component } from 'react';


function Footer(){
    return(
    <div className='bg-slate-700  min-h-[10vh] pt-1 text-left'>  
        <div className='w-4/5 mx-auto flex flex-col [&>span]:text-left [&>span]:font-bold  [&>span]:my-1 py-2 '>
            <span>&copy; 2024 <a href="https://home.gamer.com.tw/profile/index.php?&owner=ange0733" class="underline">Ange</a></span>
            <span>Website created by Ange. All rights reserved.</span>
            <span>Data latest Updated at 2025/01/19</span>
        </div>
    </div>)
}

export default Footer;