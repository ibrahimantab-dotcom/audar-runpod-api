# Motion Reel 26

A 15-second, 60 fps motion graphics reel drawn procedurally on a single `<canvas>` (1920×1080, 900 frames). No video assets and no animation libraries.

| Time | Scene | What happens |
|---|---|---|
| 0.0–1.4 | Genesis | Elastic dot pop, splits into four orbiting dots with trails, collapses into a particle burst |
| 1.4–3.9 | Kinetic type | Circle wipe, masked letter-stagger "MOTION", scale punch, marquees, rotating badge |
| 3.9–6.3 | Systems | Diagonal double wipe, 14×8 grid wave with shape morphing and a magnifying lens |
| 6.3–8.5 | Fluid | Four multiply-blended noise blobs, elastic entrance, bobbing difference-blended type |
| 8.5–10.8 | Hyperspace | Blob-shaped wipe into a curving ring tunnel, warp stars, chromatic 0→60 FPS counter |
| 10.8–12.9 | Rhythm | Stripe transitions, five beat cuts with sliced type |
| 12.9–15.0 | Signature | Iris wipe, logo mark assembles, shockwave and confetti, wordmark, fade that loops back to frame 0 |

Every frame is a pure function of time (`renderFrame(i)`), so playback and export match exactly. Camera shake, film grain, vignette and a difference-blended HUD with frame-accurate timecode sit on top.

## Watch

- `motion-reel.mp4`: the rendered H.264 file, 60 fps.
- `index.html`: open in a browser for live playback with pause and frame scrubbing.

## Re-render

```bash
npm i -D playwright          # or reuse a global install
node render.mjs              # writes motion-reel.mp4 (needs ffmpeg with libx264 on PATH, or FFMPEG=/path/to/ffmpeg)
node render.mjs --frames 0,300,600   # writes PNG stills instead
```
