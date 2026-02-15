(function(){
'use strict';
var LOGO='<svg viewBox="0 0 24 24"><path d="M 5 19 A 10 10 0 1 1 19 19" stroke-linecap="round"/><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/></svg>';
var USVG='<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 12 0v1"/></svg>';
var dot=document.querySelector('.cursor-dot'),ring=document.querySelector('.cursor-ring');
document.addEventListener('mousemove',function(e){dot.style.left=e.clientX+'px';dot.style.top=e.clientY+'px';ring.style.left=e.clientX+'px';ring.style.top=e.clientY+'px'});
document.addEventListener('mousedown',function(){document.body.classList.add('clicking')});
document.addEventListener('mouseup',function(){document.body.classList.remove('clicking')});
document.querySelectorAll('button,a,input,textarea,.map-node,.logo,.method-row,.cb-chip,.m-btn,.cb-bar').forEach(function(el){el.addEventListener('mouseenter',function(){document.body.classList.add('hovered')});el.addEventListener('mouseleave',function(){document.body.classList.remove('hovered')})});

/* AUTH */
var MOCK={name:'이민수',email:'minsu@aletheia.kr',plan:'free',avatar:'M'};
var authUser=null,currentModel='Core',pendingPage=null;
var MODEL_NAMES={Core:'Aletheia Core',Deep:'Aletheia Deep',Interpret:'Interpret v1'};

/* ============ THEME TOGGLE ============ */
var isDark=localStorage.getItem('aletheia-theme')==='dark';
if(isDark)document.body.classList.add('dark-mode');
document.getElementById('btnTheme').addEventListener('click',function(){
  document.body.classList.toggle('dark-mode');
  isDark=document.body.classList.contains('dark-mode');
  localStorage.setItem('aletheia-theme',isDark?'dark':'light');
  if(window._alScene){
    var bg=isDark?0x0a0a0a:0xffffff;
    window._alScene.scene.background.setHex(bg);
    window._alScene.scene.fog.color.setHex(bg);
    window._alScene.pts.material.color.setHex(isDark?0x888888:0x111111);
    window._alScene.pts.material.map=window._alScene.createPT(isDark);
    window._alScene.pts.material.needsUpdate=true;
    window._alScene.c1.material.color.setHex(isDark?0xffffff:0x000000);
    window._alScene.c2.material.color.setHex(isDark?0xaaaaaa:0x555555);
  }
});

/* ============ i18n ============ */
var currentLang=localStorage.getItem('aletheia-lang')||'ko';
var I18N={
  ko:{
    signIn:'Sign in',myPage:'My Page',signOut:'Sign out',
    heroTyping:'당신의 이야기가 가장 강력한 물성이 될 때.',
    aboutLabel1:'Our Core',aboutLabel2:'The Method',
    phiText:'"당신의 이야기에서 본질을 추출하고, 그것을 물성으로 치환합니다."',
    phiDesc:'우리는 외부에서 유행하는 아이템을 가져오는 것이 아니라, 당신 내면의 원초적인 경험과 성질을 추출하여 세상에 단 하나뿐인 비즈니스의 물성으로 치환합니다. 대화할수록 데이터가 쌓이고, 그 데이터가 당신의 본질이 됩니다.',
    m1Desc:'<strong>Unmask</strong><br>대화를 통해 당신의 패턴, 가치관, 잠재 동기를 추출하고 하나의 프로필로 합성합니다.',
    m2Desc:'<strong>Interpret</strong><br>산업의 본질과 당신의 본질이 만나는 교차점을 찾습니다.',
    m3Desc:'<strong>Interpret</strong><br>산업의 본질과 당신의 본질이 만나는 교차점을 찾습니다.',
    m1Btn:'Start Dialogue →',m2Btn:'View Profile →',m3Btn:'Start Interpret →',
    unmaskTitle:'당신을 발견하세요.',unmaskDesc:'대화를 시작하면 당신의 윤곽이 드러납니다.<br>가치관, 패턴, 회피하는 것 — 모든 것이 여기에 쌓입니다.',
    unmaskTitle:'당신보다<br>당신을 잘 아는 지도.',unmaskDesc:'Core에서 추출된 데이터 — 가치관, 패턴, 회피하는 것.<br>이 모든 것이 하나의 프로필로 합성됩니다.',unmaskBtn:'Core에서 대화 시작하기',
    interpTitle:'분야의 본질을 해석합니다.',interpDesc:'브랜드, 산업, 외부 대상의 숨겨진 본질을 드러냅니다.',interpPh:'분야 또는 브랜드를 입력하세요',interpGo:'해석 시작',
    archTitle:'실증의 기록.',archSub:'Aletheia가 해석한 다양한 분야의 본질 아카이브.',
    welcomeT:'무엇이 당신을 이끄나요?',welcomeS:'당신의 이야기에서 본질을 추출합니다.',
    chatPh:'대화를 시작하세요...',
    chip1:'카페 창업',chip2:'자기 탐구',chip3:'브랜드 방향',
    chipQ1:'나는 카페를 하고 싶어',chipQ2:'내가 진짜 좋아하는게 뭔지 모르겠어',chipQ3:'브랜드를 만들고 싶은데 방향을 모르겠어',
    histTitle:'이전 대화',bmTitle:'저장된 메시지',galTitle:'갤러리',profTitle:'실시간 프로필',
    profSub:'대화를 통해 실시간으로 추출되는 당신의 프로필입니다.',
    profVal:'핵심 가치관',profAvoid:'회피 패턴',profMotiv:'잠재 동기',profPrompt:'현재 시스템 프롬프트',
    profEmpty:'대화가 더 필요합니다...',
    myTitle:'나의 여정.',
    pricingTitle:'당신의 본질에 투자하세요.',pricingSub:'Aletheia의 서비스를 선택하세요.',
    loginTitle:'Aletheia에 오신 것을 환영합니다',loginSub:'본질을 탐구하는 여정을 시작하세요.',
    loginGoogle:'Google로 계속하기',loginTerms:'로그인 시 <a href="#">이용약관</a> 및 <a href="#">개인정보처리방침</a>에 동의합니다.',
    explorerName:'Explorer',seekerName:'Seeker',
    explorerPrice:'₩0',explorerUnit:'/ 영구',explorerDesc:'Aletheia의 철학을 경험하세요.',
    seekerPrice:'₩29,000',seekerUnit:'/ 월',seekerDesc:'본질을 깊이 탐구하는 풀 서비스.',
    priceFeat1:'Unmask 기본 대화 (일 10세션)',priceFeat2:'Unmask 실시간 프로필',priceFeat3:'Archive 열람',
    priceFeat4:'Unmask 무제한 대화',priceFeat5:'Unmask 심층 분석',priceFeat6:'Interpret 분야 해석',priceFeat7:'채팅 기록 저장·열람',priceFeat8:'Deep / Interpret 모델 해금',
    currentPlan:'현재 플랜',startSub:'구독 시작 →',upgrade:'구독 시작하기',
    newChat:'새 대화',bookmark:'북마크',gallery:'갤러리',profile:'Unmask',history:'이전 대화',
    footer:'Less but Better'
  },
  en:{
    signIn:'Sign in',myPage:'My Page',signOut:'Sign out',
    heroTyping:'When your story becomes the most powerful material.',
    aboutLabel1:'Our Core',aboutLabel2:'The Method',
    phiText:'"We extract the essence from your story and transform it into material."',
    phiDesc:'We don\'t borrow trending ideas from the outside. We extract the primal experiences and qualities from within you, and transform them into the unique material of your business. The more you talk, the more data accumulates — and that data becomes your essence.',
    m1Desc:'<strong>Unmask</strong><br>Extracts your patterns, values, and latent motivations through dialogue, synthesized into one profile.',
    m2Desc:'<strong>Interpret</strong><br>Finds the intersection of an industry\'s essence and your own.',
    m3Desc:'<strong>Interpret</strong><br>Finds the intersection where industry essence meets your essence.',
    m1Btn:'Start Dialogue →',m2Btn:'View Profile →',m3Btn:'Start Interpret →',
    unmaskTitle:'Discover yourself.',unmaskDesc:'Start a conversation and your contours will emerge.<br>Values, patterns, avoidance — everything accumulates here.',
    unmaskTitle:'A map that knows you<br>better than you.',unmaskDesc:'Data extracted from Core — values, patterns, avoidance.<br>All synthesized into a single profile.',unmaskBtn:'Start dialogue in Core',
    interpTitle:'Interpreting the essence of fields.',interpDesc:'Revealing the hidden essence of brands, industries, and external subjects.',interpPh:'Enter a field or brand',interpGo:'Start Interpret',
    archTitle:'Record of Proof.',archSub:'An archive of essences interpreted by Aletheia across various fields.',
    welcomeT:'What drives you?',welcomeS:'We extract the essence from your story.',
    chatPh:'Start a conversation...',
    chip1:'Café startup',chip2:'Self-discovery',chip3:'Brand direction',
    chipQ1:'I want to open a café',chipQ2:'I don\'t know what I truly like',chipQ3:'I want to build a brand but don\'t know the direction',
    histTitle:'Previous chats',bmTitle:'Saved messages',galTitle:'Gallery',profTitle:'Live profile',
    profSub:'Your profile, extracted in real-time through conversation.',
    profVal:'Core values',profAvoid:'Avoidance patterns',profMotiv:'Latent motivations',profPrompt:'Current system prompt',
    profEmpty:'Start a conversation to begin extraction...',
    myTitle:'My journey.',
    pricingTitle:'Invest in your essence.',pricingSub:'Choose your Aletheia plan.',
    loginTitle:'Welcome to Aletheia',loginSub:'Begin your journey of essence discovery.',
    loginGoogle:'Continue with Google',loginTerms:'By signing in, you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.',
    explorerName:'Explorer',seekerName:'Seeker',
    explorerPrice:'$0',explorerUnit:'/ forever',explorerDesc:'Experience the philosophy of Aletheia.',
    seekerPrice:'$29',seekerUnit:'/ month',seekerDesc:'Full service for deep essence exploration.',
    priceFeat1:'Core basic dialogue (10/day)',priceFeat2:'Unmask basic profile',priceFeat3:'Archive access',
    priceFeat4:'Core unlimited dialogue',priceFeat5:'Unmask deep profile',priceFeat6:'Interpret field analysis',priceFeat7:'Chat history save & view',priceFeat8:'Deep / Interpret model unlock',
    currentPlan:'Current plan',startSub:'Start subscription →',upgrade:'Start subscription',
    newChat:'New chat',bookmark:'Bookmark',gallery:'Gallery',profile:'Unmask',history:'Previous chats',
    footer:'Less but Better'
  },
  es:{
    signIn:'Iniciar sesión',myPage:'Mi Página',signOut:'Cerrar sesión',
    heroTyping:'Cuando tu historia se convierte en la materia más poderosa.',
    aboutLabel1:'Nuestro Núcleo',aboutLabel2:'El Método',
    phiText:'"Extraemos la esencia de tu historia y la transformamos en materia."',
    phiDesc:'No tomamos ideas de moda del exterior. Extraemos las experiencias y cualidades primordiales de tu interior, y las transformamos en la materia única de tu negocio. Cuanto más hablas, más datos se acumulan — y esos datos se convierten en tu esencia.',
    m1Desc:'<strong>Unmask</strong><br>Extrae tus patrones, valores y motivaciones latentes a través del diálogo, sintetizados en un perfil.',
    m2Desc:'<strong>Interpret</strong><br>Encuentra la intersección entre la esencia de una industria y la tuya.',
    m3Desc:'<strong>Interpret</strong><br>Encuentra la intersección donde la esencia de la industria se encuentra con tu esencia.',
    m1Btn:'Iniciar Diálogo →',m2Btn:'Ver Perfil →',m3Btn:'Iniciar Interpret →',
    unmaskTitle:'Descúbrete.',unmaskDesc:'Inicia una conversación y tus contornos emergerán.<br>Valores, patrones, evasión — todo se acumula aquí.',
    unmaskTitle:'Un mapa que te conoce<br>mejor que tú.',unmaskDesc:'Datos extraídos de Core — valores, patrones, evasión.<br>Todo sintetizado en un solo perfil.',unmaskBtn:'Iniciar diálogo en Core',
    interpTitle:'Interpretando la esencia de los campos.',interpDesc:'Revelando la esencia oculta de marcas, industrias y sujetos externos.',interpPh:'Ingresa un campo o marca',interpGo:'Iniciar Interpret',
    archTitle:'Registro de Prueba.',archSub:'Un archivo de esencias interpretadas por Aletheia en diversos campos.',
    welcomeT:'¿Qué te impulsa?',welcomeS:'Extraemos la esencia de tu historia.',
    chatPh:'Inicia una conversación...',
    chip1:'Abrir cafetería',chip2:'Autodescubrimiento',chip3:'Dirección de marca',
    chipQ1:'Quiero abrir una cafetería',chipQ2:'No sé qué me gusta realmente',chipQ3:'Quiero crear una marca pero no sé la dirección',
    histTitle:'Chats anteriores',bmTitle:'Mensajes guardados',galTitle:'Galería',profTitle:'Perfil en vivo',
    profSub:'Tu perfil, extraído en tiempo real a través de la conversación.',
    profVal:'Valores fundamentales',profAvoid:'Patrones de evasión',profMotiv:'Motivaciones latentes',profPrompt:'Prompt del sistema actual',
    profEmpty:'Inicia una conversación para comenzar la extracción...',
    myTitle:'Mi viaje.',
    pricingTitle:'Invierte en tu esencia.',pricingSub:'Elige tu plan de Aletheia.',
    loginTitle:'Bienvenido a Aletheia',loginSub:'Comienza tu viaje de descubrimiento esencial.',
    loginGoogle:'Continuar con Google',loginTerms:'Al iniciar sesión, aceptas nuestros <a href="#">Términos</a> y <a href="#">Política de Privacidad</a>.',
    explorerName:'Explorer',seekerName:'Seeker',
    explorerPrice:'$0',explorerUnit:'/ siempre',explorerDesc:'Experimenta la filosofía de Aletheia.',
    seekerPrice:'$29',seekerUnit:'/ mes',seekerDesc:'Servicio completo para exploración profunda de esencia.',
    priceFeat1:'Diálogo básico Core (10/día)',priceFeat2:'Perfil básico Unmask',priceFeat3:'Acceso al Archivo',
    priceFeat4:'Diálogo ilimitado Core',priceFeat5:'Perfil profundo Unmask',priceFeat6:'Análisis de campo Interpret',priceFeat7:'Guardar y ver historial de chat',priceFeat8:'Desbloquear modelos Deep / Interpret',
    currentPlan:'Plan actual',startSub:'Iniciar suscripción →',upgrade:'Iniciar suscripción',
    newChat:'Nuevo chat',bookmark:'Marcador',gallery:'Galería',profile:'Unmask',history:'Chats anteriores',
    footer:'Less but Better'
  }
};

function t(key){return (I18N[currentLang]&&I18N[currentLang][key])||I18N['ko'][key]||key}
function applyLang(){
  /* Nav */
  document.querySelector('#btnSignIn span').textContent=t('signIn');
  document.getElementById('btnMyPage').textContent=t('myPage');
  document.getElementById('btnSignOut').textContent=t('signOut');
  /* Hero */
  document.querySelector('.phi-text').innerHTML=t('phiText');
  document.querySelector('.phi-desc').textContent=t('phiDesc');
  /* Method */
  var mDescs=document.querySelectorAll('.m-desc');
  if(mDescs[0])mDescs[0].innerHTML=t('m1Desc');
  if(mDescs[1])mDescs[1].innerHTML=t('m2Desc');
  var mBtns=document.querySelectorAll('.m-btn');
  if(mBtns[0])mBtns[0].textContent=t('m1Btn');
  if(mBtns[1])mBtns[1].textContent=t('m2Btn');
  if(mBtns[2])mBtns[2].textContent=t('m3Btn');
  /* Service pages */
  var umT=document.querySelector('#page-unmask .svc-intro-title');if(umT)umT.innerHTML=t('unmaskTitle');
  var umD=document.querySelector('#page-unmask .svc-intro-desc');if(umD)umD.innerHTML=t('unmaskDesc');
  /* unmask merged into core */
  var inT=document.querySelector('#page-interpret .svc-intro-title');if(inT)inT.innerHTML=t('interpTitle');
  var inD=document.querySelector('#page-interpret .svc-intro-desc');if(inD)inD.innerHTML=t('interpDesc');
  var inPh=document.getElementById('interpretInput');if(inPh)inPh.placeholder=t('interpPh');
  var inGo=document.getElementById('interpretGo');if(inGo&&!inGo.disabled)inGo.textContent=t('interpGo');
  /* Archive */
  var archT=document.querySelector('.archive-map-title');if(archT)archT.textContent=t('archTitle');
  var archS=document.querySelector('.archive-map-sub');if(archS)archS.textContent=t('archSub');
  /* Chat */
  var wT=document.querySelector('.cb-welcome-t');if(wT)wT.textContent=t('welcomeT');
  var wS=document.querySelector('.cb-welcome-s');if(wS)wS.textContent=t('welcomeS');
  var cbTa=document.getElementById('cbTa');if(cbTa)cbTa.placeholder=t('chatPh');
  var barPh=document.querySelector('.cb-ph');if(barPh){var caret=barPh.querySelector('.cb-caret');barPh.textContent='';if(caret)barPh.appendChild(caret);barPh.appendChild(document.createTextNode(t('chatPh')))}
  var chips=document.querySelectorAll('.cb-chip');
  if(chips[0]){chips[0].textContent=t('chip1');chips[0].setAttribute('data-q',t('chipQ1'))}
  if(chips[1]){chips[1].textContent=t('chip2');chips[1].setAttribute('data-q',t('chipQ2'))}
  if(chips[2]){chips[2].textContent=t('chip3');chips[2].setAttribute('data-q',t('chipQ3'))}
  /* Panels */
  var panels=document.querySelectorAll('.cbp-title');
  if(panels[0])panels[0].textContent=t('histTitle');
  if(panels[1])panels[1].textContent=t('bmTitle');
  if(panels[2])panels[2].textContent=t('galTitle');
  if(panels[3])panels[3].textContent=t('profTitle');
  var profSub=document.querySelector('.cbp-profile-sub');if(profSub)profSub.textContent=t('profSub');
  var secTitles=document.querySelectorAll('.cbp-section-title');
  if(secTitles[0])secTitles[0].textContent=t('profVal');
  if(secTitles[1])secTitles[1].textContent=t('profAvoid');
  if(secTitles[2])secTitles[2].textContent=t('profMotiv');
  if(secTitles[3])secTitles[3].textContent=t('profPrompt');
  /* Tooltips */
  document.getElementById('cbNewChat').title=t('newChat');
  document.getElementById('cbBookmarkList').title=t('bookmark');
  document.getElementById('cbGalleryBtn').title=t('gallery');
  document.getElementById('cbProfileBtn').title=t('profile');
  document.getElementById('cbHistoryBtn').title=t('history');
  /* My Page */
  var myT=document.querySelector('.mypage-title');if(myT)myT.textContent=t('myTitle');
  var upBtn=document.getElementById('btnUpgrade');if(upBtn)upBtn.textContent=t('upgrade');
  /* Login */
  var loginT=document.querySelector('.login-title');if(loginT)loginT.textContent=t('loginTitle');
  var loginS=document.querySelector('.login-sub');if(loginS)loginS.textContent=t('loginSub');
  var gBtn=document.getElementById('btnGoogle');if(gBtn){var svg=gBtn.querySelector('svg');gBtn.textContent='';if(svg)gBtn.appendChild(svg);gBtn.appendChild(document.createTextNode(t('loginGoogle')))}
  var loginTe=document.querySelector('.login-terms');if(loginTe)loginTe.innerHTML=t('loginTerms');
  /* Pricing */
  var prT=document.querySelector('.pricing-title');if(prT)prT.textContent=t('pricingTitle');
  var prS=document.querySelector('.pricing-sub');if(prS)prS.textContent=t('pricingSub');
  var pcNames=document.querySelectorAll('.pc-name');
  if(pcNames[0])pcNames[0].textContent=t('explorerName');
  if(pcNames[1])pcNames[1].textContent=t('seekerName');
  var pcPrices=document.querySelectorAll('.pc-price');
  if(pcPrices[0])pcPrices[0].innerHTML=t('explorerPrice')+' <span>'+t('explorerUnit')+'</span>';
  if(pcPrices[1])pcPrices[1].innerHTML=t('seekerPrice')+' <span>'+t('seekerUnit')+'</span>';
  var pcDescs=document.querySelectorAll('.pc-desc');
  if(pcDescs[0])pcDescs[0].textContent=t('explorerDesc');
  if(pcDescs[1])pcDescs[1].textContent=t('seekerDesc');
  /* Footer */
  var footerR=document.querySelector('footer div:last-child');if(footerR)footerR.textContent=t('footer');
  /* Typing labels */
  var labels=document.querySelectorAll('.typing-target');
  if(labels[0])labels[0].setAttribute('data-text',t('aboutLabel1'));
  if(labels[1])labels[1].setAttribute('data-text',t('aboutLabel2'));
  /* Hero replay */
  if(window._heroReplay)window._heroReplay(t('heroTyping'));
  /* Pricing features */
  var pcFeats=document.querySelectorAll('.pc-features');
  if(pcFeats[0]){var lis0=pcFeats[0].querySelectorAll('li');if(lis0[0])lis0[0].textContent=t('priceFeat1');if(lis0[1])lis0[1].textContent=t('priceFeat2');if(lis0[2])lis0[2].textContent=t('priceFeat3')}
  if(pcFeats[1]){var lis1=pcFeats[1].querySelectorAll('li');if(lis1[0])lis1[0].textContent=t('priceFeat4');if(lis1[1])lis1[1].textContent=t('priceFeat5');if(lis1[2])lis1[2].textContent=t('priceFeat6');if(lis1[3])lis1[3].textContent=t('priceFeat7');if(lis1[4])lis1[4].textContent=t('priceFeat8')}
  var btnCur=pcFeats[0]?pcFeats[0].parentElement.querySelector('.btn-price'):null;if(btnCur)btnCur.textContent=t('currentPlan');
  var btnSub=pcFeats[1]?pcFeats[1].parentElement.querySelector('.btn-price'):null;if(btnSub)btnSub.textContent=t('startSub');
}

/* Language selector */
var LANG_LABELS={ko:'KO',en:'EN',es:'ES'};
document.getElementById('langBtn').addEventListener('click',function(e){e.stopPropagation();document.getElementById('langDropdown').classList.toggle('show')});
document.querySelectorAll('.lang-opt').forEach(function(opt){
  opt.addEventListener('click',function(e){
    e.stopPropagation();
    currentLang=this.getAttribute('data-lang');
    localStorage.setItem('aletheia-lang',currentLang);
    document.getElementById('langCurrent').textContent=LANG_LABELS[currentLang];
    document.querySelectorAll('.lang-opt').forEach(function(o){o.classList.toggle('active',o.getAttribute('data-lang')===currentLang)});
    document.getElementById('langDropdown').classList.remove('show');
    applyLang();
  });
});
document.addEventListener('click',function(e){if(!e.target.closest('.lang-sel'))document.getElementById('langDropdown').classList.remove('show')});
/* Init lang */
document.getElementById('langCurrent').textContent=LANG_LABELS[currentLang];
document.querySelectorAll('.lang-opt').forEach(function(o){o.classList.toggle('active',o.getAttribute('data-lang')===currentLang)});
if(currentLang!=='ko')applyLang();
function mockSignIn(){authUser=MOCK;updateAuthUI();closeModal('loginOverlay');switchPage(pendingPage||'unmask');pendingPage=null}
function mockSignOut(){authUser=null;currentModel='Core';updateAuthUI();closeProfileDropdown();switchPage('about')}
function updateAuthUI(){var btn=document.getElementById('btnSignIn'),prof=document.getElementById('navProfile');if(authUser){btn.style.display='none';prof.classList.add('show');document.getElementById('navName').textContent=authUser.name;document.getElementById('mpName').textContent=authUser.name;document.getElementById('mpEmail').textContent=authUser.email;var badge=document.getElementById('mpBadge');if(authUser.plan==='seeker'){badge.textContent='SEEKER';badge.classList.add('pro')}else{badge.textContent='FREE';badge.classList.remove('pro')}}else{btn.style.display='flex';prof.classList.remove('show')}}

/* PAGES */
var loginRequired=['unmask','interpret','mypage'];
function switchPage(page){
  if(loginRequired.indexOf(page)!==-1&&!authUser){pendingPage=page;openModal('loginOverlay');return}
  document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active')});
  var el=document.getElementById('page-'+page);if(!el)return;el.classList.add('active');
  document.querySelectorAll('.nav-center li').forEach(function(l){l.classList.toggle('active',l.getAttribute('data-page')===page)});
  document.getElementById('coreWrap').style.display=(page==='unmask')?'flex':'none';
  if(page!=='unmask'){collapseChat()}
  if(page==='about'||page==='archive'){document.body.style.overflow='auto';el.style.overflow='auto'}else{document.body.style.overflow='hidden'}
  /* 등장 모션 */
  el.querySelectorAll('.svc-anim').forEach(function(a){a.classList.remove('visible')});
  setTimeout(function(){
    el.querySelectorAll('.svc-anim').forEach(function(a){
      var delay=parseInt(a.getAttribute('data-delay'))||0;
      setTimeout(function(){a.classList.add('visible')},delay);
    });
  },50);
}
window.goPage=function(p){switchPage(p)};
function openModal(id){document.getElementById(id).classList.add('show')}
function closeModal(id){document.getElementById(id).classList.remove('show')}
function closeProfileDropdown(){document.getElementById('profileDropdown').classList.remove('show')}

/* EVENTS */
document.querySelectorAll('.nav-center li').forEach(function(li){li.addEventListener('click',function(){switchPage(li.getAttribute('data-page'))})});
document.getElementById('logoBtn').addEventListener('click',function(){switchPage('about')});
document.getElementById('btnSignIn').addEventListener('click',function(){openModal('loginOverlay')});
document.getElementById('btnGoogle').addEventListener('click',mockSignIn);
document.getElementById('btnSignOut').addEventListener('click',mockSignOut);
document.getElementById('btnMyPage').addEventListener('click',function(){closeProfileDropdown();switchPage('mypage')});
document.getElementById('navProfileBtn').addEventListener('click',function(e){if(e.target.closest('.profile-dropdown'))return;document.getElementById('profileDropdown').classList.toggle('show')});
document.addEventListener('click',function(e){if(!e.target.closest('.nav-profile'))closeProfileDropdown()});
document.querySelectorAll('.modal-overlay').forEach(function(ov){ov.addEventListener('click',function(e){if(e.target===ov)closeModal(ov.id)})});
document.getElementById('pricingClose').addEventListener('click',function(){closeModal('pricingOverlay')});
document.getElementById('btnUpgrade').addEventListener('click',function(){openModal('pricingOverlay')});
document.getElementById('btnCheckout').addEventListener('click',function(){if(!authUser){closeModal('pricingOverlay');openModal('loginOverlay');return}authUser.plan='seeker';updateAuthUI();closeModal('pricingOverlay');alert('Seeker 구독이 시작되었습니다!')});
/* unmask button removed — merged into core */

/* INTERPRET MOCK */
var INTERPRET_DATA={
  '스페셜티 커피':{surface:'고급 원두, 산지 정보, 추출 방식의 다양성',essence:'감각적 경험의 큐레이션 — 미각을 통한 세계 인식',desire:'일상에서 특별한 순간을 소유하고 싶은 욕구',cross:'당신의 공간 감각과 장인 정신이 만나는 지점. 커피는 매개체이고, 진짜 팔리는 것은 "나만의 취향을 가진 사람"이라는 정체성.',insight:'스페셜티 커피 시장은 음료를 파는 것이 아니라 "감각적 자아"를 파는 시장입니다. 원두의 차이를 아는 것은 곧 "남들과 다른 나"를 증명하는 행위입니다.'},
  '패션':{surface:'트렌드, 소재, 실루엣, 시즌 컬렉션',essence:'외면을 통한 내면의 선언 — 입는 것은 곧 존재 방식의 표현',desire:'타인의 시선 속에서 자신의 이상적 자아를 확인받고 싶은 욕구',cross:'당신의 브랜드 감각과 독립 지향성이 교차하는 지점.',insight:'패션은 천을 파는 것이 아니라 "미래의 나"를 파는 시장입니다.'},
  '인테리어':{surface:'가구 배치, 색감, 조명, 동선 설계',essence:'삶의 철학을 공간에 물리적으로 구현하는 행위',desire:'자신만의 세계를 물리적으로 소유하고 통제하고 싶은 욕구',cross:'당신의 공간 감각과 완벽주의가 만나는 지점.',insight:'인테리어는 예쁜 집을 만드는 것이 아니라 "나는 이렇게 사는 사람이다"를 물리적으로 선언하는 행위입니다.'}
};
var INTERPRET_DEFAULT={surface:'분석 중...',essence:'분석 중...',desire:'분석 중...',cross:'분석 중...',insight:'분석 중...'};

var SYSTEM_INTERPRET_ANALYSIS='interpret_analysis';

document.getElementById('interpretGo').addEventListener('click',function(){
  var input=document.getElementById('interpretInput').value.trim();
  if(!input)return;
  var btn=document.getElementById('interpretGo');
  btn.textContent='분석 중...';btn.disabled=true;
  
  document.getElementById('irField').textContent=input;
  var result=document.getElementById('interpretResult');
  
  /* Show with loading state */
  var fallback=INTERPRET_DATA[input]||null;
  var loadingData=INTERPRET_DEFAULT;
  document.getElementById('irSurface').textContent=loadingData.surface;
  document.getElementById('irEssence').textContent=loadingData.essence;
  document.getElementById('irDesire').textContent=loadingData.desire;
  document.getElementById('irCross').textContent=loadingData.cross;
  document.getElementById('irInsight').textContent=loadingData.insight;
  result.style.display='block';result.style.animation='none';result.offsetHeight;result.style.animation='msgIn 0.6s ease';
  
  /* Build user context */
  var userContext='분석 대상: '+input+'\n';
  if(profileData.tags.length>0)userContext+='사용자 태그: '+profileData.tags.join(', ')+'\n';
  if(profileData.values&&profileData.values!=='대화가 더 필요합니다...')userContext+='사용자 가치관: '+profileData.values+'\n';
  if(profileData.motiv&&profileData.motiv!=='대화가 더 필요합니다...')userContext+='사용자 동기: '+profileData.motiv+'\n';
  if(profileData.patterns.length>0)userContext+='발견된 패턴: '+profileData.patterns.join('; ')+'\n';
  
  callClaude(SYSTEM_INTERPRET_ANALYSIS,[{role:'user',content:userContext}],800).then(function(resp){
    try{
      var clean=resp.replace(/```json|```/g,'').trim();
      var data=JSON.parse(clean);
      document.getElementById('irSurface').textContent=data.surface||'—';
      document.getElementById('irEssence').textContent=data.essence||'—';
      document.getElementById('irDesire').textContent=data.desire||'—';
      document.getElementById('irCross').textContent=data.cross||'—';
      document.getElementById('irInsight').textContent=data.insight||'—';
    }catch(e){
      console.log('Interpret parse error:',e);
      if(fallback){
        document.getElementById('irSurface').textContent=fallback.surface;
        document.getElementById('irEssence').textContent=fallback.essence;
        document.getElementById('irDesire').textContent=fallback.desire;
        document.getElementById('irCross').textContent=fallback.cross;
        document.getElementById('irInsight').textContent=fallback.insight;
      }
    }
    btn.textContent='해석 시작';btn.disabled=false;
  }).catch(function(err){
    console.log('Interpret API error:',err);
    if(fallback){
      document.getElementById('irSurface').textContent=fallback.surface;
      document.getElementById('irEssence').textContent=fallback.essence;
      document.getElementById('irDesire').textContent=fallback.desire;
      document.getElementById('irCross').textContent=fallback.cross;
      document.getElementById('irInsight').textContent=fallback.insight;
    }
    btn.textContent='해석 시작';btn.disabled=false;
  });
});
document.getElementById('interpretInput').addEventListener('keydown',function(e){if(e.key==='Enter')document.getElementById('interpretGo').click()});


/* CHATBOX – v4 expand pattern */
var box=document.getElementById('coreBox'),bar=document.getElementById('cbBar'),closeBtn=document.getElementById('cbClose');
function expandChat(){
  box.classList.add('expanded');
  setTimeout(function(){document.getElementById('cbTa').focus()},300);
}
function collapseChat(){
  box.classList.remove('expanded');
  closePanels();
}
bar.addEventListener('click',function(e){if(e.target.closest('.cb-model'))return;expandChat()});
closeBtn.addEventListener('click',collapseChat);
document.getElementById('coreWrap').style.display='none';

/* OVERLAY PANELS */
var historyPanel=document.getElementById('cbHistoryPanel');
var profilePanel=document.getElementById('cbProfilePanel');
var bookmarkPanel=document.getElementById('cbBookmarkPanel');
var galleryPanel=document.getElementById('cbGalleryPanel');
var historyBtn=document.getElementById('cbHistoryBtn');
var profileBtn=document.getElementById('cbProfileBtn');
var bookmarkListBtn=document.getElementById('cbBookmarkList');
var galleryBtn=document.getElementById('cbGalleryBtn');
var allPanels=[historyPanel,profilePanel,bookmarkPanel,galleryPanel];
var allPanelBtns=[historyBtn,profileBtn,bookmarkListBtn,galleryBtn];
function closePanels(){allPanels.forEach(function(p){p.classList.remove('show')});allPanelBtns.forEach(function(b){b.classList.remove('active')})}
function togglePanel(panel,btn,onOpen){
  var wasOpen=panel.classList.contains('show');closePanels();
  if(!wasOpen){panel.classList.add('show');btn.classList.add('active');if(onOpen)onOpen()}
}
historyBtn.addEventListener('click',function(e){e.stopPropagation();togglePanel(historyPanel,historyBtn,renderHistory)});
profileBtn.addEventListener('click',function(e){e.stopPropagation();togglePanel(profilePanel,profileBtn)});
bookmarkListBtn.addEventListener('click',function(e){e.stopPropagation();togglePanel(bookmarkPanel,bookmarkListBtn,renderBookmarks)});
galleryBtn.addEventListener('click',function(e){e.stopPropagation();togglePanel(galleryPanel,galleryBtn,renderGallery)});

/* NEW CHAT */
document.getElementById('cbNewChat').addEventListener('click',function(){
  // 현재 대화 저장
  saveCurrentSession();
  closePanels();chatStarted=false;msgCount=0;umMsgCount=0;umExtractCount=0;
  document.getElementById('cbMsgs').innerHTML='';
  /* Reset Unmask panel */
  document.getElementById('cbProfileTags').innerHTML='';
  document.getElementById('umDepthFill').style.width='0%';
  document.getElementById('umDepthCount').textContent='0회';
  document.getElementById('umBadge').classList.remove('show');
  document.getElementById('umBadge').textContent='0';
  document.getElementById('umStatusDot2').classList.remove('active');
  document.getElementById('umStatusText2').textContent='대기 중';
  document.getElementById('profileValues').textContent='대화가 더 필요합니다...';
  document.getElementById('profileAvoid').textContent='대화가 더 필요합니다...';
  document.getElementById('profileMotiv').textContent='대화가 더 필요합니다...';
  document.getElementById('umSecValues').className='cbp-section locked';
  document.getElementById('umSecAvoid').className='cbp-section locked';
  document.getElementById('umSecMotiv').className='cbp-section locked';
  var w=document.createElement('div');w.id='cbWelcome';w.className='cb-welcome';
  w.innerHTML='<div class="cb-welcome-t">무엇이 당신을 이끄나요?</div><div class="cb-welcome-s">당신의 이야기에서 본질을 추출합니다.</div><div class="cb-chips"><span class="cb-chip" data-q="나는 카페를 하고 싶어">카페 창업</span><span class="cb-chip" data-q="내가 진짜 좋아하는게 뭔지 모르겠어">자기 탐구</span><span class="cb-chip" data-q="브랜드를 만들고 싶은데 방향을 모르겠어">브랜드 방향</span></div>';
  document.getElementById('cbMsgs').appendChild(w);
  w.querySelectorAll('.cb-chip').forEach(function(c){c.addEventListener('click',function(){sendMsg(c.getAttribute('data-q'))})});
  welcome=w;currentSessionMsgs=[];
});

/* FILE ATTACH – GPT-style: preview first, send with message */
var pendingFile=null;
function showAttachPreview(file,dataUrl){
  removeAttachPreview();
  pendingFile={file:file,dataUrl:dataUrl||null};
  var preview=document.createElement('div');
  preview.className='cb-attach-preview';
  preview.id='cbAttachPreview';
  if(file.type.startsWith('image/')&&dataUrl){
    preview.innerHTML='<img class="cb-attach-preview-img" src="'+dataUrl+'" alt=""/><span class="cb-attach-preview-name">'+file.name+'</span><button class="cb-attach-preview-remove"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
  } else {
    preview.innerHTML='<div class="cb-attach-preview-icon"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div><span class="cb-attach-preview-name">'+file.name+'</span><button class="cb-attach-preview-remove"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
  }
  var inputArea=document.querySelector('.cb-input');
  inputArea.insertBefore(preview,inputArea.querySelector('.cb-input-row'));
  preview.querySelector('.cb-attach-preview-remove').addEventListener('click',removeAttachPreview);
  sendBtn.classList.add('ready');
}
function removeAttachPreview(){
  pendingFile=null;
  var el=document.getElementById('cbAttachPreview');if(el)el.remove();
  if(!ta.value.trim())sendBtn.classList.remove('ready');
}
document.getElementById('cbAttach').addEventListener('click',function(){
  var input=document.createElement('input');input.type='file';input.accept='image/*,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx';
  input.addEventListener('change',function(e){
    var file=e.target.files[0];if(!file)return;
    if(!box.classList.contains('expanded'))expandChat();
    closePanels();
    if(file.type.startsWith('image/')){
      var reader=new FileReader();
      reader.onload=function(ev){showAttachPreview(file,ev.target.result)};
      reader.readAsDataURL(file);
    } else {
      showAttachPreview(file,null);
    }
    ta.focus();
  });input.click();
});
var imageGallery=[];

/* GALLERY */
function renderGallery(){
  var grid=document.getElementById('cbGalleryGrid');
  if(!imageGallery.length){grid.innerHTML='<div class="cbp-gallery-empty">아직 이미지가 없습니다.<br>대화에서 이미지를 첨부해보세요.</div>';return}
  grid.innerHTML='';imageGallery.forEach(function(img){
    var item=document.createElement('div');item.className='cbp-gallery-item';
    item.innerHTML='<img src="'+img.src+'" alt="gallery"/>';
    item.addEventListener('click',function(){window.open(img.src,'_blank')});
    grid.appendChild(item);
  });
}

/* CHAT HISTORY – full session save/restore */
var chatHistory=[];
var currentSessionMsgs=[];
function saveCurrentSession(){
  if(!currentSessionMsgs.length)return;
  var preview=currentSessionMsgs.find(function(m){return m.role==='user'&&m.type==='text'});
  chatHistory.unshift({
    date:new Date().toLocaleString('ko-KR',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}),
    preview:preview?preview.text:'(파일 첨부)',
    messages:currentSessionMsgs.slice()
  });
}
function renderHistory(){
  var list=document.getElementById('cbHistoryList');
  if(!chatHistory.length){list.innerHTML='<div class="cbh-empty">아직 대화 기록이 없습니다.<br>대화를 시작해보세요.</div>';return}
  list.innerHTML='';chatHistory.forEach(function(session,i){
    var item=document.createElement('div');item.className='cbh-item';
    item.innerHTML='<div class="cbh-item-date">'+session.date+'</div><div class="cbh-item-preview">'+session.preview+'</div>';
    item.addEventListener('click',function(){restoreSession(i)});
    list.appendChild(item);
  });
}
function restoreSession(idx){
  closePanels();
  var session=chatHistory[idx];if(!session)return;
  chatStarted=true;msgCount=session.messages.filter(function(m){return m.role==='user'}).length;
  msgs.innerHTML='';
  session.messages.forEach(function(m){
    if(m.type==='text'){addMsg(m.role,m.text)}
    else if(m.type==='image'){
      var d=document.createElement('div');d.className='msg msg-right';
      d.innerHTML='<div class="msg-body"><img class="msg-img" src="'+m.src+'" alt="img"/></div>';
      msgs.appendChild(d);
    } else if(m.type==='file'){
      var d=document.createElement('div');d.className='msg msg-right';
      d.innerHTML='<div class="msg-body"><div class="cb-file-preview"><div class="cb-file-preview-icon"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div><span class="cb-file-preview-name">'+m.name+'</span></div></div>';
      msgs.appendChild(d);
    }
  });
  currentSessionMsgs=session.messages.slice();
  msgs.scrollTop=msgs.scrollHeight;
}

/* BOOKMARKS */
var bookmarks=[];
function toggleBookmark(idx,text,role){
  var existing=bookmarks.findIndex(function(b){return b.idx===idx});
  if(existing!==-1){bookmarks.splice(existing,1);return false}
  bookmarks.push({idx:idx,text:text,role:role,date:new Date().toLocaleString('ko-KR',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})});return true;
}
function renderBookmarks(){
  var list=document.getElementById('cbBookmarkListContent');
  if(!bookmarks.length){list.innerHTML='<div class="cbh-empty">북마크한 메시지가 없습니다.<br>메시지에 마우스를 올려 🔖를 클릭하세요.</div>';return}
  var html='';bookmarks.forEach(function(b){html+='<div class="cbh-item"><div class="cbh-item-date">'+b.date+' · '+(b.role==='ai'?'AI':'You')+'</div><div class="cbh-item-preview">'+b.text+'</div></div>'});
  list.innerHTML=html;
}

/* LIVE PROFILE */
var profileData={tags:[],essence:'',patterns:[],values:'대화가 더 필요합니다...',avoid:'대화가 더 필요합니다...',motiv:'대화가 더 필요합니다...',timeline:[]};

/* SYSTEM PROMPTS */
var SYSTEM_CORE='core';

var SYSTEM_INTERPRET='interpret';

var SYSTEM_META_EXTRACT='meta_extract';

var conversationHistory=[];
var unmaskRawData=[];
var aletheiaSessionId='session_'+Date.now().toString(36)+Math.random().toString(36).substring(2,8);

/* API CALL — 서버 프록시 경유 */
async function callClaude(mode,history,maxTokens){
  maxTokens=maxTokens||600;
  var apiMessages=history.slice();
  var response=await fetch("/api/chat",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      mode:mode,
      messages:apiMessages,
      max_tokens:maxTokens,
      sessionId:aletheiaSessionId,
      userId:"user_"+aletheiaSessionId
    })
  });
  var data=await response.json();
  if(data.error)throw new Error(data.error.message||"API error");
  var fullResponse=data.content.map(function(item){return item.type==="text"?item.text:""}).filter(Boolean).join("\n");
  if(fullResponse)return fullResponse;
  throw new Error("Empty response");
}















  if(data.error)throw new Error(data.error.message||'API error');
  var fullResponse=data.content.map(function(item){return item.type==='text'?item.text:''}).filter(Boolean).join('\n');
  if(fullResponse)return fullResponse;
  throw new Error('Empty response');
}

/* BACKGROUND METADATA EXTRACTION */
function extractMetaFromConversation(){
  if(conversationHistory.length<2)return;
  var last4=conversationHistory.slice(-4);
  var convText=last4.map(function(m){return (m.role==='user'?'사용자':'AI')+': '+m.content}).join('\n');
  
  callClaude(SYSTEM_META_EXTRACT,[{role:'user',content:convText}],400).then(function(resp){
    try{
      var clean=resp.replace(/```json|```/g,'').trim();
      var meta=JSON.parse(clean);
      unmaskRawData.push({timestamp:Date.now(),turn:Math.floor(conversationHistory.length/2),meta:meta});
      
      /* Update profile tags */
      if(meta.tags){
        meta.tags.forEach(function(tag){
          if(profileData.tags.indexOf(tag)===-1){profileData.tags.push(tag)}
        });
      }
      if(meta.value)profileData.values=meta.value;
      if(meta.desire)profileData.motiv=meta.desire;
      if(meta.pattern){
        profileData.patterns.push(meta.pattern);
        profileData.avoid=meta.emotion||profileData.avoid;
      }
      
      /* Timeline entry */
      profileData.timeline.push({
        turn:Math.floor(conversationHistory.length/2),
        keywords:meta.keywords||[],
        pattern:meta.pattern,
        emotion:meta.emotion
      });
      
      updateProfileUI();
      console.log('[Unmask] 메타데이터 추출:',meta);
    }catch(e){console.log('[Unmask] 파싱 실패:',e,resp)}
  }).catch(function(e){console.log('[Unmask] 추출 API 실패:',e)});
}

/* SEND MESSAGE */
function sendMsg(t){
  var hasText=t&&t.trim();
  var hasFile=!!pendingFile;
  if(!hasText&&!hasFile)return;
  if(hasText)t=t.trim();
  if(!chatStarted){chatStarted=true;welcome.classList.add('hidden')}
  if(!box.classList.contains('expanded'))expandChat();
  closePanels();
  if(hasFile){
    if(pendingFile.file.type.startsWith('image/')&&pendingFile.dataUrl){
      var d=document.createElement('div');d.className='msg msg-right';
      d.innerHTML='<div class="msg-body"><img class="msg-img" src="'+pendingFile.dataUrl+'" alt=""/></div>';
      msgs.appendChild(d);
      imageGallery.push({src:pendingFile.dataUrl,date:new Date().toLocaleString('ko-KR',{month:'short',day:'numeric'})});
      currentSessionMsgs.push({role:'user',type:'image',src:pendingFile.dataUrl});
    } else {
      var d=document.createElement('div');d.className='msg msg-right';
      d.innerHTML='<div class="msg-body"><div class="cb-file-preview"><div class="cb-file-preview-icon"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div><span class="cb-file-preview-name">'+pendingFile.file.name+'</span></div></div>';
      msgs.appendChild(d);
      currentSessionMsgs.push({role:'user',type:'file',name:pendingFile.file.name});
    }
    removeAttachPreview();
  }
  if(hasText){addMsg('user',t);currentSessionMsgs.push({role:'user',type:'text',text:t});onUserMessage()}
  ta.value='';ta.style.height='auto';sendBtn.classList.remove('ready');
  if(!hasText)return;
  conversationHistory.push({role:'user',content:t});
  var typ=addTyping();
  
  /* Select system prompt based on model */
  var sysPrompt=(currentModel==='Interpret')?SYSTEM_INTERPRET:SYSTEM_CORE;
  
  callClaude(sysPrompt,conversationHistory).then(function(aiResp){
    typ.remove();addMsg('ai',aiResp);
    currentSessionMsgs.push({role:'ai',type:'text',text:aiResp});
    conversationHistory.push({role:'assistant',content:aiResp});
    /* Background: extract metadata for Unmask every 2 turns */
    if(conversationHistory.length%4===0||conversationHistory.length===2){
      extractMetaFromConversation();
    }
  }).catch(function(err){
    console.log('API error:',err);
    typ.remove();
    var fallback=respondFallback(t);
    addMsg('ai',fallback);
    currentSessionMsgs.push({role:'ai',type:'text',text:fallback});
    conversationHistory.push({role:'assistant',content:fallback});
    /* Still extract from keywords locally */
    extractProfileLocal(t);
  });
}

/* LOCAL FALLBACK EXTRACTION */
var TAG_RULES=[
  {keywords:['카페','커피','로스팅','바리스타','원두'],tag:'커피/카페'},
  {keywords:['브랜드','로고','아이덴티티','디자인'],tag:'브랜드구축'},
  {keywords:['좋아하는','진짜','모르겠','찾고'],tag:'자기탐색'},
  {keywords:['공간','인테리어','분위기','설계'],tag:'공간감각'},
  {keywords:['불안','걱정','두려','실패'],tag:'불확실성인식'},
  {keywords:['자유','독립','나만의','혼자'],tag:'독립지향'},
  {keywords:['경험','여행','느낌','감정','기억'],tag:'경험기반'},
  {keywords:['완벽','디테일','꼼꼼','퀄리티'],tag:'완벽주의'},
  {keywords:['사람','고객','손님','관계','소통'],tag:'관계중심'},
  {keywords:['돈','수익','사업','매출','투자'],tag:'수익지향'}
];
function extractProfileLocal(text){
  var changed=false;
  TAG_RULES.forEach(function(rule){
    var match=rule.keywords.some(function(k){return text.indexOf(k)!==-1});
    if(match&&profileData.tags.indexOf(rule.tag)===-1){
      profileData.tags.push(rule.tag);changed=true;
    }
  });
  if(changed)updateProfileUI();
}
var umExtractCount=0;
var umMsgCount=0;
function updateProfileUI(){
  umExtractCount++;
  /* Tags */
  var container=document.getElementById('cbProfileTags');container.innerHTML='';
  profileData.tags.forEach(function(tag,i){var el=document.createElement('span');el.className='cbp-tag'+(i===profileData.tags.length-1?' new':'');el.textContent=tag;container.appendChild(el)});
  /* Sections - unlock with animation when data arrives */
  var secV=document.getElementById('umSecValues');
  var secA=document.getElementById('umSecAvoid');
  var secM=document.getElementById('umSecMotiv');
  if(profileData.values&&profileData.values!=='대화가 더 필요합니다...'){
    document.getElementById('profileValues').textContent=profileData.values;
    if(secV.classList.contains('locked')){secV.classList.remove('locked');secV.classList.add('unlocked')}
  }
  if(profileData.avoid&&profileData.avoid!=='대화가 더 필요합니다...'){
    document.getElementById('profileAvoid').textContent=profileData.avoid;
    if(secA.classList.contains('locked')){secA.classList.remove('locked');secA.classList.add('unlocked')}
  }
  if(profileData.motiv&&profileData.motiv!=='대화가 더 필요합니다...'){
    document.getElementById('profileMotiv').textContent=profileData.motiv;
    if(secM.classList.contains('locked')){secM.classList.remove('locked');secM.classList.add('unlocked')}
  }
  /* Depth bar */
  var depth=Math.min(umMsgCount/10,1);
  document.getElementById('umDepthFill').style.width=Math.round(depth*100)+'%';
  document.getElementById('umDepthCount').textContent=umMsgCount+'\ud68c';
  /* Badge - show count & pop */
  var badge=document.getElementById('umBadge');
  badge.textContent=umExtractCount;
  badge.classList.add('show');
  /* Button glow burst */
  profileBtn.classList.remove('unmask-glow','unmask-shake');
  void profileBtn.offsetWidth;
  profileBtn.classList.add('unmask-glow');
  setTimeout(function(){profileBtn.classList.remove('unmask-glow')},1600);
  /* Status */
  var dot=document.getElementById('umStatusDot2');
  var txt=document.getElementById('umStatusText2');
  if(dot)dot.classList.add('active');
  if(txt)txt.textContent='\ucd94\ucd9c \uc644\ub8cc \u2014 '+umExtractCount+'\uac74';
}
function onUserMessage(){
  umMsgCount++;
  /* Depth bar update */
  var depth=Math.min(umMsgCount/10,1);
  var fill=document.getElementById('umDepthFill');
  if(fill)fill.style.width=Math.round(depth*100)+'%';
  var cnt=document.getElementById('umDepthCount');
  if(cnt)cnt.textContent=umMsgCount+'\ud68c';
  /* Status - analyzing */
  var dot=document.getElementById('umStatusDot2');
  var txt=document.getElementById('umStatusText2');
  if(dot)dot.classList.add('active');
  if(txt)txt.textContent='\ubd84\uc11d \uc911...';
  /* Button subtle shake on every message */
  profileBtn.classList.remove('unmask-shake');
  void profileBtn.offsetWidth;
  profileBtn.classList.add('unmask-shake');
  setTimeout(function(){profileBtn.classList.remove('unmask-shake')},600);
}

/* MODEL SELECTOR */
var menu=document.getElementById('modelMenu');
function updateModelLocks(){var plan=authUser?authUser.plan:'free';menu.querySelectorAll('.mm-opt').forEach(function(o){o.classList.toggle('locked',o.getAttribute('data-tier')==='seeker'&&plan!=='seeker')})}
function openModelMenu(trigger){var r=trigger.getBoundingClientRect();menu.style.left=r.left+'px';menu.style.bottom=(window.innerHeight-r.top+8)+'px';menu.style.top='auto';menu.querySelectorAll('.mm-opt').forEach(function(o){o.classList.toggle('active',o.getAttribute('data-model')===currentModel)});updateModelLocks();menu.classList.add('show')}
document.getElementById('cbModel').addEventListener('click',function(e){e.stopPropagation();if(menu.classList.contains('show')){menu.classList.remove('show');return}openModelMenu(this)});
menu.addEventListener('click',function(e){var opt=e.target.closest('.mm-opt');if(!opt)return;e.stopPropagation();if(opt.classList.contains('locked')){menu.classList.remove('show');openModal('pricingOverlay');return}currentModel=opt.getAttribute('data-model');var col=opt.getAttribute('data-color');document.querySelectorAll('.cb-model .model-name').forEach(function(n){n.textContent=currentModel});document.querySelectorAll('.cb-model .dot').forEach(function(d){d.style.background=col});document.getElementById('cbHeaderName').textContent=MODEL_NAMES[currentModel];menu.classList.remove('show')});
document.addEventListener('click',function(e){if(!e.target.closest('.cb-model')&&!e.target.closest('#modelMenu'))menu.classList.remove('show')});

/* CHAT */
var msgs=document.getElementById('cbMsgs'),welcome=document.getElementById('cbWelcome'),ta=document.getElementById('cbTa'),sendBtn=document.getElementById('cbSend');
var chatStarted=false,msgCount=0,globalMsgIdx=0;
var BKMK_SVG='<svg viewBox="0 0 24 24"><path d="M6 4h12a1 1 0 0 1 1 1v16l-7-4-7 4V5a1 1 0 0 1 1-1z"/></svg>';
var questions=['그게 정말 당신이 원하는 건가요?','왜 그것이어야 하나요?','그 선택의 뿌리가 어디에 있는지 기억나시나요?','혹시 그 반대를 상상해본 적 있나요?','당신이 그 단어를 선택한 이유가 궁금합니다.','지금 말씀하신 것과 처음에 말씀하신 것 사이에 흥미로운 간극이 있어요.','그건 당신의 기준인가요, 아니면 누군가 정해준 기준인가요?'];

function respondFallback(t){
  msgCount++;
  var deep=[
    '당신이 방금 말한 것 속에 흥미로운 물성이 숨어있어요. 조금 더 들려주세요.',
    '그 경험이 당신에게 남긴 잔상은 어떤 형태인가요?',
    '반복되는 패턴이 보이기 시작합니다. "'+t.split(' ')[0]+'" — 이게 당신의 본질에 어떻게 연결되나요?',
    '표면 아래에 더 깊은 동기가 있는 것 같아요. 그 순간 당신은 무엇을 느꼈나요?',
    '당신의 이야기에서 원재료가 보입니다. 이것을 어떤 형태로 세상에 내놓고 싶으세요?',
    '흥미롭군요. 당신이 선택하는 단어들이 하나의 방향을 가리키고 있어요.',
    '그건 단순한 경험이 아니라, 당신만의 관점이에요. 그 관점이 처음 형성된 순간이 있나요?',
    '지금까지의 대화에서 패턴이 드러나고 있습니다. Unmask에서 프로필을 확인해보시겠어요?'
  ];
  return deep[Math.min(msgCount-1,deep.length-1)];
}
function addMsg(role,text){
  var idx=globalMsgIdx++;
  var d=document.createElement('div');d.className=role==='user'?'msg msg-right':'msg';
  if(role==='ai'){
    d.innerHTML='<div class="msg-ava ai">'+LOGO+'</div><div class="msg-body"><div class="msg-role">'+MODEL_NAMES[currentModel]+'</div><div class="msg-text">'+text.replace(/\n/g,'<br>')+'</div><div class="msg-actions"><button class="msg-action-btn" data-bk="'+idx+'" data-text="'+text.replace(/"/g,'&quot;')+'" data-role="'+role+'" title="북마크">'+BKMK_SVG+'</button></div></div>';
  } else {
    d.innerHTML='<div class="msg-body"><div class="msg-text">'+text.replace(/\n/g,'<br>')+'</div></div>';
  }
  msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;
  var bkBtn=d.querySelector('.msg-action-btn[data-bk]');
  if(bkBtn){bkBtn.addEventListener('click',function(){
    var btn=this,i=parseInt(btn.getAttribute('data-bk')),t=btn.getAttribute('data-text'),r=btn.getAttribute('data-role');
    var added=toggleBookmark(i,t,r);btn.classList.toggle('bookmarked',added);
  });}
}
function addTyping(){var d=document.createElement('div');d.className='msg';d.innerHTML='<div class="msg-ava ai">'+LOGO+'</div><div class="msg-body"><div class="msg-role">'+MODEL_NAMES[currentModel]+'</div><div class="typing"><span></span><span></span><span></span></div></div>';msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;return d}
ta.addEventListener('input',function(){ta.style.height='auto';ta.style.height=Math.min(ta.scrollHeight,100)+'px';sendBtn.classList.toggle('ready',ta.value.trim().length>0||!!pendingFile)});
ta.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMsg(ta.value)}});
sendBtn.addEventListener('click',function(){sendMsg(ta.value)});
document.querySelectorAll('.cb-chip').forEach(function(c){c.addEventListener('click',function(){sendMsg(c.getAttribute('data-q'))})});

/* HERO – typing sequence */
(function(){
  var text=t('heroTyping');
  var el=document.getElementById('hlTyping');
  var logo=document.getElementById('hlLogo');
  var btns=document.getElementById('hlButtons');
  var i=0;
  el.innerHTML='<span class="cursor"></span>';
  window._heroReplay=function(newText){
    if(newText)text=newText;
    i=0;el.innerHTML='<span class="cursor"></span>';
    logo.classList.remove('visible');btns.classList.remove('visible');
    (function type(){
      if(i<text.length){el.innerHTML=text.substring(0,i+1)+'<span class="cursor"></span>';i++;setTimeout(type,60+Math.random()*70)}
      else{setTimeout(function(){el.innerHTML=text;logo.classList.add('visible');btns.classList.add('visible')},800)}
    })();
  };
  setTimeout(function(){
    (function type(){
      if(i<text.length){
        el.innerHTML=text.substring(0,i+1)+'<span class="cursor"></span>';
        i++;
        var speed=60+Math.random()*70;
        setTimeout(type,speed);
      } else {
        /* typing done → show logo + buttons */
        setTimeout(function(){
          el.innerHTML=text;
          logo.classList.add('visible');
          btns.classList.add('visible');
        },800);
      }
    })();
  },600);
})();

/* BIG-TYPO */
document.querySelectorAll('.big-typo').forEach(function(el){var text=el.innerText.trim();el.innerHTML='';text.split('').forEach(function(ch,i){var span=document.createElement('span');span.innerText=ch;span.className='char';span.style.transitionDelay=i*0.03+'s';el.appendChild(span)})});
document.querySelectorAll('.method-row').forEach(function(row){row.addEventListener('mouseenter',function(){row.querySelectorAll('.char').forEach(function(c){c.style.transform='translateX(20px)'})});row.addEventListener('mouseleave',function(){row.querySelectorAll('.char').forEach(function(c){c.style.transform='translateX(0)'})})});

/* OBSERVERS */
var revealObs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting)e.target.classList.add('active')})},{threshold:0.1});
document.querySelectorAll('.reveal').forEach(function(el){revealObs.observe(el)});
var typingObs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){if(!e.target.classList.contains('typing-active')){var delay=parseInt(e.target.getAttribute('data-delay'))||0;setTimeout(function(){if(!e.target.classList.contains('typing-active')){e.target.classList.add('typing-active');var text=e.target.getAttribute('data-text');e.target.innerText='';var i=0;(function type(){if(i<text.length&&e.target.classList.contains('typing-active')){e.target.innerText+=text.charAt(i);i++;setTimeout(type,60)}})()}},delay)}}else{e.target.classList.remove('typing-active');e.target.innerText=''}})},{threshold:0.3});
document.querySelectorAll('.typing-target').forEach(function(el){typingObs.observe(el)});

/* ===== DEMO ANIMATIONS ===== */
(function(){
  /* Demo chat typing animation */
  var demoChatObs=new IntersectionObserver(function(entries){entries.forEach(function(e){
    if(e.isIntersecting&&!e.target.dataset.animated){
      e.target.dataset.animated='true';
      var msgs=e.target.querySelectorAll('.dcm-msg');
      msgs.forEach(function(msg,i){
        setTimeout(function(){
          msg.classList.add('show');
          var bubble=msg.querySelector('.dcm-bubble');
          if(bubble&&bubble.dataset.demo){
            var text=bubble.dataset.demo;
            bubble.textContent='';
            var j=0;
            (function typeChar(){
              if(j<text.length){bubble.textContent+=text.charAt(j);j++;setTimeout(typeChar,30+Math.random()*20)}
            })();
          }
        },i*1200);
      });
    }
  })},{threshold:0.3});
  var demoChat=document.getElementById('demo-chat-1');
  if(demoChat)demoChatObs.observe(demoChat);

  /* Demo tags animation */
  var demoTagObs=new IntersectionObserver(function(entries){entries.forEach(function(e){
    if(e.isIntersecting&&!e.target.dataset.animated){
      e.target.dataset.animated='true';
      var tags=e.target.querySelectorAll('.dpm-tag');
      tags.forEach(function(tag,i){
        var delay=parseInt(tag.dataset.delay)||i*200;
        setTimeout(function(){tag.classList.add('show')},delay+300);
      });
    }
  })},{threshold:0.3});
  var demoTags=document.getElementById('demo-tags');
  if(demoTags)demoTagObs.observe(demoTags);
})();
/* ===== END DEMO ANIMATIONS ===== */

/* ARCHIVE MAP – draw connecting lines */
(function(){
  var connections=[[0,1],[1,2],[0,3],[1,4],[2,5],[3,4],[4,5]];
  var canvas=document.getElementById('archiveMapCanvas');
  var svg=document.getElementById('mapLines');
  if(!canvas||!svg)return;
  function drawLines(){
    svg.innerHTML='';
    var nodes=canvas.querySelectorAll('.map-node');
    var cRect=canvas.getBoundingClientRect();
    connections.forEach(function(c){
      var a=nodes[c[0]],b=nodes[c[1]];
      if(!a||!b)return;
      var aR=a.getBoundingClientRect(),bR=b.getBoundingClientRect();
      var x1=aR.left-cRect.left+aR.width/2,y1=aR.top-cRect.top+aR.height/2;
      var x2=bR.left-cRect.left+bR.width/2,y2=bR.top-cRect.top+bR.height/2;
      var line=document.createElementNS('http://www.w3.org/2000/svg','line');
      line.setAttribute('x1',x1);line.setAttribute('y1',y1);
      line.setAttribute('x2',x2);line.setAttribute('y2',y2);
      svg.appendChild(line);
    });
  }
  var obs=new MutationObserver(function(){if(canvas.closest('.page.active'))setTimeout(drawLines,100)});
  obs.observe(document.getElementById('page-archive'),{attributes:true,attributeFilter:['class']});
  window.addEventListener('resize',function(){if(canvas.closest('.page.active'))drawLines()});
  setTimeout(drawLines,500);
})();

/* PROJECT DETAIL */
(function(){
  var PROJECTS=[
    {cat:'Cafe & Bakery',name:'GYEOL',sub:'침묵의 서사',
     desc:'불필요한 소음을 제거하고 재료 본연의 소리에 집중하는 베이커리. 모든 메뉴는 하나의 재료에서 출발하며, 그 재료가 가진 고유한 결을 최대한 살리는 방식으로 만들어진다. 공간은 소리를 흡수하도록 설계되어 빵이 구워지는 소리, 커피가 추출되는 소리만 남는다.',
     tags:['Minimalism','Silence','Material-first','Sensory'],
     meta:{field:'F&B',method:'Core → Unmask',period:'2024.03 – 2024.06'},
     patterns:['dots','lines','grid']},
    {cat:'Space Design',name:'RAW CONCRETE',sub:'가공되지 않은 날것',
     desc:'거친 콘크리트 텍스처를 그대로 살려 진정성을 투영하는 공간 브랜드. 마감하지 않는 것이 마감이며, 시간이 지남에 따라 자연스러운 풍화가 곧 디자인이 된다. 방문자는 완성되지 않은 공간에서 오히려 완전한 경험을 한다.',
     tags:['Brutalism','Authenticity','Time','Unfinished'],
     meta:{field:'Space Design',method:'Interpret → Core',period:'2024.01 – 2024.04'},
     patterns:['grid','cross','lines']},
    {cat:'Fashion',name:'STRUCTURE 01',sub:'기능적 본질주의',
     desc:'장식을 배제하고 옷의 구조와 기능에만 집중한 레이블. 모든 시접은 외부로 노출되며, 봉제 과정 자체가 디자인 언어가 된다. "입는 것이 아니라 구조를 걸치는 것"이라는 철학 아래, 매 시즌 단 세 벌만 출시한다.',
     tags:['Structure','Function','Less','Exposed'],
     meta:{field:'Fashion',method:'Core → Interpret',period:'2024.05 – 2024.08'},
     patterns:['lines','dots','cross']},
    {cat:'Fragrance',name:'DEEP SOIL',sub:'고향의 흙냄새',
     desc:'원초적인 기억인 흙의 향기를 현대적으로 재해석한 프래그런스 브랜드. 베이스 노트로만 구성된 비대칭 향수를 만든다. "향수는 기억을 재현하는 것이 아니라 기억의 물성을 추출하는 것"이라는 철학을 따른다.',
     tags:['Memory','Earth','Base-note','Primal'],
     meta:{field:'Fragrance',method:'Core → Unmask → Interpret',period:'2024.02 – 2024.05'},
     patterns:['cross','dots','grid']},
    {cat:'Exhibition',name:'THE VOID',sub:'비움의 미학',
     desc:'아무것도 전시하지 않음으로써 관람객을 전시품으로 만드는 공간. 빈 화이트 큐브에 들어선 관람객은 자신의 그림자, 발소리, 호흡만을 인식하게 된다. "가장 강력한 전시는 관람객 자신을 보여주는 것"이라는 명제를 실험한다.',
     tags:['Void','Self','Mirror','Nothing'],
     meta:{field:'Exhibition',method:'Interpret',period:'2024.07 – 2024.09'},
     patterns:['dots','grid','lines']},
    {cat:'Architecture',name:'MONOLITH',sub:'단일한 거대함',
     desc:'이음새 없는 거대한 검은 돌덩어리. 압도적 숭고미를 추구하는 건축 프로젝트. 단일 소재, 단일 형태, 단일 색상으로 인간이 자연 앞에서 느끼는 원초적인 경외감을 재현한다. 건물 안에 들어서면 빛은 천장의 하나의 슬릿에서만 들어온다.',
     tags:['Sublime','Monolithic','Black','Awe'],
     meta:{field:'Architecture',method:'Core → Interpret',period:'2024.04 – 2024.10'},
     patterns:['grid','lines','cross']}
  ];
  var PAT_CLASS={dots:'pd-pat-dots',lines:'pd-pat-lines',grid:'pd-pat-grid',cross:'pd-pat-cross'};
  var detail=document.getElementById('projectDetail');
  var inner=document.getElementById('pdInner');
  var closeBtn=document.getElementById('pdClose');
  /* Pre-build all HTML */
  var prebuilt=PROJECTS.map(function(p){
    var h='<div class="pd-cat">'+p.cat+'</div>';
    h+='<div class="pd-name">'+p.name+'</div>';
    h+='<div class="pd-sub">'+p.sub+'</div>';
    h+='<div class="pd-gallery"><div class="pd-gallery-item wide"><div class="pd-gallery-placeholder '+PAT_CLASS[p.patterns[0]]+'">Preview Image</div></div><div class="pd-gallery-item"><div class="pd-gallery-placeholder '+PAT_CLASS[p.patterns[1]]+'">Detail 01</div></div><div class="pd-gallery-item"><div class="pd-gallery-placeholder '+PAT_CLASS[p.patterns[2]]+'">Detail 02</div></div></div>';
    h+='<div class="pd-tags">';p.tags.forEach(function(t){h+='<span class="pd-tag">'+t+'</span>'});h+='</div>';
    h+='<div class="pd-section"><div class="pd-section-title">Essence</div><div class="pd-section-body">'+p.desc+'</div></div>';
    h+='<div class="pd-meta"><div class="pd-meta-item"><span class="pd-meta-label">Field</span><span class="pd-meta-value">'+p.meta.field+'</span></div><div class="pd-meta-item"><span class="pd-meta-label">Method</span><span class="pd-meta-value">'+p.meta.method+'</span></div><div class="pd-meta-item"><span class="pd-meta-label">Period</span><span class="pd-meta-value">'+p.meta.period+'</span></div></div>';
    return h;
  });
  function openProject(idx){
    if(!prebuilt[idx])return;
    window._alPaused=true;
    document.body.classList.add('pd-open');
    inner.innerHTML=prebuilt[idx];
    inner.scrollTop=0;
    requestAnimationFrame(function(){detail.classList.add('show')});
  }
  function closeProject(){detail.classList.remove('show');document.body.classList.remove('pd-open');setTimeout(function(){window._alPaused=false},650)}
  closeBtn.addEventListener('click',closeProject);
  detail.querySelector('.project-detail-bg').addEventListener('click',closeProject);
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&detail.classList.contains('show'))closeProject()});
  /* Mouse proximity glow on map */
  var mapCanvas=document.getElementById('archiveMapCanvas');
  if(mapCanvas){
    var mapNodes=mapCanvas.querySelectorAll('.map-node');
    mapCanvas.addEventListener('mousemove',function(e){
      var cr=mapCanvas.getBoundingClientRect();
      var mx=e.clientX-cr.left,my=e.clientY-cr.top;
      mapNodes.forEach(function(node){
        var nr=node.getBoundingClientRect();
        var nx=nr.left-cr.left+nr.width/2,ny=nr.top-cr.top+nr.height/2;
        var dist=Math.sqrt((mx-nx)*(mx-nx)+(my-ny)*(my-ny));
        var maxD=180,glow=Math.max(0,1-dist/maxD);
        var dot=node.querySelector('.map-dot');
        var glowEl=node.querySelector('.map-dot-glow');
        if(glow>0){
          var s=1+glow*0.8;
          var isDk=document.body.classList.contains('dark-mode');
          var shadow=isDk?'0 0 '+(glow*30)+'px rgba(255,255,255,'+(glow*0.4)+')':'0 0 '+(glow*25)+'px rgba(0,0,0,'+(glow*0.2)+')';
          dot.style.transform='scale('+s+')';
          dot.style.boxShadow=shadow;
          if(glowEl)glowEl.style.transform='translate(-50%,-50%) scale('+(1.5+glow*1.5)+')';
        } else {
          dot.style.transform='';dot.style.boxShadow='';
          if(glowEl)glowEl.style.transform='';
        }
      });
    });
    mapCanvas.addEventListener('mouseleave',function(){
      mapNodes.forEach(function(node){
        var dot=node.querySelector('.map-dot');
        var glowEl=node.querySelector('.map-dot-glow');
        dot.style.transform='';dot.style.boxShadow='';
        if(glowEl)glowEl.style.transform='';
      });
    });
  }

  document.querySelectorAll('.map-node').forEach(function(node){
    node.addEventListener('click',function(){openProject(parseInt(node.getAttribute('data-node')))});
  });
})();

/* SCROLL PARALLAX */
var aboutPage=document.getElementById('page-about');
if(aboutPage){aboutPage.addEventListener('scroll',function(){var st=aboutPage.scrollTop,vh=window.innerHeight,progress=Math.min(st/(vh*0.5),1);var logo=document.getElementById('hlLogo');var bottom=document.querySelector('.hl-bottom');if(logo){logo.style.opacity=Math.max(1-progress*1.5,0);logo.style.transform='translateY('+-st*0.3+'px)'}if(bottom){bottom.style.opacity=Math.max(1-progress*1.5,0);bottom.style.transform='translateY('+-st*0.2+'px)'}})}

/* ESC */
window.addEventListener('keydown',function(e){if(e.key==='Escape'){document.querySelectorAll('.modal-overlay.show').forEach(function(m){closeModal(m.id)});collapseChat()}});
})();

/* HAMBURGER MENU */
(function(){
  var hamburger=document.getElementById('navHamburger');
  var mobileMenu=document.getElementById('navMobileMenu');
  if(!hamburger||!mobileMenu)return;
  hamburger.addEventListener('click',function(){
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('show');
  });
  mobileMenu.querySelectorAll('li[data-page]').forEach(function(li){
    li.addEventListener('click',function(){
      var page=li.getAttribute('data-page');
      if(typeof goPage==='function')goPage(page);
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('show');
    });
  });
  var mobileSignIn=document.getElementById('mobileSignIn');
  if(mobileSignIn){
    mobileSignIn.addEventListener('click',function(){
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('show');
      var loginOverlay=document.getElementById('loginOverlay');
      if(loginOverlay)loginOverlay.classList.add('show');
    });
  }
})();

/* ESSENCE PROMPT GENERATION */
(function(){
  var epSection=document.getElementById('essencePrompts');
  var epList=document.getElementById('epList');
  var epUnlock=document.getElementById('epUnlock');
  if(!epSection)return;
  
  window._checkEssencePrompts=function(msgCount,unmaskData){
    if(msgCount>=6&&unmaskData&&unmaskData.length>0){
      epSection.style.display='block';
      // Generate prompts from unmask data
      var tags=[];
      var values=[];
      unmaskData.forEach(function(d){
        if(d.tags)tags=tags.concat(d.tags);
        if(d.value)values.push(d.value);
      });
      var uniqueTags=[...new Set(tags)].slice(0,5);
      if(uniqueTags.length>0||values.length>0){
        var prompts=[
          values[0]?'나는 '+values[0]+'. 이 관점에서 대화해주세요.':'나는 본질을 추구하는 사람입니다. 깊이 있는 질문으로 대화해주세요.',
          uniqueTags.length>0?'나의 핵심 키워드: '+uniqueTags.join(', ')+'. 이 맥락을 고려해주세요.':'추상적 조언보다 구체적 사례와 경험으로 설명해주세요.',
          '완벽보다 진짜를 추구합니다. 솔직하게 대화해주세요.',
          '권위보다 논리로 설득해주세요. "왜?"를 끝까지 파고드는 성향입니다.'
        ];
        var items=epList.querySelectorAll('.ep-item');
        prompts.forEach(function(p,i){
          if(items[i])items[i].textContent=p;
        });
      }
    }
  };
  
  if(epUnlock){
    epUnlock.addEventListener('click',function(){
      var pricingOverlay=document.getElementById('pricingOverlay');
      if(pricingOverlay)pricingOverlay.classList.add('show');
    });
  }
})();
