import { Bot } from "lucide-react";
import { type Metadata } from "next";
import { Audiowide, Roboto } from "next/font/google";
import Link from "next/link";
import MovieAIAgent from "~/components/movie-ai-agent";
import { Button } from "~/components/ui/button";
import { Toaster } from "~/components/ui/sonner";
import { TooltipProvider } from "~/components/ui/tooltip";
import "~/styles/globals.css";
import { TRPCReactProvider } from "~/trpc/react";

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
    <html lang="en" className={`dark ${roboto.variable} ${audiowide.variable}`}>
      <body>
        <TooltipProvider>
          <TRPCReactProvider>
            <main className="bg-background min-h-screen">
              <nav className="inline-flex w-full items-center justify-between border-b-2 p-2">
                <Link href="/">
                  <h1 className="font-display text-center text-2xl font-bold tracking-tight uppercase md:text-left">
                    VideoStore
                  </h1>
                </Link>
                <span className="inline-flex items-center gap-2">
                  <Button variant="ghost" className="hover:bg-muted/50" asChild>
                    <Link href="/admin">Admin Dashboard</Link>
                  </Button>
                  <MovieAIAgent>
                    <Button
                      variant="outline"
                      size={"icon"}
                      className="absolute right-4 bottom-4 md:relative md:right-0 md:bottom-0"
                    >
                      <Bot className="size-4" />
                    </Button>
                  </MovieAIAgent>
                </span>
              </nav>
              {children}
              <Toaster richColors position="top-center" />
            </main>
          </TRPCReactProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
