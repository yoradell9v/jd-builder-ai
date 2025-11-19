"use client";

import { useState, useMemo, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/ui/Navbar";
import IntakeForm from "@/components/forms/IntakeForm";
import Loader from "@/components/ui/Loader";
import Modal from "@/components/ui/Modal";
import { useUser, User } from "@/context/UserContext";
import { Briefcase, Sparkles, Clock, CheckCircle2, Flame, ShieldAlert, Flag, Activity, AlertTriangle, TrendingUp, Target, AlertCircle, Network, FileText, Lightbulb } from "lucide-react";
import { getConfidenceValue } from '@/utils/confidence';
import { getConfidenceColor } from "@/utils/confidence";
import RefinementForm from "@/components/analysis/RefinementForm";

interface AnalysisResult {
    preview: {
        summary: {
            company_stage: string;
            outcome_90d: string;
            primary_bottleneck: string;
            role_recommendation: string;
            sop_status: {
                has_sops: boolean;
                pain_points: string[];
                documentation_gaps: string[];
                summary: string;
            };
            workflow_analysis: string;
        };
        primary_outcome: string;
        service_type: string;
        service_confidence: string;
        service_reasoning: string;
        confidence: string;
        key_risks: string[];
        critical_questions: string[];
        core_va_title: string;
        core_va_hours: string;
        team_support_areas: number;
    };
    full_package: {
        service_structure: {
            service_type: string;
            core_va_role: {
                title: string;
                craft_family?: string;
                hours_per_week: string | number;
                core_responsibility: string;
                recurring_tasks: string[];
                skill_requirements: {
                    required: string[];
                    nice_to_have: string[];
                }
                workflow_ownership: string[];
                interaction_model?: {
                    reports_to?: string;
                    collaborates_with?: string[];
                    client_facing?: boolean;
                    sync_needs?: string;
                    timezone_criticality?: string;
                };
            }
            team_support_areas: any,
            coordination_model: string;
            pros: [];
            cons: [];
            scaling_path: []
            alternative_structure: any
            alternative_consideration: any
        }
        executive_summary: {
            what_you_told_us: {
                company_stage: string;
                outcome_90d: string;
                primary_bottleneck: string;
                role_recommendation: string;
                sop_status: {
                    has_sops: boolean;
                    pain_points: string[];
                    documentation_gaps: string[];
                    summary: string;
                };
                workflow_analysis: string;
            };
            service_recommendation: {
                type: string;
                confidence: string;
                reasoning: string;
                why_not_other: string;
            }
            key_insights: string[];
        };
        detailed_specifications: {
            core_va_jd: {
                title: string;
                hours_per_week: string;
                mission_statement: string;
                primary_outcome: string;
                core_outcomes: string[];
                responsibilities: any[];
                skills_required: {
                    technical: string[];
                    soft: string[];
                    domain: string[];
                }
                tools: any[];
                kpis: any[];
                personality_fit: any[]
                sample_week: any;
                communication_structure: any;
                timezone_requirements?: any;
                success_indicators: any
            }
            team_support_specs: any;
        };
        role_architecture: {
            recommended_structure: {
                scenario_name: string;
                service_type: string;
                total_cost_estimate: string;
                roles: Array<{
                    title: string;
                    craft_family: string;
                    hours_per_week: number;
                    percentage_of_outcome: string;
                    core_responsibility: string;
                    task_allocation: {
                        from_intake: string[];
                        from_discovery: string[];
                        estimated_breakdown: string;
                    };
                    skill_fit: {
                        required_skills: string[];
                        nice_to_have: string[];
                        red_flags: string[];
                    };
                    workflow_ownership: string[];
                    interaction_model: {
                        reports_to: string;
                        collaborates_with: string[];
                        client_facing: boolean;
                        sync_needs: string;
                        timezone_criticality: string;
                    };
                }>;
                pros: string[];
                cons: string[];
                best_for: string;
                scaling_path: string;
            };
            alternative_scenarios: any[];
            comparison_table: Array<{
                option: string;
                service: string;
                roles: string;
                total_hours: number;
                cost_range: string;
                best_for: string;
                key_tradeoff: string;
            }>;
        };
        implementation_plan: {
            immediate_next_steps: Array<{
                step: string;
                owner: string;
                timeline: string;
                output: string;
            }>;
            onboarding_roadmap: {
                week_1: string[];
                week_2: string[];
                week_3_4: string[];
            };
            success_milestones: {
                week_2: string;
                week_4: string;
                week_8: string;
                week_12: string;
            };
        };
        risk_management: {
            risks: Array<{
                risk: string;
                category: string;
                severity: string;
                likelihood: string;
                impact: string;
                mitigation: string;
                early_warning_signs: string[];
            }>;
            assumptions: Array<{
                assumption: string;
                criticality: string;
                validation_method: string;
                if_wrong: string;
            }>;
            red_flags: Array<{
                flag: string;
                evidence: string;
                recommendation: string;
            }>;
            monitoring_plan: {
                high_priority_risks: Array<{
                    risk: string;
                    check_in: string;
                    watch_for: string[];
                }>;
                quality_checks: Array<{
                    checkpoint: string;
                    assess: string[];
                }>;
                adjustment_triggers: Array<{
                    trigger: string;
                    action: string;
                }>;
            };
        };
        questions_for_you: Array<{
            question: string;
            why_it_matters: string;
            assumption_if_unanswered: string;
        }>;
        validation_report: {
            consistency_checks: {
                hours_balance: {
                    stated_hours: number;
                    allocated_hours: number;
                    sample_week_hours: number;
                    issues: any[];
                };
                tool_alignment: {
                    tools_in_intake: string[];
                    tools_in_jd: string[];
                    missing_from_jd: string[];
                    not_in_intake: string[];
                    recommendations: string[];
                };
                outcome_mapping: {
                    client_goal: string;
                    role_outcomes: string[];
                    coverage: string;
                    gaps: any[];
                };
                kpi_feasibility: Array<{
                    kpi: string;
                    measurable: boolean;
                    instrumentation_exists: boolean;
                    issue: string;
                    recommendation: string;
                }>;
            };
            quality_scores: {
                jd_specificity: number;
                role_clarity: number;
                outcome_alignment: number;
                personality_depth: number;
                kpi_quality: number;
                overall_confidence: string;
                areas_to_strengthen: string[];
            };
            areas_needing_clarification: string[];
        };
        appendix: {
            discovery_insights: {
                business_context: {
                    company_stage: string;
                    primary_bottleneck: string;
                    hidden_complexity: string;
                    growth_indicators: string;
                };
                task_analysis: {
                    task_clusters: Array<{
                        cluster_name: string;
                        tasks: string[];
                        workflow_type: string;
                        interdependencies: string[];
                        complexity_score: number;
                        estimated_hours_weekly: number;
                    }>;
                    skill_requirements: {
                        technical: string[];
                        soft: string[];
                        domain: string[];
                    };
                    implicit_needs: string[];
                };
                sop_insights: {
                    process_complexity: string;
                    documented_workflows: any[];
                    documentation_gaps: string[];
                    handoff_points: string[];
                    pain_points: string[];
                    tools_mentioned: any[];
                    implicit_requirements: string[];
                };
                context_gaps: Array<{
                    question: string;
                    why_it_matters: string;
                    assumption_if_unanswered: string;
                }>;
                measurement_capability: {
                    current_tracking: string[];
                    tools_available: string[];
                    tracking_gaps: string[];
                    recommendations: string[];
                };
            };
            alternative_architectures: any[];
            measurement_recommendations: {
                current_tracking: string[];
                tools_available: string[];
                tracking_gaps: string[];
                recommendations: string[];
            };
        };
    };
    metadata?: {
        stages_completed: string[];
        sop_processed: boolean;
        discovery_insights_count: number;
        scenarios_evaluated: number;
        risks_identified: number;
        quality_scores: {
            jd_specificity: number;
            role_clarity: number;
            outcome_alignment: number;
            personality_depth: number;
            kpi_quality: number;
            overall_confidence: string;
            areas_to_strengthen: string[];
        };
    };
}

interface IntakeFormData {
    companyName: string;
    website: string;
    businessGoal: string;
    tasks: string[];
    outcome90Day: string;
    weeklyHours: string;
    timezone: string;
    dailyOverlap: string;
    clientFacing: string;
    tools: string;
    englishLevel: string;
    budgetBand: string;
    requirements: string[];
    existingSOPs: string;
    examplesURL: string;
    reportingExpectations: string;
    managementStyle: string;
    securityNeeds: string;
    dealBreakers: string;
    roleSplit: string;
    niceToHaveSkills: string;
}

export default function DashboardClient({ user }: { user: User }) {
    //Analysis States
    const [showForm, setShowForm] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [intakeData, setIntakeData] = useState<IntakeFormData | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

    //Modal states
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [showRefineAnalysisModal, setShowRefineAnalysisModal] = useState(false);
    const [showSaveResultModal, setShowSaveResultModal] = useState(false);

    //Save Analysis States
    const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null);
    const [savedAnalysisId, setSavedAnalysisId] = useState<string | null>(null);

    //New Analysis State
    const [formKey, setFormKey] = useState(0);

    //Download States
    const [isDownloading, setIsDownloading] = useState(false);

    //Tab States
    const [activeTab, setActiveTab] = useState<'overview' | 'roles' | 'implementation' | 'risks'>('overview');
    const [actionsMenuOpen, setActionsMenuOpen] = useState(false);

    //Download States
    const [isDownloading, setIsDownloading] = useState(false);

    //Greeting based on time of day
    const getCurrentGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return `Good morning, ${user.firstname}`;
        if (hour < 18) return `Good afternoon, ${user.firstname}`;
        return `Good evening, ${user.firstname}`;
    };

    // Helper: Extract primary role from full_package
    const getPrimaryRole = (result: AnalysisResult | null) => {
        if (!result?.full_package) return null;

        const pkg = result.full_package;
        const serviceType = result.preview?.service_type;

        // For Dedicated VA or Unicorn VA Service, get core VA role
        if (serviceType === "Dedicated VA" || serviceType === "Unicorn VA Service") {
            const coreRole = pkg.service_structure?.core_va_role;
            const detailedJd = pkg.detailed_specifications?.core_va_jd;

            if (coreRole) {
                // Extract responsibilities from detailed JD
                const responsibilities: string[] = [];
                if (detailedJd?.responsibilities) {
                    detailedJd.responsibilities.forEach((cat: any) => {
                        if (cat?.details && Array.isArray(cat.details)) {
                            cat.details.forEach((d: string) => responsibilities.push(String(d)));
                        } else if (typeof cat === "string") {
                            responsibilities.push(cat);
                        }
                    });
                }

                return {
                    title: coreRole.title || detailedJd?.title || "",
                    family: coreRole.craft_family || "",
                    service: serviceType,
                    hours_per_week: typeof coreRole.hours_per_week === "string"
                        ? parseInt(coreRole.hours_per_week) || 0
                        : coreRole.hours_per_week || 0,
                    client_facing: coreRole.interaction_model?.client_facing || false,
                    purpose: detailedJd?.mission_statement || coreRole.core_responsibility || "",
                    core_outcomes: detailedJd?.core_outcomes || [],
                    responsibilities: responsibilities.length > 0 ? responsibilities : (coreRole.recurring_tasks || []),
                    skills: [
                        ...(coreRole.skill_requirements?.required || []),
                        ...(coreRole.skill_requirements?.nice_to_have || [])
                    ],
                    tools: detailedJd?.tools?.map((t: any) =>
                        typeof t === "string" ? t : t.tool || ""
                    ) || [],
                    kpis: detailedJd?.kpis?.map((k: any) =>
                        typeof k === "string" ? k : `${k.metric || ""}${k.target ? ` — ${k.target}` : ""}`
                    ) || [],
                    personality: detailedJd?.personality_fit?.map((p: any) =>
                        typeof p === "string" ? p : p.trait || ""
                    ) || [],
                    reporting_to: coreRole.interaction_model?.reports_to || detailedJd?.communication_structure?.reporting_to || "",
                    sample_week: detailedJd?.sample_week || {},
                    overlap_requirements: coreRole.interaction_model?.timezone_criticality || detailedJd?.timezone_requirements?.overlap_needed || "",
                    communication_norms: coreRole.interaction_model?.sync_needs || (detailedJd?.communication_structure ? JSON.stringify(detailedJd.communication_structure) : "") || "",
                    percentage_of_outcome: 100,
                };
            }
        }

        return null;
    };

    //Handle Analysis Submission
    const handleFormSuccess = ({ apiResult, input }: { apiResult: any; input: IntakeFormData }) => {
        setIsProcessing(true);
        try {
            const result: AnalysisResult = {
                preview: apiResult.preview ?? {
                    summary: {
                        company_stage: "",
                        outcome_90d: "",
                        primary_bottleneck: "",
                        role_recommendation: "",
                        sop_status: {
                            has_sops: false,
                            pain_points: [],
                            documentation_gaps: [],
                            summary: "",
                        },
                        workflow_analysis: "",
                    },
                    primary_outcome: "",
                    service_type: "",
                    service_confidence: "",
                    service_reasoning: "",
                    confidence: "",
                    key_risks: [],
                    critical_questions: [],
                },
                full_package: apiResult.full_package,
                metadata: apiResult.metadata,
            };
            console.log("Processed API Result:", result);
            setAnalysisResult(result);
            setIntakeData(input);
            setSavedAnalysisId(null);
        } catch (e) {
            console.error("Failed to process API result:", e);
            setAnalysisResult({
                preview: apiResult.preview ?? {
                    summary: {
                        company_stage: "",
                        outcome_90d: "",
                        primary_bottleneck: "",
                        role_recommendation: "",
                        sop_status: {
                            has_sops: false,
                            pain_points: [],
                            documentation_gaps: [],
                            summary: "",
                        },
                        workflow_analysis: "",
                    },
                    primary_outcome: "",
                    service_type: "",
                    service_confidence: "",
                    service_reasoning: "",
                    confidence: "",
                    key_risks: [],
                    critical_questions: [],
                },
                full_package: apiResult.full_package,
                metadata: apiResult.metadata,
            } as AnalysisResult);
            setIntakeData(input);
        } finally {
            setTimeout(() => {
                setIsProcessing(false);
            }, 1200);
        }
    };

    //Handle New Analysis - clears existing analysis if present
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
        setSavedAnalysisId(null);
        try {
            localStorage.removeItem(`jd-form-data-${user.id}`);
        } catch (error) {
            console.error('Failed to clear form data from localStorage:', error);
        }
        setFormKey(prev => prev + 1);
        setShowForm(true);
    };

    //Handle Refinement - opens the refinement modal
    const handleRefineAnalysis = async () => {
        if (analysisResult) {
            // Auto-save if not already saved
            if (!savedAnalysisId) {
                const id = await handleSave(true); // true = automatic save
                if (id) {
                    setSavedAnalysisId(id);
                }
            }
            setShowRefineAnalysisModal(true);
        } else {
            setShowForm(true);
        }
    }

    //Handle refinement completion
    const handleRefineComplete = (updatedAnalysis: AnalysisResult) => {
        setAnalysisResult(updatedAnalysis);
        setShowRefineAnalysisModal(false);
    }

    //Handle refinement completion from RefinementForm
    const handleRefinementComplete = (refinedPackage: any) => {
        // Transform refinedPackage to AnalysisResult format
        const updatedAnalysis: AnalysisResult = {
            preview: refinedPackage.preview || analysisResult?.preview,
            full_package: refinedPackage.full_package || refinedPackage,
            metadata: refinedPackage.metadata || analysisResult?.metadata,
        };
        handleRefineComplete(updatedAnalysis);
    }

    //Opens the download modal
    const openDownload = () => {
        setShowDownloadModal(true)
    };

    // Download Analysis as PDF
    const handleDownload = async () => {
        if (!analysisResult) return;
        setIsDownloading(true);
        console.log("Starting download of analysis as PDF:", analysisResult);
        try {
            const primaryRole = analysisResult?.ai_analysis?.roles?.[0];
            
            const response = await fetch('/api/jd/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    preview: {
                        summary: analysisResult.ai_analysis.what_you_told_us || analysisResult.preview.summary,
                        primary_outcome: intakeData.outcome90Day,
                        recommended_role: primaryRole?.title || '',
                        role_purpose: primaryRole?.purpose || '',
                        service_mapping: primaryRole?.service || '',
                        weekly_hours: primaryRole?.hours_per_week || 0,
                        client_facing: primaryRole?.client_facing ?? false,
                        core_outcomes: primaryRole?.core_outcomes || [],
                        kpis: primaryRole?.kpis || [],
                        key_tools: primaryRole?.tools?.slice(0, 5) || [],
                        risks: analysisResult.ai_analysis.risks || [],
                    },
                    ai_analysis: analysisResult.ai_analysis,
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
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download job description. Please try again.');
        } finally {
            setIsDownloading(false);
            setShowDownloadModal(false);
        }
    };

    //Get the primary role from analysis
    const primaryRole = getPrimaryRole(analysisResult);
    console.log(primaryRole);
    const implementationPlan = analysisResult?.full_package?.implementation_plan;
    const riskManagement = analysisResult?.full_package?.risk_management;
    const monitoringPlan = riskManagement?.monitoring_plan;
    const summary = analysisResult?.preview?.summary || analysisResult?.full_package?.executive_summary?.what_you_told_us;

    const handleSave = useCallback(async (isAutomaticSave = false): Promise<string | null> => {
        if (!analysisResult || !intakeData) {
            setSaveResult({
                success: false,
                message: 'Nothing to save yet. Please generate an analysis first.',
            });
            setShowSaveResultModal(true);
            return null;
        }

        try {
            const roleTitle = primaryRole?.title || analysisResult.preview?.core_va_title || 'Job Analysis';
            console.log("Role: ", roleTitle);
            const title =
                `${roleTitle}` +
                (intakeData.companyName ? ` - ${intakeData.companyName}` : '');
            console.log("Is Automatic Save:", isAutomaticSave);
            const response = await fetch('/api/jd/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    title,
                    intakeData,
                    analysis: analysisResult,
                    isFinalized: !isAutomaticSave,
                    finalizedAt: !isAutomaticSave ? new Date().toISOString() : null,
                }),
            });

            const payload = await response.json().catch(() => null);

            if (!response.ok || !payload?.success) {
                throw new Error(payload?.error || 'Failed to save analysis');
            }

            const savedId = payload?.savedAnalysis?.id;
            if (savedId) {
                setSavedAnalysisId(String(savedId));
            }

            setSaveResult({
                success: true,
                message: isAutomaticSave
                    ? 'Automatically saved the analysis before refining it.'
                    : 'Analysis saved successfully.',
            });
            setShowSaveResultModal(true);
            return savedId ? String(savedId) : null;
        } catch (error: any) {
            console.error('Save error:', error);
            setSaveResult({
                success: false,
                message:
                    error?.message || 'Failed to save analysis. Please try again.',
            });
            setShowSaveResultModal(true);
            return null;
        }
    }, [analysisResult, intakeData, user.id]);


    // Helper function to format and display results cleanly
    function formatResultValue(value: any, depth: number = 0): React.ReactNode {
        if (value === null || value === undefined) {
            return <span className="text-sm text-zinc-400 italic">Not specified</span>;
        }

        if (Array.isArray(value)) {
            if (value.length === 0) return <span className="text-sm text-zinc-400 italic">No items</span>;
            return (
                <ul className="space-y-1.5">
                    {value.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                            <span className="text-zinc-400 mt-1 flex-shrink-0 text-xs">•</span>
                            <span className="text-sm text-zinc-700 dark:text-zinc-300 flex-1">
                                {typeof item === 'string' ? item : formatResultValue(item, depth + 1)}
                            </span>
                        </li>
                    ))}
                </ul>
            );
        }

        if (typeof value === 'object') {
            const entries = Object.entries(value);
            if (entries.length === 0) return <span className="text-sm text-zinc-400 italic">Empty</span>;
            return (
                <div className="space-y-3">
                    {entries.map(([k, v], idx) => (
                        <div key={idx} className={depth > 0 ? "pl-3 border-l border-zinc-200 dark:border-zinc-700" : ""}>
                            <p className="text-xs font-medium text-[var(--primary)] uppercase tracking-wide mb-1.5">
                                {k.replace(/_/g, ' ')}
                            </p>
                            <div className="text-sm text-zinc-700 dark:text-zinc-300">
                                {formatResultValue(v, depth + 1)}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (typeof value === 'boolean') return <span className="text-sm text-zinc-700 dark:text-zinc-300">{value ? 'Yes' : 'No'}</span>;
        if (typeof value === 'number') return <span className="text-sm text-zinc-700 dark:text-zinc-300">{value}</span>;
        return <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{String(value)}</p>;
    }

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 relative">
            <Navbar />

            {/* Main Content */}
            <div className="mx-auto max-w-7xl px-4 pt-12 md:pt-16 pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Dashboard */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-4xl md:text-6xl font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                                {getCurrentGreeting()}
                            </h1>
                            <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400">
                                Let's find your perfect virtual assistant
                            </p>
                        </div>

                        <button
                            onClick={() => setShowForm(true)}
                            className="w-full group relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 text-left transition-all hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center ring-1 ring-[var(--accent)]/30">
                                    <svg className="w-6 h-6 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-base font-medium text-[var(--primary)] dark:text-zinc-100 mb-1">
                                        Start New Analysis
                                    </h2>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                        Answer a few questions to get your personalized recommendations
                                    </p>
                                </div>
                                <svg className="w-5 h-5 text-zinc-400 group-hover:text-[var(--accent)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </button>

                        <AnimatePresence>
                            {analysisResult && !isProcessing && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-gradient-to-br from-white to-zinc-50/50 dark:from-zinc-900 dark:to-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm"
                                >
                                    {/* Header with optional collapse/edit actions */}
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-[var(--primary)] dark:text-white flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                                                <Sparkles className="w-4 h-4 text-[var(--primary)]" />
                                            </div>
                                            What You Told Us
                                        </h3>
                                        <button
                                            onClick={() => setShowForm(true)}
                                            className="text-xs text-zinc-500 hover:text-[var(--primary)] dark:text-zinc-400 dark:hover:text-[var(--accent)] transition-colors flex items-center gap-1"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Edit
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {/* Company Stage with subtle background */}
                                        <div className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors">
                                            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                                                <TrendingUp className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Company Stage</span>
                                                <p className="text-sm text-zinc-800 dark:text-zinc-200 mt-0.5 font-medium">{summary?.company_stage}</p>
                                            </div>
                                        </div>

                                        {/* 90-Day Outcome */}
                                        <div className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors">
                                            <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                                                <Target className="w-4.5 h-4.5 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">90-Day Outcome</span>
                                                <p className="text-sm text-zinc-800 dark:text-zinc-200 mt-0.5 font-medium leading-relaxed">{summary?.outcome_90d}</p>
                                            </div>
                                        </div>

                                        {/* Primary Bottleneck - Enhanced emphasis */}
                                        <div className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors">
                                            <div className="relative flex items-start gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0 ring-2 ring-amber-200 dark:ring-amber-800">
                                                    <AlertCircle className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs uppercase tracking-wide">Primary Bottleneck</span>
                                                        <span className="px-2 py-0.5 text-xs font-medium bg-amber-200 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 rounded-full">
                                                            High Priority
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-medium leading-relaxed">
                                                        {summary?.primary_bottleneck}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Workflow Analysis with label */}
                                        <div className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors">
                                            <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                                                <Network className="w-4.5 h-4.5 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1 block">Workflow Analysis</span>
                                                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{summary?.workflow_analysis}</p>
                                            </div>
                                        </div>

                                        {/* SOP Status with label */}
                                        <div className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors">
                                            <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center flex-shrink-0">
                                                <FileText className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1 block">
                                                    Documentation Status
                                                </span>

                                                {/* Summary text */}
                                                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-3">
                                                    {typeof summary?.sop_status === 'string'
                                                        ? summary.sop_status
                                                        : summary?.sop_status?.summary}
                                                </p>

                                                {/* Show details if SOPs exist */}
                                                {summary?.sop_status?.has_sops && (
                                                    <div className="space-y-3 mt-2">
                                                        {/* Pain Points */}
                                                        {summary.sop_status.pain_points?.length > 0 && (
                                                            <div>
                                                                <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1.5 flex items-center gap-1">
                                                                    <AlertCircle className="w-3 h-3" />
                                                                    Process Pain Points
                                                                </p>
                                                                <ul className="space-y-1">
                                                                    {summary.sop_status.pain_points.map((point: string, idx: number) => (
                                                                        <li key={idx} className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-1.5 pl-2">
                                                                            <span className="text-red-400 mt-0.5">•</span>
                                                                            <span>{point}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}

                                                        {/* Documentation Gaps */}
                                                        {summary.sop_status.documentation_gaps?.length > 0 && (
                                                            <div>
                                                                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1.5 flex items-center gap-1">
                                                                    <FileText className="w-3 h-3" />
                                                                    Documentation Gaps
                                                                </p>
                                                                <ul className="space-y-1">
                                                                    {summary.sop_status.documentation_gaps.map((gap: string, idx: number) => (
                                                                        <li key={idx} className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-1.5 pl-2">
                                                                            <span className="text-amber-400 mt-0.5">•</span>
                                                                            <span>{gap}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Optional: Quick stats footer */}
                                    <div className="mt-5 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                                        <span>Analysis generated {new Date().toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                            Verified
                                        </span>
                                    </div>
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
                                    className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8"
                                >
                                    <div className="text-center mb-6">
                                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                                            Processing your analysis
                                        </h3>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                            This may take a moment...
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
                                    className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
                                >
                                    {/* Header with Actions Menu */}
                                    <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                                                    Analysis Results
                                                </h3>
                                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                    {primaryRole?.title || 'Your recommendations'}
                                                </p>
                                            </div>

                                            {/* Actions Dropdown */}
                                            <div className="relative">
                                                <button
                                                    onClick={() => setActionsMenuOpen(!actionsMenuOpen)}
                                                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                                    </svg>
                                                </button>

                                                {actionsMenuOpen && (
                                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg z-10">
                                                        <button
                                                            onClick={() => { handleRefineAnalysis(); setActionsMenuOpen(false); }}
                                                            className="w-full px-4 py-2.5 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-3"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5h2m-1-1v2m-4.293 9.293l6.586-6.586a2 2 0 112.828 2.828l-6.586 6.586H7v-2.828z" />
                                                            </svg>
                                                            Refine Analysis
                                                        </button>
                                                        <button
                                                            onClick={() => { handleNewAnalysis(); setActionsMenuOpen(false); }}
                                                            className="w-full px-4 py-2.5 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-3"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                            </svg>
                                                            New Analysis
                                                        </button>
                                                        <button
                                                            onClick={() => { openDownload(); setActionsMenuOpen(false); }}
                                                            className="w-full px-4 py-2.5 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-3"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                            </svg>
                                                            Download PDF
                                                        </button>
                                                        <button
                                                            onClick={() => { handleSave(); setActionsMenuOpen(false); }}
                                                            className="w-full px-4 py-2.5 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-3 border-t border-zinc-200 dark:border-zinc-800"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                                            </svg>
                                                            Save
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tabs Navigation */}
                                    <div className="flex border-b border-zinc-200 dark:border-zinc-800 px-6">
                                        <button
                                            onClick={() => setActiveTab('overview')}
                                            className={`px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === 'overview'
                                                ? 'text-[var(--primary)] dark:text-[var(--accent)]'
                                                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-300'
                                                }`}
                                        >
                                            Overview
                                            {activeTab === 'overview' && (
                                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)] dark:bg-[var(--accent)]" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('roles')}
                                            className={`px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === 'roles'
                                                ? 'text-[var(--primary)] dark:text-[var(--accent)]'
                                                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-300'
                                                }`}
                                        >
                                            Detailed JD
                                            {activeTab === 'roles' && (
                                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)] dark:bg-[var(--accent)]" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('implementation')}
                                            className={`px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === 'implementation'
                                                ? 'text-[var(--primary)] dark:text-[var(--accent)]'
                                                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-300'
                                                }`}
                                        >
                                            Implementation
                                            {activeTab === 'implementation' && (
                                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)] dark:bg-[var(--accent)]" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('risks')}
                                            className={`px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === 'risks'
                                                ? 'text-[var(--primary)] dark:text-[var(--accent)]'
                                                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-300'
                                                }`}
                                        >
                                            Risks
                                            {activeTab === 'risks' && (
                                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)] dark:bg-[var(--accent)]" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Tab Content */}
                                    <div className="p-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
                                        <AnimatePresence mode="wait">
                                            {activeTab === 'overview' && (
                                                <motion.div
                                                    key="overview"
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    className="space-y-6"
                                                >
                                                    {/* Recommended Service Type */}
                                                    {analysisResult.preview.service_type && (
                                                        <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-5 bg-white dark:bg-zinc-900">
                                                            {/* Header */}
                                                            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
                                                                Recommended Service Type
                                                            </p>

                                                            {/* Service Type with Icon */}
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <Sparkles className="w-5 h-5 text-[var(--accent)]" />
                                                                <p className="text-xl font-bold text-[var(--primary)] dark:text-[var(--accent)]">
                                                                    {analysisResult.preview.service_type}
                                                                </p>
                                                            </div>

                                                            {/* Description */}
                                                            {analysisResult.preview.service_reasoning && (
                                                                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
                                                                    {analysisResult.preview.service_reasoning}
                                                                </p>
                                                            )}

                                                            {/* Confidence with Progress Bar */}
                                                            {analysisResult.preview.service_confidence && (
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase">
                                                                            Confidence
                                                                        </span>
                                                                        <span className="text-sm font-semibold text-[var(--primary)] dark:text-[var(--accent)]">
                                                                            {analysisResult.preview.service_confidence}
                                                                        </span>
                                                                    </div>
                                                                    <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                                                        <div
                                                                            className={`h-full ${getConfidenceColor(analysisResult.preview.service_confidence)} transition-all duration-500 rounded-full`}
                                                                            style={{ width: `${getConfidenceValue(analysisResult.preview.service_confidence)}%` }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Core VA Role */}
                                                    {analysisResult.preview.core_va_title && (
                                                        <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-5 bg-white dark:bg-zinc-900">
                                                            {/* Header */}
                                                            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
                                                                Core Role
                                                            </p>

                                                            {/* Job Title with Icon */}
                                                            <div className="flex items-center gap-2 mb-4">
                                                                <Briefcase className="w-5 h-5 text-[var(--accent)]" />
                                                                <p className="text-xl font-bold text-[var(--primary)] dark:text-[var(--accent)]">
                                                                    {analysisResult.preview.core_va_title}
                                                                </p>
                                                            </div>

                                                            {/* Details */}
                                                            <div className="space-y-3">
                                                                {analysisResult.preview.core_va_hours && (
                                                                    <div>
                                                                        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
                                                                            Hours per Week:
                                                                        </span>
                                                                        <span className="text-sm text-zinc-700 dark:text-zinc-300 ml-2">
                                                                            {analysisResult.preview.core_va_hours}
                                                                        </span>
                                                                    </div>
                                                                )}

                                                                {analysisResult.preview.team_support_areas && (
                                                                    <div>
                                                                        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
                                                                            Team Support Areas:
                                                                        </span>
                                                                        <span className="text-sm text-zinc-700 dark:text-zinc-300 ml-2">
                                                                            {analysisResult.preview.team_support_areas}
                                                                        </span>
                                                                    </div>
                                                                )}

                                                                {analysisResult.preview.primary_outcome && (
                                                                    <div>
                                                                        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase mb-1">
                                                                            Primary Outcome
                                                                        </p>
                                                                        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                                                            {analysisResult.preview.primary_outcome}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}


                                                </motion.div>
                                            )}

                                            {activeTab === 'roles' && (
                                                <motion.div
                                                    key="roles"
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    className="space-y-4"
                                                >
                                                    {analysisResult.full_package?.service_structure && (
                                                        <div className="space-y-4">

                                                            {/* Core VA Role */}
                                                            {analysisResult.full_package.service_structure.core_va_role && (
                                                                <details className="group border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden transition-all duration-300">
                                                                    <summary className="cursor-pointer px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors list-none [&::-webkit-details-marker]:hidden">
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="flex-1">
                                                                                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
                                                                                    Core VA Role
                                                                                </p>
                                                                                <div className="flex items-center gap-2 mb-2">
                                                                                    <Briefcase className="w-5 h-5 text-[var(--accent)]" />
                                                                                    <h4 className="text-lg font-bold text-[var(--primary)] dark:text-[var(--accent)]">
                                                                                        {analysisResult.full_package.service_structure.core_va_role.title}
                                                                                    </h4>
                                                                                </div>
                                                                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                                                    {analysisResult.full_package.service_structure.core_va_role.hours_per_week} hrs/week
                                                                                </p>
                                                                            </div>
                                                                            <svg
                                                                                className="w-5 h-5 text-zinc-400 transition-transform group-open:rotate-180"
                                                                                fill="none"
                                                                                stroke="currentColor"
                                                                                viewBox="0 0 24 24"
                                                                            >
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                            </svg>
                                                                        </div>
                                                                    </summary>

                                                                    <div className="p-4 space-y-4 bg-white dark:bg-zinc-900">
                                                                        {/* Core Responsibility */}
                                                                        {analysisResult.full_package.service_structure.core_va_role.core_responsibility && (
                                                                            <div>
                                                                                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase mb-2">
                                                                                    Core Responsibility
                                                                                </p>
                                                                                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                                                                    {analysisResult.full_package.service_structure.core_va_role.core_responsibility}
                                                                                </p>
                                                                            </div>
                                                                        )}

                                                                        {/* Recurring Tasks */}
                                                                        {analysisResult.full_package.service_structure.core_va_role.recurring_tasks?.length > 0 && (
                                                                            <div>
                                                                                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase mb-2">
                                                                                    Recurring Tasks
                                                                                </p>
                                                                                <ul className="list-disc pl-5 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
                                                                                    {analysisResult.full_package.service_structure.core_va_role.recurring_tasks.map((task, i) => (
                                                                                        <li key={i}>{task}</li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        )}

                                                                        {/* Skill Requirements */}
                                                                        {analysisResult.full_package.service_structure.core_va_role.skill_requirements && (
                                                                            <div>
                                                                                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase mb-2">
                                                                                    Skill Requirements
                                                                                </p>
                                                                                <div className="space-y-3">
                                                                                    {analysisResult.full_package.service_structure.core_va_role.skill_requirements.required?.length > 0 && (
                                                                                        <div>
                                                                                            <p className="text-sm font-medium text-[var(--primary)] dark:text-[var(--accent)] mb-1">
                                                                                                Required
                                                                                            </p>
                                                                                            <div className="flex flex-wrap gap-2">
                                                                                                {analysisResult.full_package.service_structure.core_va_role.skill_requirements.required.map((skill, i) => (
                                                                                                    <span key={i} className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-md">
                                                                                                        {skill}
                                                                                                    </span>
                                                                                                ))}
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                    {analysisResult.full_package.service_structure.core_va_role.skill_requirements.nice_to_have?.length > 0 && (
                                                                                        <div>
                                                                                            <p className="text-sm font-medium text-[var(--primary)] dark:text-[var(--accent)] mb-1">
                                                                                                Nice to Have
                                                                                            </p>
                                                                                            <div className="flex flex-wrap gap-2">
                                                                                                {analysisResult.full_package.service_structure.core_va_role.skill_requirements.nice_to_have.map((skill, i) => (
                                                                                                    <span key={i} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-md">
                                                                                                        {skill}
                                                                                                    </span>
                                                                                                ))}
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {/* Workflow Ownership */}
                                                                        {analysisResult.full_package.service_structure.core_va_role.workflow_ownership?.length > 0 && (
                                                                            <div>
                                                                                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase mb-2">
                                                                                    Workflow Ownership
                                                                                </p>
                                                                                <ul className="list-disc pl-5 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
                                                                                    {analysisResult.full_package.service_structure.core_va_role.workflow_ownership.map((workflow, i) => (
                                                                                        <li key={i}>{workflow}</li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </details>
                                                            )}

                                                            {/* Team Support Areas */}
                                                            {analysisResult.full_package.service_structure.team_support_areas?.length > 0 && (
                                                                <div className="space-y-3">
                                                                    <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                                                                        Team Support Areas
                                                                    </p>
                                                                    {analysisResult.full_package.service_structure.team_support_areas.map((area: any, idx: any) => (
                                                                        <details key={idx} className="group border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden transition-all duration-300">
                                                                            <summary className="cursor-pointer px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors list-none [&::-webkit-details-marker]:hidden">
                                                                                <div className="flex items-center justify-between">
                                                                                    <div>
                                                                                        <h5 className="text-base font-semibold text-[var(--primary)] dark:text-[var(--accent)]">
                                                                                            {area.skill_category}
                                                                                        </h5>
                                                                                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                                                                                            ~{area.estimated_hours_monthly} hrs/month
                                                                                        </p>
                                                                                    </div>
                                                                                    <svg
                                                                                        className="w-5 h-5 text-zinc-400 transition-transform group-open:rotate-180"
                                                                                        fill="none"
                                                                                        stroke="currentColor"
                                                                                        viewBox="0 0 24 24"
                                                                                    >
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                                    </svg>
                                                                                </div>
                                                                            </summary>

                                                                            <div className="p-4 space-y-3 bg-white dark:bg-zinc-900">
                                                                                {/* Use Cases */}
                                                                                {area.use_cases?.length > 0 && (
                                                                                    <div>
                                                                                        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase mb-1">
                                                                                            Use Cases
                                                                                        </p>
                                                                                        <ul className="list-disc pl-5 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
                                                                                            {area.use_cases.map((uc: any, i: any) => (
                                                                                                <li key={i}>{uc}</li>
                                                                                            ))}
                                                                                        </ul>
                                                                                    </div>
                                                                                )}

                                                                                {/* Deliverables */}
                                                                                {area.deliverables?.length > 0 && (
                                                                                    <div>
                                                                                        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase mb-1">
                                                                                            Deliverables
                                                                                        </p>
                                                                                        <div className="flex flex-wrap gap-2">
                                                                                            {area.deliverables.map((del: any, i: any) => (
                                                                                                <span key={i} className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs rounded-md">
                                                                                                    {del}
                                                                                                </span>
                                                                                            ))}
                                                                                        </div>
                                                                                    </div>
                                                                                )}

                                                                                {/* Why Team Not VA */}
                                                                                {area.why_team_not_va && (
                                                                                    <div>
                                                                                        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase mb-1">
                                                                                            Why Team Support?
                                                                                        </p>
                                                                                        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                                                                            {area.why_team_not_va}
                                                                                        </p>
                                                                                    </div>
                                                                                )}

                                                                                {/* Example Requests */}
                                                                                {area.example_requests?.length > 0 && (
                                                                                    <div>
                                                                                        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase mb-1">
                                                                                            Example Requests
                                                                                        </p>
                                                                                        <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400 italic">
                                                                                            {area.example_requests.map((req: any, i: any) => (
                                                                                                <li key={i}>• {req}</li>
                                                                                            ))}
                                                                                        </ul>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </details>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {/* Coordination Model */}
                                                            {analysisResult.full_package.service_structure.coordination_model && (
                                                                <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 bg-white dark:bg-zinc-900">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <Network className="w-4 h-4 text-[var(--primary)]" />
                                                                        <p className="text-xs font-semibold text-[var(--primary)] uppercase">
                                                                            Coordination Model
                                                                        </p>
                                                                    </div>
                                                                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                                                        {analysisResult.full_package.service_structure.coordination_model}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {/* Pros & Cons */}
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                {analysisResult.full_package.service_structure.pros?.length > 0 && (
                                                                    <div className="border border-[var(--accent)]/30 rounded-lg p-4 bg-[var(--accent)]/10">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <CheckCircle2 className="w-4 h-4 text-[var(--accent)]" />
                                                                            <p className="text-xs font-semibold text-[var(--accent)] uppercase">
                                                                                Pros
                                                                            </p>
                                                                        </div>
                                                                        <ul className="space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
                                                                            {analysisResult.full_package.service_structure.pros.map((pro, i) => (
                                                                                <li key={i}>✓ {pro}</li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                                {analysisResult.full_package.service_structure.cons?.length > 0 && (
                                                                    <div className="border border-[var(--primary)]/30 rounded-lg p-4 bg-[var(--primary)]/10">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <AlertCircle className="w-4 h-4 text-[var(--primary)]" />
                                                                            <p className="text-xs font-semibold text-[var(--primary)] uppercase">
                                                                                Cons
                                                                            </p>
                                                                        </div>
                                                                        <ul className="space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
                                                                            {analysisResult.full_package.service_structure.cons.map((con, i) => (
                                                                                <li key={i}>• {con}</li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Scaling Path */}
                                                            {analysisResult.full_package.service_structure.scaling_path && (
                                                                <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 bg-white dark:bg-zinc-900">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <TrendingUp className="w-4 h-4 text-[var(--accent)]" />
                                                                        <p className="text-xs font-semibold text-[var(--accent)] uppercase">
                                                                            Scaling Path
                                                                        </p>
                                                                    </div>
                                                                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                                                        {analysisResult.full_package.service_structure.scaling_path}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {/* Alternative Consideration */}
                                                            {analysisResult.full_package.service_structure.alternative_consideration && (
                                                                <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 bg-white dark:bg-zinc-900">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <Lightbulb className="w-4 h-4 text-[var(--primary)]" />
                                                                        <p className="text-xs font-semibold text-[var(--primary)] uppercase">
                                                                            Alternative Consideration
                                                                        </p>
                                                                    </div>
                                                                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                                                        {analysisResult.full_package.service_structure.alternative_consideration}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}

                                            {activeTab === 'implementation' && (
                                                <motion.div
                                                    key="implementation"
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    className="space-y-6"
                                                >
                                                    {analysisResult.full_package?.implementation_plan && (
                                                        <div className="space-y-6">
                                                            {implementationPlan?.immediate_next_steps && implementationPlan.immediate_next_steps.length > 0 && (
                                                                <div className="space-y-3">
                                                                    {implementationPlan.immediate_next_steps.map((item, index) => (
                                                                        <div key={index} className="pb-3 border-b border-zinc-200 dark:border-zinc-800 last:border-0 last:pb-0">
                                                                            <div className="flex items-start gap-3">
                                                                                <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mt-0.5 min-w-[20px]">
                                                                                    {index + 1}.
                                                                                </span>
                                                                                <div className="flex-1 space-y-1.5">
                                                                                    <h5 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                                                                        {item.step}
                                                                                    </h5>
                                                                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                                                                                        <span><span className="font-medium">Owner:</span> {item.owner}</span>
                                                                                        <span><span className="font-medium">Timeline:</span> {item.timeline}</span>
                                                                                    </div>
                                                                                    {item.output && (
                                                                                        <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                                                                            {item.output}
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {analysisResult.full_package?.implementation_plan?.onboarding_roadmap && (
                                                                <div className="space-y-3">
                                                                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Onboarding Roadmap</h4>
                                                                    {Object.entries(analysisResult.full_package.implementation_plan.onboarding_roadmap)
                                                                        .map(([weekKey, jobGroups]) => (
                                                                            <details
                                                                                key={weekKey}
                                                                                className="group"
                                                                            >
                                                                                <summary className="cursor-pointer text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 py-2 flex items-center justify-between">
                                                                                    <span>{weekKey.replace(/_/g, " ")}</span>
                                                                                    <svg
                                                                                        className="w-4 h-4 text-zinc-400 transition-transform group-open:rotate-180"
                                                                                        fill="none"
                                                                                        stroke="currentColor"
                                                                                        viewBox="0 0 24 24"
                                                                                    >
                                                                                        <path
                                                                                            strokeLinecap="round"
                                                                                            strokeLinejoin="round"
                                                                                            strokeWidth={2}
                                                                                            d="M19 9l-7 7-7-7"
                                                                                        />
                                                                                    </svg>
                                                                                </summary>
                                                                                <div className="pl-4 mt-2 space-y-3 border-l border-zinc-200 dark:border-zinc-800">
                                                                                    {Object.entries(
                                                                                        typeof jobGroups === "object" && !Array.isArray(jobGroups)
                                                                                            ? (jobGroups as Record<string, string[] | undefined>)
                                                                                            : {}
                                                                                    ).map(([title, tasks]) => {
                                                                                        const taskList = Array.isArray(tasks) ? tasks : [];
                                                                                        return (
                                                                                            <div key={title} className="space-y-1.5">
                                                                                                <h6 className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                                                                                    {title}
                                                                                                </h6>
                                                                                                <ul className="space-y-1 pl-3">
                                                                                                    {taskList.map((task: string, idx: number) => (
                                                                                                        <li key={idx} className="text-xs text-zinc-600 dark:text-zinc-400">
                                                                                                            • {task}
                                                                                                        </li>
                                                                                                    ))}
                                                                                                </ul>
                                                                                            </div>
                                                                                        );
                                                                                    })}
                                                                                </div>
                                                                            </details>
                                                                        ))
                                                                    }
                                                                </div>
                                                            )}


                                                        </div>
                                                    )}

                                                </motion.div>
                                            )}

                                            {activeTab === 'risks' && (
                                                <motion.div
                                                    key="risks"
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    className="space-y-6"
                                                >
                                                    {riskManagement && (
                                                        <div>
                                                            <h4 className="text-base font-semibold text-[var(--primary)] dark:text-[var(--accent)] mb-4">
                                                                Risk Management
                                                            </h4>

                                                            {riskManagement && (
                                                                <div className="space-y-4">

                                                                    {/* ASSUMPTIONS */}
                                                                    {riskManagement.assumptions?.length > 0 && (
                                                                        <details className="group border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden transition-all duration-300">
                                                                            <summary className="cursor-pointer px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-between list-none [&::-webkit-details-marker]:hidden hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="w-7 h-7 rounded-full flex items-center justify-center bg-[color:var(--accent)/15%]">
                                                                                        <AlertTriangle className="w-4 h-4 text-[var(--accent)]" />
                                                                                    </div>

                                                                                    <h4 className="text-base font-semibold text-[var(--primary)] dark:text-[var(--accent)]">
                                                                                        Assumptions
                                                                                    </h4>
                                                                                </div>

                                                                                <svg
                                                                                    className="w-4 h-4 text-zinc-400 transition-transform group-open:rotate-180"
                                                                                    fill="none"
                                                                                    stroke="currentColor"
                                                                                    viewBox="0 0 24 24"
                                                                                >
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                                </svg>
                                                                            </summary>

                                                                            <div className="p-4 bg-white dark:bg-zinc-900 space-y-4">
                                                                                {riskManagement.assumptions.map((a, i) => (
                                                                                    <div key={i} className="border-l pl-3 border-zinc-300 dark:border-zinc-700">
                                                                                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                                                                            {a.assumption}
                                                                                        </p>

                                                                                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                                                            <span className="font-medium">Criticality:</span> {a.criticality}
                                                                                        </p>

                                                                                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                                                            <span className="font-medium">If wrong:</span> {a.if_wrong}
                                                                                        </p>

                                                                                        {a.validation_method && (
                                                                                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                                                                <span className="font-medium">Validation:</span> {a.validation_method}
                                                                                            </p>
                                                                                        )}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </details>
                                                                    )}

                                                                    {/* HIGH PRIORITY RISKS */}
                                                                    {monitoringPlan?.high_priority_risks && monitoringPlan.high_priority_risks.length > 0 && (
                                                                        <details className="group border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden transition-all duration-300">
                                                                            <summary className="cursor-pointer px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-between list-none [&::-webkit-details-marker]:hidden hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="w-7 h-7 rounded-full flex items-center justify-center bg-[color:var(--accent)/15%]">
                                                                                        <Flame className="w-4 h-4 text-[var(--accent)]" />
                                                                                    </div>

                                                                                    <h4 className="text-base font-semibold text-[var(--primary)] dark:text-[var(--accent)]">
                                                                                        High Priority Risks
                                                                                    </h4>
                                                                                </div>

                                                                                <svg className="w-4 h-4 text-zinc-400 transition-transform group-open:rotate-180"
                                                                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                                </svg>
                                                                            </summary>

                                                                            <div className="p-4 bg-white dark:bg-zinc-900 space-y-4">
                                                                                {monitoringPlan?.high_priority_risks?.map((risk, i) => (
                                                                                    <div key={i} className="border-l pl-3 border-zinc-300 dark:border-zinc-700">
                                                                                        <p className="text-sm font-semibold">{risk.risk}</p>

                                                                                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                                                            <span className="font-medium">Check-in:</span> {risk.check_in}
                                                                                        </p>

                                                                                        {risk.watch_for?.length > 0 && (
                                                                                            <ul className="list-disc ml-4 text-sm text-zinc-600 dark:text-zinc-400">
                                                                                                {risk.watch_for.map((wf, idx) => (
                                                                                                    <li key={idx}>{wf}</li>
                                                                                                ))}
                                                                                            </ul>
                                                                                        )}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </details>
                                                                    )}

                                                                    {/* GENERAL RISKS */}
                                                                    {riskManagement.risks?.length > 0 && (
                                                                        <details className="group border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden transition-all duration-300">
                                                                            <summary className="cursor-pointer px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-between list-none [&::-webkit-details-marker]:hidden hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="w-7 h-7 rounded-full flex items-center justify-center bg-[color:var(--accent)/15%]">
                                                                                        <ShieldAlert className="w-4 h-4 text-[var(--accent)]" />
                                                                                    </div>

                                                                                    <h4 className="text-base font-semibold text-[var(--primary)] dark:text-[var(--accent)]">
                                                                                        Risks
                                                                                    </h4>
                                                                                </div>

                                                                                <svg className="w-4 h-4 text-zinc-400 transition-transform group-open:rotate-180"
                                                                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                                </svg>
                                                                            </summary>

                                                                            <div className="p-4 bg-white dark:bg-zinc-900 space-y-4">
                                                                                {riskManagement.risks.map((r, i) => (
                                                                                    <div key={i} className="border-l pl-3 border-zinc-300 dark:border-zinc-700">
                                                                                        <p className="text-sm font-semibold">{r.risk}</p>

                                                                                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                                                            <span className="font-medium">Category:</span> {r.category}
                                                                                        </p>
                                                                                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                                                            <span className="font-medium">Severity:</span> {r.severity}
                                                                                        </p>
                                                                                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                                                            <span className="font-medium">Likelihood:</span> {r.likelihood}
                                                                                        </p>
                                                                                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                                                            <span className="font-medium">Impact:</span> {r.impact}
                                                                                        </p>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </details>
                                                                    )}

                                                                    {/* RED FLAGS */}
                                                                    {riskManagement.red_flags?.length > 0 && (
                                                                        <details className="group border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden transition-all duration-300">
                                                                            <summary className="cursor-pointer px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-between list-none [&::-webkit-details-marker]:hidden hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="w-7 h-7 rounded-full flex items-center justify-center bg-[color:var(--accent)/15%]">
                                                                                        <Flag className="w-4 h-4 text-[var(--accent)]" />
                                                                                    </div>

                                                                                    <h4 className="text-base font-semibold text-[var(--primary)] dark:text-[var(--accent)]">
                                                                                        Red Flags
                                                                                    </h4>
                                                                                </div>

                                                                                <svg className="w-4 h-4 text-zinc-400 transition-transform group-open:rotate-180"
                                                                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                                </svg>
                                                                            </summary>

                                                                            <div className="p-4 bg-white dark:bg-zinc-900 space-y-4">
                                                                                {riskManagement.red_flags.map((rf, i) => (
                                                                                    <div key={i} className="border-l pl-3 border-zinc-300 dark:border-zinc-700">
                                                                                        <p className="text-sm font-semibold">{rf.flag}</p>
                                                                                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                                                            <span className="font-medium">Evidence:</span> {rf.evidence}
                                                                                        </p>
                                                                                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                                                            <span className="font-medium">Recommendation:</span> {rf.recommendation}
                                                                                        </p>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </details>
                                                                    )}

                                                                    {/* MONITORING PLAN */}
                                                                    {((monitoringPlan?.adjustment_triggers && monitoringPlan.adjustment_triggers.length > 0) || (monitoringPlan?.quality_checks && monitoringPlan.quality_checks.length > 0)) && (
                                                                        <details className="group border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden transition-all duration-300">
                                                                            <summary className="cursor-pointer px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-between list-none [&::-webkit-details-marker]:hidden hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="w-7 h-7 rounded-full flex items-center justify-center bg-[color:var(--accent)/15%]">
                                                                                        <Activity className="w-4 h-4 text-[var(--accent)]" />
                                                                                    </div>

                                                                                    <h4 className="text-base font-semibold text-[var(--primary)] dark:text-[var(--accent)]">
                                                                                        Monitoring & Quality Checks
                                                                                    </h4>
                                                                                </div>

                                                                                <svg className="w-4 h-4 text-zinc-400 transition-transform group-open:rotate-180"
                                                                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                                </svg>
                                                                            </summary>

                                                                            <div className="p-4 bg-white dark:bg-zinc-900 space-y-4">

                                                                                {/* Adjustment Triggers */}
                                                                                {monitoringPlan?.adjustment_triggers && monitoringPlan.adjustment_triggers.length > 0 && (
                                                                                    <div className="border-l pl-3 border-zinc-300 dark:border-zinc-700">
                                                                                        <h5 className="font-semibold text-sm mb-2">Adjustment Triggers</h5>
                                                                                        {monitoringPlan.adjustment_triggers.map((t, i) => (
                                                                                            <p key={i} className="text-sm text-zinc-600 dark:text-zinc-400">
                                                                                                <span className="font-medium">{t.trigger}:</span> {t.action}
                                                                                            </p>
                                                                                        ))}
                                                                                    </div>
                                                                                )}

                                                                                {/* Quality Checks */}
                                                                                {monitoringPlan?.quality_checks && monitoringPlan.quality_checks.length > 0 && (
                                                                                    <div className="border-l pl-3 border-zinc-300 dark:border-zinc-700">
                                                                                        <h5 className="font-semibold text-sm mb-2">Quality Checks</h5>
                                                                                        {monitoringPlan.quality_checks.map((qc, i) => (
                                                                                            <div key={i} className="mb-3">
                                                                                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                                                                                    {qc.checkpoint}
                                                                                                </p>
                                                                                                {qc.assess?.length > 0 && (
                                                                                                    <ul className="list-disc ml-4 text-sm text-zinc-600 dark:text-zinc-400">
                                                                                                        {qc.assess.map((item, idx) => (
                                                                                                            <li key={idx}>{item}</li>
                                                                                                        ))}
                                                                                                    </ul>
                                                                                                )}
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                )}

                                                                            </div>
                                                                        </details>
                                                                    )}

                                                                </div>
                                                            )}

                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 text-center"
                                >
                                    <svg className="w-16 h-16 mx-auto text-zinc-300 dark:text-zinc-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">No analysis yet</h3>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Start by filling out the form</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

            </div>
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
                            className="relative z-10 w-full max-w-4xl px-4"
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

            {/* Refine Analysis Component */}
            <Modal
                isOpen={showRefineAnalysisModal}
                onClose={() => setShowRefineAnalysisModal(false)}
                title="Refine Analysis"
                message=""
                maxWidth="7xl"
                body={
                    savedAnalysisId && analysisResult ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 -mx-4 -mt-4">
                            {/* Left Side - Analysis Preview */}
                            <div className="lg:border-r border-zinc-200 dark:border-zinc-800 pr-6">
                                <div className="sticky top-0 max-h-[calc(100vh-12rem)] overflow-y-auto">
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                                            Current Analysis Preview
                                        </h3>

                                        {/* Service Type */}
                                        {analysisResult.preview?.service_type && (
                                            <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                                                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase mb-1">
                                                    Service Type
                                                </p>
                                                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                                                    {analysisResult.preview.service_type}
                                                </p>
                                                {analysisResult.preview?.service_confidence && (
                                                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                                                        Confidence: {analysisResult.preview.service_confidence}
                                                    </p>
                                                )}
                                                {analysisResult.preview?.service_reasoning && (
                                                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                                                        {analysisResult.preview.service_reasoning}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Primary Outcome */}
                                        {analysisResult.preview?.primary_outcome && (
                                            <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                                                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase mb-1">
                                                    Primary Outcome
                                                </p>
                                                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                                    {analysisResult.preview.primary_outcome}
                                                </p>
                                            </div>
                                        )}

                                        {/* Summary - Company Stage */}
                                        {summary?.company_stage && (
                                            <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                                                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase mb-1">
                                                    Company Stage
                                                </p>
                                                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                                                    {summary.company_stage}
                                                </p>
                                            </div>
                                        )}

                                        {/* Summary - 90-Day Outcome */}
                                        {summary?.outcome_90d && (
                                            <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                                                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase mb-1">
                                                    90-Day Outcome
                                                </p>
                                                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                                    {summary.outcome_90d}
                                                </p>
                                            </div>
                                        )}

                                        {/* Summary - Primary Bottleneck */}
                                        {summary?.primary_bottleneck && (
                                            <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                                                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase mb-1">
                                                    Primary Bottleneck
                                                </p>
                                                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                                    {summary.primary_bottleneck}
                                                </p>
                                            </div>
                                        )}

                                        {/* Summary - Workflow Analysis */}
                                        {summary?.workflow_analysis && (
                                            <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                                                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase mb-1">
                                                    Workflow Analysis
                                                </p>
                                                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                                    {summary.workflow_analysis}
                                                </p>
                                            </div>
                                        )}

                                        {/* Role Title */}
                                        {primaryRole?.title && (
                                            <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                                                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase mb-1">
                                                    Role Title
                                                </p>
                                                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                                                    {primaryRole.title}
                                                </p>
                                                {primaryRole.hours_per_week && (
                                                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                                                        {primaryRole.hours_per_week} hrs/week
                                                    </p>
                                                )}
                                                {primaryRole.family && (
                                                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                                                        {primaryRole.family}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Core Outcomes */}
                                        {primaryRole?.core_outcomes && primaryRole.core_outcomes.length > 0 && (
                                            <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                                                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase mb-2">
                                                    90-Day Outcomes
                                                </p>
                                                <ul className="space-y-1">
                                                    {primaryRole.core_outcomes.map((outcome: string, idx: number) => (
                                                        <li key={idx} className="text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2">
                                                            <span className="text-[var(--primary)] dark:text-[var(--accent)] mt-0.5">•</span>
                                                            <span className="flex-1">{outcome}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Responsibilities */}
                                        {primaryRole?.responsibilities && primaryRole.responsibilities.length > 0 && (
                                            <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                                                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase mb-2">
                                                    Key Responsibilities
                                                </p>
                                                <ul className="space-y-1">
                                                    {primaryRole.responsibilities.map((resp: string, idx: number) => (
                                                        <li key={idx} className="text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2">
                                                            <span className="text-[var(--primary)] dark:text-[var(--accent)] mt-0.5">•</span>
                                                            <span className="flex-1 line-clamp-2">{resp}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Skills */}
                                        {primaryRole?.skills && primaryRole.skills.length > 0 && (
                                            <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                                                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase mb-2">
                                                    Skills Required
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {primaryRole.skills.map((skill: string, idx: number) => (
                                                        <span key={idx} className="px-2 py-0.5 bg-[var(--primary)]/10 dark:bg-[var(--accent)]/20 text-[var(--primary)] dark:text-[var(--accent)] text-xs rounded border border-[var(--primary)]/20 dark:border-[var(--accent)]/30">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Tools */}
                                        {primaryRole?.tools && primaryRole.tools.length > 0 && (
                                            <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                                                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase mb-2">
                                                    Tools Required
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {primaryRole.tools.map((tool: string, idx: number) => (
                                                        <span key={idx} className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded">
                                                            {tool}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* KPIs */}
                                        {primaryRole?.kpis && primaryRole.kpis.length > 0 && (
                                            <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                                                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase mb-2">
                                                    Key Performance Indicators
                                                </p>
                                                <ul className="space-y-1">
                                                    {primaryRole.kpis.map((kpi: string, idx: number) => (
                                                        <li key={idx} className="text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2">
                                                            <span className="text-green-500 mt-0.5">•</span>
                                                            <span className="flex-1">{kpi}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Key Risks */}
                                        {analysisResult.preview?.key_risks && analysisResult.preview.key_risks.length > 0 && (
                                            <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                                                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase mb-2">
                                                    Key Risks
                                                </p>
                                                <ul className="space-y-1">
                                                    {analysisResult.preview.key_risks.map((risk: string, idx: number) => (
                                                        <li key={idx} className="text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2">
                                                            <span className="text-red-500 mt-0.5">•</span>
                                                            <span className="flex-1">{risk}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Critical Questions */}
                                        {analysisResult.preview?.critical_questions && analysisResult.preview.critical_questions.length > 0 && (
                                            <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                                                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase mb-2">
                                                    Critical Questions
                                                </p>
                                                <ul className="space-y-1">
                                                    {analysisResult.preview.critical_questions.map((question: string, idx: number) => (
                                                        <li key={idx} className="text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2">
                                                            <span className="text-amber-500 mt-0.5">•</span>
                                                            <span className="flex-1">{question}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Confidence */}
                                        {analysisResult.preview?.confidence && (
                                            <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                                                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase mb-1">
                                                    Overall Confidence
                                                </p>
                                                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                                                    {analysisResult.preview.confidence}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Side - Refinement Form */}
                            <div className="pl-0 lg:pl-2">
                                <RefinementForm
                                    analysisId={savedAnalysisId}
                                    userId={user.id}
                                    onRefinementComplete={handleRefinementComplete}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 text-center">
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                                Please save your analysis first before refining it.
                            </p>
                            <button
                                onClick={async () => {
                                    const id = await handleSave(false);
                                    if (id) {
                                        setSavedAnalysisId(id);
                                    }
                                }}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
                            >
                                Save Analysis
                            </button>
                        </div>
                    )
                }
                cancelText="Close"
                onConfirm={() => { }}
                confirmText=""
            />

            {/* Download Modal */}
            <Modal
                isOpen={showDownloadModal}
                onClose={() => setShowDownloadModal(false)}
                onConfirm={handleDownload}
                title="Download Analysis"
                message="Are you sure you want to download the analysis report?"
                cancelText="Cancel"
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
            />


            {/* Save Result Modal */}
            <Modal
                isOpen={showSaveResultModal}
                onClose={() => setShowSaveResultModal(false)}
                onConfirm={() => setShowSaveResultModal(false)}
                title={saveResult?.success ? "Saved Successfully" : "Save Failed"}
                message={saveResult?.message || ""}
                confirmText="OK"
                cancelText="Close"
                confirmVariant={saveResult?.success ? "primary" : "danger"}
            />
        </div>

    );
}
