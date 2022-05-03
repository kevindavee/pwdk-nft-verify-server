const { config } = require('dotenv');
config();

const express = require('express');
const { ethers } = require('ethers');
const { web3Config } = require('./config');
const abi = require('./abi.json');

const rpcProvider = new ethers.providers.JsonRpcProvider(web3Config.rpcUrl);
const nftContract = new ethers.Contract(web3Config.contractAddress, abi, rpcProvider);

const app = express();
app.use(express.json());
app.post('/verify', async (req, res) => {
    const { address, signature } = req.body;
    const tokensOfOwner = await nftContract.tokensOfOwner(address);
    const stringifiedTokensOfOwner = JSON.stringify(tokensOfOwner.map(t => t.toNumber()));
    const signerAddr = await ethers.utils.verifyMessage(stringifiedTokensOfOwner, signature);
    if (signerAddr !== address) {
        return res.status(403).json({ error: 'signature verification failed' });
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Listening to port ${process.env.PORT}`);
});