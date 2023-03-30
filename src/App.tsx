import React from 'react';
import './App.css';
import { Cube } from './Shapes/Cube';
import { Sphere } from './Shapes/Sphere';
import { Cylinder } from './Shapes/Cylinder';
import DrawingCanvas from './pages/DrawingCanvas';

import img from './textures/cubetexture.png'
function App() {

  return (
    <div className='Shapes'>
      <DrawingCanvas vertices={Cube.vertices} indices={Cube.indices} vertexNormals={Cube.vertexNormals} textureCoordinates={Cube.textureCoordinates} width={400} height={400} textImg={img} />
      <DrawingCanvas vertices={Sphere.vertices} indices={Sphere.indices} vertexNormals={Sphere.vertexNormals} textureCoordinates={Sphere.textureCoordinates} width={400} height={400} textImg={img} />
      <DrawingCanvas vertices={Cylinder.vertices} indices={Cylinder.indices} vertexNormals={Cylinder.vertexNormals} textureCoordinates={Cylinder.textureCoordinates} width={400} height={400} textImg={img} />
    </div>
  );
}

export default App;
