# Pattern Editor Guide

## Overview
The Pattern Editor allows you to create, edit, and manage custom telemetry training patterns. Access it through the Admin Panel's "Pattern Editor" section.

## Features

### 1. Pattern Selection
- **Dropdown Menu**: Choose from 9 predefined patterns:
  - **Race Track**: Mixed corners with trail braking zones
  - **Highway Cruise**: High-speed cruising with gentle speed changes
  - **City Traffic**: Stop-and-go traffic with frequent braking
  - **Trail Braking Focus**: Repeated trail braking zones
  - **Throttle Control**: Pure throttle modulation practice
  - **Brake Control**: Pure braking modulation practice
  - **Chicane Practice**: Quick direction changes
  - **Oval Racing**: Constant high-speed cornering
  
### 2. JSON Editor
- **Live Preview**: See the pattern definition in JSON format
- **Syntax Highlighting**: Monospace font for easy editing
- **Real-time Editing**: Modify pattern parameters directly in the editor

### 3. Pattern Management

#### Load Pattern
Click "Load Pattern" to apply the selected predefined pattern to the training session.

#### Save Custom
After editing the JSON, click "Save Custom" to load your custom pattern into the trainer.

#### Export JSON
Download the current pattern as a JSON file for backup or sharing.

#### Import JSON
Load a pattern from a JSON file stored on your computer.

#### Validate
Check if your JSON pattern is valid before loading it.

## Pattern Structure

### Basic Format
```json
{
  "name": "Pattern Name",
  "duration": 30,
  "description": "Pattern description",
  "segments": [
    {
      "timeRange": [0, 3],
      "throttle": [0, 100],
      "brake": [0, 0],
      "label": "Launch"
    }
  ]
}
```

### Field Descriptions

#### Pattern Properties
- **name** (string): Display name for the pattern
- **duration** (number): Total length in seconds
- **description** (string): Brief description of the pattern
- **segments** (array): Array of segment objects

#### Segment Properties
Each segment defines a time-based keyframe:

- **timeRange** (array): `[startTime, endTime]` in seconds
  - Must be within pattern duration
  - No gaps between segments recommended
  
- **throttle** (array): `[startValue, endValue]` in percentage (0-100)
  - Smoothly interpolates between values
  - 0 = no throttle, 100 = full throttle
  
- **brake** (array): `[startValue, endValue]` in percentage (0-100)
  - Smoothly interpolates between values
  - 0 = no brake, 100 = full brake
  
- **label** (string): Description of this segment (for reference)

## Creating Custom Patterns

### Step-by-Step Guide

1. **Select a Base Pattern**
   - Choose a pattern similar to what you want to create
   - The JSON will populate in the editor

2. **Edit Pattern Metadata**
   ```json
   {
     "name": "My Custom Track",
     "duration": 25,
     "description": "Custom training pattern for skill X"
   }
   ```

3. **Define Segments**
   - Add segments sequentially
   - Each segment describes one phase of the pattern
   
   Example - Simple acceleration:
   ```json
   "segments": [
     {
       "timeRange": [0, 5],
       "throttle": [0, 100],
       "brake": [0, 0],
       "label": "Smooth acceleration"
     },
     {
       "timeRange": [5, 10],
       "throttle": [100, 100],
       "brake": [0, 0],
       "label": "Hold full throttle"
     }
   ]
   ```

4. **Validate Your Pattern**
   - Click "Validate" to check for errors
   - Fix any validation errors shown

5. **Load and Test**
   - Click "Save Custom" to load the pattern
   - Run a training session to test
   - Refine as needed

## Pattern Design Tips

### Overlapping Segments
Segments can overlap in time to create simultaneous throttle and brake inputs:

```json
{
  "timeRange": [10, 12],
  "throttle": [50, 30],
  "brake": [0, 0],
  "label": "Lift throttle"
},
{
  "timeRange": [11, 12],
  "throttle": [30, 10],
  "brake": [0, 60],
  "label": "Begin braking"
}
```

### Smooth Transitions
Use overlapping time ranges for smoother transitions between different phases.

### Trail Braking Pattern
```json
{
  "timeRange": [5, 6],
  "throttle": [100, 15],
  "brake": [0, 85],
  "label": "Initial brake"
},
{
  "timeRange": [6, 8],
  "throttle": [15, 15],
  "brake": [85, 30],
  "label": "Trail brake through corner"
}
```

### Testing Patterns
1. Start with shorter durations (15-20s) for easier testing
2. Test each segment individually before combining
3. Use Beginner Mode with slower playback for initial testing
4. Gradually increase difficulty by tightening tolerances

## Common Patterns

### Launch Control
```json
{
  "timeRange": [0, 3],
  "throttle": [0, 100],
  "brake": [0, 0],
  "label": "Progressive launch"
}
```

### Hard Braking Zone
```json
{
  "timeRange": [10, 11.5],
  "throttle": [100, 0],
  "brake": [0, 100],
  "label": "Emergency stop"
}
```

### Chicane Flick
```json
{
  "timeRange": [5, 6.5],
  "throttle": [100, 55],
  "brake": [0, 45],
  "label": "Quick weight transfer"
}
```

## Validation Rules

The pattern validator checks:

1. **Required Fields**: name, duration, segments array
2. **Time Ranges**: 
   - Must be within pattern duration
   - Start time < end time
3. **Value Ranges**:
   - Throttle: 0-100
   - Brake: 0-100
4. **Segment Coverage**: At least one segment defined

## Troubleshooting

### "JSON parsing error"
- Check for missing commas, brackets, or quotes
- Use a JSON validator online to find syntax errors

### "Time range out of bounds"
- Ensure all segment times are ≤ pattern duration
- Check that startTime < endTime for each segment

### "Pattern not loading"
- Verify validation passes (green checkmark)
- Make sure training is stopped before loading
- Check browser console for detailed errors

### "Segment overlaps causing issues"
- Overlaps are intentional for smooth transitions
- Reduce overlap duration if values are conflicting

## Sharing Patterns

### Export for Sharing
1. Load your pattern
2. Click "Export JSON"
3. Share the downloaded .json file

### Import Shared Pattern
1. Save the .json file to your computer
2. Click "Import JSON"
3. Select the file
4. Click "Validate" then "Save Custom"

## Best Practices

1. **Name Clearly**: Use descriptive names that indicate the pattern's purpose
2. **Document Segments**: Use meaningful labels for each segment
3. **Test Incrementally**: Build patterns step-by-step, testing as you go
4. **Start Simple**: Begin with fewer segments, add complexity gradually
5. **Backup Often**: Export patterns you want to keep
6. **Version Control**: Include version numbers in pattern names (v1, v2, etc.)

## Technical Details

### Interpolation
Values between keyframes use **ease-in-out** interpolation:
- Smooth acceleration at start
- Smooth deceleration at end
- Natural feeling transitions

### Sample Rate
- Patterns are sampled at 60 Hz (60 samples per second)
- Smooth rendering on canvas at 60 FPS

### File Format
- Standard JSON format
- UTF-8 encoding
- Human-readable structure

## Example: Custom Circuit Pattern

```json
{
  "name": "My Racing Circuit v1",
  "duration": 20,
  "description": "Custom circuit with 3 corners and straightaways",
  "segments": [
    {
      "timeRange": [0, 2],
      "throttle": [0, 100],
      "brake": [0, 0],
      "label": "Launch"
    },
    {
      "timeRange": [2, 5],
      "throttle": [100, 100],
      "brake": [0, 0],
      "label": "Straight 1"
    },
    {
      "timeRange": [5, 6],
      "throttle": [100, 20],
      "brake": [0, 75],
      "label": "Corner 1 Entry"
    },
    {
      "timeRange": [6, 8],
      "throttle": [20, 100],
      "brake": [75, 0],
      "label": "Corner 1 Exit"
    },
    {
      "timeRange": [8, 12],
      "throttle": [100, 100],
      "brake": [0, 0],
      "label": "Straight 2"
    },
    {
      "timeRange": [12, 13.5],
      "throttle": [100, 15],
      "brake": [0, 90],
      "label": "Corner 2 Entry"
    },
    {
      "timeRange": [13.5, 15],
      "throttle": [15, 100],
      "brake": [90, 0],
      "label": "Corner 2 Exit"
    },
    {
      "timeRange": [15, 20],
      "throttle": [100, 100],
      "brake": [0, 0],
      "label": "Final Straight"
    }
  ]
}
```

## Support

For issues or questions:
1. Check validation messages for specific errors
2. Review this guide for pattern structure rules
3. Test with predefined patterns first
4. Start with simple custom patterns before complex ones

Happy pattern creating! 🏁
