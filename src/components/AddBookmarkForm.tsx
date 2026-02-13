"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Bookmark } from "@/lib/types";

interface AddBookmarkFormProps {
    userId: string;
    onBookmarkAdded?: (bookmark: Bookmark) => void;
}

export default function AddBookmarkForm({ userId, onBookmarkAdded }: AddBookmarkFormProps) {
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const supabase = useMemo(() => createClient(), []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Basic validation
        if (!title.trim() || !url.trim()) {
            setError("Please fill in both title and URL.");
            return;
        }

        // URL validation
        try {
            new URL(url);
        } catch {
            setError("Please enter a valid URL (e.g., https://example.com).");
            return;
        }

        setLoading(true);
        try {
            const { data, error: insertError } = await supabase
                .from("bookmarks")
                .insert({
                    title: title.trim(),
                    url: url.trim(),
                    user_id: userId,
                })
                .select()
                .single();

            if (insertError) {
                setError(insertError.message);
            } else {
                setTitle("");
                setUrl("");
                if (data) {
                    // Broadcast to other tabs for cross-tab realtime sync
                    supabase.channel(`bookmarks-sync-${userId}`).send({
                        type: "broadcast",
                        event: "bookmark-added",
                        payload: data,
                    });
                    if (onBookmarkAdded) {
                        onBookmarkAdded(data as Bookmark);
                    }
                }
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="glass-card animate-fade-in-up"
            style={{
                padding: "1.5rem",
                marginBottom: "2rem",
                animationDelay: "0.1s",
            }}
        >
            <h2
                style={{
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    marginBottom: "1rem",
                    color: "var(--color-text-primary)",
                }}
            >
                ✨ Add New Bookmark
            </h2>

            <div
                style={{
                    display: "flex",
                    gap: "0.75rem",
                    flexWrap: "wrap",
                }}
            >
                <input
                    type="text"
                    placeholder="Bookmark title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-field"
                    style={{ flex: "1", minWidth: "180px" }}
                    disabled={loading}
                />
                <input
                    type="text"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="input-field"
                    style={{ flex: "2", minWidth: "250px" }}
                    disabled={loading}
                />
                <button
                    type="submit"
                    className="btn-gradient"
                    disabled={loading}
                    style={{ whiteSpace: "nowrap" }}
                >
                    {loading ? (
                        <>
                            <span
                                style={{
                                    display: "inline-block",
                                    width: "16px",
                                    height: "16px",
                                    border: "2px solid rgba(255,255,255,0.3)",
                                    borderTopColor: "white",
                                    borderRadius: "50%",
                                    animation: "spin 0.6s linear infinite",
                                }}
                            />
                            Adding...
                        </>
                    ) : (
                        <>+ Add Bookmark</>
                    )}
                </button>
            </div>

            {error && (
                <p
                    style={{
                        color: "var(--color-danger)",
                        fontSize: "0.85rem",
                        marginTop: "0.75rem",
                    }}
                >
                    {error}
                </p>
            )}

            <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
        </form>
    );
}
