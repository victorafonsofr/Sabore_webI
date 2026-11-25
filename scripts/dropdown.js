// Dropdowns por clique em telas de toque (celular/tablet).
// Em dispositivos com mouse, o hover do CSS continua funcionando.
const modoToque = window.matchMedia('(hover: none)');

function fecharDropdowns(exceto) {
    document.querySelectorAll('.dropdown.aberto, .dropdown-user.aberto').forEach((d) => {
        if (d !== exceto) d.classList.remove('aberto');
    });
}

document.querySelectorAll('.dropdown-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
        if (!modoToque.matches) return;
        e.preventDefault();
        e.stopPropagation();
        const dropdown = btn.closest('.dropdown, .dropdown-user');
        if (!dropdown) return;
        fecharDropdowns(dropdown);
        dropdown.classList.toggle('aberto');
    });
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown, .dropdown-user')) fecharDropdowns();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fecharDropdowns();
});
