# Arena Blitz - Game Design System

A comprehensive game design system for a competitive browser-based FPS with balanced gunplay, fair progression, and player-first monetization.

## 📋 Overview

Arena Blitz is designed as an addictive, fair, multiplayer FPS with:
- **Short, high-intensity rounds** (6-10 minutes)
- **Balanced gunplay meta** across 5 weapon classes
- **Fair economy** with earnable Credits and premium Gems
- **No pay-to-win** mechanics
- **Clear player progression** with multiple retention loops

## 🎯 Core Design Pillars

1. **Competitive Fairness**: TTK parity, balanced maps, skill-based matchmaking
2. **Player Progression**: 8-12 hour grind to mid-tier, clear unlock paths
3. **F2P Friendly**: Generous credit earning, cosmetics-only premium items
4. **Retention Loops**: Daily/weekly challenges, battle pass, seasonal content
5. **Data-Driven**: Comprehensive analytics and A/B testing framework

## 📁 Repository Structure

```
/data
  /weapons          - Weapon stats, attachments, progression
  /maps             - Map layouts, callouts, spawn zones
  /progression      - Player levels, challenges, battle pass
  /economy          - Currencies, shop, prices, rewards

/balance            - Recoil patterns and balance tuning

/game-modes         - Mode configurations (TDM, KOTH, etc.)

/docs               - Design documentation and guidelines
  spawn_system.md   - Spawn system design
  map_guidelines.md - Map design standards
  ranked_mmr.md     - Ranked system and MMR

/analytics          - KPIs, events, A/B test plans
```

## 🔫 Weapon System

### Weapons (10 Total)

**Assault Rifles** (2):
- MK-4: Versatile mid-range rifle (650 RPM, 28 dmg)
- Vanguard: High damage, controlled (550 RPM, 32 dmg)

**SMGs** (2):
- Phantom: High mobility CQB (900 RPM, 22 dmg)
- Scorpion: Balanced SMG (800 RPM, 24 dmg)

**Shotguns** (2):
- Enforcer: Pump-action powerhouse (80 RPM, 8 pellets)
- Auto-12: Semi-auto shotgun (180 RPM, 8 pellets)

**Snipers** (2):
- Longshot: Bolt-action precision (48 RPM, 95 dmg)
- Marksman: Semi-auto DMR (220 RPM, 58 dmg)

**Sidearms** (2):
- P-9 Pistol: Reliable backup (400 RPM, 30 dmg)
- Magnum Revolver: High damage (180 RPM, 55 dmg)

### Attachments (28 Total)

**Trade-Off Philosophy**: Every attachment has clear pros/cons
- Barrels: Range vs mobility
- Sights: Precision vs ADS speed
- Underbarrel: Recoil vs handling
- Magazines: Capacity vs reload speed
- Stocks: Stability vs mobility

**Max Advantage**: +10% in niche, compensated by penalties

### Balance Targets

**TTK Parity** (within 10-15%):
- Close range: 250-350ms (SMG/Shotgun optimal)
- Mid range: 300-450ms (AR optimal)
- Long range: 400-700ms (Sniper optimal)

See: `data/weapons/weapons.json`, `data/weapons/attachments.json`, `balance/recoil_patterns.json`

## 🗺️ Maps

### Arena Hub (Symmetrical)
- **Size**: 80m x 70m
- **Layout**: Three-lane symmetrical
- **Engagement**: 30% close, 35% medium, 10% long
- **Features**: Warehouse, Plaza, Catwalk
- **Modes**: TDM, KOTH, Domination

### Shipyard (Asymmetric)
- **Size**: 90m x 75m
- **Layout**: Three-lane asymmetric with verticality
- **Engagement**: 50% close, 30% medium, 10% long
- **Features**: Docks, Container Yard, Ship Interior
- **Modes**: TDM, KOTH, Domination, S&D

### Design Guidelines

All maps follow:
- **Three-lane structure** with distinct characteristics
- **Sightline limits**: Max 80m, average 25-35m
- **Cover distribution**: 85+ objects with 4.5m avg spacing
- **Rotation timings**: 6-10s lane-to-lane, 18-25s full traverse
- **Verticality**: 2-3 height levels with clear access routes

See: `data/maps/`, `docs/map_guidelines.md`

## 🎮 Game Modes

### Team Deathmatch
- **Duration**: 10 minutes or 75 kills
- **Teams**: 6v6
- **Scoring**: 1 point per kill
- **Focus**: Pure gunplay, constant action

### King of the Hill
- **Duration**: 8 minutes or 200 points
- **Teams**: 6v6
- **Objective**: Control rotating zones
- **Scoring**: 2 points/second while controlling
- **Zone Rotation**: Every 60 seconds

See: `game-modes/`

## 📈 Progression System

### Player Levels (100 Levels + Prestige)
- **Level 1-20**: Core unlocks (8-10 hours)
- **Level 20-50**: Variety and cosmetics (25-30 hours)
- **Level 50-100**: Prestige rewards (80-100 hours)
- **Prestige**: 10 tiers with exclusive emblems

### Weapon Progression (15 Levels per Weapon)
- **Level 5**: Most functional attachments unlocked (~2-3 hours)
- **Level 10**: Advanced attachments (~6-8 hours)
- **Level 15**: Gold camo prestige (~10-12 hours)

### Challenges
- **Daily**: 3 active, 350-450 credits/day
- **Weekly**: 3 active, 1850-2650 credits/week
- **Seasonal**: 4 long-term goals with exclusive rewards

### Battle Pass (50 Tiers)
- **Free Track**: 12 cosmetics, 3500 credits
- **Premium Track**: 50 rewards, 9 weapon skins, 2 operators
- **Price**: 1000 gems ($9.99)
- **Completion**: 50-70 hours for active players

### Ranked System
- **Tiers**: Iron → Bronze → Silver → Gold → Platinum → Diamond → Master → Grandmaster → Champion (Top 500)
- **MMR**: Hybrid Elo system with placement matches
- **Seasons**: 8-12 weeks with soft reset
- **Rewards**: Credits, cosmetics, exclusive titles

See: `data/progression/`, `docs/ranked_mmr.md`

## 💰 Economy System

### Currencies

**Credits (Earnable)**:
- Earned: Matches, challenges, battle pass, level-ups
- Spent: Common/rare cosmetics, rerolls, name changes
- Rate: 400-900 credits/hour depending on performance

**Gems (Premium)**:
- Purchased: $4.99 - $99.99 packages
- Spent: Battle pass, epic/legendary cosmetics, bundles
- Free: 300-400 gems/month from events and battle pass

### Shop Inventory (175+ Items)

**Weapon Skins**: 45 total
- Common: 2,500 credits
- Rare: 5,000 credits
- Epic: 12,000 credits or 850 gems
- Legendary: 1,750-2,000 gems (reactive, custom sounds)

**Operator Skins**: 12 total (rare to legendary)

**Accessories**: 93 total
- Charms: 20
- Sprays: 30
- Player Cards: 25
- Emblems: 20
- Emotes: 15
- Finishers: 8

**Bundles**: 12+ themed bundles (20-35% discount)

### Pricing Strategy
- **Battle Pass**: Best value (7.5x ROI)
- **Regional Pricing**: Adjusted for purchasing power parity
- **No Loot Boxes**: All prices transparent
- **F2P Viable**: 35k-50k credits/month enables meaningful purchases

### Monetization Targets
- **Conversion Rate**: 8-12%
- **ARPDAU**: $0.15-$0.25
- **ARPPU**: $8-$15/month
- **LTV**: $25-$50 over 12 months

See: `data/economy/`

## 📊 Analytics & KPIs

### Core KPIs

**Engagement**:
- DAU/MAU: 10,000+ / 120,000+ (6-month target)
- Session Duration: 35-50 minutes
- Sessions/User/Day: 2.0-2.5

**Retention**:
- D1: 40-50%
- D7: 20-30%
- D30: 10-15%

**Monetization**:
- Conversion: 8-12%
- ARPDAU: $0.15-$0.25
- Battle Pass Adoption: 30-40%

**Game Health**:
- Match Completion: >92%
- Queue Time: <60s (Iron-Gold)
- Match Balance: <100 MMR difference

### Events (60+ Tracked)
Categories:
- Session (start, end)
- Match (queue, start, end)
- Gameplay (kill, death, objective)
- Progression (level up, unlock)
- Economy (earn, spend, purchase)
- Social (party, friend)

### A/B Tests (15 Planned)
Focus areas:
1. **Weapon Balance**: TTK bands, recoil patterns, falloff curves
2. **Reward Rates**: Match rewards, streaks, challenges
3. **Progression**: XP curves, battle pass pacing
4. **Shop**: Layout, pricing, bundle discounts
5. **Matchmaking**: MMR ranges, party matching

See: `analytics/`

## 🎯 Acceptance Criteria

✅ **Weapon Balance**:
- TTK parity within 10-15% at intended ranges
- No universal dominant build
- Clear weapon class niches
- Attachments introduce choice, not power creep

✅ **Maps**:
- Support multiple playstyles
- No spawn traps (spawn deaths <5%)
- All weapon classes viable in their zones
- Rotation timings enable tactical repositioning

✅ **Progression**:
- 8-12 hours to mid-tier (level 20, weapon level 5)
- Daily/weekly loops feel rewarding
- Challenges achievable in 1-2 hours (daily), 8-12 hours (weekly)

✅ **Economy**:
- F2P can earn meaningful cosmetics
- No pay-to-win advantages
- Battle pass best value proposition
- Regional pricing fair and accessible

✅ **Technical**:
- All JSON files validated ✓
- Numbers documented and balanced ✓
- Design rationale explained in docs ✓
- References to successful games included ✓

## 🔧 Implementation Notes

### For Networking/Gameplay Teams

**Shared Schemas**:
- Currency: `{id, type, display_name, symbol}`
- Shop Item: `{id, type, price: {credits?, gems?}, rotation, contents[]}`
- Loadout: `{primary_id, secondary_id, attachments: {slot: id}[], skins[]}`
- Match Config: `{mode_id, map_id, team_size, time_limit_s, score_limit}`

**Analytics Events**: Names defined in `analytics/events.json`, payload schemas to be refined by implementation teams

### Data Validation

All JSON files validated with:
```bash
python3 -m json.tool <file.json>
```

All files pass validation ✓

## 📚 References and Inspirations

**Weapon Balance**:
- CS:GO: TTK targets, spray patterns
- Valorant: Damage falloff, ability integration
- Call of Duty: Attachment system

**Maps**:
- Dust2 (CS:GO): Three-lane mastery
- Crossfire (Valorant): Symmetrical design
- Haven (Valorant): Asymmetric balance

**Progression**:
- Call of Duty: Weapon prestige, challenges
- Apex Legends: Battle pass structure
- Fortnite: Seasonal content model

**Economy**:
- Valorant: Premium currency and bundle pricing
- Fortnite: Battle pass value proposition
- League of Legends: Long-term F2P balance

**Analytics**:
- Amplitude: Event taxonomy
- Mixpanel: Product analytics
- Unity Analytics: Game-specific KPIs

## 🧪 Testing & Quality Assurance

Arena Blitz has a comprehensive test suite ensuring game stability, performance, and quality.

### Test Suite Overview
- **Unit Tests**: 81+ tests covering core gameplay systems
- **Integration Tests**: System interaction validation
- **E2E Tests**: Full game flow automation with Playwright
- **Accessibility Tests**: WCAG 2.1 Level AA compliance
- **Performance Tests**: FPS monitoring and memory leak detection

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run unit tests with coverage
npm run test:unit:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests in headed mode
npm run test:e2e:headed

# Run accessibility tests
npm run test:a11y

# Run performance tests
npm run test:perf
```

### Test Coverage
- **Priority Modules**: 70%+ coverage target
- **Health System**: ✅ 100% coverage
- **Authentication**: ✅ 100% coverage
- **Hit Detection**: ✅ 95% coverage
- **Combat Integration**: ✅ Full flow tests

### CI/CD Integration
Tests run automatically on:
- Every push to main/develop branches
- Every pull request
- Automated test reports and coverage

### Documentation
- [Comprehensive Test Plan](tests/test-plan.md)
- [Test Suite README](tests/README.md)
- [QA Weekly Report Template](docs/qa/weekly-report-template.md)

## 🚀 Next Steps

### For Development Team:
1. Implement weapon stat system using `data/weapons/weapons.json`
2. Build attachment system with trade-off calculations
3. Create map layouts from JSON specifications
4. Integrate progression and unlock systems
5. Implement economy and shop UI
6. Set up analytics event tracking
7. Build A/B testing infrastructure

### For QA Team:
1. ✅ Test infrastructure set up (Vitest, Playwright, axe-core)
2. ✅ 81+ unit and integration tests passing
3. Validate weapon TTK at specified ranges
4. Test attachment trade-offs and combinations
5. Verify map spawn safety and rotation timings
6. Check progression unlock flow
7. Test economy credit earning and spending
8. Validate shop prices and bundle discounts
9. Run manual playtest sessions
10. Document and fix discovered bugs

### For LiveOps Team:
1. Plan seasonal content roadmap
2. Design weekly challenge rotations
3. Create limited-time offers and bundles
4. Monitor KPIs and adjust based on targets
5. Run A/B tests per analytics plan
6. Respond to player feedback and balance concerns

## 📝 Version History

**v1.0.0** - Initial game design system
- 10 weapons with full stats and TTK analysis
- 28 attachments with clear trade-offs
- 2 maps with detailed layouts
- 2 game modes (TDM, KOTH)
- Complete progression system (player levels, weapon XP, challenges, battle pass, ranked)
- Full economy (currencies, shop, prices, rewards)
- Analytics framework (events, KPIs, A/B tests)

## 📞 Contact and Support

For questions about this design system:
- Game Design Lead: [Design decisions and balance]
- Economy Designer: [Monetization and pricing]
- Analytics Lead: [KPIs and A/B testing]

---

## License

This game design system is proprietary and confidential.

© 2025 Arena Blitz. All rights reserved.
