import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import './index.css'
import App from './App.tsx'
import CreateEvent from './CreateEvent/createEvent.tsx'
import EventPage from './Event/eventPage.tsx'
import NotFound from './NotFound/NotFound.tsx'
import { CustomThemeProvider } from './ThemeContext.tsx'

createRoot(document.getElementById('root')!).render(
  <CustomThemeProvider>
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<NotFound />} />
        <Route index path="/" element={<App />} />
        <Route path="/createEvent" element={<CreateEvent />} />
        <Route path="/event/:eventID" element={<EventPage />} />
      </Routes>
    </BrowserRouter>
  </CustomThemeProvider>
)
