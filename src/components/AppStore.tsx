import React from 'react';
import { availableApps } from '../availableApps';
import { AppListing } from './AppListing';
import { Grid } from '@material-ui/core';

export const AppStore: React.FC = () => {
  const cards = availableApps.map((listing, i) => {
    return (
      <Grid item xs={12} sm={6} md={4} key={`app${i}`} >
        <AppListing listing={listing}/>
      </Grid>
    );
  });

  return (
    <>
      <Grid container spacing={2}>
        {cards}
      </Grid>
    </>
  );
};
