/* External Imports */
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { ReactElement, useState } from "react"; // Local state + types
import { signIn, getSession, signOut } from "next-auth/react"; // Auth


/* Internal Imports */

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

export default function Home({ session }: { session: any; }) {
  return (
    <div>
      
    </div>
  )
}

export async function getServerSideProps(context: any) {
  // Collect session
  const session: any = await getSession(context);

  return {
    props: {
      session,
    },
  };
}
