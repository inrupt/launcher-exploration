import { Reference } from 'tripledoc';
import { acl, schema } from 'rdf-namespaces';

export type Modes = typeof acl.Read | typeof acl.Append | typeof acl.Write | typeof acl.Control;
export interface ClassFileRequirement {
  forClass: Reference;
  requiredModes: Array<Modes>;
  public?: boolean;
  defaultFilename: string;
};
export interface PodWideRequirement {
  podWidePemissions: Array<Modes>;
}
export type Requirement = ClassFileRequirement | PodWideRequirement;

export function isClassFileRequirement(r: Requirement): r is ClassFileRequirement {
  return (typeof (r as ClassFileRequirement).forClass !== 'undefined');
}
export function isPodWideRequirement(r: Requirement): r is PodWideRequirement {
  return (typeof (r as PodWideRequirement).podWidePemissions !== 'undefined');
}

export interface Listing {
  launchUrl: string;
  name: string;
  tagline: string;
  screenshot?: string;
  requirements?: Requirement[];
};

export const availableApps: Listing[] = [
  {
    name: 'Notepod',
    tagline: 'A note-taking app for Solid',
    launchUrl: 'https://notepod.vincenttunru.com/',
    requirements: [
      {
        forClass: schema.TextDigitalDocument,
        requiredModes: [acl.Read, acl.Append, acl.Write],
        defaultFilename: 'notes',
      },
    ],
  },
  {
    name: 'Poddit',
    tagline: 'Private bookmarking',
    launchUrl: 'https://poddit.app',
    screenshot: 'poddit',
    requirements: [
      {
        forClass: 'http://www.w3.org/2002/01/bookmark#Bookmark',
        requiredModes: [acl.Read, acl.Append, acl.Write],
        defaultFilename: 'bookmarks',
      },
    ],
  },
];
