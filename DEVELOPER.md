# Developer Guide

## Release Process

This document outlines the process for releasing new versions of the DayDeck Obsidian plugin.

### 1. Update Version Numbers

Update version numbers in the following files:

- **manifest.json**: Update the `version` field (e.g., `"version": "1.0.2"`)
- **package.json**: Update the `version` field to match manifest.json

Both files should have the same version number.

### 2. Update Changelog

Add a new section to `CHANGELOG.md` following the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format:

```markdown
## [1.0.2] - YYYY-MM-DD

### Added
- New feature description

### Changed
- Changed feature description

### Fixed
- Bug fix description
```

The changelog format uses:
- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Features that will be removed in future releases
- **Removed**: Features removed in this release
- **Fixed**: Bug fixes
- **Security**: Security-related fixes

### 3. Commit Changes

Commit the version bump and changelog updates:

```bash
git add manifest.json package.json CHANGELOG.md
git commit -m "Release 1.0.2"
```

### 4. Create and Push Tag

Create a git tag for the release and push it:

```bash
git tag v1.0.2
git push origin main
git push origin v1.0.2
```

Tags should follow semantic versioning (e.g., v1.0.2, v2.0.0).

### 5. Automated Release

Once the tag is pushed, the GitHub Actions workflow (`.github/workflows/release.yml`) will automatically:

1. Build the plugin
2. Create a GitHub release with the tag name
3. Attach the required files: `main.js`, `manifest.json`, and `styles.css`
4. Mark the release as a draft

### 6. Publish to Obsidian

After the automated release is created:

1. Go to the GitHub releases page
2. Review the draft release created by the workflow
3. Edit the release notes if needed (copy from CHANGELOG.md)
4. Publish the release
5. Submit the plugin to the Obsidian plugin registry (if it's a new plugin or needs updating)

### 7. Verify Release

After publishing:

1. Install the plugin from the community plugins list in Obsidian
2. Test that the plugin loads correctly
3. Verify new features or bug fixes work as expected

## Development Workflow

### Building the Plugin

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

This runs the build in watch mode for development.

### Linting and Formatting

```bash
npm run lint      # Run ESLint with auto-fix
npm run format    # Run Prettier to format code
```

## Versioning

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html):

- **MAJOR**: Incompatible API changes
- **MINOR**: Backwards-compatible functionality additions
- **PATCH**: Backwards-compatible bug fixes
