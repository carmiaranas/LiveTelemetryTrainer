/**
 * Reference telemetry data generator and storage
 * Generates realistic throttle and brake patterns for training
 */

class TelemetryData {
    constructor() {
        this.referenceData = this.generateReferenceData();
    }

    /**
     * Generate realistic reference telemetry with typical racing patterns
     * Includes smooth transitions, trail braking zones, and varied corners
     */
    generateReferenceData() {
        const data = [];
        const duration = 30; // 30 seconds of data
        const sampleRate = 60; // 60 Hz
        const totalSamples = duration * sampleRate;

        for (let i = 0; i < totalSamples; i++) {
            const time = i / sampleRate;
            const throttle = this.calculateThrottle(time, duration);
            const brake = this.calculateBrake(time, duration);

            data.push({
                time: time,
                throttle: Math.max(0, Math.min(100, throttle)),
                brake: Math.max(0, Math.min(100, brake))
            });
        }

        return data;
    }

    /**
     * Calculate throttle value at given time
     * Creates realistic acceleration and lift-off patterns
     */
    calculateThrottle(time, duration) {
        const pattern = time / duration * Math.PI * 4; // 4 corner patterns

        // Base throttle pattern with smooth transitions
        let throttle = 0;

        // Straight sections with full throttle
        if (time < 3) {
            throttle = this.smoothRamp(time, 0, 2, 0, 100);
        } else if (time < 6) {
            throttle = 100;
        } else if (time < 8) {
            // Lift for corner entry
            throttle = this.smoothRamp(time, 6, 7.5, 100, 20);
        } else if (time < 10) {
            // Trail braking zone - very low throttle
            throttle = 10;
        } else if (time < 12) {
            // Corner exit acceleration
            throttle = this.smoothRamp(time, 10, 12, 10, 100);
        } else if (time < 16) {
            // Full throttle straight
            throttle = 100;
        } else if (time < 18) {
            // Lift for tight corner
            throttle = this.smoothRamp(time, 16, 17.5, 100, 0);
        } else if (time < 20) {
            // Slow corner, no throttle
            throttle = 0;
        } else if (time < 23) {
            // Progressive acceleration
            throttle = this.smoothRamp(time, 20, 23, 0, 100);
        } else if (time < 26) {
            // Full throttle
            throttle = 100;
        } else if (time < 28) {
            // Final corner lift
            throttle = this.smoothRamp(time, 26, 27.5, 100, 30);
        } else {
            // Gentle acceleration to finish
            throttle = this.smoothRamp(time, 28, 30, 30, 80);
        }

        // Add subtle variation for realism
        throttle += Math.sin(time * 5) * 2;

        return throttle;
    }

    /**
     * Calculate brake value at given time
     * Creates realistic braking patterns with smooth ramps
     */
    calculateBrake(time, duration) {
        let brake = 0;

        // Braking zones with realistic profiles
        if (time >= 6.5 && time < 10) {
            // First braking zone - medium corner
            if (time < 7.5) {
                // Initial brake application - aggressive
                brake = this.smoothRamp(time, 6.5, 7.5, 0, 85);
            } else if (time < 9) {
                // Trail braking - gradual release
                brake = this.smoothRamp(time, 7.5, 9, 85, 20);
            } else {
                // Final release
                brake = this.smoothRamp(time, 9, 10, 20, 0);
            }
        } else if (time >= 16.5 && time < 20) {
            // Second braking zone - tight corner, heavy braking
            if (time < 17.5) {
                // Hard brake application
                brake = this.smoothRamp(time, 16.5, 17.5, 0, 100);
            } else if (time < 19) {
                // Hold high brake pressure
                brake = this.smoothRamp(time, 17.5, 19, 100, 70);
            } else {
                // Release
                brake = this.smoothRamp(time, 19, 20, 70, 0);
            }
        } else if (time >= 26.5 && time < 29) {
            // Third braking zone - medium corner
            if (time < 27.5) {
                // Brake application
                brake = this.smoothRamp(time, 26.5, 27.5, 0, 75);
            } else {
                // Trail braking release
                brake = this.smoothRamp(time, 27.5, 29, 75, 0);
            }
        }

        // Add subtle variation for realism
        if (brake > 10) {
            brake += Math.sin(time * 8) * 3;
        }

        return brake;
    }

    /**
     * Smooth interpolation between two values
     * Uses easing for realistic feel
     */
    smoothRamp(time, startTime, endTime, startValue, endValue) {
        if (time <= startTime) return startValue;
        if (time >= endTime) return endValue;

        const progress = (time - startTime) / (endTime - startTime);
        // Use ease-in-out curve for natural feel
        const eased = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        return startValue + (endValue - startValue) * eased;
    }

    /**
     * Get reference value at specific time with interpolation
     */
    getReferenceAt(time) {
        if (time < 0) return { throttle: 0, brake: 0 };

        const index = Math.floor(time * 60); // 60 Hz sample rate

        if (index >= this.referenceData.length - 1) {
            const last = this.referenceData[this.referenceData.length - 1];
            return { throttle: last.throttle, brake: last.brake };
        }

        // Linear interpolation between samples
        const sample1 = this.referenceData[index];
        const sample2 = this.referenceData[index + 1];
        const fraction = (time * 60) - index;

        return {
            throttle: sample1.throttle + (sample2.throttle - sample1.throttle) * fraction,
            brake: sample1.brake + (sample2.brake - sample1.brake) * fraction
        };
    }

    /**
     * Get total duration of reference data
     */
    getDuration() {
        return this.referenceData[this.referenceData.length - 1].time;
    }

    /**
     * Get all reference data
     */
    getAllData() {
        return this.referenceData;
    }
}
