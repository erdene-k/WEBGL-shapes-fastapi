from fastapi import FastAPI, WebSocket
# pip install websockets, fastapi, uvicorn[standard]
# uvicorn server:app --reload --port 8000
import random
import json
import asyncio
app = FastAPI()


@app.websocket("/ws")
async def websocket_endpoint(websocket:WebSocket):
    await websocket.accept()
    print("accepted")
    await websocket.receive_text()
    while True:
        try: 
            randObj = {
                "cube": random.uniform(0.2, 1.2),
                "sphere": random.uniform(0.2, 1.2),
                "cylinder": random.uniform(0.2, 1.2),
                }
            randJSON = json.dumps(randObj)
         
            await websocket.send_json(randJSON)
            await asyncio.sleep(3)

        except Exception as e:
            print('error:', e)
            break
    

