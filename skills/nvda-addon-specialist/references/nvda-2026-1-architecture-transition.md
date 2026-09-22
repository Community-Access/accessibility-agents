# NVDA Add-on Specialist reference: NVDA 2026.1 Architecture Transition

Part of the `nvda-addon-specialist` skill. Read this only when the task reaches these sections.

## NVDA 2026.1 Architecture Transition

NVDA 2026.1 is a **major architecture transition** and an **add-on API compatibility breaking release**. All addons must be re-tested and have their manifests updated.

### 64-bit Transition

- **NVDA is now built with Python 3.13, 64-bit.** The 32-bit era is over.
- **32-bit Windows is no longer supported.** Windows 10 (Version 1507) 64-bit is the new minimum.
- **Windows 10 on ARM is dropped.** ARM64 support targets Windows 11 only (via ARM64EC libraries).
- **No backward-compatibility layer for 32-bit native libraries.** Addons shipping 32-bit `.dll` files or using 32-bit `ctypes` bindings will break. Recompile all native code as 64-bit.
- `NVDAHelper.localLib` changed from `ctypes.CDLL` to a module - use `.dll` attribute for the CDLL object.
- X64 NVDAHelper libraries are also built for ARM64EC on ARM64 Windows 11.
- The Microsoft Universal C Runtime is no longer bundled.

### SAPI Restructuring

- `sapi5` now refers to 64-bit SAPI 5 voices.
- Use `sapi5_32` to access 32-bit SAPI 5 voices (no audio ducking support).
- `sapi4` removed entirely - use `sapi4_32` instead (no audio ducking support).

### Key API Breaking Changes

- **`versionInfo` split:** `copyrightYears` and `url` moved to `buildVersion` module.
- **`winUser`, `winKernel`, `winGDI`, `shellapi`, `hwIo.hid.hidDll`** symbols moved to `winBindings.*` submodules.
- **Screen Curtain:** `visionEnhancementProviders.screenCurtain` replaced with `screenCurtain` subpackage.
- **MathPlayer removed:** `comInterfaces.MathPlayer` and `mathPres.mathPlayer` are gone.
- **`ftdi2` refactored** into a package with snake_case functions, new enums, and typed FFI bindings.
- **`gui.nvdaControls.TabbableScrolledPanel` removed** - use `wx.lib.scrolledpanel.ScrolledPanel`.
- **Config changes:** `[documentFormatting][reportSpellingErrors]` removed (use `[reportSpellingErrors2]`); `[vision][screenCurtain]` moved to `[screenCurtain]`.
- **`typing_extensions` removed** -- Python 3.13 has native support.
- **License changed** to GPL-2-or-later.

### Deprecations (Still Present, Will Be Removed)

- `NVDAHelper.versionedLibPath` - use `NVDAState.ReadPaths.versionedLibX86Path`
- `NVDAHelper.coreArchLibPath` - use `NVDAState.ReadPaths.coreArchLibPath`
- `winVersion.WIN81` - Windows 8.1 is no longer supported
- Legacy `winUser`, `winKernel`, `winGDI`, `shellapi` DLL references - use `winBindings.*` equivalents

### Manifest Version Guidance

Use the following table to choose the right `minimumNVDAVersion` and `lastTestedNVDAVersion` values for your addon's manifest.ini.

| Scenario | `minimumNVDAVersion` | `lastTestedNVDAVersion` |
|----------|---------------------|------------------------|
| New addon | `2025.1.0` | `2026.1.0` |
| Broad compatibility (Python 3 required) | `2019.3.0` | `2026.1.0` |
| Widest safe range | `2024.1.0` | `2026.1.0` |

**Absolute minimum for Python 3:** `2019.3.0` -- this is the first NVDA release that requires Python 3. Never set `minimumNVDAVersion` below `2019.3.0` for any addon written in Python 3.

**Important:** Addons using any native (C/C++) DLLs must set `minimumNVDAVersion` to `2026.1.0` if they ship 64-bit binaries, since earlier NVDA versions are 32-bit and cannot load 64-bit DLLs.

### 2026.1 Sources

Based on the [NVDA 2026.1 changelog](https://github.com/nvaccess/nvda/blob/master/user_docs/en/changes.md#20261) and the following GitHub issues:

- 64-bit Python 3.13: [#18591](https://github.com/nvaccess/nvda/issues/18591), [#19111](https://github.com/nvaccess/nvda/issues/19111)
- 32-bit and ARM deprecation: [#18684](https://github.com/nvaccess/nvda/issues/18684)
- NVDAHelper/localLib changes: [#18207](https://github.com/nvaccess/nvda/issues/18207)
- ARM64EC libraries: [#18570](https://github.com/nvaccess/nvda/issues/18570)
- Universal C Runtime removal: [#19508](https://github.com/nvaccess/nvda/issues/19508)
- SAPI 4/5 restructuring: [#19432](https://github.com/nvaccess/nvda/issues/19432)
- versionInfo split: [#18682](https://github.com/nvaccess/nvda/issues/18682)
- winBindings migration: [#18860](https://github.com/nvaccess/nvda/issues/18860), [#18883](https://github.com/nvaccess/nvda/issues/18883), [#18896](https://github.com/nvaccess/nvda/issues/18896)
- Screen Curtain refactor: [#19177](https://github.com/nvaccess/nvda/issues/19177)
- MathPlayer removal: [#19239](https://github.com/nvaccess/nvda/issues/19239)
- ftdi2 refactor: [#19105](https://github.com/nvaccess/nvda/issues/19105)
- TabbableScrolledPanel removal: [#17751](https://github.com/nvaccess/nvda/issues/17751)
- typing_extensions removal: [#18689](https://github.com/nvaccess/nvda/issues/18689)

---
