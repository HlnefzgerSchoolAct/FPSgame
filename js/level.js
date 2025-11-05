// Level and Map system

class Level {
    constructor() {
        // Map grid (1 = wall, 0 = empty, 2 = enemy spawn)
        this.map = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,1,1,1,0,0,0,0,0,0,1],
            [1,0,0,2,0,0,0,0,0,0,0,2,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,1,1,1,0,0,1],
            [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,2,0,0,0,0,0,1,0,0,0,2,0,0,1],
            [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
            [1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,1],
            [1,0,0,2,0,0,0,0,0,0,0,2,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];
        
        this.width = this.map[0].length;
        this.height = this.map.length;
        this.cellSize = 1;
        this.wallHeight = 1;
        
        this.spawnPoints = this.findSpawnPoints();
    }
    
    findSpawnPoints() {
        const points = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.map[y][x] === 2) {
                    points.push({ x: x + 0.5, z: y + 0.5 });
                    this.map[y][x] = 0; // Clear spawn marker
                }
            }
        }
        return points;
    }
    
    getCell(x, z) {
        const gridX = Math.floor(x);
        const gridZ = Math.floor(z);
        
        if (gridX < 0 || gridX >= this.width || gridZ < 0 || gridZ >= this.height) {
            return 1; // Out of bounds = wall
        }
        
        return this.map[gridZ][gridX];
    }
    
    isWall(x, z) {
        return this.getCell(x, z) === 1;
    }
    
    checkCollision(x, z, radius) {
        // Check the four corners of the bounding box
        const checks = [
            { x: x - radius, z: z - radius },
            { x: x + radius, z: z - radius },
            { x: x - radius, z: z + radius },
            { x: x + radius, z: z + radius }
        ];
        
        for (const check of checks) {
            if (this.isWall(check.x, check.z)) {
                return true;
            }
        }
        
        return false;
    }
    
    // Raycasting for rendering
    castRay(originX, originZ, angle, maxDistance = 20) {
        const rayDirX = Math.cos(angle);
        const rayDirZ = Math.sin(angle);
        
        const deltaDistX = Math.abs(1 / rayDirX);
        const deltaDistZ = Math.abs(1 / rayDirZ);
        
        let mapX = Math.floor(originX);
        let mapZ = Math.floor(originZ);
        
        let stepX, stepZ;
        let sideDistX, sideDistZ;
        
        if (rayDirX < 0) {
            stepX = -1;
            sideDistX = (originX - mapX) * deltaDistX;
        } else {
            stepX = 1;
            sideDistX = (mapX + 1 - originX) * deltaDistX;
        }
        
        if (rayDirZ < 0) {
            stepZ = -1;
            sideDistZ = (originZ - mapZ) * deltaDistZ;
        } else {
            stepZ = 1;
            sideDistZ = (mapZ + 1 - originZ) * deltaDistZ;
        }
        
        let hit = false;
        let side;
        let distance = 0;
        
        while (!hit && distance < maxDistance) {
            if (sideDistX < sideDistZ) {
                sideDistX += deltaDistX;
                mapX += stepX;
                side = 0;
            } else {
                sideDistZ += deltaDistZ;
                mapZ += stepZ;
                side = 1;
            }
            
            if (this.isWall(mapX + 0.5, mapZ + 0.5)) {
                hit = true;
            }
            
            if (side === 0) {
                distance = (mapX - originX + (1 - stepX) / 2) / rayDirX;
            } else {
                distance = (mapZ - originZ + (1 - stepZ) / 2) / rayDirZ;
            }
        }
        
        return {
            hit,
            distance,
            side,
            mapX,
            mapZ
        };
    }
    
    // Raycast for weapon hit detection
    raycastHit(originX, originY, originZ, dirX, dirY, dirZ, maxDistance = 20) {
        const result = this.castRay(originX, originZ, Math.atan2(dirZ, dirX), maxDistance);
        
        if (result.hit) {
            return {
                hit: true,
                distance: result.distance,
                point: {
                    x: originX + dirX * result.distance,
                    y: originY,
                    z: originZ + dirZ * result.distance
                }
            };
        }
        
        return { hit: false };
    }
}
