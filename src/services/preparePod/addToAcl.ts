import { TripleDocument, TripleSubject, LocalTripleDocument } from 'tripledoc';
import { rdf, acl, foaf } from 'rdf-namespaces';
import { Modes } from '../../availableApps';

export type AclParty = 
    { type: 'public', modes: Modes[] } |
    { type: 'webid', modes: Modes[], webid: string } |
    { type: 'app', modes: Modes[], origin: string, webid: string };

export async function addAppToAcl (
  aclDoc: LocalTripleDocument | TripleDocument,
  forDocument: TripleDocument,
  parties: AclParty[],
) {
  const listedParties = (isStored(aclDoc))
    ? aclDoc.getSubjectsOfType(acl.Authorization)
    : [];
  parties.forEach((party) => {
    // Only add this party if it's not already listed in the ACL:
    if (listedParties.some(isParty(party))) {
      return;
    }
    // TODO: If this party is listed in the ACL, but not with the desired modes,
    //       set the modes for the existing listing.
    const authorizationSubject = aclDoc.addSubject();
    authorizationSubject.addRef(rdf.type, acl.Authorization);
    authorizationSubject.addRef(acl.accessTo, forDocument.asRef());
    party.modes.forEach((mode) => {
      authorizationSubject.addRef(acl.mode, mode);
    });
    if (party.type === 'public') {
      authorizationSubject.addRef(acl.agentClass, foaf.Agent);
    } else if (party.type === 'webid') {
      authorizationSubject.addRef(acl.agent, party.webid);
    } else if (party.type === 'app') {
      authorizationSubject.addRef(acl.origin, party.origin);
      authorizationSubject.addRef(acl.agent, party.webid);
    }
  });

  await aclDoc.save();
}

function isParty(partyToAdd: AclParty): (existingParty: TripleSubject) => boolean {
  return (existingParty: TripleSubject) => {
    const existingModes = existingParty.getAllRefs(acl.mode);
    const hasModes = partyToAdd.modes.every(mode => existingModes.includes(mode));
    let hasParty = false;
    if (partyToAdd.type === 'public' && existingParty.getRef(acl.agentClass) === foaf.Agent) {
      hasParty = true;
    }
    if (partyToAdd.type === 'webid' && existingParty.getRef(acl.agent) === partyToAdd.webid) {
      hasParty = true;
    }
    if (
      partyToAdd.type === 'app' &&
      existingParty.getRef(acl.origin) === partyToAdd.origin &&
      existingParty.getRef(acl.agent) === partyToAdd.webid
    ) {
      hasParty = true;
    }
    return hasModes && hasParty;
  };
}

function isStored(document: LocalTripleDocument | TripleDocument): document is TripleDocument {
  return typeof (document as TripleDocument).getSubjectsOfType === 'function'
}
