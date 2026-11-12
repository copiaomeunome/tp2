const painelAjuda = document.getElementById("painel-ajuda");
const abrirAjuda = document.getElementById("abrir-ajuda");
const fecharAjuda = document.getElementById("fechar-ajuda");

abrirAjuda.addEventListener("click",()=>{
    for(const tecla in keys) keys[tecla] = false;
    painelAjuda.showModal();
    fecharAjuda.focus();
});
fecharAjuda.addEventListener("click",()=>painelAjuda.close());
painelAjuda.addEventListener("close",()=>{
    if(document.getElementById("historia").hidden) abrirAjuda.focus();
});
// Os atalhos do jogo nao devem interferir na navegacao pelo painel.
painelAjuda.addEventListener("keydown",(event)=>{
    event.stopPropagation();
    if(event.key === "Escape"){
        event.preventDefault();
        painelAjuda.close();
    }
});
painelAjuda.addEventListener("keyup",(event)=>event.stopPropagation());
