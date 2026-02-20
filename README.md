# Tuba Score Assistant

A MuseScore plugin that helps composers and arrangers keep **tuba** (and **euphonium**) parts readable by detecting out-of-range notes and automatically adding an octave-shifted equivalent.

## Features

- Simple UI to set:
  - highest allowed note
  - lowest allowed note
- Quick presets:
  - **Tuba (default)**
  - **Euphonium (default)**
- Smart analysis for:
  - range selections
  - selected elements
  - full score (when nothing is selected)
- For each out-of-range note, adds a new note at ±12 semitones (1 octave), avoiding duplicates in the same chord.

## How it works

The plugin checks each note against two MIDI thresholds:

- `lowPitchThreshold` (minimum note)
- `highPitchThreshold` (maximum note)

If a note is:

- **too low**: a note one octave higher is added
- **too high**: a note one octave lower is added

> Note: the plugin **adds** the corrected note to the chord; it does not automatically remove the original note.

## Installation

1. Open your MuseScore plugins folder (platform-dependent).
2. Create (or copy) a `TubaScoreAssistant` folder.
3. Place these files inside:
   - `plugin.json`
   - `main.qml`
   - `logic.js`
4. In MuseScore, open **Plugins > Plugin Manager** and enable **Tuba Score Assistant**.

## Usage

1. Open a score in MuseScore.
2. Select a specific passage (or the entire part).
3. Launch the plugin from **Plugins > Tuba Score Assistant**.
4. Set highest/lowest note thresholds or use a preset.
5. Click **Run**.

## Default values

### Tuba

- Highest note: `G#2 / Ab2`
- Lowest note: `D2`

### Euphonium

- Highest note: `E3`
- Lowest note: `E2`

## Requirements

- MuseScore with QML plugin support (plugin API `3.0`)
- An open score (`requiresScore: true`)

## Project structure

- `plugin.json` — plugin metadata
- `main.qml` — UI and main workflow
- `logic.js` — note analysis/transformation logic

## License

Add your project license here (for example MIT, GPL, etc.).
