# KishanQ AI/ML Architecture & Judge Defense Guide
**Smart India Hackathon (SIH) Round 2**
**Role: AI/ML Developer**

---

## 1. Executive Summary for Judges: Turning Rule-Based to Real AI

In early prototypes of agricultural queue systems, recommendation is often hardcoded with static if-else heuristics. **KishanQ implements production-grade Machine Learning and Computer Vision** to solve real procurement bottlenecks:

1. **Model 1: Dynamic APMC Wait-Time & Mandi Congestion Regressor**
   - **Type:** Supervised Multivariate Ensemble Regressor with Regularization ($L_2$ Ridge).
   - **Trained on:** 3,000 APMC (Agricultural Produce Market Committee) mandi logs.
   - **Evaluation Score:** **$R^2 = 0.9419$**, **$\text{RMSE} = \pm 38.93\text{ minutes}$**, **$\text{MAE} = 28.79\text{ minutes}$**.
   - **Purpose:** Accurately forecasts farmer turnaround time, dynamically accounting for peak-hour influxes, tractor unloading delays, and mandi storage bottlenecks.

2. **Model 2: Computer Vision Grain Quality & FCI Grading Inspector**
   - **Type:** Morphological Contour & Chromatic Defect Vision Classifier.
   - **Accuracy:** **$93.75\%$ Overall Classification Accuracy** conforming to Food Corporation of India (FCI) Fair Average Quality (FAQ) norms.
   - **F1-Scores:** Grade A ($0.976$), FAQ ($0.956$), Grade B ($0.873$), Rejected ($0.875$).
   - **Purpose:** Automates grain sample inspection at the mandi bay, removing human bias and corruption by calculating exact Admixture %, Broken Kernels %, and Moisture estimation.

3. **Feature 3: Kishan Sahayak (Multilingual AI Voice Assistant)**
   - **Languages:** **Hindi (हिन्दी)**, **Odia (ଓଡ଼ିଆ)**, **English**.
   - **Purpose:** Solves digital literacy barriers. Farmers can listen to their live queue position, token status, and unloading instructions spoken aloud in their native tongue.

---

## 2. Model 1 Details: Wait-Time & Congestion Regressor

### Feature Importances Learned by the Model:
| Feature | Feature Description | Model Weight / Importance |
| :--- | :--- | :--- |
| **`queue_length`** | Number of tractors / carts queued ahead | **$57.58\%$** |
| **`peak_hour_factor`** | APMC peak arrival surge window ($09:00 - 13:00$) | **$19.88\%$** |
| **`avg_proc_mins`** | Mandi weighbridge & testing speed | **$16.17\%$** |
| **`weather_delay_risk`** | Rainfall / tarp covering delays | **$2.48\%$** |
| **`farmer_quantity_qtl`** | Load size in Quintals | **$2.05\%$** |
| **`remaining_capacity_qtl`** | Mandi silo / yard capacity buffer | **$1.43\%$** |
| **`distance_km`** | Transit transit time to Mandi | **$0.41\%$** |

### Training Script & Artifacts:
- Script: `ml/train_wait_time_model.py`
- Generated Artifact: `ml/model_metrics.json`
- In-Browser Inference Engine: `src/utils/mlWaitTimePredictor.ts` (Ensures zero network latency during live judging).

---

## 3. Model 2 Details: Computer Vision Grain Quality Inspector

### Food Corporation of India (FCI) Tolerance Thresholds:
| Grade | Moisture % | Foreign Matter (Dust/Chaff) % | Damaged Kernels % | Immature / Shrivelled % | MSP Payout |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Grade A** | $\le 14.5\%$ | $\le 0.8\%$ | $\le 2.0\%$ | $\le 2.0\%$ | $100\%$ MSP + Bonus |
| **FAQ** | $\le 16.0\%$ | $\le 1.4\%$ | $\le 3.6\%$ | $\le 3.5\%$ | $100\%$ MSP |
| **Grade B** | $\le 17.0\%$ | $\le 2.0\%$ | $\le 5.0\%$ | $\le 5.5\%$ | MSP minus refraction |
| **Rejected** | $> 17.0\%$ | $> 2.0\%$ | $> 5.0\%$ | $> 6.0\%$ | Rejection (Lot Refused) |

### Training Script & Artifacts:
- Script: `ml/train_grain_vision.py`
- Generated Artifact: `ml/grain_vision_metrics.json`
- UI Station: `src/components/centre/AIGrainQualityModal.tsx` & `src/pages/centre/QualityCheckPage.tsx`.

---

## 4. How to Run the Python AI/ML Microservice

If judges ask to see your REST API live:
```bash
python ml/api.py
```
This launches a lightweight HTTP service on port 8000:
- `POST http://127.0.0.1:8000/predict-wait-time`
- `POST http://127.0.0.1:8000/analyze-grain-quality`
- `GET  http://127.0.0.1:8000/metrics`

*(Note: If the Python server is not running, the web application automatically runs the embedded inference engine with 0ms delay, guaranteeing the demo never fails.)*

---

## 5. Judge Q&A Cheat Sheet for AI/ML Developer

### Q1: "Is this actually AI or just hardcoded rules?"
> **Answer:** "In our initial design, we considered rule-based formulas, but real mandi arrivals exhibit high non-linear queue bottlenecks. We trained an ensemble regularized regressor on 3,000 procurement records with an $R^2$ of $0.9419$, which models peak arrival windows and unloading speeds. Furthermore, our Grain Inspection Bay uses a Computer Vision pipeline that extracts chromatic discoloration and morphological contours to classify grain lots into FCI Grade A, FAQ, or Rejected with $93.75\%$ accuracy."

### Q2: "How does the Computer Vision model handle different grains?"
> **Answer:** "The model extracts grain contours and color space distributions (HSV/Lab). It separates foreign inert matter (weed seeds, stones, husk) from whole grains, and identifies fungal smut or insect-bored kernels via spectral thresholding before mapping against FCI standards."

### Q3: "What if the internet is down at a remote mandi?"
> **Answer:** "Our AI inference architecture uses **Edge Execution**: the trained weights are compiled directly into our client-side inference engine (`mlWaitTimePredictor.ts`). It performs sub-millisecond local predictions without relying on cloud API round-trips."
