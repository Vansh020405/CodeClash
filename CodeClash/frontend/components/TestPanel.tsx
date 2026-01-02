import React, { useState, useEffect } from "react";
import { Check, X, Clock, Terminal, AlertCircle, CheckCircle2, XCircle } from "lucide-react";

interface TestPanelProps {
    problem: any;
    output: any;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    submissions?: any[];
}

export default function TestPanel({ problem, output, activeTab, setActiveTab, submissions }: TestPanelProps) {
    const [activeCaseIndex, setActiveCaseIndex] = useState(0);

    // Ensure active case index is valid when switching outputs
    useEffect(() => {
        setActiveCaseIndex(0);
    }, [output, problem]);

    if (!problem) return null;

    // Helper to get status color
    const getStatusColor = (status: string) => {
        if (!status) return "text-zinc-500";
        if (status === "Accepted" || status === "Passed") return "text-green-500";
        if (status === "Wrong Answer" || status === "Failed") return "text-red-500";
        if (status === "TLE") return "text-yellow-500";
        return "text-zinc-500";
    };

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] font-sans border-t border-white/5">
            {/* Header / Tabs */}
            <div className="flex items-center h-10 bg-[#0a0a0a] border-b border-white/5 px-2 select-none relative z-20">
                <button
                    onClick={() => setActiveTab("testcases")}
                    className={`relative flex items-center gap-2 px-4 h-full text-xs font-medium transition-all ${activeTab === "testcases"
                        ? "text-blue-400 bg-blue-500/5"
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                        }`}
                >
                    <Terminal size={14} />
                    Test Cases
                    {activeTab === "testcases" && (
                        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("results")}
                    className={`relative flex items-center gap-2 px-4 h-full text-xs font-medium transition-all ${activeTab === "results"
                        ? "text-white bg-white/5"
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                        }`}
                >
                    {output?.verdict === "Accepted" ? (
                        <CheckCircle2 size={14} className="text-green-500" />
                    ) : output?.verdict ? (
                        <XCircle size={14} className="text-red-500" />
                    ) : (
                        <Clock size={14} />
                    )}
                    Results
                    {activeTab === "results" && (
                        <div className={`absolute bottom-0 left-0 w-full h-[1px] shadow-[0_0_8px_rgba(255,255,255,0.4)] ${output?.verdict === 'Accepted' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : output?.verdict ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-white'}`}></div>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("submissions")}
                    className={`relative flex items-center gap-2 px-4 h-full text-xs font-medium transition-all ${activeTab === "submissions"
                        ? "text-purple-400 bg-purple-500/5"
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                        }`}
                >
                    <Clock size={14} />
                    Submissions
                    {activeTab === "submissions" && (
                        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]"></div>
                    )}
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative bg-[#0a0a0a]">

                {/* --- TESTCASE MODE --- */}
                {activeTab === "testcases" && (
                    <div className="h-full flex flex-col">
                        {/* Case Tabs - Fixed Header */}
                        <div className="p-3 border-b border-white/5 bg-[#0a0a0a] flex-shrink-0">
                            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
                                {problem.test_cases?.filter((tc: any) => !tc.is_hidden).map((tc: any, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveCaseIndex(idx)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap border ${activeCaseIndex === idx
                                            ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                                            : "bg-zinc-900/50 border-white/5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                                            }`}
                                    >
                                        Case {idx + 1}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Input Fields - Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            <div className="space-y-4">
                                {(() => {
                                    const publicCases = problem.test_cases?.filter((tc: any) => !tc.is_hidden) || [];
                                    const currentCase = publicCases[activeCaseIndex];
                                    if (!currentCase) return <div className="text-zinc-500 text-xs text-center py-10">No test cases available</div>;

                                    return (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2 block">Input</label>
                                                <div className="relative group">
                                                    <textarea
                                                        readOnly
                                                        value={currentCase.input_data}
                                                        className="w-full bg-[#121212] border border-white/5 rounded-xl p-4 text-xs font-mono text-zinc-300 outline-none resize-none min-h-[100px] transition-colors group-hover:border-white/10"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2 block">Expected Output</label>
                                                <div className="relative group">
                                                    <textarea
                                                        readOnly
                                                        value={currentCase.expected_output}
                                                        className="w-full bg-[#121212] border border-white/5 rounded-xl p-4 text-xs font-mono text-zinc-300 outline-none resize-none min-h-[80px] group-hover:border-white/10"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TEST RESULT MODE --- */}
                {activeTab === "results" && (
                    <div className="h-full flex flex-col p-6 overflow-y-auto custom-scrollbar">
                        {!output ? (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-600">
                                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-zinc-800">
                                    <Terminal size={24} className="opacity-50" />
                                </div>
                                <div className="text-sm font-medium mb-1 text-zinc-500">Ready to Run</div>
                                <div className="text-xs text-zinc-700">Run or submit your code to see results</div>
                            </div>
                        ) : (
                            <>
                                {/* Verdict Header */}
                                <div className={`mb-6 p-5 rounded-xl border relative overflow-hidden shrink-0 ${output.verdict === 'Accepted' ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                    <div className={`absolute top-0 left-0 w-1 h-full ${output.verdict === 'Accepted' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-4">
                                            {output.verdict === 'Accepted' ? (
                                                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                                                    <Check className="w-5 h-5 text-green-500" />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                                                    <X className="w-5 h-5 text-red-500" />
                                                </div>
                                            )}
                                            <div>
                                                <h2 className={`text-xl font-bold tracking-tight ${getStatusColor(output.verdict)}`}>
                                                    {output.verdict}
                                                </h2>
                                                {output.testcases && (
                                                    <p className="text-xs text-zinc-500 mt-0.5 font-medium">
                                                        {output.testcases.filter((tc: any) => tc.status === 'Passed').length}/{output.testcases.length} test cases passed
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {output.runtime_ms !== undefined && (
                                            <div className="text-right">
                                                <div className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Runtime</div>
                                                <div className="text-sm font-mono font-bold text-zinc-300">{output.runtime_ms} ms</div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Test Cases Summary */}
                                {output.testcases && output.testcases.length > 0 ? (
                                    <>
                                        <div className="mb-4">
                                            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Test Cases</h3>
                                            <div className="grid grid-cols-5 gap-2 mb-4">
                                                {output.testcases.map((tc: any, idx: number) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setActiveCaseIndex(idx)}
                                                        className={`group relative p-2 rounded-lg text-xs font-medium transition-all border ${activeCaseIndex === idx
                                                            ? tc.status === 'Passed'
                                                                ? "bg-green-500/10 border-green-500/40 text-green-400"
                                                                : "bg-red-500/10 border-red-500/40 text-red-400"
                                                            : tc.status === 'Passed'
                                                                ? "bg-green-500/5 border-green-500/10 text-green-500/60 hover:bg-green-500/10 hover:border-green-500/30"
                                                                : "bg-red-500/5 border-red-500/10 text-red-500/60 hover:bg-red-500/10 hover:border-red-500/30"
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            {tc.status === 'Passed' ? (
                                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
                                                            ) : (
                                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]"></div>
                                                            )}
                                                            <span>Case {idx + 1}</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Selected Test Case Details */}
                                        {(() => {
                                            const tc = output.testcases[activeCaseIndex];
                                            if (!tc) return null;

                                            return (
                                                <div className="space-y-4">
                                                    {/* Input */}
                                                    <div>
                                                        <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-2 block">Input</label>
                                                        <div className="bg-[#121212] border border-white/5 p-3 rounded-lg font-mono text-xs text-zinc-300 whitespace-pre-wrap max-h-32 overflow-y-auto custom-scrollbar">
                                                            {tc.input}
                                                        </div>
                                                    </div>

                                                    {/* Your Output */}
                                                    <div>
                                                        <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-2 block">Your Output</label>
                                                        <div className={`p-3 rounded-lg border font-mono text-xs whitespace-pre-wrap max-h-32 overflow-y-auto custom-scrollbar ${tc.status === 'Passed'
                                                            ? 'bg-green-500/5 border-green-500/20 text-green-200'
                                                            : 'bg-red-500/5 border-red-500/20 text-red-200'
                                                            }`}>
                                                            {tc.user_output || <span className="text-zinc-600 italic">No output</span>}
                                                        </div>
                                                    </div>

                                                    {/* Expected Output */}
                                                    <div>
                                                        <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-2 block">Expected Output</label>
                                                        <div className="bg-[#121212] border border-white/5 p-3 rounded-lg font-mono text-xs text-zinc-300 whitespace-pre-wrap max-h-32 overflow-y-auto custom-scrollbar">
                                                            {tc.expected_output}
                                                        </div>
                                                    </div>

                                                    {tc.stderr && (
                                                        <div>
                                                            <label className="text-[10px] text-red-400 uppercase font-bold tracking-widest mb-2 block">Error Output</label>
                                                            <div className="bg-red-950/20 border border-red-500/20 p-3 rounded-lg font-mono text-xs text-red-300 whitespace-pre-wrap max-h-32 overflow-y-auto custom-scrollbar">
                                                                {tc.stderr}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </>
                                ) : (
                                    output.error && (
                                        <div className="bg-red-500/5 p-6 rounded-xl border border-red-500/20">
                                            <h3 className="font-bold mb-3 flex items-center gap-2 text-red-400 text-sm uppercase tracking-wide">
                                                <AlertCircle size={16} /> Execution Error
                                            </h3>
                                            <pre className="whitespace-pre-wrap text-xs font-mono text-red-200/80 leading-relaxed">{output.error}</pre>
                                        </div>
                                    )
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* --- SUBMISSIONS MODE --- */}
                {activeTab === "submissions" && (
                    <div className="h-full p-6 overflow-y-auto custom-scrollbar">
                        <SubmissionsList submissions={submissions} />
                    </div>
                )}
            </div>
        </div>
    );
}

function SubmissionsList({ submissions }: { submissions?: any[] }) {
    if (!submissions) return <div className="p-6 text-zinc-500 text-sm">Loading submissions...</div>;

    if (submissions.length === 0) return (
        <div className="h-full flex flex-col items-center justify-center text-zinc-500 p-6">
            <Clock size={48} className="mb-4 opacity-20" />
            <div className="text-lg font-medium mb-2">No Submissions Yet</div>
            <div className="text-sm text-zinc-600 text-center max-w-[200px]">
                Submit your solution to track your progress here.
            </div>
        </div>
    );

    return (
        <div className="space-y-3">
            {submissions.map((sub: any, idx: number) => {
                const isAccepted = sub.verdict === 'Accepted';
                const date = new Date(sub.created_at);

                return (
                    <div
                        key={sub.id || idx}
                        className="group flex flex-col bg-[#121212] border border-white/5 rounded-xl overflow-hidden transition-all hover:border-white/10 hover:shadow-lg hover:shadow-black/20"
                    >
                        <div className="flex items-center justify-between p-4 relative overflow-hidden">
                            {/* Ambient Glow */}
                            <div className={`absolute top-0 left-0 w-1 h-full ${isAccepted ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <div className={`absolute top-0 left-0 w-full h-full opacity-[0.02] ${isAccepted ? 'bg-green-500' : 'bg-red-500'}`}></div>

                            {/* Left: Verdict and Time */}
                            <div className="flex items-start gap-4 relative z-10">
                                {isAccepted ? (
                                    <div className="mt-0.5 w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20 text-green-500">
                                        <Check size={14} />
                                    </div>
                                ) : (
                                    <div className="mt-0.5 w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-500">
                                        <X size={14} />
                                    </div>
                                )}
                                <div>
                                    <div className={`text-sm font-bold tracking-tight ${isAccepted ? 'text-green-400' : 'text-red-400'}`}>
                                        {isAccepted ? 'Accepted' : sub.verdict}
                                    </div>
                                    <div className="text-[10px] text-zinc-500 mt-1 font-medium">
                                        {date.toLocaleDateString()} • {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Stats */}
                            <div className="flex items-center gap-6 relative z-10">
                                <div className="text-right">
                                    <div className="text-[9px] uppercase text-zinc-600 font-bold tracking-widest mb-0.5">Lang</div>
                                    <div className="text-xs text-zinc-300 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5 capitalize">
                                        {sub.language}
                                    </div>
                                </div>
                                <div className="text-right min-w-[50px]">
                                    <div className="text-[9px] uppercase text-zinc-600 font-bold tracking-widest mb-0.5">Time</div>
                                    <div className="text-xs text-zinc-300 font-mono font-medium">
                                        {sub.runtime_ms !== null ? `${sub.runtime_ms} ms` : '-'}
                                    </div>
                                </div>
                                <div className="text-right min-w-[50px]">
                                    <div className="text-[9px] uppercase text-zinc-600 font-bold tracking-widest mb-0.5">Mem</div>
                                    <div className="text-xs text-zinc-300 font-mono font-medium">
                                        {sub.memory_kb ? `${(sub.memory_kb / 1024).toFixed(1)} MB` : '-'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
