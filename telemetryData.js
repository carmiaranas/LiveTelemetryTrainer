/**
 * Reference telemetry data generator and storage
 * Generates realistic throttle and brake patterns for training
 * Now supports pattern-based generation with keyframe interpolation
 */

class TelemetryData {
    constructor(patternKey = 'default') {
        this.currentPattern = null;
        this.setPattern(patternKey);
    }

    /**
     * Set current pattern from pattern library
     */
    setPattern(patternKey) {
        if (!TELEMETRY_PATTERNS[patternKey]) {
            console.warn(`Pattern '${patternKey}' not found, using 'default'`);
            patternKey = 'default';
        }
        
        this.currentPattern = TELEMETRY_PATTERNS[patternKey];
        this.referenceData = this.generateFromPattern(this.currentPattern);
    }

    /**
     * Load pattern from JSON object (custom patterns)
     */
    loadPatternJSON(patternJSON) {
        const validation = validatePattern(patternJSON);
        if (!validation.valid) {
            throw new Error(`Invalid pattern: ${validation.error}`);
        }
        
        this.currentPattern = patternJSON;
        this.referenceData = this.generateFromPattern(this.currentPattern);
    }

    /**
     * Generate telemetry data from pattern definition
     */
    generateFromPattern(pattern) {
        const data = [];
        const sampleRate = 60; // 60 Hz
        const totalSamples = Math.floor(pattern.duration * sampleRate);

        for (let i = 0; i < totalSamples; i++) {
            const time = i / sampleRate;
            const values = this.getValuesAtTime(time, pattern);

            data.push({
                time: time,
                throttle: Math.max(0, Math.min(100, values.throttle)),
                brake: Math.max(0, Math.min(100, values.brake))
            });
        }

        return data;
    }

    /**
     * Get throttle and brake values at specific time using keyframe interpolation
     */
    getValuesAtTime(time, pattern) {
        let throttle = 0;
        let brake = 0;

        // Find all segments that overlap with current time
        for (const segment of pattern.segments) {
            const [startTime, endTime] = segment.timeRange;
            
            if (time >= startTime && time <= endTime) {
                // Interpolate values within this segment
                const progress = (time - startTime) / (endTime - startTime);
                throttle += this.interpolate(segment.throttle[0], segment.throttle[1], progress);
                brake += this.interpolate(segment.brake[0], segment.brake[1], progress);
            }
        }

        // Add subtle variation for realism
        throttle += Math.sin(time * 5) * 2;
        if (brake > 10) {
            brake += Math.sin(time * 8) * 3;
        }

        return { throttle, brake };
    }

    /**
     * Smooth interpolation between two values with easing
     */
    interpolate(start, end, progress) {
        // Use ease-in-out curve for natural feel
        const eased = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        return start + (end - start) * eased;
    }

    /**
     * Smooth interpolation between two values with easing
     */
    interpolate(start, end, progress) {
        // Use ease-in-out curve for natural feel
        const eased = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        return start + (end - start) * eased;
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

    /**
     * Get current pattern definition
     */
    getCurrentPattern() {
        return this.currentPattern;
    }

    /**
     * Get pattern name
     */
    getPatternName() {
        return this.currentPattern ? this.currentPattern.name : 'Unknown';
    }
}
