import React from 'react';
import { Listing } from '../availableApps';
import { Button } from '@material-ui/core';
import { LoggedOut, LoggedIn } from '@solid/react';

interface Props {
  listing: Listing;
};

export const LaunchButton: React.FC<Props> = (props) => {
  const launchButton = (
    <Button
      href={props.listing.url}
      title={`Launch ${props.listing.name}`}
    >
      Launch
    </Button>
  );
  if (!props.listing.requirements || props.listing.requirements.length === 0) {
    return launchButton;
  }

  return (
    <>
      <LoggedOut>
        Log in to launch
      </LoggedOut>
      <LoggedIn>
        {launchButton}
      </LoggedIn>
    </>
  );
};
