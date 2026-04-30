import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox, Environment, Float, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

const ComputerMonitor = () => {
  const group = useRef();
  const screenRef = useRef();
  const [isHovered, setIsHovered] = useState(false);
  const [isEvil, setIsEvil] = useState(false);
  
  // Smoothly transition eye colors
  const targetColor = new THREE.Color(isEvil ? '#ff0044' : '#00ffff');
  const currentColor = useRef(new THREE.Color('#00ffff'));

  useFrame((state, delta) => {
    // Gentle floating and looking towards mouse if hovered
    const t = state.clock.getElapsedTime();
    const targetX = isHovered ? (state.pointer.x * Math.PI) / 4 : Math.cos(t / 2) * 0.1;
    const targetY = isHovered ? (state.pointer.y * Math.PI) / 4 : Math.sin(t / 2) * 0.1;

    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetX, 0.1);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -targetY, 0.1);

    // Lerp color
    currentColor.current.lerp(targetColor, delta * 5);
    if (screenRef.current) {
      // Accessing materials safely
      const materials = screenRef.current.children.map(child => child.material).filter(Boolean);
      materials.forEach(mat => {
        if (mat.name === 'eyeMaterial') mat.color.copy(currentColor.current);
      });
    }
  });

  return (
    <group 
      ref={group}
      onPointerOver={() => {
        setIsHovered(true);
        setIsEvil(true);
      }}
      onPointerOut={() => {
        setIsHovered(false);
        setIsEvil(false);
      }}
    >
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        {/* Monitor Stand Base */}
        <Cylinder args={[0.8, 0.8, 0.1, 32]} position={[0, -1.8, 0]}>
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
        </Cylinder>
        
        {/* Monitor Stand Neck */}
        <Cylinder args={[0.15, 0.15, 1]} position={[0, -1.3, -0.2]} rotation={[0.2, 0, 0]}>
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.1} />
        </Cylinder>

        {/* Monitor Body */}
        <RoundedBox args={[3.2, 2.4, 1.2]} radius={0.1} smoothness={4} position={[0, 0, 0]}>
          <meshStandardMaterial color="#cbd5e1" roughness={0.3} metalness={0.2} />
        </RoundedBox>
        
        {/* Screen Bezel */}
        <RoundedBox args={[3.0, 2.2, 1.25]} radius={0.05} smoothness={4} position={[0, 0, 0.02]}>
          <meshStandardMaterial color="#0f172a" roughness={0.6} />
        </RoundedBox>
        
        {/* Screen Inner Glass */}
        <mesh position={[0, 0, 0.65]}>
          <planeGeometry args={[2.8, 2.0]} />
          <meshPhysicalMaterial 
            color="#020617" 
            metalness={0.9} 
            roughness={0.1} 
            clearcoat={1} 
            clearcoatRoughness={0.1} 
          />
        </mesh>

        {/* Eyes & Face Group */}
        <group ref={screenRef} position={[0, 0, 0.66]}>
          {/* Left Eye */}
          <mesh position={[-0.6, 0.2, 0]}>
            <planeGeometry args={[0.35, 0.45]} />
            <meshBasicMaterial name="eyeMaterial" color={currentColor.current} />
          </mesh>
          
          {/* Right Eye */}
          <mesh position={[0.6, 0.2, 0]}>
            <planeGeometry args={[0.35, 0.45]} />
            <meshBasicMaterial name="eyeMaterial" color={currentColor.current} />
          </mesh>
          
          {/* Evil eyebrows (animated presence) */}
          <mesh position={[-0.6, 0.5, 0.01]} rotation={[0, 0, -0.4]} scale={isEvil ? 1 : 0}>
            <planeGeometry args={[0.6, 0.15]} />
            <meshBasicMaterial name="eyeMaterial" color={currentColor.current} />
          </mesh>
          <mesh position={[0.6, 0.5, 0.01]} rotation={[0, 0, 0.4]} scale={isEvil ? 1 : 0}>
            <planeGeometry args={[0.6, 0.15]} />
            <meshBasicMaterial name="eyeMaterial" color={currentColor.current} />
          </mesh>

          {/* Mouth */}
          <mesh position={[0, -0.4, 0]}>
            <planeGeometry args={isEvil ? [1.2, 0.1] : [0.5, 0.15]} />
            <meshBasicMaterial name="eyeMaterial" color={currentColor.current} />
          </mesh>
        </group>
      </Float>
    </group>
  );
};

export default function Computer3D() {
  return (
    <div style={{ width: '100%', height: '100%', cursor: 'pointer' }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <pointLight position={[-5, -5, 5]} color="#a855f7" intensity={2} />
        <Environment preset="studio" />
        <ComputerMonitor />
      </Canvas>
    </div>
  );
}
