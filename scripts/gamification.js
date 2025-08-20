/**
 * Gamification System - XP, Levels, Achievements, and Rewards
 */

class GamificationSystem {
    constructor() {
        this.playerData = this.loadPlayerData();
        this.achievements = this.initializeAchievements();
        this.levelThresholds = this.calculateLevelThresholds();
        this.callbacks = {
            xpGain: [],
            levelUp: [],
            achievementUnlock: []
        };
    }

    /**
     * Initialize achievement definitions
     */
    initializeAchievements() {
        return [
            {
                id: 'first-steps',
                name: 'First Steps',
                description: 'Complete your first task',
                icon: '🎯',
                condition: (data) => data.completedTasksCount >= 1,
                xpReward: 25
            },
            {
                id: 'daily-warrior',
                name: 'Daily Warrior',
                description: 'Complete all tasks in a day',
                icon: '⚔️',
                condition: (data) => data.dayCompletions >= 1,
                xpReward: 50
            },
            {
                id: 'week-conqueror',
                name: 'Week Conqueror',
                description: 'Complete an entire week',
                icon: '👑',
                condition: (data) => data.weekCompletions >= 1,
                xpReward: 100
            },
            {
                id: 'streak-master',
                name: 'Streak Master',
                description: 'Maintain a 7-day streak',
                icon: '🔥',
                condition: (data) => data.streakCount >= 7,
                xpReward: 150
            },
            {
                id: 'halfway-hero',
                name: 'Halfway Hero',
                description: 'Complete 50% of curriculum',
                icon: '🏆',
                condition: (data) => data.overallProgress >= 50,
                xpReward: 200
            },
            {
                id: 'frontend-master',
                name: 'Frontend Master',
                description: 'Complete 100% of curriculum',
                icon: '🎓',
                condition: (data) => data.overallProgress >= 100,
                xpReward: 500
            },
            {
                id: 'quick-learner',
                name: 'Quick Learner',
                description: 'Complete 10 tasks',
                icon: '⚡',
                condition: (data) => data.completedTasksCount >= 10,
                xpReward: 75
            },
            {
                id: 'dedicated-student',
                name: 'Dedicated Student',
                description: 'Complete 50 tasks',
                icon: '📚',
                condition: (data) => data.completedTasksCount >= 50,
                xpReward: 150
            },
            {
                id: 'javascript-ninja',
                name: 'JavaScript Ninja',
                description: 'Complete Week 3 (JavaScript)',
                icon: '🥷',
                condition: (data) => data.weekProgress.week3 >= 100,
                xpReward: 200
            },
            {
                id: 'react-rockstar',
                name: 'React Rockstar',
                description: 'Complete Week 5 (React)',
                icon: '⭐',
                condition: (data) => data.weekProgress.week5 >= 100,
                xpReward: 250
            }
        ];
    }

    /**
     * Calculate XP thresholds for each level (exponential scaling)
     */
    calculateLevelThresholds() {
        const thresholds = [0]; // Level 1 starts at 0 XP
        
        for (let level = 2; level <= 20; level++) {
            // Exponential scaling: base XP * (level-1)^1.5
            const baseXP = 100;
            const xpForLevel = Math.floor(baseXP * Math.pow(level - 1, 1.5));
            thresholds.push(thresholds[level - 2] + xpForLevel);
        }
        
        return thresholds;
    }

    /**
     * Get current player level based on XP
     */
    getCurrentLevel() {
        const xp = this.playerData.currentXP;
        let level = 1;
        
        for (let i = this.levelThresholds.length - 1; i >= 0; i--) {
            if (xp >= this.levelThresholds[i]) {
                level = i + 1;
                break;
            }
        }
        
        return Math.min(level, 20); // Cap at level 20
    }

    /**
     * Get XP needed for next level
     */
    getXPForNextLevel() {
        const currentLevel = this.getCurrentLevel();
        if (currentLevel >= 20) return 0; // Max level reached
        
        return this.levelThresholds[currentLevel] - this.playerData.currentXP;
    }

    /**
     * Get XP progress within current level
     */
    getLevelProgress() {
        const currentLevel = this.getCurrentLevel();
        const currentXP = this.playerData.currentXP;
        
        if (currentLevel >= 20) return 100; // Max level
        
        const currentLevelStartXP = this.levelThresholds[currentLevel - 1];
        const nextLevelXP = this.levelThresholds[currentLevel];
        const levelXP = nextLevelXP - currentLevelStartXP;
        const progressXP = currentXP - currentLevelStartXP;
        
        return Math.round((progressXP / levelXP) * 100);
    }

    /**
     * Award XP for task completion
     */
    awardXP(amount, source = 'task') {
        const oldLevel = this.getCurrentLevel();
        this.playerData.currentXP += amount;
        const newLevel = this.getCurrentLevel();
        
        this.savePlayerData();
        
        // Check for level up
        if (newLevel > oldLevel) {
            this.notifyLevelUp(newLevel, oldLevel);
        }
        
        // Notify XP gain
        this.notifyXPGain(amount, source);
        
        return { 
            newXP: this.playerData.currentXP,
            levelUp: newLevel > oldLevel,
            newLevel: newLevel
        };
    }

    /**
     * Process task completion for gamification
     */
    processTaskCompletion(taskId, task, checklistManager) {
        let totalXP = 0;
        
        // Base XP for task
        const baseXP = task?.xp || 10;
        totalXP += baseXP;
        
        // Check for daily completion bonus
        const dayCompleted = this.checkDayCompletion(task, checklistManager);
        if (dayCompleted) {
            totalXP += 25; // Daily completion bonus
            this.playerData.dayCompletions++;
        }
        
        // Check for weekly completion bonus
        const weekCompleted = this.checkWeekCompletion(task, checklistManager);
        if (weekCompleted) {
            totalXP += 50; // Weekly completion bonus
            this.playerData.weekCompletions++;
        }
        
        // Award XP
        const result = this.awardXP(totalXP, 'task-completion');
        
        // Update completed tasks count
        this.playerData.completedTasksCount = checklistManager.completedTasks.length;
        
        // Check for new achievements
        this.checkAchievements(checklistManager);
        
        this.savePlayerData();
        
        return result;
    }

    /**
     * Check if completing this task completes a day
     */
    checkDayCompletion(task, checklistManager) {
        // Find the week and day this task belongs to
        const weeks = checklistManager.getWeeks();
        
        for (const week of weeks) {
            for (const day of week.days) {
                if (day.tasks.some(t => t.id === task.id)) {
                    return checklistManager.isDayCompleted(week.id, day.day);
                }
            }
        }
        
        return false;
    }

    /**
     * Check if completing this task completes a week
     */
    checkWeekCompletion(task, checklistManager) {
        // Find the week this task belongs to
        const weeks = checklistManager.getWeeks();
        
        for (const week of weeks) {
            for (const day of week.days) {
                if (day.tasks.some(t => t.id === task.id)) {
                    return checklistManager.isWeekCompleted(week.id);
                }
            }
        }
        
        return false;
    }

    /**
     * Check for newly unlocked achievements
     */
    checkAchievements(checklistManager) {
        const stats = checklistManager.getCompletionStats();
        const streakInfo = checklistManager.getStreakInfo();
        
        // Prepare data for achievement conditions
        const data = {
            completedTasksCount: this.playerData.completedTasksCount,
            dayCompletions: this.playerData.dayCompletions,
            weekCompletions: this.playerData.weekCompletions,
            streakCount: streakInfo.currentStreak,
            overallProgress: stats.percentage,
            weekProgress: {}
        };
        
        // Add week progress
        checklistManager.getWeeks().forEach(week => {
            data.weekProgress[`week${week.id}`] = checklistManager.getWeekProgress(week.id);
        });
        
        // Check each achievement
        this.achievements.forEach(achievement => {
            const isUnlocked = this.playerData.unlockedAchievements.includes(achievement.id);
            
            if (!isUnlocked && achievement.condition(data)) {
                this.unlockAchievement(achievement);
            }
        });
    }

    /**
     * Unlock an achievement
     */
    unlockAchievement(achievement) {
        this.playerData.unlockedAchievements.push(achievement.id);
        
        // Award XP bonus
        if (achievement.xpReward) {
            this.awardXP(achievement.xpReward, 'achievement');
        }
        
        this.savePlayerData();
        
        // Notify achievement unlock
        this.notifyAchievementUnlock(achievement);
    }

    /**
     * Get all achievements with unlock status
     */
    getAchievements() {
        return this.achievements.map(achievement => ({
            ...achievement,
            unlocked: this.playerData.unlockedAchievements.includes(achievement.id)
        }));
    }

    /**
     * Get player statistics
     */
    getPlayerStats() {
        return {
            level: this.getCurrentLevel(),
            xp: this.playerData.currentXP,
            xpForNextLevel: this.getXPForNextLevel(),
            levelProgress: this.getLevelProgress(),
            achievementsUnlocked: this.playerData.unlockedAchievements.length,
            totalAchievements: this.achievements.length,
            completedTasks: this.playerData.completedTasksCount,
            dayCompletions: this.playerData.dayCompletions,
            weekCompletions: this.playerData.weekCompletions
        };
    }

    /**
     * Reset all gamification data
     */
    resetProgress() {
        this.playerData = this.getDefaultPlayerData();
        this.savePlayerData();
    }

    /**
     * Get default player data structure
     */
    getDefaultPlayerData() {
        return {
            currentXP: 0,
            currentLevel: 1,
            unlockedAchievements: [],
            completedTasksCount: 0,
            dayCompletions: 0,
            weekCompletions: 0,
            lastActiveDate: new Date().toISOString().split('T')[0]
        };
    }

    /**
     * Load player data from localStorage
     */
    loadPlayerData() {
        try {
            const saved = localStorage.getItem('playerData');
            return saved ? { ...this.getDefaultPlayerData(), ...JSON.parse(saved) } : this.getDefaultPlayerData();
        } catch (error) {
            console.error('Error loading player data:', error);
            return this.getDefaultPlayerData();
        }
    }

    /**
     * Save player data to localStorage
     */
    savePlayerData() {
        try {
            localStorage.setItem('playerData', JSON.stringify(this.playerData));
        } catch (error) {
            console.error('Error saving player data:', error);
        }
    }

    /**
     * Register callback for XP gain events
     */
    onXPGain(callback) {
        this.callbacks.xpGain.push(callback);
    }

    /**
     * Register callback for level up events
     */
    onLevelUp(callback) {
        this.callbacks.levelUp.push(callback);
    }

    /**
     * Register callback for achievement unlock events
     */
    onAchievementUnlock(callback) {
        this.callbacks.achievementUnlock.push(callback);
    }

    /**
     * Notify XP gain callbacks
     */
    notifyXPGain(amount, source) {
        this.callbacks.xpGain.forEach(callback => {
            try {
                callback(amount, source);
            } catch (error) {
                console.error('Error in XP gain callback:', error);
            }
        });
    }

    /**
     * Notify level up callbacks
     */
    notifyLevelUp(newLevel, oldLevel) {
        this.callbacks.levelUp.forEach(callback => {
            try {
                callback(newLevel, oldLevel);
            } catch (error) {
                console.error('Error in level up callback:', error);
            }
        });
    }

    /**
     * Notify achievement unlock callbacks
     */
    notifyAchievementUnlock(achievement) {
        this.callbacks.achievementUnlock.forEach(callback => {
            try {
                callback(achievement);
            } catch (error) {
                console.error('Error in achievement unlock callback:', error);
            }
        });
    }

    /**
     * Create XP gain animation
     */
    showXPGain(amount, element) {
        const xpElement = document.createElement('div');
        xpElement.className = 'xp-gain';
        xpElement.textContent = `+${amount} XP`;
        
        // Position near the clicked element
        const rect = element.getBoundingClientRect();
        xpElement.style.left = `${rect.left + rect.width / 2}px`;
        xpElement.style.top = `${rect.top}px`;
        
        document.body.appendChild(xpElement);
        
        // Remove after animation
        setTimeout(() => {
            document.body.removeChild(xpElement);
        }, 2000);
    }

    /**
     * Show level up animation
     */
    showLevelUpAnimation(newLevel) {
        const levelUpElement = document.createElement('div');
        levelUpElement.className = 'level-up-animation';
        levelUpElement.innerHTML = `
            <h2>Level Up!</h2>
            <p>You reached Level ${newLevel}!</p>
        `;
        
        document.body.appendChild(levelUpElement);
        
        // Remove after animation
        setTimeout(() => {
            document.body.removeChild(levelUpElement);
        }, 3000);
    }

    /**
     * Show achievement unlock animation
     */
    showAchievementUnlock(achievement) {
        const notification = document.getElementById('achievementNotification');
        const title = document.getElementById('achievementTitle');
        const description = document.getElementById('achievementDescription');
        
        if (notification && title && description) {
            title.textContent = achievement.name;
            description.textContent = achievement.description;
            
            // Show notification
            notification.classList.add('show');
            
            // Create confetti effect
            this.createConfetti();
            
            // Hide after 4 seconds
            setTimeout(() => {
                notification.classList.remove('show');
            }, 4000);
        }
    }

    /**
     * Create confetti animation
     */
    createConfetti() {
        const colors = ['#fbbf24', '#f59e0b', '#3b82f6', '#10b981', '#ef4444'];
        
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDelay = Math.random() * 0.5 + 's';
                
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    document.body.removeChild(confetti);
                }, 3000);
            }, i * 50);
        }
    }
}

// Export for use in other modules
window.GamificationSystem = GamificationSystem;