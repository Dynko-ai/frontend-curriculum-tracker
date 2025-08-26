// Script to mark specific tasks as completed
// Run this in browser console to simulate completed tasks

// Week 1, Day 1 tasks (Monday - Development Environment)
const day1Tasks = [
    'w1d1t1', // Install Cursor with extensions: Prettier, ESLint, Live Server
    'w1d1t2', // Set up Git and create your first repository  
    'w1d1t3'  // Create a basic HTML5 document structure
];

// Week 1, Day 2 tasks (Tuesday - HTML Fundamentals) - selecting first 2
const day2Tasks = [
    'w1d2t1', // Learn semantic HTML elements (header, nav, main, section, article, footer)
    'w1d2t2'  // Practice HTML forms with various input types
    // w1d2t3 - leaving this incomplete for now
];

// All tasks to mark as completed
const completedTasks = [...day1Tasks, ...day2Tasks];

console.log('🎯 Marking the following tasks as completed:');
console.log('Day 1 (Monday):', day1Tasks);
console.log('Day 2 (Tuesday - partial):', day2Tasks);
console.log('Total tasks:', completedTasks.length);

// Function to mark tasks as completed
function markTasksCompleted() {
    try {
        // Get existing completed tasks or empty array
        let existingTasks = JSON.parse(localStorage.getItem('completedTasks') || '[]');
        
        // Add new tasks (avoiding duplicates)
        completedTasks.forEach(taskId => {
            if (!existingTasks.includes(taskId)) {
                existingTasks.push(taskId);
            }
        });
        
        // Save back to localStorage
        localStorage.setItem('completedTasks', JSON.stringify(existingTasks));
        
        // Calculate XP gained
        const xpPerTask = [10, 10, 15, 10, 15]; // XP values for each task
        const totalXP = xpPerTask.reduce((sum, xp) => sum + xp, 0);
        
        // Update player data if it exists
        let playerData = JSON.parse(localStorage.getItem('playerData') || '{"xp": 0, "level": 1}');
        playerData.xp += totalXP;
        
        // Calculate new level (simple calculation: level = floor(xp / 100) + 1)
        const newLevel = Math.floor(playerData.xp / 100) + 1;
        if (newLevel > playerData.level) {
            playerData.level = newLevel;
            console.log('🎉 LEVEL UP! New level:', newLevel);
        }
        
        localStorage.setItem('playerData', JSON.stringify(playerData));
        
        console.log('✅ Progress marked successfully!');
        console.log('📊 Stats:', {
            completedTasks: existingTasks.length,
            totalXP: playerData.xp,
            level: playerData.level,
            tasksJustCompleted: completedTasks.length,
            xpGained: totalXP
        });
        
        // Refresh the page to see changes
        if (window.app) {
            window.app.refreshProgress();
            console.log('🔄 UI refreshed!');
        } else {
            console.log('🔄 Refresh the page to see your progress!');
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Error marking tasks:', error);
        return false;
    }
}

// Run the function
markTasksCompleted();

// Also create achievement check
function checkAchievements() {
    const completedCount = JSON.parse(localStorage.getItem('completedTasks') || '[]').length;
    
    console.log('🏆 Achievement Check:');
    if (completedCount >= 1) {
        console.log('✅ "First Steps" - Complete your first task');
    }
    if (completedCount >= 3) {
        console.log('✅ "Quick Start" - Complete 3+ tasks');  
    }
    if (completedCount >= 5) {
        console.log('✅ "Getting Rolling" - Complete 5+ tasks');
    }
}

checkAchievements();