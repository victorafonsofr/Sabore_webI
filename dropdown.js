// Dropdowns por clique em telas de toque (celular/tablet).
// Em dispositivos com mouse, o hover do CSS continua funcionando.
const modoToque = window.matchMedia('(hover: none)');

function fecharDropdowns(exceto) {
    document.querySelectorAll('.dropdown.aberto, .dropdown-user.aberto').forEach((d) => {
        if (d !== exceto) d.classList.remove('aberto');
    });
}

// Abrir/fechar ao clicar no botão
document.querySelectorAll('.dropdown-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
        if (!modoToque.matches) return;
        e.stopPropagation();
        const dropdown = btn.closest('.dropdown, .dropdown-user');
        if (!dropdown) return;
        fecharDropdowns(dropdown);
        dropdown.classList.toggle('aberto');
    });
});

// Clicar fora fecha
document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown, .dropdown-user')) fecharDropdowns();
});

// Esc fecha
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fecharDropdowns();
});
