import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle, XCircle, Loader } from 'lucide-react-native';
import { saavnApi } from '../api/SaavnApi';
import Logger from '../utils/Logger';

const logger = Logger.getInstance('APIStatusBadge');

/**
 * API Status Badge Component
 * Shows the current status of the Saavn API connection
 */
const APIStatusBadge = () => {
    const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
    const [lastCheck, setLastCheck] = useState<Date | null>(null);

    useEffect(() => {
        checkAPIStatus();
    }, []);

    const checkAPIStatus = async () => {
        logger.info('Checking API status');
        setStatus('checking');

        try {
            // Try to fetch trending songs as a health check
            const songs = await saavnApi.getTrending();

            if (songs && songs.length > 0) {
                logger.info('API is online', { songsCount: songs.length });
                setStatus('online');
            } else {
                logger.warn('API returned empty data');
                setStatus('offline');
            }
        } catch (error) {
            logger.error('API is offline', error);
            setStatus('offline');
        } finally {
            setLastCheck(new Date());
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'online':
                return '#4CAF50';
            case 'offline':
                return '#FF5252';
            case 'checking':
                return '#FFC107';
        }
    };

    const getStatusIcon = () => {
        const color = getStatusColor();
        const size = 16;

        switch (status) {
            case 'online':
                return <CheckCircle size={size} color={color} />;
            case 'offline':
                return <XCircle size={size} color={color} />;
            case 'checking':
                return <Loader size={size} color={color} />;
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'online':
                return 'API Online';
            case 'offline':
                return 'API Offline';
            case 'checking':
                return 'Checking...';
        }
    };

    return (
        <TouchableOpacity
            style={[styles.container, { borderColor: getStatusColor() }]}
            onPress={checkAPIStatus}
            activeOpacity={0.7}
        >
            {getStatusIcon()}
            <Text style={[styles.text, { color: getStatusColor() }]}>
                {getStatusText()}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    text: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 6,
    },
});

export default APIStatusBadge;
