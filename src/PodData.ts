import { createContext } from 'react';
import { VirtualSubject, describeSubject,  describeDocument, VirtualDocument, Reference, VirtualContainer, describeContainer } from 'plandoc';
import { solid, space } from 'rdf-namespaces';

export interface PodData {
  webId: Reference;
  profileDoc: VirtualDocument,
  profile: VirtualSubject;
  publicTypeIndex: VirtualDocument,
  privateTypeIndex: VirtualDocument,
  storage: VirtualContainer,
}
export const PodContext = createContext<PodData | null>(null);

export const PodDataProvider = PodContext.Provider;

export function getPodData(webId: string | null | undefined): PodData | null {
  if (!webId) {
    return null;
  }

  const profileDoc = describeDocument().byRef(webId);
  const profile = describeSubject().isFoundIn(profileDoc).asRef(webId);

  const publicTypeIndex = describeDocument().isFoundOn(profile, solid.publicTypeIndex);
  const privateTypeIndex = describeDocument().isFoundOn(profile, solid.privateTypeIndex);

  const storage = describeContainer().isFoundOn(profile, space.storage);

  return {
    webId,
    profileDoc,
    profile,
    publicTypeIndex,
    privateTypeIndex,
    storage,
  };
}
