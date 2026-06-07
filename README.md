# Particles

An educational chemistry game where you combine atoms into molecules and discover
how matter behaves. Players progress through layers — **QuarkCore → Atomica →
Bondia → Reaxia** — building up reality from its smallest pieces, learning real
chemistry through interaction and consequence rather than explicit instruction.

> **Build. Discover. Understand. Repeat.**

The current focus is **Bondia** — molecular construction: bond atoms together,
manage energy and stability, and learn which molecules heal, sustain, or harm.

## Core loop

Collect / Observe → Combine / Build → Evaluate Outcome → Unlock → Apply Knowledge

Each molecule carries a real-world consequence:

- **Beneficial** — H₂O (healing), O₂ (life)
- **Hazardous** — CO (invisible, lethal), CH₄ (explosive)
- **Situational** — the same molecule can save or destroy depending on context

Key mechanics: bonding consumes **energy** while completing molecules restores it,
wrong structures lose **stability** and decay, toxic molecules raise **hazard**
over time, and the environment reacts to what you build.

## Repository layout

This repo holds two things:

| Path | What it is |
|------|------------|
| `src/*.rs`, `Cargo.toml` | The game — Rust + [Bevy](https://bevyengine.org) 0.15 |
| `src/app/`, `index.html`, `package.json` | UI prototype — React + Vite, exported from [Figma](https://www.figma.com/design/yQ01BxorUuOHRCpWUU6SA0/Particles---Main-Game) |
| `PARTICLES_GDD.docx`, `guidelines/`, `memory/` | Design docs and project vision |

The Rust/Bevy app is the game itself; the React app is a design/UI prototype used
to iterate on the interface.

## Running the game (Rust / Bevy)

Requires a [Rust toolchain](https://rustup.rs).

```sh
cargo run
```

This opens the PARTICLES window (390×844, phone-sized) with the starfield, atom,
bonding, drag, HUD, and screen systems wired up.

## Running the UI prototype (React / Vite)

Requires [Node.js](https://nodejs.org).

```sh
npm install
npm run dev      # start the Vite dev server
npm run build    # production build
```

## Attribution

See `src/app/Attributions.md` for third-party UI asset attributions.
