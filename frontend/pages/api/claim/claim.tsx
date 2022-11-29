/* External Imports */
import { ethers } from "ethers"; // Ethers
import { getSession } from "next-auth/react";
import type { NextApiRequest, NextApiResponse } from "next";

/* Internal Imports */
import { isValidAddress } from "pages/index";

// Setup faucet interface
const iface = new ethers.utils.Interface([
  "function drip(address _recipient, string _githubid) external",
]);

// Generates tx input data for drip claim
function generateTxData(recipient: string, githubid: string): string {
  // Encode address for drip function
  return iface.encodeFunctionData("drip", [recipient, githubid]);
}

async function processDrip(wallet: ethers.Wallet, data: string): Promise<void> {
  // Collect provider
  const provider = new ethers.providers.StaticJsonRpcProvider(
    process.env.OP_GOERLI_RPC_URL
  );
  // Connect wallet to network
  const rpcWallet = wallet.connect(provider);
  // Collect nonce for network
  const nonce = await provider.getTransactionCount(
    // Collect nonce for operator
    process.env.OPERATOR_PUBLIC_ADDRESS_GOERLI ?? ""
  );
  // Collect gas price * 2 for network
  const gasPrice = (await provider.getGasPrice()).mul(2);

  // Return populated transaction
  try {
    const response = await rpcWallet.sendTransaction({
      to: process.env.FAUCET_ADDRESS_GOERLI,
      from: wallet.address,
      gasPrice,
      gasLimit: 500_000,
      data,
      nonce,
      type: 0,
    });
    await response.wait();
  } catch (e) {
    throw new Error(" have claimed in the last 24hours.");
  }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session: any = await getSession({ req });
  // Collect address
  const { address }: { address: string } = req.body;
  if (!session) {
    // Return unauthed status
    return res.status(401).send({ error: "Not authenticated." });
  }
  // Anti-bot checks
  const ONE_MONTH_MILISECONDS = 2629800000;
  if (
    // Less than 1 month old
    new Date().getTime() - new Date(session.github_created_at).getTime() < ONE_MONTH_MILISECONDS
  ) {
    // Return invalid Github account status
    return res
      .status(400)
      .send({ error: "Github anti-bot checks failed: Your must be older than 1 month" });
  }
  if (session.github_following < 5) {
    // Return invalid Github account status
    return res
      .status(400)
      .send({ error: "Github anti-bot checks failed: You need at least 5 followings" });
  }
  if (!address || !isValidAddress(address)) {
    // Return invalid address status
    return res.status(400).send({ error: "Invalid address." });
  }
  const wallet = new ethers.Wallet(process.env.OPERATOR_PRIVATE_KEY_GOERLI ?? "");
  const provider = new ethers.providers.StaticJsonRpcProvider(
    process.env.OP_GOERLI_RPC_URL
  );
  // Return error if faucet is empty.
  const contractBalance = ethers.utils.formatEther(
    await provider.getBalance(process.env.FAUCET_ADDRESS_GOERLI ?? "")
  );
  if (parseFloat(contractBalance) < 0.2) {
    return res.status(500).send({ error: "Faucet is empty." });
  }
  // Return error if the address to drip has already more than 5 ETH
  const addressBalance = ethers.utils.formatEther(
    await provider.getBalance(address ?? "")
  );
  if (parseFloat(addressBalance) > 3) {
    return res.status(500).send({ error: "Address has more than 3 ETH." });
  }
  // Generate transaction data
  const data: string = generateTxData(address, session.github_id);
  try {
    // Process faucet claims
    await processDrip(wallet, data);
  } catch (e) {
    // If error in process, revert
    return res.status(500).send({ error: `${e}` });
  }

  return res.status(200).send({ claimed: address });
};
