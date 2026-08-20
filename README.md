# WM-LOCO — Project Page

Project page for **WM-LOCO: World Model Augmented Visual Locomotion for Humanoids on
Foothold-Constrained Terrain**.

🔗 **Live site:** https://m0puppet.github.io/wm-loco/

WM-LOCO co-trains a recurrent world model with PPO end-to-end. Conditioned on proprioception
and a single onboard depth image, the world model forms a predictive latent that guides the
policy as a future-aware contact prior — no foothold labels, no terrain map. The same policy
deploys onboard a Unitree G1 and clears gaps, stairs, and stepping stones from depth alone.

Yuxi Liu¹, Lijun Han¹², Ziming Wang¹³, Ao Zhang¹, Cong Yang⁴, Wei Sui¹†

¹D-Robotics · ²Institute of Automation, Chinese Academy of Sciences ·
³Beijing University of Posts and Telecommunications · ⁴Soochow University ·
†Corresponding author: wei.sui@d-robotics.cc

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
