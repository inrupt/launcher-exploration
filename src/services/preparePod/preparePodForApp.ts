import { space, acl, solid } from 'rdf-namespaces';
import { createDocument, fetchDocument, TripleDocument, TripleSubject } from 'tripledoc';
import { addToTypeIndex } from './addToTypeIndex';
import { addAppToAcl, AclParty } from './addToAcl';
import SolidAuth, { Session as SolidAuthSession } from 'solid-auth-client';
import { addTrustedApp } from '../getTrustedApps';
import { ClassFileRequirement, Requirement, isClassFileRequirement } from '../../availableApps';

export async function preparePodForApp(origin: string, requirements: Requirement) {
  if (isClassFileRequirement(requirements)) {
    return initialiseClassFile(origin, requirements);
  }

  throw new Error('This app has a set of requirements we do not know how to fulfil yet.');
}

export async function initialiseClassFile (origin: string, requirements: ClassFileRequirement): Promise<void> {
  const currentSession: SolidAuthSession = await SolidAuth.currentSession() || (() => {throw new Error('not logged in!')})();
  const webId: string = currentSession.webId;
  await addTrustedApp(webId, origin, []);
  const webIdDoc: TripleDocument = await fetchDocument(webId) || (() => {throw new Error('no webIdDoc!')})();
  const profile: TripleSubject = webIdDoc.getSubject(webId) || (() => {throw new Error('no profile!')})();
  let typeIndexUrl: string;
  if (requirements.public === true) {
    typeIndexUrl = profile.getRef(solid.publicTypeIndex) || (() => {throw new Error('no public type index linked!')})();
  } else {
    typeIndexUrl = profile.getRef(solid.privateTypeIndex) || (() => {throw new Error('no private type index linked!')})();
  }
  const typeIndexDoc: TripleDocument = await fetchDocument(typeIndexUrl) || (() => {throw new Error('requested type index not found!')})();
  const storage: string = profile.getRef(space.storage) || (() => {throw new Error('no storage!')})();

  // TODO: Only create this file if it does not exist yet:
  const filename = requirements.defaultFilename.replace(/\.ttl$/i, '') + '.ttl';
  const dataDocRef = storage + filename;
  const dataDoc = createDocument(dataDocRef);
  await dataDoc.save();
  await addToTypeIndex(typeIndexDoc, dataDoc, requirements.forClass);

  const aclParties: AclParty[] = [
    { type: 'webid', modes: [acl.Read, acl.Write, acl.Control], webid: webId },
    { type: 'app', modes: [acl.Read, acl.Write], origin: origin },
  ];
  if (requirements.public) {
    aclParties.push({ type: 'public', modes: [acl.Read] });
  }
  await addAppToAcl(dataDoc, aclParties);
}
