# Audiofy 🎵

> **Audiofy** is a production-grade, open-source music streaming application built with React Native. It bridges the gap between the ease of Expo development and the power of native modules.

---

## 🏗️ Technical Architecture

Audiofy is not just another music player; it's a demonstration of a **Hybrid Architecture** that supports both **Expo Go** (for rapid prototyping) and **Native Development Builds** (for production features) using a single codebase.

### 1. Hybrid Audio Engine (`src/services`)

The core of Audiofy is its audio playback engine, designed to handle the limitations of the Expo ecosystem.

-   **The Problem:** `react-native-track-player` is the industry standard for background audio but requires native code linking, which breaks Expo Go. `expo-av` works in Expo Go but lacks advanced background/lock-screen controls.
-   **The Solution:** We implemented a **Facade Pattern** via `SafeTrackPlayer.ts` and `MusicPlayer.ts`.
    -   **Detection**: The app detects the environment using `Constants.appOwnership`.
    -   **Polymorphism**:
        -   **In Expo Go**: It silently falls back to `expo-av` for in-app playback. Background controls are disabled but the app remains fully functional for UI development.
        -   **In Production**: It hydrates the full `react-native-track-player`, enabling background audio, lock-screen controls (Play/Pause/Seek), and hardware media button support.

### 2. API Design & Data Normalization

The app interacts with the unofficial JioSaavn API. Since external APIs can change, we use an **Adapter Pattern**:

-   **Raw Data**: The API returns inconsistent data structures (different fields for "artist" depending on the endpoint).
-   **`SongConverter`**: A centralized utility that "normalizes" every incoming payload into a strict `TrackData` interface. This ensures the rest of the app (Player, UI, Database) never deals with dirty data.
-   **Legacy Bridge**: `src/api/saavn.ts` acts as a proxy to the newer `SaavnApi` class, maintaining backward compatibility while refactoring.

### 3. State Management (Zustand)

We chose **Zustand** over Redux for its atomic nature and transient update performance.

-   **Player Store**: Manages `queue`, `currentTrack`, `shuffle`/`repeat` modes. It uses optimistic updates for UI responsiveness.
-   **Persistence**: The `persist` middleware automatically hydrates user preferences (favorites, search history) from AsyncStorage on launch.

### 4. Offline System (`DownloadManager`)

-   **FileSystem**: Downloads are saved to `FileSystem.documentDirectory` to persist across app updates.
-   **Deduplication**: The `DownloadManager` checks existing file hashes/IDs before downloading to save bandwidth.

---

## 📂 Directory Structure

```
src/
├── api/          # Network layer. 'SaavnApi' handles all external requests.
├── components/   # Pure UI components (Buttons, Cards). No business logic here.
├── config/       # Constants, Theme colors, Env vars.
├── navigation/   # React Navigation setup (Stack + Tabs).
├── screens/      # Feature screens. Connects Store data to UI components.
├── services/     # Core Business Logic (MusicPlayer, PlaybackService).
├── store/        # Global State (usePlayerStore, useLibraryStore).
├── utils/        # Helpers (Logger, SongConverter, ErrorHandler).
└── App.tsx       # Entry point. Handles Font loading and Store hydration.
```

---

## ⚖️ Key Trade-offs

### 1. Complexity vs. Compatibility
* **Decision**: We prioritized **Developer Experience (DX)** by supporting Expo Go.
* **Trade-off**: This adds code complexity. We have to maintain two playback implementations (`playNative` vs `playExpoAV`) in `MusicPlayer.ts`.
* **Benefit**: New contributors can clone and run the app immediately without setting up complex Android/iOS build environments.

### 2. Unofficial API
* **Decision**: Use the reverse-engineered JioSaavn API.
* **Trade-off**: The API is undocumented and subject to rate-limiting or breaking changes.
* **Mitigation**: The `SaavnApi` class has built-in retry logic and the `SongConverter` is robust enough to handle missing fields without crashing the UI.

### 3. Image Handling
* **Decision**: We use high-resolution images for the Player and low-res for Lists.
* **Trade-off**: Simple URL replacement logic is used.
* **Benefit**: Reduces memory usage on long lists (Search Results) while keeping the Player gorgeous.

---

## 🚀 Getting Started

### Prerequisites

-   **Node.js** (v18.x or later)
-   **Expo CLI**: `npm install -g expo-cli`

### Installation

1.  **Clone & Install**:
    ```bash
    git clone https://github.com/yourusername/Audiofy.git
    cd Audiofy
    npm install
    ```

2.  **Run in "Dev Mode" (Expo Go)**:
    ```bash
    npx expo start
    ```
    *Scan the QR code. Note: Background audio controls will be simulated or disabled.*

3.  **Run in "Native Mode" (Simulator/Device)**:
    To test the full `react-native-track-player` integration, you must build a custom dev client:
    ```bash
    # Android
    npx expo run:android

    # iOS (Mac only)
    npx expo run:ios
    ```

---

## 🧪 Testing Strategy

-   **Unit Tests**: Located in `__tests__` folders next to utils (e.g., `SongConverter.test.ts`).
-   **Mocking**: We extensively mock `react-native-track-player` to ensure tests run in CI/CD environments without native dependencies.

---

## 🔮 Future Roadmap

-   [ ] **Lyrics Support**: Parse and sync lyrics from the API.
-   [ ] **Equalizer**: Integrate `reanimated` for a visualizer.
-   [ ] **Playlists**: Allow users to create custom playlists (currently only Favorites).
-   [ ] **Social**: Share songs via Deep Linking.

---

*Built with ❤️ using React Native, TypeScript, and Zustand.*
