import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type TexturePlacement = "front" | "back" | "full-shirt";

interface Shirt3DProps {
  imageUrl: string;
  texturePlacement: TexturePlacement;
}

export function Shirt3D({ imageUrl, texturePlacement }: Shirt3DProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const sceneRef = useRef<THREE.Group | null>(null);

  // Load the GLB model
  const { scene } = useGLTF("/oversized_t-shirt.glb");

  // Clone the scene to avoid modifying the original
  const clonedScene = useMemo(() => {
    return scene.clone();
  }, [scene]);

  // Create custom texture based on placement
  const customTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Set canvas size to texture size
    canvas.width = 1024;
    canvas.height = 1024;

    // Fill with white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Create a temporary image to draw the design texture
    const img = new Image();
    img.crossOrigin = "anonymous";

    return new Promise<THREE.CanvasTexture>((resolve) => {
      img.onload = () => {
        // Rotate context to fix 90-degree offset
        ctx.save();

        switch (texturePlacement) {
          case "full-shirt": {
            // Fill the entire UV map but shift left to center on chest
            ctx.translate(canvas.width * 0.3, canvas.height / 2);
            ctx.rotate(Math.PI);
            ctx.drawImage(
              img,
              -canvas.width / 2,
              -canvas.height / 2,
              canvas.width,
              canvas.height,
            );
            break;
          }

          case "front": {
            // Small patch on chest area - adjust position for front placement
            const frontSize = 200;
            const frontX = canvas.width * 0.2; // Move toward left side of UV
            const frontY = canvas.height * 0.3; // Upper area
            ctx.translate(frontX + frontSize / 2, frontY + frontSize / 2);
            ctx.rotate(Math.PI);
            ctx.drawImage(
              img,
              -frontSize / 2,
              -frontSize / 2,
              frontSize,
              frontSize,
            );
            break;
          }

          case "back": {
            // Small patch on back area - adjust position for back placement
            const backSize = 200;
            const backX = canvas.width * 0.83 - backSize; // Move toward right side of UV
            const backY = canvas.height * 0.3; // Upper area
            ctx.translate(backX + backSize / 2, backY + backSize / 2);
            ctx.rotate(Math.PI);
            ctx.drawImage(
              img,
              -backSize / 2,
              -backSize / 2,
              backSize,
              backSize,
            );
            break;
          }
        }

        ctx.restore();

        const texture = new THREE.CanvasTexture(canvas);
        texture.flipY = false;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        resolve(texture);
      };

      img.onerror = () => {
        // If image fails to load, create white texture
        const texture = new THREE.CanvasTexture(canvas);
        texture.flipY = false;
        resolve(texture);
      };

      // Handle different image sources
      if (imageUrl.startsWith("data:")) {
        img.src = imageUrl;
      } else if (imageUrl.startsWith("/")) {
        img.src = imageUrl;
      } else {
        // For external URLs, we might need to handle CORS
        img.src = imageUrl;
      }
    });
  }, [imageUrl, texturePlacement]);

  // Auto-rotate the shirt
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  // Apply the custom texture to the GLB model
  if (clonedScene && customTexture) {
    customTexture.then((texture) => {
      clonedScene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const mesh = child as THREE.Mesh<
            THREE.BufferGeometry,
            THREE.Material
          >;
          const originalMaterial = child.material as THREE.MeshStandardMaterial;

          // Apply the custom texture directly to the mesh
          mesh.material = new THREE.MeshStandardMaterial({
            map: texture,
            color: "#cccccc",
            roughness: 0.9,
            metalness: 0.0,
            transparent: false,
            side: THREE.DoubleSide,
          });
          mesh.material.needsUpdate = true;
        }
      });
    });
  } else if (clonedScene) {
    // Reset to white material when no texture
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mesh = child as THREE.Mesh<THREE.BufferGeometry, THREE.Material>;

        mesh.material = new THREE.MeshStandardMaterial({
          color: "#cccccc",
          roughness: 0.9,
          metalness: 0.0,
          side: THREE.DoubleSide,
        });
        mesh.material.needsUpdate = true;
      }
    });
  }

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} scale={[2, 2, 2]} position={[0, -2, 0]} />
    </group>
  );
}

// Preload the GLB model for better performance
useGLTF.preload("/oversized_t-shirt.glb");
