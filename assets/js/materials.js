/**
 * BuildEstimate Pro 2.0 - Material Library, Labour/Equipment & Unit Converter
 * 
 * Provides standard civil engineering material databases, live unit conversion,
 * crew rates, equipment rates, and price book exports.
 */

(function (global) {
  'use strict';

  // Standard pre-configured material price catalog across trades
  const DEFAULT_MATERIALS = [
    { id: 'mat-01', code: 'C-3000', name: '3,000 PSI Ready-Mix Concrete', category: 'concrete', spec: 'ASTM C94 Standard', unit: 'yd³', price: 155.00, currency: 'USD', waste: 10, supplier: 'Metro Ready-Mix Batch Plant' },
    { id: 'mat-02', code: 'C-4000', name: '4,000 PSI High-Strength Ready-Mix', category: 'concrete', spec: 'ASTM C94 / ACI 318', unit: 'yd³', price: 172.00, currency: 'USD', waste: 8, supplier: 'Metro Ready-Mix Batch Plant' },
    { id: 'mat-03', code: 'CEM-50', name: 'Portland Cement Type I/II (50 kg bag)', category: 'concrete', spec: 'EN 197-1 / ASTM C150', unit: 'bag', price: 6.80, currency: 'USD', waste: 5, supplier: 'National Cement Corporation' },
    { id: 'mat-04', code: 'SAND-W', name: 'Washed Coarse Concrete Sand', category: 'aggregates', spec: 'ASTM C33 Fine Aggregate', unit: 'CFT', price: 1.25, currency: 'USD', waste: 10, supplier: 'Highland Aggregate Quarry' },
    { id: 'mat-05', code: 'BAJ-34', name: 'Crushed Bajri Stone (3/4" Aggregate)', category: 'aggregates', spec: 'ASTM C33 Coarse Aggregate', unit: 'CFT', price: 1.65, currency: 'USD', waste: 10, supplier: 'Highland Aggregate Quarry' },
    { id: 'mat-06', code: 'REB-4', name: '#4 Deformed Steel Rebar (1/2" / 12mm)', category: 'metals', spec: 'ASTM A615 Grade 60 (20ft stick)', unit: 'stick', price: 13.00, currency: 'USD', waste: 10, supplier: 'Apex Steel Distributors' },
    { id: 'mat-07', code: 'REB-5', name: '#5 Deformed Steel Rebar (5/8" / 16mm)', category: 'metals', spec: 'ASTM A615 Grade 60 (20ft stick)', unit: 'stick', price: 21.00, currency: 'USD', waste: 10, supplier: 'Apex Steel Distributors' },
    { id: 'mat-08', code: 'BRK-RED', name: 'Standard Red Clay Kiln Bricks (9x4.5x3")', category: 'masonry', spec: 'Class-1 Red Clay Brick', unit: '1,000 pcs', price: 750.00, currency: 'USD', waste: 5, supplier: 'Valley Clay Brick Kilns' },
    { id: 'mat-09', code: 'BLK-CMU', name: '8"x8"x16" Hollow Concrete CMU Block', category: 'masonry', spec: 'ASTM C90 Load-Bearing', unit: 'EA', price: 2.85, currency: 'USD', waste: 5, supplier: 'SolidBlock Precast Co.' },
    { id: 'mat-10', code: 'LMB-2X4', name: '2x4x8ft Kiln-Dried SPF Studs', category: 'framing', spec: 'No. 2 / BTR Structural SPF', unit: 'EA', price: 5.60, currency: 'USD', waste: 12, supplier: 'Builders First Lumber' },
    { id: 'mat-11', code: 'LMB-2X6', name: '2x6x8ft Kiln-Dried SPF Studs', category: 'framing', spec: 'No. 2 / BTR Structural SPF', unit: 'EA', price: 8.90, currency: 'USD', waste: 10, supplier: 'Builders First Lumber' },
    { id: 'mat-12', code: 'LMB-PLT', name: '2x4x16ft SPF Wall Plates', category: 'framing', spec: 'Continuous Top & Bottom Plates', unit: 'EA', price: 12.50, currency: 'USD', waste: 10, supplier: 'Builders First Lumber' },
    { id: 'mat-13', code: 'DRY-12', name: '1/2" Regular Gypsum Drywall (4x8ft)', category: 'drywall', spec: 'ASTM C1396 Interior Wallboard', unit: 'sheet', price: 16.50, currency: 'USD', waste: 10, supplier: 'National Gypsum Supply' },
    { id: 'mat-14', code: 'DRY-58', name: '5/8" Type X Firecode Drywall (4x8ft)', category: 'drywall', spec: 'ASTM C1396 1-Hour Fire Rated', unit: 'sheet', price: 21.00, currency: 'USD', waste: 10, supplier: 'National Gypsum Supply' },
    { id: 'mat-15', code: 'JNT-CMP', name: 'All-Purpose Joint Compound Mud (4.5 Gal)', category: 'drywall', spec: 'Pre-mixed Taping & Finishing', unit: 'bucket', price: 19.50, currency: 'USD', waste: 5, supplier: 'National Gypsum Supply' },
    { id: 'mat-16', code: 'PNT-INT', name: 'Premium Interior Latex Paint (5 Gallon)', category: 'paint', spec: 'Low-VOC Eggshell Finish (350 SF/gal)', unit: 'bucket', price: 175.00, currency: 'USD', waste: 10, supplier: 'Sherwin-Williams Pro' },
    { id: 'mat-17', code: 'PNT-PRM', name: 'PVA Drywall Primer & Sealer (5 Gallon)', category: 'paint', spec: 'High-Hide Acrylic Sealer', unit: 'bucket', price: 95.00, currency: 'USD', waste: 10, supplier: 'Sherwin-Williams Pro' },
    { id: 'mat-18', code: 'VAP-6M', name: '6-mil Polyethylene Vapor Barrier (1,000 SF)', category: 'waterproofing', spec: 'Under-Slab Moisture Retarder', unit: 'roll', price: 110.00, currency: 'USD', waste: 12, supplier: 'Stego Wrap Materials' }
  ];

  const CREW_BENCHMARKS = [
    { id: 'crew-01', trade: 'Carpentry & Framing', title: 'Lead Framing Carpenter', baseRate: 48.00, burdenPct: 22, billableRate: 58.56, dailyRate: 468.48 },
    { id: 'crew-02', trade: 'Carpentry & Framing', title: 'Apprentice / Helper', baseRate: 26.00, burdenPct: 20, billableRate: 31.20, dailyRate: 249.60 },
    { id: 'crew-03', trade: 'Concrete & Masonry', title: 'Concrete Finisher / Screed Master', baseRate: 52.00, burdenPct: 25, billableRate: 65.00, dailyRate: 520.00 },
    { id: 'crew-04', trade: 'Concrete & Masonry', title: 'Journeyman Brick Mason', baseRate: 50.00, burdenPct: 24, billableRate: 62.00, dailyRate: 496.00 },
    { id: 'crew-05', trade: 'Drywall & Finishes', title: 'Drywall Hanger & Taper', baseRate: 42.00, burdenPct: 20, billableRate: 50.40, dailyRate: 403.20 },
    { id: 'crew-06', trade: 'Drywall & Finishes', title: 'Commercial Painter', baseRate: 38.00, burdenPct: 20, billableRate: 45.60, dailyRate: 364.80 },
    { id: 'crew-07', trade: 'Site Operations', title: 'General Construction Laborer', baseRate: 22.00, burdenPct: 18, billableRate: 25.96, dailyRate: 207.68 }
  ];

  const EQUIPMENT_BENCHMARKS = [
    { id: 'eq-01', name: 'Transit Concrete Pump Truck (Boom 32m)', daily: 1450.00, weekly: 5800.00, unit: 'day', operatorIncluded: true },
    { id: 'eq-02', name: 'Compact Mini Excavator (18 HP)', daily: 285.00, weekly: 950.00, unit: 'day', operatorIncluded: false },
    { id: 'eq-03', name: 'Walk-Behind Plate Compactor (60 kg)', daily: 85.00, weekly: 275.00, unit: 'day', operatorIncluded: false },
    { id: 'eq-04', name: 'High-Frequency Concrete Poker Vibrator', daily: 65.00, weekly: 195.00, unit: 'day', operatorIncluded: false },
    { id: 'eq-05', name: 'Modular Frame Scaffolding (5ft x 5ft sets)', daily: 25.00, weekly: 85.00, unit: 'set/wk', operatorIncluded: false },
    { id: 'eq-06', name: 'Airless Paint Spray Rig (3300 PSI)', daily: 95.00, weekly: 320.00, unit: 'day', operatorIncluded: false }
  ];

  const MaterialsManager = {
    currentCategory: 'ALL',
    searchQuery: '',
    materials: [],

    init: function () {
      this.loadMaterials();
      this.bindEvents();
      this.render();
      this.renderLabourAndEquipment();
      this.initUnitConverter();
    },

    loadMaterials: function () {
      try {
        const stored = localStorage.getItem('buildestimate_v2_materials');
        if (stored) {
          this.materials = JSON.parse(stored);
        } else {
          this.materials = [...DEFAULT_MATERIALS];
          localStorage.setItem('buildestimate_v2_materials', JSON.stringify(this.materials));
        }
      } catch (e) {
        this.materials = [...DEFAULT_MATERIALS];
      }
    },

    saveMaterials: function () {
      try {
        localStorage.setItem('buildestimate_v2_materials', JSON.stringify(this.materials));
      } catch (e) {
        console.error('Failed to save materials:', e);
      }
    },

    bindEvents: function () {
      const searchInput = document.getElementById('matSearchInput');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.searchQuery = e.target.value.toLowerCase().trim();
          this.render();
        });
      }

      const form = document.getElementById('materialModalForm');
      if (form) {
        form.addEventListener('submit', (e) => this.handleSaveMaterial(e));
      }
    },

    setCategoryFilter: function (category) {
      this.currentCategory = category;
      const pills = document.querySelectorAll('.mat-cat-pill');
      pills.forEach(p => {
        if (p.getAttribute('data-cat') === category) {
          p.className = 'mat-cat-pill px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-2xs cursor-pointer';
        } else {
          p.className = 'mat-cat-pill px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer';
        }
      });
      this.render();
    },

    render: function () {
      const tbody = document.getElementById('materialsTableBody');
      const counterEl = document.getElementById('materialsCountLabel');
      if (!tbody) return;

      let filtered = this.materials;
      if (this.currentCategory !== 'ALL') {
        filtered = filtered.filter(m => m.category.toLowerCase() === this.currentCategory.toLowerCase());
      }
      if (this.searchQuery) {
        filtered = filtered.filter(m =>
          (m.name && m.name.toLowerCase().includes(this.searchQuery)) ||
          (m.code && m.code.toLowerCase().includes(this.searchQuery)) ||
          (m.spec && m.spec.toLowerCase().includes(this.searchQuery)) ||
          (m.supplier && m.supplier.toLowerCase().includes(this.searchQuery))
        );
      }

      if (counterEl) {
        counterEl.innerText = `Showing ${filtered.length} of ${this.materials.length} Materials`;
      }

      tbody.innerHTML = filtered.map(m => {
        const catBadge = {
          'concrete': 'bg-blue-50 text-blue-700 border-blue-200',
          'aggregates': 'bg-amber-50 text-amber-800 border-amber-200',
          'metals': 'bg-slate-100 text-slate-800 border-slate-300',
          'masonry': 'bg-orange-50 text-orange-800 border-orange-200',
          'framing': 'bg-emerald-50 text-emerald-800 border-emerald-200',
          'drywall': 'bg-purple-50 text-purple-800 border-purple-200',
          'paint': 'bg-indigo-50 text-indigo-800 border-indigo-200',
          'waterproofing': 'bg-cyan-50 text-cyan-800 border-cyan-200'
        }[m.category] || 'bg-slate-100 text-slate-700 border-slate-200';

        return `
          <tr class="hover:bg-blue-50/30 transition border-b border-slate-100 group">
            <td class="py-3 px-4 font-mono font-bold text-slate-700 text-xs">
              <span class="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">${m.code || 'MAT'}</span>
            </td>
            <td class="py-3 px-4">
              <span class="block font-bold text-slate-900 text-xs">${m.name}</span>
              <span class="text-[10px] text-slate-500 font-semibold">${m.spec || ''}</span>
            </td>
            <td class="py-3 px-4">
              <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${catBadge}">${m.category}</span>
            </td>
            <td class="py-3 px-4 text-xs font-semibold text-slate-600">
              per <span class="font-bold text-slate-800">${m.unit}</span>
            </td>
            <td class="py-3 px-4 text-right">
              <div class="inline-flex items-center space-x-1">
                <span class="text-xs font-bold text-slate-500">$</span>
                <input type="number" step="0.01" value="${m.price.toFixed(2)}" onchange="BuildEstimateMaterials.updatePrice('${m.id}', this.value)" class="w-20 text-xs font-extrabold text-slate-900 text-right bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-blue-500 rounded px-1.5 py-0.5 focus:outline-none transition">
              </div>
            </td>
            <td class="py-3 px-4 text-center text-xs font-semibold text-slate-600">
              ${m.waste}%
            </td>
            <td class="py-3 px-4 text-xs text-slate-500 truncate max-w-[150px]">
              ${m.supplier || 'Standard Distributor'}
            </td>
            <td class="py-3 px-4 text-right space-x-1 shrink-0">
              <button onclick="BuildEstimateMaterials.openEditModal('${m.id}')" title="Edit Material" class="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              </button>
              <button onclick="BuildEstimateMaterials.deleteMaterial('${m.id}')" title="Delete Material" class="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </td>
          </tr>
        `;
      }).join('');
    },

    updatePrice: function (id, newPrice) {
      const price = parseFloat(newPrice);
      if (isNaN(price) || price < 0) return;
      const mat = this.materials.find(m => m.id === id);
      if (mat) {
        mat.price = price;
        this.saveMaterials();
      }
    },

    openAddModal: function () {
      const modal = document.getElementById('materialModal');
      const form = document.getElementById('materialModalForm');
      if (!modal || !form) return;

      form.reset();
      document.getElementById('matModalId').value = '';
      document.getElementById('matModalTitle').innerText = 'Add Custom Construction Material';
      modal.classList.remove('hidden');
    },

    openEditModal: function (id) {
      const mat = this.materials.find(m => m.id === id);
      if (!mat) return;

      const modal = document.getElementById('materialModal');
      if (!modal) return;

      document.getElementById('matModalTitle').innerText = 'Edit Material Record';
      document.getElementById('matModalId').value = mat.id;
      document.getElementById('matModalCode').value = mat.code || '';
      document.getElementById('matModalName').value = mat.name || '';
      document.getElementById('matModalCategory').value = mat.category || 'concrete';
      document.getElementById('matModalSpec').value = mat.spec || '';
      document.getElementById('matModalUnit').value = mat.unit || 'EA';
      document.getElementById('matModalPrice').value = mat.price || 0;
      document.getElementById('matModalWaste').value = mat.waste || 5;
      document.getElementById('matModalSupplier').value = mat.supplier || '';

      modal.classList.remove('hidden');
    },

    closeModal: function () {
      const modal = document.getElementById('materialModal');
      if (modal) modal.classList.add('hidden');
    },

    handleSaveMaterial: function (e) {
      e.preventDefault();
      const id = document.getElementById('matModalId').value;
      const code = document.getElementById('matModalCode').value.trim() || 'MAT-' + Math.floor(100 + Math.random() * 900);
      const name = document.getElementById('matModalName').value.trim();
      const category = document.getElementById('matModalCategory').value;
      const spec = document.getElementById('matModalSpec').value.trim();
      const unit = document.getElementById('matModalUnit').value.trim() || 'EA';
      const price = parseFloat(document.getElementById('matModalPrice').value) || 0;
      const waste = parseFloat(document.getElementById('matModalWaste').value) || 0;
      const supplier = document.getElementById('matModalSupplier').value.trim();

      if (!name) {
        alert('Please enter a Material Name.');
        return;
      }

      if (id) {
        const idx = this.materials.findIndex(m => m.id === id);
        if (idx !== -1) {
          this.materials[idx] = { id, code, name, category, spec, unit, price, waste, supplier };
        }
      } else {
        this.materials.unshift({
          id: 'mat-' + Date.now(),
          code, name, category, spec, unit, price, waste, supplier
        });
      }

      this.saveMaterials();
      this.closeModal();
      this.render();
    },

    deleteMaterial: function (id) {
      if (confirm('Delete this material from the catalog?')) {
        this.materials = this.materials.filter(m => m.id !== id);
        this.saveMaterials();
        this.render();
      }
    },

    // ON-SITE CIVIL UNIT CONVERTER
    initUnitConverter: function () {
      const inputEl = document.getElementById('unitConvInput');
      const fromEl = document.getElementById('unitConvFrom');
      const toEl = document.getElementById('unitConvTo');
      const resEl = document.getElementById('unitConvResult');
      const formulaEl = document.getElementById('unitConvFormula');

      if (!inputEl || !fromEl || !toEl || !resEl) return;

      const performConversion = () => {
        const val = parseFloat(inputEl.value) || 0;
        const from = fromEl.value;
        const to = toEl.value;
        let res = 0;
        let formula = '';

        if (from === to) {
          res = val;
          formula = '1 : 1 direct conversion';
        } else if (from === 'cft' && to === 'm3') {
          res = val / 35.3147;
          formula = 'CFT ÷ 35.3147 = Cubic Meters (m³)';
        } else if (from === 'm3' && to === 'cft') {
          res = val * 35.3147;
          formula = 'm³ × 35.3147 = Cubic Feet (CFT)';
        } else if (from === 'yd3' && to === 'm3') {
          res = val * 0.764555;
          formula = 'yd³ × 0.764555 = Cubic Meters (m³)';
        } else if (from === 'm3' && to === 'yd3') {
          res = val / 0.764555;
          formula = 'm³ ÷ 0.764555 = Cubic Yards (yd³)';
        } else if (from === 'sqft' && to === 'sqm') {
          res = val * 0.092903;
          formula = 'SF × 0.092903 = Square Meters (m²)';
        } else if (from === 'sqm' && to === 'sqft') {
          res = val * 10.7639;
          formula = 'm² × 10.7639 = Square Feet (SF)';
        } else if (from === 'lf' && to === 'm') {
          res = val * 0.3048;
          formula = 'LF × 0.3048 = Linear Meters (m)';
        } else if (from === 'm' && to === 'lf') {
          res = val / 0.3048;
          formula = 'm ÷ 0.3048 = Linear Feet (LF)';
        } else if (from === 'in' && to === 'mm') {
          res = val * 25.4;
          formula = 'Inches × 25.4 = Millimeters (mm)';
        } else if (from === 'mm' && to === 'in') {
          res = val / 25.4;
          formula = 'mm ÷ 25.4 = Inches';
        } else if (from === 'ton' && to === 'kg') {
          res = val * 1000;
          formula = 'Metric Ton × 1000 = Kilograms (kg)';
        } else if (from === 'kg' && to === 'lbs') {
          res = val * 2.20462;
          formula = 'kg × 2.20462 = Pounds (lbs)';
        } else {
          res = val;
          formula = 'Custom Conversion';
        }

        resEl.innerText = res.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
        if (formulaEl) formulaEl.innerText = formula;
      };

      inputEl.addEventListener('input', performConversion);
      fromEl.addEventListener('change', performConversion);
      toEl.addEventListener('change', performConversion);
      performConversion();
    },

    // LABOUR & EQUIPMENT TAB RENDERING
    renderLabourAndEquipment: function () {
      const crewTable = document.getElementById('crewRatesTableBody');
      const equipTable = document.getElementById('equipRatesTableBody');

      if (crewTable) {
        crewTable.innerHTML = CREW_BENCHMARKS.map(c => `
          <tr class="hover:bg-slate-50 transition border-b border-slate-100 text-xs">
            <td class="py-3 px-4 font-bold text-slate-900">${c.title}</td>
            <td class="py-3 px-4 text-slate-500 font-semibold">${c.trade}</td>
            <td class="py-3 px-4 text-right font-semibold text-slate-700">$${c.baseRate.toFixed(2)}/hr</td>
            <td class="py-3 px-4 text-center text-slate-500 font-semibold">+${c.burdenPct}%</td>
            <td class="py-3 px-4 text-right font-extrabold text-blue-600">$${c.billableRate.toFixed(2)}/hr</td>
            <td class="py-3 px-4 text-right font-black text-slate-900">$${c.dailyRate.toFixed(2)}/day</td>
          </tr>
        `).join('');
      }

      if (equipTable) {
        equipTable.innerHTML = EQUIPMENT_BENCHMARKS.map(e => `
          <tr class="hover:bg-slate-50 transition border-b border-slate-100 text-xs">
            <td class="py-3 px-4 font-bold text-slate-900">${e.name}</td>
            <td class="py-3 px-4 text-right font-extrabold text-slate-900">$${e.daily.toFixed(2)}</td>
            <td class="py-3 px-4 text-right font-semibold text-slate-700">$${e.weekly.toFixed(2)}</td>
            <td class="py-3 px-4 text-center font-semibold text-slate-600">${e.unit}</td>
            <td class="py-3 px-4 text-center">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold ${e.operatorIncluded ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}">
                ${e.operatorIncluded ? 'Operator Included' : 'Bare Rental'}
              </span>
            </td>
          </tr>
        `).join('');
      }
    },

    exportMaterialsCsv: function () {
      let csv = 'Code,Name,Category,Specification,Unit,Price,Currency,WastePercent,Supplier\n';
      this.materials.forEach(m => {
        const row = [
          `"${m.code || ''}"`,
          `"${(m.name || '').replace(/"/g, '""')}"`,
          `"${m.category || ''}"`,
          `"${(m.spec || '').replace(/"/g, '""')}"`,
          `"${m.unit || ''}"`,
          m.price,
          `"${m.currency || 'USD'}"`,
          m.waste,
          `"${(m.supplier || '').replace(/"/g, '""')}"`
        ];
        csv += row.join(',') + '\n';
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `Materials_Price_Book_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  global.BuildEstimateMaterials = MaterialsManager;

})(typeof window !== 'undefined' ? window : this);

