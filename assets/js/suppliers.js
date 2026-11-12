/**
 * BuildEstimate Pro 2.0 - Local Construction Suppliers & Vendor Directory
 * 
 * Provides contractors with a private, verified local vendor directory.
 * Stores local batch plants, lumber yards, steel mills, and quarry contacts
 * securely in the browser's local storage with zero fake external APIs.
 */

(function (global) {
  'use strict';

  const SuppliersModule = {
    currentCategory: 'ALL',
    searchQuery: '',

    init: function () {
      console.log('Initializing Local Construction Suppliers Directory...');
      this.bindEvents();
      this.render();

      window.addEventListener('buildestimate-suppliers-updated', () => {
        this.render();
      });
    },

    bindEvents: function () {
      const searchInput = document.getElementById('supplierSearchInput');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.searchQuery = e.target.value.toLowerCase().trim();
          this.render();
        });
      }

      const form = document.getElementById('supplierForm');
      if (form) {
        form.addEventListener('submit', (e) => this.saveFromForm(e));
      }
    },

    filterCategory: function (cat) {
      this.currentCategory = cat;
      const pills = document.querySelectorAll('.supplier-cat-pill');
      pills.forEach(pill => {
        if (pill.getAttribute('data-cat') === cat) {
          pill.classList.add('bg-blue-600', 'text-white', 'font-bold');
          pill.classList.remove('bg-white', 'text-slate-600', 'hover:bg-slate-100');
        } else {
          pill.classList.remove('bg-blue-600', 'text-white', 'font-bold');
          pill.classList.add('bg-white', 'text-slate-600', 'hover:bg-slate-100');
        }
      });
      this.render();
    },

    render: function () {
      const container = document.getElementById('suppliersListContainer');
      if (!container) return;

      let suppliers = BuildEstimateStorage.getSuppliers();

      // Filter by category
      if (this.currentCategory !== 'ALL') {
        suppliers = suppliers.filter(s => s.category === this.currentCategory);
      }

      // Filter by search query
      if (this.searchQuery) {
        suppliers = suppliers.filter(s => 
          (s.name && s.name.toLowerCase().includes(this.searchQuery)) ||
          (s.category && s.category.toLowerCase().includes(this.searchQuery)) ||
          (s.location && s.location.toLowerCase().includes(this.searchQuery)) ||
          (s.contactPerson && s.contactPerson.toLowerCase().includes(this.searchQuery)) ||
          (s.phone && s.phone.toLowerCase().includes(this.searchQuery))
        );
      }

      // Update count badge
      const countBadge = document.getElementById('supplierTotalCountBadge');
      if (countBadge) {
        const allSuppliers = BuildEstimateStorage.getSuppliers();
        countBadge.innerText = `${allSuppliers.length} Verified Local Vendor${allSuppliers.length === 1 ? '' : 's'}`;
      }

      if (suppliers.length === 0) {
        const isSearch = this.searchQuery || this.currentCategory !== 'ALL';
        container.innerHTML = `
          <div class="col-span-full p-10 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 text-xl font-bold">🏪</div>
            <h3 class="text-base font-bold text-slate-900">${isSearch ? 'No Matching Suppliers Found' : 'No Local Suppliers Added Yet'}</h3>
            <p class="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              ${isSearch 
                ? 'Try adjusting your search terms or filter category to locate your vendor records.' 
                : 'Add your trusted batch plants, lumber yards, and steel suppliers with direct phone numbers and delivery terms.'}
            </p>
            <div class="mt-4 flex flex-wrap justify-center gap-2.5">
              <button onclick="BuildEstimateSuppliers.openAddModal()" class="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-sm transition">
                + Add First Local Supplier
              </button>
              ${!isSearch ? `
                <button onclick="BuildEstimateStorage.loadSampleSuppliers()" class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition">
                  Load Sample Templates (Demo)
                </button>
              ` : ''}
            </div>
          </div>
        `;
        return;
      }

      container.innerHTML = suppliers.map(s => {
        const isSample = s.isSample;
        return `
          <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs hover:border-blue-300 transition flex flex-col justify-between">
            <div>
              <div class="flex items-start justify-between gap-2 mb-2">
                <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  ${s.category || 'General Supplier'}
                </span>
                ${isSample ? `
                  <span class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300">
                    [Sample Template]
                  </span>
                ` : `
                  <span class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-300 flex items-center space-x-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Local Verified</span>
                  </span>
                `}
              </div>

              <h3 class="text-base font-extrabold text-slate-900 leading-tight">${s.name}</h3>
              
              <div class="mt-3 space-y-1.5 text-xs text-slate-600">
                ${s.contactPerson ? `
                  <div class="flex items-center space-x-2">
                    <span class="text-slate-400">👤</span>
                    <span class="font-medium">${s.contactPerson}</span>
                  </div>
                ` : ''}
                ${s.phone ? `
                  <div class="flex items-center space-x-2">
                    <span class="text-slate-400">📞</span>
                    <a href="tel:${s.phone}" class="font-bold text-blue-600 hover:underline">${s.phone}</a>
                  </div>
                ` : ''}
                ${s.email ? `
                  <div class="flex items-center space-x-2">
                    <span class="text-slate-400">✉️</span>
                    <a href="mailto:${s.email}" class="text-slate-600 hover:underline truncate">${s.email}</a>
                  </div>
                ` : ''}
                ${s.location ? `
                  <div class="flex items-center space-x-2">
                    <span class="text-slate-400">📍</span>
                    <span class="text-slate-600">${s.location}</span>
                  </div>
                ` : ''}
              </div>

              <div class="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                <div class="bg-slate-50 p-2 rounded-lg border border-slate-150">
                  <span class="block text-[9px] uppercase font-bold text-slate-400">Delivery Radius</span>
                  <span class="font-semibold text-slate-800 mt-0.5 block">${s.deliveryRadius || 'Local Service'}</span>
                </div>
                <div class="bg-slate-50 p-2 rounded-lg border border-slate-150">
                  <span class="block text-[9px] uppercase font-bold text-slate-400">Payment Terms</span>
                  <span class="font-semibold text-slate-800 mt-0.5 block">${s.paymentTerms || 'Standard'}</span>
                </div>
              </div>

              ${s.notes ? `
                <div class="mt-2.5 p-2 bg-slate-50/80 rounded-lg text-[11px] text-slate-600 border border-slate-100 line-clamp-2" title="${s.notes}">
                  ${s.notes}
                </div>
              ` : ''}
            </div>

            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span class="text-[10px] text-slate-400">ID: ${s.id.slice(0, 10)}</span>
              <div class="flex items-center space-x-2">
                <button onclick="BuildEstimateSuppliers.openEditModal('${s.id}')" class="px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition">
                  Edit
                </button>
                <button onclick="BuildEstimateSuppliers.deleteSupplier('${s.id}')" class="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition">
                  Delete
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    },

    openAddModal: function () {
      const modal = document.getElementById('supplierFormModal');
      const form = document.getElementById('supplierForm');
      if (!modal || !form) return;

      form.reset();
      document.getElementById('supFormId').value = '';
      document.getElementById('supModalTitle').innerText = 'Add Verified Local Supplier';
      modal.classList.remove('hidden');
      setTimeout(() => document.getElementById('supFormName').focus(), 50);
    },

    openEditModal: function (id) {
      const suppliers = BuildEstimateStorage.getSuppliers();
      const s = suppliers.find(item => item.id === id);
      if (!s) return;

      const modal = document.getElementById('supplierFormModal');
      if (!modal) return;

      document.getElementById('supModalTitle').innerText = 'Edit Supplier Details';
      document.getElementById('supFormId').value = s.id;
      document.getElementById('supFormName').value = s.name || '';
      document.getElementById('supFormCategory').value = s.category || 'Ready-Mix Batch Plant';
      document.getElementById('supFormContact').value = s.contactPerson || '';
      document.getElementById('supFormPhone').value = s.phone || '';
      document.getElementById('supFormEmail').value = s.email || '';
      document.getElementById('supFormLocation').value = s.location || '';
      document.getElementById('supFormRadius').value = s.deliveryRadius || '';
      document.getElementById('supFormTerms').value = s.paymentTerms || 'Net 30';
      document.getElementById('supFormNotes').value = s.notes || '';

      modal.classList.remove('hidden');
    },

    closeModal: function () {
      const modal = document.getElementById('supplierFormModal');
      if (modal) modal.classList.add('hidden');
    },

    saveFromForm: function (e) {
      e.preventDefault();
      const id = document.getElementById('supFormId').value;
      const name = document.getElementById('supFormName').value.trim();
      const category = document.getElementById('supFormCategory').value;
      const contactPerson = document.getElementById('supFormContact').value.trim();
      const phone = document.getElementById('supFormPhone').value.trim();
      const email = document.getElementById('supFormEmail').value.trim();
      const location = document.getElementById('supFormLocation').value.trim();
      const deliveryRadius = document.getElementById('supFormRadius').value.trim();
      const paymentTerms = document.getElementById('supFormTerms').value.trim();
      const notes = document.getElementById('supFormNotes').value.trim();

      if (!name) {
        alert('Please enter a supplier or company name.');
        return;
      }

      const supplierToSave = {
        id: id || ('sup-' + Date.now()),
        name: name,
        category: category,
        contactPerson: contactPerson,
        phone: phone,
        email: email,
        location: location,
        deliveryRadius: deliveryRadius || 'Local Area',
        paymentTerms: paymentTerms || 'Standard',
        notes: notes,
        isSample: false
      };

      BuildEstimateStorage.saveSupplier(supplierToSave);
      this.closeModal();
      this.render();
    },

    deleteSupplier: function (id) {
      if (confirm('Are you sure you want to remove this supplier from your local directory?')) {
        BuildEstimateStorage.deleteSupplier(id);
        this.render();
      }
    },

    exportCSV: function () {
      const suppliers = BuildEstimateStorage.getSuppliers();
      if (suppliers.length === 0) {
        alert('No suppliers available to export.');
        return;
      }

      let csv = 'Supplier Name,Category,Contact Person,Phone,Email,Location,Delivery Radius,Payment Terms,Notes\n';
      suppliers.forEach(s => {
        csv += `"${(s.name || '').replace(/"/g, '""')}","${(s.category || '').replace(/"/g, '""')}","${(s.contactPerson || '').replace(/"/g, '""')}","${(s.phone || '').replace(/"/g, '""')}","${(s.email || '').replace(/"/g, '""')}","${(s.location || '').replace(/"/g, '""')}","${(s.deliveryRadius || '').replace(/"/g, '""')}","${(s.paymentTerms || '').replace(/"/g, '""')}","${(s.notes || '').replace(/"/g, '""')}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `BuildEstimate_Local_Suppliers_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  global.BuildEstimateSuppliers = SuppliersModule;

})(typeof window !== 'undefined' ? window : this);
