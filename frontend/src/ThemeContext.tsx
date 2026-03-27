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
  Switch,
  Select,
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
            <MenuItem>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
                  {mode === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
                  <Typography variant="body2" noWrap>
                    Dark Mode
                  </Typography>
                </Box>
                <Switch checked={mode === 'dark'} onChange={toggleColorMode} />
              </Box>
            </MenuItem>

            {/* Color Blind Mode Dropdown */}
            <MenuItem>
              <Box sx={{ display: 'flex', flexDirection: 'column', width: 200, gap: 0.5 }}>
                {/* Label with icon */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PaletteIcon fontSize="small" />
                  <Typography variant="body2" noWrap>
                    Color Blind Mode
                  </Typography>
                </Box>

                {/* Dropdown opens below label */}
                <Select
                  value={colorBlind === false ? 'default' : colorBlind}
                  size="small"
                  onChange={(e) => {
                    const value = e.target.value as 'default' | 'protanopia' | 'deuteranopia' | 'tritanopia';
                    setColorBlindMode(value === 'default' ? false : value);
                  }}
                  sx={{
                    minWidth: 200, // keeps width fixed
                  }}
                >
                  <MenuItem value="default">Default</MenuItem>
                  <MenuItem value="protanopia">Protanopia</MenuItem>
                  <MenuItem value="deuteranopia">Deuteranopia</MenuItem>
                  <MenuItem value="tritanopia">Tritanopia</MenuItem>
                </Select>
              </Box>
            </MenuItem>
          </Menu>
        </Box>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};