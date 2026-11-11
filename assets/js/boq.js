/**
 * BuildEstimate Pro 2.0 - Bill of Quantities (BOQ) & Tender Engine
 * 
 * Implements standard CSI MasterFormat itemization, line item CRUD,
 * automatic takeoff import, multi-currency recalculation, and CSV/PDF export.
 */

(function (global) {
  'use strict';

  const CSI_DIVISIONS = [
    { code: '01', name: 'Div 01 - General Requirements' },
    { code: '02', name: 'Div 02 - Existing Conditions & Earthwork' },
    { code: '03', name: 'Div 03 - Concrete & Rebar' },
    { code: '04', name: 'Div 04 - Masonry & Brickwork' },
    { code: '05', name: 'Div 05 - Metals & Structural Steel' },
    { code: '06', name: 'Div 06 - Wood, Plastics & Composites (Framing)' },
    { code: '07', name: 'Div 07 - Thermal & Moisture Protection' },
    { code: '08', name: 'Div 08 - Openings (Doors & Windows)' },
    { code: '09', name: 'Div 09 - Finishes (Drywall, Paint, Flooring)' },
    { code: '22', name: 'Div 22 - Plumbing Fixtures & Piping' },
    { code: '26', name: 'Div 26 - Electrical Power & Lighting' }
  ];

  const BOQ = {
    currentFilter: 'ALL',
    searchQuery: '',

    init: function () {
      this.bindEvents();
      this.render();
    },

    bindEvents: function () {
      const divisionSelect = document.getElementById('boqDivisionFilter');
      if (divisionSelect) {
        divisionSelect.innerHTML = '<option value="ALL">All CSI Divisions</option>' +
          CSI_DIVISIONS.map(d => `<option value="${d.name}">${d.name}</option>`).join('');
        divisionSelect.addEventListener('change', (e) => {
          this.currentFilter = e.target.value;
          this.render();
        });
      }

      const searchInput = document.getElementById('boqSearchInput');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.searchQuery = e.target.value.toLowerCase().trim();
          this.render();
        });
      }

      const itemForm = document.getElementById('boqItemForm');
      if (itemForm) {
        itemForm.addEventListener('submit', (e) => this.handleSaveItem(e));
      }
    },

    render: function () {
      const activeProj = BuildEstimateStorage.getActiveProject();
      const container = document.getElementById('boqTableBody');
      const emptyState = document.getElementById('boqEmptyState');
      if (!container) return;

      const items = (activeProj && Array.isArray(activeProj.boqItems)) ? activeProj.boqItems : [];
      const currSym = (activeProj && activeProj.currency === 'PKR') ? 'Rs ' :
                      (activeProj && activeProj.currency === 'EUR') ? '€' :
                      (activeProj && activeProj.currency === 'GBP') ? '£' :
                      (activeProj && activeProj.currency === 'AED') ? 'AED ' : '$';

      // Apply filtering and search
      let filtered = items;
      if (this.currentFilter !== 'ALL') {
        filtered = filtered.filter(it => it.section === this.currentFilter);
      }
      if (this.searchQuery) {
        filtered = filtered.filter(it =>
          (it.description && it.description.toLowerCase().includes(this.searchQuery)) ||
          (it.itemNo && it.itemNo.toLowerCase().includes(this.searchQuery)) ||
          (it.section && it.section.toLowerCase().includes(this.searchQuery))
        );
      }

      // Compute KPI summaries
      let totalMaterial = 0;
      let totalLabor = 0;
      let totalEquipment = 0;
      let totalDirect = 0;

      items.forEach(it => {
        const qty = parseFloat(it.qty) || 0;
        const mat = (parseFloat(it.matRate) || 0) * qty;
        const lab = (parseFloat(it.labRate) || 0) * qty;
        const eq = (parseFloat(it.equipRate) || 0) * qty;
        totalMaterial += mat;
        totalLabor += lab;
        totalEquipment += eq;
        totalDirect += (parseFloat(it.totalAmount) || (mat + lab + eq));
      });

      // Update KPI widgets in UI
      const kpiTotal = document.getElementById('boqKpiTotalValue');
      const kpiMat = document.getElementById('boqKpiMaterialSubtotal');
      const kpiLab = document.getElementById('boqKpiLaborSubtotal');
      const kpiEquip = document.getElementById('boqKpiEquipSubtotal');
      const kpiCount = document.getElementById('boqKpiItemsCount');

      if (kpiTotal) kpiTotal.innerText = currSym + totalDirect.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      if (kpiMat) kpiMat.innerText = currSym + totalMaterial.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      if (kpiLab) kpiLab.innerText = currSym + totalLabor.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      if (kpiEquip) kpiEquip.innerText = currSym + totalEquipment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      if (kpiCount) kpiCount.innerText = items.length;

      if (filtered.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        return;
      }

      if (emptyState) emptyState.classList.add('hidden');

      container.innerHTML = filtered.map(it => {
        const qty = parseFloat(it.qty) || 0;
        const matRate = parseFloat(it.matRate) || 0;
        const labRate = parseFloat(it.labRate) || 0;
        const equipRate = parseFloat(it.equipRate) || 0;
        const totalRate = parseFloat(it.totalRate) || (matRate + labRate + equipRate);
        const totalAmount = parseFloat(it.totalAmount) || (qty * totalRate);

        return `
          <tr class="hover:bg-blue-50/40 transition border-b border-slate-100 group">
            <td class="py-3 px-4 font-mono font-bold text-slate-800 text-xs">
              <span class="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">${it.itemNo || '00.00'}</span>
            </td>
            <td class="py-3 px-4">
              <span class="block font-bold text-slate-900 text-xs">${it.description}</span>
              <span class="text-[10px] text-slate-500 font-semibold">${it.section || 'General'}</span>
            </td>
            <td class="py-3 px-4 text-right font-extrabold text-slate-900 text-xs">
              ${qty.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </td>
            <td class="py-3 px-4 text-xs font-semibold text-slate-600">
              ${it.unit}
            </td>
            <td class="py-3 px-4 text-right text-xs font-semibold text-slate-700">
              ${currSym}${totalRate.toFixed(2)}
              <span class="block text-[10px] text-slate-400">M:${matRate.toFixed(1)} L:${labRate.toFixed(1)} E:${equipRate.toFixed(1)}</span>
            </td>
            <td class="py-3 px-4 text-right font-black text-slate-900 text-xs">
              ${currSym}${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>
            <td class="py-3 px-4 text-right space-x-1 shrink-0">
              <button onclick="BuildEstimateBOQ.openEditModal('${it.id}')" title="Edit Item" class="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              </button>
              <button onclick="BuildEstimateBOQ.deleteItem('${it.id}')" title="Delete Item" class="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </td>
          </tr>
        `;
      }).join('');
    },

    openAddModal: function () {
      const modal = document.getElementById('boqItemModal');
      const form = document.getElementById('boqItemForm');
      if (!modal || !form) return;

      form.reset();
      document.getElementById('boqFormItemId').value = '';
      document.getElementById('boqModalTitle').innerText = 'Add Bill of Quantities Line Item';
      
      const divSelect = document.getElementById('boqFormSection');
      if (divSelect) {
        divSelect.innerHTML = CSI_DIVISIONS.map(d => `<option value="${d.name}">${d.name}</option>`).join('');
      }

      this.calcModalRate();
      modal.classList.remove('hidden');
    },

    openEditModal: function (id) {
      const activeProj = BuildEstimateStorage.getActiveProject();
      if (!activeProj || !Array.isArray(activeProj.boqItems)) return;

      const item = activeProj.boqItems.find(it => it.id === id);
      if (!item) return;

      const modal = document.getElementById('boqItemModal');
      if (!modal) return;

      document.getElementById('boqModalTitle').innerText = 'Edit Bill of Quantities Item';
      document.getElementById('boqFormItemId').value = item.id;
      document.getElementById('boqFormItemNo').value = item.itemNo || '';
      document.getElementById('boqFormDescription').value = item.description || '';
      document.getElementById('boqFormQty').value = item.qty || 1;
      document.getElementById('boqFormUnit').value = item.unit || 'EA';
      document.getElementById('boqFormMatRate').value = item.matRate || 0;
      document.getElementById('boqFormLabRate').value = item.labRate || 0;
      document.getElementById('boqFormEquipRate').value = item.equipRate || 0;

      const divSelect = document.getElementById('boqFormSection');
      if (divSelect) {
        divSelect.innerHTML = CSI_DIVISIONS.map(d => `<option value="${d.name}" ${d.name === item.section ? 'selected' : ''}>${d.name}</option>`).join('');
      }

      this.calcModalRate();
      modal.classList.remove('hidden');
    },

    closeModal: function () {
      const modal = document.getElementById('boqItemModal');
      if (modal) modal.classList.add('hidden');
    },

    calcModalRate: function () {
      const qty = parseFloat(document.getElementById('boqFormQty')?.value) || 0;
      const mat = parseFloat(document.getElementById('boqFormMatRate')?.value) || 0;
      const lab = parseFloat(document.getElementById('boqFormLabRate')?.value) || 0;
      const eq = parseFloat(document.getElementById('boqFormEquipRate')?.value) || 0;
      const totalRate = mat + lab + eq;
      const totalAmount = qty * totalRate;

      const lblTotalRate = document.getElementById('boqFormTotalRatePreview');
      const lblTotalAmount = document.getElementById('boqFormTotalAmountPreview');
      if (lblTotalRate) lblTotalRate.innerText = '$' + totalRate.toFixed(2);
      if (lblTotalAmount) lblTotalAmount.innerText = '$' + totalAmount.toFixed(2);
    },

    handleSaveItem: function (e) {
      e.preventDefault();
      const activeProj = BuildEstimateStorage.getActiveProject();
      if (!activeProj) {
        alert('Please select or create an active project first.');
        return;
      }

      const id = document.getElementById('boqFormItemId').value;
      const itemNo = document.getElementById('boqFormItemNo').value.trim() || '01.00';
      const section = document.getElementById('boqFormSection').value;
      const desc = document.getElementById('boqFormDescription').value.trim();
      const qty = parseFloat(document.getElementById('boqFormQty').value) || 1;
      const unit = document.getElementById('boqFormUnit').value.trim() || 'EA';
      const matRate = parseFloat(document.getElementById('boqFormMatRate').value) || 0;
      const labRate = parseFloat(document.getElementById('boqFormLabRate').value) || 0;
      const equipRate = parseFloat(document.getElementById('boqFormEquipRate').value) || 0;
      const totalRate = matRate + labRate + equipRate;
      const totalAmount = qty * totalRate;

      if (!desc) {
        alert('Please enter a description for this item.');
        return;
      }

      activeProj.boqItems = activeProj.boqItems || [];

      if (id) {
        const idx = activeProj.boqItems.findIndex(it => it.id === id);
        if (idx !== -1) {
          activeProj.boqItems[idx] = {
            id, itemNo, section, description: desc, qty, unit, matRate, labRate, equipRate, totalRate, totalAmount
          };
        }
      } else {
        const newItem = {
          id: 'boq-' + Date.now(),
          itemNo, section, description: desc, qty, unit, matRate, labRate, equipRate, totalRate, totalAmount
        };
        activeProj.boqItems.push(newItem);
      }

      BuildEstimateStorage.saveProject(activeProj);
      this.closeModal();
      this.render();
    },

    deleteItem: function (id) {
      const activeProj = BuildEstimateStorage.getActiveProject();
      if (!activeProj || !Array.isArray(activeProj.boqItems)) return;

      if (confirm('Delete this line item from the Bill of Quantities?')) {
        activeProj.boqItems = activeProj.boqItems.filter(it => it.id !== id);
        BuildEstimateStorage.saveProject(activeProj);
        this.render();
      }
    },

    // 1-Click Import from Takeoffs
    importFromTakeoffs: function () {
      const activeProj = BuildEstimateStorage.getActiveProject();
      if (!activeProj) {
        alert('Please select or create an active project first.');
        return;
      }

      // Collect values from the DOM takeoff calculator forms
      const concVol = parseFloat(document.getElementById('resConcCubicYards')?.innerText) || 0;
      const concUnit = document.getElementById('resConcUnitLabel')?.innerText || 'yd³';
      const rebarFt = parseFloat(document.getElementById('resConcRebarTotal')?.innerText) || 0;
      const cementBags = parseFloat(document.getElementById('resConcBagsTotal')?.innerText) || 0;
      const studsCount = parseFloat(document.getElementById('resFrameStudsTotal')?.innerText) || 0;
      const drywallSheets = parseFloat(document.getElementById('resFrameDrywallTotal')?.innerText) || 0;
      const bricksCount = parseFloat(document.getElementById('resBrickTotal')?.innerText) || 0;
      const paintGallons = parseFloat(document.getElementById('resPaintTotalGallons')?.innerText) || 0;

      activeProj.boqItems = activeProj.boqItems || [];
      let importedCount = 0;

      // 1. Concrete Slab
      if (concVol > 0) {
        activeProj.boqItems.push({
          id: 'boq-imp-' + Date.now() + '-1',
          itemNo: '03.20',
          section: 'Div 03 - Concrete & Rebar',
          description: `Structural Ready-Mix Concrete Slab (${concVol} ${concUnit})`,
          qty: concVol,
          unit: concUnit,
          matRate: 155.00,
          labRate: 45.00,
          equipRate: 15.00,
          totalRate: 215.00,
          totalAmount: concVol * 215.00
        });
        importedCount++;
      }

      // 2. Rebar Reinforcement
      if (rebarFt > 0) {
        activeProj.boqItems.push({
          id: 'boq-imp-' + Date.now() + '-2',
          itemNo: '03.30',
          section: 'Div 03 - Concrete & Rebar',
          description: `ASTM A615 Grade 60 Rebar Reinforcement Grid`,
          qty: rebarFt,
          unit: 'LF',
          matRate: 0.65,
          labRate: 0.45,
          equipRate: 0.05,
          totalRate: 1.15,
          totalAmount: rebarFt * 1.15
        });
        importedCount++;
      }

      // 3. Wall Studs Framing
      if (studsCount > 0) {
        activeProj.boqItems.push({
          id: 'boq-imp-' + Date.now() + '-3',
          itemNo: '06.10',
          section: 'Div 06 - Wood, Plastics & Composites (Framing)',
          description: `2x4 SPF Wall Stud Framing @ 16" OC & Plates`,
          qty: studsCount,
          unit: 'EA',
          matRate: 6.80,
          labRate: 5.50,
          equipRate: 0.50,
          totalRate: 12.80,
          totalAmount: studsCount * 12.80
        });
        importedCount++;
      }

      // 4. Drywall Panels
      if (drywallSheets > 0) {
        activeProj.boqItems.push({
          id: 'boq-imp-' + Date.now() + '-4',
          itemNo: '09.20',
          section: 'Div 09 - Finishes (Drywall, Paint, Flooring)',
          description: `1/2" Gypsum Wallboard Hanging & Level 4 Taping`,
          qty: drywallSheets,
          unit: 'sheet',
          matRate: 18.50,
          labRate: 16.00,
          equipRate: 0.50,
          totalRate: 35.00,
          totalAmount: drywallSheets * 35.00
        });
        importedCount++;
      }

      // 5. Masonry Bricks
      if (bricksCount > 0) {
        activeProj.boqItems.push({
          id: 'boq-imp-' + Date.now() + '-5',
          itemNo: '04.10',
          section: 'Div 04 - Masonry & Brickwork',
          description: `Standard Red Clay Brick Masonry & 1:6 Mortar`,
          qty: bricksCount,
          unit: 'EA',
          matRate: 0.75,
          labRate: 0.65,
          equipRate: 0.05,
          totalRate: 1.45,
          totalAmount: bricksCount * 1.45
        });
        importedCount++;
      }

      // 6. Paint Coatings
      if (paintGallons > 0) {
        activeProj.boqItems.push({
          id: 'boq-imp-' + Date.now() + '-6',
          itemNo: '09.90',
          section: 'Div 09 - Finishes (Drywall, Paint, Flooring)',
          description: `Interior Low-VOC Latex Paint (Primer + 2 Coats)`,
          qty: paintGallons,
          unit: 'gal',
          matRate: 48.00,
          labRate: 55.00,
          equipRate: 5.00,
          totalRate: 108.00,
          totalAmount: paintGallons * 108.00
        });
        importedCount++;
      }

      if (importedCount === 0) {
        alert('No calculated takeoff values found in the calculators yet. Go to Takeoff Tools, calculate your slab/framing/brick quantities, and click Import again.');
        return;
      }

      BuildEstimateStorage.saveProject(activeProj);
      this.render();
      alert(`Successfully imported ${importedCount} takeoff item(s) directly into your Bill of Quantities!`);
    },

    // Export BOQ as CSV
    exportCsv: function () {
      const activeProj = BuildEstimateStorage.getActiveProject();
      if (!activeProj || !Array.isArray(activeProj.boqItems) || activeProj.boqItems.length === 0) {
        alert('No BOQ items to export.');
        return;
      }

      let csv = 'Item No,CSI Section,Description,Quantity,Unit,Material Rate,Labor Rate,Equipment Rate,Total Rate,Total Amount\n';
      activeProj.boqItems.forEach(it => {
        const row = [
          `"${it.itemNo || ''}"`,
          `"${it.section || ''}"`,
          `"${(it.description || '').replace(/"/g, '""')}"`,
          it.qty,
          `"${it.unit}"`,
          it.matRate,
          it.labRate,
          it.equipRate,
          it.totalRate,
          it.totalAmount
        ];
        csv += row.join(',') + '\n';
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const filename = `BOQ_${activeProj.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  global.BuildEstimateBOQ = BOQ;

})(typeof window !== 'undefined' ? window : this);
