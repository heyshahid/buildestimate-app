"""
BuildEstimate Pro - Mathematical Calculation Engine
Formulas conform to ACI 318, ASTM A615 (Rebar), BS EN 206 (Eurocode),
and Subcontinent Civil Engineering Concrete Mix Ratio Standards.
"""

import math
from typing import Optional, Tuple
from .models import (
    ConcreteTakeoff,
    MixRatioConcreteTakeoff,
    BrickMasonryTakeoff,
    RebarTakeoff,
    FramingTakeoff,
    DrywallTakeoff,
    PaintTakeoff,
    MasterBidProposal,
)


def calculate_concrete_slab(
    length_ft: float,
    width_ft: float,
    thickness_in: float,
    waste_percent: float = 10.0,
) -> ConcreteTakeoff:
    """
    Calculates slab concrete volume in cubic feet, cubic yards, and cubic meters,
    plus ready-mix transit mixer truckloads and pre-bagged quantities.
    """
    thickness_ft = thickness_in / 12.0
    raw_cuft = length_ft * width_ft * thickness_ft
    multiplier = 1.0 + (waste_percent / 100.0)
    total_cuft = raw_cuft * multiplier
    total_cuyd = total_cuft / 27.0
    total_m3 = total_cuyd * 0.764555

    # 1 standard ready-mix truck carries 10 cubic yards (or 8 m³ in metric countries)
    truckloads = math.ceil(total_cuyd / 10.0)

    # Pre-bagged quick-setting mix:
    # 80lb bag yields ~0.60 cu ft
    # 60lb bag yields ~0.45 cu ft
    bags_80 = math.ceil(total_cuft / 0.60)
    bags_60 = math.ceil(total_cuft / 0.45)

    return ConcreteTakeoff(
        length_ft=round(length_ft, 2),
        width_ft=round(width_ft, 2),
        thickness_in=round(thickness_in, 2),
        waste_percent=round(waste_percent, 1),
        cubic_feet=round(total_cuft, 2),
        cubic_yards=round(total_cuyd, 2),
        cubic_meters=round(total_m3, 2),
        ready_mix_trucks=truckloads,
        bags_80lb=bags_80,
        bags_60lb=bags_60,
    )


def calculate_mix_ratio_concrete(
    wet_volume_cft: float,
    ratio_cement: float = 1.0,
    ratio_sand: float = 2.0,
    ratio_aggregate: float = 4.0,
    dry_factor: float = 1.54,
    steel_percentage_volume: float = 1.0,
    water_cement_ratio: float = 0.50,
) -> MixRatioConcreteTakeoff:
    """
    Calculates exact site material quantities for Concrete Mix Ratios (1:2:4, 1:1.5:3, 1:3:6, etc.).
    Uses the civil engineering 1.54 Dry Factor for void collapsing and drying shrinkage:
      Dry Volume = Wet Volume * 1.54
      One 50kg bag of cement has volume = 1.25 CFT = 0.035 m³
    """
    wet_m3 = wet_volume_cft / 35.3147
    dry_cft = wet_volume_cft * dry_factor
    total_parts = ratio_cement + ratio_sand + ratio_aggregate

    # Cement
    cement_cft = dry_cft * (ratio_cement / total_parts)
    cement_bags = math.ceil(cement_cft / 1.25)

    # Sand (fine aggregate / Rait)
    sand_cft = dry_cft * (ratio_sand / total_parts)
    sand_m3 = sand_cft / 35.3147

    # Coarse Aggregate (Bajri / Stone Crush)
    bajri_cft = dry_cft * (ratio_aggregate / total_parts)
    bajri_m3 = bajri_cft / 35.3147

    # Steel (Grade 60 Sariya): standard 1.0% volume for RCC slab = ~78.5 kg/m³
    steel_kg = wet_m3 * (steel_percentage_volume * 78.5)
    steel_tons = steel_kg / 1000.0

    # Mixing water
    water_litres = cement_bags * 50.0 * water_cement_ratio

    ratio_label = f"{int(ratio_cement) if ratio_cement.is_integer() else ratio_cement}:{int(ratio_sand) if ratio_sand.is_integer() else ratio_sand}:{int(ratio_aggregate) if ratio_aggregate.is_integer() else ratio_aggregate}"

    return MixRatioConcreteTakeoff(
        wet_volume_cft=round(wet_volume_cft, 2),
        wet_volume_m3=round(wet_m3, 2),
        dry_volume_cft=round(dry_cft, 2),
        dry_factor=dry_factor,
        ratio_str=ratio_label,
        cement_bags_50kg=cement_bags,
        sand_cft=round(sand_cft, 1),
        sand_m3=round(sand_m3, 2),
        bajri_cft=round(bajri_cft, 1),
        bajri_m3=round(bajri_m3, 2),
        steel_kg=round(steel_kg, 1),
        steel_metric_tons=round(steel_tons, 2),
        water_litres=round(water_litres, 0),
    )


def calculate_brick_masonry(
    wall_length_ft: float,
    wall_height_ft: float,
    wall_thickness_in: float = 9.0,
    deductions_sqft: float = 0.0,
    mortar_ratio: str = "1:6",
) -> BrickMasonryTakeoff:
    """
    Calculates brick count and mortar ingredients for standard red clay bricks (9"x4.5"x3").
    Standard engineering thumb rules:
      - 1 CFT of masonry = 13.5 Bricks
      - Dry mortar volume for 100 CFT masonry = 30 CFT
    """
    gross_area = wall_length_ft * wall_height_ft
    net_area = max(0.0, gross_area - deductions_sqft)
    thickness_ft = wall_thickness_in / 12.0
    net_cft = net_area * thickness_ft

    bricks_count = math.ceil(net_cft * 13.5)

    # Mortar dry volume = 30% of masonry volume
    dry_mortar_cft = net_cft * 0.30

    if mortar_ratio == "1:4":
        cement_cft = dry_mortar_cft * (1.0 / 5.0)
        sand_cft = dry_mortar_cft * (4.0 / 5.0)
    else:  # 1:6 standard
        cement_cft = dry_mortar_cft * (1.0 / 7.0)
        sand_cft = dry_mortar_cft * (6.0 / 7.0)

    cement_bags = round(cement_cft / 1.25, 1)

    return BrickMasonryTakeoff(
        wall_length_ft=round(wall_length_ft, 2),
        wall_height_ft=round(wall_height_ft, 2),
        wall_thickness_in=round(wall_thickness_in, 1),
        net_wall_cft=round(net_cft, 2),
        bricks_count=bricks_count,
        mortar_cement_bags_50kg=cement_bags,
        mortar_sand_cft=round(sand_cft, 1),
    )


def calculate_rebar_grid(
    length_ft: float,
    width_ft: float,
    spacing_in: float = 18.0,
    clearance_in: float = 3.0,
    waste_percent: float = 10.0,
) -> RebarTakeoff:
    """
    Calculates 2D orthogonal rebar grid linear footage, 20ft stock bars,
    wire ties, and rebar support chairs.
    """
    clearance_ft = (clearance_in * 2) / 12.0
    effective_len = max(0.0, length_ft - clearance_ft)
    effective_wid = max(0.0, width_ft - clearance_ft)

    spacing_ft = spacing_in / 12.0
    num_bars_len = math.ceil(effective_len / spacing_ft) + 1
    num_bars_wid = math.ceil(effective_wid / spacing_ft) + 1

    raw_linear_ft = (num_bars_len * effective_wid) + (num_bars_wid * effective_len)
    total_linear_ft = raw_linear_ft * (1.0 + (waste_percent / 100.0))

    # Standard commercial rebar sticks are sold in 20-foot lengths
    num_sticks = math.ceil(total_linear_ft / 20.0)

    # Intersection points get wire ties
    intersections = num_bars_len * num_bars_wid
    wire_ties = intersections

    # Chairs spaced every 3ft along grid
    chairs = math.ceil(intersections / 4.0)

    return RebarTakeoff(
        grid_spacing_in=round(spacing_in, 1),
        clearance_in=round(clearance_in, 1),
        linear_feet=round(total_linear_ft, 1),
        num_20ft_sticks=num_sticks,
        wire_ties_count=wire_ties,
        support_chairs=chairs,
    )


def calculate_wall_framing(
    wall_length_ft: float,
    wall_height_ft: float = 8.0,
    spacing_in: float = 16.0,
    waste_percent: float = 10.0,
) -> FramingTakeoff:
    """
    Calculates stud counts (16" or 24" OC) including king studs, jack studs,
    corners, wall intersections, and top/bottom plates.
    """
    base_studs = math.ceil((wall_length_ft * 12.0) / spacing_in) + 1
    # Add 15% allowance for 3-stud corners and T-intersections
    allowance = base_studs * 0.15
    total_studs = math.ceil((base_studs + allowance) * (1.0 + (waste_percent / 100.0)))

    # Plates: 1 bottom plate + 2 top plates = 3 rows of plates
    total_plate_linear_ft = wall_length_ft * 3.0
    plates_16ft = math.ceil(total_plate_linear_ft / 16.0)

    return FramingTakeoff(
        wall_length_ft=round(wall_length_ft, 2),
        wall_height_ft=round(wall_height_ft, 2),
        stud_spacing_in=round(spacing_in, 1),
        waste_percent=round(waste_percent, 1),
        total_studs=total_studs,
        plates_16ft=plates_16ft,
        headers_linear_ft=round(wall_length_ft * 0.20, 1),
    )


def calculate_drywall(
    wall_length_ft: float,
    wall_height_ft: float = 8.0,
    both_sides: bool = True,
    deductions_sqft: float = 0.0,
    waste_percent: float = 10.0,
) -> DrywallTakeoff:
    """
    Calculates drywall sheets (4x8 and 4x12), joint compound (all-purpose mud),
    screws (1-1/4"), and fiberglass/paper joint tape rolls.
    """
    gross_sqft = wall_length_ft * wall_height_ft
    if both_sides:
        gross_sqft *= 2.0

    net_sqft = max(0.0, gross_sqft - deductions_sqft)
    total_sqft = net_sqft * (1.0 + (waste_percent / 100.0))

    # Sheet counts
    sheets_4x8 = math.ceil(total_sqft / 32.0)
    sheets_4x12 = math.ceil(total_sqft / 48.0)

    # 1 gallon of joint compound covers ~100 sq ft of 3-coat finish
    mud_gallons = round(total_sqft / 100.0, 1)

    # 1 lb of 1-1/4" drywall screws covers ~300 sq ft
    screws_lbs = math.ceil(total_sqft / 300.0)

    # 1 roll of 500ft tape covers ~1,200 sq ft of joints
    tape_rolls = math.ceil(total_sqft / 1200.0)

    return DrywallTakeoff(
        wall_length_ft=round(wall_length_ft, 2),
        wall_height_ft=round(wall_height_ft, 2),
        both_sides=both_sides,
        deductions_sqft=round(deductions_sqft, 1),
        net_sqft=round(total_sqft, 1),
        sheets_4x8=sheets_4x8,
        sheets_4x12=sheets_4x12,
        joint_compound_gal=mud_gallons,
        drywall_screws_lbs=float(screws_lbs),
        tape_rolls_500ft=tape_rolls,
    )


def calculate_paint(
    total_sqft: float,
    coats: int = 2,
    primer_coats: int = 1,
    coverage_sqft_per_gal: float = 350.0,
) -> PaintTakeoff:
    """
    Calculates primer and finish coat gallonage, litres, and container packaging.
    """
    finish_effective_sqft = total_sqft * coats
    finish_gals = finish_effective_sqft / coverage_sqft_per_gal

    primer_effective_sqft = total_sqft * primer_coats
    primer_gals = primer_effective_sqft / coverage_sqft_per_gal if primer_coats > 0 else 0.0

    total_gals = finish_gals + primer_gals
    five_gal = int(total_gals // 5)
    remaining = total_gals % 5
    one_gal = math.ceil(remaining)
    total_litres = total_gals * 3.78541

    return PaintTakeoff(
        total_sqft=round(total_sqft, 1),
        coats=coats,
        primer_coats=primer_coats,
        finish_gallons=round(finish_gals, 1),
        primer_gallons=round(primer_gals, 1),
        five_gal_buckets=five_gal,
        one_gal_cans=one_gal,
        total_litres=round(total_litres, 1),
    )


def generate_contractor_bid(
    project_name: str,
    client_name: str,
    materials_cost: float,
    labor_hours: float,
    labor_rate_hourly: float = 65.0,
    subcontractor_cost: float = 0.0,
    equipment_cost: float = 0.0,
    contingency_percent: float = 5.0,
    profit_margin_percent: float = 20.0,
    currency_code: str = "USD",
    currency_symbol: str = "$",
) -> MasterBidProposal:
    """
    Synthesizes direct costs, labor, overhead, contingency buffer,
    and contractor gross profit margin into an executive bid in any world currency.
    """
    direct_labor = labor_hours * labor_rate_hourly
    direct_cost = materials_cost + direct_labor + subcontractor_cost + equipment_cost

    contingency = direct_cost * (contingency_percent / 100.0)
    subtotal_with_buffer = direct_cost + contingency

    profit_amount = subtotal_with_buffer * (profit_margin_percent / 100.0)
    grand_total = subtotal_with_buffer + profit_amount

    return MasterBidProposal(
        project_name=project_name,
        client_name=client_name,
        currency_code=currency_code,
        currency_symbol=currency_symbol,
        materials_cost=round(materials_cost, 2),
        labor_hours=round(labor_hours, 1),
        labor_rate_hourly=round(labor_rate_hourly, 2),
        subcontractor_cost=round(subcontractor_cost, 2),
        equipment_cost=round(equipment_cost, 2),
        contingency_percent=round(contingency_percent, 1),
        profit_margin_percent=round(profit_margin_percent, 1),
        subtotal=round(direct_cost, 2),
        contingency_amount=round(contingency, 2),
        profit_margin_amount=round(profit_amount, 2),
        grand_total=round(grand_total, 2),
    )
