import React, { useState, useEffect, useRef } from 'react';

// --- Types ---
type SlotId = string; // Format: "YYYY-MM-DD-HH:mm"
type SelectionMode = 'add' | 'remove' | null;

interface GridProps {
    days: string[];     // e.g., ["2026-03-20", "2026-03-21"]
    timeSlots: string[]; // e.g., ["09:00", "09:30", "10:00"]
}

const EventGrid: React.FC<GridProps> = ({ days, timeSlots }) => {
    // Use a Set for O(1) lookups - crucial for performance in large grids
    const [selectedSlots, setSelectedSlots] = useState<Set<SlotId>>(new Set());
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [selectionMode, setSelectionMode] = useState<SelectionMode>(null);

    const gridRef = useRef<HTMLDivElement>(null);

    // --- Logic ---

    const handlePointerDown = (id: SlotId): void => {
        setIsDragging(true);
        const mode: SelectionMode = selectedSlots.has(id) ? 'remove' : 'add';
        setSelectionMode(mode);
        updateSlot(id, mode);
    };

    const handlePointerMove = (e: React.PointerEvent): void => {
        if (!isDragging || !selectionMode) return;

        // "elementFromPoint" allows us to detect the slot under the finger/mouse 
        // even if the pointer started somewhere else.
        const element = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
        const id = element?.dataset?.slotId;

        if (id) {
            updateSlot(id, selectionMode);
        }
    };

    const updateSlot = (id: SlotId, mode: SelectionMode): void => {
        setSelectedSlots((prev) => {
            const next = new Set(prev);
            if (mode === 'add') next.add(id);
            else if (mode === 'remove') next.delete(id);
            return next;
        });
    };

    useEffect(() => {
        const handleGlobalUp = () => {
            setIsDragging(false);
            setSelectionMode(null);
        };
        window.addEventListener('pointerup', handleGlobalUp);
        return () => window.removeEventListener('pointerup', handleGlobalUp);
    }, []);

    // --- Render ---
    return (
        <div
            ref={gridRef}
            style={{
                display: 'grid',
                gridTemplateColumns: `80px repeat(${days.length}, 1fr)`,
                touchAction: 'none', // Critical: prevents the page from scrolling while "painting" slots
                userSelect: 'none'
            }}
            onPointerMove={handlePointerMove}
        >
            {/* Header Row */}
            <div />
            {days.map(day => (
                <div key={day} style={{ textAlign: 'center', fontWeight: 'bold', padding: '8px' }}>
                    {new Date(day).toLocaleDateString(undefined, { weekday: 'short', month: 'numeric', day: 'numeric' })}
                </div>
            ))}

            {/* Grid Body */}
            {timeSlots.map(time => (
                <React.Fragment key={time}>
                    <div style={{ fontSize: '12px', alignSelf: 'center', padding: '4px' }}>{time}</div>
                    {days.map(day => {
                        const id = `${day}-${time}`;
                        const isSelected = selectedSlots.has(id);
                        return (
                            <div
                                key={id}
                                data-slot-id={id} // Data attribute used by elementFromPoint
                                onPointerDown={() => handlePointerDown(id)}
                                style={{
                                    height: '35px',
                                    border: '0.5px solid #e2e8f0',
                                    backgroundColor: isSelected ? '#22c55e' : '#f8fafc',
                                    transition: 'background-color 0.05s linear'
                                }}
                            />
                        );
                    })}
                </React.Fragment>
            ))}
        </div>
    );
};

export default EventGrid;