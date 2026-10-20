const keys = {"w":false,"a":false,"s":false,"d":false};

document.addEventListener("keydown",(event)=>{
    keys[event.key.toLowerCase()] = true;
});

document.addEventListener("keyup",(event)=>{
    keys[event.key.toLowerCase()] = false;
});
window.addEventListener("blur",()=>{
    for(const key in keys) keys[key] = false;
});
