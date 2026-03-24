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
            if (overlap) return '#F0E442'
            if (mine) return '#009E73'
            if (count > 0) return `rgba(0,158,115,${0.15 + (count / maxCount) * 0.3})`
            return isDark ? '#1c1c1e' : '#f1f5f9'

        case 'deuteranopia':
            if (overlap) return '#D55E00'
            if (mine) return '#0072B2'
            if (count > 0) return `rgba(0,114,178,${0.15 + (count / maxCount) * 0.3})`
            return isDark ? '#1c1c1e' : '#f1f5f9'

        case 'tritanopia':
            if (overlap) return '#FFB000'
            if (mine) return '#56B4E9'
            if (count > 0) return `rgba(86,180,233,${0.15 + (count / maxCount) * 0.3})`
            return isDark ? '#1c1c1e' : '#f1f5f9'

        default:
            if (overlap) return '#6366f1'
            if (mine) return '#fb923c'
            if (count > 0) return `rgba(249,115,22,${0.15 + (count / maxCount) * 0.3})`
            return isDark ? '#1c1c1e' : '#f1f5f9'
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
            return `rgba(0, 170, 120, ${0.15 + (count / maxCount) * 0.85})`; // green-teal gradient

        case 'deuteranopia':
            if (count === 0) return isDark ? '#1c1c1e' : '#f0f2f5';
            return `rgba(0, 120, 200, ${0.15 + (count / maxCount) * 0.85})`; // blue gradient

        case 'tritanopia':
            if (count === 0) return isDark ? '#1c1c1e' : '#f0f2f5';
            return `rgba(90, 170, 230, ${0.15 + (count / maxCount) * 0.85})`; // cyan-blue gradient

        default:
            if (count === 0) return isDark ? '#1c1c1e' : '#f0f2f5';
            return `rgba(249, 115, 22, ${0.15 + (count / maxCount) * 0.85})`; // bright orange gradient
    }
}