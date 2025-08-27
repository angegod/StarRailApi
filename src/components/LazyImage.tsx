import { useRef,useState } from "react";

interface LazyImageProps{
    BaseLink:string,
    LoadImg:string,
    style:string,
    width:number,
    height:number
}

//圖片延遲載入元件
function LazyImage({BaseLink,LoadImg,style,width,height}:LazyImageProps){
    const imageRef = useRef<HTMLImageElement | null>(null);
    const [show,setShow] = useState(false);

    //圖片延遲載入
    function ImageLoad(){
        if(imageRef.current && imageRef.current.complete){
            setTimeout(()=>{
                setShow(true);
            },200)   
        }
        else{
            setShow(false);
        }
    }

    function handleError() {
        setShow(false);
    }

    return(
        <div>
            <img 
                src={LoadImg} 
                alt='icon' width={width} height={height}
                className={`${style} ${(show)?'hidden':''}`} />
            <img 
                src={BaseLink} 
                ref={imageRef}
                onLoad={()=>ImageLoad()}
                onError={handleError}
                alt='icon' width={width} height={height}
                className={`${style} ${(!show)?'hidden':''}`}/>
        </div>
    )
}

export default LazyImage;