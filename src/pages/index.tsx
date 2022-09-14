import type { Window as KeplrWindow } from '@keplr-wallet/types';
import type { MetaMaskInpageProvider } from '@metamask/providers';
import React from 'react';

import BridgePanel from '@/components/BridgePanel';
import Wrapper from '@/components/Wrapper';

declare global {
  interface Window extends KeplrWindow {
    // ⚠️ notice that "Window" is capitalized here
    ethereum: MetaMaskInpageProvider;
  }
}

const Index = () => {
  return (
    <Wrapper>
      <BridgePanel />
    </Wrapper>
  );
};

export default Index;
