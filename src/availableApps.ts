import { Reference, TripleDocument, TripleSubject, createDocument } from 'tripledoc';
import { acl, schema, solid, rdf } from 'rdf-namespaces';
import { getDocument } from './services/documentCache';

const pim = {
  storage: 'http://www.w3.org/ns/pim/space#storage'
};

export type Modes = typeof acl.Read | typeof acl.Append | typeof acl.Write | typeof acl.Control;
export interface ClassFileRequirement {
  forClass: Reference;
  requiredModes: Array<Modes>;
  public?: boolean;
  defaultFilename: string;
};
export interface PodWideRequirement {
  podWidePermissions: Array<Modes>;
}
export interface ContainerBoundrequirement {
  container: Reference;
  requiredModes: Array<Modes>;
}
export type Requirement = ClassFileRequirement | PodWideRequirement | ContainerBoundrequirement;

export function isClassFileRequirement(r: Requirement): r is ClassFileRequirement {
  return (typeof (r as ClassFileRequirement).forClass !== 'undefined');
}
export function isPodWideRequirement(r: Requirement): r is PodWideRequirement {
  return (typeof (r as PodWideRequirement).podWidePermissions !== 'undefined');
}
export function isContainerBoundRequirement(r: Requirement): r is ContainerBoundrequirement {
  return (typeof (r as ContainerBoundrequirement).container !== 'undefined');
}
/**
 * This can be used to have TypeScript warn you when another type is added to [[Requirement]]
 */
export function isExhaustive(_typeToCheck: never): never {
  throw new Error('Did not check for all possible values of a type.');
}

export interface Listing {
  launchUrl: string;
  name: string;
  tagline: string;
  requirements?: Requirement[];
};

function createDocumentRelative(relativeLocation: string, podRoot: string) {
  const absoluteLocation = new URL(relativeLocation, podRoot);
  return createDocument(absoluteLocation.toString());
}

function followOrCreateLink(pred: string, defaultLocationOnPod: string) {
  return async (from: Reference, podRoot: string) => {
    const doc: TripleDocument = await getDocument(from);
    const sub: TripleSubject = doc.getSubject(from);
    let result = sub.getRef(pred);
    if (!result) {
      const object = createDocumentRelative(defaultLocationOnPod, podRoot);
      await object.save();
      result = object.asRef();
      sub.addRef(pred, result);
      await doc.save();
    }
    return result;
  };
}
function findSubject (doc: TripleDocument, properties:  { p: string, o: string}[]) {
  return null;
}
function findOrCreateSubject(properties: { p: string, o: string}[]) {
  return async (from: Reference) => {
    const doc: TripleDocument = await getDocument(from);
    let sub: TripleSubject | null = findSubject(doc, properties);
    if (!sub) {
      sub = doc.addSubject() as TripleSubject;
      properties.forEach((property: { p: string, o: string}) => {
        (sub as TripleSubject).addRef(property.p, property.o);
      });
      await doc.save();
    }
    return sub.asRef();
  };
}
function grantThisApp (modes: string[]) {
  return async (from: Reference) => {
    // ...
  };
}

const bookmarks: any = {
  steps: [ // executable async function steps:
    followOrCreateLink(solid.publicTypeIndex, 'settings/publicTypeIndex.ttl'),
    findOrCreateSubject([
        { p: rdf.type, o: solid.TypeRegistration},
        { p: solid.forClass, o: 'http://www.w3.org/2002/01/bookmark#Bookmark'},
    ]),
    followOrCreateLink(solid.instance, 'bookmarks'),
    grantThisApp([acl.Read, acl.Write])
  ],
  description: 'read, change and delete your bookmarks'
};

const notes: any = {
  steps: [ // or declaratively (as an RDF list in the app manifest?):
    [ 'follow-or-create-link', solid.publicTypeIndex],
    [ 'find-or-create-subject', [
        [ rdf.type, solid.TypeRegistration],
        [ solid.forClass, schema.TextDigitalDocument],
      ],
    ],
    [ 'follow-or-create-link', solid.instance ],
    [ 'or-create', 'notes'],
    [ 'grant-this-app', [acl.Read, acl.Write] ]
  ],
  description: 'read, change and delete your notes'
};

const podWideControl: any = {
  steps: [
    [ 'follow-or-create-link', pim.storage],
    [ 'grant-this-app', [acl.Read, acl.Write, acl.Control] ]
  ],
  description: 'read, change, delete and control all data on your pod'
};
const ticTacToeContainer: any = {
  steps: [
    [ 'follow-or-create-link', pim.storage],
    [ 'relative-path-or-create', 'tictactoe'],
    [ 'grant-this-app', [acl.Read, acl.Write, acl.Control] ]
  ],
  description: 'create and control a folder named tictactoe'
};

export const availableApps: Listing[] = [
  {
    name: 'Notepod',
    tagline: 'A note-taking app for Solid',
    launchUrl: 'https://notepod.vincenttunru.com/',
    requirements: [ notes ],
  },
  {
    name: 'Poddit',
    tagline: 'Private bookmarking',
    launchUrl: 'https://poddit.app',
    requirements: [ bookmarks ]
  },
  {
    name: 'Generator demo',
    tagline: 'Output of inrupt\'s generator for Solid React Applications',
    launchUrl: 'https://generator.inrupt.com/',
    requirements: [ podWideControl, ticTacToeContainer ],
  },
  {
    name: 'Focus',
    tagline: 'Solid Task Manager',
    launchUrl: 'https://noeldemartin.github.io/solid-focus/',
    requirements: [ podWideControl ],
  },
];
