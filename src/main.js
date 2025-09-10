// Versão DEBUG - src/main.js
console.log('🚀 Carregando main.js...');

import { SearchService } from './services/searchService.js';
import { QuickSearchService } from './services/quickSearchService.js';
import { DataProcessor } from './utils/dataProcessor.js';
import { ExcelGenerator } from './utils/excelGenerator.js';
import { UIManager } from './ui/uiManager.js';

console.log('📦 Imports carregados com sucesso');

class CommunicationSearchApp {
    constructor() {
        console.log('🏗️ Construindo CommunicationSearchApp...');
        try {
            this.searchService = new SearchService();
            console.log('✅ SearchService criado');
            
            this.quickSearchService = new QuickSearchService();
            console.log('✅ QuickSearchService criado');
            
            this.uiManager = new UIManager();
            console.log('✅ UIManager criado');
        } catch (error) {
            console.error('❌ Erro no constructor:', error);
        }
    }

    init() {
        console.log('🔧 Inicializando aplicação...');
        try {
            this.uiManager.init();
            console.log('✅ UIManager inicializado');
            
            this.setupEventListeners();
            console.log('✅ Event listeners configurados');
            
            this.initializeMaterialize();
            console.log('✅ Materialize inicializado');
            
            console.log('🎉 Aplicação inicializada com sucesso!');
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
        }
    }

    initializeMaterialize() {
        console.log('🎨 Inicializando Materialize...');
        
        // Inicializa collapsible
        const collapsibles = document.querySelectorAll('.collapsible');
        console.log(`📋 Encontrados ${collapsibles.length} collapsibles`);
        M.Collapsible.init(collapsibles);
        
        // Inicializa datepickers
        const datepickers = document.querySelectorAll('.datepicker');
        console.log(`📅 Encontrados ${datepickers.length} datepickers`);
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

    setupEventListeners() {
        console.log('🔗 Configurando event listeners...');
        
        // Função de busca normal
        window.obterComunicacoes = () => {
            console.log('🔍 Função obterComunicacoes chamada');
            this.searchCommunications();
        };
        
        const button = document.querySelector('button[onclick="obterComunicacoes()"]');
        console.log('�� Botão principal encontrado:', button);
        if (button) {
            button.onclick = () => {
                console.log('🔍 Botão principal clicado');
                this.searchCommunications();
            };
        }

        // Função de consulta rápida
        const quickButton = document.getElementById('btn-consulta-rapida');
        console.log('⚡ Botão consulta rápida encontrado:', quickButton);
        if (quickButton) {
            quickButton.addEventListener('click', () => {
                console.log('⚡ Botão consulta rápida clicado');
                this.executeQuickSearch();
            });
        }
    }

    async executeQuickSearch() {
        console.log('⚡ INICIANDO CONSULTA RÁPIDA');
        try {
            const quickFormData = this.uiManager.getQuickSearchFormData();
            console.log('📝 Dados da consulta rápida:', quickFormData);

            if (!this.validateQuickSearchData(quickFormData)) {
                console.log('❌ Validação falhou');
                return;
            }

            console.log('✅ Validação passou, iniciando consulta...');

            const quickResult = await this.quickSearchService.executeQuickSearch(
                quickFormData,
                (current, total, query) => {
                    console.log(`📊 Progresso: ${current}/${total} - ${query}`);
                    this.uiManager.showQuickSearchLoading(current, total, query);
                }
            );

            console.log('🎯 RESULTADO DA CONSULTA RÁPIDA:', quickResult);

            // Resto do código...
            alert(`Consulta concluída! ${quickResult.items.length} itens encontrados.`);

        } catch (error) {
            console.error('💥 ERRO na consulta rápida:', error);
            alert(`Erro: ${error.message}`);
        }
    }

    validateQuickSearchData(data) {
        console.log('🔍 Validando dados da consulta rápida:', data);
        
        if (!data.dataInicio || !data.dataFim) {
            console.log('❌ Datas não preenchidas');
            alert('Informe o período (Data de Início e Data Final) para a consulta rápida');
            return false;
        }

        const dataInicio = new Date(data.dataInicio);
        const dataFim = new Date(data.dataFim);

        if (dataInicio > dataFim) {
            console.log('❌ Data início maior que data fim');
            alert('A data de início deve ser anterior à data final');
            return false;
        }

        console.log('✅ Validação passou');
        return true;
    }

    // Função de busca normal simplificada para teste
    async searchCommunications() {
        console.log('🔍 INICIANDO BUSCA NORMAL');
        alert('Busca normal iniciada - verifique o console para logs');
    }
}

// Inicialização
console.log('⏳ Aguardando DOM...');
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM carregado, criando app...');
    try {
        const app = new CommunicationSearchApp();
        app.init();
        
        // Torna disponível globalmente para debug
        window.app = app;
        console.log('🌍 App disponível globalmente como window.app');
        
    } catch (error) {
        console.error('💥 ERRO CRÍTICO na inicialização:', error);
    }
});

console.log('📝 main.js carregado completamente');
