import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AuthButton from "@/components/AuthButton";

export default async function Home() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (user) {
        redirect("/dashboard");
    }

    return (
        <main
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem",
                textAlign: "center",
            }}
        >
            {/* Hero Section */}
            <div
                className="animate-fade-in-up"
                style={{
                    maxWidth: "640px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "2rem",
                }}
            >
                {/* Logo */}
                <div
                    style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "1.25rem",
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "2.5rem",
                        boxShadow: "0 8px 32px rgba(99, 102, 241, 0.3)",
                    }}
                >
                    🔖
                </div>

                <div>
                    <h1
                        style={{
                            fontSize: "3.5rem",
                            fontWeight: 800,
                            lineHeight: 1.1,
                            marginBottom: "1rem",
                        }}
                    >
                        <span className="gradient-text">Smart</span> Bookmark
                    </h1>
                    <p
                        style={{
                            fontSize: "1.2rem",
                            color: "var(--color-text-secondary)",
                            lineHeight: 1.6,
                            maxWidth: "480px",
                            margin: "0 auto",
                        }}
                    >
                        Save, organize, and access your bookmarks from anywhere. Real-time
                        sync across all your devices.
                    </p>
                </div>

                {/* Features */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "1rem",
                        width: "100%",
                        marginTop: "0.5rem",
                    }}
                >
                    {[
                        { icon: "🔒", label: "Private & Secure" },
                        { icon: "⚡", label: "Real-time Sync" },
                        { icon: "🌐", label: "Access Anywhere" },
                    ].map((feature) => (
                        <div
                            key={feature.label}
                            className="glass-card"
                            style={{
                                padding: "1.25rem 1rem",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "0.5rem",
                            }}
                        >
                            <span style={{ fontSize: "1.5rem" }}>{feature.icon}</span>
                            <span
                                style={{
                                    fontSize: "0.85rem",
                                    color: "var(--color-text-secondary)",
                                    fontWeight: 500,
                                }}
                            >
                                {feature.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Sign In */}
                <AuthButton />

                <p
                    style={{
                        fontSize: "0.8rem",
                        color: "var(--color-text-muted)",
                        marginTop: "-0.5rem",
                    }}
                >
                    Sign in with your Google account to get started — it&#39;s free!
                </p>
            </div>
        </main>
    );
}
