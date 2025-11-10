"use client";
import AuthForm from "../../components/forms/AuthForm";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);
    const router = useRouter();

    const handleSubmit = async ({ email, password }: { email: string; password: string }) => {
        setLoading(true);
        setError(undefined);

        try {
            const response = await fetch("/api/auth/signin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                console.log(error)
                setError(data.error || "An error occurred during sign in");
                return;
            }
            setTimeout(() => {
                router.push("/dashboard");
            }, 300);


        } catch (err) {
            setError("Failed to connect to the server. Please try again.");
            console.error("Sign in error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthForm
            mode="signin"
            onSubmit={handleSubmit}
            isSubmitting={loading}
            errorMessage={error}
        />
    );
}