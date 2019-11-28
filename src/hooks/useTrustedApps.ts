import React from 'react';
import { useWebId } from '@solid/react';
import { getTrustedApps } from '../services/getTrustedApps';
import { acl } from 'rdf-namespaces';

export function useTrustedApps() {
  const [trustedAppOrigins, setTrustedApps] = React.useState<string[]>();
  const webId = useWebId();

  React.useEffect(() => {
    if (!webId) {
      return;
    }

    getTrustedApps(webId).then((trustedApps) => {
      const origins = trustedApps.map(trustedApp => trustedApp.getRef(acl.origin)).filter(isNotNull);
      setTrustedApps(origins);
    });
  }, [webId]);

  return trustedAppOrigins;
}

function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}
