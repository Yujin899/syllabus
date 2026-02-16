'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/auth/login");
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#004E98] text-white font-sans italic text-sm">
            Redirecting to Syllabus...
        </div>
    );
}
