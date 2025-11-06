# Monetization Metrics and Analytics

## Overview
This document defines monetization KPIs, targets, tracking methodologies, and A/B test experiments for Arena Blitz's free-to-play economy. These metrics guide monetization optimization while maintaining player satisfaction and long-term engagement.

---

## Core Monetization KPIs

### 1. Conversion Rate

**Definition**: Percentage of players who make at least one purchase (any amount)

**Target**: 10-12%
- New players (0-7 days): 3-5%
- Established players (7-30 days): 8-10%
- Veteran players (30+ days): 12-15%

**Calculation**:
```
Conversion Rate = (Paying Users / Total Active Users) × 100%
```

**Tracking Frequency**: Daily, with weekly and monthly cohort analysis

**Success Indicators**:
- Month-over-month growth in conversion rate
- Conversion rate improves with player tenure
- Battle pass launch drives 5-8% spike in conversion
- Seasonal events increase conversion by 3-5%

**Optimization Levers**:
- First-time buyer offers (target: 50% of conversions within first 7 days)
- Battle pass value proposition (target: 40% of conversions are BP purchases)
- Limited-time offers and urgency mechanics
- Social proof (showing popular items)

**Benchmarks** (F2P Shooters):
- Valorant: ~11%
- Apex Legends: ~9%
- Call of Duty Mobile: ~14%
- Fortnite: ~12%

---

### 2. Average Revenue Per Daily Active User (ARPDAU)

**Definition**: Average revenue generated per daily active player across all users (paying and non-paying)

**Target**: $0.20-$0.25
- Launch month: $0.10-$0.15
- Month 3: $0.18-$0.22
- Month 6+: $0.22-$0.28

**Calculation**:
```
ARPDAU = Total Daily Revenue / Daily Active Users (DAU)
```

**Tracking Frequency**: Daily, with 7-day and 30-day rolling averages

**Success Indicators**:
- Steady upward trend over first 6 months
- Weekend ARPDAU 15-20% higher than weekdays
- Battle pass launch doubles ARPDAU for 3-5 days
- Seasonal events increase ARPDAU by 30-50%

**Revenue Mix Target**:
- Battle pass: 40%
- Weapon skins: 25%
- Bundles: 20%
- Operator skins: 10%
- Accessories & other: 5%

**Benchmarks** (F2P Shooters):
- Valorant: ~$0.25-$0.30
- Apex Legends: ~$0.20-$0.25
- Call of Duty Mobile: ~$0.30-$0.40
- PUBG Mobile: ~$0.35-$0.45

---

### 3. Average Revenue Per Paying User (ARPPU)

**Definition**: Average monthly revenue from players who made at least one purchase

**Target**: $10-$15 per month
- Minnows ($1-$10/month): 60% of paying users
- Dolphins ($10-$100/month): 35% of paying users
- Whales ($100+/month): 5% of paying users

**Calculation**:
```
ARPPU = Total Revenue from Paying Users / Count of Paying Users (in period)
```

**Tracking Frequency**: Monthly, with weekly snapshots

**Success Indicators**:
- ARPPU increases 10-20% season-over-season
- Whale segment contributes 40-50% of total revenue
- Repeat purchase rate >60% for first-time buyers
- Average transactions per paying user: 2-3 per month

**Segmentation Analysis**:
```
Minnows: 60% of payers, 15% of revenue (~$2-5/month)
Dolphins: 35% of payers, 35% of revenue (~$15-40/month)
Whales: 5% of payers, 50% of revenue (~$150-500/month)
```

**Optimization**:
- Minnows: Focus on battle pass and small bundles
- Dolphins: Mid-tier bundles and premium cosmetics
- Whales: Legendary bundles, exclusive items, tier skips

---

### 4. Battle Pass Attach Rate

**Definition**: Percentage of active players who purchase the premium battle pass

**Target**: 30-40% of Monthly Active Users (MAU)
- Launch season: 25-30%
- Season 2-3: 32-38%
- Season 4+: 35-42%

**Calculation**:
```
BP Attach Rate = (Premium BP Purchasers / MAU) × 100%
```

**Tracking Frequency**: Daily during season, with cohort analysis

**Success Indicators**:
- 70% of BP purchases within first week of season
- 20% of BP purchasers buy tier skips (avg 5-10 tiers)
- 8-12% purchase Premium Plus ($24.99) upgrade
- 65-75% of BP owners complete all 50 tiers

**Revenue Impact**:
```
10,000 MAU × 35% attach rate = 3,500 BP sales
3,500 × $9.99 = $34,965 per season
Plus tier skips: ~$8,000-12,000 per season
Total BP revenue per season: ~$43,000-47,000
```

**Optimization Levers**:
- Early season purchase incentives
- Clear value communication (7.5x value vs store)
- Free track quality (incentivizes premium upgrade)
- Late-season catch-up XP reduction

---

### 5. Lifetime Value (LTV)

**Definition**: Predicted total revenue from a player over their lifetime

**Target by Cohort**:
- Day 30 LTV: $1.50-$2.50
- Day 90 LTV: $5.00-$8.00
- Day 180 LTV: $12.00-$18.00
- Day 365 LTV: $25.00-$40.00

**Calculation**:
```
LTV = ARPDAU × Average Lifetime (in days)
Alternative: LTV = ARPPU × Conversion Rate × Average Lifetime
```

**Tracking Frequency**: Monthly cohort analysis

**Success Indicators**:
- LTV curves show consistent growth (not plateauing early)
- Paying users have 3-5x higher retention than non-payers
- Each season drives 20-30% LTV increase for active cohort
- Year 1 LTV covers user acquisition cost (CAC) + 100% margin

**LTV by User Segment**:
```
F2P Players: $0-5 LTV (from ads)
Converted Players: $25-50 LTV
Engaged Dolphins: $100-300 LTV
Whales: $500-2000+ LTV
```

**LTV Optimization**:
- Improve D7 and D30 retention (each 5% retention = 15-20% LTV increase)
- Increase conversion rate (each 1% = 8-10% LTV increase)
- Battle pass adoption (BP buyers have 2.5x higher LTV)
- Social features (players with 3+ friends have 40% higher LTV)

---

### 6. Average Transaction Value (ATV)

**Definition**: Average dollar amount per individual transaction

**Target**: $12-$18
- Small transactions (<$5): 25%
- Medium transactions ($5-$20): 45%
- Large transactions ($20-$50): 20%
- Mega transactions ($50+): 10%

**Calculation**:
```
ATV = Total Revenue / Number of Transactions
```

**Tracking Frequency**: Daily

**Success Indicators**:
- Battle pass ($9.99) is most common transaction (30-40% of all purchases)
- Bundles drive higher ATV ($18-25 average)
- Gem package purchases concentrate at $9.99 and $19.99 tiers
- Limited-time offers increase ATV by 25-40%

**Optimization**:
- Psychological pricing ($9.99, $19.99, $49.99)
- Bundle discounts (20-35% savings incentivize larger purchases)
- Bonus gems on larger packages (encourage higher ATV)
- Limited-time "mega bundles" at $49.99-$99.99 for whales

---

### 7. Repeat Purchase Rate

**Definition**: Percentage of first-time buyers who make a second purchase

**Target**: 50-60% within 30 days
- Within 7 days: 20-30%
- Within 30 days: 50-60%
- Within 90 days: 65-75%

**Calculation**:
```
Repeat Purchase Rate = (Users with 2+ Purchases / First-Time Buyers) × 100%
```

**Tracking Frequency**: Weekly cohort analysis

**Success Indicators**:
- Battle pass buyers have >70% repeat rate (tier skips, next season)
- Cosmetic buyers have 50-60% repeat rate
- Bundle buyers have 55-65% repeat rate
- Average time to second purchase: 14-21 days

**Optimization**:
- Post-purchase engagement (show related items)
- Personalized shop recommendations
- Time-limited follow-up offers
- Battle pass as "subscription" model

---

## Revenue Channels and Targets

### Channel Breakdown (Monthly Revenue Target: $60,000 at 10k MAU)

| Channel | % of Revenue | Monthly $ | Notes |
|---------|--------------|-----------|--------|
| Battle Pass | 40% | $24,000 | 30-40% attach rate at $9.99 |
| Weapon Skins | 25% | $15,000 | Mix of credits and gems purchases |
| Bundles | 20% | $12,000 | High-value purchases from whales |
| Operator Skins | 10% | $6,000 | Premium cosmetics |
| Accessories | 3% | $1,800 | Charms, sprays, emotes |
| Rewarded Ads | 2% | $1,200 | Supplemental F2P revenue |

---

## A/B Testing Strategy and Experiment Plan

### Testing Framework

**Statistical Requirements**:
- Minimum sample size: 1,000 users per variant
- Confidence level: 95%
- Minimum detectable effect: 5%
- Test duration: 7-14 days (full week preferred)

**Primary Metrics** (Must not degrade):
- D1 and D7 retention
- Session duration
- Match completion rate

**Secondary Metrics** (Optimization targets):
- Conversion rate
- ARPDAU
- Metric-specific to test

---

### Planned A/B Tests

#### Test 1: Battle Pass Pricing Optimization
**Hypothesis**: $9.99 price point maximizes total revenue vs $7.99 or $11.99

**Variants**:
- Control: $9.99 (industry standard)
- Variant A: $7.99 (lower barrier)
- Variant B: $11.99 (higher value capture)

**Success Metrics**:
- Primary: Total BP revenue (attach rate × price)
- Secondary: Conversion rate, first-time buyer rate
- Guardrail: Player satisfaction, retention

**Sample Size**: 3,000 users per variant (9,000 total)
**Duration**: First 7 days of season launch
**Expected Outcome**: $9.99 likely optimal, but test will validate

---

#### Test 2: Starter Bundle Price and Contents
**Hypothesis**: $4.99 starter bundle drives higher first-time buyer conversion than $7.99

**Variants**:
- Control: $4.99, 30% discount, includes common items
- Variant A: $7.99, 35% discount, includes rare items
- Variant B: $4.99, 40% discount, reduced contents

**Success Metrics**:
- Primary: First-time buyer conversion rate
- Secondary: Total revenue from new players (Day 7, Day 30)
- Tertiary: Repeat purchase rate

**Sample Size**: 2,000 users per variant (6,000 total)
**Duration**: 14 days
**Expected Outcome**: $4.99 drives more conversions, higher LTV

---

#### Test 3: Legendary Skin Pricing
**Hypothesis**: 1750 gems ($15-17 equivalent) is optimal for legendary skins

**Variants**:
- Control: 1750 gems
- Variant A: 1500 gems (lower price)
- Variant B: 2000 gems (higher price)

**Success Metrics**:
- Primary: Total legendary skin revenue
- Secondary: Whale spending patterns
- Tertiary: Conversion rate for legendary purchases

**Sample Size**: 5,000 users per variant (15,000 total)
**Duration**: 14 days with featured legendary rotation
**Expected Outcome**: 1750 likely optimal, but whale behavior may support 2000

---

#### Test 4: Bundle Discount Percentage
**Hypothesis**: 30% discount maximizes bundle purchase rate vs 25% or 35%

**Variants**:
- Control: 25% discount
- Variant A: 30% discount
- Variant B: 35% discount

**Success Metrics**:
- Primary: Bundle purchase rate vs individual item purchases
- Secondary: Total bundle revenue
- Tertiary: Player perception of value

**Sample Size**: 2,500 users per variant (7,500 total)
**Duration**: 14 days
**Expected Outcome**: 30-35% likely optimal based on industry standards

---

#### Test 5: Daily Deal Discount Depth
**Hypothesis**: 40% discount on daily deals drives optimal engagement and revenue

**Variants**:
- Control: 40% discount
- Variant A: 30% discount
- Variant B: 50% discount

**Success Metrics**:
- Primary: Daily deal purchase rate
- Secondary: Daily login rate (engagement)
- Tertiary: Perceived value of shop

**Sample Size**: 3,000 users per variant (9,000 total)
**Duration**: 14 days (2 full weeks of daily rotations)
**Expected Outcome**: 40-50% likely optimal, steeper discounts may devalue items

---

#### Test 6: Gem Package Bonus Structure
**Hypothesis**: 20% bonus on $19.99 package drives higher ATV than 15% or 25%

**Variants**:
- Control: $19.99 package with 20% bonus (2400 gems)
- Variant A: $19.99 package with 15% bonus (2300 gems)
- Variant B: $19.99 package with 25% bonus (2500 gems)

**Success Metrics**:
- Primary: $19.99 package purchase rate
- Secondary: Average transaction value (ATV)
- Tertiary: Gem spending patterns post-purchase

**Sample Size**: 2,000 users per variant (6,000 total)
**Duration**: 14 days
**Expected Outcome**: 20% likely optimal without devaluing currency

---

#### Test 7: Shop Rotation Frequency
**Hypothesis**: Daily micro-rotations increase engagement vs 3-day rotations

**Variants**:
- Control: Daily rotation (4 items, changes every 24 hours)
- Variant A: 3-day rotation (8 items, changes every 72 hours)
- Variant B: Twice-daily rotation (4 items, changes every 12 hours)

**Success Metrics**:
- Primary: Daily login rate
- Secondary: Shop visit frequency
- Tertiary: Purchase rate from rotated items

**Sample Size**: 3,000 users per variant (9,000 total)
**Duration**: 14 days
**Expected Outcome**: Daily rotation likely optimal for engagement

---

#### Test 8: Rewarded Ad Placement and Rewards
**Hypothesis**: 50 credits per ad maximizes ad views and player satisfaction

**Variants**:
- Control: 50 credits per ad
- Variant A: 30 credits per ad
- Variant B: 75 credits per ad

**Success Metrics**:
- Primary: Ad view rate (% of eligible players who watch)
- Secondary: Total ad revenue
- Tertiary: Player satisfaction (no negative impact on retention)

**Sample Size**: 2,500 users per variant (7,500 total)
**Duration**: 7 days
**Expected Outcome**: 50 credits likely optimal balance

---

#### Test 9: Battle Pass XP Requirements
**Hypothesis**: 10,000 XP per tier achieves 65-70% completion rate (optimal)

**Variants**:
- Control: 10,000 XP per tier (current)
- Variant A: 9,000 XP per tier (easier)
- Variant B: 11,000 XP per tier (harder)

**Success Metrics**:
- Primary: Battle pass completion rate (target: 65-70%)
- Secondary: Player engagement (matches played)
- Tertiary: BP attach rate next season

**Sample Size**: 1,500 users per variant (4,500 total)
**Duration**: Full season (10 weeks)
**Expected Outcome**: 10,000 XP likely optimal, but test will validate

---

#### Test 10: Premium Plus Upgrade Value
**Hypothesis**: $24.99 Premium Plus with 25 tier skip drives 10-15% adoption

**Variants**:
- Control: $24.99, includes 25 tier skip + exclusives
- Variant A: $19.99, includes 15 tier skip + exclusives
- Variant B: $29.99, includes 30 tier skip + more exclusives

**Success Metrics**:
- Primary: Premium Plus adoption rate (target: 10-15% of BP buyers)
- Secondary: Total revenue per BP buyer
- Tertiary: Tier skip purchases after Premium Plus

**Sample Size**: 1,000 users per variant (3,000 total)
**Duration**: First 14 days of season
**Expected Outcome**: $24.99 likely optimal, appeals to time-poor whales

---

## Monetization Tracking Dashboard

### Real-Time Metrics (Updated Hourly)
- Current day revenue and ARPDAU
- Active paying users (today)
- Top-selling items (last 24 hours)
- Conversion funnel (shop views → purchases)

### Daily Metrics
- DAU and revenue
- ARPDAU (7-day rolling average)
- Conversion rate (new vs returning)
- Battle pass progress distribution
- Top revenue items

### Weekly Metrics
- WAU and weekly revenue
- Cohort retention and LTV curves
- Battle pass attach rate
- Repeat purchase rate
- Revenue channel breakdown

### Monthly Metrics
- MAU and monthly revenue
- ARPPU and whale analysis
- Seasonal trends and YoY growth
- A/B test results and insights
- Competitive benchmarking

---

## Revenue Forecasting Models

### Conservative Model (10,000 MAU)
```
Conversion Rate: 8%
ARPDAU: $0.15
Monthly Revenue: $45,000
Annual Revenue: $540,000
```

### Target Model (10,000 MAU)
```
Conversion Rate: 10%
ARPDAU: $0.20
Monthly Revenue: $60,000
Annual Revenue: $720,000
```

### Optimistic Model (10,000 MAU)
```
Conversion Rate: 12%
ARPDAU: $0.25
Monthly Revenue: $75,000
Annual Revenue: $900,000
```

### Scaling Model (50,000 MAU in Year 2)
```
Conversion Rate: 11%
ARPDAU: $0.22
Monthly Revenue: $330,000
Annual Revenue: $3,960,000
```

---

## Monetization Health Indicators

### Healthy Monetization
✅ Conversion rate: 10-12%
✅ ARPDAU: $0.20-$0.25
✅ ARPPU: $12-$18/month
✅ D7 retention stable or improving
✅ Whale segment: 5% of payers, 40-50% of revenue
✅ Battle pass attach rate: 35-40%
✅ Repeat purchase rate: 55-65%

### Warning Signs
⚠️ Conversion rate falling below 8%
⚠️ ARPDAU below $0.15 for 7+ consecutive days
⚠️ D7 retention declining >5%
⚠️ Battle pass attach rate <25%
⚠️ Whale revenue >60% (over-dependence on small segment)
⚠️ Repeat purchase rate <40%

### Critical Issues
❌ Conversion rate below 5%
❌ ARPDAU below $0.10
❌ Negative revenue trend for 14+ days
❌ Major retention drop (>10% D7 decline)
❌ Revenue concentrated in single item/category
❌ Player complaints about monetization

---

## Optimization Roadmap

### Month 1-3: Foundation
- Launch with battle pass and core shop
- Establish baseline metrics
- Begin A/B testing framework
- Focus on conversion and engagement

### Month 4-6: Optimization
- Implement winning A/B test variants
- Expand bundle offerings
- Seasonal content launch
- Optimize pricing based on data

### Month 7-9: Expansion
- Introduce new cosmetic categories
- Limited-time vault events
- Advanced personalization
- Whale-focused exclusives

### Month 10-12: Maturation
- Refine based on year of data
- Long-term retention programs
- Loyalty rewards for whales
- Prepare Year 2 content pipeline

---

## Competitive Analysis and Positioning

| Game | ARPDAU | Conversion | BP Price | Strategy |
|------|--------|------------|----------|----------|
| Valorant | $0.25-$0.30 | ~11% | $10 | Premium pricing, high-quality skins |
| Apex | $0.20-$0.25 | ~9% | $10 | Balanced, seasonal events |
| Fortnite | $0.30-$0.40 | ~12% | $10 | Mass market, aggressive monetization |
| COD Mobile | $0.30-$0.40 | ~14% | $10 | Broad appeal, high conversion |
| Arena Blitz | $0.20-$0.25 | 10-12% | $9.99 | Value-focused, player-friendly |

**Positioning**: Arena Blitz positions slightly below premium titles (Valorant) with competitive pricing and strong value proposition. Focus on player satisfaction and long-term retention over aggressive short-term monetization.

---

## Ethical Monetization Guidelines

1. **Transparency**: All prices clearly displayed. No hidden costs or dark patterns.
2. **No Pay-to-Win**: All items purely cosmetic. Zero gameplay advantages.
3. **No Loot Boxes**: No random-chance purchases. Players know exactly what they're buying.
4. **Reasonable Grind**: F2P players can earn meaningful rewards without excessive grinding.
5. **Respectful Ads**: Rewarded ads are optional, never forced. Never interrupt gameplay.
6. **No FOMO Abuse**: Limited items return eventually. No permanent exclusivity pressure.
7. **Fair Regional Pricing**: Adjusted pricing ensures accessibility in lower-income regions.
8. **Minor Protection**: Consider age gates and parental controls for monetization.

---

## Success Criteria (6-Month Targets)

### Player Satisfaction
- Player sentiment: 70%+ positive on monetization
- Shop rating: 4.0+ out of 5.0
- Battle pass completion: 65-75%
- F2P player retention comparable to premium players

### Financial Performance
- 10,000 MAU
- 10-12% conversion rate
- $0.20-$0.25 ARPDAU
- $60,000+ monthly revenue
- Battle pass attach rate: 35-40%

### Engagement
- Daily login rate: 30-40% of WAU
- Shop visit rate: 50-60% of DAU
- Battle pass engagement: 80%+ of owners progress weekly

---

## Conclusion

Arena Blitz's monetization strategy balances revenue generation with player satisfaction. By focusing on fair pricing, transparent value, and cosmetic-only items, we aim to build a sustainable, player-friendly economy that supports long-term growth.

**Key Principles**:
- Respect player time and money
- Provide clear, fair value
- Never compromise gameplay for monetization
- Build trust through transparency
- Optimize based on data, not assumptions

**Monitor, test, iterate, and always put player experience first.**

---

## References

- GDC Talks: "F2P Monetization Best Practices"
- Deconstructor of Fun: F2P game breakdowns
- GameAnalytics: Industry benchmarks
- Riot Games: Valorant monetization philosophy
- Supercell: Fair F2P economy design
- Industry reports: Newzoo, SuperData, Sensor Tower
