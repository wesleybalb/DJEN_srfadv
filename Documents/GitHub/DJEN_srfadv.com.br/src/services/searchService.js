import { ApiService } from './apiService.js';
import { API_CONFIG, ERROR_TYPES } from '../config/constants.js';

export class SearchService {
    constructor() {
        this.apiService = new ApiService();
    }

    /**
     * Executa a busca completa de comunicações
     */
    async searchCommunications(params, onProgress) {
        let allItems = [];
        let currentPage = 1;
        let totalPages = null;
        let errorAttempts = 0;

        console.log('=== INICIANDO BUSCA DE COMUNICAÇÕES ===');
        console.log('Parâmetros:', params);

        while (currentPage <= API_CONFIG.MAX_PAGES) {
            // Atualiza progresso
            if (onProgress) {
                onProgress(currentPage, totalPages);
            }

            try {
                const response = await this.apiService.fetchPage(params, currentPage);
                
                // Primeira página: captura informações de paginação
                if (currentPage === 1) {
                    totalPages = response.totalPages || null;
                    console.log(`Total de páginas: ${totalPages}`);
                    console.log(`Total de elementos: ${response.totalElements || 'não informado'}`);
                    
                    if (response.totalElements === 0) {
                        console.log('API retornou 0 elementos. Finalizando busca.');
                        break;
                    }
                }

                // Verifica se há itens na página
                if (response.items && response.items.length > 0) {
                    allItems.push(...response.items);
                    console.log(`Página ${currentPage}: ${response.items.length} itens encontrados`);
                    errorAttempts = 0; // Reset contador de erros
                } else {
                    console.log(`Página ${currentPage}: vazia`);
                    break; // Para se página vazia
                }

                // Verifica condições de parada
                if (this.shouldStopSearch(response, currentPage, totalPages)) {
                    break;
                }

                currentPage++;
                
                // Pausa entre requisições
                await this.delay(API_CONFIG.REQUEST_DELAY);
                
            } catch (error) {
                const shouldContinue = await this.handleSearchError(
                    error, 
                    currentPage, 
                    errorAttempts
                );
                
                if (!shouldContinue.continue) {
                    throw error;
                }
                
                errorAttempts = shouldContinue.errorAttempts;
                if (shouldContinue.skipPage) {
                    currentPage++;
                }
            }
        }

        console.log(`=== BUSCA FINALIZADA ===`);
        console.log(`Total de itens coletados: ${allItems.length}`);
        console.log(`Páginas processadas: ${currentPage - 1}`);

        return {
            items: allItems,
            totalPages: currentPage - 1,
            originalTotal: allItems.length
        };
    }

    /**
     * Verifica se deve parar a busca
     */
    shouldStopSearch(response, currentPage, totalPages) {
        // Para se chegou ao total de páginas informado pela API
        if (totalPages && currentPage >= totalPages) {
            console.log(`Chegou ao final: página ${currentPage} de ${totalPages}`);
            return true;
        }

        // Para se a página tem menos itens que o tamanho padrão (última página)
        if (response.items.length < API_CONFIG.PAGE_SIZE) {
            console.log(`Última página detectada: apenas ${response.items.length} itens`);
            return true;
        }

        return false;
    }

    /**
     * Trata erros durante a busca
     */
    async handleSearchError(error, currentPage, errorAttempts) {
        console.warn(`Erro ao buscar página ${currentPage}:`, error.message);
        
        switch (error.message) {
            case ERROR_TYPES.SERVER_ERROR_500:
                errorAttempts++;
                if (errorAttempts >= API_CONFIG.MAX_ERROR_RETRIES) {
                    return { continue: false, errorAttempts };
                }
                await this.delay(API_CONFIG.RETRY_DELAY);
                return { continue: true, errorAttempts, skipPage: false };
                
            case ERROR_TYPES.SERVER_UNAVAILABLE:
            case ERROR_TYPES.NETWORK_ERROR:
                return { continue: false, errorAttempts };
                
            default:
                errorAttempts++;
                if (errorAttempts >= API_CONFIG.MAX_ERROR_RETRIES) {
                    return { continue: false, errorAttempts };
                }
                return { continue: true, errorAttempts, skipPage: true };
        }
    }

    /**
     * Utilitário para delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}