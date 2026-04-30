// src/themecontext.tsx
import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Fab,
  Box,
  Typography,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import PaletteIcon from '@mui/icons-material/Palette';
import type { ColorBlindMode } from './utils/colorUtils'; // type-only import

type ThemeContextType = {
  mode: 'light' | 'dark';
  colorBlind: ColorBlindMode;
  setColorBlindMode: (mode: ColorBlindMode) => void;
  toggleColorMode: () => void;
};

type AccessiblePalette = {
  primary: { main: string; contrastText: string };
  secondary: { main: string; contrastText: string };
  background: { default: string; paper: string };
  text: { primary: string; secondary: string };
};

const accessiblePalettes: Record<'light' | 'dark', Record<'default' | 'protanopia' | 'deuteranopia' | 'tritanopia', AccessiblePalette>> = {
  light: {
    default: {
      primary: { main: '#2563eb', contrastText: '#ffffff' },
      secondary: { main: '#9333ea', contrastText: '#ffffff' },
      background: { default: '#f8fafc', paper: '#ffffff' },
      text: { primary: '#111827', secondary: '#475569' },
    },
    protanopia: {
      primary: { main: '#2563eb', contrastText: '#ffffff' },
      secondary: { main: '#f9bc3b', contrastText: '#111827' },
      background: { default: '#f8fbff', paper: '#ffffff' },
      text: { primary: '#111827', secondary: '#475569' },
    },
    deuteranopia: {
      primary: { main: '#2563eb', contrastText: '#ffffff' },
      secondary: { main: '#f27b22', contrastText: '#111827' },
      background: { default: '#f8fbff', paper: '#ffffff' },
      text: { primary: '#111827', secondary: '#475569' },
    },
    tritanopia: {
      primary: { main: '#8e24aa', contrastText: '#ffffff' },
      secondary: { main: '#fca311', contrastText: '#111827' },
      background: { default: '#f7f7fb', paper: '#ffffff' },
      text: { primary: '#111827', secondary: '#475569' },
    },
  },
  dark: {
    default: {
      primary: { main: '#93c5fd', contrastText: '#0f172a' },
      secondary: { main: '#c4b5fd', contrastText: '#0f172a' },
      background: { default: '#121826', paper: '#1f2937' },
      text: { primary: '#e2e8f0', secondary: '#94a3b8' },
    },
    protanopia: {
      primary: { main: '#60a5fa', contrastText: '#0f172a' },
      secondary: { main: '#facc15', contrastText: '#0f172a' },
      background: { default: '#0f172a', paper: '#1e293b' },
      text: { primary: '#e2e8f0', secondary: '#94a3b8' },
    },
    deuteranopia: {
      primary: { main: '#60a5fa', contrastText: '#0f172a' },
      secondary: { main: '#fb923c', contrastText: '#0f172a' },
      background: { default: '#0f172a', paper: '#1f2937' },
      text: { primary: '#e2e8f0', secondary: '#94a3b8' },
    },
    tritanopia: {
      primary: { main: '#c084fc', contrastText: '#0f172a' },
      secondary: { main: '#fbbf24', contrastText: '#0f172a' },
      background: { default: '#101827', paper: '#1f2937' },
      text: { primary: '#e2e8f0', secondary: '#cbd5e1' },
    },
  },
};

const getAccessiblePalette = (
  mode: 'light' | 'dark',
  colorBlind: ColorBlindMode,
): AccessiblePalette => {
  const key = colorBlind === false ? 'default' : colorBlind
  return accessiblePalettes[mode][key]
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  colorBlind: false,
  setColorBlindMode: () => { },
  toggleColorMode: () => { },
});

export const useColorMode = () => useContext(ThemeContext);

export const CustomThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [colorBlind, setColorBlind] = useState<ColorBlindMode>(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  // Load saved preferences
  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode') as 'light' | 'dark' | null;
    const savedColorBlind = localStorage.getItem('colorBlindMode');

    if (savedMode) setMode(savedMode);
    if (savedColorBlind)
      setColorBlind(
        savedColorBlind === 'default'
          ? false
          : (savedColorBlind as ColorBlindMode),
      );
  }, []);

  // Persist preferences
  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
    localStorage.setItem('themeMode', mode);
    localStorage.setItem('colorBlindMode', colorBlind === false ? 'default' : colorBlind);
  }, [mode, colorBlind]);

  const toggleColorMode = () => setMode(prev => (prev === 'light' ? 'dark' : 'light'));
  const setColorBlindMode = (mode: ColorBlindMode) => setColorBlind(mode);

  const accessiblePalette = useMemo(
    () => getAccessiblePalette(mode, colorBlind),
    [mode, colorBlind],
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: accessiblePalette.primary,
          secondary: accessiblePalette.secondary,
          background: accessiblePalette.background,
          text: accessiblePalette.text,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
              },
            },
          },
        },
      }),
    [mode, accessiblePalette],
  );

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--app-background', theme.palette.background.default,
    );
    document.documentElement.style.setProperty(
      '--app-paper', theme.palette.background.paper,
    );
    document.documentElement.style.setProperty(
      '--app-text-primary', theme.palette.text.primary,
    );
    document.documentElement.style.setProperty(
      '--app-text-secondary', theme.palette.text.secondary,
    );
    document.documentElement.style.setProperty(
      '--app-primary', theme.palette.primary.main,
    );
    document.documentElement.style.setProperty(
      '--app-secondary', theme.palette.secondary.main,
    );
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ mode, colorBlind, setColorBlindMode, toggleColorMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}

        {/* Accessibility FAB */}
        <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
          <Fab color="secondary" aria-label="accessibility menu" onClick={openMenu}>
            <AccessibilityNewIcon />
          </Fab>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={closeMenu}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            PaperProps={{ sx: { minWidth: 200 } }}
          >
            {/* Dark Mode Toggle */}
            <MenuItem onClick={() => { toggleColorMode(); closeMenu(); }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                {mode === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  {mode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                </Typography>
              </Box>
            </MenuItem>

            <Divider />

            {/* Color Blind Mode Header */}
            <MenuItem disabled sx={{ opacity: '1 !important' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaletteIcon fontSize="small" />
                <Typography variant="body2" fontWeight="bold">
                  Color Blind Mode
                </Typography>
              </Box>
            </MenuItem>

            {/* Color Blind Mode Options */}
            {(['default', 'protanopia', 'deuteranopia', 'tritanopia'] as const).map((cb) => (
              <MenuItem
                key={cb}
                selected={(colorBlind === false && cb === 'default') || colorBlind === cb}
                onClick={() => {
                  setColorBlindMode(cb === 'default' ? false : cb);
                  closeMenu();
                }}
              >
                <Typography variant="body2" sx={{ ml: 4, textTransform: 'capitalize' }}>
                  {cb}
                </Typography>
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};