export class DataProcessor {
    /**
     * Remove duplicatas baseado no ID
     */
    static removeDuplicates(items) {
        const foundIds = new Set();
        const uniqueItems = [];
        let duplicatesCount = 0;
        
        console.log('=== REMOVENDO DUPLICATAS ===');
        console.log(`Total de itens para processar: ${items.length}`);
        
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const id = item.id;
            
            if (!id) {
                console.warn(`Item sem ID encontrado no índice ${i}:`, item);
                continue;
            }
            
            if (foundIds.has(id)) {
                duplicatesCount++;
                if (duplicatesCount <= 10) { // Log apenas as primeiras 10 duplicatas
                    console.log(`Duplicata removida - ID: ${id}`);
                }
                continue;
            }
            
            foundIds.add(id);
            uniqueItems.push(item);
        }
        
        console.log(`Total de duplicatas removidas: ${duplicatesCount}`);
        console.log(`Registros únicos: ${uniqueItems.length}`);
        
        return {
            uniqueItems,
            duplicatesRemoved: duplicatesCount,
            originalTotal: items.length
        };
    }

    /**
     * Formata número do processo
     */
    static formatProcessNumber(number) {
        if (!number || number.length !== 20) return number;
        return `${number.slice(0, 7)}-${number.slice(7, 9)}.${number.slice(9, 13)}.${number.slice(13, 14)}.${number.slice(14, 16)}.${number.slice(16)}`;
    }

    /**
     * Processa dados para Excel (versão atualizada)
     */
    static processForExcel(items) {
        console.log('=== PROCESSANDO DADOS PARA EXCEL ===');
        console.log(`Processando ${items.length} itens`);
        
        return items.map((item, index) => {
            if (index < 3) {
                console.log(`Processando item ${index + 1}:`, {
                    id: item.id,
                    data: item.data_disponibilizacao,
                    tribunal: item.siglaTribunal,
                    source: item._source || 'Consulta Manual'
                });
            }
            
            return {
                "ID": item.id || "",
                "Data Disponibilização": item.data_disponibilizacao || "",
                "Tribunal": item.siglaTribunal || "",
                "Tipo Comunicação": item.tipoComunicacao || "",
                "Órgão": item.nomeOrgao || "",
                "Texto": item.texto || "",
                "Número Processo": this.formatProcessNumber(item.numero_processo || ""),
                "Link": item.link || "",
                "Tipo Documento": item.tipoDocumento || "",
                "Classe": item.nomeClasse || "",
                "Número Comunicação": item.numeroComunicacao || "",
                "Status": item.status || "",
                "Meio": item.meiocompleto || "",
                "Destinatários": (item.destinatarios || []).map(dest => dest.nome).join(", "),
                "Advogados": (item.destinatarioadvogados || []).map(adv => adv.advogado.nome).join(", "),
                "Fonte da Consulta": item._source || "Consulta Manual" // Nova coluna
            };
        });
    }
}
