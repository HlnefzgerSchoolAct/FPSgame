# Spawn System Design Specification

## Overview
The spawn system is designed to provide fair, dynamic spawning that prevents spawn camping while maintaining game flow and player engagement. The system uses a weighted scoring approach to select optimal spawn points each time a player respawns.

## Core Principles

1. **Fairness**: Players should spawn in safe locations away from immediate threats
2. **Flow**: Spawns should keep players in the action without excessive downtime
3. **Anti-Camping**: System actively penalizes spawn camping behavior
4. **Team Play**: Encourage spawning near teammates when strategically beneficial
5. **Adaptability**: Spawn locations adapt to current game state and objective positions

## Spawn Point Weighting System

### Base Weight Calculation

Each potential spawn point starts with a base weight of 100. The following modifiers adjust the weight:

#### Distance-Based Modifiers

**Enemy Proximity** (Most Critical)
- Enemy within 10m: -1000 (effectively disabled)
- Enemy within 15m: -500
- Enemy within 20m: -200
- Enemy within 25m: -50
- Enemy beyond 25m: 0

**Teammate Proximity** (Moderate Priority)
- 0 teammates within 20m: -30
- 1 teammate within 20m: +10
- 2 teammates within 20m: +20
- 3+ teammates within 20m: +15 (diminishing returns to prevent clustering)

**Objective Distance** (Mode-Dependent)
- For objective modes (KOTH, Domination):
  - Too close (< 25m): -100 (prevents instant objective rushing)
  - Optimal range (25-40m): +30
  - Far (40-60m): +10
  - Very far (> 60m): -20
- For non-objective modes (TDM):
  - Central map locations: +20
  - Edge locations: -10

#### Line of Sight Modifiers

**Enemy Line of Sight**
- Direct LOS to enemy: -800
- Partial cover from enemies: +20
- Full cover from enemies: +40

**Spawn Camping Detection**
- Enemy has remained within 5m of spawn for 8+ seconds: -500 to that spawn
- Enemy has killed 2+ players at spawn in last 30s: -800 to that spawn
- Spawn temporarily disabled for 15s after camping detected

#### Historical Usage

**Spawn Rotation**
- Last used < 5s ago: -300
- Last used 5-15s ago: -100
- Last used 15-30s ago: -30
- Last used 30-60s ago: +10 (prefer variety)
- Not used in 60s: +20

**Recent Death Location**
- Died within 10m of this spawn: -200 (avoid same location)
- Died within 20m of this spawn: -50

#### Map Control and Flow

**Team Territory Control**
- Spawn in area controlled by team (more teammates than enemies nearby): +40
- Spawn in contested area (equal teams): 0
- Spawn in enemy-controlled area: -60

**Lane Balance** (for three-lane maps)
- Lane underutilized by team: +25
- Lane balanced: 0
- Lane overcrowded by team: -35

## Spawn Protection

### Invulnerability Phase
- Duration: 2.0-2.5 seconds (mode-dependent)
- Visual indicator: Faint blue shield effect
- Breaks on: Player movement, shooting, taking damage from enemy
- Partial protection: 50% damage reduction for 1s after full protection ends

### Spawn Immunity Rules
- Cannot damage enemies while protected
- Can view environment and aim
- Protection persists through healing/equipment use
- Warning indicator at 0.5s before protection ends

## Dynamic Spawn Waves

### Wave-Based Spawning (Optional, Mode-Dependent)

Some modes may use wave-based spawning for tactical depth:

**Wave Configuration**
- Wave interval: 5-10 seconds
- Max players per wave: 3-4
- Wave sync tolerance: ±2 seconds

**Wave Benefits**
- Encourages coordinated pushes
- Reduces individual player advantage from staggered spawns
- Adds strategic timing element

**Modes Using Waves**: Future tactical modes (not TDM or KOTH)

## Mode-Specific Spawn Behaviors

### Team Deathmatch (TDM)
- Spawn delay: 3 seconds
- Spawn protection: 2 seconds
- Priority: Safety > Team proximity > Map balance
- No fixed spawn zones, fully dynamic
- Spawns rotate aggressively to prevent camping

### King of the Hill (KOTH)
- Spawn delay: 4 seconds
- Spawn protection: 2.5 seconds
- Priority: Safety > Objective distance > Team proximity
- Spawns shift based on objective location
- Increased distance requirement from objective (25m minimum)
- Fallback spawns available if primary zones compromised

## Anti-Camping Mechanics

### Detection
1. **Position Tracking**: System tracks player positions every 0.5s
2. **Camping Threshold**: Player in 5m radius for 8+ seconds triggers flag
3. **Spawn Zone Focus**: Extra weight on camping near known spawn zones
4. **Kill History**: 2+ spawn kills in 30s = aggressive camping flag

### Response
1. **Spawn Penalty**: Camped spawns receive -500 to -800 weight
2. **Temporary Disable**: Extreme camping disables spawn for 15s
3. **Alternative Activation**: System activates backup spawn zones
4. **Visual Warning**: Camper sees "Spawn Camping - Leave Area" warning
5. **Notification**: Affected team notified "Enemy camping your spawn - alternate routes active"

### Prevention
- Minimum 3 spawn zones per team (TDM: 3, KOTH: 4)
- Spawn zones have overlapping coverage
- No single spawn zone covers < 30% of potential spawn locations
- Dynamic spawn zone weighting adjusts in real-time

## Implementation Pseudocode

```javascript
function selectSpawnPoint(player, gameState) {
  const spawnPoints = getAvailableSpawnPoints(player.team, gameState.mode);
  const weights = [];
  
  for (const point of spawnPoints) {
    let weight = 100; // Base weight
    
    // Enemy proximity (critical)
    const nearestEnemy = findNearestEnemy(point, gameState);
    weight += calculateEnemyProximityPenalty(nearestEnemy.distance);
    
    // LOS check
    if (hasLineOfSight(point, nearestEnemy)) {
      weight -= 800;
    }
    
    // Teammate proximity
    const nearbyTeammates = countTeammatesInRadius(point, 20, gameState);
    weight += calculateTeammateBonus(nearbyTeammates);
    
    // Camping detection
    if (isSpawnCamped(point, gameState)) {
      weight -= 500;
    }
    
    // Historical usage
    weight += calculateUsageModifier(point, gameState.spawnHistory);
    
    // Objective distance (mode-dependent)
    if (gameState.mode.hasObjective) {
      const objDist = distanceToObjective(point, gameState.objective);
      weight += calculateObjectiveDistanceModifier(objDist);
    }
    
    // Map control
    weight += calculateTerritoryControl(point, gameState);
    
    weights.push({ point, weight });
  }
  
  // Filter out invalid spawns (weight < -500)
  const validSpawns = weights.filter(w => w.weight > -500);
  
  if (validSpawns.length === 0) {
    // Emergency fallback: use least-bad spawn
    return weights.sort((a, b) => b.weight - a.weight)[0].point;
  }
  
  // Weight-based random selection (higher weight = higher probability)
  return weightedRandomSelect(validSpawns);
}

function weightedRandomSelect(weightedPoints) {
  const totalWeight = weightedPoints.reduce((sum, w) => sum + Math.max(0, w.weight), 0);
  let random = Math.random() * totalWeight;
  
  for (const wp of weightedPoints) {
    random -= Math.max(0, wp.weight);
    if (random <= 0) {
      return wp.point;
    }
  }
  
  return weightedPoints[0].point; // Fallback
}
```

## Safe Radius Requirements

### Minimum Safe Distances
- From enemies: 15m (TDM), 18m (KOTH)
- From objective: 25m (objective modes only)
- From recent death location: 10m
- From spawn campers: 20m

### Vertical Tolerance
- Maximum height difference: 5m
- Accounts for multi-level maps
- Prevents spawning directly above/below enemies

## Performance Considerations

### Optimization Strategies
1. **Spawn Point Culling**: Pre-filter obviously invalid spawns before weight calculation
2. **Spatial Partitioning**: Use grid-based spatial hash for proximity checks
3. **Update Frequency**: Recalculate spawn weights every 2 seconds, not every frame
4. **Caching**: Cache teammate/enemy positions with 0.5s tolerance
5. **Async Processing**: Weight calculation can happen off main thread

### Target Performance
- Spawn selection calculation: < 10ms
- Maximum delay from respawn trigger to placement: < 50ms total
- No perceptible lag or stuttering

## Testing and Validation

### Test Scenarios
1. **Spawn Safety**: No spawns within 15m of enemies in 95%+ of cases
2. **Anti-Camping**: System redirects spawns within 5 seconds of camping detection
3. **Flow**: Average spawn-to-action time < 8 seconds
4. **Balance**: Each spawn zone used within 20% of equal distribution over 100 spawns
5. **Edge Cases**: Handle 0 valid spawns gracefully

### Analytics Tracking
- Spawn distance to nearest enemy (histogram)
- Time to first engagement after spawn
- Spawn deaths (< 2 seconds after spawn)
- Spawn zone utilization distribution
- Camping detection frequency
- Spawn system override frequency (emergency fallbacks)

## Future Enhancements

### Planned Features
1. **Machine Learning**: ML model to predict optimal spawns based on player behavior
2. **Spawn Preferences**: Allow players to indicate preferred spawn style (aggressive/defensive)
3. **Spawn Swaps**: Allow recently spawned players to swap spawn locations
4. **Dynamic Zones**: Procedurally generate spawn zones based on match flow
5. **Spawn Callouts**: Optional audio callouts for spawn location (competitive feature)

## References and Inspiration

- **Halo 3**: Spawn influence system and respawn zones
- **Call of Duty**: Modern spawn camping prevention
- **Battlefield**: Squad spawn system (adapted for team spawns)
- **Rainbow Six Siege**: Spawn point customization (future consideration)
- **CS:GO**: Fixed spawn system (rejected for lack of dynamism)

## Conclusion

The spawn system prioritizes player experience through safety, fairness, and anti-camping mechanics while maintaining engaging gameplay flow. The weighted scoring approach provides flexibility to tune behavior per mode while maintaining consistency in core safety principles.

All spawn parameters are configurable per game mode in their respective JSON configurations, allowing for easy balance adjustments without code changes.
