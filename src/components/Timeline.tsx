import { useState, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";

interface TimelineProps {
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  onTimeChange: (time: number) => void;
  onPlayPause: () => void;
  onReset: () => void;
}

export const Timeline = ({
  duration,
  currentTime,
  isPlaying,
  onTimeChange,
  onPlayPause,
  onReset,
}: TimelineProps) => {
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${seconds}.${milliseconds.toString().padStart(2, "0")}s`;
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={onPlayPause}
            className="h-10 w-10"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onReset}
            className="h-10 w-10"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>

          <div className="flex-1 px-2">
            <Slider
              value={[currentTime]}
              max={duration}
              step={16.67} // ~60fps
              onValueChange={([value]) => onTimeChange(value)}
              className="cursor-pointer"
            />
          </div>

          <div className="font-mono text-sm min-w-[100px] text-right">
            <span className="text-primary">{formatTime(currentTime)}</span>
            <span className="text-muted-foreground"> / {formatTime(duration)}</span>
          </div>
        </div>

        <div className="h-16 bg-muted rounded-lg relative overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-primary/20"
            style={{
              width: `${(currentTime / duration) * 100}%`,
              transition: isPlaying ? "none" : "width 0.1s",
            }}
          />
          <div
            className="absolute top-0 w-0.5 h-full bg-primary shadow-glow"
            style={{
              left: `${(currentTime / duration) * 100}%`,
              transition: isPlaying ? "none" : "left 0.1s",
            }}
          />
        </div>
      </div>
    </Card>
  );
};
