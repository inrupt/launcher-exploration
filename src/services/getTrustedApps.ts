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
  const trustedAppBlankNodes = subject.getAllLocalSubjects(acl.trustedApp);
  console.log(trustedAppBlankNodes);
  return trustedAppBlankNodes.map(trustedApp => {
    return trustedApp.getRef(acl.origin)
  });
}

export async function addTrustedApp(webId: string, appOrigin: string, modes: string[]) {
  // TODO: Only add if not present yet
  const profileDoc = await fetchDocument(webId);
  const subject = profileDoc.getSubject(webId);
  const trustNode = profileDoc.addSubject();
  subject.addRef(acl.trustedApp, trustNode.asRef());
  trustNode.addRef(acl.origin, appOrigin);
  modes.forEach((mode: string) => {
    trustNode.addRef(acl.mode, mode);
  });
  await profileDoc.save();
}