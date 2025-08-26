/**
 * Quiz Data - Daily Knowledge Reinforcement Quizzes
 */

window.QUIZ_DATA = {
  "quizzes": [
    {
      "weekId": 1,
      "dayId": 1,
      "title": "Development Environment Setup",
      "description": "Test your knowledge of development tools and environment setup",
      "timeLimit": 300, // 5 minutes
      "passingScore": 70,
      "xpReward": 20,
      "questions": [
        {
          "id": "w1d1q1",
          "type": "multiple-choice",
          "question": "Which VS Code extension is essential for JavaScript code formatting?",
          "options": [
            "Live Server",
            "Prettier",
            "ESLint",
            "GitLens"
          ],
          "correct": 1,
          "explanation": "Prettier is a code formatter that automatically formats your code according to consistent rules."
        },
        {
          "id": "w1d1q2", 
          "type": "multiple-choice",
          "question": "What command initializes a new Git repository?",
          "options": [
            "git start",
            "git create",
            "git init",
            "git new"
          ],
          "correct": 2,
          "explanation": "git init creates a new Git repository in the current directory."
        },
        {
          "id": "w1d1q3",
          "type": "true-false",
          "question": "The <!DOCTYPE html> declaration must be the first line in an HTML5 document.",
          "correct": true,
          "explanation": "The DOCTYPE declaration tells the browser which version of HTML to use and must be the very first thing in the document."
        },
        {
          "id": "w1d1q4",
          "type": "multiple-choice",
          "question": "Which HTML5 element represents the main content area?",
          "options": [
            "<content>",
            "<main>",
            "<primary>",
            "<body>"
          ],
          "correct": 1,
          "explanation": "The <main> element represents the main content area of the document."
        }
      ]
    },
    {
      "weekId": 1,
      "dayId": 2,
      "title": "HTML Fundamentals",
      "description": "Test your understanding of semantic HTML and form elements",
      "timeLimit": 300,
      "passingScore": 70,
      "xpReward": 20,
      "questions": [
        {
          "id": "w1d2q1",
          "type": "multiple-choice",
          "question": "Which element should be used for the top-level heading of a page?",
          "options": [
            "<header>",
            "<h1>",
            "<title>",
            "<top>"
          ],
          "correct": 1,
          "explanation": "The <h1> element represents the most important heading on the page and should be used for the main title."
        },
        {
          "id": "w1d2q2",
          "type": "multiple-choice",
          "question": "What input type is best for email addresses?",
          "options": [
            "text",
            "email",
            "mail",
            "address"
          ],
          "correct": 1,
          "explanation": "The email input type provides built-in validation and appropriate mobile keyboards."
        },
        {
          "id": "w1d2q3",
          "type": "true-false",
          "question": "The <section> element should always have a heading.",
          "correct": true,
          "explanation": "Each <section> should have a heading (h1-h6) to clearly identify its purpose and content."
        },
        {
          "id": "w1d2q4",
          "type": "multiple-choice",
          "question": "Which element represents navigation links?",
          "options": [
            "<navigation>",
            "<nav>",
            "<menu>",
            "<links>"
          ],
          "correct": 1,
          "explanation": "The <nav> element is used to wrap navigation links and menus."
        },
        {
          "id": "w1d2q5",
          "type": "multiple-choice",
          "question": "What attribute makes a form field required?",
          "options": [
            "mandatory",
            "required",
            "needed",
            "must-fill"
          ],
          "correct": 1,
          "explanation": "The 'required' attribute makes a form field mandatory before submission."
        }
      ]
    },
    {
      "weekId": 1,
      "dayId": 3,
      "title": "CSS Basics",
      "description": "Test your knowledge of CSS selectors and the box model",
      "timeLimit": 300,
      "passingScore": 70,
      "xpReward": 20,
      "questions": [
        {
          "id": "w1d3q1",
          "type": "multiple-choice",
          "question": "Which CSS selector has the highest specificity?",
          "options": [
            "Element selector (h1)",
            "Class selector (.heading)",
            "ID selector (#main)",
            "Universal selector (*)"
          ],
          "correct": 2,
          "explanation": "ID selectors have higher specificity than class or element selectors."
        },
        {
          "id": "w1d3q2",
          "type": "multiple-choice",
          "question": "In the CSS box model, what's the correct order from inside to outside?",
          "options": [
            "content, margin, padding, border",
            "content, padding, border, margin",
            "content, border, padding, margin",
            "margin, border, padding, content"
          ],
          "correct": 1,
          "explanation": "The box model layers are: content (innermost), padding, border, margin (outermost)."
        },
        {
          "id": "w1d3q3",
          "type": "true-false",
          "question": "External CSS files should be linked in the <head> section.",
          "correct": true,
          "explanation": "CSS links should be in the <head> to ensure styles load before content renders."
        },
        {
          "id": "w1d3q4",
          "type": "multiple-choice",
          "question": "What does the 'margin: 10px 20px;' declaration do?",
          "options": [
            "10px on all sides, 20px on top/bottom",
            "10px top/bottom, 20px left/right",
            "20px on all sides, 10px on top/bottom",
            "10px left/right, 20px top/bottom"
          ],
          "correct": 1,
          "explanation": "When two values are given, the first applies to top/bottom, the second to left/right."
        }
      ]
    },
    {
      "weekId": 6,
      "dayId": 3,
      "title": "Headless CMS & Sanity.io",
      "description": "Test your understanding of headless CMS concepts and Sanity.io basics",
      "timeLimit": 300,
      "passingScore": 70,
      "xpReward": 25,
      "questions": [
        {
          "id": "w6d3q1",
          "type": "multiple-choice",
          "question": "What is a headless CMS?",
          "options": [
            "A CMS without a user interface",
            "A CMS that separates content management from presentation",
            "A CMS that runs in the browser only",
            "A CMS without database storage"
          ],
          "correct": 1,
          "explanation": "A headless CMS separates the content management backend from the frontend presentation layer."
        },
        {
          "id": "w6d3q2",
          "type": "multiple-choice",
          "question": "Which command installs Sanity CLI globally?",
          "options": [
            "npm install sanity",
            "npm install -g @sanity/cli",
            "npm install --global sanity-cli",
            "npm install -g sanity"
          ],
          "correct": 1,
          "explanation": "The correct command is 'npm install -g @sanity/cli' to install the official Sanity CLI globally."
        },
        {
          "id": "w6d3q3",
          "type": "true-false",
          "question": "Sanity Studio can be customized with custom field components.",
          "correct": true,
          "explanation": "Sanity Studio is highly customizable and supports custom field components, validation, and UI modifications."
        },
        {
          "id": "w6d3q4",
          "type": "multiple-choice",
          "question": "What file contains the main Sanity project configuration?",
          "options": [
            "sanity.config.js",
            "sanity.json",
            "config.sanity.js",
            "sanity-config.json"
          ],
          "correct": 0,
          "explanation": "sanity.config.js (or .ts) contains the main configuration for Sanity projects."
        },
        {
          "id": "w6d3q5",
          "type": "multiple-choice",
          "question": "What command starts the Sanity Studio development server?",
          "options": [
            "sanity start",
            "sanity dev",
            "sanity serve",
            "npm run dev"
          ],
          "correct": 0,
          "explanation": "'sanity start' launches the development server for Sanity Studio."
        }
      ]
    },
    {
      "weekId": 6,
      "dayId": 4,
      "title": "GROQ Queries & Data Fetching",
      "description": "Test your knowledge of GROQ query language and Sanity data fetching",
      "timeLimit": 300,
      "passingScore": 70,
      "xpReward": 25,
      "questions": [
        {
          "id": "w6d4q1",
          "type": "multiple-choice",
          "question": "What does GROQ stand for?",
          "options": [
            "Graph Relational Object Queries",
            "General Resource Object Queries", 
            "Graph-Relational Object Queries",
            "Generic Resource Object Queries"
          ],
          "correct": 2,
          "explanation": "GROQ stands for Graph-Relational Object Queries, Sanity's query language."
        },
        {
          "id": "w6d4q2",
          "type": "multiple-choice",
          "question": "Which GROQ query fetches all documents of type 'post'?",
          "options": [
            "*[_type = 'post']",
            "*[type == 'post']",
            "*[_type == 'post']",
            "documents[_type == 'post']"
          ],
          "correct": 2,
          "explanation": "The correct syntax is *[_type == 'post'] to filter documents by type."
        },
        {
          "id": "w6d4q3",
          "type": "true-false",
          "question": "GROQ queries can follow references to fetch related data.",
          "correct": true,
          "explanation": "GROQ supports reference following using the -> operator to fetch related documents."
        },
        {
          "id": "w6d4q4",
          "type": "multiple-choice",
          "question": "How do you limit GROQ results to the first 10 items?",
          "options": [
            "*[_type == 'post'] | limit(10)",
            "*[_type == 'post'][0...10]",
            "*[_type == 'post'] | take(10)",
            "*[_type == 'post'] limit 10"
          ],
          "correct": 1,
          "explanation": "Use slice notation [0...10] to limit results to the first 10 items."
        }
      ]
    }
  ]
};

// Quiz configuration
window.QUIZ_CONFIG = {
  showResultsImmediately: true,
  allowRetakes: true,
  saveProgress: true,
  bonusXPForPerfectScore: 10,
  timeWarningAt: 60, // seconds remaining
  achievements: {
    "quiz-master": {
      name: "Quiz Master",
      description: "Complete 5 quizzes with 100% score",
      icon: "🧠",
      xpReward: 100
    },
    "speed-learner": {
      name: "Speed Learner", 
      description: "Complete a quiz in under 2 minutes",
      icon: "⚡",
      xpReward: 50
    },
    "persistent-student": {
      name: "Persistent Student",
      description: "Complete 10 quizzes",
      icon: "📚",
      xpReward: 75
    }
  }
};