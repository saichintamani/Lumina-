document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // Telemetry & Machine Learning Inference
    // Faustini Doubly Shadowed Region (DSR)
    // ==========================================
    function fetchLiveTelemetry() {
        // Deep cold in DSR, rarely sees sunlight
        const isSunlit = Math.random() > 0.95; 
        const temp = isSunlit ? (120 + Math.random() * 20).toFixed(1) : (30 + Math.random() * 20).toFixed(1);
        const solar = isSunlit ? (1 + Math.random() * 5).toFixed(1) : -15.0;
        
        document.getElementById('temp-val').innerText = `${temp} K`;
        document.getElementById('solar-val').innerText = `${solar}°`;
        
        const hazardEl = document.getElementById('power-val'); // Using power-val ID for hazard in HTML
        if(temp > 40) {
            hazardEl.innerText = "Optimal (Corridor D)";
            hazardEl.className = "value success";
            hazardEl.style.color = "";
        } else {
            hazardEl.innerText = "Extreme Cold";
            hazardEl.className = "value";
            hazardEl.style.color = "#3b82f6"; // Ice blue warning
        }

        // ML Inference for Subsurface Ice
        const mlBase = 96.5;
        const mlFluctuation = (Math.random() * 2).toFixed(1);
        const mlTotal = (mlBase + parseFloat(mlFluctuation)).toFixed(1);
        document.getElementById('ml-prob').innerHTML = `${mlTotal}<span class="unit">%</span>`;
    }

    fetchLiveTelemetry();
    setInterval(fetchLiveTelemetry, 2000); 

    // ==========================================
    // Advanced WebGL Traverse Simulation
    // Focused on Rover Path to Doubly Shadowed Crater
    // ==========================================
    
    function initWebGL() {
        const container = document.getElementById('webgl-container');
        if (!container) return;

        const loader = document.getElementById('loading-overlay');
        if (loader) loader.style.display = 'none';

        const scene = new THREE.Scene();
        
        // Start camera closer for a better view of the surface traverse
        const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.set(0, 15, 40); 

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enablePan = true;
        controls.minDistance = 22;
        controls.maxDistance = 80;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.02); // Deep shadow
        scene.add(ambientLight);

        // Grazing angle light mimicking polar illumination
        const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
        sunLight.position.set(100, 5, 50);
        scene.add(sunLight);

        const textureLoader = new THREE.TextureLoader();

        // High-Res Moon
        const moonRadius = 20;
        const moonGeometry = new THREE.SphereGeometry(moonRadius, 128, 128);
        const moonColorMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg');
        
        const moonMaterial = new THREE.MeshStandardMaterial({
            map: moonColorMap,
            bumpMap: moonColorMap,
            bumpScale: 0.8, // Enhanced bump for rough terrain
            roughness: 0.95,
            metalness: 0.05
        });
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        scene.add(moon);

        // Target: Doubly Shadowed Crater (Lobate Rim)
        const targetGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const targetMaterial = new THREE.MeshBasicMaterial({ color: 0x22c55e }); // Green target
        const target = new THREE.Mesh(targetGeometry, targetMaterial);
        
        // Faustini crater approximate area (South Pole)
        const lat = -85.46 * (Math.PI / 180);
        const lon = 30.12 * (Math.PI / 180); 
        
        const surfaceGroup = new THREE.Group();
        moon.add(surfaceGroup); 

        target.position.setFromSphericalCoords(moonRadius + 0.05, Math.PI / 2 - lat, lon);

        const targetRingGeo = new THREE.RingGeometry(0.5, 0.8, 32);
        const targetRingMat = new THREE.MeshBasicMaterial({ color: 0x22c55e, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
        const targetRing = new THREE.Mesh(targetRingGeo, targetRingMat);
        target.add(targetRing);
        targetRing.position.set(0,0,0);
        
        const up = new THREE.Vector3(0, 1, 0);
        const surfaceNormal = target.position.clone().normalize();
        targetRing.quaternion.setFromUnitVectors(up, surfaceNormal);
        
        surfaceGroup.add(target);

        // ==========================================
        // Animated A* Rover Traverse Path
        // ==========================================
        
        // Create a curvy path simulating avoiding craters (A* path)
        const pathPoints = [];
        const numPoints = 50;
        const startLat = -84.0 * (Math.PI / 180); // Landing site
        const startLon = 25.0 * (Math.PI / 180);
        
        for (let i = 0; i <= numPoints; i++) {
            const t = i / numPoints;
            // Interpolate lat/lon
            let currentLat = startLat + (lat - startLat) * t;
            let currentLon = startLon + (lon - startLon) * t;
            
            // Add noise/curves to simulate hazard avoidance
            const noise = Math.sin(t * Math.PI * 4) * 0.02 * (1-t);
            currentLon += noise;

            const pos = new THREE.Vector3().setFromSphericalCoords(moonRadius + 0.02, Math.PI / 2 - currentLat, currentLon);
            pathPoints.push(pos);
        }

        const pathGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
        const pathMaterial = new THREE.LineBasicMaterial({ color: 0x3b82f6, linewidth: 2, transparent: true, opacity: 0.8 });
        const traversePath = new THREE.Line(pathGeometry, pathMaterial);
        surfaceGroup.add(traversePath);

        // Rover Mesh
        const roverGeo = new THREE.BoxGeometry(0.4, 0.3, 0.5);
        const roverMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.4, metalness: 0.8 });
        const rover = new THREE.Mesh(roverGeo, roverMat);
        surfaceGroup.add(rover);

        // Starfield
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 3000;
        const starPositions = new Float32Array(starCount * 3);
        for(let i=0; i < starCount * 3; i++) {
            starPositions[i] = (Math.random() - 0.5) * 600;
        }
        starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.8, transparent: true, opacity: 0.8 });
        const stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);

        // Raycaster HUD
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        const tooltip = document.getElementById('hud-tooltip');

        container.addEventListener('mousemove', (event) => {
            const rect = container.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObject(target);

            if (intersects.length > 0) {
                tooltip.style.display = 'block';
                tooltip.style.left = (event.clientX - rect.left) + 'px';
                tooltip.style.top = (event.clientY - rect.top) + 'px';
                document.body.style.cursor = 'pointer';
            } else {
                tooltip.style.display = 'none';
                document.body.style.cursor = 'crosshair';
            }
        });

        container.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });

        // Cinematic Fly-In focused on South Pole
        if (typeof gsap !== 'undefined') {
            gsap.to(camera.position, {
                x: 0,
                y: -15, // South pole approach
                z: 25,
                duration: 5,
                ease: "power2.out",
                onUpdate: () => controls.update()
            });
        }

        window.addEventListener('resize', () => {
            if(!container) return;
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        });

        let time = 0;
        const clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);
            const delta = clock.getDelta();
            time += delta;

            // Slow moon rotation
            moon.rotation.y += 0.02 * delta;

            // Pulse target ring
            const scale = 1 + Math.sin(time * 4) * 0.3;
            targetRing.scale.set(scale, scale, scale);
            targetRing.material.opacity = 1 - (scale - 0.5) * 0.5;

            // Animate Rover along A* Path
            const journeyTime = 20; // seconds to complete path
            let progress = (time % journeyTime) / journeyTime;
            
            // Calculate exact position on curve
            const ptIndex = progress * (numPoints - 1);
            const idx = Math.floor(ptIndex);
            const fraction = ptIndex - idx;
            
            if (idx < numPoints - 1) {
                const p1 = pathPoints[idx];
                const p2 = pathPoints[idx + 1];
                rover.position.lerpVectors(p1, p2, fraction);
                
                // Orient rover to look at next point
                const upVec = rover.position.clone().normalize();
                const lookMatrix = new THREE.Matrix4().lookAt(rover.position, p2, upVec);
                rover.quaternion.setFromRotationMatrix(lookMatrix);
            }

            // Path blinking effect
            traversePath.material.opacity = 0.5 + Math.sin(time * 5) * 0.3;

            stars.rotation.y += 0.01 * delta;

            controls.update();
            renderer.render(scene, camera);
        }

        animate();
    }

    if (typeof THREE !== 'undefined') {
        initWebGL();
    } else {
        setTimeout(initWebGL, 1000);
    }
});
