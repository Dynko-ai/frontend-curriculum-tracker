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
     * Add view-only styling and email updates styling
     */
    addViewOnlyStyles() {
        const style = document.createElement('style');
        style.id = 'view-only-styles';
        style.textContent = `
            /* Email Updates Section */
            .email-updates-section {
                background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
                border: 1px solid #d1d5db;
                border-radius: 12px;
                padding: 1.5rem;
                margin-bottom: 2rem;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            
            .email-updates-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 2rem;
            }
            
            .email-updates-text h3 {
                margin: 0 0 0.5rem 0;
                color: #1f2937;
                font-size: 1.2rem;
            }
            
            .email-updates-text p {
                margin: 0;
                color: #6b7280;
                font-size: 0.95rem;
            }
            
            .email-login-btn {
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 8px;
                font-size: 0.9rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                white-space: nowrap;
            }
            
            .email-login-btn:hover {
                background: linear-gradient(135deg, #2563eb, #1e40af);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
            }
            
            .auth-success {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                gap: 0.5rem;
            }
            
            .user-info {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                gap: 0.75rem;
            }
            
            .user-email {
                font-weight: 600;
                color: #1f2937;
                font-size: 0.9rem;
            }
            
            .email-preferences {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                gap: 0.5rem;
            }
            
            .preference-group {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .preference-group label {
                font-size: 0.85rem;
                color: #4b5563;
                font-weight: 500;
            }
            
            .email-time-select {
                background: white;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                padding: 0.375rem 0.75rem;
                font-size: 0.85rem;
                color: #1f2937;
                cursor: pointer;
                transition: border-color 0.2s;
            }
            
            .email-time-select:hover {
                border-color: #3b82f6;
            }
            
            .email-time-select:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .subscription-status {
                color: #10b981;
                font-size: 0.85rem;
                font-weight: 500;
            }
            
            .email-logout-btn {
                background: #6b7280;
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 6px;
                font-size: 0.8rem;
                cursor: pointer;
                transition: background 0.2s;
            }
            
            .email-logout-btn:hover {
                background: #4b5563;
            }
            
            @media (max-width: 768px) {
                .email-updates-content {
                    flex-direction: column;
                    align-items: stretch;
                    text-align: center;
                    gap: 1rem;
                }
                
                .auth-success {
                    align-items: center;
                }
                
                .user-info {
                    align-items: center;
                }
                
                .email-preferences {
                    align-items: center;
                }
                
                .preference-group {
                    flex-direction: column;
                    gap: 0.25rem;
                }
            }
            
            /* Task Quiz Styling */
            .task-quiz-section {
                margin-top: 0.75rem;
                padding-left: 1rem;
            }
            
            .task-quiz-btn {
                background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 6px;
                font-size: 0.8rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .task-quiz-btn:hover {
                background: linear-gradient(135deg, #7c3aed, #6d28d9);
                transform: translateY(-1px);
            }
            
            .task-quiz-completed {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .task-quiz-completed.passed .quiz-score {
                background: #10b981;
            }
            
            .task-quiz-completed.failed .quiz-score {
                background: #ef4444;
            }
            
            .quiz-score {
                display: inline-block;
                background: #1e3a8a;
                color: white;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-size: 0.75rem;
                font-weight: 600;
            }
            
            /* Weekly Test Styling */
            .weekly-test-section {
                margin-top: 2rem;
                padding: 1.5rem;
                border: 2px solid #fbbf24;
                border-radius: 12px;
                background: linear-gradient(135deg, #fef3c7, #fde68a);
            }
            
            .weekly-test-section h4 {
                margin: 0 0 0.5rem 0;
                color: #92400e;
                font-size: 1.1rem;
            }
            
            .weekly-test-section p {
                margin: 0 0 1rem 0;
                color: #78350f;
                font-size: 0.9rem;
            }
            
            .weekly-test-btn {
                background: linear-gradient(135deg, #f59e0b, #d97706);
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 8px;
                font-size: 0.9rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .weekly-test-btn:hover:not(:disabled) {
                background: linear-gradient(135deg, #d97706, #b45309);
                transform: translateY(-1px);
            }
            
            .weekly-test-btn.disabled {
                background: #9ca3af;
                cursor: not-allowed;
                transform: none;
            }
            
            .weekly-test-completed.passed {
                background: linear-gradient(135deg, #d1fae5, #a7f3d0);
                border-color: #10b981;
            }
            
            .weekly-test-completed.failed {
                background: linear-gradient(135deg, #fee2e2, #fecaca);
                border-color: #ef4444;
            }
            
            .test-result {
                display: flex;
                align-items: center;
                gap: 1rem;
                margin-bottom: 1rem;
            }
            
            .test-score {
                background: #1e3a8a;
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 6px;
                font-weight: 600;
                font-size: 1rem;
            }
            
            .weekly-test-completed.passed .test-score {
                background: #10b981;
            }
            
            .weekly-test-completed.failed .test-score {
                background: #ef4444;
            }
            
            /* Video Button and Modal Styling */
            .video-btn {
                background: linear-gradient(135deg, #ef4444, #dc2626);
                color: white;
                border: none;
                padding: 0.4rem 0.8rem;
                border-radius: 5px;
                font-size: 0.8rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                margin-left: 0.5rem;
            }
            
            .video-btn:hover {
                background: linear-gradient(135deg, #dc2626, #b91c1c);
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
            }
            
            .video-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .video-modal.show {
                opacity: 1;
            }
            
            .video-modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(4px);
            }
            
            .video-modal-content {
                position: relative;
                background: white;
                border-radius: 12px;
                margin: 2rem auto;
                max-width: 900px;
                width: 90%;
                max-height: 90vh;
                overflow: hidden;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            }
            
            .video-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem 1.5rem;
                background: #f8fafc;
                border-bottom: 1px solid #e2e8f0;
            }
            
            .video-modal-header h3 {
                margin: 0;
                color: #1f2937;
                font-size: 1.1rem;
            }
            
            .video-modal-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                color: #64748b;
                cursor: pointer;
                padding: 0.25rem;
                border-radius: 4px;
                transition: all 0.2s;
            }
            
            .video-modal-close:hover {
                background: #e2e8f0;
                color: #374151;
            }
            
            .video-modal-body {
                padding: 1.5rem;
            }
            
            .video-container {
                position: relative;
                width: 100%;
                height: 0;
                padding-bottom: 56.25%; /* 16:9 aspect ratio */
                margin-bottom: 1.5rem;
            }
            
            .video-container iframe {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border-radius: 8px;
            }
            
            .video-actions {
                display: flex;
                gap: 1rem;
                justify-content: center;
            }
            
            .video-action-btn {
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 8px;
                font-size: 0.9rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .video-action-btn:hover {
                background: linear-gradient(135deg, #2563eb, #1e40af);
                transform: translateY(-1px);
            }
            
            @media (max-width: 768px) {
                .video-modal-content {
                    margin: 1rem;
                    width: calc(100% - 2rem);
                    max-height: calc(100vh - 2rem);
                }
                
                .video-modal-body {
                    padding: 1rem;
                }
                
                .video-actions {
                    flex-direction: column;
                    align-items: stretch;
                }
                
                .video-action-btn {
                    width: 100%;
                }
            }
            
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
            
            /* User Login Header Styles */
            .header-right {
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            
            .user-login-header {
                display: flex;
                align-items: center;
            }
            
            .user-login-btn {
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 6px;
                font-size: 0.85rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                white-space: nowrap;
            }
            
            .user-login-btn:hover {
                background: linear-gradient(135deg, #059669, #047857);
                transform: translateY(-1px);
                box-shadow: 0 3px 8px rgba(16, 185, 129, 0.4);
            }
            
            .user-auth-success {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }
            
            .logged-user-info {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
            }
            
            .logged-user-email {
                font-weight: 600;
                color: #1f2937;
                font-size: 0.8rem;
            }
            
            .user-logout-btn {
                background: #dc2626;
                color: white;
                border: none;
                padding: 0.4rem 0.8rem;
                border-radius: 4px;
                font-size: 0.75rem;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .user-logout-btn:hover {
                background: #b91c1c;
                transform: translateY(-1px);
            }
            
            .hidden {
                display: none !important;
            }
            
            @media (max-width: 768px) {
                .header-right {
                    flex-direction: column;
                    gap: 0.5rem;
                    align-items: flex-end;
                }
                
                .user-login-btn, .user-logout-btn {
                    font-size: 0.75rem;
                    padding: 0.4rem 0.8rem;
                }
            }
            
            /* CTA Button Styles */
            .cta-section {
                margin-top: 2rem;
                text-align: center;
                padding: 1.5rem 0;
            }
            
            .full-access-cta {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                border: none;
                border-radius: 16px;
                padding: 1.5rem 2rem;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
                transform: translateY(0);
                max-width: 600px;
                width: 100%;
                margin: 0 auto;
                display: block;
            }
            
            .full-access-cta:hover {
                transform: translateY(-4px);
                box-shadow: 0 12px 35px rgba(59, 130, 246, 0.6);
                background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
            }
            
            .full-access-cta:active {
                transform: translateY(-2px);
            }
            
            .cta-content {
                color: white;
                text-align: center;
            }
            
            .cta-main-text {
                font-size: 1.4rem;
                font-weight: 900;
                margin-bottom: 0.75rem;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                letter-spacing: 0.5px;
            }
            
            .cta-features {
                font-size: 1rem;
                font-weight: 600;
                margin-bottom: 0.75rem;
                opacity: 0.95;
                line-height: 1.4;
            }
            
            .highlight-text {
                color: #ec4899;
                font-weight: 700;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
            }
            
            .cta-price {
                font-size: 1.1rem;
                font-weight: 700;
                color: #fbbf24;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
                margin-top: 0.5rem;
            }
            
            @media (max-width: 768px) {
                .full-access-cta {
                    padding: 1.25rem 1.5rem;
                    margin: 0 1rem;
                }
                
                .cta-main-text {
                    font-size: 1.2rem;
                }
                
                .cta-features {
                    font-size: 0.9rem;
                }
                
                .cta-price {
                    font-size: 1rem;
                }
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

        // Simulate Michael's quiz scores
        const michaelQuizScores = {
            'w1d1': { passed: true, score: 95 },
            'w1d2': { passed: true, score: 88 },
            'w1d3': { passed: true, score: 92 },
            'w1d4': { passed: true, score: 100 },
            'w1d5': { passed: true, score: 97 }, // Week 1 quizzes completed
            'w2d1': { passed: true, score: 85 },
            'w2d2': { passed: true, score: 90 },
            'w2d3': { passed: false, score: 72 } // Week 2 partial - one failed
        };

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

        // Set Michael's quiz scores in localStorage for display
        setTimeout(() => {
            if (typeof window.quizSystem !== 'undefined' && window.quizSystem) {
                // Update quiz progress with Michael's scores
                Object.keys(michaelQuizScores).forEach(dayKey => {
                    window.quizSystem.quizProgress[dayKey] = michaelQuizScores[dayKey];
                });
                
                // Save to localStorage 
                localStorage.setItem('quiz-progress', JSON.stringify(window.quizSystem.quizProgress));
                
                // Trigger UI update if app exists
                if (typeof window.app !== 'undefined' && window.app && window.app.renderWeeks) {
                    window.app.renderWeeks();
                }
                
                console.log('Michael\'s quiz scores loaded:', michaelQuizScores);
            }
        }, 1500);

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