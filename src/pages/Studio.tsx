import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeviceScene } from "@/components/DeviceScene";
import { GestureRecorder } from "@/components/GestureRecorder";
import { Timeline } from "@/components/Timeline";
import { ArrowLeft, Save } from "lucide-react";
import { loadProjects, saveProject } from "@/lib/storage";
import { Project, Gesture, GestureFrame } from "@/types/project";
import { toast } from "sonner";

export default function Studio() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [currentGesture, setCurrentGesture] = useState<Gesture | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gestureName, setGestureName] = useState("");

  useEffect(() => {
    if (projectId) {
      const projects = loadProjects();
      const found = projects.find((p) => p.id === projectId);
      if (found) {
        setProject(found);
      } else {
        navigate("/");
      }
    }
  }, [projectId, navigate]);

  useEffect(() => {
    if (isPlaying && currentGesture) {
      const interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= currentGesture.duration) {
            setIsPlaying(false);
            return currentGesture.duration;
          }
          return prev + 16.67; // ~60fps
        });
      }, 16.67);
      return () => clearInterval(interval);
    }
  }, [isPlaying, currentGesture]);

  const getCurrentFrame = useCallback(() => {
    if (!currentGesture || currentGesture.frames.length === 0) return null;
    
    const frame = currentGesture.frames.find((f) => f.t >= currentTime);
    return frame || currentGesture.frames[currentGesture.frames.length - 1];
  }, [currentGesture, currentTime]);

  const handleGestureComplete = (frames: GestureFrame[]) => {
    if (!project) return;
    
    const name = gestureName.trim() || `Gesture ${project.gestures.length + 1}`;
    const gesture: Gesture = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      frames,
      duration: frames[frames.length - 1]?.t || 0,
      createdAt: new Date().toISOString(),
    };

    const updatedProject = {
      ...project,
      gestures: [...project.gestures, gesture],
      updatedAt: new Date().toISOString(),
    };

    saveProject(updatedProject);
    setProject(updatedProject);
    setCurrentGesture(gesture);
    setGestureName("");
    toast.success("Gesture saved!");
  };

  const handleSave = () => {
    if (project) {
      saveProject(project);
      toast.success("Project saved!");
    }
  };

  const currentFrame = getCurrentFrame();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{project?.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {project?.gestures.length || 0} gestures
                </p>
              </div>
            </div>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Gesture Name</label>
              <Input
                placeholder="Enter gesture name..."
                value={gestureName}
                onChange={(e) => setGestureName(e.target.value)}
              />
            </div>
            <GestureRecorder onGestureComplete={handleGestureComplete} />
          </div>

          <div className="h-[500px]">
            <DeviceScene
              rotation={currentFrame?.rotation}
              position={currentFrame?.position}
            />
          </div>
        </div>

        {currentGesture && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Playback: {currentGesture.name}
              </h2>
              <div className="text-sm text-muted-foreground">
                {currentGesture.frames.length} frames
              </div>
            </div>
            
            <Timeline
              duration={currentGesture.duration}
              currentTime={currentTime}
              isPlaying={isPlaying}
              onTimeChange={setCurrentTime}
              onPlayPause={() => setIsPlaying(!isPlaying)}
              onReset={() => {
                setCurrentTime(0);
                setIsPlaying(false);
              }}
            />
          </div>
        )}

        {project?.gestures && project.gestures.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Saved Gestures</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {project.gestures.map((gesture) => (
                <Button
                  key={gesture.id}
                  variant="outline"
                  className="h-auto p-4 justify-start"
                  onClick={() => {
                    setCurrentGesture(gesture);
                    setCurrentTime(0);
                    setIsPlaying(false);
                  }}
                >
                  <div className="text-left">
                    <div className="font-semibold">{gesture.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {gesture.frames.length} frames · {(gesture.duration / 1000).toFixed(2)}s
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
