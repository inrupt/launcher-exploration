import { getDocument } from './documentCache';
import { Reference, TripleSubject } from 'tripledoc';
// import { acl } from 'rdf-namespaces';
const acl = {
  trustedApp: 'http://www.w3.org/ns/auth/acl#trustedApp',
  mode: 'http://www.w3.org/ns/auth/acl#mode',
  origin: 'http://www.w3.org/ns/auth/acl#origin',
};

export async function getTrustedApps(webId: string) {
  const profileDoc = await getDocument(webId);
  const subject = profileDoc.getSubject(webId);
  const trustedAppBlankNodes = subject.getAllLocalSubjects(acl.trustedApp);
  const trustedAppNamedNodes = subject.getAllRefs(acl.trustedApp).map((ref) => profileDoc.getSubject(ref));
  const trustedApps = trustedAppBlankNodes.concat(trustedAppNamedNodes);
  return trustedApps;
}

export async function addTrustedApp(webId: string, appOrigin: string, modes: Reference[]) {
  debugger;
  const alreadyTrustedApps = await getTrustedApps(webId);
  if (alreadyTrustedApps.some(isTrustedApp(appOrigin, modes))) {
    // Do not add this trusted app if it's already listed.
    return;
  }

  // TODO: Set the correct modes if this origin is already listed, but with different modes
  const profileDoc = await getDocument(webId);
  const subject = profileDoc.getSubject(webId);
  const trustNode = profileDoc.addSubject();
  subject.addRef(acl.trustedApp, trustNode.asRef());
  trustNode.addRef(acl.origin, appOrigin);
  modes.forEach((mode: string) => {
    trustNode.addRef(acl.mode, mode);
  });
  await profileDoc.save();
}

function isTrustedApp(appOrigin: string, modes: Reference[]) {
  return (trustedApp: TripleSubject) => {
    return (
      trustedApp.getRef(acl.origin) === appOrigin &&
      modes.every(mode => trustedApp.getAllRefs(acl.mode).includes(mode))
    );
  };
};
