import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Navbar from "@/components/navbar/Navbar";
import { SessionProvider } from "next-auth/react";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <>
      <SessionProvider session={session}>
        <div className="flex flex-col justify-start h-[100vh] bg-slate-300 scrollbar-hide">
          <Navbar />
          <div className="grow bg-blue-300 overflow-clip">
            <Component {...pageProps} />
          </div>
        </div>
      </SessionProvider>
    </>
  );
}
