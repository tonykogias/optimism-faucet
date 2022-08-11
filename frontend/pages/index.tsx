/* External Imports */
import { ethers } from "ethers";
import axios from "axios";
import { toast } from "react-toastify";
import { useState } from "react";
import Image from "next/image";
import { signIn, getSession, signOut } from "next-auth/react";

/* Internal Imports */
import Layout from "components/Layout";
import styles from "styles/Home.module.scss";
import InfoTooltip from "components/InfoTooltip";

/**
 * Check if a provided address is valid
 * @param {string} address to check
 * @returns {boolean} validity
 */
export function isValidAddress(address: string): boolean {
  try {
    // Check if address is valid + checksum match
    ethers.utils.getAddress(address);
  } catch (e) {
    // If not, return false
    return false;
  }

  // Else, return true
  return true;
}

export default function Home({ session }: any) {
  // Claim address
  const [address, setAddress] = useState<string>("");
  // Loading status
  const [loading, setLoading] = useState<boolean>(false);
  // Claim Kovan
  const [claimKovan, setClaimKovan] = useState<boolean>(false);

  /**
   * Processes a claim to the faucet
   */
  const processClaim = async () => {
    // Toggle loading
    setLoading(true);

    try {
      // Post new claim with recipient address
      await axios.post("/api/claim/claim", { address, isClaimKovan: claimKovan});
      // Toast if success + toggle claimed
      toast.success("Tokens dispersed—check balances!", {
        theme: "colored",
      });
    } catch (error: any) {
      // If error, toast error message
      toast.error(error.response.data.error, {
        theme: "colored",
      });
    }

    // Toggle loading
    setLoading(false);
  };

  return (
    <Layout>
      <div className={styles.home__cta}>
        <div className={styles.home__title}>
          <Image alt="logo" src="/faucet-op.png" height="80px" width="95px" />
          <h1>Optimism Goerli Faucet</h1>
        </div>
        <span>
          Fund your wallet with 0.2 ETH and 100 OP on the Optimism Goerli network.
        </span>
      </div>
      <div className={styles.home__card}>
        <div className={styles.home__card_title}>
          <h3>Request Tokens</h3>
        </div>
        <div className={styles.home__card_content}>
          {!session ? (
            <div className={styles.content__unauthenticated}>
              <p>
                To prevent faucet botting <InfoTooltip /> , you must sign in
                with Github. We request{" "}
                <a
                  href="https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  read-only
                </a>{" "}
                access. You can find the smart contract and source code{" "}
                <a
                  href="https://github.com/tonykogias/optimism-faucet"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  here.
                </a>
              </p>
              <button
                className={styles.button__main}
                onClick={() => signIn("github")}
              >
                Sign In with Github
              </button>
            </div>
          ) : (
            <div className={styles.content__authenticated}>
              <div className={styles.content__unclaimed}>
                {/* Claim description */}
                <p>Enter your Ethereum address to receive tokens:</p>

                {/* Address input */}
                <input
                  type="text"
                  placeholder="0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />

                {/* Kovan checkbox */}
                <div className={styles.content__unclaimed_kovan}>
                  <input
                    type="checkbox"
                    value={claimKovan.toString()}
                    onChange={() => setClaimKovan((previous) => !previous)}
                  />
                  <label>
                    Fund your wallet on Optimism Kovan
                  </label>
                </div>

                {isValidAddress(address) ? (
                  <button
                    className={styles.button__main}
                    onClick={processClaim}
                    disabled={loading}
                  >
                    {!loading ? "Claim" : "Claiming..."}
                  </button>
                ) : (
                  <button className={styles.button__main} disabled>
                    {address === "" ? "Enter Valid Address" : "Invalid Address"}
                  </button>
                )}
              </div>
              {/* General among claimed or unclaimed, allow signing out */}
              <div className={styles.content__github}>
                <button onClick={() => signOut(session)}>
                  Sign out @{session.github_name}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className={styles.home__card}>
        <div className={styles.home__card_title}>
          <h3>Faucet Details</h3>
        </div>
        <div className={styles.home__card_content}>
          <h4>Github Authentication</h4>
          <p>To pass the anti-bot checks your github account must be older than 1 month and have more than 5 followings.</p>
          <hr className={styles.home__card_details_hr}/>
          <h4>Optimism Kovan Support</h4>
          <p>Optimism Kovan is being{" "} 
            <a
               href="https://dev.optimism.io/kovan-to-goerli/"
               target="_blank"
               rel="noopener noreferrer"
            >
              deprecated
            </a>, and the faucet migrated to Goerli. The faucet will keep providing ETH and DAI for Kovan until it runs out.</p>
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context: any) {
  return {
    props: {
      session: await getSession(context),
    },
  };
}
