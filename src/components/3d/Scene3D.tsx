import { Canvas } from "@react-three/fiber";
import {
  Environment,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { Suspense, type ReactNode } from "react";

interface Scene3DProps {
  children: ReactNode;
}

export function Scene3D({ children }: Scene3DProps) {
  return (
    <div className="h-full w-full flex-1 bg-gray-50">
      <Canvas className="h-full w-full">
        <PerspectiveCamera makeDefault position={[0, 0, 3]} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={0.5}
          maxDistance={10}
          target={[0, 0, 0]}
        />
        <Environment preset="apartment" />
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 5, 3]} intensity={0.3} />
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  );
}
