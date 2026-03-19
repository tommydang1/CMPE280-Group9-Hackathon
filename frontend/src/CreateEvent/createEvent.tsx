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
const API = 'https://cmpe-280-group9-hackathon.vercel.app/api'
// const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

export default function CreateEventPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [startTime, setStartTime] = useState(9)
  const [endTime, setEndTime] = useState(17)
  const [loading, setLoading] = useState(false)

  const timeLabel = (i: number) =>
    i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`

  const toTimestamp = (date: string, hour: number) =>
    new Date(`${date}T${String(hour).padStart(2, '0')}:00:00`).toISOString()

  const handleCreate = async () => {
    if (!title.trim() || !startDate || !endDate) return
    setLoading(true)
    try {
      const res = await fetch(`${API}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          start_time: toTimestamp(startDate, startTime),
          end_time: toTimestamp(endDate, endTime),
        }),
      })
      const { event } = await res.json()
      console.log('event response:', event) //
      navigate(`/event/${event.id}`)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, #eff6ff 0%, #fff 50%, #faf5ff 100%)',
      }}
    >
      <Container maxWidth="md" sx={{ py: 6 }}>
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
            LinkUp
          </Typography>
          <Typography color="text.secondary">
            Create an event to find the perfect time to meet
          </Typography>
        </Box>

        <Box
          sx={{
            bgcolor: 'white',
            borderRadius: 3,
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb',
          }}
        >
          <Box sx={{ px: 4, py: 3, borderBottom: '1px solid #e5e7eb' }}>
            <Typography variant="h5" fontWeight={600}>
              Create New Event
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Set up your event details and share the link with participants
            </Typography>
          </Box>

          <Stack spacing={3} sx={{ px: 4, py: 4 }}>
            <TextField
              label="Event Title *"
              placeholder="e.g., Team Meeting, Study Session"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              disabled={loading || !title.trim() || !startDate || !endDate}
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
                '&:disabled': { opacity: 0.6, color: 'white' },
              }}
            >
              {loading ? 'Creating...' : 'Create Event'}
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  )
}
