import React from 'react';
import { Card, CardHeader, CardActions,  Typography, CardContent, Button, Chip } from '@material-ui/core';
import DoneIcon from '@material-ui/icons/Done';
import { LoggedOut } from '@solid/react';
import { Listing, Requirement, isClassFileRequirement, isPodWideRequirement, isExhaustive, isContainerBoundRequirement } from '../availableApps';
import { Screenshot } from './Screenshot';
import { LaunchButton } from './LaunchButton';
import { acl, schema, rdfs } from 'rdf-namespaces';
import { Reference, fetchDocument } from 'tripledoc';

interface Props {
  listing: Listing;
  usedBefore: boolean;
};

export const AppListing: React.FC<Props> = (props: Props) => {
  const requirements = props.listing.requirements || [];
  const readableRequirements: JSX.Element[] = [];
  requirements
    .map(getHumanReadableRequirements)
    .forEach(readableReqs => readableRequirements.push(...readableReqs));

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

  const title = (props.usedBefore)
    ? <>{props.listing.name} <DoneIcon/></>
    : props.listing.name;

  return (
    <Card>
      <Screenshot id={props.listing.screenshot}/>
      <CardHeader title={title} subheader={props.listing.tagline}/>
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
    const classLabel = getHumanReadableClassLabel(requirement.forClass);
    const reqs: JSX.Element[] = [];
    if (requirement.requiredModes.includes(acl.Control)) {
      reqs.push(
        <>Change who has access to {classLabel} in your Pod.</>,
      );
    }
    if (requirement.requiredModes.includes(acl.Write)) {
      reqs.push(
        <>Delete {classLabel} from your Pod.</>,
      );
    }
    if (requirement.requiredModes.includes(acl.Write) || requirement.requiredModes.includes(acl.Append)) {
      reqs.push(
        <>Add new {classLabel} in your Pod.</>,
      );
    }
    if (requirement.requiredModes.includes(acl.Read)) {
      reqs.push(
        <>Read {classLabel} in your Pod.</>,
      );
    }
    return reqs;
  }

  if (isContainerBoundRequirement(requirement)) {
    const reqs: JSX.Element[] = [];
    if (requirement.requiredModes.includes(acl.Control)) {
      reqs.push(
        <>Change who has access to the folder <code>{requirement.container}</code> on your Pod.</>,
      );
    }
    if (requirement.requiredModes.includes(acl.Write)) {
      reqs.push(
        <>Delete data from the folder <code>{requirement.container}</code> on your Pod.</>,
      );
    }
    if (requirement.requiredModes.includes(acl.Write) || requirement.requiredModes.includes(acl.Append)) {
      reqs.push(
        <>Add new data in the folder <code>{requirement.container}</code> on your Pod.</>,
      );
    }
    if (requirement.requiredModes.includes(acl.Read)) {
      reqs.push(
        <>Read all data in the folder <code>{requirement.container}</code> on your Pod.</>,
      );
    }
    return reqs;
  }

  // istanbul ignore else [TypeScript will tell use when we're not exhaustive, so this should never be reached]
  if (isPodWideRequirement(requirement)) {
    const reqs: JSX.Element[] = [];
    if (requirement.podWidePermissions.includes(acl.Control)) {
      reqs.push(
        <>Change who has access to any data in your Pod.</>,
      );
    }
    if (requirement.podWidePermissions.includes(acl.Write)) {
      reqs.push(
        <>Delete any data from your Pod.</>,
      );
    }
    if (requirement.podWidePermissions.includes(acl.Write) || requirement.podWidePermissions.includes(acl.Append)) {
      reqs.push(
        <>Add new data to your Pod.</>,
      );
    }
    if (requirement.podWidePermissions.includes(acl.Read)) {
      reqs.push(
        <>Read all data in your Pod.</>,
      );
    }
    return reqs;
  }

  // istanbul ignore next [TypeScript will tell use when we're not exhaustive, so this should never be reached]
  return isExhaustive(requirement);
}

function getHumanReadableClassLabel(forClass: Reference): JSX.Element {
  if (forClass === 'http://www.w3.org/2002/01/bookmark#Bookmark') {
    return <abbr title={forClass}>bookmarks</abbr>;
  }
  if (forClass === schema.TextDigitalDocument) {
    return <abbr title={forClass}>text files</abbr>;
  }

  return <>data of <abbr title={forClass}>a specific type</abbr></>;
}

// We could fetch the actually readable name, but that would require more async data fetching.
// Hence, we're just using hardcoded aliases for now.
// istanbul ignore next
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getClassLabel(forClass: Reference) {
  try {
    const vocab = await fetchDocument(forClass);
    const definition = vocab.getSubject(forClass);
    return definition.getString(rdfs.label);
  } catch (e) {
    return null;
  }
}
