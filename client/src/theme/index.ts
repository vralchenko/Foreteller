import { createTheme } from '@mui/material';

export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#a855f7',
        },
        secondary: {
            main: '#6366f1',
        },
        background: {
            default: '#0f172a',
            paper: 'rgba(255, 255, 255, 0.05)',
        },
    },
    typography: {
        fontFamily: '"Outfit", "Roboto", "Arial", sans-serif',
        h3: {
            fontFamily: '"Playfair Display", serif',
        },
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 16,
                },
            },
        },
    },
});
