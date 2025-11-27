import socket
import csv
import time
import asyncio
import websockets
import json
import threading

# --- CONFIGURATION ---
UDP_IP = "0.0.0.0"
UDP_PORT = 4210       # Must match your ESP32 code
WEBSOCKET_PORT = 8081 # The website will connect to this
FILENAME = "glove_data.csv"

# Shared State
latest_data = None
is_recording = False
csv_file = None
csv_writer = None

# --- 1. UDP LISTENER (Listens to Glove) ---
# --- UDP LISTENER (Background Thread) ---
def udp_listener():
    global latest_data, is_recording, csv_writer
    
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.bind((UDP_IP, UDP_PORT))
    print(f"📡 Listening for Glove on UDP Port {UDP_PORT}")
    
    # Track connection state
    first_packet = True

    while True:
        try:
            data, addr = sock.recvfrom(1024)
            
            # --- DIAGNOSTIC PRINT (Only once) ---
            if first_packet:
                print(f"\n🎉 SUCCESS! RECEIVED DATA FROM GLOVE ({addr[0]})")
                print("Your connection is working. Check the website now.\n")
                first_packet = False
            # ------------------------------------

            line = data.decode('utf-8').strip()
            parts = line.split(',')
            
            if len(parts) == 12:
                latest_data = line
                if is_recording and csv_writer:
                    parts.append(time.time())
                    csv_writer.writerow(parts)
        except Exception as e:
            print(f"UDP Error: {e}")

# --- 2. WEBSOCKET SERVER (Talks to Website) ---
async def handler(websocket):
    global is_recording, csv_file, csv_writer
    print("✅ Website Connected!")
    
    try:
        while True:
            # Check for messages from the website (Start/Stop recording)
            try:
                message = await asyncio.wait_for(websocket.recv(), timeout=0.01)
                command = json.loads(message)
                
                if command["type"] == "START_REC":
                    print("🔴 Recording Started")
                    csv_file = open(FILENAME, mode='w', newline='')
                    csv_writer = csv.writer(csv_file)
                    # Write Header
                    csv_writer.writerow(["ax1","ay1","az1","gx1","gy1","gz1","ax2","ay2","az2","gx2","gy2","gz2","timestamp"])
                    is_recording = True
                    
                elif command["type"] == "STOP_REC":
                    print("Hz Recording Stopped")
                    is_recording = False
                    if csv_file: csv_file.close()
                    
            except (asyncio.TimeoutError, json.JSONDecodeError):
                pass 

            # Send the latest sensor data to the website
            if latest_data:
                await websocket.send(json.dumps({"raw": latest_data}))
            
            await asyncio.sleep(0.01) # Send updates at 100Hz
            
    except websockets.ConnectionClosed:
        print("❌ Website Disconnected")

async def main():
    # Start UDP listener in a separate thread
    t = threading.Thread(target=udp_listener, daemon=True)
    t.start()
    
    # Start WebSocket Server
    print(f"🔗 Bridge running on ws://localhost:{WEBSOCKET_PORT}")
    async with websockets.serve(handler, "localhost", WEBSOCKET_PORT):
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    asyncio.run(main())