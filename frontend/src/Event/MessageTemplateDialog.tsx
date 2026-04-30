import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Stack,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

interface MessageTemplateDialogProps {
  open: boolean
  onClose: () => void
  onCopy: (subject: string, body: string) => void
  initialMessage: string
  recipientEmail?: string
}

export default function MessageTemplateDialog({
  open,
  onClose,
  onCopy,
  initialMessage,
  recipientEmail = '',
}: MessageTemplateDialogProps) {
  const theme = useTheme()
  const [subject, setSubject] = useState('Meeting Scheduled')
  const [body, setBody] = useState('')

  useEffect(() => {
    if (open) {
      setBody(initialMessage)
    }
  }, [open, initialMessage])

  const handleCopy = () => {
    onCopy(subject, body)
    onClose()
  }

  const handleGmail = () => {
    const gmailUrl =
      `https://mail.google.com/mail/?view=cm&fs=1` +
      `&to=${encodeURIComponent(recipientEmail)}` +
      `&su=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`

    window.open(gmailUrl, '_blank', 'noopener,noreferrer')
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#ffffff',
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
        Email Template
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3}>
          <br></br>
          <TextField
            fullWidth
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            size="small"
          />

          <TextField
            fullWidth
            label="Message"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            multiline
            rows={7}
            placeholder="Your message here..."
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          Cancel
        </Button>

        <Button onClick={handleCopy} variant="outlined" sx={{ textTransform: 'none' }}>
          Copy
        </Button>

        <Button
          onClick={handleGmail}
          variant="contained"
          endIcon={<OpenInNewIcon />}
          sx={{
            textTransform: 'none',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5, #9333ea)',
            },
          }}
        >
          Send via Gmail
        </Button>
      </DialogActions>
    </Dialog>
  )
}