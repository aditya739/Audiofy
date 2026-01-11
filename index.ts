import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import App from './App';
import Constants from 'expo-constants';

const isExpoGo = Constants.appOwnership === 'expo';

if (!isExpoGo) {
    try {
        const { TrackPlayer } = require('./src/services/SafeTrackPlayer');
        const { PlaybackService } = require('./src/services/PlaybackService');
        TrackPlayer.registerPlaybackService(() => PlaybackService);
    } catch (e) {

    }
}

registerRootComponent(App);
