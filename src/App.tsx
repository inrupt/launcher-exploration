import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import { AppBar, Typography, Toolbar, createMuiTheme, Button } from '@material-ui/core';
import { ThemeProvider, makeStyles, createStyles } from '@material-ui/styles';
import { LoggedIn, LoggedOut } from '@solid/react';
import SolidAuth from 'solid-auth-client';
import { AppStore } from './components/AppStore';

const theme = createMuiTheme(
  {
    palette: {
      primary: { main: '#7C4DFF' },
      secondary: { main: '#01C9EA' },
    },
  },
);

const useStyles = makeStyles((theme) =>
  createStyles({
    title: {
      flexGrow: 1,
    },
  }),
);

const App: React.FC = () => {
  const classes = useStyles();

  return <>
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline/>
        <AppBar position="static">
          <Toolbar>
            <Typography className={classes.title} variant="h6">
              Solid apps
            </Typography>
            <LoggedOut>
              <Button color="inherit" onClick={() => SolidAuth.popupLogin({ popupUri: 'popup.html' })}>Log in</Button>
            </LoggedOut>
            <LoggedIn>
              <Button color="inherit" onClick={() => SolidAuth.logout()}>Log out</Button>
            </LoggedIn>
          </Toolbar>
        </AppBar>
        <Container>
          <AppStore/>
        </Container>
      </ThemeProvider>
    </React.StrictMode>
  </>;
}

export default App;
