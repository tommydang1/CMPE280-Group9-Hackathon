import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import './index.css'
import App from './App.tsx'
import CreateEvent from './CreateEvent/createEvent.tsx'
import Event from './Event/Event.tsx'
import NotFound from './NotFound/NotFound.tsx'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route path="*" element={<NotFound />} />
      <Route index path="/" element={<App />} />
      <Route path="/createEvent" element={<CreateEvent />} />
      <Route path="/event/:eventID" element={<Event />} />
    </Routes>
  </BrowserRouter>,
)
