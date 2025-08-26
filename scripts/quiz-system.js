/**
 * Quiz System - Daily Knowledge Assessment
 */

class QuizSystem {
    constructor() {
        this.quizData = null;
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.startTime = null;
        this.timeRemaining = 0;
        this.timer = null;
        this.quizProgress = this.loadQuizProgress();
        this.callbacks = {
            quizComplete: [],
            questionAnswered: []
        };
    }

    /**
     * Initialize quiz system
     */
    init() {
        this.quizData = window.QUIZ_DATA;
        this.setupEventListeners();
        console.log('Quiz system initialized');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Close modal events
        document.addEventListener('click', (e) => {
            if (e.target.matches('.quiz-modal-close, .quiz-modal')) {
                this.closeQuiz();
            }
        });

        // Prevent closing modal by clicking content
        document.addEventListener('click', (e) => {
            if (e.target.closest('.quiz-modal-content')) {
                e.stopPropagation();
            }
        });
    }

    /**
     * Check if quiz is available for a specific day
     */
    isQuizAvailable(weekId, dayId) {
        if (!this.quizData) return false;
        return this.quizData.quizzes.some(quiz => 
            quiz.weekId === weekId && quiz.dayId === dayId
        );
    }

    /**
     * Check if day tasks are completed (requirement for quiz)
     */
    isDayCompleted(weekId, dayId, checklistManager) {
        const dayTasks = checklistManager.getDayTasks(weekId, `Day ${dayId}`);
        if (dayTasks.length === 0) return false;
        
        return dayTasks.every(task => checklistManager.isTaskCompleted(task.id));
    }

    /**
     * Start a quiz for specific week/day
     */
    startQuiz(weekId, dayId) {
        const quiz = this.quizData.quizzes.find(q => 
            q.weekId === weekId && q.dayId === dayId
        );

        if (!quiz) {
            console.error('Quiz not found for week', weekId, 'day', dayId);
            return false;
        }

        this.currentQuiz = quiz;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.startTime = Date.now();
        this.timeRemaining = quiz.timeLimit;

        this.showQuizModal();
        this.startTimer();
        this.renderCurrentQuestion();

        return true;
    }

    /**
     * Show quiz modal
     */
    showQuizModal() {
        // Remove existing modal
        const existingModal = document.getElementById('quizModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'quizModal';
        modal.className = 'quiz-modal';
        
        modal.innerHTML = `
            <div class="quiz-modal-content">
                <div class="quiz-header">
                    <div class="quiz-info">
                        <h2>${this.currentQuiz.title}</h2>
                        <p>${this.currentQuiz.description}</p>
                    </div>
                    <div class="quiz-stats">
                        <div class="quiz-timer" id="quizTimer">${this.formatTime(this.timeRemaining)}</div>
                        <div class="quiz-progress">
                            <span id="questionNumber">1</span> of ${this.currentQuiz.questions.length}
                        </div>
                        <button class="quiz-modal-close" title="Close Quiz">&times;</button>
                    </div>
                </div>
                <div class="quiz-body" id="quizBody">
                    <!-- Question content will be inserted here -->
                </div>
                <div class="quiz-footer" id="quizFooter">
                    <button class="quiz-btn quiz-btn-secondary" id="prevBtn" onclick="window.quizSystem.previousQuestion()">Previous</button>
                    <button class="quiz-btn quiz-btn-primary" id="nextBtn" onclick="window.quizSystem.nextQuestion()">Next</button>
                    <button class="quiz-btn quiz-btn-success" id="submitBtn" onclick="window.quizSystem.submitQuiz()" style="display: none;">Submit Quiz</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    /**
     * Render current question
     */
    renderCurrentQuestion() {
        const question = this.currentQuiz.questions[this.currentQuestionIndex];
        const quizBody = document.getElementById('quizBody');
        
        let questionHTML = `
            <div class="quiz-question">
                <h3>Question ${this.currentQuestionIndex + 1}</h3>
                <p class="question-text">${question.question}</p>
                <div class="question-options">
        `;

        if (question.type === 'multiple-choice') {
            question.options.forEach((option, index) => {
                const isSelected = this.userAnswers[this.currentQuestionIndex] === index;
                questionHTML += `
                    <label class="option-label ${isSelected ? 'selected' : ''}">
                        <input type="radio" name="question${question.id}" value="${index}" 
                               ${isSelected ? 'checked' : ''} 
                               onchange="window.quizSystem.selectAnswer(${index})">
                        <span class="option-text">${option}</span>
                    </label>
                `;
            });
        } else if (question.type === 'true-false') {
            const isTrue = this.userAnswers[this.currentQuestionIndex] === true;
            const isFalse = this.userAnswers[this.currentQuestionIndex] === false;
            
            questionHTML += `
                <label class="option-label ${isTrue ? 'selected' : ''}">
                    <input type="radio" name="question${question.id}" value="true" 
                           ${isTrue ? 'checked' : ''} 
                           onchange="window.quizSystem.selectAnswer(true)">
                    <span class="option-text">True</span>
                </label>
                <label class="option-label ${isFalse ? 'selected' : ''}">
                    <input type="radio" name="question${question.id}" value="false" 
                           ${isFalse ? 'checked' : ''} 
                           onchange="window.quizSystem.selectAnswer(false)">
                    <span class="option-text">False</span>
                </label>
            `;
        }

        questionHTML += `
                </div>
            </div>
        `;

        quizBody.innerHTML = questionHTML;
        this.updateNavigationButtons();
        this.updateQuestionCounter();
    }

    /**
     * Select answer for current question
     */
    selectAnswer(answer) {
        this.userAnswers[this.currentQuestionIndex] = answer;
        
        // Update visual selection
        document.querySelectorAll('.option-label').forEach(label => {
            label.classList.remove('selected');
        });
        
        event.target.closest('.option-label').classList.add('selected');
        
        // Enable next button
        this.updateNavigationButtons();
        
        // Notify callbacks
        this.notifyQuestionAnswered(this.currentQuestionIndex, answer);
    }

    /**
     * Go to next question
     */
    nextQuestion() {
        if (this.currentQuestionIndex < this.currentQuiz.questions.length - 1) {
            this.currentQuestionIndex++;
            this.renderCurrentQuestion();
        }
    }

    /**
     * Go to previous question
     */
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.renderCurrentQuestion();
        }
    }

    /**
     * Update navigation buttons
     */
    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');
        
        if (prevBtn) prevBtn.style.display = this.currentQuestionIndex === 0 ? 'none' : 'inline-block';
        
        const isLastQuestion = this.currentQuestionIndex === this.currentQuiz.questions.length - 1;
        const hasAnswer = this.userAnswers[this.currentQuestionIndex] !== undefined;
        
        if (nextBtn) {
            nextBtn.style.display = isLastQuestion ? 'none' : 'inline-block';
            nextBtn.disabled = !hasAnswer;
        }
        
        if (submitBtn) {
            submitBtn.style.display = isLastQuestion ? 'inline-block' : 'none';
            submitBtn.disabled = !hasAnswer;
        }
    }

    /**
     * Update question counter
     */
    updateQuestionCounter() {
        const questionNumber = document.getElementById('questionNumber');
        if (questionNumber) {
            questionNumber.textContent = this.currentQuestionIndex + 1;
        }
    }

    /**
     * Start quiz timer
     */
    startTimer() {
        this.timer = setInterval(() => {
            this.timeRemaining--;
            
            const timerElement = document.getElementById('quizTimer');
            if (timerElement) {
                timerElement.textContent = this.formatTime(this.timeRemaining);
                
                // Warning at 1 minute
                if (this.timeRemaining <= 60) {
                    timerElement.classList.add('timer-warning');
                }
            }
            
            if (this.timeRemaining <= 0) {
                this.submitQuiz(true); // Auto-submit when time runs out
            }
        }, 1000);
    }

    /**
     * Format time in MM:SS
     */
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    /**
     * Submit quiz and calculate results
     */
    submitQuiz(timeExpired = false) {
        clearInterval(this.timer);
        
        const results = this.calculateResults();
        const timeTaken = Math.floor((Date.now() - this.startTime) / 1000);
        
        // Save quiz completion
        this.saveQuizCompletion(results, timeTaken, timeExpired);
        
        // Show results
        this.showResults(results, timeTaken, timeExpired);
        
        // Notify callbacks
        this.notifyQuizComplete(results);
    }

    /**
     * Calculate quiz results
     */
    calculateResults() {
        let correctAnswers = 0;
        const totalQuestions = this.currentQuiz.questions.length;
        const questionResults = [];

        this.currentQuiz.questions.forEach((question, index) => {
            const userAnswer = this.userAnswers[index];
            const correctAnswer = question.correct;
            const isCorrect = userAnswer === correctAnswer;
            
            if (isCorrect) correctAnswers++;
            
            questionResults.push({
                questionId: question.id,
                question: question.question,
                userAnswer: userAnswer,
                correctAnswer: correctAnswer,
                isCorrect: isCorrect,
                explanation: question.explanation
            });
        });

        const score = Math.round((correctAnswers / totalQuestions) * 100);
        const passed = score >= this.currentQuiz.passingScore;

        return {
            score: score,
            correctAnswers: correctAnswers,
            totalQuestions: totalQuestions,
            passed: passed,
            questionResults: questionResults
        };
    }

    /**
     * Show quiz results
     */
    showResults(results, timeTaken, timeExpired) {
        const quizBody = document.getElementById('quizBody');
        const quizFooter = document.getElementById('quizFooter');
        
        let statusClass = results.passed ? 'success' : 'failure';
        let statusIcon = results.passed ? '🎉' : '😔';
        let statusText = results.passed ? 'Congratulations!' : 'Keep Learning!';
        
        if (timeExpired) {
            statusText += ' (Time expired)';
        }

        let resultsHTML = `
            <div class="quiz-results ${statusClass}">
                <div class="results-header">
                    <div class="status-icon">${statusIcon}</div>
                    <h3>${statusText}</h3>
                    <div class="score-display">
                        <span class="score">${results.score}%</span>
                        <span class="score-detail">${results.correctAnswers}/${results.totalQuestions} correct</span>
                    </div>
                </div>
                
                <div class="results-stats">
                    <div class="stat">
                        <span class="stat-label">Time Taken:</span>
                        <span class="stat-value">${this.formatTime(timeTaken)}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Passing Score:</span>
                        <span class="stat-value">${this.currentQuiz.passingScore}%</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">XP Earned:</span>
                        <span class="stat-value">+${results.passed ? this.currentQuiz.xpReward : 0} XP</span>
                    </div>
                </div>

                <div class="results-breakdown">
                    <h4>Question Review</h4>
                    <div class="question-results">
        `;

        results.questionResults.forEach((qResult, index) => {
            const icon = qResult.isCorrect ? '✅' : '❌';
            resultsHTML += `
                <div class="question-result ${qResult.isCorrect ? 'correct' : 'incorrect'}">
                    <div class="question-summary">
                        <span class="result-icon">${icon}</span>
                        <span class="question-number">Question ${index + 1}</span>
                    </div>
                    <div class="question-explanation">
                        <p><strong>Question:</strong> ${qResult.question}</p>
                        <p><strong>Explanation:</strong> ${qResult.explanation}</p>
                    </div>
                </div>
            `;
        });

        resultsHTML += `
                    </div>
                </div>
            </div>
        `;

        quizBody.innerHTML = resultsHTML;
        
        // Update footer buttons
        quizFooter.innerHTML = `
            <button class="quiz-btn quiz-btn-primary" onclick="window.quizSystem.closeQuiz()">Continue Learning</button>
            ${window.QUIZ_CONFIG.allowRetakes ? 
                `<button class="quiz-btn quiz-btn-secondary" onclick="window.quizSystem.retakeQuiz()">Retake Quiz</button>` : 
                ''
            }
        `;
    }

    /**
     * Save quiz completion
     */
    saveQuizCompletion(results, timeTaken, timeExpired) {
        const quizId = `w${this.currentQuiz.weekId}d${this.currentQuiz.dayId}`;
        
        this.quizProgress[quizId] = {
            completed: true,
            score: results.score,
            passed: results.passed,
            timeTaken: timeTaken,
            timeExpired: timeExpired,
            attempts: (this.quizProgress[quizId]?.attempts || 0) + 1,
            completedAt: new Date().toISOString(),
            questionResults: results.questionResults
        };

        this.saveQuizProgress();
    }

    /**
     * Close quiz modal
     */
    closeQuiz() {
        clearInterval(this.timer);
        const modal = document.getElementById('quizModal');
        if (modal) {
            modal.remove();
        }
    }

    /**
     * Retake current quiz
     */
    retakeQuiz() {
        this.startQuiz(this.currentQuiz.weekId, this.currentQuiz.dayId);
    }

    /**
     * Get quiz completion status
     */
    getQuizStatus(weekId, dayId) {
        const quizId = `w${weekId}d${dayId}`;
        return this.quizProgress[quizId] || null;
    }

    /**
     * Load quiz progress from localStorage
     */
    loadQuizProgress() {
        try {
            const saved = localStorage.getItem('quizProgress');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error('Error loading quiz progress:', error);
            return {};
        }
    }

    /**
     * Save quiz progress to localStorage
     */
    saveQuizProgress() {
        try {
            localStorage.setItem('quizProgress', JSON.stringify(this.quizProgress));
        } catch (error) {
            console.error('Error saving quiz progress:', error);
        }
    }

    /**
     * Get quiz statistics
     */
    getQuizStats() {
        const completed = Object.keys(this.quizProgress).length;
        const passed = Object.values(this.quizProgress).filter(q => q.passed).length;
        const averageScore = completed > 0 ? 
            Object.values(this.quizProgress).reduce((sum, q) => sum + q.score, 0) / completed : 0;

        return {
            completed: completed,
            passed: passed,
            averageScore: Math.round(averageScore),
            totalAttempts: Object.values(this.quizProgress).reduce((sum, q) => sum + q.attempts, 0)
        };
    }

    /**
     * Register quiz completion callback
     */
    onQuizComplete(callback) {
        this.callbacks.quizComplete.push(callback);
    }

    /**
     * Register question answered callback
     */
    onQuestionAnswered(callback) {
        this.callbacks.questionAnswered.push(callback);
    }

    /**
     * Notify quiz completion callbacks
     */
    notifyQuizComplete(results) {
        this.callbacks.quizComplete.forEach(callback => {
            try {
                callback(this.currentQuiz, results);
            } catch (error) {
                console.error('Error in quiz complete callback:', error);
            }
        });
    }

    /**
     * Notify question answered callbacks
     */
    notifyQuestionAnswered(questionIndex, answer) {
        this.callbacks.questionAnswered.forEach(callback => {
            try {
                callback(this.currentQuiz, questionIndex, answer);
            } catch (error) {
                console.error('Error in question answered callback:', error);
            }
        });
    }

    /**
     * Reset all quiz progress
     */
    resetProgress() {
        this.quizProgress = {};
        this.saveQuizProgress();
    }
}

// Export for global access
window.QuizSystem = QuizSystem;