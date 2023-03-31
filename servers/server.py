from fastapi import FastAPI, WebSocket

app = FastAPI()
@app.websocket("/ws")
async def websocket_endpoint(websocket:WebSocket):
    print("accepting")
    await websocket.accept()
    print("accpet")
    while True:
        try:
            data = await websocket.receive_text()
            print(data)
        except:
            pass
            break
