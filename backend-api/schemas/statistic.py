from pydantic import BaseModel, ConfigDict
from typing import List, Dict, Optional, Any
from datetime import date, datetime
from decimal import Decimal

# ===== Summary Statistics Models =====
class SummaryCard(BaseModel):
    label: str
    value: int
    percentage: Optional[float] = None
    change_percentage: Optional[float] = None
    change_period: Optional[str] = "vs last month"

class EvidenceSummary(BaseModel):
    total_evidence: SummaryCard
    firearms: SummaryCard
    narcotics: SummaryCard
    others: SummaryCard
    this_month: SummaryCard
    unknown_items: SummaryCard
    ai_confidence_avg: float

# ===== Geographic Statistics Models =====
class GeographicStats(BaseModel):
    province_id: int
    province_name: str
    district_id: Optional[int] = None
    district_name: Optional[str] = None
    subdistrict_id: Optional[int] = None
    subdistrict_name: Optional[str] = None
    count: int
    percentage: float

class GeographicBreakdown(BaseModel):
    by_province: List[GeographicStats]
    by_district: List[GeographicStats]
    by_subdistrict: List[GeographicStats]

# ===== Time Period Statistics Models =====
class TimeSeriesData(BaseModel):
    period: str  # "2024-01", "2024-01-15", etc.
    count: int
    cumulative: Optional[int] = None

class TimePeriodStats(BaseModel):
    daily: List[TimeSeriesData]
    weekly: List[TimeSeriesData]
    monthly: List[TimeSeriesData]
    yearly: List[TimeSeriesData]

# ===== Firearm Statistics Models =====
class BrandModelStats(BaseModel):
    brand: str
    model: Optional[str] = None
    series: Optional[str] = None
    count: int
    percentage: float
    avg_ai_confidence: Optional[float] = None

class MechanismStats(BaseModel):
    mechanism: str
    count: int
    percentage: float
    brands: List[str]

class AmmunitionStats(BaseModel):
    caliber: str
    type: Optional[str] = None
    count: int
    compatible_firearms: int
    avg_quantity: Optional[float] = None

class FirearmAnalytics(BaseModel):
    brand_distribution: List[BrandModelStats]
    model_distribution: List[BrandModelStats]
    mechanism_breakdown: List[MechanismStats]
    ammunition_stats: List[AmmunitionStats]
    geographic_hotspots: List[GeographicStats]
    discovery_trends: List[TimeSeriesData]

# ===== Narcotic Statistics Models =====
class DrugTypeStats(BaseModel):
    drug_type: str
    drug_category: Optional[str] = None
    count: int
    percentage: float
    avg_weight: Optional[float] = None
    total_weight: Optional[float] = None

class DrugFormStats(BaseModel):
    form_name: str
    count: int
    percentage: float
    avg_weight: Optional[float] = None

class ChemicalCompoundStats(BaseModel):
    compound_name: str
    frequency: int
    avg_percentage: Optional[float] = None
    drug_types: List[str]

class NarcoticAnalytics(BaseModel):
    drug_type_distribution: List[DrugTypeStats]
    form_distribution: List[DrugFormStats]
    chemical_compounds: List[ChemicalCompoundStats]
    weight_statistics: Dict[str, Any]
    geographic_patterns: List[GeographicStats]
    discovery_trends: List[TimeSeriesData]

# ===== Discovery Statistics Models =====
class DiscoveryMethodStats(BaseModel):
    discovered_by: str
    discoverer_name: Optional[str] = None
    count: int
    percentage: float
    avg_ai_confidence: Optional[float] = None
    evidence_types: Dict[str, int]

class AIConfidenceStats(BaseModel):
    confidence_range: str  # "90-100%", "80-89%", etc.
    count: int
    percentage: float
    avg_confidence: float

# ===== Main Statistics Response Models =====
class StatisticsOverview(BaseModel):
    summary: EvidenceSummary
    geographic_breakdown: GeographicBreakdown
    time_period_stats: TimePeriodStats
    discovery_methods: List[DiscoveryMethodStats]
    ai_confidence_distribution: List[AIConfidenceStats]
    last_updated: datetime

class FirearmStatistics(BaseModel):
    overview: FirearmAnalytics
    detailed_breakdown: Dict[str, Any]
    trends: Dict[str, List[TimeSeriesData]]
    comparisons: Dict[str, Any]

class NarcoticStatistics(BaseModel):
    overview: NarcoticAnalytics
    detailed_breakdown: Dict[str, Any]
    trends: Dict[str, List[TimeSeriesData]]
    comparisons: Dict[str, Any]

# ===== Filter Models =====
class StatisticsFilter(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    province_ids: Optional[List[int]] = None
    district_ids: Optional[List[int]] = None
    subdistrict_ids: Optional[List[int]] = None
    evidence_types: Optional[List[str]] = None
    discovered_by: Optional[List[str]] = None
    min_ai_confidence: Optional[float] = None
    max_ai_confidence: Optional[float] = None

class AnalyticsRequest(BaseModel):
    filters: Optional[StatisticsFilter] = None
    group_by: Optional[List[str]] = None  # ["province", "month", "evidence_type"]
    aggregations: Optional[List[str]] = None  # ["count", "avg", "sum"]
    sort_by: Optional[str] = None
    sort_order: Optional[str] = "desc"
    limit: Optional[int] = None