import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Smart Bookmark — Save, Organize, Access Anywhere",
    description:
        "A real-time bookmark manager. Sign in with Google, save your bookmarks, and access them from any device instantly.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>
                {/* Background gradient orbs */}
                <div className="bg-orb bg-orb-1" />
                <div className="bg-orb bg-orb-2" />

                <div className="relative z-1">{children}</div>
            </body>
        </html>
    );
}
