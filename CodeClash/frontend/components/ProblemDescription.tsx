import ReactMarkdown from "react-markdown";

interface ProblemDescriptionProps {
    problem: any;
    previewMode?: boolean;
}

export default function ProblemDescription({ problem, previewMode = false }: ProblemDescriptionProps) {
    if (!problem) return null;

    const difficultyColors = {
        Easy: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
        Medium: "text-amber-400 bg-amber-500/10 border-amber-500/30",
        Hard: "text-rose-400 bg-rose-500/10 border-rose-500/30",
    };

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] text-zinc-300 font-sans">
            {!previewMode && (
                <div className="flex items-center gap-1 h-12 bg-[#0a0a0a] border-b border-white/5 px-4 sticky top-0 z-20 backdrop-blur-sm">
                    <button className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full transition-all shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                        Description
                    </button>
                    <button className="px-4 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors">
                        Editorial
                    </button>
                    <button className="px-4 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors">
                        Submissions
                    </button>
                </div>
            )}

            <div className="flex-1 overflow-y-auto problem-scrollbar p-8">
                {/* Title and Difficulty */}
                <div className="mb-8 border-b border-white/5 pb-6">
                    <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">{problem.title}</h1>
                    <div className="flex items-center gap-4">
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${difficultyColors[problem.difficulty as keyof typeof difficultyColors]
                                }`}
                        >
                            {problem.difficulty}
                        </span>
                        {!previewMode && (
                            <div className="flex items-center gap-4 text-xs font-medium text-zinc-500">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-emerald-500">●</span>
                                    <span>Accepted</span>
                                </div>
                                <span>|</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-zinc-600">●</span>
                                    <span>Submissions</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Problem Description */}
                <div className="prose prose-invert max-w-none prose-p:text-zinc-300 prose-p:leading-relaxed prose-headings:text-white prose-a:text-blue-400 prose-code:text-blue-300 prose-strong:text-white">
                    <ReactMarkdown
                        components={{
                            h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-white mt-8 mb-4 border-l-4 border-blue-500 pl-4" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-white mt-6 mb-3" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-zinc-100 mt-6 mb-2" {...props} />,
                            p: ({ node, ...props }) => <p className="text-zinc-300 text-[15px] leading-7 mb-4" {...props} />,
                            code: ({ node, inline, ...props }: any) =>
                                inline ? (
                                    <code className="px-1.5 py-0.5 bg-zinc-800/50 border border-zinc-700/50 text-zinc-200 rounded font-mono text-xs" {...props} />
                                ) : (
                                    <div className="relative group">
                                        <code className="block bg-[#0e0e0e] border border-white/5 p-4 rounded-xl font-mono text-sm text-zinc-300 overflow-x-auto my-4 shadow-inner" {...props} />
                                    </div>
                                ),
                            pre: ({ node, ...props }) => (
                                <pre className="bg-transparent p-0 m-0 overflow-visible" {...props} />
                            ),
                            ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-5 space-y-2 text-zinc-300 mb-4 marker:text-zinc-500" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-5 space-y-2 text-zinc-300 mb-4 marker:text-zinc-500" {...props} />,
                            blockquote: ({ node, ...props }) => (
                                <blockquote className="border-l-4 border-zinc-700 pl-4 py-1 italic text-zinc-400 my-4" {...props} />
                            ),
                        }}
                    >
                        {problem.description}
                    </ReactMarkdown>
                </div>

                {/* Formats Section - Visual redesign */}
                <div className="grid gap-6 mt-8">
                    {problem.input_format && (
                        <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-6 hover:border-white/10 transition-colors">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                                <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                                Input Format
                            </h3>
                            <div className="text-sm text-zinc-300 leading-relaxed">
                                <ReactMarkdown components={{ code: ({ node, ...props }) => <code className="bg-zinc-800/50 px-1.5 py-0.5 rounded text-zinc-200 font-mono text-xs border border-white/5" {...props} /> }}>
                                    {problem.input_format}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}

                    {problem.output_format && (
                        <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-6 hover:border-white/10 transition-colors">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                                <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
                                Output Format
                            </h3>
                            <div className="text-sm text-zinc-300 leading-relaxed">
                                <ReactMarkdown components={{ code: ({ node, ...props }) => <code className="bg-zinc-800/50 px-1.5 py-0.5 rounded text-zinc-200 font-mono text-xs border border-white/5" {...props} /> }}>
                                    {problem.output_format}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}
                </div>

                {/* Test Cases Section */}
                {problem.test_cases && problem.test_cases.filter((tc: any) => !tc.is_hidden && (tc.input_data || tc.expected_output)).length > 0 && (
                    <div className="mt-10">
                        <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                            Examples
                        </h3>
                        <div className="space-y-6">
                            {problem.test_cases
                                .filter((tc: any) => !tc.is_hidden && (tc.input_data || tc.expected_output))
                                .map((testCase: any, idx: number) => (
                                    <div key={idx} className="bg-[#0e0e0e] border border-white/5 rounded-2xl overflow-hidden shadow-lg">
                                        <div className="px-5 py-3 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Example {idx + 1}</span>
                                        </div>
                                        <div className="p-5 grid gap-4">
                                            {testCase.input_data && (
                                                <div>
                                                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">Input</div>
                                                    <div className="bg-[#151515] border border-white/5 rounded-xl p-4 font-mono text-sm text-zinc-300 shadow-inner">
                                                        {testCase.input_data}
                                                    </div>
                                                </div>
                                            )}
                                            {testCase.expected_output && (
                                                <div>
                                                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">Output</div>
                                                    <div className="bg-[#151515] border border-white/5 rounded-xl p-4 font-mono text-sm text-zinc-300 shadow-inner">
                                                        {testCase.expected_output}
                                                    </div>
                                                </div>
                                            )}
                                            {testCase.explanation && (
                                                <div className="bg-blue-900/10 border border-blue-500/10 rounded-lg p-4 mt-2">
                                                    <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Explanation</div>
                                                    <p className="text-sm text-zinc-300">{testCase.explanation}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {/* Constraints */}
                {problem.constraints && (
                    <div className="mt-10 mb-8">
                        <h3 className="text-lg font-bold text-white mb-4">Constraints</h3>
                        <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-6">
                            <ul className="space-y-3">
                                {problem.constraints.split('\n').filter((c: string) => c.trim()).map((constraint: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-3 text-sm text-zinc-300">
                                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-2 shrink-0"></span>
                                        <code className="font-mono bg-zinc-800/50 px-1.5 py-0.5 rounded border border-white/5 text-zinc-200">{constraint}</code>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}
