# Contributing to DayDeck

Thank you for your interest in contributing to DayDeck! I appreciate any help, whether it's bug fixes, new features, documentation improvements, or bug reports.

## Getting Started

### Prerequisites

- Node.js and npm installed
- Familiarity with TypeScript
- Obsidian installed for testing

### Development Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/ShivrajRath/daydeck.git
   cd daydeck
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Run development mode**:

   ```bash
   npm run dev
   ```

4. **Build the plugin**:

   ```bash
   npm run build
   ```

5. **Install in Obsidian**:
   - Copy the built files to your Obsidian vault's `.obsidian/plugins/daydeck` folder
   - Enable the plugin in Obsidian's Community Plugins settings

## Making Changes

### Code Style

- Follow the existing code style and formatting
- Use TypeScript for all new code
- Add comments for complex logic
- Keep functions focused and modular

### Testing

- Test your changes in Obsidian before submitting
- Ensure existing functionality still works
- Test both light and dark modes if applicable

## Submitting Changes

1. **Fork the repository** on GitHub
2. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit your changes** with clear, descriptive messages
4. **Push to your fork** and create a pull request

### Pull Request Guidelines

- Describe what your PR does and why it's needed
- Reference any related issues
- Include screenshots for UI changes
- Keep PRs focused on a single issue or feature

## Reporting Bugs

When reporting bugs, please include:

- Obsidian version
- DayDeck version
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots if applicable
- Console errors (if any)

## Feature Requests

I'm open to feature suggestions! When requesting a feature:

- Describe the use case clearly
- Explain how it would benefit users
- Consider if it fits with DayDeck's philosophy
- Provide examples if possible

## Questions

Feel free to open an issue if you have questions about contributing or using DayDeck.

Thank you for contributing to DayDeck! 🚀
