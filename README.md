# DJEN Search: busca de publicações no Diário de Justiça Eletrônico Nacional

Ferramenta web para consultar publicações do **DJEN** via API Comunica PJe, desenvolvida para uso de um escritório de advocacia, com busca rápida, tratamento robusto de erros e exportação para Excel.

**Demo:** https://wesleybalb.github.io/DJEN_srfadv/

## Destaques técnicos

- **Arquitetura modular com ES Modules**, separando responsabilidades:
  - `services/` : comunicação com a API, busca completa e busca rápida
  - `ui/` : manipulação da interface
  - `utils/` : processamento de dados e geração de planilhas
  - `config/` : constantes centralizadas (timeouts, limites, códigos HTTP)
- **Resiliência de rede:** timeout de 30s, até 3 novas tentativas com intervalo, atraso entre requisições para evitar bloqueio por excesso de chamadas (HTTP 429)
- **Classificação de erros** (servidor indisponível, timeout, rede, resposta inválida) com mensagens claras ao usuário
- **Exportação para .xlsx** com SheetJS
- Página de **termos de uso** com aceite antes da utilização

## Stack

JavaScript (ES6+ Modules), HTML5, CSS3, Materialize CSS, SheetJS, Fetch API, GitHub Pages.

## Como rodar localmente

```bash
git clone https://github.com/wesleybalb/DJEN_srfadv.git
cd DJEN_srfadv
npx serve .
```

> Por usar ES Modules, a página precisa ser servida por HTTP (não abra o `index.html` direto do disco).

## Estrutura

```
src/
├── config/constants.js
├── services/apiService.js
├── services/searchService.js
├── services/quickSearchService.js
├── ui/uiManager.js
├── utils/dataProcessor.js
├── utils/excelGenerator.js
└── main.js
```

## Autor

Wesley Balbino · [LinkedIn](https://www.linkedin.com/in/wesley-balbino) · [GitHub](https://github.com/wesleybalb)
