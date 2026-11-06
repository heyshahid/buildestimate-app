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
    calculate_mix_ratio_concrete,
    calculate_brick_masonry,
    calculate_rebar_grid,
    calculate_wall_framing,
    calculate_drywall,
    calculate_paint,
    generate_contractor_bid,
)
from core.pricing import get_regional_benchmark


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


def test_mix_ratio_concrete_asia_subcontinent():
    # 1,000 CFT wet volume with 1:2:4 ratio:
    # Dry Volume = 1,000 * 1.54 = 1,540 CFT
    # Total parts = 7
    # Cement CFT = 1,540 * (1/7) = 220 CFT
    # Bags (50kg) = 220 / 1.25 = 176 bags
    # Sand CFT = 1,540 * (2/7) = 440 CFT
    # Bajri CFT = 1,540 * (4/7) = 880 CFT
    takeoff = calculate_mix_ratio_concrete(
        wet_volume_cft=1000.0,
        ratio_cement=1.0,
        ratio_sand=2.0,
        ratio_aggregate=4.0,
        dry_factor=1.54,
    )
    assert takeoff.dry_volume_cft == 1540.0
    assert takeoff.cement_bags_50kg == 176
    assert pytest.approx(takeoff.sand_cft, 0.5) == 440.0
    assert pytest.approx(takeoff.bajri_cft, 0.5) == 880.0
    assert takeoff.steel_kg > 0
    assert takeoff.water_litres > 0


def test_brick_masonry():
    # 40ft wall, 10ft high, 9in thick (300 CFT)
    # 300 * 13.5 = 4,050 bricks
    masonry = calculate_brick_masonry(wall_length_ft=40.0, wall_height_ft=10.0, wall_thickness_in=9.0)
    assert masonry.bricks_count == 4050
    assert masonry.mortar_cement_bags_50kg > 0
    assert masonry.mortar_sand_cft > 0


def test_rebar_grid():
    rebar = calculate_rebar_grid(length_ft=30.0, width_ft=20.0, spacing_in=18.0, waste_percent=10.0)
    assert rebar.linear_feet > 0
    assert rebar.num_20ft_sticks > 0
    assert rebar.wire_ties_count > 0
    assert rebar.support_chairs > 0


def test_wall_framing_studs():
    framing = calculate_wall_framing(wall_length_ft=16.0, wall_height_ft=8.0, spacing_in=16.0, waste_percent=10.0)
    assert framing.total_studs >= 16
    assert framing.plates_16ft == 3


def test_drywall_sheets():
    dw = calculate_drywall(wall_length_ft=40.0, wall_height_ft=8.0, both_sides=True, waste_percent=10.0)
    assert dw.sheets_4x8 == 22
    assert dw.joint_compound_gal > 0
    assert dw.drywall_screws_lbs > 0


def test_contractor_bid_global():
    bid = generate_contractor_bid(
        project_name="Residential Patio Slab",
        client_name="John Doe",
        materials_cost=2500.0,
        labor_hours=40.0,
        labor_rate_hourly=65.0,
        subcontractor_cost=500.0,
        contingency_percent=10.0,
        profit_margin_percent=20.0,
        currency_code="PKR",
        currency_symbol="Rs ",
    )
    assert bid.subtotal == 5600.0
    assert bid.contingency_amount == 560.0
    assert bid.profit_margin_amount == 1232.0
    assert bid.grand_total == 7392.0
    assert bid.currency_code == "PKR"


def test_regional_benchmarks():
    us = get_regional_benchmark("us")
    assert us["currency_code"] == "USD"
    gcc = get_regional_benchmark("gcc")
    assert gcc["currency_code"] == "AED"
    asia = get_regional_benchmark("asia")
    assert asia["currency_code"] == "PKR"
    uk = get_regional_benchmark("uk")
    assert uk["currency_code"] == "GBP"
