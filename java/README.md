# Remote deployment

Ensure `gradle.properties` is up to date by running `npm run update`.
This command copies all the versions from local mods.

- Copy `remote.build.gradle` to the `files/main` webroot folder and rename it to `build.gradle`.
- Copy `gradle.properties` to the `files/main` webroot folder.

The remote build file differs only slightly from the local `build.gradle`.

- Use of `downloadMod` instead of `copyMod`
- `gradle.properties` read using a URL.

Ensure both are kept up to date with any changes to the build system.