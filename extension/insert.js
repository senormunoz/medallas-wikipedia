// Runs in the page's MAIN world so MediaWiki's editor APIs are available.
async function insertMedal(wikitext) {
  if (location.hostname !== 'es.wikipedia.org') return {ok:false,message:'Abre una página de Wikipedia en español en modo edición.'};
  try {
    const target = globalThis.ve?.init?.target;
    const surface = target?.getSurface?.();
    if (surface && target.active !== false) {
      const model = surface.getModel();
      const fragment = model.getFragment(); // Capture selection before the async conversion.
      if (surface.getMode() === 'source') {
        fragment.insertContent(wikitext).collapseToEnd().select();
      } else {
        const result = await new mw.Api().post({action:'visualeditor',paction:'parse',page:mw.config.get('wgRelevantPageName'),wikitext});
        const html = result?.visualeditor?.content;
        if (typeof html !== 'string' || !html) throw new Error('No se pudo convertir la medalla para el editor visual.');
        fragment.insertHtml(html).collapseToEnd().select();
      }
      surface.getView().focus();
      return {ok:true};
    }
    // WikiEditor's textSelection API also handles its CodeMirror integration.
    const textarea = document.querySelector('#wpTextbox1');
    if (!textarea) return {ok:false,message:'Activa «Editar» o «Editar código» y coloca el cursor donde quieras insertar la medalla.'};
    const editor = globalThis.jQuery?.(textarea);
    if (editor && typeof editor.textSelection === 'function') {
      editor.textSelection('encapsulateSelection',{pre:wikitext,peri:'',post:'',replace:true});
      editor.textSelection('setSelection',{start:editor.textSelection('getCaretPosition')});
    } else {
      if (textarea.offsetParent === null) return {ok:false,message:'Este editor de código no es compatible. Desactiva el resaltado de sintaxis e inténtalo de nuevo.'};
      textarea.setRangeText(wikitext,textarea.selectionStart,textarea.selectionEnd,'end');
      textarea.dispatchEvent(new Event('input',{bubbles:true}));
    }
    textarea.focus();
    return {ok:true};
  } catch (error) { return {ok:false,message:error.message || 'No se pudo insertar la medalla. Inténtalo de nuevo.'}; }
}
