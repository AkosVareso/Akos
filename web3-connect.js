
const connectButton = document.getElementById('actionBtn');


const getSolanaProvider = () => {
    // Standard and custom Solana wallet detection with priority
    if (typeof window !== 'undefined') {
        // Phantom (standard injected object)
        if (window.phantom?.solana?.isPhantom) {
            return window.phantom.solana;
        }
        // Standard Solana object (Phantom, Backpack, etc.)
        if (window.solana && window.solana.isPhantom) {
            return window.solana;
        }
        // Solflare
        if (window.solflare?.isSolflare) {
            return window.solflare;
        }
        // Generic fallback
        if (window.solana) {
            return window.solana;
        }
        // Legacy or custom providers
        if (window.solanaHub) {
            return window.solanaHub;
        }
    }
    return null;
};

connectButton.addEventListener('click', async () => {
    const provider = getSolanaProvider();
    
    if (!provider) {
        alert('No Solana wallet detected! Please install Phantom, Solflare, or another Solana-compatible wallet.');
        return;
    }

    try {
        // Ensure the provider is connected
        if (!provider.isConnected) {
            await provider.connect();
        }
        
        const publicKey = provider.publicKey;
        if (!publicKey) {
            throw new Error('Could not retrieve public key from wallet.');
        }
        
        const address = publicKey.toString();
        connectButton.textContent = `Connected: ${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
        console.log('Connected wallet address:', address);
        
        // Optional: Dispatch a custom event for other parts of your app
        window.dispatchEvent(new CustomEvent('walletConnected', { detail: { address } }));
        
    } catch (error) {
        console.error('Wallet connection failed:', error);
        if (error.code === 4001) {
            alert('Connection was rejected by the user.');
        } else {
            alert('Failed to connect wallet. Please try again.');
        }
        connectButton.textContent = 'Connect Wallet';
    }
}); 