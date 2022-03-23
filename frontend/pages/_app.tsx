/* External Imports */
import type { AppProps } from 'next/app'
import { SessionProvider } from "next-auth/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* Internal Imports */
import "/styles/global.scss";

export default function OPFaucet({Component, pageProps}: AppProps) {
  return (
    // Wrap app in auth session provider
    <SessionProvider session={pageProps.session}>
      {/* Toast container */}
      <ToastContainer />

      {/* Site */}
      <Component {...pageProps} />
    </SessionProvider>
  );
}
