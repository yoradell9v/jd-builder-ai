'use client'

import { useState } from 'react'
import Link from 'next/link'

type AuthMode = 'signin' | 'signup'

export interface AuthFormValues {
    firstname?: string
    lastname?: string
    email: string
    password: string
    confirmPassword?: string
}

export interface AuthFormProps {
    mode: AuthMode
    onSubmit: (values: AuthFormValues) => void | Promise<void>
    isSubmitting?: boolean
    errorMessage?: string
    submitLabel?: string
}

export default function AuthForm({
    mode,
    onSubmit,
    isSubmitting = false,
    errorMessage,
    submitLabel,
}: AuthFormProps) {
    const [values, setValues] = useState<AuthFormValues>({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        confirmPassword: '',
    })

    const isSignup = mode === 'signup'

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement>
    ) {
        const { name, value } = e.target
        setValues((prev) => ({ ...prev, [name]: value }))
    }

    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault()
        if (isSignup && values.password !== values.confirmPassword) {
            return
        }
        await onSubmit({
            firstname: values.firstname?.trim() || undefined,
            lastname: values.lastname?.trim() || undefined,
            email: values.email.trim(),
            password: values.password,
            confirmPassword: isSignup
                ? values.confirmPassword
                : undefined,
        })
    }

    const heading = isSignup ? 'Create your account' : 'Welcome back'
    const buttonLabel =
        submitLabel || (isSignup ? 'Sign up' : 'Sign in')

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-neutral-950 text-neutral-200">
            <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl px-8 pt-8 pb-10 border border-white/10 bg-white/5 backdrop-blur shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
                <div className="mb-8">
                    <p className="text-sm text-neutral-400 mb-1">Please enter details</p>
                    <h2 className="text-2xl font-semibold text-white mb-2">
                        {heading}
                    </h2>
                    {errorMessage && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-md">
                            <p className="text-sm text-red-300">{errorMessage}</p>
                        </div>
                    )}
                </div>

                {isSignup && (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label
                                htmlFor="firstname"
                                className="block text-sm font-medium text-neutral-300 mb-1"
                            >
                                First name
                            </label>
                            <input
                                id="firstname"
                                name="firstname"
                                type="text"
                                placeholder="John"
                                value={values.firstname || ''}
                                onChange={handleChange}
                                autoComplete="firstname"
                                className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-md text-neutral-200 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#00FF87]/30 focus:border-[#00FF87] transition-all duration-200"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="lastname"
                                className="block text-sm font-medium text-neutral-300 mb-1"
                            >
                                Last name
                            </label>
                            <input
                                id="lastname"
                                name="lastname"
                                type="text"
                                placeholder="Doe"
                                value={values.lastname || ''}
                                onChange={handleChange}
                                autoComplete="lastname"
                                className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-md text-neutral-200 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#00FF87]/30 focus:border-[#00FF87] transition-all duration-200"
                            />
                        </div>
                    </div>
                )}

                <div className="mb-4">
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-neutral-300 mb-1"
                    >
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={values.email}
                        onChange={handleChange}
                        autoComplete="email"
                        required
                        className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-md text-neutral-200 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#00FF87]/30 focus:border-[#00FF87] transition-all duration-200"
                    />
                </div>

                <div className="mb-4">
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium text-neutral-300 mb-1"
                    >
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={values.password}
                        onChange={handleChange}
                        autoComplete={isSignup ? 'new-password' : 'current-password'}
                        required
                        className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-md text-neutral-200 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#00FF87]/30 focus:border-[#00FF87] transition-all duration-200"
                    />
                </div>

                {isSignup && (
                    <div className="mb-6">
                        <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium text-neutral-300 mb-1"
                        >
                            Confirm password
                        </label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={values.confirmPassword || ''}
                            onChange={handleChange}
                            autoComplete="new-password"
                            required
                            className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-md text-neutral-200 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#00FF87]/30 focus:border-[#00FF87] transition-all duration-200"
                        />
                    </div>
                )}

                <div className="mb-6">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#00FF87] hover:brightness-110 text-white-900 font-semibold py-2.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00FF87]/40 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_#00FF87]"
                    >
                        {isSubmitting ? 'Please wait…' : buttonLabel}
                    </button>
                </div>

                <div className="text-center">
                    {isSignup ? (
                        <p className="text-sm text-neutral-300">
                            Already have an account?{' '}
                            <Link
                                href="/signin"
                                className="font-medium text-[#00FF87] hover:brightness-110 transition"
                            >
                                Sign in
                            </Link>
                        </p>
                    ) : (
                        <p className="text-sm text-neutral-300">
                            Don't have an account yet?{' '}
                            <Link
                                href="/signup"
                                className="font-medium text-[#00FF87] hover:brightness-110 transition"
                            >
                                Sign up
                            </Link>
                        </p>
                    )}
                </div>
            </form>
        </div>
    )
}