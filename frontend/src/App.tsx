import './App.css'
import { Link } from "react-router";

function App() {
  return (
    <>
      <section id="center">
        <div>
          <h1>Landing Page</h1>
        </div>
        <Link to="/createEvent" className="link">
          Create an Event
        </Link>
      </section>
    </>
  )
}

export default App
