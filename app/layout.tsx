import type { Metadata } from "next";
// import localFont from "next/font/local"; // Skipping local fonts to minimize asset issues
import "./globals.css";

export const metadata: Metadata = {
    title: "SplitIt",
    description: "A simple expense splitting app",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className="antialiased"
            >
                {children}
            </body>
        </html>
    );
}
