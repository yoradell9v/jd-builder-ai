"use client";

import { Fragment, useState, useEffect, useRef } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import Modal from "@/components/ui/Modal";

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
const MAX_SOP_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_SOP_EXTENSIONS = [".pdf", ".doc", ".docx", ".txt"];
const ALLOWED_SOP_MIME_TYPES = new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
]);

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

    const [showClearModal, setShowClearModal] = useState(false);
    const [isFormClearing, setIsFormClearing] = useState(false);
    const [sopFile, setSopFile] = useState<File | null>(null);
    const [sopFileError, setSopFileError] = useState<string | null>(null);
    const sopFileInputRef = useRef<HTMLInputElement | null>(null);

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
        if (field === "existingSOPs" && value === "No") {
            setSopFile(null);
            setSopFileError(null);
            if (sopFileInputRef.current) {
                sopFileInputRef.current.value = "";
            }
        }
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

    const handleSOPFileChange = (file: File | null) => {
        if (!file) {
            setSopFile(null);
            setSopFileError(null);
            return;
        }

        const extension = file.name ? file.name.substring(file.name.lastIndexOf(".")).toLowerCase() : "";
        const isExtensionAllowed = ALLOWED_SOP_EXTENSIONS.includes(extension);
        const isMimeAllowed = file.type ? ALLOWED_SOP_MIME_TYPES.has(file.type) : isExtensionAllowed;

        if (file.size > MAX_SOP_FILE_SIZE) {
            setSopFile(null);
            setSopFileError("File is too large. Please upload a file under 10MB.");
            if (sopFileInputRef.current) {
                sopFileInputRef.current.value = "";
            }
            return;
        }

        if (!isExtensionAllowed && !isMimeAllowed) {
            setSopFile(null);
            setSopFileError("Unsupported file type. Allowed types: PDF, DOC, DOCX, TXT.");
            if (sopFileInputRef.current) {
                sopFileInputRef.current.value = "";
            }
            return;
        }

        setSopFile(file);
        setSopFileError(null);
    };

    const handleClearForm = () => {
        setIsFormClearing(true);

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

        try {
            setFormData(emptyData);
            onFormChange?.(emptyData);
            localStorage.removeItem(`${STORAGE_KEY}-${userId}`);
        } catch (error) {
            console.error("Failed to clear form data:", error);
        } finally {
            setIsFormClearing(false);
            setShowClearModal(false);
        }
        setSopFile(null);
        setSopFileError(null);
        if (sopFileInputRef.current) {
            sopFileInputRef.current.value = "";
        }
    };


    const handleSubmitAnalysis = async () => {
        if (sopFileError) {
            setAnalysisError("Please resolve the SOP file issue before generating the job description.");
            return;
        }

        setIsAnalyzing(true);
        setAnalysisError(null);
        setAnalysisSuccess(false);

        try {
            const toolsArray = formData.tools
                .split(",")
                .map(tool => tool.trim())
                .filter(Boolean);

            const intakePayload = {
                brand: {
                    name: formData.companyName,
                },
                website: formData.website,
                business_goal: formData.businessGoal,
                outcome_90d: formData.outcome90Day,
                tasks_top5: formData.tasks.filter(task => task.trim()).slice(0, 5),
                requirements: formData.requirements.filter(req => req.trim()),
                weekly_hours: parseInt(formData.weeklyHours, 10) || 0,
                daily_overlap_hours: Number(formData.dailyOverlap) || 0,
                timezone: formData.timezone,
                client_facing: formData.clientFacing === "Yes",
                tools: toolsArray,
                tools_raw: formData.tools,
                english_level: formData.englishLevel,
                budget_band: formData.budgetBand,
                management_style: formData.managementStyle,
                reporting_expectations: formData.reportingExpectations,
                security_needs: formData.securityNeeds,
                deal_breakers: formData.dealBreakers,
                role_split: formData.roleSplit,
                nice_to_have_skills: formData.niceToHaveSkills,
                existing_sops: formData.existingSOPs === "Yes",
                examples_url: formData.examplesURL,
                sop_filename: sopFile?.name ?? null,
            };

            const payload = new FormData();
            payload.append("intake_json", JSON.stringify(intakePayload));

            if (sopFile) {
                payload.append("sopFile", sopFile);
            }

            const response = await fetch('/api/jd/analyze', {
                method: 'POST',
                body: payload,
            });

            if (!response.ok) {
                let message = 'Analysis failed';
                try {
                    const errorPayload = await response.json();
                    if (errorPayload?.error) {
                        message = errorPayload.error;
                    }
                } catch {
                    // Ignore JSON parse errors and use default message
                }
                throw new Error(message);
            }

            const data = await response.json();
            setAnalysisSuccess(true);
            console.log('Analysis successful:', data);

            // Pass data to parent and close form
            if (onSuccess) {
                onSuccess({
                    apiResult: data,
                    input: formData,
                });
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

    const inputClasses = "w-full px-3 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] hover:border-zinc-300 dark:hover:border-zinc-700";
    const labelClasses = "block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2";
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
        const buttonRef = useRef<HTMLButtonElement>(null);
        const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

        return (
            <Listbox value={selected} onChange={(opt) => opt ? onChange(opt.value) : undefined}>
                {({ open }) => {
                    // Update position when dropdown opens using useEffect
                    useEffect(() => {
                        if (open && buttonRef.current) {
                            const rect = buttonRef.current.getBoundingClientRect();
                            setPosition({
                                top: rect.bottom + window.scrollY,
                                left: rect.left + window.scrollX,
                                width: rect.width,
                            });
                        }
                    }, [open]);

                    return (
                        <div className="relative">
                            <Listbox.Button
                                ref={buttonRef}
                                className={classNames(
                                    "w-full px-3 py-2.5 rounded-lg text-left text-sm",
                                    "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100",
                                    "placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]",
                                    "hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                                )}
                            >
                                <span className="block truncate text-sm">
                                    {selected ? selected.label : (placeholder || "Select")}
                                </span>
                                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                    <ChevronUpDownIcon className="h-5 w-5 text-zinc-500 dark:text-zinc-400" aria-hidden="true" />
                                </span>
                            </Listbox.Button>

                            {open && (
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
                                        className="fixed z-[99999] mt-1 max-h-60 overflow-auto rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 py-1 text-sm shadow-lg focus:outline-none"
                                        style={{
                                            top: `${position.top}px`,
                                            left: `${position.left}px`,
                                            width: `${position.width}px`,
                                        }}
                                    >
                                        {options.map((opt) => (
                                            <Listbox.Option
                                                key={String(opt.value)}
                                                className={({ active }) => classNames(
                                                    "relative cursor-pointer select-none py-2 pl-9 pr-3 text-sm",
                                                    active ? "bg-[var(--primary)]/20 text-zinc-900 dark:text-zinc-100" : "text-zinc-900 dark:text-zinc-100"
                                                )}
                                                value={opt}
                                            >
                                                {({ selected: isSelected }) => (
                                                    <>
                                                        <span className={classNames("block truncate text-sm", isSelected && "text-[var(--primary)]")}>
                                                            {opt.label}
                                                        </span>
                                                        {isSelected && (
                                                            <span className="absolute inset-y-0 left-2 flex items-center text-[var(--primary)]">
                                                                <CheckIcon className="h-4 w-4" aria-hidden="true" />
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </Listbox.Option>
                                        ))}
                                    </Listbox.Options>
                                </Transition>
                            )}
                        </div>
                    );
                }}
            </Listbox>
        );
    }

    return (
        <>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-6">
                        {/* Header */}
                        <div className="flex items-start justify-between flex-wrap gap-4">
                            <div>
                                <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Tell us more about your business</h1>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                                    Fill out the details below to generate your job description
                                </p>
                            </div>
                            <button
                                onClick={() => setShowClearModal(true)}
                                className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-[var(--accent)] hover:opacity-90 transition-all"
                            >
                                Clear Form
                            </button>

                        </div>


                        {/* Progress Indicator */}
                        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                    Step {currentStep + 1} of {steps.length}
                                </span>
                                <span className="text-sm text-zinc-500 dark:text-zinc-500">
                                    {steps[currentStep].title}
                                </span>
                            </div>

                            {/* Progress bar background */}
                            <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                                <div
                                    className="h-2 rounded-full transition-all duration-300"
                                    style={{
                                        width: `${((currentStep + 1) / steps.length) * 100}%`,
                                        backgroundColor: "var(--primary)",
                                    }}
                                />
                            </div>

                            {/* Step indicators */}
                            <div className="flex gap-2 mt-4">
                                {steps.map((step, index) => (
                                    <button
                                        key={step.id}
                                        onClick={() => setCurrentStep(index)}
                                        className={`
                                        flex-1 h-1.5 rounded-full transition-all
                                        ${index <= currentStep ? "bg-[var(--accent)]" : "bg-zinc-200 dark:bg-zinc-700"}
                                        ${index === currentStep ? "ring-2 ring-[var(--accent)]/50" : ""}
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
                                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
                                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Company Information</h3>
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
                                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
                                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Business Goals</h3>
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
                                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
                                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Key Tasks</h3>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">List the top 3 tasks or any additional tasks this role will handle</p>
                                    <div className={sectionClasses}>
                                        {formData.tasks.map((task, index) => (
                                            <div key={index}>
                                                <label className={labelClasses}>
                                                    {index === 3 ? "Additional Tasks" : `Task ${index + 1}`}{" "}
                                                    {index < 3 && <span className="text-red-500">*</span>}
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder={`e.g., ${index === 0
                                                        ? "Manage social media content"
                                                        : index === 1
                                                            ? "Respond to customer inquiries"
                                                            : "Create weekly reports"
                                                        }`}
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
                                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
                                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Work Details</h3>
                                    <div className={sectionClasses}>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
                                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Requirements</h3>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Must-have skills and qualifications</p>
                                    <div className={sectionClasses}>
                                        {formData.requirements.map((req, index) => (
                                            <div key={index}>
                                                <label className={labelClasses}>
                                                    Requirement {index + 1} <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder={`e.g., ${index === 0
                                                        ? "2+ years experience in social media"
                                                        : index === 1
                                                            ? "Proficient in Canva and Adobe Suite"
                                                            : "Experience with CRM systems"
                                                        }`}
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
                                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
                                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Tools & Skills</h3>
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
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">List the tools and technologies your team uses</p>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-md border border-neutral-200 dark:border-zinc-700">
                                    <h3 className="text-base font-semibold text-neutral-900 mb-1">Additional Details - Process</h3>
                                    <p className="text-sm text-neutral-500 mb-4">Optional information to refine your job description</p>
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

                                        {formData.existingSOPs === "Yes" && (
                                            <div>
                                                <label className={labelClasses}>Drop or upload a file of your existing SOP</label>
                                                <input
                                                    ref={sopFileInputRef}
                                                    type="file"
                                                    accept=".pdf,.doc,.docx,.txt"
                                                    onChange={(e) => handleSOPFileChange(e.target.files?.[0] ?? null)}
                                                    className={inputClasses}
                                                />
                                                {sopFile && (
                                                    <div className="mt-2 flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200">
                                                        <span className="truncate">
                                                            {sopFile.name} · {(sopFile.size / (1024 * 1024)).toFixed(2)} MB
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSopFile(null);
                                                                setSopFileError(null);
                                                                if (sopFileInputRef.current) {
                                                                    sopFileInputRef.current.value = "";
                                                                }
                                                            }}
                                                            className="ml-4 text-xs font-medium text-[var(--accent)] hover:underline"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                )}
                                                {sopFileError && (
                                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{sopFileError}</p>
                                                )}
                                                {formData.existingSOPs === "Yes" && !sopFile && !sopFileError && (
                                                    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                                                        Supported file types: PDF, DOC, DOCX, TXT. Max size 10MB.
                                                    </p>
                                                )}
                                            </div>
                                        )}

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
                                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
                                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Additional Details - Constraints</h3>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Constraints and preferences</p>
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
                    </div>
                </div>

                {/* Navigation Buttons - Sticky at bottom */}
                <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sticky bottom-0">
                    <div className="flex flex-col gap-4">
                        {analysisError && (
                            <div className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                <p className="text-sm text-red-700 dark:text-red-300">{analysisError}</p>
                            </div>
                        )}
                        {analysisSuccess && (
                            <div className="px-4 py-3 rounded-lg bg-[var(--accent)]/10 dark:bg-[var(--accent)]/20 border border-[var(--accent)]/30 dark:border-[var(--accent)]/30">
                                <p className="text-sm text-[var(--accent)] dark:text-[var(--accent)]">Analysis completed successfully!</p>
                            </div>
                        )}

                        {/* Show Submit button only on last step */}
                        {currentStep === steps.length - 1 ? (
                            <button
                                onClick={handleSubmitAnalysis}
                                disabled={isAnalyzing}
                                className={`
                                w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                                ${isAnalyzing
                                        ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                                        : 'bg-[var(--primary)] text-white hover:brightness-110'}
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
                                    flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                                    ${currentStep === 0
                                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                                            : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'}
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
                                    flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                                    ${!validateStep(currentStep)
                                            ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                                            : 'bg-[var(--primary)] text-white hover:brightness-110'}
                                `}
                                >
                                    <div className="flex items-center justify-center gap-2">
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
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

            </div>
            <Modal
                isOpen={showClearModal}
                onClose={() => setShowClearModal(false)}
                onConfirm={handleClearForm}
                title="Confirm Clear Data"
                message="Are you sure you want to clear all data?"
                confirmVariant="danger"
                confirmText={
                    isFormClearing ? (
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
                            <span>Clearing form...</span>
                        </div>
                    ) : (
                        "Clear Form Data"
                    )
                }
            />
        </>

    );
}