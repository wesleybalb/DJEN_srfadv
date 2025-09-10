import { SearchService } from './services/searchService.js';
import { QuickSearchService } from './services/quickSearchService.js';
import { DataProcessor } from './utils/dataProcessor.js';
import { ExcelGenerator } from './utils/excelGenerator.js';
import { UIManager } from './ui/uiManager.js';

class CommunicationSearchApp {
    constructor() {
        this.searchService = new SearchService();
        this.quickSearchService = new QuickSearchService();
        this.uiManager = new UIManager();
    }

    /**
     * Inicializa a aplicação
     */
    init() {
        this.uiManager.init();
        this.setupEventListeners();
        this.initializeMaterialize();
        console.log('Aplicação inicializada');
    }

    /**
     * Inicializa componentes do Materialize
     */
    initializeMaterialize() {
        // Inicializa collapsible
        const collapsibles = document.querySelectorAll('.collapsible');
        M.Collapsible.init(collapsibles);
        
        // Inicializa datepickers
        const datepickers = document.querySelectorAll('.datepicker');
        M.Datepicker.init(datepickers, {
            format: 'yyyy-mm-dd',
            i18n: {
                months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
                monthsShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                weekdays: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
                weekdaysShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
                weekdaysAbbrev: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
                cancel: 'Cancelar',
                done: 'Confirmar'
            }
        });
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Função de busca normal
        window.obterComunicacoes = () => this.searchCommunications();
        
        const button = document.querySelector('button[onclick="obterComunicacoes()"]');
        if (button) {
            button.onclick = () => this.searchCommunications();
        }

        // Função de consulta rápida
        const quickButton = document.getElementById('btn-consulta-rapida');
        if (quickButton) {
            quickButton.addEventListener('click', () => this.executeQuickSearch());
        }
    }

    /**
     * Função principal de busca (mantida igual)
     */
    async searchCommunications() {
        try {
            const formData = this.uiManager.getFormData();
            console.log('Dados do formulário:', formData);

            if (!this.validateFormData(formData)) {
                return;
            }

            this.uiManager.showLoading("Iniciando busca de comunicações...");

            const searchResult = await this.searchService.searchCommunications(
                formData,
                (current, total) => {
                    const message = total ? 
                        `Buscando comunicações... (${current}/${total} páginas)` : 
                        `Buscando comunicações... (página ${current})`;
                    this.uiManager.showLoading(message, current, total);
                }
            );

            console.log('=== RESULTADO DA BUSCA ===');
            console.log(`Itens coletados: ${searchResult.items.length}`);
            console.log(`Itens esperados: ${searchResult.expectedTotal}`);
            console.log(`Páginas processadas: ${searchResult.totalPages}`);
            console.log(`Coleta completa: ${searchResult.collectionComplete ? 'Sim' : 'Não'}`);

            if (searchResult.items.length === 0) {
                this.uiManager.showSuccessModal(
                    0, 
                    searchResult.totalPages, 
                    "Nenhum resultado encontrado",
                    0,
                    0,
                    { expectedTotal: searchResult.expectedTotal }
                );
                return;
            }

            this.uiManager.showLoading("Removendo duplicatas...");
            const deduplicationResult = DataProcessor.removeDuplicates(searchResult.items);

            this.uiManager.showLoading("Processando dados...");
            const processedData = DataProcessor.processForExcel(deduplicationResult.uniqueItems);

            this.uiManager.showLoading("Gerando arquivo Excel...");
            const fileName = ExcelGenerator.generateFile(processedData);

            this.uiManager.showSuccessModal(
                deduplicationResult.uniqueItems.length,
                searchResult.totalPages,
                fileName,
                deduplicationResult.duplicatesRemoved,
                deduplicationResult.originalTotal,
                {
                    expectedTotal: searchResult.expectedTotal,
                    collectionComplete: searchResult.collectionComplete
                }
            );

        } catch (error) {
            console.error('Erro na busca de comunicações:', error);
            this.uiManager.showErrorModal(error.message, error.stack);
        }
    }

    /**
     * Executa consulta rápida
     */
    async executeQuickSearch() {
        try {
            const quickFormData = this.uiManager.getQuickSearchFormData();
            console.log('Dados da consulta rápida:', quickFormData);

            if (!this.validateQuickSearchData(quickFormData)) {
                return;
            }

            const quickResult = await this.quickSearchService.executeQuickSearch(
                quickFormData,
                (current, total, query) => {
                    this.uiManager.showQuickSearchLoading(current, total, query);
                }
            );

            console.log('=== RESULTADO DA CONSULTA RÁPIDA ===');
            console.log(`Total de itens coletados: ${quickResult.items.length}`);
            console.log(`Consultas realizadas: ${quickResult.totalQueries}`);
            console.log('Resumo:', quickResult.summary);

            if (quickResult.items.length === 0) {
                this.uiManager.showQuickSearchSuccessModal(
                    0,
                    quickResult.totalQueries,
                    "Nenhum resultado encontrado",
                    0,
                    0,
                    quickResult.summary
                );
                return;
            }

            this.uiManager.showLoading("Removendo duplicatas...");
            const deduplicationResult = DataProcessor.removeDuplicates(quickResult.items);

            this.uiManager.showLoading("Processando dados...");
            const processedData = DataProcessor.processForExcel(deduplicationResult.uniqueItems);

            this.uiManager.showLoading("Gerando arquivo Excel...");
            const fileName = ExcelGenerator.generateFile(processedData);

            this.uiManager.showQuickSearchSuccessModal(
                deduplicationResult.uniqueItems.length,
                quickResult.totalQueries,
                fileName,
                deduplicationResult.duplicatesRemoved,
                deduplicationResult.originalTotal,
                quickResult.summary
            );

        } catch (error) {
            console.error('Erro na consulta rápida:', error);
            this.uiManager.showErrorModal(error.message, error.stack);
        }
    }

    /**
     * Valida dados do formulário normal
     */
    validateFormData(data) {
        if (!data.nomeParte && !data.numeroOab && !data.texto) {
            alert('Preencha pelo menos um campo de busca (Nome, OAB ou Teor)');
            return false;
        }

        if (data.numeroOab && !data.ufOab) {
            alert('Informe a UF da OAB');
            return false;
        }

        return true;
    }

    /**
     * Valida dados da consulta rápida
     */
    validateQuickSearchData(data) {
        if (!data.dataInicio || !data.dataFim) {
            alert('Informe o período (Data de Início e Data Final) para a consulta rápida');
            return false;
        }

        const dataInicio = new Date(data.dataInicio);
        const dataFim = new Date(data.dataFim);

        if (dataInicio > dataFim) {
            alert('A data de início deve ser anterior à data final');
            return false;
        }

        // Verifica se o período não é muito longo (mais de 90 dias)
        const diffTime = Math.abs(dataFim - dataInicio);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 90) {
            const confirm = window.confirm(
                `O período selecionado é de ${diffDays} dias. ` +
                'Períodos longos podem resultar em muitos dados e demorar mais para processar. ' +
                'Deseja continuar?'
            );
            if (!confirm) {
                return false;
            }
        }

        return true;
    }
}

// Inicializa a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    const app = new CommunicationSearchApp();
    app.init();
});

// Exporta para uso global se necessário
window.CommunicationSearchApp = CommunicationSearchApp;
