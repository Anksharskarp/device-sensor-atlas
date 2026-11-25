# Releasing the SDK

Sensor Atlas has two public SDK packages and one private app workspace. Use npm for the SDK, GitHub Releases for downloadable artifacts, and GitHub Pages for the workbench and guides. Pocket Lab has a separate [mobile distribution procedure](pocket-lab-distribution.md). William Zhang owns the decision to publish an official release.

The checked-in workflows test the SDK and deploy Pages. Package publication, GitHub releases and mobile submission are maintainer operations. Contributors can run the rehearsal without release credentials.

## Prepare and rehearse

1. Choose the next version and release channel. Use `alpha` for the current prereleases. The React Native package pins core exactly. Update both versions, the core peer, both Pocket Lab dependencies and the tarball filenames in the integration guide. Refresh the root lockfile and inspect the diff. The app’s store version and the recording schema have their own version numbers.
2. Work from a clean checkout of the candidate commit using Node.js 24. Run the commands below. The package check installs its own packed SDKs in a temporary consumer, checks both SDK versions and the native core peer against Pocket Lab’s exact pins, type-checks Pocket Lab and builds both native bundles. Compare output against the [roadmap](roadmap.md) for the intended milestone.
3. Inspect the two release archives. Check the root exports, declarations, core WebSocket entry, session schema, package READMEs, BSD licenses, author, repository and peer versions. Keep both archives and their integrity values with the release notes. Use a fresh output directory for each candidate.

```sh
npm ci
npm test
npm run build
npm run check -w pocket-lab
npm run check:packages
npm run site

VERSION=$(node -p "require('./packages/core/package.json').version")
OUT="dist/releases/$VERSION"
mkdir -p "$OUT"
npm pack -w @sensor-atlas/core -w @sensor-atlas/react-native --pack-destination "$OUT" --json > "$OUT/pack.json"
CORE="$OUT/sensor-atlas-core-$VERSION.tgz"
NATIVE="$OUT/sensor-atlas-react-native-$VERSION.tgz"
tar -tzf "$CORE"
tar -tzf "$NATIVE"
npm publish "$CORE" --access public --tag alpha --dry-run
npm publish "$NATIVE" --access public --tag alpha --dry-run
```

Install these exact archives together in a fresh Expo app with the peers listed in the manifests. Use absolute paths from that app. Reproduce the bundled pendulum result and resolve `@sensor-atlas/core/websocket`. The [integration guide](integration.md) covers bare React Native and Expo setup. Record which environments you actually built or ran.

## First public npm release

Use the variables from the rehearsal in the same shell. Confirm that the maintainer controls the `@sensor-atlas` scope and can create or update **both** package names. Check the target registry with `npm config get registry` and the signed-in account with `npm whoami --registry=https://registry.npmjs.org/`. Inspect existing versions and dist-tags for each name. A missing package is expected on a first publication and says nothing about scope ownership.

After William approves the candidate, publish the inspected archives in dependency order. These commands write to the public registry. Use the account’s interactive authentication for the initial manual release. [npm publish](https://docs.npmjs.com/cli/v11/commands/npm-publish/)

```sh
npm publish "$CORE" --registry=https://registry.npmjs.org/ --access public --tag alpha
npm view "@sensor-atlas/core@$VERSION" version dist.integrity --registry=https://registry.npmjs.org/
npm publish "$NATIVE" --registry=https://registry.npmjs.org/ --access public --tag alpha
npm view "@sensor-atlas/react-native@$VERSION" version dist.integrity peerDependencies --registry=https://registry.npmjs.org/
```

Compare each returned integrity value with its entry in `pack.json`. Install both exact versions from the registry in the clean consumer and repeat the measurement. Inspect `npm dist-tag ls` for each package. Record the registry links and install command in the release notes. For a stable release, review the `publishConfig.tag` in **both** manifests and promote the verified stable version to `latest`. [npm distribution tags](https://docs.npmjs.com/adding-dist-tags-to-packages/)

**Interrupted release.** Query the exact version and integrity before retrying a timed-out command. If core is already correct, resume with the matching native tarball. If a published archive is wrong, prepare a new version and update the peer pin. A published name/version pair cannot be reused. If a tag points consumers at a bad version, move it to the last verified release where one exists, document the affected versions, and publish the correction. [npm publish](https://docs.npmjs.com/cli/v11/commands/npm-publish/) · [npm distribution tags](https://docs.npmjs.com/adding-dist-tags-to-packages/)

For repeat releases, configure a trusted publisher on each npm package, bound to this repository and the exact release workflow. Allow the intended publish operation, grant the release job `id-token: write` and use a supported runner and npm CLI. Keep package publishing out of the ordinary pull request and Pages workflows. Verify provenance on the published package where supported. [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/)

## GitHub Releases and Pages

Tag the exact tested commit with `v<VERSION>` after confirming that the tag is unused. Push that tag and create a GitHub release targeting it. Mark alpha and beta versions as prereleases. Attach the two inspected tarballs and integrity manifest. Include the install command, supported peer versions, user-visible changes, schema changes or migration instructions, and the verification performed. Download an asset from the release and compare it with the candidate. [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)

Pages already deploys from matching changes on `main`. Build with `npm run site`, preview `site/dist` and check links under the repository subpath. After merge, inspect the **Project site** workflow for that commit and open the deployed guides and inspector. Update the README install example only when the registry version resolves. Correct a broken deployment in source and redeploy through the workflow. [Pages workflow](../.github/workflows/pages.yml) · [Live workbench](https://anksharskarp.github.io/device-sensor-atlas/workbench/)

## Additional package registries

| Candidate | When to pursue it | First release test |
| --- | --- | --- |
| GitHub Packages | A team needs to consume the SDK through GitHub’s npm registry. Its scope follows the owning GitHub user or organization. The current repository owner is `Anksharskarp`, while the canonical npm scope is `@sensor-atlas`. Resolve ownership or choose explicit alternate names and update the native peer and imports before offering this channel. | In a separate consumer, map the selected scope to `https://npm.pkg.github.com` in a project `.npmrc`, authenticate with read access and install both packages. A publishing workflow needs package write access. Check visibility, the resolved core dependency and the same measurement as npm. Keep credentials out of the repository. [GitHub npm registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry) |
| JSR, core only | A Deno or TypeScript user needs the acquisition and measurement functions. Establish the scope, provide a JSR manifest with the source exports, and verify the import extensions and public types against JSR’s rules. | From the proposed core package, run `npx jsr publish --dry-run`. Once approved and published, import core from JSR in a clean Deno project, read a v1 fixture and reproduce its integral. Record the supported entry points and exact version. [JSR publishing](https://jsr.io/docs/publishing-packages) |

Open an issue with the consumer, package owner and install test before maintaining an additional registry. A parallel release needs someone to keep versions, peer imports, licenses and fixes in sync.
