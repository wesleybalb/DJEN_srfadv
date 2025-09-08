import { API_CONFIG, HTTP_STATUS, ERROR_TYPES, REQUEST_HEADERS } from '../config/constants.js';

export class ApiService {
    constructor() {
        this.baseUrl = API_CONFIG.BASE_URL;
        this.headers = REQUEST_HEADERS;
    }

    /**
     * Constrói a URL da API com os parâmetros fornecidos
     */
    buildUrl(params, page = 1) {
        const url = new URL(this.baseUrl);
        
        // Adiciona parâmetros obrigatórios
        url.searchParams.set('page', page);
        url.searchParams.set('size', API_CONFIG.PAGE_SIZE);
        
        // Adiciona parâmetros opcionais se fornecidos
        if (params.nomeParte) url.searchParams.set('nomeParte', params.nomeParte);
        if (params.numeroOab) url.searchParams.set('numeroOab', params.numeroOab);
        if (params.ufOab) url.searchParams.set('ufOab', params.ufOab);
        if (params.dataInicio) url.searchParams.set('dataDisponibilizacaoInicio', params.dataInicio);
        if (params.dataFim) url.searchParams.set('dataDisponibilizacaoFim', params.dataFim);
        if (params.texto) url.searchParams.set('texto', params.texto);
        if (params.siglaTribunal && params.siglaTribunal !== 'null') {
            url.searchParams.set('siglaTribunal', params.siglaTribunal);
        }
        
        return url.toString();
    }

    /**
     * Faz uma requisição para uma página específica
     */
    async fetchPage(params, pageNumber) {
        const url = this.buildUrl(params, pageNumber);
        console.log(`Buscando página ${pageNumber}: ${url}`);
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
            
            const response = await fetch(url, {
                headers: this.headers,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw this.createHttpError(response.status);
            }
            
            const data = await response.json();
            
            if (!this.isValidResponse(data)) {
                throw new Error(ERROR_TYPES.INVALID_RESPONSE);
            }
            
            return data;
            
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error(ERROR_TYPES.TIMEOUT);
            }
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error(ERROR_TYPES.NETWORK_ERROR);
            }
            throw error;
        }
    }

    /**
     * Cria erro HTTP baseado no status code
     */
    createHttpError(status) {
        switch (status) {
            case HTTP_STATUS.INTERNAL_SERVER_ERROR:
                return new Error(ERROR_TYPES.SERVER_ERROR_500);
            case HTTP_STATUS.BAD_GATEWAY:
            case HTTP_STATUS.SERVICE_UNAVAILABLE:
                return new Error(ERROR_TYPES.SERVER_UNAVAILABLE);
            case HTTP_STATUS.NOT_FOUND:
                return new Error(ERROR_TYPES.NOT_FOUND);
            default:
                if (status >= 400 && status < 500) {
                    return new Error(ERROR_TYPES.CLIENT_ERROR);
                }
                return new Error(ERROR_TYPES.UNKNOWN_SERVER_ERROR);
        }
    }

    /**
     * Valida se a resposta da API está no formato esperado
     */
    isValidResponse(data) {
        return data && 
               typeof data === 'object' && 
               data.hasOwnProperty('items') && 
               Array.isArray(data.items);
    }
}