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
    // Three.js WebGL Orbital Simulation
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
        
        // Camera setup
        const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.set(0, 30, 80);

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
        controls.minDistance = 30;
        controls.maxDistance = 150;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
        scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
        sunLight.position.set(50, 20, 30);
        scene.add(sunLight);

        // Moon Sphere
        const moonGeometry = new THREE.SphereGeometry(20, 64, 64);
        
        // Use a generic standard material since we don't have local textures
        const moonMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            roughness: 0.8,
            metalness: 0.1,
            wireframe: false
        });
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        scene.add(moon);

        // Shiv Shakti Point Marker (South Pole ~ 69 deg South)
        const markerGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff3b3b });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        
        // Convert Lat/Lon to Vector3 (Lat: -69.37, Lon: 32.31)
        const lat = -69.373 * (Math.PI / 180);
        const lon = -32.319 * (Math.PI / 180); // Negative because three.js coordinates
        const radius = 20.1;
        marker.position.x = radius * Math.cos(lat) * Math.cos(lon);
        marker.position.y = radius * Math.sin(lat);
        marker.position.z = radius * Math.cos(lat) * Math.sin(lon);
        scene.add(marker);

        // Marker Glow/Ping
        const ringGeometry = new THREE.RingGeometry(0.6, 0.8, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xff3b3b, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.copy(marker.position);
        ring.lookAt(new THREE.Vector3(0,0,0));
        scene.add(ring);

        // Chandrayaan-3 Orbital Path
        const orbitGeometry = new THREE.TorusGeometry(30, 0.05, 16, 100);
        const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.5 });
        const orbitRing = new THREE.Mesh(orbitGeometry, orbitMaterial);
        orbitRing.rotation.x = Math.PI / 2;
        orbitRing.rotation.y = 0.2; // slight inclination
        scene.add(orbitRing);

        // Orbiter Satellite (small box)
        const satGeometry = new THREE.BoxGeometry(1, 1, 2);
        const satMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700 });
        const satellite = new THREE.Mesh(satGeometry, satMaterial);
        scene.add(satellite);

        // Cosmos Starfield Particle System
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 2000;
        const starPositions = new Float32Array(starCount * 3);
        for(let i=0; i < starCount * 3; i++) {
            starPositions[i] = (Math.random() - 0.5) * 400;
        }
        starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5, transparent: true, opacity: 0.8 });
        const stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);

        // Handle Resize
        window.addEventListener('resize', () => {
            if(!container) return;
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        });

        // Animation Loop
        let time = 0;
        function animate() {
            requestAnimationFrame(animate);

            // Rotate Moon slowly
            moon.rotation.y += 0.001;
            
            // Re-calculate marker position so it stays attached to rotating moon
            marker.position.x = radius * Math.cos(lat) * Math.cos(lon - moon.rotation.y);
            marker.position.y = radius * Math.sin(lat);
            marker.position.z = radius * Math.cos(lat) * Math.sin(lon - moon.rotation.y);
            
            ring.position.copy(marker.position);
            ring.lookAt(new THREE.Vector3(0,0,0));

            // Pulse ring
            const scale = 1 + Math.sin(time * 5) * 0.5;
            ring.scale.set(scale, scale, scale);
            ring.material.opacity = 1 - (scale - 0.5) * 0.5;

            // Move Satellite along orbit
            const satRadius = 30;
            const satAngle = time * 0.5;
            satellite.position.x = satRadius * Math.cos(satAngle);
            satellite.position.z = satRadius * Math.sin(satAngle);
            satellite.position.y = satRadius * Math.sin(satAngle) * Math.sin(0.2); // matched inclination
            satellite.lookAt(new THREE.Vector3(0,0,0));

            // Rotate starfield slowly
            stars.rotation.y += 0.0002;

            controls.update();
            renderer.render(scene, camera);
            time += 0.01;
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
