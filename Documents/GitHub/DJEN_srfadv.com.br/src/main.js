import { SearchService } from './services/searchService.js';
import { DataProcessor } from './utils/dataProcessor.js';
import { ExcelGenerator } from './utils/excelGenerator.js';
import { UIManager } from './ui/uiManager.js';
import loadModal from './utils/termsAndConditions.js';

class CommunicationSearchApp {
    constructor() {
        this.searchService = new SearchService();
        this.uiManager = new UIManager();
    }

    /**
     * Inicializa a aplicação
     */
    init() {
        this.uiManager.init();
        this.setupEventListeners();
        console.log('Aplicação inicializada');
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Substitui a função global obterComunicacoes
        window.obterComunicacoes = () => this.searchCommunications();
        
        // Adiciona listener ao botão se existir
        const button = document.querySelector('button[onclick="obterComunicacoes()"]');
        if (button) {
            button.onclick = () => this.searchCommunications();
        }
    }

    /**
     * Função principal de busca
     */
    async searchCommunications() {
        try {
            // Coleta dados do formulário
            const formData = this.uiManager.getFormData();
            console.log('Dados do formulário:', formData);

            // Validação básica
            if (!this.validateFormData(formData)) {
                return;
            }

            // Inicia busca
            this.uiManager.showLoading("Iniciando busca de comunicações...");

            const searchResult = await this.searchService.searchCommunications(
                formData,
                (current, total) => {
                    this.uiManager.showLoading(
                        "Buscando comunicações...", 
                        current, 
                        total
                    );
                }
            );

            // Verifica se encontrou resultados
            if (searchResult.items.length === 0) {
                this.uiManager.showSuccessModal(0, searchResult.totalPages, "Nenhum resultado encontrado");
                return;
            }

            // Remove duplicatas
            this.uiManager.showLoading("Removendo duplicatas...");
            const deduplicationResult = DataProcessor.removeDuplicates(searchResult.items);

            // Processa dados para Excel
            this.uiManager.showLoading("Processando dados...");
            const processedData = DataProcessor.processForExcel(deduplicationResult.uniqueItems);

            // Gera arquivo Excel
            this.uiManager.showLoading("Gerando arquivo Excel...");
            const fileName = ExcelGenerator.generateFile(processedData);

            // Mostra resultado
            this.uiManager.showSuccessModal(
                deduplicationResult.uniqueItems.length,
                searchResult.totalPages,
                fileName,
                deduplicationResult.duplicatesRemoved,
                deduplicationResult.originalTotal
            );

        } catch (error) {
            console.error('Erro na busca de comunicações:', error);
            this.uiManager.showErrorModal(error.message, error.stack);
        }
    }

    /**
     * Valida dados do formulário
     */
    validateFormData(data) {
        // Adicione validações conforme necessário
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
}

// Inicializa a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    const app = new CommunicationSearchApp();
    app.init();
});

// Exporta para uso global se necessário
window.CommunicationSearchApp = CommunicationSearchApp;

loadModal()