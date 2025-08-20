/**
 * Main Application Logic - UI Components and Event Handling
 */

class CurriculumApp {
    constructor() {
        this.checklistManager = new ChecklistManager();
        this.gamificationSystem = new GamificationSystem();
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
            
            // Render the UI
            this.renderUI();
            
            // Update progress displays
            this.updateProgressDisplays();
            
            this.isInitialized = true;
            console.log('Curriculum app initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showError('Failed to load curriculum data. Please refresh the page.');
        }
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
     * Create HTML for a single task
     */
    createTaskHTML(task) {
        const isCompleted = this.checklistManager.isTaskCompleted(task.id);
        
        return `
            <div class="task-item ${isCompleted ? 'completed' : ''}" data-task-id="${task.id}">
                <div class="task-checkbox ${isCompleted ? 'checked' : ''}" data-task-id="${task.id}">
                    ${isCompleted ? '✓' : ''}
                </div>
                <div class="task-content">
                    <div class="task-text">${task.text}</div>
                    <div class="task-meta">
                        <span class="task-type">${task.type}</span>
                        <span class="task-xp">+${task.xp} XP</span>
                    </div>
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
                element.classList.toggle('checked', isCompleted);
                element.textContent = isCompleted ? '✓' : '';
                if (isCompleted) {
                    element.classList.add('checking');
                    setTimeout(() => element.classList.remove('checking'), 300);
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
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set up task checkbox event delegation
    document.addEventListener('click', (e) => {
        if (e.target.matches('.task-checkbox, .task-checkbox *')) {
            e.preventDefault();
            const taskId = e.target.closest('.task-checkbox').dataset.taskId;
            if (taskId && window.app) {
                window.app.checklistManager.toggleTask(taskId);
            }
        }
    });
    
    // Initialize the app
    window.app = new CurriculumApp();
    window.app.init();
});

// Export for global access
window.CurriculumApp = CurriculumApp;