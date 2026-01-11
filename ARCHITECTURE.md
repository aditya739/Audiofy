# Audiofy - Complete Architecture & Setup Guide 🎵

> A production-grade, hybrid music streaming application built with React Native, demonstrating seamless integration between Expo Go and native development builds.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Quick Start](#quick-start)
3. [Architecture Deep Dive](#architecture-deep-dive)
4. [Directory Structure](#directory-structure)
5. [Core Systems](#core-systems)
6. [Design Patterns](#design-patterns)
7. [Data Flow](#data-flow)
8. [Key Trade-offs](#key-trade-offs)
9. [Flowcharts](#flowcharts)
10. [Development Workflow](#development-workflow)
11. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

**Audiofy** bridges the gap between rapid prototyping (Expo Go) and production features (native builds) using a single codebase. It's a music streaming app powered by the JioSaavn API with offline support, favorites, and advanced playback controls.

### Key Features
- 🎵 Stream music from JioSaavn API
- 📱 Works in Expo Go (rapid development)
- 🔒 Full native features in production builds
- 💾 Offline downloads with local playback
- ❤️ Favorites management
- 🔄 Queue management with shuffle/repeat
- 🎨 Dark/Light theme support
- 📊 Structured logging system
- ⚡ Optimized performance with Zustand state management

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ 
- **Expo CLI**: `npm install -g expo-cli`
- **Git**

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/Audiofy.git
cd Audiofy

# Install dependencies
npm install

# Start in Expo Go (development)
npx expo start

# Or build for native (production)
npx expo run:android    # Android
npx expo run:ios        # iOS (Mac only)
```

### Environment Setup
No API keys required - uses public JioSaavn API endpoint. All configuration is in `src/config/constants.ts`.

---

## 🏗️ Architecture Deep Dive

### 1. Hybrid Audio Engine (Facade Pattern)

The core innovation: **single codebase, two playback implementations**.

```
┌─────────────────────────────────────────┐
│         MusicPlayer (Facade)            │
│  - Detects environment at runtime       │
│  - Routes to appropriate implementation │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
   ┌───▼────┐      ┌───▼──────┐
   │ Expo AV│      │TrackPlayer│
   │(Expo Go)      │(Native)   │
   └────────┘      └───────────┘
```

**Detection Logic** (`MusicPlayer.ts`):
```typescript
const isNativeAvailable = Constants.appOwnership !== 'expo' && !!Constants.appOwnership;
```

**In Expo Go:**
- Uses `expo-av` for playback
- Background controls disabled (limitation)
- Full UI development possible
- No native compilation needed

**In Production Build:**
- Uses `react-native-track-player`
- Lock-screen controls enabled
- Hardware media buttons supported
- Background audio playback

### 2. API Layer (Adapter Pattern)

Raw API data is inconsistent. Solution: **SongConverter** normalizes everything.

```
┌──────────────────┐
│  JioSaavn API    │
│ (Inconsistent)   │
└────────┬─────────┘
         │
    ┌────▼──────────┐
    │ SaavnApi      │
    │ (Fetch Layer) │
    └────┬──────────┘
         │
    ┌────▼──────────────┐
    │ SongConverter      │
    │ (Normalization)    │
    └────┬──────────────┘
         │
    ┌────▼──────────────┐
    │ TrackData         │
    │ (Consistent)      │
    └───────────────────┘
```

**Why this matters:**
- API returns different field names per endpoint
- Some songs missing artwork/duration
- SongConverter handles all edge cases
- Rest of app works with clean `TrackData` interface

### 3. State Management (Zustand)

Atomic, transient updates for UI responsiveness.

```
usePlayerStore
├── currentTrack: TrackData | null
├── queue: TrackData[]
├── isPlaying: boolean
├── repeatMode: 'off' | 'track' | 'queue'
├── shuffle: boolean
├── favorites: TrackData[]
├── downloads: string[]
├── recentPlays: TrackData[]
└── theme: 'dark' | 'light'
```

**Persistence:**
- AsyncStorage middleware auto-saves state
- Hydrates on app launch
- Selective persistence (not currentTrack)

### 4. Offline System (DownloadManager)

Downloads stored in `FileSystem.documentDirectory` (survives app updates).

```
Download Flow:
1. User taps download
2. DownloadManager.downloadSong(url, id)
3. Saves to: {docDir}/songs/{id}.m4a
4. Also downloads artwork: {docDir}/songs/{id}.jpg
5. Store tracks in downloads array
6. On playback, checks local first, falls back to remote
```

---

## 📂 Directory Structure

```
src/
├── api/                          # Network layer
│   ├── BaseApiClient.ts         # Abstract HTTP client with retry logic
│   ├── SaavnApi.ts              # Music API methods (search, trending, etc)
│   └── saavn.ts                 # Legacy bridge for backward compatibility
│
├── components/                   # Pure UI components (no business logic)
│   ├── home/
│   │   ├── FeaturedCard.tsx      # Featured songs display
│   │   ├── HorizontalSongList.tsx# Scrollable song list
│   │   ├── ArtistList.tsx        # Artist carousel
│   │   └── SectionHeader.tsx     # Section titles
│   ├── player/
│   │   ├── PlayerControls.tsx    # Play/Pause/Skip buttons
│   │   ├── ProgressBar.tsx       # Seek bar
│   │   ├── AlbumArt.tsx          # Album artwork display
│   │   ├── SongInfo.tsx          # Title/Artist info
│   │   └── SimilarSongsList.tsx  # Recommendations
│   ├── search/
│   │   ├── SearchBar.tsx         # Input field
│   │   ├── SearchTabs.tsx        # Songs/Artists/Albums tabs
│   │   └── SearchListItem.tsx    # Result item
│   ├── MiniPlayer.tsx            # Bottom player bar
│   └── APIStatusBadge.tsx        # API health indicator
│
├── config/
│   └── constants.ts              # API URLs, colors, pagination, log levels
│
├── hooks/
│   └── usePlayer.ts              # Safe wrappers for TrackPlayer hooks
│
├── navigation/
│   └── AppNavigator.tsx          # Stack + Tab navigation setup
│
├── screens/                      # Feature screens (connect store to UI)
│   ├── HomeScreen.tsx            # Trending/New releases
│   ├── SearchScreen.tsx          # Search interface
│   ├── PlayerScreen.tsx          # Full player modal
│   ├── FavoritesScreen.tsx       # Saved songs
│   ├── QueueScreen.tsx           # Current queue
│   ├── ArtistProfileScreen.tsx   # Artist details + songs
│   ├── PlaylistsScreen.tsx       # Playlists (future)
│   └── SettingsScreen.tsx        # App settings
│
├── services/                     # Core business logic
│   ├── BaseMusicPlayer.ts        # Abstract player interface (Template Method)
│   ├── MusicPlayer.ts            # Concrete implementation (Singleton)
│   ├── SafeTrackPlayer.ts        # Safe wrappers + mocks for TrackPlayer
│   ├── TrackPlayerService.ts     # TrackPlayer initialization
│   └── PlaybackService.ts        # Background playback handler
│
├── store/
│   └── usePlayerStore.ts         # Zustand store with persistence
│
├── types/
│   └── index.ts                  # TypeScript interfaces (Song, TrackData, etc)
│
├── utils/
│   ├── Logger.ts                 # Structured logging with history
│   ├── ErrorHandler.ts           # Centralized error handling
│   ├── SongConverter.ts          # API → TrackData normalization
│   ├── DownloadManager.ts        # Local file management
│   ├── theme.ts                  # Theme utilities
│   └── __tests__/
│       └── SongConverter.test.ts  # Unit tests
│
├── App.tsx                       # Entry point (initialization)
├── index.ts                      # App registration
├── app.json                      # Expo configuration
├── package.json                  # Dependencies
└── tsconfig.json                 # TypeScript config
```

---

## 🔧 Core Systems

### System 1: Player Service

**File:** `src/services/MusicPlayer.ts`

```typescript
// Singleton pattern
const musicPlayer = MusicPlayerService.getInstance();

// Usage
await musicPlayer.setup();           // Initialize
await musicPlayer.play(track);       // Play track
await musicPlayer.toggle(isPlaying); // Pause/Resume
await musicPlayer.seek(30);          // Seek to 30s
await musicPlayer.stop();            // Stop playback

// Listen to changes
musicPlayer.addProgressListener((progress) => {
  console.log(`${progress.position}s / ${progress.duration}s`);
});

musicPlayer.addStateListener((state) => {
  console.log(`State: ${state}`); // IDLE, LOADING, PLAYING, PAUSED, ERROR
});
```

**Template Method Pattern:**
- `setup()` → `doSetup()` (subclass implements)
- `play()` → `doPlay()` (subclass implements)
- Common logic in base class

### System 2: API Client

**File:** `src/api/SaavnApi.ts`

```typescript
const api = SaavnApiService.getInstance();

// Search
const songs = await api.searchSongs('Imagine', page: 1);

// Get details
const song = await api.getSongDetails(songId);

// Trending
const trending = await api.getTrending();

// Artist
const artist = await api.getArtistDetails(artistId);
const artistSongs = await api.getArtistSongs(artistId);

// Suggestions
const suggestions = await api.getSuggestions(songId);
```

**Features:**
- Automatic retry logic (3 attempts)
- Request/response logging
- Error categorization
- Timeout handling (10s)

### System 3: State Management

**File:** `src/store/usePlayerStore.ts`

```typescript
const store = usePlayerStore();

// Read state
store.currentTrack;
store.queue;
store.isPlaying;
store.favorites;

// Update state
store.setCurrentTrack(track);
store.addToQueue(track);
store.toggleFavorite(track);
store.toggleDownload(track);

// Complex actions
await store.playNext();      // Auto-advance with shuffle/repeat logic
await store.playPrevious();  // Go to previous track
```

**Persistence:**
- Saved to AsyncStorage
- Hydrated on app launch
- Selective fields (not currentTrack)

### System 4: Logging

**File:** `src/utils/Logger.ts`

```typescript
const logger = Logger.getInstance('ModuleName');

logger.debug('Debug message', { data });
logger.info('Info message', { data });
logger.warn('Warning message', { data });
logger.error('Error message', error);

logger.group('Operation');
logger.info('Step 1');
logger.info('Step 2');
logger.groupEnd();

logger.time('operation');
// ... do work
logger.timeEnd('operation');

// Get history
const history = Logger.getHistory();
```

### System 5: Error Handling

**File:** `src/utils/ErrorHandler.ts`

```typescript
// Automatic categorization
ErrorHandler.handle(error, 'context');

// Create specific errors
const err = ErrorHandler.createPlaybackError('Failed to play');
const err = ErrorHandler.createNetworkError('No internet');

// Get history
const errors = ErrorHandler.getHistory();

// Utility function
const [data, error] = await handleAsync(promise, 'context');
```

---

## 🎨 Design Patterns

### 1. Facade Pattern (SafeTrackPlayer)
Hides complexity of conditional native/Expo imports.

### 2. Adapter Pattern (SongConverter)
Converts inconsistent API responses to uniform TrackData.

### 3. Template Method (BaseMusicPlayer)
Defines algorithm skeleton, subclasses fill in details.

### 4. Singleton (MusicPlayer, SaavnApi, Logger, ErrorHandler)
Single instance per module, lazy initialization.

### 5. Observer Pattern (Progress/State Listeners)
Components subscribe to player changes.

### 6. Strategy Pattern (Repeat/Shuffle Logic)
Different playback strategies in `playNext()`.

---

## 📊 Data Flow

### Flow 1: User Searches for Song

```
SearchScreen
    ↓
User types query
    ↓
SaavnApi.searchSongs(query)
    ↓
API returns Song[]
    ↓
SongConverter.toTrackDataArray()
    ↓
TrackData[] (normalized)
    ↓
usePlayerStore.setQueue()
    ↓
SearchScreen re-renders with results
```

### Flow 2: User Plays Song

```
User taps song
    ↓
usePlayerStore.setCurrentTrack(track)
    ↓
usePlayerStore.setIsPlaying(true)
    ↓
musicPlayer.play(track)
    ↓
Check: Is native available?
    ├─ YES → TrackPlayer.add() + TrackPlayer.play()
    └─ NO → Audio.Sound.createAsync() + playAsync()
    ↓
musicPlayer.addProgressListener() fires
    ↓
PlayerScreen updates progress bar
```

### Flow 3: User Downloads Song

```
User taps download icon
    ↓
usePlayerStore.toggleDownload(track)
    ↓
DownloadManager.downloadSong(url, id)
    ↓
Save to: {docDir}/songs/{id}.m4a
    ↓
DownloadManager.downloadArtwork(artwork, id)
    ↓
Save to: {docDir}/songs/{id}.jpg
    ↓
Store in: usePlayerStore.downloads[]
    ↓
Next playback checks local first
```

### Flow 4: App Initialization

```
App.tsx mounts
    ↓
setupPlayer() called
    ↓
Check: Is Expo Go?
    ├─ YES → Skip TrackPlayer setup
    └─ NO → TrackPlayer.setupPlayer()
    ↓
musicPlayer.setup()
    ↓
usePlayerStore hydrates from AsyncStorage
    ↓
AppNavigator renders
    ↓
User can interact
```

---

## ⚖️ Key Trade-offs

### Trade-off 1: Complexity vs. Compatibility

**Decision:** Support both Expo Go and native builds

**Complexity Added:**
- Two playback implementations
- Conditional imports
- SafeTrackPlayer mocks
- Environment detection

**Benefit:**
- New developers can clone and run immediately
- No native build setup required for UI development
- Faster iteration cycle

**Cost:**
- More code to maintain
- Potential for sync issues between implementations
- Testing both paths required

---

### Trade-off 2: Unofficial API

**Decision:** Use reverse-engineered JioSaavn API

**Risks:**
- API undocumented
- Subject to breaking changes
- Rate limiting possible
- No SLA

**Mitigations:**
- Retry logic (3 attempts)
- SongConverter handles missing fields
- Fallback to trending if suggestions fail
- Error categorization for debugging

**Benefit:**
- No API key required
- Free music data
- Good coverage of Indian music

---

### Trade-off 3: Image Quality vs. Performance

**Decision:** High-res for player, low-res for lists

**Implementation:**
```typescript
// In SongConverter
const highRes = song.image[song.image.length - 1]; // Player
const lowRes = song.image[0]; // Lists
```

**Benefit:**
- Reduced memory on long lists
- Faster scrolling
- Beautiful player screen

**Cost:**
- URL replacement logic
- Potential for broken images

---

### Trade-off 4: State Persistence

**Decision:** Persist queue, favorites, downloads (not currentTrack)

**Why not currentTrack:**
- User might delete song between sessions
- URL might expire
- Cleaner UX (start fresh)

**Persisted:**
- Favorites (user's collection)
- Queue (user's session)
- Downloads (local files)
- Theme preference

---

### Trade-off 5: Offline-First vs. Always-Online

**Decision:** Hybrid approach

**Online:**
- Stream from API
- Download for offline

**Offline:**
- Play downloaded songs
- Browse favorites/queue
- No search/trending

**Benefit:**
- Works without internet
- Reduced data usage

**Cost:**
- Download management complexity
- Storage limits

---

## 📈 Flowcharts

### Flowchart 1: App Initialization

```
START
  ↓
App.tsx mounts
  ↓
[Initialize Player]
  ├─ setupPlayer()
  │   ├─ Is Expo Go? → YES → Skip TrackPlayer
  │   └─ Is Expo Go? → NO → TrackPlayer.setupPlayer()
  ├─ musicPlayer.setup()
  │   ├─ Is Native? → YES → Configure native audio
  │   └─ Is Native? → NO → Configure Expo AV
  ↓
[Hydrate Store]
  ├─ usePlayerStore.hydrate()
  ├─ Load from AsyncStorage
  ├─ Restore queue, favorites, downloads
  ↓
[Render UI]
  ├─ AppNavigator renders
  ├─ Show MainTabs (Home, Search, Favorites, Settings)
  ↓
READY
```

### Flowchart 2: Playback Flow

```
User taps song
  ↓
[Update Store]
  ├─ setCurrentTrack(track)
  ├─ setIsPlaying(true)
  ├─ addToRecentPlays(track)
  ↓
[Prepare Track]
  ├─ Check: Is downloaded?
  │   ├─ YES → Use local URI
  │   └─ NO → Use remote URL
  ↓
[Play Track]
  ├─ Is Native available?
  │   ├─ YES → TrackPlayer.add() + play()
  │   └─ NO → Audio.Sound.createAsync() + playAsync()
  ↓
[Listen to Progress]
  ├─ musicPlayer.addProgressListener()
  ├─ Update UI every 500ms
  ├─ Show progress bar
  ↓
[Track Finished?]
  ├─ YES → playNext() (auto-advance)
  │   ├─ Check repeatMode
  │   ├─ Check shuffle
  │   ├─ Get next track
  │   └─ Recursively play
  └─ NO → Continue playing
```

### Flowchart 3: Search Flow

```
User types in SearchBar
  ↓
[Debounce Input]
  ├─ Wait 300ms for user to stop typing
  ↓
[API Request]
  ├─ SaavnApi.searchSongs(query)
  ├─ Retry up to 3 times on failure
  ↓
[Handle Response]
  ├─ Success?
  │   ├─ YES → Convert Song[] to TrackData[]
  │   └─ NO → Show error, return []
  ↓
[Normalize Data]
  ├─ SongConverter.toTrackDataArray()
  ├─ Handle missing fields
  ├─ Extract artwork URLs
  ↓
[Update Store]
  ├─ usePlayerStore.setQueue(results)
  ↓
[Render Results]
  ├─ SearchScreen displays TrackData[]
  ├─ User can tap to play
```

### Flowchart 4: Download Flow

```
User taps download icon
  ↓
[Check Status]
  ├─ Is already downloaded?
  │   ├─ YES → Delete (toggle off)
  │   │   ├─ DownloadManager.deleteSong(id)
  │   │   ├─ DownloadManager.deleteArtwork(id)
  │   │   ├─ Remove from store.downloads[]
  │   │   └─ END
  │   └─ NO → Download (toggle on)
  ↓
[Download Song]
  ├─ DownloadManager.downloadSong(url, id)
  ├─ Save to: {docDir}/songs/{id}.m4a
  ├─ Retry on failure
  ↓
[Download Artwork]
  ├─ DownloadManager.downloadArtwork(artwork, id)
  ├─ Save to: {docDir}/songs/{id}.jpg
  ├─ Fail gracefully if artwork unavailable
  ↓
[Update Store]
  ├─ Add to store.downloads[]
  ├─ Add to store.downloadedSongs[]
  ├─ Persist to AsyncStorage
  ↓
[Next Playback]
  ├─ musicPlayer.play() checks local first
  ├─ If exists → Use local URI
  ├─ If not → Use remote URL
```

### Flowchart 5: Error Handling

```
Error occurs
  ↓
[Catch Error]
  ├─ try-catch block
  ├─ ErrorHandler.handle(error, context)
  ↓
[Normalize Error]
  ├─ Is AppError?
  │   ├─ YES → Use as-is
  │   └─ NO → Wrap in AppError
  ↓
[Categorize Error]
  ├─ Check message for keywords
  ├─ NETWORK_ERROR (network/fetch)
  ├─ API_ERROR (api/response)
  ├─ PLAYBACK_ERROR (play/audio)
  ├─ INITIALIZATION_ERROR (init/setup)
  └─ UNKNOWN_ERROR (default)
  ↓
[Log Error]
  ├─ Logger.error(context, error)
  ├─ Add to error history
  ├─ Console output with emoji
  ↓
[Store History]
  ├─ Keep last 50 errors
  ├─ Available for debugging
  ↓
[User Feedback]
  ├─ Show error toast/modal
  ├─ Suggest retry or fallback
```

### Flowchart 6: State Persistence

```
App Initialization
  ↓
[Hydrate Store]
  ├─ usePlayerStore.hydrate()
  ├─ Read from AsyncStorage
  ├─ Restore: queue, favorites, downloads, theme
  ├─ Skip: currentTrack (start fresh)
  ↓
[User Interaction]
  ├─ User plays song
  ├─ User adds to favorites
  ├─ User downloads track
  ↓
[Auto-Save]
  ├─ Zustand persist middleware
  ├─ Debounced write to AsyncStorage
  ├─ Only persisted fields saved
  ↓
[App Closes]
  ├─ State saved to AsyncStorage
  ↓
[App Reopens]
  ├─ Hydrate from AsyncStorage
  ├─ Restore user's state
  ├─ Continue where left off
```

---

## 🔄 Development Workflow

### Local Development (Expo Go)

```bash
# Start dev server
npx expo start

# Scan QR code with Expo Go app
# App loads in seconds
# Hot reload on file save
# No native compilation needed
```

**Limitations in Expo Go:**
- No lock-screen controls
- No hardware media buttons
- Background audio limited
- Some native modules unavailable

### Native Development (Production Build)

```bash
# Android
npx expo run:android

# iOS (Mac only)
npx expo run:ios

# Full native features available
# Lock-screen controls work
# Hardware buttons work
# Background audio works
```

### Testing

```bash
# Run unit tests
npm test

# Test specific file
npm test -- SongConverter.test.ts

# Watch mode
npm test -- --watch
```

### Building for Release

```bash
# Create production build
eas build --platform android
eas build --platform ios

# Or local build
npx expo run:android --variant release
```

---

## 🐛 Troubleshooting

### Issue: "Track player not available in Expo Go"

**Solution:** This is expected. Use native build for full features.

```bash
npx expo run:android
```

### Issue: "No audio playing in Expo Go"

**Check:**
1. Is device volume on?
2. Is app in foreground?
3. Check logs: `Logger.getHistory()`

**Workaround:** Use native build for background audio.

### Issue: "Downloads not persisting"

**Check:**
1. Is AsyncStorage working? `usePlayerStore.getState().downloads`
2. Is file system accessible? Check `DownloadManager` logs
3. Is storage permission granted?

**Solution:**
```bash
# Clear app data and retry
npx expo run:android -- --clear
```

### Issue: "API requests failing"

**Check:**
1. Is internet connected?
2. Is API endpoint accessible? Test in browser
3. Check retry logic: `BaseApiClient` logs

**Fallback:**
- App shows cached data
- Suggestions fall back to trending
- Error toast displayed

### Issue: "Memory leak warnings"

**Check:**
1. Are listeners being cleaned up?
2. Are subscriptions unsubscribed?

**Solution:**
```typescript
// Always cleanup
useEffect(() => {
  const unsubscribe = musicPlayer.addProgressListener(...);
  return () => unsubscribe();
}, []);
```

---

## 📚 Additional Resources

### Key Files to Understand
1. `App.tsx` - Entry point and initialization
2. `src/services/MusicPlayer.ts` - Core playback logic
3. `src/store/usePlayerStore.ts` - State management
4. `src/api/SaavnApi.ts` - API integration
5. `src/utils/SongConverter.ts` - Data normalization

### External Dependencies
- **react-native-track-player** - Native audio playback
- **expo-av** - Expo audio playback
- **zustand** - State management
- **axios** - HTTP client
- **react-navigation** - Navigation
- **expo-file-system** - File management

### Performance Tips
1. Use `React.memo()` for list items
2. Debounce search input
3. Lazy load images
4. Limit queue size
5. Clean up listeners

---

## 📝 License

MIT License - Feel free to use and modify

---

*Built with ❤️ using React Native, TypeScript, and Zustand*
