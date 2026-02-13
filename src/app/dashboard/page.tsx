import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import DashboardClient from "@/components/DashboardClient";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/");
    }

    return (
        <div className="min-h-screen">
            <Header user={user} />

            <main className="max-w-[960px] mx-auto px-6 py-8">
                {/* Page title */}
                <div className="animate-fade-in-up mb-8">
                    <h1 className="text-3xl font-bold mb-2">
                        Your <span className="gradient-text">Bookmarks</span>
                    </h1>
                    <p className="text-text-secondary text-[0.95rem]">
                        Add, manage, and access your saved links in real-time.
                    </p>
                </div>

                {/* Bookmark Manager (Form + List with realtime updates) */}
                <DashboardClient userId={user.id} />
            </main>
        </div>
    );
}
