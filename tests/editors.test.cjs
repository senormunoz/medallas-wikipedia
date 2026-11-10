const {test}=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const fs=require('node:fs');
const source=fs.readFileSync('extension/insert.js','utf8');
function context(extra={}){const c={location:{hostname:'es.wikipedia.org'},...extra};vm.createContext(c);vm.runInContext(source,c);return c;}
test('catalog preserves all 36 exact codes including As and AS',()=>{const c={};vm.createContext(c);vm.runInContext(fs.readFileSync('extension/catalog.js','utf8'),c);assert.equal(c.MEDALLAS.length,13);assert.equal(c.MEDALLAS.flatMap(r=>r.items).length,37);assert.equal(c.MEDALLAS[12].items[0].text,'[[Imagen:Injury icon 2.svg|15px]]');assert.equal(c.MEDALLAS[5].items[0].text,'{{Medalla|1|As}}');assert.equal(c.MEDALLAS[10].items[0].text,'{{Medalla|1|AS}}');assert.equal(c.MEDALLAS[11].items[2].text,'[[Archivo:Bronzen_medaille.svg|18x18px|Bronce]]');});
test('rejects other origins',async()=>{assert.equal((await context({location:{hostname:'en.wikipedia.org'}}).insertMedal('x')).ok,false)});
test('plain source replaces selection and dispatches input',async()=>{let inserted,event;const t={offsetParent:{},selectionStart:2,selectionEnd:4,setRangeText(...args){inserted=args},dispatchEvent(e){event=e},focus(){}};const c=context({document:{querySelector:()=>t},Event:class{constructor(type){this.type=type}}});assert.equal((await c.insertMedal('medal')).ok,true);assert.deepEqual(inserted,['medal',2,4,'end']);assert.equal(event.type,'input')});
test('visual cross uses the native Parsoid importer and inserts inline with cursor at end',async()=>{
 const calls=[];const targetDoc={};
 // VisualEditor's getType normalizes '/paragraph' to 'paragraph'.
 const raw=[{type:'paragraph'},{type:'mwInlineImage'},{type:'/mwInlineImage'},{type:'/paragraph'}];
 const converted={getDocumentRange:()=>({end:raw.length}),data:{getData:i=>raw[i],getType:i=>raw[i].type.replace(/^\//,'')}};
 assert.equal(converted.data.getType(3),'paragraph');
 const html='<p>MEDALLASINICIO<span typeof="mw:File"><a href="./Archivo:Injury_icon_2.svg"><img resource="./Archivo:Injury_icon_2.svg" class="mw-file-element" width="15" height="15"></a></span>MEDALLASFIN</p>';
 const fragment={insertDocument(doc,range){assert.equal(doc,converted);assert.equal(range.start,1);assert.equal(range.end,3);calls.push('insert');return this},collapseToEnd(){calls.push('collapse');return this},select(){calls.push('select')}};
 const target={getSurface:()=>({getMode:()=> 'visual',getModel:()=>({getFragment:()=>fragment,getDocument:()=>targetDoc}),getView:()=>({focus(){calls.push('focus')}})}),async parseWikitextFragment(text,pst,doc){assert.equal(text,'MEDALLASINICIO[[Imagen:Injury icon 2.svg|15px]]MEDALLASFIN');assert.equal(pst,false);assert.equal(doc,targetDoc);return {visualeditor:{content:html}}}};
 const c=context({ve:{Range:class{constructor(start,end){this.start=start;this.end=end}},init:{target},ui:{MWWikitextStringTransferHandler:{static:{createDocumentFromParsoidHtml(input,doc){assert.equal(input,html.replace('MEDALLASINICIO','').replace('MEDALLASFIN',''));assert.equal(doc,targetDoc);calls.push('nativeImport');return converted}}}}}});
 assert.equal((await c.insertMedal('[[Imagen:Injury icon 2.svg|15px]]')).ok,true);assert.deepEqual(calls,['nativeImport','insert','collapse','select','focus']);
});
test('WikiEditor inserts exact code without line breaks and explicitly places caret after it',async()=>{
 let value='AntesDESPUÉS';let selection;const calls=[];
 const c=context({document:{querySelector:()=>({focus(){}})},jQuery:()=>({textSelection(method,arg){calls.push(method);if(method==='getCaretPosition')return 5;if(method==='replaceSelection')value=value.slice(0,5)+arg+value.slice(5);if(method==='setSelection')selection=arg}})});
 const code='[[Imagen:Injury icon 2.svg|15px]]';assert.equal((await c.insertMedal(code)).ok,true);assert.equal(value,'Antes'+code+'DESPUÉS');assert.equal(selection.start,5+code.length);assert.equal(selection.end,selection.start);assert.deepEqual(calls,['getCaretPosition','replaceSelection','setSelection']);
});
test('conversion failure never inserts literal wikitext',async()=>{
 let inserted=false;
 const c=context({ve:{init:{target:{getSurface:()=>({getMode:()=> 'visual',getModel:()=>({getDocument:()=>({}),getFragment:()=>({insertDocument(){inserted=true}})})}),async parseWikitextFragment(){throw Error('offline')}}},ui:{MWWikitextStringTransferHandler:{static:{createDocumentFromParsoidHtml(){throw Error('must not import')}}}}}});
 const result=await c.insertMedal('code');assert.equal(result.ok,false);assert.equal(result.message,'offline');assert.equal(inserted,false);
});
