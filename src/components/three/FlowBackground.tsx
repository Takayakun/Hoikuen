'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Plane } from '@react-three/drei';
import * as THREE from 'three';

const WaterShader = {
  uniforms: {
    time: { value: 0 },
    resolution: { value: new THREE.Vector2() },
    mouse: { value: new THREE.Vector2() },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform vec2 resolution;
    uniform vec2 mouse;
    varying vec2 vUv;

    vec3 hsv2rgb(vec3 c) {
      vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
      vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
      return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }

    void main() {
      vec2 uv = vUv;
      vec2 center = vec2(0.5);
      
      float dist = distance(uv, center);
      float ripple = sin(dist * 20.0 - time * 2.0) * 0.5 + 0.5;
      
      vec2 mouseEffect = (mouse - 0.5) * 0.1;
      uv += mouseEffect * (1.0 - dist);
      
      float wave = sin(uv.x * 10.0 + time) * sin(uv.y * 10.0 + time * 0.8) * 0.1;
      
      vec3 color1 = vec3(0.133, 0.827, 0.933); // Water blue
      vec3 color2 = vec3(0.055, 0.455, 0.565); // Water dark
      
      vec3 color = mix(color1, color2, ripple + wave);
      
      gl_FragColor = vec4(color, 0.3);
    }
  `,
};

function WaterPlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  const mouseRef = useRef(new THREE.Vector2(0.5, 0.5));
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      resolution: { value: new THREE.Vector2(
        typeof window !== 'undefined' ? window.innerWidth : 1920,
        typeof window !== 'undefined' ? window.innerHeight : 1080
      ) },
      mouse: { value: new THREE.Vector2(0.5, 0.5) },
    }),
    []
  );

  useFrame((state) => {
    if (meshRef.current) {
      uniforms.time.value = state.clock.elapsedTime;
      uniforms.mouse.value.lerp(mouseRef.current, 0.1);
    }
  });

  return (
    <Plane
      ref={meshRef}
      args={[20, 20, isMobile ? 16 : 32, isMobile ? 16 : 32]}
      position={[0, 0, -2]}
      onPointerMove={!isMobile ? (e) => {
        mouseRef.current.set(e.uv!.x, e.uv!.y);
      } : undefined}
    >
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={WaterShader.vertexShader}
        fragmentShader={WaterShader.fragmentShader}
        transparent
        depthWrite={false}
      />
    </Plane>
  );
}

export default function FlowBackground() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="fixed inset-0 -z-10">
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={isMobile ? 1 : window.devicePixelRatio}
        performance={{ min: 0.5 }}
      >
        <WaterPlane />
      </Canvas>
    </div>
  );
}