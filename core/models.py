"""
Pydantic Data Models for Construction Material Takeoffs
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
    ready_mix_trucks: int
    bags_80lb: int
    bags_60lb: int


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


class MasterBidProposal(BaseModel):
    project_name: str
    client_name: str
    estimator: str = "Shahid Akram"
    materials_cost: float
    labor_hours: float
    labor_rate_hourly: float
    subcontractor_cost: float = 0.0
    equipment_cost: float = 0.0
    contingency_percent: float = 5.0
    profit_margin_percent: float = 20.0
    subtotal: float
    contingency_amount: float
    profit_margin_amount: float
    grand_total: float
