/* JamBag, comportements du site (sans bibliothèque externe) */
  var EN=document.documentElement.lang==="en";function T(fr,en){return EN?en:fr}
(function(){
  "use strict";
  var doc=document.documentElement;
  doc.classList.add("js");
  var reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $(s,c){return (c||document).querySelector(s)}
  function $$(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))}
  function store(k,v){try{if(v===undefined)return sessionStorage.getItem(k);sessionStorage.setItem(k,v)}catch(e){return null}}
  function clamp(v,a,b){return Math.min(b,Math.max(a,v))}
  function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
  function easeOut(t){return 1-Math.pow(1-t,3)}

  /* ---------- Chaque page commence en haut (sauf ancre ou retour arrière) ---------- */
  try{if("scrollRestoration" in history)history.scrollRestoration="manual"}catch(e){}
  function toTop(){if(!location.hash){window.scrollTo(0,0);document.documentElement.scrollTop=0;document.body.scrollTop=0}}
  toTop();window.addEventListener("DOMContentLoaded",toTop);window.addEventListener("load",function(){toTop();setTimeout(toTop,60)});
  /* Retour à l'accueil fiable, même quand le site est servi depuis un sous-dossier */
  (function(){
    var here=location.href.split("#")[0];
    var HK="jb-home"+(EN?"-en":"");if(document.getElementById("ouverture"))store(HK,here);
    var home=store(HK);
    document.addEventListener("click",function(e){
      var a=e.target.closest&&e.target.closest('a[href^="./"]');if(!a)return;
      var h=a.getAttribute("href"),hash=h.indexOf("#")>-1?h.slice(h.indexOf("#")):"";
      if(h!=="./"&&h.indexOf("./#")!==0)return;
      if(document.getElementById("ouverture")){if(hash){e.preventDefault();var t=document.querySelector(hash);if(t)t.scrollIntoView({behavior:"smooth"})}else{e.preventDefault();window.scrollTo({top:0,behavior:"smooth"})}return}
      e.preventDefault();location.href=(home||location.href.split("#")[0].replace(/[^\/]*$/,""))+hash;
    });
  })();

  /* ---------- Forme du médiator (fenêtre de l'intro) ---------- */
  var PICK_D="M50 114C44 114 38 108 30 98C16 80 4 58 2 36C0 16 14 2 50 2C86 2 100 16 98 36C96 58 84 80 70 98C62 108 56 114 50 114Z";
  function pickPoints(n){
    var pts=[];
    try{
      var svg=document.createElementNS("http://www.w3.org/2000/svg","svg"),p=document.createElementNS("http://www.w3.org/2000/svg","path");
      svg.setAttribute("width","0");svg.setAttribute("height","0");svg.style.position="absolute";
      p.setAttribute("d",PICK_D);svg.appendChild(p);document.body.appendChild(svg);
      var L=p.getTotalLength();
      for(var i=0;i<n;i++){var q=p.getPointAtLength(L*i/n);pts.push([(q.x-50)/116,(q.y-58)/116])}
      svg.remove();
    }catch(e){for(var j=0;j<n;j++){var a=j/n*Math.PI*2;pts.push([Math.cos(a)*.43,Math.sin(a)*.5])}}
    return pts;
  }

  /* ---------- Diaporama d'ouverture (effet vidéo stylisée) ---------- */
  var heroStarted=false;
  function startHero(){
    if(heroStarted)return;heroStarted=true;
    var vids=$$(".hero .slides video");
    if(vids.length){
      var srcs=(vids[0].dataset.srcs||"").split(" ").filter(Boolean),k=0,cur=vids[0],nxt=vids[1];
      if(reduce||!srcs.length)return;
      function play(v,src){v.src=src;v.load();var p=v.play();if(p&&p.catch)p.catch(function(){})}
      if(!cur.src||cur.src.indexOf(srcs[0])<0)play(cur,srcs[0]);else{var p0=cur.play();if(p0&&p0.catch)p0.catch(function(){})}
      cur.loop=false;
      ["touchstart","click","scroll","keydown"].forEach(function(ev){window.addEventListener(ev,function kick(){if(cur.paused){var pp=cur.play();if(pp&&pp.catch)pp.catch(function(){})}},{passive:true,once:true})});
      function swap(){
        k=(k+1)%srcs.length;play(nxt,srcs[k]);
        nxt.classList.add("on");cur.classList.remove("on");var t=cur;cur=nxt;nxt=t;
      }
      vids.forEach(function(v){v.addEventListener("timeupdate",function(){if(v===cur&&v.duration&&v.currentTime>v.duration-1.3&&!v.dataset.sw){v.dataset.sw=1;swap();setTimeout(function(){delete v.dataset.sw},2000)}})});
      vids.forEach(function(v){v.addEventListener("ended",function(){if(v===cur)swap()})});
      return;
    }
    var imgs=$$(".hero .slides img");if(!imgs.length)return;
    var i=0;imgs[0].classList.add("on");
    if(reduce||imgs.length<2)return;
    setInterval(function(){
      imgs[i].classList.remove("on");i=(i+1)%imgs.length;imgs[i].classList.add("on");
    },5200);
  }

  /* ---------- Intro : le logo se forme, puis s'ouvre au défilement ou au clic ---------- */
  var intro=$("#intro");
  if(intro&&reduce){intro.classList.add("gone")}
  if(intro&&!reduce){
    var short=!!store("jb-intro");
    document.body.style.overflow="hidden";doc.style.overflow="hidden";window.scrollTo(0,0);
    if(short)intro.classList.add("short");
    var cv=$(".intro-fx",intro),ctx=cv.getContext("2d"),logo=$(".intro-logo",intro),slides=$(".hero .slides");
    var countEl=$(".intro-count",intro),countN=countEl?$(".n",countEl):null;
    var W=0,H=0,dpr=Math.min(window.devicePixelRatio||1,2),parts=[],shape=pickPoints(84),t0=0,finished=false;
    var formedAt=short?0:1900,autoAt=short?1600:7500,q=0,qTarget=0,lastInput=0,autoOpen=false;
    function size(){W=window.innerWidth;H=window.innerHeight;cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+"px";cv.style.height=H+"px";ctx.setTransform(dpr,0,0,dpr,0,0)}
    size();
    function build(){
      var r=logo.getBoundingClientRect(),ow=Math.max(2,Math.round(r.width)),oh=Math.max(2,Math.round(r.height)),tg=[];
      try{
        var off=document.createElement("canvas");off.width=ow;off.height=oh;var oc=off.getContext("2d");oc.drawImage(logo,0,0,ow,oh);
        var d=oc.getImageData(0,0,ow,oh).data,st=W<700?2:2.5;
        for(var y=0;y<oh;y+=st)for(var x=0;x<ow;x+=st){var xi=Math.round(x),yi=Math.round(y);if(d[(yi*ow+xi)*4+3]>150)tg.push([r.left+xi,r.top+yi])}
      }catch(e){}
      for(var i=tg.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=tg[i];tg[i]=tg[j];tg[j]=t}
      tg=tg.slice(0,W<700?2600:5200);
      var R=Math.max(W,H)*.65;
      parts=tg.map(function(p){
        var a=Math.random()*Math.PI*2,rad=R*(.5+Math.random()*.7);
        return {tx:p[0],ty:p[1],sx:W/2+Math.cos(a)*rad,sy:H/2+Math.sin(a)*rad*.6,d:Math.random()*.5,s:.55+Math.random()*.85,g:Math.random()<.3,sw:(Math.random()-.5),vx:0,vy:0}
      });
    }
    function setHole(v){
      if(v<=0){intro.style.clipPath="";return}
      var IW=intro.clientWidth||W,IH=intro.clientHeight||H,hh=Math.pow(v,2.1)*Math.max(IW,IH)*3.4,rot=(1-v)*-14*Math.PI/180,c=Math.cos(rot),s=Math.sin(rot),cx=IW/2,cy=IH/2;
      var out="polygon(evenodd, -2% -2%, 102% -2%, 102% 102%, -2% 102%, -2% -2%";
      for(var i=0;i<=shape.length;i++){var p=shape[i%shape.length],x=p[0]*hh,y=p[1]*hh;out+=", "+(cx+x*c-y*s).toFixed(1)+"px "+(cy+x*s+y*c).toFixed(1)+"px"}
      intro.style.clipPath=out+")";
    }
    function finish(){
      if(finished)return;finished=true;
      intro.classList.add("gone");intro.style.clipPath="";document.body.style.overflow="";doc.style.overflow="";
      if(slides){slides.style.transition="transform 1.6s cubic-bezier(.16,1,.3,1)";slides.style.transform=""}
      store("jb-intro","1");startHero();
    }
    function ready(){return t0&&performance.now()-t0>formedAt*.6}
    function push(dy){if(!ready())return;qTarget=clamp(qTarget+dy,0,1);lastInput=performance.now();if(qTarget>.04)autoOpen=true}
    intro.addEventListener("wheel",function(e){e.preventDefault();push(Math.abs(e.deltaY)/(H*1.1))},{passive:false});
    var ty0=null;
    intro.addEventListener("touchstart",function(e){ty0=e.touches[0].clientY},{passive:true});
    intro.addEventListener("touchmove",function(e){if(ty0===null)return;var y=e.touches[0].clientY;push(Math.abs(ty0-y)/(H*.7));ty0=y;e.preventDefault()},{passive:false});
    intro.addEventListener("click",function(){if(ready())autoOpen=true});
    window.addEventListener("keydown",function(e){if(!finished&&ready()&&/Enter|Space| |ArrowDown|PageDown/.test(e.key))autoOpen=true});
    function frame(ts){
      if(finished)return;
      if(!t0)t0=ts;var t=ts-t0;
      ctx.clearRect(0,0,W,H);
      if(!short&&countN){var cp=clamp(t/formedAt,0,1);countN.textContent=Math.round(cp*100);countEl.style.setProperty("--p",cp.toFixed(3))}
      if(t>=formedAt&&!intro.classList.contains("formed")){intro.classList.add("formed");startHero()}
      if(t>=autoAt&&qTarget<.01)autoOpen=true;
      if(autoOpen)qTarget=Math.min(1,qTarget+.018);
      else if(qTarget>0&&qTarget<1&&performance.now()-lastInput>450)qTarget=qTarget>.3?Math.min(1,qTarget+.03):Math.max(0,qTarget-.03);
      q+=(qTarget-q)*.14;if(qTarget>=1&&q>.985)q=1;
      if(q>.001){if(window.scrollY)window.scrollTo(0,0);intro.classList.add("opening");setHole(q);if(slides)slides.style.transform="scale("+(1.22-.2*q).toFixed(4)+")"}
      else{intro.classList.remove("opening");setHole(0);if(slides&&!slides.style.transform)slides.style.transform="scale(1.22)"}
      if(parts.length){
        var fade=t<formedAt?1:clamp(1-(t-formedAt)/900,0,1);
        if(fade>0||q>0){
          ctx.globalCompositeOperation="lighter";
          for(var i=0;i<parts.length;i++){
            var P=parts[i],x,y,a;
            if(q<=.001){
              var lt=clamp((t-P.d*700)/1300,0,1),e=1-Math.pow(1-lt,4),sw=Math.sin(Math.PI*e)*P.sw*120;
              var dx=P.tx-P.sx,dy=P.ty-P.sy,len=Math.sqrt(dx*dx+dy*dy)||1;
              x=P.sx+dx*e+(-dy/len)*sw;y=P.sy+dy*e+(dx/len)*sw;a=(.35+.65*e)*fade;
            }else{
              if(!P.vx){var ox=P.tx-W/2,oy=P.ty-H/2,ol=Math.sqrt(ox*ox+oy*oy)||1,sp=2+Math.random()*7;P.vx=ox/ol*sp;P.vy=oy/ol*sp}
              x=P.tx+P.vx*q*60;y=P.ty+P.vy*q*60;a=(1-q)*.7;
            }
            if(a<=0.01)continue;
            ctx.fillStyle=P.g?"rgba(255,206,130,"+a.toFixed(3)+")":"rgba(255,246,232,"+a.toFixed(3)+")";
            ctx.fillRect(x,y,P.s,P.s);
          }
        }
      }
      if(q>=1){finish();return}
      requestAnimationFrame(frame);
    }
    var started=false;
    function begin(){if(started)return;started=true;if(!short)build();requestAnimationFrame(frame)}
    function whenReady(){
      var f=document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve();
      f.then(function(){requestAnimationFrame(function(){requestAnimationFrame(begin)})});
      setTimeout(begin,1800);
    }
    if(logo.complete&&logo.naturalWidth)whenReady();else{logo.addEventListener("load",whenReady);setTimeout(begin,2200)}
    window.addEventListener("resize",function(){if(!finished){size();if(parts.length)build()}});
  }
  if(!intro||intro.classList.contains("gone"))startHero();


  /* ---------- En-tête ---------- */
  var header=$(".site-header"),lastY=0;
  function onScrollHeader(){
    var y=window.scrollY;
    if(header){
      header.classList.toggle("solid",y>60);
      header.classList.toggle("hide",y>lastY&&y>600&&!doc.classList.contains("menu-open"));
    }
    lastY=y;
  }
  window.addEventListener("scroll",onScrollHeader,{passive:true});onScrollHeader();
  var mbtn=$(".menu-btn");
  if(mbtn){
    mbtn.addEventListener("click",function(){
      var o=doc.classList.toggle("menu-open");
      mbtn.setAttribute("aria-expanded",o);mbtn.setAttribute("aria-label",o?T("Fermer le menu","Close menu"):T("Ouvrir le menu","Open menu"));
      document.body.style.overflow=o?"hidden":"";
    });
    $$(".menu a").forEach(function(a){a.addEventListener("click",function(){doc.classList.remove("menu-open");document.body.style.overflow="";mbtn.setAttribute("aria-expanded","false")})});
  }

  /* ---------- Découpage des titres en mots ---------- */
  $$("[data-split]").forEach(function(el){
    var parts=el.querySelectorAll(".light,.heavy");var targets=parts.length?parts:[el];var k=0;
    Array.prototype.forEach.call(targets,function(t){
      var words=t.textContent.trim().split(/\s+/);t.textContent="";
      words.forEach(function(w,j){
        var o=document.createElement("span");o.className="w";
        var inner=document.createElement("span");inner.textContent=w;inner.style.setProperty("--i",k++);
        o.appendChild(inner);t.appendChild(o);if(j<words.length-1)t.appendChild(document.createTextNode(" "));
      });
    });
    el.classList.add("split");
  });

  /* ---------- Les grands mots ne débordent jamais ---------- */
  function fitHeavy(){
    $$(".title .heavy").forEach(function(el){
      el.style.fontSize="";
      var w=el.clientWidth;if(!w)return;
      var sw=el.scrollWidth;
      if(sw>w+1){var fs=parseFloat(getComputedStyle(el).fontSize);el.style.fontSize=(fs*w/sw*.97).toFixed(1)+"px"}
    });
  }
  fitHeavy();
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fitHeavy);

  /* ---------- Apparitions ---------- */
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}});
  },{rootMargin:"0px 0px -10% 0px",threshold:.08});
  $$("[data-reveal],[data-split],[data-clip],.mk").forEach(function(el){io.observe(el)});

  /* ---------- Compteurs ---------- */
  var cio=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(!e.isIntersecting)return;cio.unobserve(e.target);
      var el=e.target,to=parseFloat(el.dataset.count),t0=null,dur=1900;
      function fmt(n){return Math.round(n).toLocaleString(EN?"en-GB":"fr-FR").replace(/[\s ]/g," ")}
      if(reduce){el.textContent=fmt(to);return}
      function step(t){if(!t0)t0=t;var p=Math.min(1,(t-t0)/dur);p=1-Math.pow(1-p,4);el.textContent=fmt(to*p);if(p<1)requestAnimationFrame(step)}
      requestAnimationFrame(step);
    });
  },{threshold:.5});
  $$("[data-count]").forEach(function(el){cio.observe(el)});

  /* ---------- Bandeaux défilants : duplication pour une boucle continue ---------- */
  $$(".marquee").forEach(function(m){
    var t=$(".track",m);if(!t||m.dataset.dup)return;m.dataset.dup=1;
    var c=t.cloneNode(true);c.setAttribute("aria-hidden","true");
    $$("a,button",c).forEach(function(x){x.setAttribute("tabindex","-1")});
    m.appendChild(c);
  });

  /* ---------- Manifeste : les mots s'allument au défilement ---------- */
  var fills=$$("[data-fill]");
  fills.forEach(function(el){
    var html="";
    el.childNodes.forEach(function(n){
      if(n.nodeType===3){html+=n.textContent.split(/(\s+)/).map(function(s){return /\s/.test(s)||!s?s:'<span class="fw">'+s+'</span>'}).join("")}
      else{n.innerHTML=n.textContent.split(/(\s+)/).map(function(s){return /\s/.test(s)||!s?s:'<span class="fw">'+s+'</span>'}).join("");html+=n.outerHTML}
    });
    el.innerHTML=html;
  });

  /* ---------- Trio : avant / après ---------- */
  var cmp=$(".compare"),cmpManual=0;
  function setCmp(v){if(cmp)cmp.style.setProperty("--cx",clamp(v,0,100).toFixed(2)+"%")}
  if(cmp){
    setCmp(100);
    function fromPointer(e){var r=cmp.getBoundingClientRect();setCmp((e.clientX-r.left)/r.width*100);cmpManual=performance.now()}
    cmp.addEventListener("pointermove",function(e){if(e.pointerType==="mouse"||e.buttons)fromPointer(e)});
    cmp.addEventListener("pointerdown",fromPointer);
  }

  /* ---------- Solo : Carl ou Quentin ---------- */
  var sw=$(".who-switch");
  if(sw){
    var panel=sw.closest(".panel");
    $$("button",sw).forEach(function(b){
      b.addEventListener("click",function(){
        var who=b.dataset.who;
        $$("button",sw).forEach(function(x){x.setAttribute("aria-pressed",x===b)});
        $$(".solo-ph img",panel).forEach(function(i){i.classList.toggle("on",i.dataset.who===who)});
        $$(".solo-txt>div[data-who]",panel).forEach(function(d){d.classList.toggle("on",d.dataset.who===who)});
        var v=$(".solo-txt .play",panel);if(v)v.hidden=who!=="carl";
      });
    });
  }

  /* ---------- Médiator en relief : suit la souris ---------- */
  var pick=$(".pick3d");
  if(pick&&!reduce){
    var pst0=pick.closest(".pick-stage")||pick;
    pst0.addEventListener("pointermove",function(e){
      if(e.pointerType!=="mouse")return;
      var r=pick.getBoundingClientRect(),x=(e.clientX-(r.left+r.width/2))/(r.width/2),y=(e.clientY-(r.top+r.height/2))/(r.height/2);
      pick.classList.add("hov");
      pick.style.setProperty("--mx",clamp(x*48,-55,55).toFixed(2)+"deg");pick.style.setProperty("--my",clamp(-y*40,-45,45).toFixed(2)+"deg");
    },{passive:true});
    pst0.addEventListener("pointerleave",function(){pick.classList.remove("hov");pick.style.setProperty("--mx","0deg");pick.style.setProperty("--my","0deg")});
  }

  /* ---------- Défilement : parallaxe, collage, révélation du quartet, formules horizontales ---------- */
  var par=$$("[data-speed],[data-speed-x]"),hs=$(".hs"),steps=$$(".steps"),ticking=false;
  var collage=$(".collage"),cps=$$(".cp").map(function(el){return {el:el,sp:parseFloat(el.style.getPropertyValue("--sp"))||1}}),ctitle=$(".collage-title"),cws=$$(".collage-title .cw span");
  var grow=$(".grow"),drop=$("[data-drop]"),logoRow=$(".logo-stage .logo-row"),cartes=$$(".carte");
  cartes.forEach(function(c){
    c.addEventListener("pointermove",function(e){if(e.pointerType!=="mouse")return;var r=c.getBoundingClientRect();c.style.setProperty("--cy",(((e.clientX-r.left)/r.width-.5)*8).toFixed(2)+"deg")});
    c.addEventListener("pointerleave",function(){c.style.setProperty("--cy","0deg")});
  });
  var hsOn=false;
  function setupHs(){
    if(!hs)return;
    var ok=window.innerWidth>=960&&!reduce;
    hs.classList.toggle("on",ok);hsOn=ok;
    var track=$(".hs-track",hs);
    if(!ok){hs.style.height="";track.style.transform="";return}
    var dist=track.scrollWidth-window.innerWidth;
    hs.style.height=(dist+window.innerHeight)+"px";hs.dataset.dist=dist;
  }
  function prog(el,vh){var r=el.getBoundingClientRect();return clamp(-r.top/Math.max(1,r.height-vh),0,1)}
  function frame(){
    ticking=false;var vh=window.innerHeight,vw=window.innerWidth;
    par.forEach(function(el){
      var r=el.getBoundingClientRect();if(r.bottom<-300||r.top>vh+300)return;
      var c=(r.top+r.height/2-vh/2)/vh;
      var y=el.dataset.speed?c*parseFloat(el.dataset.speed)*-120:0,x=el.dataset.speedX?c*parseFloat(el.dataset.speedX)*-240:0;
      el.style.translate=x.toFixed(1)+"px "+y.toFixed(1)+"px";
    });
    if(hs&&hsOn){
      var r=hs.getBoundingClientRect(),dist=+hs.dataset.dist||0;
      var p=clamp(-r.top/(r.height-vh),0,1);
      $(".hs-track",hs).style.transform="translate3d("+(-p*dist).toFixed(1)+"px,0,0)";
      hs.style.setProperty("--p",p.toFixed(4));
    }
    if(cmp&&performance.now()-cmpManual>2500){
      var cr=cmp.getBoundingClientRect();
      if(cr.right>0&&cr.left<vw&&cr.bottom>0&&cr.top<vh){
        var v=hsOn?(cr.left+cr.width/2-vw*.4)/(vw*.5):(cr.top+cr.height/2-vh*.35)/(vh*.5);
        setCmp(clamp(v,0,1)*100);
      }
    }
    if(collage){
      var cr2=collage.getBoundingClientRect();
      if(cr2.bottom>0&&cr2.top<vh){
        var p2=prog(collage,vh);
        cps.forEach(function(f){f.el.style.setProperty("--ty",(-p2*vh*1.9*f.sp).toFixed(1)+"px")});
        if(ctitle){ctitle.style.setProperty("--ts",(.94+p2*.1).toFixed(4));cws.forEach(function(w,i){w.classList.toggle("on",p2>.08+i*.22)})}
      }
    }
    if(grow){
      var gr=grow.getBoundingClientRect();
      if(gr.bottom>0&&gr.top<vh){
        var g=prog(grow,vh),a=clamp(g/.62,0,1),ae=ease(a),mob=vw<760;
        var w0=mob?vw*.56:vw*.24,h0=mob?vw*.4:vw*.16,w=w0+(vw-w0)*ae,h=h0+(vh-h0)*ae;
        grow.style.setProperty("--gw",w.toFixed(1)+"px");grow.style.setProperty("--gh",h.toFixed(1)+"px");
        grow.style.setProperty("--gr",(18*(1-ae)).toFixed(1)+"px");grow.style.setProperty("--gs",(1.3-.3*ae).toFixed(4));
        grow.style.setProperty("--gap",((mob?h0:w0)+vw*.05).toFixed(1)+"px");
        grow.style.setProperty("--tx",(ae*(mob?vh*.5:vw*.5)).toFixed(1)+"px");
        grow.style.setProperty("--to",(1-clamp((a-.55)/.35,0,1)).toFixed(3));
        var c2=clamp((g-.66)/.22,0,1);grow.style.setProperty("--co",c2.toFixed(3));grow.style.setProperty("--gd",(c2*.55).toFixed(3));
      }
    }
    if(logoRow){
      var lr=logoRow.getBoundingClientRect();
      if(lr.bottom>0&&lr.top<vh){var lp=clamp((vh-lr.top)/(vh+lr.height),0,1);logoRow.style.setProperty("--lx",((.5-lp)*44).toFixed(2)+"deg");logoRow.style.setProperty("--ls",(.92+Math.sin(lp*Math.PI)*.1).toFixed(3))}
    }
    cartes.forEach(function(c){
      var r=c.getBoundingClientRect();if(r.bottom<0||r.top>vh)return;
      var q=clamp((vh-r.top)/(vh+r.height),0,1);c.style.setProperty("--cx",((.5-q)*16).toFixed(2)+"deg");
    });
    if(drop){
      var sec=drop.parentElement,dr=sec.getBoundingClientRect();
      if(dr.bottom>0&&dr.top<vh){
        var dp=clamp((vh-dr.top)/(vh*.95),0,1),de=easeOut(dp);
        drop.style.translate="-50% "+(-(1-de)*55).toFixed(2)+"%";drop.style.rotate=((1-de)*7).toFixed(2)+"deg";
      }
    }
    steps.forEach(function(s){var r=s.getBoundingClientRect();var p=clamp((vh*0.8-r.top)/(r.height+vh*0.3),0,1);s.style.setProperty("--p",p.toFixed(3))});
    fills.forEach(function(el){
      var r=el.getBoundingClientRect();var p=clamp((vh*0.85-r.top)/(r.height+vh*0.25),0,1);
      var w=el.querySelectorAll(".fw"),n=Math.round(p*w.length);
      for(var i=0;i<w.length;i++)w[i].classList.toggle("lit",i<n);
    });
  }
  function onScroll(){if(!ticking){ticking=true;requestAnimationFrame(frame)}}
  if(reduce){cws.forEach(function(w){w.classList.add("on")});par=[];collage=null;grow=null;drop=null;logoRow=null;cartes=[];fills.forEach(function(el){$$(".fw",el).forEach(function(w){w.classList.add("lit")})});fills=[];setCmp(50)}
  setupHs();
  window.addEventListener("scroll",onScroll,{passive:true});
  window.addEventListener("resize",function(){setupHs();fitHeavy();onScroll()});
  window.addEventListener("load",function(){setupHs();fitHeavy();onScroll()});
  frame();

  /* ---------- Rail des chapitres ---------- */
  var rail=$(".rail"),chap=$$("[data-chapter]");
  if(rail&&chap.length){
    chap.forEach(function(s){
      var a=document.createElement("a");a.href="#"+s.id;a.innerHTML="<span>"+s.dataset.chapter+"</span><i></i>";rail.appendChild(a);
    });
    var links=$$("a",rail);
    var rio=new IntersectionObserver(function(es){
      es.forEach(function(e){if(e.isIntersecting){var i=chap.indexOf(e.target);links.forEach(function(l,j){l.classList.toggle("on",i===j)})}});
    },{rootMargin:"-45% 0px -50% 0px"});
    chap.forEach(function(s){rio.observe(s)});
  }

  /* ---------- Fenêtre vidéo ---------- */
  var vm=$(".vmodal");
  if(vm){
    var box=$(".box",vm),alt=$(".alt a",vm);
    function closeV(){vm.classList.remove("on");box.innerHTML="";document.body.style.overflow=""}
    $$("[data-video]").forEach(function(a){
      a.addEventListener("click",function(ev){
        ev.preventDefault();var id=a.dataset.video;
        box.innerHTML='<iframe src="https://www.youtube.com/embed/'+id+'?autoplay=1&rel=0&playsinline=1&origin='+encodeURIComponent(location.origin)+'" title="'+T("Vidéo JamBag","JamBag video")+'" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';
        alt.href="https://www.youtube.com/watch?v="+id;vm.classList.add("on");document.body.style.overflow="hidden";$(".close",vm).focus();
      });
    });
    $(".close",vm).addEventListener("click",closeV);
    vm.addEventListener("click",function(e){if(e.target===vm)closeV()});
    window.addEventListener("keydown",function(e){if(e.key==="Escape"&&vm.classList.contains("on"))closeV()});
  }

  /* ---------- Boule disco ---------- */
  var ball=$("canvas.ball");
  if(ball){
    var bctx=ball.getContext("2d"),run=false,rot=0,last=0;
    var tiles=[],BANDS=22;
    for(var b=0;b<BANDS;b++){
      var la0=-Math.PI/2+b*Math.PI/BANDS,la1=la0+Math.PI/BANDS,lam=(la0+la1)/2;
      var n=Math.max(4,Math.round(2*BANDS*Math.cos(lam)));
      for(var t=0;t<n;t++){tiles.push({la0:la0,la1:la1,lo0:t*2*Math.PI/n,lo1:(t+1)*2*Math.PI/n,seed:Math.random()})}
    }
    function bsize(){var d=Math.min(window.devicePixelRatio||1,2);var w=ball.clientWidth,h=ball.clientHeight;ball.width=w*d;ball.height=h*d;bctx.setTransform(d,0,0,d,0,0)}
    function P(la,lo,R,cx,cy){var x=Math.cos(la)*Math.sin(lo+rot),z=Math.cos(la)*Math.cos(lo+rot),y=Math.sin(la);return [cx+x*R,cy-y*R,z,x,y]}
    var fl=[];
    $$(".disco .flecks").forEach(function(box){
      var near=box.classList.contains("near");
      for(var k=0;k<(near?14:26);k++){var e=document.createElement("i");e.style.top=(Math.random()*95)+"%";e.style.setProperty("--s",(near?10+Math.random()*16:3+Math.random()*8).toFixed(0)+"px");if(near)e.style.filter="blur(4px)";box.appendChild(e);fl.push({el:e,x:Math.random(),v:(near?1.4:.6)+Math.random()*1.2})}
    });
    function bdraw(ts){
      if(!run)return;requestAnimationFrame(bdraw);
      var dt=last?Math.min(50,ts-last):16;last=ts;rot+=dt*0.00022;
      var w=ball.clientWidth,h=ball.clientHeight,R=w*0.4,cx=w/2,cy=h-R-w*0.06;
      bctx.clearRect(0,0,w,h);
      bctx.strokeStyle="rgba(246,239,228,.55)";bctx.lineWidth=1.2;bctx.beginPath();bctx.moveTo(cx,0);bctx.lineTo(cx,cy-R);bctx.stroke();
      bctx.fillStyle="#2a160e";bctx.beginPath();bctx.arc(cx,cy,R,0,Math.PI*2);bctx.fill();
      for(var i=0;i<tiles.length;i++){
        var T=tiles[i],g2=0.012;
        var a=P(T.la0+g2,T.lo0+g2,R,cx,cy),bq=P(T.la0+g2,T.lo1-g2,R,cx,cy),c=P(T.la1-g2,T.lo1-g2,R,cx,cy),d=P(T.la1-g2,T.lo0+g2,R,cx,cy);
        var zc=(a[2]+c[2])/2;if(zc<0.02)continue;
        var nx=(a[3]+c[3])/2,ny=(a[4]+c[4])/2;
        var light=Math.max(0,nx*-0.45+ny*0.55+zc*0.7);
        var spec=Math.pow(Math.max(0,nx*-0.35+ny*0.4+zc*0.85),22)+(T.seed>0.93?0.6*Math.max(0,Math.sin(ts*0.003+T.seed*90)):0);
        var tw=0.55+0.45*Math.sin(ts*0.002+T.seed*40);
        var L=Math.min(1,light*0.75+spec*tw*1.4);
        bctx.fillStyle="rgb("+Math.round(60+L*190)+","+Math.round(30+L*165)+","+Math.round(16+L*110)+")";
        bctx.beginPath();bctx.moveTo(a[0],a[1]);bctx.lineTo(bq[0],bq[1]);bctx.lineTo(c[0],c[1]);bctx.lineTo(d[0],d[1]);bctx.closePath();bctx.fill();
      }
      var sh=bctx.createRadialGradient(cx-R*.35,cy-R*.4,0,cx-R*.35,cy-R*.4,R*.5);sh.addColorStop(0,"rgba(255,245,225,.35)");sh.addColorStop(1,"rgba(255,245,225,0)");bctx.fillStyle=sh;bctx.beginPath();bctx.arc(cx,cy,R,0,Math.PI*2);bctx.fill();
      fl.forEach(function(f,k){var x=((f.x+rot*f.v*60)%1.2+1.2)%1.2-0.1;f.el.style.transform="translate3d("+(x*100).toFixed(2)+"vw,0,0)";f.el.style.opacity=(0.35+0.65*Math.abs(Math.sin(ts*0.0015+k))).toFixed(2)});
    }
    bsize();window.addEventListener("resize",bsize);
    if(reduce){run=true;bdraw(0);run=false}
    else{new IntersectionObserver(function(es){es.forEach(function(e){var was=run;run=e.isIntersecting;if(run&&!was){last=0;requestAnimationFrame(bdraw)}})}).observe(ball)}
  }

  /* ---------- Formulaire en étapes ---------- */
  var wz=$("#wizard");
  if(wz){
    var stepsEls=$$(".w-step",wz),progEls=$$(".w-progress li",wz),cur=0;
    var back=$(".btn-back",wz),next=$(".btn-next",wz),send=$(".btn-send",wz),status=$(".w-status",wz);
    function show(i,focus){
      cur=i;stepsEls.forEach(function(s,j){s.classList.toggle("on",j===i)});
      progEls.forEach(function(p,j){p.classList.toggle("on",j===i);p.classList.toggle("done",j<i)});
      back.classList.toggle("ghost",i===0);next.hidden=i===stepsEls.length-1;send.hidden=i!==stepsEls.length-1;
      if(focus!==false){var h=$("h3",stepsEls[i]);if(h){h.setAttribute("tabindex","-1");h.focus({preventScroll:true})}
      var top=wz.getBoundingClientRect().top;if(top<0)wz.scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"})}
    }
    function valid(i){
      var ok=true;
      $$("[required]",stepsEls[i]).forEach(function(f){
        var good=f.type==="radio"?!!$('input[name="'+f.name+'"]:checked',wz):(f.value.trim()&&(f.type!=="email"||/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value.trim())));
        var fld=f.closest(".field");if(fld)fld.classList.toggle("err",!good);
        if(!good&&ok){ok=false;f.focus()}
      });
      status.textContent=ok?"":T("Merci de compléter les champs indiqués.","Please complete the highlighted fields.");
      return ok;
    }
    // Les moments proposés dépendent du type d'événement
    function moments(t){
      $$("[data-for]",wz).forEach(function(l){
        var on=!t||l.dataset.for.split(" ").indexOf(t)>-1;l.hidden=!on;
        if(!on){var c=$("input",l);if(c)c.checked=false}
      });
    }
    $$('input[name="type"]',wz).forEach(function(r){r.addEventListener("change",function(){moments(r.dataset.t)})});
    var pre=$('input[name="type"]:checked',wz);moments(pre?pre.dataset.t:null);
    next.addEventListener("click",function(){if(valid(cur))show(cur+1)});
    back.addEventListener("click",function(){status.textContent="";show(cur-1)});
    $$('.w-step input[type="radio"]',wz).forEach(function(r){r.addEventListener("change",function(){if(r.closest(".auto-next")&&cur===0){setTimeout(function(){show(1)},260)}})});
    var jbT0=Date.now(),sentAll=false,sentPart=false;
    function partial(){
      if(sentAll||sentPart||!navigator.sendBeacon)return;
      var em=($('[name="email"]',wz)||{}).value||"",tl=($('[name="tel"]',wz)||{}).value||"";
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em.trim())&&(tl.replace(/\D/g,"").length<6))return;
      var fd=new FormData(wz);fd.set("partial","1");fd.set("jb_k","jb-"+(jbT0%997));fd.set("jb_t0",String(jbT0));fd.set("jb_t",String(Date.now()-jbT0));
      if(EN)fd.set("langue","en");
      sentPart=navigator.sendBeacon(wz.getAttribute("action"),fd);
    }
    document.addEventListener("visibilitychange",function(){if(document.visibilityState==="hidden")partial()});
    window.addEventListener("pagehide",partial);
    wz.addEventListener("submit",function(ev){
      ev.preventDefault();if(!valid(cur))return;
      var fd=new FormData(wz),lines=[];fd.set("jb_k","jb-"+(jbT0%997));fd.set("jb_t0",String(jbT0));fd.set("jb_t",String(Date.now()-jbT0));
      var labels={type:"Type d'événement",moments:"Moments",ambiance:"Ambiance",formule:"Formule envisagée",date:"Date",lieu:"Lieu",invites:"Invités",duree:"Durée souhaitée",technique:"Technique sur place",budget:"Budget envisagé pour la musique",chansons:"Chansons ou artistes",nom:"Nom",societe:"Société",email:"E-mail",tel:"Téléphone",message:"Message"};if(EN)lines.push("Langue : anglais");
      Object.keys(labels).forEach(function(k){var v=fd.getAll(k==="moments"?"moments[]":k).join(", ");if(v)lines.push(labels[k]+" : "+v)});
      var subject="Demande JamBag : "+(fd.get("type")||"événement")+(fd.get("date")?" du "+fd.get("date").split("-").reverse().join("/"):"");
      function mailto(){status.textContent=T("L'envoi direct n'a pas abouti : votre messagerie s'ouvre avec la demande déjà rédigée.","Sending failed: your email app is opening with the request already written.");window.location.href="mailto:hello@jambag.fr?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(T("Bonjour,","Hello,")+"\n\n"+lines.join("\n"))}
      send.disabled=true;status.textContent=T("Envoi en cours…","Sending…");
      fetch(wz.getAttribute("action"),{method:"POST",body:fd,headers:{"Accept":"application/json"}})
        .then(function(r){return r.ok?r.json():Promise.reject()})
        .then(function(j){if(!j||!j.ok)throw 0;sentAll=true;wz.innerHTML='<div class="w-done"><span class="pick-mini" aria-hidden="true"></span><h3>'+T("Merci, votre demande est partie.","Thank you, your request has been sent.")+'</h3><p>'+T("Carl vous rappelle très vite pour en parler.","Carl will call you back very soon to talk it through.")+'</p></div>'})
        .catch(mailto).then(function(){send.disabled=false});
    });
    show(0,false);
  }

  /* ---------- Répertoire : onglets et recherche ---------- */
  var tabs=$$(".tab");
  if(tabs.length){
    var panels=$$(".rep-panel"),q=$("#rep-search");
    function sel(i){tabs.forEach(function(t,j){t.setAttribute("aria-selected",i===j);t.tabIndex=i===j?0:-1});panels.forEach(function(p,j){p.hidden=i!==j});filter()}
    tabs.forEach(function(t,i){
      t.addEventListener("click",function(){sel(i)});
      t.addEventListener("keydown",function(e){if(e.key==="ArrowRight"||e.key==="ArrowLeft"){var k=(i+(e.key==="ArrowRight"?1:-1)+tabs.length)%tabs.length;sel(k);tabs[k].focus()}});
    });
    function norm(s){return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"")}
    function filter(){
      var v=q?norm(q.value.trim()):"";
      panels.forEach(function(p){if(p.hidden)return;var n=0;$$("li[data-s]",p).forEach(function(li){var m=!v||norm(li.dataset.s).indexOf(v)>-1;li.hidden=!m;if(m)n++});var e=$(".empty",p);if(e)e.hidden=n>0});
    }
    if(q)q.addEventListener("input",filter);
    sel(0);
  }

  /* ---------- Avis : rangée à faire glisser ---------- */
  $$(".rv").forEach(function(rv){
    var tr=$(".rv-track",rv),pv=$(".rv-btn.prev",rv),nx=$(".rv-btn.next",rv);
    function upd(){pv.disabled=tr.scrollLeft<8;nx.disabled=tr.scrollLeft>tr.scrollWidth-tr.clientWidth-8}
    function go(d){var c=$("li",tr);tr.scrollBy({left:d*(c?c.offsetWidth+16:300)*(window.innerWidth>900?2:1),behavior:reduce?"auto":"smooth"})}
    pv.addEventListener("click",function(){go(-1)});nx.addEventListener("click",function(){go(1)});
    tr.addEventListener("scroll",upd,{passive:true});upd();
  });
  /* Photos cliquables au clavier */
  $$(".ph-v").forEach(function(el){el.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();var t=el.dataset.video?el:$("img.on[data-video]",el);if(t)t.click()}})});


  /* ---------- Miniatures YouTube : image de secours si la grande miniature n'existe pas ---------- */
  $$("img[data-fb]").forEach(function(im){
    function chk(){if(im.naturalWidth&&im.naturalWidth<=120){im.src=im.dataset.fb;im.removeAttribute("data-fb")}}
    im.addEventListener("error",function(){if(im.dataset.fb){im.src=im.dataset.fb;im.removeAttribute("data-fb")}});
    im.addEventListener("load",chk);if(im.complete)chk();
  });

  /* ---------- Avis : l'avis mis en avant change à chaque visite ---------- */
  $$("[data-rotate]").forEach(function(q){
    var sec=q.closest("section"),cards=sec?$$(".rv-track li",sec):[];if(!cards.length)return;
    var pool=cards.filter(function(c){return c.classList.contains("hot")});if(!pool.length)pool=cards;
    var c=pool[Math.floor(Math.random()*pool.length)],p=$("p",c),f=$("footer",c),st=$(".stars",c),b=$("b",f);
    if(!p||!f||!b)return;
    var ctx=f.textContent.replace(b.textContent,"").trim();
    q.innerHTML="<p>"+p.innerHTML+"</p><footer>"+(st?st.outerHTML:"")+"<br><b>"+b.innerHTML+"</b>"+(ctx?", "+ctx.charAt(0).toLowerCase()+ctx.slice(1):"")+"</footer>";
    c.hidden=true;
  });

  /* ---------- Médiator : on peut aussi le faire bouger au doigt ---------- */
  var pst=$(".pick-stage");
  if(pick&&pst&&!reduce){
    var tilt=function(e){var r=pick.getBoundingClientRect(),x=(e.clientX-(r.left+r.width/2))/r.width,y=(e.clientY-(r.top+r.height/2))/r.height;
      pick.style.setProperty("--mx",clamp(x*70,-45,45).toFixed(2)+"deg");pick.style.setProperty("--my",clamp(-y*55,-35,35).toFixed(2)+"deg")};
    pst.addEventListener("pointerdown",function(e){if(e.pointerType!=="mouse"){tilt(e)}});
    pst.addEventListener("pointermove",function(e){if(e.pointerType!=="mouse")tilt(e)},{passive:true});
    pst.addEventListener("pointerup",function(e){if(e.pointerType==="mouse")return;pick.classList.remove("spin");void pick.offsetWidth;pick.classList.add("spin");
      setTimeout(function(){pick.style.setProperty("--mx","0deg");pick.style.setProperty("--my","0deg")},900)});
    pst.addEventListener("click",function(){pick.classList.remove("spin");void pick.offsetWidth;pick.classList.add("spin")});
  }

  /* ---------- « Une question ? » : le médiator de Carl ---------- */
  var cp=$(".callpick");
  if(cp&&!$("#wizard")){
    var cpo=$(".cp-open",cp),cpc=$(".cp-card",cp),shown=false;
    function showCp(){if(shown)return;shown=true;cp.hidden=false;requestAnimationFrame(function(){cp.classList.add("on")})}
    setTimeout(showCp,9000);
    window.addEventListener("scroll",function(){if(window.scrollY>window.innerHeight*.9)showCp()},{passive:true});
    cpo.addEventListener("click",function(){var o=cpc.hidden;cpc.hidden=!o;cpo.setAttribute("aria-expanded",o);cp.classList.toggle("open",o)});
    $(".cp-x",cp).addEventListener("click",function(){cp.classList.remove("on");setTimeout(function(){cp.hidden=true},400)});
  }
  var y=$("#year");if(y)y.textContent=new Date().getFullYear();
})();
