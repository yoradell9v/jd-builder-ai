import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, MessageCircle, AlertTriangle } from 'lucide-react';

interface RefinementFormProps {
    analysisId: string;
    userId: string;
    onRefinementComplete: (refinedPackage: any) => void;
}

const RefinementForm: React.FC<RefinementFormProps> = ({
    analysisId,
    userId,
    onRefinementComplete,
}) => {
    const [feedback, setFeedback] = useState('');
    const [refinementAreas, setRefinementAreas] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<'idle' | 'clarification' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [clarificationQuestions, setClarificationQuestions] = useState<any[]>([]);
    const [changesSummary, setChangesSummary] = useState<any[]>([]);

    const availableAreas = [
        { value: 'service_type', label: 'Service Type' },
        { value: 'role_title', label: 'Role Title' },
        { value: 'responsibilities', label: 'Responsibilities' },
        { value: 'kpis', label: 'KPIs' },
        { value: 'hours', label: 'Weekly Hours' },
        { value: 'tools', label: 'Tools Required' },
        { value: 'timeline', label: 'Timeline & Onboarding' },
        { value: 'team_support', label: 'Team Support Areas' },
        { value: 'outcomes', label: '90-Day Outcomes' },
    ];


    const toggleArea = (area: string) => {
        setRefinementAreas((prev) =>
            prev.includes(area)
                ? prev.filter((a) => a !== area)
                : [...prev, area]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!feedback.trim()) {
            setStatus('error');
            setMessage('Please provide feedback about what you\'d like to change.');
            return;
        }

        if (refinementAreas.length === 0) {
            setStatus('error');
            setMessage('Please select at least one area to refine.');
            return;
        }

        setIsSubmitting(true);
        setStatus('idle');
        setMessage('');

        try {
            const response = await fetch('/api/jd/refine', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    analysisId,
                    userId,
                    feedback,
                    refinement_areas: refinementAreas,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle validation errors
                if (data.feedback_type === 'spam' || data.feedback_type === 'irrelevant') {
                    setStatus('error');
                    setMessage(data.message || 'Invalid feedback provided');
                } else {
                    throw new Error(data.error || 'Refinement failed');
                }
                return;
            }

            // Handle clarification request
            if (data.status === 'clarification_needed') {
                setStatus('clarification');
                setMessage(data.message);
                setClarificationQuestions(data.questions || []);
                return;
            }

            // Success!
            setStatus('success');
            setMessage(`Analysis refined successfully! (Iteration ${data.iteration})`);
            setChangesSummary(data.changes_made || []);
            onRefinementComplete(data.refined_package);

            // Reset form after 2 seconds
            setTimeout(() => {
                setFeedback('');
                setRefinementAreas([]);
                setStatus('idle');
                setChangesSummary([]);
            }, 3000);
        } catch (error) {
            console.error('Refinement error:', error);
            setStatus('error');
            setMessage(error instanceof Error ? error.message : 'Failed to refine analysis');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 sm:p-6">
            <div>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                    What would you like to change?
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Be specific for best results. Select the areas you want to refine and provide detailed feedback.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Feedback Input */}
                <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        What would you like to change? *
                    </label>
                    <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Example: The weekly hours seem too low for the responsibilities listed. I think we need at least 35 hours per week, and the KPIs should include social media engagement metrics."
                        className="w-full h-32 px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none"
                        disabled={isSubmitting}
                    />
                    <p className="mt-1 text-xs text-zinc-500">
                        💡 Tip: Be specific! Instead of "change the role", say "The role title should emphasize content strategy, not just social media management."
                    </p>
                </div>

                {/* Refinement Areas */}
                <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                        Which sections should we update? *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {availableAreas.map((area) => (
                            <button
                                key={area.value}
                                type="button"
                                onClick={() => toggleArea(area.value)}
                                disabled={isSubmitting}
                                className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${refinementAreas.includes(area.value)
                                    ? 'bg-[var(--primary)] dark:bg-[var(--accent)] text-white border-[var(--primary)] dark:border-[var(--accent)]'
                                    : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {area.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Status Messages */}
                {status === 'clarification' && (
                    <div className="rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20 p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-3">
                                    {message}
                                </p>
                                <ul className="space-y-2">
                                    {clarificationQuestions.map((q: any, idx: number) => (
                                        <li key={idx} className="text-sm text-amber-800 dark:text-amber-300">
                                            <span className="font-medium">• {q.question}</span>
                                            {q.why && (
                                                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 ml-4">
                                                    {q.why}
                                                </p>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-red-900 dark:text-red-200">{message}</p>
                        </div>
                    </div>
                )}

                {status === 'success' && (
                    <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/20 p-4">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200 mb-3">
                                    {message}
                                </p>
                                {changesSummary.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                                            Changes made:
                                        </p>
                                        <ul className="space-y-1">
                                            {changesSummary.map((change: any, idx: number) => (
                                                <li key={idx} className="text-xs text-emerald-700 dark:text-emerald-400">
                                                    • <span className="font-medium">{change.section}:</span>{' '}
                                                    {change.change_description}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting || !feedback.trim() || refinementAreas.length === 0}
                    className="w-full px-6 py-3 bg-[var(--primary)] dark:bg-[var(--accent)] hover:brightness-110 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Refining Analysis...</span>
                        </>
                    ) : (
                        <>
                            <MessageCircle className="w-5 h-5" />
                            <span>Refine Analysis</span>
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default RefinementForm;