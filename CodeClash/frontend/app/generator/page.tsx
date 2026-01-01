"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wand2, AlertCircle, RefreshCw, Copy, Check } from "lucide-react";
import ProblemDescription from "@/components/ProblemDescription";

export default function GeneratorPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [rawProblem, setRawProblem] = useState("");
    const [sampleInput, setSampleInput] = useState("");
    const [sampleOutput, setSampleOutput] = useState("");
    const [generatedProblem, setGeneratedProblem] = useState<any>(null);
    const [error, setError] = useState("");

    const handleGenerate = () => {
        if (!rawProblem.trim()) {
            setError("Please enter a problem statement");
            return;
        }

        setIsLoading(true);
        setError("");
        setGeneratedProblem(null);

        // Simulate AI Delay
        setTimeout(() => {
            setIsLoading(false);

            // Mock Result
            setGeneratedProblem({
                title: "Remove Elements Greater Than X",
                difficulty: "Medium",
                description: `
**Description:**

You are given a linked list of quiz scores and a specific limit \`X\`. 
Your task is to remove all nodes from the linked list that have a value **greater than** \`X\`.

Return the head of the modified linked list.

**Example 1:**
\`\`\`
Input: head = [6, 3, 2, 4, 3, 6, 5], X = 3
Output: [3, 2, 3]
Explanation: Nodes with values 6, 4, 6, 5 are greater than 3 and are removed.
\`\`\`

**Constraints:**
*   The number of nodes in the list is in the range \`[0, 10^5]\`.
*   \`1 <= Node.val <= 1000\`
*   \`1 <= X <= 1000\`
                `,
                constraints: "0 <= N <= 10^5\n1 <= X <= 1000",
                follow_up: "Can you solve it in O(N) time and O(1) extra space?"
            });
        }, 2000);
    };

    const handleLoadExample = () => {
        setRawProblem(`Imagine you have a chain (a linked list) of individual quiz scores (nodes) from your students. You are giving out a special prize, but only for scores that are less than or equal to a specific limit X.
Your task is to go through this list of scores and throw out (delete) any score that is too high (greater than X). You only keep the passing scores that qualify for the prize.
You must complete the function deleteGreater(), which takes the head of the linked list as a parameter and returns the head of a new list in which no element (node) has a value greater than X.
________________________________________
Input Format
•\tThe first line contains an integer N, the size of the list.
•\tThe second line contains an integer X.
•\tEach of the next N lines contains an integer list[i], where 0 ≤ i < N.
________________________________________
Output Format
Print the node values of the resultant list separated by spaces.`);
        setSampleInput("6\n3\n2\n4\n3\n6\n5\n1");
        setSampleOutput("2 3 1");
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans flex flex-col">
            <Navbar />

            <div className="flex-1 max-w-7xl mx-auto w-full p-6 flex gap-6 overflow-hidden">
                {/* Left Panel - Input */}
                <div className="w-1/2 flex flex-col gap-4 bg-[#1a1a1a] p-6 rounded-xl border border-zinc-800 overflow-y-auto custom-scrollbar">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            Problem Generator
                        </h1>
                        <Button variant="outline" size="sm" onClick={handleLoadExample} className="text-xs h-8 bg-transparent border-zinc-700 hover:bg-zinc-800 text-zinc-400">
                            <RefreshCw size={12} className="mr-2" />
                            Load Example
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Problem Statement <span className="text-red-500">*</span></label>
                            <textarea
                                value={rawProblem}
                                onChange={(e) => setRawProblem(e.target.value)}
                                placeholder="Paste your college problem statement here..."
                                className="w-full min-h-[300px] bg-[#262626] border border-zinc-700 rounded-md p-3 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-500/50 font-mono text-sm resize-none placeholder:text-zinc-600"
                            />
                            <div className="text-right text-xs text-zinc-500">{rawProblem.length} chars</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Sample Input</label>
                                <textarea
                                    value={sampleInput}
                                    onChange={(e) => setSampleInput(e.target.value)}
                                    placeholder="Input..."
                                    className="w-full bg-[#262626] border border-zinc-700 rounded-md p-3 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-500/50 font-mono text-xs h-32 resize-none placeholder:text-zinc-600"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Sample Output</label>
                                <textarea
                                    value={sampleOutput}
                                    onChange={(e) => setSampleOutput(e.target.value)}
                                    placeholder="Output..."
                                    className="w-full bg-[#262626] border border-zinc-700 rounded-md p-3 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-500/50 font-mono text-xs h-32 resize-none placeholder:text-zinc-600"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <Button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium py-6 shadow-lg shadow-blue-500/20 transition-all border-none relative overflow-hidden"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                                    Analyzing Problem Strategy...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Wand2 size={18} />
                                    Generate LeetCode-Style Problem
                                </div>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Right Panel - Preview */}
                <div className="w-1/2 flex flex-col bg-[#1a1a1a] rounded-xl border border-zinc-800 overflow-hidden relative">
                    {generatedProblem ? (
                        <div className="flex flex-col h-full">
                            <div className="h-12 bg-[#262626] border-b border-zinc-800 flex items-center justify-between px-4">
                                <span className="text-sm font-medium text-green-400 flex items-center gap-2">
                                    <Check size={14} /> Generated Successfully
                                </span>
                                <Button variant="ghost" size="sm" className="h-8 text-zinc-400 hover:text-white hover:bg-zinc-800">
                                    <Copy size={14} className="mr-2" /> Copy Markdown
                                </Button>
                            </div>
                            <div className="flex-1 overflow-auto bg-[#262626] custom-scrollbar">
                                {/* Using ProblemDescription assuming it handles partial props gracefully or pass full structure */}
                                <div className="p-2">
                                    <ProblemDescription problem={generatedProblem} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center text-zinc-500">
                            <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mb-4 border border-zinc-700/50">
                                <Wand2 size={24} className="opacity-20" />
                            </div>
                            <h3 className="text-lg font-medium text-zinc-300 mb-2">No problem generated yet</h3>
                            <p className="max-w-xs text-sm text-zinc-500">
                                Paste your college problem statement on the left and click "Generate" to see the magic happen.
                            </p>
                        </div>
                    )}

                    {/* Overlay Loader Effect */}
                    {isLoading && (
                        <div className="absolute inset-0 bg-[#0a0a0a]/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-blue-500/20 rounded-full"></div>
                                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                            </div>
                            <div className="mt-4 text-blue-400 font-medium animate-pulse">Polishing Description...</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
