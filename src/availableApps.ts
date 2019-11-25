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
export interface ContainerBoundrequirement {
  container: Reference;
  requiredModes: Array<Modes>;
}
export type Requirement = ClassFileRequirement | PodWideRequirement | ContainerBoundrequirement;

export function isClassFileRequirement(r: Requirement): r is ClassFileRequirement {
  return (typeof (r as ClassFileRequirement).forClass !== 'undefined');
}
export function isPodWideRequirement(r: Requirement): r is PodWideRequirement {
  return (typeof (r as PodWideRequirement).podWidePemissions !== 'undefined');
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
        podWidePemissions: [],
      },
      {
        forClass: schema.TextDigitalDocument,
        requiredModes: [acl.Read, acl.Append, acl.Write],
        defaultFilename: 'notes',
        public: true,
      },
    ],
  },
  {
    name: 'Poddit',
    tagline: 'Private bookmarking',
    launchUrl: 'https://poddit.app',
    requirements: [
      {
        podWidePemissions: [],
      },
      {
        forClass: 'http://www.w3.org/2002/01/bookmark#Bookmark',
        requiredModes: [acl.Read, acl.Append, acl.Write],
        defaultFilename: 'bookmarks',
        public: true,
      },
    ],
  },
  {
    name: 'Generator demo',
    tagline: 'Output of inrupt\'s generator for Solid React Applications',
    launchUrl: 'https://generator.inrupt.com/',
    requirements: [
      {
        podWidePemissions: [acl.Read, acl.Append, acl.Write, acl.Control],
      },
      {
        container: 'tictactoe',
        requiredModes: [acl.Read, acl.Append, acl.Write, acl.Control],
      },
    ],
  },
  {
    name: 'Focus',
    tagline: 'Solid Task Manager',
    launchUrl: 'https://noeldemartin.github.io/solid-focus/',
    requirements: [
      {
        podWidePemissions: [acl.Read, acl.Append, acl.Write, acl.Control],
      },
    ],
  },
];
