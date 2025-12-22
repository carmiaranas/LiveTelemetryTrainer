/**
 * Input Handler
 * Manages keyboard and pedal inputs with smooth ramping and realistic behavior
 */

class InputHandler {
    constructor() {
        this.throttleInput = 0;
        this.brakeInput = 0;

        // Input state tracking
        this.keys = {
            throttle: false,  // W key
            brake: false      // S key
        };

        // Configuration
        this.config = {
            rampUpRate: 150,      // %/second - how fast input increases
            rampDownRate: 200,    // %/second - how fast input decays
            deadzone: 2,          // % - ignore inputs below this
            smoothingFactor: 0.15, // 0-1, lower = more smoothing
            minInput: 0,
            maxInput: 100
        };

        // Gamepad support
        this.gamepadIndex = null;
        this.gamepadAxes = {
            throttle: null,
            brake: null
        };

        this.initializeEventListeners();
        this.lastUpdateTime = performance.now();
    }

    /**
     * Set up keyboard and gamepad event listeners
     */
    initializeEventListeners() {
        // Keyboard events
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Gamepad connection
        window.addEventListener('gamepadconnected', (e) => this.handleGamepadConnected(e));
        window.addEventListener('gamepaddisconnected', (e) => this.handleGamepadDisconnected(e));

        // Prevent default browser behavior for training keys
        window.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'w' || e.key.toLowerCase() === 's') {
                e.preventDefault();
            }
        });
    }

    /**
     * Handle key press
     */
    handleKeyDown(e) {
        const key = e.key.toLowerCase();
        
        if (key === 'w') {
            this.keys.throttle = true;
        } else if (key === 's') {
            this.keys.brake = true;
        }
    }

    /**
     * Handle key release
     */
    handleKeyUp(e) {
        const key = e.key.toLowerCase();
        
        if (key === 'w') {
            this.keys.throttle = false;
        } else if (key === 's') {
            this.keys.brake = false;
        }
    }

    /**
     * Handle gamepad connection
     */
    handleGamepadConnected(e) {
        console.log('Gamepad connected:', e.gamepad.id);
        this.gamepadIndex = e.gamepad.index;
        
        // Try to detect pedal axes (typically axis 1 and 2 for racing pedals)
        // This is a basic mapping - may need adjustment for specific hardware
        this.gamepadAxes.throttle = 1;
        this.gamepadAxes.brake = 2;
    }

    /**
     * Handle gamepad disconnection
     */
    handleGamepadDisconnected(e) {
        if (e.gamepad.index === this.gamepadIndex) {
            console.log('Gamepad disconnected');
            this.gamepadIndex = null;
            this.gamepadAxes.throttle = null;
            this.gamepadAxes.brake = null;
        }
    }

    /**
     * Read gamepad input if available
     */
    readGamepad() {
        if (this.gamepadIndex === null) return { throttle: 0, brake: 0 };

        const gamepads = navigator.getGamepads();
        const gamepad = gamepads[this.gamepadIndex];

        if (!gamepad) return { throttle: 0, brake: 0 };

        let throttle = 0;
        let brake = 0;

        // Read throttle axis (convert from -1..1 or 0..1 range to 0..100)
        if (this.gamepadAxes.throttle !== null && gamepad.axes[this.gamepadAxes.throttle] !== undefined) {
            let value = gamepad.axes[this.gamepadAxes.throttle];
            // Handle different axis ranges
            throttle = ((value + 1) / 2) * 100; // Convert -1..1 to 0..100
            if (value >= 0 && value <= 1) {
                throttle = value * 100; // Already in 0..1 range
            }
        }

        // Read brake axis
        if (this.gamepadAxes.brake !== null && gamepad.axes[this.gamepadAxes.brake] !== undefined) {
            let value = gamepad.axes[this.gamepadAxes.brake];
            brake = ((value + 1) / 2) * 100;
            if (value >= 0 && value <= 1) {
                brake = value * 100;
            }
        }

        // Also check buttons (some pedals use buttons)
        if (gamepad.buttons[6]) { // RT typically
            throttle = Math.max(throttle, gamepad.buttons[6].value * 100);
        }
        if (gamepad.buttons[7]) { // LT typically
            brake = Math.max(brake, gamepad.buttons[7].value * 100);
        }

        return { throttle, brake };
    }

    /**
     * Update inputs with smooth ramping
     * Call this every frame
     */
    update(deltaTime, trainingMode, customSettings = null) {
        // Calculate time delta in seconds
        const dt = deltaTime / 1000;

        // Get gamepad input
        const gamepadInput = this.readGamepad();

        // Determine target values based on input source
        let targetThrottle = 0;
        let targetBrake = 0;

        // Prioritize gamepad if connected
        if (this.gamepadIndex !== null) {
            targetThrottle = gamepadInput.throttle;
            targetBrake = gamepadInput.brake;
        } else {
            // Keyboard input
            if (this.keys.throttle) {
                targetThrottle = 100;
            }
            if (this.keys.brake) {
                targetBrake = 100;
            }
        }

        // Apply training mode rules
        if (trainingMode === 'beginner') {
            // Get custom settings if available
            const brakeThreshold = customSettings?.brakeThreshold || 10;
            const allowOverlap = customSettings?.allowOverlap || false;
            
            // No overlap allowed - brake locks throttle (unless overlap is enabled)
            if (!allowOverlap && targetBrake > brakeThreshold) {
                targetThrottle = 0;
            }
        }

        // Smooth ramping for keyboard
        if (this.gamepadIndex === null) {
            // Ramp up or down based on target
            if (targetThrottle > this.throttleInput) {
                this.throttleInput = Math.min(
                    targetThrottle,
                    this.throttleInput + this.config.rampUpRate * dt
                );
            } else {
                this.throttleInput = Math.max(
                    targetThrottle,
                    this.throttleInput - this.config.rampDownRate * dt
                );
            }

            if (targetBrake > this.brakeInput) {
                this.brakeInput = Math.min(
                    targetBrake,
                    this.brakeInput + this.config.rampUpRate * dt
                );
            } else {
                this.brakeInput = Math.max(
                    targetBrake,
                    this.brakeInput - this.config.rampDownRate * dt
                );
            }
        } else {
            // Gamepad - apply smoothing filter
            this.throttleInput += (targetThrottle - this.throttleInput) * this.config.smoothingFactor;
            this.brakeInput += (targetBrake - this.brakeInput) * this.config.smoothingFactor;
        }

        // Apply deadzone
        if (Math.abs(this.throttleInput) < this.config.deadzone) {
            this.throttleInput = 0;
        }
        if (Math.abs(this.brakeInput) < this.config.deadzone) {
            this.brakeInput = 0;
        }

        // Clamp to valid range
        this.throttleInput = Math.max(this.config.minInput, Math.min(this.config.maxInput, this.throttleInput));
        this.brakeInput = Math.max(this.config.minInput, Math.min(this.config.maxInput, this.brakeInput));
    }

    /**
     * Get current input values
     */
    getInputs() {
        return {
            throttle: this.throttleInput,
            brake: this.brakeInput
        };
    }

    /**
     * Reset all inputs to zero
     */
    reset() {
        this.throttleInput = 0;
        this.brakeInput = 0;
        this.keys.throttle = false;
        this.keys.brake = false;
    }

    /**
     * Check if gamepad is connected
     */
    isGamepadConnected() {
        return this.gamepadIndex !== null;
    }
}
