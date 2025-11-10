export interface GestureFrame {
  t: number; // timestamp in ms
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  sensors?: {
    accelerometer?: { x: number; y: number; z: number };
    gyroscope?: { x: number; y: number; z: number };
  };
  meta?: Record<string, any>;
}

export interface Gesture {
  id: string;
  name: string;
  frames: GestureFrame[];
  duration: number;
  createdAt: string;
  labels?: Array<{ start: number; end: number; label: string }>;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  gestures: Gesture[];
  deviceConfig?: {
    name: string;
    dof: number;
    sensors: string[];
  };
}
