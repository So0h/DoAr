import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import useSecureGLTF from "./useSecureGLTF";

function Model({ blobUrl }) {
  const { scene } = useGLTF(blobUrl);
  return <primitive object={scene} />;
}

export default function ModelViewer({ modelUrl, token }) {
  const blobUrl = useSecureGLTF(modelUrl, token);

  if (!blobUrl) return <div>Loading model...</div>;

  return (
    <Canvas style={{ height: 500 }}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 10]} />
      <Suspense fallback={null}>
        <Model blobUrl={blobUrl} />
      </Suspense>
      <OrbitControls />
    </Canvas>
  );
}
