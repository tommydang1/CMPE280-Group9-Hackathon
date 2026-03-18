import './CreateEvent.css'
import EventGrid from './components/EventGrid'

function CreateEvent() {
    const selectedDays = ["2026-03-20", "2026-03-21"];
    const selectedTimeSlots = ["09:00", "09:30", "10:00"];
    return (
        <>
            <section id="center">
                <div>
                    <h1>Create Event Page</h1>
                </div>
                <EventGrid days={selectedDays} timeSlots={selectedTimeSlots} />
                <button className="link">
                    Create Event
                </button>
            </section>
        </>
    )
}

export default CreateEvent
