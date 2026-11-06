"""
National Construction Cost Benchmarks & Material Pricing Index (US Averages)
"""

BENCHMARK_PRICES = {
    "concrete_ready_mix_cuyd": 145.00,  # $145.00 per cubic yard delivered
    "concrete_80lb_bag": 6.85,          # $6.85 per 80lb bag
    "rebar_no4_20ft_stick": 12.50,      # $12.50 per 20ft grade 60 rebar stick
    "rebar_support_chair": 0.85,        # $0.85 per plastic chair
    "stud_2x4x8_spf": 4.25,             # $4.25 per 2x4 8ft stud
    "stud_2x4x10_spf": 6.10,            # $6.10 per 2x4 10ft stud
    "plate_2x4x16_spf": 9.80,           # $9.80 per 2x4 16ft plate
    "drywall_sheet_4x8_half_in": 15.50, # $15.50 per 1/2" 4x8 drywall sheet
    "drywall_sheet_4x12_half_in": 23.25,# $23.25 per 1/2" 4x12 drywall sheet
    "joint_compound_all_purpose_gal": 8.50,
    "drywall_screws_1_1_4_5lb_box": 14.50,
    "drywall_tape_paper_500ft": 6.25,
    "interior_latex_paint_finish_gal": 42.00,
    "pva_primer_gal": 22.00,
    "painter_tape_roll": 7.50,
}


def get_material_unit_price(item_key: str) -> float:
    return BENCHMARK_PRICES.get(item_key, 0.0)
