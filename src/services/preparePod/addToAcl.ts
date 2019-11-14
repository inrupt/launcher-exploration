import { TripleDocument, fetchDocument, createDocument } from 'tripledoc';
import { rdf, acl } from 'rdf-namespaces';

function addAuthorization(args: {
  document: TripleDocument,
  aclDoc: TripleDocument,
  webId: string,
  appOrigin: string,
  party: string,
  modes: string[]
}) {
  const authorizationSubject = args.aclDoc.addSubject();
  authorizationSubject.addNodeRef(rdf.type, acl.Authorization);
  authorizationSubject.addNodeRef(acl.accessTo, args.document.asNodeRef());
  args.modes.forEach((mode) => {
    authorizationSubject.addNodeRef(acl.mode, mode);
  });
  if (args.party === 'public') {
    authorizationSubject.addNodeRef(acl.agent, args.webId);
  } else {
    authorizationSubject.addNodeRef(acl.agent, args.webId);
  }
  if (args.party === 'app') {
    authorizationSubject.addNodeRef(acl.origin, args.appOrigin);
  }
}

export async function addAppToAcl (
  document: TripleDocument,
  webId: string,
  appOrigin: string,
  modes: { [party: string]: string[] }
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
  for (let party in modes) {
    addAuthorization({ document, aclDoc, webId, appOrigin, party, modes: modes[party] });
  }
  await aclDoc.save();
}
