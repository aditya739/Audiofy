import { ErrorCode } from '../config/constants';
import Logger from '../utils/Logger';

const logger = Logger.getInstance('ErrorHandler');

/**
 * Custom Application Error Class
 * Extends Error with additional metadata
 */
export class AppError extends Error {
    public readonly code: ErrorCode;
    public readonly timestamp: Date;
    public readonly context?: any;

    constructor(
        message: string,
        code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
        context?: any
    ) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.timestamp = new Date();
        this.context = context;

        // Maintains proper stack trace for where error was thrown
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AppError);
        }
    }

    /**
     * Convert error to JSON for logging/reporting
     */
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            timestamp: this.timestamp,
            context: this.context,
            stack: this.stack,
        };
    }
}

/**
 * Error Handler Service
 * Centralized error handling and reporting
 */
class ErrorHandlerService {
    private static instance: ErrorHandlerService;
    private errorHistory: AppError[] = [];
    private readonly MAX_HISTORY_SIZE = 50;

    private constructor() { }

    /**
     * Get singleton instance
     */
    public static getInstance(): ErrorHandlerService {
        if (!ErrorHandlerService.instance) {
            ErrorHandlerService.instance = new ErrorHandlerService();
        }
        return ErrorHandlerService.instance;
    }

    /**
     * Handle error with logging and tracking
     */
    public handle(error: Error | AppError | unknown, context?: string): void {
        const appError = this.normalizeError(error, context);

        // Add to history
        this.addToHistory(appError);

        // Log the error
        logger.error(`Error in ${context || 'Unknown Context'}`, appError.toJSON());

        // In production, you could send to error tracking service
        // this.reportToService(appError);
    }

    /**
     * Convert any error to AppError
     */
    private normalizeError(error: unknown, context?: string): AppError {
        if (error instanceof AppError) {
            return error;
        }

        if (error instanceof Error) {
            return new AppError(
                error.message,
                this.categorizeError(error),
                { originalError: error.name, context }
            );
        }

        // Handle non-Error objects
        return new AppError(
            String(error),
            ErrorCode.UNKNOWN_ERROR,
            { context }
        );
    }

    /**
     * Categorize error based on type/message
     */
    private categorizeError(error: Error): ErrorCode {
        const message = error.message.toLowerCase();

        if (message.includes('network') || message.includes('fetch')) {
            return ErrorCode.NETWORK_ERROR;
        }

        if (message.includes('api') || message.includes('response')) {
            return ErrorCode.API_ERROR;
        }

        if (message.includes('play') || message.includes('audio')) {
            return ErrorCode.PLAYBACK_ERROR;
        }

        if (message.includes('init') || message.includes('setup')) {
            return ErrorCode.INITIALIZATION_ERROR;
        }

        return ErrorCode.UNKNOWN_ERROR;
    }

    /**
     * Add error to history
     */
    private addToHistory(error: AppError): void {
        this.errorHistory.push(error);

        if (this.errorHistory.length > this.MAX_HISTORY_SIZE) {
            this.errorHistory.shift();
        }
    }

    /**
     * Get error history
     */
    public getHistory(): AppError[] {
        return [...this.errorHistory];
    }

    /**
     * Clear error history
     */
    public clearHistory(): void {
        this.errorHistory = [];
    }

    /**
     * Create specific error types
     */
    public createNetworkError(message: string, context?: any): AppError {
        return new AppError(message, ErrorCode.NETWORK_ERROR, context);
    }

    public createApiError(message: string, context?: any): AppError {
        return new AppError(message, ErrorCode.API_ERROR, context);
    }

    public createPlaybackError(message: string, context?: any): AppError {
        return new AppError(message, ErrorCode.PLAYBACK_ERROR, context);
    }

    public createInitializationError(message: string, context?: any): AppError {
        return new AppError(message, ErrorCode.INITIALIZATION_ERROR, context);
    }
}

// Export singleton instance
export const ErrorHandler = ErrorHandlerService.getInstance();

/**
 * Utility function for try-catch with automatic error handling
 */
export async function handleAsync<T>(
    promise: Promise<T>,
    context?: string
): Promise<[T | null, AppError | null]> {
    try {
        const data = await promise;
        return [data, null];
    } catch (error) {
        const appError = ErrorHandler['normalizeError'](error, context);
        ErrorHandler.handle(appError, context);
        return [null, appError];
    }
}

/**
 * Decorator for automatic error handling (for class methods)
 */
export function HandleErrors(context?: string) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            try {
                return await originalMethod.apply(this, args);
            } catch (error) {
                ErrorHandler.handle(
                    error,
                    context || `${target.constructor.name}.${propertyKey}`
                );
                throw error;
            }
        };

        return descriptor;
    };
}
