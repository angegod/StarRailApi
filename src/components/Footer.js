import React from 'react';
import Link from 'next/link';
import '../css/footer.css';


const Links=[{
    name:"Home",
    cn:"主頁",
    link:"/"
},{
    name:"Simulator",
    cn:"手動輸入",
    link:"/simulator"
},{
    name:"Importer",
    cn:"API自動匯入",
    link:"/import"
}]

function Footer(){

    const list =Links.map((l,i)=>{
        return(
            <div key={'link'+i} className="SubLink group w-fit">
                <Link href={l.link}>
                    <span className="font-bold hover:text-gray-200">{l.name}&nbsp;{l.cn}</span>
                </Link>
                <div className="h-[1px] flex justify-between">
                    <span className="bottomborder w-0 transition-all duration-300 bg-gray-300 h-full group-hover:w-full"></span>
                </div>
            </div>
        )
    });


    return(
        <div className='flex flex-row justify-center bg-[rgb(40,40,40)] min-h-[20vh] pt-1 text-left [&>div]:w-4/5 max-[600px]:min-h-[30vh] max-[600px]:!flex-col'>  
            <div className='mx-auto flex flex-row justify-center [&>div]:mx-3 mt-3 [&>div]:first:mx-0 max-[600px]:flex-col max-[600px]:[&>div]:mx-0 max-[600px]:[&>div]:mb-1'>
                {list}
            </div>
            <div className='mx-auto text-stone-500 flex flex-col [&>span]:text-left [&>span]:text-sm [&>span]:font-bold [&>span]:mt-1 py-2 max-[600px]:[&>span]:!text-sm'>
                <span>&copy; 2025 <a href="https://home.gamer.com.tw/profile/index.php?&owner=ange0733" className="underline">Ange</a></span>
                <span>Website created by Ange. All rights reserved.</span>
                <span>Data latest Updated at 2025/06/02</span>
            </div>
        </div>
    )
}

export default Footer;