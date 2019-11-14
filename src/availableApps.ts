import { Reference } from 'tripledoc';
import { acl, schema } from 'rdf-namespaces';
import { initialiseNotesList } from './services/preparePod/initialiseNotesList';

export interface ClassFileRequirement {
  forClass: Reference;
  requiredModes: Array<typeof acl.Read | typeof acl.Append | typeof acl.Write | typeof acl.Control>;
  script?: string;
};
export type Requirement = ClassFileRequirement;

export interface Listing {
  url: string;
  name: string;
  tagline: string;
  screenshot?: string;
  requirements?: Requirement[];
};

export const scripts: { [i: string]: () => Promise<void> } = {
  initialiseNotesList
}

export const availableApps: Listing[] = [
  {
    name: 'Notepod',
    tagline: 'A note-taking app for Solid',
    url: 'https://notepod.vincenttunru.com/',
    requirements: [
      {
        forClass: schema.TextDigitalDocument,
        requiredModes: [],
        script: 'initialiseNotesList'
      },
    ],
  },
  {
    name: 'Poddit',
    tagline: 'Private bookmarking',
    url: 'https://vincenttunru.gitlab.io/poddit',
    screenshot: 'poddit',
    requirements: [
      {
        forClass: 'http://www.w3.org/2002/01/bookmark#Bookmark',
        requiredModes: [acl.Read, acl.Append, acl.Write],
      },
    ],
  },
];

export function isClassFileRequirement(r: Requirement): r is ClassFileRequirement {
  return (typeof (r as ClassFileRequirement).forClass !== 'undefined');
}
