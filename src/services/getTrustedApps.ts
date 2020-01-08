import { Reference, describeSubject, describeSubjectList, fetchSubject, fetchSubjectList } from 'plandoc';
import { PodData } from '../PodData';
// import { acl } from 'rdf-namespaces';
const acl = {
  trustedApp: 'http://www.w3.org/ns/auth/acl#trustedApp',
  mode: 'http://www.w3.org/ns/auth/acl#mode',
  origin: 'http://www.w3.org/ns/auth/acl#origin',
};

export async function getTrustedApps(podData: PodData) {
  const virtualTrustedApps = describeSubjectList().isFoundOn(podData.profile, acl.trustedApp);
  const trustedApps = await fetchSubjectList(virtualTrustedApps);
  return trustedApps;
}

export async function addTrustedApp(podData: PodData, appOrigin: string, modes: Reference[]) {
  const virtualAppRegistration = describeSubject()
    .isEnsuredIn(podData.profileDoc)
    .withRef(acl.origin, appOrigin);

  const appRegistration = await fetchSubject(virtualAppRegistration);

  if (!appRegistration) {
    throw new Error(`Could not add ${appOrigin} to the trusted app list.`);
  }
  const existingAllowedModes = appRegistration.getAllRefs(acl.mode);
  if (
    existingAllowedModes.every((mode) => modes.includes(mode)) &&
    modes.every((mode) => existingAllowedModes.includes(mode))
  ) {
    // If the existing mode list is equal to the desired list,
    // we assume that trusted apps have been set up properly earlier,
    // so our job is done:
    return;
  }

  appRegistration.removeAll(acl.mode);
  modes.forEach((mode: string) => {
    appRegistration.addRef(acl.mode, mode);
  });

  const profile = await fetchSubject(podData.profile);
  if (!profile) {
    throw new Error('Could not read your profile.');
  }
  const trustedAppNamedNodes = profile.getAllRefs(acl.trustedApp);
  if (!trustedAppNamedNodes.includes(appRegistration.asRef())) {
    profile.addRef(acl.trustedApp, appRegistration.asRef());
  }

  await profile.getDocument().save([appRegistration, profile]);
}
