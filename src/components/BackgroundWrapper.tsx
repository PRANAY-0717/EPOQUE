"use client";

import dynamic from "next/dynamic";

// Lazy load Three.js — it should never block initial paint
const Background3D = dynamic(() => import("@/components/Background3D"), {
  ssr: false,
  loading: () => null,
});

export default function BackgroundWrapper() {
  return <Background3D />;
}
