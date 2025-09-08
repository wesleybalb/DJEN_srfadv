export class ExcelGenerator {
    /**
     * Gera arquivo Excel
     */
    static generateFile(processedData) {
        console.log('=== GERANDO ARQUIVO EXCEL ===');
        console.log(`Dados para Excel - Total de registros: ${processedData.length}`);
        
        if (!processedData || processedData.length === 0) {
            throw new Error('Nenhum dado para gerar Excel');
        }

        // Cria worksheet
        const ws = XLSX.utils.json_to_sheet(processedData);
        
        // Cria workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Comunicações OAB");
        
        // Gera nome do arquivo
        const fileName = this.generateFileName();
        
        // Salva arquivo
        XLSX.writeFile(wb, fileName);
        
        console.log(`Arquivo Excel gerado: ${fileName}`);
        return fileName;
    }

    /**
     * Gera nome do arquivo com timestamp
     */
    static generateFileName() {
        const now = new Date();
        const timestamp = `${now.getFullYear()}_${(now.getMonth() + 1).toString().padStart(2, '0')}_${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
        return `comunicacoes_oab_${timestamp}.xlsx`;
    }
}