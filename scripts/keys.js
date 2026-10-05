const keys = {"w":false,"a":false,"s":false,"d":false};

document.addEventListener("keydown",(event)=>{
    keys[event.key] = true;
});

document.addEventListener("keyup",(event)=>{
    keys[event.key] = false;
});