import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";

export interface GloveData {
  ax1: number; ay1: number; az1: number;
  gx1: number; gy1: number; gz1: number;
  ax2: number; ay2: number; az2: number;
  gx2: number; gy2: number; gz2: number;
}

// --- TUNING ---
const SENSITIVITY_X = 4.0; 
const SENSITIVITY_Y = 4.0; 
const DEADZONE = 2.0;      
const SMOOTHING = 0.85;    

export const useGloveWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  // Refs
  const cursorRef = useRef({ x: 0, y: 0 });
  const clickRef = useRef(false);
  const latestDataRef = useRef<GloveData | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // Offsets (The "Center" Reference)
  const offsetsRef = useRef({ gx: 0, gy: 0, gz: 0 });
  const isCalibrated = useRef(false);
  const previousRef = useRef({ x: 0, y: 0 });

  const connectToBridge = useCallback(() => {
    const ws = new WebSocket("ws://localhost:8081");

    ws.onopen = () => {
      setIsConnected(true);
      toast.success("Connected! Glove is active.");
    };

    ws.onclose = () => {
      setIsConnected(false);
      isCalibrated.current = false; // Reset on disconnect
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.raw) processLine(msg.raw);
      } catch (e) {
        console.error(e);
      }
    };

    socketRef.current = ws;
  }, []);

  // Call this function to set the current hand position as "Center"
  const recalibrate = () => {
    isCalibrated.current = false;
    toast.info("Re-centering...");
  };

  const processLine = (line: string) => {
    const parts = line.split(",").map(Number);
    if (parts.length !== 12) return;

    const data: GloveData = {
      ax1: parts[0], ay1: parts[1], az1: parts[2],
      gx1: parts[3], gy1: parts[4], gz1: parts[5],
      ax2: parts[6], ay2: parts[7], az2: parts[8],
      gx2: parts[9], gy2: parts[10], gz2: parts[11]
    };
    latestDataRef.current = data;

    // --- AUTO-CALIBRATION (Instant) ---
    // If this is the first packet we've seen, make THIS the zero point
    if (!isCalibrated.current) {
        offsetsRef.current = { gx: 0, gy: data.gy2, gz: data.gz2 };
        isCalibrated.current = true;
        return; 
    }

    // --- MOVEMENT LOGIC ---
    let rawX = data.gz2 - offsetsRef.current.gz; // Yaw
    let rawY = data.gy2 - offsetsRef.current.gy; // Pitch

    // Deadzone
    if (Math.abs(rawX) < DEADZONE) rawX = 0;
    if (Math.abs(rawY) < DEADZONE) rawY = 0;

    // Smoothing
    const smoothX = (previousRef.current.x * SMOOTHING) + (rawX * (1 - SMOOTHING));
    const smoothY = (previousRef.current.y * SMOOTHING) + (rawY * (1 - SMOOTHING));
    previousRef.current = { x: smoothX, y: smoothY };

    // Move
    cursorRef.current.x += smoothX * SENSITIVITY_X;
    cursorRef.current.y += smoothY * SENSITIVITY_Y;

    // Clamp
    cursorRef.current.x = Math.max(-400, Math.min(400, cursorRef.current.x));
    cursorRef.current.y = Math.max(-250, Math.min(250, cursorRef.current.y));

    // Click Logic
    clickRef.current = Math.abs(data.az1) > 1.8; 
  };

  const startRecording = () => {
    socketRef.current?.send(JSON.stringify({ type: "START_REC" }));
    setIsRecording(true);
  };

  const stopRecording = () => {
    socketRef.current?.send(JSON.stringify({ type: "STOP_REC" }));
    setIsRecording(false);
    toast.success("Saved CSV");
  };

  return {
    isConnected,
    connectToBridge,
    recalibrate, // <--- New Function exposed to UI
    cursorRef,
    clickRef,
    latestDataRef,
    isRecording,
    startRecording,
    stopRecording
  };
};