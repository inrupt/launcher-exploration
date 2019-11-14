import { space, schema, acl, solid } from 'rdf-namespaces';
import { createDocument, fetchDocument, TripleDocument, TripleSubject } from 'tripledoc';
import { addToTypeIndex } from './addToTypeIndex';
import { addAppToAcl } from './addToAcl';
import SolidAuth, { Session as SolidAuthSession } from 'solid-auth-client';
import { addTrustedApp } from '../getTrustedApps';

export async function initialiseSingleDocApp (args: {
  appOrigin: string,
  modes: { [party: string]: string[] },
  typeIndexPublic: boolean,
  rdfType: string,
  defaultLocation: string,
  podWidePermissions: string[]
}): Promise<void> {
  const currentSession: SolidAuthSession = await SolidAuth.currentSession() || (() => {throw new Error('not logged in!')})();
  const webId: string = currentSession.webId;
  await addTrustedApp(webId, args.appOrigin, args.podWidePermissions);
  const webIdDoc: TripleDocument = await fetchDocument(webId) || (() => {throw new Error('no webIdDoc!')})();
  const profile: TripleSubject = webIdDoc.getSubject(webId) || (() => {throw new Error('no profile!')})();
  let typeIndexUrl: string;
  if (args.typeIndexPublic) {
    typeIndexUrl = profile.getRef(solid.publicTypeIndex) || (() => {throw new Error('no public type index linked!')})();
  } else {
    typeIndexUrl = profile.getRef(solid.privateTypeIndex) || (() => {throw new Error('no private type index linked!')})();
  }
  const typeIndexDoc: TripleDocument = await fetchDocument(typeIndexUrl) || (() => {throw new Error('requested type index not found!')})();
  const storage: string = profile.getRef(space.storage) || (() => {throw new Error('no storage!')})();

  const dataDocRef = storage + args.defaultLocation;
  const dataDoc = createDocument(dataDocRef);
  await dataDoc.save();
  await addToTypeIndex(typeIndexDoc, dataDoc, args.rdfType);
  await addAppToAcl(dataDoc, webId, args.appOrigin, args.modes);
}

export async function initialiseNotesList (appOrigin: string, podWidePermissions: string[]): Promise<void> {
  return initialiseSingleDocApp({
    appOrigin,
    modes: {
      owner: [ acl.Read, acl.Write, acl.Control ],
      app: [ acl.Read, acl.Write ],
      public: [ acl.Read ]
    },
    typeIndexPublic: true,
    rdfType: schema.TextDigitalDocument,
    defaultLocation: 'notes.ttl',
    podWidePermissions
  });
}

export async function initialiseBookmarksList (appOrigin: string, podWidePermissions: string[]): Promise<void> {
  return initialiseSingleDocApp({
    appOrigin,
    modes: {
      owner: [ acl.Read, acl.Write, acl.Control ],
      app: [ acl.Read, acl.Write ],
      public: [ acl.Read ]
    },
    typeIndexPublic: true,
    rdfType: 'http://www.w3.org/2002/01/bookmark#Bookmark',
    defaultLocation: 'bookmarks.ttl',
    podWidePermissions
  });
}