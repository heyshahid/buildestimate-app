# BuildEstimate Pro - Calculation & Engineering Audit

**Document:** Civil Engineering Formulas, Algorithmic Discrepancies & Calculation Parity Audit  
**Audited Versions:** `index.html` (JS Engine) vs `core/engine.py` (Python Engine)  
**Applicable Standards:** ACI 318 (US), ASTM A615 (Rebar), BS EN 206 / Eurocode 2 (Europe/UK), IS 456 / Subcontinent Civil Engineering Practices  
**Status:** Complete Technical Review  

---

## 1. Scope & Objective

This audit examines every mathematical formula, empirical thumb rule, conversion factor, and financial calculation implemented across both the browser-based JavaScript application (`index.html`) and the Python backend engine (`core/engine.py`).

The goals are:
1. Verify the civil engineering validity of all takeoff models.
2. Identify all mathematical and algorithmic discrepancies between JavaScript and Python implementations.
3. Establish a single deterministic source of truth.
4. Formulate rigorous parity testing and boundary protection rules.

---

## 2. Comprehensive Formula-by-Formula Review

### A. Concrete Slab & Footing Volume

#### 1. Mathematical Formulas
- **Imperial (US/CA):**
  $$\text{Thickness (ft)} = \frac{\text{Thickness (in)}}{12}$$
  $$\text{Raw Volume (cu ft)} = \text{Length (ft)} \times \text{Width (ft)} \times \text{Thickness (ft)}$$
  $$\text{Total Volume (cu ft)} = \text{Raw Volume} \times \left(1 + \frac{\text{Waste \%}}{100}\right)$$
  $$\text{Cubic Yards (yd}^3\text{)} = \frac{\text{Total Volume (cu ft)}}{27}$$
  $$\text{Cubic Meters (m}^3\text{)} = \text{Cubic Yards} \times 0.764555$$

- **Metric (GCC / UK / Europe):**
  $$\text{Thickness (m)} = \frac{\text{Thickness (cm)}}{100} \quad \text{or} \quad \frac{\text{Thickness (mm)}}{1000}$$
  $$\text{Raw Volume (m}^3\text{)} = \text{Length (m)} \times \text{Width (m)} \times \text{Thickness (m)}$$
  $$\text{Total Volume (m}^3\text{)} = \text{Raw Volume} \times \left(1 + \frac{\text{Waste \%}}{100}\right)$$
  $$\text{Cubic Yards (yd}^3\text{)} = \frac{\text{Total Volume (m}^3\text{)}}{0.764555}$$
  $$\text{Cubic Feet (cu ft)} = \text{Total Volume (m}^3\text{)} \times 35.3147$$

#### 2. Transit Mixer Drum Truck Sizing
- **North America:** Standard transit mixer drum capacity = $10 \text{ yd}^3$.
  $$\text{Truckloads (US)} = \left\lceil \frac{\text{Total Cubic Yards}}{10.0} \right\rceil$$
- **GCC & Europe:** Standard transit mixer drum capacity = $8 \text{ m}^3$ (or $6 \text{ m}^3$ in urban UK).
  $$\text{Truckloads (Metric)} = \left\lceil \frac{\text{Total Cubic Meters}}{8.0} \right\rceil$$

#### 3. Pre-Bagged Commercial Mix (Quikrete / Sakrete)
- Standard 80 lb bag yields $\approx 0.60 \text{ cu ft}$.
  $$\text{Bags (80 lb)} = \left\lceil \frac{\text{Total Volume (cu ft)}}{0.60} \right\rceil$$
- Standard 60 lb bag yields $\approx 0.45 \text{ cu ft}$.
  $$\text{Bags (60 lb)} = \left\lceil \frac{\text{Total Volume (cu ft)}}{0.45} \right\rceil$$

---

### B. Civil Engineering 1.54 Dry Volume Factor & Nominal Mix Ratios

Site-batched concrete begins with loose, uncompacted dry ingredients (cement powder, dry sand, crushed stone) containing voids between aggregate particles. When water is added and the mixture is mechanically consolidated/vibrated into formwork, voids collapse and the volume shrinks.

To yield $1.00 \text{ m}^3$ (or $1.00 \text{ CFT}$) of compacted wet concrete, civil engineering practice requires $1.52$ to $1.57$ (standardized to **$1.54$**) times the volume in loose dry materials:
$$\text{Dry Volume} = \text{Wet Consolidated Volume} \times 1.54$$

#### Nominal Mix Proportions (Cement : Fine Aggregate : Coarse Aggregate):
- `1:2:4 (M15 / 15 MPa / ~2,200 psi)`: Standard for general RCC slabs, beams, residential lintels.
- `1:1.5:3 (M20 / 20 MPa / ~3,000 psi)`: Standard for structural columns, heavy suspended slabs.
- `1:3:6 (M10 / 10 MPa / ~1,500 psi)`: Plain Cement Concrete (PCC) mud slab / lean blinding.
- `1:1:2 (M25 / 25 MPa / ~3,500+ psi)`: Water tanks, retaining walls, heavy load foundations.

#### Material Takeoff Computation:
$$\text{Sum of Parts} = R_{\text{cement}} + R_{\text{sand}} + R_{\text{aggregate}}$$
$$\text{Cement Volume (CFT)} = \text{Dry Volume (CFT)} \times \frac{R_{\text{cement}}}{\text{Sum of Parts}}$$

- **Standard 50kg Cement Bag Yield:**
  - Bulk density of ordinary Portland cement (OPC) $\approx 1,440 \text{ kg/m}^3$.
  - Volume of one 50kg bag $= \frac{50}{1440} \text{ m}^3 \approx 0.03472 \text{ m}^3 \approx 1.25 \text{ CFT} \approx 1.226 \text{ cu ft}$.
  - Standard civil thumb rule: **$1 \text{ bag of 50kg cement} = 1.25 \text{ CFT}$**.
  $$\text{Cement Bags (50kg)} = \left\lceil \frac{\text{Cement Volume (CFT)}}{1.25} \right\rceil$$

- **Sand (Fine Aggregate / Rait):**
  $$\text{Sand Volume (CFT)} = \text{Dry Volume (CFT)} \times \frac{R_{\text{sand}}}{\text{Sum of Parts}}$$
  $$\text{Sand Volume (m}^3\text{)} = \frac{\text{Sand Volume (CFT)}}{35.3147}$$

- **Coarse Aggregate (Bajri / Stone Crush / Gravel):**
  $$\text{Bajri Volume (CFT)} = \text{Dry Volume (CFT)} \times \frac{R_{\text{aggregate}}}{\text{Sum of Parts}}$$
  $$\text{Bajri Volume (m}^3\text{)} = \frac{\text{Bajri Volume (CFT)}}{35.3147}$$

- **Steel Reinforcement (Grade 60 Sariya):**
  - Empirical standard for typical RCC slab $= 1.0\% \text{ by volume} \approx 78.5 \text{ to } 80 \text{ kg/m}^3$.
  $$\text{Steel (kg)} = \text{Wet Volume (m}^3\text{)} \times 80.0$$
  $$\text{Steel (Metric Tons)} = \frac{\text{Steel (kg)}}{1000}$$
  $$\text{Steel (lbs)} = \text{Steel (kg)} \times 2.20462$$

- **Mixing Water Demand:**
  - Water-cement ratio ($W/C$) typically $0.50$ to $0.55$ for workable site concrete.
  - $0.50 \times 50\text{ kg} = 25\text{ kg} \approx 25 \text{ to } 28 \text{ litres}$ per 50kg cement bag.
  $$\text{Water (Litres)} = \text{Cement Bags} \times 28.0$$

---

### C. Rebar Grid Takeoff

An orthogonal 2-way rebar mat requires reinforcement running lengthwise and widthwise across the slab.

$$\text{Clearance (ft)} = \frac{2 \times \text{Clearance (in)}}{12}$$
$$\text{Effective Length} = \max(0, \text{Length} - \text{Clearance})$$
$$\text{Effective Width} = \max(0, \text{Width} - \text{Clearance})$$
$$\text{Spacing (ft)} = \frac{\text{Spacing (in)}}{12}$$
$$\text{Number of Long Bars} = \left\lceil \frac{\text{Effective Width}}{\text{Spacing (ft)}} \right\rceil + 1$$
$$\text{Number of Wide Bars} = \left\lceil \frac{\text{Effective Length}}{\text{Spacing (ft)}} \right\rceil + 1$$
$$\text{Raw Linear Feet} = (\text{Number of Long Bars} \times \text{Effective Length}) + (\text{Number of Wide Bars} \times \text{Effective Width})$$
$$\text{Total Linear Feet} = \text{Raw Linear Feet} \times \left(1 + \frac{\text{Waste \%}}{100}\right)$$
$$\text{Stock 20ft Bars} = \left\lceil \frac{\text{Total Linear Feet}}{20.0} \right\rceil$$
$$\text{Wire Ties (Intersections)} = \text{Number of Long Bars} \times \text{Number of Wide Bars}$$
$$\text{Support Chairs (Bolsters)} = \left\lceil \frac{\text{Wire Ties}}{4.0} \right\rceil$$

---

### D. Red Clay Brick Masonry

Standard red clay bricks in the UK, Middle East, Pakistan, and India conform to $9'' \times 4.5'' \times 3''$ nominal dimensions:
- Standard red brick nominal volume with $3/8''$ ($10\text{mm}$) mortar joint $\approx 0.0703 \text{ CFT}$.
- Empirical field rule: **$1 \text{ CFT of brick masonry requires } 13.5 \text{ bricks}$** (or $500 \text{ bricks per } \text{m}^3$).
$$\text{Wall Volume (CFT)} = \text{Net Wall Area (sq ft)} \times \frac{\text{Wall Thickness (in)}}{12}$$
$$\text{Total Bricks} = \left\lceil \text{Wall Volume (CFT)} \times 13.5 \right\rceil \times \left(1 + \frac{\text{Waste \%}}{100}\right)$$

#### Mortar Consumption:
- Mortar occupies $25\%$ to $30\%$ of the gross brickwork volume. Applying the standard $1.25$ to $1.30$ dry factor for mortar:
$$\text{Dry Mortar Volume (CFT)} = \text{Wall Volume (CFT)} \times 0.30$$
- For standard `1:6` mortar ($1 \text{ cement} : 6 \text{ sand}$, total parts = 7):
  $$\text{Mortar Cement (CFT)} = \text{Dry Mortar} \times \frac{1}{7}$$
  $$\text{Mortar Cement Bags (50kg)} = \left\lceil \frac{\text{Mortar Cement (CFT)}}{1.25} \right\rceil$$
  $$\text{Mortar Sand (CFT)} = \text{Dry Mortar} \times \frac{6}{7}$$
- For structural `1:4` mortar ($1 \text{ cement} : 4 \text{ sand}$, total parts = 5):
  $$\text{Mortar Cement (CFT)} = \text{Dry Mortar} \times \frac{1}{5}$$
  $$\text{Mortar Sand (CFT)} = \text{Dry Mortar} \times \frac{4}{5}$$

---

### E. Wall Framing & Drywall

$$\text{Gross Wall Area} = \text{Wall Length} \times \text{Wall Height}$$
$$\text{Deductions} = (\text{Doors} \times 21 \text{ SF}) + (\text{Windows} \times 15 \text{ SF})$$
$$\text{Net Wall Area (One Side)} = \max(0, \text{Gross Wall Area} - \text{Deductions})$$
$$\text{Total Drywall Area} = \text{Net Wall Area} \times \text{Sides (1 or 2)}$$

#### Stud Count:
$$\text{Base Studs} = \left\lceil \frac{\text{Wall Length (ft)}}{\text{Spacing (in)} / 12} \right\rceil + 1$$
- Additional framing allowances:
  - King and jack studs for openings: $4 \text{ studs per door} + 4 \text{ studs per window}$.
  - Corners & T-intersections: 4 additional studs.
$$\text{Total Studs} = \text{Base Studs} + (\text{Doors} \times 4) + (\text{Windows} \times 4) + 4$$

#### Plates Linear Footage:
- 1 continuous bottom plate + 2 top plates (double top plate for structural overlap) $= 3 \times \text{Wall Length}$.
$$\text{Plates (16ft Stock Boards)} = \left\lceil \frac{\text{Wall Length} \times 3}{16} \right\rceil$$

#### Drywall Consumables:
$$\text{Drywall Sheets} = \left\lceil \frac{\text{Total Drywall Area} \times 1.10}{\text{Sheet Area (32 or 48 SF)}} \right\rceil$$
$$\text{Screws} = \text{Drywall Sheets} \times 32 \text{ screws/sheet}$$
$$\text{Joint Compound Mud (4.5 gal buckets)} = \left\lceil \text{Drywall Sheets} \times 0.06 \right\rceil$$
$$\text{Joint Paper Tape (250 ft rolls)} = \left\lceil \frac{\text{Drywall Sheets}}{20} \right\rceil$$

---

### F. Paint & Surface Coatings

$$\text{Paintable Area} = \text{Gross Area} - \text{Deductions}$$
$$\text{Finish Gallons} = \frac{\text{Paintable Area} \times \text{Finish Coats}}{350 \text{ SF/gal}} \times \left(1 + \frac{\text{Waste \%}}{100}\right)$$
$$\text{Primer Gallons} = \frac{\text{Paintable Area} \times \text{Primer Coats}}{350 \text{ SF/gal}} \times \left(1 + \frac{\text{Waste \%}}{100}\right)$$
$$\text{Five-Gallon Buckets} = \left\lfloor \frac{\text{Finish Gallons}}{5.0} \right\rfloor$$
$$\text{One-Gallon Cans} = \left\lceil \text{Finish Gallons} \pmod{5.0} \right\rceil$$
$$\text{Total Litres} = (\text{Finish Gallons} + \text{Primer Gallons}) \times 3.78541$$

---

### G. Financial Takeoff & Contractor Bidding

$$\text{Direct Labor Cost} = \text{Labor Hours} \times \text{Hourly Rate}$$
$$\text{Direct Costs} = \text{Materials Cost} + \text{Subcontractor Cost} + \text{Direct Labor Cost} + \text{Equipment Cost}$$
$$\text{Contingency Amount} = \text{Direct Costs} \times \frac{\text{Contingency \%}}{100}$$
$$\text{Subtotal with Contingency} = \text{Direct Costs} + \text{Contingency Amount}$$

#### Markup on Cost vs Margin on Price:
Currently, the application calculates:
$$\text{Gross Profit} = \text{Subtotal with Contingency} \times \frac{\text{Profit Margin \%}}{100}$$
$$\text{Contract Price} = \text{Subtotal with Contingency} + \text{Gross Profit}$$

> [!WARNING]
> **Financial Calculation Discrepancy (Markup vs Margin):**
> In commercial construction finance, multiplying by $20\%$ produces a **$20\%$ Markup on Cost**, but yields only a **$16.67\%$ Margin on Selling Price**:
> $$\text{True Margin \%} = \frac{\text{Profit}}{\text{Contract Price}} = \frac{20}{120} = 16.67\%$$
> To achieve a true **$20\%$ Profit Margin**, the formula must be:
> $$\text{Contract Price} = \frac{\text{Subtotal with Contingency}}{1 - (\text{Margin \%} / 100)}$$
> In BuildEstimate Pro 2.0, an explicit toggle must be added allowing the estimator to select **Markup on Cost** or **Margin on Selling Price** with full formula disclosure.

---

## 3. Discrepancy Matrix: JavaScript Engine vs Python Engine

The audit identified several algorithmic variances between `index.html` and `core/engine.py`:

| Parameter | JavaScript (`index.html`) | Python (`core/engine.py`) | Civil Engineering Assessment & Fix |
|---|---|---|---|
| **Rebar Edge Clearance** | Ignored (Bars run full outer slab dimension $L \times W$). | Included (`clearance_in = 3.0"`, reduces effective grid by 6" total). | **Python is correct.** Concrete cover (ACI 318 specifies 2" to 3" cover for earth-cast slabs) is mandatory. Port edge clearance into JS. |
| **Rebar Bar Sizing & Sizing Rounding** | Uses `Math.floor` for bar count. | Uses `math.ceil` for bar count. | **Python is correct.** Using `floor` leads to under-reinforcement. Must use `ceil` + 1. |
| **Rebar Accessories** | No wire ties or support chairs calculated. | Calculates wire ties (`intersections`) and chairs (`intersections / 4`). | **Python is richer.** Add accessory counts to JS UI. |
| **Wall Framing Allowance** | Explicit door/window studs `(doors*4) + (windows*4) + 4`. | Generic `base_studs * 0.15` corner allowance. | **JS is more granular for openings; Python is better for blind walls.** Combine both: `base_studs + opening_studs + corner_allowance`. |
| **Brick Mortar Sand Rounding** | Rounds sand CFT using `Math.round`. | Keeps exact decimal float. | Keep exact float in calculation; round only at display presentation. |
| **Drywall Screws** | Constant 32 screws/sheet (hardcoded box). | Constant 32 screws/sheet with pound conversion ($1 \text{ lb} \approx 300 \text{ screws}$). | Standardize on pound conversion in both engines. |
| **Profit Margin Logic** | Markup on Cost ($C \times P$). | Markup on Cost ($C \times P$). | Add user toggle for **Markup on Cost** vs **Margin on Price** in both engines. |

---

## 4. Edge-Case & Boundary Vulnerabilities

The following input conditions were audited across both engines:

1. **Zero Dimensions ($L=0, W=0, D=0$):**
   - *JavaScript:* Gracefully defaults to `0` without throwing exceptions.
   - *Python:* Pydantic schemas enforce `gt=0`, throwing `ValidationError`.
   - *Fix:* Ensure user forms catch zero and empty inputs gracefully with user-friendly warnings rather than unhandled rejections.

2. **Negative Values:**
   - Both engines must sanitize against negative waste, negative thickness, or negative pricing.

3. **Divide-by-Zero Protection:**
   - Occurs when user selects "Custom Spacing" and enters `0`.
   - *Current JS:* Sets `spacing = 0`, causing `Math.floor(W / 0) = Infinity`.
   - *Fix:* Guard with `Math.max(1, spacing)`.

4. **Floating Point Rounding Drift:**
   - E.g., `0.1 + 0.2 = 0.30000000000000004`.
   - *Fix:* Standardize financial values to 2 decimal places using fixed rounding utilities.

---

## 5. Engineering Disclaimers & Assumptions

All calculations in BuildEstimate Pro are designed for **material takeoff, cost estimating, and quantity surveying**. They do **not** constitute licensed structural engineering design.

The following mandatory disclaimers must be embedded in all proposal exports and calculator cards:

1. **Nominal Mix Ratios:**
   > *"Concrete mix ratio quantities (1:2:4, 1:1.5:3, etc.) are empirical material estimates based on dry volume factors. They do not substitute for lab-certified mix designs (e.g., ACI 211.1) or cylinder compressive strength tests."*

2. **Rebar Quantities:**
   > *"Rebar grid quantities are based on user-specified spacing for estimating purposes and must not be used as a structural reinforcement schedule without structural engineer approval."*

3. **Mortar & Brick Variations:**
   > *"Brick counts assume standard modular dimensions (9"x4.5"x3"). Variations in local brick sizes and mortar joint thickness (3/8" to 1/2") will affect actual jobsite consumption."*

