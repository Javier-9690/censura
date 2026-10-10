const form=document.querySelector('#registro'),canvas=document.querySelector('#firma'),ctx=canvas.getContext('2d'),statusEl=document.querySelector('#estado'),save=document.querySelector('#guardar');
ctx.lineWidth=3;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#142a40';let active=null,drawn=false;
function point(e){const r=canvas.getBoundingClientRect();return[(e.clientX-r.left)*canvas.width/r.width,(e.clientY-r.top)*canvas.height/r.height];}
canvas.addEventListener('pointerdown',e=>{if(active!==null)return;e.preventDefault();active=e.pointerId;canvas.setPointerCapture(active);const[x,y]=point(e);ctx.beginPath();ctx.moveTo(x,y);});
canvas.addEventListener('pointermove',e=>{if(e.pointerId!==active)return;const[x,y]=point(e);ctx.lineTo(x,y);ctx.stroke();drawn=true;});
function end(e){if(e.pointerId===active)active=null;}
canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
document.querySelector('#limpiar').onclick=()=>{ctx.clearRect(0,0,canvas.width,canvas.height);drawn=false;};
const rut=document.querySelector('#rut'),nombre=document.querySelector('#nombre');
nombre.addEventListener('change',()=>{rut.value=nombre.selectedOptions[0]?.dataset.rut||'';});
rut.addEventListener('change',()=>{const selected=[...nombre.options].find(option=>option.dataset.rut===rut.value);nombre.selectedIndex=selected?selected.index:0;});
form.addEventListener('submit',async e=>{e.preventDefault();if(!drawn){statusEl.textContent='Dibuja tu firma antes de guardar.';return;}save.disabled=true;statusEl.textContent='Guardando…';try{const response=await fetch('/registrar',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':document.querySelector('meta[name="csrf-token"]').content},body:JSON.stringify({nombre:document.querySelector('#nombre').value,rut:rut.value,firma:canvas.toDataURL('image/png'),consentimiento:document.querySelector('#consentimiento').checked})});let result=await response.json();statusEl.textContent=result.message;if(response.ok){form.reset();ctx.clearRect(0,0,canvas.width,canvas.height);drawn=false;document.querySelector('#nombre').focus();}}catch{statusEl.textContent='No se pudo confirmar el guardado. Revisa la conexión y vuelve a intentar; no cierres la página.';}finally{save.disabled=false;}});
