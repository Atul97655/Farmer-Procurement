# 🌾 KrishiSetu (कृषिसेतु) — Smart Mandi Procurement System

[![Smart India Hackathon 2026](https://img.shields.io/badge/SIH-2026-brightgreen.svg)](https://www.sih.gov.in/)
[![Problem Statement ID](https://img.shields.io/badge/Problem%20ID-SIH26032-orange.svg)](https://www.sih.gov.in/)
[![Theme](https://img.shields.io/badge/Theme-Smart%20Automation-blue.svg)](https://www.sih.gov.in/)
[![Ministry](https://img.shields.io/badge/Ministry-Consumer%20Affairs%2C%20Food%20%26%20Public%20Distribution-green.svg)](https://consumeraffairs.nic.in/)

> **Smart India Hackathon (SIH 2026) — Problem Statement ID: SIH26032**  
> *"Farmers often face long waiting times, lack of information regarding procurement schedules, and uncertainty about procurement status."*

---

## 🎯 Overview
**KrishiSetu** is an end-to-end digital smart procurement platform built for the **Ministry of Consumer Affairs, Food & Public Distribution** (Food Corporation of India & State Civil Supplies Corporations). It eliminates physical congestion and long waiting times at mandis through intelligent slot scheduling, real-time queue synchronization, tamper-proof IoT weighbridge capture, AI grain quality inspection, and direct benefit transfer (DBT) settlement.

---

## ⚡ Key Features

### 🚜 1. Farmer Portal
- **Crop Registration & Land Record Verification:** Integration with state land survey records & Aadhaar validation.
- **Dynamic Slot Allocation & QR Passes:** Guaranteed arrival batches with digital QR tokens (`PDC-XXXX`).
- **Live Queue Tracking:** Real-time queue position, estimated waiting time, and turnaround indicators.
- **DBT / PFMS Payment Tracker:** Direct benefit transfer tracking with UTR transaction references.
- **Multilingual Accessibility:** English, Hindi (हिंदी), and Odia (ଓଡ଼ିଆ).

### 🏢 2. Mandi Operator Console
- **Gate Inward Check-in Scanner:** Fast QR code and token verification for arrived tractor-trolleys.
- **Real-Time Queue Dispatcher:** 1-click token calling that triggers live announcements across farmer devices and TV kiosks.
- **AI Grain Quality Assistant:** Automated computer vision edge analysis estimating moisture %, foreign matter %, and grain defects adhering to FCI Fair Average Quality (FAQ) standards.
- **IoT Electronic Weighbridge Simulator:** Real-time RS-232/COM3 digital indicator integration preventing manual weight tampering.
- **Procurement Slips & J-Form Generation:** Instant issuance of official weighment certificates.

### 🏛️ 3. Government Admin Dashboard
- **Live Mandi Capacity Monitoring:** Real-time intake load tracking vs. daily capacity thresholds.
- **Bottleneck Analytics:** Queue length heatmaps, average trolley turnaround minutes, and rejection rates.
- **Central Procurement Registry:** Searchable master ledger across all state mandis.

### 📺 4. Public Waiting Hall Display (TV Kiosk)
- Fullscreen Mandi TV board accessible at `/display` showing **NOW CALLING** billboard, upcoming queue list, weather, and real-time audio announcements using speech synthesis.

### 📱 5. Government DLT SMS Simulator
- Floating mobile device drawer showcasing real-time simulated telecom SMS messages delivered from `VM-KRISHI` for OTPs, slot booking confirmations, gate calling alerts, and PFMS DBT credits.

---

## 🏗️ Architecture & Technology Stack

```
+-------------------------------------------------------------+
|                      React 19 Frontend                      |
|       (Vite + TypeScript + Tailwind CSS + Lucide Icons)     |
+------------------------------+------------------------------+
                               |
               HTTP REST + Server-Sent Events (SSE)
                               |
+------------------------------v------------------------------+
|                 Node.js / Express Backend                   |
|        - Real-Time SSE Broadcaster (/api/events)            |
|        - REST API (Centres, Procurements, Queue, Payments)  |
|        - AI Grain Quality Analysis Engine                   |
|        - DLT SMS Simulation Service (VM-KRISHI)             |
+------------------------------+------------------------------+
                               |
+------------------------------v------------------------------+
|                 Persistent SQLite / JSON DB                 |
|             (Thread-safe atomic file storage)               |
+-------------------------------------------------------------+
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18 or higher (tested on Node v24)
- **npm**: v9 or higher

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Atul97655/Farmer-Procurement.git
   cd Farmer-Procurement
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the fullstack application:**
   ```bash
   npm run dev
   ```
   *This starts both the Express API server (port 5000) and the Vite frontend (port 5173) concurrently.*

---

## 🌐 Application URLs

| Route | Description |
| :--- | :--- |
| `http://localhost:5173/portals` | Role Selection (Farmer, Centre Operator, Admin) |
| `http://localhost:5173/farmer/dashboard` | Farmer Main Dashboard |
| `http://localhost:5173/farmer/queue` | Live Queue Position & Status |
| `http://localhost:5173/centre/queue` | Mandi Operator Queue & Gate Scanner |
| `http://localhost:5173/centre/quality-check` | Quality Lab with AI Grain Inspector |
| `http://localhost:5173/centre/weighing` | Electronic Weighbridge Station (IoT) |
| `http://localhost:5173/display` | Mandi Public Waiting Hall TV Kiosk |
| `http://localhost:5000/api/health` | Backend Health & System Status |

---

## 🧪 Verification Commands

```bash
# Type-check and build production bundle
npm run build

# Run linter
npm run lint

# Check backend health
curl http://localhost:5000/api/health
```

---

## 📜 Problem Statement Alignment
- **Waiting Times Reduced:** Time-slotted arrival batches with live queue positions.
- **Transparent Schedules:** Immediate notification of slot confirmations and queue delays.
- **Payment Certainty:** PFMS Direct Benefit Transfer tracking with real-time UTR generation.
- **Tamper Resistance:** Automated weighbridge and AI quality grading eliminating human discretion.
