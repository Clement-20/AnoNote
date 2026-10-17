# Android APK Publishing & App Store Release Guide 🚀📦

This guide outlines the exact, step-by-step instructions required to build, sign, optimize, and publish your **AnoNote** Android app to popular APK and App stores (such as the Google Play Store, Amazon Appstore, APKPure, Uptodown, or Samsung Galaxy Store).

---

## Step 1: Generate a Secure Release Keystore 🔑

Before compiling a production package, you must sign it with a private cryptographic key (keystore). This ensures integrity and allows you to push seamless updates in the future.

Run the following command in your terminal to generate a secure keystore:

```bash
keytool -genkey -v -keystore release-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias key
```

*Keep this keystore file (`release-keystore.jks`) safe and backed up! If lost, you cannot update your app on the stores.*

---

## Step 2: Configure Signing Properties 📝

To let Flutter automatically sign your builds, create a file named `android/key.properties` (this is automatically ignored in Git to prevent security leaks):

1. Create `flutter_wrapper/android/key.properties`.
2. Add your keystore details:

```properties
storePassword=your_keystore_password
keyPassword=your_key_password
keyAlias=key
storeFile=../release-keystore.jks
```

---

## Step 3: Customize App Name and Package ID 🏷️

Your production details are already configured in `android/app/build.gradle` and `AndroidManifest.xml` as:
- **Application ID**: `com.anonote.messenger`
- **Application Label / Name**: `AnoNote`

If you ever wish to modify these, you can edit:
*   **Package Name**: `applicationId` inside `/flutter_wrapper/android/app/build.gradle`.
*   **Display Title**: `android:label` inside `/flutter_wrapper/android/app/src/main/AndroidManifest.xml`.

---

## Step 4: Generate App Icons 🛡️

To customize your Android device home-screen icon, use the popular community `flutter_launcher_icons` plugin:

1. Add your icon image asset (e.g., `assets/icon.png`) to the project.
2. Run the generator to automatically crop and output all high-resolution mipmap densities (`hdpi`, `xhdpi`, `xxhdpi`, etc.):

```bash
flutter pub run flutter_launcher_icons
```

---

## Step 5: Build Highly Optimized Production APKs ⚙️

To ensure small download sizes, high execution speed, and source-code obfuscation to prevent reverse engineering, use the following advanced compilation flags:

### 1. Build a Unified Release APK
Compiles a single, high-compatibility APK containing support for all hardware architectures (`arm64-v8a`, `armeabi-v7a`, `x86_64`):
```bash
flutter build apk --release --obfuscate --split-debug-info=build/app/outputs/symbols
```

### 2. Build Split APKs (Highly Recommended)
Compiles distinct APKs optimized for specific CPU architectures. This reduces the final user download size by over **60%** (typically down to just 6-8MB!):
```bash
flutter build apk --release --split-per-abi --obfuscate --split-debug-info=build/app/outputs/symbols
```
*Outputs will be saved in `build/app/outputs/flutter-apk/app-arm64-v8a-release.apk` (and other CPU formats).*

### 3. Build Google Play App Bundle (AAB)
If publishing to the official Google Play Console, you must compile an Android App Bundle instead of an APK:
```bash
flutter build appbundle --release --obfuscate --split-debug-info=build/app/outputs/symbols
```

---

## Step 6: Submit to APK & App Stores 🌐

Once you have built your release APK or Bundle, upload it directly to your target marketplace console:

### 1. Google Play Console (Official Store)
- Create a developer account at [Google Play Console](https://play.google.com/console).
- Create a new application, fill out standard privacy questionnaires (AnoNote is 100% private and does not collect personal user data!).
- Upload your `.aab` (Android App Bundle) file in the Production channel.

### 2. Alternative APK Stores (No strict guidelines / Sideloading)
For secondary community repositories, you upload the generated `.apk` file (prefer the `arm64-v8a` release or unified release):
*   **Amazon Appstore**: Submit via the [Amazon Developer Console](https://developer.amazon.com/). Great for Kindle Fire and fireOS devices.
*   **APKPure & Uptodown**: Extremely popular alternative stores with developer portals where you can claim your package name and submit direct APK uploads.
*   **Samsung Galaxy Store**: Submit via the Samsung Seller Portal.
*   **F-Droid**: The leading open-source Android app repository. Excellent fit for AnoNote due to its zero-telemetry, zero-knowledge, and high-privacy architecture!

---

## ⚠️ Special Instructions for Uptodown App Submission

When submitting your app on Uptodown's Developer Zone, they ask for:
> **"A url -- The URL must offer a direct file download, and not be a transitional page to external storage services (Google Drive, MEGA, etc.). PAD files are not allowed in this field either."**

### Why Uptodown requires this:
Uptodown uses an automated crawler and virus verification pipeline (VirusTotal integration). Their bot visits the URL and directly downloads the raw `.apk` file binary to verify package headers (`com.anonote.messenger`), signatures, and version codes.
- ❌ **Not Allowed**: Google Drive, MEGA, MediaFire, WeTransfer, Dropbox links (because they display HTML landing pages with "Download" buttons or rate-limits).
- ❌ **Not Allowed**: PAD files (Portable Application Description XML files).
- ✅ **Required**: A direct HTTP/HTTPS link that immediately delivers the `.apk` file with `Content-Type: application/vnd.android.package-archive`.

### How to provide this URL:

#### Method A: GitHub Releases (Recommended by Uptodown)
If your repository is hosted on GitHub, you can use the automated GitHub Actions workflow included in `.github/workflows/build-apk.yml`.
When you publish a release (e.g. `v1.0.0`), GitHub generates a permanent direct download link:
```
https://github.com/<YOUR_GITHUB_USER>/<YOUR_REPO>/releases/latest/download/anonote.apk
```
Uptodown directly accepts this URL format because GitHub redirects immediately to the raw binary asset!

#### Method B: Direct URL hosted on your AnoNote Server
Place your compiled `anonote.apk` file in the project's `/public/downloads/` folder.
Your server is pre-configured with direct binary download endpoints:
```
https://ais-pre-u6qxctn3yuuriucalqjrby-622545485148.europe-west2.run.app/downloads/anonote.apk
```
or
```
https://ais-pre-u6qxctn3yuuriucalqjrby-622545485148.europe-west2.run.app/anonote.apk
```
When Uptodown's crawler requests this URL, your server serves the raw `.apk` with the required `application/vnd.android.package-archive` header.

#### Method C: Direct Cloud Bucket (S3, Cloudflare R2, Firebase Storage)
Upload `anonote.apk` to any public cloud bucket with public read access. Ensure the public URL points directly to the `.apk` file and does not show an intermediary HTML page.

