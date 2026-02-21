# Contributing to Browse The Web (BTW)

Thank you for your interest in contributing to Browse The Web (BTW)! We welcome contributions from developers, AI researchers, and anyone passionate about browser automation.

## 🎯 How Can You Contribute?

We appreciate contributions of all kinds:

### 🐛 Reporting Bugs
Found a bug? Help us fix it by reporting it in detail.

### 💡 Suggesting Features
Have a great idea? We'd love to hear about it!

### 📝 Improving Documentation
Better documentation helps everyone. Fix typos, add examples, clarify concepts.

### 🔧 Bug Fixes
Fix an existing issue and submit a pull request.

### ✨ New Features
Add new endpoints, improve performance, or enhance functionality.

### 🧪 Writing Tests
Help ensure the reliability of BTW by adding tests.

### 🌍 Translation
Help translate documentation to other languages.

## 🚀 Getting Started

### Prerequisites
- **Node.js**: 18.0 or higher
- **npm**: 9.0 or higher
- **Git**: Latest version
- **TypeScript knowledge**: The project is fully typed in TypeScript

### Setup Development Environment

1. **Fork and Clone**
   ```bash
   # Fork the repository on GitHub
   # Clone your fork
   git clone https://github.com/YOUR-USERNAME/btw.git
   cd btw
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build the Project**
   ```bash
   npm run build
   ```

4. **Start Development Server**
   ```bash
   # Build and start
   npm run all
   
   # Or use watch mode for development
   npm run dev
   ```

5. **Verify Setup**
   ```bash
   curl http://localhost:5409/api/health
   ```

## 📋 Development Workflow

### Branch Naming
Use clear branch names:
- `feature/add-xyz-feature` for new features
- `bugfix/xyz-issue` for bug fixes
- `docs/xyz-update` for documentation changes
- `refactor/xyz-improvement` for refactoring

### Making Changes

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Write TypeScript code
   - Follow the existing code style
   - Add type annotations
   - Write clear comments

3. **Build and Test**
   ```bash
   npm run build
   npm start
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add XYZ feature - fixes #123"
   ```

   **Commit Message Format:**
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `style:` for code style changes
   - `refactor:` for refactoring
   - `test:` for adding tests
   - `chore:` for maintenance

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## 🏗️ Project Structure

```
btw/
├── src/                          # TypeScript source files
│   ├── types/                    # Type definitions
│   ├── managers/                 # Business logic
│   │   ├── BrowserManager.ts     # Browser lifecycle
│   │   ├── TabManager.ts         # Tab management
│   │   └── index.ts
│   ├── controllers/              # Request handlers
│   │   ├── BrowserController.ts  # Browser endpoints
│   │   └── TabsController.ts     # Tab endpoints
│   ├── routes/                   # API routes
│   ├── middlewares/              # Express middleware
│   └── index.ts                  # Main entry point
├── dist/                         # Compiled JavaScript (auto-generated)
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── README.md                     # Main documentation
├── API_BLUEPRINT.md              # API reference
├── AI_AGENT_GUIDE.md             # AI integration guide
└── CONTRIBUTING.md               # This file
```

## 📝 Coding Standards

### TypeScript Best Practices
- Use strict mode and proper type checking
- Define interfaces for all data structures
- Use generics when appropriate
- Avoid `any` type - use `unknown` instead
- Add JSDoc comments for public APIs

### Code Style
- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas in arrays and objects
- Use arrow functions for callbacks
- Keep functions small and focused

### API Endpoint Standards
- Use descriptive endpoint names
- Return consistent JSON responses
- Handle errors gracefully
- Add input validation
- Include error messages

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- path/to/test/file.test.ts
```

### Adding Tests
```typescript
import { browserManager } from '../src/managers/BrowserManager';

describe('BrowserManager', () => {
  test('should launch browser', async () => {
    const browser = await browserManager.launch();
    expect(browser).toBeDefined();
  });
});
```

## 📖 Documentation

### API Documentation
- Update `API_BLUEPRINT.md` for new endpoints
- Include request/response examples
- Document all parameters
- Add usage examples

### Code Comments
- Add JSDoc comments for public functions
- Explain complex logic
- Reference relevant issues or PRs

## 🐛 Bug Reporting

### Before Reporting
1. Search existing issues
2. Check documentation
3. Try the latest version
4. Create a minimal reproduction

### Bug Report Template

```markdown
**Description**
Brief description of the bug

**Steps to Reproduce**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [e.g., Ubuntu 22.04]
- Node.js: [e.g., 18.0.0]
- BTW Version: [e.g., 2.0.0]

**Additional Context**
Logs, screenshots, or additional information
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Title**
Brief title of the feature

**Problem**
What problem does this solve?

**Solution**
How should it work?

**Alternatives**
Other solutions considered

**Additional Context**
Mockups, examples, or references
```

## 📜 Pull Request Guidelines

### Before Submitting a PR
- [ ] Code follows the project's style guidelines
- [ ] Tests pass locally
- [ ] Documentation is updated
- [ ] Commit messages follow the format
- [ ] PR description explains the changes

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested the changes

## Checklist
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No console errors
- [ ] Code is formatted
```

## 🔍 Code Review

### Review Process
- All PRs require review from maintainers
- Address all review comments
- Keep PRs focused and small
- Be open to feedback

### Responding to Reviews
- Be respectful and constructive
- Explain your decisions
- Suggest alternatives when needed
- Update PR based on feedback

## 🎨 Adding New Endpoints

### Step 1: Define Types
```typescript
// src/types/index.ts
export interface MyRequestData {
  paramName: string;
}
```

### Step 2: Implement in Controller
```typescript
// src/controllers/TabsController.ts
async myNewEndpoint(req: Request, res: Response) {
  // Implementation
}
```

### Step 3: Add Route
```typescript
// src/routes/tabs.routes.ts
router.post('/:sessionId/my-endpoint', validateSession, tabsController.myNewEndpoint);
```

### Step 4: Update Documentation
```markdown
### POST /api/tabs/:sessionId/my-endpoint
...
```

### Step 5: Add Tests
```typescript
test('my new endpoint works', async () => {
  // Test implementation
});
```

## 🌳 Architecture Guidelines

### BrowserManager
- Manage browser lifecycle
- Handle auto-relaunch
- Maintain single browser instance

### TabManager
- Manage tab sessions
- Handle tab lifecycle
- Coordinate with BrowserManager

### Controllers
- Handle HTTP requests/responses
- Validate inputs
- Return appropriate status codes

### Routes
- Define API endpoints
- Apply middleware
- Route to controllers

## ⚡ Performance Considerations

- Minimize browser restarts
- Reuse when possible
- Clean up resources
- Handle errors gracefully
- Monitor memory usage

## 🔐 Security Best Practices

- Validate all inputs
- Sanitize user data
- Use HTTPS in production
- Implement rate limiting
- Manage browser contexts securely
- Clear sensitive data

## 📧 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and ideas
- **Documentation**: Check existing docs first

## 🎉 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project website (when launched)

## 📜 Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please:
- Be respectful and considerate
- Use inclusive language
- Focus on what is best for the community
- Show empathy toward other community members

## 🚀 Deployment

### Release Process
1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create release on GitHub
4. Publish to npm (if applicable)

### Versioning
Follow Semantic Versioning:
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes (backward compatible)

## 📚 Additional Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Express Documentation](https://expressjs.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

**Thank you for contributing to Browse The Web!** 🎊

Your contributions help make browser automation accessible to AI agents and developers worldwide.
