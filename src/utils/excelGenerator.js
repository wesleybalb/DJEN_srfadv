export class ExcelGenerator {
    /**
     * Gera arquivo Excel com os dados processados
     */
    static generateFile(data) {
        console.log('=== GERANDO ARQUIVO EXCEL ===');
        console.log(`Gerando arquivo com ${data.length} registros`);
        
        try {
            // Processa dados para garantir que não excedam limites do Excel
            const processedData = this.sanitizeDataForExcel(data);
            
            // Cria workbook
            const wb = XLSX.utils.book_new();
            
            // Cria worksheet
            const ws = XLSX.utils.json_to_sheet(processedData);
            
            // Configura larguras das colunas
            this.setColumnWidths(ws);
            
            // Adiciona worksheet ao workbook
            XLSX.utils.book_append_sheet(wb, ws, "Comunicações DJEN");
            
            // Gera nome do arquivo
            const fileName = this.generateFileName();
            
            // Salva arquivo
            XLSX.writeFile(wb, fileName);
            
            console.log(`✅ Arquivo Excel gerado: ${fileName}`);
            return fileName;
            
        } catch (error) {
            console.error('❌ Erro ao gerar arquivo Excel:', error);
            throw new Error(`Erro ao gerar arquivo Excel: ${error.message}`);
        }
    }

    /**
     * Sanitiza dados para Excel (resolve limite de 32767 caracteres)
     */
    static sanitizeDataForExcel(data) {
        const MAX_CELL_LENGTH = 32767; // Limite do Excel
        const TRUNCATE_LENGTH = 32700; // Margem de segurança
        
        console.log('🧹 Sanitizando dados para Excel...');
        
        return data.map((row, index) => {
            const sanitizedRow = {};
            
            Object.keys(row).forEach(key => {
                let value = row[key];
                
                // Converte para string se necessário
                if (value !== null && value !== undefined) {
                    value = String(value);
                    
                    // Verifica se excede o limite
                    if (value.length > MAX_CELL_LENGTH) {
                        console.warn(`⚠️ Registro ${index + 1}, coluna "${key}": texto truncado de ${value.length} para ${TRUNCATE_LENGTH} caracteres`);
                        value = value.substring(0, TRUNCATE_LENGTH) + '... [TEXTO TRUNCADO]';
                    }
                    
                    // Remove caracteres problemáticos
                    value = this.cleanText(value);
                }
                
                sanitizedRow[key] = value || '';
            });
            
            return sanitizedRow;
        });
    }

    /**
     * Limpa texto removendo caracteres problemáticos
     */
    static cleanText(text) {
        if (!text) return '';
        
        return text
            // Remove caracteres de controle (exceto quebras de linha e tabs)
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
            // Normaliza quebras de linha
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            // Remove múltiplas quebras de linha consecutivas
            .replace(/\n{3,}/g, '\n\n')
            // Trim espaços extras
            .trim();
    }

    /**
     * Configura larguras das colunas
     */
    static setColumnWidths(worksheet) {
        const columnWidths = {
            'ID': 15,
            'Data Disponibilização': 18,
            'Tribunal': 12,
            'Tipo Comunicação': 18,
            'Órgão': 25,
            'Texto': 50, // Coluna mais larga para textos
            'Número Processo': 25,
            'Link': 30,
            'Tipo Documento': 18,
            'Classe': 20,
            'Número Comunicação': 20,
            'Status': 12,
            'Meio': 15,
            'Destinatários': 30,
            'Advogados': 30,
            'Fonte da Consulta': 20
        };

        // Aplica larguras
        worksheet['!cols'] = Object.values(columnWidths).map(width => ({ width }));
        
        console.log('📏 Larguras das colunas configuradas');
    }

    /**
     * Gera nome único para o arquivo
     */
    static generateFileName() {
        const now = new Date();
        const timestamp = now.toISOString()
            .replace(/[:.]/g, '-')
            .replace('T', '_')
            .substring(0, 19);
        
        return `comunicacoes_djen_${timestamp}.xlsx`;
    }

    /**
     * Estatísticas dos dados processados
     */
    static getDataStatistics(data) {
        if (!data || data.length === 0) {
            return {
                totalRecords: 0,
                totalColumns: 0,
                largestCellSize: 0
            };
        }

        let largestCellSize = 0;
        const totalColumns = Object.keys(data[0]).length;

        data.forEach(row => {
            Object.values(row).forEach(value => {
                if (value) {
                    const cellSize = String(value).length;
                    if (cellSize > largestCellSize) {
                        largestCellSize = cellSize;
                    }
                }
            });
        });

        return {
            totalRecords: data.length,
            totalColumns,
            largestCellSize
        };
    }
}
