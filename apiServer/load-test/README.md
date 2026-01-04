# Load Testing for Animal Zoom API Server

This directory contains Artillery load testing scenarios for the Animal Zoom API server.

## Prerequisites

- API server running on `http://localhost:3000`
- PostgreSQL database running and connected
- Artillery installed (already in devDependencies)

## Running Load Tests

### Quick Start

```bash
# From apiServer directory
bun run test:load

# Or directly with Artillery
npx artillery run load-test/scenario.yml
```

### Generate HTML Report

```bash
npx artillery run --output load-test/report.json load-test/scenario.yml
npx artillery report load-test/report.json
```

## Test Scenarios

### 1. Complete User Journey (70% of traffic)
Simulates a full user flow:
1. Create guest user
2. Create room
3. Join room
4. Get room info
5. Get participants
6. Update avatar
7. Get avatar
8. Leave room

### 2. Join Existing Room (20% of traffic)
Simulates users joining existing rooms:
1. Create guest user
2. Try to join a random room from pool

### 3. Avatar Customization Focus (10% of traffic)
Stress tests the avatar service:
1. Create guest user
2. Update avatar 5 times rapidly
3. Get avatar

### 4. Authentication Stress Test (5% of traffic)
Tests the authentication endpoints:
1. Register new user
2. Get profile

## Load Test Phases

### Phase 1: Warm-up (30s)
- **Arrival Rate**: 1 user/second
- **Purpose**: Warm up the server and database connections

### Phase 2: Ramp-up (60s)
- **Arrival Rate**: 5 → 10 users/second
- **Purpose**: Gradually increase load to identify breaking points

### Phase 3: Sustained Load (120s)
- **Arrival Rate**: 10 users/second
- **Target**: 50+ concurrent users
- **Purpose**: Test performance under normal high load

### Phase 4: Spike Test (30s)
- **Arrival Rate**: 20 users/second
- **Target**: 100+ concurrent users
- **Purpose**: Test system behavior under sudden load spikes

### Phase 5: Cool-down (30s)
- **Arrival Rate**: 2 users/second
- **Purpose**: Monitor recovery and resource cleanup

## Performance Thresholds

- **p95 Response Time**: < 200ms ✅
- **p99 Response Time**: < 500ms ✅
- **Max Error Rate**: < 1% ✅

## Metrics Captured

- **Request Rate**: Requests per second
- **Response Times**: min, max, median, p95, p99
- **Status Codes**: 2xx, 4xx, 5xx distribution
- **Errors**: Count and types
- **Scenarios**: Completion rate per scenario

## Interpreting Results

### Success Criteria
```
✅ All scenarios.launched > 0
✅ All scenarios.completed > 0
✅ http.response_time.p95 < 200ms
✅ http.response_time.p99 < 500ms
✅ Error rate < 1%
✅ No database connection errors
```

### Warning Signs
```
⚠️ p95 > 200ms → Performance degradation
⚠️ p99 > 500ms → Slow queries or bottlenecks
⚠️ Error rate > 1% → Server instability
⚠️ 5xx errors → Server crashes or database issues
⚠️ Increasing memory usage → Memory leak
```

## Troubleshooting

### High Error Rate
- Check database connections (max pool size)
- Check for rate limiting
- Verify API server logs for errors

### Slow Response Times
- Check database query performance
- Add indexes to frequently queried columns
- Enable query logging to identify slow queries
- Check for N+1 query problems

### Memory Issues
- Monitor with `docker stats`
- Check for memory leaks with heap snapshots
- Verify connection pooling configuration

## Advanced Usage

### Custom Configuration

```bash
# Override target URL
npx artillery run --target http://production.example.com load-test/scenario.yml

# Set custom environment variables
npx artillery run -e production load-test/scenario.yml
```

### Continuous Load Testing

```bash
# Run for extended duration (useful for stress testing)
npx artillery run --duration 600 load-test/scenario.yml
```

### Integration with CI/CD

```yaml
# Example GitHub Actions workflow
- name: Run Load Tests
  run: |
    npm run start:prod &
    sleep 10
    npx artillery run --output report.json load-test/scenario.yml
    npx artillery report report.json
```

## Files

- `scenario.yml` - Main Artillery configuration and test scenarios
- `functions.js` - Custom JavaScript functions for test logic
- `README.md` - This file

## References

- [Artillery Documentation](https://www.artillery.io/docs)
- [Performance Testing Best Practices](https://www.artillery.io/docs/guides/overview/performance-testing)
