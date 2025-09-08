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
     * Esconde loading
     */
    hideLoading() {
        if (this.searchButton) {
            this.searchButton.disabled = false;
            this.searchButton.textContent = "Baixar Arquivo";
        }
        
        if (this.loadingElement) {
            this.loadingElement.style.display = "none";
        }
    }

    /**
     * Mostra modal de sucesso
     */
    showSuccessModal(totalRecords, pagesSearched, fileName, duplicatesRemoved = 0, originalTotal = 0) {
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
                ${pagesSearched} página(s) pesquisada(s)
            </div>
        `;
        
        if (duplicatesRemoved > 0) {
            summaryContent += `
                <div style="margin-bottom: 10px; font-size: 14px; color: #ff6b35; border-left: 3px solid #ff6b35; padding-left: 10px;">
                    ${duplicatesRemoved} duplicata(s) removida(s)
                </div>
                <div style="margin-bottom: 10px; font-size: 12px; color: #999;">
                    Total original: ${originalTotal} registros
                </div>
            `;
        }
        
        summaryContent += `
            <div style="font-size: 14px; color: #666;">
                Arquivo: <strong>${fileName}</strong>
            </div>
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                padding: 40px;
                border-radius: 15px;
                text-align: center;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                position: relative;
            ">
                <div style="
                    background: #4CAF50;
                    color: white;
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                    font-size: 40px;
                ">✓</div>
                
                <h2 style="
                    color: #333;
                    margin: 0 0 20px 0;
                    font-size: 24px;
                ">Arquivo Gerado com Sucesso!</h2>
                
                <div style="
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 10px;
                    margin: 20px 0;
                    border-left: 4px solid #4CAF50;
                ">
                    ${summaryContent}
                </div>
                
                <button onclick="document.getElementById('modal-sucesso').remove()" style="
                    background: #4CAF50;
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 25px;
                    font-size: 16px;
                    cursor: pointer;
                    transition: background 0.3s ease;
                " onmouseover="this.style.background='#45a049'" onmouseout="this.style.background='#4CAF50'">
                    Fechar
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    /**
     * Mostra modal de erro
     */
    showErrorModal(errorType, details = '') {
        this.hideLoading();
        
        const errorConfig = this.getErrorConfig(errorType);
        
        const modal = document.createElement("div");
        modal.id = "modal-erro";
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
        
        modal.innerHTML = `
            <div style="
                background: white;
                padding: 40px;
                border-radius: 15px;
                text-align: center;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                position: relative;
            ">
                <div style="
                    background: ${errorConfig.color};
                    color: white;
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                    font-size: 40px;
                ">${errorConfig.icon}</div>
                
                <h2 style="
                    color: #333;
                    margin: 0 0 15px 0;
                    font-size: 22px;
                ">${errorConfig.title}</h2>
                
                <p style="
                    color: #666;
                    margin: 0 0 20px 0;
                    font-size: 16px;
                    line-height: 1.5;
                ">${errorConfig.message}</p>
                
                ${details ? `
                    <div style="
                        background: #f8f9fa;
                        padding: 15px;
                        border-radius: 8px;
                        margin: 20px 0;
                        font-size: 14px;
                        color: #666;
                        border-left: 4px solid ${errorConfig.color};
                    ">
                        <strong>Detalhes técnicos:</strong><br>
                        ${details}
                    </div>
                ` : ''}
                
                <button onclick="document.getElementById('modal-erro').remove()" style="
                    background: ${errorConfig.color};
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 25px;
                    font-size: 16px;
                    cursor: pointer;
                    transition: background 0.3s ease;
                ">
                    Entendi
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    /**
     * Configurações de erro
     */
    getErrorConfig(errorType) {
        const configs = {
            [ERROR_TYPES.SERVER_ERROR_500]: {
                title: 'Sistema do CNJ Temporariamente Indisponível',
                message: 'O sistema do CNJ está passando por problemas técnicos no momento. Tente novamente em alguns minutos.',
                icon: '🔧',
                color: '#ff6b35'
            },
            [ERROR_TYPES.SERVER_UNAVAILABLE]: {
                title: 'Serviço Temporariamente Fora do Ar',
                message: 'O sistema do CNJ está em manutenção ou sobrecarregado. Aguarde alguns minutos e tente novamente.',
                icon: '🚧',
                color: '#ff6b35'
            },
            [ERROR_TYPES.NETWORK_ERROR]: {
                title: 'Problema de Conexão',
                message: 'Verifique sua conexão com a internet e tente novamente. Se o problema persistir, pode ser uma instabilidade no sistema do CNJ.',
                icon: '🌐',
                color: '#ff6b35'
            },
            [ERROR_TYPES.TIMEOUT]: {
                title: 'Tempo Limite Excedido',
                message: 'A consulta está demorando mais que o esperado. O sistema do CNJ pode estar lento. Tente novamente com um período menor de datas.',
                icon: '⏱️',
                color: '#ff6b35'
            }
        };
        
        return configs[errorType] || {
            title: 'Erro Inesperado',
            message: 'Ocorreu um problema inesperado ao consultar o sistema do CNJ. Tente novamente em alguns minutos.',
            icon: '❌',
            color: '#dc3545'
        };
    }

    /**
     * Coleta dados do formulário
     */
    getFormData() {
        return {
            nomeParte: document.getElementById("nomeParte")?.value?.trim() || '',
            numeroOab: document.getElementById("OAB")?.value || '',
            ufOab: document.getElementById("UF")?.value || '',
            dataInicio: document.getElementById("dataInicio")?.value || '',
            dataFim: document.getElementById("dataFim")?.value || '',
            texto: document.getElementById("teor")?.value || '',
            siglaTribunal: document.getElementById("Tribunal")?.value || ''
        };
    }
}