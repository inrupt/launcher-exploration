import { Reference } from 'tripledoc';
import { acl, schema } from 'rdf-namespaces';
import { initialiseNotesList, initialiseBookmarksList } from './services/preparePod/preparePodForApp';

export interface ClassFileRequirement {
  forClass: Reference;
  requiredModes: Array<typeof acl.Read | typeof acl.Append | typeof acl.Write | typeof acl.Control>;
};
export type Requirement = ClassFileRequirement;

export interface Listing {
  appOrigin: string;
  launchUrl: string;
  name: string;
  tagline: string;
  screenshot?: string;
  requirements?: Requirement[];
  script?: string;
  podWidePermissions: string[];
};

export const scripts: { [i: string]: (appOrigin: string, podWidePermissions: string[]) => Promise<void> } = {
  initialiseNotesList,
  initialiseBookmarksList
}

export async function runPrepareScript (scriptName: string | undefined, appOrigin: string, podWidePermissions: string[]): Promise<void> {
  if (!scriptName) {
    return;
  }
  return scripts[scriptName](appOrigin, podWidePermissions);
}

export const availableApps: Listing[] = [
  {
    name: 'Notepod',
    tagline: 'A note-taking app for Solid',
    appOrigin: 'https://notepod.vincenttunru.com',
    launchUrl: 'https://notepod.vincenttunru.com/',
    requirements: [
      {
        forClass: schema.TextDigitalDocument,
        requiredModes: []
      },
    ],
    script: 'initialiseNotesList',
    podWidePermissions: []
  },
  {
    name: 'Poddit',
    tagline: 'Private bookmarking',
    appOrigin: 'https://vincenttunru.gitlab.io',
    launchUrl: 'https://vincenttunru.gitlab.io/poddit',
    screenshot: 'poddit',
    requirements: [
      {
        forClass: 'http://www.w3.org/2002/01/bookmark#Bookmark',
        requiredModes: [acl.Read, acl.Append, acl.Write],
      },
    ],
    script: 'initialiseBookmarksList',
    podWidePermissions: [],
  },
];

export function isClassFileRequirement(r: Requirement): r is ClassFileRequirement {
  return (typeof (r as ClassFileRequirement).forClass !== 'undefined');
}
