import Constants from 'expo-constants';
import { TrackPlayer, Capability } from './SafeTrackPlayer';

const isExpoGo = Constants.appOwnership === 'expo';

export const setupPlayer = async () => {
    if (isExpoGo) {

        return true;
    }

    try {
        await TrackPlayer.getCurrentTrack();
        return true;
    } catch {
        try {
            await TrackPlayer.setupPlayer();
            await TrackPlayer.updateOptions({
                capabilities: [
                    Capability.Play,
                    Capability.Pause,
                    Capability.SkipToNext,
                    Capability.SkipToPrevious,
                    Capability.SeekTo,
                    Capability.Stop,
                ].filter(Boolean),
            });
            return true;
        } catch (e) {
            console.error('TrackPlayer setup failed:', e);
            return false;
        }
    }
};
