import React from 'react';
import { Card, CardHeader, CardActions,  Typography, CardContent, Button } from '@material-ui/core';
import { LoggedOut } from '@solid/react';
import { Listing, Requirement, isClassFileRequirement, isPodWideRequirement } from '../availableApps';
import { Screenshot } from './Screenshot';
import { LaunchButton } from './LaunchButton';
import { acl } from 'rdf-namespaces';

interface Props {
  listing: Listing;
};

export const AppListing: React.FC<Props> = (props: Props) => {
  const requirements = props.listing.requirements || [];
  const readableRequirements: JSX.Element[] = [];
  requirements
    .map(getHumanReadableRequirements)
    .forEach(readableReqs => readableRequirements.push(...readableReqs));
    console.log(
  requirements
    .map(getHumanReadableRequirements));

  const requirementListItems = readableRequirements.map((readableRequirement, i) => (
    <li key={`requirement${i}`}>
      <Typography>{readableRequirement}</Typography>
    </li>
  ));

  const requirementsOverview = (requirementListItems.length === 0)
    ? <Typography>This app does not require special permissions.</Typography>
    : (<>
      <Typography>
        {props.listing.name} will get permission to:
      </Typography>
      <ul>
        {requirementListItems}
      </ul>
    </>);

  return (
    <Card>
      <Screenshot id={props.listing.screenshot}/>
      <CardHeader title={props.listing.name} subheader={props.listing.tagline}/>
      <CardContent>
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

function getHumanReadableRequirements(requirement: Requirement): JSX.Element[] {
  if (isClassFileRequirement(requirement)) {
    if (requirement.requiredModes.includes(acl.Write) || requirement.requiredModes.includes(acl.Control)) {
      return [
        <>Manage data of <abbr title={requirement.forClass}>a specific type</abbr> in your Pod.</>,
      ];
    }
    if (requirement.requiredModes.includes(acl.Append)) {
      return [
        <>Add new data of <abbr title={requirement.forClass}>a specific type</abbr> in your Pod.</>,
      ];
    }
    return [
      <>Read data of <abbr title={requirement.forClass}>a specific type</abbr> in your Pod.</>,
    ];
  }

  if (isPodWideRequirement(requirement)) {
    if (requirement.podWidePemissions.includes(acl.Write) || requirement.podWidePemissions.includes(acl.Control)) {
      return [
        <>Change all data in your Pod</>,
      ];
    }
    if (requirement.podWidePemissions.includes(acl.Append)) {
      return [
        <>Add new data to your Pod</>,
      ];
    }
    return [
      <>Read all data in your Pod.</>,
    ];
  }

  return isExhaustive(requirement);
}

// This will make sure that TypeScript will tell us when we add another type to an alias
// that we haven't yet accounted for:
export function isExhaustive(_typeToCheck: never): never {
  throw new Error('Did not check for all possible values of a type.');
}
