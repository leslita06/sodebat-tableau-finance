(function(){
"use strict";
var D=window.D,ICO=window.ICO,T=D.now.slice(0,10),K=D.k;
var $=function(id){return document.getElementById(id);};
var nf=new Intl.NumberFormat("fr-FR");
function fm(n){return nf.format(Math.round(n)).replace(/\u202f|\u00a0/g,"\u00a0");}
function f1(x){return (Math.round(x*10)/10).toString().replace(".",",");}
function fM(x){return f1(x/1e6)+"\u00a0M";}
function fF(x){return fm(x)+"\u00a0FCFA";}
function dobj(s){var p=s.slice(0,10).split("-");return new Date(+p[0],+p[1]-1,+p[2]);}
function days(a,b){return Math.round((dobj(b)-dobj(a))/864e5);}
function addD(s,n){var x=dobj(s);x.setDate(x.getDate()+n);return x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+String(x.getDate()).padStart(2,"0");}
function dd(s){var p=s.slice(0,10).split("-");return p[2]+"/"+p[1]+"/"+p[0];}
function ds(s){var p=s.slice(0,10).split("-");return p[2]+"/"+p[1];}
var MOIS=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"],MC=["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."],JRS=["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];
function longD(s){var d=dobj(s);return JRS[d.getDay()]+" "+d.getDate()+" "+MOIS[d.getMonth()]+" "+d.getFullYear();}
function dm(s){var d=dobj(s);return d.getDate()+" "+MC[d.getMonth()];}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
function ic(n,c){return '<svg class="i'+(c?" "+c:"")+'" viewBox="0 0 24 24" aria-hidden="true">'+(ICO[n]||"")+"</svg>";}
function pl(n,s,p){return n+" "+(n>1?(p||s+"s"):s);}
var C={acc:"#004AAD",sky:"#38B6FF",pale:"#9DC8F0",ink:"#3A3A3B",red:"#C8352B",amb:"#D99A1E",grn:"#18794E",gry:"#D4D4D0",line:"#E3E8EF",mut:"#6B6B6B"};
var MOB=function(){return window.matchMedia("(max-width:700px)").matches;};
var TY=D.ctypes,TYS={syn:"Syndic",ent:"Entreprise",ban:"Banque, assurance",pub:"Public"};
var FREQ={M:"Mensuel",T:"Trimestriel",TE:"Trimestre échu",A:"Annuel"};
var BK={ne:"Non échu",b1:"0 à 30 j",b2:"31 à 60 j",b3:"61 à 90 j",b4:"Plus de 90 j"},BKC={ne:"#E3E8EF",b1:C.pale,b2:C.sky,b3:C.acc,b4:C.red};
var CT={};D.contrats.forEach(function(c){CT[c.id]=c;});

/* ---------- filtres ---------- */
var F={type:"",zone:""};
function keep(o){var t=o.type||o.ctype;return (!F.type||t===F.type)&&(!F.zone||o.zone===F.zone);}
function anyF(){return F.type||F.zone;}
function fdesc(){var p=[];if(F.type)p.push(TY[F.type]);if(F.zone)p.push(D.zones[F.zone]);return p.join(", ");}
function menu(key,btn,box,items){
  function draw(){box.innerHTML=items().map(function(it){return '<button class="mi'+(F[key]===it[0]?" on":"")+'" data-k="'+esc(it[0])+'"><span>'+esc(it[1])+(it[2]?"<small>"+esc(it[2])+"</small>":"")+"</span>"+ic("check","ck")+"</button>";}).join("");}
  btn.addEventListener("click",function(e){e.stopPropagation();var on=box.classList.contains("on");closeMenus();if(!on){draw();box.classList.add("on");}});
  box.addEventListener("click",function(e){var b=e.target.closest(".mi");if(!b)return;F[key]=b.getAttribute("data-k");closeMenus();applyF();});
}
function closeMenus(){document.querySelectorAll(".menu.on").forEach(function(m){m.classList.remove("on");});}
document.addEventListener("click",closeMenus);
menu("type",$("c-b"),$("c-m"),function(){return [["","Tous les clients",pl(D.contrats.length,"contrat")]].concat(Object.keys(TY).map(function(k){return [k,TY[k],pl(D.contrats.filter(function(c){return c.type===k;}).length,"contrat")];}));});
menu("zone",$("z-b"),$("z-m"),function(){return [["","Toutes les zones",""]].concat(Object.keys(D.zones).map(function(k){return [k,D.zones[k],pl(D.contrats.filter(function(c){return c.zone===k;}).length,"contrat")];}));});
$("f-x").addEventListener("click",function(){F={type:"",zone:""};applyF();});
function applyF(){
  $("c-l").textContent=F.type?TY[F.type]:"Tous les clients";$("z-l").textContent=F.zone?D.zones[F.zone]:"Toutes les zones";
  $("c-b").classList.toggle("on",!!F.type);$("z-b").classList.toggle("on",!!F.zone);
  $("f-x").style.display=anyF()?"":"none";render();
}
function pre(){return anyF()?"<b>"+esc(fdesc())+"</b> : ":"";}

/* ---------- utilitaires ---------- */
var charts={};
function mk(id,cfg){if(charts[id])charts[id].destroy();charts[id]=new Chart($(id),cfg);return charts[id];}
Chart.defaults.font.family="Inter, system-ui, sans-serif";Chart.defaults.font.size=12;Chart.defaults.color=C.mut;
if(window.__CAPTURE)Chart.defaults.animation=false;
function kc(o){return '<div class="kc'+(o.key?" key":"")+(o.bad?" bad":"")+'"><p class="l">'+ic(o.i)+esc(o.l)+'</p><div class="vr"><p class="v">'+o.v+(o.u?"<small>"+o.u+"</small>":"")+'</p></div><p class="s">'+o.s+"</p></div>";}
function fac(){return D.factures.filter(keep);}
function echus(){return fac().filter(function(f){return f.b&&f.b!=="ne";});}
function sum(a,k){return a.reduce(function(s,x){return s+(typeof k==="function"?k(x):x[k]);},0);}
function tyPill(t){return '<span class="pill '+(t==="pub"?"o":"n")+'">'+TYS[t]+"</span>";}
var gridY={grid:{color:C.line},border:{display:false}};
var mTick=function(v){return f1(v/1e6);};

/* ---------- relances : niveau et message ---------- */
function niveau(f){if(f.jr>90)return [3,"Relance formelle"];if(f.jr>30)return [2,"Deuxième relance"];return [1,"Premier rappel"];}
function msg(f){
  var n=niveau(f)[0],m=fF(f.ttc),due=dd(f.due);
  if(f.type==="pub")return "Objet : facture "+f.id+", contrat de maintenance des ascenseurs\n\nMonsieur le Directeur administratif et financier,\n\nNous avons l'honneur de vous rappeler que la facture "+f.id+" du "+dd(f.emis)+", d'un montant de "+m+" TTC ("+f.lib.toLowerCase()+"), arrivée à échéance le "+due+", reste à régler.\n\nLes visites d'entretien et les interventions de la période ont été réalisées ; les rapports signés sont joints. "+(n>=2?"Nous vous serions obligés de bien vouloir nous indiquer l'état d'avancement du mandatement, et de nous préciser toute pièce complémentaire attendue par vos services ou par le contrôle financier.":"Si une pièce manque au dossier de liquidation, nous la transmettrons dès réception de votre demande.")+"\n\nNous restons à votre disposition pour un rendez-vous avec vos services.\n\nVeuillez agréer, Monsieur le Directeur, l'expression de notre haute considération.\n\nLe service recouvrement, SODEBAT Ascenseurs Côte d'Ivoire";
  if(f.type==="syn")return "Bonjour,\n\nSauf erreur de notre part, la facture "+f.id+" ("+f.lib.toLowerCase()+") de "+m+" TTC, échue le "+due+", n'est pas encore réglée.\n\n"+(n>=2?"C'est notre deuxième rappel. Pouvez-vous nous indiquer la date de règlement prévue par le syndic ? Un échéancier peut être convenu si besoin.":"Pouvez-vous nous confirmer la date du règlement ? Si c'est déjà fait, merci de nous envoyer le justificatif et nous mettrons votre compte à jour.")+"\n\nMerci, et bonne journée.\nLe service clients SODEBAT";
  return "Madame, Monsieur,\n\nLa facture "+f.id+" du "+dd(f.emis)+" ("+f.lib.toLowerCase()+"), d'un montant de "+m+" TTC, est échue depuis le "+due+".\n\n"+(n>=2?"Malgré notre premier rappel, elle reste impayée. Nous vous remercions de procéder au règlement sous huit jours, ou de nous indiquer la date prévue.":"Merci de nous indiquer la date de règlement prévue, ou de nous adresser l'avis de virement s'il a déjà été émis.")+"\n\nCordialement,\nLe service recouvrement, SODEBAT Ascenseurs Côte d'Ivoire";
}
function canal(f){return f.type==="pub"?"Courrier signé et dépôt au service ordonnateur":f.type==="syn"?"WhatsApp du syndic, puis e-mail":"E-mail au service comptable";}

/* ---------- volet ---------- */
function openDr(k,h){$("dr-k").innerHTML=k;$("dr-b").innerHTML=h;paint($("dr-b"));paint($("dr-k"));$("drawer").classList.add("on");$("scrim").classList.add("on");$("drawer").setAttribute("aria-hidden","false");}
function closeDr(){$("drawer").classList.remove("on");$("scrim").classList.remove("on");$("drawer").setAttribute("aria-hidden","true");}
$("dr-x").addEventListener("click",closeDr);$("scrim").addEventListener("click",closeDr);
document.addEventListener("keydown",function(e){if(e.key==="Escape")closeDr();});
function toast(t){var x=$("toast");x.textContent=t;x.classList.add("on");clearTimeout(toast.h);toast.h=setTimeout(function(){x.classList.remove("on");},2600);}
function relDr(id){
  var f=D.factures.filter(function(x){return x.id===id;})[0],n=niveau(f);
  openDr(ic("bell-ring")+"Relance",'<div class="tags">'+tyPill(f.type)+'<span class="pill '+(f.jr>60?"r":"a")+'">'+f.jr+' j de retard</span></div><h3>'+esc(f.client)+'</h3><p class="why">'+esc(f.lib)+'</p><dl class="props"><dt>Facture</dt><dd>'+f.id+" du "+dd(f.emis)+'</dd><dt>Montant</dt><dd>'+fF(f.ttc)+' TTC</dd><dt>Échéance</dt><dd>'+dd(f.due)+'</dd><dt>Niveau</dt><dd>'+n[1]+'</dd><dt>Canal</dt><dd>'+canal(f)+'</dd></dl><p class="lbl">Message prêt</p><div class="msg">'+esc(msg(f))+'</div><div class="acts"><button class="btn pri" data-t="Relance mise en file : elle part après validation.">'+ic("send")+'Valider et préparer l\'envoi</button><button class="btn" data-t="Message copié.">'+ic("copy")+'Copier le message</button><button class="btn" data-t="Appel noté dans le suivi du client.">'+ic("phone")+'Noter un appel</button></div>');
}
$("dr-b").addEventListener("click",function(e){var b=e.target.closest("[data-t]");if(b){toast(b.getAttribute("data-t"));if(b.classList.contains("pri"))closeDr();}var r=e.target.closest("[data-rel]");if(r)relDr(r.getAttribute("data-rel"));});

/* =========================================================
   Vue d'ensemble
   ========================================================= */
var DEC=[
 {i:"wallet",lv:"r",tag:"Trésorerie",t:"Point bas de "+fM(K.low)+" la semaine du "+dm(K.low_a),s:"Sous le seuil de sécurité de 30 M, juste après les salaires de décembre et le solde SODIMAS de 16 200 €.",go:"tresorerie",
  dr:function(){return decDr("Trésorerie","Point bas de "+fM(K.low)+" la semaine du "+dm(K.low_a)+" au "+dm(K.low_b),"Salaires de décembre (24,6 M), solde SODIMAS de la Résidence Les Jardins de Cocody (16 200 €, soit 10,6 M) et frais de fonctionnement tombent la même semaine, avant les encaissements trimestriels de janvier.",
   [["Solde aujourd'hui",fF(K.solde)],["Point bas",fF(K.low)],["Seuil de sécurité",fF(K.seuil)],["Manque",fF(K.seuil-K.low)]],
   ["Obtenir le règlement des 3 établissements publics en retard (12,9 M) avant le 20 décembre.","Demander à SODIMAS de caler le solde de CH-2604 sur la mise en service, décalée par les 12 jours de retard du chantier.","Émettre les factures trimestrielles de janvier dès le 2 janvier."],"Décision prise : plan de trésorerie de décembre mis à jour.");}},
 {i:"landmark",lv:"r",tag:"Public",t:"12,9 M dus par 3 établissements publics",s:"Immeuble administratif Delta, Immeuble administratif Kappa, Clinique Les Tecks Bouaké : 88 à 179 jours de retard.",go:"encaisser",
  dr:function(){var L=D.factures.filter(function(f){return f.type==="pub"&&f.b&&f.b!=="ne";});return decDr("Établissements publics","12,9 M FCFA dus par 3 établissements publics","Le délai moyen de paiement du public est de "+K.delai.pub+" jours, contre "+K.delai.ban+" pour les banques. Le circuit (engagement, liquidation, mandatement) demande un dossier complet et un suivi en personne.",
   L.map(function(f){return [f.client,fF(f.ttc)+", "+f.jr+" j"];}),["Courrier formel signé au directeur administratif et financier, avec rapports d'intervention signés.","Visite au service ordonnateur pour vérifier qu'aucune pièce ne manque.","Pour l'Immeuble administratif Kappa (179 jours) : rendez-vous de direction avant toute suspension."],"Relances formelles préparées : elles partent après validation.",L);}},
 {i:"handshake",lv:"a",tag:"Renouvellement",t:"Immeuble Les Acajous : renouveler contre règlement",s:"Facture de 3,4 M en retard de 45 jours, contrat de 11,5 M par an qui expire le 31 décembre.",go:"encaisser",
  dr:function(){var f=D.factures.filter(function(x){return x.client==="Immeuble Les Acajous"&&x.b&&x.b!=="ne";});return decDr("Renouvellement","Immeuble Les Acajous : lier le renouvellement au règlement","Le contrat de 4 appareils (11 520 000 FCFA par an) expire le 31 décembre. L'ascenseur A est à l'arrêt, en attente d'une carte de commande, et la facture du trimestre de septembre reste impayée.",
   [["Contrat annuel",fF(11520000)],["Échéance",dd("2026-12-31")],["Impayé",fF(3398400)+", 45 j"],["Marge du contrat",f1(CT["CM-202"].marge_p)+" %"]],["Proposer le renouvellement avec paiement trimestriel d'avance.","Conditionner la signature au règlement de la facture de septembre.","Chiffrer la modernisation de l'ascenseur A (26 M) dans la même proposition."],"Proposition de renouvellement préparée pour validation.",f);}},
 {i:"trending-down",lv:"a",tag:"Marge",t:"Résidence Les Ixoras perd de l'argent",s:"Marge de "+f1(CT["CM-207"].marge_p)+" % : 6 pannes en un an et 3 mois impayés sur un contrat de 4,1 M.",go:"marges",
  dr:function(){var c=CT["CM-207"];return decDr("Marge","Résidence Les Ixoras : contrat déficitaire","Le contrat rapporte "+fF(c.annuel)+" par an pour "+fF(c.cout)+" de coûts directs. L'ascenseur Schindler de 2003 a eu 6 pannes en 12 mois, et le syndic a 3 mensualités de retard.",
   [["Prix annuel",fF(c.annuel)],["Coûts directs",fF(c.cout)],["Marge",fF(c.marge)+" ("+f1(c.marge_p)+" %)"],["Impayé",fF(1203600)+", jusqu'à 90 j"]],["Proposer au syndic un échéancier sur 3 mois pour l'arriéré.","Au renouvellement du 28 février : relever le prix de 15 % ou proposer la modernisation.","Sortir ce client de la prévision de trésorerie tant que l'arriéré n'est pas soldé (déjà fait)."],"Proposition au syndic préparée pour validation.");}},
 {i:"receipt",lv:"o",tag:"Facturation",t:(function(){var L=D.futures.filter(function(x){return x.emis.slice(0,7)==="2026-12";});return L.length+" factures de décembre prêtes, "+fM(sum(L,"ht"))+" HT";})(),s:"Contrats mensuels, trimestriels et terme échu du public. À valider avant le 1er décembre.",go:"facturer",
  dr:function(){return emitDr();}},
 {i:"layers",lv:"o",tag:"Chantier",t:"Le Phare : retenue de garantie et réception",s:"Mise en service facturée le 24/11 ; procès-verbal de réception à faire signer pour solder le chantier.",go:"facturer",
  dr:function(){var c=D.chantiers.filter(function(x){return x.id==="CH-2603";})[0];return decDr("Chantier","Immeuble Le Phare : obtenir le procès-verbal de réception","Le monte-charge IMEM est en service. La réception signée déclenche la garantie d'un an et la libération future de la retenue de 5 %.",
   [["Prix du chantier",fF(c.prix)],["Facturé",fF(c.prix*.95)+" (95 %)"],["Retenue de garantie",fF(c.prix*.05)+", libérée le "+dd(c.jalons[3].date)],["Marge estimée",f1(c.marge_p)+" %"]],["Planifier la réception avec le client cette semaine.","Joindre le procès-verbal à la facture de mise en service pour accélérer le paiement."],"Réception à planifier : demande transmise au chef de chantier.");}}
];
function decDr(tag,t,why,props,acts,ok,rel){
  var h='<div class="tags"><span class="pill o">'+esc(tag)+'</span></div><h3>'+esc(t)+'</h3><p class="why">'+esc(why)+'</p><dl class="props">'+props.map(function(p){return "<dt>"+esc(p[0])+"</dt><dd>"+esc(p[1])+"</dd>";}).join("")+'</dl><p class="lbl">Ce que je propose</p><ul class="ck">'+acts.map(function(a){return "<li>"+ic("circle-check")+"<span>"+esc(a)+"</span></li>";}).join("")+"</ul>";
  if(rel)h+='<p class="lbl">Relances prêtes</p><div class="rl">'+rel.map(function(f){return '<button class="li" data-rel="'+f.id+'"><div class="who"><span class="av cl">'+ic("file-text")+'</span><div><p class="nm">'+esc(f.client)+'</p><p class="mt2">'+f.id+", "+f.jr+' j de retard</p></div></div><div class="rr"><span class="amt">'+fM(f.ttc)+"</span>"+ic("chevron-right")+"</div></button>";}).join("")+"</div>";
  h+='<div class="acts"><button class="btn pri" data-t="'+esc(ok)+'">'+ic("check")+'Décider</button><button class="btn" data-t="Reporté à la revue de lundi.">'+ic("clock")+"Reporter à lundi</button></div>";
  openDr(ic("gavel")+"Décision",h);
}
function rEns(){
  var A=fac(),E=echus(),C2=D.contrats.filter(keep),mrr=sum(C2,"annuel")/12;
  var pub=sum(E.filter(function(f){return f.type==="pub";}),"ttc");
  $("lede-e").innerHTML=pre()+pl(C2.length,"contrat")+" de maintenance pour "+sum(C2,"app")+" appareils, soit <b>"+fM(mrr)+" FCFA HT facturés chaque mois</b> en moyenne. "+(E.length?'<span class="r">'+fM(sum(E,"ttc"))+" de factures échues</span> chez "+pl(new Set(E.map(function(f){return f.client;})).size,"client")+".":"Aucune facture échue.")+(anyF()?"":" Trésorerie : point bas de "+fM(K.low)+" la semaine du "+dm(K.low_a).replace(/\.$/,"")+".");
  $("kpis-e").innerHTML=kc({key:1,i:"repeat",l:"Chiffre d'affaires récurrent maintenance",v:fM(mrr),u:"FCFA HT par mois",s:"<b>"+fM(mrr*12)+"</b> par an, "+pl(C2.length,"contrat")})+
    kc({i:"hourglass",l:"Créances échues",v:fM(sum(E,"ttc")),u:"TTC",s:pub?"dont <b>"+fM(pub)+"</b> dus par le public":"aucune créance publique en retard"})+
    kc({i:"wallet",l:"Point bas de trésorerie",bad:1,v:fM(K.low),u:"FCFA",s:"semaine du <b>"+dm(K.low_a)+"</b>, seuil 30 M"});
  $("dec").innerHTML=DEC.map(function(d,i){return '<button class="dc '+d.lv+'" data-d="'+i+'"><span class="dc-i">'+ic(d.i)+'</span><span class="dc-b"><span class="dc-g">'+esc(d.tag)+'</span><b>'+esc(d.t)+'</b><small>'+esc(d.s)+'</small></span><span class="dc-a">Décider'+ic("arrow-right")+"</span></button>";}).join("");
  // facturé / encaissé sur 12 mois
  var ms=[];for(var k=0;k<12;k++){var d=new Date(2025,11+k,1);ms.push(d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0"));}
  var fm_=ms.map(function(m){return sum(A.filter(function(f){return f.emis.slice(0,7)===m&&f.kind==="maint";}),"ttc");});
  var ft_=ms.map(function(m){return sum(A.filter(function(f){return f.emis.slice(0,7)===m&&f.kind!=="maint";}),"ttc");});
  var en_=ms.map(function(m){return sum(A.filter(function(f){return f.paye&&f.paye.slice(0,7)===m;}),"ttc");});
  mk("c-fe",{data:{labels:ms.map(function(m){return MC[+m.slice(5)-1]+(MOB()?"":" "+m.slice(2,4));}),datasets:[
    {type:"line",label:"Encaissé",data:en_,borderColor:C.ink,borderDash:[5,4],borderWidth:2,pointRadius:MOB()?0:2.5,pointBackgroundColor:C.ink,tension:.3,order:0},
    {type:"bar",label:"Maintenance",data:fm_,backgroundColor:C.acc,borderRadius:3,stack:"f",maxBarThickness:30,order:1},
    {type:"bar",label:"Travaux",data:ft_,backgroundColor:C.sky,borderRadius:3,stack:"f",maxBarThickness:30,order:1}]},
    options:{responsive:true,maintainAspectRatio:false,interaction:{mode:"index",intersect:false},plugins:{legend:{display:false},tooltip:{callbacks:{label:function(c){return c.dataset.label+" : "+fM(c.raw);}}}},
    scales:{x:{stacked:true,grid:{display:false},ticks:{maxRotation:0,autoSkip:true,font:{size:MOB()?10:12}}},y:Object.assign({stacked:true,ticks:{callback:mTick}},gridY)}}});
  // âge des créances
  var U=A.filter(function(f){return f.b;}),ks=["ne","b1","b2","b3","b4"],vs=ks.map(function(k){return sum(U.filter(function(f){return f.b===k;}),"ttc");});
  mk("c-age",{type:"doughnut",data:{labels:ks.map(function(k){return BK[k];}),datasets:[{data:vs,backgroundColor:ks.map(function(k){return BKC[k];}),borderWidth:2,borderColor:"#fff"}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:"70%",plugins:{legend:{display:false},tooltip:{callbacks:{label:function(c){return c.label+" : "+fM(c.raw);}}}}}});
  $("dnc").innerHTML="<b>"+fM(sum(U,"ttc"))+"</b><small>à encaisser</small>";
  $("l-age").innerHTML=ks.map(function(k,i){return '<span><i style="background:'+BKC[k]+'"></i>'+BK[k]+" <b>"+fM(vs[i])+"</b></span>";}).join("");
}
$("dec").addEventListener("click",function(e){var b=e.target.closest(".dc");if(b)DEC[+b.getAttribute("data-d")].dr();});

/* =========================================================
   Facturation
   ========================================================= */
var CSEG="",CQ="";
function futs(){return D.futures.filter(keep);}
function emitDr(){
  var L=futs().filter(function(x){return x.emis.slice(0,7)==="2026-12";}),ht=sum(L,"ht");
  openDr(ic("receipt")+"Lot de factures",'<div class="tags"><span class="pill o">Décembre 2026</span><span class="pill n">'+pl(L.length,"facture")+'</span></div><h3>Factures de maintenance de décembre</h3><p class="why">Calculées depuis les contrats : prix annuel, nombre d\'appareils, rythme de facturation. Numérotation et certification FNE à l\'émission.</p><dl class="props"><dt>Total HT</dt><dd>'+fF(ht)+'</dd><dt>TVA 18 %</dt><dd>'+fF(ht*.18)+'</dd><dt>Total TTC</dt><dd>'+fF(ht*1.18)+'</dd></dl><div class="rl">'+L.map(function(x){return '<div class="li st"><div class="who"><span class="av cl">'+ic("file-text")+'</span><div><p class="nm">'+esc(x.client)+'</p><p class="mt2">'+FREQ[x.freq]+", le "+ds(x.emis)+'</p></div></div><div class="rr"><span class="amt">'+fM(x.ht)+"</span></div></div>";}).join("")+'</div><div class="acts"><button class="btn pri" data-t="Lot validé : les factures seront émises à leur date.">'+ic("check")+'Valider le lot</button><button class="btn" data-t="Aperçu des factures ouvert.">'+ic("eye")+"Voir les factures</button></div>");
}
$("b-emit").addEventListener("click",emitDr);
function rFac(){
  var C2=D.contrats.filter(keep),FU=futs(),dec=FU.filter(function(x){return x.emis.slice(0,7)==="2026-12";});
  var CH=D.chantiers.filter(keep),rest=sum(CH,function(c){return sum(c.jalons.filter(function(j){return !j.fait;}),"ht");});
  $("lede-f").innerHTML=pre()+pl(C2.length,"contrat")+" facturés automatiquement depuis le parc. <b>"+pl(dec.length,"facture")+" à émettre en décembre</b> pour "+fM(sum(dec,"ht"))+" HT. "+pl(CH.length,"chantier")+" en cours, "+fM(rest)+" HT encore à facturer par jalons.";
  $("kpis-f").innerHTML=kc({key:1,i:"repeat",l:"Récurrent maintenance",v:fM(sum(C2,"annuel")/12),u:"HT par mois",s:"<b>"+sum(C2,"app")+"</b> appareils sous contrat"})+
    kc({i:"calendar-clock",l:"À émettre en décembre",v:fM(sum(dec,"ht")),u:"HT",s:"<b>"+dec.length+"</b> factures, premier lot le 1er"})+
    kc({i:"layers",l:"Travaux restant à facturer",v:fM(rest),u:"HT",s:"sur "+fM(sum(CH,"prix"))+" de chantiers en cours"});
  // calendrier : 3 mois passés + 3 mois à venir
  var ms=["2026-09","2026-10","2026-11","2026-12","2027-01","2027-02"],fr=["M","T","TE","A"],col={M:C.acc,T:C.sky,TE:"#9DB9DF",A:C.ink};
  var past=fac().filter(function(f){return f.kind==="maint";});
  var ds_=fr.map(function(q){return {label:FREQ[q],backgroundColor:col[q],borderRadius:3,maxBarThickness:42,data:ms.map(function(m){
      if(m<"2026-12")return sum(past.filter(function(f){return f.emis.slice(0,7)===m&&CT[f.ref].freq===q;}),"ht");
      return sum(FU.filter(function(x){return x.emis.slice(0,7)===m&&x.freq===q;}),"ht");})};});
  mk("c-cal",{type:"bar",data:{labels:ms.map(function(m){return MC[+m.slice(5)-1]+(m<"2026-12"?"":" (prévu)");}),datasets:ds_},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:function(c){return c.dataset.label+" : "+fM(c.raw);}}}},
    scales:{x:{stacked:true,grid:{display:false},ticks:{maxRotation:0,font:{size:MOB()?10:12}}},y:Object.assign({stacked:true,ticks:{callback:mTick}},gridY)}}});
  $("em-t").textContent="À émettre en décembre ("+dec.length+")";$("em-u").textContent=fM(sum(dec,"ht"))+" HT";
  $("em-l").innerHTML=dec.length?dec.map(function(x){return '<div class="li st"><div class="who"><span class="av cl">'+ic("file-text")+'</span><div><p class="nm">'+esc(x.client)+'</p><p class="mt2">'+FREQ[x.freq]+", le "+ds(x.emis)+'</p></div></div><div class="rr"><span class="amt">'+fM(x.ht)+"</span></div></div>";}).join(""):'<p class="empty">Aucune facture à émettre dans ce périmètre.</p>';
  // jalons
  $("jal").innerHTML=CH.length?CH.map(function(c){var fa=sum(c.jalons.filter(function(j){return j.fait;}),"ht"),p=Math.round(100*fa/c.prix);
    return '<div class="jr"><div class="who"><span class="av cl">'+ic("layers")+'</span><div><p class="nm">'+esc(c.client)+(c.retard?' <span class="pill r">'+c.retard+" j de retard</span>":"")+'</p><p class="mt2">'+esc(c.objet)+", "+c.usine+'</p></div></div><div class="jl">'+c.jalons.map(function(j){var cls=j.fait?"f":(j.date<T?"l":"a");return '<span class="jc '+cls+'" title="'+esc(j.nom)+'">'+ic(j.fait?"circle-check":"circle-dot")+"<b>"+Math.round(j.pc*100)+' %</b><small>'+(j.fait?"facturé "+ds(j.date):"prévu "+ds(j.date))+"</small></span>";}).join("")+'</div><div class="jp"><span class="prog"><span class="tr"><i style="width:'+p+'%"></i></span>'+p+' %</span><b>'+fM(c.prix)+"</b></div></div>";}).join(""):'<p class="empty">Aucun chantier dans ce périmètre.</p>';
  // contrats
  var segs=[["","Tous"],["M","Mensuel"],["T","Trimestriel"],["TE","Trimestre échu"],["A","Annuel"]];
  $("seg-ct").innerHTML=segs.map(function(s){return '<button data-s="'+s[0]+'" class="'+(CSEG===s[0]?"on":"")+'">'+s[1]+' <span class="c">'+C2.filter(function(c){return !s[0]||c.freq===s[0];}).length+"</span></button>";}).join("");
  var L=C2.filter(function(c){return (!CSEG||c.freq===CSEG)&&(!CQ||(c.client+" "+c.id).toLowerCase().indexOf(CQ)>=0);}).sort(function(a,b){return b.annuel-a.annuel;});
  function nxt(c){var x=FU.filter(function(f){return f.ref===c.id;})[0]||D.futures.filter(function(f){return f.ref===c.id;})[0];return x?ds(x.emis)+", "+fM(x.ht):"après février";}
  $("t-ct").innerHTML='<thead><tr><th>Client</th><th>Type</th><th class="r">Appareils</th><th class="r">Prix annuel HT</th><th>Rythme</th><th>Prochaine facture</th><th>Fin du contrat</th></tr></thead><tbody>'+L.map(function(c){
    return '<tr><td class="w" data-l="Client"><div class="who"><span class="av cl">'+ic("building-2")+'</span><div><p class="nm">'+esc(c.client)+'</p><p class="mt2">'+c.id+", "+esc(D.zones[c.zone])+'</p></div></div></td><td data-l="Type">'+tyPill(c.type)+'</td><td class="r" data-l="Appareils">'+c.app+'</td><td class="num" data-l="Prix annuel HT">'+fm(c.annuel)+'</td><td data-l="Rythme">'+FREQ[c.freq]+'</td><td data-l="Prochaine facture">'+nxt(c)+'</td><td data-l="Fin du contrat">'+(days(T,c.echeance)<=90?'<span class="pill a">'+dd(c.echeance)+"</span>":dd(c.echeance))+"</td></tr>";}).join("")+'</tbody><tfoot><tr><td data-l="Total">'+pl(L.length,"contrat")+'</td><td class="hm"></td><td class="r" data-l="Appareils">'+sum(L,"app")+'</td><td class="num" data-l="Prix annuel HT">'+fm(sum(L,"annuel"))+'</td><td class="hm mh" colspan="3"></td></tr></tfoot>';
}
$("seg-ct").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;CSEG=b.getAttribute("data-s");rFac();paint($("v-facturer"));});
$("q-ct").addEventListener("input",function(e){CQ=e.target.value.toLowerCase();rFac();paint($("v-facturer"));});

/* =========================================================
   Encaissements
   ========================================================= */
var AG="";
function rEnc(){
  var E=echus(),A=fac();
  var enc=sum(A.filter(function(f){return f.paye&&f.paye>="2026-11-01";}),"ttc");
  var pub=E.filter(function(f){return f.type==="pub";});
  $("lede-n").innerHTML=pre()+(E.length?pl(E.length,"facture")+" échue"+(E.length>1?"s":"")+' pour <span class="r">'+fM(sum(E,"ttc"))+" TTC</span>"+(pub.length?", dont "+fM(sum(pub,"ttc"))+" chez des établissements publics, qui paient en moyenne en "+K.delai.pub+" jours":"")+". ":"Aucune facture échue. ")+"Encaissé depuis le 1er novembre : <b>"+fM(enc)+"</b>.";
  $("kpis-n").innerHTML=kc({key:1,i:"hand-coins",l:"Encaissé en novembre",v:fM(enc),u:"TTC",s:"au 25 novembre"})+
    kc({i:"hourglass",l:"Échu à relancer",v:fM(sum(E,"ttc")),u:"TTC",s:"<b>"+E.length+"</b> factures, "+pl(new Set(E.map(function(f){return f.client;})).size,"client")})+
    kc({i:"triangle-alert",l:"Plus de 60 jours",bad:1,v:fM(sum(E.filter(function(f){return f.jr>60;}),"ttc")),u:"TTC",s:E.filter(function(f){return f.jr>60;}).length+" factures, relance formelle"});
  // balance âgée empilée
  var ty=Object.keys(TY).filter(function(t){return !F.type||t===F.type;}),bk=["b1","b2","b3","b4"];
  mk("c-bal",{type:"bar",data:{labels:ty.map(function(t){return MOB()?TYS[t]:TY[t];}),datasets:bk.map(function(b){return {label:BK[b],backgroundColor:BKC[b],borderRadius:3,maxBarThickness:28,data:ty.map(function(t){return sum(E.filter(function(f){return f.type===t&&f.b===b;}),"ttc");})};})},
    options:{indexAxis:"y",responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:function(c){return c.dataset.label+" : "+fM(c.raw);}}}},
    scales:{x:Object.assign({stacked:true,ticks:{callback:mTick}},gridY),y:{stacked:true,grid:{display:false},ticks:{font:{size:MOB()?11:12},callback:function(v){var l=this.getLabelForValue(v);return MOB()?l:(l.length>26?l.split(" et ").join(" et\n").split("\n"):l);}}}}}});
  var mx=Math.max.apply(null,Object.keys(K.delai).map(function(k){return K.delai[k];}));
  $("hb-dl").innerHTML=Object.keys(TY).map(function(t){var v=K.delai[t];return '<div class="r'+(v>60?" low":"")+(F.type&&F.type!==t?" off":"")+'"><span class="n">'+TYS[t]+'</span><span class="t"><i style="width:'+Math.round(100*v/mx)+'%"></i></span><span class="v">'+v+" j</span></div>";}).join("");
  $("n-dl").innerHTML="Conditions : 30 jours pour les clients privés, 60 jours pour le public. Le public règle en <b>"+K.delai.pub+" jours</b> en moyenne : sa facture se prépare avec les pièces de liquidation dès l'émission.";
  // relances
  var segs=[["","Toutes"],["b1","0 à 30 j"],["b2","31 à 60 j"],["b3","61 à 90 j"],["b4","Plus de 90 j"]];
  $("seg-ag").innerHTML=segs.map(function(s){return '<button data-a="'+s[0]+'" class="'+(AG===s[0]?"on":"")+'">'+s[1]+' <span class="c">'+E.filter(function(f){return !s[0]||f.b===s[0];}).length+"</span></button>";}).join("");
  var L=E.filter(function(f){return !AG||f.b===AG;}).sort(function(a,b){return b.jr-a.jr;});
  $("t-rel").innerHTML='<thead><tr><th>Client</th><th>Type</th><th>Facture</th><th class="r">Retard</th><th class="r">Montant TTC</th><th>Relance proposée</th><th></th></tr></thead><tbody>'+(L.length?L.map(function(f){var n=niveau(f);
    return '<tr data-id="'+f.id+'"><td class="w" data-l="Client"><div class="who"><span class="av cl">'+ic(f.type==="pub"?"landmark":"building-2")+'</span><div><p class="nm">'+esc(f.client)+'</p><p class="mt2">'+esc(f.lib)+'</p></div></div></td><td data-l="Type">'+tyPill(f.type)+'</td><td data-l="Facture">'+f.id+'<small class="sub">échue le '+ds(f.due)+'</small></td><td class="r" data-l="Retard"><span class="cd'+(f.jr>60?" bad":"")+'">'+f.jr+"<small>j</small></span></td><td class=\"num\" data-l=\"Montant TTC\">"+fm(f.ttc)+'</td><td data-l="Relance proposée"><span class="pill '+(n[0]===3?"r":n[0]===2?"a":"n")+'">'+n[1]+'</span></td><td class="act"><span class="lnk">Message'+ic("arrow-right")+"</span></td></tr>";}).join(""):'<tr><td colspan="7" class="empty">Aucune facture dans cette tranche.</td></tr>')+"</tbody>";
}
$("seg-ag").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;AG=b.getAttribute("data-a");rEnc();paint($("v-encaisser"));});
$("t-rel").addEventListener("click",function(e){var r=e.target.closest("tr[data-id]");if(r)relDr(r.getAttribute("data-id"));});

/* =========================================================
   Trésorerie
   ========================================================= */
var SC=0,CATS={maint:"Maintenance",pub:"Établissements publics",trav:"Travaux",sal:"Salaires",soc:"Charges sociales",usine:"Usines SODIMAS et IMEM",douane:"Dédouanement",tva:"TVA",fonct:"Fonctionnement et crédit"};
function weeks(){
  if(!SC)return D.weeks;
  var L=D.lines.map(function(x){if(x.cat!=="pub")return x;var d=addD(x.d,30),i=Math.floor(days(D.weeks[0].a,d)/7);return Object.assign({},x,{d:d,w:i});});
  var s=K.solde;return D.weeks.map(function(w,i){var ti=sum(L.filter(function(x){return x.w===i&&x.s==="in";}),"m"),to=sum(L.filter(function(x){return x.w===i&&x.s==="out";}),"m");var s0=s;s=s+ti-to;return Object.assign({},w,{s0:s0,in:ti,out:to,s1:s});});
}
function wlab(w){return MOB()?ds(w.a):dm(w.a);}
function rTre(){
  var W=weeks(),lo=W.reduce(function(a,b){return b.s1<a.s1?b:a;}),under=W.filter(function(w){return w.s1<K.seuil;});
  $("lede-t").innerHTML="Disponible aujourd'hui : <b>"+fM(K.solde)+" FCFA</b>. "+(under.length?'<span class="r">'+(under.length>1?pl(under.length,"semaine")+" sous le seuil de 30 M, ":"")+"point bas de "+fM(lo.s1)+" la semaine du "+dm(lo.a)+"</span>, après les salaires de décembre et le solde SODIMAS. ":"Aucune semaine sous le seuil. ")+"Les trimestres de janvier remontent le solde à "+fM(W[6].s1)+" dès la semaine suivante."+(SC?" <b>Hypothèse : le public paie 30 jours plus tard.</b>":"");
  $("kpis-t").innerHTML=kc({key:1,i:"wallet",l:"Disponible aujourd'hui",v:fM(K.solde),u:"FCFA",s:"3 comptes bancaires et la caisse"})+
    kc({i:"trending-down",l:"Point bas",bad:lo.s1<K.seuil,v:fM(lo.s1),u:"FCFA",s:"semaine du <b>"+dm(lo.a)+"</b>"+(lo.s1<K.seuil?", "+fM(K.seuil-lo.s1)+" sous le seuil":"")})+
    kc({i:"calendar-range",l:"Solde dans 13 semaines",v:fM(W[12].s1),u:"FCFA",s:"semaine du "+dm(W[12].a)});
  mk("c-tr",{data:{labels:W.map(wlab),datasets:[
    {type:"line",label:"Solde",data:W.map(function(w){return w.s1;}),borderColor:C.acc,backgroundColor:"rgba(0,74,173,.07)",fill:true,borderWidth:2.5,tension:.3,pointRadius:W.map(function(w){return w===lo?6:MOB()?0:3;}),pointBackgroundColor:W.map(function(w){return w.s1<K.seuil?C.red:C.acc;}),order:0},
    {type:"line",label:"Seuil",data:W.map(function(){return K.seuil;}),borderColor:C.red,borderDash:[6,5],borderWidth:1.5,pointRadius:0,order:1},
    {type:"bar",label:"Encaissements",data:W.map(function(w){return w.in;}),backgroundColor:C.pale,borderRadius:3,maxBarThickness:22,order:2},
    {type:"bar",label:"Décaissements",data:W.map(function(w){return -w.out;}),backgroundColor:C.ink,borderRadius:3,maxBarThickness:22,order:2}]},
    options:{responsive:true,maintainAspectRatio:false,interaction:{mode:"index",intersect:false},plugins:{legend:{display:false},tooltip:{callbacks:{label:function(c){return c.dataset.label+" : "+fM(Math.abs(c.raw));}}}},
    scales:{x:{grid:{display:false},ticks:{maxRotation:0,autoSkip:true,font:{size:MOB()?10:12}}},y:Object.assign({ticks:{callback:mTick}},gridY)}}});
  // cascade
  var L=D.lines,ord=[["maint","in"],["pub","in"],["trav","in"],["sal","out"],["soc","out"],["usine","out"],["douane","out"],["tva","out"],["fonct","out"]];
  var lab=["Aujourd'hui"],dat=[[0,K.solde]],col=[C.acc],s=K.solde;
  ord.forEach(function(o){var v=sum(L.filter(function(x){return x.cat===o[0];}),"m");if(SC&&o[0]==="pub")v=sum(L.filter(function(x){return x.cat==="pub"&&days(D.weeks[0].a,addD(x.d,30))<91;}),"m");var n=o[1]==="in"?s+v:s-v;lab.push(CATS[o[0]]);dat.push([Math.min(s,n),Math.max(s,n)]);col.push(o[1]==="in"?C.sky:C.ink);s=n;});
  lab.push("Dans 13 semaines");dat.push([0,s]);col.push(C.acc);
  mk("c-wf",{type:"bar",data:{labels:lab,datasets:[{data:dat,backgroundColor:col,borderRadius:3,maxBarThickness:34}]},
    options:{indexAxis:MOB()?"y":"x",responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:function(c){var v=c.raw;return fM(v[1]-v[0]);}}}},
    scales:MOB()?{y:{grid:{display:false},ticks:{font:{size:10.5}}},x:Object.assign({ticks:{callback:mTick}},gridY)}:{x:{grid:{display:false},ticks:{maxRotation:40,minRotation:40,font:{size:11}}},y:Object.assign({ticks:{callback:mTick}},gridY)}}});
  // usines
  var U=D.lines.filter(function(x){return x.cat==="usine";});
  $("usi").innerHTML=U.map(function(x){var p=x.lib.split(" : ");return '<div class="li st"><div class="who"><span class="av cl">'+ic("factory")+'</span><div><p class="nm">'+esc(p[0])+'</p><p class="mt2">'+esc(p[1])+'</p></div></div><div class="rr"><span class="cdw"><span class="amt">'+fm(x.eur)+'\u00a0€</span><small>'+fM(x.m)+", le "+ds(x.d)+"</small></span></div></div>";}).join("");
  // tableau
  $("t-tr").innerHTML='<thead><tr><th>Semaine</th><th class="r">Solde début</th><th class="r">Encaissements</th><th class="r">Décaissements</th><th class="r">Solde fin</th><th>Principaux mouvements</th></tr></thead><tbody>'+W.map(function(w,i){
    var big=D.lines.filter(function(x){return x.w===i;}).sort(function(a,b){return b.m-a.m;}).slice(0,2).map(function(x){return (x.s==="in"?"+":"\u2212")+fM(x.m)+" "+(x.cat==="usine"?x.lib.split(" : ")[0]:CATS[x.cat].toLowerCase());}).join(", ");
    return '<tr data-w="'+i+'"'+(w.s1<K.seuil?' class="lowr"':"")+'><td data-l="Semaine"><b>S'+(i+1)+'</b><small class="sub">du '+dm(w.a)+" au "+dm(w.b)+'</small></td><td class="r hm" data-l="Solde début">'+fM(w.s0)+'</td><td class="r" data-l="Encaissements">+'+fM(w.in)+'</td><td class="r" data-l="Décaissements">\u2212'+fM(w.out)+'</td><td class="num" data-l="Solde fin">'+(w.s1<K.seuil?'<span class="cd bad">'+fM(w.s1)+"</span>":fM(w.s1))+'</td><td class="w" data-l="Principaux mouvements"><span class="mvt">'+esc(big)+"</span></td></tr>";}).join("")+"</tbody>";
  $("cpt").innerHTML=D.comptes.map(function(c){return '<div class="li st"><div class="who"><span class="av cl">'+ic(c[0]==="Caisse"?"banknote":"landmark")+'</span><div><p class="nm">'+esc(c[0])+'</p></div></div><div class="rr"><span class="amt">'+fM(c[1])+"</span></div></div>";}).join("");
  $("cpt-u").textContent="au "+dd(T)+", 8 h";
}
$("seg-sc").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;SC=+b.getAttribute("data-s");$("seg-sc").querySelectorAll("button").forEach(function(x){x.classList.toggle("on",x===b);});rTre();paint($("v-tresorerie"));});
$("t-tr").addEventListener("click",function(e){var r=e.target.closest("tr[data-w]");if(!r)return;var i=+r.getAttribute("data-w"),w=weeks()[i];
  var L=D.lines.filter(function(x){return x.w===i;}).sort(function(a,b){return a.s===b.s?b.m-a.m:(a.s==="in"?-1:1);});
  openDr(ic("calendar-range")+"Semaine "+(i+1),'<h3>Du '+dm(w.a)+" au "+dm(w.b)+'</h3><dl class="props"><dt>Solde début</dt><dd>'+fF(w.s0)+'</dd><dt>Encaissements</dt><dd>+'+fF(w.in)+'</dd><dt>Décaissements</dt><dd>\u2212'+fF(w.out)+'</dd><dt>Solde fin</dt><dd>'+fF(w.s1)+'</dd></dl><div class="rl">'+L.map(function(x){return '<div class="li st"><div class="who"><span class="av cl '+(x.s==="in"?"ins":"outs")+'">'+ic(x.s==="in"?"arrow-down-right":"arrow-up-right")+'</span><div><p class="nm">'+esc(x.lib)+'</p><p class="mt2">'+CATS[x.cat]+", le "+ds(x.d)+'</p></div></div><div class="rr"><span class="amt '+(x.s==="in"?"in":"")+'">'+(x.s==="in"?"+":"\u2212")+fM(x.m)+"</span></div></div>";}).join("")+(SC?'<p class="dnote">Détail affiché selon la prévision de base.</p>':"")+"</div>");});

/* =========================================================
   Marges
   ========================================================= */
var MG="ct";
function rMar(){
  var C2=D.contrats.filter(keep),CH=D.chantiers.filter(keep);
  var mc=sum(C2,"annuel")?Math.round(1000*sum(C2,"marge")/sum(C2,"annuel"))/10:0,mh=sum(CH,"prix")?Math.round(1000*sum(CH,"marge")/sum(CH,"prix"))/10:0;
  var low=C2.filter(function(c){return c.marge_p<20;});
  $("lede-m").innerHTML=pre()+"Marge sur coûts directs : <b>"+f1(mc)+" % sur la maintenance</b>, "+f1(mh)+" % sur les chantiers en cours. "+(low.length?'<span class="r">'+pl(low.length,"contrat")+" sous 20 %</span>, à revoir au renouvellement.":"Aucun contrat sous 20 %.");
  $("kpis-m").innerHTML=kc({key:1,i:"percent",l:"Marge maintenance",v:f1(mc)+"\u00a0%",s:"<b>"+fM(sum(C2,"marge"))+"</b> par an sur "+fM(sum(C2,"annuel"))})+
    kc({i:"layers",l:"Marge chantiers en cours",v:f1(mh)+"\u00a0%",s:"<b>"+fM(sum(CH,"marge"))+"</b> sur "+fM(sum(CH,"prix"))})+
    kc({i:"trending-down",l:"Contrats sous 20 %",bad:low.length>0,v:low.length,s:low.length?low.slice(0,2).map(function(c){return esc(c.client);}).join(", "):"aucun"});
  mk("c-sc",{type:"bubble",data:{datasets:[{data:C2.map(function(c){return {x:c.annuel/1e6,y:c.marge_p,r:4+c.app*1.6,c:c};}),
      backgroundColor:C2.map(function(c){return c.marge_p<20?"rgba(200,53,43,.65)":c.type==="pub"?"rgba(56,182,255,.6)":"rgba(0,74,173,.55)";}),borderColor:"#fff",borderWidth:1}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:function(c){var o=c.raw.c;return o.client+" : "+fM(o.annuel)+", marge "+f1(o.marge_p)+" %";}}}},
    scales:{x:Object.assign({title:{display:true,text:"Prix annuel, millions FCFA"},ticks:{callback:function(v){return f1(v);}}},gridY),y:Object.assign({title:{display:!MOB(),text:"Marge %"},ticks:{callback:function(v){return v+" %";}}},gridY)},
    onClick:function(e,el){if(el.length)ctDr(C2[el[0].index]);}}});
  mk("c-chm",{type:"bar",data:{labels:CH.map(function(c){return MOB()?c.id:c.client.replace("Résidence ","Rés. ").replace("Immeuble ","Imm. ");}),datasets:[
     {label:"Prévue au devis",data:CH.map(function(c){return c.marge_budget;}),backgroundColor:"#C9DDF5",borderRadius:3,maxBarThickness:22},
     {label:"Estimée aujourd'hui",data:CH.map(function(c){return c.marge_p;}),backgroundColor:CH.map(function(c){return c.marge_p<c.marge_budget?C.red:C.acc;}),borderRadius:3,maxBarThickness:22}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:true,position:"bottom",labels:{boxWidth:10,boxHeight:10}},tooltip:{callbacks:{label:function(c){return c.dataset.label+" : "+f1(c.raw)+" %";}}}},
    scales:{x:{grid:{display:false},ticks:{maxRotation:MOB()?0:30,font:{size:MOB()?10:11}}},y:Object.assign({beginAtZero:true,ticks:{callback:function(v){return v+" %";}}},gridY)}}});
  if(MG==="ct"){
    var L=C2.slice().sort(function(a,b){return a.marge_p-b.marge_p;});
    $("t-mg").innerHTML='<thead><tr><th>Contrat</th><th class="r">Appareils</th><th class="r">Pannes 12 mois</th><th class="r">Prix annuel</th><th class="r">Coûts directs</th><th class="r">Marge</th><th class="r">%</th></tr></thead><tbody>'+L.map(function(c){
      return '<tr data-c="'+c.id+'"><td class="w" data-l="Contrat"><div class="who"><span class="av cl">'+ic("building-2")+'</span><div><p class="nm">'+esc(c.client)+'</p><p class="mt2">'+c.id+", "+TYS[c.type]+'</p></div></div></td><td class="r" data-l="Appareils">'+c.app+'</td><td class="r" data-l="Pannes 12 mois">'+(c.pannes>=6?'<span class="cd bad">'+c.pannes+"</span>":c.pannes)+'</td><td class="num" data-l="Prix annuel">'+fM(c.annuel)+'</td><td class="r" data-l="Coûts directs">'+fM(c.cout)+'</td><td class="num" data-l="Marge">'+fM(c.marge)+'</td><td class="r" data-l="Marge %"><span class="pill '+(c.marge_p<0?"r":c.marge_p<20?"a":c.marge_p<40?"n":"g")+'">'+f1(c.marge_p)+" %</span></td></tr>";}).join("")+"</tbody>";
  }else{
    $("t-mg").innerHTML='<thead><tr><th>Chantier</th><th>Nature</th><th class="r">Prix HT</th><th class="r">Matériel usine</th><th class="r">Transport et douane</th><th class="r">Pose et retard</th><th class="r">Marge</th></tr></thead><tbody>'+CH.map(function(c){var k=c.couts;
      return '<tr data-h="'+c.id+'"><td class="w" data-l="Chantier"><div class="who"><span class="av cl">'+ic("layers")+'</span><div><p class="nm">'+esc(c.client)+'</p><p class="mt2">'+c.id+", "+esc(c.objet)+'</p></div></div></td><td data-l="Nature">'+esc(c.nature)+'</td><td class="num" data-l="Prix HT">'+fM(c.prix)+'</td><td class="r" data-l="Matériel usine">'+fM(k.materiel)+'<small class="sub">'+fm(k.eur)+' €</small></td><td class="r" data-l="Transport et douane">'+fM(k.douane)+'</td><td class="r" data-l="Pose et retard">'+fM(k.pose+k.retard)+(c.retard?'<small class="sub r">'+c.retard+" j de retard</small>":"")+'</td><td class="r" data-l="Marge"><span class="pill '+(c.marge_p<c.marge_budget?"a":"g")+'">'+f1(c.marge_p)+" %</span></td></tr>";}).join("")+"</tbody>";
  }
}
function ctDr(c){var k=c.couts;openDr(ic("percent")+"Marge du contrat",'<div class="tags">'+tyPill(c.type)+'<span class="pill n">'+FREQ[c.freq]+'</span></div><h3>'+esc(c.client)+'</h3><p class="why">'+pl(c.app,"appareil")+", "+pl(c.pannes,"panne")+" en 12 mois, fin du contrat le "+dd(c.echeance)+'.</p><dl class="props"><dt>Prix annuel HT</dt><dd>'+fF(c.annuel)+'</dd><dt>Visites mensuelles</dt><dd>'+fF(k.visites)+'</dd><dt>Pannes</dt><dd>'+fF(k.pannes)+'</dd><dt>Pièces d\'usure</dt><dd>'+fF(k.usure)+'</dd><dt>Déplacements</dt><dd>'+fF(k.deplacements)+'</dd><dt>Marge</dt><dd>'+fF(c.marge)+" ("+f1(c.marge_p)+' %)</dd></dl>'+(c.marge_p<20?'<p class="lbl">Ce que je propose</p><ul class="ck"><li>'+ic("circle-check")+"<span>Revoir le prix au renouvellement (prix d'équilibre à 20 % : "+fF(c.cout/0.8)+").</span></li><li>"+ic("circle-check")+"<span>Proposer la modernisation des appareils qui tombent le plus en panne.</span></li></ul>":"")+'<div class="acts"><button class="btn" data-t="Note ajoutée au dossier de renouvellement.">'+ic("file-text")+"Ajouter au dossier de renouvellement</button></div>");}
$("seg-mg").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;MG=b.getAttribute("data-m");$("seg-mg").querySelectorAll("button").forEach(function(x){x.classList.toggle("on",x===b);});rMar();paint($("v-marges"));});
$("t-mg").addEventListener("click",function(e){var r=e.target.closest("tr[data-c]");if(r)ctDr(CT[r.getAttribute("data-c")]);});

/* ---------- navigation ---------- */
var VIEWS={ensemble:["Vue d'ensemble",rEns],facturer:["Facturation",rFac],encaisser:["Encaissements",rEnc],tresorerie:["Trésorerie 13 semaines",rTre],marges:["Marges",rMar]};
var CUR="ensemble";
function go(v){if(!VIEWS[v])v="ensemble";CUR=v;
  document.querySelectorAll(".view").forEach(function(s){s.classList.toggle("on",s.id==="v-"+v);});
  document.querySelectorAll("[data-v]").forEach(function(b){b.classList.toggle("on",b.getAttribute("data-v")===v);});
  $("crumb-v").textContent=VIEWS[v][0];
  var tr=v==="tresorerie";$("c-s").style.display=tr?"none":"";$("z-s").style.display=tr?"none":"";$("hz").style.display=tr?"":"none";$("f-x").style.display=(!tr&&anyF())?"":"none";
  if(location.hash!=="#"+v)history.replaceState(null,"",location.pathname+location.search+"#"+v);
  window.scrollTo(0,0);
}
function render(){VIEWS[CUR][1]();paint(document);
  var E=D.factures.filter(function(f){return f.b&&f.b!=="ne";});
  $("k-en").textContent=E.length;$("m-en").textContent=E.length;
  var u=D.weeks.filter(function(w){return w.s1<K.seuil;}).length;$("k-tr").textContent=u?"1 alerte":"";$("m-tr").textContent=u?"1":"";
  $("k-fa").textContent=D.futures.filter(function(x){return x.emis.slice(0,7)==="2026-12";}).length;
  $("k-ma").textContent=D.contrats.filter(function(c){return c.marge_p<20;}).length||"";
}
document.querySelectorAll("[data-v]").forEach(function(b){b.addEventListener("click",function(){go(b.getAttribute("data-v"));render();});});
window.addEventListener("hashchange",function(){go(location.hash.slice(1));render();});
function paint(root){root.querySelectorAll("i[data-i]").forEach(function(i){var s=document.createElement("span");s.innerHTML=ic(i.getAttribute("data-i"),i.className);i.replaceWith(s.firstChild);});}
var rz;window.addEventListener("resize",function(){clearTimeout(rz);rz=setTimeout(render,200);});
$("date").textContent=longD(T)+", 8 h";
window.__fin={go:function(v){go(v);render();},pick:function(t){F.type=t||"";applyF();}};
go(location.hash.slice(1)||"ensemble");applyF();
})();
