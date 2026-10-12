"use client";

import Image from "next/image"
import Logo from "../../public/vercel.png"
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const SPLASH_DURATION = 1500;

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      const token = localStorage.getItem("token");
      const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");

      if (token) {
        router.replace("/accueil");
      } else if (!hasSeenOnboarding) {
        router.replace("/onboarding");
      } else {
        router.replace("/login");
      }
    }, SPLASH_DURATION);

    return () => clearTimeout(timer);
  }, [router]);

  return (
        <div className="w-screen h-screen bg-primary flex justify-center items-center">
          <Image src={Logo} alt="logo-autogo" width={60} height={60}/>
        </div>
  );
}
