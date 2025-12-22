# Full Focus Live Telemetry Trainer

A browser-based driver training application that teaches throttle and brake control through real-time telemetry visualization and feedback.

## What is This?

Full Focus Live Telemetry Trainer is a focused tool for learning smooth pedal control—the foundation of fast, consistent driving. You'll see a reference telemetry trace (gray line) scrolling across the screen, and your job is to match it with your throttle and brake inputs using your keyboard or racing pedals.

**This is not a racing game.** There's no car physics, no steering, no lap times. Just pure pedal control training.

## Quick Start

1. **Open the app**: Double-click `index.html` in any modern web browser (Chrome, Firefox, Edge)
2. **Choose your mode**:
   - **Beginner Mode**: Slower playback (0.7×), no throttle/brake overlap allowed, ±15% tolerance
   - **Advanced Mode**: Full speed (1.0×), trail braking allowed, ±8% tolerance
3. **Press "Start Training"**
4. **Use your controls**:
   - **Keyboard**: `W` for throttle, `S` for brake
   - **Pedals**: Most USB racing pedals and gamepads are auto-detected

## Controls

### Keyboard
- **W** - Throttle (press and hold, releases smoothly)
- **S** - Brake (press and hold, releases smoothly)

The keyboard simulates realistic analog pedal behavior with smooth ramp-up and decay.

### Racing Pedals
- Connect any USB racing pedals or gamepad before starting
- The app auto-detects most common devices
- Pedal inputs are smoothed for realistic feel

## Training Modes

### Beginner Mode
Perfect for learning the basics:
- **No overlap**: Brake automatically locks throttle when you brake more than 10%
- **Slower speed**: 0.7× playback gives you more time to react
- **Generous tolerance**: ±15% deviation is acceptable
- **Focus**: Learn smooth brake application and release

### Advanced Mode
For experienced drivers:
- **Trail braking allowed**: Overlap throttle and brake for realistic techniques
- **Full speed**: 1.0× playback speed
- **Tight tolerance**: ±8% deviation required
- **Focus**: Brake ramp rate, smoothness, and precision timing

## Understanding the Graph

The scrolling graph shows two channels:
- **Throttle** and **Brake** (0-100%)
- **Gray lines**: Reference trace (what you should match)
- **Colored lines**: Your inputs
  - **Green**: Good (within 50% of tolerance)
  - **Yellow/Orange**: OK (within tolerance)
  - **Red**: Poor (outside tolerance)

The graph scrolls right-to-left, showing the last 5 seconds of data.

## Scoring

Your performance is measured in real-time:

- **Mean Deviation**: Average difference from reference (lower is better)
- **Timing Offset**: Are you early or late? (milliseconds)
- **Smoothness**: How gradual are your input changes? (0-100%, higher is better)
- **Accuracy Grade**: Overall rating (A+ to F)

After each session, you'll see a summary with your final scores and grade.

## Tips for Success

1. **Focus on smoothness**: Jerky inputs hurt your score more than slight timing errors
2. **Watch the reference**: Try to predict when braking zones are coming
3. **Release is key**: Smooth brake release is harder than application—practice this
4. **Use your ears**: Get a rhythm going, like playing a musical instrument
5. **Trail braking (Advanced)**: Gradually release brake while applying throttle through corners

## Reference Telemetry

The included reference trace features:
- 30 seconds of realistic driving patterns
- 3 different corner types with varied braking zones
- Smooth transitions and trail braking sections
- Typical racing throttle application patterns

The reference is designed to teach you:
- Heavy braking (100% brake pressure)
- Trail braking (gradual brake release)
- Progressive throttle application
- Lift-and-coast sections

## Technical Details

- **Update rate**: 60 FPS
- **Input sampling**: 60 Hz with smoothing and deadzone
- **Graph resolution**: 60 Hz telemetry data
- **Browser requirements**: Modern browser with HTML5 Canvas support
- **No installation needed**: Pure HTML/CSS/JavaScript

## Troubleshooting

**Pedals not detected?**
- Ensure pedals are connected before opening the browser
- Try refreshing the page after connecting
- Check browser console (F12) for gamepad messages

**Graph not smooth?**
- Close other browser tabs consuming resources
- Reduce browser zoom to 100%
- Try a different browser (Chrome recommended)

**Inputs feel wrong?**
- Keyboard inputs ramp smoothly by design (not instant)
- Check that you're using W/S keys, not arrow keys
- Pedal sensitivity can vary by hardware

## Files

- `index.html` - Main application page
- `styles.css` - Visual styling
- `app.js` - Main application logic and coordination
- `telemetryData.js` - Reference telemetry generation
- `inputHandler.js` - Keyboard and pedal input processing
- `graphRenderer.js` - Canvas-based graph rendering
- `scoring.js` - Performance metrics and grading

## Browser Support

Tested and working on:
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

## License

This is an educational training tool. Use freely for personal driver development.

## Credits

Developed as a focused driver training tool to isolate and improve pedal control skills.

---

**Remember**: Smoothness beats speed. Master the basics in Beginner Mode before advancing. Real racing starts with perfect pedal control! 🏁
