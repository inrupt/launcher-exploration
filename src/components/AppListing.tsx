import React from 'react';
import { Listing } from '../availableApps';
import { Card, CardHeader, CardActions, Button, Typography, CardContent } from '@material-ui/core';

interface Props {
  listing: Listing;
};

export const AppListing: React.FC<Props> = (props) => {
  return (
    <Card>
      <CardHeader title={props.listing.name}/>
      <CardContent>
        <Typography variant="subtitle1">
          {props.listing.tagline}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          href={props.listing.url}
          title={`Launch ${props.listing.name}`}
        >
          Launch
        </Button>
      </CardActions>
    </Card>
  );
};
