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
            className="glass-card animate-fade-in-up p-8 mb-10"
            style={{ animationDelay: "0.1s" }}
        >
            <h2 className="text-lg font-semibold mb-4 text-text-primary">
                ✨ Add New Bookmark
            </h2>

            <div className="flex gap-3 flex-wrap">
                <input
                    type="text"
                    placeholder="Bookmark title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-field flex-1 min-w-[180px]"
                    disabled={loading}
                />
                <input
                    type="text"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="input-field flex-2 min-w-[250px]"
                    disabled={loading}
                />
                <button
                    type="submit"
                    className="btn-gradient whitespace-nowrap"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Adding...
                        </>
                    ) : (
                        <>+ Add Bookmark</>
                    )}
                </button>
            </div>

            {error && (
                <p className="text-danger text-sm mt-3">
                    {error}
                </p>
            )}
        </form>
    );
}
