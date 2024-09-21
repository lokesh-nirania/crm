import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

// A custom theme for this app
const theme = createTheme({
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: red.A400,
    },
  },
  typography: {
    // Customize the font size for different text variants
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: {
      fontSize: '2.5rem', // You can adjust this size
    },
    h2: {
      fontSize: '2rem',
    },
    h3: {
      fontSize: '1.75rem',
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
    button: {
      fontSize: '0.875rem', // Button font size
      textTransform: 'uppercase', // Optional to keep button text uppercase
    },
    caption: {
      fontSize: '0.75rem',
    },
  },
});

export default theme;
