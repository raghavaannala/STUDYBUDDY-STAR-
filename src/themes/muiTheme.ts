import { createTheme } from '@mui/material/styles';

// Create a custom theme with the app's purple/indigo color scheme
const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#9333EA', // Purple
      light: '#A855F7',
      dark: '#7E22CE',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#4F46E5', // Indigo
      light: '#6366F1',
      dark: '#4338CA',
      contrastText: '#ffffff',
    },
    background: {
      default: '#1e293b', // Slate-800
      paper: 'rgba(30, 41, 59, 0.85)', // Slate-800 with transparency
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.5)',
    },
    divider: 'rgba(147, 51, 234, 0.2)',
    error: {
      main: '#ef4444', // Red-500
    },
    warning: {
      main: '#f59e0b', // Amber-500
    },
    info: {
      main: '#3b82f6', // Blue-500
    },
    success: {
      main: '#10b981', // Emerald-500
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 15px rgba(147, 51, 234, 0.25)',
          },
        },
        contained: {
          background: 'linear-gradient(90deg, #9333EA 0%, #4F46E5 100%)',
          '&:hover': {
            background: 'linear-gradient(90deg, #7E22CE 0%, #4338CA 100%)',
          },
        },
        outlined: {
          borderColor: 'rgba(147, 51, 234, 0.5)',
          '&:hover': {
            borderColor: 'rgba(147, 51, 234, 0.8)',
            backgroundColor: 'rgba(147, 51, 234, 0.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(147, 51, 234, 0.3)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(147, 51, 234, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'rgba(147, 51, 234, 0.7)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(147, 51, 234, 0.15)',
          color: '#ffffff',
          borderColor: 'rgba(147, 51, 234, 0.3)',
          '&:hover': {
            backgroundColor: 'rgba(147, 51, 234, 0.25)',
          },
        },
        deleteIcon: {
          color: 'rgba(255, 255, 255, 0.7)',
          '&:hover': {
            color: '#ffffff',
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(147, 51, 234, 0.2)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(30, 41, 59, 0.85)',
          borderColor: 'rgba(147, 51, 234, 0.2)',
          transition: 'all 0.3s ease',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        standardInfo: {
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          color: 'rgb(219, 234, 254)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
        },
        standardSuccess: {
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          color: 'rgb(209, 250, 229)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
        },
        standardWarning: {
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          color: 'rgb(254, 243, 199)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
        },
        standardError: {
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          color: 'rgb(254, 226, 226)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        },
      },
    },
  },
});

export default muiTheme; 