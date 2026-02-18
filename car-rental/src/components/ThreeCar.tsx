import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

function Model() {
  const { scene } = useGLTF("/car.glb") as { scene: THREE.Group };
  const ref = useRef<THREE.Group>(null);
  const model = useMemo(() => scene.clone(true), [scene]);

  useLayoutEffect(() => {
    if (!ref.current) return;

    const box = new THREE.Box3().setFromObject(ref.current);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = 6 / maxDim;

    ref.current.scale.setScalar(scale);
    ref.current.position.set(-center.x * scale, -center.y * scale - 0.35, -center.z * scale);
  }, [model]);

  useFrame(() => {
    if (!ref.current) return;
    ref.current.rotation.y += 0.003;
  });

  return <primitive ref={ref} object={model} />;
}

export default function ThreeCar() {
  return (
    <div className="absolute inset-0 z-10">
      <Canvas camera={{ position: [0, 0.8, 8], fov: 38 }} style={{ background: "transparent" }}>
        <ambientLight intensity={0.75} />
        <directionalLight position={[4, 6, 5]} intensity={1.2} color="#ffffff" />
        <pointLight position={[-4, 4, -4]} intensity={0.8} color="#00f5ff" />

        <Suspense fallback={null}>
          <Model />
        </Suspense>

        <Environment preset="city" />

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate={true}
          autoRotate
          autoRotateSpeed={0.8}
          minPolarAngle={Math.PI / 2.2}
          maxPolarAngle={Math.PI / 1.8}
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/car.glb");
