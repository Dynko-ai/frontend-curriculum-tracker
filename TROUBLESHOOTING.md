# Frontend Curriculum Tracker - Troubleshooting Guide

## 🔍 Common Issues and Solutions

### Issue 1: Completed Tasks Not Showing in Main App

**Symptoms:**
- Tasks completed but checkboxes remain unchecked
- Progress bars show 0% despite completing tasks
- XP and achievements not updating

**Debugging Steps:**

1. **Check Local Storage Data**
   - Open: http://localhost:8000/debug-storage.html
   - Look for `completedTasks` and `playerData` entries
   - Verify data format is correct

2. **Use Browser Console**
   - Press F12 → Console tab
   - Look for debug messages on page load
   - Check for any JavaScript errors

3. **Force Reload Progress**
   - Go to main app: http://localhost:8000/index.html
   - Click "Reload Progress" button at bottom of page
   - Or press Ctrl+D and use debug panel

**Solutions:**

```javascript
// Manual fix via browser console:
// 1. Check current data
console.log('Tasks:', localStorage.getItem('completedTasks'));
console.log('Player:', localStorage.getItem('playerData'));

// 2. Fix format if needed
localStorage.setItem('completedTasks', JSON.stringify(['w1d1t1', 'w1d1t2', 'w1d1t3', 'w1d2t1', 'w1d2t2']));

// 3. Reload app
if(window.app) window.app.forceProgressReload();
```

### Issue 2: Server Not Starting

**Symptoms:**
- Cannot access http://localhost:8000
- "Connection refused" error

**Solutions:**

1. **Python HTTP Server**
   ```bash
   cd "C:\Users\Elisa\Dev1\Mission01"
   python -m http.server 8000
   ```

2. **Alternative Ports**
   ```bash
   python -m http.server 3000
   python -m http.server 5000
   ```

3. **Node.js Server**
   ```bash
   npx http-server -p 8000
   ```

4. **VS Code Live Server**
   - Right-click `index.html`
   - Select "Open with Live Server"

### Issue 3: Progress Not Persisting Between Sessions

**Symptoms:**
- Progress resets when reopening browser
- LocalStorage appears empty

**Debugging:**

1. **Check Browser Settings**
   - Ensure cookies/local storage enabled
   - Disable private/incognito mode
   - Check if browser is clearing data on exit

2. **Verify Storage Permissions**
   ```javascript
   // Test localStorage availability
   try {
     localStorage.setItem('test', 'test');
     localStorage.removeItem('test');
     console.log('✅ localStorage working');
   } catch(e) {
     console.log('❌ localStorage failed:', e);
   }
   ```

3. **Manual Data Export/Import**
   - Use test page: http://localhost:8000/test-progress.html
   - Click "Export Data" to backup progress
   - Import data if needed

### Issue 4: Achievements Not Unlocking

**Symptoms:**
- XP increasing but no achievements
- Achievement panel empty

**Debugging:**
```javascript
// Check achievement status
const achievements = JSON.parse(localStorage.getItem('playerData') || '{}').unlockedAchievements || [];
console.log('Unlocked achievements:', achievements);

// Force achievement check
if(window.app && window.app.gamificationSystem) {
  window.app.gamificationSystem.checkAchievements();
}
```

### Issue 5: Tutorial Modals Not Opening

**Symptoms:**
- Clicking "📖 Tutorial" button does nothing
- Modal appears blank

**Solutions:**

1. **Check Network Access**
   - Ensure server is running
   - Tutorial files exist in `/tutorials/` folder

2. **Browser Console Errors**
   - Look for fetch errors
   - Check CORS policy issues

3. **Manual Tutorial Access**
   - Direct link: http://localhost:8000/tutorials/sanity-cli-tutorial.md

## 🛠 Debug Tools Available

### 1. Main App Debug Panel
- **Shortcut:** Ctrl+D on main app
- **Features:**
  - Storage status
  - Current progress
  - Manual save/refresh
  - Data export

### 2. Debug Storage Tool
- **URL:** http://localhost:8000/debug-storage.html
- **Features:**
  - View raw localStorage data
  - Fix data format
  - Clear all progress

### 3. Progress Test Page
- **URL:** http://localhost:8000/test-progress.html
- **Features:**
  - Manual task completion
  - Real-time progress tracking
  - Direct localStorage interaction

### 4. Browser Developer Tools
- **Open:** F12 or Right-click → Inspect
- **Console tab:** JavaScript errors and debug messages
- **Application tab:** View localStorage data
- **Network tab:** Check file loading issues

## 📊 Data Structure Reference

### Completed Tasks Format
```json
[
  "w1d1t1",
  "w1d1t2", 
  "w1d1t3",
  "w1d2t1",
  "w1d2t2"
]
```

### Player Data Format
```json
{
  "currentXP": 60,
  "currentLevel": 1,
  "unlockedAchievements": ["first-steps"],
  "completedTasksCount": 5,
  "dayCompletions": 0,
  "weekCompletions": 0,
  "lastActiveDate": "2025-08-22"
}
```

### Task ID Pattern
- Format: `w{week}d{day}t{task}`
- Examples:
  - `w1d1t1` = Week 1, Day 1, Task 1
  - `w2d3t2` = Week 2, Day 3, Task 2

## 🔧 Quick Fixes

### Reset Everything
```javascript
localStorage.clear();
location.reload();
```

### Manual Task Completion
```javascript
// Complete specific tasks
const tasks = ['w1d1t1', 'w1d1t2', 'w1d1t3', 'w1d2t1', 'w1d2t2'];
localStorage.setItem('completedTasks', JSON.stringify(tasks));

// Update player data
const playerData = {
  currentXP: 60,
  currentLevel: 1,
  unlockedAchievements: ['first-steps'],
  completedTasksCount: 5
};
localStorage.setItem('playerData', JSON.stringify(playerData));

// Reload app
if(window.app) window.app.forceProgressReload();
```

### Force Achievement Unlock
```javascript
// Unlock "First Steps" achievement
const playerData = JSON.parse(localStorage.getItem('playerData') || '{}');
playerData.unlockedAchievements = playerData.unlockedAchievements || [];
if (!playerData.unlockedAchievements.includes('first-steps')) {
  playerData.unlockedAchievements.push('first-steps');
}
localStorage.setItem('playerData', JSON.stringify(playerData));
```

## 📝 Reporting Issues

When reporting issues, please include:

1. **Browser and Version**
2. **Error Messages** (from console)
3. **Current localStorage Data** (from debug tool)
4. **Steps to Reproduce**
5. **Expected vs Actual Behavior**

## 🌐 URL Reference

- **Main App:** http://localhost:8000/index.html
- **Test Page:** http://localhost:8000/test-progress.html  
- **Debug Tool:** http://localhost:8000/debug-storage.html
- **Sanity Tutorial:** http://localhost:8000/tutorials/sanity-cli-tutorial.md

## 🚀 Performance Tips

1. **Use Ctrl+D** for quick debug access
2. **Export progress regularly** for backup
3. **Clear browser cache** if issues persist
4. **Use incognito mode** to test fresh state
5. **Keep browser console open** during debugging

---

*This troubleshooting guide covers the most common issues with the Frontend Curriculum Tracker. For additional help, check the browser console for detailed error messages.*