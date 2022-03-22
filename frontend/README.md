# Frontend

## About

Frontend to accompany [Optimism-Faucet contracts](https://github.com/tonykogias/optimism-faucet/tree/master/contracts). Authenticates user with Github OAuth and calls drip function on contract.

## Run locally

In order to run the frontend locally you will need to install all the dependancies and edit the `.env.example` with the appropriate values.

```bash
# Install dependencies
yarn install

# Update environment variables
cp .env.example .env.local
vim .env.local

# Run
yarn run dev
```