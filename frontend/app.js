document.addEventListener('DOMContentLoaded', () => {
    
    // Simulate fetching data from our space_data_integration.py backend
    function fetchLiveTelemetry() {
        const isSunlit = Math.random() > 0.3; // 70% chance of sunlight
        const temp = isSunlit ? (250 + Math.random() * 100).toFixed(1) : (40 + Math.random() * 50).toFixed(1);
        const solar = isSunlit ? (5 + Math.random() * 40).toFixed(1) : -10.0;
        
        document.getElementById('temp-val').innerText = `${temp} K`;
        document.getElementById('solar-val').innerText = `${solar}°`;
        
        const powerEl = document.getElementById('power-val');
        if(isSunlit) {
            powerEl.innerText = "Optimal";
            powerEl.className = "value success";
            powerEl.style.color = "";
        } else {
            powerEl.innerText = "Battery Rsv";
            powerEl.className = "value";
            powerEl.style.color = "#f59e0b"; // Warning orange
        }
    }

    // Update telemetry every 3 seconds to simulate a live feed
    fetchLiveTelemetry();
    setInterval(fetchLiveTelemetry, 3000);

    // ==========================================
    // Advanced WebGL Orbital Simulation
    // Inspired by smitbhalodiya/chandrayaan-3
    // ==========================================
    
    function initWebGL() {
        const container = document.getElementById('webgl-container');
        if (!container) return;

        // Remove loading overlay
        const loader = document.getElementById('loading-overlay');
        if (loader) loader.style.display = 'none';

        // Scene setup
        const scene = new THREE.Scene();
        
        // Camera setup (Start in Deep Space for cinematic fly-in)
        const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.set(0, 100, 300); // Far away

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        // Controls
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enablePan = false;
        controls.minDistance = 25;
        controls.maxDistance = 150;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.05); // Very dark space
        scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
        sunLight.position.set(100, 20, 50);
        scene.add(sunLight);

        // Texture Loader
        const textureLoader = new THREE.TextureLoader();

        // High-Res Photorealistic Moon Sphere
        const moonRadius = 20;
        const moonGeometry = new THREE.SphereGeometry(moonRadius, 128, 128);
        
        // Using public MRDOOB Three.js examples textures for realism
        const moonColorMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg');
        
        const moonMaterial = new THREE.MeshStandardMaterial({
            map: moonColorMap,
            bumpMap: moonColorMap,
            bumpScale: 0.2,
            roughness: 0.9,
            metalness: 0.1
        });
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        scene.add(moon);

        // Shiv Shakti Point Marker (South Pole ~ 69 deg South)
        const markerGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff3b3b });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        
        // Coordinates setup
        const lat = -69.373 * (Math.PI / 180);
        const lon = -32.319 * (Math.PI / 180); 
        
        // Add marker to a pivot point so it rotates correctly with the moon
        const markerPivot = new THREE.Group();
        markerPivot.add(marker);
        moon.add(markerPivot); // Attach directly to moon mesh

        marker.position.setFromSphericalCoords(moonRadius + 0.1, Math.PI / 2 - lat, lon);

        // Marker Glow/Ping
        const ringGeometry = new THREE.RingGeometry(0.8, 1.2, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xff3b3b, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        marker.add(ring); // Attach ring to marker
        ring.position.set(0,0,0);
        
        // Ensure ring lies flat on surface
        const up = new THREE.Vector3(0, 1, 0);
        const surfaceNormal = marker.position.clone().normalize();
        ring.quaternion.setFromUnitVectors(up, surfaceNormal);

        // Advanced Multi-part Chandrayaan-3 Orbiter
        const orbiterGroup = new THREE.Group();

        // Central Body (Gold Foil)
        const bodyGeo = new THREE.BoxGeometry(1, 1, 1.5);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, roughness: 0.3, metalness: 0.8 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        orbiterGroup.add(body);

        // Solar Panels (Blue)
        const panelGeo = new THREE.BoxGeometry(4, 0.1, 1);
        const panelMat = new THREE.MeshStandardMaterial({ color: 0x0055ff, roughness: 0.1, metalness: 0.5 });
        const panels = new THREE.Mesh(panelGeo, panelMat);
        orbiterGroup.add(panels);

        scene.add(orbiterGroup);

        // Orbital Ring Path
        const satRadius = 35;
        const orbitGeometry = new THREE.TorusGeometry(satRadius, 0.05, 16, 100);
        const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.4 });
        const orbitRing = new THREE.Mesh(orbitGeometry, orbitMaterial);
        orbitRing.rotation.x = Math.PI / 2;
        orbitRing.rotation.y = 0.2; // slight inclination
        scene.add(orbitRing);

        // Cosmos Starfield Particle System
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

        // ==========================================
        // Interactive HUD (Raycaster)
        // ==========================================
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        const tooltip = document.getElementById('hud-tooltip');

        container.addEventListener('mousemove', (event) => {
            const rect = container.getBoundingClientRect();
            // Calculate mouse position in normalized device coordinates (-1 to +1)
            mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);

            // Calculate objects intersecting the picking ray
            // We use marker as the interactive object
            const intersects = raycaster.intersectObject(marker);

            if (intersects.length > 0) {
                // Show tooltip
                tooltip.style.display = 'block';
                tooltip.style.left = (event.clientX - rect.left) + 'px';
                tooltip.style.top = (event.clientY - rect.top) + 'px';
                document.body.style.cursor = 'pointer';
            } else {
                // Hide tooltip
                tooltip.style.display = 'none';
                document.body.style.cursor = 'crosshair';
            }
        });

        container.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });

        // ==========================================
        // Cinematic Camera Fly-In (GSAP)
        // ==========================================
        if (typeof gsap !== 'undefined') {
            gsap.to(camera.position, {
                x: 0,
                y: -15, // Look at south pole
                z: 50,
                duration: 4,
                ease: "power3.inOut",
                onUpdate: () => controls.update()
            });
        } else {
            // Fallback
            camera.position.set(0, -15, 50);
            controls.update();
        }

        // Handle Resize
        window.addEventListener('resize', () => {
            if(!container) return;
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        });

        // Animation Loop
        let time = 0;
        const clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);
            const delta = clock.getDelta();
            time += delta;

            // Rotate Moon slowly
            moon.rotation.y += 0.05 * delta;

            // Pulse ring
            const scale = 1 + Math.sin(time * 3) * 0.4;
            ring.scale.set(scale, scale, scale);
            ring.material.opacity = 1 - (scale - 0.5) * 0.5;

            // Move Satellite along orbit
            const satAngle = time * 0.4;
            orbiterGroup.position.x = satRadius * Math.cos(satAngle);
            orbiterGroup.position.z = satRadius * Math.sin(satAngle);
            orbiterGroup.position.y = satRadius * Math.sin(satAngle) * Math.sin(0.2); // matched inclination
            
            // Point satellite tangent to orbit path
            const nextAngle = (time + 0.1) * 0.4;
            const nextPos = new THREE.Vector3(
                satRadius * Math.cos(nextAngle),
                satRadius * Math.sin(nextAngle) * Math.sin(0.2),
                satRadius * Math.sin(nextAngle)
            );
            orbiterGroup.lookAt(nextPos);

            // Rotate starfield very slowly
            stars.rotation.y += 0.02 * delta;

            controls.update();
            renderer.render(scene, camera);
        }

        animate();
    }

    // Initialize WebGL once Three.js is loaded
    if (typeof THREE !== 'undefined') {
        initWebGL();
    } else {
        // Wait for script to load if slow
        setTimeout(initWebGL, 1000);
    }
});
