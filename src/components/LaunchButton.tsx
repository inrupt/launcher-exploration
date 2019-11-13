import React from 'react';
import { Listing } from '../availableApps';
import { Button, Popover, makeStyles, createStyles, Typography } from '@material-ui/core';
import { LoggedOut, LoggedIn } from '@solid/react';

interface Props {
  listing: Listing;
};

const useStyles = makeStyles((theme) =>
  createStyles({
    typography: {
      padding: theme.spacing(2),
    },
  }),
);

export const LaunchButton: React.FC<Props> = (props) => {
  const classes = useStyles();
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
      >
        Launch
      </Button>
    );
  }

  return (
    <>
      <LoggedOut>
        <Button
          href={props.listing.url}
          title={`Launch ${props.listing.name}`}
          onClick={handleClick}
        >
          Launch
        </Button>
        <Popover
          anchorEl={popoverTrigger}
          open={popoverTrigger !== null}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
        >
          <Typography className={classes.typography}>
            You need to log in to launch this app. (Why?)
          </Typography>
        </Popover>
      </LoggedOut>
      <LoggedIn>
        <Button
          href={props.listing.url}
          title={`Launch ${props.listing.name}`}
        >
          Launch
        </Button>
      </LoggedIn>
    </>
  );
};
