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
            // Create Auth0 client
            this.auth0Client = await createAuth0Client({
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
        // Header login button
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.login());
        }

        // CTA login button
        const ctaLoginBtn = document.getElementById('ctaLoginBtn');
        if (ctaLoginBtn) {
            ctaLoginBtn.addEventListener('click', () => this.login());
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
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
            } else {
                this.handleLogout();
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
        // Hide authentication gate
        const authGate = document.getElementById('authGate');
        if (authGate) {
            authGate.style.display = 'none';
        }

        // Show authenticated content
        const authenticatedContent = document.getElementById('authenticatedContent');
        if (authenticatedContent) {
            authenticatedContent.classList.remove('hidden');
        }

        // Update header auth section
        const loginBtn = document.getElementById('loginBtn');
        const userInfo = document.getElementById('userInfo');
        const userEmail = document.getElementById('userEmail');
        const progressStats = document.getElementById('progressStats');

        if (loginBtn) loginBtn.style.display = 'none';
        if (userInfo) {
            userInfo.classList.remove('hidden');
            if (userEmail && this.currentUser) {
                userEmail.textContent = this.currentUser.email;
            }
        }
        if (progressStats) {
            progressStats.classList.remove('hidden');
        }

        // Update page title
        document.title = "Michael's Progress Journey - Frontend Developer Curriculum";
    }

    /**
     * Update UI for unauthenticated users
     */
    updateUnauthenticatedUI() {
        // Show authentication gate
        const authGate = document.getElementById('authGate');
        if (authGate) {
            authGate.style.display = 'block';
        }

        // Hide authenticated content
        const authenticatedContent = document.getElementById('authenticatedContent');
        if (authenticatedContent) {
            authenticatedContent.classList.add('hidden');
        }

        // Update header auth section
        const loginBtn = document.getElementById('loginBtn');
        const userInfo = document.getElementById('userInfo');
        const progressStats = document.getElementById('progressStats');

        if (loginBtn) loginBtn.style.display = 'block';
        if (userInfo) userInfo.classList.add('hidden');
        if (progressStats) progressStats.classList.add('hidden');

        // Reset page title
        document.title = "Frontend Developer Curriculum Tracker";
    }

    /**
     * Load Michael's progress data
     */
    async loadMichaelProgress() {
        try {
            // For now, we'll use placeholder data
            // In Phase 2, this will load from michael-progress.json
            const placeholderProgress = {
                totalXP: 125,
                currentLevel: 3,
                completedTasks: 12,
                totalTasks: 120,
                percentage: 10,
                achievements: ['first-steps', 'quick-learner', 'daily-warrior']
            };

            // Update progress displays with Michael's data
            this.updateProgressDisplays(placeholderProgress);

        } catch (error) {
            console.error('Error loading Michael\'s progress:', error);
        }
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
     * Get current authentication status
     */
    getAuthStatus() {
        return {
            isAuthenticated: this.isAuthenticated,
            user: this.currentUser
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