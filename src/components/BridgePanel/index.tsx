/* eslint-disable tailwindcss/classnames-order */
import { AxelarAssetTransfer, Environment } from '@axelar-network/axelarjs-sdk';
import type { Window as KeplrWindow } from '@keplr-wallet/types';
import type { MetaMaskInpageProvider } from '@metamask/providers';
import { ethers } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import React, { useContext, useEffect, useState } from 'react';

import ERC20ABI from '@/abis/ERC20.json';
import { BridgeContext } from '@/contexts/BridgeContext';

const sdk = new AxelarAssetTransfer({
  environment: Environment.TESTNET,
  auth: 'local',
});

declare global {
  interface Window extends KeplrWindow {
    // ⚠️ notice that "Window" is capitalized here
    ethereum: MetaMaskInpageProvider;
  }
}

enum BridgeUIStep {
  'GenerateDepositAddress' = 'GenerateDepositAddress',
  'SendFromMetaMask' = 'SendFromMetaMask',
  'Success' = 'Success',
}

const useUSDCContract = () => {
  const [contract, setContract] = useState<ethers.Contract>();

  const { srcProvider } = useContext(BridgeContext);

  useEffect(() => {
    if (srcProvider) {
      setContract(
        new ethers.Contract(
          '0x526f0A95EDC3DF4CBDB7bb37d4F7Ed451dB8e369',
          ERC20ABI,
          srcProvider
        )
      );
    }
  }, [srcProvider]);

  return contract;
};

const BridgePanel = () => {
  const { srcAddr, destAddr, connectMetamask, connectKeplr } =
    useContext(BridgeContext);

  const USDCContract = useUSDCContract();

  const [availableAmount, setAvailableAmount] = useState<string>();
  useEffect(() => {
    const fetch = async () => {
      if (USDCContract) {
        const data = await USDCContract?.balanceOf(srcAddr);
        setAvailableAmount(ethers.utils.formatUnits(data, 6));
      } else {
        setAvailableAmount(undefined);
      }
    };

    fetch();
  }, [USDCContract]);

  const [typedInput, setTypedInput] = useState('');
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTypedInput(e.currentTarget.value);
  };

  const handleAutoFill = () => {
    connectKeplr?.();
  };

  const [step, setStep] = useState<BridgeUIStep>(
    BridgeUIStep.GenerateDepositAddress
  );

  const [depositAddr, setDepositAddr] = useState<string>();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateDepositAddress = async () => {
    if (destAddr) {
      setIsGenerating(true);
      setDepositAddr('');
      const res = await sdk.getDepositAddress(
        'ethereum',
        'sei',
        destAddr,
        'uausdc'
      );
      setIsGenerating(false);
      setDepositAddr(res);
      setStep(BridgeUIStep.SendFromMetaMask);
    }
  };

  const [depositTx, setDepositTx] = useState<any>();
  const handleSend = async () => {
    if (
      USDCContract &&
      depositAddr &&
      typedInput &&
      !Number.isNaN(typedInput)
    ) {
      const tx = await USDCContract.transfer(
        depositAddr,
        parseUnits(typedInput, 6)
      );
      setDepositTx(tx);
      await tx.wait();
      setDepositTx(tx);
      setStep(BridgeUIStep.Success);
    }
  };

  const [balance, setBalance] = useState<string>();
  useEffect(() => {
    const fetchBalance = async () => {
      const res = await fetch(
        `https://sei-chain-incentivized.com/sei-chain-app/cosmos/bank/v1beta1/balances/${destAddr}`
      );
      const data = await res.json();
      const b = data.balances?.find(
        (item: any) =>
          item.denom ===
          'ibc/6D45A5CD1AADE4B527E459025AC1A5AEF41AE99091EF3069F3FEAACAFCECCD21'
      )?.amount;
      if (b) setBalance(formatUnits(b, 6));
    };

    fetchBalance();
  }, [destAddr]);

  return (
    <main className="h-screen text-white">
      <div className="container h-full max-w-screen-xl px-4 mx-auto">
        <div className="grid h-full grid-cols-1 gap-10 justify-items-center lg:grid-cols-1 lg:justify-items-stretch">
          <div
            className="flex items-start justify-center"
            style={{ paddingTop: 'calc(50px + 10vh)' }}
          >
            <div
              className="z-10 h-auto min-h-[500px] w-full max-w-[550px] rounded-xl"
              style={{ backgroundColor: 'rgb(27,40,54)' }}
            >
              <div className="flex h-full min-h-[500px] flex-col space-y-5 p-8">
                <div className="">
                  <div className="">
                    <div className="flex justify-between">
                      <div className="relative w-full px-5 py-2 rounded-lg bg-neutral">
                        <div>
                          <label className="block text-xs">From</label>
                          <div className="static mt-1">
                            <div tabIndex={0}>
                              <div className="flex items-center space-x-2 text-lg font-medium cursor-pointer">
                                <span
                                  style={{
                                    boxSizing: 'border-box',
                                    display: 'k',
                                    overflow: 'hidden',
                                    width: 'initial',
                                    height: 'initial',
                                    background: 'none',
                                    opacity: 1,
                                    border: 0,
                                    margin: 0,
                                    padding: 0,
                                    position: 'relative',
                                    maxWidth: '100%',
                                  }}
                                >
                                  <span
                                    style={{
                                      boxSizing: 'border-box',
                                      display: 'block',
                                      width: 'initial',
                                      height: 'initial',
                                      background: 'none',
                                      opacity: 1,
                                      border: 0,
                                      margin: 0,
                                      padding: 0,
                                      maxWidth: '100%',
                                    }}
                                  >
                                    <img
                                      alt=""
                                      aria-hidden="true"
                                      src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2735%27%20height=%2735%27/%3e"
                                      style={{
                                        display: 'block',
                                        maxWidth: '100%',
                                        width: 'initial',
                                        height: 'initial',
                                        background: 'none',
                                        opacity: 1,
                                        border: 0,
                                        margin: 0,
                                        padding: 0,
                                      }}
                                    />
                                  </span>
                                  <img
                                    src="https://testnet.satellite.money/assets/chains/ethereum.logo.svg"
                                    decoding="async"
                                    data-nimg="intrinsic"
                                    className="token-logo"
                                    srcSet="https://testnet.satellite.money/assets/chains/ethereum.logo.svg 1x, https://testnet.satellite.money/assets/chains/ethereum.logo.svg 2x"
                                    alt=""
                                  />
                                </span>
                                <span className="capitalize">ethereum</span>
                                <div className="flex items-center">
                                  <span
                                    style={{
                                      boxSizing: 'border-box',
                                      display: 'k',
                                      overflow: 'hidden',
                                      width: 'initial',
                                      height: 'initial',
                                      background: 'none',
                                      opacity: 1,
                                      border: 0,
                                      margin: 0,
                                      padding: 0,
                                      position: 'relative',
                                      maxWidth: '100%',
                                    }}
                                  >
                                    <span
                                      style={{
                                        boxSizing: 'border-box',
                                        display: 'block',
                                        width: 'initial',
                                        height: 'initial',
                                        background: 'none',
                                        opacity: 1,
                                        border: 0,
                                        margin: 0,
                                        padding: 0,
                                        maxWidth: '100%',
                                      }}
                                    >
                                      <img
                                        alt=""
                                        aria-hidden="true"
                                        src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2725%27%20height=%2725%27/%3e"
                                        style={{
                                          display: 'block',
                                          maxWidth: '100%',
                                          width: 'initial',
                                          height: 'initial',
                                          background: 'none',
                                          opacity: 1,
                                          border: 0,
                                          margin: 0,
                                          padding: 0,
                                        }}
                                      />
                                    </span>
                                    <img
                                      src="https://testnet.satellite.money/assets/ui/arrow-down.svg"
                                      decoding="async"
                                      data-nimg="intrinsic"
                                      style={{
                                        position: 'absolute',
                                        inset: 0,
                                        boxSizing: 'border-box',
                                        padding: 0,
                                        border: 'none',
                                        margin: 'auto',
                                        display: 'block',
                                        width: 0,
                                        height: 0,
                                        minWidth: '100%',
                                        maxWidth: '100%',
                                        minHeight: '100%',
                                        maxHeight: '100%',
                                      }}
                                      srcSet="https://testnet.satellite.money/assets/ui/arrow-down.svg 1x, https://testnet.satellite.money/assets/ui/arrow-down.svg 2x"
                                      alt=""
                                    />
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="relative z-40 flex items-center -mx-2">
                        <div className="h-10 w-10 cursor-pointer rounded-xl bg-gradient-to-b from-[#00fbfb] to-[#0066ff] p-[1px]">
                          <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-b from-[#00343d] to-[#001f3f] p-2.5">
                            <div className="relative w-full h-full">
                              <span
                                style={{
                                  boxSizing: 'border-box',
                                  display: 'block',
                                  overflow: 'hidden',
                                  width: 'initial',
                                  height: 'initial',
                                  background: 'none',
                                  opacity: 1,
                                  border: 0,
                                  margin: 0,
                                  padding: 0,
                                  position: 'absolute',
                                  inset: 0,
                                }}
                              >
                                <img
                                  src="https://testnet.satellite.money/assets/ui/double-arrows.svg"
                                  decoding="async"
                                  data-nimg="fill"
                                  className="token-logo"
                                  alt=""
                                  sizes="100vw"
                                  srcSet="https://testnet.satellite.money/assets/ui/double-arrows.svg 640w, https://testnet.satellite.money/assets/ui/double-arrows.svg 750w, https://testnet.satellite.money/assets/ui/double-arrows.svg 828w, https://testnet.satellite.money/assets/ui/double-arrows.svg 1080w, https://testnet.satellite.money/assets/ui/double-arrows.svg 1200w, https://testnet.satellite.money/assets/ui/double-arrows.svg 1920w, https://testnet.satellite.money/assets/ui/double-arrows.svg 2048w, https://testnet.satellite.money/assets/ui/double-arrows.svg 3840w"
                                />
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="relative w-full px-5 py-2 rounded-lg bg-neutral">
                        <div>
                          <label className="block text-xs">To</label>
                          <div className="static mt-1 ">
                            <div tabIndex={0}>
                              <div className="flex items-center space-x-2 text-lg font-medium cursor-pointer">
                                <span
                                  style={{
                                    boxSizing: 'border-box',
                                    display: 'k',
                                    overflow: 'hidden',
                                    width: 'initial',
                                    height: 'initial',
                                    background: 'none',
                                    opacity: 1,
                                    border: 0,
                                    margin: 0,
                                    padding: 0,
                                    position: 'relative',
                                    maxWidth: '100%',
                                  }}
                                >
                                  <span
                                    style={{
                                      boxSizing: 'border-box',
                                      display: 'block',
                                      width: 'initial',
                                      height: 'initial',
                                      background: 'none',
                                      opacity: 1,
                                      border: 0,
                                      margin: 0,
                                      padding: 0,
                                      maxWidth: '100%',
                                    }}
                                  >
                                    <img
                                      alt=""
                                      aria-hidden="true"
                                      src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2735%27%20height=%2735%27/%3e"
                                      style={{
                                        display: 'block',
                                        maxWidth: '100%',
                                        width: 'initial',
                                        height: 'initial',
                                        background: 'none',
                                        opacity: 1,
                                        border: 0,
                                        margin: 0,
                                        padding: 0,
                                      }}
                                    />
                                  </span>
                                  <img
                                    src="https://testnet.satellite.money/assets/chains/sei.logo.svg"
                                    decoding="async"
                                    data-nimg="intrinsic"
                                    className="token-logo"
                                    srcSet="https://testnet.satellite.money/assets/chains/sei.logo.svg 1x, https://testnet.satellite.money/assets/chains/sei.logo.svg 2x"
                                    alt=""
                                  />
                                </span>
                                <span className="capitalize">sei</span>
                                <div className="flex items-center">
                                  <span
                                    style={{
                                      boxSizing: 'border-box',
                                      display: 'k',
                                      overflow: 'hidden',
                                      width: 'initial',
                                      height: 'initial',
                                      background: 'none',
                                      opacity: 1,
                                      border: 0,
                                      margin: 0,
                                      padding: 0,
                                      position: 'relative',
                                      maxWidth: '100%',
                                    }}
                                  >
                                    <span
                                      style={{
                                        boxSizing: 'border-box',
                                        display: 'block',
                                        width: 'initial',
                                        height: 'initial',
                                        background: 'none',
                                        opacity: 1,
                                        border: 0,
                                        margin: 0,
                                        padding: 0,
                                        maxWidth: '100%',
                                      }}
                                    >
                                      <img
                                        alt=""
                                        aria-hidden="true"
                                        src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2725%27%20height=%2725%27/%3e"
                                        style={{
                                          display: 'block',
                                          maxWidth: '100%',
                                          width: 'initial',
                                          height: 'initial',
                                          background: 'none',
                                          opacity: 1,
                                          border: 0,
                                          margin: 0,
                                          padding: 0,
                                        }}
                                      />
                                    </span>
                                    <img
                                      src="https://testnet.satellite.money/assets/ui/arrow-down.svg"
                                      decoding="async"
                                      data-nimg="intrinsic"
                                      className="token-logo"
                                      alt=""
                                      srcSet="https://testnet.satellite.money/assets/ui/arrow-down.svg 1x, https://testnet.satellite.money/assets/ui/arrow-down.svg 2x"
                                    />
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative w-full px-5 py-2 rounded-lg bg-neutral">
                  <div>
                    <div className="flex items-center justify-between h-6">
                      <label className="block text-xs">
                        I want to transfer
                      </label>
                      {/* <div>
                        <button className="btn btn-info btn-xs">Max</button>
                      </div> */}
                    </div>
                    <div className="flex justify-between mt-2">
                      <div className="">
                        <div className="">
                          <div className="static flex mt-1 ">
                            <div tabIndex={0}>
                              <div className="flex items-center space-x-2 text-lg font-medium cursor-pointer">
                                <span
                                  style={{
                                    boxSizing: 'border-box',
                                    display: 'k',
                                    overflow: 'hidden',
                                    width: 'initial',
                                    height: 'initial',
                                    background: 'none',
                                    opacity: 1,
                                    border: 0,
                                    margin: 0,
                                    padding: 0,
                                    position: 'relative',
                                    maxWidth: '100%',
                                  }}
                                >
                                  <span
                                    style={{
                                      boxSizing: 'border-box',
                                      display: 'block',
                                      width: 'initial',
                                      height: 'initial',
                                      background: 'none',
                                      opacity: 1,
                                      border: 0,
                                      margin: 0,
                                      padding: 0,
                                      maxWidth: '100%',
                                    }}
                                  >
                                    <img
                                      alt=""
                                      aria-hidden="true"
                                      src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2735%27%20height=%2735%27/%3e"
                                      style={{
                                        display: 'block',
                                        maxWidth: '100%',
                                        width: 'initial',
                                        height: 'initial',
                                        background: 'none',
                                        opacity: 1,
                                        border: 0,
                                        margin: 0,
                                        padding: 0,
                                      }}
                                    />
                                  </span>
                                  <img
                                    src="https://testnet.satellite.money/assets/tokens/uausdc.logo.svg"
                                    decoding="async"
                                    data-nimg="intrinsic"
                                    className="token-logo"
                                    srcSet="https://testnet.satellite.money/assets/tokens/uausdc.logo.svg 1x, https://testnet.satellite.money/assets/tokens/uausdc.logo.svg 2x"
                                    alt=""
                                  />
                                </span>
                                <span>aUSDC</span>
                                <div className="flex items-center">
                                  <span
                                    style={{
                                      boxSizing: 'border-box',
                                      display: 'k',
                                      overflow: 'hidden',
                                      width: 'initial',
                                      height: 'initial',
                                      background: 'none',
                                      opacity: 1,
                                      border: 0,
                                      margin: 0,
                                      padding: 0,
                                      position: 'relative',
                                      maxWidth: '100%',
                                    }}
                                  >
                                    <span
                                      style={{
                                        boxSizing: 'border-box',
                                        display: 'block',
                                        width: 'initial',
                                        height: 'initial',
                                        background: 'none',
                                        opacity: 1,
                                        border: 0,
                                        margin: 0,
                                        padding: 0,
                                        maxWidth: '100%',
                                      }}
                                    >
                                      <img
                                        alt=""
                                        aria-hidden="true"
                                        src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2725%27%20height=%2725%27/%3e"
                                        style={{
                                          display: 'block',
                                          maxWidth: '100%',
                                          width: 'initial',
                                          height: 'initial',
                                          background: 'none',
                                          opacity: 1,
                                          border: 0,
                                          margin: 0,
                                          padding: 0,
                                        }}
                                      />
                                    </span>
                                    <img
                                      src="https://testnet.satellite.money/assets/ui/arrow-down.svg"
                                      decoding="async"
                                      data-nimg="intrinsic"
                                      style={{
                                        position: 'absolute',
                                        inset: 0,
                                        boxSizing: 'border-box',
                                        padding: 0,
                                        border: 'none',
                                        margin: 'auto',
                                        display: 'block',
                                        width: 0,
                                        height: 0,
                                        minWidth: '100%',
                                        maxWidth: '100%',
                                        minHeight: '100%',
                                        maxHeight: '100%',
                                      }}
                                      srcSet="https://testnet.satellite.money/assets/ui/arrow-down.svg 1x, https://testnet.satellite.money/assets/ui/arrow-down.svg 2x"
                                      alt=""
                                    />
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="w-2/4 text-end">
                        <input
                          className="w-full text-lg font-bold text-right bg-transparent outline-none"
                          placeholder="0"
                          type="number"
                          onChange={handleInput}
                          value={typedInput}
                        />
                        {srcAddr ? (
                          <div className="flex flex-row justify-end space-x-2">
                            <span className="text-xs text-gray-500">
                              Available
                            </span>
                            <span className="w-auto text-xs text-[#86d6ff]">
                              {availableAmount}
                            </span>
                          </div>
                        ) : (
                          <label
                            onClick={connectMetamask}
                            htmlFor="web3-modal"
                            className="h-6 space-x-2 text-xs text-gray-500 cursor-pointer hover:underline"
                          >
                            Connect Metamask to see balance
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full px-5 py-2 rounded-lg bg-white/10 backdrop-blur-xl">
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span>Relayer Gas Fees:</span>
                      <span className="font-semibold">0.15 aUSDC</span>
                    </li>
                    <li className="flex justify-between ">
                      <span>Estimated wait time:</span>
                      <span className="font-semibold">~15 minutes</span>
                    </li>
                    <li className="flex justify-between ">
                      <span>Destination Address:</span>
                      <a
                        target="_blank"
                        href={`https://sei.explorers.guru/account/${destAddr}`}
                        rel="noreferrer"
                        style={{ height: '21px' }}
                      >
                        <span className="font-semibold text-primary">
                          {destAddr}
                        </span>
                      </a>
                    </li>
                    <li className="flex justify-between ">
                      <span>Axelar Deposit Address:</span>
                      <a
                        target="_blank"
                        href={`https://ropsten.etherscan.io/address/${depositAddr}`}
                        rel="noreferrer"
                        style={{ height: '21px' }}
                      >
                        <span className="font-semibold text-primary">
                          {depositAddr}
                        </span>
                      </a>
                    </li>
                    <li className="flex justify-between ">
                      <span>Deposit tx hash:</span>
                      <a
                        target="_blank"
                        href={`https://ropsten.etherscan.io/tx/${depositTx?.hash}`}
                        rel="noreferrer"
                        style={{ height: '21px' }}
                      >
                        <span className="font-semibold text-primary">
                          {depositTx?.hash}
                        </span>
                      </a>
                    </li>
                    <li className="flex justify-between ">
                      <span>USDC Balance on Sei:</span>
                      <span className="font-semibold">{balance}</span>
                    </li>
                  </ul>
                </div>
                <div className="flex h-10 gap-2 ">
                  <div className="relative w-full h-full px-5 py-2 rounded-lg bg-neutral">
                    <div className="h-full">
                      <input
                        className="w-full h-full text-xs bg-transparent outline-none"
                        placeholder="Destination address"
                        // value={destAddr}
                        defaultValue={destAddr}
                      />
                    </div>
                  </div>
                  <div className="h-full" onClick={handleAutoFill}>
                    <div className="h-full w-28 cursor-pointer rounded-lg bg-gradient-to-b from-[#9BDBFF] to-[#DA70FF] p-[1px]">
                      <div className="flex h-full w-full items-center justify-around rounded-lg bg-gradient-to-b from-[#21374b] to-[#292d4b] p-3">
                        <div className="bg-gradient-to-b from-[#9BDBFF] to-[#DA70FF] bg-clip-text text-xs font-semibold text-transparent">
                          Autofill
                        </div>
                        <div className="relative flex items-center h-full">
                          <span
                            style={{
                              boxSizing: 'border-box',
                              display: 'k',
                              overflow: 'hidden',
                              width: 'initial',
                              height: 'initial',
                              background: 'none',
                              opacity: 1,
                              border: 0,
                              margin: 0,
                              padding: 0,
                              position: 'relative',
                              maxWidth: '100%',
                            }}
                          >
                            <span
                              style={{
                                boxSizing: 'border-box',
                                display: 'block',
                                width: 'initial',
                                height: 'initial',
                                background: 'none',
                                opacity: 1,
                                border: 0,
                                margin: 0,
                                padding: 0,
                                maxWidth: '100%',
                              }}
                            >
                              <img
                                alt=""
                                aria-hidden="true"
                                src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2720%27%20height=%2720%27/%3e"
                                style={{
                                  display: 'block',
                                  maxWidth: '100%',
                                  width: 'initial',
                                  height: 'initial',
                                  background: 'none',
                                  opacity: 1,
                                  border: 0,
                                  margin: 0,
                                  padding: 0,
                                }}
                              />
                            </span>
                            <img
                              alt=""
                              srcSet="https://testnet.satellite.money/assets/wallets/kepler.logo.svg 1x, https://testnet.satellite.money/assets/wallets/kepler.logo.svg 2x"
                              src="https://testnet.satellite.money/assets/wallets/kepler.logo.svg"
                              decoding="async"
                              data-nimg="intrinsic"
                              className="token-logo"
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="z-0 pt-2">
                  <div className="relative w-full h-auto px-5 py-2 rounded-lg bg-neutral">
                    <div className="h-full space-x-2">
                      <div className="flex flex-col w-full h-full">
                        <div className="h-full">
                          {/* progress */}
                          <div className="grid items-center grid-cols-5 mt-2 text-xs font-medium justify-items-center">
                            <div
                              className={`flex h-6 w-6 items-center justify-center rounded-full bg-primary`}
                            >
                              1
                            </div>
                            <progress className="h-1" value={1} />
                            <div
                              className={`flex h-6 w-6 items-center justify-center rounded-full bg-primary ${
                                step === BridgeUIStep.GenerateDepositAddress &&
                                'opacity-50'
                              }`}
                            >
                              2
                            </div>
                            <progress className="h-1" value={1} />
                            <div
                              className={`flex h-6 w-6 items-center justify-center rounded-full bg-primary opacity-50 ${
                                (step === BridgeUIStep.GenerateDepositAddress ||
                                  step === BridgeUIStep.SendFromMetaMask) &&
                                'opacity-50'
                              }`}
                            >
                              3
                            </div>
                          </div>

                          {step === BridgeUIStep.GenerateDepositAddress && (
                            <div className="flex items-center justify-center my-4">
                              {isGenerating ? (
                                <div>Generating deposit address...</div>
                              ) : (
                                <button
                                  onClick={generateDepositAddress}
                                  className="btn btn-primary"
                                >
                                  <div className="flex items-center gap-3">
                                    <span>Generate Deposit Address</span>
                                  </div>
                                </button>
                              )}
                            </div>
                          )}

                          {step === BridgeUIStep.SendFromMetaMask && (
                            <div>
                              <div className="flex items-center justify-center py-4 text-sm gap-x-2">
                                <div>
                                  <label className="block text-center">
                                    <div>
                                      <div>
                                        Please transfer{' '}
                                        <strong>&gt;0.15 aUSDC</strong> on
                                        ethereum to
                                      </div>
                                    </div>
                                  </label>
                                  <div className="flex justify-center font-bold gap-x-2">
                                    <div className="text-primary">
                                      {depositAddr}
                                    </div>
                                    <div className="cursor-pointer">
                                      <span
                                        style={{
                                          boxSizing: 'border-box',
                                          display: 'k',
                                          overflow: 'hidden',
                                          width: 'initial',
                                          height: 'initial',
                                          background: 'none',
                                          opacity: 1,
                                          border: 0,
                                          margin: 0,
                                          padding: 0,
                                          position: 'relative',
                                          maxWidth: '100%',
                                        }}
                                      >
                                        <span
                                          style={{
                                            boxSizing: 'border-box',
                                            display: 'block',
                                            width: 'initial',
                                            height: 'initial',
                                            background: 'none',
                                            opacity: 1,
                                            border: 0,
                                            margin: 0,
                                            padding: 0,
                                            maxWidth: '100%',
                                          }}
                                        >
                                          <img
                                            alt=""
                                            aria-hidden="true"
                                            src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2716%27%20height=%2716%27/%3e"
                                            style={{
                                              display: 'block',
                                              maxWidth: '100%',
                                              width: 'initial',
                                              height: 'initial',
                                              background: 'none',
                                              opacity: 1,
                                              border: 0,
                                              margin: 0,
                                              padding: 0,
                                            }}
                                          />
                                        </span>
                                        <img
                                          srcSet="https://testnet.satellite.money/assets/ui/copy.svg 1x, https://testnet.satellite.money/assets/ui/copy.svg 2x"
                                          src="https://testnet.satellite.money/assets/ui/copy.svg"
                                          decoding="async"
                                          data-nimg="intrinsic"
                                          className="token-logo"
                                          alt=""
                                        />
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <div className="flex items-center justify-center mb-4">
                                  OR
                                </div>
                                <div className="flex justify-center">
                                  <button
                                    className="mb-5 btn btn-primary"
                                    onClick={handleSend}
                                  >
                                    <span className="mr-2">
                                      Send From Metamask
                                    </span>
                                    <div className="flex justify-center my-2 gap-x-5">
                                      <span
                                        style={{
                                          boxSizing: 'border-box',
                                          display: 'k',
                                          overflow: 'hidden',
                                          width: 'initial',
                                          height: 'initial',
                                          background: 'none',
                                          opacity: 1,
                                          border: 0,
                                          margin: 0,
                                          padding: 0,
                                          position: 'relative',
                                          maxWidth: '100%',
                                        }}
                                      >
                                        <span
                                          style={{
                                            boxSizing: 'border-box',
                                            display: 'block',
                                            width: 'initial',
                                            height: 'initial',
                                            background: 'none',
                                            opacity: 1,
                                            border: 0,
                                            margin: 0,
                                            padding: 0,
                                            maxWidth: '100%',
                                          }}
                                        >
                                          <img
                                            alt=""
                                            aria-hidden="true"
                                            src="data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2730%27%20height=%2730%27/%3e"
                                            style={{
                                              display: 'block',
                                              maxWidth: '100%',
                                              width: 'initial',
                                              height: 'initial',
                                              background: 'none',
                                              opacity: 1,
                                              border: 0,
                                              margin: 0,
                                              padding: 0,
                                            }}
                                          />
                                        </span>
                                        <img
                                          srcSet="https://testnet.satellite.money/assets/wallets/metamask.logo.svg 1x, https://testnet.satellite.money/assets/wallets/metamask.logo.svg 2x"
                                          src="https://testnet.satellite.money/assets/wallets/metamask.logo.svg"
                                          decoding="async"
                                          data-nimg="intrinsic"
                                          className="token-logo"
                                          alt=""
                                        />
                                      </span>
                                    </div>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {step === BridgeUIStep.Success && (
                            <div className="flex items-center justify-center my-4">
                              <div>Please wait...</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default BridgePanel;
