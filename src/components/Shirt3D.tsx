import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type TexturePlacement = "front" | "back" | "full-shirt";

interface Shirt3DProps {
  imageUrl: string;
  texturePlacement: TexturePlacement;
}

export function Shirt3D({ imageUrl, texturePlacement }: Shirt3DProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const [targetRotation, setTargetRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Load the GLB model
  const { scene } = useGLTF("/oversized_t-shirt.glb");

  // Create a single instance of the shirt that we'll reuse
  const shirtScene = useMemo(() => {
    const cloned = scene.clone();

    // Debug: Log all children to see what's in the scene
    console.log("Scene children before cleanup:", cloned.children.length);
    cloned.traverse((child) => {
      console.log("Child:", child.name, child.type, child.userData);
    });

    // Remove any existing added geometries from the original
    const toRemove: THREE.Object3D[] = [];
    cloned.traverse((child) => {
      if (
        child.userData.isAddedTexture ||
        child.name.includes("plane") ||
        child.name.includes("Plane") ||
        (child.type === "Mesh" && child.geometry?.type === "PlaneGeometry")
      ) {
        toRemove.push(child);
      }
    });

    console.log("Removing", toRemove.length, "objects");
    toRemove.forEach((obj) => {
      if (obj.parent) {
        obj.parent.remove(obj);
      }
    });

    console.log("Scene children after cleanup:", cloned.children.length);
    return cloned;
  }, [scene]);

  // Create custom texture based on placement
  const customTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Set canvas size to higher resolution for better quality
    canvas.width = 2048;
    canvas.height = 2048;

    // Fill with white background
    ctx.fillStyle = "#d1d1d1";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Create a temporary image to draw the design texture
    const img = new Image();
    img.crossOrigin = "anonymous";

    return new Promise<THREE.CanvasTexture>((resolve) => {
      img.onload = () => {
        // Enable high-quality image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

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
            const frontSize = canvas.width * 0.2; // Scale with canvas size (20% of width)
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
            const backSize = canvas.width * 0.2; // Scale with canvas size (20% of width)
            const backX = canvas.width * 0.84 - backSize; // Move toward right side of UV
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

        // Improve texture quality
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.anisotropy = Math.max(1, 4); // Improve quality at angles
        texture.generateMipmaps = true;
        texture.colorSpace = THREE.SRGBColorSpace;

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

  // Smooth rotation animation
  useFrame((_, delta) => {
    if (groupRef.current && isAnimating) {
      const current = groupRef.current.rotation.y;
      const difference = targetRotation - current;

      // Normalize the difference to take the shortest path
      const normalizedDiff =
        (((difference % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2)) -
        Math.PI;

      const rotationSpeed = 4; // Adjust speed as needed
      const step = normalizedDiff * delta * rotationSpeed;

      if (Math.abs(normalizedDiff) < 0.01) {
        // Close enough, snap to target and stop animating
        groupRef.current.rotation.y = targetRotation;
        setIsAnimating(false);
      } else {
        groupRef.current.rotation.y += step;
      }
    }
  });

  // Position shirt based on texture placement mode with smooth transition
  useEffect(() => {
    if (groupRef.current) {
      let newTargetRotation = 0;

      switch (texturePlacement) {
        case "front":
        case "full-shirt":
          newTargetRotation = 0;
          break;
        case "back":
          newTargetRotation = Math.PI;
          break;
      }

      if (newTargetRotation !== targetRotation) {
        setTargetRotation(newTargetRotation);
        setIsAnimating(true);
      }
    }
  }, [texturePlacement, targetRotation]);

  // Apply the custom texture to the GLB model using useEffect to avoid multiple applications
  useEffect(() => {
    if (!shirtScene) return;

    const applyTexture = async () => {
      // Reset all materials to clean state first
      shirtScene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const mesh = child as THREE.Mesh<
            THREE.BufferGeometry,
            THREE.Material
          >;

          // Dispose of old material if it exists
          if (mesh.material && "dispose" in mesh.material) {
            (mesh.material as any).dispose();
          }

          // Apply clean base material
          mesh.material = new THREE.MeshStandardMaterial({
            color: "#d1d1d1",
            roughness: 0.9,
            metalness: 0.0,
            side: THREE.DoubleSide,
          });
        }
      });

      // Apply texture if available
      if (customTexture) {
        const texture = await customTexture;
        shirtScene.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            const mesh = child as THREE.Mesh<
              THREE.BufferGeometry,
              THREE.Material
            >;

            // Dispose of old material
            if (mesh.material && "dispose" in mesh.material) {
              (mesh.material as any).dispose();
            }

            // Apply textured material
            mesh.material = new THREE.MeshStandardMaterial({
              map: texture,
              color: "#d1d1d1",
              roughness: 0.9,
              metalness: 0.0,
              transparent: false,
              side: THREE.DoubleSide,
            });
          }
        });
      }
    };

    applyTexture();
  }, [shirtScene, customTexture, texturePlacement]);

  return (
    <group ref={groupRef}>
      <primitive object={shirtScene} scale={[2, 2, 2]} position={[0, -2, 0]} />
    </group>
  );
}

// Preload the GLB model for better performance
useGLTF.preload("/oversized_t-shirt.glb");
