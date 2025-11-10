"use client";

import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/ui/Navbar";
import IntakeForm from "@/components/forms/IntakeForm";
import Loader from "@/components/ui/Loader";
import Modal from "@/components/ui/Modal";
import Chatbot from "@/components/forms/Chatbot";

interface User {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    createdAt: Date;
}

interface AnalysisResult {
    preview: {
        summary?: string;
        primary_outcome: string;
        recommended_role: string;
        role_purpose?: string;
        service_mapping: string;
        weekly_hours?: number;
        client_facing?: boolean;
        core_outcomes?: string[];
        kpis: string[];
        key_tools?: string[];
        risks: string[];
    };
    ai_analysis: {
        what_you_told_us?: string;
        roles?: Array<{
            title: string;
            family: string;
            service: string;
            hours_per_week: number;
            client_facing: boolean;
            purpose: string;
            core_outcomes: string[];
            responsibilities: string[];
            skills: string[];
            tools: string[];
            kpis: string[];
            personality: string[];
            reporting_to: string;
            sample_week: {
                Mon: string;
                Tue: string;
                Wed: string;
                Thu: string;
                Fri: string;
            };
            overlap_requirements: string;
            communication_norms: string;
        }>;
        split_table?: Array<{
            role: string;
            purpose: string;
            core_outcomes: string[];
            hrs: number;
            service: string;
        }>;
        service_recommendation?: {
            best_fit: string;
            why: string;
            cost_framing?: string;
            next_steps: string[];
        };
        onboarding_2w?: {
            week_1: string[];
            week_2: string[];
        };
        risks: string[];
        assumptions: string[];
    };
    classification: any;
}

export default function DashboardClient({ user }: { user: User }) {
    const [showForm, setShowForm] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [showRefineAnalysisModal, setShowRefineAnalysisModal] = useState(false);
    const [formKey, setFormKey] = useState(0);
    const [refineSectionIndex, setRefineSectionIndex] = useState(0);
    const [refineFeedback, setRefineFeedback] = useState<Record<string, { satisfied: boolean | null; feedback: string }>>({});

    const getCurrentGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return `Good morning, ${user.firstname}`;
        if (hour < 18) return `Good afternoon, ${user.firstname}`;
        return `Good evening, ${user.firstname}`;
    };

    const handleFormSuccess = (data: AnalysisResult) => {
        setIsProcessing(true);
        setAnalysisResult(data);

        setTimeout(() => {
            setIsProcessing(false);
        }, 2000);
    };

    const handleNewAnalysis = () => {
        if (analysisResult) {
            setShowConfirmModal(true);
        } else {

            setShowForm(true);
        }
    };

    const handleConfirmNewAnalysis = () => {
        setAnalysisResult(null);
        setShowConfirmModal(false);
        try {
            localStorage.removeItem(`jd-form-data-${user.id}`);
        } catch (error) {
            console.error('Failed to clear form data from localStorage:', error);
        }
        setFormKey(prev => prev + 1);
        setShowForm(true);
    };

    const handleRefineAnalysis = () => {
        if (analysisResult) {
            setShowRefineAnalysisModal(true);
        } else {
            setShowForm(true);
        }
    }

    const openDownload = () => {
        setShowDownloadModal(true)
    };

    const handleDownload = async () => {
        if (!analysisResult) return;

        try {
            const response = await fetch('/api/jd/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(analysisResult),
            });

            if (!response.ok) {
                throw new Error('Failed to download PDF');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'job-description-analysis.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download job description. Please try again.');
        }
    };

    const primaryRole = analysisResult?.ai_analysis?.roles?.[0];

    const refineSections = useMemo(() => {
        if (!analysisResult || !primaryRole) return [];

        const sections = [];

        sections.push({
            id: 'role',
            title: 'Recommended Role',
            content: (
                <div className="space-y-4">
                    <div>
                        <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                            {primaryRole.title}
                        </h4>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                            {primaryRole.family} • {primaryRole.service}
                        </p>
                        {primaryRole.purpose && (
                            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                    {primaryRole.purpose}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            ),
        });

        
        if (primaryRole.core_outcomes && primaryRole.core_outcomes.length > 0) {
            sections.push({
                id: 'outcomes',
                title: 'Core Outcomes (90 Days)',
                content: (
                    <ul className="space-y-3">
                        {primaryRole.core_outcomes.map((outcome, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <span className="text-[#00FF87] mt-1 flex-shrink-0">•</span>
                                <span className="text-sm text-zinc-700 dark:text-zinc-300 flex-1">
                                    {outcome}
                                </span>
                            </li>
                        ))}
                    </ul>
                ),
            });
        }


        if (primaryRole.responsibilities && primaryRole.responsibilities.length > 0) {
            sections.push({
                id: 'responsibilities',
                title: 'Key Responsibilities',
                content: (
                    <ul className="space-y-3">
                        {primaryRole.responsibilities.map((resp, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <span className="text-[#00FF87] mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#00FF87]"></span>
                                <span className="text-sm text-zinc-700 dark:text-zinc-300 flex-1 leading-relaxed">
                                    {resp}
                                </span>
                            </li>
                        ))}
                    </ul>
                ),
            });
        }

        if ((primaryRole.skills && primaryRole.skills.length > 0) || (primaryRole.tools && primaryRole.tools.length > 0)) {
            sections.push({
                id: 'skills-tools',
                title: 'Skills & Tools',
                content: (
                    <div className="space-y-4">
                        {primaryRole.skills && primaryRole.skills.length > 0 && (
                            <div>
                                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wide">
                                    Required Skills
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {primaryRole.skills.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-medium"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {primaryRole.tools && primaryRole.tools.length > 0 && (
                            <div>
                                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wide">
                                    Tools & Technologies
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {primaryRole.tools.map((tool, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1.5 bg-[#00FF87]/10 text-[#00FF87] rounded-lg text-xs font-medium border border-[#00FF87]/20"
                                        >
                                            {tool}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ),
            });
        }

        if (primaryRole.kpis && primaryRole.kpis.length > 0) {
            sections.push({
                id: 'kpis',
                title: 'Key Performance Indicators',
                content: (
                    <ul className="space-y-2">
                        {primaryRole.kpis.map((kpi, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <span className="text-[#00FF87] mt-1">•</span>
                                <span className="text-sm text-zinc-700 dark:text-zinc-300 flex-1">
                                    {kpi}
                                </span>
                            </li>
                        ))}
                    </ul>
                ),
            });
        }

        if (analysisResult.ai_analysis.service_recommendation) {
            sections.push({
                id: 'service',
                title: 'Service Recommendation',
                content: (
                    <div className="p-4 bg-[#00FF87]/5 border border-[#00FF87]/20 rounded-xl">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                            {analysisResult.ai_analysis.service_recommendation.best_fit}
                        </p>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-3">
                            {analysisResult.ai_analysis.service_recommendation.why}
                        </p>
                        {analysisResult.ai_analysis.service_recommendation.next_steps && (
                            <div>
                                <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                                    Next Steps:
                                </p>
                                <ul className="space-y-1">
                                    {analysisResult.ai_analysis.service_recommendation.next_steps.map((step, index) => (
                                        <li key={index} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                                            <span className="text-[#00FF87] mt-1">→</span>
                                            <span>{step}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ),
            });
        }

        return sections;
    }, [analysisResult, primaryRole]);

    const handleRefineSectionChange = (direction: 'prev' | 'next') => {
        if (direction === 'next' && refineSectionIndex < refineSections.length - 1) {
            setRefineSectionIndex(refineSectionIndex + 1);
        } else if (direction === 'prev' && refineSectionIndex > 0) {
            setRefineSectionIndex(refineSectionIndex - 1);
        }
    };

    const handleRefineSatisfaction = (sectionId: string, satisfied: boolean) => {
        setRefineFeedback(prev => ({
            ...prev,
            [sectionId]: {
                ...prev[sectionId],
                satisfied,
                feedback: satisfied ? '' : (prev[sectionId]?.feedback || ''),
            },
        }));
    };

    const handleRefineFeedbackChange = (sectionId: string, feedback: string) => {
        setRefineFeedback(prev => ({
            ...prev,
            [sectionId]: {
                ...prev[sectionId],
                feedback,
            },
        }));
    };

    const handleRefineModalClose = () => {
        setShowRefineAnalysisModal(false);
        setRefineSectionIndex(0);
        setRefineFeedback({});
    };

    const handleRefineSubmit = () => {
        if (refineSectionIndex < refineSections.length - 1) {
            handleRefineSectionChange('next');
        } else {
            console.log('Refine feedback:', refineFeedback);
            handleRefineModalClose();
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 relative">
            <Navbar />

            {/* Main Content */}
            <div className="mx-auto max-w-7xl px-4 pt-24 md:pt-32 pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Dashboard */}
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-4xl md:text-6xl font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                                {getCurrentGreeting()}
                            </h1>
                            <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400">
                                Let's get started with your virtual assistant needs
                            </p>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => setShowForm(true)}
                                className="w-full group relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 text-left transition-all hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#00FF87]/10 flex items-center justify-center ring-1 ring-[#00FF87]/30 shadow-[0_0_20px_#00FF87]/20 transition-all group-hover:shadow-[0_0_30px_#00FF87]/40">
                                        <svg
                                            className="w-6 h-6 text-[#00FF87]"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                                            Answer our form for us to better assess your needs
                                        </h3>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                            Help us understand your business goals and find the perfect match
                                        </p>
                                    </div>
                                    <svg
                                        className="w-5 h-5 text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors flex-shrink-0"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </button>
                        </div>

                        {/* Summary Section - Hidden until analysis is available */}
                        <AnimatePresence>
                            {analysisResult && !isProcessing && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm"
                                >
                                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                                        What You Told Us
                                    </h3>
                                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                        {analysisResult.preview.summary || analysisResult.ai_analysis.what_you_told_us || "Summary of your requirements will appear here."}
                                    </p>

                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right Column - Results */}
                    <div className="lg:sticky lg:top-24 lg:h-fit">
                        <AnimatePresence mode="wait">
                            {isProcessing ? (
                                <motion.div
                                    key="loader"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-lg"
                                >
                                    <div className="text-center mb-6">
                                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                                            Processing your analysis
                                        </h3>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                            Generating your personalized job description...
                                        </p>
                                    </div>
                                    <Loader />
                                </motion.div>
                            ) : analysisResult ? (
                                <motion.div
                                    key="results"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-lg overflow-hidden"
                                >
                                    {/* Header */}
                                    <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                                                    Analysis Results
                                                </h3>
                                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                    Comprehensive job description analysis
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">

                                                {/* Edit Button */}
                                                <div className="relative group">
                                                    <button
                                                        onClick={handleRefineAnalysis}
                                                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="w-5 h-5"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                            strokeWidth={2}
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M11 5h2m-1-1v2m-4.293 9.293l6.586-6.586a2 2 0 112.828 2.828l-6.586 6.586H7v-2.828z"
                                                            />
                                                        </svg>
                                                    </button>

                                                    <div className="absolute right-0 top-full mt-2 px-2.5 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-10 shadow-lg">
                                                        Refine Analysis
                                                        <div className="absolute -top-1 right-3 w-2 h-2 bg-zinc-900 dark:bg-zinc-100 rotate-45"></div>
                                                    </div>
                                                </div>

                                                {/* New Analysis Button */}
                                                <div className="relative group">
                                                    <button
                                                        onClick={handleNewAnalysis}
                                                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200"
                                                    >
                                                        <svg
                                                            className="w-4 h-4"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M12 4v16m8-8H4"
                                                            />
                                                        </svg>
                                                    </button>
                                                    <div className="absolute right-0 top-full mt-2 px-2.5 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-10 shadow-lg">
                                                        New Analysis
                                                        <div className="absolute -top-1 right-3 w-2 h-2 bg-zinc-900 dark:bg-zinc-100 rotate-45"></div>
                                                    </div>
                                                </div>

                                                {/* Download Button */}
                                                <div className="relative group">
                                                    <button
                                                        onClick={openDownload}
                                                        disabled={!analysisResult}
                                                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <svg
                                                            className="w-4 h-4"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                                            />
                                                        </svg>
                                                    </button>
                                                    <div className="absolute right-0 top-full mt-2 px-2.5 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-10 shadow-lg">
                                                        Download Job Description
                                                        <div className="absolute -top-1 right-3 w-2 h-2 bg-zinc-900 dark:bg-zinc-100 rotate-45"></div>
                                                    </div>
                                                </div>

                                                {/* Saved Analysis Button */}
                                                <div className="relative group">
                                                    <button
                                                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200"
                                                    >
                                                        <svg
                                                            className="w-4 h-4"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                                                            />
                                                        </svg>
                                                    </button>
                                                    <div className="absolute right-0 top-full mt-2 px-2.5 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-10 shadow-lg">
                                                        Save
                                                        <div className="absolute -top-1 right-3 w-2 h-2 bg-zinc-900 dark:bg-zinc-100 rotate-45"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Scrollable Content */}
                                    <div className="p-6 space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
                                        {/* Recommended Role */}
                                        {primaryRole && (
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wide">
                                                        Recommended Role
                                                    </p>
                                                    <h4 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                                                        {primaryRole.title}
                                                    </h4>
                                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                        {primaryRole.family} • {primaryRole.service}
                                                    </p>
                                                </div>

                                                {primaryRole.purpose && (
                                                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                                                        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                                            {primaryRole.purpose}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Core Outcomes */}
                                        {primaryRole?.core_outcomes && primaryRole.core_outcomes.length > 0 && (
                                            <div>
                                                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wide">
                                                    Core Outcomes (90 Days)
                                                </p>
                                                <ul className="space-y-2">
                                                    {primaryRole.core_outcomes.map((outcome, index) => (
                                                        <li key={index} className="flex items-start gap-3">
                                                            <span className="text-[#00FF87] mt-1 flex-shrink-0">•</span>
                                                            <span className="text-sm text-zinc-700 dark:text-zinc-300 flex-1">
                                                                {outcome}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Responsibilities */}
                                        {primaryRole?.responsibilities && primaryRole.responsibilities.length > 0 && (
                                            <div>
                                                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wide">
                                                    Key Responsibilities
                                                </p>
                                                <ul className="space-y-3">
                                                    {primaryRole.responsibilities.map((resp, index) => (
                                                        <li key={index} className="flex items-start gap-3">
                                                            <span className="text-[#00FF87] mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#00FF87]"></span>
                                                            <span className="text-sm text-zinc-700 dark:text-zinc-300 flex-1 leading-relaxed">
                                                                {resp}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Skills */}
                                        {primaryRole?.skills && primaryRole.skills.length > 0 && (
                                            <div>
                                                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wide">
                                                    Required Skills
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {primaryRole.skills.map((skill, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-medium"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Tools */}
                                        {primaryRole?.tools && primaryRole.tools.length > 0 && (
                                            <div>
                                                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wide">
                                                    Tools & Technologies
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {primaryRole.tools.map((tool, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-3 py-1.5 bg-[#00FF87]/10 text-[#00FF87] rounded-lg text-xs font-medium border border-[#00FF87]/20"
                                                        >
                                                            {tool}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* KPIs */}
                                        {primaryRole?.kpis && primaryRole.kpis.length > 0 && (
                                            <div>
                                                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wide">
                                                    Key Performance Indicators
                                                </p>
                                                <ul className="space-y-2">
                                                    {primaryRole.kpis.map((kpi, index) => (
                                                        <li key={index} className="flex items-start gap-2">
                                                            <span className="text-[#00FF87] mt-1">•</span>
                                                            <span className="text-sm text-zinc-700 dark:text-zinc-300 flex-1">
                                                                {kpi}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Personality Traits */}
                                        {primaryRole?.personality && primaryRole.personality.length > 0 && (
                                            <div>
                                                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wide">
                                                    Personality Fit
                                                </p>
                                                <ul className="space-y-2">
                                                    {primaryRole.personality.map((trait, index) => (
                                                        <li key={index} className="flex items-start gap-2">
                                                            <span className="text-zinc-400 dark:text-zinc-600 mt-1">•</span>
                                                            <span className="text-sm text-zinc-700 dark:text-zinc-300 flex-1">
                                                                {trait}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Sample Week */}
                                        {primaryRole?.sample_week && (
                                            <div>
                                                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wide">
                                                    Sample Week
                                                </p>
                                                <div className="space-y-3">
                                                    {Object.entries(primaryRole.sample_week).map(([day, activities]) => (
                                                        <div key={day} className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                                                            <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1 uppercase">
                                                                {day}
                                                            </p>
                                                            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                                                {activities}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Communication & Overlap */}
                                        {(primaryRole?.communication_norms || primaryRole?.overlap_requirements) && (
                                            <div className="space-y-3">
                                                {primaryRole.overlap_requirements && (
                                                    <div>
                                                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wide">
                                                            Overlap Requirements
                                                        </p>
                                                        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                                            {primaryRole.overlap_requirements}
                                                        </p>
                                                    </div>
                                                )}
                                                {primaryRole.communication_norms && (
                                                    <div>
                                                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wide">
                                                            Communication Norms
                                                        </p>
                                                        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                                            {primaryRole.communication_norms}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Service Recommendation */}
                                        {analysisResult.ai_analysis.service_recommendation && (
                                            <div className="p-4 bg-[#00FF87]/5 border border-[#00FF87]/20 rounded-xl">
                                                <p className="text-xs font-medium text-[#00FF87] mb-2 uppercase tracking-wide">
                                                    Service Recommendation
                                                </p>
                                                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                                                    {analysisResult.ai_analysis.service_recommendation.best_fit}
                                                </p>
                                                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-3">
                                                    {analysisResult.ai_analysis.service_recommendation.why}
                                                </p>
                                                {analysisResult.ai_analysis.service_recommendation.next_steps && (
                                                    <div>
                                                        <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                                                            Next Steps:
                                                        </p>
                                                        <ul className="space-y-1">
                                                            {analysisResult.ai_analysis.service_recommendation.next_steps.map((step, index) => (
                                                                <li key={index} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                                                                    <span className="text-[#00FF87] mt-1">→</span>
                                                                    <span>{step}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Onboarding Plan */}
                                        {analysisResult.ai_analysis.onboarding_2w && (
                                            <div>
                                                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wide">
                                                    2-Week Onboarding Plan
                                                </p>
                                                <div className="space-y-4">
                                                    {analysisResult.ai_analysis.onboarding_2w.week_1 && (
                                                        <div>
                                                            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                                                                Week 1
                                                            </p>
                                                            <ul className="space-y-2">
                                                                {analysisResult.ai_analysis.onboarding_2w.week_1.map((task, index) => (
                                                                    <li key={index} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                                                                        <span className="text-[#00FF87] mt-1">•</span>
                                                                        <span>{task}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    {analysisResult.ai_analysis.onboarding_2w.week_2 && (
                                                        <div>
                                                            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                                                                Week 2
                                                            </p>
                                                            <ul className="space-y-2">
                                                                {analysisResult.ai_analysis.onboarding_2w.week_2.map((task, index) => (
                                                                    <li key={index} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                                                                        <span className="text-[#00FF87] mt-1">•</span>
                                                                        <span>{task}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Risks & Assumptions */}
                                        {(analysisResult.ai_analysis.risks?.length > 0 || analysisResult.ai_analysis.assumptions?.length > 0) && (
                                            <div className="space-y-4">
                                                {analysisResult.ai_analysis.risks?.length > 0 && (
                                                    <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl">
                                                        <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-3 uppercase tracking-wide">
                                                            Risks & Considerations
                                                        </p>
                                                        <ul className="space-y-2">
                                                            {analysisResult.ai_analysis.risks.map((risk, index) => (
                                                                <li key={index} className="flex items-start gap-2">
                                                                    <span className="text-amber-600 dark:text-amber-400 mt-1">•</span>
                                                                    <span className="text-sm text-amber-800 dark:text-amber-300 flex-1">
                                                                        {risk}
                                                                    </span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                {analysisResult.ai_analysis.assumptions?.length > 0 && (
                                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl">
                                                        <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-3 uppercase tracking-wide">
                                                            Assumptions
                                                        </p>
                                                        <ul className="space-y-2">
                                                            {analysisResult.ai_analysis.assumptions.map((assumption, index) => (
                                                                <li key={index} className="flex items-start gap-2">
                                                                    <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                                                                    <span className="text-sm text-blue-800 dark:text-blue-300 flex-1">
                                                                        {assumption}
                                                                    </span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>



                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-lg text-center"
                                >
                                    <div className="text-zinc-400 dark:text-zinc-600 mb-4">
                                        <svg
                                            className="w-16 h-16 mx-auto"
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
                                    </div>
                                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                                        No analysis yet
                                    </h3>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                                        Fill out the form to generate your personalized job description
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </div>

            {/* Modal Transition Wrapper */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Backdrop */}
                        <motion.div
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setShowForm(false)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />

                        {/* Animated Form Container */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="relative z-10 w-full max-w-2xl"
                        >
                            <IntakeForm
                                key={formKey}
                                onClose={() => setShowForm(false)}
                                userId={user.id}
                                onSuccess={handleFormSuccess}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirmation Modal */}
            <Modal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleConfirmNewAnalysis}
                title="Start New Analysis?"
                message="Your current analysis data will be lost unless you've saved it. Are you sure you want to proceed?"
                confirmText="Start New Analysis"
                cancelText="Cancel"
                confirmVariant="danger"
            />

            {/* Refine Analysis Modal */}
            <Modal
                isOpen={showRefineAnalysisModal}
                onClose={handleRefineModalClose}
                onConfirm={handleRefineSubmit}
                title="Refine Analysis"
                message="Review each section and provide feedback on what needs improvement."
                confirmText={refineSectionIndex === refineSections.length - 1 ? "Submit Refinement" : "Next"}
                cancelText="Cancel"
                confirmVariant="primary"
                maxWidth="4xl"
                body={
                    refineSections.length > 0 && (
                        <div className="space-y-6">
                            {/* Progress Indicator */}
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-zinc-600 dark:text-zinc-400">
                                    Section {refineSectionIndex + 1} of {refineSections.length}
                                </span>
                                <div className="flex gap-1">
                                    {refineSections.map((_, index) => (
                                        <div
                                            key={index}
                                            className={`h-1.5 rounded-full transition-all ${index <= refineSectionIndex
                                                    ? 'bg-[#00FF87] w-8'
                                                    : 'bg-zinc-200 dark:bg-zinc-800 w-1.5'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Section Content */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={refineSectionIndex}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="min-h-[400px]"
                                >
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                                            {refineSections[refineSectionIndex].title}
                                        </h3>
                                        <div className="text-sm text-zinc-600 dark:text-zinc-400">
                                            {refineSections[refineSectionIndex].content}
                                        </div>
                                    </div>

                                    {/* Satisfaction Toggle */}
                                    <div className="mt-8 p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-4">
                                            Are you satisfied with this section?
                                        </label>
                                        <div className="flex gap-4 mb-6">
                                            <button
                                                onClick={() => handleRefineSatisfaction(refineSections[refineSectionIndex].id, true)}
                                                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${refineFeedback[refineSections[refineSectionIndex].id]?.satisfied === true
                                                        ? 'bg-[#00FF87] text-zinc-900 border-2 border-[#00FF87]'
                                                        : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                                                    }`}
                                            >
                                                Yes
                                            </button>
                                            <button
                                                onClick={() => handleRefineSatisfaction(refineSections[refineSectionIndex].id, false)}
                                                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${refineFeedback[refineSections[refineSectionIndex].id]?.satisfied === false
                                                        ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-2 border-red-300 dark:border-red-700'
                                                        : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                                                    }`}
                                            >
                                                No
                                            </button>
                                        </div>

                                        {/* Feedback Input (shown when not satisfied) */}
                                        {refineFeedback[refineSections[refineSectionIndex].id]?.satisfied === false && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                                                    What would you like to change or improve?
                                                </label>
                                                <textarea
                                                    value={refineFeedback[refineSections[refineSectionIndex].id]?.feedback || ''}
                                                    onChange={(e) => handleRefineFeedbackChange(refineSections[refineSectionIndex].id, e.target.value)}
                                                    placeholder="Describe your suggestions or improvements..."
                                                    rows={4}
                                                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#00FF87]/30 focus:border-[#00FF87] transition-all"
                                                />
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {/* Navigation */}
                            <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
                                <button
                                    onClick={() => handleRefineSectionChange('prev')}
                                    disabled={refineSectionIndex === 0}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${refineSectionIndex === 0
                                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                                            : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Previous
                                    </div>
                                </button>
                                <button
                                    onClick={() => handleRefineSectionChange('next')}
                                    disabled={refineSectionIndex === refineSections.length - 1}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${refineSectionIndex === refineSections.length - 1
                                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                                            : 'bg-[#00FF87] text-zinc-900 hover:brightness-110'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        Next
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )
                }
            />

            {/* Download Modal */}
            <Modal
                isOpen={showDownloadModal}
                onClose={() => setShowDownloadModal(false)}
                onConfirm={handleDownload}
                title="Download Analysis"
                message="Are you sure you want to download the analysis report?"
                confirmText="Download"
                cancelText="Cancel"
                confirmVariant="primary"
            />


        </div>
    );
}
