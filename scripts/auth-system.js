/**
 * Authentication System for Michael's Progress Journey
 * Handles user login/logout and content access control
 */

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    /**
     * Initialize the authentication system
     */
    init() {
        // Wait for Netlify Identity to load
        if (typeof netlifyIdentity !== 'undefined') {
            this.setupNetlifyIdentity();
        } else {
            // Retry after a short delay if not loaded yet
            setTimeout(() => this.init(), 100);
            return;
        }

        this.setupEventListeners();
        this.checkAuthStatus();
    }

    /**
     * Set up Netlify Identity configuration
     */
    setupNetlifyIdentity() {
        // Initialize Netlify Identity
        netlifyIdentity.init({
            APIEndpoint: `${window.location.origin}/.netlify/identity`
        });

        // Handle login events
        netlifyIdentity.on('login', (user) => {
            this.handleLogin(user);
        });

        // Handle logout events
        netlifyIdentity.on('logout', () => {
            this.handleLogout();
        });

        // Handle user initialization
        netlifyIdentity.on('init', (user) => {
            if (user) {
                this.handleLogin(user);
            }
        });

        // Handle email confirmation redirects
        netlifyIdentity.on('error', (err) => {
            console.error('Netlify Identity Error:', err);
        });

        // Close modal after email confirmation
        if (window.location.hash.includes('#confirmation_token=') || 
            window.location.hash.includes('#recovery_token=')) {
            netlifyIdentity.close();
        }
    }

    /**
     * Set up UI event listeners
     */
    setupEventListeners() {
        // Header login button
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.openLogin());
        }

        // CTA login button
        const ctaLoginBtn = document.getElementById('ctaLoginBtn');
        if (ctaLoginBtn) {
            ctaLoginBtn.addEventListener('click', () => this.openLogin());
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
    checkAuthStatus() {
        const user = netlifyIdentity.currentUser();
        if (user) {
            this.handleLogin(user);
        } else {
            this.handleLogout();
        }
    }

    /**
     * Open login modal
     */
    openLogin() {
        netlifyIdentity.open();
    }

    /**
     * Log out current user
     */
    logout() {
        netlifyIdentity.logout();
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
     * Load Michael's progress data (placeholder for now)
     */
    async loadMichaelProgress() {
        try {
            // For now, we'll use placeholder data
            // In Phase 2, this will load from michael-progress.json
            const placeholderProgress = {
                totalXP: 85,
                currentLevel: 2,
                completedTasks: 6,
                totalTasks: 120,
                percentage: 5,
                achievements: ['first-steps', 'quick-learner']
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
            levelBadge.querySelector('.level-text').textContent = `Level ${progressData.currentLevel}`;
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
     * Trigger email notification (placeholder)
     */
    triggerEmailNotification() {
        if (!this.currentUser) return;

        console.log(`Triggering email notification for ${this.currentUser.email}`);
        
        // Show user confirmation
        this.showEmailConfirmation();

        // In Phase 3, this will call Netlify Functions to send email
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
     * Get current authentication status
     */
    getAuthStatus() {
        return {
            isAuthenticated: this.isAuthenticated,
            user: this.currentUser
        };
    }
}

// Initialize authentication system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new AuthSystem();
});

// Add slideIn animation for notifications
if (!document.querySelector('#auth-animations')) {
    const style = document.createElement('style');
    style.id = 'auth-animations';
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