# CMPE280-Group9-Hackathon

## Problem and idea
When planning events or scheduling weekly meetings with multiple people, it is important to align everyone’s schedule to best suit everyone’s needs.

This website will allow users to create an event timeframe or a weekly timeframe and select their availability throughout that timeframe. They can invite other users to the event to select their availability too. The site will then display a grid of the average number of people available during the timeframe.


## Key technical choices
* For our frontend, we decided to go with React + Typescript because it is the industry standard for web applications and offers an ecosystem that integrates seamlessly with other libraries.
* React + Typescript was chosen because of our familiarity with JavaScript.
React is an industry standard used in many startups and web applications.
* The community support for libraries such as Mui makes designing accessibility easier 
* For the backend, we used a relational database
* Authentication is optional. Passwords will only be created when creating a new participant and cannot be added to an existing participant.


## How to run the project
### Frontend
```
npm run dev
```
### Backend
```
npm start
```

## Keyboard Controls
LinkUp is built with full keyboard accessibility in mind.
- **Navigation:** Press `Tab` and `Shift + Tab` to move through fields, buttons, and the availability grid.
- **Action/Click:** Press `Enter` or `Space` to activate buttons, open menus, and submit forms.
- **Availability Grid:** Use the `Arrow Keys` (Up/Down/Left/Right) to navigate across time slots. Press `Space` or `Enter` to toggle a single slot. 
- **Multi-select:** Hold `Shift` + `Arrow Keys` to start a block selection in the grid for quickly marking a wide range of availability.
- **Accessibility Menu:** Press `Arrow Up/Down` to switch between Dark Mode and Color Blind filters from the accessibility menu.

## 🤖 AI-Powered Features
LinkUp features a powerful, rubric-compliant Generative AI integration that significantly enhances the scheduling experience. We leverage OpenAI's `gpt-4o-mini` API for highly-accurate natural language processing.

### 1. Magic Selection ✨
Eliminates the tedium of manually clicking or dragging to select timeslots on the grid.
- **Natural Language Parsing:** After joining an event, open the *Magic Selection* sidebar and type your schedule naturally (e.g., *"I'm free Wednesday all day and Thursday from 11am to 2pm"*).
- **Intelligent Engine:** The backend maps your conversational text into an exact mathematical array of timeslots matching the event's specific grid.

