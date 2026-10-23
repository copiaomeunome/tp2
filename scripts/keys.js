const keys = {"w":false,"a":false,"s":false,"d":false};

document.addEventListener("keydown",(event)=>{
    if(event.target instanceof HTMLInputElement) return;
    keys[event.key.toLowerCase()] = true;
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
