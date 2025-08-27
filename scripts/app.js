/**
 * Main Application Logic - UI Components and Event Handling
 */

class CurriculumApp {
    constructor() {
        this.checklistManager = new ChecklistManager();
        this.gamificationSystem = new GamificationSystem();
        this.quizSystem = new QuizSystem();
        this.isInitialized = false;
    }

    /**
     * Initialize the application
     */
    async init() {
        if (this.isInitialized) return;

        try {
            // Load curriculum data
            await this.checklistManager.loadCurriculum();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Set up gamification callbacks
            this.setupGamificationCallbacks();
            
            // Initialize quiz system
            this.quizSystem.init();
            this.setupQuizCallbacks();
            
            // Render the UI
            this.renderUI();
            
            // Update progress displays
            this.updateProgressDisplays();
            
            // Load user progress if authenticated
            setTimeout(() => this.loadUserProgress(), 1000);
            
            this.isInitialized = true;
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showError('Failed to load curriculum data. Please refresh the page.');
        }
    }


    /**
     * Force reload progress from localStorage
     */
    forceProgressReload() {
        
        // Reload completed tasks
        this.checklistManager.completedTasks = this.checklistManager.loadCompletedTasks();
        
        // Reload player data
        this.gamificationSystem.playerData = this.gamificationSystem.loadPlayerData();
        
        // Re-render everything
        this.renderUI();
        this.updateProgressDisplays();
        
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Task completion events
        this.checklistManager.onTaskToggle((taskId, isCompleted, task) => {
            this.handleTaskToggle(taskId, isCompleted, task);
        });

        this.checklistManager.onProgressUpdate(() => {
            this.updateProgressDisplays();
        });

        // Reset progress button
        const resetBtn = document.getElementById('resetProgressBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.handleResetProgress();
            });
        }

        // Week header expansion
        document.addEventListener('click', (e) => {
            if (e.target.closest('.week-header')) {
                this.handleWeekToggle(e.target.closest('.week-section'));
            }
        });

        // Achievement notification close
        document.addEventListener('click', (e) => {
            if (e.target.closest('.achievement-notification')) {
                this.hideAchievementNotification();
            }
        });

        // Tutorial button clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('.tutorial-btn')) {
                e.preventDefault();
                const tutorialName = e.target.dataset.tutorial;
                this.openTutorial(tutorialName);
            }
        });

        // Debug panel toggle (Ctrl + D)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                this.toggleDebugPanel();
            }
        });
    }

    /**
     * Set up gamification system callbacks
     */
    setupGamificationCallbacks() {
        this.gamificationSystem.onXPGain((amount, source) => {
            this.updateXPDisplay();
        });

        this.gamificationSystem.onLevelUp((newLevel, oldLevel) => {
            this.updateLevelDisplay();
            this.gamificationSystem.showLevelUpAnimation(newLevel);
        });

        this.gamificationSystem.onAchievementUnlock((achievement) => {
            this.gamificationSystem.showAchievementUnlock(achievement);
            this.updateAchievementsDisplay();
        });
    }

    /**
     * Set up quiz system callbacks
     */
    setupQuizCallbacks() {
        this.quizSystem.onQuizComplete((quiz, results) => {
            if (results.passed) {
                // Award XP for quiz completion
                this.gamificationSystem.awardXP(quiz.xpReward, `Quiz: ${quiz.title}`);
                this.updateXPDisplay();
                this.updateLevelDisplay();
            }
        });
    }

    /**
     * Render the main UI
     */
    renderUI() {
        this.renderWeeks();
        this.renderAchievements();
        this.updateXPDisplay();
        this.updateLevelDisplay();
    }

    /**
     * Render all weeks and their content
     */
    renderWeeks() {
        const weeksContainer = document.getElementById('weeksContainer');
        if (!weeksContainer) return;

        const weeks = this.checklistManager.getWeeks();
        weeksContainer.innerHTML = '';

        weeks.forEach(week => {
            const weekElement = this.createWeekElement(week);
            weeksContainer.appendChild(weekElement);
        });
    }

    /**
     * Create a week section element
     */
    createWeekElement(week) {
        const weekDiv = document.createElement('div');
        weekDiv.className = 'week-section';
        weekDiv.dataset.weekId = week.id;

        const progress = this.checklistManager.getWeekProgress(week.id);
        const totalTasks = this.checklistManager.getWeekTasks(week.id).length;
        const completedTasks = this.checklistManager.getWeekTasks(week.id)
            .filter(task => this.checklistManager.isTaskCompleted(task.id)).length;

        weekDiv.innerHTML = `
            <div class="week-header">
                <div class="week-info">
                    <h3>Week ${week.id}: ${week.title}</h3>
                    <p class="week-description">${week.description}</p>
                </div>
                <div class="week-stats">
                    <div class="week-progress">${completedTasks}/${totalTasks} tasks (${progress}%)</div>
                    <div class="expand-icon">▼</div>
                </div>
            </div>
            <div class="week-content">
                <div class="week-milestone">
                    <h4>📍 Week Milestone</h4>
                    <p>${week.milestone}</p>
                </div>
                ${this.createDaysHTML(week)}
                ${this.createWeeklyTestHTML(week.id)}
            </div>
        `;

        return weekDiv;
    }

    /**
     * Create HTML for all days in a week
     */
    createDaysHTML(week) {
        return week.days.map(day => {
            const dayProgress = this.checklistManager.getDayProgress(week.id, day.day);
            const totalTasks = day.tasks.length;
            const completedTasks = day.tasks.filter(task => 
                this.checklistManager.isTaskCompleted(task.id)
            ).length;

            return `
                <div class="day-section">
                    <div class="day-header">
                        <div class="day-title">
                            ${day.day}
                            <span class="day-theme">- ${day.theme}</span>
                        </div>
                        <div class="day-progress">${completedTasks}/${totalTasks} (${dayProgress}%)</div>
                    </div>
                    <div class="tasks-list">
                        ${day.tasks.map(task => this.createTaskHTML(task)).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Create HTML for day quiz button
     */
    createDayQuizHTML(weekId, dayName) {
        // Convert day name to day ID (Monday = 1, Tuesday = 2, etc.)
        const dayId = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].indexOf(dayName) + 1;
        
        if (!this.quizSystem.isQuizAvailable(weekId, dayId)) {
            return ''; // No quiz available for this day
        }

        // Check if all tasks for this day are completed
        const dayTasks = this.checklistManager.getDayTasks(weekId, dayName);
        const isDayCompleted = dayTasks.length > 0 && dayTasks.every(task => 
            this.checklistManager.isTaskCompleted(task.id)
        );
        const quizStatus = this.quizSystem.getQuizStatus(weekId, dayId);
        
        let buttonClass = 'day-quiz-btn';
        let buttonText = '🧠 Take Quiz';
        let disabled = false;
        
        if (!isDayCompleted) {
            buttonClass += ' disabled';
            buttonText = '🔒 Complete All Tasks First';
            disabled = true;
        } else if (quizStatus && quizStatus.passed) {
            buttonClass += ' completed';
            buttonText = `✅ Quiz Completed`;
        } else if (quizStatus && !quizStatus.passed) {
            buttonText = `🔄 Retake Quiz`;
        }

        // Add quiz score display for completed quizzes
        let scoreDisplay = '';
        if (quizStatus && (quizStatus.passed || quizStatus.score !== undefined)) {
            scoreDisplay = `<span class="quiz-score">${quizStatus.score}%</span>`;
        }

        return `
            <div class="day-quiz-section">
                <button class="${buttonClass}" 
                        onclick="window.app.startDayQuiz(${weekId}, ${dayId})"
                        ${disabled ? 'disabled' : ''}>
                    ${buttonText}
                </button>
                ${scoreDisplay}
            </div>
        `;
    }

    /**
     * Start quiz for a specific day
     */
    startDayQuiz(weekId, dayId) {
        this.quizSystem.startQuiz(weekId, dayId);
    }

    /**
     * Get task quiz status
     */
    getTaskQuizStatus(taskId) {
        const taskQuizProgress = JSON.parse(localStorage.getItem('task-quiz-progress') || '{}');
        return taskQuizProgress[taskId];
    }

    /**
     * Start task quiz
     */
    startTaskQuiz(taskId) {
        this.quizSystem.startTaskQuiz(taskId);
    }

    /**
     * Get weekly test status
     */
    getWeeklyTestStatus(weekId) {
        const weeklyTestProgress = JSON.parse(localStorage.getItem('weekly-test-progress') || '{}');
        return weeklyTestProgress[`week${weekId}`];
    }

    /**
     * Start weekly test
     */
    startWeeklyTest(weekId) {
        this.quizSystem.startWeeklyTest(weekId);
    }

    /**
     * Open video modal for task tutorials
     */
    openVideoModal(videoId, taskTitle) {
        this.createVideoModal(videoId, taskTitle);
    }

    /**
     * Create and show video modal
     */
    createVideoModal(videoId, taskTitle) {
        // Remove existing modal if any
        const existingModal = document.getElementById('videoModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create modal HTML
        const modal = document.createElement('div');
        modal.id = 'videoModal';
        modal.className = 'video-modal';
        modal.innerHTML = `
            <div class="video-modal-overlay" onclick="window.app.closeVideoModal()"></div>
            <div class="video-modal-content">
                <div class="video-modal-header">
                    <h3>📺 How To: ${taskTitle}</h3>
                    <button class="video-modal-close" onclick="window.app.closeVideoModal()">&times;</button>
                </div>
                <div class="video-modal-body">
                    <div class="video-container">
                        <iframe 
                            src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
                            title="How To Video" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                        </iframe>
                    </div>
                    <div class="video-actions">
                        <button class="video-action-btn" onclick="window.open('https://www.youtube.com/watch?v=${videoId}', '_blank')">
                            🔗 Watch on YouTube
                        </button>
                        <button class="video-action-btn" onclick="window.app.closeVideoModal()">
                            ✅ Close Video
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add to document
        document.body.appendChild(modal);

        // Show modal with animation
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close video modal
     */
    closeVideoModal() {
        const modal = document.getElementById('videoModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = 'auto';
            }, 300);
        }
    }

    /**
     * Create weekly test HTML
     */
    createWeeklyTestHTML(weekId) {
        // Check if all tasks in the week are completed
        const week = this.checklistManager.getWeek(weekId);
        if (!week) return '';

        const allTasksCompleted = week.days.every(day => 
            day.tasks.every(task => this.checklistManager.isTaskCompleted(task.id))
        );

        const weekTestStatus = this.getWeeklyTestStatus(weekId);
        
        if (!allTasksCompleted) {
            return `
                <div class="weekly-test-section">
                    <div class="weekly-test-locked">
                        <h4>🏆 Weekly Comprehensive Test</h4>
                        <p>Complete all tasks in this week to unlock the comprehensive test</p>
                        <button class="weekly-test-btn disabled" disabled>
                            🔒 Complete All Tasks First
                        </button>
                    </div>
                </div>
            `;
        }

        let testHTML = '';
        if (!weekTestStatus) {
            // Test not taken yet
            testHTML = `
                <div class="weekly-test-section">
                    <div class="weekly-test-available">
                        <h4>🏆 Weekly Comprehensive Test</h4>
                        <p>Test your knowledge of everything learned this week (15-20 questions)</p>
                        <button class="weekly-test-btn" onclick="window.app.startWeeklyTest(${weekId})">
                            🧠 Take Comprehensive Test
                        </button>
                    </div>
                </div>
            `;
        } else {
            // Test completed
            const scoreClass = weekTestStatus.passed ? 'passed' : 'failed';
            testHTML = `
                <div class="weekly-test-section">
                    <div class="weekly-test-completed ${scoreClass}">
                        <h4>🏆 Weekly Comprehensive Test</h4>
                        <div class="test-result">
                            <span class="test-status">${weekTestStatus.passed ? '✅ Passed' : '🔄 Retake Available'}</span>
                            <span class="test-score">${weekTestStatus.score}%</span>
                        </div>
                        ${!weekTestStatus.passed ? `
                            <button class="weekly-test-btn retake" onclick="window.app.startWeeklyTest(${weekId})">
                                🔄 Retake Test
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        return testHTML;
    }

    /**
     * Create HTML for a single task
     */
    createTaskHTML(task) {
        const isCompleted = this.checklistManager.isTaskCompleted(task.id);
        const tutorialButton = task.tutorial ? 
            `<button class="tutorial-btn" data-tutorial="${task.tutorial}">📖 Tutorial</button>` : '';
        const videoButton = task.video ? 
            `<button class="video-btn" onclick="window.app.openVideoModal('${task.video}', '${task.text.replace(/'/g, "\\'")}')">📺 How To Video</button>` : '';
        const cmsIcon = task.type === 'setup' && task.text.toLowerCase().includes('sanity') ? '🗄️' : '';
        
        // Task quiz system
        const taskQuizStatus = this.getTaskQuizStatus(task.id);
        let taskQuizHTML = '';
        
        if (isCompleted && !taskQuizStatus) {
            // Task completed but quiz not taken
            taskQuizHTML = `
                <div class="task-quiz-section">
                    <button class="task-quiz-btn" onclick="window.app.startTaskQuiz('${task.id}')">
                        🧠 Take 5-Question Quiz
                    </button>
                </div>
            `;
        } else if (taskQuizStatus) {
            // Quiz completed - show score
            const scoreClass = taskQuizStatus.passed ? 'passed' : 'failed';
            taskQuizHTML = `
                <div class="task-quiz-section">
                    <div class="task-quiz-completed ${scoreClass}">
                        <span class="quiz-status">${taskQuizStatus.passed ? '✅' : '🔄'} Quiz ${taskQuizStatus.passed ? 'Completed' : 'Retake'}</span>
                        <span class="quiz-score">${taskQuizStatus.score}%</span>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="task-item ${isCompleted ? 'completed' : ''}" data-task-id="${task.id}">
                <label class="task-checkbox-wrapper">
                    <input type="checkbox" class="task-checkbox" data-task-id="${task.id}" ${isCompleted ? 'checked' : ''} aria-label="Mark task as ${isCompleted ? 'incomplete' : 'complete'}">
                    <span class="checkmark ${isCompleted ? 'checked' : ''}">
                        ${isCompleted ? '✓' : ''}
                    </span>
                </label>
                <div class="task-content">
                    <div class="task-text">${cmsIcon}${task.text}</div>
                    <div class="task-meta">
                        <span class="task-type">${task.type}</span>
                        <span class="task-xp">+${task.xp} XP</span>
                        ${tutorialButton}
                        ${videoButton}
                    </div>
                    ${taskQuizHTML}
                </div>
            </div>
        `;
    }

    /**
     * Render achievements panel
     */
    renderAchievements() {
        const achievementsGrid = document.getElementById('achievementsGrid');
        if (!achievementsGrid) return;

        const achievements = this.gamificationSystem.getAchievements();
        achievementsGrid.innerHTML = '';

        achievements.forEach(achievement => {
            const achievementElement = this.createAchievementElement(achievement);
            achievementsGrid.appendChild(achievementElement);
        });
    }

    /**
     * Create achievement badge element
     */
    createAchievementElement(achievement) {
        const achievementDiv = document.createElement('div');
        achievementDiv.className = `achievement-badge ${achievement.unlocked ? 'unlocked' : 'locked'}`;
        
        achievementDiv.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-description">${achievement.description}</div>
        `;

        return achievementDiv;
    }

    /**
     * Handle task toggle
     */
    handleTaskToggle(taskId, isCompleted, task) {
        // Update task UI
        this.updateTaskUI(taskId, isCompleted);
        
        // Process gamification if task was completed
        if (isCompleted && task) {
            const result = this.gamificationSystem.processTaskCompletion(taskId, task, this.checklistManager);
            
            // Show XP gain animation
            const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
            if (taskElement) {
                this.gamificationSystem.showXPGain(task.xp, taskElement);
            }
        }
        
        // Save user progress if logged in
        this.saveUserProgress();
        
        // Update week progress
        this.updateWeekProgress(task);
    }

    /**
     * Update task UI state
     */
    updateTaskUI(taskId, isCompleted) {
        const taskElements = document.querySelectorAll(`[data-task-id="${taskId}"]`);
        
        taskElements.forEach(element => {
            if (element.classList.contains('task-item')) {
                element.classList.toggle('completed', isCompleted);
                if (isCompleted) {
                    element.classList.add('completing');
                    setTimeout(() => element.classList.remove('completing'), 600);
                }
            } else if (element.classList.contains('task-checkbox')) {
                element.checked = isCompleted;
                const checkmark = element.nextElementSibling;
                if (checkmark) {
                    checkmark.classList.toggle('checked', isCompleted);
                    checkmark.textContent = isCompleted ? '✓' : '';
                    if (isCompleted) {
                        checkmark.classList.add('checking');
                        setTimeout(() => checkmark.classList.remove('checking'), 300);
                    }
                }
            }
        });
    }

    /**
     * Update week progress display
     */
    updateWeekProgress(task) {
        // Find which week this task belongs to
        const weeks = this.checklistManager.getWeeks();
        
        for (const week of weeks) {
            for (const day of week.days) {
                if (day.tasks.some(t => t.id === task?.id)) {
                    this.updateWeekStats(week.id);
                    return;
                }
            }
        }
    }

    /**
     * Update week statistics display
     */
    updateWeekStats(weekId) {
        const weekElement = document.querySelector(`[data-week-id="${weekId}"]`);
        if (!weekElement) return;

        const progress = this.checklistManager.getWeekProgress(weekId);
        const totalTasks = this.checklistManager.getWeekTasks(weekId).length;
        const completedTasks = this.checklistManager.getWeekTasks(weekId)
            .filter(task => this.checklistManager.isTaskCompleted(task.id)).length;

        const progressElement = weekElement.querySelector('.week-progress');
        if (progressElement) {
            progressElement.textContent = `${completedTasks}/${totalTasks} tasks (${progress}%)`;
        }

        // Update day progress for this week
        const week = this.checklistManager.getWeek(weekId);
        if (week) {
            week.days.forEach(day => {
                const dayProgress = this.checklistManager.getDayProgress(weekId, day.day);
                const dayTotalTasks = day.tasks.length;
                const dayCompletedTasks = day.tasks.filter(task => 
                    this.checklistManager.isTaskCompleted(task.id)
                ).length;

                const dayProgressElement = weekElement.querySelector(
                    `.day-section:nth-child(${week.days.indexOf(day) + 2}) .day-progress`
                );
                if (dayProgressElement) {
                    dayProgressElement.textContent = `${dayCompletedTasks}/${dayTotalTasks} (${dayProgress}%)`;
                }
            });
        }
    }

    /**
     * Handle week header toggle
     */
    handleWeekToggle(weekSection) {
        if (!weekSection) return;
        
        weekSection.classList.toggle('expanded');
    }

    /**
     * Update overall progress displays
     */
    updateProgressDisplays() {
        const stats = this.checklistManager.getCompletionStats();
        
        // Update overall progress bar
        const progressFill = document.getElementById('overallProgress');
        if (progressFill) {
            progressFill.style.width = `${stats.percentage}%`;
        }
        
        // Update progress text
        const completedTasks = document.getElementById('completedTasks');
        const totalTasks = document.getElementById('totalTasks');
        const completionPercentage = document.getElementById('completionPercentage');
        
        if (completedTasks) completedTasks.textContent = stats.completed;
        if (totalTasks) totalTasks.textContent = stats.total;
        if (completionPercentage) completionPercentage.textContent = stats.percentage;
    }

    /**
     * Update XP display
     */
    updateXPDisplay() {
        const playerStats = this.gamificationSystem.getPlayerStats();
        
        const xpFill = document.getElementById('xpFill');
        const xpText = document.getElementById('xpText');
        
        if (xpFill) {
            xpFill.style.width = `${playerStats.levelProgress}%`;
        }
        
        if (xpText) {
            const nextLevelXP = playerStats.level >= 20 ? 'MAX' : 
                playerStats.xp + playerStats.xpForNextLevel;
            xpText.textContent = `${playerStats.xp} / ${nextLevelXP} XP`;
        }
    }

    /**
     * Update level display
     */
    updateLevelDisplay() {
        const playerStats = this.gamificationSystem.getPlayerStats();
        
        const levelBadge = document.getElementById('levelBadge');
        if (levelBadge) {
            const levelText = levelBadge.querySelector('.level-text');
            if (levelText) {
                levelText.textContent = `Level ${playerStats.level}`;
            }
        }
    }

    /**
     * Update achievements display
     */
    updateAchievementsDisplay() {
        this.renderAchievements();
    }

    /**
     * Handle reset progress
     */
    handleResetProgress() {
        const confirmed = confirm(
            'Are you sure you want to reset all progress? This action cannot be undone.'
        );
        
        if (confirmed) {
            this.checklistManager.resetProgress();
            this.gamificationSystem.resetProgress();
            this.renderUI();
            this.updateProgressDisplays();
        }
    }

    /**
     * Hide achievement notification
     */
    hideAchievementNotification() {
        const notification = document.getElementById('achievementNotification');
        if (notification) {
            notification.classList.remove('show');
        }
    }

    /**
     * Open tutorial in modal
     */
    openTutorial(tutorialName) {
        this.showModal('Tutorial', `Loading ${tutorialName} tutorial...`, 'loading');
        
        // Load tutorial content
        fetch(`./tutorials/${tutorialName}.md`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Tutorial not found');
                }
                return response.text();
            })
            .then(content => {
                this.showModal('Sanity.io CLI Tutorial', content, 'tutorial');
            })
            .catch(error => {
                console.error('Error loading tutorial:', error);
                this.showModal('Error', 'Failed to load tutorial content. Please check console for details.', 'error');
            });
    }

    /**
     * Show modal with content
     */
    showModal(title, content, type = 'default') {
        // Remove existing modal if any
        const existingModal = document.getElementById('tutorialModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'tutorialModal';
        modal.className = 'tutorial-modal';
        
        const formattedContent = type === 'tutorial' ? this.formatMarkdown(content) : content;
        
        modal.innerHTML = `
            <div class="tutorial-modal-content">
                <div class="tutorial-modal-header">
                    <h2>${title}</h2>
                    <button class="tutorial-modal-close">&times;</button>
                </div>
                <div class="tutorial-modal-body ${type}">
                    ${formattedContent}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Close button event
        modal.querySelector('.tutorial-modal-close').addEventListener('click', () => {
            modal.remove();
        });
        
        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    /**
     * Format markdown content for display
     */
    formatMarkdown(markdown) {
        // Simple markdown to HTML conversion
        let html = markdown
            // Headers
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            // Code blocks
            .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
            // Inline code
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // Bold
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
            // Paragraphs
            .replace(/\n\n/g, '</p><p>')
            // Line breaks
            .replace(/\n/g, '<br>');
        
        return `<div class="markdown-content"><p>${html}</p></div>`;
    }

    /**
     * Toggle debug panel for progress tracking
     */
    toggleDebugPanel() {
        let debugPanel = document.getElementById('debugPanel');
        
        if (debugPanel) {
            debugPanel.remove();
            return;
        }

        debugPanel = document.createElement('div');
        debugPanel.id = 'debugPanel';
        debugPanel.innerHTML = `
            <div class="debug-panel">
                <div class="debug-header">
                    <h3>Progress Debug Panel</h3>
                    <button class="debug-close" onclick="this.closest('#debugPanel').remove()">&times;</button>
                </div>
                <div class="debug-content">
                    <div class="debug-section">
                        <h4>Storage Status</h4>
                        <div id="debugStorageStatus">Loading...</div>
                    </div>
                    <div class="debug-section">
                        <h4>Current Progress</h4>
                        <div id="debugProgressInfo">Loading...</div>
                    </div>
                    <div class="debug-section">
                        <h4>Actions</h4>
                        <button class="debug-btn" onclick="window.app.manualSave()">Force Save</button>
                        <button class="debug-btn" onclick="window.app.refreshProgress()">Refresh Display</button>
                        <button class="debug-btn" onclick="window.app.exportProgressData()">Export Data</button>
                    </div>
                </div>
            </div>
        `;

        debugPanel.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 350px;
            background: white;
            border: 2px solid #3b82f6;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 9999;
            font-family: monospace;
        `;

        document.body.appendChild(debugPanel);
        this.updateDebugPanel();
    }

    /**
     * Update debug panel with current information
     */
    updateDebugPanel() {
        const debugPanel = document.getElementById('debugPanel');
        if (!debugPanel) return;

        // Storage status
        const storageStatus = document.getElementById('debugStorageStatus');
        if (storageStatus) {
            const completedTasks = localStorage.getItem('completedTasks');
            const playerData = localStorage.getItem('playerData');
            storageStatus.innerHTML = `
                <div>✓ localStorage Available: ${typeof Storage !== 'undefined'}</div>
                <div>✓ Completed Tasks: ${completedTasks ? JSON.parse(completedTasks).length : 0}</div>
                <div>✓ Player Data: ${playerData ? 'Saved' : 'Missing'}</div>
            `;
        }

        // Progress info
        const progressInfo = document.getElementById('debugProgressInfo');
        if (progressInfo) {
            const stats = this.checklistManager.getCompletionStats();
            const playerStats = this.gamificationSystem.getPlayerStats();
            const achievements = this.gamificationSystem.getAchievements();
            const unlockedCount = achievements.filter(a => a.unlocked).length;

            progressInfo.innerHTML = `
                <div>Tasks: ${stats.completed}/${stats.total} (${stats.percentage}%)</div>
                <div>XP: ${playerStats.xp} | Level: ${playerStats.level}</div>
                <div>Achievements: ${unlockedCount}/${achievements.length}</div>
                <div>Last Save: ${new Date().toLocaleTimeString()}</div>
            `;
        }
    }

    /**
     * Manually save all progress data
     */
    manualSave() {
        this.checklistManager.saveCompletedTasks();
        this.gamificationSystem.savePlayerData();
        this.updateDebugPanel();
        
        // Show confirmation
        const notification = document.createElement('div');
        notification.textContent = '✓ Progress saved manually!';
        notification.style.cssText = `
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: #10b981;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            z-index: 10000;
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
    }

    /**
     * Refresh all progress displays
     */
    refreshProgress() {
        this.renderUI();
        this.updateProgressDisplays();
        this.updateDebugPanel();
    }

    /**
     * Export current progress data
     */
    exportProgressData() {
        const progressData = this.checklistManager.exportProgress();
        const playerData = this.gamificationSystem.getPlayerStats();
        const achievements = this.gamificationSystem.getAchievements();
        
        const exportData = {
            ...progressData,
            playerStats: playerData,
            achievements: achievements.filter(a => a.unlocked),
            exportedAt: new Date().toISOString()
        };

        // Create downloadable file
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `curriculum-progress-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
    }

    /**
     * Show error message
     */
    showError(message) {
        // Create a simple error display
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #ef4444;
            color: white;
            padding: 1rem 2rem;
            border-radius: 0.5rem;
            z-index: 1000;
            font-weight: 600;
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            document.body.removeChild(errorDiv);
        }, 5000);
    }

    /**
     * Save user progress if authenticated
     */
    saveUserProgress() {
        if (window.auth0System && window.auth0System.isAuthenticated && window.auth0System.currentUser) {
            try {
                const progressData = window.auth0System.getCurrentProgressData();
                window.auth0System.saveUserProgress(progressData);
            } catch (error) {
                console.error('Error saving user progress:', error);
            }
        }
    }

    /**
     * Load and restore user progress if authenticated
     */
    async loadUserProgress() {
        if (window.auth0System && window.auth0System.isAuthenticated && window.auth0System.currentUser) {
            try {
                await window.auth0System.loadUserProgress();
                this.updateProgressDisplays();
            } catch (error) {
                console.error('Error loading user progress:', error);
            }
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set up task checkbox event delegation
    document.addEventListener('change', (e) => {
        if (e.target.matches('.task-checkbox')) {
            const taskId = e.target.dataset.taskId;
            if (taskId && window.app) {
                window.app.checklistManager.toggleTask(taskId);
            }
        }
    });
    
    // Initialize the app
    window.app = new CurriculumApp();
    window.app.init();
    
    // Make quiz system globally available
    window.quizSystem = window.app.quizSystem;
});

// Export for global access
window.CurriculumApp = CurriculumApp;