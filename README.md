# WM-LOCO — Project Page

Project page for **WM-LOCO: World-Model-Augmented Visual Locomotion for Humanoids on
Foothold-Constrained Terrain**.

🔗 **Live site:** https://m0puppet.github.io/wm-loco/

WM-LOCO jointly trains a recurrent world model and a PPO policy. Conditioned on proprioception
and a single onboard depth image, the world model produces a predictive recurrent feature that
guides the policy — no foothold labels, no terrain map. The same policy deploys onboard a
Unitree G1 and clears gaps, stairs, and stepping stones from depth alone, at 93.3% average
success on hardware.

Yuxi Liu¹, Lijun Han¹*, Ziming Wang¹², Ao Zhang¹, Cong Yang³, Wei Sui¹†

¹D-Robotics · ²Beijing University of Posts and Telecommunications · ³Soochow University

*Equal contribution · †Project lead and corresponding author: wei.sui@d-robotics.cc

Page text tracks `paper.tex`; update it here when the paper changes.

## Layout

```
index.html    # the page
styles.css    # light theme
main.js       # scroll reveal, nav, bar charts
assets/       # figures, onboard photos, demo video, logos
.nojekyll     # serve files verbatim (no Jekyll processing)
```

## Local preview

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deployment

GitHub Pages serves the `main` branch root. Push to `main` and the site updates.
