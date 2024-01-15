# Change Log

<!-- Allow identical headings; this file reuses level 3 headings like Added. -->
<!-- markdownlint-disable MD024 -->

## Unreleased

### Added

- Issue templates to report bugs and request new features ([#1](https://github.com/brobeson/vscode-cppcheck/issues/1))
- Scan files when a user opens them ([#4](https://github.com/brobeson/vscode-cppcheck/issues/4))
- Configuration setting for the path to Cppcheck ([#7](https://github.com/brobeson/vscode-cppcheck/issues/7))

### Fixed

- Only check C and C++ files ([#12](https://github.com/brobeson/vscode-cppcheck/issues/12))
- Show an error message if Cppcheck output parsing fails ([#13](https://github.com/brobeson/vscode-cppcheck/issues/13))
- Correctly parse Cppcheck output ([#13](https://github.com/brobeson/vscode-cppcheck/issues/13))
- Correctly link diagnostics with files ([#14](https://github.com/brobeson/vscode-cppcheck/issues/14))
- Fix editor squiggles for diagnostics ([#15](https://github.com/brobeson/vscode-cppcheck/issues/15))

### Deprecated

- The `cppcheck.elevateSeverity` configuration setting
- The `cppcheck.commandArguments` configuration setting

## [0.1.0](https://github.com/brobeson/vscode-cppcheck/releases/tag/v0.1.0) — 2023 December 30

### Added

- Automatically run Cppcheck when saving a C++ file
- Display issues as diagnostics
