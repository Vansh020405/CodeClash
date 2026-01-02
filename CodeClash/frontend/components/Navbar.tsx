"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Rocket, LogOut, User, Settings, LayoutDashboard, ChevronDown, FileText } from "lucide-react";

export default function Navbar() {
    // Temporarily disable NextAuth to fix Fast Refresh loop
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <nav className="border-b border-zinc-800 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                        Code<span className="text-zinc-400">Clash</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-6 text-sm">
                        <Link href="/problems" className="text-zinc-400 hover:text-white transition-colors">
                            Problems
                        </Link>

                        <Link href="/parser" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
                            <FileText size={14} />
                            Question Normalizer
                        </Link>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Auth temporarily disabled - showing guest mode */}
                    <Link href="/auth/signin">
                        <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                            Sign In
                        </Button>
                    </Link>
                    <Link href="/auth/signup">
                        <Button className="bg-white text-black hover:bg-zinc-200 border-none font-semibold">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
