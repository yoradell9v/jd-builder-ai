import React, { useMemo, useState } from 'react';
import {
    Activity,
    Briefcase,
    Calendar,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Clock,
    Download,
    FileText,
    HelpCircle,
    ShieldAlert,
    Sparkles,
    Target,
    Trash2,
} from 'lucide-react';
import Modal from './Modal';

export interface AnalysisResult {
    preview: {
        summary?: any;
        service_type?: string;
        service_reasoning?: string;
        service_confidence?: string;
        core_va_title?: string;
        core_va_hours?: number | string;
        primary_outcome?: string;
        key_risks?: string[];
        critical_questions?: string[];
        team_support_areas?: number;
    };
    full_package?: any;
    metadata?: any;
}

export interface SavedAnalysis {
    id: string;
    userId: string;
    title: string;
    intakeData: {
        tasks: [],
        tools: string;
        website: string;
        timezone: string;
        companyName: string;
        weeklyHours: string;
        businessGoal: string;
        clientFacing: string;
        dealBreakers: string;
        englishLevel: string;
        existingSOPs: string;
        outcome90Day: string;
        requirements: [];
        securityNeeds: string;
        managementStyle: string;
        niceToHaveSkills: string;
        reportingExpectations: string;
    };
    analysis: {
        preview: any;
        metadata: any;
        full_package: any;
    }
    isFinalized: boolean;
    finalizedAt?: string | null;
    createdAt: string;
    updatedAt: string;
    refinementCount?: number;
}

interface AnalysisCardProps {
    savedAnalysis: SavedAnalysis;
    onDelete?: (id: string) => void;
}

interface PrimaryRoleSnapshot {
    title: string;
    hours_per_week: number;
    responsibilities: string[];
    skills: string[];
    tools: string[];
    kpis: string[];
    purpose: string;
    core_outcomes: string[];
    client_facing?: boolean;
    communication_norms?: string;
    overlap_requirements?: string;
}

const AnalysisCard = ({ savedAnalysis, onDelete }: AnalysisCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const { analysis } = savedAnalysis;
    console.log('Saved Analysis:', savedAnalysis);
    const preview = analysis?.preview ?? {};
    const fullPackage = analysis?.full_package ?? {};
    const summary =
        preview.summary ??
        fullPackage?.executive_summary?.what_you_told_us ??
        {};
    const serviceStructure = fullPackage?.service_structure ?? {};
    const implementationPlan = fullPackage?.implementation_plan ?? {};
    const riskManagement = fullPackage?.risk_management ?? {};
    const validationReport = fullPackage?.validation_report ?? {};
    const metadata = analysis?.metadata ?? {};

    const questionsForYou =
        fullPackage?.questions_for_you ??
        preview.critical_questions ??
        [];

    const keyRisks =
        preview.key_risks ??
        riskManagement?.risks?.map((r: any) => r.risk) ??
        [];

    const primaryRole = useMemo<PrimaryRoleSnapshot | null>(() => {
        if (!analysis) return null;
        const structureRole = serviceStructure?.core_va_role;
        const detailedJD =
            fullPackage?.detailed_specifications?.core_va_jd;

        if (!structureRole && !detailedJD) return null;

        const responsibilities: string[] = [];
        if (detailedJD?.responsibilities) {
            detailedJD.responsibilities.forEach((section: any) => {
                if (Array.isArray(section?.details)) {
                    section.details.forEach((detail: string) =>
                        responsibilities.push(detail)
                    );
                } else if (typeof section === 'string') {
                    responsibilities.push(section);
                }
            });
        } else if (Array.isArray(structureRole?.recurring_tasks)) {
            responsibilities.push(...structureRole.recurring_tasks);
        }

        return {
            title:
                structureRole?.title ??
                detailedJD?.title ??
                preview?.core_va_title ??
                'Core Role',
            hours_per_week:
                typeof structureRole?.hours_per_week === 'string'
                    ? parseInt(structureRole.hours_per_week, 10) || 0
                    : structureRole?.hours_per_week ??
                    (typeof detailedJD?.hours_per_week === 'string'
                        ? parseInt(detailedJD.hours_per_week, 10) || 0
                        : detailedJD?.hours_per_week ?? 0),
            responsibilities,
            skills: [
                ...(structureRole?.skill_requirements?.required ?? []),
                ...(structureRole?.skill_requirements?.nice_to_have ?? []),
            ],
            tools:
                detailedJD?.tools?.map((t: any) =>
                    typeof t === 'string' ? t : t.tool
                ) ?? [],
            kpis:
                detailedJD?.kpis?.map((k: any) =>
                    typeof k === 'string'
                        ? k
                        : `${k.metric}${k.target ? ` — ${k.target}` : ''}`
                ) ?? [],
            purpose:
                detailedJD?.mission_statement ??
                structureRole?.core_responsibility ??
                preview?.primary_outcome ??
                '',
            core_outcomes:
                detailedJD?.core_outcomes ??
                structureRole?.workflow_ownership ??
                [],
            client_facing:
                structureRole?.interaction_model?.client_facing ??
                undefined,
            communication_norms:
                structureRole?.interaction_model?.sync_needs ??
                detailedJD?.communication_structure?.weekly_sync ??
                undefined,
            overlap_requirements:
                structureRole?.interaction_model?.timezone_criticality ??
                detailedJD?.timezone_requirements?.overlap_needed ??
                undefined,
        };
    }, [analysis, fullPackage, preview, serviceStructure]);

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

    const formatList = (items?: string[], fallback?: string) => {
        if (!items || items.length === 0) {
            return fallback ? (
                <p className="text-sm text-zinc-500">{fallback}</p>
            ) : null;
        }

        return (
            <ul className="space-y-1.5">
                {items.map((item, idx) => (
                    <li
                        key={`${item}-${idx}`}
                        className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                    >
                        <span className="text-[var(--primary)] mt-1 dark:text-[var(--accent)]">
                            •
                        </span>
                        <span className="flex-1">{item}</span>
                    </li>
                ))}
            </ul>
        );
    };

    const handleDeleteConfirm = async () => {
        try {
            setIsDeleting(true);

            const response = await fetch(`/api/jd/analysis/${savedAnalysis.id}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to delete');

            onDelete?.(savedAnalysis.id);
            setIsDeleteModalOpen(false);
        } catch (err) {
            console.error(err);
            alert('Failed to delete analysis. Please try again.');
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
                body: JSON.stringify(savedAnalysis.analysis),
            });

            if (!response.ok) {
                throw new Error('Failed to download PDF');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            const contentDisposition =
                response.headers.get('Content-Disposition');
            const filename = contentDisposition
                ? contentDisposition
                    .split('filename=')[1]
                    ?.replace(/"/g, '') ||
                'job-description-analysis.pdf'
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

    const StatCard = ({
        icon: Icon,
        label,
        value,
    }: {
        icon: React.ElementType;
        label: string;
        value: React.ReactNode;
    }) => (
        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/40 p-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 dark:bg-[var(--accent)]/15 flex items-center justify-center">
                <Icon className="w-5 h-5 text-[var(--primary)] dark:text-[var(--accent)]" />
            </div>
            <div>
                <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    {label}
                </p>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                    {value}
                </p>
            </div>
        </div>
    );

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-6 space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h2 className="text-2xl font-semibold text-[var(--primary)] dark:text-white">
                                {savedAnalysis.title}
                            </h2>
                            {savedAnalysis.isFinalized && (
                                <span className="px-3 py-1 text-xs font-semibold text-white bg-[var(--accent)] rounded-full">
                                    Finalized
                                </span>
                            )}
                            {savedAnalysis.refinementCount ? (
                                <span className="px-3 py-1 text-xs font-semibold text-[var(--primary)] bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-full">
                                    {savedAnalysis.refinementCount} Refinement
                                    {savedAnalysis.refinementCount !== 1 ? 's' : ''}
                                </span>
                            ) : null}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                Created {formatDate(savedAnalysis.createdAt)}
                            </span>
                            {savedAnalysis.finalizedAt && (
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" />
                                    Finalized {formatDate(savedAnalysis.finalizedAt)}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsDownloadModalOpen(true)}
                            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                            title="Download analysis as PDF"
                        >
                            <Download className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
                        </button>
                        <button
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="p-2 rounded-lg border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                            title="Delete analysis"
                        >
                            <Trash2 className="w-5 h-5 text-red-500" />
                        </button>
                    </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    <StatCard
                        icon={Sparkles}
                        label="Service Type"
                        value={preview.service_type ?? metadata?.service_type ?? 'Unspecified'}
                    />
                    <StatCard
                        icon={CheckCircle2}
                        label="Confidence"
                        value={
                            preview.service_confidence ??
                            metadata?.quality_scores?.overall_confidence ??
                            '—'
                        }
                    />
                    <StatCard
                        icon={Target}
                        label="Core Role Hours"
                        value={
                            preview.core_va_hours ??
                            primaryRole?.hours_per_week ??
                            savedAnalysis.intakeData.weeklyHours ??
                            '—'
                        }
                    />

                </div>

                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition flex items-center justify-center gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                >
                    {isExpanded ? 'Hide detailed analysis' : 'View detailed analysis'}
                    {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                    ) : (
                        <ChevronDown className="w-4 h-4" />
                    )}
                </button>

                {isExpanded && (
                    <div className="space-y-6 border-t border-zinc-200 dark:border-zinc-800 pt-6">
                        {savedAnalysis.intakeData.companyName && (
                            <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 p-5 space-y-3">
                                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--primary)] dark:text-[var(--accent)]">
                                    <Briefcase className="w-4 h-4" />
                                    Intake Snapshot
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                                            Company
                                        </p>
                                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                            {savedAnalysis.intakeData.companyName}
                                        </p>
                                        {savedAnalysis.intakeData.website && (
                                            <a
                                                href={savedAnalysis.intakeData.website}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-xs text-[var(--primary)] dark:text-[var(--accent)] underline"
                                            >
                                                {savedAnalysis.intakeData.website}
                                            </a>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                                            Goal
                                        </p>
                                        <p className="text-sm text-zinc-800 dark:text-zinc-200">
                                            {savedAnalysis.intakeData.businessGoal || '—'}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                                            Top Tasks
                                        </p>
                                        {formatList(
                                            savedAnalysis.intakeData.tasks?.slice(0, 3),
                                            'No tasks captured'
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                                            Must-Have Requirements
                                        </p>
                                        {formatList(
                                            savedAnalysis.intakeData.requirements?.filter(Boolean).slice(0, 3),
                                            'No requirements captured'
                                        )}
                                    </div>
                                </div>
                            </section>
                        )}

                        {(summary?.company_stage ||
                            summary?.primary_bottleneck ||
                            summary?.workflow_analysis) && (
                                <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-[var(--primary)] dark:text-[var(--accent)]">
                                        <FileText className="w-4 h-4" />
                                        What You Told Us
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                                                Company Stage
                                            </p>
                                            <p className="text-sm text-zinc-800 dark:text-zinc-200">
                                                {summary?.company_stage ?? '—'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                                                Primary Bottleneck
                                            </p>
                                            <p className="text-sm text-zinc-800 dark:text-zinc-200">
                                                {summary?.primary_bottleneck ?? '—'}
                                            </p>
                                        </div>
                                    </div>
                                    {summary?.workflow_analysis && (
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                                                Workflow Analysis
                                            </p>
                                            <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                                                {summary.workflow_analysis}
                                            </p>
                                        </div>
                                    )}
                                    {summary?.sop_status && (
                                        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 p-4 space-y-2">
                                            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                                                Documentation
                                            </p>
                                            <p className="text-sm text-zinc-700 dark:text-zinc-200">
                                                {summary.sop_status.summary}
                                            </p>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                {summary.sop_status.pain_points?.length > 0 && (
                                                    <div>
                                                        <p className="text-xs font-semibold text-red-500 uppercase tracking-wide">
                                                            Pain Points
                                                        </p>
                                                        {formatList(summary.sop_status.pain_points)}
                                                    </div>
                                                )}
                                                {summary.sop_status.documentation_gaps?.length > 0 && (
                                                    <div>
                                                        <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide">
                                                            Gaps
                                                        </p>
                                                        {formatList(summary.sop_status.documentation_gaps)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </section>
                            )}

                        <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--primary)] dark:text-[var(--accent)]">
                                <Sparkles className="w-4 h-4" />
                                Recommendation Snapshot
                            </div>
                            {preview.primary_outcome && (
                                <div className="rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/30 p-4 flex gap-3">
                                    <Target className="w-5 h-5 text-[var(--accent)] mt-1" />
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-[var(--accent)]">
                                            Primary Outcome
                                        </p>
                                        <p className="text-sm text-zinc-800 dark:text-zinc-100 leading-relaxed">
                                            {preview.primary_outcome}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {preview.service_reasoning && (
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                                        Why this service
                                    </p>
                                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                        {preview.service_reasoning}
                                    </p>
                                </div>
                            )}
                            {keyRisks.length > 0 && (
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                                        Key Risks
                                    </p>
                                    {formatList(keyRisks)}
                                </div>
                            )}
                            {questionsForYou.length > 0 && (
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                                        Open Questions
                                    </p>
                                    {formatList(
                                        questionsForYou.map((q: any) =>
                                            typeof q === 'string' ? q : q.question
                                        )
                                    )}
                                </div>
                            )}
                        </section>

                        {primaryRole && (
                            <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--primary)] dark:text-[var(--accent)]">
                                    <FileText className="w-4 h-4" />
                                    Core Role Overview
                                </div>
                                <div className="flex flex-wrap gap-3 text-xs text-zinc-600 dark:text-zinc-300">
                                    <span className="px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-700">
                                        {primaryRole.title}
                                    </span>
                                    <span className="px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-700">
                                        {primaryRole.hours_per_week || '—'} hrs/week
                                    </span>
                                    {primaryRole.client_facing !== undefined && (
                                        <span className="px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-700">
                                            {primaryRole.client_facing ? 'Client facing' : 'Internal'}
                                        </span>
                                    )}
                                </div>
                                {primaryRole.purpose && (
                                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                        {primaryRole.purpose}
                                    </p>
                                )}
                                {primaryRole.responsibilities.length > 0 && (
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                                            Responsibilities preview
                                        </p>
                                        {formatList(primaryRole.responsibilities.slice(0, 3))}
                                        {primaryRole.responsibilities.length > 3 && !isExpanded && (
                                            <p className="text-xs text-zinc-500 mt-2">
                                                +{primaryRole.responsibilities.length - 3} more in full view
                                            </p>
                                        )}
                                    </div>
                                )}
                                {primaryRole.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {primaryRole.skills.slice(0, 8).map((skill, idx) => (
                                            <span
                                                key={`${skill}-${idx}`}
                                                className="px-3 py-1 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {serviceStructure && (
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--primary)] dark:text-[var(--accent)]">
                                    <Briefcase className="w-4 h-4" />
                                    Service Structure
                                </div>
                                {serviceStructure.coordination_model && (
                                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                        {serviceStructure.coordination_model}
                                    </p>
                                )}
                                {(serviceStructure.pros?.length ||
                                    serviceStructure.cons?.length) && (
                                        <div className="grid gap-3 md:grid-cols-2">
                                            {serviceStructure.pros?.length > 0 && (
                                                <div className="rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-900/10 p-4">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                                                        Pros
                                                    </p>
                                                    {formatList(serviceStructure.pros)}
                                                </div>
                                            )}
                                            {serviceStructure.cons?.length > 0 && (
                                                <div className="rounded-xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-900/10 p-4">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                                                        Cons
                                                    </p>
                                                    {formatList(serviceStructure.cons)}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                {serviceStructure.team_support_areas?.length > 0 && (
                                    <div className="space-y-3">
                                        <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                                            Team Support Areas
                                        </p>
                                        {serviceStructure.team_support_areas.map(
                                            (area: any, idx: number) => (
                                                <div
                                                    key={`${area.skill_category}-${idx}`}
                                                    className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-2"
                                                >
                                                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                                                        {area.skill_category} · {area.estimated_hours_monthly} hrs/mo
                                                    </p>
                                                    {area.use_cases && (
                                                        <div>
                                                            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                                                                Use Cases
                                                            </p>
                                                            {formatList(area.use_cases)}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </section>
                        )}

                        {implementationPlan && (
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--primary)] dark:text-[var(--accent)]">
                                    <Target className="w-4 h-4" />
                                    Implementation Plan
                                </div>
                                {implementationPlan.immediate_next_steps?.length > 0 && (
                                    <div className="space-y-3">
                                        {implementationPlan.immediate_next_steps.map(
                                            (step: any, idx: number) => (
                                                <div
                                                    key={`${step.step}-${idx}`}
                                                    className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4"
                                                >
                                                    <div className="flex items-center justify-between text-sm font-semibold text-zinc-900 dark:text-white">
                                                        <span>{step.step}</span>
                                                        <span className="text-xs text-zinc-500">
                                                            Owner: {step.owner}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-zinc-500 mt-1">
                                                        Timeline: {step.timeline}
                                                    </p>
                                                    <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-2">
                                                        Output: {step.output}
                                                    </p>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                                {/* {implementationPlan.onboarding_roadmap && (
                                    <div className="space-y-3">
                                        <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                                            Onboarding Roadmap
                                        </p>
                                        {Object.entries(implementationPlan.onboarding_roadmap).map(
                                            ([week, roles]: [string, any]) => (
                                                <div
                                                    key={week}
                                                    className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-2"
                                                >
                                                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                                                        {week.replace(/_/g, ' ').toUpperCase()}
                                                    </p>
                                                    {Object.entries(roles).map(
                                                        ([roleName, tasks]: [string, string[]]) => (
                                                            <div key={roleName} className="space-y-1">
                                                                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                                                                    {roleName}
                                                                </p>
                                                                {formatList(tasks)}
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            )
                                        )}
                                    </div>
                                )} */}
                            </section>
                        )}

                        {(riskManagement?.risks?.length ||
                            riskManagement?.assumptions?.length ||
                            riskManagement?.monitoring_plan) && (
                                <section className="space-y-4">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-[var(--primary)] dark:text-[var(--accent)]">
                                        <ShieldAlert className="w-4 h-4" />
                                        Risk & Monitoring
                                    </div>
                                    {riskManagement.risks?.length > 0 && (
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                                                Risks
                                            </p>
                                            {formatList(
                                                riskManagement.risks.map(
                                                    (risk: any) =>
                                                        `${risk.risk} · Impact: ${risk.impact} · Mitigation: ${risk.mitigation}`
                                                )
                                            )}
                                        </div>
                                    )}
                                    {riskManagement.assumptions?.length > 0 && (
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                                                Assumptions
                                            </p>
                                            {formatList(
                                                riskManagement.assumptions.map(
                                                    (assumption: any) =>
                                                        `${assumption.assumption} (Criticality: ${assumption.criticality})`
                                                )
                                            )}
                                        </div>
                                    )}
                                    {riskManagement.monitoring_plan?.quality_checks?.length > 0 && (
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                                                Quality Checks
                                            </p>
                                            {riskManagement.monitoring_plan.quality_checks.map(
                                                (check: any, idx: number) => (
                                                    <div
                                                        key={`${check.checkpoint}-${idx}`}
                                                        className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-1"
                                                    >
                                                        <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                                                            {check.checkpoint}
                                                        </p>
                                                        {formatList(check.assess)}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}
                                </section>
                            )}

                        {validationReport?.consistency_checks && (
                            <section className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--primary)] dark:text-[var(--accent)]">
                                    <HelpCircle className="w-4 h-4" />
                                    Validation Snapshot
                                </div>
                                {validationReport.consistency_checks.hours_balance?.issues?.length >
                                    0 && (
                                        <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-900/10 p-4 space-y-1">
                                            <p className="text-xs uppercase tracking-wide text-amber-700 dark:text-amber-300">
                                                Hours Balance
                                            </p>
                                            {formatList(
                                                validationReport.consistency_checks.hours_balance.issues
                                            )}
                                        </div>
                                    )}
                                {validationReport.consistency_checks.tool_alignment?.recommendations?.length >
                                    0 && (
                                        <div className="rounded-xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/70 dark:bg-sky-900/10 p-4 space-y-1">
                                            <p className="text-xs uppercase tracking-wide text-sky-700 dark:text-sky-300">
                                                Tool Alignment
                                            </p>
                                            {formatList(
                                                validationReport.consistency_checks.tool_alignment.recommendations
                                            )}
                                        </div>
                                    )}
                            </section>
                        )}
                    </div>
                )}
            </div>

            <Modal
                isOpen={isDownloadModalOpen}
                onClose={() => setIsDownloadModalOpen(false)}
                onConfirm={handleDownloadConfirm}
                title="Download Analysis"
                message="Download this full analysis as a PDF?"
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
                        'Download'
                    )
                }
                cancelText="Cancel"
            />

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
                title="Delete Analysis"
                message="This action cannot be undone. Delete this analysis?"
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
                        'Delete'
                    )
                }
                cancelText="Cancel"
            />
        </div>
    );
};

export default AnalysisCard;