"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ─── Puzzle piece shape generator ──────────────────────────────
function createPuzzlePieceShape(): THREE.Shape {
  const shape = new THREE.Shape();
  const s = 1; // base size

  // Start bottom-left
  shape.moveTo(-s, -s);

  // Bottom edge with tab (outward bump)
  shape.lineTo(-0.3 * s, -s);
  shape.bezierCurveTo(
    -0.3 * s, -1.4 * s,
    0.3 * s, -1.4 * s,
    0.3 * s, -s
  );
  shape.lineTo(s, -s);

  // Right edge with tab (outward bump)
  shape.lineTo(s, -0.3 * s);
  shape.bezierCurveTo(
    1.4 * s, -0.3 * s,
    1.4 * s, 0.3 * s,
    s, 0.3 * s
  );
  shape.lineTo(s, s);

  // Top edge with blank (inward notch)
  shape.lineTo(0.3 * s, s);
  shape.bezierCurveTo(
    0.3 * s, 0.65 * s,
    -0.3 * s, 0.65 * s,
    -0.3 * s, s
  );
  shape.lineTo(-s, s);

  // Left edge with blank (inward notch)
  shape.lineTo(-s, 0.3 * s);
  shape.bezierCurveTo(
    -0.65 * s, 0.3 * s,
    -0.65 * s, -0.3 * s,
    -s, -0.3 * s
  );
  shape.lineTo(-s, -s);

  return shape;
}

// ─── Floating particles ────────────────────────────────────────
function Particles({ count = 200 }: { count?: number }) {
  const mesh = useRef<THREE.Points>(null!);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.y = state.clock.elapsedTime * 0.012;
    mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.008) * 0.04;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#00f0ff"
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ─── Floating puzzle piece ─────────────────────────────────────
function FloatingPuzzlePiece({
  position,
  color,
  speed,
  scale,
  rotationOffset,
}: {
  position: [number, number, number];
  color: string;
  speed: number;
  scale: number;
  rotationOffset: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);

  const geometry = useMemo(() => {
    const shape = createPuzzlePieceShape();
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 1,
    });
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.x = t * speed * 0.15 + rotationOffset;
    ref.current.rotation.y = t * speed * 0.2 + rotationOffset * 0.5;
    ref.current.rotation.z = Math.sin(t * speed * 0.3) * 0.3;
    ref.current.position.y =
      position[1] + Math.sin(t * speed * 0.4 + rotationOffset) * 0.8;
    ref.current.position.x =
      position[0] + Math.cos(t * speed * 0.2 + rotationOffset) * 0.3;
  });

  return (
    <mesh ref={ref} position={position} scale={scale} geometry={geometry}>
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.1}
        wireframe
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ─── Solid glowing puzzle (smaller, brighter accent) ───────────
function GlowPuzzle({
  position,
  color,
  speed,
  scale,
}: {
  position: [number, number, number];
  color: string;
  speed: number;
  scale: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);

  const geometry = useMemo(() => {
    const shape = createPuzzlePieceShape();
    return new THREE.ShapeGeometry(shape);
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.z = t * speed * 0.25;
    ref.current.position.y =
      position[1] + Math.sin(t * speed * 0.5) * 0.5;
  });

  return (
    <mesh ref={ref} position={position} scale={scale} geometry={geometry}>
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.06}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// ─── Puzzle grid outline (like a jigsaw board) ─────────────────
function PuzzleGrid() {
  const ref = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.z = -12 + Math.sin(state.clock.elapsedTime * 0.08) * 0.5;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.05;
    ref.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.03) * 0.03;
  });

  const pieces = useMemo(() => {
    const items: { pos: [number, number, number]; scale: number; color: string }[] = [];
    const colors = ["#00f0ff", "#8a2be2", "#ff3366"];
    // Create a scattered grid of puzzle outlines
    for (let x = -3; x <= 3; x += 2) {
      for (let y = -2; y <= 2; y += 2) {
        items.push({
          pos: [x * 1.5, y * 1.5, 0],
          scale: 0.6,
          color: colors[(x + y + 10) % 3],
        });
      }
    }
    return items;
  }, []);

  const geometry = useMemo(() => {
    const shape = createPuzzlePieceShape();
    const points = shape.getPoints(40);
    return new THREE.BufferGeometry().setFromPoints(
      points.map((p) => new THREE.Vector3(p.x, p.y, 0))
    );
  }, []);

  return (
    <group ref={ref}>
      {pieces.map((piece, i) => (
        <lineLoop key={i} position={piece.pos} scale={piece.scale} geometry={geometry}>
          <lineBasicMaterial color={piece.color} transparent opacity={0.08} />
        </lineLoop>
      ))}
    </group>
  );
}

// ─── Connecting dot lines (puzzle connectors) ──────────────────
function ConnectorLines() {
  const ref = useRef<THREE.LineSegments>(null!);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.z = -10 + Math.sin(state.clock.elapsedTime * 0.06) * 0.3;
    ref.current.rotation.z = state.clock.elapsedTime * 0.01;
  });

  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    // Create connecting lines between random points
    for (let i = 0; i < 20; i++) {
      const x1 = (Math.random() - 0.5) * 20;
      const y1 = (Math.random() - 0.5) * 15;
      const x2 = x1 + (Math.random() - 0.5) * 6;
      const y2 = y1 + (Math.random() - 0.5) * 6;
      points.push(new THREE.Vector3(x1, y1, 0));
      points.push(new THREE.Vector3(x2, y2, 0));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  return (
    <lineSegments ref={ref} geometry={geometry}>
      <lineBasicMaterial color="#8a2be2" transparent opacity={0.04} />
    </lineSegments>
  );
}

// ─── Main scene ────────────────────────────────────────────────
function Scene() {
  return (
    <>
      <Particles count={200} />
      <PuzzleGrid />
      <ConnectorLines />

      {/* Large floating wireframe puzzle pieces */}
      <FloatingPuzzlePiece position={[-5, 2, -4]} color="#00f0ff" speed={0.3} scale={0.8} rotationOffset={0} />
      <FloatingPuzzlePiece position={[6, -1, -6]} color="#8a2be2" speed={0.22} scale={1.0} rotationOffset={2} />
      <FloatingPuzzlePiece position={[0, 4, -8]} color="#ff3366" speed={0.18} scale={0.6} rotationOffset={4} />
      <FloatingPuzzlePiece position={[-7, -3, -5]} color="#ff3366" speed={0.25} scale={0.5} rotationOffset={1} />
      <FloatingPuzzlePiece position={[8, 3, -7]} color="#00f0ff" speed={0.2} scale={0.7} rotationOffset={3} />
      <FloatingPuzzlePiece position={[-2, -5, -9]} color="#8a2be2" speed={0.15} scale={0.9} rotationOffset={5} />

      {/* Flat glowing puzzle silhouettes */}
      <GlowPuzzle position={[-4, -2, -6]} color="#00f0ff" speed={0.15} scale={1.5} />
      <GlowPuzzle position={[5, 4, -10]} color="#8a2be2" speed={0.12} scale={2.0} />
      <GlowPuzzle position={[3, -3, -8]} color="#ff3366" speed={0.1} scale={1.2} />
    </>
  );
}

// ─── Exported wrapper ──────────────────────────────────────────
export default function Background3D() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: "transparent" }}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
