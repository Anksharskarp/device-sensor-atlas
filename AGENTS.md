# Working in Sensor Atlas

Read [CONTRIBUTING.md](CONTRIBUTING.md) for the engineering, Git, writing, design and attribution conventions that apply to people and agents. Read the [project brief](sensor-atlas-plan.md) before changing the scope of an instrument. The [README](README.md) describes what works in this checkout.

- Start with `git status --short --branch`. Preserve unrelated work. Trace the affected path from source input to the measurement a user sees. Check platform behavior against primary documentation before making a compatibility claim.
- Work incrementally. A short agenda helps with larger features. Implement and verify one useful change at a time, then make a focused commit. Use the checks listed in the contributor guide.
- For continued development, pick a verifiable outcome from the [roadmap](docs/roadmap.md). For release work, follow the [SDK runbook](docs/releases.md) or the [app distribution guide](docs/pocket-lab-distribution.md).
- Verify `git var GIT_AUTHOR_IDENT` and `git var GIT_COMMITTER_IDENT` for work commissioned by William. Before pushing on his behalf, verify `git remote -v` and the active account with `gh api user --jq .login`. Leave existing authorship and other contributors’ commits intact.
- Keep the README, detailed guides, examples and journal consistent with the code. Put shared values in their existing source of truth. Keep the project BSD-3-Clause.
- Carry authorized repository work through review, merge and verification. Report the outcome, commits, checks and anything that still needs a device or release account. Treat package publication, signing and store submission as separate maintainer actions. A request to prepare a release authorizes a rehearsal.
