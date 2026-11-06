"""
Global Construction Cost Benchmarks & Material Pricing Index
Accurate regional benchmark rates across North America, GCC / Middle East,
Asia & Subcontinent, and UK / Europe.
"""

from typing import Dict, Any

# Multi-Region Benchmark Pricing Index
REGIONAL_BENCHMARKS: Dict[str, Dict[str, Any]] = {
    "us": {
        "region_name": "North America (US / CA)",
        "currency_code": "USD",
        "currency_symbol": "$",
        "concrete_ready_mix_cuyd": 155.00,        # $155 per cubic yard delivered
        "concrete_80lb_bag": 6.85,                # $6.85 per 80lb bag
        "cement_50kg_bag": 14.00,
        "sand_cft": 1.25,
        "aggregate_cft": 2.10,
        "rebar_no4_20ft_stick": 12.50,            # $12.50 per 20ft grade 60 rebar stick
        "rebar_kg": 1.35,
        "stud_2x4x8_spf": 4.85,                   # $4.85 per 2x4 8ft stud
        "drywall_sheet_4x8_half_in": 14.50,       # $14.50 per 1/2" 4x8 drywall sheet
        "joint_compound_all_purpose_gal": 8.50,
        "interior_latex_paint_finish_gal": 45.00,
        "labor_hourly_rate": 55.00,
        "brick_unit": 0.95,
    },
    "gcc": {
        "region_name": "GCC & Middle East (UAE / SA / QA)",
        "currency_code": "AED",
        "currency_symbol": "AED ",
        "concrete_ready_mix_m3": 275.00,          # 275 AED/m³ (Grade C30/C35 ready-mix)
        "cement_50kg_bag": 16.50,                 # 16.50 AED per 50kg bag (OPC/SRC)
        "sand_cft": 2.20,
        "aggregate_cft": 3.80,
        "rebar_tonne": 2600.00,                   # 2,600 AED per metric ton high tensile steel
        "rebar_kg": 2.60,
        "stud_light_gauge_steel_3m": 19.00,       # 19 AED per 3m C-stud
        "gypsum_sheet_1_2x2_4m": 29.00,           # 29 AED per 1.2x2.4m board
        "paint_finish_litre": 9.00,               # 9 AED/L (approx 140 AED per 18L drum)
        "labor_hourly_rate": 30.00,
        "brick_unit": 2.20,
    },
    "asia": {
        "region_name": "Asia & Subcontinent (PK / IN / BD)",
        "currency_code": "PKR",
        "currency_symbol": "Rs ",
        "concrete_ready_mix_m3": 14500.00,        # 14,500 PKR per m³ batch plant
        "cement_50kg_bag": 1450.00,               # 1,450 PKR per 50kg bag (Fauji/Bestway)
        "sand_cft": 55.00,                        # 55 PKR per CFT (Rait / fine aggregate)
        "aggregate_cft": 125.00,                  # 125 PKR per CFT (Bajri / Margalla crush)
        "rebar_kg": 265.00,                       # 265 PKR per kg (Grade 60 Sariya)
        "brick_red_clay_standard": 15.00,         # 15 PKR per 9"x4.5"x3" red brick
        "paint_gallon": 1650.00,                  # 1,650 PKR per gallon
        "labor_hourly_rate": 350.00,              # 350 PKR per hour (Mistri + Mazdoor crew rate)
    },
    "uk": {
        "region_name": "UK & Europe (Eurocode BS EN)",
        "currency_code": "GBP",
        "currency_symbol": "£",
        "concrete_ready_mix_m3": 115.00,          # £115 per m³ (C25/30 ready-mix)
        "cement_50kg_bag": 12.00,
        "sand_cft": 2.50,
        "aggregate_cft": 3.90,
        "rebar_tonne": 1100.00,                   # £1,100 per tonne H12 high yield steel
        "rebar_kg": 1.10,
        "stud_c16_timber_2_4m": 7.50,             # £7.50 per 2.4m C16 length
        "plasterboard_1200x2400": 11.80,          # £11.80 per standard 12.5mm board
        "paint_finish_litre": 4.20,               # £4.20 per litre
        "labor_hourly_rate": 40.00,
        "brick_unit": 0.85,
    }
}


def get_regional_benchmark(region: str = "us") -> Dict[str, Any]:
    return REGIONAL_BENCHMARKS.get(region.lower(), REGIONAL_BENCHMARKS["us"])
