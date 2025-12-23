/**
 * Main Application Logic
 * Coordinates all systems and manages training session
 */

class LiveTelemetryTrainer {
    constructor() {
        // Initialize systems
        this.telemetryData = new TelemetryData();
        this.inputHandler = new InputHandler();
        this.graphRenderer = new GraphRenderer('telemetryCanvas');
        this.scoringSystem = new ScoringSystem();

        // Training state
        this.trainingMode = 'beginner';
        this.isRunning = false;
        this.isPaused = false;
        this.currentTime = 0;
        this.isReplayMode = false;
        this.replayData = null;
        
        // Session recording
        this.currentSession = {
            startTime: null,
            mode: null,
            settings: null,
            samples: []
        };
        
        // Beginner mode settings (customizable)
        this.beginnerSettings = {
            playbackSpeed: 0.7,
            tolerance: 15,
            brakeThreshold: 10,
            allowOverlap: false
        };
        
        // Apply current settings
        this.playbackSpeed = 0.7;
        this.tolerance = 15;

        // Animation
        this.lastFrameTime = 0;
        this.animationFrameId = null;

        // UI elements
        this.elements = {
            startBtn: document.getElementById('startBtn'),
            resetBtn: document.getElementById('resetBtn'),
            beginnerMode: document.getElementById('beginnerMode'),
            advancedMode: document.getElementById('advancedMode'),
            modeInfo: document.getElementById('modeInfo'),
            throttleBar: document.getElementById('throttleBar'),
            brakeBar: document.getElementById('brakeBar'),
            throttleValue: document.getElementById('throttleValue'),
            brakeValue: document.getElementById('brakeValue'),
            meanDeviation: document.getElementById('meanDeviation'),
            timingOffset: document.getElementById('timingOffset'),
            smoothness: document.getElementById('smoothness'),
            accuracy: document.getElementById('accuracy'),
            summaryModal: document.getElementById('summaryModal'),
            closeModal: document.getElementById('closeModal'),
            // Admin panel elements
            menuToggle: document.getElementById('menuToggle'),
            sideNav: document.getElementById('sideNav'),
            closeNav: document.getElementById('closeNav'),
            playbackSpeed: document.getElementById('playbackSpeed'),
            speedValue: document.getElementById('speedValue'),
            tolerancePercent: document.getElementById('tolerancePercent'),
            toleranceValue: document.getElementById('toleranceValue'),
            brakeThreshold: document.getElementById('brakeThreshold'),
            thresholdValue: document.getElementById('thresholdValue'),
            allowOverlap: document.getElementById('allowOverlap'),
            applySettings: document.getElementById('applySettings'),
            resetDefaults: document.getElementById('resetDefaults'),
            currentSpeed: document.getElementById('currentSpeed'),
            currentTolerance: document.getElementById('currentTolerance'),
            currentThreshold: document.getElementById('currentThreshold'),
            currentOverlap: document.getElementById('currentOverlap'),
            // Channel visibility toggles
            showThrottle: document.getElementById('showThrottle'),
            showBrake: document.getElementById('showBrake'),
            // Pattern display
            currentPattern: document.getElementById('currentPattern'),
            // Session history elements
            sessionHistory: document.getElementById('sessionHistory'),
            clearHistory: document.getElementById('clearHistory'),
            replayBanner: document.getElementById('replayBanner'),
            exitReplay: document.getElementById('exitReplay'),
            // Pattern editor elements
            patternSelect: document.getElementById('patternSelect'),
            patternDescription: document.getElementById('patternDescription'),
            patternDuration: document.getElementById('patternDuration'),
            patternJSON: document.getElementById('patternJSON'),
            patternValidation: document.getElementById('patternValidation'),
            loadPattern: document.getElementById('loadPattern'),
            saveCustomPattern: document.getElementById('saveCustomPattern'),
            exportPattern: document.getElementById('exportPattern'),
            importPattern: document.getElementById('importPattern'),
            validatePattern: document.getElementById('validatePattern')
        };

        this.initializeEventListeners();
        this.updateUI();
        this.updateCurrentSettingsDisplay();
        this.loadSessionHistory();
        this.initializePatternEditor();
    }

    /**
     * Set up all event listeners
     */
    initializeEventListeners() {
        // Mode selection
        this.elements.beginnerMode.addEventListener('click', () => this.setMode('beginner'));
        this.elements.advancedMode.addEventListener('click', () => this.setMode('advanced'));

        // Session controls
        this.elements.startBtn.addEventListener('click', () => this.toggleTraining());
        this.elements.resetBtn.addEventListener('click', () => this.reset());

        // Modal
        this.elements.closeModal.addEventListener('click', () => this.closeModal());

        // Admin panel
        this.elements.menuToggle.addEventListener('click', () => this.toggleSideNav());
        this.elements.closeNav.addEventListener('click', () => this.closeSideNav());
        
        // Click outside to close
        this.elements.sideNav.addEventListener('click', (e) => {
            if (e.target === this.elements.sideNav) {
                this.closeSideNav();
            }
        });

        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.loadPreset(e.target.dataset.preset));
        });

        // Range sliders
        this.elements.playbackSpeed.addEventListener('input', (e) => {
            this.elements.speedValue.textContent = parseFloat(e.target.value).toFixed(2) + '×';
        });
        
        this.elements.tolerancePercent.addEventListener('input', (e) => {
            this.elements.toleranceValue.textContent = '±' + e.target.value + '%';
        });
        
        this.elements.brakeThreshold.addEventListener('input', (e) => {
            this.elements.thresholdValue.textContent = e.target.value + '%';
        });

        // Apply and reset buttons
        this.elements.applySettings.addEventListener('click', () => this.applyAdminSettings());
        this.elements.resetDefaults.addEventListener('click', () => this.resetToDefaults());

        // Channel visibility toggles
        this.elements.showThrottle.addEventListener('change', () => this.updateChannelVisibility());
        this.elements.showBrake.addEventListener('change', () => this.updateChannelVisibility());

        // Session history
        this.elements.clearHistory.addEventListener('click', () => this.clearAllHistory());
        this.elements.exitReplay.addEventListener('click', () => this.exitReplayMode());

        // Pattern editor
        this.elements.patternSelect.addEventListener('change', () => this.updatePatternInfo());
        this.elements.loadPattern.addEventListener('click', () => this.loadSelectedPattern());
        this.elements.saveCustomPattern.addEventListener('click', () => this.saveCustomPattern());
        this.elements.exportPattern.addEventListener('click', () => this.exportPatternJSON());
        this.elements.importPattern.addEventListener('click', () => this.importPatternJSON());
        this.elements.validatePattern.addEventListener('click', () => this.validatePatternJSON());

        // Window resize
        window.addEventListener('resize', () => {
            this.graphRenderer.handleResize();
        });

        // Prevent accidental page navigation
        window.addEventListener('beforeunload', (e) => {
            if (this.isRunning) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }

    /**
     * Set training mode
     */
    setMode(mode) {
        if (this.isRunning) return; // Can't change mode while running

        this.trainingMode = mode;

        // Update button states
        this.elements.beginnerMode.classList.toggle('active', mode === 'beginner');
        this.elements.advancedMode.classList.toggle('active', mode === 'advanced');

        // Update mode settings
        if (mode === 'beginner') {
            this.playbackSpeed = this.beginnerSettings.playbackSpeed;
            this.tolerance = this.beginnerSettings.tolerance;
            this.elements.modeInfo.innerHTML = `
                <p><strong>Beginner Mode (Custom)</strong></p>
                <p>• Speed: ${this.beginnerSettings.playbackSpeed}×</p>
                <p>• Tolerance: ±${this.beginnerSettings.tolerance}%</p>
                <p>• Brake Lock: ${this.beginnerSettings.brakeThreshold}%</p>
            `;
        } else {
            this.playbackSpeed = 1.0;
            this.tolerance = 8;
            this.elements.modeInfo.innerHTML = `
                <p><strong>Advanced Mode</strong></p>
                <p>• Overlap allowed</p>
                <p>• Speed: 1.0×</p>
                <p>• Tolerance: ±8%</p>
            `;
        }
    }

    /**
     * Toggle training session
     */
    toggleTraining() {
        if (!this.isRunning) {
            this.start();
        } else {
            this.stop();
        }
    }

    /**
     * Start training session
     */
    start() {
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.elements.startBtn.textContent = 'Stop';
        this.elements.startBtn.classList.add('active');
        
        // Disable mode switching
        this.elements.beginnerMode.disabled = true;
        this.elements.advancedMode.disabled = true;

        // Initialize session recording (only if not in replay mode)
        if (!this.isReplayMode) {
            this.currentSession = {
                startTime: new Date().toISOString(),
                mode: this.trainingMode,
                pattern: this.telemetryData.getCurrentPatternName(),
                settings: { ...this.beginnerSettings },
                samples: []
            };
        }

        // Start animation loop
        this.animate();
    }

    /**
     * Stop training session
     */
    stop() {
        this.isRunning = false;
        this.elements.startBtn.textContent = 'Start Training';
        this.elements.startBtn.classList.remove('active');

        // Enable mode switching
        this.elements.beginnerMode.disabled = false;
        this.elements.advancedMode.disabled = false;

        // Cancel animation
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        // Save session if not in replay mode and session was meaningful
        if (!this.isReplayMode && this.currentTime > 1 && this.currentSession.samples.length > 0) {
            this.saveSession();
        }

        // Show summary if session completed
        if (this.currentTime > 1) {
            this.showSessionSummary();
        }
    }

    /**
     * Reset everything
     */
    reset() {
        this.stop();
        this.currentTime = 0;
        this.scoringSystem.reset();
        this.graphRenderer.clearHistory();
        this.inputHandler.reset();
        this.updateUI();
    }

    /**
     * Main animation loop (60 FPS target)
     */
    animate() {
        if (!this.isRunning) return;

        const currentFrameTime = performance.now();
        const deltaTime = currentFrameTime - this.lastFrameTime;
        this.lastFrameTime = currentFrameTime;

        // Update simulation time based on playback speed
        this.currentTime += (deltaTime / 1000) * this.playbackSpeed;

        // Check if session is complete
        const duration = this.telemetryData.getDuration();
        if (this.currentTime >= duration) {
            this.stop();
            return;
        }

        let playerInput, referenceInput, deviation;

        if (this.isReplayMode && this.replayData) {
            // Replay mode - use recorded data
            const sampleIndex = Math.floor(this.currentTime * 60); // 60 Hz
            if (sampleIndex < this.replayData.samples.length) {
                const sample = this.replayData.samples[sampleIndex];
                playerInput = sample.playerInput;
                referenceInput = sample.referenceInput;
                deviation = sample.deviation;
                
                // Update scoring with replayed data
                this.scoringSystem.addSample(
                    this.currentTime,
                    playerInput,
                    referenceInput,
                    this.tolerance
                );
            } else {
                playerInput = { throttle: 0, brake: 0 };
                referenceInput = this.telemetryData.getReferenceAt(this.currentTime);
                deviation = 0;
            }
        } else {
            // Normal mode - capture live input
            this.inputHandler.update(deltaTime, this.trainingMode, this.beginnerSettings);
            playerInput = this.inputHandler.getInputs();
            referenceInput = this.telemetryData.getReferenceAt(this.currentTime);

            // Update scoring
            deviation = this.scoringSystem.addSample(
                this.currentTime,
                playerInput,
                referenceInput,
                this.tolerance
            );

            // Record session data
            this.currentSession.samples.push({
                time: this.currentTime,
                playerInput: { ...playerInput },
                referenceInput: { ...referenceInput },
                deviation: deviation
            });
        }

        // Add to graph history
        this.graphRenderer.addDataPoint(
            this.currentTime,
            playerInput.throttle,
            playerInput.brake,
            referenceInput,
            deviation
        );

        // Render graph
        this.graphRenderer.render(
            this.currentTime,
            this.telemetryData.getAllData(),
            this.trainingMode
        );

        // Update UI
        this.updateUI();

        // Schedule next frame
        this.animationFrameId = requestAnimationFrame(() => this.animate());
    }

    /**
     * Toggle side navigation
     */
    toggleSideNav() {
        this.elements.sideNav.classList.toggle('open');
    }

    /**
     * Close side navigation
     */
    closeSideNav() {
        this.elements.sideNav.classList.remove('open');
    }

    /**
     * Load preset configuration
     */
    loadPreset(preset) {
        // Update active button
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.preset === preset);
        });

        // Set slider values based on preset
        let speed, tolerance, threshold, overlap;
        
        switch(preset) {
            case 'easy':
                speed = 0.3;
                tolerance = 20;
                threshold = 5;
                overlap = false;
                break;
            case 'medium':
                speed = 0.7;
                tolerance = 15;
                threshold = 10;
                overlap = false;
                break;
            case 'hard':
                speed = 0.85;
                tolerance = 12;
                threshold = 15;
                overlap = false;
                break;
        }

        // Update sliders
        this.elements.playbackSpeed.value = speed;
        this.elements.speedValue.textContent = speed.toFixed(2) + '×';
        
        this.elements.tolerancePercent.value = tolerance;
        this.elements.toleranceValue.textContent = '±' + tolerance + '%';
        
        this.elements.brakeThreshold.value = threshold;
        this.elements.thresholdValue.textContent = threshold + '%';
        
        this.elements.allowOverlap.checked = overlap;
    }

    /**
     * Apply admin settings
     */
    applyAdminSettings() {
        if (this.isRunning) {
            alert('Please stop training before applying new settings.');
            return;
        }

        // Update beginner settings
        this.beginnerSettings = {
            playbackSpeed: parseFloat(this.elements.playbackSpeed.value),
            tolerance: parseInt(this.elements.tolerancePercent.value),
            brakeThreshold: parseInt(this.elements.brakeThreshold.value),
            allowOverlap: this.elements.allowOverlap.checked
        };

        // If currently in beginner mode, apply immediately
        if (this.trainingMode === 'beginner') {
            this.playbackSpeed = this.beginnerSettings.playbackSpeed;
            this.tolerance = this.beginnerSettings.tolerance;
            this.setMode('beginner'); // Refresh mode info
        }

        // Update current settings display
        this.updateCurrentSettingsDisplay();

        // Close side nav
        this.closeSideNav();

        // Show confirmation
        alert('Settings applied successfully!');
    }

    /**
     * Reset to default settings
     */
    resetToDefaults() {
        this.beginnerSettings = {
            playbackSpeed: 0.7,
            tolerance: 15,
            brakeThreshold: 10,
            allowOverlap: false
        };

        // Update sliders
        this.elements.playbackSpeed.value = 0.7;
        this.elements.speedValue.textContent = '0.70×';
        
        this.elements.tolerancePercent.value = 15;
        this.elements.toleranceValue.textContent = '±15%';
        
        this.elements.brakeThreshold.value = 10;
        this.elements.thresholdValue.textContent = '10%';
        
        this.elements.allowOverlap.checked = false;

        // Set medium preset as active
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.preset === 'medium');
        });

        // Update current settings display
        this.updateCurrentSettingsDisplay();
    }

    /**
     * Update current settings display
     */
    updateCurrentSettingsDisplay() {
        this.elements.currentSpeed.textContent = this.beginnerSettings.playbackSpeed.toFixed(2) + '×';
        this.elements.currentTolerance.textContent = '±' + this.beginnerSettings.tolerance + '%';
        this.elements.currentThreshold.textContent = this.beginnerSettings.brakeThreshold + '%';
        this.elements.currentOverlap.textContent = this.beginnerSettings.allowOverlap ? 'Enabled' : 'Disabled';
    }

    /**
     * Update channel visibility based on toggles
     */
    updateChannelVisibility() {
        const showThrottle = this.elements.showThrottle.checked;
        const showBrake = this.elements.showBrake.checked;
        this.graphRenderer.setChannelVisibility(showThrottle, showBrake);
    }

    /**
     * Update all UI elements
     */
    updateUI() {
        // Update input displays
        const inputs = this.inputHandler.getInputs();
        this.elements.throttleBar.style.width = inputs.throttle + '%';
        this.elements.brakeBar.style.width = inputs.brake + '%';
        this.elements.throttleValue.textContent = Math.round(inputs.throttle) + '%';
        this.elements.brakeValue.textContent = Math.round(inputs.brake) + '%';

        // Update scores
        if (this.isRunning) {
            const scores = this.scoringSystem.getCurrentScores();
            this.elements.meanDeviation.textContent = scores.meanDeviation + '%';
            this.elements.timingOffset.textContent = scores.timingOffset + 'ms';
            this.elements.smoothness.textContent = scores.smoothness + '%';
            this.elements.accuracy.textContent = scores.accuracy;

            // Color code accuracy
            this.elements.accuracy.className = 'score-value accuracy-display';
            if (scores.accuracy.startsWith('A')) {
                this.elements.accuracy.classList.add('good');
            } else if (scores.accuracy === 'B' || scores.accuracy === 'C') {
                this.elements.accuracy.classList.add('ok');
            } else {
                this.elements.accuracy.classList.add('bad');
            }
        }
    }

    /**
     * Show session summary modal
     */
    showSessionSummary() {
        const summary = this.scoringSystem.getSessionSummary(this.tolerance);

        document.getElementById('summaryPattern').textContent = this.telemetryData.getCurrentPatternName();
        document.getElementById('summaryDeviation').textContent = summary.meanDeviation + '%';
        document.getElementById('summaryOffset').textContent = summary.timingOffset + 'ms';
        document.getElementById('summarySmoothness').textContent = summary.smoothness + '%';
        document.getElementById('summaryGrade').textContent = summary.grade;

        // Color code grade
        const gradeElement = document.getElementById('summaryGrade');
        gradeElement.className = '';
        if (summary.grade.startsWith('A')) {
            gradeElement.style.color = '#00ff88';
        } else if (summary.grade === 'B' || summary.grade === 'C') {
            gradeElement.style.color = '#ffaa00';
        } else {
            gradeElement.style.color = '#ff3344';
        }

        this.elements.summaryModal.style.display = 'flex';
    }

    /**
     * Close summary modal
     */
    closeModal() {
        this.elements.summaryModal.style.display = 'none';
    }

    /**
     * Save completed session to localStorage
     */
    saveSession() {
        const summary = this.scoringSystem.getSessionSummary(this.tolerance);
        
        const sessionData = {
            id: Date.now(),
            timestamp: this.currentSession.startTime,
            mode: this.currentSession.mode,
            pattern: this.currentSession.pattern,
            settings: this.currentSession.settings,
            duration: this.currentTime,
            summary: summary,
            samples: this.currentSession.samples
        };

        // Get existing sessions
        let sessions = JSON.parse(localStorage.getItem('telemetryTrainingSessions') || '[]');
        
        // Add new session
        sessions.unshift(sessionData); // Add to beginning
        
        // Keep only last 20 sessions
        if (sessions.length > 20) {
            sessions = sessions.slice(0, 20);
        }
        
        // Save to localStorage
        localStorage.setItem('telemetryTrainingSessions', JSON.stringify(sessions));
        
        // Reload history display
        this.loadSessionHistory();
    }

    /**
     * Load and display session history
     */
    loadSessionHistory() {
        const sessions = JSON.parse(localStorage.getItem('telemetryTrainingSessions') || '[]');
        const container = this.elements.sessionHistory;
        
        if (sessions.length === 0) {
            container.innerHTML = '<p class="no-sessions">No recorded sessions yet</p>';
            return;
        }
        
        container.innerHTML = sessions.map(session => {
            const date = new Date(session.timestamp);
            const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            const grade = session.summary.grade;
            const gradeClass = grade.startsWith('A') ? 'good' : (grade === 'B' || grade === 'C') ? 'ok' : 'bad';
            const patternName = session.pattern || 'Race Track'; // Default for old sessions
            
            return `
                <div class="session-item" data-session-id="${session.id}">
                    <div class="session-header">
                        <span class="session-date">${dateStr}</span>
                        <span class="session-grade ${gradeClass}">${grade}</span>
                    </div>
                    <div class="session-details">
                        <p><strong>Pattern:</strong> ${patternName}</p>
                        <p><strong>Mode:</strong> ${session.mode === 'beginner' ? 'Beginner' : 'Advanced'}</p>
                        <p><strong>Deviation:</strong> ${session.summary.meanDeviation}%</p>
                        <p><strong>Smoothness:</strong> ${session.summary.smoothness}%</p>
                        <p><strong>Duration:</strong> ${session.duration.toFixed(1)}s</p>
                    </div>
                    <div class="session-actions">
                        <button class="replay-btn" onclick="app.replaySession(${session.id})">Replay</button>
                        <button class="delete-btn" onclick="app.deleteSession(${session.id})">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Replay a saved session
     */
    replaySession(sessionId) {
        if (this.isRunning) {
            alert('Please stop current session before replaying.');
            return;
        }

        const sessions = JSON.parse(localStorage.getItem('telemetryTrainingSessions') || '[]');
        const session = sessions.find(s => s.id === sessionId);
        
        if (!session) {
            alert('Session not found.');
            return;
        }

        // Enter replay mode
        this.isReplayMode = true;
        this.replayData = session;
        
        // Set mode and settings from recorded session
        this.trainingMode = session.mode;
        if (session.mode === 'beginner') {
            this.beginnerSettings = { ...session.settings };
            this.playbackSpeed = session.settings.playbackSpeed;
            this.tolerance = session.settings.tolerance;
        } else {
            this.playbackSpeed = 1.0;
            this.tolerance = 8;
        }
        
        // Update UI
        this.setMode(session.mode);
        this.elements.replayBanner.style.display = 'flex';
        this.closeSideNav();
        
        // Reset and prepare for replay
        this.reset();
        
        // Auto-start replay
        setTimeout(() => this.start(), 500);
    }

    /**
     * Exit replay mode
     */
    exitReplayMode() {
        if (this.isRunning) {
            this.stop();
        }
        
        this.isReplayMode = false;
        this.replayData = null;
        this.elements.replayBanner.style.display = 'none';
        this.reset();
    }

    /**
     * Delete a session
     */
    deleteSession(sessionId) {
        if (!confirm('Delete this session?')) {
            return;
        }

        let sessions = JSON.parse(localStorage.getItem('telemetryTrainingSessions') || '[]');
        sessions = sessions.filter(s => s.id !== sessionId);
        localStorage.setItem('telemetryTrainingSessions', JSON.stringify(sessions));
        
        this.loadSessionHistory();
    }

    /**
     * Clear all session history
     */
    clearAllHistory() {
        if (!confirm('Clear all session history? This cannot be undone.')) {
            return;
        }

        localStorage.removeItem('telemetryTrainingSessions');
        this.loadSessionHistory();
    }

    // ==================== PATTERN EDITOR METHODS ====================

    /**
     * Initialize pattern editor UI
     */
    initializePatternEditor() {
        this.updatePatternInfo();
    }

    /**
     * Update pattern info when selection changes
     */
    updatePatternInfo() {
        const selectedKey = this.elements.patternSelect.value;
        const pattern = TELEMETRY_PATTERNS[selectedKey];

        if (pattern) {
            this.elements.patternDescription.textContent = pattern.description;
            this.elements.patternDuration.textContent = `Duration: ${pattern.duration}s`;
            this.elements.patternJSON.value = JSON.stringify(pattern, null, 2);
            this.hideValidationMessage();
            
            // Update current pattern display
            this.elements.currentPattern.textContent = pattern.name;
        }
    }

    /**
     * Load selected pattern from dropdown
     */
    loadSelectedPattern() {
        const selectedKey = this.elements.patternSelect.value;
        
        if (this.isRunning) {
            this.showValidationMessage('Cannot change pattern while training is active', 'error');
            return;
        }

        try {
            this.telemetryData.setPattern(selectedKey);
            this.reset();
            this.showValidationMessage(`Pattern "${TELEMETRY_PATTERNS[selectedKey].name}" loaded successfully!`, 'success');
            
            // Update current pattern display
            this.elements.currentPattern.textContent = TELEMETRY_PATTERNS[selectedKey].name;
            
            // Update graph with new pattern
            if (this.graphRenderer) {
                this.graphRenderer.updateReferenceData(this.telemetryData.getAllData());
            }
        } catch (error) {
            this.showValidationMessage(`Failed to load pattern: ${error.message}`, 'error');
        }
    }

    /**
     * Save custom pattern from JSON editor
     */
    saveCustomPattern() {
        if (this.isRunning) {
            this.showValidationMessage('Cannot change pattern while training is active', 'error');
            return;
        }

        try {
            const jsonText = this.elements.patternJSON.value;
            const patternData = JSON.parse(jsonText);
            
            // Validate pattern
            const validation = validatePattern(patternData);
            if (!validation.valid) {
                this.showValidationMessage(`Validation error: ${validation.error}`, 'error');
                return;
            }

            // Load the custom pattern
            this.telemetryData.loadPatternJSON(patternData);
            this.reset();
            this.showValidationMessage(`Custom pattern "${patternData.name}" loaded successfully!`, 'success');
            
            // Update pattern info
            this.elements.patternDescription.textContent = patternData.description || 'Custom pattern';
            this.elements.patternDuration.textContent = `Duration: ${patternData.duration}s`;
            
            // Update graph
            if (this.graphRenderer) {
                this.graphRenderer.updateReferenceData(this.telemetryData.getAllData());
            }
        } catch (error) {
            this.showValidationMessage(`Failed to load custom pattern: ${error.message}`, 'error');
        }
    }

    /**
     * Export current pattern as JSON file
     */
    exportPatternJSON() {
        try {
            const pattern = this.telemetryData.getCurrentPattern();
            if (!pattern) {
                this.showValidationMessage('No pattern loaded', 'error');
                return;
            }

            const jsonString = JSON.stringify(pattern, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${pattern.name.replace(/\s+/g, '_').toLowerCase()}_pattern.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showValidationMessage('Pattern exported successfully!', 'success');
        } catch (error) {
            this.showValidationMessage(`Export failed: ${error.message}`, 'error');
        }
    }

    /**
     * Import pattern from JSON file
     */
    importPatternJSON() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const jsonText = event.target.result;
                    const patternData = JSON.parse(jsonText);
                    
                    // Display in editor
                    this.elements.patternJSON.value = JSON.stringify(patternData, null, 2);
                    
                    // Update info
                    if (patternData.name) {
                        this.elements.patternDescription.textContent = patternData.description || 'Imported pattern';
                        this.elements.patternDuration.textContent = `Duration: ${patternData.duration || 0}s`;
                    }
                    
                    this.showValidationMessage('Pattern imported! Click "Save Custom" to load it.', 'success');
                } catch (error) {
                    this.showValidationMessage(`Import failed: ${error.message}`, 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    /**
     * Validate pattern JSON in editor
     */
    validatePatternJSON() {
        try {
            const jsonText = this.elements.patternJSON.value;
            const patternData = JSON.parse(jsonText);
            
            const validation = validatePattern(patternData);
            
            if (validation.valid) {
                this.showValidationMessage('✓ Pattern is valid!', 'success');
            } else {
                this.showValidationMessage(`✗ Validation error: ${validation.error}`, 'error');
            }
        } catch (error) {
            this.showValidationMessage(`✗ JSON parsing error: ${error.message}`, 'error');
        }
    }

    /**
     * Show validation message
     */
    showValidationMessage(message, type) {
        this.elements.patternValidation.textContent = message;
        this.elements.patternValidation.className = `validation-message ${type}`;
    }

    /**
     * Hide validation message
     */
    hideValidationMessage() {
        this.elements.patternValidation.className = 'validation-message';
        this.elements.patternValidation.textContent = '';
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new LiveTelemetryTrainer();
    console.log('Full Focus Live Telemetry Trainer initialized');
    console.log('Controls: W = Throttle, S = Brake');
});
