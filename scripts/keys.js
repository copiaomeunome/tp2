const keys = {"w":false,"a":false,"s":false,"d":false};
const efeitosVisuais = {iluminacao:true,neblina:true};

document.addEventListener("keydown",(event)=>{
    if(event.target instanceof HTMLInputElement) return;
    const tecla = event.key.toLowerCase();
    keys[tecla] = true;
    if(!event.repeat && tecla === "l") efeitosVisuais.iluminacao = !efeitosVisuais.iluminacao;
    if(!event.repeat && tecla === "n") efeitosVisuais.neblina = !efeitosVisuais.neblina;
});

document.addEventListener("keyup",(event)=>{
    keys[event.key.toLowerCase()] = false;
});
window.addEventListener("blur",()=>{
    for(const key in keys) keys[key] = false;
});
document.addEventListener("focusin",(event)=>{
    if(event.target instanceof HTMLInputElement) for(const key in keys) keys[key] = false;
});
