import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Circle, Square } from "lucide-react";
import { GestureFrame } from "@/types/project";
import { Card } from "@/components/ui/card";

interface GestureRecorderProps {
  onGestureComplete: (frames: GestureFrame[]) => void;
}

export const GestureRecorder = ({ onGestureComplete }: GestureRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [frames, setFrames] = useState<GestureFrame[]>([]);
  const [startTime, setStartTime] = useState(0);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isRecording) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 4;
      const y = -((e.clientY - rect.top) / rect.height - 0.5) * 4;
      const z = 0;

      const frame: GestureFrame = {
        t: Date.now() - startTime,
        position: { x, y, z },
        rotation: {
          x: y * 0.5,
          y: x * 0.5,
          z: 0,
        },
      };

      setFrames((prev) => [...prev, frame]);
    },
    [isRecording, startTime]
  );

  const startRecording = () => {
    setIsRecording(true);
    setFrames([]);
    setStartTime(Date.now());
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (frames.length > 0) {
      onGestureComplete(frames);
      setFrames([]);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Gesture Recording</h3>
            <p className="text-sm text-muted-foreground">
              {isRecording ? "Move your mouse to record" : "Click record to start"}
            </p>
          </div>
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            variant={isRecording ? "destructive" : "default"}
            size="lg"
          >
            {isRecording ? (
              <>
                <Square className="w-5 h-5 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Circle className="w-5 h-5 mr-2 fill-current" />
                Record
              </>
            )}
          </Button>
        </div>

        <div
          onMouseMove={handleMouseMove}
          className={`
            relative w-full h-64 rounded-lg border-2 border-dashed
            ${
              isRecording
                ? "border-primary bg-primary/5 cursor-crosshair"
                : "border-border bg-muted"
            }
            transition-all
          `}
        >
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
            {isRecording ? (
              <div className="text-center">
                <div className="text-2xl font-mono mb-2">{frames.length}</div>
                <div>frames captured</div>
              </div>
            ) : (
              "Recording area"
            )}
          </div>
          
          {isRecording && frames.length > 0 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <polyline
                points={frames
                  .map((f, i) => {
                    if (i === 0) return "";
                    const prevFrame = frames[i - 1];
                    const x1 = ((prevFrame.position.x / 4) + 0.5) * 100;
                    const y1 = ((-prevFrame.position.y / 4) + 0.5) * 100;
                    const x2 = ((f.position.x / 4) + 0.5) * 100;
                    const y2 = ((-f.position.y / 4) + 0.5) * 100;
                    return `${x1}%,${y1}% ${x2}%,${y2}%`;
                  })
                  .join(" ")}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeOpacity="0.6"
              />
            </svg>
          )}
        </div>

        {frames.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Duration: {((Date.now() - startTime) / 1000).toFixed(2)}s
          </div>
        )}
      </div>
    </Card>
  );
};
