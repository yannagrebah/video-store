import "~/styles/globals.css";

import { type Metadata } from "next";
import { Audiowide, Roboto } from "next/font/google";

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
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
