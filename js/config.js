// config.js - Production Focused

// --- Configuration Settings ---

// !!! IMPORTANT: Set this to the ACTUAL PUBLIC HTTPS URL of your deployed Go backend API endpoint !!!
// Example: "https://your-backend-service-name.up.railway.app/api/v1/verify-nft"
const PRODUCTION_BACKEND_API_URL = "https://trench-bot-updated-production.up.railway.app/api/v1/verify-nft"; // <-- REPLACE THIS WITH YOUR ACTUAL URL

// Solana Network ('mainnet-beta' or 'devnet')
const SOLANA_NETWORK_NAME = solanaWalletAdapterBase.WalletAdapterNetwork.MainnetBeta;

// --- End Configuration ---

// Check if the URL is still a placeholder (important safety check!)
if (PRODUCTION_BACKEND_API_URL.includes("YOUR_") || PRODUCTION_BACKEND_API_URL.includes("_HERE") || PRODUCTION_BACKEND_API_URL.includes("-xxxx")) {
     console.error("!!! Production Backend API URL has not been configured correctly in config.js !!!");
     alert("Configuration Error: Backend API URL is not set. Please contact the administrator."); // Alert user
}

// Expose configuration globally, always using the production URL
window.APP_CONFIG = {
    backendApiUrl: PRODUCTION_BACKEND_API_URL,
    solanaNetwork: SOLANA_NETWORK_NAME
};

console.log("App Config Loaded:", window.APP_CONFIG);