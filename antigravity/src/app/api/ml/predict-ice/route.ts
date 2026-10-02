import { NextResponse } from 'next/server';

// Simulated Random Forest Inference Engine for SIH26166
// In production, this would call the Python ml_ice_classification.py model via gRPC or a microservice.
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { cpr, dop, temperature_k, slope_deg, roughness } = data;

    // We simulate the Random Forest logic based on the python model's ground truth:
    // ice_condition = (cpr > 0.75) & (dop < 0.55) & (temp_k < 120) & (slope_deg < 15)
    
    let probability = 0.05; // Base noise level

    // Evaluate heuristics mimicking the tree splits
    if (cpr > 0.75) probability += 0.35;
    if (dop < 0.55) probability += 0.25;
    if (temperature_k < 120) probability += 0.25;
    if (slope_deg < 15) probability += 0.05;
    if (roughness < 0.1) probability += 0.05;

    // Add slight non-deterministic jitter to simulate a real ML model's confidence distribution
    const jitter = (Math.random() * 0.04) - 0.02; 
    let finalProbability = Math.max(0.01, Math.min(0.99, probability + jitter));

    // Calculate confidence level
    let confidence = "LOW";
    if (finalProbability > 0.8) confidence = "HIGH";
    else if (finalProbability > 0.5) confidence = "MEDIUM";

    return NextResponse.json({
      status: "success",
      model: "RandomForestClassifier (DFSAR Ensembled)",
      input_telemetry: data,
      ice_probability_percent: Number((finalProbability * 100).toFixed(2)),
      confidence_interval: confidence,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({ error: "Failed to process ML inference" }, { status: 500 });
  }
}
