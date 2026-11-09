# PrimaLab

Browser-based mocap viewer and analysis tool by Prima Motion. Opens C3D files locally (nothing is uploaded), shows markers in 3D, computes joint angles (Cardan Z-X-Y) for lower-body markers, provides initial anthropometry estimation (height, weight, sex) for knee/ankle widths and CMJ body mass, and runs a force-plate jump analysis (CMJ) ported from [Force-Analysis](https://github.com/RatTongiam/Force-Analysis). Thai / English UI.

## Features
- **Local C3D parsing**: Points, analog channels, events, force plates (Type 2/4).
- **3D Viewer**: Canvas2D orbit camera, marker trails, skeleton links, segment shapes, and ground reaction force (GRF) vectors.
- **Anthropometry & Subject Estimation**: Enter height (cm), body mass (kg), and sex to estimate initial knee/ankle widths (used for virtual medial markers and joint centers) and body mass (for CMJ force analysis). Also displays reference segment lengths (Winter 2009) and segment masses (De Leva 1996).
- **Kinematics**: Lower-body Cardan Z-X-Y joint angles (Hip, Knee, Ankle, Pelvis).
- **Marker sets**: Conventional Lower 16 (TIB wand) or Lower 18 (real medial KNEM/ANKM, no TIB; robust shank fit with outlier-marker rejection, virtual TIB for the shank frame). Separate static C3D supported.
- **Plug-in Gait style mode** (Lower 18 only): X anterior / Y left / Z up segment axes, Euler Y-X-Z, flexion/dorsiflexion, adduction/varus and internal rotation positive, static foot offset subtracted. Not yet compared with Vicon Plug-in Gait output.
- **Force Analysis (CMJ)**: Automated quiet-standing window, phase segmentation (unweighting, braking, propulsive, flight, landing), metrics, and landing impact frequency check against plate natural frequency ($f_n$).
- **Bilingual**: Thai (TH) and English (EN) with seamless language switching.

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
- Joint angles are not yet cross-checked against other software.
- Knee/ankle widths are rough empirical placeholders; direct caliper measurement is strongly recommended.
- Two-plate (L/R) force analysis is validated on simulated data only.
