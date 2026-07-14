import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/hooks/use-auth";
import { cookies } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: "CampusHub",
  description: "Find verified lodges, trusted agents, and student housing around FUTO.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value || "light";

  return (
    <html
      lang="en"
      className={theme === "dark" ? "dark h-full antialiased" : "h-full antialiased"}
    >
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </AuthProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
