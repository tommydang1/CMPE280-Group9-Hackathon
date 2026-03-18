import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";
import './index.css'
import App from './App.tsx'
import CreateEvent from './CreateEvent.tsx'
import Event from './Event.tsx'
import NotFound from './NotFound.tsx'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route path='*' element={<NotFound />} />
      <Route path='/' element={<App />} />
      <Route path="createEvent" element={<CreateEvent />} />
      <Route path=":eventID" element={<Event />} />
    </Routes>
  </BrowserRouter>
)
