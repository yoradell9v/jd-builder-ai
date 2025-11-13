"use client";
import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import AnalysisCard from "@/components/ui/AnalysisCard";
import { Loader2, FileText, AlertCircle } from "lucide-react";
import Navbar from "@/components/ui/Navbar";

export default function SavedPage() {
    const user = useUser();
    const [savedItems, setSavedItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.id) return;

        const fetchSavedAnalyses = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const res = await fetch(
                    `/api/jd/analysis?userId=${user.id}&page=1&limit=50&finalized=true`,
                    {
                        method: "GET",
                        cache: "no-store",
                        headers: { "Content-Type": "application/json" },
                    }
                );
                if (!res.ok) {
                    throw new Error(`Failed to load saved analyses (${res.status})`);
                }
                const data = await res.json();

                setSavedItems(data?.data?.analyses || []);
                console.log("Fetched saved analyses:", data);

            } catch (err) {
                console.error("Error fetching saved analyses:", err);
                setError("Unable to load saved analyses. Please try again.");
                setSavedItems([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSavedAnalyses();
    }, [user?.id]);

    if (!user || isLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center p-6">
                <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin mb-4" />
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                    Loading Saved Analyses
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400">
                    Please wait while we fetch your data...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white dark:bg-zinc-950 relative">
                <Navbar />
                <div className="mx-auto max-w-7xl px-4 pt-12 md:pt-16 pb-16">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 max-w-md text-center shadow-sm">
                        <AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                            Error Loading Analyses
                        </h2>
                        <p className="text-zinc-700 dark:text-zinc-300 mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white border border-red-500 rounded-lg font-medium transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (savedItems.length === 0) {
        return (
            <div className="min-h-screen bg-white dark:bg-zinc-950 relative">
                <Navbar />
                <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center p-6">
                    <div className="text-center max-w-md">
                        <svg
                            className="w-18 h-18 mx-auto text-[var(--accent)]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        <h1 className="text-3xl font-bold text-[var(--primary)] dark:text-[var(--accent)] mb-3 mt-3">
                            No Saved Analyses Yet
                        </h1>
                        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                            Start by creating your first job description analysis. Your saved analyses will appear here.
                        </p>

                        <a
                            href="/dashboard"
                            className="inline-block px-6 py-3 bg-[var(--accent)] hover:brightness-110 text-white font-semibold rounded-lg transition-all"
                        >
                            Create Analysis
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-white dark:bg-zinc-950 flex flex-col overflow-hidden">
            <Navbar />
            <div className="flex-1 overflow-hidden">
                <div className="h-full mx-auto max-w-7xl px-4 pt-8 md:pt-12 pb-6 flex flex-col">
                    {/* Fixed Header */}
                    <div className="flex-shrink-0 mb-6">
                        <div className="max-w-6xl mx-auto flex items-center justify-between">
                            {/* Left side: Title and subtitle */}
                            <div>
                                <h1 className="text-3xl md:text-5xl font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                                    Saved Analyses
                                </h1>
                                <p className="text-[var(--accent)] dark:text-zinc-400">
                                    You have {savedItems.length} saved job description{" "}
                                    {savedItems.length === 1 ? "analysis" : "analyses"}
                                </p>
                            </div>

                            {/* Right side: Button */}
                            <div>
                                <a
                                    href="/dashboard"
                                    className="inline-block px-6 py-3 bg-[var(--primary)] hover:brightness-110 text-sm text-white font-semibold rounded-lg transition-all"
                                >
                                    Create Analysis
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Cards Container */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="max-w-6xl mx-auto space-y-6 pb-6">
                            {savedItems.map((item) => (
                                <AnalysisCard
                                    key={item.id}
                                    savedAnalysis={item}
                                    onDelete={(deletedId: string) =>
                                        setSavedItems((prev) => prev.filter((i) => i.id !== deletedId))
                                    }
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
