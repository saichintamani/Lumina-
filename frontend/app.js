document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // Telemetry & Machine Learning Inference
    // ==========================================
    function fetchLiveTelemetry() {
        const isSunlit = Math.random() > 0.3; 
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
            powerEl.style.color = "#f59e0b"; 
        }

        // ML Inference Mockup (Fluctuates around the 94% we trained in python)
        const mlBase = 92.5;
        const mlFluctuation = (Math.random() * 3).toFixed(1);
        const mlTotal = (mlBase + parseFloat(mlFluctuation)).toFixed(1);
        document.getElementById('ml-prob').innerHTML = `${mlTotal}<span class="unit">%</span>`;
    }

    fetchLiveTelemetry();
    setInterval(fetchLiveTelemetry, 2000); // Faster polling for "live" feel

    // ==========================================
    // Advanced WebGL Orbital Simulation
    // Inspired by smitbhalodiya/chandrayaan-3
    // ==========================================
    
    function initWebGL() {
        const container = document.getElementById('webgl-container');
        if (!container) return;

        const loader = document.getElementById('loading-overlay');
        if (loader) loader.style.display = 'none';

        const scene = new THREE.Scene();
        
        const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.set(0, 100, 300); // Deep Space start

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enablePan = false;
        controls.minDistance = 25;
        controls.maxDistance = 150;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.05); 
        scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
        sunLight.position.set(100, 20, 50);
        scene.add(sunLight);

        const textureLoader = new THREE.TextureLoader();

        // High-Res Moon
        const moonRadius = 20;
        const moonGeometry = new THREE.SphereGeometry(moonRadius, 128, 128);
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

        // Shiv Shakti Point
        const markerGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const markerMaterial = new THREE.MeshBasicMaterial({ color: 0x22c55e }); // Changed to green for success
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        
        const lat = -69.373 * (Math.PI / 180);
        const lon = -32.319 * (Math.PI / 180); 
        
        const markerPivot = new THREE.Group();
        markerPivot.add(marker);
        moon.add(markerPivot); 

        marker.position.setFromSphericalCoords(moonRadius + 0.1, Math.PI / 2 - lat, lon);

        const ringGeometry = new THREE.RingGeometry(0.8, 1.2, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x22c55e, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        marker.add(ring);
        ring.position.set(0,0,0);
        
        const up = new THREE.Vector3(0, 1, 0);
        const surfaceNormal = marker.position.clone().normalize();
        ring.quaternion.setFromUnitVectors(up, surfaceNormal);

        // Chandrayaan-3 Orbiter
        const orbiterGroup = new THREE.Group();

        const bodyGeo = new THREE.BoxGeometry(1, 1, 1.5);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, roughness: 0.3, metalness: 0.8 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        orbiterGroup.add(body);

        const panelGeo = new THREE.BoxGeometry(4, 0.1, 1);
        const panelMat = new THREE.MeshStandardMaterial({ color: 0x0055ff, roughness: 0.1, metalness: 0.5 });
        const panels = new THREE.Mesh(panelGeo, panelMat);
        orbiterGroup.add(panels);

        // Laser Altimeter Beam (Green)
        const laserGeo = new THREE.CylinderGeometry(0.02, 0.02, 15, 8);
        const laserMat = new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.6 });
        const laser = new THREE.Mesh(laserGeo, laserMat);
        // Position laser so it points straight down from the satellite
        laser.position.set(0, -7.5, 0);
        orbiterGroup.add(laser);

        scene.add(orbiterGroup);

        // Polar Orbital Ring Path
        const satRadius = 35;
        const orbitGeometry = new THREE.TorusGeometry(satRadius, 0.05, 32, 100);
        const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.3 });
        const orbitRing = new THREE.Mesh(orbitGeometry, orbitMaterial);
        
        // Accurate Polar Orbit (90 deg inclination roughly)
        orbitRing.rotation.x = Math.PI / 2;
        orbitRing.rotation.y = Math.PI / 2; // Flip to go over the poles
        scene.add(orbitRing);

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
            const intersects = raycaster.intersectObject(marker);

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

        // Cinematic Fly-In
        if (typeof gsap !== 'undefined') {
            gsap.to(camera.position, {
                x: 30,
                y: -15, // Look at south pole
                z: 30,
                duration: 5,
                ease: "power3.inOut",
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

            moon.rotation.y += 0.05 * delta;

            const scale = 1 + Math.sin(time * 3) * 0.4;
            ring.scale.set(scale, scale, scale);
            ring.material.opacity = 1 - (scale - 0.5) * 0.5;

            // Polar Orbit calculation
            const satAngle = time * 0.3;
            // Orbiting over poles (y and z axis mostly, with x offset for inclination)
            orbiterGroup.position.x = 0;
            orbiterGroup.position.y = satRadius * Math.cos(satAngle);
            orbiterGroup.position.z = satRadius * Math.sin(satAngle);
            
            // Orient satellite so bottom faces the moon center
            orbiterGroup.lookAt(new THREE.Vector3(0,0,0));
            // Rotate the group so it flies forward along the orbit path rather than "falling"
            orbiterGroup.rotateX(Math.PI / 2);

            // Blink laser altimeter
            laser.material.opacity = (Math.sin(time * 20) > 0) ? 0.6 : 0.0;

            stars.rotation.y += 0.02 * delta;

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
