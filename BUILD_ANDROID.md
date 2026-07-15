# Nomi - Native Android Release Guide 🚀

This guide provides step-by-step instructions to compile, sign, and build **Nomi** as a production-ready Android application. We have pre-configured Nomi with **Capacitor** to wrap our full-stack React + Tailwind application into a high-performance native Android container.

---

## 📋 Prerequisites
Before compiling, ensure you have the following installed on your local computer:
1. **Node.js** (v18 or higher)
2. **Android Studio** (Koala or newer) with Android SDK and Gradle configured
3. **Java Development Kit (JDK)** 17 or higher

---

## 🛠️ Step 1: Build & Sync the Web Assets
First, compile the React and Vite frontend code, bundle the server-side proxy handlers, and sync them into the native Android folder.

Run the following commands in the root of your project:
```bash
# 1. Install all dependencies
npm install

# 2. Build and sync assets into the Android native wrapper
npm run android:build
```
This builds your web assets into the `/dist` directory and copies them automatically into `android/app/src/main/assets/public`.

---

## 📱 Step 2: Open Project in Android Studio
Open Android Studio, and choose **Open an Existing Project**. Select the `/android` directory at the root of Nomi.

Android Studio will automatically detect the Gradle configurations and download the necessary compilers, libraries, and wrappers.

---

## 🔑 Step 3: Generate a Testing APK (Internal Testing)
To test the camera, real OCR, and scan layouts on real physical Android devices:

### Method A: Direct Running from Android Studio
1. Enable **Developer Options** and **USB Debugging** on your real Android phone.
2. Connect your phone to your computer via USB.
3. Select your phone in the top devices dropdown of Android Studio.
4. Click the green **Run** button (or press `Shift + F10`). The app will install and open automatically!

### Method B: Generate a Release APK
To share a standalone installable `.apk` file:
1. In Android Studio, go to the top menu and click **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
2. Gradle will compile the assets.
3. Once completed, click the pop-up notification **"Locate"** to find your installable APK file (`app-debug.apk` or `app-release-unsigned.apk`).
4. Transfer this file to any Android device to install and test!

---

## 📦 Step 4: Generate a Signed Android App Bundle (AAB) for Google Play Store
To submit Nomi to the Google Play Console, you must build a signed **Android App Bundle (.aab)**:

1. In Android Studio, click **Build > Generate Signed Bundle / APK...** from the top menu.
2. Select **Android App Bundle** and click **Next**.
3. Create or select your secure keystore (signing key):
   - Click **Create new...** if you don't have one.
   - Choose a path on your computer, specify secure passwords, and fill out your organization's info.
   - Keep this key file safe! You need it for future app updates.
4. Click **Next**.
5. Select **release** as the Build Variant.
6. Click **Finish**.
7. Gradle will package, sign, and optimize the bundle. Locate the signed `.aab` file in `android/app/release/app-release.aab`.
8. Upload this `.aab` file directly into your Google Play Console!

---

## 🔒 Permissions & Native Hardware Integrations
Nomi's configuration files are pre-loaded with the following standard integrations:
* **Internet access (`android.permission.INTERNET`)**: Pre-declared in `AndroidManifest.xml` to proxy real-time Gemini OCR scans and exchange rates.
* **Camera Access (`android.permission.CAMERA`)**: Pre-declared in `AndroidManifest.xml` so the Scan View can stream the viewfinder.
* **Auto-Focus and Facing Constraints**: Configured with `{ facingMode: { ideal: "environment" } }` to automatically activate the rear high-resolution wide-angle camera on Android phones for crisp barcode scanning.

---

## 🇸🇦 Full Arabic & English Layout Support (RTL/LTR)
Nomi is equipped with a native RTL (Right-to-Left) flag:
* `android:supportsRtl="true"` is enabled inside the `<application>` tag of `AndroidManifest.xml`.
* Our React styling uses Tailwind classes that respond dynamically to the language state, aligning grid structures, typography flows, and slide transitions instantly to Arabic (RTL) or English (LTR) layouts based on user choice or auto-detection.
