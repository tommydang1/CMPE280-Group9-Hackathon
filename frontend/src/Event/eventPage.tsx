// src/pages/EventPage.tsx
import { useEffect, useState, Fragment } from 'react'
import { useNavigate, useParams } from 'react-router'
import EditIcon from '@mui/icons-material/Edit'
import IconButton from '@mui/material/IconButton'
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
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import { useTheme, alpha } from '@mui/material/styles'
import { useColorMode } from '../ThemeContext'
import { getCellColor, getGroupCellColor } from '../utils/colorUtils'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

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

// Format times
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
  // add with your other useState declarations
  const adminToken = localStorage.getItem(`adminToken-${eventID}`) || ''
  const isAdmin = Boolean(adminToken)
  const theme = useTheme()
  const { mode } = theme.palette
  const isDark = mode === 'dark'

  const { colorBlind } = useColorMode()

  const [event, setEvent] = useState<Event | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [timeslots, setTimeslots] = useState<Timeslot[]>([])
  const [
    currentParticipant,
    setCurrentParticipant,
  ] = useState<Participant | null>(() => {
    const saved = localStorage.getItem(`participant-${eventID}`)
    return saved ? JSON.parse(saved) : null
  })
  const [joined, setJoined] = useState(() => {
    return Boolean(localStorage.getItem(`participant-${eventID}`))
  })

  const [tempName, setTempName] = useState('')
  const [tempPassword, setTempPassword] = useState('')
  const [passwordRequired, setPasswordRequired] = useState(false)
  // const [joined, setJoined] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [dragAdding, setDragAdding] = useState(true)
  const [dragStart, setDragStart] = useState<string | null>(null)
  const [dragEnd, setDragEnd] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [focusedCell, setFocusedCell] = useState<{
    dateIdx: number
    slotIdx: number
  } | null>(null)

  // ── AI Magic Select State ──
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [aiSuccess, setAiSuccess] = useState('')
  // ── add these new state variables near your other useState declarations ──
  const [editMode, setEditMode] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editStart, setEditStart] = useState('')
  const [editEnd, setEditEnd] = useState('')
  const [editMsg, setEditMsg] = useState('')
  const [editLoading, setEditLoading] = useState(false)

  const toLocalFormat = (isoString: string) => {
    if (!isoString) return ''
    const d = new Date(isoString)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate(),
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  const handleEditOpen = () => {
    setEditTitle(event!.title)
    setEditStart(toLocalFormat(event!.start_time))
    setEditEnd(toLocalFormat(event!.end_time))
    setEditMode(true)
  }

  const handleEditSave = async () => {
    if (new Date(editStart) > new Date(editEnd)) {
      setEditMsg('Start time cannot be after end time')
      return
    }
    setEditLoading(true)
    try {
      const res = await fetch(`${API}/events/${eventID}/edit`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
        },
        body: JSON.stringify({
          title: editTitle,
          start_time: new Date(editStart).toISOString(),
          end_time: new Date(editEnd).toISOString(),
        }),
      })

      if (!res.ok) {
        setEditMsg('Failed to save.')
        return
      }

      // re-fetch event
      const data = await fetch(`${API}/events/${eventID}`, {
        cache: 'no-store',
      }).then((r) => r.json())
      const updatedEvent = data.event ?? data
      setEvent(updatedEvent)

      // get new date boundaries — date only, no time
      const newStartDate = new Date(updatedEvent.start_time)
      const newEndDate = new Date(updatedEvent.end_time)
      const newStartDay = new Date(
        newStartDate.getFullYear(),
        newStartDate.getMonth(),
        newStartDate.getDate(),
      )
      const newEndDay = new Date(
        newEndDate.getFullYear(),
        newEndDate.getMonth(),
        newEndDate.getDate(),
      )

      // only delete timeslots whose DATE is completely outside the new date range
      const invalidTimeslots = timeslots.filter((t) => {
        const d = new Date(t.start_time)
        const day = new Date(d.getFullYear(), d.getMonth(), d.getDate())
        return day < newStartDay || day > newEndDay
      })

      for (const t of invalidTimeslots) {
        if (t.id > 0) {
          await fetch(`${API}/timeslots/${t.id}`, { method: 'DELETE' })
        }
      }

      // update state — keep timeslots inside date range only
      setTimeslots((prev) =>
        prev.filter((t) => {
          const d = new Date(t.start_time)
          const day = new Date(d.getFullYear(), d.getMonth(), d.getDate())
          return day >= newStartDay && day <= newEndDay
        }),
      )

      setEditMode(false)
      setEditMsg('')
    } catch {
      setEditMsg('Failed to save.')
    } finally {
      setEditLoading(false)
    }
  }
  // Derive dates and slots
  const dates: string[] = []
  const slots: string[] = []

  if (event) {
    const startDate = new Date(event.start_time)
    const endDate = new Date(event.end_time)
    const cur = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
    )
    const last = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate(),
    )

    while (cur <= last) {
      const pad = (n: number) => String(n).padStart(2, '0')
      dates.push(
        `${cur.getFullYear()}-${pad(cur.getMonth() + 1)}-${pad(cur.getDate())}`,
      )
      cur.setDate(cur.getDate() + 1)
    }

    const startH = startDate.getHours()
    const endH = endDate.getHours()

    if (startH < endH) {
      for (let h = startH; h < endH; h++) {
        slots.push(`${String(h).padStart(2, '0')}:00`)
        slots.push(`${String(h).padStart(2, '0')}:15`)
        slots.push(`${String(h).padStart(2, '0')}:30`)
        slots.push(`${String(h).padStart(2, '0')}:45`)
      }
      slots.push(`${String(endH).padStart(2, '0')}:00`)
    }
  }

  const selected = new Set(
    timeslots
      .filter((t) => t.participant_id === currentParticipant?.id)
      .map((t) => t.start_time.slice(0, 16)),
  )

  const fetchEventData = async () => {
    if (!eventID) return

    try {
      const [eventRes, participantsRes, timeslotsRes] = await Promise.all([
        fetch(`${API}/events/${eventID}`, { cache: 'no-store' }),
        fetch(`${API}/participants/event/${eventID}`, { cache: 'no-store' }),
        fetch(`${API}/timeslots/event/${eventID}`, { cache: 'no-store' }),
      ])

      const [eventJson, participantsJson, timeslotsJson] = await Promise.all([
        eventRes.json(),
        participantsRes.json(),
        timeslotsRes.json(),
      ])

      setEvent(eventJson.event ?? eventJson)
      setParticipants(participantsJson.participants ?? participantsJson)
      setTimeslots(
        timeslotsJson.slots ?? timeslotsJson.timeslots ?? timeslotsJson,
      )
    } catch (error) {
      console.error('Failed to refresh event data:', error)
    }
  }

  useEffect(() => {
    if (!eventID) return

    fetchEventData()
    const intervalId = window.setInterval(fetchEventData, 5000)
    return () => window.clearInterval(intervalId)
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

    // First, check if password is required for this participant
    const verifyRes = await fetch(`${API}/participants/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: tempName.trim(),
        event_id: event.id,
        password: tempPassword || null,
      }),
    })
    const verifyJson = await verifyRes.json()

    if (!verifyJson.success) {
      alert('Wrong password.')
      return
    }

    if (verifyJson.password_required) {
      setPasswordRequired(true)
      return
    }

    const participant = verifyJson.participant
    setCurrentParticipant(participant)
    localStorage.setItem(`participant-${eventID}`, JSON.stringify(participant))
    setParticipants((prev) =>
      prev.find((p) => p.id === participant.id) ? prev : [...prev, participant],
    )
    setJoined(true)
  }

  const handleSaveName = async () => {
    if (!tempName.trim() || !currentParticipant) return
    await fetch(`${API}/participants/${currentParticipant.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: tempName.trim() }),
    })
    const updated = { ...currentParticipant, username: tempName.trim() }
    setCurrentParticipant(updated)
    localStorage.setItem(`participant-${eventID}`, JSON.stringify(updated)) // ← add
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === currentParticipant.id
          ? { ...p, username: tempName.trim() }
          : p,
      ),
    )
    setEditingName(false)
  }

  const handleLogout = () => {
    localStorage.removeItem(`participant-${eventID}`)
    localStorage.removeItem(`adminToken-${eventID}`)
    setCurrentParticipant(null)
    setJoined(false)
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
          const json = await res.json()
          const realSlot = json.slot ?? json.timeslot
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

  const handleMagicSelect = async () => {
    if (!aiPrompt.trim() || !event || !currentParticipant) return;
    setAiLoading(true);
    setAiError('');
    setAiSuccess('');

    try {
      const res = await fetch(`${API}/ai/parse-availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          dates: dates,
          slots: slots
        })
      });

      if (!res.ok) throw new Error("Failed to parse");

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (data.selectedSlots && data.selectedSlots.length > 0) {
        await applySlots(data.selectedSlots, true);
        setAiSuccess(`Selected ${data.selectedSlots.length} slots matching your request!`);
        setAiPrompt('');
      } else {
        setAiError("Could not find matching time slots. Please adjust dates or times.");
      }
    } catch (err) {
      console.error("AI UI Error:", err);
      setAiError("Something went wrong processing your request.");
    } finally {
      setAiLoading(false);
    }
  }

  // ====== THEME-BASED COLORS ======
  const cellColor = (key: string) =>
    getCellColor(key, selected, slotCount, maxCount, colorBlind, isDark)

  const groupCellColor = (key: string) =>
    getGroupCellColor(key, slotCount, maxCount, colorBlind, isDark)

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
        onKeyDown={
          interactive && currentParticipant
            ? (e) => {
              if (!focusedCell) {
                if (
                  [
                    'ArrowUp',
                    'ArrowDown',
                    'ArrowLeft',
                    'ArrowRight',
                  ].includes(e.key)
                ) {
                  setFocusedCell({ dateIdx: 0, slotIdx: 0 })
                  e.preventDefault()
                }
                return
              }
              let { dateIdx, slotIdx } = focusedCell
              let changed = false

              if (
                e.shiftKey &&
                !dragging &&
                ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(
                  e.key,
                )
              ) {
                const currentSlotKey = slotKey(dates[dateIdx], slots[slotIdx])
                setDragStart(currentSlotKey)
                setDragAdding(!selected.has(currentSlotKey))
                setDragging(true)
              }

              switch (e.key) {
                case 'ArrowUp':
                  slotIdx = Math.max(0, slotIdx - 1)
                  changed = true
                  break
                case 'ArrowDown':
                  slotIdx = Math.min(slots.length - 1, slotIdx + 1)
                  changed = true
                  break
                case 'ArrowLeft':
                  dateIdx = Math.max(0, dateIdx - 1)
                  changed = true
                  break
                case 'ArrowRight':
                  dateIdx = Math.min(dates.length - 1, dateIdx + 1)
                  changed = true
                  break
                case ' ':
                case 'Enter':
                  e.preventDefault()
                  if (dragging && dragStart && dragEnd) {
                    applySlots(getSlotsInRect(dragStart, dragEnd), dragAdding)
                    setDragging(false)
                    setDragStart(null)
                    setDragEnd(null)
                  } else {
                    const key = slotKey(dates[dateIdx], slots[slotIdx])
                    applySlots([key], !selected.has(key))
                  }
                  return
                default:
                  return
              }
              if (changed) {
                e.preventDefault()
                setFocusedCell({ dateIdx, slotIdx })
                if (e.shiftKey) {
                  setDragEnd(slotKey(dates[dateIdx], slots[slotIdx]))
                } else if (dragging) {
                  setDragging(false)
                  setDragStart(null)
                  setDragEnd(null)
                }
              }
            }
            : undefined
        }
        onKeyUp={
          interactive && currentParticipant
            ? (e) => {
              if (e.key === 'Shift' && dragging) {
                if (dragStart && dragEnd) {
                  applySlots(getSlotsInRect(dragStart, dragEnd), dragAdding)
                }
                setDragging(false)
                setDragStart(null)
                setDragEnd(null)
              }
            }
            : undefined
        }
        tabIndex={interactive && currentParticipant ? 0 : undefined}
        onFocus={
          interactive && currentParticipant
            ? () => {
              if (!focusedCell) setFocusedCell({ dateIdx: 0, slotIdx: 0 })
            }
            : undefined
        }
        onBlur={
          interactive
            ? () => {
              setFocusedCell(null)
              if (dragging) {
                setDragging(false)
                setDragStart(null)
                setDragEnd(null)
              }
            }
            : undefined
        }
        sx={{
          display: 'grid',
          gridTemplateColumns: `64px repeat(${dates.length}, minmax(80px, 1fr))`,
          gap: '1px',
          userSelect: 'none',
          outline: interactive && currentParticipant ? 'none' : undefined,
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
        {slots.map((s, sIdx) => (
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
            {dates.map((d, dIdx) => {
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
                    role="gridcell"
                    aria-label={`Time slot: ${new Date(
                      d + 'T00:00:00',
                    ).toLocaleDateString()}, ${s}. ${label}`}
                    aria-selected={selected.has(key)}
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
                        ? '2px solid #14B8A6'
                        : interactive &&
                          focusedCell?.dateIdx === dIdx &&
                          focusedCell?.slotIdx === sIdx
                          ? `2px solid ${theme.palette.primary.main}`
                          : `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                      zIndex:
                        interactive &&
                          focusedCell?.dateIdx === dIdx &&
                          focusedCell?.slotIdx === sIdx
                          ? 1
                          : 0,
                      position: 'relative',
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
        if (dragging) {
          if (dragStart && dragEnd) {
            // Drag: apply rectangle
            applySlots(getSlotsInRect(dragStart, dragEnd), dragAdding)
          } else if (dragStart) {
            // Click: toggle single slot
            applySlots([dragStart], dragAdding)
          }
          setDragging(false)
          setDragStart(null)
          setDragEnd(null)
        }
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
              {passwordRequired ? 'Password required' : "What's your name?"}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              {passwordRequired
                ? 'This participant requires a password to join'
                : 'Enter your name to mark your availability'}
            </Typography>
            <Stack spacing={2}>
              <TextField
                size="small"
                label="Your name"
                value={tempName}
                onChange={(e) => {
                  setTempName(e.target.value)
                  setPasswordRequired(false)
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                fullWidth
                autoFocus
              />
              <TextField
                size="small"
                label="Password (optional)"
                type="password"
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                fullWidth
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
              {passwordRequired && (
                <Button
                  variant="text"
                  size="small"
                  onClick={() => {
                    setTempName('')
                    setTempPassword('')
                    setPasswordRequired(false)
                  }}
                  sx={{ textTransform: 'none' }}
                >
                  Use different name
                </Button>
              )}
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
            {/* Event info card */}
            <Paper
              elevation={1}
              sx={{ p: 3, borderRadius: 3, mb: 3, position: 'relative' }}
            >
              {/* pencil icon — only for admin, only when not editing */}
              {isAdmin && !editMode && (
                <Tooltip title="Edit event">
                  <IconButton
                    onClick={handleEditOpen}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      color: 'text.secondary',
                      '&:hover': { color: theme.palette.primary.main },
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              {!editMode ? (
                // ----- view mode -----
                <>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    sx={{ color: theme.palette.primary.main }}
                    mb={1}
                  >
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
                          `${String(
                            new Date(event.start_time).getHours(),
                          ).padStart(2, '0')}:00`,
                        )}
                        {' – '}
                        {fmtSlot(
                          `${String(
                            new Date(event.end_time).getHours(),
                          ).padStart(2, '0')}:00`,
                        )}
                      </Typography>
                    </Stack>
                  </Stack>
                </>
              ) : (
                // ─ ─ edit mode - -
                <Stack spacing={2}>
                  <Typography fontWeight={700} fontSize={15} color="primary">
                    Edit Event
                  </Typography>

                  {editMsg && (
                    <Typography variant="body2" color="error">
                      {editMsg}
                    </Typography>
                  )}

                  <TextField
                    label="Event name"
                    size="small"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    fullWidth
                  />

                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    alignItems="center"
                  >
                    <TextField
                      label="Start time"
                      type="datetime-local"
                      size="small"
                      value={editStart}
                      onChange={(e) => setEditStart(e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                    <Typography color="text.secondary" sx={{ flexShrink: 0 }}>
                      to
                    </Typography>
                    <TextField
                      label="End time"
                      type="datetime-local"
                      size="small"
                      value={editEnd}
                      onChange={(e) => setEditEnd(e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Stack>

                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      disableElevation
                      onClick={handleEditSave}
                      disabled={editLoading || !editTitle.trim()}
                      sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                        '&:hover': {
                          background:
                            'linear-gradient(135deg, #4f46e5, #9333ea)',
                        },
                      }}
                    >
                      {editLoading ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setEditMode(false)
                        setEditMsg('')
                      }}
                      sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                      Cancel
                    </Button>
                  </Stack>
                </Stack>
              )}
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
                            bgcolor: theme.palette.primary.main,
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Your availability
                        </Typography>
                        <Box
                          sx={{
                            width: 14,
                            height: 14,
                            borderRadius: 0.5,
                            bgcolor: theme.palette.secondary.main,
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Your Overlap
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
                        bgcolor: theme.palette.secondary.main,
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
                  <Button
                    fullWidth
                    variant="text"
                    size="small"
                    onClick={handleLogout}
                    sx={{
                      textTransform: 'none',
                      borderRadius: 2,
                      mt: 1,
                      color: 'error.main',
                    }}
                  >
                    Log Out
                  </Button>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Enter your name above to get started.
                </Typography>
              )}
            </Paper>

            {currentParticipant && (
              <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, mb: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                  <AutoAwesomeIcon sx={{ color: '#a855f7' }} />
                  <Typography fontWeight={700}>Magic Selection ✨</Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" mb={2} display="block">
                  Tell AI your schedule and we'll highlight the slots!
                  <br />
                  e.g. Free Monday all day...On Saturday Date 9th from 10 to 12...
                </Typography>
                <TextField
                  size="small"
                  placeholder="e.g. Free Monday all day..."
                  multiline
                  rows={2}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  fullWidth
                  sx={{ mb: 1.5 }}
                  disabled={aiLoading}
                />

                {aiError && (
                  <Typography variant="caption" color="error" display="block" mb={1}>
                    {aiError}
                  </Typography>
                )}

                {aiSuccess && (
                  <Typography variant="caption" color="success.main" display="block" mb={1}>
                    {aiSuccess}
                  </Typography>
                )}

                <Button
                  fullWidth
                  variant="contained"
                  size="small"
                  onClick={handleMagicSelect}
                  disabled={!aiPrompt.trim() || aiLoading}
                  sx={{
                    textTransform: 'none',
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4f46e5, #9333ea)',
                    },
                  }}
                >
                  {aiLoading ? '✨ Analyzing...' : 'Magic Select'}
                </Button>
              </Paper>
            )}

            <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3 }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={4}>
                <GroupIcon sx={{ color: theme.palette.secondary.main }} />
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
                            ? alpha(theme.palette.secondary.main, 0.15)
                            : 'transparent',
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor:
                            p.id === currentParticipant?.id
                              ? theme.palette.secondary.main
                              : theme.palette.primary.main,
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
                            <Typography
                              variant="caption"
                              sx={{ color: theme.palette.secondary.main }}
                            >
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
                          i === 0
                            ? `${alpha(theme.palette.secondary.main, 0.14)}`
                            : 'transparent',
                        border:
                          i === 0
                            ? `1px solid ${alpha(
                              theme.palette.secondary.main,
                              0.5,
                            )}`
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
                          sx={{ color: theme.palette.secondary.main }}
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
                            bgcolor: alpha(theme.palette.divider, 0.2),
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              height: '100%',
                              width: `${slot.percentage}%`,
                              bgcolor: theme.palette.primary.main,
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
