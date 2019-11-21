import { space, acl, solid } from 'rdf-namespaces';
import { createDocument, fetchDocument, TripleDocument, TripleSubject, Reference } from 'tripledoc';
import { addToTypeIndex } from './addToTypeIndex';
import { addAppToAcl, AclParty } from './addToAcl';
import SolidAuth, { Session as SolidAuthSession } from 'solid-auth-client';
import { addTrustedApp } from '../getTrustedApps';
import { ClassFileRequirement, Requirement, isClassFileRequirement, isExhaustive, isPodWideRequirement, PodWideRequirement, ContainerBoundrequirement, isContainerBoundRequirement } from '../../availableApps';

export async function preparePodForApp(origin: string, requirements: Requirement) {
  if (isClassFileRequirement(requirements)) {
    return initialiseClassFile(origin, requirements);
  }
  if (isPodWideRequirement(requirements)) {
    return initialiseTrustedApps(origin, requirements);
  }
  if (isContainerBoundRequirement(requirements)) {
    return intialiseContainer(origin, requirements);
  }

  return isExhaustive(requirements);
}

async function initialiseTrustedApps (origin: string, requirements: PodWideRequirement) {
  const currentSession: SolidAuthSession = await SolidAuth.currentSession() || (() => {throw new Error('not logged in!')})();
  const webId: string = currentSession.webId;
  await addTrustedApp(webId, origin, requirements.podWidePemissions);
}

async function intialiseContainer (origin: Reference, requirements: ContainerBoundrequirement) {
  const currentSession: SolidAuthSession = await SolidAuth.currentSession() || (() => {throw new Error('not logged in!')})();
  const webId: string = currentSession.webId;

  const webIdDoc: TripleDocument = await fetchDocument(webId) || (() => {throw new Error('no webIdDoc!')})();
  const profile: TripleSubject = webIdDoc.getSubject(webId) || (() => {throw new Error('no profile!')})();
  const storageRef = profile.getRef(space.storage);
  if (!storageRef) { throw new Error('No storage location found') }

  const containerRef = storageRef.replace(/\/$/, '') + '/' + requirements.container.replace(/^\//, '').replace(/\/$/, '') + '/';
  const containerDoc = await ensureContainer(containerRef);

  const aclParties: AclParty[] = [
    { type: 'app', modes: requirements.requiredModes, origin: origin, webid: webId },
  ];
  await addAppToAcl(containerDoc, aclParties);
}

async function ensureContainer(containerRef: Reference): Promise<TripleDocument> {
  try {
    const existingContainer = await fetchDocument(containerRef);
    return existingContainer;
  } catch (e) {
    // Container doesn't exist; continue to create it:
  }

  // Creating a container directly with a `PUT` request doesn't seem to work with Node Solid Server,
  // so create a dummy file inside it that will implicitly lead to the creation of the Container.
  // This approached is also used by the Inrupt Generator for Solid React Applications.
  const newChild = createDocument(containerRef + '.dummy');
  await newChild.save();
  return fetchDocument(containerRef);
}

async function initialiseClassFile (origin: string, requirements: ClassFileRequirement): Promise<void> {
  const currentSession: SolidAuthSession = await SolidAuth.currentSession() || (() => {throw new Error('not logged in!')})();
  const webId: string = currentSession.webId;

  await addTrustedApp(webId, origin, []);

  const webIdDoc: TripleDocument = await fetchDocument(webId) || (() => {throw new Error('no webIdDoc!')})();
  const profile: TripleSubject = webIdDoc.getSubject(webId) || (() => {throw new Error('no profile!')})();

  const dataDoc = await ensureTypeRegistration(profile, requirements);

  const aclParties: AclParty[] = [
    { type: 'webid', modes: [acl.Read, acl.Write, acl.Control], webid: webId },
    { type: 'app', modes: [acl.Read, acl.Write], origin: origin, webid: webId },
  ];
  if (requirements.public) {
    aclParties.push({ type: 'public', modes: [acl.Read] });
  }
  await addAppToAcl(dataDoc, aclParties);
}

async function ensureTypeRegistration(
  profile: TripleSubject,
  requirements: ClassFileRequirement,
): Promise<TripleDocument> {
  let typeIndexUrl: Reference;
  if (requirements.public === true) {
    typeIndexUrl = profile.getRef(solid.publicTypeIndex) || (() => {throw new Error('no public type index linked!')})();
  } else {
    typeIndexUrl = profile.getRef(solid.privateTypeIndex) || (() => {throw new Error('no private type index linked!')})();
  }
  const typeIndexDoc: TripleDocument = await fetchDocument(typeIndexUrl) || (() => {throw new Error('requested type index not found!')})();
  const existingTypeRegistration = typeIndexDoc.findSubject(solid.forClass, requirements.forClass);
  if (existingTypeRegistration) {
    const dataDocRef = existingTypeRegistration.getRef(solid.instance);
    if (!dataDocRef) {
      throw new Error('A Document listed in the type index does not exist.');
    }
    return fetchDocument(dataDocRef);
  }
  const storage: string = profile.getRef(space.storage) || (() => {throw new Error('no storage!')})();
  const filename = requirements.defaultFilename.replace(/\.ttl$/i, '') + '.ttl';
  const dataDocRef = storage + filename;
  const dataDoc = createDocument(dataDocRef);
  const newDataDoc = await dataDoc.save();
  await addToTypeIndex(typeIndexDoc, dataDoc, requirements.forClass);

  return newDataDoc;
}
