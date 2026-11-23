# Contributing to Sensor Atlas

Start with a measurement someone wants to make. A useful issue might ask how to recover the last minute of a flow recording after the app closes. Give the reader the source, the units, what happened, and what they should be able to reproduce. The [project brief](sensor-atlas-plan.md) describes the instrument we set out to build.

## Choose the right place

Use the [roadmap](docs/roadmap.md) to pick an issue and find its acceptance test. Maintainers can find the publication procedures in the [SDK](docs/releases.md) and [Pocket Lab](docs/pocket-lab-distribution.md) release guides.

| Where | What belongs there |
| --- | --- |
| [Core](packages/core) | Source clocks, buffers, capture, measurement math, session files and replay. Core runs in Node without Expo or React. |
| [React Native](packages/react-native) | Embeddable panels, meters, scopes, cursor controls and selection reports. An app can supply its own source and analysis. |
| [Pocket Lab](apps/pocket-lab) | Working experiments, permissions, device subscriptions, local storage and sharing. Build against the public SDK exports. |
| [Examples](examples) | Small, runnable source integrations with a known input and expected result. |
| [Guides](docs) and [website](site) | Setup, experiment methods, interactive demonstrations and the development journal. The root README is the main entry point. |

Use Node.js 24. Run `npm ci` and `npm run build` at the repository root. Start Pocket Lab with `npm start -w pocket-lab`. The bundled recordings work without a probe. The [installation guide](docs/integration.md) covers a clean consumer app.

## Take a change from issue to merge

1. Look for an existing issue. For a new experiment, describe the question, acquisition method, expected reading with units, and how another person can check it. For a bug, supply the smallest recording or sequence of actions that reproduces it. Include device and OS when the behavior depends on hardware. Use a shareable fixture with private readings and endpoints removed.
2. Pick one outcome. For a larger feature, sketch its public interface and compatibility implications in the issue. Split it into working increments such as a reader fixture, support for that fixture, then an inspector that uses it. Keep the checkout usable at each commit.
3. Read the relevant official documentation and the existing implementation. Verify sensor units, timestamp origins, permission behavior, package exports and supported versions. Link the source next to the claim. Label models, measured observations and proposed targets accurately.
4. Exercise the public entry point a user would reach. For measurement code, include a fixture whose answer can be checked by hand. A constant 3 L/min over 20 seconds should give 1 L after saving and reopening. Cover interruptions, invalid inputs and old recordings when the change touches those paths.
5. Commit frequently. Each commit should explain one change in a short imperative subject, such as `Preserve source time when reopening a probe run`. Add a body when a compatibility decision or calculation needs explanation. Keep formatting churn and unrelated cleanup out of the diff.
6. Use a focused pull request for a larger change. State the user outcome, checks run and any hardware still to be tested. Include a screenshot or short recording for an interaction change. Once review and checks are complete, merge promptly, preserve the meaningful commits and close the linked issue when its acceptance test passes.

William Zhang maintains the project. Keep William as the author in package metadata, project bylines and project-owned material. For work performed on William’s behalf, verify the repository’s Git author and committer and the active push account before writing history. Use only William’s authorized identity, with no assistant byline, automated co-author trailer or promotional signature. Independent contributors use their own identity and fork for submissions. William handles upstream integration and official publishing. Keep the [BSD 3-Clause license](LICENSE) in both SDK tarballs and retain notices required by third-party material.

## Engineering conventions

- Keep instrument-specific assumptions in the experiment. Promote a function into core when its units, inputs and output make sense for other instruments. Prefer a small typed function, adapter or component over a new framework.
- Store raw readings with units, source timestamps and segment boundaries. Distinguish receipt time from device time. Draw the trace from the display envelope and calculate from the acquired samples. State the interpolation, gap policy and coverage when they affect an answer.
- Keep acquisition, recording and display independent. Clean up subscriptions, timers and socket listeners on disconnect and unmount. Preserve completed samples when collection stops. Exercise retry and reopen behavior when changing storage or connection handling.
- Preserve working public imports, peer dependencies and v1 recordings. If a change needs a new format or API, include an old fixture, a migration example and the user-visible behavior of each supported reader.
- Keep dependencies, generated output and one-off tooling out of commits unless they belong to the change. Add a regression test when it catches something existing coverage misses. Maintain one source for shared constants, models and metadata.

## Writing and design

Write for the person doing the experiment. Lead with the question or action, explain the physical method, and give a result the reader can check. Prefer “The plateau spans 60 seconds at 60 W, which contributes 1 Wh” to a string of slogans. Vary sentence length naturally. Cut generic claims, announcements, filler, repeated caveats, em dashes and emojis. A limitation belongs next to the decision it affects.

Keep setup and the first working example in the README. Put protocols, schema details, compatibility information and release instructions in `docs/`. Update the [journal](site/posts) when there is an engineering decision worth explaining. Record the question, what was tried, the observation and what changed. Check every code sample against the current public API.

Use the clarity of Zed’s site and Expo’s developer tools as visual references. Give Sensor Atlas its own apparatus illustrations, interactive experiments, typography and copy. Build interest through motion that explains the experiment, a readable instrument scale, and useful controls. Avoid gradients, colored borders, decorative badges and generic dashboard cards. Keep units and results visible, provide keyboard and touch controls, respect reduced motion and check a narrow screen. [Zed](https://zed.dev/) · [Expo](https://expo.dev/)

Use the [instrument palette](packages/react-native/src/tokens.ts) across native controls and the website. Keep site layout variables in [CSS tokens](site/assets/tokens.css), navigation and project metadata in [site configuration](site/config.mjs), and experiment constants with their model. Use the same model in the app, tests and demonstration when they describe the same apparatus.

## Checks before handoff

| Change | Run or inspect |
| --- | --- |
| Instrument or measurement | `npm test`. Check the expected value, units and segment against the raw fixture. |
| Native views or Pocket Lab | `npm run build` then `npm run check -w pocket-lab`. Exercise collect, stop and reopen through the affected screen. |
| Package surface or dependencies | `npm run check:packages`. This installs the tarballs in an isolated app and bundles iOS and Android. |
| Docs or site | `npm run site`. Follow changed links and try the example. For interactive pages, check mobile width, keyboard use and displayed measurements. |

Report exactly what ran. Record a physical device and OS only for a check performed on that device. The initial implementation phase can use fixtures and bundle checks while device trials are scheduled separately.
