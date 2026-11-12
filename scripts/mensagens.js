const historia = document.getElementById("historia");
const parte1 = document.getElementById("historia-parte-1");
const parte2 = document.getElementById("historia-parte-2");
const evolucao = document.getElementById("historia-evolucao");
const sprite = document.getElementById("historia-sprite");
const ajuda = document.getElementById("abrir-ajuda");

export function historiaAberta() {
    return !historia.hidden;
}

function fecharHistoria() {
    historia.hidden = true;
    ajuda.inert = false;
    ajuda.focus();
}

document.getElementById("historia-proximo").addEventListener("click",()=>{
    parte1.hidden = true;
    parte2.hidden = false;
    document.getElementById("historia-jogar").focus();
    historia.scrollTop = 0;
});
document.getElementById("historia-jogar").addEventListener("click",fecharHistoria);
document.getElementById("historia-continuar").addEventListener("click",fecharHistoria);

// Enquanto a mensagem estiver aberta, suas teclas nao acionam o jogo.
historia.addEventListener("keydown",(event)=>{
    event.stopPropagation();
    if(event.key === "Tab") event.preventDefault();
});
historia.addEventListener("keyup",(event)=>event.stopPropagation());
document.getElementById("historia-proximo").focus();

export function mostrarMensagemEvolucao() {
    const painelAjuda = document.getElementById("painel-ajuda");
    if(painelAjuda.open) painelAjuda.close();
    for(const tecla in keys) keys[tecla] = false;
    parte1.hidden = true;
    parte2.hidden = true;
    evolucao.hidden = false;
    sprite.src = "assets/sprites/marowak-gba.png";
    sprite.alt = "Marowak";
    historia.hidden = false;
    ajuda.inert = true;
    historia.scrollTop = 0;
    document.getElementById("historia-continuar").focus();
}
