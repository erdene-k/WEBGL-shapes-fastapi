import React from 'react';

import '../App.css';
interface propertyProps{
    socket: WebSocket|null
}
const Property = ({socket}:propertyProps) => {

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
                    <input disabled type="number" name="side" id="side"  placeholder='side'/>
                </div>
        
                <div className='properties'>  
                    <label htmlFor="radius">Sphere</label>
                    <input disabled type="number" name="radius" id="radius"  placeholder='radius' />
                </div>
    
  
          
                <div className='cylinder'>  
                    <label htmlFor="cylinder">Cylinder</label>
                    <input disabled type="number" name="radius" id="cylinder" placeholder='radius'/>
                    <input disabled type="number" name="height" id="cylinder-height" placeholder='height' />
                </div>
             
                <button type="submit">Generate random</button>
            </form>
        </div>
  )
}

export default Property