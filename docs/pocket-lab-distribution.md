# Distributing Pocket Lab

Pocket Lab is the Expo app in [apps/pocket-lab](../apps/pocket-lab). The SDK CI job exports JavaScript bundles for iOS and Android. Installing Pocket Lab on a tester’s phone requires a native build and signing credentials. This guide starts at the handoff from the bundle check to a maintainer preparing that build.

## Prepare a build candidate

1. Review [app.json](../apps/pocket-lab/app.json) with William. Both platform identifiers currently read `org.sensoratlas.pocketlab`. Verify ownership and the intended Expo, Apple and Google accounts before registering the identifiers or creating store records. Choose a user-facing app version and unique iOS build number and Android version code.
2. Start from a clean candidate commit. Run `npm ci`, `npm run build` and `npm run check:packages` at the repository root. Record the source commit, SDK versions and Expo version. Inspect the requested permissions, motion explanation and file sharing behavior. Prepare the store descriptions, support contact, privacy disclosures and screenshots from the actual app.
3. From `apps/pocket-lab`, link the approved EAS project using the EAS CLI and run `eas build:configure`. Review the generated app configuration and `eas.json` in a pull request. Define a `preview` profile for internal distribution and a `production` profile for stores. Keep signing and submission keys in the platform credential services. [EAS project setup](https://docs.expo.dev/build/setup/)
4. Confirm the remote builder installs the root lockfile and builds both SDK workspaces before Metro resolves their `dist` exports. An app `postinstall` that runs the root build is one option for this monorepo. Exercise it in a fresh checkout with generated directories absent. Record the EAS CLI version and build IDs. [EAS monorepo builds](https://docs.expo.dev/build-reference/build-with-monorepos/)

## Put a preview on phones

Once the profiles exist, run the following from the app directory under the approved Expo account. Internal Android distribution can produce an installable APK. For iOS ad hoc distribution, register the test devices and use a provisioning profile that includes them. Share the build link with the test group. [EAS internal distribution](https://docs.expo.dev/build/internal-distribution/)

```sh
eas build --platform android --profile preview
eas build --platform ios --profile preview
```

On each phone, try motion permission denial and retry, record a short swing, disconnect a probe during collection and reopen the captured run offline. Export the JSON and inspect it on a second device. Record the phone, OS, build ID and result against the [field trial](roadmap.md#field-trials-and-beta). Use a model run for a reproducible calculation and a physical recording for the hardware check.

## Apple TestFlight and App Store

- Confirm Apple Developer Program access, the App Store Connect app record, bundle ID and signing credentials. Build with `eas build --platform ios --profile production`. Save the build ID and submit that specific build with `eas submit --platform ios --id <build-id>`. [Expo iOS submission](https://docs.expo.dev/submit/ios/)
- After processing, assign the build to an internal TestFlight group and install it from the invitation. For external testers, provide beta information and complete TestFlight review where required. Record the tested build number. [TestFlight](https://developer.apple.com/testflight/)
- For public release, select the verified build in App Store Connect, complete screenshots, privacy and review information, then submit the version for App Review. Choose the release timing after approval. Verify the public listing and install it on a reference phone. [App Store submission](https://developer.apple.com/app-store/submitting/)

## Google Play testing and production

- Create the Play Console app, confirm the Android package ID and configure Play App Signing and the upload key. Build a store AAB using `eas build --platform android --profile production`. For the first upload, use Play Console manually. For subsequent EAS submissions, grant a dedicated Google service account access to the app and select the intended track in the submission profile. [Expo Android submission](https://docs.expo.dev/submit/android/)
- Release the candidate to internal testing and install it through the tester opt-in link. If the developer account has a closed-testing requirement, complete the current Play Console requirement and request production access. Record the tested version code. [Google Play testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465)
- Complete the listing, Data safety form and content rating against the app being submitted. Promote the tested artifact to the intended track and verify the installed production version. For a subsequent automated upload, use `eas submit --platform android --profile <track-profile> --id <build-id>` with the reviewed profile. [EAS Submit](https://docs.expo.dev/submit/introduction/)

## Updates and corrections

Keep a release record with the app version, platform build identifier, source commit, SDK versions, distribution track, tester results and store links. For a bad build, halt a phased or staged rollout where available, prepare a corrected build with a new build identifier and repeat the affected experiment. Check that a previously saved v1 recording opens after upgrading.

EAS Update is an optional future channel for compatible JavaScript and asset changes. Before enabling it, define runtime versions and separate preview and production channels. Test an update on a signed preview with the same native runtime. A change to native modules or permissions needs a new native build. [Expo runtime versions](https://docs.expo.dev/eas-update/runtime-versions/)
