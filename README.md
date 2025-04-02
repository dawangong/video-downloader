### IOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

### Permission Add

- android
  - android/app/src/main/AndroidManifest.xml
- ios
  - ios/videoDownloader/Info.plist
  - ios/Podfile

### Build App

- android

  - cd android
  - ./gradlew assembleRelease
  - android/app/build/outputs/apk

- ios
