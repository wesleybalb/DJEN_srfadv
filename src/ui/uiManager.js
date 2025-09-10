import { ERROR_TYPES } from '../config/constants.js';

export class UIManager {
    constructor() {
        this.loadingElement = null;
        this.searchButton = null;
    }

    /**
     * Inicializa elementos da UI
     */
    init() {
        this.searchButton = document.querySelector('button[onclick="obterComunicacoes()"]');
        if (this.searchButton) {
            this.searchButton.onclick = null; // Remove o onclick inline
        }
    }

    /**
     * Mostra loading com progresso
     */
    showLoading(message, current = null, total = null) {
        if (this.searchButton) {
            this.searchButton.disabled = true;
            this.searchButton.textContent = "Carregando...";
        }
        
        console.log(message);
        
        if (!this.loadingElement) {
            this.createLoadingElement();
        }
        
        this.updateLoadingContent(message, current, total);
        this.loadingElement.style.display = "block";
    }

    /**
     * Cria elemento de loading
     */
    createLoadingElement() {
        this.loadingElement = document.createElement("div");
        this.loadingElement.id = "loading-message";
        this.loadingElement.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 30px;
            border-radius: 10px;
            z-index: 9999;
            font-family: Arial, sans-serif;
            text-align: center;
            min-width: 300px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        `;
        document.body.appendChild(this.loadingElement);
    }

    /**
     * Atualiza conteúdo do loading
     */
    updateLoadingContent(message, current, total) {
        let content = `<div style="margin-bottom: 15px; font-size: 16px;">${message}</div>`;
        
        if (current !== null && total !== null && total !== '?') {
            const percentage = Math.round((current / total) * 100);
            content += `
                <div style="margin-bottom: 10px;">
                    <div style="background: #333; border-radius: 10px; padding: 3px; margin: 10px 0;">
                        <div style="background: linear-gradient(90deg, #4CAF50, #45a049); height: 20px; border-radius: 7px; width: ${percentage}%; transition: width 0.3s ease;"></div>
                    </div>
                    <div style="font-size: 14px; color: #ccc;">${current} de ${total} páginas (${percentage}%)</div>
                </div>
            `;
        } else if (current !== null) {
            content += `
                <div style="font-size: 14px; color: #ccc; margin-bottom: 10px;">
                    Página ${current} ${total ? `de ${total}` : ''}
                </div>
            `;
        }
        
        content += `
            <div style="margin-top: 15px;">
                <div style="display: inline-block; width: 20px; height: 20px; border: 3px solid #333; border-top: 3px solid #4CAF50; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        
        this.loadingElement.innerHTML = content;
    }

    /**
     * Mostra loading para consulta rápida
     */
    showQuickSearchLoading(currentStep, totalSteps, currentQuery) {
        if (this.searchButton) {
            this.searchButton.disabled = true;
        }
        
        // Desabilita botão de consulta rápida
        const quickButton = document.getElementById('btn-consulta-rapida');
        if (quickButton) {
            quickButton.disabled = true;
            quickButton.innerHTML = '<i class="material-icons left">hourglass_empty</i>Processando...';
        }
        
        if (!this.loadingElement) {
            this.createLoadingElement();
        }
        
        const percentage = Math.round((currentStep / totalSteps) * 100);
        
        const content = `
            <div style="margin-bottom: 15px; font-size: 18px; font-weight: bold;">
                Consulta Rápida em Andamento
            </div>
            <div style="margin-bottom: 15px; font-size: 14px; color: #ccc;">
                ${currentQuery}
            </div>
            <div style="margin-bottom: 10px;">
                <div style="background: #333; border-radius: 10px; padding: 3px; margin: 10px 0;">
                    <div style="background: linear-gradient(90deg, #2196F3, #1976D2); height: 20px; border-radius: 7px; width: ${percentage}%; transition: width 0.3s ease;"></div>
                </div>
                <div style="font-size: 14px; color: #ccc;">Consulta ${currentStep} de ${totalSteps} (${percentage}%)</div>
            </div>
            <div style="margin-top: 15px;">
                <div style="display: inline-block; width: 20px; height: 20px; border: 3px solid #333; border-top: 3px solid #2196F3; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        
        this.loadingElement.innerHTML = content;
        this.loadingElement.style.display = "block";
    }

    /**
     * Esconde loading
     */
    hideLoading() {
        if (this.searchButton) {
            this.searchButton.disabled = false;
            this.searchButton.textContent = "Baixar Arquivo";
        }
        
        // Reabilita botão de consulta rápida
        const quickButton = document.getElementById('btn-consulta-rapida');
        if (quickButton) {
            quickButton.disabled = false;
            quickButton.innerHTML = '<i class="material-icons left">search</i>Executar Consulta Rápida';
        }
        
        if (this.loadingElement) {
            this.loadingElement.style.display = "none";
        }
    }

    /**
     * Mostra modal de sucesso (versão atualizada)
     */
    showSuccessModal(totalRecords, pagesSearched, fileName, duplicatesRemoved = 0, originalTotal = 0, additionalInfo = {}) {
        this.hideLoading();
        
        const modal = document.createElement("div");
        modal.id = "modal-sucesso";
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Arial, sans-serif;
        `;
        
        let summaryContent = `
            <div style="margin-bottom: 10px; font-size: 16px; color: #333;">
                <strong>${totalRecords}</strong> comunicações únicas encontradas
            </div>
            <div style="margin-bottom: 10px; font-size: 14px; color: #666;">
                ${pagesSearched} página(s) processada(s)
            </div>
        `;
        
        // Adiciona informação sobre total esperado se disponível
        if (additionalInfo.expectedTotal && additionalInfo.expectedTotal > 0) {
            const completionStatus = additionalInfo.collectionComplete ? 
                '<span style="color: #059669;">✓ Coleta completa</span>' : 
                '<span style="color: #d97706;">⚠ Coleta parcial</span>';
            
            summaryContent += `
                <div style="margin-bottom: 10px; font-size: 14px; color: #666;">
                    Total esperado pela API: <strong>${additionalInfo.expectedTotal}</strong>
                </div>
                <div style="margin-bottom: 10px; font-size: 14px;">
                    Status: ${completionStatus}
                </div>
            `;
        }
        
        if (duplicatesRemoved > 0) {
            summaryContent += `
                <div style="margin-bottom: 10px; font-size: 14px; color: #ff6b35; border-left: 3px solid #ff6b35; padding-left: 10px;">
                    ${duplicatesRemoved} duplicata(s) removida(s)
                </div>
                <div style="margin-bottom: 10px; font-size: 12px; color: #999;">
                    Total original coletado: ${originalTotal} registros
                </div>
            `;
        }
        
        summaryContent += `
            
