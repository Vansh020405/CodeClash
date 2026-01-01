import React, { useState, useEffect } from "react";
import { Check, X, Clock, Terminal, AlertCircle } from "lucide-react";

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
        <div className="flex flex-col h-full bg-[#262626] font-sans">
            {/* Header / Tabs */}
            <div className="flex items-center h-10 bg-zinc-800/50 border-b border-zinc-700/50 px-2 select-none">
                <button
                    onClick={() => setActiveTab("testcases")}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-t-md transition-colors relative top-[1px] ${activeTab === "testcases"
                            ? "bg-[#262626] text-zinc-100 border-t border-x border-zinc-700/50 border-b-[#262626]"
                            : "text-zinc-500 hover:text-zinc-300"
                        }`}
                >
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500/50"></div>
                    Testcase
                </button>
                <button
                    onClick={() => setActiveTab("results")}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-t-md transition-colors relative top-[1px] ${activeTab === "results"
                            ? "bg-[#262626] text-zinc-100 border-t border-x border-zinc-700/50 border-b-[#262626]"
                            : "text-zinc-500 hover:text-zinc-300"
                        }`}
                >
                    <div className={`w-1.5 h-1.5 rounded-full ${output ? getStatusColor(output.verdict).replace('text-', 'bg-') : 'bg-zinc-500'}`}></div>
                    Test Result
                </button>
                <button
                    onClick={() => setActiveTab("submissions")}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-t-md transition-colors relative top-[1px] ${activeTab === "submissions"
                            ? "bg-[#262626] text-zinc-100 border-t border-x border-zinc-700/50 border-b-[#262626]"
                            : "text-zinc-500 hover:text-zinc-300"
                        }`}
                >
                    <Clock size={12} />
                    Submissions
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">

                {/* --- TESTCASE MODE --- */}
                {activeTab === "testcases" && (
                    <div className="h-full flex flex-col p-4 overflow-y-auto custom-scrollbar">
                        {/* Case Tabs */}
                        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
                            {problem.test_cases?.filter((tc: any) => !tc.is_hidden).map((tc: any, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveCaseIndex(idx)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${activeCaseIndex === idx
                                            ? "bg-zinc-700 text-white shadow-sm"
                                            : "bg-zinc-800/50 text-zinc-500 hover:bg-zinc-800"
                                        }`}
                                >
                                    Case {idx + 1}
                                </button>
                            ))}
                            {/* Add Case Button (Visual Only for now) */}
                            <button className="px-2 py-1.5 rounded-md text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors">
                                +
                            </button>
                        </div>

                        {/* Input Fields */}
                        <div className="space-y-4">
                            {(() => {
                                const publicCases = problem.test_cases?.filter((tc: any) => !tc.is_hidden) || [];
                                const currentCase = publicCases[activeCaseIndex];
                                if (!currentCase) return <div className="text-zinc-500 text-sm">No test cases available</div>;

                                return (
                                    <div className="space-y-2">
                                        <label className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Input</label>
                                        <div className="relative">
                                            <textarea
                                                readOnly
                                                value={currentCase.input_data}
                                                className="w-full bg-[#333333] border border-transparent focus:border-zinc-600 rounded-lg p-3 text-sm font-mono text-zinc-300 outline-none resize-none min-h-[100px]"
                                            />
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                )}

                {/* --- TEST RESULT MODE --- */}
                {activeTab === "results" && (
                    <div className="h-full flex flex-col p-4 overflow-y-auto custom-scrollbar">
                        {!output ? (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-500/50 animate-in fade-in zoom-in duration-300">
                                <Terminal size={48} className="mb-4 opacity-20" />
                                <div className="text-sm font-medium">Run code to see results</div>
                            </div>
                        ) : (
                            <>
                                {/* Verdict Header */}
                                <div className="flex items-center gap-4 mb-6">
                                    <h2 className={`text-xl font-bold flex items-center gap-2 ${getStatusColor(output.verdict)}`}>
                                        {output.verdict === 'Accepted' && <Check className="w-6 h-6" />}
                                        {output.verdict}
                                    </h2>
                                    {output.runtime_ms !== undefined && (
                                        <div className="text-xs text-zinc-500 flex items-center gap-1 bg-zinc-800/50 px-2 py-1 rounded">
                                            <Clock size={12} />
                                            {output.runtime_ms} ms
                                        </div>
                                    )}
                                </div>

                                {/* Case Pills */}
                                {output.testcases && output.testcases.length > 0 ? (
                                    <>
                                        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                                            {output.testcases.map((tc: any, idx: number) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setActiveCaseIndex(idx)}
                                                    className={`group relative pl-2 pr-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-2 border ${activeCaseIndex === idx
                                                            ? "bg-zinc-800 border-zinc-600 text-zinc-200 shadow-sm"
                                                            : "bg-transparent border-transparent text-zinc-500 hover:bg-zinc-800/50"
                                                        }`}
                                                >
                                                    <span className={`${tc.status === 'Passed' ? 'text-green-500' : 'text-red-500'}`}>
                                                        {tc.status === 'Passed' ? '●' : '●'}
                                                    </span>
                                                    Case {idx + 1}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Result Details */}
                                        {(() => {
                                            const tc = output.testcases[activeCaseIndex];
                                            if (!tc) return null;

                                            return (
                                                <div className="space-y-5 animate-in slide-in-from-bottom-2 duration-300">
                                                    {/* Input */}
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs text-zinc-500 uppercase font-medium">Input</label>
                                                        <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50 font-mono text-sm text-zinc-300 whitespace-pre-wrap">
                                                            {tc.input}
                                                        </div>
                                                    </div>

                                                    {/* Output */}
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs text-zinc-500 uppercase font-medium">Output</label>
                                                        <div className={`p-3 rounded-lg border font-mono text-sm whitespace-pre-wrap ${tc.status === 'Passed'
                                                                ? 'bg-zinc-800/50 border-zinc-700/50 text-zinc-300'
                                                                : 'bg-red-500/10 border-red-500/20 text-red-200'
                                                            }`}>
                                                            {tc.user_output || <span className="text-zinc-600 italic">No output</span>}
                                                        </div>
                                                    </div>

                                                    {/* Expected */}
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs text-zinc-500 uppercase font-medium">Expected</label>
                                                        <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50 font-mono text-sm text-zinc-300 whitespace-pre-wrap">
                                                            {tc.expected_output}
                                                        </div>
                                                    </div>

                                                    {tc.stderr && (
                                                        <div className="space-y-1.5">
                                                            <label className="text-xs text-red-500 uppercase font-medium">Std Err</label>
                                                            <div className="bg-red-950/30 p-3 rounded-lg border border-red-500/20 font-mono text-sm text-red-300 whitespace-pre-wrap">
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
                                        <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20 text-red-200">
                                            <h3 className="font-bold mb-2 flex items-center gap-2"><AlertCircle size={16} /> Execution Error</h3>
                                            <pre className="whitespace-pre-wrap text-sm font-mono">{output.error}</pre>
                                        </div>
                                    )
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* --- SUBMISSIONS MODE --- */}
                {activeTab === "submissions" && (
                    <div className="h-full p-4 overflow-y-auto custom-scrollbar">
                        <SubmissionsList submissions={submissions} />
                    </div>
                )}
            </div>
        </div>
    );
}

function SubmissionsList({ submissions }: { submissions?: any[] }) {
    if (!submissions) return <div className="text-zinc-500 text-sm">Loading...</div>;
    if (submissions.length === 0) return <div className="text-zinc-500 text-sm">No submissions yet</div>;

    return (
        <div className="space-y-2">
            {submissions.map((sub: any) => (
                <div key={sub.id} className="flex items-center justify-between bg-[#333333] p-3 rounded-md border border-zinc-700/50">
                    <div className="flex items-center gap-3">
                        <div className={`text-sm font-medium ${sub.verdict === 'Accepted' ? 'text-green-500' : 'text-red-500'}`}>
                            {sub.verdict === 'Accepted' ? 'Accepted' : sub.verdict}
                        </div>
                        <div className="text-xs text-zinc-500">
                            {new Date(sub.created_at).toLocaleString()}
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                        <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300 uppercase">{sub.language}</span>
                        {sub.runtime_ms !== null && <span>{sub.runtime_ms} ms</span>}
                    </div>
                </div>
            ))}
        </div>
    );
}
