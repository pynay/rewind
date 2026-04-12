import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rewind",
  description: "Review and fork AI agent session history",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          background: "#0d1117",
          color: "#f0f6fc",
          minHeight: "100vh",
          fontFamily:
            "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          margin: 0,
        }}
      >
        {children}
      </body>
    </html>
  );
}
