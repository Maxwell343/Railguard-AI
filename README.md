# RailGuard AI — Railway Track Defect Detection & Severity Assessment System

RailGuard AI is an industrial-grade permanent way engineering frontend designed for railway track inspectors, permanent way engineers, and infrastructure authorities. It delivers automated surface defect localization, UIC severity assessment, and maintenance protocol enforcement.

---

## 1. System Overview

- **Target Model**: YOLOv8 Nano (`YOLOv8n`) trained on 640×640 optical rail scans.
- **Defect Taxonomy (3 Classes)**:
  1. **Spalling / Flaking** (UIC 712 R / Code 221) — Gauge corner & running band Rolling Contact Fatigue (RCF).
  2. **Wheel Burn / Slip Damage** (UIC 712 R / Code 225) — Locomotive tractive friction & martensitic thermal degradation.
  3. **Squat Defect** (UIC 712 R / Code 227) — Sub-surface fatigue crack propagation & dynamic impact depressions.
- **Model Checkpoint**: Best weights checkpoint (`best.pt`) staged in Google Drive from the Colab training pipeline.

---

## 2. Industrial-Editorial Design System

Built strictly adhering to specialized railway engineering design aesthetics:
- **Warm Ivory Background**: `#F4F2EC` (`bg-ivory-100`)
- **Charcoal Contrast**: `#252A28` (`bg-charcoal-900` / text primary)
- **Restrained Signal Orange**: `#D9653B` (`bg-signal-orange` / markers & warnings)
- **Muted Sage Positive State**: `#DDE4DB` (`bg-sage-200` / verified track segments)
- **Neutral Industrial Borders**: `#DCD8CE` and `#CCC7BA`
- **Typography**: IBM Plex Sans / Inter for UI; IBM Plex Mono for technical coordinates and chainage telemetry.
- **Zero Generic AI Tropes**: Free of purple gradients, emojis, glowing neon borders, or pill containers.

---

## 3. Key Modules & Views

1. **`01 // INSPECTION WORKSPACE`**:
   - Interactive high-resolution track visualizer with zoom, pan, reticle crosshair, and normalized bounding box overlays.
   - Pre-calibrated Colab benchmark track presets (Squat, Wheel Burn, Spalling, and Nominal Track).
   - Ingestion portal for new optical inspection photographs (PNG, JPG, WebP).
   - Live confidence cutoff slider (10% to 95%) and dynamic class visibility filters.
   - Inspector dossier featuring UIC classification, root cause analysis, and Temporary Speed Restriction (TSR) mandates.
   - One-click **Official Railway Defect Docket generator** (printable UIC-712-FORM-D and JSON export).

2. **`02 // TRACK AUDIT LOG`**:
   - Division archive with search by Chainage (e.g. `KM 142+250`), Line Name, or ID.
   - Multi-parameter filtering by defect class and severity tier.
   - Direct loading of historical scans back into the Inspection Workspace.

3. **`03 // UIC SEVERITY PROTOCOLS`**:
   - Official UIC 712 R engineering catalog for all 3 classes.
   - Interactive Permanent Way Severity Calculator (estimates severity, TSR speed restrictions, and intervention timelines based on depth, surface length, line speed, and annual tonnage).

4. **`04 // YOLOv8 MODEL & DRIVE BRIDGE`**:
   - Colab training provenance disclosure (Epoch 100/100, AdamW, mAP@0.5: 88.4%).
   - Google Drive checkpoint staging validator.
   - Production FastAPI backend code contract (`main.py`) ready for local inference binding.

---

## 4. Commands to Run & Build

### Development Server
```bash
npm run dev
```
> Accessible at `http://localhost:3000/`

### Type Check
```bash
npx tsc --noEmit
```

### Production Build
```bash
npm run build
```

---

## 5. Next Recommended Stage: Model & Backend Integration

1. Download `best.pt` from Google Drive into `backend/weights/best.pt`.
2. Launch the FastAPI inference server with Ultralytics (`uvicorn main:app --port 8000`).
3. Set `VITE_USE_LIVE_API=true` and `VITE_API_ENDPOINT=http://localhost:8000/api/v1` in `.env`.
