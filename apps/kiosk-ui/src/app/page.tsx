"use client";

import { useKiosk } from "@/hooks/useKiosk";
import IdleScreen from "@/components/IdleScreen";
import MeasurementGuide from "@/components/MeasurementGuide";
import LiveMonitor from "@/components/LiveMonitor";
import ResultSummary from "@/components/ResultSummary";
import { useEffect } from "react";
import { KioskState } from "@/types/kiosk";

export default function Home() {
  const {
    state,
    citizen,
    session,
    authCitizen,
    startSession,
    saveMeasurement,
    endSession,
    printTicket,
    transition
  } = useKiosk();

  // State Machine View Switcher
  const renderContent = () => {
    switch (state) {
      case 'IDLE':
        return <IdleScreen onAuth={authCitizen} />;

      case 'DASHBOARD':
        return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
            <h1 className="text-4xl mb-4">Welcome, {citizen?.full_name}</h1>
            <button
              onClick={startSession}
              className="px-8 py-4 bg-teal-600 text-white text-2xl rounded-xl shadow-lg hover:bg-teal-700"
            >
              Start Check-up
            </button>
          </div>
        );

      // --- BLOOD PRESSURE ---
      case 'MEASURING_BP':
        return (
          <MeasurementGuide
            title="Blood Pressure"
            instruction="Please insert your left arm into the cuff and keep still."
            onStart={() => transition('MEASURING_BP_LIVE')}
          />
        );
      case 'MEASURING_BP_LIVE':
        return <LiveMonitor sensorType="bp" onComplete={(val) => {
          saveMeasurement('bp', `-`, 'mmHg', JSON.stringify(val));
          transition('MEASURING_SPO2');
        }} />;

      // --- SPO2 ---
      case 'MEASURING_SPO2':
        return <LiveMonitor sensorType="spo2" onComplete={(val) => {
          saveMeasurement('spo2', `${val.spo2}`, '%');
          transition('MEASURING_WEIGHT');
        }} />;

      case 'MEASURING_SPO2_LIVE':
        return <LiveMonitor sensorType="spo2" onComplete={(val) => {
          saveMeasurement('spo2', `${val.spo2}`, '%');
          transition('MEASURING_WEIGHT');
        }} />;

      // --- WEIGHT ---
      case 'MEASURING_WEIGHT':
        return <LiveMonitor sensorType="weight" onComplete={(val) => {
          saveMeasurement('weight', `${val.weight}`, 'kg');
          transition('MEASURING_HEIGHT');
        }} />;

      case 'MEASURING_WEIGHT_LIVE':
        return <LiveMonitor sensorType="weight" onComplete={(val) => {
          saveMeasurement('weight', `${val.weight}`, 'kg');
          transition('MEASURING_HEIGHT');
        }} />;

      // --- HEIGHT ---
      case 'MEASURING_HEIGHT':
        return <LiveMonitor sensorType="height" onComplete={(val) => {
          saveMeasurement('height', `${val.height}`, 'cm');
          transition('MEASURING_TEMP');
        }} />;

      case 'MEASURING_HEIGHT_LIVE':
        return <LiveMonitor sensorType="height" onComplete={(val) => {
          saveMeasurement('height', `${val.height}`, 'cm');
          transition('MEASURING_TEMP');
        }} />;

      // --- TEMPERATURE ---
      case 'MEASURING_TEMP':
        return <LiveMonitor sensorType="temperature" onComplete={(val) => {
          saveMeasurement('temperature', `${val.temperature}`, 'degC');
          endSession();
        }} />;

      case 'MEASURING_TEMP_LIVE':
        return <LiveMonitor sensorType="temperature" onComplete={(val) => {
          saveMeasurement('temperature', `${val.temperature}`, 'degC');
          endSession();
        }} />;

      // --- RESULTS ---
      case 'RESULTS':
        return session ? <ResultSummary session={session} onPrint={printTicket} /> : <div>Loading...</div>;

      case 'PRINTING':
        return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-teal-600 text-white">
            <h1 className="text-6xl font-bold animate-bounce">Printing...</h1>
            <p className="mt-4 text-2xl">Please collect your ticket below.</p>
          </div>
        );

      default:
        return <div className="p-12">Unknown State: {state}</div>;
    }
  };

  return (
    <main className="min-h-screen font-sans">
      {renderContent()}
    </main>
  );
}
