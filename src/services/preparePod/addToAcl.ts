import { TripleDocument, fetchDocument, createDocument } from 'tripledoc';
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

  parties.forEach((party) => {
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
