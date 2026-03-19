import { useState } from 'react'
import { useNavigate } from 'react-router'
import {
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import ShareIcon from '@mui/icons-material/Share'
import GroupIcon from '@mui/icons-material/Group'

interface Participant {
  name: string
  availability: Set<string>
}

const MOCK_EVENT = {
  id: 'richard-pham',
  name: 'Richard Pham',
  dateRange: { start: '2026-03-18', end: '2026-03-28' },
  timeRange: { start: 9, end: 17 },
}

const getDates = (start: string, end: string) => {
  const dates: string[] = []
  const cur = new Date(start)
  const last = new Date(end)
  while (cur <= last) {
    dates.push(cur.toISOString().slice(0, 10))
    cur.setDate(cur.getDate() + 1)
  }
  return dates
}

const fmtHour = (h: number) =>
  h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`
const fmtDate = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

export default function EventPage() {
  const navigate = useNavigate()
  const event = MOCK_EVENT
  const dates = getDates(event.dateRange.start, event.dateRange.end)
  const hours = Array.from(
    { length: event.timeRange.end - event.timeRange.start },
    (_, i) => event.timeRange.start + i,
  )

  const [participants, setParticipants] = useState<Participant[]>([])
  const [currentName, setCurrentName] = useState('')
  const [tempName, setTempName] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [dragging, setDragging] = useState(false)
  const [dragAdding, setDragAdding] = useState(true)
  const [copied, setCopied] = useState(false)
  const [joined, setJoined] = useState(false)
  const [editingName, setEditingName] = useState(false)

  const eventUrl = `${window.location.origin}/event/${event.id}`

  const slotCount: Record<string, number> = {}
  participants.forEach((p) =>
    p.availability.forEach((s) => {
      slotCount[s] = (slotCount[s] ?? 0) + 1
    }),
  )
  const maxCount = Math.max(0, ...Object.values(slotCount))

  const saveSlots = (newSelected: Set<string>) => {
    if (!currentName) return
    setParticipants((prev) => {
      const idx = prev.findIndex(
        (p) => p.name.toLowerCase() === currentName.toLowerCase(),
      )
      const updated = { name: currentName, availability: newSelected }
      return idx !== -1
        ? prev.map((p, i) => (i === idx ? updated : p))
        : [...prev, updated]
    })
  }

  const toggleSlot = (slot: string, adding: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (adding) next.add(slot)
      else next.delete(slot)
      saveSlots(next)
      return next
    })
  }

  const handleJoin = () => {
    if (!tempName.trim()) return
    const name = tempName.trim()
    setCurrentName(name)
    setJoined(true)
    const existing = participants.find(
      (p) => p.name.toLowerCase() === name.toLowerCase(),
    )
    if (existing) setSelected(new Set(existing.availability))
  }

  const handleSaveName = () => {
    setParticipants((prev) =>
      prev.map((p) =>
        p.name.toLowerCase() === currentName.toLowerCase()
          ? { ...p, name: tempName.trim() }
          : p,
      ),
    )
    setCurrentName(tempName.trim())
    setEditingName(false)
  }

  const cellColor = (slot: string) => {
    const mine = selected.has(slot)
    const count = slotCount[slot] ?? 0
    if (mine && count > 1) return '#4ade80'
    if (mine) return '#818cf8'
    if (count > 0) return `rgba(99,102,241,${0.15 + (count / maxCount) * 0.3})`
    return '#f1f5f9'
  }

  return (
    <Box
      sx={{ minHeight: '100vh', bgcolor: '#f0f4f8', pb: 6 }}
      onMouseUp={() => setDragging(false)}
    >
      {/* Top bar */}
      <Box
        sx={{
          bgcolor: 'white',
          borderBottom: '1px solid #e5e7eb',
          px: 3,
          py: 1.5,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{ textTransform: 'none', color: 'text.primary' }}
          >
            Back to Home
          </Button>
          <Button
            variant="contained"
            startIcon={<ShareIcon />}
            onClick={() => {
              navigator.clipboard.writeText(eventUrl)
              setCopied(true)
            }}
            sx={{
              textTransform: 'none',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              borderRadius: 2,
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5, #9333ea)',
              },
            }}
          >
            Share Event
          </Button>
        </Stack>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 3 }}>
        {/* Name prompt */}
        {!joined && (
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 3,
              maxWidth: 400,
              mx: 'auto',
              mb: 3,
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" fontWeight={600} mb={1}>
              What's your name?
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Enter your name to mark your availability
            </Typography>
            <Stack spacing={2}>
              <TextField
                size="small"
                label="Your name"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                fullWidth
                autoFocus
              />
              <Button
                variant="contained"
                disableElevation
                disabled={!tempName.trim()}
                onClick={handleJoin}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Continue
              </Button>
            </Stack>
          </Paper>
        )}

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          alignItems="flex-start"
        >
          {/* Left */}
          <Box flex={1} minWidth={0}>
            {/* Event info */}
            <Paper elevation={1} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
              <Typography variant="h4" fontWeight={700} color="primary" mb={1}>
                {event.name}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <CalendarTodayIcon
                    sx={{ fontSize: 16, color: 'text.secondary' }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {fmtDate(event.dateRange.start)}
                    {event.dateRange.start !== event.dateRange.end &&
                      ` – ${fmtDate(event.dateRange.end)}`}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <AccessTimeIcon
                    sx={{ fontSize: 16, color: 'text.secondary' }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {fmtHour(event.timeRange.start)} –{' '}
                    {fmtHour(event.timeRange.end)}
                  </Typography>
                </Stack>
              </Stack>
            </Paper>

            {/* Grid */}
            <Paper elevation={1} sx={{ p: 3, borderRadius: 3 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                mb={2}
              >
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Select Your Availability
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Click and drag to mark when you're available
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1.5}>
                  {[
                    ['#818cf8', 'Your availability'],
                    ['#4ade80', 'Group overlap'],
                  ].map(([color, label]) => (
                    <Stack
                      key={label}
                      direction="row"
                      spacing={0.5}
                      alignItems="center"
                    >
                      <Box
                        sx={{
                          width: 14,
                          height: 14,
                          borderRadius: 0.5,
                          bgcolor: color,
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {label}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Stack>

              <Box sx={{ overflowX: 'auto' }}>
                <Box
                  sx={{
                    display: 'grid',
                    // Change this line in the grid
                    gridTemplateColumns: `72px repeat(${dates.length}, minmax(110px, 1fr))`,
                    gap: '1px',
                    userSelect: 'none',
                  }}
                >
                  <Box />
                  {dates.map((d) => (
                    <Box key={d} textAlign="center" sx={{ pb: 1 }}>
                      <Typography
                        variant="caption"
                        fontWeight={600}
                        display="block"
                      >
                        {new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                        })}
                      </Typography>
                      <Typography
                        variant="caption"
                        fontWeight={600}
                        display="block"
                      >
                        {new Date(d + 'T00:00:00').getDate()}
                      </Typography>
                    </Box>
                  ))}
                  {hours.map((h) => (
                    <>
                      <Typography
                        key={`l${h}`}
                        variant="caption"
                        color="text.secondary"
                        sx={{ pt: '6px', pr: 1, textAlign: 'right' }}
                      >
                        {fmtHour(h)}
                      </Typography>
                      {dates.map((d) => {
                        const slot = `${d}|${h}`
                        const who = participants
                          .filter((p) => p.availability.has(slot))
                          .map((p) => p.name)
                          .join(', ')
                        return (
                          <Tooltip
                            key={slot}
                            title={who || ''}
                            arrow
                            disableHoverListener={!who}
                          >
                            <Box
                              onMouseDown={() => {
                                if (!currentName) return
                                const adding = !selected.has(slot)
                                setDragAdding(adding)
                                setDragging(true)
                                toggleSlot(slot, adding)
                              }}
                              onMouseEnter={() => {
                                if (dragging) toggleSlot(slot, dragAdding)
                              }}
                              sx={{
                                height: 36,
                                borderRadius: 1,
                                bgcolor: cellColor(slot),
                                border: '1px solid #e2e8f0',
                                cursor: currentName ? 'pointer' : 'default',
                                '&:hover': currentName ? { opacity: 0.8 } : {},
                              }}
                            />
                          </Tooltip>
                        )
                      })}
                    </>
                  ))}
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* Sidebar */}
          <Box sx={{ width: { xs: '100%', md: 260 }, flexShrink: 0 }}>
            {/* Signed in */}
            <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, mb: 2 }}>
              {currentName ? (
                <>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    mb={1.5}
                  >
                    <Avatar
                      sx={{
                        bgcolor: '#6366f1',
                        width: 36,
                        height: 36,
                        fontSize: 16,
                      }}
                    >
                      {currentName[0].toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Signed in as
                      </Typography>
                      <Typography fontWeight={600}>{currentName}</Typography>
                    </Box>
                  </Stack>
                  {editingName ? (
                    <Stack spacing={1}>
                      <TextField
                        size="small"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        fullWidth
                        autoFocus
                      />
                      <Button
                        size="small"
                        variant="contained"
                        disableElevation
                        onClick={handleSaveName}
                        sx={{ textTransform: 'none' }}
                      >
                        Save
                      </Button>
                    </Stack>
                  ) : (
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setEditingName(true)
                        setTempName(currentName)
                      }}
                      sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                      Change Name
                    </Button>
                  )}
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Enter your name above to get started.
                </Typography>
              )}
            </Paper>

            {/* Participants */}
            <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3 }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <GroupIcon color="primary" />
                <Typography fontWeight={700}>
                  Participants ({participants.length})
                </Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              {participants.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.disabled"
                  textAlign="center"
                  py={2}
                >
                  No participants yet
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {participants.map((p) => (
                    <Box
                      key={p.name}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor:
                          p.name.toLowerCase() === currentName.toLowerCase()
                            ? '#eef2ff'
                            : 'transparent',
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: '#6366f1',
                          width: 30,
                          height: 30,
                          fontSize: 13,
                        }}
                      >
                        {p.name[0].toUpperCase()}
                      </Avatar>
                      <Box>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                        >
                          <Typography variant="body2" fontWeight={600}>
                            {p.name}
                          </Typography>
                          {p.name.toLowerCase() ===
                            currentName.toLowerCase() && (
                            <Typography variant="caption" color="primary">
                              (You)
                            </Typography>
                          )}
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {p.availability.size} slot
                          {p.availability.size !== 1 ? 's' : ''} selected
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>
          </Box>
        </Stack>
      </Container>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message="Link copied!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  )
}
