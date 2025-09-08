export default function loadModal(){

    document.addEventListener('DOMContentLoaded', function() {
    // Verifica se já aceitou os termos
    if (!localStorage.getItem('termosAceitos')) {
        var modal = M.Modal.init(document.getElementById('modal-termos'), {
            dismissible: false,
            onCloseEnd: function() {
                if (!localStorage.getItem('termosAceitos')) {
                    alert('Você deve aceitar os termos para usar a ferramenta.');
                    window.location.href = 'about:blank';
                }
            }
        });
        modal.open();
    }
    
    document.getElementById('aceitar-termos').addEventListener('click', function() {
        localStorage.setItem('termosAceitos', 'true');
        localStorage.setItem('dataAceite', new Date().toISOString());
        M.Modal.getInstance(document.getElementById('modal-termos')).close();
    });
});
}

loadModal()