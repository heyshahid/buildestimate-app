/**
 * BuildEstimate Pro 2.0 - Local-First Data Storage & Project Management Service
 * 
 * Manages persistent projects, multi-tier takeoffs, material price catalogs,
 * crew rates, equipment rates, and automatically migrates legacy estimates.
 */

(function (global) {
  'use strict';

  const STORAGE_KEYS = {
    PROJECTS: 'buildestimate_v2_projects',
    ACTIVE_PROJECT_ID: 'buildestimate_v2_active_proj',
    MATERIALS: 'buildestimate_v2_materials',
    CREWS: 'buildestimate_v2_crews',
    EQUIPMENT: 'buildestimate_v2_equipment',
    SUPPLIERS: 'buildestimate_v2_suppliers',
    SETTINGS: 'buildestimate_v2_settings',
    LEGACY_HISTORY: 'buildestimate_history'
  };

  const DEFAULT_SETTINGS = {
    companyName: 'Apex Construction & Engineering Services',
    estimatorName: 'Shahid Akram',
    estimatorTitle: 'Senior Quantity Surveyor / Project Estimator',
    companyAddress: 'Suite 400, Commercial Avenue, City Hub',
    companyEmail: 'contact@apexbuilt.com',
    companyPhone: '+1 (555) 019-2834',
    taxRegistrationNumber: 'TRN-984729104',
    brandColor: '#2563EB',
    defaultCurrency: 'USD',
    defaultRegion: 'us',
    defaultLanguage: 'en',
    profitMode: 'markup', // 'markup' or 'margin'
    defaultProfitMargin: 20.0,
    defaultContingency: 5.0,
    defaultTax: 8.5
  };

  // Verified Local Suppliers Sample Templates (Clearly labeled demo data for initial exploration)
  const SAMPLE_SUPPLIERS = [
    {
      id: 'sup-1',
      name: 'Metro Ready-Mix Concrete Co.',
      category: 'Ready-Mix Batch Plant',
      contactPerson: 'Dave Miller (Dispatch)',
      phone: '+1 (555) 234-8901',
      email: 'dispatch@metroreadymix.example.com',
      location: 'Industrial Sector 4, Metro Area',
      deliveryRadius: '25 miles (40 km)',
      paymentTerms: 'Net 30',
      notes: 'Standard 3000-4000 PSI ready-mix concrete. Transit mixer fleet available on 24-hour advance booking.',
      isSample: true
    },
    {
      id: 'sup-2',
      name: 'Builders First Lumber Yard',
      category: 'Lumber & Framing',
      contactPerson: 'Sarah Jenkins',
      phone: '+1 (555) 872-1094',
      email: 'orders@buildersfirst.example.com',
      location: 'West Highway Commercial Park',
      deliveryRadius: '35 miles (55 km)',
      paymentTerms: 'COD / Net 15',
      notes: 'KD SPF 2x4 & 2x6 studs, LVL engineered beams, 1/2" CDX plywood sheathing. 5% contractor trade discount on bundled framing orders.',
      isSample: true
    },
    {
      id: 'sup-3',
      name: 'Apex Rebar & Fabricators',
      category: 'Steel Reinforcement',
      contactPerson: 'Tariq Mahmood',
      phone: '+1 (555) 438-9201',
      email: 'sales@apexrebar.example.com',
      location: 'Heavy Industrial Zone, Dock Road',
      deliveryRadius: '50 miles (80 km)',
      paymentTerms: 'Net 30',
      notes: 'ASTM A615 Grade 60 (#3 to #8 rebar). In-house automated shear line for pre-bent stirrups, ties, and custom column cages.',
      isSample: true
    }
  ];

  // High-value realistic Demo Project for 1-click exploration (Clearly labeled sample)
  const DEMO_PROJECT = {
    id: 'demo-hillside-villa',
    ref: 'BE-2026-0842',
    name: '[Sample Demo] Hillside Modern Residence - 2 Story RCC Villa',
    isDemo: true,
    clientName: 'Alexander & Elena Vance',
    clientContact: '+1 (555) 482-9102 / vance.residence@gmail.com',
    address: 'Lot 14, Crestview Estates, Highland Valley',
    country: 'US',
    region: 'us',
    projectType: 'residential',
    currency: 'USD',
    measurementSystem: 'imperial',
    standard: 'ACI 318 / IBC (Imperial)',
    startDate: '2026-11-20',
    completionDate: '2027-05-30',
    status: 'active',
    notes: '[SAMPLE DEMO DATA] 2-story luxury residential structure featuring monolithic grade-beam foundation slab, 2x4 SPF framing, 1/2" Type X drywall, and premium elastomeric exterior coating. For demonstration only; actual quantities require structural engineer sign-off.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    estimates: [
      {
        id: 'est-conc-01',
        title: 'Foundation Slab & Perimeter Footings',
        module: 'concrete',
        date: new Date().toISOString(),
        summary: '40ft x 30ft x 6in monolithic foundation slab with 10% waste',
        metrics: {
          length: 40,
          width: 30,
          thickness: 6,
          waste: 10,
          cubicYards: 24.44,
          cubicMeters: 18.69,
          readyMixTrucks: 3,
          rebarLinearFt: 1850,
          rebar20ftSticks: 93,
          wireTies: 576,
          supportChairs: 144
        },
        costs: {
          materialCost: 4850.00,
          laborCost: 1650.00,
          equipmentCost: 450.00,
          subtotal: 6950.00
        }
      },
      {
        id: 'est-frame-01',
        title: 'Ground & Upper Level Interior Wall Framing',
        module: 'framing',
        date: new Date().toISOString(),
        summary: '280 LF perimeter & interior partitions @ 16" OC stud spacing',
        metrics: {
          wallLengthFt: 280,
          wallHeightFt: 9,
          doors: 8,
          windows: 10,
          totalStuds: 312,
          plates16ft: 53,
          drywallSheets: 174
        },
        costs: {
          materialCost: 5420.00,
          laborCost: 2800.00,
          equipmentCost: 200.00,
          subtotal: 8420.00
        }
      },
      {
        id: 'est-paint-01',
        title: 'Complete Interior & Ceiling Paint Coating',
        module: 'paint',
        date: new Date().toISOString(),
        summary: 'Interior walls and ceilings (2 finish coats + 1 PVA primer coat)',
        metrics: {
          totalSqft: 4650,
          finishCoats: 2,
          primerCoats: 1,
          finishGallons: 27.8,
          fiveGalBuckets: 5,
          oneGalCans: 3
        },
        costs: {
          materialCost: 1680.00,
          laborCost: 1950.00,
          equipmentCost: 120.00,
          subtotal: 3750.00
        }
      }
    ],
    boqItems: [
      { id: 'boq-01', section: 'Div 02 - Sitework', itemNo: '02.10', description: 'Excavation of foundation trenches & surface grading', qty: 120, unit: 'yd³', matRate: 0, labRate: 18.50, equipRate: 14.00, totalRate: 32.50, totalAmount: 3900.00 },
      { id: 'boq-02', section: 'Div 03 - Concrete', itemNo: '03.20', description: 'Supply & pour 3,500 PSI ready-mix monolithic foundation slab', qty: 24.5, unit: 'yd³', matRate: 155.00, labRate: 42.00, equipRate: 15.00, totalRate: 212.00, totalAmount: 5194.00 },
      { id: 'boq-03', section: 'Div 03 - Concrete', itemNo: '03.30', description: 'ASTM A615 Grade 60 #4 (1/2") deformed rebar reinforcement grid', qty: 1850, unit: 'LF', matRate: 0.65, labRate: 0.45, equipRate: 0.05, totalRate: 1.15, totalAmount: 2127.50 },
      { id: 'boq-04', section: 'Div 06 - Carpentry', itemNo: '06.10', description: '2x4 SPF wall stud framing @ 16" OC including top/bottom plates', qty: 280, unit: 'LF', matRate: 9.80, labRate: 8.50, equipRate: 0.80, totalRate: 19.10, totalAmount: 5348.00 },
      { id: 'boq-05', section: 'Div 09 - Finishes', itemNo: '09.20', description: '1/2" Gypsum drywall hanging, taped, and mudded (Level 4 Finish)', qty: 174, unit: 'sheet', matRate: 18.50, labRate: 16.00, equipRate: 0.50, totalRate: 35.00, totalAmount: 6090.00 },
      { id: 'boq-06', section: 'Div 09 - Finishes', itemNo: '09.90', description: 'Premium low-VOC interior latex paint (1 primer coat + 2 finish coats)', qty: 4650, unit: 'sq ft', matRate: 0.38, labRate: 0.45, equipRate: 0.05, totalRate: 0.88, totalAmount: 4092.00 }
    ],
    quotation: {
      refNumber: 'Q-2026-0842',
      date: '2026-11-11',
      validityDays: 30,
      materialsSubtotal: 13630.00,
      laborSubtotal: 9200.00,
      equipmentSubtotal: 1400.00,
      subcontractorSubtotal: 2500.00,
      directTotal: 26730.00,
      contingencyPercent: 5.0,
      contingencyAmount: 1336.50,
      profitMode: 'markup',
      profitPercent: 20.0,
      profitAmount: 5613.30,
      preTaxTotal: 33679.80,
      taxPercent: 6.5,
      taxAmount: 2189.19,
      grandTotal: 35868.99,
      status: 'submitted'
    }
  };

  const Storage = {
    // 1. SETTINGS
    getSettings: function () {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (!raw) return { ...DEFAULT_SETTINGS };
        return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
      } catch (e) {
        return { ...DEFAULT_SETTINGS };
      }
    },

    saveSettings: function (newSettings) {
      try {
        const current = this.getSettings();
        const merged = { ...current, ...newSettings };
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent('buildestimate-settings-changed', { detail: merged }));
        return merged;
      } catch (e) {
        console.error('Failed to save settings:', e);
        return null;
      }
    },

    // 2. PROJECTS MANAGEMENT
    getProjects: function () {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
        if (!raw) {
          // Check for legacy estimates to migrate
          this.migrateLegacyHistory();
          const afterMigrate = localStorage.getItem(STORAGE_KEYS.PROJECTS);
          return afterMigrate ? JSON.parse(afterMigrate) : [];
        }
        return JSON.parse(raw);
      } catch (e) {
        console.error('Failed to parse projects:', e);
        return [];
      }
    },

    getProject: function (id) {
      const projects = this.getProjects();
      return projects.find(p => p.id === id) || null;
    },

    saveProject: function (project) {
      try {
        const projects = this.getProjects();
        const idx = projects.findIndex(p => p.id === project.id);
        const updated = {
          ...project,
          updatedAt: new Date().toISOString()
        };

        if (idx !== -1) {
          projects[idx] = updated;
        } else {
          updated.createdAt = updated.createdAt || new Date().toISOString();
          projects.unshift(updated);
        }

        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
        window.dispatchEvent(new CustomEvent('buildestimate-project-updated', { detail: updated }));
        return updated;
      } catch (e) {
        console.error('Failed to save project:', e);
        return null;
      }
    },

    deleteProject: function (id) {
      try {
        let projects = this.getProjects();
        projects = projects.filter(p => p.id !== id);
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
        
        // If active project was deleted, switch to first available
        if (this.getActiveProjectId() === id) {
          const nextId = projects.length > 0 ? projects[0].id : null;
          this.setActiveProjectId(nextId);
        }

        window.dispatchEvent(new CustomEvent('buildestimate-project-deleted', { detail: id }));
        return true;
      } catch (e) {
        console.error('Failed to delete project:', e);
        return false;
      }
    },

    duplicateProject: function (id) {
      const original = this.getProject(id);
      if (!original) return null;

      const duplicate = JSON.parse(JSON.stringify(original));
      duplicate.id = 'proj-' + Date.now();
      duplicate.ref = 'BE-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
      duplicate.name = original.name + ' (Copy)';
      duplicate.status = 'draft';
      duplicate.createdAt = new Date().toISOString();
      duplicate.updatedAt = new Date().toISOString();

      return this.saveProject(duplicate);
    },

    archiveProject: function (id) {
      const p = this.getProject(id);
      if (!p) return null;
      p.status = 'archived';
      return this.saveProject(p);
    },

    // 3. ACTIVE PROJECT CONTEXT
    getActiveProjectId: function () {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_PROJECT_ID) || null;
    },

    getActiveProject: function () {
      const activeId = this.getActiveProjectId();
      if (activeId) {
        const found = this.getProject(activeId);
        if (found) return found;
      }
      const projects = this.getProjects();
      if (projects.length > 0) {
        this.setActiveProjectId(projects[0].id);
        return projects[0];
      }
      return null;
    },

    setActiveProjectId: function (id) {
      if (!id) {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_PROJECT_ID);
      } else {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT_ID, id);
      }
      window.dispatchEvent(new CustomEvent('buildestimate-active-project-changed', { detail: id }));
    },

    // 4. DEMO PROJECT LOADER / CLEAR
    loadDemoProject: function () {
      this.saveProject({ ...DEMO_PROJECT });
      this.setActiveProjectId(DEMO_PROJECT.id);
      window.dispatchEvent(new CustomEvent('buildestimate-demo-loaded'));
      return DEMO_PROJECT;
    },

    clearAllData: function () {
      if (confirm('WARNING: Are you sure you want to completely erase all local project data, estimates, and custom materials? This action CANNOT be undone. Please ensure you have downloaded a Backup first.')) {
        localStorage.removeItem(STORAGE_KEYS.PROJECTS);
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_PROJECT_ID);
        localStorage.removeItem(STORAGE_KEYS.MATERIALS);
        localStorage.removeItem(STORAGE_KEYS.SUPPLIERS);
        localStorage.removeItem(STORAGE_KEYS.SETTINGS);
        window.dispatchEvent(new CustomEvent('buildestimate-storage-cleared'));
        window.location.reload();
      }
    },

    // SUPPLIERS MANAGEMENT
    getSuppliers: function () {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        console.error('Failed to parse suppliers:', e);
        return [];
      }
    },

    saveSupplier: function (supplier) {
      try {
        const suppliers = this.getSuppliers();
        const idx = suppliers.findIndex(s => s.id === supplier.id);
        const updated = {
          ...supplier,
          updatedAt: new Date().toISOString()
        };
        if (idx !== -1) {
          suppliers[idx] = updated;
        } else {
          updated.createdAt = updated.createdAt || new Date().toISOString();
          suppliers.unshift(updated);
        }
        localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
        window.dispatchEvent(new CustomEvent('buildestimate-suppliers-updated', { detail: updated }));
        return updated;
      } catch (e) {
        console.error('Failed to save supplier:', e);
        return null;
      }
    },

    deleteSupplier: function (id) {
      try {
        let suppliers = this.getSuppliers();
        suppliers = suppliers.filter(s => s.id !== id);
        localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
        window.dispatchEvent(new CustomEvent('buildestimate-suppliers-updated', { detail: id }));
        return true;
      } catch (e) {
        console.error('Failed to delete supplier:', e);
        return false;
      }
    },

    loadSampleSuppliers: function () {
      localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(SAMPLE_SUPPLIERS));
      window.dispatchEvent(new CustomEvent('buildestimate-suppliers-updated'));
      return SAMPLE_SUPPLIERS;
    },

    // 5. DATA OWNERSHIP: FULL WORKSPACE BACKUP & RESTORE
    createBackupPayload: function () {
      return {
        app: 'BuildEstimate Pro',
        version: '2.0.0',
        exportedAt: new Date().toISOString(),
        settings: this.getSettings(),
        projects: this.getProjects(),
        activeProjectId: this.getActiveProjectId(),
        suppliers: this.getSuppliers(),
        materials: JSON.parse(localStorage.getItem(STORAGE_KEYS.MATERIALS) || '[]')
      };
    },

    downloadBackupFile: function () {
      try {
        const payload = this.createBackupPayload();
        const jsonStr = JSON.stringify(payload, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
        const link = document.createElement('a');
        const filename = `BuildEstimate_Workspace_Backup_${new Date().toISOString().slice(0, 10)}.json`;
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return true;
      } catch (err) {
        console.error('Failed to create backup:', err);
        alert('Error creating backup file: ' + err.message);
        return false;
      }
    },

    restoreFromBackup: function (jsonString) {
      try {
        const data = JSON.parse(jsonString);
        if (!data || !Array.isArray(data.projects)) {
          throw new Error('Invalid backup file format. Must contain a valid projects array.');
        }

        const projectCount = data.projects.length;
        if (!confirm(`Restore confirmation: This backup contains ${projectCount} project(s) and workspace settings from ${data.exportedAt || 'previous backup'}. Do you want to proceed and merge/restore this workspace?`)) {
          return false;
        }

        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(data.projects));
        if (data.settings) {
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
        }
        if (Array.isArray(data.materials) && data.materials.length > 0) {
          localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(data.materials));
        }
        if (Array.isArray(data.suppliers) && data.suppliers.length > 0) {
          localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(data.suppliers));
        }
        if (data.activeProjectId) {
          localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT_ID, data.activeProjectId);
        } else if (data.projects.length > 0) {
          localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT_ID, data.projects[0].id);
        }

        alert(`Workspace successfully restored with ${projectCount} project(s)!`);
        window.location.reload();
        return true;
      } catch (err) {
        console.error('Failed to restore backup:', err);
        alert('Failed to restore workspace backup: ' + err.message);
        return false;
      }
    },

    exportSingleProject: function (id) {
      const project = this.getProject(id);
      if (!project) return;
      const jsonStr = JSON.stringify(project, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      const filename = `Project_${(project.ref || 'PROJ')}_${project.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    // 6. BACKWARD-COMPATIBLE MIGRATION FROM LEGACY ESTIMATE HISTORY
    migrateLegacyHistory: function () {
      try {
        const legacyRaw = localStorage.getItem(STORAGE_KEYS.LEGACY_HISTORY);
        if (!legacyRaw) return;

        const legacyItems = JSON.parse(legacyRaw);
        if (!Array.isArray(legacyItems) || legacyItems.length === 0) return;

        const existingProjects = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]');
        if (existingProjects.length > 0) return; // Already initialized

        // Convert legacy items into a structured project
        const migratedProject = {
          id: 'proj-migrated-01',
          ref: 'BE-MIGRATED',
          name: 'Migrated Historical Estimates',
          clientName: 'Various Clients',
          clientContact: '',
          address: 'Archived Jobsites',
          country: 'US',
          region: 'us',
          projectType: 'residential',
          currency: legacyItems[0]?.currency || 'USD',
          measurementSystem: 'imperial',
          standard: 'ACI 318 / IBC',
          status: 'completed',
          notes: 'Automatically migrated from BuildEstimate Pro v1.0 local history.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          estimates: legacyItems.map((item, idx) => ({
            id: 'migrated-est-' + idx,
            title: item.projectName || ('Estimate #' + (idx + 1)),
            client: item.clientName || 'Direct Client',
            date: item.date || new Date().toISOString(),
            costs: {
              materialCost: item.materials || 0,
              laborCost: item.labor || 0,
              subcontractorCost: item.subcontractors || 0,
              subtotal: item.directCosts || 0,
              finalPrice: item.finalPrice || 0
            }
          })),
          boqItems: []
        };

        existingProjects.push(migratedProject);
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(existingProjects));
        this.setActiveProjectId(migratedProject.id);
        console.log('Successfully migrated', legacyItems.length, 'historical estimates into project workspace.');
      } catch (err) {
        console.warn('Legacy migration notice:', err);
      }
    }
  };

  // Export to global scope
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Storage;
  } else {
    global.BuildEstimateStorage = Storage;
  }

})(typeof window !== 'undefined' ? window : this);
