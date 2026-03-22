import { useEffect, useState, Fragment } from 'react'
import { useNavigate, useParams } from 'react-router'
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
import { useTheme } from '@mui/material/styles'

const API = 'http://localhost:5001/api'

interface Event {
  id: number
  title: string
  description: string
  start_time: string
  end_time: string
}

interface Participant {
  id: number
  username: string
  event_id: number
}

interface Timeslot {
  id: number
  participant_id: number
  start_time: string
  username: string
}

const fmtSlot = (slot: string) => {
  const [h, m] = slot.split(':').map(Number)
  const period = h < 12 ? 'AM' : 'PM'
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h
  return m === 0
    ? `${hour} ${period}`
    : `${hour}:${String(m).padStart(2, '0')} ${period}`
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

export default function EventPage() {
  const navigate = useNavigate()
  const { eventID } = useParams()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const [event, setEvent] = useState<Event | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [timeslots, setTimeslots] = useState<Timeslot[]>([])
  const [
    currentParticipant,
    setCurrentParticipant,
  ] = useState<Participant | null>(null)
  const [tempName, setTempName] = useState('')
  const [joined, setJoined] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [dragAdding, setDragAdding] = useState(true)
  const [dragStart, setDragStart] = useState<string | null>(null)
  const [dragEnd, setDragEnd] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Derive dates and 15-min slots from event
  const dates: string[] = []
  const slots: string[] = []

  if (event) {
    const cur = new Date(event.start_time)
    const last = new Date(event.end_time)
    while (cur <= last) {
      dates.push(cur.toISOString().slice(0, 10))
      cur.setDate(cur.getDate() + 1)
    }
    const startH = new Date(event.start_time).getHours()
    const endH = new Date(event.end_time).getHours()
    for (let h = startH; h < endH; h++) {
      slots.push(`${String(h).padStart(2, '0')}:00`)
      slots.push(`${String(h).padStart(2, '0')}:15`)
      slots.push(`${String(h).padStart(2, '0')}:30`)
      slots.push(`${String(h).padStart(2, '0')}:45`)
    }
    slots.push(`${String(endH).padStart(2, '0')}:00`)
  }

  // Derive selected from timeslots
  const selected = new Set(
    timeslots
      .filter((t) => t.participant_id === currentParticipant?.id)
      .map((t) => t.start_time.slice(0, 16)),
  )

  useEffect(() => {
    if (!eventID) return
    fetch(`${API}/events/${eventID}`)
      .then((r) => r.json())
      .then((data) => setEvent(data.event ?? data))
    fetch(`${API}/participants/event/${eventID}`)
      .then((r) => r.json())
      .then((data) => setParticipants(data.participants ?? data))
    fetch(`${API}/timeslots/event/${eventID}`)
      .then((r) => r.json())
      .then((data) => setTimeslots(data.slots ?? data.timeslots ?? data))
  }, [eventID])

  const slotKey = (date: string, slot: string) => `${date}T${slot}`

  const slotCount: Record<string, number> = {}
  timeslots.forEach((t) => {
    if (!t.start_time) return
    const key = t.start_time.slice(0, 16)
    slotCount[key] = (slotCount[key] ?? 0) + 1
  })
  const maxCount = Math.max(0, ...Object.values(slotCount))

  const getSlotIndex = (slot: string) => {
    const [date, timePart] = slot.split('T')
    return {
      dateIdx: dates.indexOf(date),
      slotIdx: slots.indexOf(timePart),
    }
  }

  const getSlotsInRect = (s1: string, s2: string) => {
    const p1 = getSlotIndex(s1)
    const p2 = getSlotIndex(s2)
    const minD = Math.min(p1.dateIdx, p2.dateIdx),
      maxD = Math.max(p1.dateIdx, p2.dateIdx)
    const minS = Math.min(p1.slotIdx, p2.slotIdx),
      maxS = Math.max(p1.slotIdx, p2.slotIdx)
    const result: string[] = []
    for (let i = minD; i <= maxD; i++)
      for (let j = minS; j <= maxS; j++)
        result.push(slotKey(dates[i], slots[j]))
    return result
  }

  const previewSlots =
    dragging && dragStart && dragEnd ? getSlotsInRect(dragStart, dragEnd) : []

  const handleJoin = async () => {
    if (!tempName.trim() || !event) return
    const res = await fetch(`${API}/participants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: tempName.trim(), event_id: event.id }),
    })
    const data = await res.json()
    const participant = data.participant ?? data
    setCurrentParticipant(participant)
    setParticipants((prev) =>
      prev.find((p) => p.id === participant.id) ? prev : [...prev, participant],
    )
    setJoined(true)
  }

  const handleSaveName = async () => {
    if (!tempName.trim() || !currentParticipant) return
    const res = await fetch(`${API}/participants/${currentParticipant.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: tempName.trim() }),
    })
    const data = await res.json()
    console.log('update name response:', data)
    setCurrentParticipant((prev) =>
      prev ? { ...prev, username: tempName.trim() } : prev,
    )
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === currentParticipant.id
          ? { ...p, username: tempName.trim() }
          : p,
      ),
    )
    setEditingName(false)
  }

  const applySlots = async (slotsToApply: string[], adding: boolean) => {
    if (!currentParticipant || !event) return

    if (adding) {
      const newSlotKeys = slotsToApply.filter((s) => !selected.has(s))
      if (newSlotKeys.length === 0) return

      const optimisticSlots = newSlotKeys.map((s) => ({
        id: -Math.random(),
        participant_id: currentParticipant.id,
        start_time: `${s}:00Z`,
        username: currentParticipant.username,
      }))
      setTimeslots((prev) => [...prev, ...optimisticSlots])

      for (const s of newSlotKeys) {
        try {
          const res = await fetch(`${API}/timeslots`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              participant_id: currentParticipant.id,
              event_id: event.id,
              start_time: `${s}:00Z`,
            }),
          })
          const data = await res.json()
          const realSlot = data.slot ?? data.timeslot
          if (realSlot) {
            setTimeslots((prev) =>
              prev.map((t) =>
                t.start_time === `${s}:00Z` &&
                t.participant_id === currentParticipant.id &&
                t.id < 0
                  ? { ...realSlot, username: currentParticipant.username }
                  : t,
              ),
            )
          }
        } catch (err) {
          console.error('timeslot error:', err)
        }
      }
    } else {
      const slotsToRemove = slotsToApply.filter((s) => selected.has(s))
      if (slotsToRemove.length === 0) return

      setTimeslots((prev) =>
        prev.filter((t) => {
          const key = t.start_time.slice(0, 16)
          return !(
            t.participant_id === currentParticipant.id &&
            slotsToRemove.includes(key)
          )
        }),
      )

      for (const s of slotsToRemove) {
        const timeslot = timeslots.find(
          (t) =>
            t.participant_id === currentParticipant.id &&
            t.start_time.slice(0, 16) === s &&
            t.id > 0,
        )
        if (timeslot) {
          await fetch(`${API}/timeslots/${timeslot.id}`, { method: 'DELETE' })
        }
      }
    }
  }

  const cellColor = (key: string) => {
    const mine = selected.has(key)
    const count = slotCount[key] ?? 0
    if (mine && count > 1) return '#4ade80'
    if (mine) return '#fb923c'
    if (count > 0) return `rgba(249,115,22,${0.15 + (count / maxCount) * 0.3})`
    return isDark ? '#1e293b' : '#f1f5f9'
  }

  const groupCellColor = (key: string) => {
    const count = slotCount[key] ?? 0
    if (count === 0) return isDark ? '#1e293b' : '#f1f5f9'
    return `rgba(249,115,22,${0.15 + (count / maxCount) * 0.85})`
  }

  const whoIsAvailable = (key: string) =>
    timeslots
      .filter((t) => t.start_time.slice(0, 16) === key)
      .map((t) => t.username)
      .join(', ')

  const getTopSlots = () =>
    Object.entries(slotCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([slot, count]) => {
        const [datePart, timePart] = slot.split('T')
        const date = new Date(datePart + 'T00:00:00')
        return {
          label: `${date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })} at ${fmtSlot(timePart)}`,
          count,
          percentage: Math.round((count / participants.length) * 100),
        }
      })

  const renderGrid = (interactive: boolean) => (
    <Box sx={{ overflowX: 'auto' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `64px repeat(${dates.length}, minmax(80px, 1fr))`,
          gap: '1px',
          userSelect: 'none',
        }}
      >
        <Box />
        {dates.map((d) => (
          <Box key={d} textAlign="center" sx={{ pb: 1 }}>
            <Typography variant="caption" fontWeight={600} display="block">
              {new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
              })}
            </Typography>
            <Typography variant="caption" fontWeight={600} display="block">
              {new Date(d + 'T00:00:00').getDate()}
            </Typography>
          </Box>
        ))}
        {slots.map((s) => (
          <Fragment key={s}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                pt: '2px',
                pr: 1,
                textAlign: 'right',
                fontSize: '0.65rem',
                lineHeight: 1,
              }}
            >
              {s.endsWith(':00') || s.endsWith(':30') ? fmtSlot(s) : ''}
            </Typography>
            {dates.map((d) => {
              const key = slotKey(d, s)
              const who = whoIsAvailable(key)
              const count = slotCount[key] ?? 0
              const percentage =
                maxCount > 0 ? Math.round((count / maxCount) * 100) : 0
              const inPreview = previewSlots.includes(key)
              const bgColor = interactive ? cellColor(key) : groupCellColor(key)
              const label = interactive
                ? who
                : `${count} available${maxCount > 0 ? ` (${percentage}%)` : ''}`
              return (
                <Tooltip
                  key={key}
                  title={label}
                  arrow
                  disableHoverListener={!who && !count}
                >
                  <Box
                    onMouseDown={
                      interactive
                        ? () => {
                            if (!currentParticipant) return
                            setDragAdding(!selected.has(key))
                            setDragStart(key)
                            setDragging(true)
                          }
                        : undefined
                    }
                    onMouseEnter={
                      interactive
                        ? () => {
                            if (dragging) setDragEnd(key)
                          }
                        : undefined
                    }
                    sx={{
                      height: 18,
                      borderRadius: 0.5,
                      bgcolor: bgColor,
                      border: inPreview
                        ? '2px solid #f97316'
                        : `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                      boxSizing: 'border-box',
                      cursor:
                        interactive && currentParticipant
                          ? 'pointer'
                          : 'default',
                      '&:hover':
                        interactive && currentParticipant
                          ? { opacity: 0.8 }
                          : {},
                    }}
                  />
                </Tooltip>
              )
            })}
          </Fragment>
        ))}
      </Box>
    </Box>
  )

  if (!event)
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography>Loading...</Typography>
      </Box>
    )

  return (
    <Box
      sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}
      onMouseUp={() => {
        if (dragging && dragStart && dragEnd)
          applySlots(getSlotsInRect(dragStart, dragEnd), dragAdding)
        setDragging(false)
        setDragStart(null)
        setDragEnd(null)
      }}
    >
      {/* Top bar */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
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
              navigator.clipboard.writeText(window.location.href)
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
              <Typography variant="h4" fontWeight={700} sx={{ color: '#9333ea' }} mb={1}>
                {event.title}
              </Typography>
              {event.description && (
                <Typography color="text.secondary" mb={1}>
                  {event.description}
                </Typography>
              )}
              <Stack direction="row" spacing={2}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <CalendarTodayIcon
                    sx={{ fontSize: 16, color: 'text.secondary' }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {fmtDate(event.start_time)} – {fmtDate(event.end_time)}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <AccessTimeIcon
                    sx={{ fontSize: 16, color: 'text.secondary' }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {fmtSlot(
                      `${String(new Date(event.start_time).getHours()).padStart(
                        2,
                        '0',
                      )}:00`,
                    )}{' '}
                    –{' '}
                    {fmtSlot(
                      `${String(new Date(event.end_time).getHours()).padStart(
                        2,
                        '0',
                      )}:00`,
                    )}
                  </Typography>
                </Stack>
              </Stack>
            </Paper>

            {/* Grid */}
            <Paper elevation={1} sx={{ p: 3, borderRadius: 3 }}>
              <Stack gap="16px">
                {currentParticipant && (
                  <>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          Select Your Availability
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Click and drag to mark when you're available
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Box
                          sx={{
                            width: 14,
                            height: 14,
                            borderRadius: 0.5,
                            bgcolor: '#fb923c',
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Your availability
                        </Typography>
                      </Stack>
                    </Stack>
                    {renderGrid(true)}
                    <Divider />
                  </>
                )}
                <Typography variant="h6" fontWeight={600}>
                  Group Availability
                </Typography>
                {renderGrid(false)}

                <Divider />
              </Stack>
            </Paper>
          </Box>

          {/* Sidebar */}
          <Box sx={{ width: { xs: '100%', md: 260 }, flexShrink: 0 }}>
            <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, mb: 2 }}>
              {currentParticipant ? (
                <>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    mb={1.5}
                  >
                    <Avatar
                      sx={{
                        bgcolor: '#f97316',
                        width: 36,
                        height: 36,
                        fontSize: 16,
                      }}
                    >
                      {currentParticipant.username[0].toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Signed in as
                      </Typography>
                      <Typography fontWeight={600}>
                        {currentParticipant.username}
                      </Typography>
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
                        setTempName(currentParticipant.username)
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

            <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3 }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={4}>
                <GroupIcon sx={{ color: '#f97316' }} />
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
                      key={p.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor:
                          p.id === currentParticipant?.id
                            ? isDark
                              ? 'rgba(249, 115, 22, 0.15)'
                              : '#fff7ed'
                            : 'transparent',
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: '#f97316',
                          width: 30,
                          height: 30,
                          fontSize: 13,
                        }}
                      >
                        {p.username[0].toUpperCase()}
                      </Avatar>
                      <Box>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                        >
                          <Typography variant="body2" fontWeight={600}>
                            {p.username}
                          </Typography>
                          {p.id === currentParticipant?.id && (
                            <Typography variant="caption" sx={{ color: '#f97316' }}>
                              (You)
                            </Typography>
                          )}
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {
                            timeslots.filter((t) => t.participant_id === p.id)
                              .length
                          }{' '}
                          slots selected
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>

            {/* Top 5 Best Times — ADD HERE */}
            <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, mt: 2 }}>
              <Typography fontWeight={700} mb={2}>
                Top 5 Best Times
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {Object.keys(slotCount).length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.disabled"
                  textAlign="center"
                  py={2}
                >
                  No availability yet
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {getTopSlots().map((slot, i) => (
                    <Box
                      key={i}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor:
                          i === 0 ? 'rgba(249,115,22,0.08)' : 'transparent',
                        border:
                          i === 0
                            ? '1px solid #fed7aa'
                            : '1px solid transparent',
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        mb={0.5}
                      >
                        <Typography
                          fontWeight={700}
                          sx={{ color: '#f97316' }}
                          variant="caption"
                        >
                          #{i + 1}
                        </Typography>
                        <Typography variant="caption" fontWeight={600}>
                          {slot.label}
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box
                          sx={{
                            flex: 1,
                            height: 5,
                            borderRadius: 3,
                            bgcolor: '#e2e8f0',
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              height: '100%',
                              width: `${slot.percentage}%`,
                              bgcolor: '#6366f1',
                              borderRadius: 3,
                            }}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {slot.percentage}%
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {slot.count}/{participants.length} available
                      </Typography>
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
