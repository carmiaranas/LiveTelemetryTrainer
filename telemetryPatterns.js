/**
 * Telemetry Pattern Definitions
 * Collection of predefined training patterns with keyframe-based segments
 */

const TELEMETRY_PATTERNS = {
    'default': {
        name: "Race Track",
        duration: 30,
        description: "Mixed corners with trail braking zones - full racing experience",
        segments: [
            { timeRange: [0, 3], throttle: [0, 100], brake: [0, 0], label: 'Launch' },
            { timeRange: [3, 6], throttle: [100, 100], brake: [0, 0], label: 'Full Throttle Straight' },
            { timeRange: [6, 7.5], throttle: [100, 20], brake: [0, 0], label: 'Lift for Corner' },
            { timeRange: [6.5, 7.5], throttle: [20, 10], brake: [0, 85], label: 'Brake Entry' },
            { timeRange: [7.5, 9], throttle: [10, 10], brake: [85, 20], label: 'Trail Braking' },
            { timeRange: [9, 10], throttle: [10, 10], brake: [20, 0], label: 'Brake Release' },
            { timeRange: [10, 12], throttle: [10, 100], brake: [0, 0], label: 'Corner Exit' },
            { timeRange: [12, 16], throttle: [100, 100], brake: [0, 0], label: 'Long Straight' },
            { timeRange: [16, 17.5], throttle: [100, 0], brake: [0, 0], label: 'Lift' },
            { timeRange: [16.5, 17.5], throttle: [0, 0], brake: [0, 100], label: 'Hard Braking' },
            { timeRange: [17.5, 19], throttle: [0, 0], brake: [100, 70], label: 'Hold Pressure' },
            { timeRange: [19, 20], throttle: [0, 0], brake: [70, 0], label: 'Release' },
            { timeRange: [20, 23], throttle: [0, 100], brake: [0, 0], label: 'Acceleration' },
            { timeRange: [23, 26], throttle: [100, 100], brake: [0, 0], label: 'Final Straight' },
            { timeRange: [26, 27.5], throttle: [100, 30], brake: [0, 0], label: 'Lift' },
            { timeRange: [26.5, 27.5], throttle: [30, 30], brake: [0, 75], label: 'Last Corner Brake' },
            { timeRange: [27.5, 29], throttle: [30, 80], brake: [75, 0], label: 'Final Exit' },
            { timeRange: [29, 30], throttle: [80, 80], brake: [0, 0], label: 'Finish' }
        ]
    },

    'highway': {
        name: "Highway Cruise",
        duration: 30,
        description: "High-speed cruising with gentle speed changes and lane changes",
        segments: [
            { timeRange: [0, 5], throttle: [0, 100], brake: [0, 0], label: 'Merge onto Highway' },
            { timeRange: [5, 15], throttle: [100, 100], brake: [0, 0], label: 'Cruise Control' },
            { timeRange: [15, 17], throttle: [100, 85], brake: [0, 0], label: 'Gentle Slowdown' },
            { timeRange: [17, 22], throttle: [85, 100], brake: [0, 0], label: 'Resume Speed' },
            { timeRange: [22, 30], throttle: [100, 100], brake: [0, 0], label: 'Sustained Cruise' }
        ]
    },

    'city': {
        name: "City Traffic",
        duration: 30,
        description: "Stop-and-go traffic with frequent braking and low-speed cruising",
        segments: [
            { timeRange: [0, 3], throttle: [0, 50], brake: [0, 0], label: 'Start from Stop' },
            { timeRange: [3, 5], throttle: [50, 0], brake: [0, 80], label: 'Red Light Stop' },
            { timeRange: [5, 8], throttle: [0, 0], brake: [80, 0], label: 'Waiting at Light' },
            { timeRange: [8, 11], throttle: [0, 60], brake: [0, 0], label: 'Green Light Go' },
            { timeRange: [11, 13], throttle: [60, 0], brake: [0, 70], label: 'Traffic Stop' },
            { timeRange: [13, 16], throttle: [0, 0], brake: [70, 0], label: 'Stopped' },
            { timeRange: [16, 20], throttle: [0, 50], brake: [0, 0], label: 'Slow Cruise' },
            { timeRange: [20, 22], throttle: [50, 0], brake: [0, 60], label: 'Final Stop' },
            { timeRange: [22, 30], throttle: [0, 40], brake: [0, 0], label: 'Gentle Cruise' }
        ]
    },

    'trail-braking': {
        name: "Trail Braking Focus",
        duration: 30,
        description: "Repeated trail braking zones for mastering the technique",
        segments: [
            { timeRange: [0, 4], throttle: [0, 100], brake: [0, 0], label: 'Initial Acceleration' },
            // Zone 1
            { timeRange: [4, 5], throttle: [100, 15], brake: [0, 85], label: 'Entry 1' },
            { timeRange: [5, 7], throttle: [15, 15], brake: [85, 30], label: 'Trail Brake 1' },
            { timeRange: [7, 9], throttle: [15, 100], brake: [30, 0], label: 'Exit 1' },
            // Zone 2
            { timeRange: [9, 10], throttle: [100, 20], brake: [0, 80], label: 'Entry 2' },
            { timeRange: [10, 12], throttle: [20, 20], brake: [80, 25], label: 'Trail Brake 2' },
            { timeRange: [12, 14], throttle: [20, 100], brake: [25, 0], label: 'Exit 2' },
            // Zone 3
            { timeRange: [14, 15], throttle: [100, 15], brake: [0, 85], label: 'Entry 3' },
            { timeRange: [15, 17], throttle: [15, 15], brake: [85, 30], label: 'Trail Brake 3' },
            { timeRange: [17, 19], throttle: [15, 100], brake: [30, 0], label: 'Exit 3' },
            // Zone 4
            { timeRange: [19, 20], throttle: [100, 20], brake: [0, 80], label: 'Entry 4' },
            { timeRange: [20, 22], throttle: [20, 20], brake: [80, 25], label: 'Trail Brake 4' },
            { timeRange: [22, 24], throttle: [20, 100], brake: [25, 0], label: 'Exit 4' },
            { timeRange: [24, 30], throttle: [100, 100], brake: [0, 0], label: 'Final Straight' }
        ]
    },

    'acceleration': {
        name: "Throttle Control",
        duration: 30,
        description: "Pure throttle modulation practice - no braking, focus on smoothness",
        segments: [
            { timeRange: [0, 5], throttle: [0, 100], brake: [0, 0], label: 'Initial Ramp' },
            { timeRange: [5, 7], throttle: [100, 50], brake: [0, 0], label: 'Lift to 50%' },
            { timeRange: [7, 12], throttle: [50, 100], brake: [0, 0], label: 'Ramp to Full' },
            { timeRange: [12, 14], throttle: [100, 30], brake: [0, 0], label: 'Lift to 30%' },
            { timeRange: [14, 19], throttle: [30, 100], brake: [0, 0], label: 'Progressive Accel' },
            { timeRange: [19, 21], throttle: [100, 60], brake: [0, 0], label: 'Lift to 60%' },
            { timeRange: [21, 26], throttle: [60, 100], brake: [0, 0], label: 'Final Ramp' },
            { timeRange: [26, 30], throttle: [100, 100], brake: [0, 0], label: 'Sustained Full' }
        ]
    },

    'braking': {
        name: "Brake Control",
        duration: 30,
        description: "Pure braking modulation practice - focus on brake pressure control",
        segments: [
            { timeRange: [0, 3], throttle: [0, 100], brake: [0, 0], label: 'Build Speed' },
            { timeRange: [3, 5], throttle: [100, 0], brake: [0, 85], label: 'Brake Zone 1' },
            { timeRange: [5, 7], throttle: [0, 0], brake: [85, 0], label: 'Release 1' },
            { timeRange: [7, 10], throttle: [0, 100], brake: [0, 0], label: 'Accel 2' },
            { timeRange: [10, 12], throttle: [100, 0], brake: [0, 100], label: 'Heavy Brake' },
            { timeRange: [12, 14], throttle: [0, 0], brake: [100, 0], label: 'Release 2' },
            { timeRange: [14, 17], throttle: [0, 100], brake: [0, 0], label: 'Accel 3' },
            { timeRange: [17, 19], throttle: [100, 0], brake: [0, 70], label: 'Medium Brake' },
            { timeRange: [19, 21], throttle: [0, 0], brake: [70, 0], label: 'Release 3' },
            { timeRange: [21, 24], throttle: [0, 100], brake: [0, 0], label: 'Accel 4' },
            { timeRange: [24, 26], throttle: [100, 0], brake: [0, 90], label: 'Brake Zone 4' },
            { timeRange: [26, 28], throttle: [0, 0], brake: [90, 0], label: 'Release 4' },
            { timeRange: [28, 30], throttle: [0, 80], brake: [0, 0], label: 'Final Accel' }
        ]
    },

    'chicane': {
        name: "Chicane Practice",
        duration: 30,
        description: "Quick direction changes with overlapping throttle and brake",
        segments: [
            { timeRange: [0, 3], throttle: [0, 100], brake: [0, 0], label: 'Approach' },
            // Chicane 1
            { timeRange: [3, 4.5], throttle: [100, 60], brake: [0, 40], label: 'Left Flick' },
            { timeRange: [4.5, 6], throttle: [60, 60], brake: [40, 0], label: 'Balance' },
            { timeRange: [6, 7.5], throttle: [60, 100], brake: [0, 0], label: 'Exit 1' },
            // Chicane 2
            { timeRange: [7.5, 9], throttle: [100, 55], brake: [0, 45], label: 'Right Flick' },
            { timeRange: [9, 10.5], throttle: [55, 55], brake: [45, 0], label: 'Balance' },
            { timeRange: [10.5, 12], throttle: [55, 100], brake: [0, 0], label: 'Exit 2' },
            // Chicane 3
            { timeRange: [12, 13.5], throttle: [100, 60], brake: [0, 40], label: 'Left Flick' },
            { timeRange: [13.5, 15], throttle: [60, 60], brake: [40, 0], label: 'Balance' },
            { timeRange: [15, 16.5], throttle: [60, 100], brake: [0, 0], label: 'Exit 3' },
            // Chicane 4
            { timeRange: [16.5, 18], throttle: [100, 55], brake: [0, 45], label: 'Right Flick' },
            { timeRange: [18, 19.5], throttle: [55, 55], brake: [45, 0], label: 'Balance' },
            { timeRange: [19.5, 21], throttle: [55, 100], brake: [0, 0], label: 'Exit 4' },
            { timeRange: [21, 30], throttle: [100, 100], brake: [0, 0], label: 'Final Straight' }
        ]
    },

    'oval': {
        name: "Oval Racing",
        duration: 30,
        description: "Constant high-speed cornering with subtle lift-and-coast",
        segments: [
            { timeRange: [0, 3], throttle: [0, 100], brake: [0, 0], label: 'Acceleration' },
            // Turn 1
            { timeRange: [3, 5], throttle: [100, 95], brake: [0, 0], label: 'Turn 1 Lift' },
            // Backstretch
            { timeRange: [5, 10], throttle: [95, 100], brake: [0, 0], label: 'Backstretch' },
            // Turn 2
            { timeRange: [10, 12], throttle: [100, 95], brake: [0, 0], label: 'Turn 2 Lift' },
            // Frontstretch
            { timeRange: [12, 17], throttle: [95, 100], brake: [0, 0], label: 'Frontstretch' },
            // Turn 3
            { timeRange: [17, 19], throttle: [100, 95], brake: [0, 0], label: 'Turn 3 Lift' },
            // Backstretch
            { timeRange: [19, 24], throttle: [95, 100], brake: [0, 0], label: 'Backstretch 2' },
            // Turn 4
            { timeRange: [24, 26], throttle: [100, 95], brake: [0, 0], label: 'Turn 4 Lift' },
            // Final straight
            { timeRange: [26, 30], throttle: [95, 100], brake: [0, 0], label: 'Final Straight' }
        ]
    }
};

// Validation function
function validatePattern(pattern) {
    if (!pattern.name || !pattern.duration || !pattern.segments) {
        return { valid: false, error: 'Pattern must have name, duration, and segments' };
    }

    if (!Array.isArray(pattern.segments) || pattern.segments.length === 0) {
        return { valid: false, error: 'Segments must be a non-empty array' };
    }

    for (let i = 0; i < pattern.segments.length; i++) {
        const seg = pattern.segments[i];
        
        if (!seg.timeRange || !seg.throttle || !seg.brake) {
            return { valid: false, error: `Segment ${i}: Missing required fields` };
        }

        if (seg.timeRange[0] < 0 || seg.timeRange[1] > pattern.duration) {
            return { valid: false, error: `Segment ${i}: Time range out of bounds` };
        }

        if (seg.timeRange[0] >= seg.timeRange[1]) {
            return { valid: false, error: `Segment ${i}: Invalid time range` };
        }

        const checkValue = (val, name) => {
            if (val < 0 || val > 100) {
                return { valid: false, error: `Segment ${i}: ${name} value out of range (0-100)` };
            }
            return { valid: true };
        };

        const throttleCheck = checkValue(seg.throttle[0], 'Throttle start');
        if (!throttleCheck.valid) return throttleCheck;
        
        const throttleEndCheck = checkValue(seg.throttle[1], 'Throttle end');
        if (!throttleEndCheck.valid) return throttleEndCheck;
        
        const brakeCheck = checkValue(seg.brake[0], 'Brake start');
        if (!brakeCheck.valid) return brakeCheck;
        
        const brakeEndCheck = checkValue(seg.brake[1], 'Brake end');
        if (!brakeEndCheck.valid) return brakeEndCheck;
    }

    return { valid: true };
}
