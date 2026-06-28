document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // Advanced Telemetry & Machine Learning
    // Faustini Doubly Shadowed Region (DSR)
    // ==========================================
    function fetchLiveTelemetry() {
        const isSunlit = Math.random() > 0.95; 
        const temp = isSunlit ? (120 + Math.random() * 20).toFixed(1) : (30 + Math.random() * 20).toFixed(1);
        const solar = isSunlit ? (1 + Math.random() * 5).toFixed(1) : -15.0;
        
        document.getElementById('temp-val').innerText = `${temp} K`;
        document.getElementById('solar-val').innerText = `${solar}°`;
        
        const hazardEl = document.getElementById('power-val'); 
        if(temp > 40) {
            hazardEl.innerText = "Optimal (Corridor D)";
            hazardEl.className = "value success glitch-text";
            hazardEl.style.color = "";
        } else {
            hazardEl.innerText = "Extreme Cold";
            hazardEl.className = "value glitch-text";
            hazardEl.style.color = "#3b82f6"; 
        }

        const mlBase = 96.5;
        const mlFluctuation = (Math.random() * 2).toFixed(1);
        const mlTotal = (mlBase + parseFloat(mlFluctuation)).toFixed(1);
        document.getElementById('ml-prob').innerHTML = `${mlTotal}<span class="unit">%</span>`;
    }

    fetchLiveTelemetry();
    setInterval(fetchLiveTelemetry, 1000); // Increased polling rate for intensity

    // ==========================================
    // Advanced WebGL Traverse Simulation
    // Featuring Particle Systems & DFSAR Radar Scans
    // ==========================================
    
    function initWebGL() {
        const container = document.getElementById('webgl-container');
        if (!container) return;

        const loader = document.getElementById('loading-overlay');
        if (loader) loader.style.display = 'none';

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x020617, 0.015); // Add space fog for depth
        
        const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.set(0, 15, 40); 

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enablePan = true;
        controls.minDistance = 22;
        controls.maxDistance = 80;
        // Restrict polar angles to keep the view focused on the surface
        controls.maxPolarAngle = Math.PI / 1.5;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.02); 
        scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 1.8);
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
            bumpScale: 0.8,
            roughness: 0.95,
            metalness: 0.05
        });
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        scene.add(moon);

        // ==========================================
        // ADVANCED: DFSAR Global Radar Scanner Grid
        // ==========================================
        const scanGeometry = new THREE.SphereGeometry(moonRadius + 0.1, 64, 64);
        const scanMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x22c55e, 
            wireframe: true, 
            transparent: true, 
            opacity: 0.0 
        });
        const scannerGrid = new THREE.Mesh(scanGeometry, scanMaterial);
        moon.add(scannerGrid);

        // Target: Faustini PSR
        const targetGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const targetMaterial = new THREE.MeshBasicMaterial({ color: 0x22c55e });
        const target = new THREE.Mesh(targetGeometry, targetMaterial);
        
        const lat = -85.46 * (Math.PI / 180);
        const lon = 30.12 * (Math.PI / 180); 
        
        const surfaceGroup = new THREE.Group();
        moon.add(surfaceGroup); 

        target.position.setFromSphericalCoords(moonRadius + 0.05, Math.PI / 2 - lat, lon);

        // Advanced Target Ring (Double Pulse)
        const targetRingGeo = new THREE.RingGeometry(0.5, 0.8, 32);
        const targetRingMat = new THREE.MeshBasicMaterial({ color: 0x22c55e, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
        const targetRing = new THREE.Mesh(targetRingGeo, targetRingMat);
        
        const outerRingGeo = new THREE.RingGeometry(0.9, 1.0, 32);
        const outerRingMat = new THREE.MeshBasicMaterial({ color: 0x22c55e, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
        const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);

        target.add(targetRing);
        target.add(outerRing);
        
        const up = new THREE.Vector3(0, 1, 0);
        const surfaceNormal = target.position.clone().normalize();
        targetRing.quaternion.setFromUnitVectors(up, surfaceNormal);
        outerRing.quaternion.setFromUnitVectors(up, surfaceNormal);
        
        surfaceGroup.add(target);

        // Animated A* Rover Traverse Path
        const pathPoints = [];
        const numPoints = 80;
        const startLat = -84.0 * (Math.PI / 180); 
        const startLon = 25.0 * (Math.PI / 180);
        
        for (let i = 0; i <= numPoints; i++) {
            const t = i / numPoints;
            let currentLat = startLat + (lat - startLat) * t;
            let currentLon = startLon + (lon - startLon) * t;
            
            const noise = Math.sin(t * Math.PI * 6) * 0.015 * (1-t);
            currentLon += noise;

            const pos = new THREE.Vector3().setFromSphericalCoords(moonRadius + 0.02, Math.PI / 2 - currentLat, currentLon);
            pathPoints.push(pos);
        }

        const pathGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
        const pathMaterial = new THREE.LineBasicMaterial({ color: 0x3b82f6, linewidth: 3, transparent: true, opacity: 0.9 });
        const traversePath = new THREE.Line(pathGeometry, pathMaterial);
        surfaceGroup.add(traversePath);

        // High-Detail Rover Mesh
        const roverGroup = new THREE.Group();
        
        const roverGeo = new THREE.BoxGeometry(0.4, 0.25, 0.6);
        const roverMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.4, metalness: 0.8 });
        const body = new THREE.Mesh(roverGeo, roverMat);
        
        const panelGeo = new THREE.BoxGeometry(0.6, 0.02, 0.4);
        const panelMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.9 });
        const solarPanel = new THREE.Mesh(panelGeo, panelMat);
        solarPanel.position.set(0, 0.15, 0);
        
        roverGroup.add(body);
        roverGroup.add(solarPanel);
        surfaceGroup.add(roverGroup);

        // ==========================================
        // ADVANCED: Regolith Particle Dust Trail
        // ==========================================
        const particleCount = 150;
        const particleGeo = new THREE.BufferGeometry();
        const particlePos = new Float32Array(particleCount * 3);
        const particleLifetimes = new Float32Array(particleCount);
        
        for(let i = 0; i < particleCount; i++) {
            particlePos[i*3] = 0;
            particlePos[i*3+1] = 0;
            particlePos[i*3+2] = 0;
            particleLifetimes[i] = Math.random(); 
        }
        
        particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
        particleGeo.setAttribute('lifetime', new THREE.BufferAttribute(particleLifetimes, 1));
        
        const particleMat = new THREE.PointsMaterial({
            color: 0xcccccc,
            size: 0.15,
            transparent: true,
            opacity: 0.6,
            depthWrite: false
        });
        const dustTrail = new THREE.Points(particleGeo, particleMat);
        surfaceGroup.add(dustTrail);

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

        // Interactive Raycaster
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        const tooltip = document.getElementById('hud-tooltip');

        container.addEventListener('mousemove', (event) => {
            const rect = container.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObject(target, true);

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

        // Cinematic Fly-In
        if (typeof gsap !== 'undefined') {
            gsap.to(camera.position, {
                x: 5,
                y: -10, 
                z: 22,
                duration: 6,
                ease: "power3.out",
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
        let dustIndex = 0;

        function animate() {
            requestAnimationFrame(animate);
            const delta = clock.getDelta();
            time += delta;

            moon.rotation.y += 0.01 * delta;

            // DFSAR Radar Scan Effect
            const scanPhase = time % 10;
            if (scanPhase < 2) {
                scannerGrid.material.opacity = Math.sin(scanPhase * Math.PI / 2) * 0.15;
            } else {
                scannerGrid.material.opacity = 0;
            }

            // Pulsing Rings
            const scale = 1 + Math.sin(time * 5) * 0.2;
            targetRing.scale.set(scale, scale, scale);
            targetRing.material.opacity = 1 - (scale - 0.8) * 1.5;
            
            const outerScale = 1 + Math.cos(time * 3) * 0.4;
            outerRing.scale.set(outerScale, outerScale, outerScale);

            // Animate Rover & Dust Trail
            const journeyTime = 30; // slower, more methodical
            let progress = (time % journeyTime) / journeyTime;
            
            const ptIndex = progress * (numPoints - 1);
            const idx = Math.floor(ptIndex);
            const fraction = ptIndex - idx;
            
            if (idx < numPoints - 1) {
                const p1 = pathPoints[idx];
                const p2 = pathPoints[idx + 1];
                roverGroup.position.lerpVectors(p1, p2, fraction);
                
                const upVec = roverGroup.position.clone().normalize();
                const lookMatrix = new THREE.Matrix4().lookAt(roverGroup.position, p2, upVec);
                roverGroup.quaternion.setFromRotationMatrix(lookMatrix);

                // Update Dust Particles
                const positions = dustTrail.geometry.attributes.position.array;
                const lifetimes = dustTrail.geometry.attributes.lifetime.array;
                
                // Emit new particle at rover position
                if (Math.random() > 0.3) {
                    dustIndex = (dustIndex + 1) % particleCount;
                    positions[dustIndex * 3] = roverGroup.position.x + (Math.random()-0.5)*0.1;
                    positions[dustIndex * 3 + 1] = roverGroup.position.y + (Math.random()-0.5)*0.1;
                    positions[dustIndex * 3 + 2] = roverGroup.position.z + (Math.random()-0.5)*0.1;
                    lifetimes[dustIndex] = 1.0;
                }

                // Fade and float particles
                for(let i=0; i<particleCount; i++) {
                    if(lifetimes[i] > 0) {
                        lifetimes[i] -= delta * 0.5;
                        positions[i*3] += upVec.x * 0.02; // Float up slightly
                        positions[i*3+1] += upVec.y * 0.02;
                        positions[i*3+2] += upVec.z * 0.02;
                    } else {
                        // Hide dead particles inside the moon
                        positions[i*3] = 0;
                        positions[i*3+1] = 0;
                        positions[i*3+2] = 0;
                    }
                }
                dustTrail.geometry.attributes.position.needsUpdate = true;
            }

            // Path energy flow effect
            traversePath.material.dashSize = 0.5;
            traversePath.material.gapSize = 0.2;
            traversePath.material.opacity = 0.6 + Math.sin(time * 8) * 0.4;

            stars.rotation.y += 0.01 * delta;
            stars.rotation.x += 0.005 * delta;

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
