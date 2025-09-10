import { SearchService } from './searchService.js';

export class QuickSearchService {
    constructor() {
        this.searchService = new SearchService();
        this.quickSearchConfig = {
            oabs: [
                { numero: '118093', uf: 'RJ' },
                { numero: '109055', uf: 'RJ' },
                { numero: '232861', uf: 'RJ' }
            ],
            cnpjs: [
                '42.789.521/0001-10',
                '27.659.347/0001-05'
            ]
        };
    }

    /**
     * Executa todas as consultas rápidas
     */
    async executeQuickSearch(dateRange, onProgress) {
        const allResults = [];
        let currentStep = 0;
        const totalSteps = this.quickSearchConfig.oabs.length + this.quickSearchConfig.cnpjs.length;

        console.log('=== INICIANDO CONSULTA RÁPIDA ===');
        console.log(`Total de consultas: ${totalSteps}`);
        console.log('Período:', dateRange);

        try {
            // Consultas por OAB
            for (const oab of this.quickSearchConfig.oabs) {
                currentStep++;
                
                if (onProgress) {
                    onProgress(currentStep, totalSteps, `Consultando OAB ${oab.numero}/${oab.uf}`);
                }

                console.log(`\n=== CONSULTA ${currentStep}/${totalSteps}: OAB ${oab.numero}/${oab.uf} ===`);

                const params = {
                    nomeParte: '',
                    numeroOab: oab.numero,
                    ufOab: oab.uf,
                    dataInicio: dateRange.dataInicio,
                    dataFim: dateRange.dataFim,
                    texto: '',
                    siglaTribunal: ''
                };

                try {
                    const result = await this.searchService.searchCommunications(params);
                    
                    if (result.items.length > 0) {
                        // Adiciona metadados de origem
                        const itemsWithSource = result.items.map(item => ({
                            ...item,
                            _source: `OAB ${oab.numero}/${oab.uf}`,
                            _sourceType: 'OAB'
                        }));
                        
                        allResults.push(...itemsWithSource);
                        console.log(`✅ OAB ${oab.numero}/${oab.uf}: ${result.items.length} itens encontrados`);
                    } else {
                        console.log(`ℹ️ OAB ${oab.numero}/${oab.uf}: Nenhum item encontrado`);
                    }
                } catch (error) {
                    console.error(`❌ Erro na consulta OAB ${oab.numero}/${oab.uf}:`, error);
                    // Continua com as outras consultas mesmo se uma falhar
                }

                // Pausa entre consultas
                await this.delay(1000);
            }

            // Consultas por CNPJ
            for (const cnpj of this.quickSearchConfig.cnpjs) {
                currentStep++;
                
                if (onProgress) {
                    onProgress(currentStep, totalSteps, `Consultando CNPJ ${cnpj}`);
                }

                console.log(`\n=== CONSULTA ${currentStep}/${totalSteps}: CNPJ ${cnpj} ===`);

                const params = {
                    nomeParte: cnpj,
                    numeroOab: '',
                    ufOab: '',
                    dataInicio: dateRange.dataInicio,
                    dataFim: dateRange.dataFim,
                    texto: '',
                    siglaTribunal: ''
                };

                try {
                    const result = await this.searchService.searchCommunications(params);
                    
                    if (result.items.length > 0) {
                        // Adiciona metadados de origem
                        const itemsWithSource = result.items.map(item => ({
                            ...item,
                            _source: `CNPJ ${cnpj}`,
                            _sourceType: 'CNPJ'
                        }));
                        
                        allResults.push(...itemsWithSource);
                        console.log(`✅ CNPJ ${cnpj}: ${result.items.length} itens encontrados`);
                    } else {
                        console.log(`ℹ️ CNPJ ${cnpj}: Nenhum item encontrado`);
                    }
                } catch (error) {
                    console.error(`❌ Erro na consulta CNPJ ${cnpj}:`, error);
                    // Continua com as outras consultas mesmo se uma falhar
                }

                // Pausa entre consultas
                await this.delay(1000);
            }

            console.log('\n=== CONSULTA RÁPIDA FINALIZADA ===');
            console.log(`Total de itens coletados: ${allResults.length}`);

            return {
                items: allResults,
                totalQueries: totalSteps,
                summary: this.generateSummary(allResults)
            };

        } catch (error) {
            console.error('Erro na consulta rápida:', error);
            throw error;
        }
    }

    /**
     * Gera resumo das consultas
     */
    generateSummary(allResults) {
        const summary = {
            total: allResults.length,
            bySource: {},
            byTribunal: {},
            byType: {}
        };

        allResults.forEach(item => {
            // Por fonte
            const source = item._source || 'Desconhecido';
            summary.bySource[source] = (summary.bySource[source] || 0) + 1;

            // Por tribunal
            const tribunal = item.siglaTribunal || 'Desconhecido';
            summary.byTribunal[tribunal] = (summary.byTribunal[tribunal] || 0) + 1;

            // Por tipo
            const type = item.tipoComunicacao || 'Desconhecido';
            summary.byType[type] = (summary.byType[type] || 0) + 1;
        });

        return summary;
    }

    /**
     * Utilitário para delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
