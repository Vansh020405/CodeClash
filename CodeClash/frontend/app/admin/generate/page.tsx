"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";

export default function RedirectPage() {
    const router = useRouter();
    const { isDarkMode } = useTheme();

    useEffect(() => {
        router.replace("/generator");
    }, [router]);

    return (
        <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'}`}>
            <div className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>Redirecting to Problem Standardizer...</div>
        </div>
    );
}
