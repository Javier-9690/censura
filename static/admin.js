document.querySelectorAll('.delete-form').forEach(form=>form.addEventListener('submit',e=>{if(!confirm('¿Eliminar definitivamente este registro y su firma?'))e.preventDefault();}));
