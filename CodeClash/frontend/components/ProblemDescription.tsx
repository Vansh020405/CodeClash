import ReactMarkdown from "react-markdown";

interface ProblemDescriptionProps {
    problem: any;
    previewMode?: boolean;
    isDarkMode?: boolean;
}

export default function ProblemDescription({ problem, previewMode = false, isDarkMode = true }: ProblemDescriptionProps) {
    if (!problem) return null;

    const difficultyColors = {
        Easy: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
        Medium: "text-amber-400 bg-amber-500/10 border-amber-500/30",
        Hard: "text-rose-400 bg-rose-500/10 border-rose-500/30",
    };

    const bgColor = isDarkMode ? "bg-[#0a0a0a]" : "bg-white";
    const textColor = isDarkMode ? "text-zinc-300" : "text-slate-600";
    const borderColor = isDarkMode ? "border-white/5" : "border-slate-200";
    const headingColor = isDarkMode ? "text-white" : "text-slate-900";
    const codeBg = isDarkMode ? "bg-[#0e0e0e]" : "bg-slate-50";
    const secondaryBg = isDarkMode ? "bg-[#151515]" : "bg-slate-100";

    return (
        <div className={`flex flex-col h-full font-sans ${bgColor} ${textColor}`}>
            {!previewMode && (
                <div className={`flex items-center gap-1 h-12 ${bgColor} border-b ${borderColor} px-4 sticky top-0 z-20 backdrop-blur-sm`}>
                    <button className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full transition-all shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                        Description
                    </button>

                </div>
            )}

            <div className="flex-1 overflow-y-auto problem-scrollbar p-8">
                {/* Title and Difficulty */}
                <div className={`mb-8 border-b ${borderColor} pb-6`}>
                    <h1 className={`text-3xl font-bold mb-4 tracking-tight ${headingColor}`}>{problem.title}</h1>
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
                <div className={`prose max-w-none ${isDarkMode ? 'prose-invert prose-p:text-zinc-300 prose-headings:text-white prose-strong:text-white' : 'prose-slate prose-p:text-slate-600 prose-headings:text-slate-900 prose-strong:text-slate-900'} prose-p:leading-relaxed prose-a:text-blue-400 prose-code:text-blue-400`}>
                    <ReactMarkdown
                        components={{
                            h1: ({ node, ...props }) => <h1 className={`text-2xl font-bold mt-8 mb-4 border-l-4 border-blue-500 pl-4 ${headingColor}`} {...props} />,
                            h2: ({ node, ...props }) => <h2 className={`text-xl font-bold mt-6 mb-3 ${headingColor}`} {...props} />,
                            h3: ({ node, ...props }) => <h3 className={`text-lg font-semibold mt-6 mb-2 ${isDarkMode ? 'text-zinc-100' : 'text-slate-800'}`} {...props} />,
                            p: ({ node, ...props }) => <p className={`${textColor} text-[15px] leading-7 mb-4`} {...props} />,
                            code: ({ node, inline, ...props }: any) =>
                                inline ? (
                                    <code className={`px-1.5 py-0.5 border rounded font-mono text-xs ${isDarkMode ? 'bg-zinc-800/50 border-zinc-700/50 text-zinc-200' : 'bg-slate-100 border-slate-200 text-slate-700'}`} {...props} />
                                ) : (
                                    <div className="relative group">
                                        <code className={`block border p-4 rounded-xl font-mono text-sm overflow-x-auto my-4 shadow-inner ${codeBg} ${borderColor} ${textColor}`} {...props} />
                                    </div>
                                ),
                            pre: ({ node, ...props }) => (
                                <pre className="bg-transparent p-0 m-0 overflow-visible" {...props} />
                            ),
                            ul: ({ node, ...props }) => <ul className={`list-disc list-outside ml-5 space-y-2 mb-4 marker:text-zinc-500 ${textColor}`} {...props} />,
                            ol: ({ node, ...props }) => <ol className={`list-decimal list-outside ml-5 space-y-2 mb-4 marker:text-zinc-500 ${textColor}`} {...props} />,
                            blockquote: ({ node, ...props }) => (
                                <blockquote className={`border-l-4 pl-4 py-1 italic my-4 ${isDarkMode ? 'border-zinc-700 text-zinc-400' : 'border-slate-300 text-slate-500'}`} {...props} />
                            ),
                        }}
                    >
                        {problem.description}
                    </ReactMarkdown>
                </div>

                {/* Formats Section - Visual redesign */}
                <div className="grid gap-6 mt-8">
                    {problem.input_format && (
                        <div className={`border rounded-xl p-6 transition-colors ${isDarkMode ? 'bg-zinc-900/30 border-white/5 hover:border-white/10' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
                            <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${headingColor}`}>
                                <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                                Input Format
                            </h3>
                            <div className={`text-sm leading-relaxed ${textColor}`}>
                                <ReactMarkdown components={{ code: ({ node, ...props }) => <code className={`px-1.5 py-0.5 rounded font-mono text-xs border ${isDarkMode ? 'bg-zinc-800/50 text-zinc-200 border-white/5' : 'bg-white text-slate-700 border-slate-200'}`} {...props} /> }}>
                                    {problem.input_format}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}

                    {problem.output_format && (
                        <div className={`border rounded-xl p-6 transition-colors ${isDarkMode ? 'bg-zinc-900/30 border-white/5 hover:border-white/10' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
                            <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${headingColor}`}>
                                <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
                                Output Format
                            </h3>
                            <div className={`text-sm leading-relaxed ${textColor}`}>
                                <ReactMarkdown components={{ code: ({ node, ...props }) => <code className={`px-1.5 py-0.5 rounded font-mono text-xs border ${isDarkMode ? 'bg-zinc-800/50 text-zinc-200 border-white/5' : 'bg-white text-slate-700 border-slate-200'}`} {...props} /> }}>
                                    {problem.output_format}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}
                </div>

                {/* Test Cases Section */}
                {problem.test_cases && problem.test_cases.filter((tc: any) => !tc.is_hidden && (tc.input_data || tc.expected_output)).length > 0 && (
                    <div className="mt-10">
                        <h3 className={`text-lg font-bold mb-5 flex items-center gap-2 ${headingColor}`}>
                            Examples
                        </h3>
                        <div className="space-y-6">
                            {problem.test_cases
                                .filter((tc: any) => !tc.is_hidden && (tc.input_data || tc.expected_output))
                                .map((testCase: any, idx: number) => (
                                    <div key={idx} className={`border rounded-2xl overflow-hidden shadow-lg ${codeBg} ${borderColor}`}>
                                        <div className={`px-5 py-3 border-b flex items-center justify-between ${borderColor} ${isDarkMode ? 'bg-white/[0.02]' : 'bg-slate-100/50'}`}>
                                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Example {idx + 1}</span>
                                        </div>
                                        <div className="p-5 grid gap-4">
                                            {testCase.input_data && (
                                                <div>
                                                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">Input</div>
                                                    <div className={`border rounded-xl p-4 font-mono text-sm shadow-inner whitespace-pre-wrap ${secondaryBg} ${borderColor} ${textColor}`}>
                                                        {testCase.input_data}
                                                    </div>
                                                </div>
                                            )}
                                            {testCase.expected_output && (
                                                <div>
                                                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">Output</div>
                                                    <div className={`border rounded-xl p-4 font-mono text-sm shadow-inner whitespace-pre-wrap ${secondaryBg} ${borderColor} ${textColor}`}>
                                                        {testCase.expected_output}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {testCase.explanation && (
                                            <div className={`border-t p-5 ${borderColor} ${isDarkMode ? 'bg-[#121212]' : 'bg-white'}`}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-1 h-3 bg-blue-500 rounded-full"></div>
                                                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Explanation</div>
                                                </div>
                                                <div className={`text-sm leading-relaxed font-sans opacity-90 whitespace-pre-wrap ${textColor}`}>
                                                    {testCase.explanation}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {/* Constraints */}
                {problem.constraints && (
                    <div className="mt-10 mb-8">
                        <h3 className={`text-lg font-bold mb-4 ${headingColor}`}>Constraints</h3>
                        <div className={`border rounded-xl p-6 ${borderColor} ${isDarkMode ? 'bg-zinc-900/30' : 'bg-slate-50'}`}>
                            <ul className="space-y-3">
                                {problem.constraints.split('\n').filter((c: string) => c.trim()).map((constraint: string, idx: number) => (
                                    <li key={idx} className={`flex items-start gap-3 text-sm ${textColor}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${isDarkMode ? 'bg-zinc-600' : 'bg-slate-400'}`}></span>
                                        <code className={`font-mono px-1.5 py-0.5 rounded border ${isDarkMode ? 'bg-zinc-800/50 border-white/5 text-zinc-200' : 'bg-white border-slate-200 text-slate-700'}`}>{constraint}</code>
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
