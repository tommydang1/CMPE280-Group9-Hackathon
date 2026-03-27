// src/utils/colorUtils.ts
export type ColorBlindMode = false | 'protanopia' | 'deuteranopia' | 'tritanopia'

export const getCellColor = (
    key: string,
    selected: Set<string>,
    slotCount: Record<string, number>,
    maxCount: number,
    colorBlind: ColorBlindMode,
    isDark: boolean
) => {
    const mine = selected.has(key)
    const count = slotCount[key] ?? 0

    const overlap = mine && count > 1

    switch (colorBlind) {
        case 'protanopia':
            if (overlap) return '#c7bc24'
            if (mine) return '#1976D2'
            // darker pink for better visibility
            if (count > 0) return `rgba(49,130,206,${0.18 + (count / maxCount) * 0.4})`
            // use default dark background color to stay consistent with default mode
            return isDark ? '#26272d' : '#f1f5f9'

        case 'deuteranopia':
            if (overlap) return '#D55E00'
            if (mine) return '#0072B2'
            // blue-based for intensity, avoids red-green contrast issues
            if (count > 0) return `rgba(0,120,200,${0.18 + (count / maxCount) * 0.4})`
            return isDark ? '#26272d' : '#f1f5f9'

        case 'tritanopia':
            if (overlap) return '#E91E63'
            if (mine) return '#8E24AA'
            // darker orange for better visibility
            if (count > 0) return `rgba(200,110,0,${0.18 + (count / maxCount) * 0.4})`
            return isDark ? '#26272d' : '#f1f5f9'

        default:
            if (overlap) return '#6366f1'
            if (mine) return '#fb923c'
            if (count > 0) return `rgba(49,130,206,${0.18 + (count / maxCount) * 0.4})`
            // slightly lighter dark background for improved visibility in dark mode
            return isDark ? '#26272d' : '#f1f5f9'
    }
}

export const getGroupCellColor = (
    key: string,
    slotCount: Record<string, number>,
    maxCount: number,
    colorBlind: ColorBlindMode,
    isDark: boolean
) => {
    const count = slotCount[key] ?? 0
    switch (colorBlind) {
        case 'protanopia':
            if (count === 0) return isDark ? '#1c1c1e' : '#f0f2f5';
            // darker pink gradient
            return `rgba(49,130,206, ${0.15 + (count / maxCount) * 0.85})`; // darker pink gradient

        case 'deuteranopia':
            if (count === 0) return isDark ? '#1c1c1e' : '#f0f2f5';
            return `rgba(0, 120, 200, ${0.18 + (count / maxCount) * 0.5})`; // stronger blue gradient

        case 'tritanopia':
            if (count === 0) return isDark ? '#26272d' : '#f0f2f5';
            return `rgba(200, 110, 0, ${0.18 + (count / maxCount) * 0.5})`; // stronger darker orange gradient

        default:
            if (count === 0) return isDark ? '#26272d' : '#f0f2f5';
            return `rgba(49, 130, 206, ${0.18 + (count / maxCount) * 0.5})`; // stronger default blue gradient
    }
}