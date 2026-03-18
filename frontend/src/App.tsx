import './App.css'
import { Routes, Route } from 'react-router'
import CreateEvent from './Event/createEvent'
import EventDetail from './Event/eventDetail'

function App() {
  return (
    <Routes>
      <Route path="/" element={<CreateEvent />} />
      <Route path="/event/:eventId" element={<EventDetail />} />
    </Routes>
  )
}

export default App
