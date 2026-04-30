import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import { lazy, Suspense } from 'react'
import './index.css'
import { CustomThemeProvider } from './ThemeContext.tsx'

const App = lazy(() => import('./App.tsx'))
const CreateEvent = lazy(() => import('./CreateEvent/createEvent.tsx'))
const EventPage = lazy(() => import('./Event/eventPage.tsx'))
const NotFound = lazy(() => import('./NotFound/NotFound.tsx'))

createRoot(document.getElementById('root')!).render(
  <CustomThemeProvider>
    <BrowserRouter>
      <Suspense
        fallback={
          <div
            style={{
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Loading...
          </div>
        }
      >
        <Routes>
          <Route path="*" element={<NotFound />} />
          <Route index path="/" element={<App />} />
          <Route path="/createEvent" element={<CreateEvent />} />
          <Route path="/event/:eventID" element={<EventPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </CustomThemeProvider>
)
