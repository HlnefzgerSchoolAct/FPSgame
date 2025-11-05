// Weapon system

const WEAPONS = {
    PISTOL: {
        name: 'PISTOL',
        damage: 25,
        fireRate: 300, // RPM
        magazineSize: 12,
        maxAmmo: 120,
        reloadTime: 1.5,
        spread: 0.02,
        recoil: 0.05
    },
    RIFLE: {
        name: 'RIFLE',
        damage: 30,
        fireRate: 600,
        magazineSize: 30,
        maxAmmo: 180,
        reloadTime: 2.5,
        spread: 0.01,
        recoil: 0.03
    },
    SHOTGUN: {
        name: 'SHOTGUN',
        damage: 15,
        fireRate: 60,
        magazineSize: 8,
        maxAmmo: 48,
        reloadTime: 3.0,
        spread: 0.15,
        recoil: 0.2,
        projectilesPerShot: 8
    }
};

class Weapon {
    constructor(config) {
        this.name = config.name;
        this.damage = config.damage;
        this.fireRate = config.fireRate;
        this.magazineSize = config.magazineSize;
        this.maxAmmo = config.maxAmmo;
        this.currentAmmo = config.magazineSize;
        this.reserveAmmo = config.maxAmmo;
        this.reloadTime = config.reloadTime;
        this.spread = config.spread;
        this.recoil = config.recoil;
        this.projectilesPerShot = config.projectilesPerShot || 1;
        
        this.isReloading = false;
        this.reloadTimer = 0;
        this.lastShotTime = 0;
        this.fireDelay = 60 / this.fireRate; // Seconds between shots
    }
    
    canShoot(currentTime) {
        return !this.isReloading && 
               this.currentAmmo > 0 && 
               (currentTime - this.lastShotTime) >= this.fireDelay;
    }
    
    shoot(currentTime) {
        if (!this.canShoot(currentTime)) return false;
        
        this.currentAmmo--;
        this.lastShotTime = currentTime;
        return true;
    }
    
    reload() {
        if (this.isReloading || this.currentAmmo === this.magazineSize || this.reserveAmmo === 0) {
            return false;
        }
        
        this.isReloading = true;
        this.reloadTimer = this.reloadTime;
        return true;
    }
    
    update(deltaTime) {
        if (this.isReloading) {
            this.reloadTimer -= deltaTime;
            if (this.reloadTimer <= 0) {
                const ammoNeeded = this.magazineSize - this.currentAmmo;
                const ammoToAdd = Math.min(ammoNeeded, this.reserveAmmo);
                this.currentAmmo += ammoToAdd;
                this.reserveAmmo -= ammoToAdd;
                this.isReloading = false;
            }
        }
    }
}

class WeaponManager {
    constructor() {
        this.weapons = [
            new Weapon(WEAPONS.PISTOL),
            new Weapon(WEAPONS.RIFLE),
            new Weapon(WEAPONS.SHOTGUN)
        ];
        this.currentWeaponIndex = 1; // Start with rifle
    }
    
    getCurrentWeapon() {
        return this.weapons[this.currentWeaponIndex];
    }
    
    switchWeapon(index) {
        if (index >= 0 && index < this.weapons.length) {
            this.currentWeaponIndex = index;
            return true;
        }
        return false;
    }
    
    update(deltaTime) {
        for (const weapon of this.weapons) {
            weapon.update(deltaTime);
        }
    }
}
