// 1) CURSOR CUSTOMIZADO
    // Dois elementos: disco central com mix-blend + halo grande com blur.
    // Halo segue com atraso (interpolação em rAF) pra dar peso.
    (function(){
      var isFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      if (!isFine) return;
      var cursor = document.querySelector('.cursor');
      var halo = document.querySelector('.cursor-halo');
      var mx = 0, my = 0, hx = 0, hy = 0;
      window.addEventListener('mousemove', function(e){
        mx = e.clientX; my = e.clientY;
        cursor.style.left = mx + 'px';
        cursor.style.top = my + 'px';
      });
      function loop(){
        hx += (mx - hx) * 0.12;
        hy += (my - hy) * 0.12;
        halo.style.left = hx + 'px';
        halo.style.top = hy + 'px';
        requestAnimationFrame(loop);
      }
      loop();
      var hoverables = document.querySelectorAll('a, button, [data-tilt]');
      hoverables.forEach(function(el){
        el.addEventListener('mouseenter', function(){ cursor.classList.add('is-hover'); });
        el.addEventListener('mouseleave', function(){ cursor.classList.remove('is-hover'); });
      });
      document.addEventListener('mouseleave', function(){
        cursor.classList.add('is-hidden');
        halo.style.opacity = '0';
      });
      document.addEventListener('mouseenter', function(){
        cursor.classList.remove('is-hidden');
        halo.style.opacity = '0.5';
      });
    })();

    // 2) NAV — background aparece ao rolar
    (function(){
      var nav = document.getElementById('nav');
      function onScroll(){
        nav.classList.toggle('is-scrolled', window.scrollY > 40);
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    })();

    // 3) HERO — palavra que cicla (kinetic type via Web Animations API)
    (function(){
      var el = document.getElementById('kinetic');
      if (!el) return;
      var words = ['programador', 'engenheira', 'freelancer', 'contratado', 'CTO'];
      var i = 0;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      setInterval(function(){
        var out = el.animate(
          [
            { opacity: 1, transform: 'translateY(0)' },
            { opacity: 0, transform: 'translateY(-14px)' }
          ],
          { duration: 260, easing: 'cubic-bezier(0.4, 0, 1, 1)' }
        );
        out.onfinish = function(){
          i = (i + 1) % words.length;
          el.textContent = words[i];
          el.animate(
            [
              { opacity: 0, transform: 'translateY(14px)' },
              { opacity: 1, transform: 'translateY(0)' }
            ],
            { duration: 320, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }
          );
        };
      }, 2400);
    })();

    // 4) REVEAL ON SCROLL via IntersectionObserver
    (function(){
      var targets = document.querySelectorAll('[data-reveal]');
      if (!('IntersectionObserver' in window)) {
        targets.forEach(function(el){ el.classList.add('is-visible'); });
        return;
      }
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      targets.forEach(function(el){ io.observe(el); });
    })();

    // 5) CONTADORES ANIMADOS (só começam ao entrar em tela)
    (function(){
      var counters = document.querySelectorAll('[data-count]');
      if (!counters.length) return;
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var target = parseInt(el.dataset.count, 10);
          var duration = 1600;
          var start = performance.now();
          function step(now){
            var p = Math.min(1, (now - start) / duration);
            var eased = 1 - Math.pow(1 - p, 4);
            var current = Math.floor(eased * target);
            el.textContent = current.toLocaleString('pt-BR');
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = target.toLocaleString('pt-BR');
          }
          requestAnimationFrame(step);
          io.unobserve(el);
        });
      }, { threshold: 0.3 });
      counters.forEach(function(el){ io.observe(el); });
    })();

    // 6) TILT 3D nas formações — perspective + rotateXY + var CSS pra glow
    (function(){
      var cards = document.querySelectorAll('[data-tilt]');
      var MAX = 6;
      cards.forEach(function(card){
        var raf = null;
        card.addEventListener('mousemove', function(e){
          var rect = card.getBoundingClientRect();
          var x = (e.clientX - rect.left) / rect.width;
          var y = (e.clientY - rect.top) / rect.height;
          if (raf) cancelAnimationFrame(raf);
          raf = requestAnimationFrame(function(){
            var rx = (0.5 - y) * MAX;
            var ry = (x - 0.5) * MAX;
            card.style.transform = 'perspective(1000px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateZ(0)';
            card.style.setProperty('--x', (x * 100) + '%');
            card.style.setProperty('--y', (y * 100) + '%');
          });
        });
        card.addEventListener('mouseleave', function(){
          if (raf) cancelAnimationFrame(raf);
          card.style.transform = '';
        });
      });
    })();

    // 7) FORMAÇÕES — scroll horizontal com roda do mouse
    (function(){
      var scroller = document.getElementById('formacoes-scroll');
      if (!scroller) return;
      scroller.addEventListener('wheel', function(e){
        if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
        e.preventDefault();
        scroller.scrollLeft += e.deltaY;
      }, { passive: false });
    })();

    // 8) EDITOR "RUN" — simula execução com typing linha por linha
    (function(){
      var btn = document.getElementById('run-btn');
      var term = document.getElementById('terminal');
      if (!btn || !term) return;
      var script = [
        { text: '$ node aluno.js', delay: 0, cls: 'dim' },
        { text: '', delay: 400, cls: '' },
        { text: 'iniciando jornada de você...', delay: 200, cls: 'dim' },
        { text: '', delay: 300, cls: '' },
        { text: '[semana 1]  hello world funcionando ✓', delay: 250, cls: 'ok' },
        { text: '[semana 6]  primeira api rodando ✓', delay: 250, cls: 'ok' },
        { text: '[semana 12] projeto full stack no ar ✓', delay: 250, cls: 'ok' },
        { text: '[semana 18] portfolio review com recrutadora ✓', delay: 250, cls: 'ok' },
        { text: '[semana 22] 3 processos seletivos rolando ✓', delay: 250, cls: 'ok' },
        { text: '[semana 24] entrevista técnica final ✓', delay: 250, cls: 'ok' },
        { text: '', delay: 400, cls: '' },
        { text: '>>> você foi contratado 🎉', delay: 500, cls: 'hi' },
        { text: '    empresa: Nubank', delay: 200, cls: 'dim' },
        { text: '    cargo:   Frontend Developer', delay: 100, cls: 'dim' },
        { text: '    salário: R$ 8.500', delay: 100, cls: 'dim' },
        { text: '', delay: 300, cls: '' },
        { text: 'processo concluído em 6 meses.', delay: 200, cls: 'dim' },
        { text: 'próximo aluno? ↓', delay: 400, cls: 'dim' }
      ];
      var running = false;
      btn.addEventListener('click', async function(){
        if (running) return;
        running = true;
        btn.disabled = true;
        btn.textContent = 'rodando…';
        term.innerHTML = '';
        for (var i = 0; i < script.length; i++) {
          var line = script[i];
          await new Promise(function(r){ setTimeout(r, line.delay); });
          var el = document.createElement('div');
          el.className = 'term-line' + (line.cls ? ' ' + line.cls : '');
          el.textContent = line.text || '\u00A0';
          term.appendChild(el);
          term.scrollTop = term.scrollHeight;
        }
        btn.disabled = false;
        btn.innerHTML = 'rodar de novo ↻';
        running = false;
      });
    })();

    // 10) HERO FEED — notificações "ao vivo" (rotacionam)
    // Não é real, mas comunica densidade e prova social viva.
    // Se marcam de manhã, alunos ativos numa página tarde da noite não é plausível.
    (function(){
      var list = document.getElementById('feed-list');
      var countEl = document.getElementById('feed-count');
      if (!list) return;

      // Pool de eventos plausíveis. A cada tick, sorteio um e crio horário coerente.
      var events = [
        { t: 'começou <b>Formação Front End</b>', who: 'Rafaela' },
        { t: 'recebeu proposta <i>@ Stone</i> (R$ 9.200)', who: 'Bruno' },
        { t: 'publicou projeto <b>e-commerce</b>', who: 'Camila' },
        { t: 'passou na entrevista técnica <i>@ Nubank</i>', who: 'Diego' },
        { t: 'concluiu módulo <b>React avançado</b>', who: 'Mariana' },
        { t: 'foi promovido a Senior <i>@ iFood</i>', who: 'Pedro' },
        { t: 'começou <b>Formação Full Stack</b>', who: 'Thaís' },
        { t: 'assinou contrato <i>@ Meta</i>', who: 'Lucas' },
        { t: 'publicou <b>agente com Claude Code</b>', who: 'Julia' },
        { t: 'mock de entrevista com recrutadora', who: 'Ana' },
        { t: 'começou trilha <b>Análise de Dados</b>', who: 'Roberto' },
        { t: 'aprovada em processo <i>@ PicPay</i>', who: 'Fernanda' },
        { t: 'publicou <b>dashboard financeiro</b>', who: 'Gabriel' },
        { t: 'entrou na comunidade DevClub', who: 'Henrique' },
        { t: 'assinou primeira mensalidade', who: 'Beatriz' }
      ];

      // horário coerente: começa "agora" e vai voltando
      var now = new Date();
      var pointer = new Date(now.getTime());
      var used = new Set();

      function fmtTime(d){
        var hh = String(d.getHours()).padStart(2, '0');
        var mm = String(d.getMinutes()).padStart(2, '0');
        return hh + ':' + mm;
      }

      function pickEvent(){
        // não repete o último
        var idx;
        var guard = 0;
        do {
          idx = Math.floor(Math.random() * events.length);
          guard++;
        } while (used.has(idx) && guard < 20);
        used.add(idx);
        if (used.size > 8) used.clear();
        return events[idx];
      }

      function makeItem(){
        // recua 30-90s no tempo
        pointer = new Date(pointer.getTime() - (30 + Math.random() * 60) * 1000);
        var ev = pickEvent();
        var el = document.createElement('div');
        el.className = 'feed__item';
        el.innerHTML =
          '<span class="feed__time">' + fmtTime(pointer) + '</span>' +
          '<span class="feed__text"><b>' + ev.who + '</b> ' + ev.t + '</span>';
        return el;
      }

      // popula 6 iniciais imediatamente
      for (var i = 0; i < 6; i++) {
        list.appendChild(makeItem());
      }

      // roda contador de "online" com pequenas oscilações
      var online = 8;
      setInterval(function(){
        var delta = Math.random() > 0.5 ? 1 : -1;
        online = Math.max(5, Math.min(14, online + delta));
        if (countEl) countEl.textContent = online + ' online';
      }, 4000);

      // adiciona novo item no topo a cada ~4s
      // remove último se lista tá cheia demais
      setInterval(function(){
        pointer = new Date(); // renova o "agora"
        var item = makeItem();
        list.insertBefore(item, list.firstChild);
        while (list.children.length > 8) {
          list.removeChild(list.lastChild);
        }
      }, 3500);
    })();

    // 11) PARALLAX SUTIL NA HEADLINE DO HERO
    // Cada linha se desloca ~4px seguindo o cursor. Sem gimmick, apenas sensação de vida.
    (function(){
      var isFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      if (!isFine) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      var headline = document.getElementById('hero-headline');
      if (!headline) return;
      var lines = headline.querySelectorAll('.line');
      var tx = 0, ty = 0, cx = 0, cy = 0;

      window.addEventListener('mousemove', function(e){
        var w = window.innerWidth, h = window.innerHeight;
        tx = (e.clientX / w - 0.5) * 2; // -1..1
        ty = (e.clientY / h - 0.5) * 2;
      });

      function loop(){
        cx += (tx - cx) * 0.06;
        cy += (ty - cy) * 0.06;
        lines.forEach(function(line, i){
          var depth = (i + 1) * 4; // linhas ganham profundidade diferente
          line.style.transform = 'translate3d(' + (cx * depth) + 'px, ' + (cy * depth) + 'px, 0)';
        });
        requestAnimationFrame(loop);
      }
      loop();
    })();

    // 12) EASTER EGG NO CONSOLE
    (function(){
      var green = 'color: #7CFF6B; font-family: JetBrains Mono, monospace;';
      var cream = 'color: #F4F2EC; font-family: JetBrains Mono, monospace;';
      console.log('%c\n' +
        '  ██████╗ ███████╗██╗   ██╗ ██████╗██╗     ██╗   ██╗██████╗ \n' +
        '  ██╔══██╗██╔════╝██║   ██║██╔════╝██║     ██║   ██║██╔══██╗\n' +
        '  ██║  ██║█████╗  ██║   ██║██║     ██║     ██║   ██║██████╔╝\n' +
        '  ██║  ██║██╔══╝  ╚██╗ ██╔╝██║     ██║     ██║   ██║██╔══██╗\n' +
        '  ██████╔╝███████╗ ╚████╔╝ ╚██████╗███████╗╚██████╔╝██████╔╝\n' +
        '  ╚═════╝ ╚══════╝  ╚═══╝   ╚═════╝╚══════╝ ╚═════╝ ╚═════╝ \n', green);
      console.log('%colha só quem chegou 👀', green + 'font-size:14px;');
      console.log('%cse você tá inspecionando essa página, você já é do time.\ndevclub.com.br/vagas — a gente tá contratando dev que curte olhar código dos outros.', cream + 'font-size:12px;');
    })();
/* ============================================================
   NOVA PASSADA — canvas particles, roadmap AI, salários, bônus
   ============================================================ */

// 13) CANVAS DE PARTÍCULAS NO HERO (constellation)
// Pontos verdes flutuando. Quando próximos, ligam com linha.
// Reagem ao cursor: sofrem repulsão sutil.
(function(){
  var canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var ctx = canvas.getContext('2d');
  var particles = [];
  var mouseX = -1000, mouseY = -1000;
  var w, h, dpr;

  function resize(){
    dpr = window.devicePixelRatio || 1;
    w = canvas.offsetWidth;
    h = canvas.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    initParticles();
  }

  function initParticles(){
    particles = [];
    // densidade adaptativa: mais pontos em telas maiores
    var count = Math.min(90, Math.floor(w * h / 15000));
    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.8
      });
    }
  }

  window.addEventListener('resize', resize);
  canvas.addEventListener('mousemove', function(e){
    var rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });
  // pega mousemove global também, já que canvas tem pointer-events: none
  window.addEventListener('mousemove', function(e){
    var rect = canvas.getBoundingClientRect();
    if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    } else {
      mouseX = -1000; mouseY = -1000;
    }
  });

  function tick(){
    ctx.clearRect(0, 0, w, h);

    // desenha linhas entre pontos próximos (antes dos pontos, pra ficarem atrás)
    var LINK_DIST = 140;
    for (var i = 0; i < particles.length; i++) {
      var a = particles[i];
      for (var j = i + 1; j < particles.length; j++) {
        var b = particles[j];
        var dx = a.x - b.x, dy = a.y - b.y;
        var d2 = dx*dx + dy*dy;
        if (d2 < LINK_DIST * LINK_DIST) {
          var alpha = (1 - Math.sqrt(d2) / LINK_DIST) * 0.18;
          ctx.strokeStyle = 'rgba(124, 255, 107, ' + alpha + ')';
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // atualiza + desenha pontos
    for (var k = 0; k < particles.length; k++) {
      var p = particles[k];
      // interação com cursor: repulsão sutil dentro de raio
      var mdx = p.x - mouseX, mdy = p.y - mouseY;
      var md2 = mdx*mdx + mdy*mdy;
      var REP_RADIUS = 100;
      if (md2 < REP_RADIUS * REP_RADIUS && md2 > 0) {
        var f = (1 - Math.sqrt(md2) / REP_RADIUS) * 0.6;
        var md = Math.sqrt(md2);
        p.vx += (mdx / md) * f * 0.4;
        p.vy += (mdy / md) * f * 0.4;
      }

      // damping — impede que pontos ganhem velocidade infinita
      p.vx *= 0.985;
      p.vy *= 0.985;

      // velocidade mínima pra manter movimento vivo
      var speed = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
      if (speed < 0.1) {
        p.vx += (Math.random() - 0.5) * 0.15;
        p.vy += (Math.random() - 0.5) * 0.15;
      }

      p.x += p.vx;
      p.y += p.vy;

      // wrap nas bordas
      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20;
      if (p.y > h + 20) p.y = -20;

      // desenha
      ctx.fillStyle = 'rgba(124, 255, 107, 0.7)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(tick);
  }

  resize();
  tick();
})();

// 14) BÔNUS CARROSSEL — navegação com setas
(function(){
  var scroll = document.getElementById('bonus-scroll');
  var prev = document.getElementById('bonus-prev');
  var next = document.getElementById('bonus-next');
  if (!scroll || !prev || !next) return;

  function step(dir){
    // pula 1 card + gap por vez
    var card = scroll.querySelector('.bonus__card');
    if (!card) return;
    var w = card.offsetWidth + 16; // gap
    scroll.scrollBy({ left: w * dir, behavior: 'smooth' });
  }
  prev.addEventListener('click', function(){ step(-1); });
  next.addEventListener('click', function(){ step(1); });

  // atualiza estado dos botões conforme scroll
  function updateButtons(){
    var max = scroll.scrollWidth - scroll.clientWidth;
    prev.disabled = scroll.scrollLeft < 5;
    next.disabled = scroll.scrollLeft >= max - 5;
  }
  scroll.addEventListener('scroll', updateButtons, { passive: true });
  updateButtons();

  // roda do mouse converte vertical em horizontal (mesmo padrão da seção formações)
  scroll.addEventListener('wheel', function(e){
    if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
    e.preventDefault();
    scroll.scrollLeft += e.deltaY;
  }, { passive: false });
})();

// 15) SALÁRIOS — barras animam quando o chart entra em tela
(function(){
  var chart = document.getElementById('salary-chart');
  if (!chart) return;
  var bars = chart.querySelectorAll('.salary__bar');

  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting) {
        bars.forEach(function(b, i){
          // stagger — cada barra atrasa um pouquinho a mais
          b.style.animationDelay = (i * 0.12) + 's';
          b.classList.add('is-visible');
        });
        io.disconnect();
      }
    });
  }, { threshold: 0.3 });
  io.observe(chart);
})();

// 16) ROADMAP AI — a estrela da nova passada
// Comportamento: usuário responde 3 perguntas, aperta gerar, IA "digita" resposta personalizada.
// Backend é 100% cliente — as respostas são geradas por template. Se um dia plugarem uma
// chamada real (Anthropic API, OpenAI), o único ponto de troca é a função generate().
(function(){
  var answers = { 1: null, 2: null, 3: null };
  var opts = document.querySelectorAll('.roadmap__opt');
  var submit = document.getElementById('roadmap-submit');
  var output = document.getElementById('roadmap-output');
  var thinking = document.getElementById('roadmap-thinking');
  var thinkingText = document.getElementById('roadmap-thinking-text');
  var answerEl = document.getElementById('roadmap-answer');

  if (!submit) return;

  opts.forEach(function(btn){
    btn.addEventListener('click', function(){
      var q = btn.dataset.q;
      var v = btn.dataset.v;
      answers[q] = v;
      // desativa outras opções da mesma pergunta
      document.querySelectorAll('.roadmap__opt[data-q="' + q + '"]').forEach(function(o){
        o.classList.remove('is-active');
      });
      btn.classList.add('is-active');
      // libera submit quando as 3 tão respondidas
      if (answers[1] && answers[2] && answers[3]) {
        submit.disabled = false;
      }
    });
  });

  // GERADOR DE RESPOSTA — o "cérebro" fake
  // Vira o único ponto que precisa mudar se um dia plugarem IA real.
  function generate(a){
    var partidas = {
      zero: 'Beleza. Zero programação — a maioria dos alunos DevClub começou exatamente aí.',
      pouco: 'Beleza. Você tem uma base pequena, mas isso vai acelerar as primeiras 4 semanas.',
      ti: 'Boa. Já trampar em TI é uma vantagem enorme — você já entende arquitetura, deploy e trabalho em time.'
    };
    var tempos = {
      '1h': { desc: '1 hora por dia', prazoBase: 9, esforco: 'ritmo confortável, mas exige consistência religiosa' },
      '2h': { desc: '2-3 horas por dia', prazoBase: 6, esforco: 'ritmo padrão do método, é onde a maioria fica' },
      '4h': { desc: '4h+ por dia', prazoBase: 4, esforco: 'ritmo acelerado, tem gente que fecha em 4 meses assim' }
    };
    var objetivos = {
      fe: {
        nome: 'Formação Front End',
        stack: 'HTML, CSS, JavaScript, TypeScript, React, Next.js, Tailwind',
        cases: 'landing pages, dashboards, e-commerces, sistemas SaaS',
        junior: 'R$ 5.900/mês', pleno: 'R$ 11.700/mês',
        vagas: 'muitíssimas — é a porta de entrada mais comum'
      },
      be: {
        nome: 'Formação Back End',
        stack: 'Node, TypeScript, Fastify, PostgreSQL, Redis, Docker',
        cases: 'APIs REST, integrações, autenticação, sistemas de pagamento',
        junior: 'R$ 6.200/mês', pleno: 'R$ 12.400/mês',
        vagas: 'muitas — e o salário sobe rápido a partir de pleno'
      },
      fs: {
        nome: 'Formação Full Stack',
        stack: 'React + Node + AWS + Docker + tudo que uma startup precisa',
        cases: 'produtos completos, do primeiro deploy até 10k usuários',
        junior: 'R$ 6.500/mês', pleno: 'R$ 12.800/mês',
        vagas: 'você vira o dev que resolve tudo — muito valorizado em startups'
      },
      ia: {
        nome: 'Especialização Gestor de IA + Claude & Claude Code',
        stack: 'Claude, MCP, agentes autônomos, Python, prompting avançado',
        cases: 'agentes que substituem trabalho manual, automações complexas, sistemas humano+IA',
        junior: 'R$ 8.500/mês (essa cai muito rápido)', pleno: 'R$ 16.000/mês',
        vagas: 'a carreira que apareceu em 2025 e tá pagando mais que qualquer outra em 2026'
      },
      dados: {
        nome: 'Formação Análise de Dados',
        stack: 'Python, SQL, Pandas, Power BI, mlops básico',
        cases: 'dashboards, análises exploratórias, modelos preditivos, ETL',
        junior: 'R$ 5.500/mês', pleno: 'R$ 10.800/mês',
        vagas: 'mercado sólido — toda empresa acima de 50 pessoas precisa'
      }
    };

    var p = partidas[a[1]];
    var t = tempos[a[2]];
    var o = objetivos[a[3]];

    // ajuste de prazo por partida
    var prazoAdj = 0;
    if (a[1] === 'zero') prazoAdj = 1;
    if (a[1] === 'ti') prazoAdj = -1;
    var prazo = Math.max(3, t.prazoBase + prazoAdj);

    var out = p + '\n\n';
    out += 'Com ' + t.desc + ', <span class="glow">seu prazo estimado até a primeira contratação é de ' + prazo + ' meses</span> — ' + t.esforco + '.\n\n';
    out += '<h4>Formação recomendada</h4>';
    out += '<span class="glow">' + o.nome + '</span>\n';
    out += 'Stack: ' + o.stack + '\n';
    out += 'Você vai construir: ' + o.cases + '\n\n';
    out += '<h4>Roadmap dos ' + prazo + ' meses</h4>';

    // gera roadmap dinâmico por mês
    var etapas = [
      { m: 'MÊS 01', t: 'Fundamento — HTML, CSS, JS, Git. Primeira página no ar.' },
      { m: 'MÊS 02', t: 'Estrutura — ' + (a[3] === 'be' || a[3] === 'dados' ? 'lógica avançada e SQL básico' : 'entra em React ou stack principal') + '.' },
      { m: 'MÊS ' + (prazo > 4 ? '03' : '03'), t: 'Primeiro projeto full — publicado no GitHub, com README de gente grande.' },
      { m: 'MÊS ' + (Math.max(3, prazo - 2)), t: 'Segundo projeto + refino do portfólio. Site pessoal no ar.' },
      { m: 'MÊS ' + (prazo - 1), t: 'Entrevistas — mocks com recrutadora. Primeiros processos rolando.' },
      { m: 'MÊS ' + prazo, t: '<span class="glow">Offer letter aceito. Onboarding. Primeira sprint.</span>' }
    ];
    etapas.forEach(function(e){
      out += '• ' + e.m + ' — ' + e.t + '\n';
    });

    out += '\n<h4>Salário esperado no primeiro emprego</h4>';
    out += 'Júnior: ' + o.junior + '  |  Pleno (em 18 meses): ' + o.pleno + '\n';
    out += '<span class="glow">Vagas disponíveis:</span> ' + o.vagas + '\n\n';

    if (a[1] === 'zero' && a[2] === '1h') {
      out += '<span class="warn">Aviso honesto:</span> começar do zero com 1h/dia dá pra fazer, mas te obriga a MUITA disciplina. Se puder abrir 30min a mais no fim de semana, ajuda bastante.\n\n';
    }
    if (a[3] === 'ia') {
      out += '<span class="glow">Bônus:</span> quem entra hoje em IA/agentes tá pegando a onda no momento certo. Em 12 meses o mercado vai estar saturado — mas saturado no bom sentido: com muita vaga.\n\n';
    }

    out += 'Quer conversar com uma pessoa real sobre esse plano? A recrutadora do DevClub responde em até 4h úteis — <span class="glow">e o primeiro papo é grátis mesmo pra quem ainda não é aluno</span>.';

    return out;
  }

  // TYPING EFFECT — imita "IA escrevendo"
  // Rate variável dá sensação orgânica (pausa em pontuação, mais rápido em palavras curtas).
  async function typeAnswer(html){
    answerEl.innerHTML = '';
    var cursor = document.createElement('span');
    cursor.className = 'roadmap__cursor';

    // percorre caractere por caractere, mas insere tags HTML inteiras (não uma tag em pedaços)
    var i = 0;
    while (i < html.length) {
      // se for uma tag, insere ela inteira
      if (html[i] === '<') {
        var end = html.indexOf('>', i);
        answerEl.innerHTML = html.substring(0, end + 1);
        i = end + 1;
        continue;
      }
      answerEl.innerHTML = html.substring(0, i + 1);
      answerEl.appendChild(cursor);
      i++;
      // delay variável
      var c = html[i - 1];
      var delay = 12;
      if (c === '.' || c === '?' || c === '!') delay = 180;
      else if (c === ',' || c === ':') delay = 90;
      else if (c === '\n') delay = 60;
      else if (c === ' ') delay = 6;
      else delay = 8 + Math.random() * 12;
      await new Promise(function(r){ setTimeout(r, delay); });
    }
    // remove cursor no fim
    if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
  }

  submit.addEventListener('click', async function(){
    if (submit.disabled) return;
    submit.disabled = true;
    submit.innerHTML = 'gerando...';

    // abre painel
    output.classList.add('is-open');
    thinking.style.display = 'flex';
    answerEl.innerHTML = '';

    // sequência de "pensamento" pra vender que a IA tá processando
    var steps = [
      'a IA está analisando seu perfil...',
      'cruzando com 25.000 trajetórias anteriores...',
      'ajustando ao seu tempo disponível...',
      'montando seu roadmap...'
    ];
    for (var i = 0; i < steps.length; i++) {
      thinkingText.textContent = steps[i];
      await new Promise(function(r){ setTimeout(r, 700); });
    }

    thinking.style.display = 'none';
    // scroll suave até o output
    output.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // gera resposta e digita
    var text = generate(answers);
    await typeAnswer(text);

    submit.disabled = false;
    submit.innerHTML = 'gerar de novo com outra combinação ↻';
  });
})();

// 17) DEPOIMENTO VÍDEO — clicar no play mostra um "modal fake" pedindo o link real
(function(){
  var thumbs = document.querySelectorAll('.voice-video__thumb');
  thumbs.forEach(function(t){
    t.addEventListener('click', function(){
      // no site real seria abrir um <video>. Como não temos, mostra um toast honesto.
      alert('No site em produção, aqui rodaria o vídeo do depoimento (formato .mp4 ou embed YouTube). Nesta demo do concurso, os dados são fictícios.');
    });
    t.addEventListener('keydown', function(e){
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); t.click(); }
    });
  });
})();

/* ============================================================
   V4 — BOOT · SHADER · PROGRESS · MARKERS · SCRAMBLE · MAGNETIC
   ============================================================ */

// 18) BOOT SEQUENCE — tela cinematográfica que precede o site
// Simula boot de sistema. Cada linha aparece com typing (efeito de output real de terminal).
// Ao fim, dissolve pra revelar a página.
(function(){
  var boot = document.getElementById('boot');
  var container = document.getElementById('boot-lines');
  if (!boot || !container) return;

  // Se o usuário prefere movimento reduzido, pula o boot completamente
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    boot.classList.add('is-done');
    return;
  }

  // Se a página já foi carregada nessa sessão (F5), pula o boot pra não irritar
  if (sessionStorage.getItem('dc_booted')) {
    boot.style.transition = 'none';
    boot.classList.add('is-done');
    return;
  }
  sessionStorage.setItem('dc_booted', '1');

  var lines = [
    { text: '> initializing devclub.system', delay: 0, cls: 'dim' },
    { text: '  loading kernel modules... [########] 100%', delay: 220, cls: 'dim' },
    { text: '  connecting to community.mainframe... ✓', delay: 280, cls: 'ok' },
    { text: '  syncing 25.847 active members... ✓', delay: 220, cls: 'ok' },
    { text: '  loading 14 formação tracks... ✓', delay: 200, cls: 'ok' },
    { text: '  ai agents online: claude-4.7, mentor-v2 ✓', delay: 240, cls: 'ok' },
    { text: '  checking recruiter availability... ✓', delay: 200, cls: 'ok' },
    { text: '', delay: 200, cls: '' },
    { text: '  ready. welcome, future developer.', delay: 300, cls: 'hi' }
  ];

  var totalDelay = 300;
  lines.forEach(function(l){
    setTimeout(function(){
      var p = document.createElement('p');
      p.className = 'boot__line ' + (l.cls || '');
      p.textContent = l.text || '\u00A0';
      container.appendChild(p);
    }, totalDelay);
    totalDelay += l.delay;
  });

  // dissolve depois de todas as linhas + hold
  setTimeout(function(){
    boot.classList.add('is-done');
    // remove do DOM depois da transição pra não interceptar cliques
    setTimeout(function(){ boot.remove(); }, 900);
  }, totalDelay + 900);
})();

// 19) WEBGL SHADER NO HERO — aurora / flow field verde
// Fragment shader GLSL puro. Sem biblioteca. ~120 linhas.
// Efeito: noise fractal animado + ripples do cursor. Muito sutil, screen blend.
(function(){
  var canvas = document.getElementById('hero-shader');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return; // fallback silencioso — o canvas 2D das partículas continua

  var VERT = [
    'attribute vec2 a_pos;',
    'void main() {',
    '  gl_Position = vec4(a_pos, 0.0, 1.0);',
    '}'
  ].join('\n');

  // Simplex noise 2D via Ashima — implementação canônica compacta
  var FRAG = [
    'precision mediump float;',
    'uniform vec2 u_res;',
    'uniform vec2 u_mouse;',
    'uniform float u_time;',
    '',
    'vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }',
    'float snoise(vec2 v) {',
    '  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);',
    '  vec2 i  = floor(v + dot(v, C.yy));',
    '  vec2 x0 = v -   i + dot(i, C.xx);',
    '  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);',
    '  vec4 x12 = x0.xyxy + C.xxzz;',
    '  x12.xy -= i1;',
    '  i = mod(i, 289.0);',
    '  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));',
    '  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);',
    '  m = m*m; m = m*m;',
    '  vec3 x = 2.0 * fract(p * C.www) - 1.0;',
    '  vec3 h = abs(x) - 0.5;',
    '  vec3 ox = floor(x + 0.5);',
    '  vec3 a0 = x - ox;',
    '  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );',
    '  vec3 g;',
    '  g.x  = a0.x  * x0.x  + h.x  * x0.y;',
    '  g.yz = a0.yz * x12.xz + h.yz * x12.yw;',
    '  return 130.0 * dot(m, g);',
    '}',
    '',
    'void main() {',
    '  vec2 uv = gl_FragCoord.xy / u_res.xy;',
    '  vec2 p = uv * 3.0;',
    '  p.y += u_time * 0.03;',
    '  ',
    '  // noise fractal (2 oitavas)',
    '  float n1 = snoise(p);',
    '  float n2 = snoise(p * 2.2 + vec2(u_time * 0.05, u_time * 0.02));',
    '  float f = n1 * 0.6 + n2 * 0.4;',
    '  ',
    '  // ripple do mouse',
    '  vec2 mouseUV = u_mouse / u_res;',
    '  float mouseDist = length(uv - mouseUV);',
    '  float ripple = sin(mouseDist * 40.0 - u_time * 3.0) * exp(-mouseDist * 8.0) * 0.3;',
    '  f += ripple;',
    '  ',
    '  // curva de intensidade — só picos brilham',
    '  float glow = smoothstep(0.35, 0.85, f);',
    '  ',
    '  // gradiente vertical — mais escuro em cima, verde na parte inferior',
    '  float grad = pow(1.0 - uv.y, 1.4);',
    '  ',
    '  vec3 signal = vec3(0.486, 1.0, 0.42);',
    '  vec3 base = vec3(0.04, 0.06, 0.04);',
    '  vec3 col = base + signal * glow * grad * 0.35;',
    '  ',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  function compile(type, src){
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('shader compile error:', gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }
  var vs = compile(gl.VERTEX_SHADER, VERT);
  var fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;

  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.useProgram(prog);

  // quad fullscreen (2 triângulos)
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1,-1,  1,-1,  -1, 1,
    -1, 1,  1,-1,   1, 1
  ]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  var uRes = gl.getUniformLocation(prog, 'u_res');
  var uMouse = gl.getUniformLocation(prog, 'u_mouse');
  var uTime = gl.getUniformLocation(prog, 'u_time');

  var mx = 0, my = 0, dpr = 1;

  function resize(){
    dpr = Math.min(2, window.devicePixelRatio || 1);
    var w = canvas.offsetWidth * dpr;
    var h = canvas.offsetHeight * dpr;
    canvas.width = w; canvas.height = h;
    gl.viewport(0, 0, w, h);
  }
  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('mousemove', function(e){
    var rect = canvas.getBoundingClientRect();
    if (e.clientY < rect.bottom) {
      mx = (e.clientX - rect.left) * dpr;
      my = (rect.height - (e.clientY - rect.top)) * dpr; // WebGL Y invertido
    }
  });

  var t0 = performance.now();
  function frame(){
    var t = (performance.now() - t0) / 1000;
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform2f(uMouse, mx, my);
    gl.uniform1f(uTime, t);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(frame);
  }
  frame();
})();

// 20) SCROLL PROGRESS BAR + SECTION MARKERS
(function(){
  var progress = document.getElementById('progress');
  var markers = document.querySelectorAll('.marker');
  var sections = Array.from(markers).map(function(m){
    return {
      marker: m,
      target: document.getElementById(m.dataset.section)
    };
  }).filter(function(s){ return s.target; });

  function update(){
    var doc = document.documentElement;
    var scrolled = window.scrollY;
    var max = doc.scrollHeight - window.innerHeight;
    var pct = max > 0 ? (scrolled / max) * 100 : 0;
    if (progress) progress.style.setProperty('--p', pct + '%');

    // determina qual seção tá ativa (a que tem mais viewport ocupado)
    var mid = scrolled + window.innerHeight / 2;
    var active = sections[0];
    sections.forEach(function(s){
      var top = s.target.offsetTop;
      if (top <= mid) active = s;
    });
    sections.forEach(function(s){
      s.marker.classList.toggle('is-active', s === active);
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

// 21) TEXT SCRAMBLE — headings principais embaralham antes de resolver
// Aplica em elementos [data-scramble] quando entram em tela.
(function(){
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';

  function scramble(el){
    var original = el.textContent;
    // quebra em spans por caractere. Espaços viram non-breaking space
    // pra não colapsarem quando spans são display: inline-block.
    el.innerHTML = original.split('').map(function(c){
      var display = c === ' ' ? '\u00A0' : c;
      var finalChar = c === ' ' ? '\u00A0' : c;
      return '<span class="scramble-char" data-final="' + finalChar + '">' + display + '</span>';
    }).join('');
    var spans = el.querySelectorAll('.scramble-char');

    // cada char resolve em tempos diferentes
    spans.forEach(function(sp, i){
      var finalChar = sp.dataset.final;
      // espaços não embaralham — já estão prontos
      if (finalChar === '\u00A0') {
        return;
      }
      sp.classList.add('is-scrambling');
      var iterations = 0;
      var maxIterations = 8 + Math.floor(Math.random() * 6);
      var startDelay = i * 30 + Math.random() * 100;

      setTimeout(function(){
        var interval = setInterval(function(){
          iterations++;
          if (iterations >= maxIterations) {
            sp.textContent = finalChar;
            sp.classList.remove('is-scrambling');
            clearInterval(interval);
          } else {
            sp.textContent = chars[Math.floor(Math.random() * chars.length)];
          }
        }, 40);
      }, startDelay);
    });
  }

  if (!('IntersectionObserver' in window)) return;

  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting) {
        scramble(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });

  // aguarda um pouco pra scramble depois que boot termina
  setTimeout(function(){
    document.querySelectorAll('[data-scramble]').forEach(function(el){
      io.observe(el);
    });
  }, 800);
})();

// 22) MAGNETIC BUTTONS — botões respondem ao cursor
(function(){
  var isFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!isFine) return;

  var els = document.querySelectorAll('[data-magnetic]');
  var STRENGTH = 0.35; // 0 = fixo, 1 = segue completamente
  var RADIUS = 120; // px de distância pra começar a puxar

  els.forEach(function(el){
    var rect = null;
    function refreshRect(){ rect = el.getBoundingClientRect(); }
    window.addEventListener('resize', refreshRect);
    window.addEventListener('scroll', refreshRect, { passive: true });
    refreshRect();

    var raf = null;
    el.addEventListener('mouseenter', refreshRect);
    el.addEventListener('mousemove', function(e){
      if (!rect) refreshRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var dx = e.clientX - cx;
      var dy = e.clientY - cy;
      var dist = Math.sqrt(dx*dx + dy*dy);
      if (dist > RADIUS) return;

      var pull = 1 - dist / RADIUS;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function(){
        el.style.transform = 'translate3d(' + (dx * STRENGTH * pull) + 'px, ' + (dy * STRENGTH * pull) + 'px, 0)';
      });
    });
    el.addEventListener('mouseleave', function(){
      if (raf) cancelAnimationFrame(raf);
      el.style.transform = '';
    });
  });
})();

// 23) GLITCH NOS CONTADORES — números aleatórios flutuam antes de resolver
// Sobrescreve o comportamento do (5) — pega os mesmos [data-count] mas
// agora, durante a contagem, adiciona classe .glitching que faz shake CSS.
// Não precisa mudar nada pq esse rescreve DEPOIS que (5) rodou; então
// aplicamos um efeito adicional de shake em cima.
(function(){
  var counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (!entry.isIntersecting) return;
      var el = entry.target;
      el.classList.add('glitching');
      // remove glitch depois que contador terminou (~1.6s)
      setTimeout(function(){
        el.classList.remove('glitching');
      }, 1800);
      io.unobserve(el);
    });
  }, { threshold: 0.3 });
  counters.forEach(function(el){ io.observe(el); });
})();

/* ============================================================
   V5 — 3D REAL (cert flip · shadow dinâmica nos cards)
   ============================================================ */

// 24) CERTIFICADOS — flip 3D ao clicar (frente <-> verso)
(function(){
  var certs = document.querySelectorAll('.cert');
  certs.forEach(function(cert){
    cert.setAttribute('role', 'button');
    cert.setAttribute('tabindex', '0');
    cert.setAttribute('aria-label', 'Clique para virar o certificado');
    cert.addEventListener('click', function(){
      cert.classList.toggle('is-flipped');
    });
    cert.addEventListener('keydown', function(e){
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        cert.classList.toggle('is-flipped');
      }
    });
  });
})();

// 25) FORMAÇÃO CARDS — sombra dinâmica quando tilta
// Estende o tilt existente (IIFE 6) adicionando classe 'is-tilted' pra ativar shadow CSS.
(function(){
  var cards = document.querySelectorAll('.formacao[data-tilt]');
  cards.forEach(function(card){
    card.addEventListener('mouseenter', function(){ card.classList.add('is-tilted'); });
    card.addEventListener('mouseleave', function(){ card.classList.remove('is-tilted'); });
  });
})();
