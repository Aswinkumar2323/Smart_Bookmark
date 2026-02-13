import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AuthButton from "@/components/AuthButton";

export const dynamic = "force-dynamic";

export default async function Home() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (user) {
        redirect("/dashboard");
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
            {/* Hero Section */}
            <div className="animate-fade-in-up max-w-[640px] flex flex-col items-center gap-8">
                {/* Logo */}
                <div className="w-20 h-20 rounded-[1.25rem] bg-linear-to-br from-accent-1 to-accent-2 flex items-center justify-center text-[2.5rem] shadow-[0_8px_32px_rgba(99,102,241,0.3)]">
                    🔖
                </div>

                <div>
                    <h1 className="text-[3.5rem] font-extrabold leading-[1.1] mb-4">
                        <span className="gradient-text">Smart</span> Bookmark
                    </h1>
                    <p className="text-xl text-text-secondary leading-relaxed max-w-[480px] mx-auto">
                        Save, organize, and access your bookmarks from anywhere. Real-time
                        sync across all your devices.
                    </p>
                </div>

                {/* Features */}
                <div className="grid grid-cols-3 gap-4 w-full mt-2">
                    {[
                        { icon: "🔒", label: "Private & Secure" },
                        { icon: "⚡", label: "Real-time Sync" },
                        { icon: "🌐", label: "Access Anywhere" },
                    ].map((feature) => (
                        <div
                            key={feature.label}
                            className="glass-card px-4 py-5 flex flex-col items-center gap-2"
                        >
                            <span className="text-2xl">{feature.icon}</span>
                            <span className="text-sm text-text-secondary font-medium">
                                {feature.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Sign In */}
                <AuthButton />

                <p className="text-xs text-text-muted -mt-2">
                    Sign in with your Google account to get started — it&#39;s free!
                </p>
            </div>
        </main>
    );
}
