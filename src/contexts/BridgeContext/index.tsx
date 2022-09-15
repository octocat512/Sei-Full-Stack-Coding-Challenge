import { createContext } from 'react';

export interface BridgeContextParams {
  srcAddr: string | undefined;
  srcProvider: any | null;
  srcBlockNumber: number;
  destAddr: string | undefined;
  destProvider: any | null;
  connectMetamask?: () => Promise<void> | null;
  connectKeplr?: () => Promise<void> | null;
}

const initialState = {
  srcAddr: undefined,
  srcProvider: null,
  srcBlockNumber: 0,
  destAddr: undefined,
  destProvider: null,
};

export const BridgeContext = createContext<BridgeContextParams>(initialState);
