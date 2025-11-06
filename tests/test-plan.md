# Arena Blitz FPS - Test Plan

## Test Plan Version 1.0.0
**Last Updated**: 2025-11-06  
**Owner**: QA Team  
**Status**: Active

---

## 1. Executive Summary

This document defines the comprehensive testing strategy for Arena Blitz FPS, a competitive browser-based multiplayer first-person shooter. The test plan ensures game stability, performance, security, and player experience quality across all platforms and network conditions.

### 1.1 Testing Objectives
- **Stability**: Zero P0/P1 bugs in production; all P2/P3 bugs documented with clear reproduction steps
- **Performance**: 60fps on desktop (95th percentile frame-time < 16.7ms), 30+fps on mobile
- **Network**: Reliable multiplayer under various network conditions (30ms-200ms latency, 0-3% packet loss)
- **Compatibility**: Consistent experience across Chrome, Firefox, Edge, Safari on Windows/Mac/Mobile
- **Accessibility**: Full keyboard navigation, ARIA compliance, colorblind modes
- **Security**: Anti-cheat validation, input validation, rate limiting

---

## 2. Scope

### 2.1 In Scope

#### Gameplay Systems
- Player movement (walk, sprint, crouch, jump, slide)
- Camera controls (look, ADS, sensitivity)
- Weapon mechanics (firing, reload, swap, recoil, spread)
- Hit detection and damage calculation (headshot/body multipliers)
- Health/death/respawn systems
- Scoreboard and match progression
- HUD elements (ammo, health, crosshair, hit markers, damage indicators)

#### Networking
- WebSocket connection management
- Client-side prediction and reconciliation
- Server authority and validation
- Lag compensation
- Anti-cheat detection (speed hacks, RPM hacks, aim assistance)
- Heartbeat and timeout handling
- Reconnection flow

#### Graphics & Rendering
- Three.js scene rendering
- Map loading and lighting
- Weapon models and animations
- Visual effects (muzzle flash, hit markers, blood splatter)
- Performance optimization (object pooling, LOD)
- Cross-browser WebGL compatibility

#### UI/UX
- Main menu navigation
- Lobby system (create/join rooms)
- Shop interface (browse, preview, purchase)
- Loadout customization
- Settings panels
- Match HUD
- End-of-match screens
- Keyboard navigation
- Mobile touch controls

#### Economy & Progression
- Currency systems (Credits, Gems)
- Shop inventory and rotation
- Purchase flow and validation
- Loadout persistence
- Player progression (XP, levels)
- Weapon progression
- Battle pass and challenges
- Reward distribution

#### Performance
- Frame rate monitoring (desktop 60fps, mobile 30+fps)
- Memory usage and leak detection
- Network bandwidth (< 100 kbps in combat)
- Bundle size optimization
- Load times

### 2.2 Out of Scope (for this phase)
- Voice chat integration
- Social features (friends, parties) beyond basic lobby
- Tournament/ranked competitive mode (initial implementation only)
- Mobile app deployment (browser testing only)
- Console platform support

---

## 3. Priority Definitions

### P0 - Critical (Blocker)
**Impact**: Game crash, data loss, security vulnerability, or ability to cheat  
**Response Time**: Immediate fix required  
**Examples**:
- Server crash on match start
- Client crash during gameplay
- Ability to bypass anti-cheat
- Money/inventory duplication exploits
- Authentication bypass

### P1 - High (Major)
**Impact**: Core gameplay blocked or severely degraded  
**Response Time**: Fix within 1-2 days  
**Examples**:
- Players cannot join matches
- Weapons don't fire
- Hit detection completely broken
- Shop purchases fail
- Cannot equip loadouts

### P2 - Medium (Minor)
**Impact**: UX/performance/visual issues that affect experience but not core gameplay  
**Response Time**: Fix within 1-2 weeks  
**Examples**:
- Frame drops under specific conditions
- Visual glitches or z-fighting
- UI elements misaligned
- Incorrect hitmarker feedback
- Slow shop loading

### P3 - Low (Trivial)
**Impact**: Polish issues, minor visual inconsistencies  
**Response Time**: Backlog, prioritize by impact  
**Examples**:
- Typos in UI text
- Animation transitions not smooth
- Sound effects timing off slightly
- Minor texture artifacts

---

## 4. Test Matrix

### 4.1 Browser Coverage

| Browser | Version | OS | Priority | Status |
|---------|---------|-----|----------|--------|
| Chrome | Latest (120+) | Windows 10/11 | P0 | Required |
| Chrome | Latest | macOS 13+ | P0 | Required |
| Chrome | Latest | Android 12+ | P1 | Required |
| Firefox | Latest (120+) | Windows 10/11 | P1 | Required |
| Firefox | Latest | macOS 13+ | P2 | Nice to have |
| Edge | Latest (120+) | Windows 10/11 | P1 | Required |
| Safari | 16+ | macOS 13+ | P2 | Known limitations |
| Safari | 16+ | iOS 16+ | P2 | Known limitations |

**Note**: Safari has known WebGL/WebSocket limitations. Document gaps and workarounds.

### 4.2 Network Conditions

| Condition | Latency (RTT) | Packet Loss | Jitter | Priority | Expected Behavior |
|-----------|---------------|-------------|--------|----------|-------------------|
| Optimal | 30ms | 0% | 5ms | P0 | Smooth, no rubber-banding |
| Good | 60ms | 0% | 10ms | P0 | Slight delay, acceptable |
| Average | 120ms | 1% | 30ms | P1 | Noticeable lag, playable |
| Poor | 200ms | 3% | 60ms | P2 | Significant lag, test limits |
| Unstable | Variable 50-250ms | 5% | 80ms | P3 | Stress test edge cases |

**Test Setup**: Use browser DevTools network throttling or tool like `comcast`/`tc` for accurate simulation.

### 4.3 Performance Budgets

| Metric | Desktop Target | Mobile Target | Measurement |
|--------|---------------|---------------|-------------|
| Frame Rate | 60fps (95th percentile) | 30fps (95th percentile) | Performance API |
| Frame Time | < 16.7ms | < 33.3ms | requestAnimationFrame delta |
| Initial Load | < 3 seconds | < 5 seconds | Time to interactive |
| Memory Usage | < 500MB | < 300MB | Chrome DevTools Memory |
| Bandwidth (combat) | < 100 kbps | < 100 kbps | WebSocket traffic monitor |
| GC Pauses | < 10ms | < 10ms | Performance profiler |

### 4.4 Accessibility Requirements

| Requirement | Status | Validation Method |
|-------------|--------|-------------------|
| Keyboard Navigation | Required | Manual + Playwright tests |
| Screen Reader Support | Required | axe-core + manual validation |
| ARIA Roles/Labels | Required | axe-core automated scan |
| Color Contrast (WCAG AA) | Required | axe-core color contrast |
| Focus Indicators | Required | Visual inspection + tests |
| Reduced Motion Support | Required | Test prefers-reduced-motion |
| Colorblind Modes | Required | Visual validation with filters |
| Touch Target Size (≥44px) | Required | Mobile touch tests |

---

## 5. Test Scenarios

### 5.1 Core E2E Scenarios (Must Pass)

#### Scenario 1: Two-Player Match Flow
**Priority**: P0  
**Duration**: ~5 minutes  
**Steps**:
1. Launch server and two client instances
2. Both clients authenticate and join lobby
3. Create a match room
4. Second player joins room
5. Match starts, both players spawn
6. Execute movements: walk, sprint, crouch, jump, slide
7. ADS and fire weapons, verify hit registration
8. Confirm damage calculation (headshot/body multipliers)
9. Death and respawn cycle
10. Match timer expires or score limit reached
11. End-of-match screen displays correctly
12. Rewards distributed to both players
13. Return to lobby

**Expected Results**:
- Both players connect successfully
- No disconnections during match
- All inputs register correctly
- Hit registration accurate (< 5% false positives/negatives)
- Respawn within 3 seconds
- Scoreboard updates in real-time
- Rewards match performance

#### Scenario 2: Network Reconciliation
**Priority**: P1  
**Duration**: ~5 minutes per condition  
**Steps**:
1. Set network condition (120ms RTT, 1% loss)
2. Execute rapid movements and direction changes
3. Fire weapons and verify hits
4. Measure position correction magnitude

**Expected Results**:
- No rubber-banding > 1 meter in 95% of frames
- Hit registration within tolerance (< 10% missed shots due to lag)
- Smooth interpolation of remote players
- No visual jitter or teleportation

#### Scenario 3: Weapon Validation
**Priority**: P0  
**Duration**: ~3 minutes per weapon  
**Steps**:
1. Equip weapon in loadout
2. Fire at maximum RPM, measure actual fire rate
3. Attempt to fire with zero ammo
4. Reload and verify ammo count
5. Swap weapons and return, check state persistence
6. Test recoil pattern consistency

**Expected Results**:
- Actual RPM within ±5% of spec
- Cannot fire with zero ammo, dry-fire feedback shown
- Ammo counts accurate after reload
- Weapon state persists across swaps
- Recoil pattern deterministic

#### Scenario 4: Lag Compensation & Hit Detection
**Priority**: P0  
**Duration**: ~5 minutes  
**Steps**:
1. Set 200ms RTT condition
2. Execute headshot on moving target
3. Server rewinds to shooter's view time
4. Verify headshot damage applied
5. Test edge case: target behind cover in shooter's view
6. Verify server denies hit if target was covered at shooter's time

**Expected Results**:
- Headshots register correctly under lag
- No "ghost hits" (hits register when target was covered)
- Server rewind window limited to 250ms history
- LOS (line-of-sight) validation accurate

#### Scenario 5: Safe Spawn System
**Priority**: P1  
**Duration**: ~5 minutes  
**Steps**:
1. Start match with multiple players
2. Monitor all spawn locations
3. Verify no spawns within unsafe radius of enemies (10m default)
4. Test spawn wave logic (team spawns together when possible)
5. Verify fallback to emergency spawn if all zones unsafe

**Expected Results**:
- < 5% spawn deaths across 100+ spawns
- Spawn waves synchronized (80%+ team spawns together)
- Emergency spawn activates when needed
- No spawn camping exploits

#### Scenario 6: Shop & Economy Flow
**Priority**: P1  
**Duration**: ~5 minutes  
**Steps**:
1. Open shop interface
2. Browse items and preview
3. Select item and confirm purchase (using credits)
4. Verify credit deduction and inventory update
5. Purchase item with gems
6. Verify gem deduction
7. Equip purchased cosmetic in loadout
8. Start match and verify cosmetic applied

**Expected Results**:
- Shop loads within 2 seconds
- Item preview renders correctly
- Purchase transaction atomic (no double-spend)
- Inventory updates immediately
- Loadout persists across matches
- No stale pricing or inventory desyncs

#### Scenario 7: Battle Pass & Challenges
**Priority**: P2  
**Duration**: ~10 minutes  
**Steps**:
1. View current challenges (daily/weekly)
2. Complete challenge objective in match (e.g., 5 kills)
3. Verify progress increments
4. Complete challenge and claim reward
5. Check battle pass tier progression
6. Unlock battle pass tier reward
7. Verify reward added to inventory

**Expected Results**:
- Challenge progress tracks accurately
- Rewards claimed successfully
- Battle pass XP calculates correctly
- Tier unlocks grant items
- Inventory updates persist

#### Scenario 8: UI Accessibility
**Priority**: P1  
**Duration**: ~10 minutes  
**Steps**:
1. Navigate Main Menu using only keyboard (Tab, Enter, Esc)
2. Navigate Lobby with keyboard
3. Open Shop and navigate with keyboard
4. Access Loadouts and navigate with keyboard
5. Open Settings and navigate with keyboard
6. Run axe-core automated scan
7. Test with colorblind mode enabled

**Expected Results**:
- All interactive elements reachable via keyboard
- Focus indicators visible
- ARIA roles present (axe-core 0 critical violations)
- Colorblind modes distinguish UI elements
- Screen reader announces key information

#### Scenario 9: Mobile HUD & Controls
**Priority**: P2  
**Duration**: ~10 minutes  
**Steps**:
1. Open game on mobile device/emulator (Chrome Android)
2. Verify virtual joysticks render
3. Measure tap target sizes (should be ≥44px)
4. Test movement with left joystick
5. Test look controls with right touch area
6. Test fire, reload, ADS buttons
7. Enable reduced-motion setting
8. Measure frame rate during gameplay

**Expected Results**:
- Virtual controls render correctly
- All tap targets ≥44px
- Controls responsive (< 50ms input lag)
- 30+fps maintained during combat
- Reduced-motion option disables non-essential animations

---

### 5.2 Unit Test Coverage Areas

**Priority Modules** (aim for 80%+ coverage):
- `src/gameplay/`: InputManager, GameState, PlayerController, WeaponSystem, HitDetection, HealthSystem
- `src/weapons/`: WeaponDataLoader, weapon stat calculations
- `src/mechanics/`: ADSController, SpawnSystemClient, movement physics
- `src/networking/`: Client-side prediction, message encoding/decoding
- `server/`: Auth, Lobby, Economy, AntiCheat, Protocol validation

**Test Types**:
- **Unit**: Isolated module logic (pure functions, calculations)
- **Integration**: Module interactions (e.g., WeaponSystem + HitDetection)
- **E2E**: Full game flow automation with Playwright

---

## 6. Manual Playtest "Bug Bash" Protocol

### 6.1 Duration
60-90 minutes of intensive gameplay

### 6.2 Participants
- 2-3 live players (preferably 3+ to test multi-player edge cases)

### 6.3 Focus Areas

#### Movement & Collision
- Slide into corners, walls, obstacles
- Jump on slopes, stairs, ramps
- Test collision stuck states
- Look for map holes or out-of-bounds exploits
- Test player-to-player collision

#### Combat Edge Cases
- Reload cancel timing exploits
- Weapon swap state bugs (e.g., swap during reload)
- ADS transition state (can you fire during ADS animation?)
- Recoil/spread desync at low fps or high frame time
- Hip-fire vs ADS accuracy

#### Spawn System
- Test spawn camping potential
- Verify spawn safety (distance from enemies)
- Check spawn wave synchronization
- Test emergency spawn fallback

#### Map Balance
- Identify overpowered sightlines
- Look for objective fairness (KOTH zones, etc.)
- Test all weapon classes for viability
- Find degenerate strategies (camping spots, cheese tactics)

#### Network Edge Cases
- Disconnect/reconnect during match
- Test with packet bursts (simulate lag spikes)
- Out-of-order inputs
- Message flood attempts (rate limiting test)

#### Shop & Economy
- Double-purchase race condition attempts
- Stale price quotes after server update
- Inventory mismatch after reconnect
- Purchase items during match transition

### 6.4 Bug Reporting
For each issue discovered:
1. **Screen/Video Capture**: Record repro steps
2. **Reproduction Steps**: Detailed, numbered list
3. **Expected vs Actual**: What should happen vs what happened
4. **Frequency**: Always, Sometimes (50%), Rare (<10%)
5. **Priority Assignment**: P0/P1/P2/P3 based on definitions
6. **Environment**: Browser, OS, network condition

---

## 7. Bug Workflow

### 7.1 Process
1. **Discovery**: Found during playtest, E2E test failure, or user report
2. **Triage**: Assign priority (P0/P1/P2/P3)
3. **Test Creation**: Write failing unit/integration/E2E test that reproduces bug
4. **Fix Implementation**: Implement smallest safe fix
5. **Regression Coverage**: Add test coverage to prevent recurrence
6. **Code Review**: Peer review for safety and minimal scope
7. **Documentation**: Update `docs/CHANGELOG.md` and `docs/bugs/YYYY-MM-DD-<slug>.md`
8. **Deploy**: Merge to main, deploy to staging/production

### 7.2 Branch Naming
`fix/<short-slug>-<issue-id-if-any>`

Examples:
- `fix/weapon-swap-reload-bug-123`
- `fix/shop-double-purchase`

### 7.3 Commit Convention
`fix(scope): concise summary (#issue-id)`

Examples:
- `fix(weapons): prevent reload cancel exploit (#123)`
- `fix(shop): add transaction lock to prevent double-purchase (#124)`

### 7.4 Bug Report Template
File: `docs/bugs/YYYY-MM-DD-<slug>.md`

```markdown
# Bug Report: <Short Title>

**Date**: YYYY-MM-DD  
**Reporter**: Name  
**Priority**: P0/P1/P2/P3  
**Status**: Open/In Progress/Fixed/Closed

## Summary
Brief description of the issue.

## Steps to Reproduce
1. Step one
2. Step two
3. ...

## Expected Behavior
What should happen.

## Actual Behavior
What actually happens.

## Environment
- Browser: Chrome 120
- OS: Windows 11
- Network: 120ms RTT, 1% loss

## Root Cause Analysis
(After investigation)

## Fix Description
(After fix implemented)

## Tests Added
- Test file: `tests/unit/weapons/weapon-swap.spec.js`
- Coverage: Added 3 test cases for weapon swap edge cases

## Related Issues
- #123
- Duplicate of #456
```

---

## 8. Performance & Memory Testing

### 8.1 12-Player Benchmark
**Objective**: Ensure game performs well at high player counts

**Setup**:
1. Spawn 12 remote player entities (or simulate with bots)
2. Execute 5-minute simulated match
3. Monitor performance metrics

**Metrics to Capture**:
- FPS distribution (min, max, median, 95th percentile)
- Frame time histogram
- Memory usage over time
- GC pause frequency and duration
- Network bandwidth

**Acceptance Criteria**:
- 95th percentile frame time < 20ms (50fps minimum)
- Memory usage stable (no leaks, < 700MB desktop)
- GC pauses < 10ms
- Bandwidth < 120 kbps during intense combat

### 8.2 Memory Leak Detection
**Method**:
1. Play 10-minute session
2. Take heap snapshot at start
3. Take heap snapshot after 10 minutes
4. Compare retained size

**Check for**:
- Unreleased Three.js geometries/materials/textures
- Orphaned event listeners
- Large arrays not cleared
- Pooled objects not returned to pool

**Tools**:
- Chrome DevTools Memory Profiler
- Three.js `dispose()` calls
- Custom pooling system audit

### 8.3 Performance Report
File: `performance/metrics.md`

Include:
- FPS distributions (desktop vs mobile)
- Frame time histograms
- Memory usage charts
- Bandwidth usage over time
- GC pause analysis
- Recommendations for optimization

---

## 9. Security & Anti-Cheat Checks

### 9.1 Speed Hacks
**Test**: Send excessive position deltas to server  
**Expected**: Server rejects and logs suspicious activity  
**Validation**: Player movement clamped to maximum speed

### 9.2 RPM Hacks
**Test**: Send fire messages faster than weapon RPM allows  
**Expected**: Server rate-limits and rejects excess shots  
**Validation**: Server tracks last shot timestamp per player

### 9.3 Ammo Hacks
**Test**: Send fire messages with manipulated ammo count  
**Expected**: Server maintains authoritative ammo count  
**Validation**: Server ignores client ammo claims

### 9.4 Aim Assistance Detection
**Test**: Send shots with inhuman accuracy (instant 180° flicks)  
**Expected**: Server flags suspicious aim patterns  
**Validation**: Statistical analysis of aim behavior

### 9.5 Heartbeat & Timeout
**Test**: Stop sending heartbeats  
**Expected**: Server disconnects after HEARTBEAT_TIMEOUT_MS  
**Validation**: Client kicked within timeout window

### 9.6 Reconnection Flow
**Test**: Disconnect and reconnect mid-match  
**Expected**: Player rejoins match in progress, state restored  
**Validation**: Player inventory, loadout, and match state persist

### 9.7 WSS Readiness
**Test**: Enable WSS (secure WebSocket) flag  
**Expected**: Server accepts wss:// connections  
**Validation**: Certificate validation, encrypted transport

---

## 10. Deliverables

### 10.1 Test Documentation
- ✅ `tests/test-plan.md` (this document)
- `docs/qa/weekly-report.md` (template created, updated weekly)
- `docs/bugs/YYYY-MM-DD-<slug>.md` (per significant bug)

### 10.2 Automated Tests
- `tests/unit/**/*.spec.js` - Unit tests for core modules
- `tests/integration/**/*.spec.js` - Integration tests for system interactions
- `tests/e2e/**/*.spec.js` - Playwright E2E tests for full flows
- `tests/a11y/**/*.spec.js` - Accessibility tests with axe-core
- `tests/perf/match-benchmark.spec.js` - Performance benchmarks

### 10.3 CI/CD Pipeline
- `.github/workflows/test.yml` - Automated test runner
- Test runs on PR open, commit push
- Reports test results, coverage, performance metrics

### 10.4 Bug Reports
- All P0/P1 bugs documented with repro steps
- Root cause analysis for significant issues
- Fix implementation linked to bug report

### 10.5 Performance Reports
- `performance/metrics.md` - Ongoing performance data
- FPS distributions, memory usage, bandwidth charts
- Optimization recommendations

---

## 11. Entry/Exit Criteria

### 11.1 Entry Criteria (Start Testing)
- ✅ Game server and client build successfully
- ✅ Core gameplay systems implemented
- ✅ Basic multiplayer functional
- ✅ Shop and economy basic implementation exists
- ✅ Test plan reviewed and approved

### 11.2 Exit Criteria (Testing Complete)
- ❌ No known P0/P1 bugs remain open
- ❌ All P2/P3 bugs documented with tracked tests
- ❌ E2E test suite green locally and in CI
- ❌ Core scenarios pass in Chrome, Firefox, Edge (Safari documented gaps OK)
- ❌ Performance budgets met (desktop 60fps, mobile 30+fps)
- ❌ No memory leaks detected in 10-minute session
- ❌ Accessibility checks pass (axe-core 0 critical violations)
- ❌ Shop/economy flows consistent and secure
- ❌ All fixes have regression tests
- ❌ CHANGELOG updated with all bug fixes
- ❌ Weekly QA report published

---

## 12. Test Schedule & Milestones

### Week 1: Infrastructure & Core Tests
- ✅ Day 1-2: Create test plan, set up test infrastructure
- Day 3-4: Implement unit tests for core gameplay modules
- Day 5: Implement integration tests for weapon/hit detection systems

### Week 2: E2E Scenarios & Playtest
- Day 1-2: Implement E2E tests (scenarios 1-4)
- Day 3: Implement E2E tests (scenarios 5-9)
- Day 4: Manual playtest bug bash (60-90 minutes)
- Day 5: Document and triage discovered bugs

### Week 3: Bug Fixing & Performance
- Day 1-3: Fix P0/P1 bugs with tests
- Day 4: Performance profiling and optimization
- Day 5: Security/anti-cheat validation

### Week 4: Polish & Documentation
- Day 1-2: Fix remaining P2 bugs
- Day 3: Accessibility validation and fixes
- Day 4: Weekly QA report, performance report
- Day 5: Final validation, exit criteria check

---

## 13. Tools & Technologies

### Testing Frameworks
- **Vitest**: Unit and integration testing (Jest-compatible, fast)
- **Playwright**: E2E testing with browser automation
- **axe-core**: Accessibility testing (WCAG compliance)

### Performance Tools
- **stats.js**: Real-time FPS monitoring
- **Performance API**: Frame timing, navigation timing
- **Chrome DevTools**: Memory profiler, network monitor
- **Lighthouse**: Overall performance audit

### Network Simulation
- **Chrome DevTools Network Throttling**: Built-in latency/bandwidth simulation
- **comcast** (Linux/Mac): Advanced network condition simulation
- **tc** (Linux): Traffic control for packet loss/delay

### CI/CD
- **GitHub Actions**: Automated test runner
- **Playwright Test**: Parallel test execution, trace/screenshot capture

---

## 14. Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Safari WebGL limitations | High | High | Document limitations, provide fallbacks, prioritize Chrome/Firefox |
| Network condition flakiness | Medium | Medium | Use deterministic network simulation, retry flaky tests, increase timeouts |
| Memory leaks in Three.js | High | Medium | Strict dispose() hygiene, memory profiling in CI |
| Anti-cheat false positives | Medium | Low | Conservative thresholds, logging for review |
| Test environment setup complexity | Low | High | Dockerize test environment, document setup |

---

## 15. Success Metrics

### Test Coverage
- **Target**: 80%+ coverage for priority modules
- **Measurement**: Vitest coverage report

### Test Stability
- **Target**: < 2% flaky test rate
- **Measurement**: Track test pass/fail rate over 10 runs

### Bug Detection
- **Target**: Find and fix 90%+ of P0/P1 bugs before production
- **Measurement**: Bug tracking in issues

### Performance
- **Target**: All performance budgets met
- **Measurement**: Automated performance benchmarks

### Accessibility
- **Target**: 0 critical axe-core violations
- **Measurement**: axe-core report in CI

---

## 16. Contact & Escalation

**Test Plan Owner**: QA Lead  
**Engineering Escalation**: Engineering Manager  
**Product Escalation**: Product Manager

For urgent P0 issues, escalate immediately via Slack/email.

---

## Appendix A: Test Environment Setup

### Local Development
```bash
# Install dependencies
npm ci

# Run unit tests
npm run test:unit

# Run E2E tests (requires server running)
npm run server &
npm run test:e2e

# Run all tests
npm run test

# Run with coverage
npm run test:coverage
```

### CI Environment
See `.github/workflows/test.yml` for automated test pipeline configuration.

---

## Appendix B: Glossary

- **ADS**: Aim Down Sights
- **RPM**: Rounds Per Minute (fire rate)
- **TTK**: Time To Kill
- **RTT**: Round-Trip Time (network latency)
- **LOD**: Level of Detail
- **LOS**: Line of Sight
- **GC**: Garbage Collection
- **WCAG**: Web Content Accessibility Guidelines
- **ARIA**: Accessible Rich Internet Applications

---

**Document Status**: Active  
**Next Review**: Weekly during testing phase, monthly after release  
**Version History**:
- v1.0.0 (2025-11-06): Initial test plan created
