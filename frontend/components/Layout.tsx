/* External Imports */
import { default as HTMLHead } from "next/head";

/* Internal Imports */
import styles from "/styles/Layout.module.scss";

// Page layout
export default function Layout({
  children,
}: {
  children: (JSX.Element | null)[];
}) {
  return (
    <div className={styles.layout}>
      {/* Meta + Head */}
      <Head />

      {/* Layout sizer */}
      <div className={styles.layout__content}>{children}</div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

// Head + Meta
function Head() {
  return (
    <HTMLHead>
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="true"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap"
        rel="stylesheet"
      />

      {/* Favicon */}
      <link rel="shortcut icon" href="/favicon.ico" />

      {/* Primary Meta Tags */}
      <title>Optimism Kovan Faucet</title>
      <meta
        name="title"
        content="Optimism Kovan Faucet"
      />
    </HTMLHead>
  );
}

// Footer
function Footer() {
  return (
    <div className={styles.layout__footer}>
      {/* Disclaimer */}
      <p>
        These smart contracts are being provided as is. No guarantee,
        representation or warranty is being made, express or implied, as to the
        safety or correctness of the user interface or the smart contracts. They
        have not been audited and as such there can be no assurance they will
        work as intended, and users may experience delays, failures, errors,
        omissions or loss of transmitted information. Users should proceed with
        caution and use at their own risk.
      </p>
    </div>
  );
}