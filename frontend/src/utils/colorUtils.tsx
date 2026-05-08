// src/utils/colorUtils.ts
import type { Theme } from '@mui/material/styles'

export type ColorBlindMode = false | 'protanopia' | 'deuteranopia' | 'tritanopia'

export const getCellColor = (
    key: string,
    selected: Set<string>,
    slotCount: Record<string, number>,
    maxCount: number,
    theme: Theme,
) => {
    const mine = selected.has(key)
    const count = slotCount[key] ?? 0
    const isDark = theme.palette.mode === 'dark'
    const primaryColor = theme.palette.primary.main
    const secondaryColor = theme.palette.secondary.main

    const overlap = mine && count > 1

    if (overlap) return secondaryColor
    if (mine) return primaryColor
    if (count > 0) {
        const intensity = 0.18 + (count / maxCount) * 0.4
        // For tritanopia, use neutral gray instead of blue to avoid clashing with purple/yellow
        if (primaryColor === '#7e22ce' || primaryColor === '#d8b4fe') {
            // Tritanopia: use neutral gray intensity
            return `rgba(${isDark ? '180,180,180' : '50,50,50'}, ${intensity})`
        }
        // Other modes: use primary color with intensity
        return `rgba(${primaryColor === '#2563eb' ? '37,99,235' : '96,165,250'}, ${intensity})`
    }
    return isDark ? '#26272d' : '#f1f5f9'
}

export const getGroupCellColor = (
    key: string,
    slotCount: Record<string, number>,
    maxCount: number,
    theme: Theme,
) => {
    const count = slotCount[key] ?? 0
    const isDark = theme.palette.mode === 'dark'
    const primaryColor = theme.palette.primary.main

    if (count === 0) return isDark ? '#1c1c1e' : '#f0f2f5'
    
    const intensity = 0.18 + (count / maxCount) * 0.5
    // For tritanopia, use neutral gray instead of blue
    if (primaryColor === '#7e22ce' || primaryColor === '#d8b4fe') {
        // Tritanopia: use neutral gray gradientrgba
        return `rgba(${isDark ? '50, 160, 80' : '50, 160, 80'}, ${intensity})`
    }
    // Other modes: use primary color with intensity
    return `rgba(${primaryColor === '#2563eb' ? '37,99,235' : '96,165,250'}, ${intensity})`
}
