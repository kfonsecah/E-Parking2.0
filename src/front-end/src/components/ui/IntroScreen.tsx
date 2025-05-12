'use client';

import { useEffect, useState } from 'react';
import dynamic from "next/dynamic";
import { useRouter } from 'next/navigation';
import animationData from '@/../public/media/animations/car.json'; // asegúrate de que el path es correcto
import '@/app/css/IntroScreen.css';

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function IntroScreen() {
    const router = useRouter();
    const [showWelcome, setShowWelcome] = useState(false);
    const [currentText, setCurrentText] = useState('Bienvenido');

    useEffect(() => {
        const welcomeTimeout = setTimeout(() => {
            setCurrentText('Welcome');
            setShowWelcome(true);
        }, 3000);

        const redirectTimeout = setTimeout(() => {
            router.push('/auth');
        }, 5000);

        return () => {
            clearTimeout(welcomeTimeout);
            clearTimeout(redirectTimeout);
        };
    }, [router]);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white overflow-hidden">
            {/* Texto centrado vertical y horizontalmente */}
            <div className="text-center mb-8">
                <svg
                    className="svg-title mx-auto w-full max-w-full h-[250px] md:h-[250px]"
                    viewBox="0 0 1600 500"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <text
                        key={`fill-${currentText}`}
                        x="50%"
                        y="50%"
                        dominantBaseline="middle"
                        textAnchor="middle"
                        className="svg-fill-text"
                    >
                        {currentText}
                    </text>
                    <text
                        key={`stroke-${currentText}`}
                        x="50%"
                        y="50%"
                        dominantBaseline="middle"
                        textAnchor="middle"
                        className="svg-stroke-text"
                    >
                        {currentText}
                    </text>
                </svg>
            </div>

            {/* Texto Park Xpress */}
            <h3 className="text-xl md:text-2xl font-semibold tracking-widest text-white mb-2">
                Park Xpress
            </h3>

            <div className="fixed bottom-10 left-0 w-[300px] h-[300px] animate-car-left-to-right">
                <Lottie animationData={animationData} loop={true} />
            </div>

        </div>
    );
}