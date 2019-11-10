import { fetchDocument } from 'tripledoc';
// import { acl } from 'rdf-namespaces';
const acl = {
  trustedApp: 'http://www.w3.org/ns/auth/acl#trustedApp',
  mode: 'http://www.w3.org/ns/auth/acl#mode',
  origin: 'http://www.w3.org/ns/auth/acl#origin',
};

export async function getTrustedApps(webId: string) {
  const profileDoc = await fetchDocument(webId);
  const subject = profileDoc.getSubject(webId);
  console.log('getting trusted apps', subject);
  const trustedAppBlankNodes = subject.getAllNodeRefs(acl.trustedApp);
  console.log(trustedAppBlankNodes);
  return trustedAppBlankNodes.map(nodeRef => {
    const node = profileDoc.getSubject(nodeRef);
    return node.getNodeRef(acl.origin)
  });
}