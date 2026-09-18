# Jev Kitchen Chaos

Slam a live AI kitchen with chaos events and watch Jev lose its mind trying to survive the dinner rush.

**Play now:** [jev-kitchen-chaos.vercel.app](https://jev-kitchen-chaos.vercel.app)

## What is this?

A browser-based kitchen chaos simulator where Jev (an AI chef) manages incoming orders across 6 stations. You control the chaos. Jev controls nothing.

- **Chaos buttons:** RUSH HOUR, HEALTH INSPECTOR, KAREN AT TABLE 4, LITERAL FIRE
- **Live scoreboard:** Cook/Die ratio (K/D) tracked in real time
- **Jev's monologue:** Streams live above the kitchen, increasingly unhinged
- **Crowd meter:** Compound chaos until the kitchen explodes
- **Share card:** Tweet your worst K/D ratio

## Stack

Next.js 14 (static export) + Framer Motion + Tailwind CSS. No runtime API keys. All Jev responses are precomputed.

## Dev

```bash
npm install
npm run dev    # localhost:3000
npm run build  # static export to out/
```
