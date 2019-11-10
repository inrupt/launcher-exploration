import React, { useEffect } from 'react';
import { LoggedOut, LoginButton, LoggedIn, LogoutButton, useWebId } from '@solid/react';
import { getTrustedApps } from './services/getTrustedApps';

const App: React.FC = () => {
  const webId = useWebId();
  useEffect(() => {
    if (webId) {
      getTrustedApps(webId).then((trustedAppOrigins: (string | null)[]) => {
          const filtered: string[] = [];
          trustedAppOrigins.forEach((origin: string | null) => {
            if (origin) {
              filtered.push(origin);
            }
          });
          setTrustedAppOrigins(filtered);
        });
    }

  }, [webId]);
  const [trustedAppOrigins, setTrustedAppOrigins] = React.useState<string[]>([]);
  const trustedAppItems = trustedAppOrigins.map((origin: string) => <li><a href={origin}>origin</a></li>);

  return <>
    <LoggedOut>
      <section className="section">
        <p className="content">This app requires you to log in. It requires <b>Control</b> access.</p>
        <LoginButton popup="popup.html" className="button is-large is-primary">Log in to start using</LoginButton>
      </section>
    </LoggedOut>
    <LoggedIn>
      <div className="panel">
        Logged in as {useWebId()}.&nbsp;
        <LogoutButton className="button is-warning" />
      </div>
      <ul>
        {trustedAppItems}
      </ul>
    </LoggedIn>
  </>;
}

export default App;
