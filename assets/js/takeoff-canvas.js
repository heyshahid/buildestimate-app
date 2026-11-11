/**
 * BuildEstimate Pro 2.0 - Digital Blueprint & Drawing Takeoff Canvas Engine
 * 
 * Provides interactive CAD/PDF plan measurement, scale calibration,
 * polygon area calculation, polyline wall run takeoff, and direct integration
 * into Concrete, Framing, and Bill of Quantities (BOQ) modules.
 */

(function (global) {
  'use strict';

  const DrawingTakeoff = {
    canvas: null,
    ctx: null,
    mode: 'pan', // 'pan', 'calibrate', 'area', 'linear', 'count'
    scaleRatio: 25.0, // pixels per foot (default until calibrated)
    unit: 'ft', // 'ft' or 'm'
    
    // Pan & Zoom transform state
    zoom: 1.0,
    panX: 0,
    panY: 0,
    isPanning: false,
    startX: 0,
    startY: 0,

    // Active drawing in-progress points
    activePoints: [],
    calibrationPoints: [],
    
    // Completed measurements list
    measurements: [
      { id: 'm-01', name: 'Main Foundation Slab', type: 'area', color: '#2563EB', valueSqFt: 1200, valueSqM: 111.48, points: [] },
      { id: 'm-02', name: 'Exterior 2x6 Framing Perimeter', type: 'linear', color: '#EA580C', valueLF: 140, valueM: 42.67, points: [] },
      { id: 'm-03', name: 'Interior Partition Walls', type: 'linear', color: '#16A34A', valueLF: 95, valueM: 28.96, points: [] },
      { id: 'm-04', name: 'Structural Column Footings', type: 'count', color: '#7C3AED', count: 6, points: [] }
    ],

    currentImage: null,

    init: function () {
      this.canvas = document.getElementById('takeoffPlanCanvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');

      this.resizeCanvas();
      this.bindEvents();
      this.loadSampleFloorplan();
      this.renderMeasurementsTable();
      this.updateScaleLabel();
    },

    resizeCanvas: function () {
      if (!this.canvas) return;
      const rect = this.canvas.parentElement.getBoundingClientRect();
      this.canvas.width = Math.max(800, rect.width || 800);
      this.canvas.height = 550;
      this.redraw();
    },

    bindEvents: function () {
      if (!this.canvas) return;

      window.addEventListener('resize', () => this.resizeCanvas());

      this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
      this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
      this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
      this.canvas.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
      this.canvas.addEventListener('dblclick', (e) => this.onDoubleClick(e));

      const fileInput = document.getElementById('blueprintFileInput');
      if (fileInput) {
        fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
      }
    },

    setMode: function (newMode) {
      this.mode = newMode;
      this.activePoints = [];
      this.calibrationPoints = [];

      const buttons = document.querySelectorAll('.takeoff-tool-btn');
      buttons.forEach(btn => {
        if (btn.getAttribute('data-tool') === newMode) {
          btn.className = 'takeoff-tool-btn px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-2xs transition';
        } else {
          btn.className = 'takeoff-tool-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition';
        }
      });

      const helperEl = document.getElementById('takeoffInstructionBar');
      if (helperEl) {
        const guide = {
          'pan': 'Navigation Mode: Click and drag to pan across the blueprint. Use mouse wheel to zoom in/out.',
          'calibrate': 'Calibration: Click Point A, then Point B along a known dimension line to set the exact scale.',
          'area': 'Area Takeoff: Click each room corner to draw a polygon. Double-click or click first point to close and calculate Area (SF / m²).',
          'linear': 'Linear Run: Click points along walls or footing trenches. Double-click to complete line and calculate Linear Feet (LF / m).',
          'count': 'Item Count: Click anywhere on the drawing to drop a numbered marker pin (doors, windows, fixtures, columns).'
        }[newMode] || '';
        helperEl.innerText = guide;
      }

      this.redraw();
    },

    getCanvasCoordinates: function (e) {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      // Convert screen pixels to blueprint world coordinates accounting for pan and zoom
      const worldX = (clientX - this.panX) / this.zoom;
      const worldY = (clientY - this.panY) / this.zoom;
      return { x: worldX, y: worldY, screenX: clientX, screenY: clientY };
    },

    onMouseDown: function (e) {
      const pos = this.getCanvasCoordinates(e);

      if (this.mode === 'pan' || e.button === 1 || e.shiftKey) {
        this.isPanning = true;
        this.startX = e.clientX - this.panX;
        this.startY = e.clientY - this.panY;
        this.canvas.style.cursor = 'grabbing';
        return;
      }

      if (this.mode === 'calibrate') {
        this.calibrationPoints.push({ x: pos.x, y: pos.y });
        if (this.calibrationPoints.length === 2) {
          this.finishCalibration();
        } else {
          this.redraw();
        }
        return;
      }

      if (this.mode === 'area' || this.mode === 'linear') {
        // If clicking near first point in area mode, close polygon
        if (this.mode === 'area' && this.activePoints.length >= 3) {
          const first = this.activePoints[0];
          const dist = Math.hypot(pos.x - first.x, pos.y - first.y);
          if (dist < 15 / this.zoom) {
            this.finishAreaMeasurement();
            return;
          }
        }
        this.activePoints.push({ x: pos.x, y: pos.y });
        this.redraw();
        return;
      }

      if (this.mode === 'count') {
        const name = prompt('Enter label for this item marker (e.g., Column C1, Entry Door, Window W1):', 'Mark Point');
        if (name) {
          this.measurements.push({
            id: 'm-' + Date.now(),
            name: name,
            type: 'count',
            color: '#7C3AED',
            count: 1,
            point: { x: pos.x, y: pos.y }
          });
          this.renderMeasurementsTable();
          this.redraw();
        }
      }
    },

    onMouseMove: function (e) {
      if (this.isPanning) {
        this.panX = e.clientX - this.startX;
        this.panY = e.clientY - this.startY;
        this.redraw();
        return;
      }

      // If drawing polygon or linear, preview rubber-band line
      if (this.activePoints.length > 0) {
        this.currentHoverPos = this.getCanvasCoordinates(e);
        this.redraw();
      }
    },

    onMouseUp: function () {
      if (this.isPanning) {
        this.isPanning = false;
        this.canvas.style.cursor = 'crosshair';
      }
    },

    onWheel: function (e) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Zoom towards mouse pointer
      this.panX = mouseX - (mouseX - this.panX) * zoomFactor;
      this.panY = mouseY - (mouseY - this.panY) * zoomFactor;
      this.zoom *= zoomFactor;
      this.zoom = Math.max(0.2, Math.min(this.zoom, 5.0));

      this.redraw();
    },

    onDoubleClick: function () {
      if (this.mode === 'area' && this.activePoints.length >= 3) {
        this.finishAreaMeasurement();
      } else if (this.mode === 'linear' && this.activePoints.length >= 2) {
        this.finishLinearMeasurement();
      }
    },

    finishCalibration: function () {
      const p1 = this.calibrationPoints[0];
      const p2 = this.calibrationPoints[1];
      const pixelDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

      const realDistStr = prompt('Enter the real-world distance between the two calibration points (e.g., 20.0 for 20 feet):', '20.0');
      const realDist = parseFloat(realDistStr);

      if (realDist && realDist > 0) {
        this.scaleRatio = pixelDist / realDist;
        this.updateScaleLabel();
        alert(`Scale Calibrated: 1 ${this.unit} = ${this.scaleRatio.toFixed(2)} px.`);
      }

      this.calibrationPoints = [];
      this.setMode('area');
    },

    updateScaleLabel: function () {
      const el = document.getElementById('takeoffScaleBadge');
      if (el) {
        el.innerText = `Scale: 1 ${this.unit} = ${this.scaleRatio.toFixed(1)} px`;
      }
    },

    finishAreaMeasurement: function () {
      if (this.activePoints.length < 3) return;

      // Compute polygon area in square pixels via Shoelace formula
      let pixelArea = 0;
      const n = this.activePoints.length;
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        pixelArea += this.activePoints[i].x * this.activePoints[j].y;
        pixelArea -= this.activePoints[j].x * this.activePoints[i].y;
      }
      pixelArea = Math.abs(pixelArea) / 2.0;

      // Convert to real world area
      const realAreaSqFt = pixelArea / (this.scaleRatio * this.scaleRatio);
      const realAreaSqM = realAreaSqFt * 0.092903;

      const name = prompt('Enter name for this Area Takeoff:', `Slab Area #${this.measurements.length + 1}`);
      if (name) {
        this.measurements.push({
          id: 'm-' + Date.now(),
          name: name,
          type: 'area',
          color: '#2563EB',
          valueSqFt: Math.round(realAreaSqFt * 10) / 10,
          valueSqM: Math.round(realAreaSqM * 10) / 10,
          points: [...this.activePoints]
        });
        this.renderMeasurementsTable();
      }

      this.activePoints = [];
      this.redraw();
    },

    finishLinearMeasurement: function () {
      if (this.activePoints.length < 2) return;

      let pixelLength = 0;
      for (let i = 0; i < this.activePoints.length - 1; i++) {
        pixelLength += Math.hypot(
          this.activePoints[i+1].x - this.activePoints[i].x,
          this.activePoints[i+1].y - this.activePoints[i].y
        );
      }

      const realLengthLF = pixelLength / this.scaleRatio;
      const realLengthM = realLengthLF * 0.3048;

      const name = prompt('Enter name for this Linear Takeoff:', `Wall Run #${this.measurements.length + 1}`);
      if (name) {
        this.measurements.push({
          id: 'm-' + Date.now(),
          name: name,
          type: 'linear',
          color: '#EA580C',
          valueLF: Math.round(realLengthLF * 10) / 10,
          valueM: Math.round(realLengthM * 10) / 10,
          points: [...this.activePoints]
        });
        this.renderMeasurementsTable();
      }

      this.activePoints = [];
      this.redraw();
    },

    // Rendering Engine
    redraw: function () {
      if (!this.ctx || !this.canvas) return;

      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Background Blueprint Grid
      ctx.save();
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // Apply Pan & Zoom Transform
      ctx.translate(this.panX, this.panY);
      ctx.scale(this.zoom, this.zoom);

      // Draw loaded blueprint image or sample floorplan
      if (this.currentImage) {
        ctx.drawImage(this.currentImage, 0, 0);
      } else {
        this.drawSampleVectorPlan(ctx);
      }

      // Draw saved measurements
      this.measurements.forEach(m => {
        if (m.type === 'area' && m.points && m.points.length > 2) {
          ctx.beginPath();
          ctx.moveTo(m.points[0].x, m.points[0].y);
          for (let i = 1; i < m.points.length; i++) {
            ctx.lineTo(m.points[i].x, m.points[i].y);
          }
          ctx.closePath();
          ctx.fillStyle = m.color + '4D'; // 30% transparency
          ctx.fill();
          ctx.lineWidth = 2.5 / this.zoom;
          ctx.strokeStyle = m.color;
          ctx.stroke();

          // Label center
          const cx = m.points.reduce((s, p) => s + p.x, 0) / m.points.length;
          const cy = m.points.reduce((s, p) => s + p.y, 0) / m.points.length;
          ctx.fillStyle = '#FFFFFF';
          ctx.font = `bold ${12 / this.zoom}px sans-serif`;
          ctx.fillText(`${m.name}: ${m.valueSqFt} SF`, cx - 30, cy);
        } else if (m.type === 'linear' && m.points && m.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(m.points[0].x, m.points[0].y);
          for (let i = 1; i < m.points.length; i++) {
            ctx.lineTo(m.points[i].x, m.points[i].y);
          }
          ctx.lineWidth = 3.5 / this.zoom;
          ctx.strokeStyle = m.color;
          ctx.stroke();

          // End dot
          m.points.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4 / this.zoom, 0, Math.PI * 2);
            ctx.fillStyle = m.color;
            ctx.fill();
          });
        } else if (m.type === 'count' && m.point) {
          ctx.beginPath();
          ctx.arc(m.point.x, m.point.y, 8 / this.zoom, 0, Math.PI * 2);
          ctx.fillStyle = m.color;
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2 / this.zoom;
          ctx.stroke();
          ctx.fillStyle = '#FFFFFF';
          ctx.font = `bold ${10 / this.zoom}px sans-serif`;
          ctx.fillText(m.name, m.point.x + 10 / this.zoom, m.point.y + 4 / this.zoom);
        }
      });

      // Draw active in-progress drawing points
      if (this.activePoints.length > 0) {
        ctx.beginPath();
        ctx.moveTo(this.activePoints[0].x, this.activePoints[0].y);
        for (let i = 1; i < this.activePoints.length; i++) {
          ctx.lineTo(this.activePoints[i].x, this.activePoints[i].y);
        }
        if (this.currentHoverPos) {
          ctx.lineTo(this.currentHoverPos.x, this.currentHoverPos.y);
        }
        ctx.lineWidth = 2 / this.zoom;
        ctx.strokeStyle = '#38BDF8';
        ctx.setLineDash([4 / this.zoom, 4 / this.zoom]);
        ctx.stroke();
        ctx.setLineDash([]);

        this.activePoints.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4 / this.zoom, 0, Math.PI * 2);
          ctx.fillStyle = '#F59E0B';
          ctx.fill();
        });
      }

      // Draw calibration points
      if (this.calibrationPoints.length > 0) {
        this.calibrationPoints.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 6 / this.zoom, 0, Math.PI * 2);
          ctx.fillStyle = '#EC4899';
          ctx.fill();
        });
      }

      ctx.restore();
    },

    drawSampleVectorPlan: function (ctx) {
      // Crisp Architectural Sample Floorplan (40ft x 30ft Villa)
      ctx.save();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#334155';
      
      // Blueprint grid background lines
      for (let x = 0; x <= 1000; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 700);
        ctx.stroke();
      }
      for (let y = 0; y <= 700; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1000, y);
        ctx.stroke();
      }

      // Exterior Walls (White double line)
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 4;
      ctx.strokeRect(100, 100, 750, 450);

      // Interior Partitions
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      // Living / Dining separation
      ctx.moveTo(450, 100);
      ctx.lineTo(450, 380);
      // Bedroom hallway
      ctx.moveTo(100, 320);
      ctx.lineTo(450, 320);
      // Master suite
      ctx.moveTo(450, 280);
      ctx.lineTo(850, 280);
      // Bathroom
      ctx.moveTo(650, 280);
      ctx.lineTo(650, 550);
      ctx.stroke();

      // Dimension Line (40ft across top)
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(100, 70);
      ctx.lineTo(850, 70);
      ctx.moveTo(100, 60); ctx.lineTo(100, 80);
      ctx.moveTo(850, 60); ctx.lineTo(850, 80);
      ctx.stroke();
      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('40\' - 0" (DIMENSION LINE FOR CALIBRATION)', 380, 65);

      // Room Text Labels
      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('LIVING & DINING SUITE (24\' x 18\')', 150, 220);
      ctx.fillText('MASTER BEDROOM (18\' x 16\')', 520, 200);
      ctx.fillText('BEDROOM 2 (14\' x 12\')', 150, 440);
      ctx.fillText('KITCHEN & PANTRY', 480, 360);
      ctx.fillText('BATHROOM', 680, 420);

      ctx.restore();
    },

    loadSampleFloorplan: function () {
      this.currentImage = null;
      this.panX = 30;
      this.panY = 20;
      this.zoom = 0.95;
      this.scaleRatio = 18.75; // 750px / 40ft = 18.75 px/ft
      this.updateScaleLabel();
      this.redraw();
    },

    handleFileUpload: function (e) {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          this.currentImage = img;
          this.panX = 20;
          this.panY = 20;
          this.zoom = Math.min(this.canvas.width / img.width, this.canvas.height / img.height, 1.0);
          this.redraw();
          alert('Drawing uploaded successfully! Use the "Calibrate Scale" tool to calibrate real dimensions.');
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    },

    renderMeasurementsTable: function () {
      const tbody = document.getElementById('takeoffMeasurementsTableBody');
      if (!tbody) return;

      tbody.innerHTML = this.measurements.map(m => {
        let valueDisplay = '';
        let pushActions = '';

        if (m.type === 'area') {
          valueDisplay = `<span class="font-bold text-slate-900">${m.valueSqFt} SF</span> <span class="text-slate-500">(${m.valueSqM} m²)</span>`;
          pushActions = `
            <button onclick="BuildEstimateDrawing.pushToConcrete(${m.valueSqFt})" title="Send Area to Concrete Slab Calculator" class="px-2 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 text-[10px] font-bold border border-blue-200 transition">
              → Concrete Slab
            </button>
            <button onclick="BuildEstimateDrawing.pushToBOQ('${m.name}', ${m.valueSqFt}, 'SF', 18.50)" title="Add to BOQ" class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold border border-emerald-200 transition">
              + BOQ
            </button>
          `;
        } else if (m.type === 'linear') {
          valueDisplay = `<span class="font-bold text-slate-900">${m.valueLF} LF</span> <span class="text-slate-500">(${m.valueM} m)</span>`;
          pushActions = `
            <button onclick="BuildEstimateDrawing.pushToFraming(${m.valueLF})" title="Send Length to Wall Framing" class="px-2 py-0.5 rounded bg-amber-50 text-amber-800 hover:bg-amber-100 text-[10px] font-bold border border-amber-200 transition">
              → Wall Framing
            </button>
            <button onclick="BuildEstimateDrawing.pushToBOQ('${m.name}', ${m.valueLF}, 'LF', 12.80)" title="Add to BOQ" class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold border border-emerald-200 transition">
              + BOQ
            </button>
          `;
        } else if (m.type === 'count') {
          valueDisplay = `<span class="font-bold text-slate-900">${m.count || 1} Count</span>`;
          pushActions = `
            <button onclick="BuildEstimateDrawing.pushToBOQ('${m.name}', ${m.count || 1}, 'EA', 145.00)" title="Add to BOQ" class="px-2 py-0.5 rounded bg-purple-50 text-purple-700 hover:bg-purple-100 text-[10px] font-bold border border-purple-200 transition">
              + BOQ Item
            </button>
          `;
        }

        return `
          <tr class="hover:bg-slate-50 transition border-b border-slate-100 text-xs">
            <td class="py-2.5 px-3 flex items-center space-x-2">
              <span class="w-3 h-3 rounded-full shrink-0" style="background-color: ${m.color}"></span>
              <span class="font-bold text-slate-800">${m.name}</span>
            </td>
            <td class="py-2.5 px-3 uppercase text-[10px] font-bold text-slate-500">${m.type}</td>
            <td class="py-2.5 px-3">${valueDisplay}</td>
            <td class="py-2.5 px-3 space-x-1">${pushActions}</td>
            <td class="py-2.5 px-3 text-right">
              <button onclick="BuildEstimateDrawing.deleteMeasurement('${m.id}')" title="Delete Measurement" class="text-slate-400 hover:text-rose-600 transition">
                <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </td>
          </tr>
        `;
      }).join('');
    },

    deleteMeasurement: function (id) {
      this.measurements = this.measurements.filter(m => m.id !== id);
      this.renderMeasurementsTable();
      this.redraw();
    },

    // PUSH DATA TO TAKEOFF CALCULATORS
    pushToConcrete: function (sqft) {
      BuildEstimateApp.switchView('takeoffs');
      if (typeof switchTab === 'function') switchTab('concrete');
      
      // Calculate equivalent rectangular dimensions (assuming 1.33:1 aspect ratio)
      const width = Math.round(Math.sqrt(sqft / 1.33) * 10) / 10;
      const length = Math.round((sqft / width) * 10) / 10;

      const inputL = document.getElementById('concLength');
      const inputW = document.getElementById('concWidth');
      if (inputL && inputW) {
        inputL.value = length;
        inputW.value = width;
        if (typeof calcConcrete === 'function') calcConcrete();
        alert(`Pushed measured area (${sqft} SF) into Concrete Slab Calculator: Length=${length} ft, Width=${width} ft.`);
      }
    },

    pushToFraming: function (lf) {
      BuildEstimateApp.switchView('takeoffs');
      if (typeof switchTab === 'function') switchTab('framing');

      const inputL = document.getElementById('frameLength');
      if (inputL) {
        inputL.value = lf;
        if (typeof calcFraming === 'function') calcFraming();
        alert(`Pushed measured linear run (${lf} LF) into Wall Framing Calculator.`);
      }
    },

    pushToBOQ: function (desc, qty, unit, defaultRate) {
      const activeProj = BuildEstimateStorage.getActiveProject();
      if (!activeProj) {
        alert('Please select or create an active project first.');
        return;
      }

      activeProj.boqItems = activeProj.boqItems || [];
      activeProj.boqItems.push({
        id: 'boq-takeoff-' + Date.now(),
        itemNo: '00.99',
        section: 'Takeoff Measurement',
        description: `Plan Takeoff: ${desc}`,
        qty: qty,
        unit: unit,
        matRate: defaultRate * 0.65,
        labRate: defaultRate * 0.30,
        equipRate: defaultRate * 0.05,
        totalRate: defaultRate,
        totalAmount: qty * defaultRate
      });

      BuildEstimateStorage.saveProject(activeProj);
      alert(`Added "${desc}" (${qty} ${unit}) directly to your Bill of Quantities!`);
      if (window.BuildEstimateBOQ) BuildEstimateBOQ.render();
    },

    exportMeasurementsCsv: function () {
      let csv = 'Measurement Name,Type,Square Feet,Square Meters,Linear Feet,Linear Meters,Count\n';
      this.measurements.forEach(m => {
        csv += `"${m.name}","${m.type}",${m.valueSqFt || ''},${m.valueSqM || ''},${m.valueLF || ''},${m.valueM || ''},${m.count || ''}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `Drawing_Takeoffs_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  global.BuildEstimateDrawing = DrawingTakeoff;

})(typeof window !== 'undefined' ? window : this);

