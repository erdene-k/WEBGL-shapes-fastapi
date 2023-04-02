import React from 'react';

import '../App.css';
interface propertyProps{
    socket: WebSocket|null,
    cube?:number,
    sphere?:number,
    cylinder?:number,
}
const Property = ({socket, cube, sphere, cylinder}:propertyProps) => {
    const handleSubmit = (event:React.FormEvent) => {
        event.preventDefault();
        if (!socket) {
          return;
        }
        socket.send(JSON.stringify({value:true }));
      };
   
  return (
    <div>
        <h2>Properties</h2>
            <form  onSubmit={handleSubmit}>
                <div className='properties'>  
                    <label htmlFor="side">Cube</label>
                    <input disabled type="number" name="side" id="side" value={cube}  placeholder='side'/>
                </div>
                <div className='properties'>  
                    <label htmlFor="radius">Sphere</label>
                    <input disabled type="number" name="radius" id="radius" value={sphere} placeholder='radius' />
                </div>
                <div className='cylinder'>  
                    <label htmlFor="cylinder">Cylinder</label>
                    <input disabled type="number" name="radius" id="cylinder" placeholder='radius' value={cylinder}/>
                    <input disabled type="number" name="height" id="cylinder-height" placeholder='height' value={cylinder&&cylinder*2}/>
                </div>

                <button type="submit">Generate random</button>
            </form>
        </div>
  )
}

export default Property