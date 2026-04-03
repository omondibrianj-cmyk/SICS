def calculate_rule_based_score(data: dict) -> float:
    """
    Rule-based risk scoring from dissertation Chapter 2
    Formula: Risk Score = 0.25(Hygiene) + 0.20(Handling) + 
    0.15(Infrastructure) + 0.10(Transport) + 0.10(Personnel) + 
    0.10(Records) + 0.10(Historical Risk)
    """
    # Normalize scores from 0-10 to 0-100
    hygiene = (data.get("hygiene_score", 0) / 10) * 100
    handling = (data.get("handling_score", 0) / 10) * 100
    infrastructure = (data.get("infra_score", 0) / 10) * 100
    transport = (data.get("transport_score", 0) / 10) * 100
    personnel = (data.get("personnel_score", 0) / 10) * 100
    records = (data.get("records_score", 0) / 10) * 100

    # Normalize historical non-compliance (max threshold = 10)
    historical = data.get("historical_noncompliance_6m", 0)
    historical_normalized = min((historical / 10) * 100, 100)

    # Normalize binary variables
    ice_ratio = 100 if data.get("ice_ratio_ok", False) else 0
    temp_records = 100 if data.get("temp_monitoring_records", False) else 0

    # Apply weighted formula from dissertation
    rule_score = (
        0.25 * hygiene +
        0.20 * handling +
        0.15 * infrastructure +
        0.10 * transport +
        0.10 * personnel +
        0.10 * records +
        0.10 * historical_normalized
    )

    return round(rule_score, 2)


def classify_risk_level(final_score: float) -> str:
    """
    Risk classification from dissertation Table 2.1
    0-39   → Low
    40-69  → Medium
    70-100 → High
    """
    if final_score < 40:
        return "Low"
    elif final_score <= 69:
        return "Medium"
    else:
        return "High"


def calculate_final_risk_score(rule_score: float, ml_probability: float) -> float:
    """
    Hybrid formula from dissertation:
    Final Risk Score = 0.7(Rule Score) + 0.3(ML Probability × 100)
    """
    final_score = (0.7 * rule_score) + (0.3 * (ml_probability * 100))
    return round(final_score, 2)