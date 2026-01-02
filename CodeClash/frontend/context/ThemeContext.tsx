"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface ThemeContextType {
    isDarkMode: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Check local storage or system preference
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            setIsDarkMode(savedTheme === "dark");
        } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            setIsDarkMode(true);
        }
    }, []);

    const toggleTheme = () => {
        setIsDarkMode((prev) => {
            const newTheme = !prev;
            localStorage.setItem("theme", newTheme ? "dark" : "light");
            if (newTheme) {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
            return newTheme;
        });
    };

    // Prevent hydration mismatch
    // (Removed early return to ensure Context is always available)


    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
