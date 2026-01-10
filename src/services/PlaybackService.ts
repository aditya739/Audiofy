import { TrackPlayer, Event } from './SafeTrackPlayer';
import Constants from 'expo-constants';

const isExpoGo = Constants.appOwnership === 'expo';

export const PlaybackService = async function () {
    if (isExpoGo) return;

    try {
        TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
        TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
        TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
        TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());
        TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.reset());
        TrackPlayer.addEventListener(Event.RemoteSeek, (event: any) => TrackPlayer.seekTo(event.position));
    } catch (e) {
        console.log('PlaybackService event registration failed');
    }
};
