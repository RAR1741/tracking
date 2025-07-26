# ESLint Configuration

This project has been configured with comprehensive TypeScript linting using ESLint.

## Features

- **TypeScript Support**: Full TypeScript linting with `@typescript-eslint`
- **React Support**: React and React Hooks linting rules
- **Automatic Fixing**: ESLint can automatically fix many issues
- **Pre-commit Hooks**: Automatic linting on git commits using Husky and lint-staged
- **VS Code Integration**: Automatic linting and fixing on save

## Scripts

```bash
# Run linter
npm run lint

# Run linter and fix auto-fixable issues
npm run lint:fix

# Run linter with zero warnings tolerance (good for CI)
npm run lint:check
```

## Configuration Files

- `eslint.config.js` - Main ESLint configuration using flat config format
- `.vscode/settings.json` - VS Code settings for automatic linting
- `.husky/pre-commit` - Pre-commit hook for automatic linting
- `package.json` - Contains lint-staged configuration

## Automatic Linting

### VS Code Integration

The project is configured to:

- Show linting errors and warnings in the editor
- Automatically fix issues on file save
- Format code on save

### Pre-commit Hooks

Husky and lint-staged are configured to:

- Run ESLint on staged files before each commit
- Automatically fix issues when possible
- Prevent commits if there are unfixable errors

## Rule Configuration

The ESLint configuration includes:

- TypeScript-specific rules for type safety
- React and React Hooks best practices
- Code quality and consistency rules
- Import/export organization rules

### Key Rules

- Enforce consistent type imports (`import type`)
- Prevent unused variables (with exceptions for underscore-prefixed)
- Warn about console statements (except in config files)
- Enforce React Hooks rules
- Prevent common JavaScript pitfalls
