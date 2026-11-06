# Mathematical Formulas & Industry Standards Reference

This document provides the foundational engineering formulas and standards implemented in **BuildEstimate Pro**.

---

## 1. Concrete Volume & Ready-Mix Takeoff

Conforms to **American Concrete Institute (ACI 318)** building code requirements.

### Volume in Cubic Feet:
$$\text{Cu Ft} = \text{Length (ft)} \times \text{Width (ft)} \times \frac{\text{Thickness (in)}}{12}$$

### Total Cubic Yards with Waste Factor:
$$\text{Cu Yds} = \frac{\text{Cu Ft} \times \left(1 + \frac{\text{Waste \%}}{100}\right)}{27}$$

### Transit Mixer Ready-Mix Loads:
$$\text{Truck Loads} = \left\lceil \frac{\text{Total Cu Yds}}{10} \right\rceil$$

---

## 2. Rebar Grid Calculation (ASTM A615 Grade 60)

Orthogonal grid of deformed reinforcement steel with 3-inch perimeter edge clearance.

### Effective Grid Span:
$$\text{Effective Length} = \max\left(0, \text{Length} - \frac{2 \times \text{Clearance}}{12}\right)$$
$$\text{Effective Width} = \max\left(0, \text{Width} - \frac{2 \times \text{Clearance}}{12}\right)$$

### Bar Counts:
$$\text{Bars}_{\text{lengthwise}} = \left\lfloor \frac{\text{Effective Length}}{\text{Spacing (ft)}} \right\rfloor + 1$$
$$\text{Bars}_{\text{widthwise}} = \left\lfloor \frac{\text{Effective Width}}{\text{Spacing (ft)}} \right\rfloor + 1$$

### Stock Bar sticks (20-foot standard lengths):
$$\text{Stock 20ft Bars} = \left\lceil \frac{\text{Total Linear Feet}}{20} \right\rceil$$

---

## 3. Wall Framing & Stud Distribution (IBC Chapter 23)

### Stud Count (16" or 24" On-Center):
$$\text{Base Studs} = \left\lceil \frac{\text{Wall Length (ft)} \times 12}{\text{Spacing (in)}} \right\rceil + 1$$

$$\text{Total Studs} = \lceil (\text{Base Studs} \times 1.15) \times (1 + \text{Waste Factor}) \rceil$$
*(Includes 15% allowance for 3-stud corners, partition intersections, and jack studs).*

### Wall Plates (1 Bottom + 2 Top Plates):
$$\text{Plates (16-foot stock)} = \left\lceil \frac{\text{Wall Length (ft)} \times 3}{16} \right\rceil$$

---

## 4. Drywall & Surface Linings (ASTM C840)

### Net Surface Area:
$$\text{Net Sq Ft} = [(\text{Wall Length} \times \text{Wall Height}) \times \text{Sides}] - \text{Deductions}$$

### Sheet Counts:
$$\text{4x8 Sheets} = \left\lceil \frac{\text{Net Sq Ft} \times (1 + \text{Waste Factor})}{32} \right\rceil$$
$$\text{4x12 Sheets} = \left\lceil \frac{\text{Net Sq Ft} \times (1 + \text{Waste Factor})}{48} \right\rceil$$

---

## 5. Contractor Master Financial Proposal

$$\text{Direct Cost} = \text{Materials} + (\text{Labor Hours} \times \text{Labor Rate}) + \text{Subcontractors} + \text{Equipment}$$

$$\text{Subtotal with Contingency} = \text{Direct Cost} \times \left(1 + \frac{\text{Contingency \%}}{100}\right)$$

$$\text{Grand Total (Proposal Quote)} = \text{Subtotal with Contingency} \times \left(1 + \frac{\text{Profit Margin \%}}{100}\right)$$
