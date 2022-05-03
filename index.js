const { config } = require('dotenv');
config();

const express = require('express');
const { ethers } = require('ethers');
const { web3Config } = require('./config');
const abi = require('./abi.json');
const { getNonCommonCountByTokenIds } = require('./metadata-repo');

const rpcProvider = new ethers.providers.JsonRpcProvider(web3Config.rpcUrl);
const nftContract = new ethers.Contract(web3Config.contractAddress, abi, rpcProvider);

const app = express();
app.use(express.json());
app.post('/verify', async (req, res) => {
    try {
        const { address, signature } = req.body;
        const tokensOfOwner = await nftContract.tokensOfOwner(address);
        const tokens = tokensOfOwner.map(t => t.toNumber());
        const stringifiedTokensOfOwner = JSON.stringify(tokens);
        const signerAddr = await ethers.utils.verifyMessage(stringifiedTokensOfOwner, signature);
        if (signerAddr !== address) {
            return res.status(403).json({ error: 'signature verification failed' });
        };
    
        const rareTokenCount = getNonCommonCountByTokenIds(tokens);
        if (rareTokenCount === 0) {
            return res.status(403).json({ error: 'forbidden for verification' });
        };
    
        const wallet = new ethers.Wallet(web3Config.privateKey);
        const newSignature = await wallet.signMessage(stringifiedTokensOfOwner);
        return res.status(200).json({ 
            signature: newSignature
        });
    } catch (e) {
        console.error(e.message);
        return res.status(500).json({ error: 'internal server error' });
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Listening to port ${process.env.PORT}`);
});