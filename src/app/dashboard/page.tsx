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
        <div style={{ minHeight: "100vh" }}>
            <Header user={user} />

            <main
                style={{
                    maxWidth: "960px",
                    margin: "0 auto",
                    padding: "2rem 1.5rem",
                }}
            >
                {/* Page title */}
                <div
                    className="animate-fade-in-up"
                    style={{ marginBottom: "2rem" }}
                >
                    <h1
                        style={{
                            fontSize: "2rem",
                            fontWeight: 700,
                            marginBottom: "0.5rem",
                        }}
                    >
                        Your <span className="gradient-text">Bookmarks</span>
                    </h1>
                    <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem" }}>
                        Add, manage, and access your saved links in real-time.
                    </p>
                </div>

                {/* Bookmark Manager (Form + List with realtime updates) */}
                <DashboardClient userId={user.id} />
            </main>
        </div>
    );
}
