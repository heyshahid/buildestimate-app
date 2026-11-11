/**
 * BuildEstimate Pro 2.0 - Civil Engineering Mathematical Calculation Engine
 * 
 * Standards Reference:
 * - ACI 318 / IBC (American Concrete Institute)
 * - ASTM A615 (Deformed and Plain Carbon-Steel Bars for Concrete Reinforcement)
 * - BS EN 206 / Eurocode 2 (European Concrete Standards)
 * - Subcontinent Civil Engineering Practices (1.54 Dry Factor & IS 456 Nominal Mixes)
 */

(function (global) {
  'use strict';

  const Engine = {
    // 1. CONCRETE SLABS & FOOTINGS
    calculateConcreteSlab: function (params) {
      const length = Math.max(0, parseFloat(params.length) || 0);
      const width = Math.max(0, parseFloat(params.width) || 0);
      const thickness = Math.max(0, parseFloat(params.thickness) || 0);
      const unit = params.unit || 'imperial'; // 'imperial' (ft, in) or 'metric' (m, cm)
      const wastePercent = Math.max(0, parseFloat(params.wastePercent) || 0);

      let cubicFeet = 0;
      let cubicYards = 0;
      let cubicMeters = 0;

      if (unit === 'imperial') {
        const thicknessFt = thickness / 12.0;
        const rawCuFt = length * width * thicknessFt;
        cubicFeet = rawCuFt * (1 + wastePercent / 100.0);
        cubicYards = cubicFeet / 27.0;
        cubicMeters = cubicYards * 0.764555;
      } else {
        const thicknessM = thickness / 100.0;
        const rawM3 = length * width * thicknessM;
        cubicMeters = rawM3 * (1 + wastePercent / 100.0);
        cubicYards = cubicMeters / 0.764555;
        cubicFeet = cubicMeters * 35.3147;
      }

      // Transit mixer drum truck capacity
      const trucksUs = Math.ceil(cubicYards / 10.0);
      const trucksMetric = Math.ceil(cubicMeters / 8.0);

      // Pre-bagged commercial quick-mix yields
      const bags80lb = Math.ceil(cubicFeet / 0.60);
      const bags60lb = Math.ceil(cubicFeet / 0.45);

      return {
        unit: unit,
        length: length,
        width: width,
        thickness: thickness,
        wastePercent: wastePercent,
        cubicFeet: parseFloat(cubicFeet.toFixed(2)),
        cubicYards: parseFloat(cubicYards.toFixed(2)),
        cubicMeters: parseFloat(cubicMeters.toFixed(2)),
        readyMixTrucksUS: trucksUs,
        readyMixTrucksMetric: trucksMetric,
        bags80lb: bags80lb,
        bags60lb: bags60lb,
      };
    },

    // 2. NOMINAL CONCRETE MIX RATIO & 1.54 DRY VOLUME
    calculateMixRatioConcrete: function (params) {
      const wetVolumeCft = Math.max(0, parseFloat(params.wetVolumeCft) || 0);
      const dryFactor = Math.max(1.0, parseFloat(params.dryFactor) || 1.54);
      const ratioCement = Math.max(0.1, parseFloat(params.ratioCement) || 1.0);
      const ratioSand = Math.max(0.1, parseFloat(params.ratioSand) || 2.0);
      const ratioAggregate = Math.max(0.1, parseFloat(params.ratioAggregate) || 4.0);
      const steelPercent = Math.max(0, parseFloat(params.steelPercent) || 1.0);
      const waterCementRatio = Math.max(0.3, parseFloat(params.waterCementRatio) || 0.50);

      const wetM3 = wetVolumeCft / 35.3147;
      const dryCFT = wetVolumeCft * dryFactor;
      const totalParts = ratioCement + ratioSand + ratioAggregate;

      const cementCFT = dryCFT * (ratioCement / totalParts);
      const cementBags = Math.ceil(cementCFT / 1.25); // Standard 50kg bag = 1.25 CFT

      const sandCFT = dryCFT * (ratioSand / totalParts);
      const sandM3 = sandCFT / 35.3147;

      const bajriCFT = dryCFT * (ratioAggregate / totalParts);
      const bajriM3 = bajriCFT / 35.3147;

      // Steel reinforcement estimate (80 kg/m³ standard for residential slabs)
      const steelKg = wetM3 * (steelPercent * 78.5);
      const steelMetricTons = steelKg / 1000.0;
      const steelLbs = steelKg * 2.20462;

      // Mixing water
      const waterLitres = Math.round(cementBags * 50.0 * waterCementRatio);

      return {
        wetVolumeCft: parseFloat(wetVolumeCft.toFixed(2)),
        wetVolumeM3: parseFloat(wetM3.toFixed(2)),
        dryFactor: dryFactor,
        dryVolumeCft: parseFloat(dryCFT.toFixed(2)),
        ratioStr: `${ratioCement}:${ratioSand}:${ratioAggregate}`,
        cementCFT: parseFloat(cementCFT.toFixed(2)),
        cementBags50kg: cementBags,
        sandCFT: parseFloat(sandCFT.toFixed(1)),
        sandM3: parseFloat(sandM3.toFixed(2)),
        bajriCFT: parseFloat(bajriCFT.toFixed(1)),
        bajriM3: parseFloat(bajriM3.toFixed(2)),
        steelKg: parseFloat(steelKg.toFixed(1)),
        steelMetricTons: parseFloat(steelMetricTons.toFixed(3)),
        steelLbs: parseFloat(steelLbs.toFixed(1)),
        waterLitres: waterLitres,
      };
    },

    // 3. REBAR GRID & CONCRETE COVER
    calculateRebarGrid: function (params) {
      const lengthFt = Math.max(0, parseFloat(params.lengthFt) || 0);
      const widthFt = Math.max(0, parseFloat(params.widthFt) || 0);
      const spacingIn = Math.max(2.0, parseFloat(params.spacingIn) || 18.0);
      const clearanceIn = Math.max(0, parseFloat(params.clearanceIn) || 3.0); // 3" concrete edge cover
      const wastePercent = Math.max(0, parseFloat(params.wastePercent) || 10.0);
      const barSize = params.barSize || '#4 (1/2")';

      const clearanceFt = (clearanceIn * 2.0) / 12.0;
      const effectiveLen = Math.max(0, lengthFt - clearanceFt);
      const effectiveWid = Math.max(0, widthFt - clearanceFt);

      const spacingFt = spacingIn / 12.0;
      const numBarsLen = effectiveWid > 0 ? Math.ceil(effectiveWid / spacingFt) + 1 : 0;
      const numBarsWid = effectiveLen > 0 ? Math.ceil(effectiveLen / spacingFt) + 1 : 0;

      const rawLinearFt = (numBarsLen * effectiveLen) + (numBarsWid * effectiveWid);
      const totalLinearFt = rawLinearFt * (1.0 + wastePercent / 100.0);
      const numSticks20ft = Math.ceil(totalLinearFt / 20.0);

      const intersections = numBarsLen * numBarsWid;
      const wireTies = intersections;
      const chairs = Math.ceil(intersections / 4.0);

      // Rebar weight estimation: #4 bar is 0.668 lb/ft (0.994 kg/m)
      let lbPerFt = 0.668;
      if (barSize.indexOf('#3') !== -1 || barSize.indexOf('10mm') !== -1) lbPerFt = 0.376;
      else if (barSize.indexOf('#5') !== -1 || barSize.indexOf('16mm') !== -1) lbPerFt = 1.043;
      else if (barSize.indexOf('#6') !== -1 || barSize.indexOf('20mm') !== -1) lbPerFt = 1.502;

      const totalWeightLbs = totalLinearFt * lbPerFt;
      const totalWeightKg = totalWeightLbs / 2.20462;

      return {
        lengthFt: lengthFt,
        widthFt: widthFt,
        spacingIn: spacingIn,
        clearanceIn: clearanceIn,
        wastePercent: wastePercent,
        barSize: barSize,
        linearFeet: parseFloat(totalLinearFt.toFixed(1)),
        num20ftSticks: numSticks20ft,
        wireTiesCount: wireTies,
        supportChairs: chairs,
        weightLbs: parseFloat(totalWeightLbs.toFixed(1)),
        weightKg: parseFloat(totalWeightKg.toFixed(1)),
      };
    },

    // 4. WALL FRAMING & MASONRY
    calculateWallFraming: function (params) {
      const wallLengthFt = Math.max(0, parseFloat(params.wallLengthFt) || 0);
      const wallHeightFt = Math.max(0, parseFloat(params.wallHeightFt) || 8.0);
      const spacingIn = Math.max(6.0, parseFloat(params.spacingIn) || 16.0);
      const doors = Math.max(0, parseFloat(params.doors) || 0);
      const windows = Math.max(0, parseFloat(params.windows) || 0);
      const wastePercent = Math.max(0, parseFloat(params.wastePercent) || 10.0);

      const spacingFt = spacingIn / 12.0;
      const baseStuds = wallLengthFt > 0 ? Math.ceil(wallLengthFt / spacingFt) + 1 : 0;
      const cornerAllowance = Math.ceil(baseStuds * 0.15); // 15% corners & T-intersections
      const openingStuds = (doors * 4) + (windows * 4); // King and jack studs

      const totalStuds = Math.ceil((baseStuds + cornerAllowance + openingStuds) * (1.0 + wastePercent / 100.0));
      const platesLinearFt = wallLengthFt * 3.0; // 1 bottom + 2 top plates
      const plates16ft = Math.ceil(platesLinearFt / 16.0);

      return {
        wallLengthFt: wallLengthFt,
        wallHeightFt: wallHeightFt,
        spacingIn: spacingIn,
        doors: doors,
        windows: windows,
        baseStuds: baseStuds,
        totalStuds: totalStuds,
        platesLinearFt: platesLinearFt,
        plates16ft: plates16ft,
        headersLinearFt: parseFloat((wallLengthFt * 0.20).toFixed(1)),
      };
    },

    // 5. RED CLAY BRICK MASONRY
    calculateBrickMasonry: function (params) {
      const wallLengthFt = Math.max(0, parseFloat(params.wallLengthFt) || 0);
      const wallHeightFt = Math.max(0, parseFloat(params.wallHeightFt) || 8.0);
      const wallThicknessIn = Math.max(1.0, parseFloat(params.wallThicknessIn) || 9.0);
      const deductionsSqft = Math.max(0, parseFloat(params.deductionsSqft) || 0);
      const mortarRatio = params.mortarRatio || '1:6';
      const wastePercent = Math.max(0, parseFloat(params.wastePercent) || 5.0);

      const grossArea = wallLengthFt * wallHeightFt;
      const netArea = Math.max(0, grossArea - deductionsSqft);
      const thicknessFt = wallThicknessIn / 12.0;
      const netCft = netArea * thicknessFt;

      // 1 CFT of masonry = 13.5 modular bricks (9"x4.5"x3")
      const bricksRaw = netCft * 13.5;
      const totalBricks = Math.ceil(bricksRaw * (1.0 + wastePercent / 100.0));

      // Dry mortar factor = 30% of gross brickwork volume
      const dryMortarCft = netCft * 0.30;
      let cementFraction = 1.0 / 7.0;
      let sandFraction = 6.0 / 7.0;

      if (mortarRatio === '1:4') {
        cementFraction = 1.0 / 5.0;
        sandFraction = 4.0 / 5.0;
      } else if (mortarRatio === '1:3') {
        cementFraction = 1.0 / 4.0;
        sandFraction = 3.0 / 4.0;
      }

      const mortarCementCft = dryMortarCft * cementFraction;
      const mortarCementBags = Math.ceil(mortarCementCft / 1.25);
      const mortarSandCft = parseFloat((dryMortarCft * sandFraction).toFixed(1));

      return {
        netWallSqft: parseFloat(netArea.toFixed(1)),
        netWallCft: parseFloat(netCft.toFixed(2)),
        totalBricks: totalBricks,
        mortarRatio: mortarRatio,
        dryMortarCft: parseFloat(dryMortarCft.toFixed(2)),
        mortarCementBags50kg: mortarCementBags,
        mortarSandCft: mortarSandCft,
      };
    },

    // 6. DRYWALL SHEETS & ACCESSORIES
    calculateDrywall: function (params) {
      const wallLengthFt = Math.max(0, parseFloat(params.wallLengthFt) || 0);
      const wallHeightFt = Math.max(0, parseFloat(params.wallHeightFt) || 8.0);
      const bothSides = params.bothSides !== false;
      const deductionsSqft = Math.max(0, parseFloat(params.deductionsSqft) || 0);
      const sheetSize = parseFloat(params.sheetSize) || 32.0; // 32 for 4x8, 48 for 4x12
      const wastePercent = Math.max(0, parseFloat(params.wastePercent) || 10.0);

      const grossArea = wallLengthFt * wallHeightFt;
      const netOneSide = Math.max(0, grossArea - deductionsSqft);
      const totalDrywallArea = netOneSide * (bothSides ? 2.0 : 1.0);

      const sheets = Math.ceil((totalDrywallArea * (1.0 + wastePercent / 100.0)) / sheetSize);
      const screwsCount = sheets * 32;
      const screwsLbs = Math.ceil(screwsCount / 300.0); // ~300 screws per lb
      const jointCompoundGal = Math.ceil(sheets * 0.06 * 4.5) / 4.5;
      const mudBuckets4_5Gal = Math.ceil(sheets * 0.06) || 1;
      const tapeRolls = Math.ceil(sheets / 20.0) || 1;

      return {
        netWallAreaOneSide: parseFloat(netOneSide.toFixed(1)),
        totalDrywallArea: parseFloat(totalDrywallArea.toFixed(1)),
        sheetSize: sheetSize,
        sheetsCount: sheets,
        screwsCount: screwsCount,
        screwsLbs: screwsLbs,
        mudBuckets4_5Gal: mudBuckets4_5Gal,
        tapeRolls250ft: tapeRolls,
      };
    },

    // 7. PAINT & SURFACE COATINGS
    calculatePaint: function (params) {
      const totalSqft = Math.max(0, parseFloat(params.totalSqft) || 0);
      const finishCoats = Math.max(1, parseInt(params.finishCoats, 10) || 2);
      const primerCoats = Math.max(0, parseInt(params.primerCoats, 10) || 1);
      const coveragePerGal = Math.max(100, parseFloat(params.coveragePerGal) || 350.0);
      const wastePercent = Math.max(0, parseFloat(params.wastePercent) || 5.0);

      const multiplier = 1.0 + (wastePercent / 100.0);
      const finishGallons = ((totalSqft * finishCoats) / coveragePerGal) * multiplier;
      const primerGallons = ((totalSqft * primerCoats) / coveragePerGal) * multiplier;

      const fiveGalBuckets = Math.floor(finishGallons / 5.0);
      const oneGalCans = Math.ceil(finishGallons % 5.0);
      const totalLitres = (finishGallons + primerGallons) * 3.78541;

      return {
        totalSqft: totalSqft,
        finishCoats: finishCoats,
        primerCoats: primerCoats,
        coveragePerGal: coveragePerGal,
        finishGallons: parseFloat(finishGallons.toFixed(2)),
        primerGallons: parseFloat(primerGallons.toFixed(2)),
        fiveGalBuckets: fiveGalBuckets,
        oneGalCans: oneGalCans,
        totalLitres: parseFloat(totalLitres.toFixed(1)),
      };
    },

    // 8. FINANCIAL ESTIMATOR & BID PROPOSAL
    // Transparently handles both "Markup on Cost" and "Margin on Selling Price"
    calculateFinancialBid: function (params) {
      const materialsCost = Math.max(0, parseFloat(params.materialsCost) || 0);
      const laborHours = Math.max(0, parseFloat(params.laborHours) || 0);
      const laborRate = Math.max(0, parseFloat(params.laborRate) || 0);
      const equipmentCost = Math.max(0, parseFloat(params.equipmentCost) || 0);
      const subcontractorCost = Math.max(0, parseFloat(params.subcontractorCost) || 0);
      const otherCosts = Math.max(0, parseFloat(params.otherCosts) || 0);

      const contingencyPercent = Math.max(0, parseFloat(params.contingencyPercent) || 0);
      const profitPercent = Math.max(0, parseFloat(params.profitPercent) || 0);
      const profitMode = params.profitMode === 'margin' ? 'margin' : 'markup';
      const taxPercent = Math.max(0, parseFloat(params.taxPercent) || 0);

      const directLaborCost = laborHours * laborRate;
      const directCostsSubtotal = materialsCost + directLaborCost + equipmentCost + subcontractorCost + otherCosts;

      const contingencyAmount = directCostsSubtotal * (contingencyPercent / 100.0);
      const baseWithContingency = directCostsSubtotal + contingencyAmount;

      let profitAmount = 0;
      let preTaxTotal = 0;
      let effectiveMarginPercent = 0;

      if (profitMode === 'margin') {
        // True Margin on Selling Price: Selling Price = Cost / (1 - Margin)
        const safeMargin = Math.min(99.0, profitPercent) / 100.0;
        preTaxTotal = safeMargin >= 1.0 ? baseWithContingency : (baseWithContingency / (1.0 - safeMargin));
        profitAmount = preTaxTotal - baseWithContingency;
        effectiveMarginPercent = preTaxTotal > 0 ? (profitAmount / preTaxTotal) * 100.0 : 0;
      } else {
        // Markup on Cost: Profit = Cost * Markup%
        profitAmount = baseWithContingency * (profitPercent / 100.0);
        preTaxTotal = baseWithContingency + profitAmount;
        effectiveMarginPercent = preTaxTotal > 0 ? (profitAmount / preTaxTotal) * 100.0 : 0;
      }

      const taxAmount = preTaxTotal * (taxPercent / 100.0);
      const grandTotal = preTaxTotal + taxAmount;

      return {
        materialsCost: parseFloat(materialsCost.toFixed(2)),
        laborHours: parseFloat(laborHours.toFixed(1)),
        laborRate: parseFloat(laborRate.toFixed(2)),
        directLaborCost: parseFloat(directLaborCost.toFixed(2)),
        equipmentCost: parseFloat(equipmentCost.toFixed(2)),
        subcontractorCost: parseFloat(subcontractorCost.toFixed(2)),
        otherCosts: parseFloat(otherCosts.toFixed(2)),
        directCostsSubtotal: parseFloat(directCostsSubtotal.toFixed(2)),
        contingencyPercent: contingencyPercent,
        contingencyAmount: parseFloat(contingencyAmount.toFixed(2)),
        baseWithContingency: parseFloat(baseWithContingency.toFixed(2)),
        profitMode: profitMode,
        profitPercent: profitPercent,
        profitAmount: parseFloat(profitAmount.toFixed(2)),
        effectiveMarginPercent: parseFloat(effectiveMarginPercent.toFixed(2)),
        preTaxTotal: parseFloat(preTaxTotal.toFixed(2)),
        taxPercent: taxPercent,
        taxAmount: parseFloat(taxAmount.toFixed(2)),
        grandTotal: parseFloat(grandTotal.toFixed(2)),
      };
    }
  };

  // Export to window or Node/module
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Engine;
  } else {
    global.BuildEstimateEngine = Engine;
  }

})(typeof window !== 'undefined' ? window : this);
