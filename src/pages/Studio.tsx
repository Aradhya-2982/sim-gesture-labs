import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Wifi, Circle, Square, MousePointer2, Crosshair } from "lucide-react";
import { useGloveWebSocket } from "@/hooks/useGloveWebSocket"; 

export default function Studio() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { 
    isConnected,
    connectToBridge, 
    recalibrate, // <--- New
    cursorRef, 
    clickRef, 
    latestDataRef,
    isRecording, 
    startRecording, 
    stopRecording 
  } = useGloveWebSocket();

  useEffect(() => {
    connectToBridge();
  }, [connectToBridge]);

  useEffect(() => {
    let animationFrameId: number;
    const render = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      
      if (canvas && ctx) {
        ctx.fillStyle = "#0f1419";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0); ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.moveTo(0, canvas.height / 2); ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();

        const x = cursorRef.current.x + (canvas.width / 2);
        const y = cursorRef.current.y + (canvas.height / 2);

        ctx.beginPath();
        ctx.arc(x, y, 15, 0, 2 * Math.PI);
        ctx.fillStyle = clickRef.current ? "#22c55e" : "#3b82f6";
        ctx.fill();
        
        if (clickRef.current) {
          ctx.beginPath();
          ctx.arc(x, y, 40, 0, 2 * Math.PI);
          ctx.strokeStyle = "#22c55e";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">Wireless Glove Studio</h1>
          </div>
          
          <div className={`flex items-center gap-2 font-mono text-sm px-3 py-1 rounded border 
                ${isConnected ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}>
              <Wifi className="w-4 h-4" />
              {isConnected ? "CONNECTED" : "DISCONNECTED"}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Controls</h3>
              <div className="flex flex-col gap-3">
                <Button
                    onClick={recalibrate}
                    variant="outline"
                    className="w-full h-12 text-lg border-dashed border-2"
                >
                    <Crosshair className="w-5 h-5 mr-2" /> RESET CENTER
                </Button>

                <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    variant={isRecording ? "destructive" : "default"}
                    className="w-full h-12 text-lg"
                    disabled={!isConnected}
                >
                    {isRecording ? (
                    <><Square className="w-5 h-5 mr-2 fill-current" /> STOP RECORDING</>
                    ) : (
                    <><Circle className="w-5 h-5 mr-2 fill-current" /> START RECORDING</>
                    )}
                </Button>
              </div>
            </Card>

            <Card className="p-6 flex flex-col items-center justify-center min-h-[200px]">
              <div className={`transition-all duration-100 flex flex-col items-center gap-4 ${clickRef.current ? "scale-110" : "scale-100"}`}>
                <MousePointer2 className={`w-16 h-16 ${clickRef.current ? "text-green-500 fill-green-500" : "text-gray-600"}`} />
                <span className={`text-xl font-bold font-mono ${clickRef.current ? "text-green-500" : "text-gray-600"}`}>
                  {clickRef.current ? "CLICK!" : "IDLE"}
                </span>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="p-1 bg-black border-2 border-border relative overflow-hidden shadow-2xl">
              <div className="absolute top-4 left-4 text-xs font-mono text-green-500/50 pointer-events-none">
                LIVE GLOVE CURSOR
              </div>
              <canvas ref={canvasRef} width={800} height={500} className="w-full h-[500px]" />
            </Card>
            
            <div className="grid grid-cols-2 gap-4">
               <Card className="p-4 bg-muted/30">
                 <div className="text-xs font-mono text-muted-foreground mb-1">Index Finger</div>
                 <div className="font-mono text-sm">
                   Z-Accel: {latestDataRef.current?.az1.toFixed(2) || "0.00"}
                 </div>
               </Card>
               <Card className="p-4 bg-muted/30">
                 <div className="text-xs font-mono text-muted-foreground mb-1">Palm Sensor</div>
                 <div className="font-mono text-sm grid grid-cols-2">
                   <div>X: {latestDataRef.current?.gz2.toFixed(2) || "0.00"}</div>
                   <div>Y: {latestDataRef.current?.gy2.toFixed(2) || "0.00"}</div>
                 </div>
               </Card>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}