'use client'

import { Suspense } from 'react'
import ResetPasswordContent from './ResetPasswordContent'
export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordContent />
        </Suspense>
    )
}
