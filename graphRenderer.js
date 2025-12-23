/**
 * Graph Renderer
 * Renders scrolling telemetry graph at 60 FPS
 */

class GraphRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Graph configuration
        this.config = {
            scrollSpeed: 100,      // pixels per second
            timeWindow: 10,        // seconds visible (increased from 5)
            pastWindow: 3,         // seconds of past data
            futureWindow: 7,       // seconds of future data
            updateRate: 60,        // FPS
            padding: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 50
            }
        };

        // Data buffers
        this.playerHistory = [];
        this.maxHistoryLength = 300; // 5 seconds at 60 Hz

        // Channel visibility
        this.channelVisibility = {
            throttle: true,
            brake: true
        };

        // Colors
        this.colors = {
            background: '#1a1a2e',
            grid: '#2a2a3e',
            referenceThrottle: '#00dd66',  // Green for throttle
            referenceBrake: '#ff5566',     // Red for brake
            referenceInactive: '#444444',  // Gray when not active
            playerGood: '#00ff88',
            playerOk: '#ffaa00',
            playerBad: '#ff3344',
            text: '#ffffff',
            axis: '#666666',
            throttleZone: 'rgba(0, 221, 102, 0.08)',  // Light green background
            brakeZone: 'rgba(255, 85, 102, 0.08)'     // Light red background
        };

        this.setupCanvas();
        this.scrollOffset = 0;
    }

    /**
     * Setup canvas with proper sizing
     */
    setupCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        // Set display size
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        
        // Set actual size in memory (scaled for retina displays)
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        // Scale context to match
        this.ctx.scale(dpr, dpr);
        
        // Store logical dimensions
        this.width = rect.width;
        this.height = rect.height;

        // Calculate graph area
        this.graphArea = {
            x: this.config.padding.left,
            y: this.config.padding.top,
            width: this.width - this.config.padding.left - this.config.padding.right,
            height: this.height - this.config.padding.top - this.config.padding.bottom
        };
    }

    /**
     * Add player data point to history
     */
    addDataPoint(time, throttle, brake, reference, deviation) {
        this.playerHistory.push({
            time,
            throttle,
            brake,
            refThrottle: reference.throttle,
            refBrake: reference.brake,
            deviation
        });

        // Limit history length
        if (this.playerHistory.length > this.maxHistoryLength) {
            this.playerHistory.shift();
        }
    }

    /**
     * Clear all player history
     */
    clearHistory() {
        this.playerHistory = [];
        this.scrollOffset = 0;
    }

    /**
     * Render the complete graph
     */
    render(currentTime, referenceData, trainingMode) {
        // Clear canvas
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Calculate visible time range - show past and future
        const timeStart = Math.max(0, currentTime - this.config.pastWindow);
        const timeEnd = Math.min(referenceData[referenceData.length - 1].time, 
                                  currentTime + this.config.futureWindow);

        // Draw background zones first
        this.drawBackgroundZones(referenceData, timeStart, timeEnd);

        // Draw grid
        this.drawGrid();

        // Draw axes
        this.drawAxes();

        // Draw current time indicator (vertical line showing "now")
        this.drawCurrentTimeIndicator(currentTime, timeStart, timeEnd);

        // Draw reference traces with different opacity for past/future (only if channel visible)
        if (this.channelVisibility.throttle) {
            this.drawReferenceLine(referenceData, timeStart, timeEnd, 'throttle', currentTime);
        }
        if (this.channelVisibility.brake) {
            this.drawReferenceLine(referenceData, timeStart, timeEnd, 'brake', currentTime);
        }

        // Draw player traces (only if channel visible)
        if (this.channelVisibility.throttle) {
            this.drawPlayerLine(timeStart, timeEnd, 'throttle', trainingMode);
        }
        if (this.channelVisibility.brake) {
            this.drawPlayerLine(timeStart, timeEnd, 'brake', trainingMode);
        }

        // Draw current value indicators (only if channel visible)
        if (this.playerHistory.length > 0) {
            const latest = this.playerHistory[this.playerHistory.length - 1];
            if (this.channelVisibility.throttle) {
                this.drawCurrentIndicator(latest.throttle, this.colors.playerGood, 'T');
            }
            if (this.channelVisibility.brake) {
                this.drawCurrentIndicator(latest.brake, this.colors.playerBad, 'B');
            }
        }
    }

    /**
     * Draw background zones for throttle/brake guidance
     */
    drawBackgroundZones(referenceData, timeStart, timeEnd) {
        const threshold = 20; // Consider throttle/brake active if > 20%
        
        for (let t = timeStart; t <= timeEnd; t += 0.1) {
            const refIndex = Math.floor(t * 60);
            if (refIndex >= 0 && refIndex < referenceData.length) {
                const ref = referenceData[refIndex];
                const x1 = this.timeToX(t, timeStart, timeEnd);
                const x2 = this.timeToX(t + 0.1, timeStart, timeEnd);
                
                // Draw brake zone (brake takes priority) - only if brake channel is visible
                if (this.channelVisibility.brake && ref.brake > threshold) {
                    this.ctx.fillStyle = this.colors.brakeZone;
                    this.ctx.fillRect(
                        x1,
                        this.graphArea.y,
                        x2 - x1,
                        this.graphArea.height
                    );
                }
                // Draw throttle zone - only if throttle channel is visible
                else if (this.channelVisibility.throttle && ref.throttle > threshold) {
                    this.ctx.fillStyle = this.colors.throttleZone;
                    this.ctx.fillRect(
                        x1,
                        this.graphArea.y,
                        x2 - x1,
                        this.graphArea.height
                    );
                }
            }
        }
    }

    /**
     * Draw grid lines
     */
    drawGrid() {
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 1;

        // Horizontal lines (percentage markers)
        const percentSteps = [25, 50, 75];
        percentSteps.forEach(percent => {
            const y = this.percentToY(percent);
            this.ctx.beginPath();
            this.ctx.moveTo(this.graphArea.x, y);
            this.ctx.lineTo(this.graphArea.x + this.graphArea.width, y);
            this.ctx.stroke();
        });

        // Vertical lines (time markers)
        const timeSteps = 5;
        for (let i = 1; i < timeSteps; i++) {
            const x = this.graphArea.x + (this.graphArea.width / timeSteps) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.graphArea.y);
            this.ctx.lineTo(x, this.graphArea.y + this.graphArea.height);
            this.ctx.stroke();
        }
    }

    /**
     * Draw axes and labels
     */
    drawAxes() {
        this.ctx.strokeStyle = this.colors.axis;
        this.ctx.lineWidth = 2;

        // Left axis
        this.ctx.beginPath();
        this.ctx.moveTo(this.graphArea.x, this.graphArea.y);
        this.ctx.lineTo(this.graphArea.x, this.graphArea.y + this.graphArea.height);
        this.ctx.stroke();

        // Bottom axis
        this.ctx.beginPath();
        this.ctx.moveTo(this.graphArea.x, this.graphArea.y + this.graphArea.height);
        this.ctx.lineTo(this.graphArea.x + this.graphArea.width, this.graphArea.y + this.graphArea.height);
        this.ctx.stroke();

        // Y-axis labels
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';

        [0, 25, 50, 75, 100].forEach(percent => {
            const y = this.percentToY(percent);
            this.ctx.fillText(percent + '%', this.graphArea.x - 5, y);
        });
    }

    /**
     * Draw current time indicator (vertical line showing "now")
     */
    drawCurrentTimeIndicator(currentTime, timeStart, timeEnd) {
        const x = this.timeToX(currentTime, timeStart, timeEnd);
        
        // Draw vertical line
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([]);
        this.ctx.beginPath();
        this.ctx.moveTo(x, this.graphArea.y);
        this.ctx.lineTo(x, this.graphArea.y + this.graphArea.height);
        this.ctx.stroke();

        // Add label at top
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'bottom';
        this.ctx.fillText('NOW', x, this.graphArea.y - 5);
    }

    /**
     * Draw reference data line with color coding
     */
    drawReferenceLine(referenceData, timeStart, timeEnd, channel, currentTime) {
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.setLineDash([8, 4]); // Dotted line: 8px dash, 4px gap
        
        const threshold = 15; // Consider active if > 15%
        
        for (let i = 0; i < referenceData.length - 1; i++) {
            const t1 = referenceData[i].time;
            const t2 = referenceData[i + 1].time;
            
            // Skip if outside visible range
            if (t2 < timeStart) continue;
            if (t1 > timeEnd) break;
            
            const value1 = referenceData[i][channel];
            const value2 = referenceData[i + 1][channel];
            
            const x1 = this.timeToX(t1, timeStart, timeEnd);
            const y1 = this.percentToY(value1);
            const x2 = this.timeToX(t2, timeStart, timeEnd);
            const y2 = this.percentToY(value2);
            
            // Determine color based on channel and value
            let color;
            if (channel === 'throttle') {
                color = value1 > threshold ? this.colors.referenceThrottle : this.colors.referenceInactive;
            } else { // brake
                color = value1 > threshold ? this.colors.referenceBrake : this.colors.referenceInactive;
            }
            
            // Set opacity based on whether this is in the future
            const isFuture = t1 > currentTime;
            this.ctx.globalAlpha = isFuture ? 0.5 : 0.8;
            
            this.ctx.strokeStyle = color;
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        }

        this.ctx.setLineDash([]); // Reset to solid line
        this.ctx.globalAlpha = 1.0;
    }

    /**
     * Draw player input line with color coding
     */
    drawPlayerLine(timeStart, timeEnd, channel, trainingMode) {
        if (this.playerHistory.length < 2) return;

        // Get tolerance based on mode
        const tolerance = trainingMode === 'beginner' ? 15 : 8;

        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        // Draw segments with appropriate colors
        for (let i = 1; i < this.playerHistory.length; i++) {
            const prevPoint = this.playerHistory[i - 1];
            const currPoint = this.playerHistory[i];

            // Skip if outside visible range
            if (currPoint.time < timeStart) continue;
            if (prevPoint.time > timeEnd) break;

            const x1 = this.timeToX(prevPoint.time, timeStart, timeEnd);
            const y1 = this.percentToY(prevPoint[channel]);
            const x2 = this.timeToX(currPoint.time, timeStart, timeEnd);
            const y2 = this.percentToY(currPoint[channel]);

            // Determine color based on deviation
            const refValue = channel === 'throttle' ? currPoint.refThrottle : currPoint.refBrake;
            const playerValue = currPoint[channel];
            const diff = Math.abs(playerValue - refValue);

            let color;
            if (diff <= tolerance * 0.5) {
                color = this.colors.playerGood;
            } else if (diff <= tolerance) {
                color = this.colors.playerOk;
            } else {
                color = this.colors.playerBad;
            }

            this.ctx.strokeStyle = color;
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        }
    }

    /**
     * Draw current value indicator on right side
     */
    drawCurrentIndicator(value, color, label) {
        const y = this.percentToY(value);
        const x = this.graphArea.x + this.graphArea.width;

        // Draw line
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + 15, y);
        this.ctx.stroke();

        // Draw label
        this.ctx.fillStyle = color;
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(label, x + 18, y);
    }

    /**
     * Convert percentage to Y coordinate
     */
    percentToY(percent) {
        const normalized = percent / 100;
        return this.graphArea.y + this.graphArea.height - (normalized * this.graphArea.height);
    }

    /**
     * Convert time to X coordinate
     */
    timeToX(time, timeStart, timeEnd) {
        const normalized = (time - timeStart) / (timeEnd - timeStart);
        return this.graphArea.x + (normalized * this.graphArea.width);
    }

    /**
     * Handle window resize
     */
    handleResize() {
        this.setupCanvas();
    }

    /**
     * Set channel visibility
     */
    setChannelVisibility(throttle, brake) {
        this.channelVisibility.throttle = throttle;
        this.channelVisibility.brake = brake;
    }
}
