# Relayer for Shielding Cash [![build](https://github.com/shieldingcash/shielding-relayer/actions/workflows/build.yml/badge.svg)](https://github.com/shieldingcash/shielding-relayer/actions/workflows/build.yml)

## Deploy with docker-compose

1. Download [docker-compose.yml](/docker-compose-test.yml) and [.env.example](/.env.example)

```
wget https://github.com/shieldingcash/shielding-relayer/blob/main/.env.example -O .env
wget https://github.com/shieldingcash/shielding-relayer/blob/main/docker-compose-test.yml -O docker-compose.yml

```

2. Setup environment variables

- set `NET_ID` (199 for bttc mainnet, 1029 for bttc Donau testnet)
- set `HTTP_RPC_URL` rpc url for your bttc node or trongrid site
- set `PRIVATE_KEY` for your relayer address (without 0x prefix)
- set `REGULAR_SHIELDING_WITHDRAW_FEE` - fee in % that is used for shieldingcash pool withdrawals
- set `ADMIN_USER` - dashboard's username
- set `ADMIN_PASSWORD` - dashboard's password
- update `CONFIRMATIONS` if needed - how many block confirmations to wait before processing an event. Not recommended to set less than 3
- update `MAX_GAS_PRICE` if needed - maximum value of gwei value for relayer's transaction
- update `BASE_FEE_RESERVE_PERCENTAGE` if needed - how much in % will the network baseFee increase
- set `VIRTUAL_HOST` to your domain and add DNS record pointing to your relayer ip address

3. Run `docker-compose up -d`

4. Run `docker-compose logs -f` to view run logs
