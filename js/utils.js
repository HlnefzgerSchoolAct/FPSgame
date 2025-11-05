// Utility functions for the FPS game

// Vector operations
const Vector = {
    create: (x = 0, y = 0, z = 0) => ({ x, y, z }),
    
    add: (v1, v2) => ({
        x: v1.x + v2.x,
        y: v1.y + v2.y,
        z: v1.z + v2.z
    }),
    
    subtract: (v1, v2) => ({
        x: v1.x - v2.x,
        y: v1.y - v2.y,
        z: v1.z - v2.z
    }),
    
    multiply: (v, scalar) => ({
        x: v.x * scalar,
        y: v.y * scalar,
        z: v.z * scalar
    }),
    
    magnitude: (v) => Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z),
    
    normalize: (v) => {
        const mag = Vector.magnitude(v);
        if (mag === 0) return { x: 0, y: 0, z: 0 };
        return {
            x: v.x / mag,
            y: v.y / mag,
            z: v.z / mag
        };
    },
    
    dot: (v1, v2) => v1.x * v2.x + v1.y * v2.y + v1.z * v2.z,
    
    cross: (v1, v2) => ({
        x: v1.y * v2.z - v1.z * v2.y,
        y: v1.z * v2.x - v1.x * v2.z,
        z: v1.x * v2.y - v1.y * v2.x
    }),
    
    distance: (v1, v2) => {
        const dx = v2.x - v1.x;
        const dy = v2.y - v1.y;
        const dz = v2.z - v1.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    },
    
    distance2D: (v1, v2) => {
        const dx = v2.x - v1.x;
        const dz = v2.z - v1.z;
        return Math.sqrt(dx * dx + dz * dz);
    },
    
    lerp: (v1, v2, t) => ({
        x: v1.x + (v2.x - v1.x) * t,
        y: v1.y + (v2.y - v1.y) * t,
        z: v1.z + (v2.z - v1.z) * t
    })
};

// Math utilities
const MathUtils = {
    clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
    
    lerp: (start, end, t) => start + (end - start) * t,
    
    degToRad: (degrees) => degrees * (Math.PI / 180),
    
    radToDeg: (radians) => radians * (180 / Math.PI),
    
    randomRange: (min, max) => Math.random() * (max - min) + min,
    
    randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
};

// Collision utilities
const CollisionUtils = {
    pointInRect: (point, rect) => {
        return point.x >= rect.x && point.x <= rect.x + rect.width &&
               point.y >= rect.y && point.y <= rect.y + rect.height;
    },
    
    circleIntersectsRect: (circle, rect) => {
        const closestX = MathUtils.clamp(circle.x, rect.x, rect.x + rect.width);
        const closestY = MathUtils.clamp(circle.y, rect.y, rect.y + rect.height);
        
        const dx = circle.x - closestX;
        const dy = circle.y - closestY;
        
        return (dx * dx + dy * dy) < (circle.radius * circle.radius);
    },
    
    circlesIntersect: (c1, c2) => {
        const dx = c2.x - c1.x;
        const dy = c2.y - c1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (c1.radius + c2.radius);
    }
};

// Performance utilities
const Performance = {
    now: () => performance.now(),
    
    fps: 0,
    frameCount: 0,
    lastTime: performance.now(),
    
    update: function() {
        this.frameCount++;
        const currentTime = performance.now();
        const elapsed = currentTime - this.lastTime;
        
        if (elapsed >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / elapsed);
            this.frameCount = 0;
            this.lastTime = currentTime;
        }
    }
};
