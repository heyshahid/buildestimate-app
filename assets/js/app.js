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

      // 2. Active project state: check if an active project exists (never force demo on empty storage)
      const activeProj = BuildEstimateStorage.getActiveProject();

      // 3. Render Navigation and Views
      this.bindNavigation();
      this.bindProjectEvents();
      this.renderActiveProjectBadge();
      this.renderDashboard();
      this.renderProjectsList();

      // Initialize sub-modules
      if (window.BuildEstimateBOQ) BuildEstimateBOQ.init();
      if (window.BuildEstimateMaterials) BuildEstimateMaterials.init();
      if (window.BuildEstimateSuppliers) BuildEstimateSuppliers.init();
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

      window.addEventListener('buildestimate-demo-loaded', () => {
        this.renderActiveProjectBadge();
        this.renderDashboard();
        this.renderProjectsList();
        if (window.BuildEstimateBOQ) BuildEstimateBOQ.render();
        if (window.BuildEstimateQuotations) BuildEstimateQuotations.render();
      });

      // 5. Listen for browser Back / Forward history navigation
      window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace('#', '') || 'dashboard';
        if (this.currentView !== hash && document.getElementById('view-' + hash)) {
          this.switchView(hash, false);
        }
      });

      // 6. Check URL hash for initial routing
      const hash = window.location.hash.replace('#', '');
      if (hash && document.getElementById('view-' + hash)) {
        this.switchView(hash, false);
      } else {
        this.switchView('dashboard', false);
      }
    },

    // NAVIGATION SYSTEM (14 Modules)
    switchView: function (viewName, updateHash = true) {
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

      // Update URL hash safely for browser Back/Forward navigation
      if (updateHash !== false && window.location.hash !== '#' + viewName) {
        window.location.hash = viewName;
      }

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
          'suppliers': 'Verified Local Suppliers Directory',
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
      if (viewName === 'suppliers' && window.BuildEstimateSuppliers) BuildEstimateSuppliers.render();
      if (viewName === 'quotations' && window.BuildEstimateQuotations) BuildEstimateQuotations.render();
      if (viewName === 'cost-estimator') this.calcParametric();
      if (viewName === 'history') this.renderHistoryView();
      if (viewName === 'reports') this.renderReportsView();
      if (viewName === 'settings') this.renderSettingsView();
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

      const updateBadgeHtml = (el) => {
        if (!el) return;
        if (!activeProj) {
          el.innerHTML = `
            <div class="flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <div class="flex items-center space-x-1.5 min-w-0">
                <span class="w-2 h-2 rounded-full bg-slate-400 shrink-0"></span>
                <span class="font-bold truncate text-slate-700">Quick Takeoff Mode</span>
              </div>
              <button onclick="BuildEstimateApp.openCreateProjectModal()" class="text-blue-600 text-xs font-black hover:underline shrink-0 ml-1">+ New</button>
            </div>
          `;
        } else {
          el.innerHTML = `
            <div class="flex items-center justify-between text-xs font-semibold text-slate-800 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-200/80 shadow-2xs">
              <div class="flex items-center space-x-1.5 min-w-0">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <span class="truncate max-w-[150px] font-bold text-slate-900" title="${activeProj.name}">${activeProj.name}</span>
              </div>
              <div class="flex items-center space-x-1 shrink-0 ml-1">
                <span class="text-[9px] uppercase font-bold px-1 rounded bg-blue-100 text-blue-700">${activeProj.currency || 'USD'}</span>
                <button onclick="BuildEstimateStorage.setActiveProjectId(null); BuildEstimateApp.renderActiveProjectBadge();" title="Exit project to Quick Mode" class="text-slate-400 hover:text-slate-600 text-xs font-bold px-1">✕</button>
              </div>
            </div>
          `;
        }
      };

      updateBadgeHtml(badgeContainer);
      const mobileBadge = document.getElementById('mobileActiveProjectBadge');
      updateBadgeHtml(mobileBadge);
    },

    // DASHBOARD RENDERING
    renderDashboard: function () {
      const projects = BuildEstimateStorage.getProjects();
      const activeProj = BuildEstimateStorage.getActiveProject();

      // Top Welcome / Action Banner
      const welcomeBanner = document.getElementById('dashWelcomeBanner');
      if (welcomeBanner) {
        if (projects.length === 0) {
          welcomeBanner.innerHTML = `
            <div>
              <div class="flex items-center space-x-2">
                <span class="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Universal Estimating Studio</span>
              </div>
              <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">Welcome to BuildEstimate Pro</h1>
              <p class="text-xs sm:text-sm text-slate-500">Create your own construction project to start estimating, or load the sample villa to explore.</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <button onclick="BuildEstimateApp.openCreateProjectModal()" class="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition flex items-center space-x-1.5 shadow-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                <span>+ Create Your Project</span>
              </button>
              <button onclick="BuildEstimateStorage.loadDemoProject()" class="px-3.5 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-600 transition flex items-center space-x-1.5 shadow-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                <span>Load Sample Villa (Demo)</span>
              </button>
            </div>
          `;
        } else {
          welcomeBanner.innerHTML = `
            <div>
              <div class="flex items-center space-x-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Active Workspace</span>
              </div>
              <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">Construction Intelligence Dashboard</h1>
              <p class="text-xs sm:text-sm text-slate-500">Current Project: <strong class="text-slate-800">${activeProj ? activeProj.name : 'All Projects'}</strong></p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <button onclick="BuildEstimateApp.openCreateProjectModal()" class="px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition flex items-center space-x-1.5 shadow-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                <span>+ New Project</span>
              </button>
              <button onclick="BuildEstimateApp.switchView('takeoffs'); switchTab('concrete');" class="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition flex items-center space-x-1.5 shadow-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                <span>Concrete Takeoff</span>
              </button>
              <button onclick="BuildEstimateApp.switchView('quotations')" class="px-3.5 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition flex items-center space-x-1.5 shadow-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                <span>Contractor Bid</span>
              </button>
              <button onclick="BuildEstimateStorage.clearAllProjects()" class="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 text-xs font-bold transition" title="Clear sample demo projects and start blank">
                Clear Sample Data
              </button>
            </div>
          `;
        }
      }

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
                <div class="flex items-center space-x-1.5">
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">${p.ref || 'PROJ'}</span>
                  ${p.isDemo ? '<span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">Sample Demo</span>' : ''}
                </div>
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
                <button onclick="BuildEstimateStorage.exportSingleProject('${p.id}')" title="Export Project JSON" class="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                </button>
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
        // Create new (inherit global settings)
        const currentSettings = BuildEstimateStorage.getSettings();
        const savedCountry = localStorage.getItem('buildestimate_country') || currentSettings.defaultCountry || 'US';
        const savedCurrency = localStorage.getItem('buildestimate_currency') || currentSettings.defaultCurrency || 'USD';
        const savedRegion = currentSettings.defaultRegion || (typeof currentRegion !== 'undefined' ? currentRegion : 'us');
        const savedUnit = (typeof currentConcreteUnit !== 'undefined') ? currentConcreteUnit : (currentSettings.defaultUnit || 'imperial');

        projectToSave = {
          id: 'proj-' + Date.now(),
          ref: 'BE-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
          name: name,
          clientName: client,
          clientContact: contact,
          address: address,
          country: savedCountry,
          region: savedRegion,
          projectType: type,
          currency: savedCurrency,
          measurementSystem: savedUnit,
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
        this.renderActiveProjectBadge();
        this.renderProjectsList();
        this.renderDashboard();
        if (!id) {
          // If this was a newly created project, immediately switch to takeoffs view so user can start calculating!
          this.switchView('takeoffs');
          if (typeof switchTab === 'function') switchTab('concrete');
        }
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
    },

    // -------------------------------------------------------------
    // PARAMETRIC COST ESTIMATOR (VIEW 6)
    // -------------------------------------------------------------
    calcParametric: function () {
      const typologyEl = document.getElementById('paramTypology');
      const areaEl = document.getElementById('paramArea');
      const qualityEl = document.getElementById('paramQuality');
      if (!typologyEl || !areaEl || !qualityEl) return;

      const typology = typologyEl.value || 'single_family';
      const area = Math.max(10, parseFloat(areaEl.value) || 3200);
      const quality = qualityEl.value || 'standard';

      // Base Rates per SF (USD Benchmark)
      const baseRates = {
        'single_family': 220,
        'multi_family': 185,
        'commercial': 240,
        'industrial': 115,
        'luxury_villa': 280
      };

      const qualityMultipliers = {
        'custom': 1.20,
        'standard': 1.00,
        'economy': 0.85
      };

      const baseRate = baseRates[typology] || 220;
      const multiplier = qualityMultipliers[quality] || 1.0;
      const effectiveRate = baseRate * multiplier;
      const totalFeasibility = effectiveRate * area;

      // CSI Division Percentage Allocations
      const subCost = totalFeasibility * 0.15;
      const supCost = totalFeasibility * 0.28;
      const mepCost = totalFeasibility * 0.22;
      const finCost = totalFeasibility * 0.25;
      const genCost = totalFeasibility * 0.10;

      const activeProj = BuildEstimateStorage.getActiveProject();
      const currSym = (activeProj && activeProj.currency === 'PKR') ? 'Rs ' :
                      (activeProj && activeProj.currency === 'EUR') ? '€' :
                      (activeProj && activeProj.currency === 'GBP') ? '£' :
                      (activeProj && activeProj.currency === 'AED') ? 'AED ' : '$';

      const fmt = (num) => currSym + Math.round(num).toLocaleString('en-US');

      const effRateEl = document.getElementById('paramEffectiveRate');
      const totalCostEl = document.getElementById('paramTotalCost');
      const subCostEl = document.getElementById('paramSubCost');
      const supCostEl = document.getElementById('paramSupCost');
      const mepCostEl = document.getElementById('paramMepCost');
      const finCostEl = document.getElementById('paramFinCost');
      const genCostEl = document.getElementById('paramGenCost');

      if (effRateEl) effRateEl.innerText = currSym + effectiveRate.toFixed(2) + ' / SF';
      if (totalCostEl) totalCostEl.innerText = fmt(totalFeasibility);
      if (subCostEl) subCostEl.innerText = fmt(subCost);
      if (supCostEl) supCostEl.innerText = fmt(supCost);
      if (mepCostEl) mepCostEl.innerText = fmt(mepCost);
      if (finCostEl) finCostEl.innerText = fmt(finCost);
      if (genCostEl) genCostEl.innerText = fmt(genCost);

      // Keep calculated cache for 1-click push to BOQ
      this._lastParametric = {
        typology,
        area,
        quality,
        effectiveRate,
        totalFeasibility,
        trades: [
          { section: 'Div 02 - Sitework', itemNo: '02.10', description: 'Substructure & Foundation Works (Parametric)', qty: 1, unit: 'LS', matRate: subCost * 0.6, labRate: subCost * 0.35, equipRate: subCost * 0.05, totalRate: subCost, totalAmount: subCost },
          { section: 'Div 03 - Concrete', itemNo: '03.10', description: 'Superstructure Framing & Envelope (Parametric)', qty: 1, unit: 'LS', matRate: supCost * 0.65, labRate: supCost * 0.30, equipRate: supCost * 0.05, totalRate: supCost, totalAmount: supCost },
          { section: 'Div 22 - Plumbing', itemNo: '22.10', description: 'MEP Rough-Ins: Electrical & Plumbing (Parametric)', qty: 1, unit: 'LS', matRate: mepCost * 0.55, labRate: mepCost * 0.40, equipRate: mepCost * 0.05, totalRate: mepCost, totalAmount: mepCost },
          { section: 'Div 09 - Finishes', itemNo: '09.10', description: 'Interior Finishes, Drywall & Paint (Parametric)', qty: 1, unit: 'LS', matRate: finCost * 0.50, labRate: finCost * 0.45, equipRate: finCost * 0.05, totalRate: finCost, totalAmount: finCost },
          { section: 'Div 01 - General', itemNo: '01.10', description: 'General Conditions, Supervision & Permits (Parametric)', qty: 1, unit: 'LS', matRate: 0, labRate: genCost * 0.8, equipRate: genCost * 0.2, totalRate: genCost, totalAmount: genCost }
        ]
      };
    },

    pushParametricToBOQ: function () {
      if (!this._lastParametric) this.calcParametric();
      const p = this._lastParametric;
      if (!p) return;

      const activeProj = BuildEstimateStorage.getActiveProject();
      if (!activeProj) {
        alert('Please create or select an active project first.');
        this.openCreateProjectModal();
        return;
      }

      if (!Array.isArray(activeProj.boqItems)) activeProj.boqItems = [];

      if (activeProj.boqItems.length > 0) {
        if (!confirm(`Your active project already has ${activeProj.boqItems.length} BOQ item(s). Do you want to append these 5 parametric trades to the Bill of Quantities?`)) {
          return;
        }
      }

      p.trades.forEach(t => {
        activeProj.boqItems.push({
          id: 'boq-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          ...t
        });
      });

      BuildEstimateStorage.saveProject(activeProj);
      this.switchView('boq');
      if (window.BuildEstimateBOQ) BuildEstimateBOQ.render();
      alert('Parametric trade budget successfully transferred to BOQ Studio!');
    },

    // -------------------------------------------------------------
    // SAVED ESTIMATES & HISTORY (VIEW 9)
    // -------------------------------------------------------------
    renderHistoryView: function () {
      const historyTableBody = document.getElementById('historyTableBody');
      const badge = document.getElementById('historyCountBadge');
      if (!historyTableBody) return;

      const projects = BuildEstimateStorage.getProjects();
      const activeProj = BuildEstimateStorage.getActiveProject();

      const currSym = (activeProj && activeProj.currency === 'PKR') ? 'Rs ' :
                      (activeProj && activeProj.currency === 'EUR') ? '€' :
                      (activeProj && activeProj.currency === 'GBP') ? '£' :
                      (activeProj && activeProj.currency === 'AED') ? 'AED ' : '$';

      if (projects.length === 0) {
        historyTableBody.innerHTML = `
          <tr>
            <td colspan="7" class="py-12 text-center text-slate-400">
              <svg class="w-10 h-10 mx-auto text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <p class="font-bold text-slate-600">No Saved Estimates or Project Revisions Found</p>
              <p class="text-xs text-slate-400 mt-0.5">Calculations saved in Takeoffs or Project Studio will appear in this audit log.</p>
              <button onclick="BuildEstimateApp.switchView('takeoffs')" class="mt-4 px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700">Start Takeoff Estimate</button>
            </td>
          </tr>
        `;
        if (badge) badge.innerText = '0 Records';
        return;
      }

      if (badge) badge.innerText = `${projects.length} Saved Records`;

      historyTableBody.innerHTML = projects.map(p => {
        const estCount = (p.estimates || []).length;
        const boqCount = (p.boqItems || []).length;
        const totalVal = p.quotation?.grandTotal || 0;
        const matCost = p.quotation?.materialsCost || (totalVal * 0.42);
        const labCost = p.quotation?.labourCost || (totalVal * 0.28);
        const directCost = matCost + labCost;
        const dateStr = p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Active';

        return `
          <tr class="hover:bg-slate-50 transition border-b border-slate-100">
            <td class="py-3.5 px-4">
              <div class="font-bold text-slate-900">${p.name}</div>
              <div class="text-[11px] text-slate-400">${p.clientName} · ${p.projectType || 'Residential'} · ${estCount} Takeoffs · ${boqCount} BOQ Items</div>
            </td>
            <td class="py-3.5 px-4 text-slate-600 font-medium">${dateStr}</td>
            <td class="py-3.5 px-4 text-right font-semibold text-slate-700">${totalVal > 0 ? currSym + Math.round(directCost).toLocaleString('en-US') : '—'}</td>
            <td class="py-3.5 px-4 text-right font-semibold text-blue-700">${totalVal > 0 ? currSym + Math.round(matCost).toLocaleString('en-US') : '—'}</td>
            <td class="py-3.5 px-4 text-right font-semibold text-amber-700">${totalVal > 0 ? currSym + Math.round(labCost).toLocaleString('en-US') : '—'}</td>
            <td class="py-3.5 px-4 text-right font-black text-slate-900">${totalVal > 0 ? currSym + Math.round(totalVal).toLocaleString('en-US') : 'Draft'}</td>
            <td class="py-3.5 px-4 text-center">
              <div class="inline-flex items-center space-x-1.5">
                <button onclick="BuildEstimateApp.selectAndOpenProject('${p.id}')" title="Open Project" class="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 font-bold text-xs">Open →</button>
                <button onclick="BuildEstimateApp.deleteHistoryItem('${p.id}')" title="Delete Project" class="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    },

    deleteHistoryItem: function (id) {
      this.deleteProject(id);
      this.renderHistoryView();
    },

    // -------------------------------------------------------------
    // EXECUTIVE REPORTS & MATERIAL PROCUREMENT (VIEW 10)
    // -------------------------------------------------------------
    renderReportsView: function () {
      const banner = document.getElementById('reportsProjectSummaryBanner');
      const tableBody = document.getElementById('procurementOrderTableBody');
      if (!banner || !tableBody) return;

      const activeProj = BuildEstimateStorage.getActiveProject();
      if (!activeProj) {
        banner.innerHTML = `
          <div>
            <span class="font-bold">No Active Project Selected.</span>
            <span class="text-blue-800 ml-1">Select or create a project to aggregate procurement order schedules.</span>
          </div>
          <button onclick="BuildEstimateApp.openCreateProjectModal()" class="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 text-xs">+ Select Project</button>
        `;
        tableBody.innerHTML = `<tr><td colspan="6" class="py-10 text-center text-slate-400 font-medium">Please select an active project to view aggregated procurement requirements.</td></tr>`;
        return;
      }

      const currSym = (activeProj.currency === 'PKR') ? 'Rs ' :
                      (activeProj.currency === 'EUR') ? '€' :
                      (activeProj.currency === 'GBP') ? '£' :
                      (activeProj.currency === 'AED') ? 'AED ' : '$';

      const estCount = (activeProj.estimates || []).length;
      const boqCount = (activeProj.boqItems || []).length;
      const grandTotal = activeProj.quotation?.grandTotal || 0;

      banner.innerHTML = `
        <div class="flex items-center space-x-3">
          <div class="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm">
            ${(activeProj.name || 'P').charAt(0).toUpperCase()}
          </div>
          <div>
            <div class="font-bold text-slate-900 text-sm">${activeProj.name} <span class="ml-1 text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">${activeProj.status || 'Active'}</span></div>
            <div class="text-slate-500 text-[11px]">${activeProj.clientName} · ${activeProj.projectType || 'General'} · Scope: ${estCount} Takeoffs & ${boqCount} BOQ Items</div>
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <div class="text-right">
            <span class="block text-[10px] uppercase font-bold text-slate-400">Total Project Value</span>
            <span class="text-base font-black text-slate-900">${grandTotal > 0 ? currSym + Math.round(grandTotal).toLocaleString('en-US') : 'In Estimation'}</span>
          </div>
          <button onclick="BuildEstimateApp.switchView('quotations')" class="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold shadow-2xs">View Proposal →</button>
        </div>
      `;

      // Aggregate procurement items from BOQ and Takeoffs
      let procurementItems = [];

      if (Array.isArray(activeProj.boqItems) && activeProj.boqItems.length > 0) {
        activeProj.boqItems.forEach(item => {
          if (item.matRate > 0 || item.totalAmount > 0) {
            procurementItems.push({
              description: item.description,
              category: item.section || 'General Supply',
              qty: item.qty,
              unit: item.unit,
              rate: item.matRate > 0 ? item.matRate : (item.totalRate || 0),
              subtotal: (item.qty * (item.matRate > 0 ? item.matRate : item.totalRate)) || item.totalAmount
            });
          }
        });
      }

      // Default baseline procurement schedule if BOQ items haven't been added yet
      if (procurementItems.length === 0) {
        procurementItems = [
          { description: 'Portland Cement Type I/II (50kg Standard Sacks)', category: 'Div 03 - Concrete', qty: 185, unit: 'bags', rate: 11.50, subtotal: 2127.50 },
          { description: 'Washed Concrete Sand (Fine Aggregate ASTM C33)', category: 'Div 03 - Concrete', qty: 450, unit: 'cft', rate: 1.20, subtotal: 540.00 },
          { description: 'Crushed Coarse Aggregate Stone (3/4" Graded Bajri)', category: 'Div 03 - Concrete', qty: 890, unit: 'cft', rate: 1.45, subtotal: 1290.50 },
          { description: 'ASTM A615 Grade 60 #4 Deformed Rebar Reinforcement', category: 'Div 03 - Concrete', qty: 1750, unit: 'lbs', rate: 0.65, subtotal: 1137.50 },
          { description: '2x4 KD SPF Framing Lumber (96" Wall Studs)', category: 'Div 06 - Carpentry', qty: 240, unit: 'pcs', rate: 4.85, subtotal: 1164.00 },
          { description: '1/2" Tapered Edge Gypsum Drywall Panels (4ft x 8ft)', category: 'Div 09 - Finishes', qty: 120, unit: 'sheets', rate: 16.50, subtotal: 1980.00 },
          { description: 'Interior Acrylic Latex Low-VOC Finish Paint', category: 'Div 09 - Finishes', qty: 18, unit: 'gallons', rate: 42.00, subtotal: 756.00 }
        ];
      }

      this._currentProcurementItems = procurementItems;

      tableBody.innerHTML = procurementItems.map(item => {
        return `
          <tr class="hover:bg-slate-50 transition border-b border-slate-100">
            <td class="py-3 px-4 font-semibold text-slate-800">${item.description}</td>
            <td class="py-3 px-4"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">${item.category}</span></td>
            <td class="py-3 px-4 text-right font-black text-slate-900">${typeof item.qty === 'number' ? item.qty.toLocaleString('en-US', { maximumFractionDigits: 1 }) : item.qty}</td>
            <td class="py-3 px-4 text-center font-bold text-slate-500 uppercase text-[10px]">${item.unit}</td>
            <td class="py-3 px-4 text-right font-semibold text-slate-600">${currSym + Number(item.rate).toFixed(2)}</td>
            <td class="py-3 px-4 text-right font-black text-blue-700">${currSym + Math.round(item.subtotal).toLocaleString('en-US')}</td>
          </tr>
        `;
      }).join('');
    },

    exportProcurementCSV: function () {
      if (!this._currentProcurementItems || this._currentProcurementItems.length === 0) {
        this.renderReportsView();
      }
      const items = this._currentProcurementItems || [];
      if (items.length === 0) {
        alert('No procurement items available to export.');
        return;
      }

      const activeProj = BuildEstimateStorage.getActiveProject();
      const projName = activeProj ? activeProj.name.replace(/[^a-zA-Z0-9]/g, '_') : 'Project';

      let csv = 'Material Description,Trade Category,Required Quantity,Unit,Estimated Unit Rate,Procurement Subtotal\n';
      items.forEach(it => {
        const desc = `"${(it.description || '').replace(/"/g, '""')}"`;
        const cat = `"${(it.category || '').replace(/"/g, '""')}"`;
        csv += `${desc},${cat},${it.qty},${it.unit},${it.rate},${it.subtotal}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Procurement_Schedule_${projName}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },

    // -------------------------------------------------------------
    // WORKSPACE & COMPANY SETTINGS (VIEW 14)
    // -------------------------------------------------------------
    renderSettingsView: function () {
      const s = BuildEstimateStorage.getSettings();
      const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el && val !== undefined && val !== null) el.value = val;
      };

      setVal('settingCompanyName', s.companyName);
      setVal('settingEstimatorName', s.estimatorName);
      setVal('settingPhone', s.phone);
      setVal('settingEmail', s.email);
      setVal('settingAddress', s.address);
      setVal('settingProfitMode', s.profitCalculationMode || 'markup');
      setVal('settingProfitPct', s.defaultProfitMargin !== undefined ? s.defaultProfitMargin : 20);
      setVal('settingTaxPct', s.defaultTaxRate !== undefined ? s.defaultTaxRate : 8.5);
    },

    saveSettingsFromUI: function () {
      const getVal = (id) => {
        const el = document.getElementById(id);
        return el ? el.value : '';
      };

      const updated = {
        companyName: getVal('settingCompanyName'),
        estimatorName: getVal('settingEstimatorName'),
        phone: getVal('settingPhone'),
        email: getVal('settingEmail'),
        address: getVal('settingAddress'),
        profitCalculationMode: getVal('settingProfitMode') || 'markup',
        defaultProfitMargin: parseFloat(getVal('settingProfitPct')) || 20,
        defaultTaxRate: parseFloat(getVal('settingTaxPct')) || 0
      };

      BuildEstimateStorage.saveSettings(updated);
      alert('Workspace & Company Settings saved successfully!');
    }
  };

  global.BuildEstimateApp = App;

})(typeof window !== 'undefined' ? window : this);
