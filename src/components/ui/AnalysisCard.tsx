import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Calendar, Clock, Users, Target, Briefcase, AlertTriangle, Trash2, Download } from 'lucide-react';
import Modal from './Modal';

interface SavedAnalysis {
    id: string;
    title: string;
    isFinalized: boolean;
    finalizedAt: string | null;
    createdAt: string;
    updatedAt: string;
    refinementCount: number;
    intakeData: {
        companyName: string;
        website: string;
        businessGoal: string;
        outcome90Day: string;
        weeklyHours: string;
        budgetBand: string;
        timezone: string;
        dailyOverlap: string;
        clientFacing: string;
        englishLevel: string;
        managementStyle: string;
        reportingExpectations: string;
        tools: string;
        tasks: string[];
        requirements: string[];
        niceToHaveSkills: string;
        dealBreakers: string;
        securityNeeds: string;
        existingSOPs: string;
        roleSplit: string;
        examplesURL: string;
    };
    preview: {
        recommended_role: string;
        service_mapping: string;
        weekly_hours: number;
        primary_outcome: string;
        role_purpose: string;
        client_facing: boolean;
        summary: string;
        key_tools: string[];
        core_outcomes: string[];
        kpis: string[];
        risks: string[];
    };
    ai_analysis: {
        risks: string[];
        roles: {
            kpis: string[];
            title: string;
            tools: string[];
            family: string;
            skills: string[];
            purpose: string;
            service: string;
            personality: string[];
            sample_week: Record<string, string>;
            reporting_to: string;
            client_facing: boolean;
            core_outcomes: string[];
            hours_per_week: number;
            responsibilities: string[];
            communication_norms: string;
            overlap_requirements: string;
        }[];
        assumptions: string[];
        split_table: {
            hrs: number;
            role: string;
            purpose: string;
            service: string;
            core_outcomes: string[];
        }[];
        onboarding_2w: {
            week_1: string[];
            week_2: string[];
        };
        what_you_told_us: string;
        service_recommendation: {
            why: string;
            best_fit: string;
            next_steps: string[];
            cost_framing: string;
        };
    };
    classification: {
        crafts: {
            role: string;
            family: string;
            keywords: number;
        }[];
        split_logic: {
            reason: string;
            shouldSplit: boolean;
        };
        service_mapping: {
            reason: string;
            service: string;
        };
    };
}

interface AnalysisCardProps {
    savedAnalysis: SavedAnalysis;
    onDelete?: (id: string) => void;
}

const AnalysisCard = ({ savedAnalysis, onDelete }: AnalysisCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const primaryRole = savedAnalysis.ai_analysis.roles[0];

    const handleDeleteConfirm = async () => {
        try {
            setIsDeleting(true);

            const response = await fetch(`/api/jd/analysis/${savedAnalysis.id}`, {
                method: "DELETE",
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to delete");

            console.log(data.message);

            onDelete?.(savedAnalysis.id);

            setIsDeleteModalOpen(false);
        } catch (err) {
            console.error(err);
            alert("Failed to delete analysis. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDownloadConfirm = async () => {
        try {
            setIsDownloading(true);

            const response = await fetch('/api/jd/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    preview: {
                        summary: savedAnalysis.ai_analysis.what_you_told_us,
                        primary_outcome: savedAnalysis.intakeData.outcome90Day,
                        recommended_role: primaryRole?.title || '',
                        role_purpose: primaryRole?.purpose || '',
                        service_mapping: primaryRole?.service || '',
                        weekly_hours: primaryRole?.hours_per_week || 0,
                        client_facing: primaryRole?.client_facing ?? false,
                        core_outcomes: primaryRole?.core_outcomes || [],
                        kpis: primaryRole?.kpis || [],
                        key_tools: primaryRole?.tools?.slice(0, 5) || [],
                        risks: savedAnalysis.ai_analysis.risks || [],
                    },
                    ai_analysis: savedAnalysis.ai_analysis,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to download PDF');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            // Get filename from response headers or use default
            const contentDisposition = response.headers.get('Content-Disposition');
            const filename = contentDisposition
                ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') || 'job-description-analysis.pdf'
                : 'job-description-analysis.pdf';

            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            setIsDownloadModalOpen(false);
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download job description. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    {/* LEFT SIDE */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h2 className="text-2xl font-bold text-[var(--primary)] dark:text-white">{savedAnalysis.title}</h2>
                            {savedAnalysis.isFinalized && (
                                <span className="px-3 py-1 text-xs font-semibold text-white bg-[var(--accent)] rounded-full">
                                    Finalized
                                </span>
                            )}
                            {savedAnalysis.refinementCount > 0 && (
                                <span className="px-3 py-1 text-xs font-semibold text-[var(--primary)] bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-full">
                                    {savedAnalysis.refinementCount} Refinement
                                    {savedAnalysis.refinementCount !== 1 ? "s" : ""}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400 flex-wrap">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>Created: {formatDate(savedAnalysis.createdAt)}</span>
                            </div>
                            {savedAnalysis.finalizedAt && (
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>Finalized: {formatDate(savedAnalysis.finalizedAt)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT SIDE (ICONS) */}
                    <div className="flex items-center gap-4 ml-6">
                        <button
                            onClick={() => setIsDownloadModalOpen(true)}
                            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                            title="Download analysis as PDF"
                        >
                            <Download className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
                        </button>

                        <button
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition"
                            title="Delete analysis"
                        >
                            <Trash2 className="w-5 h-5 text-red-500" />
                        </button>
                    </div>
                </div>

                {/* Company Info */}
                {savedAnalysis.intakeData.companyName && (
                    <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-2 mb-2">
                            <Briefcase className="w-4 h-4 text-[var(--primary)] dark:text-[var(--accent)]" />
                            <span className="font-semibold text-[var(--primary)] dark:text-[var(--accent)]">{savedAnalysis.intakeData.companyName}</span>
                        </div>
                        {savedAnalysis.intakeData.website && (
                            <a
                                href={savedAnalysis.intakeData.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-[var(--primary)] transition-colors"
                            >
                                {savedAnalysis.intakeData.website}
                            </a>
                        )}
                    </div>
                )}

                {/* Role Overview */}
                {primaryRole && (
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                            <div className="px-4 py-2 bg-[var(--primary)]/10 border border-[var(--primary)]/20 dark:border-[var(--accent)]/20 dark:bg-[var(--accent)]/10  rounded-lg">
                                <p className="text-[var(--primary)]  dark:text-[var(--accent)] font-semibold text-sm">{primaryRole.title}</p>
                            </div>
                            <div className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg">
                                <p className="text-zinc-700 dark:text-zinc-300 text-sm">{primaryRole.family} • {primaryRole.service}</p>
                            </div>
                            <div className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg">
                                <p className="text-zinc-700 dark:text-zinc-300 text-sm">{primaryRole.hours_per_week}h/week</p>
                            </div>
                        </div>
                        {primaryRole.purpose && (
                            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl mb-4">
                                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{primaryRole.purpose}</p>
                            </div>
                        )}
                        {savedAnalysis.ai_analysis.what_you_told_us && (
                            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-sm">{savedAnalysis.ai_analysis.what_you_told_us}</p>
                        )}
                    </div>
                )}

                {/* Primary Outcome */}
                {savedAnalysis.intakeData.outcome90Day && (
                    <div className="mb-6 p-4 bg-[var(--accent)]/10 dark:bg-[var(--accent)]/10 rounded-xl border border-[var(--accent)] dark:border-[var(--accent)]/20">
                        <div className="flex items-start gap-3">
                            <Target className="w-5 h-5 text-[var(--accent)] dark:text-[var(--accent)] mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="text-xs font-semibold text-[var(--accent)]/100 dark:text-[var(--accent)] uppercase tracking-wider mb-1">
                                    90-Day Outcome
                                </h3>
                                <p className="text-zinc-700 dark:text-zinc-300 text-sm">{savedAnalysis.intakeData.outcome90Day}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Core Outcomes Preview */}
                {primaryRole?.core_outcomes && primaryRole.core_outcomes.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-xs font-bold text-[var(--primary)] dark:text-[var(--accent)] uppercase tracking-wider mb-3">
                            Core Outcomes
                        </h3>
                        <div className="grid gap-2">
                            {primaryRole.core_outcomes.slice(0, 3).map((outcome, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                    <span className="text-[var(--primary)] dark:text-[var(--accent)] mt-1 flex-shrink-0">•</span>
                                    <p className="text-zinc-700 dark:text-zinc-300 text-sm">{outcome}</p>
                                </div>
                            ))}
                            {primaryRole.core_outcomes.length > 3 && !isExpanded && (
                                <p className="text-zinc-600 dark:text-zinc-400 text-sm text-center mt-1">
                                    +{primaryRole.core_outcomes.length - 3} more outcomes
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Expand/Collapse Button */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full mt-4 px-4 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-800 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 text-sm"
                >
                    <span className="font-medium">
                        {isExpanded ? 'Show Less' : 'View Full Analysis'}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
            </div>

            {/* Expanded Section */}
            {isExpanded && primaryRole && (
                <div className="border-t border-zinc-200 dark:border-zinc-800 p-6 space-y-6">

                    {/* Key Tools */}
                    {primaryRole.tools && primaryRole.tools.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold text-[var(--accent)] dark:text-[var(--accent)] uppercase tracking-wider mb-3">
                                Tools & Technologies
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {primaryRole.tools.map((tool, idx) => (
                                    <span key={idx} className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-medium">
                                        {tool}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* KPIs */}
                    {primaryRole.kpis && primaryRole.kpis.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold text-[var(--accent)] dark:text-[var(--accent)] uppercase tracking-wider mb-3">
                                Key Performance Indicators
                            </h3>
                            <ul className="space-y-2">
                                {primaryRole.kpis.map((kpi, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <span className="text-[var(--primary)] dark:text-[var(--accent)] mt-1">•</span>
                                        <span className="text-sm text-zinc-700 dark:text-zinc-300 flex-1">{kpi}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Primary Role Details */}
                    {primaryRole && (
                        <div>
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Role Details: {primaryRole.title}</h3>

                            {/* Responsibilities */}
                            {primaryRole.responsibilities && primaryRole.responsibilities.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-xs font-bold text-[var(--accent)] dark:text-[var(--accent)] uppercase tracking-wider mb-3">Key Responsibilities</h4>
                                    <ul className="space-y-3">
                                        {primaryRole.responsibilities.map((resp, idx) => (
                                            <li key={idx} className="flex items-start gap-3">
                                                <span className="text-[var(--accent)] dark:text-[var(--accent)] mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[var(--primary)] dark:bg-[var(--accent)]"></span>
                                                <span className="text-sm text-zinc-700 dark:text-zinc-300 flex-1 leading-relaxed">{resp}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Skills */}
                            {primaryRole.skills && primaryRole.skills.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-xs font-bold text-[var(--accent)] dark:text-[var(--accent)] uppercase tracking-wider mb-3">Required Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {primaryRole.skills.map((skill, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-medium"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Personality Traits */}
                            {primaryRole.personality && primaryRole.personality.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-xs font-bold text-[var(--accent)] dark:text-[var(--accent)] uppercase tracking-wider mb-3">Personality Fit</h4>
                                    <ul className="space-y-2">
                                        {primaryRole.personality.map((trait, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <span className="text-zinc-400 dark:text-zinc-600 mt-1">•</span>
                                                <span className="text-sm text-zinc-700 dark:text-zinc-300 flex-1">{trait}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Sample Week */}
                            {primaryRole.sample_week && Object.keys(primaryRole.sample_week).length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-xs font-bold text-[var(--accent)] dark:text-[var(--accent)] uppercase tracking-wider mb-3">Sample Week</h4>
                                    <div className="space-y-3">
                                        {Object.entries(primaryRole.sample_week).map(([day, activity]) => (
                                            <div key={day} className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                                                <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1 uppercase">
                                                    {day}
                                                </p>
                                                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{activity}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Communication & Overlap */}
                            <div className="space-y-3 mb-6">
                                {primaryRole.overlap_requirements && (
                                    <div>
                                        <h4 className="text-xs font-bold text-[var(--accent)] dark:text-[var(--accent)] uppercase tracking-wider mb-3">
                                            Overlap Requirements
                                        </h4>
                                        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{primaryRole.overlap_requirements}</p>
                                    </div>
                                )}
                                {primaryRole.communication_norms && (
                                    <div>
                                        <h4 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                                            Communication Norms
                                        </h4>
                                        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{primaryRole.communication_norms}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Risks & Assumptions */}
                    {(savedAnalysis.ai_analysis.risks?.length > 0 || savedAnalysis.ai_analysis.assumptions?.length > 0) && (
                        <div className="space-y-4">
                            {savedAnalysis.ai_analysis.risks && savedAnalysis.ai_analysis.risks.length > 0 && (
                                <div className="p-4 bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-xl dark:bg-zinc-800 dark:border-zinc-700">
                                    <div className="flex items-center gap-2 mb-3">
                                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Risks & Considerations</h3>
                                    </div>
                                    <ul className="space-y-2">
                                        {savedAnalysis.ai_analysis.risks.map((risk, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <span className="text-[var(--primary)] dark:text-[var(--accent)] mt-1">•</span>
                                                <span className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{risk}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {savedAnalysis.ai_analysis.assumptions && savedAnalysis.ai_analysis.assumptions.length > 0 && (
                                <div className="p-4 bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-xl dark:bg-zinc-800 dark:border-zinc-700">
                                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Assumptions</h3>
                                    <ul className="space-y-2">
                                        {savedAnalysis.ai_analysis.assumptions.map((assumption, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <span className="text-[var(--primary)] dark:text-[var(--accent)] mt-1">•</span>
                                                <span className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{assumption}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Service Recommendation */}
                    {savedAnalysis.ai_analysis.service_recommendation && (
                        <div className="p-4 bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-xl dark:bg-zinc-800 dark:border-zinc-700">
                            <p className="text-xs font-medium text-[var(--primary)] mb-2 uppercase tracking-wider dark:text-[var(--accent)]">
                                Service Recommendation
                            </p>
                            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                                {savedAnalysis.ai_analysis.service_recommendation.best_fit}
                            </p>
                            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-3">
                                {savedAnalysis.ai_analysis.service_recommendation.why}
                            </p>
                            {savedAnalysis.ai_analysis.service_recommendation.next_steps && (
                                <div>
                                    <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                                        Next Steps:
                                    </p>
                                    <ul className="space-y-1">
                                        {savedAnalysis.ai_analysis.service_recommendation.next_steps.map((step, index) => (
                                            <li key={index} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                                                <span className="text-[var(--primary)] mt-1 dark:text-[var(--accent)]">→</span>
                                                <span>{step}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Onboarding Plan */}
                    {savedAnalysis.ai_analysis.onboarding_2w && (
                        <div>
                            <h3 className="text-xs font-bold text-[var(--accent)] dark:text-[var(--accent)] uppercase tracking-wider mb-3">
                                2-Week Onboarding Plan
                            </h3>
                            <div className="space-y-4">
                                {savedAnalysis.ai_analysis.onboarding_2w.week_1 && (
                                    <div>
                                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                                            Week 1
                                        </p>
                                        <ul className="space-y-2">
                                            {savedAnalysis.ai_analysis.onboarding_2w.week_1.map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                                                    <span className="text-[var(--primary)]  dark:text-[var(--accent)] mt-1">•</span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {savedAnalysis.ai_analysis.onboarding_2w.week_2 && (
                                    <div>
                                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                                            Week 2
                                        </p>
                                        <ul className="space-y-2">
                                            {savedAnalysis.ai_analysis.onboarding_2w.week_2.map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                                                    <span className="text-[var(--primary)] dark:text-[var(--accent)] mt-1">•</span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Download Confirmation Modal */}
            <Modal
                isOpen={isDownloadModalOpen}
                onClose={() => setIsDownloadModalOpen(false)}
                onConfirm={handleDownloadConfirm}
                title="Download Analysis"
                message="Are you sure you want to download this analysis as a PDF?"
                confirmVariant="primary"
                confirmText={
                    isDownloading ? (
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
                            <span>Downloading...</span>
                        </div>
                    ) : (
                        "Download"
                    )
                }
                cancelText="Cancel"
            />

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Confirm Delete"
                message="Are you sure you want to delete this analysis?"
                confirmVariant="danger"
                confirmText={
                    isDeleting ? (
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
                            <span>Deleting...</span>
                        </div>
                    ) : (
                        "Delete"
                    )
                }
                cancelText="Cancel"
            />

        </div>
    );
};

export default AnalysisCard;