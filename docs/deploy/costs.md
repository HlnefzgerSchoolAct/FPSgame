# Cost Estimation and Budget

## Overview

This document provides cost estimates for running FPSgame in production across various traffic levels.

## Cost Structure

### Monthly Costs by Service

| Service | Free Tier | Low Traffic | Medium Traffic | High Traffic |
|---------|-----------|-------------|----------------|--------------|
| **Vercel** | ✅ Hobby: $0 | Pro: $20 | Pro: $20-40 | Enterprise: Custom |
| **Fly.io** | ✅ Free: $0* | $15-30 | $50-100 | $200-500 |
| **Neon PostgreSQL** | ✅ Free: $0 | Free: $0 | Pro: $19 | Pro: $19-69 |
| **Upstash Redis** | ✅ Free: $0 | Free: $0 | Pro: $10 | Pro: $10-50 |
| **Better Stack** | ✅ Free: $0 | Team: $18 | Team: $18 | Business: $79 |
| **Total** | **$0** | **$53-68** | **$117-188** | **$327-748** |

\* Fly.io free tier includes $5 credit/month but may not be sufficient for production

### Traffic Levels Defined

**Low Traffic** (Development/Early Launch):
- 100-500 daily active users (DAU)
- 500-2,000 concurrent players peak
- ~50-100 GB bandwidth/month
- ~1-2M requests/month

**Medium Traffic** (Growing Game):
- 2,000-10,000 DAU
- 5,000-20,000 concurrent players peak
- ~500 GB - 2 TB bandwidth/month
- ~10-50M requests/month

**High Traffic** (Established Game):
- 20,000-100,000 DAU
- 30,000-100,000 concurrent players peak
- ~5-20 TB bandwidth/month
- ~100-500M requests/month

## Detailed Cost Breakdown

### Frontend (Vercel)

**Free Tier (Hobby)**:
- ✅ 100 GB bandwidth/month
- ✅ Unlimited edge requests
- ✅ 100 GB/hour build time
- ✅ 1,000 image optimizations
- ❌ Limited to personal projects
- ❌ No collaboration

**Pro Tier ($20/month)**:
- ✅ 1 TB bandwidth/month (then $40/TB)
- ✅ Unlimited edge requests
- ✅ Team collaboration
- ✅ Advanced analytics
- ✅ Password protection
- ✅ 5,000 image optimizations

**Bandwidth overage**: $40/TB

**Estimated costs**:
- Low traffic: $20/month (within 1 TB)
- Medium traffic: $20-40/month (1-2 TB)
- High traffic: $40-200/month (2-10 TB)

### Backend (Fly.io)

**Free Tier**:
- ✅ $5 credit/month
- ✅ 3 shared-cpu-1x VMs (256 MB RAM each)
- ✅ 160 GB outbound data transfer
- ⚠️ May not be sufficient for production

**Pricing**:
- **CPU**: $0.02/hour shared-cpu-1x (1 CPU, 2 GB RAM)
- **Memory**: $0.0000022/MB/second
- **Outbound bandwidth**: $0.02/GB (after free 160 GB)

**Estimated costs**:

**Low Traffic** (1 instance, 512 MB RAM, 100 GB bandwidth):
```
CPU: 1 × $0.02/hr × 730 hrs = $14.60
RAM: 512 MB × $0.0000022/MB/sec × 2.628M sec = $2.96
Bandwidth: 0 GB overage = $0
Total: ~$15-20/month
```

**Medium Traffic** (2 instances, 1 GB RAM each, 500 GB bandwidth):
```
CPU: 2 × $0.02/hr × 730 hrs = $29.20
RAM: 2 × 1024 MB × $0.0000022/MB/sec × 2.628M sec = $11.84
Bandwidth: 340 GB × $0.02/GB = $6.80
Total: ~$50-60/month
```

**High Traffic** (4-8 instances, 2 GB RAM each, 5 TB bandwidth):
```
CPU: 6 × $0.02/hr × 730 hrs = $87.60
RAM: 6 × 2048 MB × $0.0000022/MB/sec × 2.628M sec = $71.04
Bandwidth: 4,840 GB × $0.02/GB = $96.80
Total: ~$250-350/month
```

### Database (Neon PostgreSQL)

**Free Tier**:
- ✅ 0.5 GB storage
- ✅ 1 project
- ✅ 10 branches
- ✅ Compute: Always available
- ❌ Limited to 0.25 compute units

**Pro Tier ($19/month)**:
- ✅ Starts at $19/month
- ✅ 10 GB included storage ($3.50/GB after)
- ✅ Unlimited projects
- ✅ Unlimited branches
- ✅ Auto-scaling compute
- ✅ Point-in-time restore (7 days)

**Estimated costs**:
- Low traffic: Free tier sufficient
- Medium traffic: $19/month (within 10 GB)
- High traffic: $19-69/month (up to 25 GB)

### Cache (Upstash Redis)

**Free Tier**:
- ✅ 10,000 commands/day
- ✅ 256 MB storage
- ✅ Single region
- ⚠️ May not be sufficient for production

**Pro Tier**:
- ✅ $10/month minimum
- ✅ $0.20 per 100K commands
- ✅ $0.25 per GB storage
- ✅ Multi-region replication

**Estimated costs**:

**Low Traffic** (500K commands/day):
```
Base: $10
Commands: 15M/month × $0.20/100K = $30
Storage: 0.5 GB × $0.25 = $0.13
Total: ~$40/month
```

**Medium Traffic** (5M commands/day):
```
Base: $10
Commands: 150M/month × $0.20/100K = $300
Storage: 2 GB × $0.25 = $0.50
Total: ~$310/month
```

**Note**: For high traffic, consider switching to AWS ElastiCache or self-hosted Redis.

### Monitoring (Better Stack)

**Free Tier**:
- ✅ 1 monitor
- ✅ 5-minute checks
- ✅ Email alerts

**Team Tier ($18/month)**:
- ✅ 10 monitors
- ✅ 30-second checks
- ✅ Unlimited team members
- ✅ Status page
- ✅ Phone call alerts

**Business Tier ($79/month)**:
- ✅ 50 monitors
- ✅ 30-second checks
- ✅ Advanced integrations
- ✅ SLA monitoring

## Cost Optimization Strategies

### 1. Use Free Tiers Wisely

**Initial Launch**:
- Start with free tiers for all services
- Vercel Hobby for frontend
- Fly.io free credit
- Neon free tier
- Upstash free tier

**Monitor usage closely** and upgrade only when needed.

### 2. Optimize Bandwidth

**Frontend**:
- Enable Brotli/Gzip compression (already configured)
- Aggressive caching for static assets
- Use CDN cache effectively
- Optimize images and assets

**Backend**:
- Reduce WebSocket message size (use MessagePack - already implemented)
- Batch updates where possible
- Compress large payloads
- Use efficient data structures

**Target**: < 100 kbps per player during combat

### 3. Right-Size Compute

**Start small**:
- 1 instance with 512 MB RAM
- Scale vertically before horizontally
- Use auto-scaling in Fly.io

**Monitor metrics**:
- CPU usage should average 60-70%
- Memory usage should stay under 80%
- Scale up if consistently above these

### 4. Database Optimization

- Use connection pooling (PgBouncer)
- Index frequently queried columns
- Archive old data
- Use read replicas for read-heavy operations

### 5. Cache Aggressively

- Cache player data in Redis
- Cache shop inventory
- Cache matchmaking queue state
- Set appropriate TTLs

### 6. Regional Deployment

**Start single-region**:
- Choose region close to primary users
- US East (iad) for North America
- EU West for Europe
- Asia Pacific (sin) for Asia

**Expand gradually**:
- Add regions as user base grows
- Use Fly.io's multi-region for low latency

## Budget Planning

### Startup Phase (0-6 months)

**Expected**: 100-1,000 DAU
**Budget**: $0-100/month
- Use free tiers extensively
- Upgrade Vercel to Pro for team features: $20
- Minimal Fly.io usage: $0-30
- Free database and cache tiers

### Growth Phase (6-18 months)

**Expected**: 1,000-10,000 DAU
**Budget**: $100-300/month
- Vercel Pro: $20-40
- Fly.io scaled to 2-3 instances: $50-100
- Neon Pro: $19-30
- Upstash Pro: $10-40
- Better Stack Team: $18

### Established Phase (18+ months)

**Expected**: 10,000-100,000 DAU
**Budget**: $500-2,000/month
- Vercel Pro with bandwidth overages: $100-300
- Fly.io with 4-8 instances across regions: $200-600
- Neon Pro with read replicas: $50-150
- Upstash Pro or self-hosted Redis: $50-200
- Better Stack Business: $79
- Additional tools (APM, error tracking): $100-200

## Cost Monitoring

### Set Up Billing Alerts

**Vercel**:
- Dashboard → Settings → Usage Alerts
- Set threshold at 80% of bandwidth limit

**Fly.io**:
- Dashboard → Billing → Usage Alerts
- Set alerts for spend thresholds

**Neon**:
- Dashboard → Billing → Alerts
- Monitor storage growth

### Monthly Review Checklist

- [ ] Review invoice from each service
- [ ] Compare actual vs. estimated costs
- [ ] Identify cost anomalies
- [ ] Check for optimization opportunities
- [ ] Update cost projections
- [ ] Adjust budgets if needed

## Cost Comparison: Cloud vs. Self-Hosted

### Self-Hosted Option

**Initial Setup**:
- VPS (e.g., DigitalOcean, Linode): $20-100/month
- Domain: $12/year
- SSL certificate: Free (Let's Encrypt)

**Ongoing**:
- Server maintenance: 5-10 hours/month
- Backups: $5-20/month
- Monitoring tools: $0-50/month

**Pros**:
- Lower cost at scale
- More control
- No vendor lock-in

**Cons**:
- Higher maintenance burden
- Less scalability
- No automatic failover
- Need DevOps expertise

**Recommendation**: Start with managed services, consider self-hosting after reaching 50,000+ DAU.

## ROI Calculation

### Revenue Assumptions

**Average Revenue Per Daily Active User (ARPDAU)**:
- Typical F2P game: $0.10-$0.30
- Battle pass + cosmetics model

**Break-even Analysis**:

**Low Traffic** (500 DAU, $68/month cost):
- Required ARPDAU: $0.14
- Total monthly revenue: $70+

**Medium Traffic** (5,000 DAU, $150/month cost):
- Required ARPDAU: $0.10
- Total monthly revenue: $1,500+

**High Traffic** (50,000 DAU, $500/month cost):
- Required ARPDAU: $0.03
- Total monthly revenue: $15,000+

## Conclusion

**Expected Total Cost of Ownership**:

| Phase | DAU | Monthly Cost | Annual Cost |
|-------|-----|--------------|-------------|
| Launch | 100-1K | $0-100 | $0-$1,200 |
| Growth | 1K-10K | $100-300 | $1,200-$3,600 |
| Established | 10K-100K | $500-2,000 | $6,000-$24,000 |

**Key Takeaways**:
1. Start with free tiers to minimize initial costs
2. Scale gradually based on actual usage
3. Monitor costs closely and optimize continuously
4. Plan for 20-30% buffer above estimates
5. Re-evaluate self-hosting after reaching scale

## Additional Resources

- [Vercel Pricing](https://vercel.com/pricing)
- [Fly.io Pricing](https://fly.io/docs/about/pricing/)
- [Neon Pricing](https://neon.tech/pricing)
- [Upstash Pricing](https://upstash.com/pricing)
- [Better Stack Pricing](https://betterstack.com/pricing)
