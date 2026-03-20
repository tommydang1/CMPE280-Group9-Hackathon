import { useNavigate } from 'react-router'
import {
  Box,
  Button,
  Container,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { CalendarPlus, Sparkles } from 'lucide-react'

export default function App() {
  const navigate = useNavigate()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const navigateCreateEvent = () => {
    navigate(`/createEvent`)
  }

  return (
    <Box
      className="animate-bg"
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: isDark
          ? 'linear-gradient(-45deg, #4a2119, #4a172b, #0a3d52, #0d4a3e)'
          : 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
        overflow: 'hidden',
      }}
    >
      {/* Decorative Floating Blobs */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '15%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)',
          borderRadius: '50%',
          animation: 'float-1 8s ease-in-out infinite',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          right: '15%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%)',
          borderRadius: '50%',
          animation: 'float-2 10s ease-in-out infinite',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '40%',
          right: '25%',
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)',
          borderRadius: '50%',
          animation: 'float-3 6s ease-in-out infinite',
          zIndex: 0,
        }}
      />

      <Container
        maxWidth="sm"
        sx={{
          position: 'relative',
          zIndex: 1,
          py: 8
        }}
      >
        <Box
          className="glass-card"
          sx={{
            p: 6,
            borderRadius: 6,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
            }
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              animation: 'float-3 4s ease-in-out infinite'
            }}
          >
            <Sparkles size={48} color="white" strokeWidth={1.5} />
          </Box>
          <Typography
            variant="h2"
            fontWeight={800}
            sx={{
              color: 'white',
              textShadow: '0 2px 10px rgba(0,0,0,0.1)',
              mb: 1,
              letterSpacing: '-1px'
            }}
          >
            LinkUp
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              mb: 5,
              fontWeight: 400,
              textShadow: '0 1px 4px rgba(0,0,0,0.1)'
            }}
          >
            Create an event to find the perfect time to meet
          </Typography>

          {/* Action Button */}
          <Button
            onClick={navigateCreateEvent}
            fullWidth
            size="large"
            startIcon={<CalendarPlus size={24} />}
            sx={{
              py: 2,
              background: 'white',
              color: '#d64673',
              fontWeight: 700,
              fontSize: '1.1rem',
              borderRadius: 4,
              textTransform: 'none',
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: '#f8f9fa',
                transform: 'scale(1.03) translateY(-2px)',
                boxShadow: '0 12px 25px rgba(0,0,0,0.2)',
              },
            }}
          >
            Create Event
          </Button>
        </Box>
      </Container>
    </Box>
  )
}
