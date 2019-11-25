import React from 'react';
import { availableApps } from '../availableApps';
import { AppListing } from './AppListing';
import { Box } from '@material-ui/core';

export const AppStore: React.FC = () => {
  const cards = availableApps.map((listing, i) => {
    return (
      <Box key={`app${i}`} margin={2}>
        <AppListing listing={listing}/>
      </Box>
    );
  });

  return (
    <>
      {cards}
    </>
  );
};
