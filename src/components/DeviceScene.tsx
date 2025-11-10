import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import * as THREE from "three";

interface DeviceSceneProps {
  rotation?: { x: number; y: number; z: number };
  position?: { x: number; y: number; z: number };
}

const Device = ({ rotation, position }: DeviceSceneProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current && rotation) {
      meshRef.current.rotation.x = rotation.x;
      meshRef.current.rotation.y = rotation.y;
      meshRef.current.rotation.z = rotation.z;
    }
    if (meshRef.current && position) {
      meshRef.current.position.x = position.x;
      meshRef.current.position.y = position.y;
      meshRef.current.position.z = position.z;
    }
  });

  return (
    <group>
      {/* Main device body */}
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[1, 2, 0.2]} />
        <meshStandardMaterial color="#1fb8cd" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Screen */}
      <mesh position={[0, 0, 0.11]} castShadow>
        <planeGeometry args={[0.8, 1.6]} />
        <meshStandardMaterial color="#0a1929" emissive="#1fb8cd" emissiveIntensity={0.2} />
      </mesh>
      
      {/* Axes helpers for orientation */}
      <axesHelper args={[1.5]} />
    </group>
  );
};

export const DeviceScene = (props: DeviceSceneProps) => {
  return (
    <div className="w-full h-full bg-gradient-subtle rounded-lg overflow-hidden border border-border">
      <Canvas
        camera={{ position: [3, 3, 3], fov: 50 }}
        shadows
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#0f1419"]} />
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#1fb8cd" />
        
        <Device {...props} />
        
        <Grid
          args={[10, 10]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#2a3f5f"
          sectionSize={1}
          sectionThickness={1}
          sectionColor="#3d5a7f"
          fadeDistance={20}
          fadeStrength={1}
          followCamera={false}
        />
        
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={2}
          maxDistance={10}
        />
      </Canvas>
    </div>
  );
};
