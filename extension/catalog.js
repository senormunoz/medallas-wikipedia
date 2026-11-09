globalThis.MEDALLAS = [
['Juegos Olímpicos','JO'],['Juegos Mediterráneos','JM'],['Mundial','Mo'],['Europeo','Eu'],['África','Af'],['Asia','As'],['América','Am'],['Oceanía','Oc'],['América Central','AC'],['América del Norte','AN'],['América del Sur','AS'],['Medallas',null]
].map(([name,code])=>({name,items:[1,2,3].map(rank=>({rank,label:['Oro','Plata','Bronce'][rank-1],text:code?`{{Medalla|${rank}|${code}}}`:`[[Archivo:${['Gouden','Zilveren','Bronzen'][rank-1]}_medaille.svg|18x18px|${['Oro','Plata','Bronce'][rank-1]}]]`}))}));
