"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, Chrome, Mail, Lock, Sparkles } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            setError("Invalid credentials");
            setLoading(false);
        } else {
            router.push("/");
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Sparkles className="text-blue-500" size={32} />
                        <h1 className="text-3xl font-bold text-white">CodeClash</h1>
                    </div>
                    <p className="text-zinc-400">Sign in to generate problems</p>
                </div>

                {/* Sign In Card */}
                <div className="bg-[#1a1a1a] border border-zinc-800 rounded-lg p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Welcome Back</h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Email/Password Form */}
                    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="pl-10 bg-zinc-900 border-zinc-700"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="pl-10 bg-zinc-900 border-zinc-700"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500"
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-zinc-700"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-[#1a1a1a] px-2 text-zinc-500">Or continue with</span>
                        </div>
                    </div>

                    {/* OAuth Buttons */}
                    <div className="space-y-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full border-zinc-700 hover:bg-zinc-800"
                            onClick={() => signIn("google", { callbackUrl: "/" })}
                        >
                            <Chrome size={18} className="mr-2" />
                            Continue with Google
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full border-zinc-700 hover:bg-zinc-800"
                            onClick={() => signIn("github", { callbackUrl: "/" })}
                        >
                            <Github size={18} className="mr-2" />
                            Continue with GitHub
                        </Button>
                    </div>

                    {/* Sign Up Link */}
                    <div className="mt-6 text-center text-sm text-zinc-400">
                        Don't have an account?{" "}
                        <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300">
                            Sign up
                        </Link>
                    </div>
                </div>

                {/* Note */}
                <p className="mt-4 text-center text-xs text-zinc-600">
                    OAuth providers require API keys. Use email/password for now.
                </p>
            </div>
        </div>
    );
}
