import React, { useContext } from 'react';
import { Button } from '@material-ui/core';
import SolidAuth from 'solid-auth-client';
import { LoggedOut, LoggedIn } from '@solid/react';
import { Listing } from '../availableApps';
import { preparePodForApp } from '../services/preparePod/preparePodForApp';
import { PodContext } from '../PodData';

interface Props {
  listing: Listing;
};

export const LaunchButton: React.FC<Props> = (props) => {
  const [isLaunching, setIsLaunching] = React.useState(false);
  const podData = useContext(PodContext);
  if (!props.listing.requirements || props.listing.requirements.length === 0) {
    return (
      <Button
        href={props.listing.launchUrl}
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
      return launch(listing);
    }
  };
  const launch = async (listing: Listing) => {
    if (!podData) {
      console.error('Could not launch this app due to missing access Pod data.');
      return;
    }
    if (props.listing.requirements) {
      setIsLaunching(true);
      const origin = new URL(listing.launchUrl).origin;
      await Promise.all(props.listing.requirements.map(requirement => preparePodForApp(podData, origin, requirement)));
    }

    const urlToRedirectTo = new URL(listing.launchUrl);
    urlToRedirectTo.searchParams.append('webid', podData.webId);
    document.location.href = urlToRedirectTo.href;
  }

  return (
    <>
      <LoggedOut>
        <Button
          href={props.listing.launchUrl}
          title={`Launch ${props.listing.name}`}
          onClick={(event) => { event.preventDefault(); connectAndLaunch(props.listing); }}
          color="primary"
          variant="contained"
        >
          {isLaunching ? 'Launching…' : 'Connect and launch'}
        </Button>
      </LoggedOut>
      <LoggedIn>
        {/* TODO: Check if this app's requirements are already satisfied. */}
        {/*       If not, display a popover asking the user to set up their Pod. */}
        <Button
          onClick={() => launch(props.listing)}
          title={`Launch ${props.listing.name}`}
          color="primary"
          variant="contained"
        >
          {isLaunching ? 'Launching…' : 'Allow and launch'}
        </Button>
      </LoggedIn>
    </>
  );
};
