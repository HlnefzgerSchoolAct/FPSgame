# Performance Budgets

This document defines the performance targets and budgets for Arena Blitz FPS to ensure smooth gameplay across desktop and mobile platforms.

## Frame Time Budgets

### Desktop (Target: 60 FPS)
- **Total Frame Time**: < 16.67ms (60 FPS)
- **Render Time**: < 12ms
- **JavaScript Logic**: < 4ms average
- **Network/IO**: < 1ms

### Mobile (Target: 30+ FPS)
- **Total Frame Time**: < 33.33ms (30 FPS)
- **Render Time**: < 25ms
- **JavaScript Logic**: < 6ms average
- **Network/IO**: < 2ms

## Draw Call Budgets

### Desktop Mid-Spec
- **Combat (Peak)**: <= 1,000 draw calls
- **Normal Gameplay**: <= 600 draw calls
- **Menu/Lobby**: <= 200 draw calls

### Mobile Mid-Tier
- **Combat (Peak)**: <= 400 draw calls
- **Normal Gameplay**: <= 250 draw calls
- **Menu/Lobby**: <= 100 draw calls

## Memory Budgets

### Desktop
- **GPU Memory (Textures)**: <= 512MB
- **GPU Memory (Geometry)**: <= 256MB
- **JavaScript Heap**: <= 500MB
- **Total**: <= 1.3GB

### Mobile
- **GPU Memory (Textures)**: <= 256MB
- **GPU Memory (Geometry)**: <= 128MB
- **JavaScript Heap**: <= 300MB
- **Total**: <= 700MB

## Asset Budgets

### Textures
- **Diffuse Maps**: Max 2048x2048 (desktop), 1024x1024 (mobile)
- **Normal Maps**: Max 2048x2048 (desktop), 1024x1024 (mobile)
- **UI Atlases**: Max 2048x2048 (both)
- **Compression**: KTX2/Basis Universal required for production
- **Format**: RGBA8 compressed, BC7 or ASTC

### Geometry
- **Character Model**: 15k-25k triangles (LOD0), 8k-12k (LOD1), 3k-5k (LOD2)
- **Weapon Model**: 8k-15k triangles (LOD0), 3k-6k (LOD1)
- **Environment Props**: 2k-8k triangles (LOD0), 500-2k (LOD1)
- **Map Total**: <= 500k triangles visible (desktop), <= 200k (mobile)
- **Compression**: Draco required for static geometry

### Audio
- **Music**: <= 192 kbps MP3/OGG (streaming)
- **Sound Effects**: <= 128 kbps, <= 5s duration
- **Total Audio Memory**: <= 50MB loaded simultaneously

## Bundle Size Budgets

### Initial Load
- **Main Bundle (gzipped)**: <= 1.5MB
- **Three.js Vendor (gzipped)**: <= 600KB
- **Core Gameplay (gzipped)**: <= 400KB
- **UI/Menu (gzipped)**: <= 300KB
- **Total Initial**: <= 2.8MB gzipped

### Lazy-Loaded Chunks
- **Map Asset (per map)**: <= 5MB
- **Weapon Models**: <= 200KB per weapon
- **Character Skins**: <= 300KB per skin

### Asset Streaming
- **Texture Streaming**: Progressive load, priority-based
- **Audio Streaming**: On-demand, pooled playback
- **Map Sections**: Stream in 3-5 sections per map

## Network Budgets

### Bandwidth
- **Upstream**: <= 100 KB/s average, 200 KB/s peak
- **Downstream**: <= 150 KB/s average, 300 KB/s peak
- **Recommended**: 1 Mbps minimum connection

### Latency
- **Target RTT**: < 50ms
- **Acceptable**: < 100ms
- **Degraded**: < 150ms
- **Unplayable**: > 200ms

### Packet Sizes
- **Client Update**: <= 200 bytes
- **Server Snapshot**: <= 500 bytes (delta compressed)
- **Chat Message**: <= 1KB
- **Update Rate**: 20 Hz client, 60 Hz server

## Loading Time Budgets

### Desktop (Broadband)
- **First Interactive**: < 3 seconds
- **Map Load**: < 5 seconds
- **Asset Streaming**: < 2 seconds additional

### Mobile (4G)
- **First Interactive**: < 6 seconds
- **Map Load**: < 10 seconds
- **Asset Streaming**: < 4 seconds additional

## GC (Garbage Collection) Budgets

### Allocation Limits
- **Per Frame**: < 100KB allocations in hot path
- **GC Pause**: < 10ms during gameplay
- **GC Frequency**: < 1 per 5 seconds during combat

### Pooling Requirements
- **Projectiles**: 100% pooled (no allocations)
- **Particles**: 100% pooled (no allocations)
- **Decals**: 100% pooled (no allocations)
- **Audio Sources**: 100% pooled (no allocations)

## Optimization Strategies

### Rendering
1. **Frustum Culling**: Always enabled
2. **Occlusion Culling**: Simple volume-based for large props
3. **LOD System**: 3 levels minimum (desktop), 2 levels (mobile)
4. **Dynamic Resolution**: Toggle for mobile, scale 50-100%
5. **Instancing**: For repeated geometry (500+ instances)

### Memory Management
1. **Texture Compression**: KTX2/Basis for all textures
2. **Mesh Compression**: Draco for static geometry
3. **Asset Unloading**: Unload unused maps after 30s
4. **Texture Mipmaps**: Always generated
5. **Geometry Sharing**: Reuse materials and geometries

### Networking
1. **Delta Compression**: For state snapshots
2. **MessagePack**: Binary format, not JSON
3. **Prediction**: Client-side for movement and shooting
4. **Interpolation**: Server snapshots at 60 Hz
5. **Culling**: Don't send invisible entities

### Code Optimization
1. **Object Pooling**: For all temporary objects
2. **Spatial Partitioning**: BVH or grid for collision/raycasts
3. **Batch Processing**: Group similar operations
4. **Web Workers**: For heavy computation (pathfinding, etc.)
5. **RAF Throttling**: Adaptive frame rate on low-end devices

## Monitoring and Enforcement

### Development
- Run `npm run build` to check bundle sizes
- Use `performance/metrics.js` for runtime monitoring
- Profile with Chrome DevTools and Spector.js
- Check `dist/stats.html` after production build

### CI/CD
- Bundle size checks in CI pipeline
- Lighthouse CI for performance scoring
- Automated texture compression validation
- Draco compression verification

### Production
- Real-time metrics collection
- Alert on budget violations
- Performance regression detection
- User device capability detection

## Testing Requirements

### Desktop (Mid-Spec Target)
- **GPU**: NVIDIA GTX 1060 / AMD RX 580
- **CPU**: Intel i5-8400 / AMD Ryzen 5 2600
- **RAM**: 8GB
- **Browser**: Chrome 90+, Firefox 88+, Edge 90+

### Mobile (Mid-Tier Target)
- **Device**: iPhone 11 / Samsung Galaxy S10
- **OS**: iOS 14+ / Android 10+
- **Browser**: Safari 14+, Chrome Mobile 90+

### Acceptance Criteria
- [ ] 60 FPS sustained on desktop during 12-player combat
- [ ] 30+ FPS on mobile with low settings
- [ ] No GC spikes > 10ms during combat
- [ ] First interactive < 3s desktop, < 6s mobile
- [ ] Bundle size < 1.5MB gzipped
- [ ] GPU memory < 512MB desktop, < 256MB mobile
- [ ] Draw calls < 1000 desktop, < 400 mobile

## Budget Review Schedule

- **Weekly**: Development team reviews metrics
- **Monthly**: Adjust budgets based on device data
- **Quarterly**: Major budget revision with new devices
- **Per Release**: Validate all budgets before production

---

**Last Updated**: 2025-11-05
**Owner**: Performance Team
**Reviewers**: Engineering Lead, Technical Director
