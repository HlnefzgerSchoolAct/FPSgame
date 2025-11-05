# A/B Testing Framework and Plans

## Overview
A/B testing enables data-driven optimization of Arena Blitz's game design, monetization, and player experience. This document outlines the framework, planned tests, and best practices.

## Testing Framework

### Core Principles

1. **Hypothesis-Driven**: Every test starts with a clear hypothesis
2. **Statistically Valid**: Adequate sample size and duration
3. **Player-First**: Never harm player experience for data
4. **Isolated Variables**: Test one change at a time when possible
5. **Actionable Insights**: Test only what you can act on

### Test Lifecycle

```
1. Hypothesis → 2. Design → 3. Implementation → 4. Run → 5. Analyze → 6. Act
```

**Stage Details**:
1. **Hypothesis**: Formulate testable prediction with success metrics
2. **Design**: Define variants, sample size, duration, guardrail metrics
3. **Implementation**: Build variants, QA, instrumentation
4. **Run**: Deploy test, monitor data quality, check for issues
5. **Analyze**: Statistical analysis, segment analysis, qualitative feedback
6. **Act**: Implement winner, iterate, or abandon based on results

### Statistical Requirements

**Sample Size Calculation**:
- **Baseline conversion**: Current metric value
- **Minimum detectable effect (MDE)**: 5% relative change
- **Confidence level**: 95%
- **Statistical power**: 80%

**Typical Sample Sizes**:
- High-frequency events (matches, kills): 500-1,000 users per variant
- Low-frequency events (purchases): 2,000-5,000 users per variant
- Rare events (churn): 10,000+ users per variant

**Test Duration**:
- Minimum: 7 days (full week cycle)
- Typical: 14 days (two week cycles)
- Maximum: 30 days (avoid novelty effects)

### Guardrail Metrics

**Must Not Degrade** (test fails if these worsen significantly):
- D1/D7 retention
- Session duration
- Match completion rate
- Server performance
- Client stability

## Planned A/B Tests

### Category: Weapon Balance

#### Test 1: TTK Band Adjustment
**Hypothesis**: Slightly increasing TTK (by 8-10%) will improve new player retention by reducing frustration from quick deaths

**Variants**:
- **Control**: Current TTK values
- **Variant A**: +8% TTK across all weapons
- **Variant B**: +10% TTK across all weapons

**Primary Metric**: D7 retention (new players only)

**Secondary Metrics**:
- Average K/D ratio for new players
- Rage quit rate
- Playtime per session
- Weapon variety usage

**Sample Size**: 5,000 new players per variant

**Duration**: 14 days

**Success Criteria**: Variant improves D7 retention by >5% without hurting engagement

**Risks**: May alienate veteran players, could make game feel "floaty"

**Segmentation**: Analyze by player skill level, weapon preference

---

#### Test 2: Recoil Pattern Complexity
**Hypothesis**: Simplified recoil patterns will lower skill floor without affecting skill ceiling

**Variants**:
- **Control**: Current learnable patterns
- **Variant A**: 20% reduced horizontal recoil randomness
- **Variant B**: 30% reduced horizontal recoil randomness

**Primary Metric**: New player first 10 matches K/D ratio

**Secondary Metrics**:
- Headshot percentage
- Accuracy improvement over first 20 matches
- Player-reported satisfaction
- Veteran player engagement

**Sample Size**: 3,000 players per variant

**Duration**: 14 days

---

#### Test 3: Damage Falloff Curves
**Hypothesis**: Steeper falloff curves will encourage closer-range engagements and increase action density

**Variants**:
- **Control**: Current falloff
- **Variant A**: 15% steeper falloff (damage drops faster with distance)
- **Variant B**: 25% steeper falloff

**Primary Metric**: Average engagement distance

**Secondary Metrics**:
- Weapon class usage distribution
- Sniper rifle effectiveness
- Match pacing (kills per minute)
- Player movement patterns

**Sample Size**: 2,000 players per variant

**Duration**: 14 days

---

### Category: Reward Rates

#### Test 4: Match Completion Credits
**Hypothesis**: Increasing match completion rewards will improve session length and retention

**Variants**:
- **Control**: 100 credits per match
- **Variant A**: 125 credits per match (+25%)
- **Variant B**: 150 credits per match (+50%)

**Primary Metric**: Average matches per session

**Secondary Metrics**:
- Session duration
- D1/D7 retention
- Credit-based shop purchases
- Player satisfaction

**Sample Size**: 4,000 players per variant

**Duration**: 14 days

**Success Criteria**: Increased session length AND retention, without inflating economy

**Economic Analysis**: Monitor credit inflation, shop purchase rates, time-to-unlock

---

#### Test 5: Win Streak Bonuses
**Hypothesis**: Enhanced win streak bonuses will increase engagement and competitiveness

**Variants**:
- **Control**: Current bonuses (100/250/500 credits)
- **Variant A**: Increased bonuses (150/400/750 credits)
- **Variant B**: Earlier bonuses at 2/4/7 wins instead of 3/5/10

**Primary Metric**: Average matches per session for players on win streaks

**Secondary Metrics**:
- Rage quit rate after losses
- Win rate distribution
- Player sentiment
- Credit earning rate

**Sample Size**: 3,000 players per variant

**Duration**: 14 days

---

#### Test 6: Challenge Reward Scaling
**Hypothesis**: Harder challenges with better rewards will increase engagement among core players

**Variants**:
- **Control**: Current challenges and rewards
- **Variant A**: +50% difficulty, +75% rewards
- **Variant B**: +100% difficulty, +150% rewards

**Primary Metric**: Challenge completion rate

**Secondary Metrics**:
- Daily/weekly active users
- Challenge reroll rate
- Player progression satisfaction
- Time to complete challenges

**Sample Size**: 5,000 players per variant (focus on established players)

**Duration**: 21 days (full challenge cycle)

---

### Category: Progression Pacing

#### Test 7: Weapon XP Curve
**Hypothesis**: Flatter early-game XP curve will keep new players engaged with early unlocks

**Variants**:
- **Control**: Current curve (cumulative 13,500 XP to level 10)
- **Variant A**: -20% XP for levels 1-5, +10% for levels 11-15
- **Variant B**: -30% XP for levels 1-5, +15% for levels 11-15

**Primary Metric**: D7 retention

**Secondary Metrics**:
- Average weapon level reached
- Weapon variety used
- Attachment unlock satisfaction
- Time to max weapon level

**Sample Size**: 4,000 new players per variant

**Duration**: 21 days

---

#### Test 8: Battle Pass XP Rate
**Hypothesis**: Faster early-tier progression will improve battle pass adoption and satisfaction

**Variants**:
- **Control**: 10,000 XP per tier
- **Variant A**: 8,000 XP tiers 1-25, 12,000 XP tiers 26-50
- **Variant B**: 7,500 XP tiers 1-25, 13,000 XP tiers 26-50

**Primary Metric**: Battle pass purchase rate

**Secondary Metrics**:
- Battle pass completion rate
- Average tier reached (free players)
- Player satisfaction
- Mid-season engagement

**Sample Size**: 10,000 players per variant

**Duration**: Full season (10 weeks)

---

### Category: Shop Layout and Pricing

#### Test 9: Featured Items Count
**Hypothesis**: More featured items increase purchase browsing but reduce per-item conversion

**Variants**:
- **Control**: 6 featured items
- **Variant A**: 4 featured items
- **Variant B**: 8 featured items

**Primary Metric**: Featured section purchase rate

**Secondary Metrics**:
- Shop engagement time
- Item preview rate
- Total revenue per user
- Purchase decision time

**Sample Size**: 8,000 players per variant

**Duration**: 7 days

---

#### Test 10: Bundle Discount Percentage
**Hypothesis**: Higher bundle discounts (35% vs 25%) will increase bundle adoption without reducing revenue

**Variants**:
- **Control**: 25% bundle discount
- **Variant A**: 30% bundle discount
- **Variant B**: 35% bundle discount

**Primary Metric**: Revenue per user from bundles

**Secondary Metrics**:
- Bundle purchase rate
- Individual item purchase rate
- Total ARPDAU
- Perceived value rating

**Sample Size**: 10,000 players per variant

**Duration**: 14 days

**Revenue Analysis**: Track both unit economics and total revenue impact

---

#### Test 11: Limited-Time Offer Duration
**Hypothesis**: Shorter limited-time offers (8 hours vs 24 hours) create more urgency and purchases

**Variants**:
- **Control**: 24-hour daily deals
- **Variant A**: 12-hour deals (refresh twice daily)
- **Variant B**: 8-hour deals (refresh 3x daily)

**Primary Metric**: Limited-time offer purchase rate

**Secondary Metrics**:
- Shop visit frequency
- Conversion rate per visit
- Player frustration (missed deals)
- Total deal revenue

**Sample Size**: 6,000 players per variant

**Duration**: 14 days

---

### Category: Matchmaking

#### Test 12: MMR Search Range
**Hypothesis**: Tighter MMR ranges improve match quality and satisfaction despite longer queues

**Variants**:
- **Control**: ±200 MMR max
- **Variant A**: ±150 MMR max
- **Variant B**: ±100 MMR max (may increase queue time)

**Primary Metric**: Player-reported match quality

**Secondary Metrics**:
- Average queue time
- Match MMR disparity
- Rage quit rate
- Win rate fairness (target 48-52%)

**Sample Size**: 3,000 players per variant

**Duration**: 14 days

**Segmentation**: Analyze by rank tier (affect on high-rank queue times)

---

#### Test 13: Party vs Solo Matching Priority
**Hypothesis**: Matching parties against parties (even with MMR penalty) improves match satisfaction

**Variants**:
- **Control**: Mixed matching with +25 MMR for parties
- **Variant A**: Prioritize party vs party, +50 MMR if mixed
- **Variant B**: Strict party vs party only

**Primary Metric**: Match quality rating (parties and solo)

**Secondary Metrics**:
- Solo player rage quit rate
- Party player satisfaction
- Queue time differences
- Win rate fairness

**Sample Size**: 5,000 players per variant

**Duration**: 14 days

---

### Category: UI/UX

#### Test 14: Post-Match XP Presentation
**Hypothesis**: Animated XP breakdown increases satisfaction and engagement

**Variants**:
- **Control**: Immediate full XP display
- **Variant A**: Animated count-up with breakdown
- **Variant B**: Gamified slot-machine style reveal

**Primary Metric**: Player satisfaction rating

**Secondary Metrics**:
- Time spent on post-match screen
- Next match queue rate
- Perceived reward value
- Session continuation rate

**Sample Size**: 2,000 players per variant

**Duration**: 7 days

---

#### Test 15: Challenge Display Prominence
**Hypothesis**: More prominent challenge display increases completion rate

**Variants**:
- **Control**: Challenges in separate menu
- **Variant A**: Challenge progress in HUD
- **Variant B**: Challenge progress in HUD + post-match highlight

**Primary Metric**: Challenge completion rate

**Secondary Metrics**:
- Challenge awareness
- Challenge-focused gameplay
- UI clutter perception
- Player satisfaction

**Sample Size**: 3,000 players per variant

**Duration**: 14 days

---

## Testing Best Practices

### Do's ✅

1. **Pre-register tests**: Document hypothesis, metrics, sample size before starting
2. **Run multiple weeks**: Capture weekly patterns and reduce noise
3. **Segment analysis**: Analyze by player type, skill level, region
4. **Monitor guardrails**: Check for unexpected negative impacts
5. **Qualitative feedback**: Combine data with player surveys/feedback
6. **Document learnings**: Record results and insights for future tests
7. **Sequential testing**: Run related tests in sequence to build knowledge

### Don'ts ❌

1. **Don't p-hack**: No peeking at results and stopping early if winning
2. **Don't test too many things**: Avoid confounded results
3. **Don't ignore guardrails**: Revenue up but retention down = bad test
4. **Don't skip sample size**: Underpowered tests waste time
5. **Don't make decisions on noise**: Wait for statistical significance
6. **Don't forget segments**: Averages can hide important differences
7. **Don't test during events**: Major events skew results

---

## Test Prioritization

### High Priority (Run First)
1. **TTK Band Adjustment**: Major impact on retention
2. **Match Completion Credits**: Direct monetization impact
3. **Battle Pass XP Rate**: Seasonal importance
4. **Weapon XP Curve**: New player experience

### Medium Priority (Run After High Priority)
5. **Shop Layout Tests**: Monetization optimization
6. **Matchmaking Tests**: Match quality critical for retention
7. **Challenge Rewards**: Engagement optimization

### Low Priority (Nice to Have)
8. **UI/UX Polish Tests**: Incremental improvements
9. **Minor Reward Tweaks**: Small impact tests

---

## Analysis Framework

### Step 1: Data Quality Check
- Verify instrumentation working correctly
- Check for sample ratio mismatch
- Identify data anomalies or bugs
- Confirm even distribution across variants

### Step 2: Primary Metric Analysis
- Calculate metric for each variant
- Compute confidence intervals
- Determine statistical significance
- Calculate practical significance (effect size)

### Step 3: Secondary Metrics Analysis
- Check all secondary metrics
- Look for unexpected changes
- Verify guardrail metrics stable
- Identify tradeoffs

### Step 4: Segment Analysis
- Break down by player segments
- Look for differential effects
- Identify winners and losers
- Consider personalization opportunities

### Step 5: Decision Making
- **Clear Win**: Implement winning variant
- **Clear Loss**: Abandon test, keep control
- **Mixed Results**: Deep dive, possibly retest
- **No Result**: Increase sample size or duration

---

## Reporting Template

### Test Report Structure

**1. Executive Summary**
- Test name and duration
- Hypothesis
- Result (win/loss/neutral)
- Recommendation

**2. Test Design**
- Variants tested
- Sample sizes
- Duration and dates
- Primary and secondary metrics

**3. Results**
- Primary metric results with confidence intervals
- Statistical significance
- Practical significance (effect size)
- Guardrail metrics status

**4. Segment Analysis**
- Key segment breakdowns
- Differential effects
- Interesting findings

**5. Insights and Learnings**
- Why did variant win/lose?
- Unexpected findings
- Player behavior changes
- Applicable to other areas?

**6. Recommendation**
- Implement / Don't implement
- Rollout plan (gradual vs immediate)
- Follow-up tests needed
- Monitoring post-launch

---

## Test Calendar (Year 1)

| Month | Test Focus | Key Tests |
|-------|------------|-----------|
| Month 1-2 | Core Balance | TTK, Recoil Patterns |
| Month 3-4 | Progression | XP Curves, Unlocks |
| Month 5-6 | Monetization | Shop Layout, Pricing |
| Month 7-8 | Engagement | Rewards, Challenges |
| Month 9-10 | Matchmaking | MMR Ranges, Party Matching |
| Month 11-12 | Retention | Seasonal Content, Events |

**Ongoing**: UI/UX polish tests, minor balance tweaks

---

## Success Stories (Hypothetical Examples)

### Example 1: Win Streak Test
- **Hypothesis**: Higher bonuses increase engagement
- **Result**: +12% sessions per user, +8% retention
- **Action**: Implemented Variant A (150/400/750 credits)
- **Impact**: +$0.03 ARPDAU from increased engagement

### Example 2: Bundle Discount Test
- **Hypothesis**: 35% discount increases revenue
- **Result**: +40% bundle purchases, but -5% individual purchases
- **Net Result**: +15% total revenue per user
- **Action**: Implemented 35% bundle discounts
- **Impact**: +$0.05 ARPDAU

---

## Experimentation Culture

### Principles
1. **Data-Driven**: Trust data over opinions
2. **Learn Fast**: Run tests quickly, iterate
3. **Fail Forward**: Failed tests teach us what doesn't work
4. **Player-Centric**: Always consider player experience
5. **Transparent**: Share results across team

### Test Review Process
- Weekly: Review ongoing tests
- Bi-weekly: Analyze completed tests
- Monthly: Strategic test planning
- Quarterly: Test retrospective and learnings

---

## References and Resources

**Tools**:
- Google Optimize (for web-based tests)
- Optimizely (for game tests)
- Custom in-house A/B testing platform

**Reading**:
- "Trustworthy Online Controlled Experiments" by Kohavi, Tang, Xu
- "The Lean Startup" by Eric Ries
- GDC talks on game metrics and A/B testing

**Industry Examples**:
- Riot Games (Valorant/LoL A/B testing culture)
- Epic Games (Fortnite experimentation)
- Supercell (data-driven game design)

---

## Conclusion

A/B testing is critical for optimizing Arena Blitz across all dimensions—balance, monetization, engagement, and retention. By following this framework, we can make informed decisions that improve player experience and business outcomes.

**Remember**: Test, learn, iterate. Every test teaches us something about our players.
