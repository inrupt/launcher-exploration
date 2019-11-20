import { TripleDocument, fetchDocument, createDocument, TripleSubject } from 'tripledoc';
import { rdf, acl, foaf } from 'rdf-namespaces';
import { Modes } from '../../availableApps';

export type AclParty = 
    { type: 'public', modes: Modes[] } |
    { type: 'webid', modes: Modes[], webid: string } |
    { type: 'app', modes: Modes[], origin: string };

export async function addAppToAcl (
  document: TripleDocument,
  parties: AclParty[],
) {
  const aclRef = document.getAclRef();
  if (!aclRef) {
    throw new Error('ACL reference not found!');
  }
  let aclDoc: TripleDocument;
  try {
    aclDoc = await fetchDocument(aclRef);
  } catch (e) {
    aclDoc = createDocument(aclRef);
  }
  if (!aclDoc) {
    throw new Error('could not create in-memory version of the ACL doc');
  }

  const listedParties = aclDoc.getSubjectsOfType(acl.Authorization);
  parties.forEach((party) => {
    // Only add this party if it's not already listed in the ACL:
    if (listedParties.some(isParty(party))) {
      return;
    }
    // TODO: If this party is listed in the ACL, but not with the desired modes,
    //       set the modes for the existing listing.
    const authorizationSubject = aclDoc.addSubject();
    authorizationSubject.addRef(rdf.type, acl.Authorization);
    authorizationSubject.addRef(acl.accessTo, document.asRef());
    party.modes.forEach((mode) => {
      authorizationSubject.addRef(acl.mode, mode);
    });
    if (party.type === 'public') {
      authorizationSubject.addRef(acl.agentClass, foaf.Agent);
    } else if (party.type === 'webid') {
      authorizationSubject.addRef(acl.agent, party.webid);
    } else if (party.type === 'app') {
      authorizationSubject.addRef(acl.origin, party.origin);
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
    if (partyToAdd.type === 'app' && existingParty.getRef(acl.origin) === partyToAdd.origin) {
      hasParty = true;
    }
    return hasModes && hasParty;
  };
}
