"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Code2, Zap, Trophy, TrendingUp, ArrowRight, Play, CheckCircle, Terminal, Rocket, Sparkles, Brain, Lock } from "lucide-react";
import axios from "axios";
import Navbar from "@/components/Navbar";

const API_URL = "http://localhost:8000/api";

export default function HomePage() {
  const { data: session } = useSession();
  const [problems, setProblems] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, easy: 0, medium: 0, hard: 0 });

  useEffect(() => {
    axios.get(`${API_URL}/problems/`)
      .then(res => {
        const data = res.data.results || res.data;
        setProblems(data.slice(0, 3));

        const total = data.length;
        const easy = data.filter((p: any) => p.difficulty === 'Easy').length;
        const medium = data.filter((p: any) => p.difficulty === 'Medium').length;
        const hard = data.filter((p: any) => p.difficulty === 'Hard').length;

        setStats({ total, easy, medium, hard });
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-purple-500/30">
      <Navbar />

      {/* Background Ambient Glow */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute top-[40%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[140px] animate-pulse delay-700"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[140px] animate-pulse delay-1000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8 backdrop-blur-md animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium text-zinc-300">Live Code Execution Engine</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tight leading-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            Master the Art of <br />
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Algorithm Design</span>
          </h1>

          <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join the elite community of developers. Solve complex problems, compete in real-time, and leverage AI to push your boundaries.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link href="/problems">
              <Button size="lg" className="h-14 px-8 rounded-full bg-white text-black hover:bg-zinc-200 text-base font-semibold transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                Start Solving
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
            <Link href="/problem/two-sum">
              <Button size="lg" variant="outline" className="h-14 px-8 rounded-full border-white/20 hover:bg-white/10 text-base font-semibold backdrop-blur-sm">
                <Play size={16} className="mr-2" />
                Try Demo
              </Button>
            </Link>
          </div>

          {/* Floating Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <StatBox label="Problems" value={stats.total} icon={<Brain size={20} className="text-blue-400" />} />
            <StatBox label="Users" value="1.2k+" icon={<Zap size={20} className="text-yellow-400" />} />
            <StatBox label="Submissions" value="45k+" icon={<Code2 size={20} className="text-green-400" />} />
            <StatBox label="Uptime" value="99.9%" icon={<Trophy size={20} className="text-purple-400" />} />
          </div>
        </div>
      </section>

      {/* AI AI Generation Feature Section (Prominent) */}
      <section className="relative z-10 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="relative rounded-3xl p-[1px] bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-pink-500/50 shadow-2xl shadow-purple-500/20">
            <div className="bg-[#0b0b0b] rounded-[23px] p-8 md:p-16 overflow-hidden relative">
              {/* Background Effects inside card */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none"></div>

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="md:w-1/2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider mb-4">
                    <Sparkles size={12} />
                    AI Powered
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                    Unlimited Practice with AI
                  </h2>
                  <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                    Stuck on a concept? Need a specific type of problem?
                    Our Gemini-powered engine generates unique algorithmic challenges tailored to your input.
                    Convert any idea into a LeetCode-style problem instantly.
                  </p>

                  {session?.user ? (
                    <Link href="/admin/generate">
                      <Button className="h-12 px-8 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-lg shadow-purple-600/20 transition-all hover:scale-105">
                        <Sparkles size={18} className="mr-2" />
                        Generate Problem Now
                      </Button>
                    </Link>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <Button disabled className="h-12 px-8 rounded-xl bg-zinc-800 text-zinc-500 font-semibold cursor-not-allowed border border-zinc-700">
                        <Lock size={18} className="mr-2" />
                        Login to Generate
                      </Button>
                      <p className="text-xs text-zinc-500 pl-2">Sign in to access AI features</p>
                    </div>
                  )}
                </div>

                <div className="md:w-1/2 relative">
                  {/* Mock UI for AI Gen */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                    <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-4">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-xs text-zinc-500 ml-2">AI Generator Preview</span>
                    </div>
                    <div className="space-y-3">
                      <div className="h-2 w-3/4 bg-zinc-800 rounded animate-pulse"></div>
                      <div className="h-2 w-1/2 bg-zinc-800 rounded animate-pulse"></div>
                      <div className="h-2 w-5/6 bg-zinc-800 rounded animate-pulse"></div>
                      <div className="mt-4 p-4 bg-black/50 rounded-lg border border-zinc-800">
                        <code className="text-purple-400 text-xs">
                          &gt; Generating problem: "Reverse Linked List II"...<br />
                          &gt; Creating test cases...<br />
                          &gt; <span className="text-green-400">Done!</span>
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything needed to excel</h2>
            <p className="text-zinc-400">Built for performance, designed for learning.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard icon={<Zap className="text-yellow-400" />} title="Fast Execution" desc="Docker-based sandbox for safe, instant code runs." />
            <FeatureCard icon={<Trophy className="text-purple-400" />} title="Real-time Judging" desc="Immediate verdict on 50+ test cases per problem." />
            <FeatureCard icon={<TrendingUp className="text-blue-400" />} title="Performance Metrics" desc="Detailed analytics on runtime and memory usage." />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-black/20 backdrop-blur-xl py-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-zinc-500 text-sm">
          <p>© 2025 CodeClash. The Developer's Arena.</p>
        </div>
      </footer>
    </div>
  );
}

function StatBox({ label, value, icon }: any) {
  return (
    <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 p-4 rounded-2xl hover:bg-zinc-900/60 transition-colors">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-white/5 rounded-lg">{icon}</div>
        <span className="text-2xl font-bold text-white">{value}</span>
      </div>
      <p className="text-xs text-zinc-500 uppercase tracking-wide font-medium text-left pl-1">{label}</p>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="p-6 rounded-2xl bg-zinc-900/20 border border-white/5 hover:border-white/10 hover:bg-zinc-900/40 transition-all group">
      <div className="mb-4 p-3 bg-white/5 rounded-xl w-fit group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}
