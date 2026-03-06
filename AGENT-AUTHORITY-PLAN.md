# Agent Authority, Currency & NVDA Addon Specialist Plan

> **Status:** Planning document -- local only, not for publication
> **Created:** 2026-03-03
> **Author:** Jeff / GitHub Copilot planning session
> **Scope:** Community-Access/accessibility-agents repository

---

## Table of Contents

1. [Part 1: Mandatory Source Citation Policy](#part-1-mandatory-source-citation-policy)
2. [Part 2: Continuous Authority -- Internet Crawling & Currency Technique](#part-2-continuous-authority----internet-crawling--currency-technique)
3. [Part 3: NVDA Addon Development Specialist Agent](#part-3-nvda-addon-development-specialist-agent)

---

## Part 1: Mandatory Source Citation Policy

### Problem Statement

Users have reported that agent outputs feel "AI-generated and therefore not trusted." There is no mechanism to verify whether a recommendation comes from an actual standard, specification, or official documentation. This undermines the credibility of all 57 agents in the accessibility-agents ecosystem.

### Solution Architecture

#### 1.1 Shared Citation Policy File

Create `.github/agents/CITATION_POLICY.md` referenced by all agents.

**Authority Hierarchy** (highest to lowest):

| Tier | Source Type | Examples |
|------|-----------|----------|
| 1 -- Normative Specs | W3C normative specifications | [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/), [HTML Living Standard](https://html.spec.whatwg.org/) |
| 2 -- Informative Guidance | W3C informative/understanding docs | [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/), [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/) |
| 3 -- Platform Vendor Docs | Official vendor documentation | [MDN Web Docs](https://developer.mozilla.org/), [Microsoft Learn](https://learn.microsoft.com/), [Apple Developer](https://developer.apple.com/accessibility/), [wxWidgets Docs](https://docs.wxwidgets.org/), [wxPython Docs](https://docs.wxpython.org/) |
| 4 -- AT Vendor Docs | Screen reader vendor documentation | [NV Access (NVDA)](https://www.nvaccess.org/files/nvda/documentation/userGuide.html), [Freedom Scientific (JAWS)](https://support.freedomscientific.com/), [Apple VoiceOver](https://support.apple.com/guide/voiceover/) |
| 5 -- Peer-Reviewed / Established | Community references, research | [Deque University](https://dequeuniversity.com/), [WebAIM](https://webaim.org/), [The Paciello Group](https://www.tpgi.com/), [Adrian Roselli's Blog](https://adrianroselli.com/) |
| 6 -- Government/Legal | Compliance standards | [Section508.gov](https://www.section508.gov/), [Access Board ICT](https://www.access-board.gov/ict/), [EN 301 549](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/) |

**Core Rules:**

1. **"No source, no claim" rule** -- If the agent cannot link to an authoritative source for a factual assertion, it must explicitly state: "This recommendation is based on practical accessibility testing experience and is not codified in a published standard."
2. **Inline citation format** -- `[WCAG 2.2 SC 1.4.3](https://www.w3.org/TR/WCAG22/#contrast-minimum)` within the response body.
3. **Sources section** -- Every substantive response ends with a `## Sources` section listing all cited references with full URLs.
4. **Recency preference** -- Prefer current specs (WCAG 2.2 over 2.1, ARIA 1.2 over 1.1, NVDA 2025.x over 2023.x docs).
5. **Conflict resolution** -- When sources disagree, cite both and note the conflict. Normative specs outrank all others.

#### 1.2 Per-Agent Source Registry

Each agent gets a `## Authoritative Sources` section listing its domain-specific primary URLs. This ensures agents cite the correct authoritative source for their domain rather than generic web results.

| Agent Domain | Primary Sources |
|---|---|
| WCAG / General Web | w3.org/TR/WCAG22/, w3.org/WAI/WCAG22/Understanding/, w3.org/WAI/ARIA/apg/ |
| ARIA Patterns | w3.org/WAI/ARIA/apg/patterns/, w3.org/TR/wai-aria-1.2/ |
| Color Contrast | w3.org/TR/WCAG22/#contrast-minimum, w3.org/TR/WCAG22/#contrast-enhanced |
| wxPython | docs.wxpython.org, docs.wxwidgets.org, wiki.wxpython.org |
| Desktop A11y | learn.microsoft.com/windows/win32/winauto/, developer.apple.com/accessibility/ |
| NVDA Addons | nvaccess.org docs, github.com/nvaccess/nvda (source), github.com/nvdaaddons/DevGuide |
| Screen Readers | nvaccess.org, support.freedomscientific.com, support.apple.com/guide/voiceover/ |
| PDF/UA | pdfa.org, iso.org 14289-1/2 |
| Mobile | developer.apple.com/accessibility/, developer.android.com/guide/topics/ui/accessibility/ |
| Section 508 | section508.gov, access-board.gov/ict/ |
| Markdown | github.github.com/gfm/, commonmark.org |
| Document A11y | support.microsoft.com/accessibility, adobe.com/accessibility |

#### 1.3 Behavioral Rule (Added to Every Agent)

```markdown
**Every factual claim, recommendation, or detection rule MUST include an inline link
to the authoritative source.** When multiple sources apply, cite the most authoritative
per the citation hierarchy in CITATION_POLICY.md. End substantive responses with a
`## Sources` section listing all cited references. If no authoritative source exists
for a claim, explicitly state: "This recommendation is based on practical accessibility
testing experience and is not codified in a published standard."
```

#### 1.4 Output Format Template

```markdown
Use `aria-live="polite"` for status updates that do not require immediate attention
([ARIA 1.2: aria-live](https://www.w3.org/TR/wai-aria-1.2/#aria-live)).
Pair it with `aria-atomic="true"` when the entire region should be re-announced
([APG: Live Region Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alert/)).

## Sources

- [WAI-ARIA 1.2 Specification](https://www.w3.org/TR/wai-aria-1.2/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WCAG 2.2 Success Criterion 4.1.3: Status Messages](https://www.w3.org/TR/WCAG22/#status-messages)
```

#### 1.5 Rollout Steps

1. Create `.github/agents/CITATION_POLICY.md`
2. Update all Copilot agents (`.github/agents/*.agent.md`) -- add `## Authoritative Sources` + behavioral rule
3. Update all Claude Code agents (`.claude/agents/*.md`) -- same content adapted to format
4. Update all Gemini skills (`.gemini/extensions/a11y-agents/skills/*/SKILL.md`) -- same
5. Update docs pages (`docs/agents/*.md`) -- reference citation policy
6. Update `README.md` -- add "Source Citation Policy" section
7. Update `.github/agents/AGENTS.md` -- note policy as cross-cutting standard

**Scale:** Approximately 57 agents across 3 platforms = ~170 file updates + shared policy file + docs.

---

## Part 2: Continuous Authority -- Internet Crawling & Currency Technique

### Problem Statement

Standards evolve. WCAG versions change. Screen reader behavior updates with each release. An agent written today with hardcoded knowledge will become stale. We need a mechanism to keep agents current with authoritative sources without requiring manual updates to every agent file.

### Proposed Technique: Source Fingerprint Registry + MCP-Powered Live Fetch

#### 2.1 Source Fingerprint Registry

Create a machine-readable registry file (`.github/agents/SOURCE_REGISTRY.json`) that maps each authoritative URL to:

```json
{
  "sources": [
    {
      "id": "wcag-2.2",
      "url": "https://www.w3.org/TR/WCAG22/",
      "type": "normative-spec",
      "lastVerified": "2026-03-01",
      "sha256": "abc123...",
      "version": "2.2",
      "supersedes": "wcag-2.1",
      "agents": ["web-accessibility-wizard", "contrast-master", "aria-specialist"],
      "checkFrequency": "monthly"
    },
    {
      "id": "nvda-user-guide",
      "url": "https://www.nvaccess.org/files/nvda/documentation/userGuide.html",
      "type": "at-vendor-docs",
      "lastVerified": "2026-03-01",
      "sha256": "def456...",
      "version": "2025.1",
      "agents": ["desktop-a11y-specialist", "nvda-addon-specialist"],
      "checkFrequency": "monthly"
    }
  ]
}
```

#### 2.2 GitHub Actions Currency Check Workflow

A scheduled GitHub Actions workflow that:

1. **Runs weekly/monthly** (configurable per source via `checkFrequency`)
2. **Fetches each URL** in the source registry
3. **Computes SHA256** of the fetched content
4. **Compares** against the stored hash
5. **If changed:**
   - Opens a GitHub Issue titled "Source Update Detected: {source.id}"
   - Labels it `source-update`, `agent-review-needed`
   - Tags the agents that reference this source
   - Includes a diff summary of what changed (for text-based sources)
6. **If the URL returns 404/5xx:**
   - Opens an issue titled "Source Unavailable: {source.id}"
   - Labels it `source-broken`, `urgent`

**Workflow file:** `.github/workflows/source-currency-check.yml`

```yaml
name: Source Currency Check
on:
  schedule:
    - cron: '0 6 * * 1'  # Weekly Monday 6 AM UTC
  workflow_dispatch: {}

jobs:
  check-sources:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check source fingerprints
        run: python .github/scripts/check_source_currency.py
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Python script:** `.github/scripts/check_source_currency.py`

The script:
- Reads `SOURCE_REGISTRY.json`
- For each source due for checking (based on `lastVerified` + `checkFrequency`):
  - HTTP GET the URL
  - SHA256 the response body
  - Compare to stored hash
  - If different: create issue via GitHub API
  - Update `lastVerified` timestamp

#### 2.3 MCP-Powered Live Fetch at Response Time

For agents running in environments with MCP servers (Copilot Chat, Claude Code), leverage MCP tools to fetch live documentation at response time:

1. **context7 MCP server** -- Already available for library documentation lookup. Agents can call `mcp_context7_resolve-library-id` and `mcp_context7_get-library-docs` to get current API docs.
2. **fetch_webpage tool** -- For fetching specific authoritative pages during a response.
3. **Agent instruction addition:**

```markdown
## Staying Current

When providing recommendations based on specifications or documentation that may have
been updated since your training data, use available MCP tools to verify:

1. Use `context7` to fetch current library documentation for framework-specific advice.
2. Use `fetch_webpage` to verify specific WCAG/ARIA specification content when the user
   asks about edge cases or recent changes.
3. Always note the version of the specification you are citing.
4. If you cannot verify currency, state: "This is based on [spec version X]. Check
   [URL] for the latest version."
```

#### 2.4 Pre-Submission Review Gate

Before any agent update is merged, require:

1. **All cited URLs are live** (automated link check in CI)
2. **All cited spec versions are current** (compare against SOURCE_REGISTRY.json)
3. **New detection rules cite their authoritative basis** (PR template checkbox)
4. **Source registry entry exists** for any newly cited source

**PR template addition:**

```markdown
## Source Citation Checklist

- [ ] All factual claims include inline citations to authoritative sources
- [ ] All cited URLs are verified as live and current
- [ ] New sources are added to SOURCE_REGISTRY.json
- [ ] Spec versions cited are the latest available
```

#### 2.5 Annual Deep Review Cadence

Once per year (or when major spec versions ship):

1. Review all agents against current specs
2. Update VERSION numbers in SOURCE_REGISTRY.json
3. Regenerate SHA256 fingerprints
4. File issues for any agents with stale content
5. Publish a "Currency Report" summarizing the review

---

## Part 3: NVDA Addon Development Specialist Agent

### Overview

A comprehensive AI agent that assists developers in building, debugging, testing, packaging, and publishing NVDA addons. This agent lives in the **Development Team** alongside `desktop-a11y-specialist`, `wxpython-specialist`, and `a11y-tool-builder`. It has deep knowledge of NVDA's internal architecture gleaned directly from the official source code.

### Agent Metadata

```yaml
name: NVDA Addon Development Specialist
description: >
  Expert in NVDA screen reader addon development -- architecture, APIs, plugin types
  (globalPlugins, appModules, synthDrivers, brailleDisplayDrivers), manifest format,
  event/script handling, NVDAObject overlays, tree interceptors, addon packaging,
  Add-on Store submission, testing with NVDA, braille table and speech dictionary
  authoring, and internationalization. Grounded in the official NVDA source code
  (github.com/nvaccess/nvda) and community development guides.
argument-hint: >
  e.g. 'scaffold a globalPlugin', 'debug this appModule', 'submit to the Add-on Store',
  'create a synthDriver', 'add braille table support'
tools: ['read', 'search', 'edit', 'runInTerminal', 'createFile', 'listDirectory']
model: ['Claude Sonnet 4.5 (copilot)', 'GPT-5 (copilot)']
```

### Handoffs

| Label | Target Agent | When |
|-------|-------------|------|
| wxPython UI | wxpython-specialist | Addon has GUI components using wxPython |
| Desktop A11y Testing | desktop-a11y-testing-coach | Need to verify addon behavior with screen readers |
| Build A11y Tools | a11y-tool-builder | Building automated accessibility scanning into addons |
| Back to Developer Hub | developer-hub | Task complete, broader coordination needed |

---

### 3.1 NVDA Architecture Deep Dive

This section constitutes the agent's core knowledge base, drawn directly from the official NVDA source code at [github.com/nvaccess/nvda](https://github.com/nvaccess/nvda).

#### 3.1.1 NVDA's Component Architecture

NVDA is primarily written in Python with performance-critical in-process injection code in C++. The architecture is modular, event-driven, and extensible through a plugin system.

**Source:** [projectDocs/design/technicalDesignOverview.md](https://github.com/nvaccess/nvda/blob/master/projectDocs/design/technicalDesignOverview.md)

**Core components:**

| Component | Location | Purpose |
|-----------|----------|---------|
| Launcher | `nvda.pyw` | Entry point, starts NVDA |
| Core | `core.py` | Main loop, pumps API/input handlers, registered generators, main queue |
| Event Handler | `eventHandler.py` | Routes accessibility events to the correct handler chain |
| Script Handler | [`scriptHandler.py`](https://github.com/nvaccess/nvda/blob/master/source/scriptHandler.py) | Routes input gestures to scripts, handles repeat counting |
| Input Handlers | `keyboardHandler.py`, `mouseHandler.py`, `touchHandler.py` | Convert raw input to InputGesture objects |
| API Handlers | `IAccessibleHandler.py`, `JABHandler.py`, `UIAHandler/` | Interface with platform accessibility APIs |
| Output: Speech | `speech/` | Speech synthesis pipeline |
| Output: Braille | `braille/` | Braille display output pipeline |
| Addon Handler | [`addonHandler/`](https://github.com/nvaccess/nvda/tree/master/source/addonHandler) | Addon loading, state management, version checking |
| Global Plugin Handler | [`globalPluginHandler.py`](https://github.com/nvaccess/nvda/blob/master/source/globalPluginHandler.py) | Discovers, loads, initializes global plugins |
| App Module Handler | [`appModuleHandler.py`](https://github.com/nvaccess/nvda/blob/master/source/appModuleHandler.py) | Discovers, loads, caches per-application modules |
| Base Object | [`baseObject.py`](https://github.com/nvaccess/nvda/blob/master/source/baseObject.py) | `AutoPropertyObject`, `ScriptableObject` base classes |
| NVDAObjects | `NVDAObjects/` | Abstract widget representations |
| Configuration | `config/` | ConfigObj-based settings, profile management |
| GUI | `gui/` | wxPython-based NVDA settings/preferences UI |

#### 3.1.2 The Main Loop

```
core.main() -> while running:
    1. Pump API handlers (IAccessible, UIA, JAB events)
    2. Pump input handlers (keyboard, mouse, touch, braille)
    3. Pump registered generators (sayAll, speak spelling)
    4. Pump main queue (events, scripts queued by handlers)
    5. Sleep until more work arrives
```

**Source:** [core.py](https://github.com/nvaccess/nvda/blob/master/source/core.py)

#### 3.1.3 Event Chain

When an accessibility API fires an event, it flows through this chain. Each handler can consume the event (stop propagation) or call `nextHandler()` to pass it along:

```
API Handler (IAccessible/UIA/JAB)
  -> eventHandler.executeEvent()
    -> Global Plugin 1 .event_*()
    -> Global Plugin 2 .event_*()
    -> ... (all global plugins)
    -> App Module .event_*()
    -> Tree Interceptor .event_*()
    -> NVDAObject .event_*()
```

**Source:** [eventHandler.py](https://github.com/nvaccess/nvda/blob/master/source/eventHandler.py), [technicalDesignOverview.md](https://github.com/nvaccess/nvda/blob/master/projectDocs/design/technicalDesignOverview.md)

#### 3.1.4 Script Chain (Input Gesture Resolution)

When the user presses a key or performs a gesture, `findScript()` in `scriptHandler.py` searches for a matching script in this order:

```
1. gesture.scriptableObject (gesture-specific)
2. Global Plugins (all running, in order)
3. App Module (for the focused app)
4. Braille Display Driver
5. Vision Enhancement Providers
6. Tree Interceptor (with passThrough filtering)
7. Focused NVDAObject
8. Focus Ancestors (if script.canPropagate=True)
9. globalCommands.configProfileActivationCommands
10. globalCommands.commands
```

**Source:** [`scriptHandler.py` _yieldObjectsForFindScript()](https://github.com/nvaccess/nvda/blob/master/source/scriptHandler.py)

#### 3.1.5 The @script Decorator

The modern way to define and bind scripts:

```python
from scriptHandler import script

class GlobalPlugin(globalPluginHandler.GlobalPlugin):

    @script(
        description=_("Announces the current time"),
        category="My Addon",
        gesture="kb:NVDA+shift+t",
        speakOnDemand=True,
    )
    def script_announceTime(self, gesture):
        import ui
        import time
        ui.message(time.strftime("%H:%M:%S"))
```

**Decorator parameters:**
- `description`: Translatable string shown in Input Gestures dialog
- `category`: Grouping in Input Gestures dialog
- `gesture`: Single gesture binding (e.g., `"kb:NVDA+shift+t"`)
- `gestures`: List of gestures (e.g., `["kb:NVDA+shift+t", "br(freedomScientific):routing"]`)
- `canPropagate`: If True, script works even when an ancestor object has focus
- `bypassInputHelp`: If True, runs even in Input Help mode
- `allowInSleepMode`: If True, runs even when NVDA sleeps for the current app
- `resumeSayAllMode`: Specifies which SayAll mode to resume after script execution
- `speakOnDemand`: If True, speaks even when speech mode is "on-demand"

**Source:** [`scriptHandler.py` script() function](https://github.com/nvaccess/nvda/blob/master/source/scriptHandler.py)

---

### 3.2 Addon Types

NVDA supports four addon types, each serving a different purpose:

#### 3.2.1 Global Plugins

**Purpose:** Add global features available everywhere in the OS -- new commands, modified behavior for all apps, new UI toolkit support.

**Location in addon:** `addon/globalPlugins/yourAddonName.py` or `addon/globalPlugins/yourAddonName/__init__.py`

**Base class:** `globalPluginHandler.GlobalPlugin` (inherits from `baseObject.ScriptableObject`)

**Source:** [`globalPluginHandler.py`](https://github.com/nvaccess/nvda/blob/master/source/globalPluginHandler.py)

**Capabilities:**
- Bind scripts (keyboard commands) that work in any application
- Receive events for all NVDAObjects in the OS via `event_*` methods
- Override NVDAObject overlay classes via `chooseNVDAObjectOverlayClasses()`
- Has `terminate()` for cleanup when NVDA exits or the plugin is reloaded

**Template:**

```python
# addon/globalPlugins/myAddon.py
import globalPluginHandler
from scriptHandler import script
import ui

class GlobalPlugin(globalPluginHandler.GlobalPlugin):
    """Global plugin description."""

    @script(
        description=_("Description of what this script does"),
        category="My Addon",
        gesture="kb:NVDA+shift+m",
    )
    def script_myCommand(self, gesture):
        ui.message("Hello from my addon!")

    def event_gainFocus(self, obj, nextHandler):
        # Called when any object gains focus
        # MUST call nextHandler() to allow other handlers to process
        nextHandler()

    def chooseNVDAObjectOverlayClasses(self, obj, clsList):
        # Add custom NVDAObject overlay classes
        if obj.windowClassName == "MyCustomControl":
            clsList.insert(0, MyCustomControlOverlay)

    def terminate(self):
        # Cleanup on exit
        pass
```

#### 3.2.2 App Modules

**Purpose:** Provide accessibility support specific to one application.

**Location in addon:** `addon/appModules/appname.py` (named after the executable, e.g., `firefox.py`, `winword.py`)

**Base class:** `appModuleHandler.AppModule` (inherits from `baseObject.ScriptableObject`)

**Source:** [`appModuleHandler.py`](https://github.com/nvaccess/nvda/blob/master/source/appModuleHandler.py)

**Capabilities:**
- Scripts that only work when the named application has focus
- Events for objects within that application only
- `event_appModule_gainFocus` / `event_appModule_loseFocus` for app switching
- `sleepMode = True` to silence NVDA for self-voicing apps
- Custom NVDAObject overlay classes scoped to the application
- For executables with dots/special chars: use `appModules.EXECUTABLE_NAMES_TO_APP_MODS` mapping

**Template:**

```python
# addon/appModules/myapp.py
import appModuleHandler
from scriptHandler import script
from NVDAObjects.IAccessible import IAccessible
import ui

class AppModule(appModuleHandler.AppModule):
    """Support for MyApp."""

    @script(
        description=_("Announce current status"),
        gesture="kb:NVDA+shift+s",
    )
    def script_announceStatus(self, gesture):
        # App-specific status query
        ui.message("Status info")

    def chooseNVDAObjectOverlayClasses(self, obj, clsList):
        if obj.role == 8 and obj.windowClassName == "CustomList":
            clsList.insert(0, EnhancedListItem)

    def event_NVDAObject_init(self, obj):
        # Modify objects as they are created
        if obj.windowClassName == "UnlabeledButton":
            obj.name = "Close"

class EnhancedListItem(IAccessible):
    """Custom overlay for list items in MyApp."""

    def _get_name(self):
        # Enhanced name calculation
        return f"Item: {super().name}"
```

**Hosting executables:** Some executables (like `javaw.exe`) host multiple applications. The module-level function `getAppNameFromHost(processId)` allows returning a specific app name:

```python
# addon/appModules/javaw.py
def getAppNameFromHost(processId):
    """Return the actual app name for this Java process."""
    # Inspect window title, class, etc. to determine the actual app
    raise LookupError  # Fall back to javaw if unknown
```

**Source:** [`appModuleHandler.py` _getPossibleAppModuleNamesForExecutable()](https://github.com/nvaccess/nvda/blob/master/source/appModuleHandler.py)

#### 3.2.3 Synth Drivers (Speech Synthesizer Drivers)

**Purpose:** Add support for new speech synthesizers.

**Location in addon:** `addon/synthDrivers/mySynth.py`

**Base class:** `synthDriverHandler.SynthDriver`

**Key methods to implement:**
- `name`: Internal identifier string
- `description`: User-visible name
- `check()`: Class method -- returns True if the synth is available
- `supportedSettings`: Tuple of `SynthSetting` objects (rate, pitch, volume, voice, etc.)
- `speak(speechSequence)`: Receives a sequence of speech commands
- `cancel()`: Stop speaking immediately
- `pause(switch)`: Pause/resume speech
- `_get_voice` / `_set_voice`: Current voice
- `_get_availableVoices`: Dict of available voices

**Template:**

```python
# addon/synthDrivers/mySynth.py
from synthDriverHandler import SynthDriver, SynthSetting
from speech.commands import IndexCommand

class SynthDriver(SynthDriver):
    name = "mySynth"
    description = _("My Custom Synthesizer")

    supportedSettings = (
        SynthDriver.VoiceSetting(),
        SynthDriver.RateSetting(),
        SynthSetting("volume", _("Volume")),
    )

    @classmethod
    def check(cls):
        # Return True if the synth engine is available
        return _is_engine_installed()

    def __init__(self):
        super().__init__()
        # Initialize the synth engine

    def speak(self, speechSequence):
        for item in speechSequence:
            if isinstance(item, str):
                # Speak the text
                pass
            elif isinstance(item, IndexCommand):
                # Handle index markers for synchronization
                pass

    def cancel(self):
        # Stop all speech
        pass

    def terminate(self):
        # Cleanup
        pass
```

**Source:** [`synthDriverHandler.py`](https://github.com/nvaccess/nvda/blob/master/source/synthDriverHandler.py)

#### 3.2.4 Braille Display Drivers

**Purpose:** Add support for new braille displays.

**Location in addon:** `addon/brailleDisplayDrivers/myDisplay.py`

**Base class:** `braille.BrailleDisplayDriver`

**Key methods to implement:**
- `name`: Internal identifier
- `description`: User-visible name
- `check()`: Returns True if the display is available
- `numCells`: Number of braille cells
- `display(cells)`: Show dots on the display
- `getManualPorts()` / `getPossiblePorts()`: Available connection ports

**Source:** [`braille/`](https://github.com/nvaccess/nvda/tree/master/source/braille)

---

### 3.3 NVDAObject System

The NVDAObject is NVDA's abstract representation of a UI widget. All objects inherit from `NVDAObjects.NVDAObject` which inherits from `baseObject.ScriptableObject` via `baseObject.AutoPropertyObject`.

**Source:** [`NVDAObjects/__init__.py`](https://github.com/nvaccess/nvda/tree/master/source/NVDAObjects)

#### Object Hierarchy

```
NVDAObject (base)
  -> NVDAObjects.IAccessible.IAccessible (MSAA/IA2 objects)
  -> NVDAObjects.UIA.UIA (UI Automation objects)
  -> NVDAObjects.JAB.JAB (Java Access Bridge objects)
  -> NVDAObjects.window.Window (raw Win32 window objects)
```

#### Key Properties (auto-properties via `_get_` pattern)

| Property | Type | Description |
|----------|------|-------------|
| `name` | str | Accessible name (what the screen reader announces) |
| `role` | int | Control role (from `controlTypes.Role`) |
| `states` | set | Current states (from `controlTypes.State`) |
| `value` | str | Current value |
| `description` | str | Additional description |
| `keyboardShortcut` | str | Keyboard shortcut |
| `parent` | NVDAObject | Parent in the accessibility tree |
| `next` / `previous` | NVDAObject | Siblings |
| `firstChild` | NVDAObject | First child |
| `children` | list | All children |
| `windowHandle` | int | Win32 HWND |
| `windowClassName` | str | Win32 window class name |
| `processID` | int | OS process ID |
| `appModule` | AppModule | The app module for this object's process |
| `treeInterceptor` | TreeInterceptor | Active tree interceptor (e.g., browse mode document) |
| `TextInfo` | class | The TextInfo class for this object's text content |

#### Overlay Classes

Overlay classes let you customize behavior for specific controls:

```python
class MyListItemOverlay(NVDAObjects.IAccessible.IAccessible):
    """Custom behavior for list items in a specific app."""

    def _get_name(self):
        # Customize the name
        rawName = super().name
        return f"Enhanced: {rawName}"

    def event_stateChange(self):
        # React to state changes
        pass

    @script(
        description=_("Custom action for this control"),
        gesture="kb:enter",
    )
    def script_customAction(self, gesture):
        pass
```

**Source:** [technicalDesignOverview.md -- NVDA Objects](https://github.com/nvaccess/nvda/blob/master/projectDocs/design/technicalDesignOverview.md)

---

### 3.4 TextInfo System

For working with editable text controls (text editors, word processors, terminals):

**Base class:** `textInfos.TextInfo`

**Key concepts:**
- A TextInfo represents a **range** of text (can be collapsed to a point)
- Created via `nvdaObject.makeTextInfo(position)`
- Positions: `textInfos.POSITION_CARET`, `POSITION_SELECTION`, `POSITION_FIRST`, `POSITION_LAST`, `POSITION_ALL`
- Units: `textInfos.UNIT_CHARACTER`, `UNIT_WORD`, `UNIT_LINE`, `UNIT_PARAGRAPH`, `UNIT_STORY`

**Key methods:**
- `move(unit, direction)`: Move the range
- `expand(unit)`: Expand range to encompass the specified unit
- `text`: Property returning the text in the range
- `getTextWithFields()`: Returns text with formatting information
- `compareEndPoints(other, which)`: Compare positions
- `setEndPoint(other, which)`: Set start/end to match another TextInfo

**Source:** [`textInfos/__init__.py`](https://github.com/nvaccess/nvda/blob/master/source/textInfos/__init__.py)

---

### 3.5 Tree Interceptors and Browse Mode

Tree interceptors intercept events and scripts for an entire hierarchy of NVDAObjects. The primary use is browse mode for web documents.

**Base:** `treeInterceptorHandler.TreeInterceptor`
**Browse mode:** `browseMode.BrowseModeTreeInterceptor`
**Virtual buffers:** `virtualBuffers.VirtualBuffer` (uses in-process C++ code for performance)

Key concepts:
- Created when `treeInterceptorClass` property is set on an NVDAObject
- Has `passThrough` mode (focus mode) vs browse mode
- Provides single-letter navigation (h for headings, k for links, etc.)
- In-process code collects document content for virtual buffers

**Source:** [technicalDesignOverview.md -- Tree Interceptors](https://github.com/nvaccess/nvda/blob/master/projectDocs/design/technicalDesignOverview.md)

---

### 3.6 Addon File Structure

Based on the official [NVDA Community Addon Template](https://github.com/nvdaaddons/AddonTemplate):

```
myAddon/
  addon/
    globalPlugins/          # Global plugin modules
      myAddon.py           # (or myAddon/__init__.py for packages)
    appModules/             # App-specific modules
      specificApp.py
    synthDrivers/           # Speech synthesizer drivers
      mySynth.py
    brailleDisplayDrivers/  # Braille display drivers
      myDisplay.py
    doc/                    # User documentation
      en/
        readme.md
    locale/                 # Translations
      en/
        LC_MESSAGES/
          nvda.po
      es/
        LC_MESSAGES/
          nvda.po
    installTasks.py         # Runs on install (onInstall function)
    uninstallTasks.py       # Runs on uninstall (onUninstall function)
    manifest.ini            # Addon metadata (REQUIRED)
  buildVars.py              # Build configuration
  sconstruct               # SCons build script
  .github/
    workflows/
      build.yml            # CI to build .nvda-addon
  readme.md                 # Developer documentation
  LICENSE
```

**Source:** [nvdaaddons/AddonTemplate](https://github.com/nvdaaddons/AddonTemplate)

#### manifest.ini Format

```ini
name = myAddon
summary = My Addon Display Name
description = A longer description of what the addon does.
author = Your Name <email@example.com>
url = https://github.com/yourname/myAddon
version = 1.0.0
minimumNVDAVersion = 2024.1.0
lastTestedNVDAVersion = 2025.1.0
```

**Source:** [addonHandler/__init__.py](https://github.com/nvaccess/nvda/blob/master/source/addonHandler/__init__.py), [AddonTemplate buildVars.py](https://github.com/nvdaaddons/AddonTemplate/blob/master/buildVars.py)

#### installTasks.py / uninstallTasks.py

```python
# addon/installTasks.py
def onInstall():
    """Called when the addon is installed.
    Use for data migration, config updates, etc.
    """
    pass

# addon/uninstallTasks.py
def onUninstall():
    """Called when the addon is uninstalled.
    Use for cleanup of persistent data.
    """
    pass
```

---

### 3.7 Building and Packaging

#### Using SCons (Official Template Method)

```bash
# Install dependencies
pip install scons markdown

# Build the .nvda-addon package
scons

# Build with a specific version
scons version=1.2.3

# Clean build artifacts
scons -c
```

The SCons build system:
1. Reads `buildVars.py` for metadata
2. Generates `manifest.ini` from build variables
3. Compiles `.po` files to `.mo` for translations
4. Converts `readme.md` to `readme.html`
5. Packages everything into a `.nvda-addon` ZIP file

**Source:** [AddonTemplate sconstruct](https://github.com/nvdaaddons/AddonTemplate/blob/master/sconstruct)

#### GitHub Actions CI

```yaml
name: Build NVDA Addon
on: [push, pull_request]

jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install scons markdown
      - run: scons
      - uses: actions/upload-artifact@v4
        with:
          name: nvda-addon
          path: '*.nvda-addon'
```

---

### 3.8 Add-on Store Submission Process

The NVDA Add-on Store is managed through [nvaccess/addon-datastore](https://github.com/nvaccess/addon-datastore).

**Source:** [Submission Guide](https://github.com/nvaccess/addon-datastore/blob/master/docs/submitters/submissionGuide.md), [Design Overview](https://github.com/nvaccess/addon-datastore/blob/master/docs/design/designOverview.md)

#### Submission Steps

1. Host your `.nvda-addon` file at a **permanent URL** (GitHub Releases recommended)
2. Go to [addon-datastore Issues -> New Issue -> "Add-on registration"](https://github.com/nvaccess/addon-datastore/issues/new/choose)
3. Fill out the issue form with addon metadata
4. A pull request is automatically generated with a JSON metadata file
5. Automated checks run:
   - [CodeQL security scanning](https://docs.github.com/en/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning-with-codeql) for Python vulnerabilities
   - [VirusTotal scanning](https://www.virustotal.com/) for malicious content
   - [addon-datastore-validation](https://github.com/nvaccess/addon-datastore-validation) for metadata correctness
6. First-time submitters need manual approval from NV Access
7. If checks pass, the PR auto-merges and the addon appears in the store

#### JSON Metadata Schema

Each addon version submission creates a JSON file with these fields:

| Field | Required | Description | Source |
|-------|----------|-------------|--------|
| `addonId` | Yes | Addon identifier (camelCase) | [jsonMetadata.md](https://github.com/nvaccess/addon-datastore/blob/master/docs/submitters/jsonMetadata.md) |
| `channel` | Yes | `"stable"`, `"beta"`, or `"dev"` | [jsonMetadata.md](https://github.com/nvaccess/addon-datastore/blob/master/docs/submitters/jsonMetadata.md) |
| `addonVersionNumber` | Yes | `{major, minor, patch}` object | [jsonMetadata.md](https://github.com/nvaccess/addon-datastore/blob/master/docs/submitters/jsonMetadata.md) |
| `displayName` | Yes | User-visible name (matches manifest summary) | [jsonMetadata.md](https://github.com/nvaccess/addon-datastore/blob/master/docs/submitters/jsonMetadata.md) |
| `publisher` | Yes | Author/org name | [jsonMetadata.md](https://github.com/nvaccess/addon-datastore/blob/master/docs/submitters/jsonMetadata.md) |
| `description` | Yes | English description | [jsonMetadata.md](https://github.com/nvaccess/addon-datastore/blob/master/docs/submitters/jsonMetadata.md) |
| `minNVDAVersion` | Yes | `{major, minor, patch}` | [jsonMetadata.md](https://github.com/nvaccess/addon-datastore/blob/master/docs/submitters/jsonMetadata.md) |
| `lastTestedVersion` | Yes | `{major, minor, patch}` | [jsonMetadata.md](https://github.com/nvaccess/addon-datastore/blob/master/docs/submitters/jsonMetadata.md) |
| `URL` | Yes | Direct download URL for `.nvda-addon` | [jsonMetadata.md](https://github.com/nvaccess/addon-datastore/blob/master/docs/submitters/jsonMetadata.md) |
| `sha256` | Yes | SHA256 hash of the `.nvda-addon` file | [jsonMetadata.md](https://github.com/nvaccess/addon-datastore/blob/master/docs/submitters/jsonMetadata.md) |
| `sourceURL` | Yes | Source code repository URL | [jsonMetadata.md](https://github.com/nvaccess/addon-datastore/blob/master/docs/submitters/jsonMetadata.md) |
| `license` | Yes | License short name (e.g., "GPL v2") | [jsonMetadata.md](https://github.com/nvaccess/addon-datastore/blob/master/docs/submitters/jsonMetadata.md) |
| `homepage` | No | Addon website | [jsonMetadata.md](https://github.com/nvaccess/addon-datastore/blob/master/docs/submitters/jsonMetadata.md) |
| `licenseURL` | No | Full license URL | [jsonMetadata.md](https://github.com/nvaccess/addon-datastore/blob/master/docs/submitters/jsonMetadata.md) |

#### Store API Endpoints

| Endpoint | Purpose | Source |
|----------|---------|--------|
| `https://addonStore.nvaccess.org/{lang}/{channel}/{apiVersion}.json` | Get addons for specific NVDA version | [designOverview.md](https://github.com/nvaccess/addon-datastore/blob/master/docs/design/designOverview.md) |
| `https://addonStore.nvaccess.org/{lang}/{channel}/latest.json` | Get latest addons for any NVDA version | [designOverview.md](https://github.com/nvaccess/addon-datastore/blob/master/docs/design/designOverview.md) |
| `https://addonStore.nvaccess.org/cacheHash.json` | Cache-breaking hash | [designOverview.md](https://github.com/nvaccess/addon-datastore/blob/master/docs/design/designOverview.md) |

---

### 3.9 Testing NVDA Addons

#### Running from Source

```bash
# Clone NVDA
git clone https://github.com/nvaccess/nvda.git
cd nvda
git submodule update --init

# Build dependencies (requires Visual Studio Build Tools)
scons source

# Run NVDA from source
runnvda.bat

# Point to your addon's scratchpad directory
# NVDA Settings -> Advanced -> Enable developer scratchpad
# Place addon files in %APPDATA%\nvda\scratchpad\
```

**Source:** [projectDocs/dev/](https://github.com/nvaccess/nvda/tree/master/projectDocs/dev)

#### Developer Scratchpad

The scratchpad allows testing addons without packaging:

1. NVDA Settings -> Advanced -> check "Enable developer scratchpad directory"
2. Copy your `globalPlugins/` or `appModules/` folders to `%APPDATA%\nvda\scratchpad\`
3. NVDA+Control+F3 to reload plugins

#### Logging

```python
from logHandler import log

log.debug("Debug message - only in log at debug level")
log.info("Info message")
log.warning("Warning message")
log.error("Error message")
log.exception("Error with traceback")  # Use inside except blocks
```

View logs: NVDA menu -> Tools -> View log, or `%TEMP%\nvda.log`

**Source:** [technicalDesignOverview.md -- Logging](https://github.com/nvaccess/nvda/blob/master/projectDocs/design/technicalDesignOverview.md)

#### Unit Testing

NVDA supports unit tests using `unittest`:

```python
# tests/test_myAddon.py
import unittest

class TestMyAddon(unittest.TestCase):
    def test_feature(self):
        # Test addon logic
        self.assertEqual(expected, actual)
```

**Automated testing docs:** [projectDocs/testing/automated.md](https://github.com/nvaccess/nvda/blob/master/projectDocs/testing/automated.md)

---

### 3.10 Extension Points

NVDA provides extension points for addons to hook into without monkey-patching:

```python
import extensionPoints

# Action - notify when something happens
myAction = extensionPoints.Action()
# Register handler
myAction.register(handler_function)
# Trigger
myAction.notify(arg1=value1)

# Filter - allow modification of a value
myFilter = extensionPoints.Filter()
myFilter.register(filter_function)
result = myFilter.apply(initial_value)

# AccumulatingDecider - collect True/False votes
myDecider = extensionPoints.AccumulatingDecider(defaultDecision=False)
myDecider.register(handler)
decision = myDecider.decide(arg1=value1)  # True if any handler returned True
```

**Built-in extension points:**
- `addonHandler.isCLIParamKnown` - Let addons handle custom command-line args
- `appModuleHandler.post_appSwitch` - Notified when the foreground app changes
- Various speech/braille extension points

**Source:** [`extensionPoints/__init__.py`](https://github.com/nvaccess/nvda/blob/master/source/extensionPoints/__init__.py)

---

### 3.11 Internationalization (i18n)

NVDA uses GNU gettext for translations:

```python
# Mark strings for translation
import addonHandler
addonHandler.initTranslation()

# Now use _() for translatable strings
message = _("Hello, this is a translatable string")
```

Translation workflow:
1. Mark all user-facing strings with `_()`
2. Run `scons pot` to generate `.pot` template
3. Translators create `.po` files in `addon/locale/{lang}/LC_MESSAGES/`
4. Build compiles `.po` to `.mo`
5. Register addon for community translation via [nvaccess/mrconfig](https://github.com/nvaccess/mrconfig)
6. Crowdin integration available via [nvdaaddons/CrowdinRegistration](https://github.com/nvdaaddons/CrowdinRegistration)

**Source:** [Submission Guide - Translations](https://github.com/nvaccess/addon-datastore/blob/master/docs/submitters/submissionGuide.md)

---

### 3.12 Secure Mode Considerations

NVDA's secure mode (active on Windows lock screen, UAC prompts, etc.) restricts addon behavior:

- Addons do not run in secure mode by default
- `script(allowInSleepMode=True)` does NOT bypass secure mode
- Logging is disabled in secure mode (password security)
- For testing on secure screens, use the `serviceDebug` system-wide parameter

**Source:** [technicalDesignOverview.md -- Logging in secure mode](https://github.com/nvaccess/nvda/blob/master/projectDocs/design/technicalDesignOverview.md)

---

### 3.13 Common Patterns and Anti-Patterns

#### Pattern: Announcing Dynamic Content

```python
import ui
import braille

# Speech announcement
ui.message("Download complete")

# Braille flash (shown briefly, then returns to normal)
braille.handler.message("Download complete")

# Both speech and braille
ui.message("Download complete")
braille.handler.message("Download complete")
```

#### Pattern: Timer-Based Monitoring

```python
import wx
import gui

class GlobalPlugin(globalPluginHandler.GlobalPlugin):
    def __init__(self):
        super().__init__()
        self._timer = wx.CallLater(1000, self._checkStatus)

    def _checkStatus(self):
        # Do periodic check
        if self._should_keep_checking:
            self._timer.Restart()

    def terminate(self):
        if self._timer:
            self._timer.Stop()
```

#### Pattern: Configuration Persistence

```python
import config

# Define config spec
confspec = {
    "myAddon": {
        "feature_enabled": "boolean(default=True)",
        "threshold": "integer(default=50, min=0, max=100)",
    }
}

# Register config
config.conf.spec["myAddon"] = confspec["myAddon"]

# Read config
enabled = config.conf["myAddon"]["feature_enabled"]

# Write config
config.conf["myAddon"]["threshold"] = 75
```

#### Pattern: Settings Dialog

```python
import gui
from gui.settingsDialogs import SettingsPanel

class MyAddonSettingsPanel(SettingsPanel):
    title = _("My Addon")

    def makeSettings(self, settingsSizer):
        sHelper = gui.guiHelper.BoxSizerHelper(self, sizer=settingsSizer)
        self.enabledCheckBox = sHelper.addItem(
            wx.CheckBox(self, label=_("Enable feature"))
        )
        self.enabledCheckBox.SetValue(
            config.conf["myAddon"]["feature_enabled"]
        )

    def onSave(self):
        config.conf["myAddon"]["feature_enabled"] = self.enabledCheckBox.GetValue()

# Register in GlobalPlugin.__init__:
gui.settingsDialogs.NVDASettingsDialog.categoryClasses.append(MyAddonSettingsPanel)

# Unregister in terminate:
gui.settingsDialogs.NVDASettingsDialog.categoryClasses.remove(MyAddonSettingsPanel)
```

#### Anti-Pattern: Monkey-Patching Core Modules

```python
# BAD - fragile, breaks with NVDA updates, confusing for other addons
import speech
_original_speak = speech.speak
def _patched_speak(*args, **kwargs):
    # Modify speech
    _original_speak(*args, **kwargs)
speech.speak = _patched_speak

# GOOD - use extension points or event handlers instead
class GlobalPlugin(globalPluginHandler.GlobalPlugin):
    def event_typedCharacter(self, obj, nextHandler, ch):
        # Intercept via the event system
        nextHandler()
```

#### Anti-Pattern: Blocking the Main Thread

```python
# BAD - blocks NVDA entirely
import time
time.sleep(5)  # NVDA freezes for 5 seconds

# BAD - blocking HTTP request
import urllib.request
response = urllib.request.urlopen("https://example.com")  # Blocks

# GOOD - use wx.CallLater or threading
import threading

def _fetch_data():
    # Do the slow work in a thread
    result = fetch_from_api()
    # Return to main thread for UI updates
    wx.CallAfter(ui.message, f"Result: {result}")

threading.Thread(target=_fetch_data, daemon=True).start()
```

---

### 3.14 Detection Rules for NVDA Addon Code Review

| Rule ID | Severity | What It Detects |
|---------|----------|----------------|
| NVDA-001 | Critical | **Missing `nextHandler()` call** -- Event handler (e.g., `event_gainFocus`) does not call `nextHandler()`, blocking all downstream event processing. ([technicalDesignOverview.md - Events](https://github.com/nvaccess/nvda/blob/master/projectDocs/design/technicalDesignOverview.md)) |
| NVDA-002 | Critical | **Main thread blocking** -- Synchronous I/O, `time.sleep()`, or blocking network calls in a script or event handler. Freezes all of NVDA. ([technicalDesignOverview.md - Core](https://github.com/nvaccess/nvda/blob/master/projectDocs/design/technicalDesignOverview.md)) |
| NVDA-003 | Serious | **Missing `addonHandler.initTranslation()`** -- Module uses `_()` for strings but never calls `initTranslation()`. All translated strings will raise `NameError`. ([AddonTemplate](https://github.com/nvdaaddons/AddonTemplate)) |
| NVDA-004 | Serious | **Missing `terminate()` cleanup** -- GlobalPlugin or AppModule creates timers, threads, or registered callbacks but has no `terminate()` method to clean them up on exit/reload. ([globalPluginHandler.py](https://github.com/nvaccess/nvda/blob/master/source/globalPluginHandler.py)) |
| NVDA-005 | Serious | **Incorrect manifest version format** -- `minimumNVDAVersion` or `lastTestedNVDAVersion` uses wrong format. Must be `YYYY.N.P` (e.g., `2024.1.0`). ([addon-datastore-validation](https://github.com/nvaccess/addon-datastore-validation)) |
| NVDA-006 | Moderate | **Monkey-patching core modules** -- Addon replaces functions on core NVDA modules (`speech.speak`, `braille.handler.message`, etc.) instead of using event handlers or extension points. Fragile, conflicts with other addons. ([technicalDesignOverview.md](https://github.com/nvaccess/nvda/blob/master/projectDocs/design/technicalDesignOverview.md)) |
| NVDA-007 | Moderate | **Script without `@script` decorator** -- Script method uses the legacy `__gestures` dict pattern instead of the modern `@script()` decorator. Less discoverable, harder to maintain. ([scriptHandler.py](https://github.com/nvaccess/nvda/blob/master/source/scriptHandler.py)) |
| NVDA-008 | Moderate | **Missing script description** -- Script has no `description` parameter (or `__doc__`). The script will not appear in NVDA's Input Gestures dialog, making it undiscoverable by users. ([scriptHandler.py - script() decorator](https://github.com/nvaccess/nvda/blob/master/source/scriptHandler.py)) |
| NVDA-009 | Moderate | **Hardcoded gesture conflicts** -- Addon binds to gestures that conflict with NVDA core commands (e.g., `kb:NVDA+n`, `kb:NVDA+t`) without checking. Will shadow core commands. ([inputCore.py](https://github.com/nvaccess/nvda/blob/master/source/inputCore.py)) |
| NVDA-010 | Serious | **UI updates from background thread** -- Code calls `wx.*` UI functions or `ui.message()` from a background thread without using `wx.CallAfter()`. Causes crashes or undefined behavior. ([wxPython thread safety](https://docs.wxpython.org/)) |
| NVDA-011 | Moderate | **Missing `check()` classmethod** -- SynthDriver or BrailleDisplayDriver lacks a `check()` classmethod. NVDA cannot determine if the driver is available on the system. ([synthDriverHandler.py](https://github.com/nvaccess/nvda/blob/master/source/synthDriverHandler.py)) |
| NVDA-012 | Minor | **Bare `except:` clause** -- Code uses bare `except:` or `except Exception:` without logging. Silently swallows errors including `SystemExit` and `KeyboardInterrupt`. |
| NVDA-013 | Serious | **Incompatible API version range** -- `lastTestedNVDAVersion` is more than 2 major releases behind current NVDA. Addon will be marked incompatible in the Add-on Store. ([addonHandler/addonVersionCheck.py](https://github.com/nvaccess/nvda/blob/master/source/addonHandler/addonVersionCheck.py)) |
| NVDA-014 | Minor | **Missing SHA256 for store submission** -- Addon release does not include SHA256 hash. Required for Add-on Store integrity verification. ([jsonMetadata.md](https://github.com/nvaccess/addon-datastore/blob/master/docs/submitters/jsonMetadata.md)) |
| NVDA-015 | Moderate | **Not using `config.conf.spec`** -- Addon stores persistent settings by writing files directly instead of using NVDA's configuration system. Bypasses profile support and validation. ([config/](https://github.com/nvaccess/nvda/tree/master/source/config)) |
| NVDA-016 | Serious | **Secure mode vulnerability** -- Addon accesses file system, network, or system commands without checking `NVDAState.shouldWriteToDisk()`. Could be exploited on the lock screen. ([addonHandler/__init__.py](https://github.com/nvaccess/nvda/blob/master/source/addonHandler/__init__.py)) |

---

### 3.15 Accessibility Checklist for NVDA Addon Developers

Before submitting an addon, verify:

#### Code Quality
- [ ] All event handlers call `nextHandler()` unless intentionally consuming the event
- [ ] No blocking calls on the main thread (network, file I/O, `time.sleep()`)
- [ ] `terminate()` cleans up all timers, threads, callbacks, and registered settings panels
- [ ] `addonHandler.initTranslation()` called if using `_()` strings
- [ ] All scripts have `@script()` decorator with `description`, `category`, and `gesture`
- [ ] No monkey-patching of core NVDA modules
- [ ] No bare `except:` clauses -- use specific exceptions and log errors

#### Manifest and Packaging
- [ ] `manifest.ini` has correct `name`, `summary`, `version`, `minimumNVDAVersion`, `lastTestedNVDAVersion`
- [ ] Version numbers follow semantic versioning
- [ ] `lastTestedNVDAVersion` is within 2 major releases of current NVDA
- [ ] SCons build produces valid `.nvda-addon` file
- [ ] SHA256 hash matches the distributed `.nvda-addon` file

#### User Experience
- [ ] All scripts discoverable in Input Gestures dialog (have descriptions)
- [ ] Default gestures do not conflict with NVDA core commands
- [ ] Settings panel (if any) properly registered and unregistered
- [ ] User-facing messages are translatable (wrapped in `_()`)
- [ ] Documentation exists in `addon/doc/en/readme.md`

#### Security
- [ ] No file system writes without `NVDAState.shouldWriteToDisk()` check
- [ ] No unbounded network requests (use timeouts and error handling)
- [ ] No execution of external commands without proper sanitization
- [ ] CodeQL scan passes without critical findings

#### Store Submission
- [ ] `.nvda-addon` hosted at a permanent URL (GitHub Releases)
- [ ] JSON metadata matches manifest values exactly
- [ ] VirusTotal scan clean
- [ ] Source code URL provided and accessible

---

### 3.16 Example Prompts

```
"Scaffold a new globalPlugin that announces the current Wi-Fi network name"
"Debug why my appModule for firefox.exe isn't loading"
"Add a settings panel to my addon with a checkbox and a slider"
"Prepare my addon for submission to the NVDA Add-on Store"
"Create a synthDriver wrapper for a custom TTS engine"
"Why isn't my event_gainFocus handler being called?"
"Migrate my addon from the legacy __gestures dict to @script decorators"
"Add internationalization support to my addon"
"My addon works in NVDA 2024.1 but crashes in 2025.1 -- help debug"
"Write a braille display driver stub for a new HID braille device"
```

---

### 3.17 Authoritative Sources for NVDA Addon Development

Every recommendation from this agent is grounded in these official sources:

| Source | URL | Type |
|--------|-----|------|
| NVDA Source Code | [github.com/nvaccess/nvda](https://github.com/nvaccess/nvda) | Primary reference -- all architectural claims verified here |
| Technical Design Overview | [technicalDesignOverview.md](https://github.com/nvaccess/nvda/blob/master/projectDocs/design/technicalDesignOverview.md) | Official architecture documentation |
| NVDA Developer Guide | [nvdaaddons/DevGuide wiki](https://github.com/nvdaaddons/devguide/wiki/NVDA%20Add-on%20Development%20Guide) | Community development guide |
| NVDA Community Addon Template | [nvdaaddons/AddonTemplate](https://github.com/nvdaaddons/AddonTemplate) | Official addon scaffolding |
| NVDA Add-on Store (addon-datastore) | [nvaccess/addon-datastore](https://github.com/nvaccess/addon-datastore) | Store submission infrastructure |
| Addon Submission Guide | [submissionGuide.md](https://github.com/nvaccess/addon-datastore/blob/master/docs/submitters/submissionGuide.md) | Step-by-step submission process |
| JSON Metadata Schema | [jsonMetadata.md](https://github.com/nvaccess/addon-datastore/blob/master/docs/submitters/jsonMetadata.md) | Store metadata field definitions |
| Addon Store Validation | [nvaccess/addon-datastore-validation](https://github.com/nvaccess/addon-datastore-validation) | Automated submission checks |
| NVDA User Guide | [nvaccess.org userGuide](https://www.nvaccess.org/files/nvda/documentation/userGuide.html) | End-user documentation |
| Addon Store Design Overview | [designOverview.md](https://github.com/nvaccess/addon-datastore/blob/master/docs/design/designOverview.md) | Store architecture and API endpoints |
| NVDA Add-on Internals | [DevGuide wiki](https://github.com/nvdaaddons/devguide/wiki) | Deep dives into specific addon mechanics |
| addonHandler source | [addonHandler/__init__.py](https://github.com/nvaccess/nvda/blob/master/source/addonHandler/__init__.py) | Addon lifecycle, state management |
| globalPluginHandler source | [globalPluginHandler.py](https://github.com/nvaccess/nvda/blob/master/source/globalPluginHandler.py) | Global plugin discovery and loading |
| appModuleHandler source | [appModuleHandler.py](https://github.com/nvaccess/nvda/blob/master/source/appModuleHandler.py) | App module lifecycle |
| scriptHandler source | [scriptHandler.py](https://github.com/nvaccess/nvda/blob/master/source/scriptHandler.py) | Script resolution, @script decorator |
| baseObject source | [baseObject.py](https://github.com/nvaccess/nvda/blob/master/source/baseObject.py) | ScriptableObject, AutoPropertyObject |
| NVDA Project Docs | [projectDocs/](https://github.com/nvaccess/nvda/tree/master/projectDocs) | Design docs, testing guides, community info |
| NVDA Testing Docs | [projectDocs/testing/](https://github.com/nvaccess/nvda/tree/master/projectDocs/testing) | Automated and manual testing guidance |
| Crowdin Registration | [nvdaaddons/CrowdinRegistration](https://github.com/nvdaaddons/CrowdinRegistration) | Add-on translation system |
| NVDA Addon Potluck | [nvdaaddons/potluck](https://github.com/nvdaaddons/potluck) | Shared utility modules for addon authors |
| NVDA Addon Wizard | [nvdaaddons/addonWizzard](https://github.com/nvdaaddons/addonWizzard) | Addon scaffolding tool |
| NVDA Community (groups.io) | [nvda-addons@groups.io](https://groups.io/g/nvda-addons) | Community mailing list for addon developers |
| Accessibility APIs (UIA) | [Microsoft UIA Docs](https://learn.microsoft.com/windows/win32/winauto/entry-uiauto-win32) | Windows UI Automation |
| Accessibility APIs (MSAA) | [Microsoft MSAA Docs](https://learn.microsoft.com/windows/win32/winauto/microsoft-active-accessibility) | Legacy accessibility API |
| IAccessible2 | [Linux Foundation IA2](https://accessibility.linuxfoundation.org/a11yspecs/ia2/docs/html/) | IA2 specification |

---

### 3.18 Behavioral Rules

1. **Always cite the NVDA source file** when explaining internal behavior. Link to the specific file on GitHub.
2. **Verify API compatibility** against `minimumNVDAVersion` and `lastTestedNVDAVersion` before recommending APIs.
3. **Warn about breaking changes** between NVDA versions. NVDA's API can change between major releases.
4. **Test recommendations against the official addon template** -- if the pattern does not work with the [AddonTemplate](https://github.com/nvdaaddons/AddonTemplate) build system, note that.
5. **Prefer the `@script` decorator** over legacy `__gestures` dicts for all new code.
6. **Never recommend monkey-patching** unless there is truly no alternative, and if so, document the fragility.
7. **Always recommend `terminate()` cleanup** when the plugin creates persistent resources.
8. **Route wxPython GUI questions** to `@wxpython-specialist`.
9. **Route screen reader testing** to `@desktop-a11y-testing-coach`.
10. **Include the `## Sources` section** at the end of every substantive response, linking to the specific NVDA source files, docs, or specs that ground the recommendation.

---

## Implementation Priority

### Phase 1: Foundation (Week 1)
1. Create `CITATION_POLICY.md`
2. Create `SOURCE_REGISTRY.json` (initial set of 20-30 key sources)
3. Create the NVDA Addon Specialist agent on all 3 platforms + docs
4. Update all manifests and counts

### Phase 2: Citation Rollout (Weeks 2-3)
5. Update all Copilot agents with citation behavioral rule + source registry
6. Update all Claude Code agents
7. Update all Gemini skills
8. Update docs pages

### Phase 3: Currency Automation (Week 4)
9. Create `check_source_currency.py` GitHub Action
10. Create PR template with citation checklist
11. Add MCP live-fetch instructions to agents in supported environments

### Phase 4: Ongoing
12. Weekly source currency checks run automatically
13. Annual deep review of all agents against current specs
14. Community feedback on citation quality

---

## File Inventory (Planned)

| File | Repository | Purpose |
|------|-----------|---------|
| `.github/agents/CITATION_POLICY.md` | accessibility-agents | Shared citation policy |
| `.github/agents/SOURCE_REGISTRY.json` | accessibility-agents | Machine-readable source fingerprints |
| `.github/scripts/check_source_currency.py` | accessibility-agents | GitHub Action for currency checks |
| `.github/workflows/source-currency-check.yml` | accessibility-agents | Scheduled workflow |
| `.github/agents/nvda-addon-specialist.agent.md` | accessibility-agents | Copilot agent |
| `.claude/agents/nvda-addon-specialist.md` | accessibility-agents | Claude Code agent |
| `.gemini/extensions/a11y-agents/skills/nvda-addon-specialist/SKILL.md` | accessibility-agents | Gemini skill |
| `docs/agents/nvda-addon-specialist.md` | accessibility-agents | Documentation page |
| Updated `.a11y-agent-manifest` | accessibility-agents | 3 new entries |
| Updated `manifest.json` | accessibility-agents | docs entry |
| Updated `README.md` | accessibility-agents | Count updates |
| Updated `AGENTS.md` | accessibility-agents | Team member + group |
| ~170 agent files | accessibility-agents | Citation behavioral rule addition |
