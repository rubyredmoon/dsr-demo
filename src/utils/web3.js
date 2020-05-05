// Dai.js 
import Maker from '@makerdao/dai';
// Multi collateral DAI support
import McdPlugin, { ETH, BAT } from '@makerdao/dai-plugin-mcd';
// DS Token Contract ABI
import dsTokenAbi from './dsToken.abi.json';

let maker = null;
let web3 = null;

// Connect to the Maker using web3 provider (e.g. Metamask) from the browser
const connect = async () => {
    maker = await Maker.create('browser', {
        plugins: [
            [
                McdPlugin,
                {
                    network: 'kovan',
                    cdpTypes: [
                        { currency: ETH, ilk: 'ETH-A' },
                        { currency: BAT, ilk: 'BAT-A' },
                    ]
                }
            ]
        ]
    });
    await maker.authenticate();
    await maker.service('proxy').ensureProxy();
    return maker;
}

// Make a web3 instance
const getWeb3 = async () => {
    web3 = await maker.service('web3')._web3;
    return web3;
}

// Approve the use of proxy contract for less gas
const approveProxyInDai = async () => {
    try {
        let accounts = await web3.eth.getAccounts();
        let proxy = await maker.currentProxy();
        let daiAddress = '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa';
        const daiAbi = dsTokenAbi;
        const DAIContract = new web3.eth.Contract(daiAbi, daiAddress);
        return new Promise(async (resolve, reject) => {
            await DAIContract.methods.approve(proxy, '-1').send({ from: accounts[0] }, (error, result) => {
                if (error) {
                    console.log('error in approving DAI token', error)
                    reject(error);
                }
                console.log('result in approving DAI token', result)
                resolve(result);
            })

        })
    } catch (error) {
        console.log(error)
    }

}


export {
    getWeb3,
    connect,
    approveProxyInDai
};