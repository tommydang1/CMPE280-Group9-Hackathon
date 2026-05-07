# LinkUp - A smarter way to schedule.

## Problem and idea

When planning events or scheduling weekly meetings with multiple people, it is important to align everyone’s schedule to best suit everyone’s needs.

This website will allow users to create an event timeframe or a weekly timeframe and select their availability throughout that timeframe. They can invite other users to the event to select their availability too. The site will then display a grid of the average number of people available during the timeframe.

## Key technical choices

- For our frontend, we decided to go with React + Typescript because it is the industry standard for web applications and offers an ecosystem that integrates seamlessly with other libraries.
- React + Typescript was chosen because of our familiarity with JavaScript.
  React is an industry standard used in many startups and web applications.
- The community support for libraries such as Mui makes designing accessibility easier
- For the backend, we used a relational database
- Authentication is optional. Passwords will only be created when creating a new participant and cannot be added to an existing participant.

## How to run the project

### Frontend

```
npm run dev
```

### Backend

```
npm start
```

## 🌟 Core Features

- **Real-Time Updates**: Changes to the schedule update dynamically for all users via a polling architecture.
- **Admin Privileges**: Event creators receive a secure token allowing them to edit event parameters (title, dates) inline.
- **Password Authentication**: Event creators can mandate password authentication to prevent unauthorized participants from joining or editing schedules.
- **Top 5 Best Times Leaderboard**: A real-time sidebar calculates and visually displays the most popular time slots with progress bars.
- **Dynamic Heatmap Grid**: The group scheduling grid dynamically adjusts color intensity based on availability density (more people = darker color).
- **Share Event**: One-click sharing to easily copy the event URL to your clipboard.

## ♿ Accessibility & UX

- **Full Keyboard Controls**: Navigate the entire application without a mouse.
  - **Navigation:** Press `Tab` and `Shift + Tab` to move through fields.
  - **Availability Grid:** Use the `Arrow Keys` (Up/Down/Left/Right) to navigate across time slots. Press `Space` or `Enter` to toggle a single slot.
  - **Multi-select:** Hold `Shift` + `Arrow Keys` to start a block selection in the grid for quickly marking a wide range of availability.

- **Color-Blind Friendly Themes**: Built-in Dark Mode and specialized Color-Blind filters (Protanopia, Deuteranopia, Tritanopia) accessible via the floating Action Button.


## 🤖 AI-Powered Features

LinkUp features a powerful, rubric-compliant Generative AI integration that significantly enhances the scheduling experience. We leverage OpenAI's `gpt-4o-mini` API for highly-accurate natural language processing.

### 1. Magic Selection ✨

Eliminates the tedium of manually clicking or dragging to select timeslots on the grid.

- **Natural Language Parsing:** After joining an event, open the _Magic Selection_ sidebar and type your schedule naturally (e.g., _"I'm free Wednesday all day and Thursday from 11am to 2pm"_).
- **Intelligent Engine:** The backend maps your conversational text into an exact mathematical array of timeslots matching the event's specific grid.

### 2. AI Availability Summary 📊
Takes the guesswork out of finding the optimal meeting time for large groups.
- **Intelligent Recommendations**: Enter a prompt like "Find the best time when everyone is available" and the AI analyzes the entire group's grid data to suggest the top options.
- **Smart Email Templates**: Automatically generates a professional email invite with the chosen date and time, which you can instantly copy or open directly in Gmail with one click.

---

## 🎓 Capstone Rubric & Engineering Reflection

This project was built to demonstrate professional-level engineering, full-stack mastery, and thoughtful UX design. Below is a direct mapping of how the project satisfies the 7 capstone requirements:

### 1. Technical Architecture & Code Quality 
- **Logical component structure**: The project follows a strict MVC-like pattern on the backend and feature-based folder structuring on the frontend.
- **Maintainable code / State management**: We utilized React's native `useState` and Context API (`ThemeContext.tsx`) for localized, predictable state management rather than over-engineering.
- **Clear TypeScript usage**: TypeScript enforces robust type safety across our complex UI states (especially the grid interactions).

### 2. UI/UX Design & Accessibility 
- **WCAG awareness**: LinkUp is built with full keyboard accessibility. Users can navigate the entire grid using `Arrow Keys`, toggle slots with `Space/Enter`, and multi-select using `Shift + Arrows`. We also added visually hidden screen reader elements (`sr-only`).
- **Meaningful UX decisions**: Includes a dedicated Accessibility Menu allowing users to toggle Dark Mode and specific Color Blind filters (Protanopia, Deuteranopia, Tritanopia).
- **Responsive & Consistent**: Designed using Material UI (MUI) and Tailwind CSS to ensure the UI scales elegantly across devices.

### 3. Feature Implementation & Completeness 
- **Core features functional**: Full event creation, custom time bounding, and real-time (polling) grid synchronization.
- **Edge cases considered**: Handled participant authentication (passwords), timezone normalization (UTC conversions), and overlapping time slot resolution.
- **Appropriate complexity**: Built a completely custom, interactive CSS-grid from scratch rather than relying on third-party calendar libraries.

### 4. Performance & Optimization 
- **Reasonable bundle size**: Leveraged Vite's `manualChunks` to split vendor code (React, MUI) from application logic.
- **Performance considerations (Lighthouse)**: Implemented `React.lazy` and `Suspense` in the main router to defer loading heavy page components until needed, optimizing initial load times.

### 5. AI Integration 
- **Thoughtful GenAI UX**: "Magic Selection" allows users to type natural language availability, while "AI Summary" dynamically generates optimal group meeting times.
- **Streaming/feedback handling & Error states**: Includes proper loading states (disabling inputs, showing "Analyzing..."), clear UI error messaging on failures, and graceful mock fallbacks ensuring the app never breaks if the OpenAI API key is missing.

### 6. Engineering Reflection & Trade-Off Analysis 
We have documented our detailed design decisions, alternatives comparison, and lessons learned in a dedicated reflection document. 

👉 **[Please view our full Engineering Reflection here.](./Engineering_Reflection.md)**


---

## Team Contribution

### Richard Pham

- Create an event by filling in a title, date range, and time frame.
- Individual Selection & Group Availability Grid.
- The sidebar automatically ranks the top 5 best times by availability and refreshes every 5 seconds as more people respond.
- The event creator is the admin — where only they can edit the event name and time frame inline.

### William Nguyen
- Color Blind and Accessibility Menu
- Real-time updates for Group Availability Grid.
- AI Summary feature to schedule meetings with other members.
- AI Email template to quickly prototype emails/invite messages.
- Lighthouse and WCAG analysis.

### Urvashi Kohale
- AI Magic Selection for automatically mapping out availability in the group scheduling grid by typing out natural language input.
- Implemented full keyboard accessibility for the scheduling grid, supporting efficient navigation and multi-selection.
- Front page design and UI implementation.
- Dark mode and UI improvements.
- Engineering reflection documentation.

