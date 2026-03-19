import { Box } from '@mui/material';
import EventGrid from '../components/EventGrid';

export default function Event() {
    const selectedDays = ["2026-03-20", "2026-03-21"];
    const selectedTimeSlots = ["09:00", "09:30", "10:00"];

    return (
        <Box>
            <EventGrid days={selectedDays} timeSlots={selectedTimeSlots} />
        </Box>
    )
}
