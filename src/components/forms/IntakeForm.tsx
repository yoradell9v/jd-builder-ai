"use client";

import { Fragment, useState, useEffect } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

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

interface IntakeFormProps {
    userId: string;
    onFormChange?: (data: IntakeFormData) => void;
    onClose: () => void;
    onSuccess?: (data: any) => void;
}

const STORAGE_KEY = 'jd-form-data';

export default function IntakeForm({ userId, onFormChange, onClose, onSuccess }: IntakeFormProps) {
    const [formData, setFormData] = useState<IntakeFormData>({
        companyName: "",
        website: "",
        businessGoal: "More leads",
        tasks: ["", "", "", ""],
        outcome90Day: "",
        weeklyHours: "40",
        timezone: "",
        dailyOverlap: "",
        clientFacing: "Yes",
        tools: "",
        englishLevel: "Good",
        budgetBand: "Standard",
        requirements: ["", "", ""],
        existingSOPs: "No",
        examplesURL: "",
        reportingExpectations: "",
        managementStyle: "Async",
        securityNeeds: "",
        dealBreakers: "",
        roleSplit: "No",
        niceToHaveSkills: "",
    });

    const [isClient, setIsClient] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [analysisSuccess, setAnalysisSuccess] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        { id: 0, title: "Company Info", required: ["companyName"] },
        { id: 1, title: "Business Goals", required: ["businessGoal", "outcome90Day"] },
        { id: 2, title: "Key Tasks", required: ["tasks"] },
        { id: 3, title: "Work Details", required: ["weeklyHours", "dailyOverlap", "timezone", "clientFacing"] },
        { id: 4, title: "Requirements", required: ["requirements"] },
        { id: 5, title: "Tools & Skills", required: [] },
        { id: 6, title: "Additional Details - Process", required: [] },
        { id: 7, title: "Additional Details - Constraints", required: [] },
    ];

    const validateStep = (step: number): boolean => {
        const stepConfig = steps[step];
        if (!stepConfig) return true;

        for (const field of stepConfig.required) {
            if (field === "tasks") {
                const requiredTasks = formData.tasks.slice(0, 3);
                if (requiredTasks.some(task => !task.trim())) {
                    return false;
                }
            } else if (field === "requirements") {
                if (formData.requirements.some(req => !req.trim())) {
                    return false;
                }
            } else {
                const value = formData[field as keyof IntakeFormData];
                if (!value || (typeof value === "string" && !value.trim())) {
                    return false;
                }
            }
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep(currentStep) && currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    useEffect(() => {
        setIsClient(true);
        try {
            const saved = localStorage.getItem(`${STORAGE_KEY}-${userId}`);
            if (saved) {
                const parsed = JSON.parse(saved);
                setFormData(parsed);
                onFormChange?.(parsed);
            }
        } catch (error) {
            console.error('Failed to load saved form data:', error);
        }
    }, [userId]);

    useEffect(() => {
        if (isClient) {
            try {
                localStorage.setItem(`${STORAGE_KEY}-${userId}`, JSON.stringify(formData));
            } catch (error) {
                console.error('Failed to save form data:', error);
            }
        }
    }, [formData, userId, isClient]);

    const handleInputChange = (field: keyof IntakeFormData, value: string | string[]) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };
            onFormChange?.(newData);
            return newData;
        });
    };

    const handleTaskChange = (index: number, value: string) => {
        const updatedTasks = [...formData.tasks];
        updatedTasks[index] = value;
        handleInputChange("tasks", updatedTasks);
    };

    const handleRequirementChange = (index: number, value: string) => {
        const updatedRequirements = [...formData.requirements];
        updatedRequirements[index] = value;
        handleInputChange("requirements", updatedRequirements);
    };

    const handleClearForm = () => {
        if (confirm('Are you sure you want to clear all form data?')) {
            const emptyData: IntakeFormData = {
                companyName: "",
                website: "",
                businessGoal: "More leads",
                tasks: ["", "", "", ""],
                outcome90Day: "",
                weeklyHours: "40",
                timezone: "",
                dailyOverlap: "",
                clientFacing: "Yes",
                tools: "",
                englishLevel: "Good",
                budgetBand: "Standard",
                requirements: ["", "", ""],
                existingSOPs: "No",
                examplesURL: "",
                reportingExpectations: "",
                managementStyle: "Async",
                securityNeeds: "",
                dealBreakers: "",
                roleSplit: "No",
                niceToHaveSkills: "",
            };
            setFormData(emptyData);
            onFormChange?.(emptyData);
            try {
                localStorage.removeItem(`${STORAGE_KEY}-${userId}`);
            } catch (error) {
                console.error('Failed to clear form data:', error);
            }
        }
    };

    const handleSubmitAnalysis = async () => {
        setIsAnalyzing(true);
        setAnalysisError(null);
        setAnalysisSuccess(false);

        try {
            const response = await fetch('/api/jd/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    intake_json: {
                        brand: {
                            name: formData.companyName,
                        },
                        tasks_top5: formData.tasks.filter(Boolean),
                        tools: formData.tools,
                        outcome_90d: formData.outcome90Day,
                        weekly_hours: parseInt(formData.weeklyHours),
                        client_facing: formData.clientFacing === 'Yes',
                    }
                })
            });

            if (!response.ok) {
                throw new Error('Analysis failed');
            }

            const data = await response.json();
            setAnalysisSuccess(true);
            console.log('Analysis successful:', data);

            // Pass data to parent and close form
            if (onSuccess) {
                onSuccess(data);
            }

            // Close form after a brief delay to show success message
            setTimeout(() => {
                onClose();
            }, 500);

        } catch (error) {
            console.error('Analysis error:', error);
            setAnalysisError(error instanceof Error ? error.message : 'Failed to analyze job description');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const inputClasses = "w-full px-3 py-2.5 bg-white/10 border border-white/10 rounded-lg text-sm text-neutral-200 placeholder-neutral-400 transition-all focus:outline-none focus:ring-2 focus:ring-[#00FF87]/30 focus:border-[#00FF87] hover:border-white/20";
    const labelClasses = "block text-sm font-medium text-neutral-300 mb-2";
    const sectionClasses = "space-y-5";
    const classNames = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(" ");

    function SingleSelect<T extends string>({
        value,
        onChange,
        options,
        placeholder,
    }: {
        value: T | "";
        onChange: (v: T) => void;
        options: { label: string; value: T }[];
        placeholder?: string;
    }) {
        const selected = options.find(o => o.value === value) ?? null;
        return (
            <Listbox value={selected} onChange={(opt) => opt ? onChange(opt.value) : undefined}>
                {({ open }) => (
                    <div className="relative z-[60]">
                        <Listbox.Button
                            className={classNames(
                                "w-full px-3 py-2.5 rounded-lg text-left",
                                "bg-white/10 border border-white/10 text-neutral-200",
                                "placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#00FF87]/30 focus:border-[#00FF87]",
                                "hover:border-white/20 transition-all"
                            )}
                        >
                            <span className="block truncate">
                                {selected ? selected.label : (placeholder || "Select")}
                            </span>
                            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                <ChevronUpDownIcon className="h-5 w-5 text-neutral-300" aria-hidden="true" />
                            </span>
                        </Listbox.Button>

                        <Transition
                            as={Fragment}
                            show={open}
                            enter="transition ease-out duration-100"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Listbox.Options
                                className="absolute z-[9999] mt-1 max-h-60 w-full overflow-auto rounded-lg bg-neutral-900 border border-white/10 py-1 text-sm shadow-[0_10px_30px_rgba(0,0,0,0.35)] focus:outline-none"
                            >
                                {options.map((opt) => (
                                    <Listbox.Option
                                        key={String(opt.value)}
                                        className={({ active }) => classNames(
                                            "relative cursor-pointer select-none py-2 pl-9 pr-3",
                                            active ? "bg-white/10 text-white" : "text-neutral-200"
                                        )}
                                        value={opt}
                                    >
                                        {({ selected: isSelected }) => (
                                            <>
                                                <span className={classNames("block truncate", isSelected && "text-[#00FF87]")}>{opt.label}</span>
                                                {isSelected ? (
                                                    <span className="absolute inset-y-0 left-2 flex items-center text-[#00FF87]">
                                                        <CheckIcon className="h-4 w-4" aria-hidden="true" />
                                                    </span>
                                                ) : null}
                                            </>
                                        )}
                                    </Listbox.Option>
                                ))}
                            </Listbox.Options>
                        </Transition>
                    </div>
                )}
            </Listbox>
        );
    }


    return (
        <div className="h-full overflow-y-auto">
            {/* <button
                onClick={onClose}
                className="absolute top-4 right-4 rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button> */}
            <div className="max-w-2xl mx-auto p-6 space-y-8 isolate">
                {/* Header */}
                {/* <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-white">Tell us more about your business</h1>
                        <p className="text-sm text-neutral-400 mt-1">Fill out the details below to generate your job description</p>
                    </div>
                    <button
                        onClick={handleClearForm}
                        className="text-sm text-neutral-400 hover:text-white transition-colors"
                    >
                        Clear all
                    </button>
                </div> */}

                {/* Progress Indicator */}
                <div className="bg-white/5 backdrop-blur rounded-xl p-4 shadow-[0_8px_24px_rgba(0,0,0,0.25)] border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-neutral-300">
                            Step {currentStep + 1} of {steps.length}
                        </span>
                        <span className="text-sm text-neutral-400">
                            {steps[currentStep].title}
                        </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                            className="bg-[#00FF87] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                        />
                    </div>
                    <div className="flex gap-2 mt-4">
                        {steps.map((step, index) => (
                            <button
                                key={step.id}
                                onClick={() => setCurrentStep(index)}
                                className={`
                                    flex-1 h-1.5 rounded-full transition-all
                                    ${index <= currentStep ? 'bg-[#00FF87]' : 'bg-white/10'}
                                    ${index === currentStep ? 'ring-2 ring-[#00FF87]/50' : ''}
                                `}
                                aria-label={`Go to step ${index + 1}: ${step.title}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <div className="min-h-[400px]">
                    {/* Step 0: Company Info */}
                    {currentStep === 0 && (
                        <div className="bg-white/5 backdrop-blur rounded-xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.25)] border border-white/10">
                            <h3 className="text-base font-semibold text-white mb-4">Company Information</h3>
                            <div className={sectionClasses}>
                                <div>
                                    <label className={labelClasses}>
                                        Company Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Acme Inc."
                                        value={formData.companyName}
                                        onChange={(e) => handleInputChange("companyName", e.target.value)}
                                        className={inputClasses}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>Website</label>
                                    <input
                                        type="text"
                                        placeholder="https://example.com or 'none yet'"
                                        value={formData.website}
                                        onChange={(e) => handleInputChange("website", e.target.value)}
                                        className={inputClasses}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 1: Business Goals */}
                    {currentStep === 1 && (
                        <div className="bg-white/5 backdrop-blur rounded-xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.25)] border border-white/10">
                            <h3 className="text-base font-semibold text-white mb-4">Business Goals</h3>
                            <div className={sectionClasses}>
                                <div>
                                    <label className={labelClasses}>
                                        Primary Goal <span className="text-red-500">*</span>
                                    </label>
                                    <SingleSelect
                                        value={formData.businessGoal}
                                        onChange={(v) => handleInputChange("businessGoal", v)}
                                        options={[
                                            { label: "More leads", value: "More leads" },
                                            { label: "More booked calls", value: "More booked calls" },
                                            { label: "More closed deals", value: "More closed deals" },
                                            { label: "Faster delivery", value: "Faster delivery" },
                                            { label: "Better retention", value: "Better retention" },
                                            { label: "Founder time back", value: "Founder time back" },
                                        ]}
                                        placeholder="Select primary goal"
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>
                                        90-Day Outcome <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        placeholder="What is the #1 result you want to achieve in 90 days?"
                                        value={formData.outcome90Day}
                                        onChange={(e) => handleInputChange("outcome90Day", e.target.value)}
                                        className={inputClasses}
                                        rows={3}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Key Tasks */}
                    {currentStep === 2 && (
                        <div className="bg-white/5 backdrop-blur rounded-xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.25)] border border-white/10">
                            <h3 className="text-base font-semibold text-white mb-1">Key Tasks</h3>
                            <p className="text-sm text-neutral-400 mb-4">List the top 3 tasks or any additional tasks this role will handle</p>
                            <div className={sectionClasses}>
                                {formData.tasks.map((task, index) => (
                                    <div key={index}>
                                        <label className={labelClasses}>
                                            {index === 3 ? "Additional Tasks" : `Task ${index + 1}`} {index < 3 && <span className="text-red-500">*</span>}
                                        </label>
                                        <input
                                            type="text"
                                            placeholder={`e.g., ${index === 0 ? 'Manage social media content' : index === 1 ? 'Respond to customer inquiries' : 'Create weekly reports'}`}
                                            value={task}
                                            onChange={(e) => handleTaskChange(index, e.target.value)}
                                            className={inputClasses}
                                            required={index < 3}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Work Details */}
                    {currentStep === 3 && (
                        <div className="bg-white/5 backdrop-blur rounded-xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.25)] border border-white/10">
                            <h3 className="text-base font-semibold text-white mb-4">Work Details</h3>
                            <div className={sectionClasses}>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClasses}>
                                            Weekly Hours <span className="text-red-500">*</span>
                                        </label>
                                        <SingleSelect
                                            value={formData.weeklyHours}
                                            onChange={(v) => handleInputChange("weeklyHours", v)}
                                            options={[
                                                { label: "10 hrs/week", value: "10" },
                                                { label: "20 hrs/week", value: "20" },
                                                { label: "30 hrs/week", value: "30" },
                                                { label: "40 hrs/week", value: "40" },
                                            ]}
                                            placeholder="Select hours"
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>
                                            Daily Overlap <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="8"
                                            placeholder="4"
                                            value={formData.dailyOverlap}
                                            onChange={(e) => handleInputChange("dailyOverlap", e.target.value)}
                                            className={inputClasses}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClasses}>
                                        Timezone <span className="text-red-500">*</span>
                                    </label>
                                    <SingleSelect
                                        value={formData.timezone}
                                        onChange={(v) => handleInputChange("timezone", v)}
                                        options={[
                                            { label: "EST (UTC-5)", value: "EST" },
                                            { label: "CST (UTC-6)", value: "CST" },
                                            { label: "MST (UTC-7)", value: "MST" },
                                            { label: "PST (UTC-8)", value: "PST" },
                                            { label: "GMT (UTC+0)", value: "GMT" },
                                            { label: "CET (UTC+1)", value: "CET" },
                                            { label: "IST (UTC+5:30)", value: "IST" },
                                            { label: "SGT (UTC+8)", value: "SGT" },
                                            { label: "AEST (UTC+10)", value: "AEST" },
                                        ]}
                                        placeholder="Select timezone"
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>
                                        Client-Facing Role? <span className="text-red-500">*</span>
                                    </label>
                                    <SingleSelect
                                        value={formData.clientFacing}
                                        onChange={(v) => handleInputChange("clientFacing", v)}
                                        options={[
                                            { label: "Yes", value: "Yes" },
                                            { label: "No", value: "No" },
                                        ]}
                                        placeholder="Select option"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Requirements */}
                    {currentStep === 4 && (
                        <div className="bg-white/5 backdrop-blur rounded-xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.25)] border border-white/10">
                            <h3 className="text-base font-semibold text-white mb-1">Requirements</h3>
                            <p className="text-sm text-neutral-400 mb-4">Must-have skills and qualifications</p>
                            <div className={sectionClasses}>
                                {formData.requirements.map((req, index) => (
                                    <div key={index}>
                                        <label className={labelClasses}>
                                            Requirement {index + 1} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder={`e.g., ${index === 0 ? '2+ years experience in social media' : index === 1 ? 'Proficient in Canva and Adobe Suite' : 'Experience with CRM systems'}`}
                                            value={req}
                                            onChange={(e) => handleRequirementChange(index, e.target.value)}
                                            className={inputClasses}
                                            required
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 5: Tools & Skills */}
                    {currentStep === 5 && (
                        <div className="bg-white/5 backdrop-blur rounded-xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.25)] border border-white/10">
                            <h3 className="text-base font-semibold text-white mb-4">Tools & Skills</h3>
                            <div className={sectionClasses}>
                                <div>
                                    <label className={labelClasses}>Tools/Stack in Use</label>
                                    <textarea
                                        placeholder="e.g., GoHighLevel, Slack, ClickUp, Canva, WordPress, Notion, Zapier, HubSpot, Salesforce, Asana, Trello"
                                        value={formData.tools}
                                        onChange={(e) => handleInputChange("tools", e.target.value)}
                                        className={inputClasses}
                                        rows={3}
                                    />
                                    <p className="text-xs text-neutral-400 mt-1.5">List the tools and technologies your team uses</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClasses}>English Level</label>
                                        <SingleSelect
                                            value={formData.englishLevel}
                                            onChange={(v) => handleInputChange("englishLevel", v)}
                                            options={[
                                                { label: "Basic", value: "Basic" },
                                                { label: "Good", value: "Good" },
                                                { label: "Excellent", value: "Excellent" },
                                                { label: "Near-native", value: "Near-native" },
                                            ]}
                                            placeholder="Select level"
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Budget Band</label>
                                        <SingleSelect
                                            value={formData.budgetBand}
                                            onChange={(v) => handleInputChange("budgetBand", v)}
                                            options={[
                                                { label: "Lite", value: "Lite" },
                                                { label: "Standard", value: "Standard" },
                                                { label: "Pro", value: "Pro" },
                                            ]}
                                            placeholder="Select band"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 6: Additional Details - Process */}
                    {currentStep === 6 && (
                        <div className="bg-white/5 backdrop-blur rounded-xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.25)] border border-white/10">
                            <h3 className="text-base font-semibold text-white mb-1">Additional Details - Process</h3>
                            <p className="text-sm text-neutral-400 mb-4">Optional information to refine your job description</p>
                            <div className={sectionClasses}>
                                <div>
                                    <label className={labelClasses}>Existing SOPs?</label>
                                    <SingleSelect
                                        value={formData.existingSOPs}
                                        onChange={(v) => handleInputChange("existingSOPs", v)}
                                        options={[
                                            { label: "Yes", value: "Yes" },
                                            { label: "No", value: "No" },
                                        ]}
                                        placeholder="Select option"
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>Examples to Emulate</label>
                                    <input
                                        type="text"
                                        placeholder="URL or description"
                                        value={formData.examplesURL}
                                        onChange={(e) => handleInputChange("examplesURL", e.target.value)}
                                        className={inputClasses}
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>Reporting Expectations</label>
                                    <textarea
                                        placeholder="What does success look like weekly?"
                                        value={formData.reportingExpectations}
                                        onChange={(e) => handleInputChange("reportingExpectations", e.target.value)}
                                        className={inputClasses}
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>Management Style</label>
                                    <SingleSelect
                                        value={formData.managementStyle}
                                        onChange={(v) => handleInputChange("managementStyle", v)}
                                        options={[
                                            { label: "Hands-on", value: "Hands-on" },
                                            { label: "Async", value: "Async" },
                                            { label: "Daily standup", value: "Daily standup" },
                                            { label: "Weekly", value: "Weekly" },
                                        ]}
                                        placeholder="Select style"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 7: Additional Details - Constraints */}
                    {currentStep === 7 && (
                        <div className="bg-white/5 backdrop-blur rounded-xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.25)] border border-white/10">
                            <h3 className="text-base font-semibold text-white mb-1">Additional Details - Constraints</h3>
                            <p className="text-sm text-neutral-400 mb-4">Constraints and preferences</p>
                            <div className={sectionClasses}>
                                <div>
                                    <label className={labelClasses}>Security/Compliance Needs</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., PII/PHI, finance access"
                                        value={formData.securityNeeds}
                                        onChange={(e) => handleInputChange("securityNeeds", e.target.value)}
                                        className={inputClasses}
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>Deal Breakers</label>
                                    <textarea
                                        placeholder="Any absolute requirements or disqualifiers"
                                        value={formData.dealBreakers}
                                        onChange={(e) => handleInputChange("dealBreakers", e.target.value)}
                                        className={inputClasses}
                                        rows={2}
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>Role Split Preference</label>
                                    <SingleSelect
                                        value={formData.roleSplit}
                                        onChange={(v) => handleInputChange("roleSplit", v)}
                                        options={[
                                            { label: "Yes - Open to splitting tasks", value: "Yes" },
                                            { label: "No - One person for all tasks", value: "No" },
                                        ]}
                                        placeholder="Select preference"
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>Nice-to-Have Skills</label>
                                    <textarea
                                        placeholder="Secondary skills that would be a bonus"
                                        value={formData.niceToHaveSkills}
                                        onChange={(e) => handleInputChange("niceToHaveSkills", e.target.value)}
                                        className={inputClasses}
                                        rows={2}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="pt-6 border-t border-white/10">
                    <div className="flex flex-col gap-4">
                        {analysisError && (
                            <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                <p className="text-sm text-red-400">{analysisError}</p>
                            </div>
                        )}
                        {analysisSuccess && (
                            <div className="px-4 py-3 rounded-lg bg-[#00FF87]/10 border border-[#00FF87]/20">
                                <p className="text-sm text-[#00FF87]">Analysis completed successfully!</p>
                            </div>
                        )}

                        {/* Show Submit button only on last step */}
                        {currentStep === steps.length - 1 ? (
                            <button
                                onClick={handleSubmitAnalysis}
                                disabled={isAnalyzing}
                                className={`
                                    w-full px-4 py-2 rounded-lg text-sm font-medium
                                    ${isAnalyzing
                                        ? 'bg-neutral-700 text-neutral-300 cursor-not-allowed'
                                        : 'bg-[#00FF87] text-neutral-900 hover:brightness-110'}
                                    transition-all duration-200
                                `}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    {isAnalyzing ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            <span>Analyzing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Generate Description</span>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </>
                                    )}
                                </div>
                            </button>
                        ) : (
                            <div className="flex gap-3">
                                <button
                                    onClick={handlePrevious}
                                    disabled={currentStep === 0}
                                    className={`
                                        flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                        ${currentStep === 0
                                            ? 'bg-white/5 text-neutral-500 cursor-not-allowed'
                                            : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'}
                                    `}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        <span>Previous</span>
                                    </div>
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={!validateStep(currentStep)}
                                    className={`
                                        flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                        ${!validateStep(currentStep)
                                            ? 'bg-neutral-700 text-neutral-300 cursor-not-allowed'
                                            : 'bg-[#00FF87] text-neutral-900 hover:brightness-110'}
                                    `}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <span>Next</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}