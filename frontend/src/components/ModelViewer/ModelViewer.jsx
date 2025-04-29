import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useLoader } from "@react-three/fiber";

function Model({ url }) {
  const gltf = useLoader(GLTFLoader, url);
  return <primitive object={gltf.scene} />;
}

export default function ModelViewer({ uploadId, mainFile }) {
  if (!uploadId || !mainFile) return null;

  const url = `http://localhost:5000/api/model/file/${uploadId}/${mainFile}`;

  return (
    <Canvas style={{ height: "100vh", background: "#f0f0f0" }} gl={{ preserveDrawingBuffer: true }}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} />
      <Suspense fallback={<Fallback />}>
        <Model url={url} />
      </Suspense>
      <OrbitControls />
    </Canvas>
  );
}

// Fallback while model is loading
function Fallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="lightgray" />
    </mesh>
  );
}
