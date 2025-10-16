# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2025-10-16

### Added
- Support for light/dark theme
- Improved Windows installer with desktop shortcuts and start menu entry
- Integration with electron-log for better error tracking
- Enhanced security settings with sandbox mode enabled
- Proper Content Security Policy implementation

### Changed
- Updated to Electron 38.3.0
- Updated all dependencies to their latest versions:
  - electron-builder to 24.13.3
  - electron-window-state to 5.0.3
  - webpack to 5.102.1
  - TypeScript to 5.9.3
- Improved memory management and resource cleanup
- Enhanced screen sharing and window management
- Optimized build process with webpack

### Removed
- Sentry integration for simpler error handling
- Unused Mac-specific screen capture permissions on Windows

### Fixed
- Memory leaks in screen sharing
- Resource cleanup on window close
- Build configuration for Windows platform
- User agent handling for better compatibility

### Security
- Enabled sandbox mode for enhanced security
- Updated Content Security Policy
- Improved handling of screen capture permissions
- Enhanced window management security

## [1.1.0] - Previous version

Note: Historical changelog entries to be added for completeness.