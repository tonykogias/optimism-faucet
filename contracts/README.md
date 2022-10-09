# Optimism Faucet Contracts

## About

Optimism Faucet is a simple faucet that drips Ether and DAI Stablecoin to a recipient.

It enables a super operator to drip and drain to a recipient, add approved operators, or update the super operator. Approved operators can only drip to a recipient. Also it prevents to drip a user that has already dripped the past 24 hours based on users github id.

## Installing the toolkit

The project uses [foundry](https://github.com/gakonst/foundry) to run tests, build and deploy the smart contracts. If you don't have foundry already installed, you will need to run the commands bellow:

First run the command below to get `foundryup`, the Foundry toolchain installer:

```sh
curl -L https://foundry.paradigm.xyz | bash
```

Then, in a new terminal session or after reloading your `PATH`, run it to get
the latest `forge` and `cast` binaries:

```sh
foundryup
```

## Build and Test

```bash
# Init submodules
git submodule update --init --recursive
# Compile contracts
forge build
# Run tests
forge test
# Deploy contracts to OP Goerli
forge create --rpc-url <your_rpc_url> --private-key <your_private_key> src/OptimismFaucet.sol:OptimismFaucet

```
