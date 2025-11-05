/**
 * SceneManager.js - Manages scene loading, lighting, and LOD
 * Handles map loading from JSON, sets up lighting, and manages GPU instancing
 */
import * as THREE from 'three';

export class SceneManager {
  constructor(renderer) {
    this.renderer = renderer;
    this.scene = renderer.getWorldScene();
    
    // Current map data
    this.currentMap = null;
    this.mapObjects = [];
    
    // Instanced meshes for performance
    this.instancedMeshes = new Map();
    
    // Lights
    this.lights = [];
    
    // LOD objects
    this.lodObjects = [];
    
    console.log('SceneManager created');
  }
  
  /**
   * Load a map from JSON data
   */
  async loadMap(mapId) {
    console.log(`Loading map: ${mapId}`);
    
    try {
      // Fetch map data
      const response = await fetch(`/data/maps/${mapId}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load map: ${response.status}`);
      }
      
      const mapData = await response.json();
      this.currentMap = mapData;
      
      // Clear previous map
      this.unloadMap();
      
      // Setup scene based on map data
      this._setupEnvironment(mapData);
      this._setupLighting(mapData);
      this._createMapGeometry(mapData);
      
      console.log(`Map ${mapData.name} loaded successfully`);
      return true;
    } catch (error) {
      console.error('Failed to load map:', error);
      return false;
    }
  }
  
  /**
   * Setup environment (fog, background, etc.)
   * @private
   */
  _setupEnvironment(mapData) {
    // Set background color based on theme
    const themeColors = {
      industrial_complex: 0x2c3e50,
      urban: 0x34495e,
      facility: 0x1a1a2e,
      outdoor: 0x87ceeb
    };
    
    const bgColor = themeColors[mapData.theme] || 0x1a1a2e;
    this.scene.background = new THREE.Color(bgColor);
    
    // Setup fog based on map size
    const fogDistance = Math.max(mapData.dimensions.length, mapData.dimensions.width);
    this.scene.fog = new THREE.Fog(bgColor, fogDistance * 0.5, fogDistance * 1.5);
  }
  
  /**
   * Setup lighting based on map data
   * @private
   */
  _setupLighting(mapData) {
    // Clear existing lights
    this.lights.forEach(light => this.scene.remove(light));
    this.lights = [];
    
    // Ambient light - base illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);
    this.lights.push(ambientLight);
    
    // Directional light - main sun/moon light with shadows
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    
    // Position based on time of day
    const timePositions = {
      dawn: { x: -50, y: 30, z: 0 },
      day: { x: 0, y: 50, z: 0 },
      dusk: { x: 50, y: 30, z: 0 },
      night: { x: 0, y: 20, z: 50 }
    };
    
    const timeOfDay = mapData.time_of_day || 'day';
    const lightPos = timePositions[timeOfDay] || timePositions.day;
    
    dirLight.position.set(lightPos.x, lightPos.y, lightPos.z);
    dirLight.castShadow = true;
    
    // Shadow quality based on renderer settings
    const quality = this.renderer.quality;
    const shadowSize = quality === 'low' ? 512 : quality === 'medium' ? 1024 : 2048;
    
    dirLight.shadow.mapSize.width = shadowSize;
    dirLight.shadow.mapSize.height = shadowSize;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 200;
    
    // Shadow camera frustum - cover the map
    const mapSize = Math.max(mapData.dimensions.length, mapData.dimensions.width) / 2;
    dirLight.shadow.camera.left = -mapSize;
    dirLight.shadow.camera.right = mapSize;
    dirLight.shadow.camera.top = mapSize;
    dirLight.shadow.camera.bottom = -mapSize;
    
    this.scene.add(dirLight);
    this.lights.push(dirLight);
    
    // Hemisphere light for ambient color variation
    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x545454, 0.3);
    this.scene.add(hemiLight);
    this.lights.push(hemiLight);
  }
  
  /**
   * Create map geometry from map data
   * @private
   */
  _createMapGeometry(mapData) {
    // Create ground plane
    this._createGround(mapData);
    
    // Create basic geometry for lanes
    this._createLanes(mapData);
    
    // Create spawn zone markers (for debugging)
    if (window.DEBUG_MODE) {
      this._createSpawnMarkers(mapData);
    }
    
    // Create objective markers
    this._createObjectiveMarkers(mapData);
    
    // Create placeholder cover objects with instancing
    this._createCoverObjects(mapData);
  }
  
  /**
   * Create ground plane
   * @private
   */
  _createGround(mapData) {
    const dim = mapData.dimensions;
    const geometry = new THREE.PlaneGeometry(dim.width, dim.length);
    const material = new THREE.MeshStandardMaterial({
      color: 0x2c3e50,
      roughness: 0.8,
      metalness: 0.2
    });
    
    const ground = new THREE.Mesh(geometry, material);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    ground.name = 'ground';
    
    this.scene.add(ground);
    this.mapObjects.push(ground);
  }
  
  /**
   * Create lane geometry
   * @private
   */
  _createLanes(mapData) {
    if (!mapData.layout || !mapData.layout.lanes) return;
    
    const laneColors = {
      indoor: 0x34495e,
      outdoor: 0x7f8c8d,
      elevated: 0x95a5a6
    };
    
    mapData.layout.lanes.forEach((lane, index) => {
      const color = laneColors[lane.type] || 0x34495e;
      const geometry = new THREE.BoxGeometry(lane.width, 3, lane.length);
      const material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.7,
        metalness: 0.3
      });
      
      const laneMesh = new THREE.Mesh(geometry, material);
      
      // Position lanes side by side
      const xOffset = (index - 1) * (lane.width + 5);
      laneMesh.position.set(xOffset, 1.5, 0);
      laneMesh.castShadow = true;
      laneMesh.receiveShadow = true;
      laneMesh.name = `lane_${lane.id}`;
      
      this.scene.add(laneMesh);
      this.mapObjects.push(laneMesh);
    });
  }
  
  /**
   * Create spawn zone markers (debug)
   * @private
   */
  _createSpawnMarkers(mapData) {
    if (!mapData.spawn_zones) return;
    
    ['team_a', 'team_b'].forEach(team => {
      const teamColor = team === 'team_a' ? 0x00ff00 : 0xff0000;
      const zones = mapData.spawn_zones[team] || [];
      
      zones.forEach(zone => {
        const geometry = new THREE.CylinderGeometry(zone.radius, zone.radius, 0.1, 16);
        const material = new THREE.MeshBasicMaterial({
          color: teamColor,
          transparent: true,
          opacity: 0.3
        });
        
        const marker = new THREE.Mesh(geometry, material);
        marker.position.set(zone.position[0], 0.05, zone.position[1]);
        marker.name = `spawn_${zone.id}`;
        
        this.scene.add(marker);
        this.mapObjects.push(marker);
      });
    });
  }
  
  /**
   * Create objective markers
   * @private
   */
  _createObjectiveMarkers(mapData) {
    if (!mapData.objective_locations) return;
    
    // KOTH zones
    if (mapData.objective_locations.koth_zones) {
      mapData.objective_locations.koth_zones.forEach(zone => {
        const geometry = new THREE.CylinderGeometry(zone.radius, zone.radius, 2, 32);
        const material = new THREE.MeshStandardMaterial({
          color: 0xffff00,
          transparent: true,
          opacity: 0.2,
          emissive: 0xffff00,
          emissiveIntensity: 0.3
        });
        
        const marker = new THREE.Mesh(geometry, material);
        marker.position.set(zone.position[0], 1, zone.position[1]);
        marker.name = `objective_${zone.id}`;
        
        this.scene.add(marker);
        this.mapObjects.push(marker);
      });
    }
  }
  
  /**
   * Create cover objects with GPU instancing
   * @private
   */
  _createCoverObjects(mapData) {
    if (!mapData.cover_distribution) return;
    
    const coverTypes = mapData.cover_distribution.cover_types;
    
    // Create instanced meshes for each cover type
    this._createInstancedCovers('full_height', coverTypes.full_height || 0, 
                                new THREE.BoxGeometry(1, 2, 1), 0x7f8c8d);
    this._createInstancedCovers('half_height', coverTypes.half_height || 0, 
                                new THREE.BoxGeometry(1, 1, 1), 0x95a5a6);
  }
  
  /**
   * Create instanced cover objects for performance
   * @private
   */
  _createInstancedCovers(type, count, geometry, color) {
    if (count === 0) return;
    
    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.8,
      metalness: 0.2
    });
    
    const mesh = new THREE.InstancedMesh(geometry, material, count);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.name = `cover_${type}`;
    
    // Position instances randomly within map bounds
    const dim = this.currentMap.dimensions;
    const dummy = new THREE.Object3D();
    
    for (let i = 0; i < count; i++) {
      dummy.position.set(
        (Math.random() - 0.5) * dim.width * 0.8,
        type === 'half_height' ? 0.5 : 1,
        (Math.random() - 0.5) * dim.length * 0.8
      );
      dummy.rotation.y = Math.random() * Math.PI * 2;
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    
    mesh.instanceMatrix.needsUpdate = true;
    
    this.scene.add(mesh);
    this.instancedMeshes.set(type, mesh);
    this.mapObjects.push(mesh);
  }
  
  /**
   * Unload current map
   */
  unloadMap() {
    // Remove all map objects
    this.mapObjects.forEach(obj => {
      this.scene.remove(obj);
      
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(mat => mat.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
    
    this.mapObjects = [];
    this.instancedMeshes.clear();
    this.currentMap = null;
    
    console.log('Map unloaded');
  }
  
  /**
   * Update LOD based on camera distance
   */
  updateLOD(cameraPosition) {
    this.lodObjects.forEach(lodGroup => {
      lodGroup.update(cameraPosition);
    });
  }
  
  /**
   * Get spawn points for a team
   */
  getSpawnPoints(team) {
    if (!this.currentMap || !this.currentMap.spawn_zones) return [];
    
    const zones = this.currentMap.spawn_zones[team] || [];
    return zones.map(zone => ({
      id: zone.id,
      position: new THREE.Vector3(zone.position[0], 0, zone.position[1]),
      radius: zone.radius,
      facing: new THREE.Vector3(zone.facing[0], zone.facing[1], zone.facing[2])
    }));
  }
  
  /**
   * Get objective locations
   */
  getObjectiveLocations(mode) {
    if (!this.currentMap || !this.currentMap.objective_locations) return [];
    
    const modeKey = mode === 'koth' ? 'koth_zones' : 'domination_points';
    const objectives = this.currentMap.objective_locations[modeKey] || [];
    
    return objectives.map(obj => ({
      id: obj.id,
      position: new THREE.Vector3(obj.position[0], obj.position[2] || 0, obj.position[1]),
      radius: obj.radius
    }));
  }
}
