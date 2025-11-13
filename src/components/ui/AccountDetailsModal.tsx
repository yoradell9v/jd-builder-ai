"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Sun, Moon, LogOut, X } from "lucide-react";
import { User as UserType } from "@/context/UserContext";

type AccountDetailsModalProps = {
    isOpen: boolean;
    onClose: () => void;
    user: UserType | null;
    onLogout: () => void;
};

export default function AccountDetailsModal({
    isOpen,
    onClose,
    user,
    onLogout,
}: AccountDetailsModalProps) {
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Check initial theme and listen for changes
    useEffect(() => {
        const checkTheme = () => {
            const isDark =
                document.documentElement.classList.contains("dark") ||
                (window.matchMedia("(prefers-color-scheme: dark)").matches &&
                    !document.documentElement.classList.contains("light"));
            setIsDarkMode(isDark);
        };

        checkTheme();

        // Listen for theme changes
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        // Listen for system theme changes
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => checkTheme();
        mediaQuery.addEventListener("change", handleChange);

        return () => {
            observer.disconnect();
            mediaQuery.removeEventListener("change", handleChange);
        };
    }, []);

    // Handle ESC key press
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    const toggleTheme = () => {
        const html = document.documentElement;
        const newIsDark = !isDarkMode;

        if (newIsDark) {
            html.classList.add("dark");
            html.classList.remove("light");
        } else {
            html.classList.remove("dark");
            html.classList.add("light");
        }

        setIsDarkMode(newIsDark);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="relative rounded-xl sm:rounded-2xl border shadow-xl max-w-md w-full max-h-[calc(100vh-1rem)] sm:max-h-[calc(100vh-2rem)] flex flex-col pointer-events-auto overflow-hidden"
                            style={{
                                backgroundColor: "var(--card-bg)",
                                borderColor: "var(--card-border)",
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 z-10 p-1.5 rounded-lg transition-colors duration-200 hover:bg-[var(--hover-bg)]"
                                style={{ color: "var(--text-secondary)" }}
                                aria-label="Close modal"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="flex-1 flex flex-col overflow-hidden p-6">
                                {/* Title */}
                                <h3
                                    className="text-xl font-semibold mb-6"
                                    style={{ color: "var(--text-primary)" }}
                                >
                                    Account Details
                                </h3>

                                {/* User Info Section */}
                                <div className="space-y-4 mb-6">
                                    {/* First Name */}
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="p-2 rounded-lg"
                                            style={{ backgroundColor: "var(--hover-bg)" }}
                                        >
                                            <User
                                                className="h-4 w-4"
                                                style={{ color: "var(--accent)" }}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p
                                                className="text-xs font-medium mb-0.5"
                                                style={{ color: "var(--text-muted)" }}
                                            >
                                                First Name
                                            </p>
                                            <p
                                                className="text-sm truncate"
                                                style={{ color: "var(--text-primary)" }}
                                            >
                                                {user?.firstname || "—"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Last Name */}
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="p-2 rounded-lg"
                                            style={{ backgroundColor: "var(--hover-bg)" }}
                                        >
                                            <User
                                                className="h-4 w-4"
                                                style={{ color: "var(--accent)" }}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p
                                                className="text-xs font-medium mb-0.5"
                                                style={{ color: "var(--text-muted)" }}
                                            >
                                                Last Name
                                            </p>
                                            <p
                                                className="text-sm truncate"
                                                style={{ color: "var(--text-primary)" }}
                                            >
                                                {user?.lastname || "—"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="p-2 rounded-lg"
                                            style={{ backgroundColor: "var(--hover-bg)" }}
                                        >
                                            <Mail
                                                className="h-4 w-4"
                                                style={{ color: "var(--accent)" }}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p
                                                className="text-xs font-medium mb-0.5"
                                                style={{ color: "var(--text-muted)" }}
                                            >
                                                Email
                                            </p>
                                            <p
                                                className="text-sm truncate"
                                                style={{ color: "var(--text-primary)" }}
                                            >
                                                {user?.email || "—"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div
                                    className="h-px mb-6"
                                    style={{ backgroundColor: "var(--card-border)" }}
                                />

                                {/* Theme Toggler */}
                                {/* <div className="mb-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {isDarkMode ? (
                                                <Moon
                                                    className="h-5 w-5"
                                                    style={{ color: "var(--accent)" }}
                                                />
                                            ) : (
                                                <Sun
                                                    className="h-5 w-5"
                                                    style={{ color: "var(--accent)" }}
                                                />
                                            )}
                                            <span
                                                className="text-sm font-medium"
                                                style={{ color: "var(--text-primary)" }}
                                            >
                                                {isDarkMode ? "Dark Mode" : "Light Mode"}
                                            </span>
                                        </div>
                                        <button
                                            onClick={toggleTheme}
                                            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                                            style={{
                                                backgroundColor: isDarkMode
                                                    ? "var(--accent)"
                                                    : "var(--card-border)",
                                            }}
                                            aria-label="Toggle theme"
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${isDarkMode ? "translate-x-6" : "translate-x-1"
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                </div> */}

                                {/* Divider */}
                                {/* <div
                                    className="h-px mb-6"
                                    style={{ backgroundColor: "var(--card-border)" }}
                                /> */}

                                {/* Logout Button */}
                                <button
                                    onClick={() => {
                                        onClose();
                                        onLogout();
                                    }}
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 hover:opacity-90"
                                    style={{
                                        backgroundColor: "var(--accent)",
                                        color: "white",
                                    }}
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}

