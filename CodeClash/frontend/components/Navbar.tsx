"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Rocket, LogOut, User, Settings, LayoutDashboard, ChevronDown } from "lucide-react";

export default function Navbar() {
    const { data: session, status } = useSession();
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
                        {session?.user && (
                            <Link href="/admin/generate" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
                                <Rocket size={14} />
                                AI Generator
                            </Link>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {status === "loading" ? (
                        <div className="w-20 h-8 bg-zinc-800 rounded animate-pulse"></div>
                    ) : session?.user ? (
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-3 hover:bg-zinc-800/50 p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-zinc-800"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
                                    {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="hidden sm:block text-left">
                                    <p className="text-xs font-medium text-white">{session.user.name}</p>
                                </div>
                                <ChevronDown size={14} className={`text-zinc-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-[#121212] border border-zinc-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/30">
                                        <p className="text-sm font-semibold text-white truncate">{session.user.name}</p>
                                        <p className="text-xs text-zinc-500 truncate">{session.user.email}</p>
                                    </div>

                                    <div className="py-2">
                                        <Link
                                            href="/dashboard"
                                            className="px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 flex items-center transition-colors"
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            <LayoutDashboard size={16} className="mr-3 text-blue-400" /> Dashboard
                                        </Link>
                                        <Link
                                            href="/profile"
                                            className="px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 flex items-center transition-colors"
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            <User size={16} className="mr-3 text-purple-400" /> My Profile
                                        </Link>
                                        <Link
                                            href="/settings"
                                            className="px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 flex items-center transition-colors"
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            <Settings size={16} className="mr-3 text-zinc-400" /> Settings
                                        </Link>
                                    </div>

                                    <div className="border-t border-zinc-800 py-1 mt-1">
                                        <button
                                            onClick={() => signOut()}
                                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center transition-colors group"
                                        >
                                            <LogOut size={16} className="mr-3 group-hover:text-red-300 transition-colors" /> Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
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
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
