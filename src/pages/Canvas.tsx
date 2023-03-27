
import React, { useEffect, useRef } from 'react';
// import {vertices} from './Cube'
type CanvasProps = React.DetailedHTMLProps<React.CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>
const Canvas: React.FC<CanvasProps> = ({...props}) => {
    const canvasRef = useRef<HTMLCanvasElement|null>(null)
   
    const vertices = [
      0.0, 0.5, 0.0,
      -0.5, -0.5, 0.0,
      0.5, -0.5, 0.0
    ];

    const indices = [0,1,2];
    useEffect(()=>{
        const canvas = canvasRef.current
        if(!canvas){
            return;
        }
        const webgl = canvas.getContext("webgl")
        if(!webgl){
          return;
        }


        let vertexBuffer = webgl.createBuffer();





        webgl.bindBuffer(webgl.ARRAY_BUFFER, vertexBuffer);
        webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array(vertices), webgl.STATIC_DRAW);
        webgl.bindBuffer(webgl.ARRAY_BUFFER, null);

        const indexBuffer = webgl.createBuffer()!;
        webgl.bindBuffer(webgl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        webgl.bufferData(webgl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), webgl.STATIC_DRAW);
        webgl.bindBuffer(webgl.ELEMENT_ARRAY_BUFFER, null);
    })
    
  return (
      <canvas ref={canvasRef} width={props.width} height={props.height}/> 
  )
}

export default Canvas