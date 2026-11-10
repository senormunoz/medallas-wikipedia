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
        const targetDoc = model.getDocument();
        const importer = ve.ui?.MWWikitextStringTransferHandler?.static;
        if (!target.parseWikitextFragment || !importer?.createDocumentFromParsoidHtml) {
          throw new Error('El editor visual aún no está preparado. Vuelve a intentarlo.');
        }
        const result = await target.parseWikitextFragment(`MEDALLASINICIO${wikitext}MEDALLASFIN`, false, targetDoc);
        const html = result?.visualeditor?.content;
        if (typeof html !== 'string' || !html) throw new Error('No se pudo convertir la medalla para el editor visual.');
        // Parse in an inline context so images and templates are not block nodes.
        const inlineHtml = html.replace('MEDALLASINICIO', '').replace('MEDALLASFIN', '');
        // Use VE's native wikitext importer: it strips parser IDs and converts in
        // clipboard mode, preserving MediaWiki image/template semantics.
        const converted = importer.createDocumentFromParsoidHtml(inlineHtml, targetDoc);
        const range = converted.getDocumentRange();
        if (converted.data.getType(0) !== 'paragraph' || converted.data.getType(range.end - 1) !== '/paragraph') {
          throw new Error('No se pudo preparar la medalla como contenido en línea.');
        }
        // Exclude the parser's paragraph; retain the converted document's store.
        fragment.insertDocument(converted, new ve.Range(1, range.end - 1)).collapseToEnd().select();
      }
      surface.getView().focus();
      return {ok:true};
    }
    // WikiEditor's textSelection API also handles its CodeMirror integration.
    const textarea = document.querySelector('#wpTextbox1');
    if (!textarea) return {ok:false,message:'Activa «Editar» o «Editar código» y coloca el cursor donde quieras insertar la medalla.'};
    const editor = globalThis.jQuery?.(textarea);
    if (editor && typeof editor.textSelection === 'function') {
      const start = editor.textSelection('getCaretPosition');
      editor.textSelection('replaceSelection', wikitext);
      const end = start + wikitext.length;
      editor.textSelection('setSelection', {start:end, end});
    } else {
      if (textarea.offsetParent === null) return {ok:false,message:'Este editor de código no es compatible. Desactiva el resaltado de sintaxis e inténtalo de nuevo.'};
      textarea.setRangeText(wikitext,textarea.selectionStart,textarea.selectionEnd,'end');
      textarea.dispatchEvent(new Event('input',{bubbles:true}));
    }
    textarea.focus();
    return {ok:true};
  } catch (error) { return {ok:false,message:error.message || 'No se pudo insertar la medalla. Inténtalo de nuevo.'}; }
}
