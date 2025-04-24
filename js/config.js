// config.js - Production Focused

// --- Configuration Settings ---

// !!! Set this to the ACTUAL PUBLIC HTTPS URL of your deployed Go backend API endpoint for verification !!!
const PRODUCTION_BACKEND_API_URL = "https://trench-bot-updated-production.up.railway.app/api/v1/verify-nft"; // <-- CORRECTED URL

// Solana Network ('mainnet-beta' or 'devnet')
// Keep using WalletAdapterNetwork if possible, otherwise fallback to string
const SOLANA_NETWORK_NAME = (typeof solanaWalletAdapterBase !== 'undefined' && solanaWalletAdapterBase.WalletAdapterNetwork)
                             ? solanaWalletAdapterBase.WalletAdapterNetwork.MainnetBeta
                             : 'mainnet-beta'; // Fallback string if library isn't loaded yet

// --- End Configuration ---

// Safety check (optional but good)
if (!PRODUCTION_BACKEND_API_URL || !PRODUCTION_BACKEND_API_URL.startsWith("https://")) {
     console.error("!!! Production Backend API URL is missing, invalid, or not HTTPS in config.js !!!");
     // You might want to prevent the app from initializing fully here
     // alert("Configuration Error: Backend API URL is invalid. Please contact the administrator.");
}

// Expose configuration globally
window.APP_CONFIG = {
    backendApiUrl: PRODUCTION_BACKEND_API_URL,
    solanaNetwork: SOLANA_NETWORK_NAME
};

console.log("App Config Loaded:", window.APP_CONFIG);