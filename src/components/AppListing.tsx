import React from 'react';
import { Listing } from '../availableApps';
import { Card, CardHeader, CardActions,  Typography, CardContent, Divider, Button } from '@material-ui/core';
import { Screenshot } from './Screenshot';
import { LaunchButton } from './LaunchButton';
import { LoggedOut } from '@solid/react';

interface Props {
  listing: Listing;
};

export const AppListing: React.FC<Props> = (props: Props) => {
  // TODO: Check whether this app has requirements that aren't fulfilled yet:
  const requirementsFulfilled = false;

  const requirementsOverview = (requirementsFulfilled)
    ? null
    : (<Typography>
      <p>
        {props.listing.name} will get permission to:
      </p>
      <ul>
        <li>Write data to your Pod</li>
      </ul>
    </Typography>);

  return (
    <Card>
      <Screenshot id={props.listing.screenshot}/>
      <CardHeader title={props.listing.name}/>
      <CardContent>
        <Typography variant="subtitle1">
          <p>
            {props.listing.tagline}
          </p>
        </Typography>
        {requirementsOverview}
      </CardContent>
      <CardActions>
        <LaunchButton listing={props.listing}/>
        <Button
          href="https://solidproject.org/use-solid"
          title="Get a Solid Pod"
        >I don't have a Pod</Button>
      </CardActions>
    </Card>
  );
};
