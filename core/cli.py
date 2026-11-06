"""
BuildEstimate Pro - Command Line Interface (CLI)
Interactive terminal takeoff tool for contractors and estimators.
"""

import sys
import argparse
from rich.console import Console
from rich.table import Table
from rich.panel import Panel

from .engine import (
    calculate_concrete_slab,
    calculate_rebar_grid,
    calculate_wall_framing,
    calculate_drywall,
    calculate_paint,
    generate_contractor_bid,
)

console = Console()


def print_banner():
    banner_text = (
        "[bold yellow]  BuildEstimate Pro CLI v2.4.0[/bold yellow]\n"
        "[dim]Mobile-First Construction Material Takeoff & Bidding Suite[/dim]\n"
        "[dim cyan]Author: Shahid Akram | https://github.com/heyshahid[/dim cyan]"
    )
    console.print(Panel(banner_text, border_style="yellow", expand=False))


def handle_concrete(args):
    print_banner()
    res = calculate_concrete_slab(
        length_ft=args.length,
        width_ft=args.width,
        thickness_in=args.thickness,
        waste_percent=args.waste,
    )
    rebar = calculate_rebar_grid(
        length_ft=args.length,
        width_ft=args.width,
        spacing_in=args.rebar_spacing,
        waste_percent=args.waste,
    )

    table = Table(title=f"Concrete Slab Takeoff ({args.length}' x {args.width}' x {args.thickness}\")", border_style="cyan")
    table.add_column("Material Metric", style="bold white")
    table.add_column("Quantity", style="bold green", justify="right")
    table.add_column("Unit / Specs", style="dim white")

    table.add_row("Total Concrete Volume", f"{res.cubic_yards} yd³", f"{res.cubic_feet} cu ft (incl. {args.waste}% waste)")
    table.add_row("Ready-Mix Transit Trucks", f"{res.ready_mix_trucks}", "Full 10 yd³ capacity loads")
    table.add_row("Quick-Set Pre-Bagged (80 lb)", f"{res.bags_80lb} bags", "@ 0.60 cu ft yield per bag")
    table.add_row("Quick-Set Pre-Bagged (60 lb)", f"{res.bags_60lb} bags", "@ 0.45 cu ft yield per bag")
    table.add_row("Rebar Grid (#4 - 1/2\")", f"{rebar.linear_feet} lin ft", f"{rebar.num_20ft_sticks} stock 20ft bars @ {args.rebar_spacing}\" OC")
    table.add_row("Rebar Wire Ties", f"{rebar.wire_ties_count} ties", "Grid node intersection ties")
    table.add_row("Rebar Support Chairs", f"{rebar.support_chairs} chairs", "Plastic slab bolsters (3ft spacing)")

    console.print(table)


def main():
    parser = argparse.ArgumentParser(description="BuildEstimate Pro Construction Estimating Suite")
    subparsers = parser.add_subparsers(dest="command")

    # Concrete Subcommand
    conc_parser = subparsers.add_parser("concrete", help="Estimate concrete slabs & rebar")
    conc_parser.add_argument("--length", type=float, required=True, help="Slab length in feet")
    conc_parser.add_argument("--width", type=float, required=True, help="Slab width in feet")
    conc_parser.add_argument("--thickness", type=float, default=4.0, help="Slab thickness in inches (default: 4.0)")
    conc_parser.add_argument("--waste", type=float, default=10.0, help="Waste factor percentage (default: 10.0)")
    conc_parser.add_argument("--rebar-spacing", type=float, default=18.0, help="Rebar grid spacing OC in inches (default: 18.0)")

    args = parser.parse_args()

    if args.command == "concrete":
        handle_concrete(args)
    else:
        print_banner()
        console.print("[yellow]Usage: buildestimate concrete --length 40 --width 20 --thickness 5 --waste 10[/yellow]")
        console.print("[dim]Or open index.html directly for the interactive mobile PWA app.[/dim]")


if __name__ == "__main__":
    main()
