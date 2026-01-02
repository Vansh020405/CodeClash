"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, Chrome, Mail, Lock, User, Sparkles } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import Navbar from "@/components/Navbar";

export default function SignUpPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const { isDarkMode } = useTheme();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Simple signup - in production, call your backend API
        // For now, just auto-sign them in
        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            setError("Signup failed");
            setLoading(false);
        } else {
            router.push("/");
        }
    };

    const gradientBg = isDarkMode
        ? "bg-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black"
        : "bg-slate-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/40 via-slate-50 to-slate-50";

    const cardBg = isDarkMode
        ? "bg-zinc-900/60 backdrop-blur-xl border-white/10 shadow-2xl shadow-black/50"
        : "bg-white/80 backdrop-blur-xl border-slate-200 shadow-xl shadow-slate-200/50";

    const textColor = isDarkMode ? "text-white" : "text-slate-900";
    const subTextColor = isDarkMode ? "text-zinc-400" : "text-slate-500";

    const inputBg = isDarkMode
        ? "bg-zinc-800/50 border-white/5 text-white placeholder:text-zinc-500 focus:bg-zinc-800 focus:border-blue-500/50 ring-offset-0 focus-visible:ring-1 focus-visible:ring-blue-500/50"
        : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500/50 ring-offset-0 focus-visible:ring-1 focus-visible:ring-blue-500/50";

    const dividerColor = isDarkMode ? "border-zinc-800" : "border-slate-200";

    const outlineBtn = isDarkMode
        ? "border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white bg-zinc-900/30"
        : "border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 bg-white";

    return (
        <div className={`min-h-screen transition-colors duration-300 ${gradientBg}`}>
            <Navbar />

            <div className="flex items-center justify-center p-4 min-h-[calc(100vh-120px)]">
                <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Sparkles className="text-blue-500" size={32} />
                            <h1 className={`text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent`}>CodeClash</h1>
                        </div>
                        <p className={subTextColor}>Create your account to start coding</p>
                    </div>

                    {/* Sign Up Card */}
                    <div className={`border rounded-2xl p-8 ${cardBg}`}>
                        <h2 className={`text-2xl font-bold mb-6 ${textColor}`}>Get Started</h2>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Sign Up Form */}
                        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                            <div>
                                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${subTextColor}`}>
                                    Name
                                </label>
                                <div className="relative">
                                    <User className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} size={18} />
                                    <Input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="John Doe"
                                        className={`pl-10 h-11 ${inputBg}`}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${subTextColor}`}>
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} size={18} />
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className={`pl-10 h-11 ${inputBg}`}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${subTextColor}`}>
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} size={18} />
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className={`pl-10 h-11 ${inputBg}`}
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <p className="mt-1 text-xs text-zinc-500">Must be at least 6 characters</p>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium shadow-lg shadow-blue-500/20 transition-all"
                            >
                                {loading ? "Creating account..." : "Create Account"}
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className={`w-full border-t ${dividerColor}`}></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className={`px-2 ${subTextColor} ${isDarkMode ? 'bg-[#151515]' : 'bg-white'}`}>Or sign up with</span>
                            </div>
                        </div>

                        {/* OAuth Buttons */}
                        <div className="space-y-3">
                            <Button
                                type="button"
                                variant="outline"
                                className={`w-full h-11 ${outlineBtn}`}
                                onClick={() => signIn("google", { callbackUrl: "/" })}
                            >
                                <Chrome size={18} className="mr-2" />
                                Google
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                className={`w-full h-11 ${outlineBtn}`}
                                onClick={() => signIn("github", { callbackUrl: "/" })}
                            >
                                <Github size={18} className="mr-2" />
                                GitHub
                            </Button>
                        </div>

                        {/* Sign In Link */}
                        <div className={`mt-6 text-center text-sm ${subTextColor}`}>
                            Already have an account?{" "}
                            <Link href="/auth/signin" className="text-blue-500 hover:text-blue-400 font-medium">
                                Sign in
                            </Link>
                        </div>
                    </div>

                    {/* Note */}
                    <p className={`mt-6 text-center text-xs opacity-60 ${subTextColor}`}>
                        By continuing, you agree to CodeClash's Terms of Service.
                    </p>
                </div>
            </div>
        </div>
    );
}
