"""
Data loading and preprocessing utilities for the Bike Sharing drift detection project.
"""

import os
from pathlib import Path

import numpy as np
import pandas as pd


def load_bike_sharing_data(data_path: str | None = None) -> pd.DataFrame:
    """
    Load the UCI Bike Sharing dataset (hourly data).
    
    Args:
        data_path: Optional path to the hour.csv file. If None, looks in ../data/hour.csv
                   relative to this module.
    
    Returns:
        pd.DataFrame: Combined features and targets with all columns.
    """
    if data_path is None:
        # Look for data relative to this module
        module_dir = Path(__file__).parent
        data_path = module_dir.parent / "data" / "hour.csv"
    
    df = pd.read_csv(data_path)
    
    # Convert date column
    if 'dteday' in df.columns:
        df['dteday'] = pd.to_datetime(df['dteday'])
    
    return df


def split_by_year(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    """
    Split data into 2011 (training) and 2012 (evaluation) sets.
    
    Args:
        df: Full bike sharing dataframe with 'yr' column (0=2011, 1=2012)
        
    Returns:
        Tuple of (train_2011, eval_2012) DataFrames
    """
    train_2011 = df[df['yr'] == 0].copy()
    eval_2012 = df[df['yr'] == 1].copy()
    
    return train_2011, eval_2012


def get_feature_columns() -> list[str]:
    """Return the feature columns used for modeling."""
    return [
        'season', 'mnth', 'hr', 'holiday', 'weekday', 'workingday',
        'weathersit', 'temp', 'atemp', 'hum', 'windspeed'
    ]


def get_numeric_features() -> list[str]:
    """Return numeric feature columns for drift detection."""
    return ['temp', 'atemp', 'hum', 'windspeed']


def get_categorical_features() -> list[str]:
    """Return categorical feature columns."""
    return ['season', 'mnth', 'hr', 'holiday', 'weekday', 'workingday', 'weathersit']


def compute_psi(
    reference: np.ndarray,
    current: np.ndarray,
    n_bins: int = 10,
    method: str = 'quantile'
) -> float:
    """
    Compute Population Stability Index (PSI) between two distributions.
    
    PSI measures how much a distribution has shifted from a reference baseline.
    - PSI < 0.1: No significant shift
    - 0.1 <= PSI < 0.2: Moderate shift, investigation recommended
    - PSI >= 0.2: Significant shift, action required
    
    Args:
        reference: Reference distribution (e.g., training data)
        current: Current distribution to compare
        n_bins: Number of bins for discretization
        method: 'quantile' for quantile-based bins, 'equal' for equal-width bins
        
    Returns:
        PSI value (float)
    """
    # Remove NaN values
    reference = reference[~np.isnan(reference)]
    current = current[~np.isnan(current)]
    
    # Create bins based on reference distribution
    if method == 'quantile':
        bins = np.percentile(reference, np.linspace(0, 100, n_bins + 1))
        # Ensure unique bin edges
        bins = np.unique(bins)
        if len(bins) < 3:
            # Fall back to equal-width if quantiles are degenerate
            bins = np.linspace(reference.min(), reference.max(), n_bins + 1)
    else:
        bins = np.linspace(reference.min(), reference.max(), n_bins + 1)
    
    # Extend bins slightly to capture all values
    bins[0] = min(bins[0], current.min()) - 1e-10
    bins[-1] = max(bins[-1], current.max()) + 1e-10
    
    # Compute histograms (proportions)
    ref_hist, _ = np.histogram(reference, bins=bins)
    cur_hist, _ = np.histogram(current, bins=bins)
    
    # Convert to proportions
    ref_pct = ref_hist / len(reference)
    cur_pct = cur_hist / len(current)
    
    # Add small epsilon to avoid division by zero and log(0)
    eps = 1e-10
    ref_pct = np.clip(ref_pct, eps, 1)
    cur_pct = np.clip(cur_pct, eps, 1)
    
    # Compute PSI
    psi = np.sum((cur_pct - ref_pct) * np.log(cur_pct / ref_pct))
    
    return psi


def compute_psi_for_features(
    reference_df: pd.DataFrame,
    current_df: pd.DataFrame,
    features: list[str] | None = None,
    n_bins: int = 10
) -> dict[str, float]:
    """
    Compute PSI for multiple features.
    
    Args:
        reference_df: Reference DataFrame (e.g., 2011 data)
        current_df: Current DataFrame to compare (e.g., 2012 data)
        features: List of feature names. If None, uses numeric features.
        n_bins: Number of bins for PSI computation
        
    Returns:
        Dictionary mapping feature names to PSI values
    """
    if features is None:
        features = get_numeric_features()
    
    psi_values = {}
    for feature in features:
        if feature in reference_df.columns and feature in current_df.columns:
            psi_values[feature] = compute_psi(
                reference_df[feature].values,
                current_df[feature].values,
                n_bins=n_bins
            )
    
    return psi_values


def add_week_column(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add a week number column for weekly drift tracking.
    
    Args:
        df: DataFrame with 'dteday' column
        
    Returns:
        DataFrame with added 'week' column (cumulative week number)
    """
    df = df.copy()
    min_date = df['dteday'].min()
    df['week'] = ((df['dteday'] - min_date).dt.days // 7) + 1
    return df


def inject_gradual_drift(
    df: pd.DataFrame,
    feature: str,
    max_bias: float,
    start_week: int = 1
) -> pd.DataFrame:
    """
    Inject gradual cumulative drift into a feature.
    
    Args:
        df: DataFrame with 'week' column
        feature: Name of the feature to modify
        max_bias: Maximum bias to add by the end of the period
        start_week: Week number to start injecting drift
        
    Returns:
        DataFrame with modified feature
    """
    df = df.copy()
    
    if 'week' not in df.columns:
        df = add_week_column(df)
    
    max_week = df['week'].max()
    weeks_of_drift = max_week - start_week + 1
    
    # Linear ramp of bias
    drift_mask = df['week'] >= start_week
    week_progress = (df.loc[drift_mask, 'week'] - start_week) / weeks_of_drift
    df.loc[drift_mask, feature] = df.loc[drift_mask, feature] + (max_bias * week_progress)
    
    # Clip to valid range (0-1 for normalized features)
    df[feature] = df[feature].clip(0, 1)
    
    return df


def inject_sudden_shift(
    df: pd.DataFrame,
    target_col: str,
    condition_col: str,
    condition_values: list,
    start_date: str,
    end_date: str,
    new_value: float = 0
) -> pd.DataFrame:
    """
    Inject a sudden behavioral shift (e.g., zero out morning rush).
    
    Args:
        df: DataFrame with 'dteday' column
        target_col: Column to modify (e.g., 'cnt')
        condition_col: Column to filter on (e.g., 'hr')
        condition_values: Values to match (e.g., [7, 8, 9] for morning hours)
        start_date: Start date of the shift (string 'YYYY-MM-DD')
        end_date: End date of the shift
        new_value: Value to set (default 0)
        
    Returns:
        DataFrame with modified target
    """
    df = df.copy()
    
    start = pd.to_datetime(start_date)
    end = pd.to_datetime(end_date)
    
    mask = (
        (df['dteday'] >= start) &
        (df['dteday'] <= end) &
        (df[condition_col].isin(condition_values))
    )
    
    df.loc[mask, target_col] = new_value
    
    return df


def inject_noise(
    df: pd.DataFrame,
    feature: str,
    noise_std: float,
    random_state: int = 42
) -> pd.DataFrame:
    """
    Add Gaussian noise to a feature.
    
    Args:
        df: DataFrame
        feature: Feature to add noise to
        noise_std: Standard deviation of noise
        random_state: Random seed for reproducibility
        
    Returns:
        DataFrame with noisy feature
    """
    df = df.copy()
    rng = np.random.RandomState(random_state)
    
    noise = rng.normal(0, noise_std, size=len(df))
    df[feature] = df[feature] + noise
    
    # Clip to valid range
    df[feature] = df[feature].clip(0, 1)
    
    return df
