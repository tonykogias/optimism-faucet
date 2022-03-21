/* External Imports */
import { ethers } from "ethers";
import axios from "axios";
import { toast } from "react-toastify";
import { ReactElement, useState } from "react";
import Image from "next/image";
import { signIn, getSession, signOut } from "next-auth/react";

/* Internal Imports */
import Layout from "/components/Layout"; 
import styles from "/styles/Home.module.scss";

/**
 * Check if a provided address is valid
 * @param {string} address to check
 * @returns {boolean} validity
 */
function isValidAddress(address: string): boolean {
  try {
    // Check if address is valid + checksum match
    ethers.utils.getAddress(address);
  } catch {
    // If not, return false
    return false;
  }

  // Else, return true
  return true;
}

export default function Home(session:any) {

  // Claim address
  const [address, setAddress] = useState<string>("");
  // Loading status
  const [loading, setLoading] = useState<boolean>(false);

   /**
   * Processes a claim to the faucet
   */
  const processClaim = async () => {
    // Toggle loading
    setLoading(true);

    try {
      // Post new claim with recipient address
      await axios.post("/api/claim/claim", { address });
      // Toast if success + toggle claimed
      toast.success("Tokens dispersed—check balances shortly!");
    } catch (error: any) {
      // If error, toast error message
      toast.error(error.response.data.error);
    }

    // Toggle loading
    setLoading(false);
  };

  return (
    <Layout>
      <div className={styles.home__cta}>
        <div className={styles.home__title}>
            <Image src="/faucet-op.png" height="80px" width="95px"/>
            <h1>Optimism Kovan Faucet</h1>
        </div>
        <span>
          Fund youw wallet with 1 ETH and 100 DAI on the Optimism Kovan network.
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
                To prevent faucet botting, you must sign in with Github. We
                request{" "}
                <a
                  href="https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  read-only
                </a>{" "}
                access.
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
                      {address === ""
                        ? "Enter Valid Address"
                        : "Invalid Address"}
                    </button>
                  )}
                </div>
              {/* General among claimed or unclaimed, allow signing out */}
              <div className={styles.content__github}>
                <button onClick={() => signOut()}>
                  Sign out @{}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export async function getServerSideProps(context: any) {
  // Collect session
  const session: any = await getSession(context);
  return {
    props: {
      session
    },
  };
}
