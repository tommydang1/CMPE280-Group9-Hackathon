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

  const theme = useMemo(() => {
    // Base colors
    let primary = { main: '#f97316' }; // default purple
    let secondary = { main: '#6366f1' }; // default orange

    // Color-blind overrides
    switch (colorBlind) {
      case 'protanopia':
        primary = { main: '#1976D2' };
        secondary = { main: '#c7bc24' };
        break;
      case 'deuteranopia':
        primary = { main: '#0072B2' };
        secondary = { main: '#D55E00' };
        break;
      case 'tritanopia':
        primary = { main: '#8E24AA' };
        secondary = { main: '#E91E63' };
        break;
      default:
        break;
    }

    return createTheme({
      palette: {
        mode,
        primary,
        secondary,
        background:
          mode === 'light'
            ? { default: '#f0f4f8', paper: '#ffffff' }
            : { default: '#121212', paper: '#1e1e1e' },
      },
    });
  }, [mode, colorBlind]);

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