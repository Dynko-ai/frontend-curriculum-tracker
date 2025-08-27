/**
 * Checklist Engine - Manages curriculum data and task completion
 */

class ChecklistManager {
    constructor() {
        this.curriculum = null;
        this.completedTasks = this.loadCompletedTasks();
        this.callbacks = {
            taskToggle: [],
            progressUpdate: []
        };
    }

    /**
     * Load curriculum data from embedded data
     */
    async loadCurriculum() {
        try {
            // Use embedded data instead of fetch to avoid CORS issues
            if (window.CURRICULUM_DATA) {
                this.curriculum = window.CURRICULUM_DATA;
                console.log('Curriculum loaded with', this.curriculum.weeks?.length || 0, 'weeks');
                return this.curriculum;
            } else {
                // Retry mechanism - wait for CURRICULUM_DATA to load
                console.log('CURRICULUM_DATA not ready, waiting...');
                await new Promise(resolve => setTimeout(resolve, 100));
                if (window.CURRICULUM_DATA) {
                    this.curriculum = window.CURRICULUM_DATA;
                    console.log('Curriculum loaded on retry with', this.curriculum.weeks?.length || 0, 'weeks');
                    return this.curriculum;
                }
                throw new Error('Curriculum data not found after retry');
            }
        } catch (error) {
            console.error('Error loading curriculum:', error);
            // Fallback data structure
            this.curriculum = { weeks: [] };
            return this.curriculum;
        }
    }

    /**
     * Get all weeks from curriculum
     */
    getWeeks() {
        return this.curriculum?.weeks || [];
    }

    /**
     * Get specific week by ID
     */
    getWeek(weekId) {
        return this.curriculum?.weeks?.find(week => week.id === weekId);
    }

    /**
     * Get all tasks from all weeks
     */
    getAllTasks() {
        const tasks = [];
        this.getWeeks().forEach(week => {
            week.days.forEach(day => {
                tasks.push(...day.tasks);
            });
        });
        return tasks;
    }

    /**
     * Get tasks for a specific week
     */
    getWeekTasks(weekId) {
        const week = this.getWeek(weekId);
        if (!week) return [];
        
        const tasks = [];
        week.days.forEach(day => {
            tasks.push(...day.tasks);
        });
        return tasks;
    }

    /**
     * Get tasks for a specific day
     */
    getDayTasks(weekId, dayName) {
        const week = this.getWeek(weekId);
        if (!week) return [];
        
        const day = week.days.find(d => d.day === dayName);
        return day ? day.tasks : [];
    }

    /**
     * Check if a task is completed
     */
    isTaskCompleted(taskId) {
        return this.completedTasks.includes(taskId);
    }

    /**
     * Toggle task completion status
     */
    toggleTask(taskId) {
        const wasCompleted = this.isTaskCompleted(taskId);
        
        if (wasCompleted) {
            // Remove from completed tasks
            this.completedTasks = this.completedTasks.filter(id => id !== taskId);
        } else {
            // Add to completed tasks
            this.completedTasks.push(taskId);
        }
        
        this.saveCompletedTasks();
        
        // Find the task object
        const task = this.findTaskById(taskId);
        
        // Notify callbacks
        this.notifyTaskToggle(taskId, !wasCompleted, task);
        this.notifyProgressUpdate();
        
        return !wasCompleted;
    }

    /**
     * Find task by ID across all weeks and days
     */
    findTaskById(taskId) {
        const allTasks = this.getAllTasks();
        return allTasks.find(task => task.id === taskId);
    }

    /**
     * Calculate completion percentage for a week
     */
    getWeekProgress(weekId) {
        const weekTasks = this.getWeekTasks(weekId);
        if (weekTasks.length === 0) return 0;
        
        const completedCount = weekTasks.filter(task => 
            this.isTaskCompleted(task.id)
        ).length;
        
        return Math.round((completedCount / weekTasks.length) * 100);
    }

    /**
     * Calculate completion percentage for a day
     */
    getDayProgress(weekId, dayName) {
        const dayTasks = this.getDayTasks(weekId, dayName);
        if (dayTasks.length === 0) return 0;
        
        const completedCount = dayTasks.filter(task => 
            this.isTaskCompleted(task.id)
        ).length;
        
        return Math.round((completedCount / dayTasks.length) * 100);
    }

    /**
     * Calculate overall completion percentage
     */
    getOverallProgress() {
        const allTasks = this.getAllTasks();
        if (allTasks.length === 0) return 0;
        
        const completedCount = this.completedTasks.length;
        return Math.round((completedCount / allTasks.length) * 100);
    }

    /**
     * Get completion statistics
     */
    getCompletionStats() {
        const allTasks = this.getAllTasks();
        const completedCount = this.completedTasks.length;
        const totalCount = allTasks.length;
        const percentage = this.getOverallProgress();
        
        return {
            completed: completedCount,
            total: totalCount,
            percentage: percentage,
            remaining: totalCount - completedCount
        };
    }

    /**
     * Check if a week is completed
     */
    isWeekCompleted(weekId) {
        return this.getWeekProgress(weekId) === 100;
    }

    /**
     * Check if a day is completed
     */
    isDayCompleted(weekId, dayName) {
        return this.getDayProgress(weekId, dayName) === 100;
    }

    /**
     * Get completed tasks for XP calculation
     */
    getCompletedTasks() {
        return this.completedTasks.map(taskId => this.findTaskById(taskId))
                   .filter(task => task !== undefined);
    }

    /**
     * Reset all progress
     */
    resetProgress() {
        this.completedTasks = [];
        this.saveCompletedTasks();
        this.notifyProgressUpdate();
    }

    /**
     * Load completed tasks from localStorage
     */
    loadCompletedTasks() {
        try {
            const saved = localStorage.getItem('completedTasks');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading completed tasks:', error);
            return [];
        }
    }

    /**
     * Save completed tasks to localStorage
     */
    saveCompletedTasks() {
        try {
            localStorage.setItem('completedTasks', JSON.stringify(this.completedTasks));
        } catch (error) {
            console.error('Error saving completed tasks:', error);
        }
    }

    /**
     * Register callback for task toggle events
     */
    onTaskToggle(callback) {
        this.callbacks.taskToggle.push(callback);
    }

    /**
     * Register callback for progress update events
     */
    onProgressUpdate(callback) {
        this.callbacks.progressUpdate.push(callback);
    }

    /**
     * Notify task toggle callbacks
     */
    notifyTaskToggle(taskId, isCompleted, task) {
        this.callbacks.taskToggle.forEach(callback => {
            try {
                callback(taskId, isCompleted, task);
            } catch (error) {
                console.error('Error in task toggle callback:', error);
            }
        });
    }

    /**
     * Notify progress update callbacks
     */
    notifyProgressUpdate() {
        this.callbacks.progressUpdate.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('Error in progress update callback:', error);
            }
        });
    }

    /**
     * Export progress data
     */
    exportProgress() {
        const stats = this.getCompletionStats();
        const weekProgress = {};
        
        this.getWeeks().forEach(week => {
            weekProgress[`week${week.id}`] = this.getWeekProgress(week.id) / 100;
        });
        
        return {
            completedTasks: [...this.completedTasks],
            completionStats: stats,
            weeklyProgress: weekProgress,
            exportDate: new Date().toISOString()
        };
    }

    /**
     * Import progress data
     */
    importProgress(progressData) {
        if (progressData && progressData.completedTasks) {
            this.completedTasks = [...progressData.completedTasks];
            this.saveCompletedTasks();
            this.notifyProgressUpdate();
            return true;
        }
        return false;
    }

    /**
     * Get streak information (for gamification)
     */
    getStreakInfo() {
        // This is a simplified streak calculation
        // In a real app, you'd want to track completion dates
        const weeklyCompletion = this.getWeeks().map(week => 
            this.getWeekProgress(week.id) === 100
        );
        
        let currentStreak = 0;
        for (let i = weeklyCompletion.length - 1; i >= 0; i--) {
            if (weeklyCompletion[i]) {
                currentStreak++;
            } else {
                break;
            }
        }
        
        return {
            currentStreak: currentStreak,
            maxStreak: currentStreak // Simplified
        };
    }
}

// Export for use in other modules
window.ChecklistManager = ChecklistManager;