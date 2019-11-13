import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import { AppStore } from './components/AppStore';
import { AppBar, Typography, Toolbar, createMuiTheme } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';

const theme = createMuiTheme(
  {
    palette: {
      primary: { main: '#7C4DFF' },
      secondary: { main: '#01C9EA' },
    },
  },
);

const App: React.FC = () => {
  return <>
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline/>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6">
              Solid apps
            </Typography>
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
