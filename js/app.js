(function() {
    console.log("Main application script (app.js) starting...");

    if (!window.APP_CONFIG) {
        console.error("APP_CONFIG not loaded! Ensure config.js is included before app.js");
        alert("Critical Error: App configuration failed to load.");
        return;
    }
    const BACKEND_API_URL = window.APP_CONFIG.backendApiUrl;
    const SOLANA_NETWORK_NAME = window.APP_CONFIG.solanaNetwork;
    console.log(`Using Backend URL: ${BACKEND_API_URL}`);
    console.log(`Using Solana Network: ${SOLANA_NETWORK_NAME}`);

    let solanaConnection;
    let walletAdapters = [];
    let currentAdapter = null;
    let connectedPublicKey = null;
    let telegramUserId = null;

    const walletButtonsDiv = document.getElementById('walletButtons');
    const walletStatusEl = document.getElementById('walletStatus');
    const verifyBtn = document.getElementById('verifyBtn');
    const statusEl = document.getElementById('status');
    const disconnectBtn = document.getElementById('disconnectBtn');
    const loaderEl = document.getElementById('loader');
    const tg = window.Telegram.WebApp;

    function initializeApp() {
        console.log('initializeApp function called.');
        if (!tg) {
             console.error("Telegram WebApp script not loaded or failed.");
             handleError("Could not initialize Telegram WebApp.");
             return;
        }
        tg.ready();
        tg.expand();
        setupThemeColors();
        console.log("Telegram WebApp ready and expanded.");

         if (typeof solanaWeb3 === 'undefined' || typeof solanaWalletAdapterBase === 'undefined' || typeof solanaWalletAdapterPhantom === 'undefined' || typeof solanaWalletAdapterSolflare === 'undefined' || typeof buffer === 'undefined') {
              console.error("One or more Solana/Buffer libraries failed to load.");
              handleError("Initialization failed: Required libraries not loaded. Check console.");
              return;
         }
         console.log("Dependent libraries seem loaded.");

        try {
            if (tg.initDataUnsafe?.user?.id) {
                telegramUserId = tg.initDataUnsafe.user.id;
                console.log("Telegram User ID:", telegramUserId);
            } else {
                console.warn("Telegram User data not found in initDataUnsafe. Running outside Telegram?");
                if (!telegramUserId) {
                     handleError("Could not get Telegram User ID. Launch from Telegram.");
                     return;
                }
            }
        } catch (error) {
            handleError("Error processing Telegram user data.", error);
            return;
        }

        try {
             const endpoint = solanaWeb3.clusterApiUrl(SOLANA_NETWORK_NAME);
             console.log("Solana RPC Endpoint:", endpoint);
             solanaConnection = new solanaWeb3.Connection(endpoint);

             walletAdapters = [];
             if (typeof solanaWalletAdapterPhantom !== 'undefined' && solanaWalletAdapterPhantom.PhantomWalletAdapter) {
                 walletAdapters.push(new solanaWalletAdapterPhantom.PhantomWalletAdapter());
                 console.log("Phantom adapter instantiated.");
             } else {
                 console.warn("Phantom adapter library not loaded correctly.");
             }
             if (typeof solanaWalletAdapterSolflare !== 'undefined' && solanaWalletAdapterSolflare.SolflareWalletAdapter) {
                 walletAdapters.push(new solanaWalletAdapterSolflare.SolflareWalletAdapter());
                 console.log("Solflare adapter instantiated.");
             } else {
                  console.warn("Solflare adapter library not loaded correctly.");
             }

             console.log(`Found ${walletAdapters.length} wallet adapter types.`);
        } catch (error) {
             handleError("Error during Solana/Adapter setup.", error);
             return;
        }

        renderUI();
    }

    function renderUI() {
         console.log('Rendering UI. Connected:', !!connectedPublicKey);
        walletButtonsDiv.innerHTML = '';
        statusEl.innerHTML = '';
        loaderEl.style.display = 'none';

        if (connectedPublicKey) {
            walletStatusEl.innerHTML = `Status: Connected <br><span class="connected-wallet">${connectedPublicKey.toBase58()}</span>`;
            verifyBtn.disabled = false;
            verifyBtn.textContent = "Verify Holdings";
            disconnectBtn.style.display = 'block';
        } else {
            walletStatusEl.textContent = 'Status: Not Connected';
            verifyBtn.disabled = true;
            verifyBtn.textContent = "Verify Holdings";
            disconnectBtn.style.display = 'none';

            let buttonsAdded = 0;
            walletAdapters.forEach(adapter => {
                if (adapter && adapter.name) {
                    console.log(`Adapter available: ${adapter.name}`);
                    const button = document.createElement('button');
                    button.textContent = `Connect ${adapter.name}`;
                    button.onclick = () => connectWallet(adapter);
                    walletButtonsDiv.appendChild(button);
                    buttonsAdded++;
                } else {
                     console.warn("Skipping unrecognized adapter in list during render.");
                }
            });
             console.log(`Added ${buttonsAdded} wallet connect buttons.`);
             if (buttonsAdded === 0) {
                 walletStatusEl.textContent = 'Status: No compatible wallets detected. Please install Phantom or Solflare extension.';
             }
        }
    }

    async function connectWallet(adapter) {
         if (connectedPublicKey || !adapter) return;
         console.log(`Attempting to connect with ${adapter.name}`);
         walletStatusEl.textContent = `Status: Connecting to ${adapter.name}...`;
         walletButtonsDiv.innerHTML = '';
         verifyBtn.disabled = true;
         loaderEl.style.display = 'block';

        if (currentAdapter && currentAdapter.off) {
             currentAdapter.off('connect');
             currentAdapter.off('disconnect');
        }
         currentAdapter = adapter;

         adapter.on('connect', handleConnect);
         adapter.on('disconnect', handleDisconnect);

        try {
            await adapter.connect();
             console.log(`Connect requested for ${adapter.name}`);
        } catch (error) {
            console.error(`Failed to initiate connection with ${adapter.name}:`, error);
            handleError(`Failed to connect: ${error.message || 'Unknown error'}`, error);
            currentAdapter = null;
             renderUI();
        }
    }

    function handleConnect(publicKey) {
         if (!currentAdapter || !currentAdapter.publicKey) {
             console.error("Connect event fired but public key not found on adapter.");
             handleDisconnect();
             return;
         }
         console.log(`Wallet connected: ${currentAdapter.publicKey.toBase58()}`);
         connectedPublicKey = currentAdapter.publicKey;
         renderUI();
     }

     function handleDisconnect() {
         console.log("Wallet disconnected event.");
         if (currentAdapter && currentAdapter.off) {
              currentAdapter.off('connect', handleConnect);
              currentAdapter.off('disconnect', handleDisconnect);
         }
         connectedPublicKey = null;
         currentAdapter = null;
         renderUI();
     }

    async function disconnectWallet() {
         if (currentAdapter && currentAdapter.disconnect) {
            try {
                 console.log(`Disconnecting from ${currentAdapter.name}`);
                await currentAdapter.disconnect();
            } catch (error) {
                console.error('Error during disconnect:', error);
                handleDisconnect();
            }
        } else {
             console.log("No active adapter to disconnect.");
             handleDisconnect();
        }
    }
    disconnectBtn.onclick = disconnectWallet;


    verifyBtn.onclick = async () => {
         if (!connectedPublicKey || !telegramUserId) {
            handleError("Wallet not connected or Telegram User ID missing.");
            return;
        }

        statusEl.textContent = "Verifying NFT holdings...";
        verifyBtn.disabled = true;
        verifyBtn.textContent = "Verifying...";
        loaderEl.style.display = 'block';
        disconnectBtn.style.display = 'none';


        try {
            console.log(`Sending verification request to ${BACKEND_API_URL}`);
            const response = await fetch(BACKEND_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telegramUserId: telegramUserId,
                    walletAddress: connectedPublicKey.toBase58(),
                }),
            });

            loaderEl.style.display = 'none';
            const result = await response.json();
            console.log("Backend Response:", result);

            if (response.ok && result.success) {
                statusEl.textContent = "✅ Success! Verification complete. You can close this window.";
                statusEl.style.color = 'var(--tg-theme-text-color)';
                verifyBtn.textContent = "Verified";
                verifyBtn.disabled = true;
                setTimeout(() => { tg.close(); }, 3000);
            } else {
                let errorMsg = `❌ Verification Failed.`;
                if (result.reason === 'insufficient_nfts') {
                    errorMsg += ` You need at least ${result.required} Trench Demon NFTs.`;
                    if (result.purchaseUrl) {
                         errorMsg += ` <a href="${result.purchaseUrl}" target="_blank" style="color: var(--tg-theme-link-color);">Buy on Magic Eden</a>`;
                    }
                } else if (result.error) {
                    errorMsg += ` Error: ${result.error}`;
                } else {
                     errorMsg += ` Status: ${response.statusText}`;
                }
                statusEl.innerHTML = errorMsg;
                statusEl.style.color = 'var(--tg-theme-destructive-text-color, red)';
                verifyBtn.disabled = false;
                verifyBtn.textContent = "Retry Verification";
                disconnectBtn.style.display = 'block';
            }

        } catch (error) {
            console.error("Error calling backend API:", error);
            handleError(`Network or API error during verification: ${error.message}. Please try again.`, error);
            verifyBtn.disabled = false;
            verifyBtn.textContent = "Retry Verification";
            disconnectBtn.style.display = 'block';
            loaderEl.style.display = 'none';
        }
    };

    function handleError(message, error = null) {
        console.error(message, error);
        statusEl.textContent = message;
        statusEl.style.color = 'var(--tg-theme-destructive-text-color, red)';
        loaderEl.style.display = 'none';
         verifyBtn.disabled = true;
         if (!connectedPublicKey) {
            renderUI();
         }
    }

     function setupThemeColors() {
         console.log("Applying Telegram theme params if available...");
     }

    if (document.readyState === "loading") {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }

})();