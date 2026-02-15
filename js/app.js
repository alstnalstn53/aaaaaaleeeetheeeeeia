// ==========================================
// ALETHEIA — Frontend
// ==========================================

// ===== Particle Background =====
(function initParticles() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  const count = 60;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.3 + 0.05,
    };
  }

  function init() {
    resize();
    particles = [];
    for (let i = 0; i < count; i++) particles.push(createParticle());
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(201, 169, 110, ${0.03 * (1 - dist / 150)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw particles
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201, 169, 110, ${p.alpha})`;
      ctx.fill();

      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  init();
  draw();
})();

// ===== App =====
const app = {
  sessionId: null,
  userId: null,
  displayName: null,
  messages: [],
  exchangeCount: 0,
  isLoading: false,
  essenceThreshold: 4,

  // ===== Init =====
  start() {
    const input = document.getElementById('nickname-input');
    const name = input.value.trim();
    if (!name) {
      input.style.borderColor = 'rgba(201, 169, 110, 0.4)';
      input.focus();
      setTimeout(() => input.style.borderColor = '', 1200);
      return;
    }

    this.displayName = name;
    this.userId = 'user_' + this.genId();
    this.sessionId = 'session_' + this.genId();

    document.getElementById('entry-screen').classList.remove('active');
    document.getElementById('chat-screen').classList.add('active');
    document.getElementById('display-name').textContent = name;

    setTimeout(() => document.getElementById('user-input').focus(), 400);
    this.sendInit();
  },

  async sendInit() {
    this.showTyping();
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `[시스템: 새로운 사용자 "${this.displayName}"님이 대화를 시작했습니다. 따뜻하고 자연스러운 첫 인사를 해주세요. 이 메시지는 사용자에게 보이지 않습니다.]` }],
          sessionId: this.sessionId,
          userId: this.userId,
        }),
      });

      const data = await res.json();
      this.hideTyping();

      if (data.error) {
        this.addMsg('ai', '연결에 문제가 있어요. 잠시 후 다시 시도해주세요. (' + data.error + ')');
        return;
      }

      if (data.message) {
        this.messages = [{ role: 'assistant', content: data.message }];
        this.addMsg('ai', data.message);
      }
    } catch (err) {
      this.hideTyping();
      this.addMsg('ai', '서버 연결이 불안정합니다. 잠시 후 다시 시도해주세요.');
      console.error(err);
    }
  },

  // ===== Send =====
  async send() {
    if (this.isLoading) return;
    const input = document.getElementById('user-input');
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    input.style.height = 'auto';
    this.addMsg('user', text);
    this.messages.push({ role: 'user', content: text });

    this.isLoading = true;
    this.showTyping();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: this.messages,
          sessionId: this.sessionId,
          userId: this.userId,
        }),
      });

      const data = await res.json();
      this.hideTyping();
      this.isLoading = false;

      if (data.error) {
        this.addMsg('ai', '잠시 문제가 생겼어요. 다시 말씀해주시겠어요?');
        console.error(data.error);
        return;
      }

      if (data.message) {
        this.messages.push({ role: 'assistant', content: data.message });
        this.addMsg('ai', data.message);
        this.exchangeCount = data.exchangeCount || Math.floor(this.messages.length / 2);
        this.updateDepth();
      }
    } catch (err) {
      this.hideTyping();
      this.isLoading = false;
      this.addMsg('ai', '연결이 불안정합니다. 다시 시도해주세요.');
      console.error(err);
    }
  },

  // ===== UI =====
  addMsg(type, content) {
    const container = document.getElementById('chat-messages');
    const label = type === 'user' ? this.displayName : 'Aletheia';
    const cls = type === 'user' ? 'msg-user' : 'msg-ai';

    const el = document.createElement('div');
    el.className = `message ${cls}`;
    el.innerHTML = `
      <span class="msg-label">${label}</span>
      <div class="msg-bubble">${this.esc(content)}</div>
    `;
    container.appendChild(el);
    this.scrollDown();
  },

  showTyping() {
    if (document.getElementById('typing-msg')) return;
    const container = document.getElementById('chat-messages');
    const el = document.createElement('div');
    el.id = 'typing-msg';
    el.className = 'message msg-ai';
    el.innerHTML = `
      <span class="msg-label">Aletheia</span>
      <div class="typing-dots"><span></span><span></span><span></span></div>
    `;
    container.appendChild(el);
    this.scrollDown();
  },

  hideTyping() {
    const el = document.getElementById('typing-msg');
    if (el) el.remove();
  },

  scrollDown() {
    const area = document.getElementById('chat-area');
    setTimeout(() => area.scrollTop = area.scrollHeight, 60);
  },

  updateDepth() {
    const count = document.getElementById('depth-count');
    count.textContent = this.exchangeCount;

    const r1 = document.querySelector('.depth-ring.r1');
    const r2 = document.querySelector('.depth-ring.r2');
    const r3 = document.querySelector('.depth-ring.r3');

    if (this.exchangeCount >= 1) r1.classList.add('active');
    if (this.exchangeCount >= 3) r2.classList.add('active');
    if (this.exchangeCount >= this.essenceThreshold) {
      r3.classList.add('active');
      document.getElementById('essence-btn').disabled = false;
    }
  },

  // ===== Essence =====
  async requestEssence() {
    const overlay = document.getElementById('essence-overlay');
    const content = document.getElementById('essence-content');

    content.innerHTML = `
      <div class="essence-loading">
        <div class="essence-loading-ring"></div>
        <p>당신의 이야기를 분석하고 있습니다</p>
      </div>
    `;
    overlay.classList.add('active');

    try {
      // Extract first
      await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: this.sessionId, mode: 'extract' }),
      });

      // Then generate essence document
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: this.sessionId, mode: 'essence' }),
      });

      const data = await res.json();

      if (data.status === 'insufficient') {
        content.innerHTML = `
          <div class="essence-loading">
            <p>${data.message}</p>
            <p style="margin-top:10px;font-size:0.75rem;color:var(--text-muted)">현재 ${data.exchange_count}회 교환</p>
          </div>
        `;
      } else if (data.document) {
        content.innerHTML = this.renderMd(data.document);
      } else {
        content.innerHTML = `<div class="essence-loading"><p>생성 중 문제가 발생했습니다.</p></div>`;
      }
    } catch (err) {
      console.error(err);
      content.innerHTML = `<div class="essence-loading"><p>연결이 불안정합니다.</p></div>`;
    }
  },

  closeEssence(e) {
    if (e && e.target !== e.currentTarget && !e.target.closest('.essence-close')) return;
    document.getElementById('essence-overlay').classList.remove('active');
  },

  // ===== Utils =====
  handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.send();
    }
  },

  autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  },

  esc(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML.replace(/\n/g, '<br>');
  },

  renderMd(md) {
    return md
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^---$/gm, '<hr>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
  },

  genId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
  },
};

// Enter to start
document.getElementById('nickname-input')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') app.start();
});
