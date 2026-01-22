# Testing Strategy for Uncharted Stars Saga

## Executive Summary

This document defines the testing strategy for **NAOS (Narrative & Audio Operating System)**. It ensures that **Narrative Engine**, **Audio Engine**, **MCP Spine**, **Listener Platform**, and **Data Layer** behave as a single, cohesive system. Tests must validate component correctness **and** the contracts that connect them.

## Current State

**Status**: Repository initialized with no source code or tests
**Opportunity**: Establish testing best practices from day one
**System TODO Hub**: Use [SYSTEM_TODO.md](./SYSTEM_TODO.md) to align test backlog with subsystem checklists and the incident response flowchart in [docs/incident_response_flow.md](./docs/incident_response_flow.md).
**Audio Storage Contract**: Reference [docs/audio_storage_conventions.md](./docs/audio_storage_conventions.md) for CDN and storage behavior that tests must validate.
**Error Taxonomy**: Reference [docs/error_taxonomy.md](./docs/error_taxonomy.md) for severity levels and expected error codes in tests.
**Narrative Diagrams**: Reference [docs/narrative_engine_diagrams.md](./docs/narrative_engine_diagrams.md) for event DAG and canon gate flows.

## Coverage Goals

### Target Metrics
- **Overall Code Coverage**: 80-90%
- **Critical Business Logic (Canon, Dependencies, Payments)**: 100%
- **Service Layer**: 85%+
- **Utilities & Helpers**: 90%+
- **Configuration & Infrastructure**: 50-60% (validate via smoke tests and contract checks)

### Coverage Types to Track
1. **Line Coverage**: Percentage of code statements executed
2. **Branch Coverage**: Percentage of conditional paths tested
3. **Function Coverage**: Percentage of functions called
4. **Integration Coverage**: Percentage of component interactions tested
5. **Contract Coverage**: Percentage of API/schema contracts validated (new)

## Testing Pyramid

```
        /\
       /E2E\         10-20% - End-to-End Tests
      /------\
     /  Inte- \      20-30% - Integration Tests
    /  gration \
   /------------\
  /    Unit      \   60-70% - Unit Tests
 /     Tests      \
/------------------\
```

## Priority Testing Areas

### High Priority (Test First)
1. **Narrative Engine (Canon + Dependencies)**
   - Event graph integrity (DAG validation)
   - Canon gating (draft → proposed → canon)
   - Knowledge state propagation
   - Promise tracking and fulfillment rules

2. **MCP Spine (Proposal + Validation Gates)**
   - Resource read-only guarantees
   - Tool proposal schemas
   - Validation failures surface clear errors
   - Audit logging for changes
   - Detailed MCP spine test checklist lives in SYSTEM_TODO.md

3. **Audio Engine (Listener Cognition)**
   - Beat marker placement rules
   - Voice profile consistency
   - Scene object output validation
   - Listener confusion audits

4. **Listener Platform (Access + Playback)**
   - Auth and entitlement checks
   - Stripe webhook verification
   - Streaming access via signed URLs
   - Playback resume integrity

#### Listener Platform Playback Test Plan

- **Unit:** validate signed URL inputs (chapter ID, entitlement, expiry) and ensure rejected requests fail fast.
- **Integration:** save playback position on cadence + on pause, then restore on new session.
- **E2E:** play → pause → resume → reload session and continue from saved position.

5. **Data Persistence (Separation)**
   - Strict separation of Creator OS vs Listener Platform databases
   - Canon data immutability guarantees
   - Object storage access controls

## Checklist Alignment (Phase 1 Deliverables)

This matrix aligns **SYSTEM_TODO.md** build checklists with required tests so coverage stays synchronized with subsystem readiness. Each checklist item should map to at least one test in the indicated layer. Update this table whenever subsystem checklists change.

| Subsystem Checklist (SYSTEM_TODO.md) | Required Test Coverage | Minimum Test Types | Notes |
| --- | --- | --- | --- |
| Narrative Engine (Events, Knowledge, Promises, Canon Gates) | Event DAG integrity, canon gate validation, knowledge timing rules, promise lifecycle transitions | Unit + Integration | Include import-path coverage by creating draft events, knowledge, and promises via API and verifying canon gate behavior end-to-end. |
| Audio Engine (Beat Markers, Voice Profiles, Recording Packets) | Beat marker placement, voice profile enforcement, recording packet completeness | Unit + Integration | Validate listener cognition safeguards for audio-first delivery. |
| MCP Spine (Resources, Tools, Canon Gates, Audit Logs) | Read-only resource enforcement, proposal schema validation, canon gate error reporting, audit logging | Unit + Integration | Ensure proposal failures surface error taxonomy codes. |
| Listener Platform (Auth, Playback, Entitlements) | Auth checks, signed URL enforcement, resume integrity | Unit + Integration + E2E | Include playback resume flow from the Listener Platform test plan. |
| Data Layer (Persistence, Separation, Storage) | Canon immutability, separation boundaries, storage access controls | Integration + Contract | Verify canonical data never mutates and storage provenance metadata is enforced. |

### Medium Priority
1. **Service Integration**
   - Narrative → Audio pipeline handoff
   - Creator OS → Listener Platform publish flow
   - MCP resource/tool latency and rate limits
   - External API calls (Stripe, Auth)

2. **Error Handling**
   - Canon gate failure scenarios
   - Payment edge cases and replay protection
   - Storage access failures
   - User-facing error messages

3. **Configuration Management**
   - Environment-specific configs
   - Feature flags
   - Secrets isolation between environments

### Lower Priority
1. **Static Configurations**
2. **Logging/Monitoring** (basic smoke tests)
3. **Non-critical UI components**

## Testing Framework Recommendations

### JavaScript/TypeScript
- **Framework**: Jest or Vitest
- **Coverage Tool**: Built-in
- **Assertion Library**: Built-in or Chai
- **Mocking**: Built-in jest.mock() or Sinon
- **E2E**: Playwright or Cypress

```javascript
// Example test structure
describe('NarrativeEngine', () => {
  it('should reject canonization when dependencies are missing', () => {
    const engine = new NarrativeEngine();
    const proposal = { eventId: 'evt-1', dependencies: ['evt-0'] };
    expect(() => engine.canonize(proposal)).toThrow(/missing dependency/);
  });
});
```

### Python
- **Framework**: pytest
- **Coverage Tool**: pytest-cov
- **Mocking**: unittest.mock or pytest-mock
- **E2E**: Selenium or Playwright

```python
# Example test structure
def test_canon_gate_rejects_missing_dependency():
    engine = NarrativeEngine()
    proposal = {"event_id": "evt-1", "dependencies": ["evt-0"]}
    with pytest.raises(ValueError, match="missing dependency"):
        engine.canonize(proposal)
```

### Go
- **Framework**: Built-in testing package
- **Coverage Tool**: go test -cover
- **Mocking**: testify/mock or gomock

```go
// Example test structure
func TestCanonGateRejectsMissingDependency(t *testing.T) {
    engine := NewNarrativeEngine()
    err := engine.Canonize(Proposal{EventID: "evt-1", Dependencies: []string{"evt-0"}})
    if err == nil {
        t.Errorf("Expected missing dependency error, got nil")
    }
}
```

### Rust
- **Framework**: Built-in cargo test
- **Coverage Tool**: cargo-tarpaulin or cargo-llvm-cov
- **Mocking**: mockall

```rust
// Example test structure
#[test]
fn test_canon_gate_rejects_missing_dependency() {
    let engine = NarrativeEngine::new();
    let result = engine.canonize(Proposal::new("evt-1", vec!["evt-0"]));
    assert!(result.is_err());
}
```

## Test Organization

### Recommended Directory Structure

```
project-root/
├── src/                    # Source code
│   ├── creator-os/
│   │   ├── narrative/
│   │   ├── audio/
│   │   └── mcp/
│   ├── listener-platform/
│   │   ├── web/
│   │   └── api/
│   └── shared/
│       └── contracts/
├── tests/                  # Test files
│   ├── unit/               # Unit tests (mirror src structure)
│   ├── integration/        # Integration tests
│   ├── contract/           # Contract tests for APIs/schemas
│   ├── e2e/                # End-to-end tests
│   └── fixtures/           # Test data and helpers
└── coverage/               # Coverage reports (gitignored)
```

## Testing Best Practices

### 1. Write Tests Alongside Code
- Never defer test writing
- TDD approach when appropriate
- Tests are documentation

### 2. Test Behavior, Not Implementation
```javascript
// Good: Tests behavior
it('should grant access when entitlement is valid', () => {
  const result = entitlement.checkAccess('listener-1', 'chapter-9');
  expect(result.allowed).toBe(true);
});

// Bad: Tests implementation details
it('should call verifyStripeSignature and loadEntitlements', () => {
  webhook.handle(request);
  expect(verifyStripeSignature).toHaveBeenCalled();
  expect(loadEntitlements).toHaveBeenCalled();
});
```

### 3. Use Descriptive Test Names
- Format: `should [expected behavior] when [condition]`
- Examples:
  - `should return 401 when password is invalid`
  - `should create new user when email is unique`
  - `should throw error when required field is missing`

### 4. Follow AAA Pattern
```javascript
it('should preserve canon immutability after publication', () => {
  // Arrange
  const event = createCanonEvent();

  // Act
  const result = canonStore.update(event.id, { description: 'rewrite' });

  // Assert
  expect(result.error).toMatch(/immutable/);
});
```

### 5. Keep Tests Independent
- No shared state between tests
- Use beforeEach/afterEach for setup/teardown
- Tests should pass in any order

### 6. Use Factories and Fixtures
```javascript
// fixtures/factories.js
export const createUser = (overrides = {}) => ({
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  ...overrides
});

// In tests
const user = createUser({ username: 'alice' });
```

### 7. Mock External Dependencies
```javascript
// Mock external API
jest.mock('../services/api');
api.fetchData.mockResolvedValue({ data: 'test' });
```

## Common Testing Gaps to Avoid

### 1. Error Handling
- Test all error paths
- Validate error messages
- Check error recovery

### 2. Edge Cases
- Empty inputs
- Null/undefined values
- Boundary conditions
- Maximum/minimum values

### 3. Async Operations
- Race conditions
- Timeout handling
- Promise rejection
- Callback errors

### 4. Security
- Input validation
- SQL injection attempts
- XSS prevention
- Authorization checks

### 5. Concurrency
- Multiple simultaneous users
- Database transaction conflicts
- Resource locking

### 6. State Management
- State transitions
- Invalid state handling
- State persistence

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup environment
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm test -- --coverage

    - name: Check coverage threshold
      run: npm run test:coverage-check

    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        files: ./coverage/coverage-final.json
```

### Coverage Enforcement

- Fail builds if coverage drops below threshold
- Require coverage reports on PRs
- Track coverage trends over time
- Set branch-specific requirements

## Configuration Examples

### Jest (JavaScript/TypeScript)

```javascript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/core/**/*.js': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**'
  ],
  testMatch: [
    '**/tests/**/*.test.{js,jsx,ts,tsx}'
  ]
};
```

### pytest (Python)

```ini
# pytest.ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts =
    --cov=src
    --cov-report=html
    --cov-report=term-missing
    --cov-fail-under=80
```

```ini
# .coveragerc
[run]
source = src
omit =
    */tests/*
    */venv/*
    */__pycache__/*

[report]
exclude_lines =
    pragma: no cover
    def __repr__
    raise AssertionError
    raise NotImplementedError
    if __name__ == .__main__.:
    if TYPE_CHECKING:

fail_under = 80
precision = 2
```

## Running Tests Locally

### Initial Setup
```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react
# or
pip install pytest pytest-cov
# or
go get -u github.com/stretchr/testify
```

### Run Commands
```bash
# Run all tests
npm test
# or
pytest
# or
go test ./...

# Run with coverage
npm test -- --coverage
# or
pytest --cov=src --cov-report=html
# or
go test -cover ./...

# Watch mode (for TDD)
npm test -- --watch
# or
pytest-watch
```

## Measuring Success

### Key Metrics
1. **Coverage Percentage**: Trending upward
2. **Test Execution Time**: Under 5 minutes for full suite
3. **Test Reliability**: <1% flaky tests
4. **Bug Escape Rate**: Decreasing over time
5. **Time to Fix**: Bugs caught by tests vs production

### Regular Reviews
- Weekly coverage reports
- Monthly test suite health check
- Quarterly strategy review
- Identify slow/flaky tests

## Immediate Action Items

When development begins:

1. **Choose tech stack** and testing framework
2. **Set up test infrastructure** in repository
3. **Configure CI/CD** to run tests on every commit
4. **Write first test** before first feature
5. **Document testing conventions** in team guidelines
6. **Set up coverage tracking** and reporting
7. **Create test templates** for common patterns
8. **Schedule regular reviews** of test health

## Resources

### Further Reading
- [Testing JavaScript by Kent C. Dodds](https://testingjavascript.com/)
- [pytest Documentation](https://docs.pytest.org/)
- [Go Testing Package](https://pkg.go.dev/testing)
- [The Rust Book - Testing](https://doc.rust-lang.org/book/ch11-00-testing.html)

### Tools
- [Codecov](https://codecov.io/) - Coverage reporting
- [Coveralls](https://coveralls.io/) - Coverage tracking
- [SonarQube](https://www.sonarqube.org/) - Code quality
- [Cypress Dashboard](https://www.cypress.io/dashboard/) - E2E test management

## Conclusion

Strong test coverage begins with intentional planning. By following this strategy from day one, Uncharted Stars Saga will benefit from:

- Faster development cycles
- Fewer production bugs
- Confident refactoring
- Better documentation
- Easier onboarding

**Remember**: Tests are not overhead—they are an investment in code quality and developer productivity.
