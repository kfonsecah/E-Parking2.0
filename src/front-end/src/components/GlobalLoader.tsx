'use client';

const dynamic1 = 'force-dynamic';

import { useLoader } from "@/context/LoaderContext";
import dynamic from "next/dynamic";
import { LottieRefCurrentProps } from "lottie-react";
import wheelAnimation from "@/../public/media/animations/wheel.json";
import { useRef, useEffect } from "react";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function GlobalLoader() {
  const { isLoading } = useLoader();
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  // Aumentar la velocidad de la animación
  useEffect(() => {
    if (isLoading && lottieRef.current) {
      lottieRef.current.setSpeed(2.5); // 🔥 Cambiá este número para más velocidad (default es 1)
    }
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="w-[220px] h-[220px]">
        <Lottie
          lottieRef={lottieRef}
          animationData={wheelAnimation}
          loop
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
