/**
 * Public Progress Viewer for Michael's Journey
 * View-only access to Michael's curriculum progress
 */

class PublicProgressViewer {
    constructor() {
        this.michaelProgressData = {
            totalXP: 125,
            currentLevel: 3,
            completedTasks: 12,
            totalTasks: 120,
            percentage: 10,
            achievements: ['first-steps', 'quick-learner', 'daily-warrior'],
            weeklyProgress: {
                week1: { completed: 15, total: 15, percentage: 100 },
                week2: { completed: 8, total: 15, percentage: 53 },
                week3: { completed: 2, total: 15, percentage: 13 }
            }
        };
        this.init();
    }

    /**
     * Initialize the public progress viewer
     */
    init() {
        this.loadMichaelProgress();
        this.loadCurriculumContent();
        this.addViewOnlyStyles();
        this.updatePageTitle();
    }

    /**
     * Load and display Michael's progress data
     */
    loadMichaelProgress() {
        console.log('Loading Michael\'s progress for public viewing');
        this.updateProgressDisplays(this.michaelProgressData);
    }

    /**
     * Update progress displays with Michael's data
     */
    updateProgressDisplays(progressData) {
        // Update XP and level
        const levelBadge = document.getElementById('levelBadge');
        const xpText = document.getElementById('xpText');
        const xpFill = document.getElementById('xpFill');

        if (levelBadge) {
            const levelText = levelBadge.querySelector('.level-text');
            if (levelText) {
                levelText.textContent = `Level ${progressData.currentLevel}`;
            }
        }

        if (xpText) {
            const xpForNextLevel = progressData.currentLevel * 100;
            xpText.textContent = `${progressData.totalXP} / ${xpForNextLevel} XP`;
        }

        if (xpFill) {
            const xpForNextLevel = progressData.currentLevel * 100;
            const xpProgress = (progressData.totalXP % 100) / 100;
            xpFill.style.width = `${xpProgress * 100}%`;
        }

        // Update overall progress
        const completedTasks = document.getElementById('completedTasks');
        const totalTasks = document.getElementById('totalTasks');
        const completionPercentage = document.getElementById('completionPercentage');
        const overallProgress = document.getElementById('overallProgress');

        if (completedTasks) completedTasks.textContent = progressData.completedTasks;
        if (totalTasks) totalTasks.textContent = progressData.totalTasks;
        if (completionPercentage) completionPercentage.textContent = progressData.percentage;
        if (overallProgress) overallProgress.style.width = `${progressData.percentage}%`;
    }

    /**
     * Load curriculum content in view-only mode
     */
    async loadCurriculumContent() {
        try {
            // Check if curriculum app exists and initialize it in read-only mode
            if (typeof window.app !== 'undefined') {
                // Mark all tasks as view-only
                this.makeTasksViewOnly();
            } else {
                // Wait for app to load then make view-only
                setTimeout(() => this.loadCurriculumContent(), 500);
            }
        } catch (error) {
            console.error('Error loading curriculum content:', error);
        }
    }

    /**
     * Make all task checkboxes view-only (disabled)
     */
    makeTasksViewOnly() {
        // Disable all task checkboxes
        const taskCheckboxes = document.querySelectorAll('.task-checkbox');
        taskCheckboxes.forEach(checkbox => {
            checkbox.disabled = true;
            checkbox.style.cursor = 'not-allowed';
            
            // Add visual indicator that it's view-only
            const taskItem = checkbox.closest('.task-item');
            if (taskItem) {
                taskItem.classList.add('view-only-task');
            }
        });

        // Disable week completion buttons if they exist
        const weekButtons = document.querySelectorAll('.week-complete-btn');
        weekButtons.forEach(btn => {
            btn.disabled = true;
            btn.style.cursor = 'not-allowed';
            btn.textContent = 'View Only';
        });

        console.log(`Made ${taskCheckboxes.length} tasks view-only`);
    }

    /**
     * Add view-only styling
     */
    addViewOnlyStyles() {
        const style = document.createElement('style');
        style.id = 'view-only-styles';
        style.textContent = `
            .view-only-notice {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                background: rgba(59, 130, 246, 0.1);
                border: 1px solid rgba(59, 130, 246, 0.3);
                padding: 0.75rem 1rem;
                border-radius: 8px;
                margin-top: 1rem;
                color: #1e40af;
                font-size: 0.9rem;
            }
            
            .notice-icon {
                font-size: 1.2rem;
            }
            
            .view-only-task {
                opacity: 0.8;
                position: relative;
            }
            
            .view-only-task::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(45deg, transparent 48%, rgba(255,0,0,0.1) 49%, rgba(255,0,0,0.1) 51%, transparent 52%);
                pointer-events: none;
                z-index: 1;
            }
            
            .task-checkbox:disabled {
                opacity: 0.6;
                cursor: not-allowed !important;
            }
            
            .task-item:hover .view-only-task {
                background: rgba(59, 130, 246, 0.05);
            }
            
            .progress-header h2 {
                color: #1e40af;
            }
            
            .journey-subtitle {
                color: #64748b;
                font-style: italic;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Update page title for public view
     */
    updatePageTitle() {
        document.title = "Michael's Progress Journey - Frontend Developer Curriculum";
    }

    /**
     * Override any existing task completion handlers
     */
    disableTaskInteraction() {
        // Remove click handlers from task items
        document.addEventListener('click', (e) => {
            if (e.target.matches('.task-checkbox') || e.target.closest('.task-item')) {
                if (e.target.matches('.task-checkbox') && e.target.disabled) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.showViewOnlyMessage();
                }
            }
        }, true);
    }

    /**
     * Show message when user tries to interact with view-only content
     */
    showViewOnlyMessage() {
        // Create temporary notification
        const notification = document.createElement('div');
        notification.className = 'view-only-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">👀</span>
                <span class="notification-text">This is Michael's progress - view only!</span>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: #f59e0b;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }

    /**
     * Simulate Michael's actual progress state
     */
    simulateMichaelProgress() {
        // This would eventually load from michael-progress.json
        // For now, simulate completed tasks based on his actual progress
        
        const completedTaskIds = [
            'w1d1t1', 'w1d1t2', 'w1d1t3',
            'w1d2t1', 'w1d2t2', 'w1d2t3',
            'w1d3t1', 'w1d3t2', 'w1d3t3',
            'w1d4t1', 'w1d4t2', 'w1d4t3',
            'w1d5t1', 'w1d5t2', 'w1d5t3', // Week 1 complete
            'w2d1t1', 'w2d1t2', 'w2d1t3',
            'w2d2t1', 'w2d2t2', 'w2d2t3',
            'w2d3t1', 'w2d3t2', // Week 2 partial
            'w3d1t1', 'w3d1t2' // Week 3 started
        ];

        // Mark completed tasks visually (but still disabled)
        setTimeout(() => {
            completedTaskIds.forEach(taskId => {
                const checkbox = document.querySelector(`input[data-task-id="${taskId}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                    checkbox.disabled = true;
                    
                    const taskItem = checkbox.closest('.task-item');
                    if (taskItem) {
                        taskItem.classList.add('completed', 'view-only-task');
                    }
                }
            });
        }, 1000);

        return completedTaskIds;
    }
}

// Initialize public progress viewer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.publicViewer = new PublicProgressViewer();
    
    // Set up view-only interaction handling
    setTimeout(() => {
        if (window.publicViewer) {
            window.publicViewer.disableTaskInteraction();
            window.publicViewer.simulateMichaelProgress();
        }
    }, 2000);
});