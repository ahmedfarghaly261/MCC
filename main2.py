import asyncio
import serial
import time
from fastapi import FastAPI, WebSocket

app = FastAPI(title="Universal Satellite RS-485 Gateway")


SERIAL_PORT = 'COM11'   
BAUD_RATE = 115200      
FLAG = 0xC0

ser = serial.Serial(
    port=SERIAL_PORT,
    baudrate=BAUD_RATE,
    bytesize=serial.EIGHTBITS,
    parity=serial.PARITY_NONE,
    stopbits=serial.STOPBITS_ONE,
    timeout=1
)

def read_one_frame(ser: serial.Serial, max_wait: float = 15.0) -> bytes:
    start = time.time()
    buffer = bytearray()
    started = False
    while (time.time() - start) < max_wait:
        byte = ser.read(1)
        if not byte:
            continue
        b = byte[0]
        if not started:
            if b == FLAG:
                started = True
                buffer.append(b)
            continue
        buffer.append(b)
        if b == FLAG and len(buffer) > 1:
            return bytes(buffer)
    return b""

def send_over_rs485(raw_frame: bytes):
   
    ser.rts = True       
    ser.write(raw_frame) 
    ser.flush()           
    ser.rts = False        

@app.websocket("/ws/radio")
async def radio_bridge(websocket: WebSocket):
    await websocket.accept()
    print("🛰️ Ground Station Connected via Radio Link.")
    try:
        while True:
            raw_frame = await websocket.receive_bytes()
            print(f"🚀 [MCC OUTBOUND] {raw_frame.hex().upper()}")

            await asyncio.to_thread(send_over_rs485, raw_frame)

            
            if len(raw_frame) >= 4 and raw_frame[3] == 0x01:
                continue

            reply = await asyncio.to_thread(read_one_frame, ser, 15.0)
            if reply:
                print(f"📡 [HARDWARE INBOUND] {reply.hex().upper()}")
                await websocket.send_bytes(reply)
            else:
                print("❌ Timeout waiting for reply from satellite.")
    except Exception as e:
        print(f"❌ Radio link closed: {e}")

@app.get("/")
async def status():
    return {"gateway": "active", "mode": "rs485-radio-bridge"}

#uvicorn main2:app --host 0.0.0.0 --port 8050