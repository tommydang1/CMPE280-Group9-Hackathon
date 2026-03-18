import { useState } from 'react'
import { useNavigate } from 'react-router'
import {
  Box,
  Button,
  Container,
  Divider,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import AccessTimeIcon from '@mui/icons-material/AccessTime'

export default function CreateEventPage() {
  const navigate = useNavigate()
  const [eventName, setEventName] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [startTime, setStartTime] = useState(9)
  const [endTime, setEndTime] = useState(17)

  const handleCreate = () => {
    const eventId = eventName.toLowerCase().replace(/ /g, '-')
    navigate(`/event/${eventId}`)
  }

  const timeLabel = (i: number) =>
    i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, #eff6ff 0%, #fff 50%, #faf5ff 100%)',
      }}
    >
      <Container maxWidth="md" sx={{ py: 6 }}>
        {/* Header */}
        <Box textAlign="center" mb={5}>
          <Typography
            variant="h2"
            fontWeight={700}
            sx={{
              background: 'linear-gradient(90deg, #2563eb, #9333ea)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            When2Meet
          </Typography>
          <Typography color="text.secondary">
            Create an event to find the perfect time to meet
          </Typography>
        </Box>

        {/* Card */}
        <Box
          sx={{
            bgcolor: 'white',
            borderRadius: 3,
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb',
          }}
        >
          {/* Card Header */}
          <Box sx={{ px: 4, py: 3, borderBottom: '1px solid #e5e7eb' }}>
            <Typography variant="h5" fontWeight={600}>
              Create New Event
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Set up your event details and share the link with participants
            </Typography>
          </Box>

          {/* Card Body */}
          <Stack spacing={3} sx={{ px: 4, py: 4 }}>
            <TextField
              label="Event Name *"
              placeholder="e.g., Team Meeting, Study Session"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              fullWidth
            />

            <TextField
              label="Description (Optional)"
              placeholder="Add any additional details about the event..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={3}
              fullWidth
            />

            <Divider />

            {/* Date Range */}
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <CalendarMonthIcon sx={{ color: '#2563eb' }} />
                <Typography fontWeight={600}>Date Range *</Typography>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Stack>
            </Box>

            <Divider />

            {/* Time Range */}
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <AccessTimeIcon sx={{ color: '#9333ea' }} />
                <Typography fontWeight={600}>Time Range *</Typography>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Box flex={1}>
                  <Typography variant="body2" fontWeight={500} mb={0.5}>
                    Start Time
                  </Typography>
                  <Select
                    value={startTime}
                    onChange={(e) => setStartTime(Number(e.target.value))}
                    fullWidth
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <MenuItem key={i} value={i}>
                        {timeLabel(i)}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
                <Box flex={1}>
                  <Typography variant="body2" fontWeight={500} mb={0.5}>
                    End Time
                  </Typography>
                  <Select
                    value={endTime}
                    onChange={(e) => setEndTime(Number(e.target.value))}
                    fullWidth
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <MenuItem key={i} value={i}>
                        {timeLabel(i)}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
              </Stack>
            </Box>

            <Button
              onClick={handleCreate}
              fullWidth
              size="large"
              sx={{
                py: 1.5,
                background: 'linear-gradient(90deg, #2563eb, #9333ea)',
                color: 'white',
                fontWeight: 600,
                fontSize: '1rem',
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(90deg, #1d4ed8, #7e22ce)',
                },
              }}
            >
              Create Event
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  )
}
