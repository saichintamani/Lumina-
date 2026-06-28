document.addEventListener('DOMContentLoaded', () => {
    
    // Simulate fetching data from our space_data_integration.py backend
    function fetchLiveTelemetry() {
        // In a real environment, this would be a fetch() call to a local Python server.
        // We simulate the data return here for the frontend demonstration.
        
        const isSunlit = Math.random() > 0.3; // 70% chance of sunlight
        const temp = isSunlit ? (250 + Math.random() * 100).toFixed(1) : (40 + Math.random() * 50).toFixed(1);
        const solar = isSunlit ? (5 + Math.random() * 40).toFixed(1) : -10.0;
        
        document.getElementById('temp-val').innerText = `${temp} K`;
        document.getElementById('solar-val').innerText = `${solar}°`;
        
        const powerEl = document.getElementById('power-val');
        if(isSunlit) {
            powerEl.innerText = "Optimal";
            powerEl.className = "value success";
        } else {
            powerEl.innerText = "Battery Rsv";
            powerEl.className = "value";
            powerEl.style.color = "#f59e0b"; // Warning orange
        }
    }

    // Update telemetry every 3 seconds to simulate a live feed
    fetchLiveTelemetry();
    setInterval(fetchLiveTelemetry, 3000);
});
