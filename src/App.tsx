import React, { useEffect, useState } from 'react';
import './App.css';
import { Cube } from './shapes/Cube';
import { Sphere } from './shapes/Sphere';
import { Cylinder } from './shapes/Cylinder';
import DrawingCanvas from './pages/DrawingCanvas';
import Texture from './textures/textures.jpg'
import Texture1 from './textures/texture1.jpg'
import Texture2 from './textures/texture2.jpg'
import Property from './pages/Property';
//npm install & npm start
interface randomProperty{
  cube:number,
  sphere:number,
  cylinder:number,
}


function App() {
  const [socket, setSocket] = useState<WebSocket|null>(null);
  const [cube, setCube] = useState<number[]>(Cube.vertices);
  const [sphere, setSphere] = useState<number[]>(Sphere.vertices)
  const [cylinder, setCylinder] = useState<number[]>(Cylinder.vertices)

  const [cubeProp, setCubeProp] = useState<number>();
  const [sphereProp, setSphereProp] = useState<number>()
  const [cylinderProp, setCylinderProp] = useState<number>()

  const handleMessage = (event:MessageEvent) => {
    const randomProp: randomProperty = JSON.parse(JSON.parse(event.data));
    setCubeProp(parseFloat(randomProp.cube.toFixed(3))) 
    setSphereProp(parseFloat(randomProp.sphere.toFixed(3))) 
    setCylinderProp(parseFloat(randomProp.cylinder.toFixed(3))) 
    setCube(
      Cube.vertices.map(c=>{
        return c * randomProp.cube;
      })
    )
    setSphere(
      Sphere.vertices.map(c=>{
        return c * randomProp.sphere;
      })
    ) 
    setCylinder(
      Cylinder.vertices.map(c=>{
        return c * randomProp.cylinder;
      })
    ) 
  };
  useEffect(() => {
    const newSocket = new WebSocket("ws://localhost:8000/ws");
    setSocket(newSocket);
    return () => {
           newSocket.close();
      }
  }, []);

  useEffect(() => {
    if (!socket) {
      return;
    }
    socket.addEventListener("message", handleMessage);
    return () => {
      socket.removeEventListener("message", handleMessage);
    };

  }, [socket]);
 
  return (
    <div className='container'>
      <Property socket={socket} cube={cubeProp} sphere={sphereProp} cylinder={cylinderProp}/>
      <div>
        <div className='shapes'><h2>Shapes</h2></div>
        <DrawingCanvas vertices={cube} indices={Cube.indices} vertexNormals={Cube.vertexNormals} textureCoordinates={Cube.textureCoordinates} width={500} height={500} textImg={Texture} />
        <DrawingCanvas vertices={sphere} indices={Sphere.indices} vertexNormals={Sphere.vertexNormals} textureCoordinates={Sphere.textureCoordinates} width={500} height={500} textImg={Texture2}  />
        <DrawingCanvas vertices={cylinder} indices={Cylinder.indices} vertexNormals={Cylinder.vertexNormals} textureCoordinates={Cylinder.textureCoordinates} width={500} height={500} textImg={Texture1}/>
      </div>
    </div>
  );
}

export default App;
