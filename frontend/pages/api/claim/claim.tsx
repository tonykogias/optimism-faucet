/* External Imports */
import { ethers } from "ethers"; // Ethers
import { getSession } from "next-auth/react";
import type { NextApiRequest, NextApiResponse } from "next"; 

/* Internal Imports */
import { isValidAddress } from "/pages/index";

// Setup faucet interface
const iface = new ethers.utils.Interface([
	"function drip(address _recipient, string _githubid) external",
]);

// Generates tx input data for drip claim
function generateTxData(recipient: string, githubid: string): string {
	// Encode address for drip function
	return iface.encodeFunctionData("drip", [recipient, githubid]);
}

async function processDrip(
  wallet: ethers.Wallet,
  data: string
): Promise<void> {
  // Collect provider
  const provider = new ethers.providers.StaticJsonRpcProvider(process.env.OP_KOVAN_RPC_URL);
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
    const response = await rpcWallet.sendTransaction({
      to: process.env.FAUCET_ADDRESS,
      from: wallet.address,
      gasPrice,
      gasLimit: 500_000,
      data,
      nonce,
      type: 0,
    });
    await response.wait(r => console.log(r));
  } catch (e) {
    throw new Error("Error when processing drip for network.");
  }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const session: any = await getSession({ req });
	// Collect address
	const { address }: string = req.body;
	const ses = session.token.token;
	if (!session) {
		// Return unauthed status
		return res.status(401).send({ error: "Not authenticated." });
	}
	// Anti-bot checks
	const ONE_MONTH_MILISECONDS = 2629800000
	if (
		ses.github_following < 5 ||
		// Less than 1 month old
		new Date().getTime() - new Date(ses.github_created_at).getTime() < ONE_MONTH_MILISECONDS
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
	const provider = new ethers.providers.StaticJsonRpcProvider(process.env.OP_KOVAN_RPC_URL);

	// Generate transaction data
	const data: string = generateTxData(addr, ses.github_id);
	try {
    // Process faucet claims
		await processDrip(wallet, data);
  } catch (e) {
		// If error in process, revert
		const contractBalance = ethers.utils.formatEther(
			await provider.getBalance(process.env.FAUCET_ADDRESS)
		);
		if(parseFloat(contractBalance) < 1){
			return res
				.status(500)
				.send({ error: "Faucet is empty."});
		}
		return res
			.status(500)
			.send({ error: "Error while claiming." });
  }

  return res.status(200).send({ claimed: address });
}