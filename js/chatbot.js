/**
 * 27SYS ASSISTANT — free first-line troubleshooting assistant.
 * Static/offline decision tree: no API key, no paid AI service required.
 * Built for GitHub Pages / 27sys Services.
 */
(function(){
  'use strict';

  var WA = (window.CONFIG && window.CONFIG.contact && window.CONFIG.contact.whatsappNumber) || '212640008930';
  var COMPANY = 'https://www.linkedin.com/company/27sys-services';

  var flows = {
    ordinateur: {
      label: 'Ordinateur', icon: '🖥️',
      problems: [
        ['Mon PC ne s’allume pas', [
          ['Le voyant ou les ventilateurs réagissent-ils ?', ['oui','non'], 'power_react'],
          ['Débranchez le chargeur / câble secteur 30 secondes, rebranchez-le et réessayez. Sur un laptop, retirez les périphériques USB.'],
          ['Si aucun voyant ni ventilateur ne réagit toujours, il faut un diagnostic matériel.']
        ]],
        'internet': ['Je n’ai plus Internet / Wi‑Fi', [
          ['Votre téléphone fonctionne-t-il sur le même Wi‑Fi ?', ['oui','non'], 'wifi_phone'],
          ['Redémarrez le PC puis désactivez/réactivez le Wi‑Fi. Vérifiez que le mode avion est désactivé.'],
          ['Redémarrez votre box/routeur pendant 30 secondes. Si aucun appareil n’a Internet après cela, le problème vient probablement du réseau/FAI.']
        ]],
        'lent': ['Mon PC est très lent', [
          ['Le stockage est-il presque plein ?', ['oui','non'], 'disk_full'],
          ['Libérez de l’espace : supprimez les fichiers inutiles et gardez idéalement plusieurs dizaines de Go libres.'],
          ['Ouvrez le Gestionnaire des tâches et regardez CPU, mémoire et disque quand le PC est lent.']
        ]],
        'ecran': ['Écran noir / problème d’affichage', [
          ['Le PC semble-t-il démarrer normalement (ventilateurs, sons, voyants) ?', ['oui','non'], 'display_boot'],
          ['Vérifiez le câble HDMI/DisplayPort, la source de l’écran et essayez un autre port si disponible.'],
          ['Éteignez complètement le PC, débranchez les périphériques non essentiels et redémarrez. Si le problème persiste, diagnostic matériel conseillé.']
        ]]
      ]
    },
    telephone: {
      label:'Téléphone', icon:'📱',
      problems: {
        'wifi':['Je n’ai plus Internet / Wi‑Fi',[['Les autres appareils ont-ils Internet sur ce Wi‑Fi ?',['oui','non'],'phone_wifi'], 'Activez puis désactivez le Wi‑Fi. Oubliez le réseau puis reconnectez-vous avec le mot de passe.', 'Redémarrez la box/routeur. Si tous les appareils sont concernés, vérifiez le service Internet.']],
        'lent':['Mon téléphone est très lent',[['Le stockage est-il presque plein ?',['oui','non'],'phone_storage'],'Supprimez les vidéos/fichiers inutiles et désinstallez les applications inutilisées. Redémarrez ensuite le téléphone.','Fermez les applications inutiles, redémarrez l’appareil et vérifiez les mises à jour système.']],
        'charge':['Il ne charge plus',[['Avez-vous essayé un autre câble et un autre chargeur fiables ?',['oui','non'],'phone_charge'],'Essayez un autre câble/chargeur et vérifiez doucement que le port n’est pas obstrué. N’insérez pas d’objet métallique dans le port.','Si plusieurs chargeurs fiables échouent, le port, la batterie ou le circuit de charge peut nécessiter un diagnostic.']],
        'bloque':['Mon téléphone est bloqué',[['L’écran répond-il encore au toucher ?',['oui','non'],'phone_freeze'],'Fermez l’application qui ne répond plus et redémarrez l’appareil.','Effectuez un redémarrage forcé selon le modèle du téléphone. Si cela se répète, contactez 27sys.']]
      }
    },
    tablette: {
      label:'Tablette', icon:'📲',
      problems: {
        'wifi':['Je n’ai plus Internet / Wi‑Fi',[['Votre téléphone fonctionne-t-il sur le même Wi‑Fi ?',['oui','non'],'tablet_wifi'],'Désactivez/réactivez le Wi‑Fi puis oubliez le réseau et reconnectez-vous.','Redémarrez la box/routeur. Si tous les appareils sont concernés, le problème est probablement réseau.']],
        'lent':['Ma tablette est lente',[['Le stockage est-il presque plein ?',['oui','non'],'tablet_storage'],'Libérez de l’espace et redémarrez la tablette.','Redémarrez-la et vérifiez les mises à jour système.']],
        'apps':['Une application ne fonctionne plus',[['Le problème concerne-t-il uniquement cette application ?',['oui','non'],'tablet_app'],'Forcez l’arrêt de l’application puis relancez-la. Vérifiez aussi sa mise à jour.','Redémarrez la tablette et vérifiez si plusieurs applications sont touchées.']],
        'charge':['Elle ne charge plus',[['Avez-vous essayé un autre câble/chargeur compatible ?',['oui','non'],'tablet_charge'],'Essayez un autre câble/chargeur compatible et inspectez visuellement le port.','Si aucun chargeur fiable ne fonctionne, un diagnostic matériel peut être nécessaire.']]
      }
    },
    tv: {
      label:'TV', icon:'📺',
      problems: {
        'internet':['La TV n’a plus Internet',[['Votre téléphone a-t-il Internet sur le même Wi‑Fi ?',['oui','non'],'tv_wifi'],'Redémarrez la TV et reconnectez-la au Wi‑Fi. Si possible, rapprochez-la du routeur.','Redémarrez la box/routeur. Si aucun appareil n’a Internet, vérifiez la connexion Internet.']],
        'hdmi':['Mon HDMI ne fonctionne pas',[['Avez-vous sélectionné la bonne source HDMI sur la TV ?',['oui','non'],'tv_hdmi'],'Avec la télécommande, sélectionnez HDMI 1/2/3 selon le port utilisé.','Débranchez puis rebranchez le câble HDMI aux deux extrémités. Essayez un autre port HDMI ou un autre câble si possible.']],
        'son':['Je n’ai plus de son',[['Le volume de la TV est-il activé et non coupé ?',['oui','non'],'tv_sound'],'Vérifiez le volume, le mode silencieux et la sortie audio sélectionnée.','Redémarrez la TV et vérifiez la sortie audio. Si une barre de son est connectée, testez les haut-parleurs TV.']],
        'apps':['Netflix / YouTube / une app ne fonctionne plus',[['Les autres applications Internet fonctionnent-elles ?',['oui','non'],'tv_app'],'Fermez l’application, redémarrez la TV puis vérifiez sa mise à jour.','Redémarrez la TV et vérifiez sa connexion Internet.']]
      }
    },
    imprimante: {
      label:'Imprimante', icon:'🖨️',
      problems: {
        'offline':['Elle apparaît hors ligne',[['L’imprimante est-elle allumée et connectée au Wi‑Fi/Ethernet ?',['oui','non'],'printer_online'],'Sur le PC, vérifiez que la bonne imprimante est sélectionnée et relancez la file d’impression.','Vérifiez l’alimentation et le câble/réseau. Pour une imprimante Wi‑Fi, regardez son écran/indicateur réseau.']],
        'papier':['Elle ne prend pas le papier',[['Le bac contient-il du papier correctement aligné ?',['oui','non'],'printer_paper'],'Rechargez le bac sans le sur-remplir et ajustez les guides.','Retirez doucement tout papier visible et vérifiez qu’aucun morceau ne reste dans le chemin papier.']],
        'wifi':['Je n’arrive pas à la connecter au Wi‑Fi',[['Le Wi‑Fi fonctionne-t-il sur votre téléphone au même endroit ?',['oui','non'],'printer_wifi'],'Vérifiez que l’imprimante est sur le bon réseau Wi‑Fi et rapprochez-la temporairement du routeur.','Vérifiez que le Wi‑Fi du domicile fonctionne puis redémarrez la box et l’imprimante.']],
        'impression':['Elle imprime mal / rien ne sort',[['L’imprimante signale-t-elle une cartouche ou un niveau d’encre/toner faible ?',['oui','non'],'printer_ink'],'Remplacez la cartouche/toner si nécessaire puis lancez un nettoyage/alignement depuis le menu de l’imprimante.','Annulez la file d’impression, relancez une page test et vérifiez le pilote/paramètres d’impression.']]
      }
    }
  };

  var css = `
  #sys-assistant-launcher{position:fixed;right:24px;bottom:24px;z-index:9998;border:1px solid rgba(255,255,255,.18);background:#15181c;color:#f4f3ee;border-radius:999px;padding:14px 18px;display:flex;align-items:center;gap:10px;font-family:Inter,Arial,sans-serif;font-size:13px;font-weight:600;box-shadow:0 16px 40px rgba(0,0,0,.25);cursor:pointer;transition:.2s ease}
  #sys-assistant-launcher:hover{transform:translateY(-2px);box-shadow:0 20px 46px rgba(0,0,0,.3);background:#1677ff}
  #sys-assistant-launcher .dot{width:9px;height:9px;border-radius:50%;background:#ff7a45;box-shadow:0 0 0 4px rgba(255,122,69,.16)}
  #sys-assistant{position:fixed;right:24px;bottom:86px;width:min(410px,calc(100vw - 32px));height:min(650px,calc(100vh - 120px));z-index:9999;background:#f4f3ee;color:#15181c;border:1px solid rgba(21,24,28,.14);box-shadow:0 30px 90px rgba(0,0,0,.28);display:none;flex-direction:column;overflow:hidden}
  #sys-assistant.open{display:flex}
  .sys-head{background:#15181c;color:#f4f3ee;padding:18px 18px 16px;display:flex;justify-content:space-between;align-items:center}
  .sys-brand{display:flex;gap:11px;align-items:center}.sys-brand-mark{width:34px;height:34px;border:1px solid rgba(255,255,255,.25);display:grid;place-items:center;font-weight:700;font-size:13px}.sys-brand-text strong{display:block;font:700 15px/1 'Space Grotesk',Arial,sans-serif}.sys-brand-text small{display:block;margin-top:5px;color:rgba(255,255,255,.58);font:10px/1 'JetBrains Mono',monospace;letter-spacing:.08em;text-transform:uppercase}
  .sys-close{border:0;background:none;color:#fff;font-size:22px;cursor:pointer;padding:4px}.sys-body{flex:1;overflow:auto;padding:18px;background:linear-gradient(180deg,#f4f3ee 0%,#ebeae5 100%)}
  .sys-msg{max-width:88%;padding:12px 14px;border:1px solid rgba(21,24,28,.11);background:#fff;margin:0 0 12px;font-size:13px;line-height:1.55;box-shadow:0 6px 16px rgba(21,24,28,.05)}
  .sys-msg.bot:before{content:'27sys Assistant';display:block;font:10px/1 'JetBrains Mono',monospace;color:#1677ff;letter-spacing:.08em;text-transform:uppercase;margin-bottom:7px}.sys-msg.user{margin-left:auto;background:#15181c;color:#fff;border-color:#15181c}
  .sys-options{display:flex;flex-wrap:wrap;gap:8px;margin:6px 0 15px}.sys-opt{border:1px solid #c8c7c1;background:#fff;color:#15181c;padding:10px 12px;font:600 12px/1.2 Inter,Arial,sans-serif;cursor:pointer;transition:.18s ease}.sys-opt:hover{border-color:#1677ff;color:#1677ff;transform:translateY(-1px)}
  .sys-quick{border-left:2px solid #ff7a45;padding-left:12px;margin:4px 0 14px;font-size:12px;color:#45484d}.sys-status{font:9px/1 'JetBrains Mono',monospace;color:#85878b;letter-spacing:.08em;text-transform:uppercase;margin-top:4px}
  .sys-foot{border-top:1px solid rgba(21,24,28,.12);padding:11px 12px;background:#f4f3ee}.sys-escalate{display:flex;gap:8px}.sys-escalate a,.sys-reset{flex:1;text-align:center;padding:11px;border:1px solid #15181c;text-decoration:none;font:600 12px Inter,Arial,sans-serif;cursor:pointer}.sys-escalate a{background:#15181c;color:#fff}.sys-reset{background:#fff;color:#15181c}.sys-note{font-size:9px;color:#73757a;line-height:1.4;margin-top:8px;text-align:center}
  @media(max-width:600px){#sys-assistant-launcher{right:16px;bottom:16px;padding:13px 15px}#sys-assistant{right:8px;bottom:76px;width:calc(100vw - 16px);height:calc(100vh - 96px)}}`;
  var style=document.createElement('style');style.id='sys-assistant-style';style.textContent=css;document.head.appendChild(style);

  var launcher=document.createElement('button');launcher.id='sys-assistant-launcher';launcher.type='button';launcher.innerHTML='<span class="dot"></span> Besoin d\'aide ?';
  document.body.appendChild(launcher);

  var app=document.createElement('section');app.id='sys-assistant';app.setAttribute('aria-label','27sys Assistant de dépannage');
  app.innerHTML='<div class="sys-head"><div class="sys-brand"><div class="sys-brand-mark">27</div><div class="sys-brand-text"><strong>27sys Assistant</strong><small>Dépannage de premier niveau</small></div></div><button class="sys-close" type="button" aria-label="Fermer">×</button></div><div class="sys-body" id="sys-chat"></div><div class="sys-foot"><div class="sys-escalate"><a id="sys-whatsapp" href="#" target="_blank" rel="noopener">Parler à 27sys</a><button class="sys-reset" type="button" id="sys-reset">Recommencer</button></div><div class="sys-note">Conseils pour les problèmes simples. Aucun appareil n\'est ouvert ou modifié à distance.</div></div>';
  document.body.appendChild(app);

  var chat=document.getElementById('sys-chat');
  var whatsapp=document.getElementById('sys-whatsapp');
  function setWA(subject){
    var msg='Bonjour 27sys, j\'ai essayé le 27sys Assistant concernant : '+subject+'. Le problème n\'est pas résolu et j\'aimerais avoir de l\'aide.';
    whatsapp.href='https://wa.me/'+WA+'?text='+encodeURIComponent(msg);
  }
  function esc(s){return String(s).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
  function addBot(text){var d=document.createElement('div');d.className='sys-msg bot';d.innerHTML=esc(text).replace(/\n/g,'<br>');chat.appendChild(d);scroll()}
  function addUser(text){var d=document.createElement('div');d.className='sys-msg user';d.textContent=text;chat.appendChild(d);scroll()}
  function options(items, handler){var wrap=document.createElement('div');wrap.className='sys-options';items.forEach(function(item){var b=document.createElement('button');b.className='sys-opt';b.type='button';b.textContent=item.label || item;b.addEventListener('click',function(){wrap.remove();addUser(item.label || item);handler(item.value || item);});wrap.appendChild(b)});chat.appendChild(wrap);scroll()}
  function scroll(){chat.scrollTop=chat.scrollHeight}
  function reset(){chat.innerHTML='';welcome()}
  function welcome(){
    addBot('Bonjour 👋 Je suis le 27sys Assistant. Je peux vous guider sur des problèmes simples, étape par étape.');
    addBot('Quel appareil pose problème ?');
    options(Object.keys(flows).map(function(k){return {label:flows[k].icon+' '+flows[k].label,value:k}}), chooseDevice);
    var q=document.createElement('div');q.className='sys-quick';q.textContent='Besoin d’un vrai diagnostic ? Vous pourrez contacter directement 27sys à tout moment.';chat.appendChild(q);scroll();
    setWA('votre appareil');
  }
  function chooseDevice(key){
    var flow=flows[key];
    addBot('D’accord. Que se passe-t-il avec votre '+flow.label.toLowerCase()+' ?');
    var probs=[];
    if(Array.isArray(flow.problems)) probs=flow.problems.map(function(p){return {label:p[0],value:p[0]}});
    else probs=Object.keys(flow.problems).map(function(k){return {label:flow.problems[k][0],value:k}});
    options(probs,function(v){startProblem(key,v)});
    setWA(flow.label);
  }
  function startProblem(key,val){
    var flow=flows[key];
    if(Array.isArray(flow.problems)){
      var item=flow.problems.find(function(p){return p[0]===val});
      if(!item)return;
      runScenario(flow.label,item[0],item[1]);
    }else{
      var item=flow.problems[val];runScenario(flow.label,item[0],item.slice(1));
    }
  }
  function runScenario(device,problem,data){
    setWA(device+' — '+problem);
    var question=data[0], yesno=data[1]||['oui','non'], key=data[2];
    addBot(question);
    options([{label:'Oui',value:'oui'},{label:'Non',value:'non'}],function(answer){
      var advice = data[answer==='oui'?2:3];
      if(!advice) advice=data[2]||data[1];
      addBot(advice);
      addBot('Est-ce que le problème est résolu ?');
      options([{label:'✅ Oui, c\'est résolu',value:'solved'},{label:'❌ Non, toujours le problème',value:'not_solved'}],function(result){
        if(result==='solved'){
          addBot('Parfait ✅ Heureux d’avoir pu vous aider.');
          addBot('Besoin d’aide pour autre chose ? Vous pouvez recommencer ou contacter 27sys.');
        }else{
          addBot('D’accord. On arrive à la limite du dépannage de base. Pour éviter de vous faire faire des manipulations inutiles, le mieux est de laisser 27sys prendre le relais.');
          var b=document.createElement('div');b.className='sys-msg bot';b.innerHTML='👉 <strong>Contacter 27sys sur WhatsApp</strong> pour continuer le diagnostic.';chat.appendChild(b);scroll();
        }
      });
    });
  }

  launcher.addEventListener('click',function(){app.classList.add('open');launcher.style.display='none';if(!chat.children.length)welcome()});
  app.querySelector('.sys-close').addEventListener('click',function(){app.classList.remove('open');launcher.style.display='flex'});
  document.getElementById('sys-reset').addEventListener('click',reset);
})();
