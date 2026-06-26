import axios from "axios";

const PROXY = "/api/txline";

// Step 1: Get a guest JWT from TxLINE
export async function getGuestJwt(): Promise<string> {
  const response = await axios.post(PROXY, {
    endpoint: "/auth/guest/start",
    body: {},
  });
  return response.data.token;
}

// Step 2: Activate API token after on-chain subscription
export async function activateApiToken(
  txSig: string,
  walletSignature: string,
  jwt: string
): Promise<string> {
  const response = await axios.post(PROXY, {
    endpoint: "/api/token/activate",
    jwt,
    body: {
      txSig,
      walletSignature,
      leagues: [],
    },
  });
  return response.data.token || response.data;
}

// Step 3: Fetch live fixtures
export async function getFixtures(jwt: string, apiToken: string) {
  const response = await axios.get(PROXY, {
    params: {
      endpoint: "/api/fixtures/snapshot",
      jwt,
      apiToken,
    },
  });
  return response.data;
}