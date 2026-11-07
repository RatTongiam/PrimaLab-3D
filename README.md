# PrimaLab

Browser-based mocap viewer and analysis tool by Prima Motion. Opens C3D files locally (nothing is uploaded), shows markers in 3D, computes V3D-style joint angles (Cardan Z-X-Y) for lower-body markers, and runs a force-plate jump analysis (CMJ) ported from [Force-Analysis](https://github.com/RatTongiam/Force-Analysis). Thai / English UI.

## Files
| File | Role |
| --- | --- |
| `template.html` | page markup and CSS |
| `engine.js` | C3D reader, 3D viewer, charts, kinematics, force-plate engine |
| `app.js` | UI wiring |
| `i18n.js` | TH/EN phrase tables and switcher |
| `build.py` | concatenates the above |

## Build
```
python build.py
```
Writes `mocap-viewer.html` (fragment) and `dist/index.html` (standalone page, committed so it can be uploaded as-is).

## Deploy
Upload `dist/index.html` to `public_html/primalab/index.html` (currently https://app.primamotion.tech/primalab/).

## Status
- Joint angles are not yet compared against Visual3D output.
- Knee/ankle widths and marker radius are placeholders; measure the real values.
- Two-plate (L/R) force analysis is validated on simulated data only.
