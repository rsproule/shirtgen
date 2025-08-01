import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Suspense, type ReactNode } from "react";

interface Scene3DProps {
  children: ReactNode;
}

export function Scene3D({ children }: Scene3DProps) {
  return (
    <div className="flex-1 bg-gray-50 w-full h-full">
      <Canvas className="w-full h-full">
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={0.5}
          maxDistance={8}
        />
        <Environment preset="studio" />
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 3]} intensity={0.4} />
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </Canvas>
    </div>
  );
}