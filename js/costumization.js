
const selectCorPersonagem = document.getElementById('corPersonagem');
const corPersonagem = sessionStorage.getItem('corPersonagem');

alterarCorPersonagem(corPersonagem);
selectCorPersonagem.value = corPersonagem;


function confirmar() {
    const corPersonagem = document.getElementById('corPersonagem').value;

    sessionStorage.setItem('corPersonagem', corPersonagem);

    window.location.href = 'index.html';
}


selectCorPersonagem.addEventListener('change', function() {
    const corSelecionada = selectCorPersonagem.value;

    alterarCorPersonagem(corSelecionada);
});

