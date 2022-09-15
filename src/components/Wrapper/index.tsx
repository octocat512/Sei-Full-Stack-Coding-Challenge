/* eslint-disable no-alert */
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';

import { BridgeContext } from '@/contexts/BridgeContext';

const conKeplr = (() => {
  const chainName = 'SEI Testnet';
  const chainId = 'atlantic-1';
  const lcdURL = 'https://sei-chain-incentivized.com/sei-chain-app';
  const tendermintURL = 'https://sei-chain-incentivized.com/sei-chain-tm/';

  return async (
    chainIdInput = chainId,
    chainNameInput = chainName,
    restUrl = lcdURL,
    rpcUrl = tendermintURL
  ) => {
    if (!window.getOfflineSigner || !window.keplr) {
      alert('Keplr Wallet not detected, please install extension');
      return {
        accounts: null,
      };
    }
    if (!window.keplr.experimentalSuggestChain) {
      alert(
        'Please use latest version of the Keplr extension to access experimental features'
      );
    }

    const prefix = 'sei';
    try {
      await window.keplr.experimentalSuggestChain({
        chainId: chainIdInput,
        chainName: chainNameInput,
        rpc: rpcUrl,
        rest: restUrl,
        bip44: {
          coinType: 118,
        },
        bech32Config: {
          bech32PrefixAccAddr: prefix,
          bech32PrefixAccPub: `${prefix}pub`,
          bech32PrefixValAddr: `${prefix}valoper`,
          bech32PrefixValPub: `${prefix}valoperpub`,
          bech32PrefixConsAddr: `${prefix}valcons`,
          bech32PrefixConsPub: `${prefix}valconspub`,
        },
        currencies: [
          {
            coinDenom: 'SEI',
            coinMinimalDenom: 'usei',
            coinDecimals: 6,
          },
          {
            coinDenom: 'USDC',
            coinMinimalDenom: 'uusdc',
            coinDecimals: 6,
            coinGeckoId: 'usd-coin',
          },
          {
            coinDenom: 'ATOM',
            coinMinimalDenom: 'uatom',
            coinDecimals: 6,
            coinGeckoId: 'cosmos',
          },
          {
            coinDenom: 'WETH',
            coinMinimalDenom:
              'ibc/C2A89D98873BB55B62CE86700DFACA646EC80352E8D03CC6CF34DD44E46DC75D',
            coinDecimals: 18,
            coinGeckoId: 'weth',
          },
          {
            coinDenom: 'WBTC',
            coinMinimalDenom:
              'ibc/42BCC21A2B784E813F8878739FD32B4AA2D0A68CAD94F4C88B9EA98609AB0CCD',
            coinDecimals: 8,
            coinGeckoId: 'bitcoin',
          },
          {
            coinDenom: 'aUSDC',
            coinMinimalDenom:
              'ibc/6D45A5CD1AADE4B527E459025AC1A5AEF41AE99091EF3069F3FEAACAFCECCD21',
            coinDecimals: 6,
            coinGeckoId: 'usd-coin',
          },
        ],
        feeCurrencies: [
          {
            coinDenom: 'SEI',
            coinMinimalDenom: 'usei',
            coinDecimals: 6,
          },
        ],
        stakeCurrency: {
          coinDenom: 'SEI',
          coinMinimalDenom: 'usei',
          coinDecimals: 6,
        },
        coinType: 118,
        features: ['stargate', 'ibc-transfer', 'cosmwasm'],
      });
    } catch {
      alert('Failed to suggest the chain');
    }

    await window.keplr.enable(chainId);

    const sendingSigner = window.keplr.getOfflineSigner(chainId);
    if (!sendingSigner)
      throw new Error(`Failed to get sendingSigner for ${chainId}`);

    const accounts = await sendingSigner.getAccounts();

    return { accounts, signer: sendingSigner };
  };
})();

const conMetaMask = (() => {
  const chainId = 3;

  return async () => {
    if (!window.ethereum) {
      alert('Keplr Wallet not detected, please install extension');
      return {
        accounts: null,
      };
    }

    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    const provider = new ethers.providers.Web3Provider(
      window.ethereum as any,
      'any'
    );

    const t = await window.ethereum.request({ method: 'eth_chainId' });
    if (t !== chainId) {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    }

    return { accounts, signer: provider.getSigner() };
  };
})();

const ethProvider = ethers.getDefaultProvider(3);

const Wrapper = ({ children }: { children: any }) => {
  const [srcAddr, setSrcAddr] = useState<string>();
  const [srcProvider, setSrcProvider] = useState<any | null>(null);
  const [srcBlockNumber, setSrcBlockNumber] = useState(0);

  const [destAddr, setDestAddr] = useState<string>();
  const [destProvider, setDestProvider] = useState<any | null>(null);

  const connectMetamask = async () => {
    const { accounts, signer } = await conMetaMask();
    setSrcAddr((accounts as any)?.[0]);
    setSrcProvider(signer);
  };

  const connectKeplr = async () => {
    const { accounts, signer } = await conKeplr();
    setDestAddr(accounts?.[0]?.address);
    setDestProvider(signer);
  };

  useEffect(() => {
    const handleBlockNumber = (t: number) => {
      setSrcBlockNumber(t);
    };
    ethProvider.on('block', handleBlockNumber);

    return () => {
      ethProvider.off('block', handleBlockNumber);
    };
  }, []);

  return (
    <BridgeContext.Provider
      value={{
        srcAddr,
        srcProvider,
        srcBlockNumber,
        destAddr,
        destProvider,
        connectMetamask,
        connectKeplr,
      }}
    >
      {children}
    </BridgeContext.Provider>
  );
};

export default Wrapper;
