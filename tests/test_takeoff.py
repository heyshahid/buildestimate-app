"""
Automated Unit Tests for BuildEstimate Pro Calculation Suite
Run with: pytest tests/
"""

import math
import sys
from pathlib import Path
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from core.engine import (
    calculate_concrete_slab,
    calculate_rebar_grid,
    calculate_wall_framing,
    calculate_drywall,
    calculate_paint,
    generate_contractor_bid,
)


def test_concrete_slab_volume():
    # 20ft x 10ft x 4in slab with 0% waste:
    # 20 * 10 * (4/12) = 66.6667 cu ft = 2.469 cu yds
    res = calculate_concrete_slab(length_ft=20.0, width_ft=10.0, thickness_in=4.0, waste_percent=0.0)
    assert pytest.approx(res.cubic_yards, 0.05) == 2.47
    assert res.ready_mix_trucks == 1

    # Same slab with 10% waste:
    # 2.469 * 1.10 = 2.715 cu yds
    res_waste = calculate_concrete_slab(length_ft=20.0, width_ft=10.0, thickness_in=4.0, waste_percent=10.0)
    assert pytest.approx(res_waste.cubic_yards, 0.05) == 2.72


def test_rebar_grid():
    rebar = calculate_rebar_grid(length_ft=30.0, width_ft=20.0, spacing_in=18.0, waste_percent=10.0)
    assert rebar.linear_feet > 0
    assert rebar.num_20ft_sticks > 0
    assert rebar.wire_ties_count > 0
    assert rebar.support_chairs > 0


def test_wall_framing_studs():
    # 16ft wall with 16" OC:
    # (16 * 12 / 16) + 1 = 13 base studs
    # 13 + 15% corners/T-walls = 14.95 -> with 10% waste ~ 17 studs
    framing = calculate_wall_framing(wall_length_ft=16.0, wall_height_ft=8.0, spacing_in=16.0, waste_percent=10.0)
    assert framing.total_studs >= 16
    assert framing.plates_16ft == 3  # (16 * 3) / 16 = 3 plates


def test_drywall_sheets():
    # 40ft wall, 8ft height, both sides = 640 sq ft
    # 4x8 sheet = 32 sq ft -> 20 sheets + 10% waste = 22 sheets
    dw = calculate_drywall(wall_length_ft=40.0, wall_height_ft=8.0, both_sides=True, waste_percent=10.0)
    assert dw.sheets_4x8 == 22
    assert dw.joint_compound_gal > 0
    assert dw.drywall_screws_lbs > 0


def test_contractor_bid_calculation():
    bid = generate_contractor_bid(
        project_name="Residential Patio Slab",
        client_name="John Doe",
        materials_cost=2500.0,
        labor_hours=40.0,
        labor_rate_hourly=65.0, # $2,600 labor
        subcontractor_cost=500.0,
        contingency_percent=10.0,
        profit_margin_percent=20.0,
    )
    # Direct = 2500 + 2600 + 500 = $5,600
    assert bid.subtotal == 5600.0
    # Contingency (10%) = $560
    assert bid.contingency_amount == 560.0
    # Base with buffer = $6,160
    # Profit (20%) = $1,232
    assert bid.profit_margin_amount == 1232.0
    # Grand Total = $7,392
    assert bid.grand_total == 7392.0
