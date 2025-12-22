/**
 * Scoring System
 * Calculates and tracks performance metrics
 */

class ScoringSystem {
    constructor() {
        this.reset();
    }

    /**
     * Reset all scores
     */
    reset() {
        this.samples = [];
        this.deviations = [];
        this.timingOffsets = [];
        this.throttleGradients = [];
        this.brakeGradients = [];
        
        this.currentScore = {
            meanDeviation: 0,
            timingOffset: 0,
            smoothness: 0,
            accuracy: 'N/A'
        };
    }

    /**
     * Add a sample for scoring
     */
    addSample(time, playerInput, referenceInput, tolerance) {
        // Calculate weighted deviation based on what's actually being used
        // Only count deviation for the active channel(s) in the reference
        const throttleDeviation = Math.abs(playerInput.throttle - referenceInput.throttle);
        const brakeDeviation = Math.abs(playerInput.brake - referenceInput.brake);
        
        const activeThreshold = 10; // Consider channel active if reference > 10%
        const isThrottleActive = referenceInput.throttle > activeThreshold;
        const isBrakeActive = referenceInput.brake > activeThreshold;
        
        let weightedDeviation;
        
        if (isBrakeActive && isThrottleActive) {
            // Both active (trail braking) - weight both equally
            weightedDeviation = (throttleDeviation + brakeDeviation) / 2;
        } else if (isBrakeActive) {
            // Only brake active - only count brake deviation
            weightedDeviation = brakeDeviation;
        } else if (isThrottleActive) {
            // Only throttle active - only count throttle deviation
            weightedDeviation = throttleDeviation;
        } else {
            // Neither active (coasting) - penalize any input
            weightedDeviation = (Math.abs(playerInput.throttle) + Math.abs(playerInput.brake)) / 2;
        }

        this.deviations.push(weightedDeviation);
        
        // Calculate timing offset (simplified - checks if player is ahead/behind)
        // Positive = player ahead, negative = player behind
        const timingError = this.calculateTimingError(playerInput, referenceInput);
        this.timingOffsets.push(timingError);

        // Calculate smoothness (gradient changes)
        if (this.samples.length > 0) {
            const prevSample = this.samples[this.samples.length - 1];
            const dt = time - prevSample.time;
            
            if (dt > 0) {
                const throttleGradient = Math.abs(
                    (playerInput.throttle - prevSample.player.throttle) / dt
                );
                const brakeGradient = Math.abs(
                    (playerInput.brake - prevSample.player.brake) / dt
                );
                
                this.throttleGradients.push(throttleGradient);
                this.brakeGradients.push(brakeGradient);
            }
        }

        // Store sample
        this.samples.push({
            time,
            player: { ...playerInput },
            reference: { ...referenceInput },
            deviation: weightedDeviation
        });

        // Update current scores (calculate from recent samples for real-time feel)
        this.updateCurrentScores(tolerance);

        return weightedDeviation;
    }

    /**
     * Calculate timing error (simplified approach)
     */
    calculateTimingError(playerInput, referenceInput) {
        // Check if player is reacting early or late based on brake application
        // This is a simplified metric - could be enhanced with cross-correlation
        const playerBraking = playerInput.brake > 10;
        const refBraking = referenceInput.brake > 10;
        
        if (playerBraking && !refBraking) {
            return -50; // Player braking early
        } else if (!playerBraking && refBraking) {
            return 50; // Player braking late
        }
        
        return 0; // Roughly in sync
    }

    /**
     * Update current scores from recent samples
     */
    updateCurrentScores(tolerance) {
        if (this.samples.length === 0) return;

        // Use last 120 samples (2 seconds at 60Hz) for current score
        const recentSamples = Math.min(120, this.samples.length);
        const startIndex = Math.max(0, this.samples.length - recentSamples);

        // Calculate mean deviation
        const recentDeviations = this.deviations.slice(startIndex);
        this.currentScore.meanDeviation = this.calculateMean(recentDeviations);

        // Calculate timing offset
        const recentOffsets = this.timingOffsets.slice(startIndex);
        this.currentScore.timingOffset = this.calculateMean(recentOffsets);

        // Calculate smoothness score (0-100, higher is better)
        const recentThrottleGrad = this.throttleGradients.slice(Math.max(0, startIndex - 1));
        const recentBrakeGrad = this.brakeGradients.slice(Math.max(0, startIndex - 1));
        
        const avgGradient = (
            this.calculateMean(recentThrottleGrad) + 
            this.calculateMean(recentBrakeGrad)
        ) / 2;

        // Convert gradient to smoothness score (lower gradient = smoother)
        // Typical gradient range: 0-500, map to 100-0 smoothness
        this.currentScore.smoothness = Math.max(0, Math.min(100, 100 - (avgGradient / 5)));

        // Calculate accuracy grade
        this.currentScore.accuracy = this.calculateAccuracyGrade(
            this.currentScore.meanDeviation, 
            tolerance
        );
    }

    /**
     * Calculate accuracy grade based on deviation
     */
    calculateAccuracyGrade(meanDeviation, tolerance) {
        if (meanDeviation <= tolerance * 0.3) return 'A+';
        if (meanDeviation <= tolerance * 0.5) return 'A';
        if (meanDeviation <= tolerance * 0.7) return 'B';
        if (meanDeviation <= tolerance) return 'C';
        if (meanDeviation <= tolerance * 1.3) return 'D';
        return 'F';
    }

    /**
     * Get current scores for display
     */
    getCurrentScores() {
        return {
            meanDeviation: this.currentScore.meanDeviation.toFixed(1),
            timingOffset: Math.round(this.currentScore.timingOffset),
            smoothness: this.currentScore.smoothness.toFixed(0),
            accuracy: this.currentScore.accuracy
        };
    }

    /**
     * Get final session summary
     */
    getSessionSummary(tolerance) {
        if (this.samples.length === 0) {
            return {
                meanDeviation: 0,
                timingOffset: 0,
                smoothness: 0,
                grade: 'N/A',
                totalSamples: 0
            };
        }

        // Calculate overall statistics
        const meanDeviation = this.calculateMean(this.deviations);
        const timingOffset = this.calculateMean(this.timingOffsets);
        
        const allGradients = [...this.throttleGradients, ...this.brakeGradients];
        const avgGradient = this.calculateMean(allGradients);
        const smoothness = Math.max(0, Math.min(100, 100 - (avgGradient / 5)));

        // Calculate overall grade
        const grade = this.calculateAccuracyGrade(meanDeviation, tolerance);

        // Calculate percentiles for context
        const p95Deviation = this.calculatePercentile(this.deviations, 0.95);
        const p50Deviation = this.calculatePercentile(this.deviations, 0.5);

        return {
            meanDeviation: meanDeviation.toFixed(1),
            timingOffset: Math.round(timingOffset),
            smoothness: smoothness.toFixed(0),
            grade,
            totalSamples: this.samples.length,
            p50Deviation: p50Deviation.toFixed(1),
            p95Deviation: p95Deviation.toFixed(1)
        };
    }

    /**
     * Calculate mean of array
     */
    calculateMean(arr) {
        if (arr.length === 0) return 0;
        return arr.reduce((sum, val) => sum + val, 0) / arr.length;
    }

    /**
     * Calculate percentile
     */
    calculatePercentile(arr, percentile) {
        if (arr.length === 0) return 0;
        const sorted = [...arr].sort((a, b) => a - b);
        const index = Math.floor(sorted.length * percentile);
        return sorted[Math.min(index, sorted.length - 1)];
    }

    /**
     * Get detailed analysis for feedback
     */
    getDetailedAnalysis() {
        if (this.samples.length === 0) return null;

        // Identify problem areas
        const analysis = {
            strengths: [],
            improvements: []
        };

        // Check smoothness
        const avgGradient = this.calculateMean([...this.throttleGradients, ...this.brakeGradients]);
        if (avgGradient < 200) {
            analysis.strengths.push('Smooth inputs');
        } else if (avgGradient > 400) {
            analysis.improvements.push('Try smoother input transitions');
        }

        // Check timing
        const avgTiming = this.calculateMean(this.timingOffsets);
        if (Math.abs(avgTiming) < 20) {
            analysis.strengths.push('Good timing');
        } else if (avgTiming > 30) {
            analysis.improvements.push('Brake slightly earlier');
        } else if (avgTiming < -30) {
            analysis.improvements.push('Delay brake application');
        }

        // Check accuracy
        const avgDeviation = this.calculateMean(this.deviations);
        if (avgDeviation < 10) {
            analysis.strengths.push('Excellent accuracy');
        } else if (avgDeviation > 20) {
            analysis.improvements.push('Focus on matching reference intensity');
        }

        return analysis;
    }
}
