import ReactMarkdown from 'react-markdown';
import { FileText, FlaskConical, History, Tag, Clock, BarChart3 } from "lucide-react";

interface ProblemDescriptionProps {
    problem: any;
}

export default function ProblemDescription({ problem }: ProblemDescriptionProps) {
    if (!problem) return <div className="p-8 text-zinc-400 animate-pulse">Loading problem...</div>;

    return (
        <div className="h-full flex flex-col bg-[#262626] rounded-lg border border-zinc-800 overflow-hidden text-zinc-100">
            {/* Tabs Header */}
            <div className="h-10 bg-[#333333] flex items-center px-2 gap-1 border-b border-zinc-700 flex-shrink-0">
                <button className="flex items-center gap-2 px-3 py-1.5 bg-[#262626] rounded-t-md text-xs font-medium border-t border-x border-transparent hover:text-white transition-colors relative">
                    <FileText size={14} className="text-blue-500" />
                    Description
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 text-zinc-400 hover:text-white rounded-md text-xs font-medium">
                    <FlaskConical size={14} />
                    Editorial
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 text-zinc-400 hover:text-white rounded-md text-xs font-medium">
                    <History size={14} />
                    Submissions
                </button>
            </div>

            {/* Scrollable Content with Custom Scrollbar */}
            <div className="flex-1 overflow-y-auto problem-scrollbar">
                <div className="p-6 space-y-6">
                    {/* Title & Difficulty */}
                    <div className="space-y-4">
                        <h1 className="text-3xl font-bold tracking-tight">{problem.title}</h1>

                        {/* Meta Information */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Difficulty Badge */}
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${problem.difficulty === "Easy" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                                problem.difficulty === "Medium" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
                                    "bg-red-500/20 text-red-400 border border-red-500/30"
                                }`}>
                                {problem.difficulty}
                            </span>

                            {/* Stats */}
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-zinc-800/50 text-xs text-zinc-400 border border-zinc-700/50">
                                <BarChart3 size={12} />
                                <span>Acceptance: 45%</span>
                            </div>

                            {/* Tags */}
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-zinc-800/50 text-xs text-zinc-400 border border-zinc-700/50">
                                <Tag size={12} />
                                <span>Array, Hash Table</span>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-zinc-700/50"></div>

                    {/* Problem Description */}
                    <div className="prose prose-invert prose-sm max-w-none 
                        prose-headings:text-zinc-100 prose-headings:font-bold prose-headings:tracking-tight
                        prose-h1:text-2xl prose-h1:mb-4
                        prose-h2:text-xl prose-h2:mb-3 prose-h2:mt-6
                        prose-h3:text-lg prose-h3:mb-2 prose-h3:mt-4
                        prose-p:text-zinc-300 prose-p:leading-7 prose-p:mb-4
                        prose-strong:text-zinc-100 prose-strong:font-semibold
                        prose-em:text-zinc-300
                        prose-code:text-blue-400 prose-code:bg-zinc-800/80 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none prose-code:font-mono
                        prose-pre:bg-zinc-800/50 prose-pre:border prose-pre:border-zinc-700/50 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
                        prose-pre:my-4
                        prose-ul:text-zinc-300 prose-ul:my-3
                        prose-ol:text-zinc-300 prose-ol:my-3
                        prose-li:my-1.5
                        prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-500/5 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r
                        prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                    ">
                        <ReactMarkdown>
                            {problem.description}
                        </ReactMarkdown>
                    </div>

                    {/* Constraints Section */}
                    {problem.constraints && (
                        <div className="mt-6 p-4 bg-zinc-800/30 border border-zinc-700/50 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-1 h-5 bg-yellow-500 rounded"></div>
                                <h3 className="text-sm font-semibold text-zinc-200">Constraints</h3>
                            </div>
                            <div className="text-xs text-zinc-400 space-y-1.5 pl-3">
                                {problem.constraints.split('\n').map((constraint: string, idx: number) => (
                                    <div key={idx} className="flex items-start gap-2">
                                        <span className="text-zinc-600 mt-1">•</span>
                                        <span>{constraint}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Follow-up Section */}
                    {problem.follow_up && (
                        <div className="mt-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-1 h-5 bg-blue-500 rounded"></div>
                                <h3 className="text-sm font-semibold text-blue-400">Follow-up</h3>
                            </div>
                            <p className="text-xs text-zinc-300 pl-3">{problem.follow_up}</p>
                        </div>
                    )}

                    {/* Bottom spacing */}
                    <div className="h-4"></div>
                </div>
            </div>

        </div>
    );
}
