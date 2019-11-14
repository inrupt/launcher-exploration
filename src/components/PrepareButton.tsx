import React from 'react';
import { Listing, runPrepareScript } from '../availableApps';
import { Button } from '@material-ui/core';
import { LoggedOut, LoggedIn } from '@solid/react';

interface Props {
  listing: Listing;
};

export const PrepareButton: React.FC<Props> = (props) => {
  const prepareButton = (
    <Button
      onClick={() => runPrepareScript(props.listing.script, props.listing.appOrigin, props.listing.podWidePermissions)}
      title={`Prepare your pod for ${props.listing.name}`}
    >
      Prepare
    </Button>
  );
  if (!props.listing.requirements || props.listing.requirements.length === 0) {
    return prepareButton;
  }

  return (
    <>
      <LoggedOut>
        Log in to prepare
      </LoggedOut>
      <LoggedIn>
        {prepareButton}
      </LoggedIn>
    </>
  );
};
