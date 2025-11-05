# Map Design Guidelines

## Overview
This document establishes design standards and best practices for creating balanced, competitive maps for Arena Blitz. All maps should support multiple playstyles, weapon classes, and game modes while maintaining fair competitive gameplay.

## Core Design Principles

### 1. Three-Lane Philosophy
All competitive maps should follow a three-lane structure with distinct characteristics:

- **Lane A**: Close-quarters focused (favors SMG/Shotgun)
- **Lane B**: Medium-range balanced (favors AR)
- **Lane C**: Long-range or vertical (favors DMR/Sniper)

**Benefits:**
- Provides tactical variety and counterplay
- Prevents single-strategy dominance
- Enables rotation and flanking
- Supports team coordination

### 2. Symmetry vs Asymmetry

**Symmetrical Maps** (e.g., Arena Hub)
- Use for: Competitive ranked modes, tournaments
- Ensures: Perfect balance, no spawn advantage
- Design: Rotational or mirror symmetry
- Best for: TDM, KOTH, Domination

**Asymmetrical Maps** (e.g., Shipyard)
- Use for: Variety, unique gameplay, objective modes
- Requires: Balance through rotation timings, objective placement
- Design: Different but equivalent paths and positions
- Best for: Search & Destroy, Payload, Attack/Defend modes

### 3. Size and Player Density

**Map Size Guidelines:**

| Player Count | Map Size (m²) | Engagement Density |
|-------------|---------------|-------------------|
| 6v6 (12 total) | 5,000-6,000 | High |
| 8v8 (16 total) | 6,500-8,000 | Medium-High |
| 10v10 (20 total) | 8,500-10,000 | Medium |

**Player Density Formula:**
- Optimal: 400-550 m² per player
- High action: 300-400 m² per player
- Tactical: 550-700 m² per player

## Dimensional Standards

### Lane Width

| Lane Type | Width Range | Purpose |
|-----------|-------------|---------|
| Tight corridor | 3-6m | Force close combat, limit movement |
| Standard lane | 8-15m | Balanced engagements |
| Wide lane | 16-25m | Multiple firing positions, flanking |
| Open area | 25m+ | Objective zones, team fights |

### Sightline Limits

**Maximum Sightlines by Weapon Class:**

- **Shotgun lanes**: 8-15m
- **SMG lanes**: 15-30m
- **AR lanes**: 25-50m
- **DMR/Sniper lanes**: 40-80m

**Critical Rules:**
- No full cross-map sightlines (prevents excessive camping)
- Maximum unbroken sightline: 80m
- Average sightline: 25-35m
- Minimum 15 sightline breaks per map

**Sightline Break Techniques:**
- Cover objects (crates, walls, vehicles)
- Elevation changes
- Building/structure placement
- Terrain features
- Fog/weather effects (use sparingly)

### Cover Spacing

**Cover Object Distribution:**

- **High-density zones** (CQB areas): 3-4m spacing
- **Medium-density zones** (standard): 4-6m spacing
- **Low-density zones** (open areas): 6-10m spacing

**Cover Types:**

1. **Full Height** (2m+): Blocks sightlines completely
   - Use: 40-45% of cover
   - Purpose: Safe positioning, sightline breaks

2. **Half Height** (1-1.5m): Provides protection while crouched
   - Use: 35-40% of cover
   - Purpose: Shooting positions, partial safety

3. **Deployable Positions** (1.2-1.5m): Natural head-glitch positions
   - Use: 10-15% of cover
   - Purpose: Power positions with tradeoffs

4. **Minimal Cover** (<1m): Concealment only
   - Use: 5-10% of cover
   - Purpose: Movement variety, tactical options

### Verticality Standards

**Height Levels:**

- **Ground Level** (0m): Primary engagement plane
- **Low Elevation** (2-5m): Accessible via ramps/stairs
- **Medium Elevation** (5-10m): Tactical vantage points
- **High Elevation** (10-20m): Power positions, high risk/reward

**Verticality Balance:**

- Maximum 2-3 distinct height levels per map zone
- High positions must have limited cover and multiple access routes
- Fall damage threshold: 10m
- No spawn-to-power-position advantages

**Access Methods:**

- Stairs: 4-6m width, 30-45° angle
- Ramps: 5-8m width, 20-35° angle
- Ladders: 1m width, slow climb (vulnerable)
- Jumps: 1-2m height, skill-based shortcuts

## Callout System

### Callout Requirements

Every map must have:
- **15-25 unique callouts** for key locations
- Clear, memorable names
- No duplicate or confusing names
- Logical geographic/thematic naming

### Callout Categories

1. **Spawn Areas**: "[Team] Spawn" (e.g., "A Spawn", "South Spawn")
2. **Major Landmarks**: Prominent features (e.g., "Crane", "Ship", "Plaza")
3. **Lane Names**: Descriptive lane identifiers (e.g., "Warehouse", "Catwalk")
4. **Connector Points**: Junction identifiers (e.g., "Mid Connector", "Bridge")
5. **Elevation Markers**: Height indicators (e.g., "Top", "Upper", "Lower")
6. **Cover Clusters**: Notable cover (e.g., "Containers", "Fountain")
7. **Objective Zones**: Objective callouts (e.g., "Point A", "Hill")

### Callout Naming Best Practices

- Use 1-2 words maximum
- Avoid similar-sounding names
- Use visual/thematic references
- Include direction modifiers (North, East, Upper, Lower)
- Consistent naming convention across maps

**Example Callout Set (Arena Hub):**
- Spawns: "A Spawn", "B Spawn"
- Lanes: "Warehouse", "Plaza", "Catwalk"
- Positions: "Containers", "Fountain", "Top Catwalk"
- Connectors: "North Door", "South Opening"

## Engagement Zone Distribution

### Target Engagement Ranges

Distribute engagement zones to support all weapon classes:

**Optimal Distribution:**
- Close range (0-20m): 25-35%
- Medium range (20-45m): 40-50%
- Long range (45m+): 15-25%

**By Weapon Class:**
- Shotgun viability: 15-20% of map
- SMG viability: 30-40% of map
- AR viability: 50-70% of map
- DMR/Sniper viability: 20-35% of map

*Note: Percentages overlap as zones support multiple ranges*

### Engagement Matrix

Create a matrix showing primary engagement type per zone:

```
Zone Name          | Primary Range | Cover Density | Verticality
-------------------|---------------|---------------|------------
Warehouse Main     | Close         | High          | Low
Plaza Center       | Medium        | Medium        | Low
Catwalk Top        | Long          | Low           | High
North Connector    | Close-Medium  | Medium        | Low
```

## Rotation and Timing

### Rotation Standards

**Critical Timings:**

- Spawn to center: 8-12 seconds
- Lane to lane: 6-10 seconds
- Full map traverse: 18-25 seconds
- Objective to fallback: 6-8 seconds

**Design Goals:**
- Prevent excessive time-to-action
- Enable tactical repositioning
- Support comeback mechanics
- Avoid spawn trapping

### Route Complexity

Each major zone should have:
- **Minimum 2 entry/exit points**
- **Optimal 3-4 entry/exit points**
- At least one "safe" rotation route
- At least one high-risk/high-speed route

**Connector Importance:**
- Connectors should be 30-40% of lane width
- Critical connectors need multiple routes
- Chokepoints should have alternative paths within 8 seconds

## Spawn Zone Design

### Spawn Point Requirements

**Per Team:**
- Minimum 3 spawn zones
- Optimal 4-5 spawn zones
- Each zone: 3-6 spawn points

**Spawn Zone Properties:**

1. **Safety Buffer**
   - Minimum 15m from enemy spawn (TDM)
   - Minimum 18m from enemy spawn (KOTH)
   - Minimum 25m from objectives (objective modes)
   - No direct sightlines from power positions

2. **Escape Routes**
   - Minimum 2 exits per spawn zone
   - Exits lead to different lanes
   - Protected rotation paths (cover within 5m)

3. **Zone Distribution**
   - Cover 60-80% of team's map half
   - Enable tactical spawn selection
   - Prevent predictable spawning

### Spawn Facing Direction

- Face toward map center or key lanes
- Avoid facing walls or dead ends
- Consider immediate cover direction
- Account for spawn protection period

## Objective Placement

### King of the Hill Zones

**Requirements:**
- 3 distinct zone locations per map
- Zone radius: 6-9m
- Rotation order provides variety
- Equal distance from both spawns (±15%)

**Zone Characteristics:**
- Mix of open and covered zones
- Different elevation levels
- Varied engagement ranges
- No spawn-adjacent placement

### Domination Points

**Requirements:**
- 3 points: A (close to Team A), B (center), C (close to Team B)
- Point spacing: Minimum 30m apart
- Capture radius: 7-10m

**Balance:**
- Points A and C equidistant from spawns
- Point B slightly favors neither team
- Each point supports different playstyle

### Search & Destroy Sites

**Requirements:**
- 2 bomb sites per map
- Site radius: 10-15m
- Asymmetric placement favoring defenders

**Site Design:**
- Multiple plant locations per site
- Post-plant positions for attackers
- Retake routes for defenders
- Clear sightlines for both sides

## Environmental Design

### Lighting and Visibility

**Lighting Balance:**
- Ambient light: Medium (gameplay priority)
- Avoid extreme dark/bright zones
- Consistent visibility across map
- Shadow density: Medium-High

**Dark Corners:**
- Maximum 5-8 per map
- Must have counterplay (flashlight, etc.)
- Should not be objective locations
- Balance risk vs reward

### Audio Design

**Zone Types:**

1. **Reverb Zones** (indoors): Echo footsteps
2. **Outdoor Zones**: Clear audio
3. **Metal Surfaces**: Louder footsteps
4. **Soft Surfaces**: Quieter footsteps

**Design Goal:** Audio provides tactical information without being overpowering

### Weather and Effects

**Allowed Effects:**
- Light fog (10-15% visibility reduction)
- Rain (audio/visual ambiance)
- Time of day (lighting variation)

**Prohibited Effects:**
- Heavy fog (>20% reduction)
- Sandstorms, blizzards (excessive obscuration)
- Dynamic weather changes mid-match

## Power Positions

### Definition
Power positions are locations that provide significant tactical advantage through elevation, cover, or sightlines.

### Power Position Rules

1. **Limited Cover**: Power positions should have 50-70% normal cover
2. **Multiple Approaches**: Minimum 3 access routes
3. **Exposure Trade-off**: Powerful sightlines = exposed to flanks
4. **No Spawn Dominance**: Can't directly oversee spawn zones
5. **Contestable**: Never permanently held, must be fought for

### Examples

**Good Power Positions:**
- Crane top (Shipyard): Great sightlines, exposed, ladder access = vulnerable
- Catwalk (Arena Hub): Elevated view, low cover, two staircases = contestable

**Bad Power Positions:**
- Unassailable sniper nest with one entrance
- Spawn-overlooking position with full cover
- Position with no counterplay options

## Testing and Validation

### Playtest Checklist

**Balance Testing:**
- [ ] No team wins >60% of matches (10+ games)
- [ ] All weapon classes viable in their zones
- [ ] No dominant power position (holds <40% of match time)
- [ ] Spawn deaths <5% of total deaths
- [ ] Average time to first engagement <10s
- [ ] Full map rotation possible within 25s

**Flow Testing:**
- [ ] Players use all three lanes regularly
- [ ] Objective zones contested (not easily held)
- [ ] Comeback victories possible (30%+ win rate when behind)
- [ ] No excessive camping (players move every 10s avg)

**Technical Testing:**
- [ ] No geometry exploits or out-of-bounds access
- [ ] All collision working correctly
- [ ] Performance target: 60+ FPS on target hardware
- [ ] Audio zones working correctly
- [ ] Lighting provides clear visibility

### Analytics to Track

**Per Map:**
- Win rate by team/side
- Heat maps of player positions
- Kill locations and ranges
- Weapon usage distribution
- Objective control time
- Average match duration
- Player movement patterns
- Spawn safety metrics

**Adjustment Indicators:**

- Win rate >55%: Adjust spawn locations or objective placement
- Single weapon class >40% usage: Rebalance engagement ranges
- Power position >45% occupation: Add access routes or reduce cover
- Spawn deaths >8%: Improve spawn safety buffers
- Average engagement distance off-target: Adjust sightlines/cover

## Map Variants and Modes

### Mode Suitability

Not all maps suit all modes. Design for:

**Primary Mode**: Optimized for this mode
**Secondary Modes**: Functional with minor adjustments
**Unsupported Modes**: May not work without major changes

**Example (Arena Hub):**
- Primary: TDM, KOTH
- Secondary: Domination
- Unsupported: Search & Destroy (too small)

### Seasonal Variants

Consider creating variants for visual variety:
- Night/day versions
- Weather variants
- Holiday themes (cosmetic only)

**Rules for Variants:**
- No gameplay impact
- Same collision/layout
- Maintain visibility standards
- Same callouts

## Reference Maps

### Study These Successful Maps

**CS:GO:**
- Dust2: Three-lane mastery, timeless design
- Mirage: Mid control importance
- Inferno: Tactical depth with verticality

**Valorant:**
- Haven: Asymmetric three-point balance
- Split: Vertical complexity
- Bind: Unique rotation mechanics

**Call of Duty:**
- Raid: Clean three-lane symmetry
- Standoff: Mid-range focus
- Firing Range: Controlled chaos

**Halo:**
- Guardian: Vertical power position balance
- Sanctuary: Map control through positioning

## Documentation Requirements

Every map must include:

1. **Map JSON** (data/maps/)
   - All callouts with coordinates
   - Spawn zones with properties
   - Objective locations
   - Engagement zone distribution
   - Rotation timings
   - Balance notes

2. **Overhead Layout**
   - Lane structure
   - Spawn zones
   - Objective locations
   - Major callouts
   - Sightlines
   - Elevation indicators

3. **Design Rationale**
   - Target player count
   - Supported modes
   - Weapon balance strategy
   - Reference inspirations
   - Known limitations

## Conclusion

Maps are the foundation of Arena Blitz's competitive experience. Following these guidelines ensures:
- Fair, balanced competitive gameplay
- Support for all weapon classes and playstyles
- Clear tactical depth and strategy
- Memorable, learnable layouts
- Long-term player engagement

When in doubt, prioritize **competitive fairness** and **player experience** over visual spectacle or novelty.

**Remember:** A great map is invisible—players focus on the gunfights, not the map itself.
