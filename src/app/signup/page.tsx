"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthForm from "../../components/forms/AuthForm";

export default function SignUpPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);

    return (
        <AuthForm
            mode="signup"
            onSubmit={async ({ firstname, lastname, email, password, confirmPassword }) => {
                try {
                    setLoading(true);
                    setError(undefined);

                    const response = await fetch("../api/auth/signup", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            firstname,
                            lastname,
                            email,
                            password,
                            confirmPassword,
                        }),
                    });

                    const text = await response.text();

                    let data;
                    try {
                        data = JSON.parse(text);
                    } catch {
                        console.error("Non-JSON response from API:", text);
                        throw new Error("Server returned non-JSON response");
                    }

                    if (!response.ok) {
                        setError(data.error || "Failed to sign up");
                        return;
                    }

                    alert("Signup successful!");
                    router.push("/signin");
                } catch (err) {
                    console.error("Signup error:", err);
                    setError("Something went wrong. Please try again.");
                } finally {
                    setLoading(false);
                }
            }}
            isSubmitting={loading}
            errorMessage={error}
        />
    );
}
