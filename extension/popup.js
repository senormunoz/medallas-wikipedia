const grid = document.querySelector('#grid');
const status = document.querySelector('#status');
for (const row of MEDALLAS) {
  const label = document.createElement('span'); label.className='label'; label.textContent=row.name; grid.append(label);
  for (const item of row.items) {
    const button=document.createElement('button');
    button.title=`${row.name}: ${item.label} — ${item.text}`;
    button.setAttribute('aria-label',`${row.name}: ${item.label}`);
    const coin=document.createElement('span'); coin.className=item.symbol ? 'injury' : `coin r${item.rank}`; coin.textContent=item.symbol || item.rank; button.append(coin);
    button.addEventListener('click',async()=>{
      const buttons=[...grid.querySelectorAll('button')]; buttons.forEach(b=>b.disabled=true);
      status.textContent='Insertando…';
      try {
        const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
        if (!tab?.id || !tab.url?.startsWith('https://es.wikipedia.org/')) throw new Error('Abre Wikipedia en español en modo edición.');
        const [result]=await chrome.scripting.executeScript({target:{tabId:tab.id},world:'MAIN',func:insertMedal,args:[item.text]});
        if (!result?.result?.ok) throw new Error(result?.result?.message || 'No se pudo acceder al editor.');
        status.textContent=`Insertada: ${row.name}, ${item.label}.`;
      } catch(error) {status.textContent=error.message;}
      finally {buttons.forEach(b=>b.disabled=false);}
    }); grid.append(button);
  }
}
