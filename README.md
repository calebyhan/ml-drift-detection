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

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run notebooks
jupyter lab
```

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

## What This Demonstrates

- Thinking about ML models *after* deployment, not just training accuracy
- The importance of combining statistical and performance-based monitoring
- How to diagnose drift type using a 2x2 detection matrix
- Understanding monitoring trade-offs (sensitivity vs. false alarms)
- Designing controlled experiments to isolate variables
- Being intellectually honest about limitations and failure modes

## References
[1] Fanaee-T, Hadi, and Gama, Joao, "Event labeling combining ensemble detectors and background knowledge", Progress in Artificial Intelligence (2013): pp. 1-15, Springer Berlin Heidelberg, doi:10.1007/s13748-013-0040-3.