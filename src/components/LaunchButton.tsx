import React from 'react';
import { Button, Popover, Typography, CardHeader, CardContent, Card, CardActionArea, CardActions, CardMedia } from '@material-ui/core';
import SolidAuth from 'solid-auth-client';
import { LoggedOut, LoggedIn } from '@solid/react';
import { Listing } from '../availableApps';

interface Props {
  listing: Listing;
};

export const LaunchButton: React.FC<Props> = (props) => {
  const [popoverTrigger, setPopoverTrigger] = React.useState<HTMLButtonElement | null>(null);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    setPopoverTrigger(event.currentTarget);
  };

  if (!props.listing.requirements || props.listing.requirements.length === 0) {
    return (
      <Button
        href={props.listing.url}
        title={`Launch ${props.listing.name}`}
        color="primary"
        variant="contained"
      >
        Launch
      </Button>
    );
  }

  const connectAndLaunch = async (listing: Listing) => {
    const session = await SolidAuth.popupLogin({ popupUri: 'popup.html' })
    if (session.webId) {
      // TODO: Prepare the Pod for this app
      document.location.href = listing.url;
    }
  };

  return (
    <>
      <LoggedOut>
        <Button
          href={props.listing.url}
          title={`Launch ${props.listing.name}`}
          onClick={(event) => { event.preventDefault(); connectAndLaunch(props.listing); }}
          color="primary"
          variant="contained"
        >
          Connect and launch
        </Button>
      </LoggedOut>
      <LoggedIn>
        {/* TODO: Check if this app's requirements are already satisfied. */}
        {/*       If not, display a popover asking the user to set up their Pod. */}
        <Button
          href={props.listing.url}
          title={`Launch ${props.listing.name}`}
          color="primary"
          variant="contained"
        >
          Allow and launch
        </Button>
      </LoggedIn>
    </>
  );
};
