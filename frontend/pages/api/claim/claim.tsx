/* External Imports */
import { ethers } from "ethers"; // Ethers
import { getSession } from "next-auth/react";
import type { NextApiRequest, NextApiResponse } from "next"; 

/* Internal Imports */
import { isValidAddress } from "pages/index";

// Setup faucet interface
const iface = new ethers.utils.Interface([
	"function drip(address _recipient) external",
]);

// Generates tx input data for drip claim
function generateTxData(recipient: string): string {
	// Encode address for drip function
	return iface.encodeFunctionData("drip", [recipient]);
}

async function processDrip(
  wallet: ethers.Wallet,
  data: string
): Promise<void> {
  // Collect provider
  const provider = new ethers.providers.StaticJsonRpcProvider(process.env.INFURA_OP_KOVAN_RPC_URL);
  // Connect wallet to network
  const rpcWallet = wallet.connect(provider);
  // Collect nonce for network
  const nonce = await provider.getTransactionCount(
      // Collect nonce for operator
      process.env.OPERATOR_PUBLIC_ADDRESS ?? ""
    );
  // Collect gas price * 2 for network
  const gasPrice = (await provider.getGasPrice()).mul(2);

  // Return populated transaction
  try {
    await rpcWallet.sendTransaction({
      to: process.env.FAUCET_ADDRESS ?? "",
      from: wallet.address,
      gasPrice,
      // Custom gas override for Arbitrum w/ min gas limit
      gasLimit: 500_000,
      data,
      nonce,
      type: 0,
    });
  } catch (e) {
    console.log(e);
    throw new Error("Error when processing drip for network.");
  }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const session: any = await getSession({ req });
	// Collect address
	const { address }: string = req.body;

	if (!session) {
		// Return unauthed status
		return res.status(401).send({ error: "Not authenticated." });
	}

	// Anti-bot checks
	const ONE_MONTH_SECONDS = 2629746;
	if (
		session.github_following < 5 ||
		// Less than 1 month old
		new Date().getTime() - Date.parse(session.github_created_at).getTime() < ONE_MONTH_SECONDS
	) {
		// Return invalid Github account status
		return res
		  .status(400)
		  .send({ error: "Github account does not pass anti-bot checks." });
	}

	if (!address || !isValidAddress(address)) {
		// Return invalid address status
		return res.status(400).send({ error: "Invalid address." });
	}

  	let addr: string = address;
	const wallet = new ethers.Wallet(process.env.OPERATOR_PRIVATE_KEY ?? "");

	// Generate transaction data
	const data: string = generateTxData(addr);

	try {
    	// Process faucet claims
		await processDrip(wallet, data);
    } catch (e) {
		// If error in process, revert
		return res
			.status(500)
			.send({ error: "Error fully claiming, try again in 15 minutes." });
    }

    return res.status(200).send({ claimed: address });
}