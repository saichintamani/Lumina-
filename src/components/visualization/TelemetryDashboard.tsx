"use client";

import ReactECharts from "echarts-for-react";
import { useEffect, useState } from "react";
import { useTelemetryStore } from "@/lib/memory/useTelemetryStore";
import { Battery, BatteryWarning, Thermometer, AlertTriangle, BatteryMedium, BatteryFull } from "lucide-react";

export default function TelemetryDashboard() {
  const [mounted, setMounted] = useState(false);
  const { batteryLevel, temperature, inShadow } = useTelemetryStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-full w-full bg-[#0f172a] animate-pulse rounded-lg" />;

  // 1. Radar CPR vs DOP Scatter Plot (Ice Signature)
  const radarOptions = {
    title: {
      text: "DFSAR Polarimetric Analysis (L-Band)",
      textStyle: { color: "#F8FAFC", fontFamily: "Fira Code", fontSize: 14 },
    },
    tooltip: {
      trigger: "item",
      formatter: "CPR: {c[0]}<br/>DOP: {c[1]}",
    },
    grid: { left: "10%", right: "10%", bottom: "15%", top: "20%" },
    xAxis: {
      type: "value",
      name: "CPR (Circular Polarization Ratio)",
      nameLocation: "middle",
      nameGap: 30,
      nameTextStyle: { color: "#94a3b8", fontFamily: "Fira Code", fontSize: 12 },
      axisLabel: { color: "#94a3b8", fontFamily: "Fira Code" },
      splitLine: { show: false },
    },
    yAxis: {
      type: "value",
      name: "m-chi DOP",
      nameLocation: "middle",
      nameGap: 40,
      nameTextStyle: { color: "#94a3b8", fontFamily: "Fira Code", fontSize: 12 },
      axisLabel: { color: "#94a3b8", fontFamily: "Fira Code" },
      splitLine: { lineStyle: { color: "rgba(59, 130, 246, 0.1)" } },
    },
    series: [
      {
        name: "Background Regolith",
        type: "scatter",
        symbolSize: 6,
        itemStyle: { color: "rgba(148, 163, 184, 0.5)" },
        data: Array.from({ length: 150 }, () => [
          Math.random() * 0.5 + 0.1, // Low CPR
          Math.random() * 0.4 + 0.1, // Low DOP
        ]),
      },
      {
        name: "Ice Signatures (Target)",
        type: "scatter",
        symbolSize: 8,
        itemStyle: { color: "#22c55e", shadowBlur: 10, shadowColor: "#22c55e" },
        data: Array.from({ length: 40 }, () => [
          Math.random() * 0.4 + 0.8, // High CPR (>0.8)
          Math.random() * 0.4 + 0.6, // High DOP
        ]),
      },
    ],
  };

  // 2. Rover Recharging & Thermal Simulation (Time Series)
  const timeData = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"];
  const solarElevation = [0, 0, 1.2, 3.5, 1.8, 0, 0];
  const predictedPower = [0, 0, 45, 120, 60, 0, 0];
  const surfaceTemp = [40, 42, 65, 110, 75, 45, 41]; // Kelvin

  const chargingOptions = {
    title: {
      text: "Power & Thermal Envelope",
      textStyle: { color: "#F8FAFC", fontFamily: "Fira Code", fontSize: 14 },
    },
    tooltip: { trigger: "axis" },
    legend: {
      data: ["Power (W)", "Temp (K)"],
      textStyle: { color: "#94a3b8", fontFamily: "Fira Code" },
      bottom: 0,
    },
    grid: { left: "10%", right: "10%", bottom: "25%", top: "20%" },
    xAxis: {
      type: "category",
      data: timeData,
      axisLabel: { color: "#94a3b8", fontFamily: "Fira Code" },
    },
    yAxis: [
      {
        type: "value",
        name: "Power",
        nameTextStyle: { color: "#3b82f6", fontFamily: "Fira Code" },
        axisLabel: { color: "#3b82f6", fontFamily: "Fira Code" },
        splitLine: { lineStyle: { color: "rgba(59, 130, 246, 0.1)" } },
      },
      {
        type: "value",
        name: "Temp",
        nameTextStyle: { color: "#ef4444", fontFamily: "Fira Code" },
        axisLabel: { color: "#ef4444", fontFamily: "Fira Code" },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: "Power (W)",
        type: "bar",
        data: predictedPower,
        itemStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "#3b82f6" },
              { offset: 1, color: "rgba(59, 130, 246, 0.1)" },
            ],
          },
        },
      },
      {
        name: "Temp (K)",
        type: "line",
        yAxisIndex: 1,
        data: surfaceTemp,
        smooth: true,
        lineStyle: { color: "#ef4444", width: 3 },
        itemStyle: { color: "#ef4444" },
      },
    ],
  };

  return (
    <div className="flex flex-col h-full w-full gap-4">
      {/* Survival Metrics Bar */}
      <div className="flex flex-row justify-between items-center glass-panel p-4">
        
        {/* Thermal Sensor */}
        <div className={`flex items-center space-x-3 ${inShadow ? 'text-blue-400' : 'text-orange-500'}`}>
          <Thermometer size={24} className={inShadow ? 'animate-pulse' : ''} />
          <div>
            <div className="text-xs font-mono uppercase opacity-70">Hull Temperature</div>
            <div className="text-xl font-bold font-mono">{temperature}°C</div>
          </div>
        </div>

        {/* Hazard Warning */}
        {inShadow && (
          <div className="flex items-center space-x-2 text-red-500 animate-pulse bg-red-500/10 px-4 py-2 rounded">
            <AlertTriangle size={20} />
            <span className="font-mono font-bold text-sm">CRITICAL: SOLAR DEPRIVATION</span>
          </div>
        )}

        {/* Battery Sensor */}
        <div className={`flex items-center space-x-3 ${batteryLevel < 20 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
          <div>
            <div className="text-xs font-mono uppercase opacity-70 text-right">Primary Battery</div>
            <div className="text-xl font-bold font-mono text-right">{batteryLevel}%</div>
          </div>
          {batteryLevel > 75 ? <BatteryFull size={24} /> : batteryLevel > 20 ? <BatteryMedium size={24} /> : <BatteryWarning size={24} />}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 h-full w-full">
        <div className="glass-panel p-4 h-full">
          <ReactECharts option={radarOptions} style={{ height: "100%", width: "100%" }} />
        </div>
        <div className="glass-panel p-4 h-full">
          <ReactECharts option={chargingOptions} style={{ height: "100%", width: "100%" }} />
        </div>
      </div>
    </div>
  );
}
