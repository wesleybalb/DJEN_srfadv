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
        let totalItems = 0;
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
                
                // Primeira página: calcula total de páginas baseado no count
                if (currentPage === 1) {
                    totalItems = response.count || 0;
                    totalPages = this.calculateTotalPages(totalItems);
                    
                    console.log(`=== INFORMAÇÕES DA CONSULTA ===`);
                    console.log(`Total de itens encontrados: ${totalItems}`);
                    console.log(`Total de páginas calculadas: ${totalPages}`);
                    console.log(`Itens por página: ${API_CONFIG.PAGE_SIZE}`);
                    
                    // Se não há elementos, para imediatamente
                    if (totalItems === 0) {
                        console.log('API retornou 0 elementos. Finalizando busca.');
                        break;
                    }
                    
                    // Atualiza progresso com informação correta
                    if (onProgress) {
                        onProgress(currentPage, totalPages);
                    }
                }

                // Verifica se há itens na página
                if (response.items && response.items.length > 0) {
                    allItems.push(...response.items);
                    console.log(`Página ${currentPage}/${totalPages}: ${response.items.length} itens coletados (Total acumulado: ${allItems.length})`);
                    errorAttempts = 0; // Reset contador de erros
                } else {
                    console.log(`Página ${currentPage}: vazia - finalizando busca`);
                    break; // Para se página vazia
                }

                // Verifica condições de parada
                if (this.shouldStopSearch(currentPage, totalPages, allItems.length, totalItems)) {
                    break;
                }

                currentPage++;
                
                // Pausa entre requisições
                await this.delay(API_CONFIG.REQUEST_DELAY);
                
            } catch (error) {
                const shouldContinue = await this.handleSearchError(
                    error, 
                    currentPage, 
                    errorAttempts,
                    totalPages
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
        console.log(`Total esperado pela API: ${totalItems}`);
        console.log(`Páginas processadas: ${currentPage - 1} de ${totalPages || 'desconhecido'}`);
        
        // Verifica se coletou todos os itens esperados
        if (totalItems > 0 && allItems.length !== totalItems) {
            console.warn(`⚠️ ATENÇÃO: Coletados ${allItems.length} itens, mas API indicava ${totalItems} itens`);
        }

        return {
            items: allItems,
            totalPages: totalPages || (currentPage - 1),
            originalTotal: allItems.length,
            expectedTotal: totalItems,
            collectionComplete: allItems.length === totalItems
        };
    }

    /**
     * Calcula o número total de páginas baseado no count da API
     */
    calculateTotalPages(totalItems) {
        if (totalItems === 0) return 0;
        return Math.ceil(totalItems / API_CONFIG.PAGE_SIZE);
    }

    /**
     * Verifica se deve parar a busca (versão otimizada)
     */
    shouldStopSearch(currentPage, totalPages, collectedItems, expectedTotal) {
        // Para se chegou ao total de páginas calculado
        if (totalPages && currentPage >= totalPages) {
            console.log(`✅ Chegou ao final calculado: página ${currentPage} de ${totalPages}`);
            return true;
        }

        // Para se coletou todos os itens esperados
        if (expectedTotal > 0 && collectedItems >= expectedTotal) {
            console.log(`✅ Coletou todos os itens esperados: ${collectedItems}/${expectedTotal}`);
            return true;
        }

        // Proteção adicional: se passou muito do esperado
        if (totalPages && currentPage > totalPages + 2) {
            console.log(`⚠️ Passou muito do esperado, parando por segurança`);
            return true;
        }

        return false;
    }

    /**
     * Trata erros durante a busca (versão melhorada)
     */
    async handleSearchError(error, currentPage, errorAttempts, totalPages) {
        const pageInfo = totalPages ? `${currentPage}/${totalPages}` : currentPage;
        console.warn(`Erro ao buscar página ${pageInfo}:`, error.message);
        
        switch (error.message) {
            case ERROR_TYPES.SERVER_ERROR_500:
                errorAttempts++;
                if (errorAttempts >= API_CONFIG.MAX_ERROR_RETRIES) {
                    console.error(`❌ Muitos erros 500 na página ${pageInfo}. Parando busca.`);
                    return { continue: false, errorAttempts };
                }
                console.log(`🔄 Tentativa ${errorAttempts}/${API_CONFIG.MAX_ERROR_RETRIES} para página ${pageInfo}`);
                await this.delay(API_CONFIG.RETRY_DELAY);
                return { continue: true, errorAttempts, skipPage: false };
                
            case ERROR_TYPES.SERVER_UNAVAILABLE:
            case ERROR_TYPES.NETWORK_ERROR:
                console.error(`❌ Erro crítico na página ${pageInfo}. Parando busca.`);
                return { continue: false, errorAttempts };
                
            default:
                errorAttempts++;
                if (errorAttempts >= API_CONFIG.MAX_ERROR_RETRIES) {
                    console.error(`❌ Muitos erros na página ${pageInfo}. Parando busca.`);
                    return { continue: false, errorAttempts };
                }
                console.log(`⏭️ Pulando página ${pageInfo} após erro. Tentativa ${errorAttempts}/${API_CONFIG.MAX_ERROR_RETRIES}`);
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