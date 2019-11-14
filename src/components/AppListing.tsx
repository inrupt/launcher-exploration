import React from 'react';
import { Listing } from '../availableApps';
import { Card, CardHeader, CardActions,  Typography, CardContent } from '@material-ui/core';
import { Screenshot } from './Screenshot';
import { LaunchButton } from './LaunchButton';
import { PrepareButton } from './PrepareButton';

interface Props {
  listing: Listing;
};

export const AppListing: React.FC<Props> = (props: Props) => {
  return (
    <Card>
      <Screenshot id={props.listing.screenshot}/>
      <CardHeader title={props.listing.name}/>
      <CardContent>
        <Typography variant="subtitle1">
          {props.listing.tagline}
        </Typography>
      </CardContent>
      <CardActions>
        <PrepareButton listing={props.listing}/>
        <LaunchButton listing={props.listing}/>
      </CardActions>
    </Card>
  );
};
