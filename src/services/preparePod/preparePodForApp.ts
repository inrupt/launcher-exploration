import { space, acl, solid } from 'rdf-namespaces';
import { fetchDocument, Reference, describeSubject, describeDocument, describeContainer, TripleDocument, fetchContainer } from 'plandoc';
import { createDocument, LocalTripleDocument } from 'tripledoc';
import { addAppToAcl, AclParty } from './addToAcl';
import { addTrustedApp } from '../getTrustedApps';
import { ClassFileRequirement, Requirement, isClassFileRequirement, isExhaustive, isPodWideRequirement, PodWideRequirement, ContainerBoundrequirement, isContainerBoundRequirement } from '../../availableApps';
import { PodData } from '../../PodData';

export async function preparePodForApp(podData: PodData, origin: Reference, requirements: Requirement) {
  if (isClassFileRequirement(requirements)) {
    return initialiseClassFile(podData, origin, requirements);
  }
  if (isPodWideRequirement(requirements)) {
    return initialiseTrustedApps(podData, origin, requirements);
  }
  if (isContainerBoundRequirement(requirements)) {
    return intialiseContainer(podData, origin, requirements);
  }

  return isExhaustive(requirements);
}

async function initialiseTrustedApps (podData: PodData, origin: string, requirements: PodWideRequirement) {
  await addTrustedApp(podData, origin, requirements.podWidePermissions);
}

async function intialiseContainer (podData: PodData, origin: Reference, requirements: ContainerBoundrequirement) {
  const newContainer = describeContainer().isContainedIn(podData.storage, requirements.container);
  const newContainerRef = await fetchContainer(newContainer);

  if (!newContainerRef) {
    throw new Error('Could not initialise the Container');
  }
  const containerDoc = describeDocument().byRef(newContainerRef);
  const concreteContainerDoc = await fetchDocument(containerDoc);
  const containerAcl = describeDocument().isAclFor(containerDoc);
  let aclDoc: LocalTripleDocument | TripleDocument | null = null;
  try {
    aclDoc = await fetchDocument(containerAcl);
  } catch (e) {
    // If no ACL Document was found at the given location, we can create one
    const aclRef = concreteContainerDoc?.getAclRef();
    if (aclRef) {
      aclDoc = createDocument(aclRef);
    }
  }
  if (!aclDoc || !concreteContainerDoc) {
    throw new Error('Could not set permissions for the new Container.');
  }
  const aclParties: AclParty[] = [
    { type: 'app', modes: requirements.requiredModes, origin: origin, webid: podData.webId },
  ];
  await addAppToAcl(aclDoc, concreteContainerDoc, aclParties);
}

async function initialiseClassFile (podData: PodData, origin: Reference, requirements: ClassFileRequirement): Promise<void> {
  const typeIndex = (requirements.public === true) ? podData.publicTypeIndex : podData.privateTypeIndex;
  const typeRegistration =
    describeSubject()
    .isEnsuredIn(typeIndex)
    .withRef(solid.forClass, requirements.forClass);
  const storage = describeContainer().isFoundOn(podData.profile, space.storage);
  const dataDoc =
    describeDocument()
    .isEnsuredOn(typeRegistration, solid.instance, storage)
  const dataDocAcl = describeDocument()
    .isAclFor(dataDoc);

  const concreteDataDoc = await fetchDocument(dataDoc);
  let aclDoc: LocalTripleDocument | TripleDocument | null = null;
  try {
    aclDoc = await fetchDocument(dataDocAcl);
  } catch (e) {
    // If no ACL Document was found at the given location, we can create one
    const aclRef = concreteDataDoc?.getAclRef();
    if (aclRef) {
      aclDoc = createDocument(aclRef);
    }
  }

  if (!concreteDataDoc || !aclDoc) {
    throw new Error('Could not initialise the data file or its ACL');
  }

  const aclParties: AclParty[] = [
    { type: 'webid', modes: [acl.Read, acl.Write, acl.Control], webid: podData.webId },
    { type: 'app', modes: [acl.Read, acl.Write], origin: origin, webid: podData.webId },
  ];
  if (requirements.public) {
    aclParties.push({ type: 'public', modes: [acl.Read] });
  }
  await addAppToAcl(aclDoc, concreteDataDoc, aclParties);
}
