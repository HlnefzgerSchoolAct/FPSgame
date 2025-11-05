# Key Performance Indicators (KPIs)

## Overview
This document defines the critical metrics for measuring Arena Blitz's success across player engagement, monetization, retention, and game health. These KPIs drive product decisions and optimization.

## Engagement Metrics

### Daily Active Users (DAU)
**Definition**: Unique users who log in on a given day

**Target**: 10,000+ DAU within 6 months of launch

**Calculation**:
```
DAU = COUNT(DISTINCT user_id WHERE session_start IN date)
```

**Tracking**:
- Monitor daily trends
- Compare weekday vs weekend
- Track by region/platform
- Identify seasonal patterns

**Success Indicators**:
- Month-over-month growth >10%
- Stable weekend peaks
- Positive response to content updates

---

### Weekly Active Users (WAU)
**Definition**: Unique users who log in during a 7-day period

**Target**: 40,000+ WAU within 6 months

**Calculation**:
```
WAU = COUNT(DISTINCT user_id WHERE session_start IN 7-day window)
```

**Ratio Tracking**:
- **DAU/WAU Ratio**: Target 0.30-0.40 (30-40% of weekly players are daily)
- Stickiness indicator: Higher ratio = more engaged player base

---

### Monthly Active Users (MAU)
**Definition**: Unique users who log in during a 30-day period

**Target**: 120,000+ MAU within 6 months

**Calculation**:
```
MAU = COUNT(DISTINCT user_id WHERE session_start IN 30-day window)
```

**Ratio Tracking**:
- **DAU/MAU Ratio**: Target 0.25-0.35
- **WAU/MAU Ratio**: Target 0.70-0.80

---

### Average Session Duration
**Definition**: Average time players spend in a single session

**Target**: 35-50 minutes

**Calculation**:
```
Avg Session Duration = SUM(session_duration) / COUNT(sessions)
```

**Segmentation**:
- New players: 25-35 minutes (learning phase)
- Regular players: 40-55 minutes (optimal engagement)
- Veteran players: 30-45 minutes (efficient play)

**Success Indicators**:
- Duration increases with player level
- Stable or growing over time
- Peak during events/new content

---

### Sessions Per User Per Day
**Definition**: Average number of play sessions per active user per day

**Target**: 2.0-2.5 sessions/day

**Calculation**:
```
Sessions/User/Day = COUNT(sessions) / COUNT(DISTINCT user_id)
```

**Interpretation**:
- 1.0-1.5: Casual engagement
- 2.0-2.5: Healthy engagement
- 3.0+: Very engaged/at-risk of burnout

---

### Matches Per Session
**Definition**: Average matches played per gaming session

**Target**: 4-6 matches per session

**Calculation**:
```
Matches/Session = COUNT(match_end) / COUNT(session_start)
```

**Interpretation**:
- <3 matches: Players leaving too quickly
- 4-6 matches: Optimal session length
- >8 matches: Risk of burnout

---

## Retention Metrics

### Day 1 Retention (D1)
**Definition**: % of new players who return the day after first session

**Target**: 40-50%

**Calculation**:
```
D1 Retention = Users who returned on Day 1 / Total new users
```

**Critical Success Factor**: Strong D1 = good new player experience

**Benchmark**:
- <30%: Poor onboarding
- 30-40%: Industry average
- 40-50%: Good
- >50%: Excellent

---

### Day 7 Retention (D7)
**Definition**: % of new players who return 7 days after first session

**Target**: 20-30%

**Calculation**:
```
D7 Retention = Users active on Day 7 / Total new users from Day 0
```

**Interpretation**: Measures whether game has lasting appeal beyond first impressions

---

### Day 30 Retention (D30)
**Definition**: % of new players still active 30 days after first session

**Target**: 10-15%

**Calculation**:
```
D30 Retention = Users active on Day 30 / Total new users from Day 0
```

**Critical for**: Long-term player base and monetization potential

---

### Rolling Retention
**Definition**: % of players from a cohort who are active in any rolling time window

**Target by Window**:
- Week 2: 50-60%
- Week 4: 30-40%
- Week 8: 20-25%
- Week 12: 15-20%

**Use**: Better than fixed-day retention for understanding ongoing engagement

---

### Churn Rate
**Definition**: % of players who stop playing in a given period

**Target**: <15% monthly churn

**Calculation**:
```
Monthly Churn = (Active Month N - Active Month N+1) / Active Month N
```

**Churn Reasons to Track**:
- Natural churn (completed content)
- Competitive churn (moved to other games)
- Frustration churn (balance issues, bugs)
- Burnout churn (too much grinding)

---

## Monetization Metrics

### Conversion Rate
**Definition**: % of players who make at least one purchase

**Target**: 8-12% (industry standard for F2P shooters)

**Calculation**:
```
Conversion Rate = Paying users / Total users
```

**Segmentation**:
- New players (0-7 days): 2-4%
- Established players (7-30 days): 6-10%
- Veteran players (30+ days): 12-18%

---

### Average Revenue Per Daily Active User (ARPDAU)
**Definition**: Average revenue per daily active player

**Target**: $0.15-$0.25

**Calculation**:
```
ARPDAU = Total daily revenue / DAU
```

**Benchmark**:
- <$0.10: Low monetization
- $0.10-$0.20: Industry average
- $0.20-$0.30: Good
- >$0.30: Excellent

---

### Average Revenue Per Paying User (ARPPU)
**Definition**: Average monthly revenue from paying players only

**Target**: $8-$15 per month

**Calculation**:
```
ARPPU = Total revenue from paying users / Count of paying users
```

**Segmentation**:
- Minnows ($1-5/month): 60%
- Dolphins ($5-50/month): 35%
- Whales ($50+/month): 5%

---

### Lifetime Value (LTV)
**Definition**: Predicted total revenue from a player over their lifetime

**Target**: $25-$50 per player over 12 months

**Calculation**:
```
LTV = ARPDAU × Average Lifetime Days
```

**Cohort Analysis**:
- Month 1 LTV: $2-5
- Month 3 LTV: $8-15
- Month 6 LTV: $15-30
- Month 12 LTV: $25-50

---

### Battle Pass Adoption Rate
**Definition**: % of active players who purchase battle pass

**Target**: 30-40%

**Calculation**:
```
BP Adoption = Battle pass purchasers / MAU
```

**Success Factors**:
- High perceived value
- Strong free track incentive
- Clear progression visibility

---

### Average Transaction Value (ATV)
**Definition**: Average dollar value per purchase

**Target**: $12-$18

**Calculation**:
```
ATV = Total revenue / Number of transactions
```

**Interpretation**:
- Low ATV: Many small purchases (good engagement)
- High ATV: Fewer large purchases (whale-driven)

---

## Game Health Metrics

### Match Completion Rate
**Definition**: % of started matches that finish normally (not abandoned)

**Target**: >92%

**Calculation**:
```
Completion Rate = Completed matches / Started matches
```

**Red Flags**:
- <85%: Major game issues
- 85-90%: Balance or matchmaking issues
- 90-92%: Normal player behavior
- >95%: Excellent

---

### Average Queue Time
**Definition**: Average time to find a match

**Target by Rank**:
- Iron-Gold: <60 seconds
- Platinum: <90 seconds
- Diamond: <120 seconds
- Master+: <180 seconds

**Calculation**:
```
Avg Queue Time = SUM(queue_duration) / COUNT(matches_found)
```

---

### Match Balance Quality
**Definition**: How fair matches are based on MMR distribution

**Target**: 80% of matches within ±100 MMR difference

**Metrics**:
- Avg team MMR difference: <100
- Win rate by MMR difference: 50% ±5% for balanced matches
- Player-reported match quality >4.0/5.0

---

### Time to Kill (TTK) Distribution
**Definition**: Distribution of TTK across weapon classes at intended ranges

**Target**: 
- Close range: 250-350ms
- Mid range: 300-450ms
- Long range: 400-700ms

**Monitoring**:
- Track by weapon, attachments, range
- Identify outliers
- Balance adjustments when TTK deviates >15% from target

---

### Weapon Usage Distribution
**Definition**: Distribution of weapon usage in matches

**Target**: No single weapon >30% usage

**Healthy Balance**:
- Each weapon class: 15-25% usage
- Variety within classes
- Situational viability (map/mode dependent)

**Red Flags**:
- Single weapon >40%: Overpowered
- Weapon <5%: Underpowered or niche
- Dramatic shifts after updates: Balance issues

---

### Kill/Death Ratio Distribution
**Definition**: Distribution of K/D across player base

**Target**:
- 50th percentile: 0.9-1.1
- 75th percentile: 1.3-1.6
- 90th percentile: 1.8-2.5
- 95th percentile: 2.5-3.5

**Use**: Identify skill gaps and SBMM effectiveness

---

### Rage Quit Rate
**Definition**: % of matches with early player disconnects

**Target**: <8%

**Calculation**:
```
Rage Quit Rate = Matches with early quit / Total matches
```

**Triggers to Monitor**:
- Spawn deaths
- One-sided matches
- Perceived cheating
- Technical issues

---

## Technical Performance Metrics

### Server Performance
**Metrics**:
- Average tick rate: 60+ Hz
- Server FPS: 60+ stable
- CPU usage: <70% average
- Memory usage: <80% of available

**Target Uptime**: 99.5%+

---

### Client Performance
**Metrics**:
- Average client FPS: 60+ (target hardware)
- Frame time stability: <5ms variance
- Memory usage: <2GB on target spec
- Load times: <15 seconds map load

**Target**: 90% of players maintain 60+ FPS

---

### Network Performance
**Metrics**:
- Average ping: <80ms
- Packet loss: <1%
- Jitter: <10ms
- Desync events: <0.1% of frames

**Regional Targets**:
- Same region: <50ms
- Adjacent regions: <100ms
- Cross-continent: <150ms (warn players)

---

## Social and Community Metrics

### Party Play Rate
**Definition**: % of matches played in parties vs solo

**Target**: 40-50% party play

**Calculation**:
```
Party Rate = Matches with 2+ party members / Total matches
```

**Benefits**: Higher retention, more spending, better community

---

### Friend Network Size
**Definition**: Average friends per player

**Target**: 3-5 friends per active player

**Correlation**: More friends = higher retention + spending

---

### Toxicity Report Rate
**Definition**: % of matches with toxicity reports

**Target**: <5%

**Monitoring**:
- Voice chat toxicity
- Text chat toxicity
- Griefing behavior
- Response time to reports <24 hours

---

## Content Engagement Metrics

### Battle Pass Completion Rate
**Definition**: % of battle pass owners who complete all 50 tiers

**Target**: 60-70%

**Calculation**:
```
BP Completion = Players at tier 50 / Total BP owners
```

**Interpretation**:
- <50%: Too grindy or not engaging enough
- 60-70%: Well-balanced
- >80%: Too easy, devalues rewards

---

### Challenge Completion Rate
**Definition**: % of available challenges completed

**Target**:
- Daily challenges: 60-70%
- Weekly challenges: 50-60%
- Seasonal challenges: 30-40%

---

### Mode Popularity
**Definition**: Distribution of matches across game modes

**Target Distribution**:
- TDM: 40-50%
- KOTH: 25-35%
- Domination: 15-25%
- Other modes: 10-15%

---

## Funnel Analysis

### New Player Funnel
**Critical Steps**:
1. Account creation: 100% (baseline)
2. Tutorial completion: Target 85%+
3. First match completion: Target 75%+
4. 5th match completion: Target 50%+
5. Day 1 return: Target 40%+
6. First purchase: Target 8-12%

**Optimization**: Focus on drop-off points

---

### Purchase Funnel
**Steps**:
1. Shop view: 100% (of potential buyers)
2. Item preview: Target 60%
3. Add to cart/purchase intent: Target 30%
4. Purchase completion: Target 50% (of intent)
5. Repeat purchase: Target 40% (of first-time buyers)

---

## A/B Test Success Metrics

### Primary Metrics (Must Not Degrade)
- D1/D7 retention
- Session duration
- Match completion rate

### Secondary Metrics (Optimization Targets)
- ARPDAU
- Conversion rate
- Engagement metrics specific to test

### Statistical Significance
- Minimum sample size: 1,000 users per variant
- Confidence level: 95%
- Minimum detectable effect: 5%
- Test duration: 7-14 days

---

## Dashboard and Reporting

### Real-Time Dashboards
- Current DAU/MAU
- Server health (uptime, performance)
- Match queue times
- Active players by mode/region

### Daily Reports
- DAU, sessions, matches
- Revenue and conversion
- Retention cohorts
- Top bugs/issues

### Weekly Reports
- Retention analysis
- Monetization trends
- Game balance metrics
- Content engagement

### Monthly Reports
- MAU and growth
- LTV cohort analysis
- Competitive analysis
- Strategic KPI review

---

## KPI Hierarchy

### Tier 1 (Critical - Executive Level)
- DAU/MAU
- D1/D7/D30 retention
- ARPDAU
- Conversion rate

### Tier 2 (Important - Product Level)
- Session duration
- Match completion
- Queue times
- Weapon balance

### Tier 3 (Operational - Team Level)
- Technical performance
- Mode popularity
- Challenge completion
- Social engagement

---

## Target Summary Table

| KPI | Target | Current (Example) | Status |
|-----|--------|-------------------|--------|
| DAU | 10,000+ | 8,500 | ⚠️ Tracking |
| D1 Retention | 40-50% | 45% | ✅ On Target |
| D7 Retention | 20-30% | 28% | ✅ On Target |
| ARPDAU | $0.15-$0.25 | $0.18 | ✅ On Target |
| Conversion | 8-12% | 9.5% | ✅ On Target |
| Queue Time | <60s | 48s | ✅ On Target |
| Match Balance | <100 MMR | 92 MMR | ✅ On Target |

---

## References and Industry Benchmarks

**F2P Shooter Benchmarks**:
- Valorant: D1 ~45%, D7 ~25%, Conversion ~11%
- Apex Legends: D1 ~40%, D7 ~22%, ARPDAU ~$0.22
- Call of Duty Mobile: D1 ~50%, D7 ~28%, Conversion ~15%
- Fortnite: D1 ~55%, D7 ~35%, Conversion ~12%

**Sources**:
- Game Analytics Platform (GameAnalytics, Unity Analytics)
- Industry reports (Newzoo, SuperData, Sensor Tower)
- GDC presentations and case studies
- Company earnings reports

---

## Conclusion

KPIs provide objective measurement of Arena Blitz's health and success. Regular monitoring and optimization against these targets ensures sustainable growth, player satisfaction, and business viability.

**Key Takeaways**:
- Retention > Downloads (focus on keeping players)
- Engagement drives monetization (engaged players spend more)
- Balance drives retention (fair game keeps players coming back)
- Community drives growth (social features amplify all metrics)

Monitor, measure, iterate.
