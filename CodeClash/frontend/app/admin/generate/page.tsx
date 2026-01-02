"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/generator");
    }, [router]);

    return (
        <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
            <div className="text-zinc-400">Redirecting to Problem Standardizer...</div>
        </div>
    );
}
