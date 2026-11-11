"""
Pydantic Data Models for Construction Material Takeoffs
Supports Global Regional Standards: North America (US/CA), GCC & Middle East, Asia & Subcontinent, and UK/Europe.
"""

from typing import Optional, List
from pydantic import BaseModel, Field


class ConcreteTakeoff(BaseModel):
    length_ft: float = Field(..., gt=0, description="Slab length in feet")
    width_ft: float = Field(..., gt=0, description="Slab width in feet")
    thickness_in: float = Field(..., gt=0, description="Slab thickness in inches")
    waste_percent: float = Field(default=10.0, ge=0, description="Waste factor margin percentage")
    cubic_feet: float
    cubic_yards: float
    cubic_meters: float = 0.0
    ready_mix_trucks: int
    bags_80lb: int
    bags_60lb: int


class MixRatioConcreteTakeoff(BaseModel):
    """
    Civil Engineering Nominal Concrete Mix Ratio Takeoff
    Formulas utilize the 1.54 Dry Factor multiplier for void & shrinkage compensation.
    Standard across Asia (Pakistan, India, Bangladesh) and international site-batched concrete.
    """
    wet_volume_cft: float = Field(..., gt=0)
    wet_volume_m3: float = Field(..., gt=0)
    dry_volume_cft: float = Field(..., gt=0)
    dry_factor: float = Field(default=1.54)
    ratio_str: str = Field(default="1:2:4 (M15)")
    cement_bags_50kg: int
    sand_cft: float
    sand_m3: float
    bajri_cft: float
    bajri_m3: float
    steel_kg: float
    steel_metric_tons: float
    water_litres: float


class BrickMasonryTakeoff(BaseModel):
    """
    Standard Red Clay Brick Masonry Takeoff (9" x 4.5" x 3" brick standard)
    Standard in Pakistan, India, UK, and Middle East brickwork.
    """
    wall_length_ft: float = Field(..., gt=0)
    wall_height_ft: float = Field(..., gt=0)
    wall_thickness_in: float = Field(default=9.0, gt=0)
    net_wall_cft: float
    bricks_count: int
    mortar_cement_bags_50kg: float
    mortar_sand_cft: float


class RebarTakeoff(BaseModel):
    grid_spacing_in: float = Field(..., gt=0, description="Rebar grid spacing on-center in inches")
    clearance_in: float = Field(default=3.0, ge=0, description="Edge clearance in inches")
    bar_size: str = Field(default="#4 (1/2\")")
    linear_feet: float
    num_20ft_sticks: int
    wire_ties_count: int
    support_chairs: int


class FramingTakeoff(BaseModel):
    wall_length_ft: float = Field(..., gt=0)
    wall_height_ft: float = Field(default=8.0, gt=0)
    stud_spacing_in: float = Field(default=16.0, gt=0)
    waste_percent: float = Field(default=10.0, ge=0)
    total_studs: int
    plates_16ft: int
    headers_linear_ft: float


class DrywallTakeoff(BaseModel):
    wall_length_ft: float = Field(..., gt=0)
    wall_height_ft: float = Field(default=8.0, gt=0)
    both_sides: bool = True
    deductions_sqft: float = 0.0
    net_sqft: float
    sheets_4x8: int
    sheets_4x12: int
    joint_compound_gal: float
    drywall_screws_lbs: float
    tape_rolls_500ft: int


class PaintTakeoff(BaseModel):
    total_sqft: float = Field(..., gt=0)
    coats: int = Field(default=2, ge=1)
    primer_coats: int = Field(default=1, ge=0)
    finish_gallons: float
    primer_gallons: float
    five_gal_buckets: int
    one_gal_cans: int
    total_litres: float = 0.0


class MasterBidProposal(BaseModel):
    project_name: str
    client_name: str
    estimator: str = "Shahid Akram"
    currency_code: str = "USD"
    currency_symbol: str = "$"
    materials_cost: float
    labor_hours: float
    labor_rate_hourly: float
    subcontractor_cost: float = 0.0
    equipment_cost: float = 0.0
    contingency_percent: float = 5.0
    profit_margin_percent: float = 20.0
    profit_mode: str = "markup"
    effective_margin_percent: float = 0.0
    tax_percent: float = 0.0
    tax_amount: float = 0.0
    subtotal: float
    contingency_amount: float
    profit_margin_amount: float
    grand_total: float
