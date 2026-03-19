import { useNavigate } from 'react-router'
import {
  Box,
  Button,
  Container,
  Typography,
} from '@mui/material'

export default function App() {
  const navigate = useNavigate()

  const navigateCreateEvent = () => {
    navigate(`/createEvent`)
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
            LinkUp
          </Typography>
          <Typography color="text.secondary">
            Create an event to find the perfect time to meet
          </Typography>
        </Box>

        {/* Card */}
        <Button
          onClick={navigateCreateEvent}
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
      </Container>
    </Box>
  )
}
