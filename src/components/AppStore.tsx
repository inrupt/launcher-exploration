import React from 'react';
import { Box } from '@material-ui/core';
import { availableApps } from '../availableApps';
import { AppListing } from './AppListing';
import { useTrustedApps } from '../hooks/useTrustedApps';

export const AppStore: React.FC = () => {
  const trustedApps = useTrustedApps() || [];

  const cards = availableApps.map((listing, i) => {
    const origin = new URL(listing.launchUrl).origin;
    return (
      <Box key={`app${i}`} margin={2}>
        <AppListing listing={listing} usedBefore={trustedApps.includes(origin)}/>
      </Box>
    );
  });

  return (
    <>
      {cards}
    </>
  );
};
