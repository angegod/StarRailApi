
import { useRef,useState } from "react";

function LazyImage({BaseLink,LoadImg,style,width,height}){
    const imageRef = useRef();
    const [show,setShow] = useState(false);

    function ImageLoad(){
        if(imageRef.current.complete&&!imageRef.current.error){
            setTimeout(()=>{
                setShow(true);
            },1000)   
        }
        else{
            setShow(false);
        }
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
                alt='icon' width={width} height={height}
                className={`${style} ${(!show)?'hidden':''}`}/>
        </div>
    )
}

export default LazyImage;