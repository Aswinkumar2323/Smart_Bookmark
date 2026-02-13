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

            <main style={{ maxWidth: "960px", margin: "0 auto", padding: "2.5rem 1.5rem 3rem" }}>
                {/* Page title */}
                <div className="animate-fade-in-up" style={{ marginBottom: "2.5rem", textAlign: "center" }}>
                    <h1 className="text-3xl font-bold" style={{ marginBottom: "0.75rem" }}>
                        Your <span className="gradient-text">Bookmarks</span>
                    </h1>
                    <p className="text-text-secondary text-base">
                        Add, manage, and access your saved links in real-time.
                    </p>
                </div>

                {/* Bookmark Manager (Form + List with realtime updates) */}
                <DashboardClient userId={user.id} />
            </main>
        </div>
    );
}
