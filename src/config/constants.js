// Configurações e constantes da aplicação
export const API_CONFIG = {
    BASE_URL: 'https://comunicaapi.pje.jus.br/api/v1/comunicacao',
    TIMEOUT: 30000,
    MAX_PAGES: 1000,
    PAGE_SIZE: 100,
    MAX_ERROR_RETRIES: 3,
    REQUEST_DELAY: 300,
    RETRY_DELAY: 2000
};

export const HTTP_STATUS = {
    OK: 200,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503
};

export const ERROR_TYPES = {
    SERVER_ERROR_500: 'SERVER_ERROR_500',
    SERVER_UNAVAILABLE: 'SERVER_UNAVAILABLE',
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT: 'TIMEOUT',
    TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
    CLIENT_ERROR: 'CLIENT_ERROR',
    INVALID_RESPONSE: 'INVALID_RESPONSE',
    UNKNOWN_SERVER_ERROR: 'UNKNOWN_SERVER_ERROR'
};

export const REQUEST_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Accept": "application/json"
};