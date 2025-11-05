# Ranked MMR System Design

## Overview
Arena Blitz uses a hybrid MMR (Matchmaking Rating) and visible rank system to provide competitive gameplay with clear progression. The system balances accurate skill measurement with engaging rank advancement.

## Rank Tiers

### Tier Structure

| Tier | Division | MMR Range | Percentile | Population Target |
|------|----------|-----------|------------|-------------------|
| Iron | I-III | 0-599 | 0-10% | Bottom 10% |
| Bronze | I-III | 600-899 | 10-25% | 15% |
| Silver | I-III | 900-1199 | 25-50% | 25% |
| Gold | I-III | 1200-1499 | 50-70% | 20% |
| Platinum | I-III | 1500-1799 | 70-85% | 15% |
| Diamond | I-III | 1800-2099 | 85-95% | 10% |
| Master | - | 2100-2399 | 95-98% | 3% |
| Grandmaster | - | 2400+ | 98-99.5% | 1.5% |
| Champion | - | Top 500 | 99.5-100% | Top 500 players |

**Total Divisions**: 22 (3 per tier for Iron-Diamond, Master/GM/Champion single division)

### Rank Display
- **Primary Display**: Tier + Division (e.g., "Gold II")
- **Secondary Display**: MMR number (visible to player only)
- **Leaderboard**: Top 500 Champions show exact leaderboard position

## MMR System

### Initial Placement

**Placement Matches**: 10 required games
- Start at 1000 MMR (provisional)
- Hidden during placement
- Increased K-factor (40) for faster calibration
- Match against players in placement + Silver/Gold tiers
- Reveal rank after 10th match

**Placement Match Scoring**:
- Win: +40 MMR
- Loss: -40 MMR  
- Personal performance modifier: ±10 MMR
- Final placement range: 400-1600 MMR typical

**Placement Protection**: Cannot drop below Iron I during first 20 ranked games

### MMR Calculation

**Base Elo Formula**:
```
New MMR = Old MMR + K * (Actual - Expected)
```

Where:
- **K-factor**: Determines rating volatility
  - Placement (games 1-10): K = 40
  - New player (games 11-50): K = 32
  - Established (games 51-150): K = 24
  - Veteran (games 151+): K = 20
  - Master+: K = 16 (slower changes at high level)

- **Expected Score**: Based on team MMR difference
  - Expected Win% = 1 / (1 + 10^((OpponentMMR - YourMMR)/400))

- **Actual Score**:
  - Win: 1.0
  - Loss: 0.0

**Performance Modifier** (applied after base calculation):
- Top player on winning team: +3 MMR
- Top 3 on winning team: +2 MMR
- Bottom player on winning team: -1 MMR
- Top player on losing team: +2 MMR (reduced loss)
- Bottom player on losing team: -2 MMR (increased loss)

### Win/Loss MMR Examples

**Balanced Match** (both teams ~1500 MMR):
- Win: +20 MMR (base)
- Loss: -20 MMR (base)
- With performance: +17 to +23 (win), -22 to -18 (loss)

**Favored to Win** (your team avg 1600 vs 1500):
- Win: +15 MMR
- Loss: -25 MMR

**Underdog** (your team avg 1400 vs 1500):
- Win: +25 MMR
- Loss: -15 MMR

**Stomp Victory** (3-0 rounds, high K/D):
- Win: +22 MMR
- Loss: -18 MMR

## Rank Points (RP) System

While MMR drives matchmaking, players see **Rank Points (RP)** for visible progression within divisions.

### RP Structure
- Each division requires 100 RP to advance
- RP gains/losses based on MMR changes but smoothed for psychology
- RP conversion: 1 MMR ≈ 5 RP within tier

**RP Gains**:
- Win in MMR-appropriate tier: +20-25 RP
- Win while below tier MMR: +30-35 RP (faster climb)
- Win while above tier MMR: +15-20 RP (slower climb, approaching true rank)

**RP Losses**:
- Loss in MMR-appropriate tier: -18-22 RP
- Loss while below tier MMR: -15-18 RP
- Loss while above tier MMR: -22-25 RP

**Demotion Protection**:
- First time reaching a tier: 3-game protection from demotion
- Cannot drop below 0 RP in division I of each tier for first 5 games
- After protection expires, can demote at -1 RP

### Promotion and Demotion

**Promotion**:
- Reach 100 RP in division III: Immediate promotion to next tier, division I
- Reach 100 RP in division II: Immediate promotion to division III
- Master tier: Promotion at 2100 MMR
- Grandmaster: Promotion at 2400 MMR
- Champion: Must be top 500 globally

**Demotion**:
- Drop to -1 RP after protection expires: Demote to previous division
- Division I to previous tier: Requires 2 consecutive losses at 0 RP (with buffer)
- Demotion down tiers lands at 50 RP in division III of previous tier

## Matchmaking

### Queue System

**Primary Queue**: Ranked 6v6
- Solo/Duo queue only
- Parties of 3+ use Unranked playlist

**Matchmaking Priorities** (in order):
1. MMR proximity (±100 MMR ideal, ±200 max initial)
2. Party size (solo vs solo, duo vs duo when possible)
3. Connection quality (ping <80ms preferred)
4. Wait time (expand range after 2 minutes)

### Search Range Expansion

| Wait Time | MMR Range | Rank Restriction |
|-----------|-----------|------------------|
| 0-60s | ±100 | ±1 tier |
| 60-120s | ±150 | ±2 tiers |
| 120-180s | ±200 | ±3 tiers |
| 180s+ | ±250 | No restriction |

**High MMR Considerations** (Diamond+):
- Longer queue times expected
- May match with Platinum players during off-peak
- Champion players may match with Masters during off-peak

### Team Balancing

**Team MMR Average**: Must be within ±50 MMR between teams
**Intra-team Balance**: Minimize MMR spread within team (prefer 5 similar players over 1 high + 4 low)

**Role Distribution** (if tracked):
- Attempt to distribute weapon preferences across team
- Avoid 5 sniper mains on one team

## Seasonal System

### Season Structure

**Duration**: 8-12 weeks per season
**Total Seasons per Year**: 4-6 seasons

### Season Reset

**Soft Reset Formula**:
```
New MMR = (Old MMR + 1200) / 2
```

**Reset Examples**:
- Iron I (500 MMR) → Bronze II (850 MMR)
- Silver III (1100 MMR) → Silver I (1150 MMR)
- Platinum I (1500 MMR) → Gold II (1350 MMR)
- Master (2200 MMR) → Platinum II (1700 MMR)

**Reset Goals**:
- High-ranked players replay through lower ranks (engagement)
- Provides "easier" early season for lower ranks
- Re-establishes accurate rankings
- Creates excitement for new season climb

**Rank Floors**:
- Iron I: Cannot reset below 400 MMR
- Previous season Diamond+: Cannot reset below Gold III

### Seasonal Rewards

**End of Season Rewards** (based on highest rank achieved):

| Rank Tier | Credits | Cosmetic Reward |
|-----------|---------|-----------------|
| Iron | 500 | Seasonal banner |
| Bronze | 750 | Seasonal emblem |
| Silver | 1,000 | Seasonal spray |
| Gold | 1,500 | Seasonal weapon charm |
| Platinum | 2,500 | Seasonal weapon skin |
| Diamond | 4,000 | Animated weapon skin |
| Master | 6,000 | Unique title + animated emblem |
| Grandmaster | 10,000 | Exclusive emote + title |
| Champion (Top 500) | 15,000 | Exclusive operator skin + title |
| Champion (Top 100) | 25,000 | Legendary bundle + title |
| Champion (Top 10) | 50,000 | Ultimate bundle + special recognition |

**Mid-Season Rewards**: Smaller milestone rewards at rank-up thresholds

## Rank Decay

### Decay Rules

**Inactivity Threshold**: 14 days without ranked match

**Decay Amount**:
- Platinum and below: No decay
- Diamond: -10 MMR per day after 14 days
- Master: -15 MMR per day after 14 days
- Grandmaster: -20 MMR per day after 7 days
- Champion: -25 MMR per day after 7 days

**Maximum Decay**:
- Diamond: Cannot decay below Diamond III (1800 MMR)
- Master: Cannot decay below Platinum I (1500 MMR)
- Grandmaster: Cannot decay below Diamond I (1800 MMR)
- Champion: Can decay to Master

**Decay Protection**:
- One ranked game per 14 days resets decay timer
- Vacation mode: 7-day protection, usable once per season
- Tournament participants get decay protection during tournament

## Party Restrictions

### Queue Limitations

**Solo/Duo Queue**:
- Solo players only (fully solo)
- OR duo parties only (both players together)
- Mixed solo + duo allowed

**Ranked Flex Queue** (Future):
- Parties of 1-5 allowed
- Separate MMR from Solo/Duo
- Faces other parties

### Duo Queue MMR Adjustment

When duo queueing:
- Team MMR calculated normally
- Matchmaking assumes +25 MMR advantage for coordination
- Face slightly higher MMR opponents
- Same RP gains/losses

**Rank Restrictions for Duo**:
- Must be within 3 tiers of each other
- Champion players: Can duo with Grandmaster+ only
- Grandmaster: Can duo with Diamond I+ only
- Master and below: 3 tier restriction

## Anti-Abuse Systems

### Smurf Detection

**Indicators**:
- High K/D ratio during placement
- Win rate >70% over first 20 games
- Mouse accuracy/headshot % above percentile
- Gameplay patterns matching higher tiers

**Response**:
- Accelerated MMR gains (K-factor +10)
- Match against higher MMR opponents
- Skip divisions on promotion
- Flag for review if extreme

### Account Boosting Detection

**Indicators**:
- Sudden MMR spikes (>200 in 10 games)
- Drastic playstyle changes (accuracy, weapon choice)
- Login location changes + performance changes
- Historical performance inconsistency

**Response**:
- MMR freeze and investigation
- Potential rank reset
- Temporary ban if confirmed

### Cheating

**Detection**: Separate anti-cheat system
**Punishment**: MMR void for past matches, permanent ban

### Match Dodging

**Dodge Penalty**:
- First dodge: -10 RP, 5-minute lockout
- Second dodge (same day): -20 RP, 15-minute lockout
- Third dodge: -50 RP, 1-hour lockout
- Frequent dodgers: Temporary ranked ban

**Dodge Forgiveness**:
- 1 penalty-free dodge per day
- Reset timer: 24 hours

### AFKing and Griefing

**AFK Detection**: No input for 60+ seconds
**Punishment**:
- -50 RP
- Temporary ranked ban (scaling: 30min → 2hr → 24hr → 7 days)
- No MMR loss for affected teammates (loss prevented)

## Matchmaking Quality Metrics

### Target Metrics

**MMR Disparity**:
- Average match MMR difference: <100
- 90th percentile: <150
- 95th percentile: <200

**Queue Times**:
- Iron-Gold: <60 seconds average
- Platinum: <90 seconds average
- Diamond: <120 seconds average
- Master+: <180 seconds average

**Match Quality**:
- Average match duration: 8-12 minutes
- Win rate by MMR disparity: ±5% for balanced matches
- Player-reported match quality >4.0/5.0

### Analytics Tracking

**Per Match**:
- Team MMR delta
- Queue time
- Party compositions
- Match outcome and duration
- Player performance vs expected

**Per Player**:
- MMR trajectory over time
- Win rate by role/weapon
- Consistency metrics
- Queue dodge rate
- Report rate

## Communication and Transparency

### Visible to Players

**Always Visible**:
- Current rank and division
- RP in current division
- RP gain/loss per match
- Wins/losses this season
- Placement match progress

**Visible on Request**:
- Exact MMR number
- MMR gain/loss per match
- Match MMR distribution
- Performance impact on MMR
- Historical rank graph

**Hidden**:
- Opponent MMR (prevents dodging)
- Matchmaking parameters
- Smurf/boosting flags
- Internal K-factors

### Player Education

**Tutorial**: Explain rank system before first ranked game
**FAQ**: In-game help explaining MMR, RP, decay, etc.
**Rank Progress Screen**: Clear visualization of tier progress
**Season Overview**: Show reset mechanics, rewards, and goals

## Future Improvements

### Potential Additions

1. **Role Queue**: Separate MMR for different playstyles (future)
2. **Skill-Based Rating**: Track accuracy, positioning, game sense separately
3. **Team Ranked**: Full 6-stack competitive mode
4. **Tournament Integration**: Ranked points from tournament performance
5. **Dynamic K-factors**: Machine learning to optimize rating changes
6. **Cross-Region Ranked**: Allow higher ranks to queue cross-region

### A/B Testing Plans

- K-factor values for optimal convergence
- Placement match count (5 vs 10 vs 15)
- Decay rates and thresholds
- RP gain/loss smoothing
- Promotion/demotion buffer sizes

## References and Inspiration

- **Riot Games (Valorant, LoL)**: Ranked tiers, placement matches, soft resets
- **Blizzard (Overwatch)**: SR system, top 500, decay mechanics
- **Valve (CS:GO)**: Elo-based matchmaking, trust factor
- **Activision (Call of Duty)**: Seasonal rank rewards, skill divisions
- **Chess.com**: Pure Elo implementation for accuracy comparison

## Conclusion

The Arena Blitz ranked system balances:
- **Accuracy**: True MMR for fair matches
- **Engagement**: Visible ranks and progression
- **Fairness**: Anti-smurf and anti-boost measures
- **Retention**: Seasonal resets and rewards
- **Competitive Integrity**: Strict queue restrictions and decay

This creates a competitive environment that rewards skill while remaining accessible and engaging for players of all levels.
