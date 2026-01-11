import { LogLevel } from '../config/constants';

/**
 * Logger Configuration Interface
 */
interface LoggerConfig {
    enabled: boolean;
    minLevel: LogLevel;
    includeTimestamp: boolean;
    includeStackTrace: boolean;
}

/**
 * Log Entry Interface
 */
interface LogEntry {
    level: LogLevel;
    module: string;
    message: string;
    data?: any;
    timestamp: Date;
    stackTrace?: string;
}

/**
 * Centralized Logger Service
 * Provides structured logging with different levels and formatting
 * 
 * Usage:
 * const logger = Logger.getInstance('ModuleName');
 * logger.info('Message', { data });
 * logger.error('Error occurred', error);
 */
class Logger {
    private static instances: Map<string, Logger> = new Map();
    private static config: LoggerConfig = {
        enabled: __DEV__ ?? true, // Only log in development
        minLevel: LogLevel.DEBUG,
        includeTimestamp: true,
        includeStackTrace: false,
    };

    private static logHistory: LogEntry[] = [];
    private static readonly MAX_HISTORY_SIZE = 100;

    private moduleName: string;

    /**
     * Private constructor to enforce singleton pattern per module
     */
    private constructor(moduleName: string) {
        this.moduleName = moduleName;
    }

    /**
     * Get Logger instance for a specific module
     */
    public static getInstance(moduleName: string): Logger {
        if (!Logger.instances.has(moduleName)) {
            Logger.instances.set(moduleName, new Logger(moduleName));
        }
        return Logger.instances.get(moduleName)!;
    }

    /**
     * Configure logger globally
     */
    public static configure(config: Partial<LoggerConfig>): void {
        Logger.config = { ...Logger.config, ...config };
    }

    /**
     * Get log history
     */
    public static getHistory(): LogEntry[] {
        return [...Logger.logHistory];
    }

    /**
     * Clear log history
     */
    public static clearHistory(): void {
        Logger.logHistory = [];
    }

    /**
     * Check if logging is enabled for a level
     */
    private shouldLog(level: LogLevel): boolean {
        if (!Logger.config.enabled) return false;

        const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
        const currentLevelIndex = levels.indexOf(level);
        const minLevelIndex = levels.indexOf(Logger.config.minLevel);

        return currentLevelIndex >= minLevelIndex;
    }

    /**
     * Format log message
     */
    private formatMessage(level: LogLevel, message: string, data?: any): string {
        const emoji = this.getEmoji(level);
        const timestamp = Logger.config.includeTimestamp
            ? `[${new Date().toISOString()}]`
            : '';

        let formatted = `${emoji} ${timestamp} [${level}] [${this.moduleName}] ${message}`;

        if (data !== undefined) {
            formatted += `\n${JSON.stringify(data, null, 2)}`;
        }

        return formatted;
    }

    /**
     * Get emoji for log level
     */
    private getEmoji(level: LogLevel): string {
        switch (level) {
            case LogLevel.DEBUG:
                return '🔍';
            case LogLevel.INFO:
                return 'ℹ️';
            case LogLevel.WARN:
                return '⚠️';
            case LogLevel.ERROR:
                return '❌';
            default:
                return '📝';
        }
    }

    /**
     * Add log entry to history
     */
    private addToHistory(entry: LogEntry): void {
        Logger.logHistory.push(entry);

        // Keep history size under control
        if (Logger.logHistory.length > Logger.MAX_HISTORY_SIZE) {
            Logger.logHistory.shift();
        }
    }

    /**
     * Core logging method
     */
    private log(level: LogLevel, message: string, data?: any): void {
        if (!this.shouldLog(level)) return;

        const entry: LogEntry = {
            level,
            module: this.moduleName,
            message,
            data,
            timestamp: new Date(),
        };

        // Add stack trace for errors if configured
        if (level === LogLevel.ERROR && Logger.config.includeStackTrace) {
            entry.stackTrace = new Error().stack;
        }

        this.addToHistory(entry);

        const formattedMessage = this.formatMessage(level, message, data);

        // Output to console
        switch (level) {
            case LogLevel.DEBUG:
                console.debug(formattedMessage);
                break;
            case LogLevel.INFO:
                console.info(formattedMessage);
                break;
            case LogLevel.WARN:
                console.warn(formattedMessage);
                break;
            case LogLevel.ERROR:
                console.error(formattedMessage);
                if (entry.stackTrace) {
                    console.error(entry.stackTrace);
                }
                break;
        }
    }

    /**
     * Public logging methods
     */
    public debug(message: string, data?: any): void {
        this.log(LogLevel.DEBUG, message, data);
    }

    public info(message: string, data?: any): void {
        this.log(LogLevel.INFO, message, data);
    }

    public warn(message: string, data?: any): void {
        this.log(LogLevel.WARN, message, data);
    }

    public error(message: string, error?: any): void {
        const errorData = error instanceof Error
            ? { message: error.message, stack: error.stack }
            : error;

        this.log(LogLevel.ERROR, message, errorData);
    }

    /**
     * Group logging for related operations
     */
    public group(label: string): void {
        if (Logger.config.enabled) {
            console.group(`📦 [${this.moduleName}] ${label}`);
        }
    }

    public groupEnd(): void {
        if (Logger.config.enabled) {
            console.groupEnd();
        }
    }

    /**
     * Performance timing
     */
    public time(label: string): void {
        if (Logger.config.enabled) {
            console.time(`⏱️ [${this.moduleName}] ${label}`);
        }
    }

    public timeEnd(label: string): void {
        if (Logger.config.enabled) {
            console.timeEnd(`⏱️ [${this.moduleName}] ${label}`);
        }
    }
}

export default Logger;
