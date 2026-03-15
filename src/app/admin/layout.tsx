import "~/styles/globals.css";

import { type Metadata } from "next";
import { Audiowide, Roboto } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { TooltipProvider } from "~/components/ui/tooltip";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import { AdminSidebar } from "./_components/admin-sidebar";

export const metadata: Metadata = {
  title: "Video Store",
  description: "",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
});

const audiowide = Audiowide({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-audiowide",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${roboto.variable} ${audiowide.variable}`}>
      <body>
        <TooltipProvider>
          <TRPCReactProvider>
            <main className="bg-chart-1/25 min-h-screen">
              <nav className="bg-background/50 sticky top-0 z-10 inline-grid w-full grid-cols-2 items-center border-b px-4 py-3 backdrop-blur md:px-8">
                <Link href="/admin">
                  <h1 className="font-display text-2xl font-bold tracking-tight uppercase">
                    VideoStore
                  </h1>
                </Link>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" className="hover:bg-muted/50" asChild>
                    <Link href="/">View Store</Link>
                  </Button>
                </div>
              </nav>
              <SidebarProvider defaultOpen={false}>
                <AdminSidebar />
                <SidebarTrigger className="hidden md:block" />
                {children}
              </SidebarProvider>
            </main>
          </TRPCReactProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
