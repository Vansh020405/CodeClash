"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Code2, Zap, Trophy, TrendingUp, ArrowRight, Play, CheckCircle, Terminal, Rocket, Sparkles, Brain, Lock, FileText, Cpu } from "lucide-react";
import axios from "axios";
import Navbar from "@/components/Navbar";
import { useTheme } from "@/context/ThemeContext";

const API_URL = "http://localhost:8000/api";

export default function HomePage() {
  const [problems, setProblems] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, easy: 0, medium: 0, hard: 0 });
  const { isDarkMode } = useTheme();

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

  const pageBg = isDarkMode ? "bg-[#050505]" : "bg-slate-50";
  const textColor = isDarkMode ? "text-zinc-100" : "text-slate-900";
  const mutedText = isDarkMode ? "text-zinc-400" : "text-slate-500";
  const cardBg = isDarkMode ? "bg-[#0b0b0b] border-white/5 shadow-lg" : "bg-white border-slate-200 shadow-xl shadow-slate-200/50";
  const sectionBg = isDarkMode ? "bg-zinc-900/20" : "bg-white";
  const footerBg = isDarkMode ? "bg-black/40 border-white/5" : "bg-slate-50 border-slate-200";

  return (
    <div className={`min-h-screen font-sans selection:bg-purple-500/30 overflow-x-hidden transition-colors duration-300 ${pageBg} ${textColor}`}>
      <Navbar />

      {/* Background Ambient Glow - Only in dark mode for now, or subtle in light */}
      {isDarkMode && (
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          {/* Hero Text */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <div className={`inline-flex items-center gap-2 border rounded-full px-4 py-1.5 mb-8 backdrop-blur-md ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className={`text-sm font-medium ${isDarkMode ? 'text-zinc-300' : 'text-slate-600'}`}>New: Submission History & Analysis</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold mb-6 tracking-tight leading-[1.1]">
              <span className={isDarkMode ? "bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent" : "text-slate-900"}>
                Master Algorithms <br />
              </span>
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">With AI Precision</span>
            </h1>

            <p className={`text-lg mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed ${mutedText}`}>
              Experience the next generation of coding interviews.
              Real-time judging, AI-generated problems, and deep performance analytics.
              Now with full submission tracking and history.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link href="/problems">
                <Button size="lg" className={`h-14 px-8 rounded-full text-base font-semibold transition-all duration-300 shadow-lg hover:scale-105 active:scale-95 ${isDarkMode
                    ? 'bg-white text-black hover:bg-zinc-200 shadow-white/25'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/30 hover:brightness-110 border-0'
                  }`}>
                  Start Solving
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
              <Link href="/problem/two-sum">
                <Button size="lg" variant="outline" className={`h-14 px-8 rounded-full text-base font-semibold transition-all duration-300 border-2 hover:scale-105 active:scale-95 ${isDarkMode
                    ? 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/30 backdrop-blur-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 shadow-sm'
                  }`}>
                  <Play size={16} className="mr-2 fill-current" />
                  Try Demo
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className={`mt-12 grid grid-cols-3 gap-6 border-t pt-8 ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
              <div>
                <div className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stats.total}+</div>
                <div className="text-xs text-zinc-500 uppercase tracking-widest">Problems</div>
              </div>
              <div>
                <div className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>50 ms</div>
                <div className="text-xs text-zinc-500 uppercase tracking-widest">Avg Latency</div>
              </div>
              <div>
                <div className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>99.9%</div>
                <div className="text-xs text-zinc-500 uppercase tracking-widest">Uptime</div>
              </div>
            </div>
          </div>

          {/* Hero Visual - Mock Code Editor */}
          <div className="lg:w-1/2 relative perspective-1000 group mt-12 lg:mt-0">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-[80px] -z-10 rounded-full opacity-60"></div>

            {/* Main Code Window */}
            <div className="relative bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden transform transition-all duration-700 hover:rotate-y-0 hover:rotate-x-0 rotate-y-[-6deg] rotate-x-[6deg] group-hover:scale-[1.02]">
              {/* Window Controls */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/40"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/40"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/40"></div>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                  <Code2 size={12} />
                  <span>solution.cpp</span>
                </div>
              </div>

              {/* Code Content */}
              <div className="p-5 font-mono text-xs md:text-sm leading-relaxed text-zinc-300 bg-black/40 backdrop-blur-sm">
                <div className="flex opacity-50 mb-2"><span className="w-6 text-zinc-700 select-none">1</span><span className="text-zinc-500">// Two Sum Solution - O(n)</span></div>
                <div className="flex"><span className="w-6 text-zinc-700 select-none">2</span><span><span className="text-purple-400">class</span> <span className="text-yellow-200">Solution</span> {'{'}</span></div>
                <div className="flex"><span className="w-6 text-zinc-700 select-none">3</span><span className="ml-4"><span className="text-purple-400">public:</span></span></div>
                <div className="flex"><span className="w-6 text-zinc-700 select-none">4</span><span className="ml-8"><span className="text-blue-400">vector</span>&lt;<span className="text-blue-400">int</span>&gt; twoSum(<span className="text-blue-400">vector</span>&lt;<span className="text-blue-400">int</span>&gt;& nums, <span className="text-blue-400">int</span> target) {'{'}</span></div>
                <div className="flex"><span className="w-6 text-zinc-700 select-none">5</span><span className="ml-12"><span className="text-blue-400">unordered_map</span>&lt;<span className="text-blue-400">int</span>, <span className="text-blue-400">int</span>&gt; map;</span></div>
                <div className="flex"><span className="w-6 text-zinc-700 select-none">6</span><span className="ml-12"><span className="text-purple-400">for</span> (<span className="text-blue-400">int</span> i = 0; i &lt; nums.size(); i++) {'{'}</span></div>
                <div className="flex"><span className="w-6 text-zinc-700 select-none">7</span><span className="ml-16"><span className="text-blue-400">int</span> complement = target - nums[i];</span></div>
                <div className="flex"><span className="w-6 text-zinc-700 select-none">8</span><span className="ml-16"><span className="text-purple-400">if</span> (map.count(complement)) {'{'}</span></div>
                <div className="flex highlight-box bg-purple-500/10 -mx-4 px-4 border-l-2 border-purple-500/50"><span className="w-6 text-zinc-700 select-none">9</span><span className="ml-20"><span className="text-purple-400">return</span> {'{'}map[complement], i{'}'};</span></div>
                <div className="flex"><span className="w-6 text-zinc-700 select-none">10</span><span className="ml-16">{'}'}</span></div>
                <div className="flex"><span className="w-6 text-zinc-700 select-none">11</span><span className="ml-16">map[nums[i]] = i;</span></div>
                <div className="flex"><span className="w-6 text-zinc-700 select-none">12</span><span className="ml-12">{'}'}</span></div>
                <div className="flex"><span className="w-6 text-zinc-700 select-none">13</span><span className="ml-8">{'}'}</span></div>
                <div className="flex"><span className="w-6 text-zinc-700 select-none">14</span><span>{'}'};</span></div>
              </div>
            </div>

            {/* Floating Elements - Blending with Background */}

            {/* Verdict Card */}
            <div className="absolute -right-4 top-16 bg-[#0f0f0f]/95 border border-green-500/20 rounded-xl p-4 shadow-[0_0_40px_rgba(34,197,94,0.1)] backdrop-blur-md animate-float z-20 hidden lg:block">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                  <CheckCircle size={20} className="text-green-500" />
                </div>
                <div>
                  <div className="text-sm font-bold text-zinc-100">Accepted</div>
                  <div className="text-[10px] text-zinc-400 font-mono mt-0.5">Runtime: 0.04ms</div>
                </div>
              </div>
            </div>

            {/* Language/Stats Tag */}
            <div className="absolute -left-6 bottom-24 bg-[#0f0f0f]/95 border border-white/10 rounded-xl p-4 shadow-2xl backdrop-blur-md animate-float delay-700 z-20 hidden lg:block max-w-[220px]">
              <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
                <Terminal size={14} className="text-purple-400" />
                <span className="text-xs font-bold text-zinc-300">Execution Output</span>
              </div>
              <div className="space-y-2 font-mono text-[10px]">
                <div className="flex justify-between text-zinc-500">
                  <span>Status</span>
                  <span className="text-green-400">Finished</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Memory</span>
                  <span className="text-zinc-300">4.2 MB</span>
                </div>
                <div className="mt-2 bg-black/50 p-2 rounded text-zinc-400 border border-white/5">
                  &gt; All test cases passed.
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Standardizer Workflow Section */}
      <section className={`relative z-10 py-24 ${sectionBg}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles size={12} />
              The Engine
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">How the Standardizer Works</h2>
            <p className={`text-lg max-w-2xl mx-auto ${mutedText}`}>
              Transforming chaos into executable code. Our pipeline ensures every problem is ready for competitive solving.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent -translate-y-1/2 z-0"></div>

            {/* Step 1 */}
            <div className="relative z-10 group">
              <div className={`${cardBg} rounded-2xl p-8 hover:border-blue-500/30 transition-all duration-300 h-full flex flex-col items-center text-center hover:shadow-blue-500/10`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ${isDarkMode ? 'bg-zinc-900 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                  <FileText size={32} className={`group-hover:text-blue-400 transition-colors ${isDarkMode ? 'text-zinc-400' : 'text-slate-400'}`} />
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border ${isDarkMode ? 'bg-zinc-800/50 text-zinc-500 border-white/5' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>Step 01</div>
                <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Raw Input</h3>
                <p className={`text-sm leading-relaxed ${mutedText}`}>
                  Users provide raw problem descriptions, unstructured text, or even vague algorithm ideas. No formatting required.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 group">
              <div className={`${cardBg} rounded-2xl p-8 hover:border-purple-500/30 transition-all duration-300 h-full flex flex-col items-center text-center hover:shadow-purple-500/10`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 relative ${isDarkMode ? 'bg-zinc-900 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Cpu size={32} className={`group-hover:text-purple-400 transition-colors relative z-10 ${isDarkMode ? 'text-zinc-400' : 'text-slate-400'}`} />
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border ${isDarkMode ? 'bg-zinc-800/50 text-zinc-500 border-white/5' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>Step 02</div>
                <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>AI Normalization</h3>
                <p className={`text-sm leading-relaxed ${mutedText}`}>
                  Our "Standardizer" engine analyzes requirements, extracts test cases, defined I/O formats, and generates validation scripts.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 group">
              <div className={`${cardBg} rounded-2xl p-8 hover:border-green-500/30 transition-all duration-300 h-full flex flex-col items-center text-center hover:shadow-green-500/10`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ${isDarkMode ? 'bg-zinc-900 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                  <Code2 size={32} className={`group-hover:text-green-400 transition-colors ${isDarkMode ? 'text-zinc-400' : 'text-slate-400'}`} />
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border ${isDarkMode ? 'bg-zinc-800/50 text-zinc-500 border-white/5' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>Step 03</div>
                <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Ready to Solve</h3>
                <p className={`text-sm leading-relaxed ${mutedText}`}>
                  A fully structured coding challenge is generated, complete with hidden test cases, ready for the live execution environment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Everything needed to excel</h2>
            <p className={mutedText}>Built for performance, designed for learning.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard isDarkMode={isDarkMode} icon={<Zap className="text-yellow-400" />} title="Fast Execution" desc="Docker-based sandbox for safe, instant code runs." />
            <FeatureCard isDarkMode={isDarkMode} icon={<Trophy className="text-purple-400" />} title="Real-time Judging" desc="Immediate verdict on 50+ test cases per problem." />
            <FeatureCard isDarkMode={isDarkMode} icon={<TrendingUp className="text-blue-400" />} title="Performance Metrics" desc="Detailed analytics on runtime and memory usage." />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`relative z-10 border-t backdrop-blur-xl py-12 ${footerBg}`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
              C
            </div>
            <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>CodeClash</span>
          </div>
          <p className="text-zinc-500 text-sm">© 2025 CodeClash. Built for builders.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc, isDarkMode }: any) {
  const cardBg = isDarkMode ? "bg-zinc-900/20 border-white/5 hover:border-white/10 hover:bg-zinc-900/40" : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50";
  const iconBg = isDarkMode ? "bg-white/5" : "bg-slate-100";
  const titleColor = isDarkMode ? "text-white" : "text-slate-900";
  const descColor = isDarkMode ? "text-zinc-400" : "text-slate-500";

  return (
    <div className={`p-6 rounded-2xl border transition-all group ${cardBg}`}>
      <div className={`mb-4 p-3 rounded-xl w-fit group-hover:scale-110 transition-transform duration-300 ${iconBg}`}>{icon}</div>
      <h3 className={`text-lg font-bold mb-2 ${titleColor}`}>{title}</h3>
      <p className={`text-sm leading-relaxed ${descColor}`}>{desc}</p>
    </div>
  )
}
