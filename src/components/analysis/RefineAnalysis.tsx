"use client";

import { useState, useMemo, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Modal from "@/components/ui/Modal";

interface AnalysisResult {
    preview: any;
    full_package: any;
    metadata?: any;
}

interface RefineAnalysisProps {
    isOpen: boolean;
    onClose: () => void;
    analysisResult: AnalysisResult | null;
    onRefineComplete: (updatedAnalysis: AnalysisResult) => void;
    getPrimaryRole: (result: AnalysisResult | null) => any;
    formatResultValue: (value: any, depth?: number) => React.ReactNode;
}

export default function RefineAnalysis({
    isOpen,
    onClose,
    analysisResult,
    onRefineComplete,
    getPrimaryRole,
    formatResultValue,
}: RefineAnalysisProps) {

    const [refineSectionIndex, setRefineSectionIndex] = useState(0);
    const [refineFeedback, setRefineFeedback] = useState<Record<string, { satisfied: boolean | null; feedback: string }>>({});
    const [isRefineSubmitting, setIsRefineSubmitting] = useState(false);
    const [refineSubmitError, setRefineSubmitError] = useState<string | null>(null);
    const [refineResult, setRefineResult] = useState<{ success: boolean; message: string; sections?: string[] } | null>(null);
    const [recOpen, setRecOpen] = useState(false);

    const primaryRole = getPrimaryRole(analysisResult);
    const implementationPlan = analysisResult?.full_package?.implementation_plan;

    // Sections for refinement
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
                        {primaryRole.core_outcomes.map((outcome: string, index: number) => (
                            <li key={index} className="flex items-start gap-3">
                                <span className="text-[var(--primary)] mt-1 flex-shrink-0">•</span>
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
                        {primaryRole.responsibilities.map((resp: string, index: number) => (
                            <li key={index} className="flex items-start gap-3">
                                <span className="text-[var(--primary)] mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[var(--primary)]"></span>
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
                                    {primaryRole.skills.map((skill: string, index: number) => (
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
                                    {primaryRole.tools.map((tool: string, index: number) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1.5 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg text-xs font-medium border border-[var(--primary)]/20"
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
                        {primaryRole.kpis.map((kpi: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                                <span className="text-[var(--primary)] mt-1">•</span>
                                <span className="text-sm text-zinc-700 dark:text-zinc-300 flex-1">
                                    {kpi}
                                </span>
                            </li>
                        ))}
                    </ul>
                ),
            });
        }

        const serviceRec = analysisResult.full_package?.executive_summary?.service_recommendation;
        sections.push({
            id: 'service',
            title: 'Service Recommendation',
            content: (
                <div
                    className="p-4 border rounded-xl bg-gradient-to-b from-white/40 to-white/10 dark:from-zinc-900/40 dark:to-zinc-900/25"
                >
                    <button
                        onClick={() => setRecOpen((s) => !s)}
                        className="w-full flex items-start gap-3"
                        aria-expanded={recOpen}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-6 h-6 text-[var(--primary)]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                            aria-hidden="true"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1M4.2 6.2l.7.7M19.1 17.8l.7.7M4.2 17.8l.7-.7M19.1 6.2l.7-.7" />
                        </svg>

                        <div className="flex-1 text-left">
                            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                                Recommended Structure
                            </p>
                            <div className="flex items-center justify-between">
                                <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                    {serviceRec?.type || analysisResult.preview?.service_type || "Recommended Structure"}
                                </h4>
                                <div className="text-sm text-zinc-500">
                                    <span className="mr-3">{primaryRole ? `${primaryRole.percentage_of_outcome || 0}% impact` : ""}</span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`w-5 h-5 transition-transform ${recOpen ? "rotate-180" : ""}`}
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l5 5a1 1 0 11-1.414 1.414L10 5.414 5.707 9.707A1 1 0 114.293 8.293l5-5A1 1 0 0110 3z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </button>

                    {recOpen && serviceRec && (
                        <div className="mt-4 space-y-4">
                            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                {serviceRec.reasoning}
                            </p>

                            {analysisResult.full_package?.role_architecture?.recommended_structure?.total_cost_estimate && (
                                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                                    <span className="font-semibold">Cost Estimate: </span>
                                    {analysisResult.full_package.role_architecture.recommended_structure.total_cost_estimate}
                                </p>
                            )}

                            {implementationPlan?.immediate_next_steps && implementationPlan.immediate_next_steps.length > 0 && (
                                <div>
                                    <p className="text-xs font-medium text-zinc-600 uppercase tracking-wide mb-2">Next Steps</p>
                                    {formatResultValue(implementationPlan.immediate_next_steps.map((s: any) => s.step || s))}
                                </div>
                            )}

                            {analysisResult.full_package?.role_architecture?.alternative_scenarios && analysisResult.full_package.role_architecture.alternative_scenarios.length > 0 && (
                                <details className="bg-zinc-50 dark:bg-zinc-900/40 rounded-lg p-3">
                                    <summary className="cursor-pointer font-semibold text-sm">Alternative Scenarios</summary>
                                    <div className="mt-3">
                                        {formatResultValue(analysisResult.full_package.role_architecture.alternative_scenarios)}
                                    </div>
                                </details>
                            )}
                        </div>
                    )}
                </div>
            ),
        });

        return sections;
    }, [analysisResult, primaryRole, recOpen, implementationPlan, formatResultValue]);

    // Handlers for refinement modal
    const handleRefineSectionChange = (direction: 'prev' | 'next') => {
        setRefineSubmitError(null);
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

    const handleRefineReset = (preserveResult = false) => {
        setRefineSectionIndex(0);
        setRefineFeedback({});
        setRefineSubmitError(null);
        setIsRefineSubmitting(false);
        if (!preserveResult) {
            setRefineResult(null);
        }
    };

    // Submit refinement feedback using PATCH endpoint
    const handleRefineSubmit = async () => {
        if (refineSections.length === 0) {
            setRefineSubmitError("No sections are available for refinement right now.");
            return;
        }

        if (refineSectionIndex < refineSections.length - 1) {
            handleRefineSectionChange('next');
            return;
        }

        if (isRefineSubmitting) {
            return;
        }

        const actionableFeedback = Object.entries(refineFeedback).filter(
            ([, value]) => value?.satisfied === false
        );

        if (actionableFeedback.length === 0) {
            setRefineSubmitError("Please mark at least one section as not satisfied and provide feedback before submitting.");
            return;
        }

        if (!analysisResult) {
            setRefineSubmitError("No analysis found to refine.");
            return;
        }

        const messageLines = actionableFeedback.map(([sectionId, value]) => {
            const sectionTitle = refineSections.find(section => section.id === sectionId)?.title || sectionId;
            const feedbackText = value?.feedback?.trim()
                ? value.feedback.trim()
                : "No specific feedback provided, but this section needs improvement.";
            return `Section "${sectionTitle}": ${feedbackText}`;
        });

        const feedback = `Please apply the following refinement feedback:\n${messageLines.join("\n")}`;
        const refinementAreas = actionableFeedback.map(([sectionId]) => sectionId);

        setIsRefineSubmitting(true);
        setRefineSubmitError(null);

        try {
            const response = await fetch('/api/jd/analyze', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    original_package: {
                        preview: analysisResult.preview,
                        full_package: analysisResult.full_package,
                        metadata: analysisResult.metadata,
                    },
                    feedback,
                    refinement_areas: refinementAreas,
                    iteration: 0,
                }),
            });

            const payload = await response.json().catch(() => null);

            if (!response.ok || !payload?.refined_package) {
                const errorMessage = payload?.error || 'Failed to refine analysis';
                throw new Error(errorMessage);
            }

            // Transform the refined package back to AnalysisResult format
            const refinedPackage = payload.refined_package;
            const updatedAnalysis: AnalysisResult = {
                preview: refinedPackage.preview || analysisResult.preview,
                full_package: refinedPackage.full_package || refinedPackage,
                metadata: refinedPackage.metadata || analysisResult.metadata,
            };

            onRefineComplete(updatedAnalysis);

            setRefineResult({
                success: true,
                message: payload?.changes_summary || 'Refinement applied successfully.',
                sections: refinementAreas,
            });

            // Close modal after a brief delay to show success
            setTimeout(() => {
                onClose();
                handleRefineReset(false);
            }, 1500);
        } catch (error: any) {
            console.error('Refine error:', error);
            setRefineSubmitError(error?.message || 'Failed to submit refinement. Please try again.');
        } finally {
            setIsRefineSubmitting(false);
        }
    };

    const handleClose = () => {
        handleRefineReset(refineResult?.success === true);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            onConfirm={handleRefineSubmit}
            title="Refine Analysis"
            message="Review each section and provide feedback on what needs improvement."
            confirmText={
                refineSectionIndex === refineSections.length - 1 ? (
                    isRefineSubmitting ? (
                        <div className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            <span>Submitting...</span>
                        </div>
                    ) : (
                        "Submit Refinement"
                    )
                ) : (
                    "Next"
                )
            }
            cancelText="Cancel"
            confirmVariant="primary"
            maxWidth="4xl"
            body={
                refineSections.length > 0 && (
                    <div className="flex flex-col max-h-[calc(100vh-12rem)] sm:max-h-[calc(100vh-10rem)]">
                        {/* Scrollable Content Area */}
                        <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-6">
                            {refineSubmitError && (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-3 sm:px-4 py-2 sm:py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                                    {refineSubmitError}
                                </div>
                            )}

                            {refineResult?.success && (
                                <div className="rounded-lg border border-green-200 bg-green-50 px-3 sm:px-4 py-2 sm:py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
                                    {refineResult.message}
                                </div>
                            )}

                            {/* Progress Indicator */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 text-sm">
                                <span className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">
                                    Section {refineSectionIndex + 1} of {refineSections.length}
                                </span>
                                <div className="flex gap-1 w-full sm:w-auto">
                                    {refineSections.map((_, index) => (
                                        <div
                                            key={index}
                                            className={`h-1.5 rounded-full transition-all flex-1 sm:flex-none ${index <= refineSectionIndex
                                                ? 'bg-[var(--primary)] sm:w-8'
                                                : 'bg-zinc-200 dark:bg-zinc-800 sm:w-1.5'
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
                                    className="min-h-[300px] sm:min-h-[400px]"
                                >
                                    <div className="mb-4 sm:mb-6">
                                        <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                                            {refineSections[refineSectionIndex].title}
                                        </h3>
                                        <div className="text-sm text-zinc-600 dark:text-zinc-400">
                                            {refineSections[refineSectionIndex].content}
                                        </div>
                                    </div>

                                    {/* Satisfaction Toggle */}
                                    <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3 sm:mb-4">
                                            Are you satisfied with this section?
                                        </label>
                                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
                                            <button
                                                onClick={() => handleRefineSatisfaction(refineSections[refineSectionIndex].id, true)}
                                                className={`flex-1 px-4 py-2.5 sm:py-3 rounded-lg text-sm font-medium transition-all ${refineFeedback[refineSections[refineSectionIndex].id]?.satisfied === true
                                                    ? 'bg-[var(--primary)] text-white border-2 border-[var(--primary)]'
                                                    : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                                                    }`}
                                            >
                                                Yes
                                            </button>
                                            <button
                                                onClick={() => handleRefineSatisfaction(refineSections[refineSectionIndex].id, false)}
                                                className={`flex-1 px-4 py-2.5 sm:py-3 rounded-lg text-sm font-medium transition-all ${refineFeedback[refineSections[refineSectionIndex].id]?.satisfied === false
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
                                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all resize-none"
                                                />
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {/* Internal Navigation - Part of scrollable content */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 pt-4 border-t border-zinc-200 dark:border-zinc-800 pb-2">
                                <button
                                    onClick={() => handleRefineSectionChange('prev')}
                                    disabled={refineSectionIndex === 0}
                                    className={`px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-all ${refineSectionIndex === 0
                                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                                        : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                                        }`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        <span>Previous</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => handleRefineSectionChange('next')}
                                    disabled={refineSectionIndex === refineSections.length - 1}
                                    className={`px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2
                                    ${refineSectionIndex === refineSections.length - 1
                                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                                            : 'bg-[var(--primary)] text-white hover:brightness-110'}
                                    `}
                                >
                                    <span>Next</span>
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
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        />
    );
}

