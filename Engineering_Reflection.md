# Engineering Reflection & Trade-Off Analysis

This document outlines the reflection on the engineering process for the LinkUp application, specifically addressing design decisions, alternatives considered, and lessons learned during development.

## 1. Explanation of Design Decisions

- **Architecture (React/Vite + Express/PostgreSQL):** We chose a structured stack with React and TypeScript on the frontend to strictly manage the complex state required for interactive grid selection. Vite was selected over Create React App due to its superior Hot Module Replacement (HMR) speeds. On the backend, PostgreSQL was chosen because scheduling data is inherently relational (Events have Participants, Participants have Timeslots), ensuring strict data integrity.
- **State Management:** Instead of relying on heavy third-party libraries like Redux, we opted for React's native `useState` and Context API. This localized state management was perfectly suited for our needs, preventing unnecessary global re-renders and keeping the codebase highly maintainable.
- **Generative AI Strategy (`gpt-4o-mini`):** We integrated OpenAI's `gpt-4o-mini` for our "Magic Selection" and "AI Summary" features. This model was specifically chosen for its optimal balance of cost-efficiency and low latency, which is critical for a smooth user experience, while still possessing the necessary reasoning capabilities to accurately parse natural language dates.

## 2. Comparison of Alternatives

- **REST API with Polling vs. WebSockets:**
  - *Alternative Considered:* We initially considered using WebSockets to achieve true real-time synchronization across all participants viewing the same grid.
  - *Trade-off & Decision:* WebSockets introduce significant backend complexity (managing active connections, handling disconnects, and scaling infrastructure). We ultimately opted for a REST API architecture using client-side polling (refreshing data every 10 seconds). This provided an adequately "real-time" feel for a scheduling app while drastically reducing server load and making the application much easier to debug and deploy.
- **Custom Grid vs. Third-Party Calendar Libraries:**
  - *Alternative Considered:* Using an off-the-shelf library like `react-big-calendar`.
  - *Trade-off & Decision:* While a pre-built library would save upfront development time, it severely limited our ability to customize the UX. We chose to build a completely custom, interactive CSS-grid from scratch. This required complex engineering (handling drag-to-select math and keyboard focus management), but it gave us absolute control. It allowed us to implement our specific visual heatmap styling (darker colors for higher overlap) and ensure native keyboard accessibility that external libraries couldn't support.

## 3. Lessons Learned

- **Accessibility is Foundational, Not an Add-on:** Implementing full WCAG keyboard controls (arrow key navigation, Shift-selection) and specific Color-Blind themes (Protanopia, Deuteranopia) was technically challenging. We learned that accessibility must be baked into the component design from day one; retrofitting it onto complex interactive elements like a scheduling grid is incredibly difficult.
- **The Complexity of Date and Time Math:** Handling timezones across a client-server architecture is notoriously tricky. We learned the critical importance of normalizing all dates (standardizing everything to UTC strings) before sending data from the frontend to the backend or passing it into the AI parser, preventing severe timezone offset bugs.
- **Graceful Degradation in AI Features:** We learned the importance of clear feedback handling. By implementing strict loading states ("Analyzing..."), specific error catch blocks, and mock fallback mechanisms in our API routes, we ensured that the application remains functional and demo-able even if the external OpenAI API key is missing or rate-limited.
