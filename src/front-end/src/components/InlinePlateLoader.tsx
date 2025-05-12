// src/components/ui/InlinePlateLoader.tsx
'use client'

import dynamic from "next/dynamic";
import plateAnimation from "@/../public/media/animations/plate.json";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function InlinePlateLoader() {
  return (
    <div className="w-full h-10 flex items-center justify-center bg-white border border-gray-300 rounded-md px-2">
      <Lottie animationData={plateAnimation} loop className="w-8 h-8" />
      <span className="text-sm text-gray-500 ml-2">Detectando placa...</span>
    </div>
  );
}
