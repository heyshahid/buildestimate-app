/**
 * BuildEstimate Pro 2.0 - UI Controller & Application Architecture
 * 
 * Manages 14-module navigation, Project Studio CRUD, Dashboard metrics,
 * Takeoff integration, and reactive state synchronization.
 */

(function (global) {
  'use strict';

  const App = {
    currentView: 'dashboard',
    activeTab: 'concrete',

    init: function () {
      console.log('Initializing BuildEstimate Pro 2.0 UI Engine...');
      
      // 1. Ensure storage is initialized and legacy data migrated
      BuildEstimateStorage.migrateLegacyHistory();

      // 2. Ensure an active project exists (or initialize with demo if empty)
      let activeProj = BuildEstimateStorage.getActiveProject();
      if (!activeProj && BuildEstimateStorage.getProjects().length === 0) {
        activeProj = BuildEstimateStorage.loadDemoProject();
      }

      // 3. Render Navigation and Views
      this.bindNavigation();
      this.bindProjectEvents();
      this.renderActiveProjectBadge();
      this.renderDashboard();
      this.renderProjectsList();

      // Initialize sub-modules
      if (window.BuildEstimateBOQ) BuildEstimateBOQ.init();
      if (window.BuildEstimateMaterials) BuildEstimateMaterials.init();
      if (window.BuildEstimateDrawing) BuildEstimateDrawing.init();
      if (window.BuildEstimateQuotations) BuildEstimateQuotations.init();

      // 4. Listen for storage updates
      window.addEventListener('buildestimate-project-updated', () => {
        this.renderActiveProjectBadge();
        this.renderDashboard();
        this.renderProjectsList();
        if (window.BuildEstimateBOQ) BuildEstimateBOQ.render();
        if (window.BuildEstimateQuotations) BuildEstimateQuotations.render();
      });

      window.addEventListener('buildestimate-active-project-changed', () => {
        this.renderActiveProjectBadge();
        this.renderDashboard();
        this.renderProjectsList();
        if (window.BuildEstimateBOQ) BuildEstimateBOQ.render();
        if (window.BuildEstimateQuotations) BuildEstimateQuotations.render();
      });

      // 5. Check URL hash for initial routing
      const hash = window.location.hash.replace('#', '');
      if (hash && document.getElementById('view-' + hash)) {
        this.switchView(hash);
      } else {
        this.switchView('dashboard');
      }
    },

    // NAVIGATION SYSTEM (14 Modules)
    switchView: function (viewName) {
      const targetView = document.getElementById('view-' + viewName);
      if (!targetView) {
        console.warn('View not found:', viewName);
        return;
      }

      // Hide all views
      const allViews = document.querySelectorAll('.app-view');
      allViews.forEach(v => v.classList.add('hidden'));

      // Show target view
      targetView.classList.remove('hidden');
      this.currentView = viewName;
      window.location.hash = viewName;

      // Update sidebar nav link active states
      const navLinks = document.querySelectorAll('.sidebar-nav-link');
      navLinks.forEach(link => {
        const target = link.getAttribute('data-view');
        if (target === viewName) {
          link.classList.add('bg-blue-50', 'text-blue-600', 'font-bold');
          link.classList.remove('text-slate-600', 'hover:bg-slate-50', 'hover:text-slate-900');
        } else {
          link.classList.remove('bg-blue-50', 'text-blue-600', 'font-bold');
          link.classList.add('text-slate-600', 'hover:bg-slate-50', 'hover:text-slate-900');
        }
      });

      // Update Header Title
      const pageTitleEl = document.getElementById('headerPageTitle');
      if (pageTitleEl) {
        const titleMap = {
          'dashboard': 'Executive Dashboard',
          'projects': 'Project Management Studio',
          'takeoffs': 'Construction Takeoff Tools',
          'drawing-takeoff': 'Digital Blueprint & Drawing Takeoff',
          'materials': 'Material Library & Prices',
          'labour': 'Labour & Equipment Rates',
          'cost-estimator': 'Master Cost Estimator',
          'boq': 'Bill of Quantities (BOQ)',
          'quotations': 'Contractor Quotations & Bids',
          'history': 'Saved Estimates & Revisions',
          'reports': 'Executive Reports & Purchasing',
          'suppliers': 'Suppliers & Vendor Comparison',
          'regional': 'Regional Construction Standards',
          'help': 'Help, Field Manual & Formulas',
          'settings': 'Workspace & Company Settings'
        };
        pageTitleEl.innerText = titleMap[viewName] || 'BuildEstimate Pro';
      }

      // View-specific render hooks
      if (viewName === 'dashboard') this.renderDashboard();
      if (viewName === 'projects') this.renderProjectsList();
      if (viewName === 'boq' && window.BuildEstimateBOQ) BuildEstimateBOQ.render();
      if (viewName === 'materials' && window.BuildEstimateMaterials) BuildEstimateMaterials.render();
      if (viewName === 'labour' && window.BuildEstimateMaterials) BuildEstimateMaterials.renderLabourAndEquipment();
      if (viewName === 'quotations' && window.BuildEstimateQuotations) BuildEstimateQuotations.render();
      if (viewName === 'drawing-takeoff' && window.BuildEstimateDrawing) {
        setTimeout(() => {
          BuildEstimateDrawing.resizeCanvas();
          BuildEstimateDrawing.redraw();
        }, 50);
      }

      // Close mobile sidebar if open
      const mobileSidebar = document.getElementById('mobileSidebarBackdrop');
      if (mobileSidebar && !mobileSidebar.classList.contains('hidden')) {
        this.toggleMobileSidebar(false);
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    bindNavigation: function () {
      const navLinks = document.querySelectorAll('.sidebar-nav-link');
      navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const view = link.getAttribute('data-view');
          if (view) this.switchView(view);
        });
      });
    },

    toggleMobileSidebar: function (open) {
      const backdrop = document.getElementById('mobileSidebarBackdrop');
      const drawer = document.getElementById('mobileSidebarDrawer');
      if (!backdrop || !drawer) return;

      if (open) {
        backdrop.classList.remove('hidden');
        setTimeout(() => drawer.classList.remove('-translate-x-full'), 10);
      } else {
        drawer.classList.add('-translate-x-full');
        setTimeout(() => backdrop.classList.add('hidden'), 200);
      }
    },

    // ACTIVE PROJECT INDICATOR
    renderActiveProjectBadge: function () {
      const activeProj = BuildEstimateStorage.getActiveProject();
      const badgeContainer = document.getElementById('activeProjectBadge');
      const selector = document.getElementById('headerActiveProjectSelect');

      if (selector) {
        const projects = BuildEstimateStorage.getProjects();
        selector.innerHTML = '';
        projects.forEach(p => {
          const opt = document.createElement('option');
          opt.value = p.id;
          opt.innerText = p.name;
          if (activeProj && p.id === activeProj.id) opt.selected = true;
          selector.appendChild(opt);
        });
      }

      if (badgeContainer) {
        if (!activeProj) {
          badgeContainer.innerHTML = `
            <div class="flex items-center space-x-2 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <span class="w-2 h-2 rounded-full bg-slate-400"></span>
              <span>No Active Project</span>
              <button onclick="BuildEstimateApp.openCreateProjectModal()" class="text-blue-600 font-bold hover:underline ml-1">+ New</button>
            </div>
          `;
        } else {
          badgeContainer.innerHTML = `
            <div class="flex items-center space-x-2 text-xs font-semibold text-slate-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200/80 shadow-2xs">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <span class="truncate max-w-[180px] sm:max-w-[240px]" title="${activeProj.name}">${activeProj.name}</span>
              <span class="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">${activeProj.currency || 'USD'}</span>
            </div>
          `;
        }
      }
    },

    // DASHBOARD RENDERING
    renderDashboard: function () {
      const projects = BuildEstimateStorage.getProjects();
      const activeProj = BuildEstimateStorage.getActiveProject();

      // Compute aggregate stats across all projects
      let totalProjects = projects.length;
      let activeProjects = projects.filter(p => p.status === 'active' || p.status === 'in_progress').length;
      let totalEstimatedValue = 0;
      let totalMaterialCost = 0;
      let totalLaborCost = 0;
      let totalTakeoffsCount = 0;

      projects.forEach(p => {
        if (p.quotation && p.quotation.grandTotal) {
          totalEstimatedValue += p.quotation.grandTotal;
          totalMaterialCost += (p.quotation.materialsSubtotal || 0);
          totalLaborCost += (p.quotation.laborSubtotal || 0);
        }
        if (Array.isArray(p.estimates)) {
          totalTakeoffsCount += p.estimates.length;
        }
      });

      // Update KPI widgets
      const elTotalProj = document.getElementById('dashKpiTotalProjects');
      const elActiveProj = document.getElementById('dashKpiActiveProjects');
      const elEstValue = document.getElementById('dashKpiTotalValue');
      const elMatCost = document.getElementById('dashKpiMaterialCost');
      const elLaborCost = document.getElementById('dashKpiLaborCost');
      const elTakeoffCount = document.getElementById('dashKpiTotalTakeoffs');

      const currSym = (activeProj && activeProj.currency === 'PKR') ? 'Rs ' :
                      (activeProj && activeProj.currency === 'EUR') ? '€' :
                      (activeProj && activeProj.currency === 'GBP') ? '£' :
                      (activeProj && activeProj.currency === 'AED') ? 'AED ' : '$';

      if (elTotalProj) elTotalProj.innerText = totalProjects;
      if (elActiveProj) elActiveProj.innerText = activeProjects;
      if (elEstValue) elEstValue.innerText = currSym + totalEstimatedValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      if (elMatCost) elMatCost.innerText = currSym + totalMaterialCost.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      if (elLaborCost) elLaborCost.innerText = currSym + totalLaborCost.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      if (elTakeoffCount) elTakeoffCount.innerText = totalTakeoffsCount;

      // Render Recent Projects in Dashboard
      const recentListContainer = document.getElementById('dashRecentProjectsList');
      if (recentListContainer) {
        if (projects.length === 0) {
          recentListContainer.innerHTML = `
            <div class="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p class="text-sm font-semibold text-slate-700">No projects created yet</p>
              <p class="text-xs text-slate-500 mt-1">Start estimating by creating your first construction project or loading the demo villa.</p>
              <div class="mt-4 flex justify-center space-x-2">
                <button onclick="BuildEstimateApp.openCreateProjectModal()" class="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-sm">+ Create Project</button>
                <button onclick="BuildEstimateStorage.loadDemoProject()" class="px-3.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-600 shadow-sm">Load Demo Villa</button>
              </div>
            </div>
          `;
        } else {
          recentListContainer.innerHTML = projects.slice(0, 4).map(p => {
            const value = p.quotation?.grandTotal ? (currSym + p.quotation.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })) : 'In Draft';
            const statusColor = p.status === 'active' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                                p.status === 'won' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                p.status === 'completed' ? 'bg-purple-100 text-purple-800 border-purple-300' : 'bg-slate-100 text-slate-700 border-slate-300';
            return `
              <div class="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-xs transition cursor-pointer" onclick="BuildEstimateApp.selectAndOpenProject('${p.id}')">
                <div class="min-w-0 pr-3">
                  <div class="flex items-center space-x-2">
                    <span class="font-bold text-sm text-slate-900 truncate">${p.name}</span>
                    <span class="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${statusColor}">${p.status}</span>
                  </div>
                  <p class="text-xs text-slate-500 mt-0.5">${p.clientName} · ${p.projectType || 'General'} · ${(p.estimates || []).length} Takeoffs</p>
                </div>
                <div class="text-right shrink-0">
                  <span class="block text-sm font-extrabold text-slate-900">${value}</span>
                  <span class="text-[11px] text-blue-600 font-semibold hover:underline">Open Project →</span>
                </div>
              </div>
            `;
          }).join('');
        }
      }

      // Render Cost Breakdown Chart Bars (Dynamic SVG)
      const chartContainer = document.getElementById('dashCostBreakdownChart');
      if (chartContainer) {
        const matPct = totalEstimatedValue > 0 ? Math.round((totalMaterialCost / totalEstimatedValue) * 100) : 50;
        const labPct = totalEstimatedValue > 0 ? Math.round((totalLaborCost / totalEstimatedValue) * 100) : 35;
        const otherPct = Math.max(0, 100 - matPct - labPct);

        chartContainer.innerHTML = `
          <div class="space-y-3">
            <div>
              <div class="flex justify-between text-xs font-semibold mb-1">
                <span class="text-slate-700 flex items-center space-x-1.5"><span class="w-2.5 h-2.5 rounded-full bg-blue-600"></span><span>Direct Materials</span></span>
                <span class="text-slate-900 font-bold">${matPct}% (${currSym}${totalMaterialCost.toLocaleString()})</span>
              </div>
              <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div class="bg-blue-600 h-full rounded-full transition-all duration-500" style="width: ${matPct}%"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-xs font-semibold mb-1">
                <span class="text-slate-700 flex items-center space-x-1.5"><span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span><span>Direct Labour & Crews</span></span>
                <span class="text-slate-900 font-bold">${labPct}% (${currSym}${totalLaborCost.toLocaleString()})</span>
              </div>
              <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div class="bg-amber-500 h-full rounded-full transition-all duration-500" style="width: ${labPct}%"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-xs font-semibold mb-1">
                <span class="text-slate-700 flex items-center space-x-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span><span>Equipment, Contingency & Profit</span></span>
                <span class="text-slate-900 font-bold">${otherPct}%</span>
              </div>
              <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div class="bg-emerald-500 h-full rounded-full transition-all duration-500" style="width: ${otherPct}%"></div>
              </div>
            </div>
          </div>
        `;
      }
    },

    // PROJECTS STUDIO (CRUD & Filtering)
    renderProjectsList: function (filterStatus = 'ALL', searchQuery = '') {
      const container = document.getElementById('projectsGridContainer');
      if (!container) return;

      let projects = BuildEstimateStorage.getProjects();
      const activeProjId = BuildEstimateStorage.getActiveProjectId();

      // Apply Status Filter
      if (filterStatus !== 'ALL') {
        projects = projects.filter(p => p.status.toLowerCase() === filterStatus.toLowerCase());
      }

      // Apply Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        projects = projects.filter(p => 
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.clientName && p.clientName.toLowerCase().includes(q)) ||
          (p.ref && p.ref.toLowerCase().includes(q)) ||
          (p.address && p.address.toLowerCase().includes(q))
        );
      }

      if (projects.length === 0) {
        container.innerHTML = `
          <div class="col-span-full p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <h3 class="text-base font-bold text-slate-900">No Projects Found</h3>
            <p class="text-xs text-slate-500 max-w-md mx-auto mt-1">There are no construction projects matching your search criteria. Create a new project to get started.</p>
            <div class="mt-4 flex justify-center space-x-2">
              <button onclick="BuildEstimateApp.openCreateProjectModal()" class="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-sm">+ Create New Project</button>
            </div>
          </div>
        `;
        return;
      }

      container.innerHTML = projects.map(p => {
        const isActive = p.id === activeProjId;
        const totalTakeoffs = (p.estimates || []).length;
        const totalBoq = (p.boqItems || []).length;
        const grandTotal = p.quotation?.grandTotal ? `$${p.quotation.grandTotal.toLocaleString()}` : 'Unquoted';
        const statusColors = {
          'active': 'bg-emerald-50 text-emerald-700 border-emerald-200',
          'in_progress': 'bg-blue-50 text-blue-700 border-blue-200',
          'draft': 'bg-slate-50 text-slate-700 border-slate-200',
          'won': 'bg-indigo-50 text-indigo-700 border-indigo-200',
          'completed': 'bg-purple-50 text-purple-700 border-purple-200',
          'archived': 'bg-rose-50 text-rose-700 border-rose-200'
        };

        return `
          <div class="bg-white rounded-2xl border ${isActive ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-slate-200'} p-5 shadow-xs hover:border-blue-300 hover:shadow-sm transition flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">${p.ref || 'PROJ'}</span>
                <span class="text-[11px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusColors[p.status] || 'bg-slate-100 text-slate-700 border-slate-200'}">${p.status}</span>
              </div>
              <h3 class="text-base font-bold text-slate-900 leading-snug line-clamp-1" title="${p.name}">${p.name}</h3>
              <p class="text-xs text-slate-500 mt-0.5 flex items-center space-x-1">
                <span>👤 ${p.clientName || 'Direct Client'}</span>
                <span>•</span>
                <span>${p.projectType || 'General'}</span>
              </p>
              ${p.address ? `<p class="text-[11px] text-slate-400 mt-1 truncate">📍 ${p.address}</p>` : ''}
              
              <div class="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                <div class="bg-slate-50 p-2 rounded-lg">
                  <span class="block text-[10px] text-slate-400 uppercase font-semibold">Takeoffs</span>
                  <span class="text-xs font-bold text-slate-800">${totalTakeoffs}</span>
                </div>
                <div class="bg-slate-50 p-2 rounded-lg">
                  <span class="block text-[10px] text-slate-400 uppercase font-semibold">BOQ Lines</span>
                  <span class="text-xs font-bold text-slate-800">${totalBoq}</span>
                </div>
                <div class="bg-slate-50 p-2 rounded-lg">
                  <span class="block text-[10px] text-slate-400 uppercase font-semibold">Bid Value</span>
                  <span class="text-xs font-bold text-slate-900 truncate">${grandTotal}</span>
                </div>
              </div>
            </div>

            <div class="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button onclick="BuildEstimateApp.selectAndOpenProject('${p.id}')" class="text-xs font-bold px-3 py-1.5 rounded-lg ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800 hover:bg-blue-50 hover:text-blue-600'} transition">
                ${isActive ? '✓ Active Workspace' : 'Set Active'}
              </button>
              
              <div class="flex items-center space-x-1">
                <button onclick="BuildEstimateApp.openEditProjectModal('${p.id}')" title="Edit Project Details" class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                </button>
                <button onclick="BuildEstimateApp.duplicateProject('${p.id}')" title="Duplicate Project" class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </button>
                <button onclick="BuildEstimateApp.deleteProject('${p.id}')" title="Delete Project" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    },

    selectAndOpenProject: function (id) {
      BuildEstimateStorage.setActiveProjectId(id);
      this.renderActiveProjectBadge();
      this.renderProjectsList();
      // Inform user and optionally jump to takeoffs or dashboard
      console.log('Active project changed to:', id);
    },

    openCreateProjectModal: function () {
      const modal = document.getElementById('projectFormModal');
      const form = document.getElementById('projectForm');
      if (!modal || !form) return;

      form.reset();
      document.getElementById('projFormId').value = '';
      document.getElementById('projModalTitle').innerText = 'Create New Construction Project';
      modal.classList.remove('hidden');
    },

    openEditProjectModal: function (id) {
      const p = BuildEstimateStorage.getProject(id);
      if (!p) return;

      const modal = document.getElementById('projectFormModal');
      if (!modal) return;

      document.getElementById('projModalTitle').innerText = 'Edit Project Details';
      document.getElementById('projFormId').value = p.id;
      document.getElementById('projFormName').value = p.name || '';
      document.getElementById('projFormClient').value = p.clientName || '';
      document.getElementById('projFormContact').value = p.clientContact || '';
      document.getElementById('projFormAddress').value = p.address || '';
      document.getElementById('projFormType').value = p.projectType || 'residential';
      document.getElementById('projFormStatus').value = p.status || 'active';
      document.getElementById('projFormNotes').value = p.notes || '';

      modal.classList.remove('hidden');
    },

    closeProjectModal: function () {
      const modal = document.getElementById('projectFormModal');
      if (modal) modal.classList.add('hidden');
    },

    saveProjectFromForm: function (e) {
      e.preventDefault();
      const id = document.getElementById('projFormId').value;
      const name = document.getElementById('projFormName').value.trim();
      const client = document.getElementById('projFormClient').value.trim();
      const contact = document.getElementById('projFormContact').value.trim();
      const address = document.getElementById('projFormAddress').value.trim();
      const type = document.getElementById('projFormType').value;
      const status = document.getElementById('projFormStatus').value;
      const notes = document.getElementById('projFormNotes').value.trim();

      if (!name) {
        alert('Please enter a Project Name.');
        return;
      }

      let projectToSave = null;
      if (id) {
        // Update existing
        const existing = BuildEstimateStorage.getProject(id);
        if (existing) {
          projectToSave = {
            ...existing,
            name: name,
            clientName: client,
            clientContact: contact,
            address: address,
            projectType: type,
            status: status,
            notes: notes
          };
        }
      } else {
        // Create new
        projectToSave = {
          id: 'proj-' + Date.now(),
          ref: 'BE-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
          name: name,
          clientName: client,
          clientContact: contact,
          address: address,
          country: 'US',
          region: 'us',
          projectType: type,
          currency: 'USD',
          measurementSystem: 'imperial',
          status: status,
          notes: notes,
          estimates: [],
          boqItems: []
        };
      }

      if (projectToSave) {
        BuildEstimateStorage.saveProject(projectToSave);
        BuildEstimateStorage.setActiveProjectId(projectToSave.id);
        this.closeProjectModal();
        this.renderProjectsList();
      }
    },

    duplicateProject: function (id) {
      const dup = BuildEstimateStorage.duplicateProject(id);
      if (dup) {
        this.renderProjectsList();
      }
    },

    deleteProject: function (id) {
      if (confirm('Are you sure you want to delete this project? All associated takeoffs and BOQs will be permanently removed.')) {
        BuildEstimateStorage.deleteProject(id);
        this.renderProjectsList();
      }
    },

    bindProjectEvents: function () {
      const form = document.getElementById('projectForm');
      if (form) {
        form.addEventListener('submit', (e) => this.saveProjectFromForm(e));
      }

      const searchInput = document.getElementById('projectSearchInput');
      const filterSelect = document.getElementById('projectStatusFilter');

      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          const filter = filterSelect ? filterSelect.value : 'ALL';
          this.renderProjectsList(filter, e.target.value);
        });
      }

      if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
          const search = searchInput ? searchInput.value : '';
          this.renderProjectsList(e.target.value, search);
        });
      }
    }
  };

  global.BuildEstimateApp = App;

})(typeof window !== 'undefined' ? window : this);
