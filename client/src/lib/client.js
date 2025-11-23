// src/lib/client.js
import { createThirdwebClient } from "thirdweb";

export const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID,
  config: {
    analytics: false,
    tracking: { enabled: false },
  },
});
