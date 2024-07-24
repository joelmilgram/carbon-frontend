'use client';

import { Content, Theme } from '@carbon/react';
import OwlAgentHeader from './home/OwlAgentHeader';

export function Providers({ children }) {
  return (
    <div>
      <Theme theme="g100">
        <OwlAgentHeader />
      </Theme>
      <Theme theme="g10">
        <Content>{children}</Content>
      </Theme>
    </div>
  );
}
