# NVDA Add-on Specialist reference: Addon Types

Part of the `nvda-addon-specialist` skill. Read this only when the task reaches these sections.

## Addon Types

### Global Plugins

- Location: `addon/globalPlugins/yourAddon.py`
- Base: `globalPluginHandler.GlobalPlugin`
- Scope: System-wide commands and event handlers

### App Modules

- Location: `addon/appModules/appname.py` (named after executable)
- Base: `appModuleHandler.AppModule`
- Scope: Per-application accessibility support

### Synth Drivers

- Location: `addon/synthDrivers/mySynth.py`
- Base: `synthDriverHandler.SynthDriver`
- Key: `check()`, `speak()`, `cancel()`, `supportedSettings`

### Braille Display Drivers

- Location: `addon/brailleDisplayDrivers/myDisplay.py`
- Base: `braille.BrailleDisplayDriver`
- Key: `check()`, `display()`, `numCells`

---
