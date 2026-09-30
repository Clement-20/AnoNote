# AnoNote Flutter Mobile Wrapper App 🛡️📱

A high-performance, premium, cross-platform mobile application wrapper for the **AnoNote End-to-End Encrypted Messenger**. Powered by **Flutter** and the native **WebView Platform SDK**, this wrapper enables compiling AnoNote directly into native iOS and Android packages for installation on physical mobile devices.

---

## Features Built-in 🚀

1. **Native Bidirectional Bridge Interop**:
   - Integrated a high-fidelity JavaScript bridge channel (`FlutterWebView`) allowing the AnoNote web application to seamlessly talk to native Flutter.
2. **Tactile Haptic Feedback**:
   - Direct translation of web message events to hardware-optimized haptics (`HapticFeedback.lightImpact()`, `HapticFeedback.mediumImpact()`, etc.).
3. **Native System Sharing**:
   - Integrates the native Android/iOS system sharing sheets (`share_plus`) when clicking share links inside the app.
4. **Resilient Dark Themes**:
   - Native status bar and system navigation bar background overlays are automatically matched with AnoNote’s `#0b141a` WhatsApp-inspired dark palette to feel completely native.
5. **Hardware Back Button Navigation**:
   - Overrode native device hardware back actions to scroll backwards inside the chat history dynamically instead of exiting the application.
6. **Polished Launch Splash Loader**:
   - Includes a customized E2EE Shield start-up loader with linear progress tracking indicators on boot.

---

## Setup & Running Guide 📋

### Prerequisites
1. Install the **Flutter SDK** (Version 3.0.0 or higher) on your machine. [Get Flutter](https://docs.flutter.dev/get-started/install)
2. Verify setup by running:
   ```bash
   flutter doctor
   ```

### Installation
1. Move into the `flutter_wrapper` folder:
   ```bash
   cd flutter_wrapper
   ```
2. Retrieve all native dependencies and plugins:
   ```bash
   flutter pub get
   ```

### Running on a Device/Emulator
1. Connect a physical Android device, iPhone, or launch a simulator.
2. Run the application in debug mode:
   ```bash
   flutter run
   ```

---

## Building Native Release Packages 📦

### 1. Build Android APK & App Bundle (Google Play)
To build a highly optimized release APK for side-loading or an App Bundle for deployment on the Google Play Store:
```bash
# Build universal Release APK
flutter build apk --release

# Build Google Play App Bundle (AAB)
flutter build appbundle --release
```
Your compiled outputs will be located inside: `build/app/outputs/flutter-apk/app-release.apk`.

### 2. Build iOS App (Apple App Store)
*Note: iOS compiles require a macOS computer with Xcode installed.*
```bash
# Prepare and compile iOS release bundle
flutter build ipa --release
```
Open the generated runner in Xcode to configure your Apple Developer signatures and push directly to TestFlight or the App Store.
