"use client";
import { Editor } from "@monaco-editor/react";
import { Code2, Settings, RotateCcw, Maximize2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const LANGUAGES = [
    { value: "cpp", label: "C++", icon: "" },
    { value: "python", label: "Python", icon: "" },
];

interface CodeEditorProps {
    language: string;
    code: string;
    onChange: (value: string | undefined) => void;
    setLanguage: (lang: string) => void;
}

export default function CodeEditor({ language, code, onChange, setLanguage }: CodeEditorProps) {
    return (
        <div className="h-full flex flex-col bg-[#0a0a0a] text-zinc-400 font-sans rounded-xl overflow-hidden relative">
            {/* Header */}
            <div className="h-10 min-h-[40px] bg-[#0a0a0a] flex items-center justify-between px-3 border-b border-white/5 select-none relative z-20">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        <Code2 size={12} />
                        <span>Code Editor</span>
                    </div>

                    {/* Language Selector */}
                    <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="h-7 w-auto border border-white/10 bg-zinc-900/50 hover:bg-zinc-800 px-2 rounded text-xs focus:ring-0 gap-2 text-zinc-300 hover:text-white transition-all shadow-sm">
                            <SelectValue placeholder="Language" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#121212] border-zinc-800 rounded-lg min-w-[140px] shadow-xl">
                            {LANGUAGES.map(lang => (
                                <SelectItem
                                    key={lang.value}
                                    value={lang.value}
                                    className="text-zinc-400 focus:bg-zinc-800 focus:text-white cursor-pointer text-xs rounded-md"
                                >
                                    <span className="flex items-center gap-2">
                                        <span>{lang.icon}</span>
                                        <span>{lang.label}</span>
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-1">
                    <button className="p-1.5 hover:bg-zinc-800 rounded-md transition-colors text-zinc-500 hover:text-zinc-300" title="Settings">
                        <Settings size={14} />
                    </button>
                    <button className="p-1.5 hover:bg-zinc-800 rounded-md transition-colors text-zinc-500 hover:text-zinc-300" title="Reset Code">
                        <RotateCcw size={14} />
                    </button>
                    <button className="p-1.5 hover:bg-zinc-800 rounded-md transition-colors text-zinc-500 hover:text-zinc-300" title="Maximize">
                        <Maximize2 size={14} />
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 relative bg-[#0a0a0a]">
                <Editor
                    height="100%"
                    width="100%"
                    defaultLanguage="cpp"
                    language={language}
                    value={code}
                    theme="vs-dark"
                    onChange={onChange}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineHeight: 21,
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        fontLigatures: true,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        padding: { top: 16, bottom: 16 },
                        renderLineHighlight: "all",
                        cursorBlinking: "smooth",
                        smoothScrolling: true,
                        contextmenu: true,
                        scrollbar: {
                            vertical: 'visible',
                            horizontal: 'visible',
                            verticalScrollbarSize: 8,
                            horizontalScrollbarSize: 8,
                            useShadows: false
                        },
                        overviewRulerBorder: false,
                        hideCursorInOverviewRuler: true,
                    }}
                    onMount={(editor, monaco) => {
                        monaco.editor.defineTheme('vs-dark', {
                            base: 'vs-dark',
                            inherit: true,
                            rules: [],
                            colors: {
                                'editor.background': '#0a0a0a',
                                'editor.lineHighlightBackground': '#ffffff0a',
                            }
                        });
                        monaco.editor.setTheme('vs-dark');
                    }}
                />
            </div>

            {/* Footer / Status Bar */}
            <div className="h-6 min-h-[24px] bg-[#0a0a0a] border-t border-white/5 flex items-center justify-between px-3 text-[10px] text-zinc-600 select-none z-20">
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></div>
                        Ready
                    </span>
                    <span>UTF-8</span>
                </div>
                <div className="flex items-center gap-3">
                    <span>Spaces: 4</span>
                    <span>Ln 1, Col 1</span>
                </div>
            </div>
        </div>
    );
}
