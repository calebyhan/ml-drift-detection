# ML Drift Detection Learning Project

A hands-on exploration of statistical drift detection for production ML monitoring, demonstrating when it works, when it fails, and how it compares to error-based monitoring using the UCI Bike Sharing Dataset.

## Project Overview

This project uses the [UCI Bike Sharing Dataset](https://archive.ics.uci.edu/dataset/275/bike+sharing+dataset) (Washington D.C. hourly rentals, 2011-2012) to explore drift detection concepts:

- **Training data**: 2011 hourly rental records (8,645 records)
- **Evaluation data**: 2012 hourly rental records (8,734 records)
- **Task**: Predict total rental count (`cnt`) from weather and time features
- **Natural drift**: +63% mean ridership in 2012 vs 2011

## 📈 Model Performance

| Metric | Training (2011) | Test (2012) |
|--------|-----------------|-------------|
| RMSE | ~20 | ~126 |
| R² | 0.98 | 0.64 |

**Top Features by Importance:**
1. `hr` (hour of day): 63.6%
2. `atemp` (feels-like temp): 9.9%
3. `temp` (temperature): 8.6%
4. `workingday`: 5.1%
5. `hum` (humidity): 3.4%

## Project Structure

```
├── data/
│   └── hour.csv                   # UCI Bike Sharing hourly data
├── notebooks/
│   ├── 01_eda_baseline.ipynb      # Data exploration & baseline model
│   ├── 02_natural_drift.ipynb     # Real drift analysis (2011 vs 2012)
│   ├── 03_synthetic_experiments.ipynb  # Controlled drift experiments
│   └── 04_failure_modes.ipynb     # 2x2 matrix & recommendations
├── src/
│   └── data.py                    # Data loading, PSI computation, drift injection
├── web/                           # Interactive Next.js web application
│   ├── src/
│   │   ├── app/                   # Pages: home, /explainer, /simulator
│   │   ├── components/            # React components with D3 visualizations
│   │   ├── lib/                   # PSI computation & drift injection (TypeScript)
│   │   ├── data/                  # Pre-processed bike-sharing.json dataset
│   │   └── styles/                # Tailwind CSS configuration
│   ├── public/                    # Static assets (favicon, patterns)
│   └── package.json
├── requirements.txt
└── README.md
```

## Experiments

### Experiment A: Data Drift (Humidity Bias)
- **Setup**: Added +0.2 constant bias to humidity feature
- **Result**: PSI correctly detected drift (0.93), RMSE increased (+14)
- **Conclusion**: ✅ PSI works for important feature drift

### Experiment B: Concept Drift (Morning Rush Changes)
- **Setup**: Zeroed out morning rush (7-9am) rental counts
- **Result**: PSI showed no drift (features unchanged), RMSE increased (+12)
- **Conclusion**: ❌ PSI misses concept drift

### Experiment C: Low-Importance Feature Noise
- **Setup**: Added Gaussian noise (σ=0.5) to windspeed (1.2% feature importance)
- **Result**: PSI showed significant drift (1.44), RMSE barely changed (+4)
- **Conclusion**: ❌ PSI gives false positive alerts

## Drift Detection Metrics

**Population Stability Index (PSI)** measures distribution shift:
- PSI < 0.1: No significant shift
- 0.1 ≤ PSI < 0.2: Moderate shift
- PSI ≥ 0.2: Significant shift

## Setup

### Python Analysis (Notebooks)

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run notebooks
jupyter lab
```

### Web Interface

The `/web` folder contains an interactive Next.js application for exploring drift detection concepts without needing to run notebooks.

```bash
# Navigate to web folder
cd web

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000 in your browser
```

**Available pages:**
- **Home** (`/`) — Landing page with detection matrix overview and key statistics
- **Explainer** (`/explainer`) — Interactive step-by-step guide covering PSI, the 2×2 detection matrix, and real-world failure modes
- **Simulator** (`/simulator`) — Hands-on tool to inject drift (sudden, gradual, or noise) and observe PSI changes in real-time

## Web Interface Features

**Technology Stack:**
- **Frontend**: Next.js 16 with TypeScript and Tailwind CSS
- **Data Visualization**: D3.js for interactive charts and Framer Motion for smooth animations
- **PSI Implementation**: Full TypeScript port of the Python algorithm for browser-based computation
- **Deployment**: Optimized for Vercel serverless hosting

**Interactive Visualizations:**
- **Animated Histograms** — Compare 2011 and 2012 feature distributions with D3 bar charts
- **PSI Gauge** — Real-time semi-circular gauge showing drift severity with threshold indicators
- **Detection Matrix** — Interactive 2×2 matrix exploring all four drift scenarios (true positive, false positive, false negative, true negative)
- **Drift Simulator** — Inject controlled drift into features and observe how PSI responds, with intensity sliders and drift type selection
- **Time Series Charts** — Visualize feature trends and PSI evolution over time

The web interface makes these concepts accessible without requiring Python knowledge or notebook infrastructure—perfect for sharing with stakeholders or teaching.

## 🎯 Key Findings

### Detection Matrix

|                    | **RMSE Stable**      | **RMSE Degraded**      |
|--------------------|---------------------|------------------------|
| **PSI Low**        | ✅ All Good          | ⚡ **Concept Drift**    |
|                    | No action needed    | Collect new labels     |
| **PSI High**       | ⚠️ **False Positive** | ✅ Data Drift Detected |
|                    | Check importance    | Retrain model          |

### Results Summary

| Experiment | Description | PSI Alert | RMSE Increase | Outcome |
|------------|-------------|-----------|---------------|---------|
| Baseline | Train 2011, eval 2012 | No | - | Natural concept drift exists |
| A: Hum +0.2 | Humidity bias | Yes ✅ | Yes ✅ | **True Positive** |
| B: Morning Zeroed | Concept drift | No ❌ | Yes | **False Negative** |
| C: Wind σ=0.5 | Low-importance noise | Yes | No | **False Positive** |

### Key Insights

1. **PSI alone is insufficient** - It misses concept drift (63% ridership increase between 2011-2012)
2. **Weight PSI by feature importance** - This reduces false positives from low-importance features
3. **Combine PSI + RMSE monitoring** - Use a 2x2 matrix to diagnose drift type

## 🎓 Learning Outcomes

This project demonstrates:
1. How PSI (Population Stability Index) works for drift detection
2. The difference between **data drift** and **concept drift**
3. Why statistical drift detection has blind spots
4. How to combine multiple monitoring signals for robust detection
5. Practical thresholds for alerting (PSI ≥ 0.1, RMSE +10%)

## Limitations

- Only 2 years of data, which limits long-term trend analysis
- Synthetic drift scenarios are simplified approximations of real-world failures
- PSI thresholds (0.1, 0.2) are rules of thumb, not universal constants
- Ground truth labels available immediately (unrealistic in production scenarios)
- Web interface operates on a static data snapshot (2011 and 2012 only) — models are not retrained dynamically
- PSI alone cannot distinguish between data drift and concept drift; must be combined with performance metrics

## What This Demonstrates

- Thinking about ML models *after* deployment, not just training accuracy
- The importance of combining statistical and performance-based monitoring
- How to diagnose drift type using a 2x2 detection matrix
- Understanding monitoring trade-offs (sensitivity vs. false alarms)
- Designing controlled experiments to isolate variables
- Being intellectually honest about limitations and failure modes

## References

[1] Fanaee-T, Hadi, and Gama, Joao, "Event labeling combining ensemble detectors and background knowledge", Progress in Artificial Intelligence (2013): pp. 1-15, Springer Berlin Heidelberg, doi:10.1007/s13748-013-0040-3.