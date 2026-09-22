# NVDA Add-on Specialist reference: Addon File Structure

Part of the `nvda-addon-specialist` skill. Read this only when the task reaches these sections.

## Addon File Structure

```text
myAddon/
  addon/
    globalPlugins/
    appModules/
    synthDrivers/
    brailleDisplayDrivers/
    doc/en/readme.md
    locale/en/LC_MESSAGES/
    installTasks.py
    uninstallTasks.py
    manifest.ini
  buildVars.py
  sconstruct
```

### manifest.ini

```ini
name = myAddon
summary = My Addon Display Name
description = What the addon does.
author = Your Name <email@example.com>
url = https://github.com/yourname/myAddon
version = 1.0.0
minimumNVDAVersion = 2025.1.0
lastTestedNVDAVersion = 2026.1.0
```

**Note:** The lowest allowed `minimumNVDAVersion` for Python 3 addons is `2019.3.0`. For addons shipping native 64-bit DLLs, use `2026.1.0` as the minimum.

---

## Common Patterns

### Dynamic Announcements

```python
import ui, braille
ui.message("Download complete")
braille.handler.message("Download complete")
```

### Timer-Based Monitoring

```python
import wx

class GlobalPlugin(globalPluginHandler.GlobalPlugin):
    def __init__(self):
        super().__init__()
        self._timer = wx.CallLater(1000, self._checkStatus)

    def _checkStatus(self):
        if self._should_keep_checking:
            self._timer.Restart()

    def terminate(self):
        if self._timer:
            self._timer.Stop()
```

### Configuration Persistence

```python
import config
confspec = {"myAddon": {"enabled": "boolean(default=True)"}}
config.conf.spec["myAddon"] = confspec["myAddon"]
enabled = config.conf["myAddon"]["enabled"]
```

### Anti-Patterns

- **Monkey-patching:** Use extension points or event handlers instead
- **Main thread blocking:** Use `threading.Thread` + `wx.CallAfter()` for background work
- **Bare except:** Use specific exceptions and log errors

---

## Detection Rules

Each rule ID, with severity and what it detects.

| Rule ID | Severity | What It Detects |
|---------|----------|-----------------|
| NVDA-001 | Critical | Missing `nextHandler()` call in event handler |
| NVDA-002 | Critical | Main thread blocking (sleep, sync I/O, blocking HTTP) |
| NVDA-003 | Serious | Missing `addonHandler.initTranslation()` |
| NVDA-004 | Serious | Missing `terminate()` cleanup |
| NVDA-005 | Serious | Incorrect manifest version format |
| NVDA-006 | Moderate | Monkey-patching core modules |
| NVDA-007 | Moderate | Script without `@script` decorator |
| NVDA-008 | Moderate | Missing script description |
| NVDA-009 | Moderate | Hardcoded gesture conflicts with NVDA core |
| NVDA-010 | Serious | UI updates from background thread without `wx.CallAfter()` |
| NVDA-011 | Moderate | Missing `check()` classmethod on drivers |
| NVDA-012 | Minor | Bare `except:` clause |
| NVDA-013 | Serious | Incompatible API version range |
| NVDA-014 | Minor | Missing SHA256 for store submission |
| NVDA-015 | Moderate | Not using `config.conf.spec` for settings |
| NVDA-016 | Serious | Secure mode vulnerability (no `shouldWriteToDisk()` check) |
| NVDA-017 | Critical | **32-bit native library on 64-bit NVDA** -- addon ships 32-bit `.dll` or uses 32-bit `ctypes` bindings incompatible with NVDA 2026.1+ (64-bit Python 3.13) |
| NVDA-018 | Serious | **`minimumNVDAVersion` below `2019.3.0`** -- Python 3 is required since NVDA 2019.3; earlier versions used Python 2 |

---
