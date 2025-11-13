"use client";

import { useEffect, useState, Fragment } from "react";
import Link from "next/link";
import { Listbox, Transition } from "@headlessui/react";
import { FaUser, FaSignOutAlt } from "react-icons/fa";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { useUser } from "@/context/UserContext";
import Modal from "./Modal";
import AccountDetailsModal from "./AccountDetailsModal";

const accountOptions = [
    { name: "Account Details", href: "/account/details" },
    { name: "Saved Items", href: "/saved" },
];



export default function Navbar() {
    const user = useUser();

    const [mounted, setMounted] = useState(false);
    const [selected, setSelected] = useState(accountOptions[0]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAccountDetailsModalOpen, setIsAccountDetailsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const handleConfirmLogout = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/auth/signout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) {
                console.error("Failed to sign out:", await res.text());
                return;
            }

            console.log("Logged out successfully");
            window.location.href = "/signin";
        } catch (error) {
            console.error("Error during signout:", error);
            setIsSubmitting(false);
        }
    };


    return (
        <>
            <nav className="fixed top-4 right-6 z-[9999] flex items-center gap-6 px-6 py-3 rounded-2xl border shadow-md transition-all duration-150" style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)", color: "var(--text-secondary)" }}>

                {/* Account Dropdown */}
                <Listbox value={selected} onChange={setSelected}>
                    {({ open }) => (
                        <div className="relative">
                            <Listbox.Button
                                className="flex items-center gap-2 text-sm font-medium hover:text-[var(--accent)] transition-colors group focus:outline-none focus:ring-0"
                            >
                                <FaUser className="text-lg text-neutral-500 group-hover:text-[var(--accent)] transition-all duration-200 group-hover:drop-shadow-[0_0_6px_var(--accent)]" />
                                <ChevronUpDownIcon
                                    className={`h-4 w-4 text-neutral-500 transition-transform duration-200 ${open ? `rotate-180 text-[var(--accent)]` : ""}`}
                                />
                            </Listbox.Button>

                            <Transition
                                as={Fragment}
                                show={open}
                                enter="transition ease-out duration-150"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Listbox.Options className="absolute right-0 mt-2 w-44 rounded-xl border shadow-lg overflow-hidden focus:outline-none z-50 transition-all duration-150" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                                    {accountOptions.map((option) => (
                                        <Listbox.Option
                                            key={option.name}
                                            value={option}
                                            as={Fragment}
                                        >
                                            {({ active }) => (
                                                option.name === "Account Details" ? (
                                                    <button
                                                        onClick={() => {
                                                            setIsAccountDetailsModalOpen(true);
                                                        }}
                                                        className={`w-full text-left block px-4 py-2 text-sm transition-colors duration-150 ${active ? "bg-[var(--accent)]/10" : ""}`}
                                                        style={{
                                                            color: active ? "var(--accent)" : "var(--text-secondary)"
                                                        }}
                                                    >
                                                        {option.name}
                                                    </button>
                                                ) : (
                                                    <Link
                                                        href={option.href}
                                                        className={`block px-4 py-2 text-sm transition-colors duration-150 ${active ? "bg-[var(--accent)]/10" : ""}`}
                                                        style={{
                                                            color: active ? "var(--accent)" : "var(--text-secondary)"
                                                        }}
                                                    >
                                                        {option.name}
                                                    </Link>
                                                )
                                            )}
                                        </Listbox.Option>
                                    ))}
                                </Listbox.Options>
                            </Transition>
                        </div>
                    )}
                </Listbox>

                <button
                    className="flex items-center gap-2 text-sm font-medium transition-colors duration-150 group"
                    style={{ color: "var(--text-secondary)" }}
                    onClick={() => setIsModalOpen(true)}
                    onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent)"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                >
                    <FaSignOutAlt className="text-lg text-neutral-500 group-hover:text-[var(--accent)] transition-all duration-200 group-hover:drop-shadow-[0_0_6px_var(--accent)]" />
                </button>

            </nav>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmLogout}
                title="Confirm Sign Out"
                message="Are you sure you want to sign out of your account?"
                confirmVariant="danger"
                confirmText={
                    isSubmitting ? (
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
                            <span>Signing out...</span>
                        </div>
                    ) : (
                        "Sign Out"
                    )
                }
            />

            <AccountDetailsModal
                isOpen={isAccountDetailsModalOpen}
                onClose={() => setIsAccountDetailsModalOpen(false)}
                user={user}
                onLogout={handleConfirmLogout}
            />

        </>

    );
}
