# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

This repository contains an interactive HTML checklist application with gamification features for the Frontend UI/UX Developer curriculum. The project is designed to help track learning progress with engaging visual feedback and achievement systems.

## Development Setup

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Cursor with Live Server extension (recommended)
- No build process required - pure HTML/CSS/JavaScript

### Local Development
1. Open project folder in Cursor
2. Right-click on `index.html` and select "Open with Live Server"
3. Application will open at `http://localhost:5500` (or similar)
4. Changes auto-reload with Live Server

### File Structure
```
Mission01/
├── index.html          # Main application entry point
├── styles/
│   ├── main.css       # Core styles and layout
│   ├── gamification.css # Achievement badges, progress bars, animations
│   └── responsive.css  # Mobile-first responsive design
├── scripts/
│   ├── app.js         # Main application logic
│   ├── gamification.js # XP system, achievements, local storage
│   └── checklist.js   # Checklist data and manipulation
├── assets/
│   ├── icons/         # Achievement badges and UI icons
│   └── sounds/        # Optional completion sound effects
└── data/
    └── curriculum.json # Curriculum data structure
```

## Common Commands

### Development Workflow
- **Start Development**: Open with Live Server in VS Code
- **Debug**: Use browser DevTools (F12)
- **Test Responsiveness**: DevTools device emulation
- **Validate HTML**: W3C Markup Validator
- **Check Accessibility**: Lighthouse audit in DevTools

### Code Quality
- Use Prettier for formatting
- Follow semantic HTML5 structure
- Implement ARIA labels for accessibility
- Use CSS custom properties for theming

## Architecture Overview

### Core Components

#### 1. Checklist Engine (`checklist.js`)
- Manages curriculum data structure (8 weeks of tasks)
- Handles task completion/unchecking
- Persists progress to localStorage
- Calculates weekly and overall completion percentages

#### 2. Gamification System (`gamification.js`)
- **XP System**: Points for completed tasks (Daily: 10 XP, Weekly Milestone: 50 XP)
- **Level Progression**: Levels 1-20 with increasing XP requirements
- **Achievement Badges**: Unlock achievements for milestones
- **Streak Tracking**: Daily completion streaks
- **Progress Visualization**: Animated progress bars and level indicators

#### 3. UI Components (`app.js`)
- Week accordion/expandable sections
- Task checkboxes with smooth animations
- Progress bars (daily, weekly, overall)
- Achievement notification system
- Responsive mobile navigation

### Data Structure
```javascript
// curriculum.json structure
{
  "weeks": [
    {
      "id": 1,
      "title": "Foundation & Setup",
      "description": "Rough-in Phase - Getting your workspace wired",
      "milestone": "Build a responsive personal portfolio landing page",
      "days": [
        {
          "day": "Monday",
          "theme": "Development Environment",
          "tasks": [
            {
              "id": "w1d1t1",
              "text": "Install VS Code with extensions: Prettier, ESLint, Live Server",
              "type": "setup",
              "xp": 10
            }
          ]
        }
      ]
    }
  ]
}
```

### Styling Architecture

#### CSS Custom Properties (Design System)
```css
:root {
  /* Colors */
  --primary-color: #3b82f6;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
  
  /* Gamification */
  --xp-bar-bg: #e5e7eb;
  --xp-bar-fill: linear-gradient(90deg, #3b82f6, #1d4ed8);
  --achievement-gold: #fbbf24;
  
  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 3rem;
}
```

#### Component Classes
- `.week-section` - Expandable week containers
- `.task-item` - Individual checklist items
- `.progress-bar` - Animated progress indicators
- `.achievement-badge` - Unlockable achievement icons
- `.xp-indicator` - Experience point displays
- `.level-badge` - Current level indicator

### Gamification Features

#### Experience Point System
- **Task Completion**: 10 XP per regular task
- **Daily Completion**: 25 XP bonus for completing all daily tasks
- **Weekly Milestone**: 50 XP for completing week milestone
- **Streak Bonus**: +5 XP per day for consecutive day streaks

#### Achievement System
- "First Steps" - Complete first task
- "Daily Warrior" - Complete all tasks in a day
- "Week Conqueror" - Complete entire week
- "Streak Master" - 7-day completion streak
- "Halfway Hero" - 50% overall completion
- "Frontend Master" - 100% curriculum completion

#### Level Progression
- Level 1: 0 XP
- Level 2: 100 XP
- Level 3: 250 XP
- Level 4: 450 XP
- [Exponential scaling to Level 20]

### Local Storage Schema
```javascript
{
  "completedTasks": ["w1d1t1", "w1d1t2", ...],
  "currentXP": 340,
  "currentLevel": 4,
  "unlockedAchievements": ["first-steps", "daily-warrior"],
  "streakCount": 5,
  "lastActiveDate": "2025-08-19",
  "weeklyProgress": {
    "week1": 0.8,
    "week2": 0.3
  }
}
```

## Notes for Future Development

### Phase 1: Core Functionality ✅
- [x] Basic HTML structure with curriculum data
- [x] CSS styling with modern design principles
- [x] JavaScript task completion logic
- [x] Local storage persistence

### Phase 2: Gamification 🔄
- [ ] XP system implementation
- [ ] Achievement badge system
- [ ] Level progression with visual feedback
- [ ] Streak tracking and bonuses
- [ ] Progress animations and micro-interactions

### Phase 3: Enhanced UX 📅
- [ ] Dark/light mode toggle
- [ ] Export progress as PDF report
- [ ] Social sharing of achievements
- [ ] Calendar integration for daily goals
- [ ] Motivational quotes/tips system

### Technical Considerations

#### Performance
- Minimize DOM manipulation - batch updates
- Use CSS transforms for animations (GPU acceleration)
- Implement virtual scrolling for large task lists (if needed)
- Optimize images and use SVG for icons

#### Accessibility
- ARIA labels for all interactive elements
- Keyboard navigation support (Tab, Enter, Space)
- Screen reader compatibility
- High contrast mode support
- Focus management for dynamic content

#### Browser Support
- Modern browsers (ES6+ features)
- CSS Grid and Flexbox
- LocalStorage API
- CSS Custom Properties

### Development Best Practices

#### HTML
- Use semantic elements (`<main>`, `<section>`, `<article>`)
- Implement proper heading hierarchy (h1-h6)
- Add ARIA landmarks and labels
- Include meta tags for responsive design

#### CSS
- Mobile-first responsive design
- Use CSS Grid for layout, Flexbox for components
- Implement CSS custom properties for theming
- Follow BEM naming convention for classes
- Use CSS animations with `prefers-reduced-motion` respect

#### JavaScript
- Use modern ES6+ syntax (const/let, arrow functions, modules)
- Implement error handling for localStorage operations
- Add input validation and sanitization
- Use event delegation for dynamic content
- Comment complex logic and algorithms

### Deployment Options
- **GitHub Pages**: Free hosting for static sites
- **Netlify**: Continuous deployment from Git
- **Vercel**: Zero-config deployment
- **Local File System**: Works offline, shareable via USB/email

### Future Enhancement Ideas
- **AI Integration**: Weekly study tips based on progress
- **Community Features**: Share progress with study groups
- **Analytics**: Time tracking for each task completion
- **Customization**: User-defined XP values and achievement goals
- **Offline PWA**: Service worker for offline functionality