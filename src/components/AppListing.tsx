import React from 'react';
import { Card, CardHeader, CardActions,  Typography, CardContent, Button } from '@material-ui/core';
import { LoggedOut } from '@solid/react';
import { Listing } from '../availableApps';
import { Screenshot } from './Screenshot';
import { LaunchButton } from './LaunchButton';

interface Props {
  listing: Listing;
};

export const AppListing: React.FC<Props> = (props: Props) => {
  // TODO: Check whether this app has requirements that aren't fulfilled yet:
  const requirementsFulfilled = false;

  const requirementsOverview = (requirementsFulfilled)
    ? null
    : (<>
      <Typography>
        {props.listing.name} will get permission to:
      </Typography>
      <ul>
        <li><Typography>Write data to your Pod</Typography></li>
      </ul>
    </>);

  return (
    <Card>
      <Screenshot id={props.listing.screenshot}/>
      <CardHeader title={props.listing.name}/>
      <CardContent>
        <Typography variant="subtitle1">
          {props.listing.tagline}
        </Typography>
        {requirementsOverview}
      </CardContent>
      <CardActions>
        <LaunchButton listing={props.listing}/>
        <LoggedOut>
          <Button
            href="https://solidproject.org/use-solid"
            title="Get a Solid Pod"
          >I don't have a Pod</Button>
        </LoggedOut>
      </CardActions>
    </Card>
  );
};
