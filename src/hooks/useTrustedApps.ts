import React from 'react';
import { getTrustedApps } from '../services/getTrustedApps';
import { acl } from 'rdf-namespaces';
import { PodContext } from '../PodData';

export function useTrustedApps() {
  const [trustedAppOrigins, setTrustedApps] = React.useState<string[]>();
  const podData = React.useContext(PodContext);

  React.useEffect(() => {
    if (!podData) {
      return;
    }

    getTrustedApps(podData).then((trustedApps) => {
      if (trustedApps === null) {
        return;
      }
      const origins = trustedApps.map(trustedApp => trustedApp.getRef(acl.origin)).filter(isNotNull);
      setTrustedApps(origins);
    });
  }, [podData]);

  return trustedAppOrigins;
}

function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}
