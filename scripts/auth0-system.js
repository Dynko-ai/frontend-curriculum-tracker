/**
 * Auth0 Authentication System for Michael's Progress Journey
 * Modern, reliable authentication replacing deprecated Netlify Identity
 */

class Auth0System {
    constructor() {
        this.auth0Client = null;
        this.currentUser = null;
        this.isAuthenticated = false;
        this.config = {
            domain: 'dev-uqpxvdpzj7igzx6l.us.auth0.com',
            clientId: 'HT3MGgETHnMv4RFMY505s6X62WGkkMfd',
            redirectUri: window.location.origin,
            audience: 'https://dev-uqpxvdpzj7igzx6l.us.auth0.com/api/v2/'
        };
        this.init();
    }

    /**
     * Initialize Auth0 client and check authentication status
     */
    async init() {
        try {
            // Wait for Auth0 SDK to load
            if (typeof auth0 === 'undefined' || typeof auth0.createAuth0Client === 'undefined') {
                setTimeout(() => this.init(), 100);
                return;
            }

            // Create Auth0 client
            this.auth0Client = await auth0.createAuth0Client({
                domain: this.config.domain,
                clientId: this.config.clientId,
                authorizationParams: {
                    redirect_uri: this.config.redirectUri
                }
            });

            // Check if returning from login redirect
            if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
                await this.handleRedirectCallback();
            }

            // Check authentication status
            await this.checkAuthStatus();
            
            // Set up event listeners
            this.setupEventListeners();

        } catch (error) {
            console.error('Auth0 initialization error:', error);
            this.showError('Authentication system failed to initialize. Please refresh the page.');
        }
    }

    /**
     * Handle the redirect callback from Auth0
     */
    async handleRedirectCallback() {
        try {
            await this.auth0Client.handleRedirectCallback();
            // Clean up the URL
            window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
            console.error('Auth0 redirect callback error:', error);
            this.showError('Login failed. Please try again.');
        }
    }

    /**
     * Set up UI event listeners
     */
    setupEventListeners() {
        // Email updates login button
        const emailLoginBtn = document.getElementById('emailLoginBtn');
        if (emailLoginBtn) {
            emailLoginBtn.addEventListener('click', () => this.login());
        }

        // Email updates logout button
        const emailLogoutBtn = document.getElementById('emailLogoutBtn');
        if (emailLogoutBtn) {
            emailLogoutBtn.addEventListener('click', () => this.logout());
        }

        // User login button
        const userLoginBtn = document.getElementById('userLoginBtn');
        if (userLoginBtn) {
            userLoginBtn.addEventListener('click', () => this.loginUser());
        }

        // User logout button
        const userLogoutBtn = document.getElementById('userLogoutBtn');
        if (userLogoutBtn) {
            userLogoutBtn.addEventListener('click', () => this.logoutUser());
        }
    }

    /**
     * Check current authentication status
     */
    async checkAuthStatus() {
        try {
            this.isAuthenticated = await this.auth0Client.isAuthenticated();
            
            if (this.isAuthenticated) {
                this.currentUser = await this.auth0Client.getUser();
                await this.handleLogin(this.currentUser);
                await this.handleUserAuthChange();
            } else {
                this.handleLogout();
                this.showUserLoggedOut();
            }
        } catch (error) {
            console.error('Auth status check error:', error);
            this.handleLogout();
        }
    }

    /**
     * Initiate login process
     */
    async login() {
        try {
            await this.auth0Client.loginWithRedirect({
                authorizationParams: {
                    redirect_uri: this.config.redirectUri
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            this.showError('Login failed. Please try again.');
        }
    }

    /**
     * Log out current user
     */
    async logout() {
        try {
            await this.auth0Client.logout({
                logoutParams: {
                    returnTo: this.config.redirectUri
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
            this.showError('Logout failed. Please try again.');
        }
    }

    /**
     * Handle successful login
     */
    async handleLogin(user) {
        this.currentUser = user;
        this.isAuthenticated = true;
        
        console.log('User logged in:', user.email);
        
        // Update UI for authenticated state
        this.updateAuthenticatedUI();
        
        // Load Michael's progress data
        await this.loadMichaelProgress();
        
        // Trigger email notification
        this.triggerEmailNotification();
    }

    /**
     * Handle logout
     */
    handleLogout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        
        console.log('User logged out');
        
        // Update UI for unauthenticated state
        this.updateUnauthenticatedUI();
    }

    /**
     * Update UI for authenticated users
     */
    updateAuthenticatedUI() {
        // Update email updates section
        const authPrompt = document.getElementById('authPrompt');
        const authSuccess = document.getElementById('authSuccess');
        const userEmailDisplay = document.getElementById('userEmailDisplay');

        if (authPrompt) {
            authPrompt.classList.add('hidden');
        }
        if (authSuccess) {
            authSuccess.classList.remove('hidden');
        }
        if (userEmailDisplay && this.currentUser) {
            userEmailDisplay.textContent = this.currentUser.email;
        }

        // Set up email time preference
        this.setupEmailTimePreference();

        // Page remains publicly accessible - no other UI changes needed
        console.log('User authenticated for email updates:', this.currentUser.email);
    }

    /**
     * Update UI for unauthenticated users
     */
    updateUnauthenticatedUI() {
        // Update email updates section
        const authPrompt = document.getElementById('authPrompt');
        const authSuccess = document.getElementById('authSuccess');

        if (authPrompt) {
            authPrompt.classList.remove('hidden');
        }
        if (authSuccess) {
            authSuccess.classList.add('hidden');
        }

        // Page remains publicly accessible - no other UI changes needed
        console.log('User logged out - email updates disabled');
    }

    /**
     * Load Michael's progress data (not needed - handled by public viewer)
     */
    async loadMichaelProgress() {
        // Progress data is handled by the public progress viewer
        // This method is kept for compatibility
        console.log('Auth0 authenticated - progress already loaded by public viewer');
    }

    /**
     * Trigger email notification
     */
    triggerEmailNotification() {
        if (!this.currentUser) return;

        console.log(`Triggering email notification for ${this.currentUser.email}`);
        
        // Show user confirmation
        this.showEmailConfirmation();

        // In Phase 3, this will call serverless function to send email
    }

    /**
     * Show email confirmation message
     */
    showEmailConfirmation() {
        // Create temporary notification
        const notification = document.createElement('div');
        notification.className = 'email-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">📧</span>
                <span class="notification-text">Daily progress summary will be sent to your email!</span>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        // Remove after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 4000);
    }

    /**
     * Show error message
     */
    showError(message) {
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">⚠️</span>
                <span class="notification-text">${message}</span>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        // Remove after 6 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 6000);
    }

    /**
     * Update Auth0 configuration
     */
    updateConfig(domain, clientId) {
        this.config.domain = domain;
        this.config.clientId = clientId;
        this.config.audience = `https://${domain}/api/v2/`;
        
        console.log('Auth0 config updated:', { domain, clientId });
    }

    /**
     * Set up email time preference functionality
     */
    setupEmailTimePreference() {
        const emailTimeSelect = document.getElementById('emailTimeSelect');
        if (!emailTimeSelect || !this.currentUser) return;

        // Load saved preference
        const savedPreference = this.loadEmailPreference();
        if (savedPreference && savedPreference.emailTime) {
            emailTimeSelect.value = savedPreference.emailTime;
        }

        // Listen for changes
        emailTimeSelect.addEventListener('change', (e) => {
            this.saveEmailPreference({
                emailTime: e.target.value,
                userId: this.currentUser.sub,
                email: this.currentUser.email
            });
            this.showPreferenceUpdateNotification(e.target.value);
        });
    }

    /**
     * Load email preferences from localStorage
     */
    loadEmailPreference() {
        if (!this.currentUser) return null;
        const preferences = JSON.parse(localStorage.getItem('email-preferences') || '{}');
        return preferences[this.currentUser.sub];
    }

    /**
     * Save email preferences to localStorage
     */
    saveEmailPreference(preference) {
        const preferences = JSON.parse(localStorage.getItem('email-preferences') || '{}');
        preferences[this.currentUser.sub] = preference;
        localStorage.setItem('email-preferences', JSON.stringify(preferences));
        
        console.log('Email preference saved:', preference);
    }

    /**
     * Show notification when preference is updated
     */
    showPreferenceUpdateNotification(time) {
        const notification = document.createElement('div');
        notification.className = 'preference-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">⏰</span>
                <span class="notification-text">Daily emails will be sent at ${this.formatTime(time)}</span>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: #3b82f6;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
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
     * Format time for display
     */
    formatTime(time24) {
        const [hours, minutes] = time24.split(':');
        const hour12 = parseInt(hours);
        const ampm = hour12 >= 12 ? 'PM' : 'AM';
        const displayHour = hour12 === 0 ? 12 : hour12 > 12 ? hour12 - 12 : hour12;
        return `${displayHour}:${minutes} ${ampm}`;
    }

    /**
     * Get current authentication status
     */
    getAuthStatus() {
        return {
            isAuthenticated: this.isAuthenticated,
            user: this.currentUser
        };
    }

    /**
     * User login for progress tracking
     */
    async loginUser() {
        try {
            await this.auth0Client.loginWithRedirect({
                appState: { target: 'user-progress' }
            });
        } catch (error) {
            console.error('User login error:', error);
            this.showError('Login failed. Please try again.');
        }
    }

    /**
     * User logout
     */
    async logoutUser() {
        try {
            await this.auth0Client.logout({
                logoutParams: {
                    returnTo: window.location.origin
                }
            });
        } catch (error) {
            console.error('User logout error:', error);
            this.showError('Logout failed. Please try again.');
        }
    }

    /**
     * Handle user authentication state changes
     */
    async handleUserAuthChange() {
        try {
            this.isAuthenticated = await this.auth0Client.isAuthenticated();
            
            if (this.isAuthenticated) {
                this.currentUser = await this.auth0Client.getUser();
                this.showUserLoggedIn();
                await this.loadUserProgress();
            } else {
                this.showUserLoggedOut();
                this.clearUserProgress();
            }
        } catch (error) {
            console.error('User auth status check error:', error);
        }
    }

    /**
     * Show user logged in UI
     */
    showUserLoggedIn() {
        const userAuthPrompt = document.getElementById('userAuthPrompt');
        const userAuthSuccess = document.getElementById('userAuthSuccess');
        const userEmailDisplay = document.getElementById('loggedUserEmailDisplay');

        if (userAuthPrompt) userAuthPrompt.classList.add('hidden');
        if (userAuthSuccess) userAuthSuccess.classList.remove('hidden');
        if (userEmailDisplay) userEmailDisplay.textContent = this.currentUser?.email || 'User';
    }

    /**
     * Show user logged out UI
     */
    showUserLoggedOut() {
        const userAuthPrompt = document.getElementById('userAuthPrompt');
        const userAuthSuccess = document.getElementById('userAuthSuccess');

        if (userAuthPrompt) userAuthPrompt.classList.remove('hidden');
        if (userAuthSuccess) userAuthSuccess.classList.add('hidden');
    }

    /**
     * Load user's personal progress from localStorage
     */
    async loadUserProgress() {
        if (!this.currentUser?.sub) return;

        const userProgressKey = `user_progress_${this.currentUser.sub}`;
        const savedProgress = localStorage.getItem(userProgressKey);

        if (savedProgress) {
            try {
                const progressData = JSON.parse(savedProgress);
                // Apply saved progress to the UI
                this.restoreUserProgress(progressData);
                console.log('User progress loaded:', progressData);
            } catch (error) {
                console.error('Error loading user progress:', error);
            }
        }
    }

    /**
     * Save user's progress to localStorage
     */
    async saveUserProgress(progressData) {
        if (!this.currentUser?.sub) return;

        const userProgressKey = `user_progress_${this.currentUser.sub}`;
        try {
            localStorage.setItem(userProgressKey, JSON.stringify(progressData));
            console.log('User progress saved for:', this.currentUser.email);
        } catch (error) {
            console.error('Error saving user progress:', error);
        }
    }

    /**
     * Restore user progress to the UI
     */
    restoreUserProgress(progressData) {
        // Restore completed tasks
        if (progressData.completedTasks) {
            progressData.completedTasks.forEach(taskId => {
                const checkbox = document.querySelector(`input[data-task="${taskId}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                    checkbox.closest('.task-item')?.classList.add('completed');
                }
            });
        }

        // Restore XP and level
        if (progressData.currentXP !== undefined) {
            const xpText = document.getElementById('xpText');
            const xpFill = document.getElementById('xpFill');
            const levelBadge = document.getElementById('levelBadge');
            
            if (xpText) xpText.textContent = `${progressData.currentXP} / ${progressData.nextLevelXP || 100} XP`;
            if (levelBadge) levelBadge.querySelector('.level-text').textContent = `Level ${progressData.currentLevel || 1}`;
            
            // Update XP bar
            if (xpFill) {
                const percentage = (progressData.currentXP / (progressData.nextLevelXP || 100)) * 100;
                xpFill.style.width = `${Math.min(percentage, 100)}%`;
            }
        }
    }

    /**
     * Clear user progress from UI (when logged out)
     */
    clearUserProgress() {
        // Reset all checkboxes
        const checkboxes = document.querySelectorAll('input[type="checkbox"][data-task]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
            checkbox.closest('.task-item')?.classList.remove('completed');
        });

        // Reset progress displays to default
        const xpText = document.getElementById('xpText');
        const xpFill = document.getElementById('xpFill');
        const levelBadge = document.getElementById('levelBadge');
        
        if (xpText) xpText.textContent = '0 / 100 XP';
        if (levelBadge) levelBadge.querySelector('.level-text').textContent = 'Level 1';
        if (xpFill) xpFill.style.width = '0%';
    }

    /**
     * Get current user progress data
     */
    getCurrentProgressData() {
        const completedTasks = Array.from(document.querySelectorAll('input[type="checkbox"][data-task]:checked'))
            .map(checkbox => checkbox.getAttribute('data-task'));

        const xpText = document.getElementById('xpText');
        const levelBadge = document.getElementById('levelBadge');
        const currentXP = xpText ? parseInt(xpText.textContent.match(/(\d+) \/ \d+ XP/)?.[1] || '0') : 0;
        const currentLevel = levelBadge ? parseInt(levelBadge.querySelector('.level-text').textContent.replace('Level ', '')) : 1;

        return {
            completedTasks,
            currentXP,
            currentLevel,
            lastSaved: new Date().toISOString(),
            userEmail: this.currentUser?.email
        };
    }
}

// Initialize Auth0 system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.auth0System = new Auth0System();
});

// Add slideIn animation for notifications
if (!document.querySelector('#auth0-animations')) {
    const style = document.createElement('style');
    style.id = 'auth0-animations';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .hidden {
            display: none !important;
        }
    `;
    document.head.appendChild(style);
}