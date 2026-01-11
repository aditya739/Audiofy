import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { API_CONFIG } from '../config/constants';
import Logger from '../utils/Logger';
import { ErrorHandler, AppError } from '../utils/ErrorHandler';

const logger = Logger.getInstance('ApiClient');

/**
 * API Response Interface
 */
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

/**
 * Request Configuration
 */
interface RequestConfig extends AxiosRequestConfig {
    retryCount?: number;
}

/**
 * Base API Client Class
 * Provides common HTTP methods with error handling and retry logic
 * 
 * This follows the Single Responsibility Principle - handles only HTTP communication
 */
export abstract class BaseApiClient {
    protected client: AxiosInstance;
    protected baseURL: string;

    constructor(baseURL: string = API_CONFIG.BASE_URL) {
        this.baseURL = baseURL;
        this.client = this.createAxiosInstance();
        this.setupInterceptors();
    }

    /**
     * Create axios instance with default configuration
     */
    private createAxiosInstance(): AxiosInstance {
        logger.info('Creating API client', { baseURL: this.baseURL });

        return axios.create({
            baseURL: this.baseURL,
            timeout: API_CONFIG.TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    /**
     * Setup request and response interceptors
     */
    private setupInterceptors(): void {
        // Request interceptor
        this.client.interceptors.request.use(
            (config) => {
                logger.debug('API Request', {
                    method: config.method?.toUpperCase(),
                    url: config.url,
                    params: config.params,
                });
                return config;
            },
            (error) => {
                logger.error('Request interceptor error', error);
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.client.interceptors.response.use(
            (response) => {
                logger.debug('API Response', {
                    status: response.status,
                    url: response.config.url,
                });
                return response;
            },
            async (error: AxiosError) => {
                return this.handleResponseError(error);
            }
        );
    }

    /**
     * Handle response errors with retry logic
     */
    private async handleResponseError(error: AxiosError): Promise<any> {
        const config = error.config as RequestConfig;

        if (!config) {
            return Promise.reject(error);
        }

        // Initialize retry count
        config.retryCount = config.retryCount || 0;

        // Check if we should retry
        if (
            config.retryCount < API_CONFIG.RETRY_ATTEMPTS &&
            this.shouldRetry(error)
        ) {
            config.retryCount++;

            logger.warn(`Retrying request (${config.retryCount}/${API_CONFIG.RETRY_ATTEMPTS})`, {
                url: config.url,
                error: error.message,
            });

            // Wait before retrying
            await this.delay(API_CONFIG.RETRY_DELAY * config.retryCount);

            return this.client.request(config);
        }

        // Log the error
        logger.error('API request failed', {
            url: config.url,
            status: error.response?.status,
            message: error.message,
        });

        return Promise.reject(error);
    }

    /**
     * Determine if request should be retried
     */
    private shouldRetry(error: AxiosError): boolean {
        // Retry on network errors or 5xx server errors
        return (
            !error.response ||
            (error.response.status >= 500 && error.response.status < 600)
        );
    }

    /**
     * Delay helper for retry logic
     */
    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Generic GET request
     */
    protected async get<T>(
        endpoint: string,
        params?: any,
        config?: AxiosRequestConfig
    ): Promise<T> {
        try {
            logger.time(`GET ${endpoint}`);

            const response = await this.client.get<T>(endpoint, {
                params,
                ...config,
            });

            logger.timeEnd(`GET ${endpoint}`);
            return response.data;
        } catch (error) {
            ErrorHandler.handle(error, `GET ${endpoint}`);
            throw error;
        }
    }

    /**
     * Generic POST request
     */
    protected async post<T>(
        endpoint: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<T> {
        try {
            logger.time(`POST ${endpoint}`);

            const response = await this.client.post<T>(endpoint, data, config);

            logger.timeEnd(`POST ${endpoint}`);
            return response.data;
        } catch (error) {
            ErrorHandler.handle(error, `POST ${endpoint}`);
            throw error;
        }
    }

    /**
     * Generic PUT request
     */
    protected async put<T>(
        endpoint: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<T> {
        try {
            logger.time(`PUT ${endpoint}`);

            const response = await this.client.put<T>(endpoint, data, config);

            logger.timeEnd(`PUT ${endpoint}`);
            return response.data;
        } catch (error) {
            ErrorHandler.handle(error, `PUT ${endpoint}`);
            throw error;
        }
    }

    /**
     * Generic DELETE request
     */
    protected async delete<T>(
        endpoint: string,
        config?: AxiosRequestConfig
    ): Promise<T> {
        try {
            logger.time(`DELETE ${endpoint}`);

            const response = await this.client.delete<T>(endpoint, config);

            logger.timeEnd(`DELETE ${endpoint}`);
            return response.data;
        } catch (error) {
            ErrorHandler.handle(error, `DELETE ${endpoint}`);
            throw error;
        }
    }
}
