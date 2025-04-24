const LOCAL_BACKEND_API_URL = "https://eb14-46-188-232-42.ngrok-free.app/api/v1/verify-nft";
const PRODUCTION_BACKEND_API_URL = "trench-bot-frontend-app.railway.internal/api/v1/verify-nft";

let determinedBackendApiUrl;
const hostname = window.location.hostname;

if (hostname === "localhost" || hostname === "127.0.0.1") {
    determinedBackendApiUrl = LOCAL_BACKEND_API_URL;
} else {
    determinedBackendApiUrl = PRODUCTION_BACKEND_API_URL;
}

if (determinedBackendApiUrl.includes("YOUR_") || determinedBackendApiUrl.includes("_HERE")) {
     console.error("!!! Backend API URL has not been configured in config.js !!!");
     alert("Configuration Error: Backend API URL is not set. Please contact the administrator.");
}

window.APP_CONFIG = {
    backendApiUrl: determinedBackendApiUrl,
    solanaNetwork: solanaWalletAdapterBase.WalletAdapterNetwork.MainnetBeta
};

console.log("App Config Loaded:", window.APP_CONFIG);