/**
 * BuildEstimate Pro 2.0 - Contractor Quotation, Proposal & Tender Studio
 * 
 * Generates professional client proposals, detailed CSI itemized tenders,
 * and milestone payment contracts with full print/PDF formatting.
 */

(function (global) {
  'use strict';

  const Quotations = {
    currentTemplate: 'executive', // 'executive', 'itemized', 'milestone'

    init: function () {
      this.bindEvents();
      this.render();
    },

    bindEvents: function () {
      const templateSelect = document.getElementById('quoteTemplateSelector');
      if (templateSelect) {
        templateSelect.addEventListener('change', (e) => {
          this.currentTemplate = e.target.value;
          this.render();
        });
      }
    },

    setTemplate: function (templateName) {
      this.currentTemplate = templateName;
      const select = document.getElementById('quoteTemplateSelector');
      if (select) select.value = templateName;
      this.render();
    },

    render: function () {
      const activeProj = BuildEstimateStorage.getActiveProject();
      const settings = BuildEstimateStorage.getSettings();
      const previewContainer = document.getElementById('quotationDocumentPreview');
      if (!previewContainer) return;

      if (!activeProj) {
        previewContainer.innerHTML = `
          <div class="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <p class="text-sm font-semibold text-slate-700">No Active Project Selected</p>
            <p class="text-xs text-slate-500 mt-1">Please select or create a project to generate client proposals.</p>
          </div>
        `;
        return;
      }

      const currSym = (activeProj.currency === 'PKR') ? 'Rs ' :
                      (activeProj.currency === 'EUR') ? '€' :
                      (activeProj.currency === 'GBP') ? '£' :
                      (activeProj.currency === 'AED') ? 'AED ' : '$';

      // Aggregate direct costs from BOQ or Takeoffs
      let matTotal = 0;
      let labTotal = 0;
      let equipTotal = 0;
      const boqItems = activeProj.boqItems || [];

      boqItems.forEach(it => {
        const qty = parseFloat(it.qty) || 0;
        matTotal += (parseFloat(it.matRate) || 0) * qty;
        labTotal += (parseFloat(it.labRate) || 0) * qty;
        equipTotal += (parseFloat(it.equipRate) || 0) * qty;
      });

      // If BOQ items empty, fallback to demo/quote values
      if (matTotal === 0 && activeProj.quotation) {
        matTotal = activeProj.quotation.materialsSubtotal || 13630.00;
        labTotal = activeProj.quotation.laborSubtotal || 9200.00;
        equipTotal = activeProj.quotation.equipmentSubtotal || 1400.00;
      }

      const directCosts = matTotal + labTotal + equipTotal;
      const contingencyPct = (activeProj.quotation?.contingencyPercent !== undefined) ? activeProj.quotation.contingencyPercent : settings.defaultContingency;
      const contingencyAmount = directCosts * (contingencyPct / 100);
      const subtotalWithContingency = directCosts + contingencyAmount;

      const profitMode = activeProj.quotation?.profitMode || settings.profitMode || 'markup';
      const profitPct = (activeProj.quotation?.profitPercent !== undefined) ? activeProj.quotation.profitPercent : settings.defaultProfitMargin;
      
      let profitAmount = 0;
      let preTaxTotal = 0;
      if (profitMode === 'margin') {
        preTaxTotal = profitPct < 100 ? (subtotalWithContingency / (1 - profitPct / 100)) : subtotalWithContingency;
        profitAmount = preTaxTotal - subtotalWithContingency;
      } else {
        profitAmount = subtotalWithContingency * (profitPct / 100);
        preTaxTotal = subtotalWithContingency + profitAmount;
      }

      const taxPct = (activeProj.quotation?.taxPercent !== undefined) ? activeProj.quotation.taxPercent : settings.defaultTax;
      const taxAmount = preTaxTotal * (taxPct / 100);
      const grandTotal = preTaxTotal + taxAmount;

      const todayStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      // Render Template
      if (this.currentTemplate === 'executive') {
        previewContainer.innerHTML = `
          <div class="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto print:p-0 print:border-none print:shadow-none text-slate-900 font-sans" id="printableProposalArea">
            <!-- Header with Company Branding & Document Ref -->
            <div class="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
              <div>
                <div class="flex items-center space-x-2">
                  <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">BE</div>
                  <h1 class="text-2xl font-black tracking-tight text-slate-900">${settings.companyName}</h1>
                </div>
                <p class="text-xs text-slate-500 mt-1">${settings.companyAddress}</p>
                <p class="text-xs text-slate-500">${settings.companyPhone} · ${settings.companyEmail}</p>
                <p class="text-[11px] font-mono font-semibold text-slate-400 mt-0.5">License: ${settings.taxRegistrationNumber}</p>
              </div>
              <div class="text-right">
                <span class="inline-block px-3 py-1 bg-blue-50 text-blue-700 font-black text-xs uppercase tracking-wider rounded-md border border-blue-200">Official Client Bid</span>
                <p class="text-xs font-mono font-bold text-slate-800 mt-2">BID REF: ${activeProj.ref || 'BE-2026-0842'}</p>
                <p class="text-xs text-slate-500">Date: ${todayStr}</p>
                <p class="text-xs text-slate-500">Valid Until: ${expiryDate}</p>
              </div>
            </div>

            <!-- Client & Jobsite Info Cards -->
            <div class="grid grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 mb-8 text-xs">
              <div>
                <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">PROPOSAL PREPARED FOR</span>
                <p class="font-extrabold text-sm text-slate-900">${activeProj.clientName || 'Valued Client'}</p>
                <p class="text-slate-600 mt-0.5">${activeProj.clientContact || 'Direct Contact'}</p>
                <p class="text-slate-500 mt-0.5">Project Scope: ${activeProj.name}</p>
              </div>
              <div>
                <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">JOBSITE & TECHNICAL SPECS</span>
                <p class="font-bold text-slate-800">Site Location: ${activeProj.address || 'Project Jobsite'}</p>
                <p class="text-slate-600 mt-0.5">Standard: ${activeProj.standard || 'ACI 318 / IBC Building Code'}</p>
                <p class="text-slate-600">Estimator: ${settings.estimatorName} (${settings.estimatorTitle})</p>
              </div>
            </div>

            <!-- Scope of Work Summary -->
            <div class="mb-8">
              <h3 class="text-xs font-black uppercase tracking-wider text-slate-700 mb-2">Scope of Work & Specification Inclusions</h3>
              <div class="p-4 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed bg-white">
                <p class="mb-2">${activeProj.notes || 'Full construction material takeoff, site mobilization, structural concrete pour, framing carpentry, and interior finish coating.'}</p>
                <ul class="list-disc pl-5 space-y-1 text-slate-600">
                  <li>Supply of all specified construction materials conforming to ASTM / European standards.</li>
                  <li>Skilled trade labour, safety supervision, and continuous on-site quality control.</li>
                  <li>All necessary heavy machinery, concrete pump transit, scaffolding, and safety gear.</li>
                  <li>Jobsite debris removal, final cleanup, and formal warranty documentation.</li>
                </ul>
              </div>
            </div>

            <!-- Cost Summary Breakdown -->
            <div class="mb-8">
              <h3 class="text-xs font-black uppercase tracking-wider text-slate-700 mb-2">Cost Breakdown & Investment Summary</h3>
              <table class="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                <thead class="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th class="py-2.5 px-4">Cost Category</th>
                    <th class="py-2.5 px-4">Specification & Trade Scope</th>
                    <th class="py-2.5 px-4 text-right">Amount (${activeProj.currency || 'USD'})</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr>
                    <td class="py-2.5 px-4 font-bold text-slate-800">1. Direct Materials & Fasteners</td>
                    <td class="py-2.5 px-4 text-slate-600">Ready-mix, rebar grid, framing lumber, drywall, and coatings</td>
                    <td class="py-2.5 px-4 text-right font-semibold">${currSym}${matTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td class="py-2.5 px-4 font-bold text-slate-800">2. Trade Labour & Craftsmanship</td>
                    <td class="py-2.5 px-4 text-slate-600">Site carpenters, concrete placers, drywall mechanics, painters</td>
                    <td class="py-2.5 px-4 text-right font-semibold">${currSym}${labTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td class="py-2.5 px-4 font-bold text-slate-800">3. Equipment, Machinery & Fuel</td>
                    <td class="py-2.5 px-4 text-slate-600">Pump truck, compactors, vibrators, scaffolding towers</td>
                    <td class="py-2.5 px-4 text-right font-semibold">${currSym}${equipTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr class="bg-slate-50 font-bold">
                    <td class="py-2.5 px-4 text-slate-900" colspan="2">Direct Project Costs</td>
                    <td class="py-2.5 px-4 text-right text-slate-900">${currSym}${directCosts.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td class="py-2 px-4 text-slate-600" colspan="2">Unforeseen Jobsite Contingency (${contingencyPct}%)</td>
                    <td class="py-2 px-4 text-right text-slate-700">+${currSym}${contingencyAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td class="py-2 px-4 text-slate-600" colspan="2">Contractor Overhead & Profit (${profitPct}% ${profitMode})</td>
                    <td class="py-2 px-4 text-right text-slate-700">+${currSym}${profitAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  ${taxPct > 0 ? `
                  <tr>
                    <td class="py-2 px-4 text-slate-600" colspan="2">Applicable Sales Tax / VAT (${taxPct}%)</td>
                    <td class="py-2 px-4 text-right text-slate-700">+${currSym}${taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>` : ''}
                  <tr class="bg-blue-600 text-white font-black text-sm">
                    <td class="py-3 px-4" colspan="2">TOTAL PROPOSED CONTRACT PRICE</td>
                    <td class="py-3 px-4 text-right">${currSym}${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Signatures Block -->
            <div class="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-xs">
              <div>
                <p class="font-bold text-slate-900">Submitted By (General Contractor):</p>
                <div class="h-16 border-b border-dashed border-slate-300 mt-2 flex items-end pb-1 font-serif italic text-slate-500">
                  ${settings.estimatorName}
                </div>
                <p class="text-[11px] text-slate-500 mt-1">${settings.companyName} · Date: ${todayStr}</p>
              </div>
              <div>
                <p class="font-bold text-slate-900">Client Acceptance & Authorization:</p>
                <div class="h-16 border-b border-dashed border-slate-300 mt-2 flex items-end pb-1 text-slate-400">
                  Sign & Date Here
                </div>
                <p class="text-[11px] text-slate-500 mt-1">Authorized Representative · Date</p>
              </div>
            </div>
          </div>
        `;
      } else if (this.currentTemplate === 'itemized') {
        previewContainer.innerHTML = `
          <div class="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto print:p-0 print:border-none print:shadow-none text-slate-900 font-sans" id="printableProposalArea">
            <div class="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-6">
              <div>
                <h1 class="text-xl font-black text-slate-900">${settings.companyName}</h1>
                <p class="text-xs text-slate-500">CSI MasterFormat Detailed Tender Specification</p>
              </div>
              <div class="text-right">
                <span class="text-xs font-mono font-bold text-slate-800">REF: ${activeProj.ref || 'BE-2026-0842'}</span>
                <p class="text-[11px] text-slate-500">Project: ${activeProj.name}</p>
              </div>
            </div>

            <table class="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden mb-6">
              <thead class="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th class="py-2.5 px-3">Item #</th>
                  <th class="py-2.5 px-3">Description & Scope</th>
                  <th class="py-2.5 px-3 text-right">Qty</th>
                  <th class="py-2.5 px-3">Unit</th>
                  <th class="py-2.5 px-3 text-right">Unit Rate</th>
                  <th class="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${boqItems.map(it => `
                  <tr>
                    <td class="py-2 px-3 font-mono font-bold text-slate-700">${it.itemNo || '00.00'}</td>
                    <td class="py-2 px-3 font-semibold text-slate-800">${it.description}</td>
                    <td class="py-2 px-3 text-right font-bold">${it.qty}</td>
                    <td class="py-2 px-3 text-slate-600">${it.unit}</td>
                    <td class="py-2 px-3 text-right text-slate-700">${currSym}${(it.totalRate || 0).toFixed(2)}</td>
                    <td class="py-2 px-3 text-right font-black text-slate-900">${currSym}${(it.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                `).join('')}
                <tr class="bg-slate-50 font-bold">
                  <td colspan="5" class="py-3 px-3 text-right text-slate-900">Total Tender Sum:</td>
                  <td class="py-3 px-3 text-right font-black text-blue-600 text-sm">${currSym}${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
          </div>
        `;
      } else if (this.currentTemplate === 'milestone') {
        const m1 = grandTotal * 0.30;
        const m2 = grandTotal * 0.30;
        const m3 = grandTotal * 0.30;
        const m4 = grandTotal * 0.10;

        previewContainer.innerHTML = `
          <div class="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto print:p-0 print:border-none print:shadow-none text-slate-900 font-sans" id="printableProposalArea">
            <div class="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-6">
              <div>
                <h1 class="text-xl font-black text-slate-900">${settings.companyName}</h1>
                <p class="text-xs text-slate-500">Contractor Agreement & Milestone Draw Schedule</p>
              </div>
              <div class="text-right">
                <span class="text-xs font-mono font-bold text-slate-800">REF: ${activeProj.ref || 'BE-2026-0842'}</span>
                <p class="text-[11px] text-slate-500">Contract Sum: ${currSym}${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>

            <h3 class="text-xs font-black uppercase tracking-wider text-slate-700 mb-3">Construction Milestone Payment Schedule</h3>
            <div class="space-y-3 mb-8">
              <div class="p-4 rounded-xl border border-slate-200 flex justify-between items-center bg-slate-50 text-xs">
                <div>
                  <span class="font-extrabold text-slate-900 block">Milestone 1: Mobilization & Foundation Pour (30%)</span>
                  <p class="text-slate-500 text-[11px] mt-0.5">Due upon signing contract & completion of excavation and foundation slab inspection.</p>
                </div>
                <span class="text-sm font-black text-slate-900">${currSym}${m1.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div class="p-4 rounded-xl border border-slate-200 flex justify-between items-center bg-slate-50 text-xs">
                <div>
                  <span class="font-extrabold text-slate-900 block">Milestone 2: Structural Framing & Roof Sheathing (30%)</span>
                  <p class="text-slate-500 text-[11px] mt-0.5">Due upon framing completion, plate anchoring, and weather-tight roof deck installation.</p>
                </div>
                <span class="text-sm font-black text-slate-900">${currSym}${m2.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div class="p-4 rounded-xl border border-slate-200 flex justify-between items-center bg-slate-50 text-xs">
                <div>
                  <span class="font-extrabold text-slate-900 block">Milestone 3: Drywall, Taping & Interior Finishes (30%)</span>
                  <p class="text-slate-500 text-[11px] mt-0.5">Due upon drywall Level 4 taping inspection and initial coat of primer and paint.</p>
                </div>
                <span class="text-sm font-black text-slate-900">${currSym}${m3.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div class="p-4 rounded-xl border border-slate-200 flex justify-between items-center bg-emerald-50 border-emerald-200 text-xs">
                <div>
                  <span class="font-extrabold text-emerald-900 block">Milestone 4: Punch-List & Substantial Completion (10%)</span>
                  <p class="text-emerald-700 text-[11px] mt-0.5">Final retainage release upon client walk-through, punch-list sign-off, and warranty transfer.</p>
                </div>
                <span class="text-sm font-black text-emerald-900">${currSym}${m4.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        `;
      }
    },

    printProposal: function () {
      window.print();
    }
  };

  global.BuildEstimateQuotations = Quotations;

})(typeof window !== 'undefined' ? window : this);
