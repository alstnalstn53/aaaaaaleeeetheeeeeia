// ==========================================
// ALETHEIA — Frontend Application
// ==========================================

const app = {
  sessionId: null,
  userId: null,
  displayName: null,
  messages: [],         // Claude API 형식: [{role, content}]
  exchangeCount: 0,
  isLoading: false,
  essenceThreshold: 4,  // Essence 버튼 활성화 최소 교환 수

  // ========== 초기화 ==========

  start() {
    const input = document.getElementById('nickname-input');
    const name = input.value.trim();

    if (!name) {
      input.focus();
      input.style.borderColor = 'rgba(201, 169, 110, 0.5)';
      setTimeout(() => input.style.borderColor = '', 1000);
      return;
    }

    this.displayName = name;
    this.userId = 'user_' + this.generateId();
    this.sessionId = 'session_' + this.generateId();

    // 화면 전환
    document.getElementById('entry-screen').classList.remove('active');
    document.getElementById('chat-screen').classList.add('active');
    document.getElementById('display-name').textContent = name;

    // 포커스
    setTimeout(() => document.getElementById('user-input').focus(), 300);

    // 첫 메시지 요청 (빈 대화로 시작 — AI가 먼저 인사)
    this.sendInitialMessage();
  },

  async sendInitialMessage() {
    this.showTyping();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `[시스템: 새로운 사용자 "${this.displayName}"이(가) 대화를 시작했습니다. 자연스러운 첫 인사를 해주세요. 이 메시지는 사용자에게 보이지 않습니다.]` }],
          sessionId: this.sessionId,
          userId: this.userId,
        }),
      });

      const data = await res.json();
      this.hideTyping();

      if (data.message) {
        // 내부 메시지 기록에는 추가하지 않음 (시스템 메시지는 제외)
        this.messages = [];
        this.addMessage('assistant', data.message);
        // assistant의 첫 메시지를 messages에 추가
        this.messages.push({ role: 'assistant', content: data.message });
      }
    } catch (err) {
      this.hideTyping();
      this.addMessage('assistant', '잠시 연결이 불안정하네요. 다시 시도해주세요.');
      console.error('Initial message error:', err);
    }
  },

  // ========== 메시지 전송 ==========

  async send() {
    if (this.isLoading) return;

    const input = document.getElementById('user-input');
    const text = input.value.trim();

    if (!text) return;

    // UI 업데이트
    input.value = '';
    input.style.height = 'auto';
    this.addMessage('user', text);

    // 메시지 기록에 추가
    this.messages.push({ role: 'user', content: text });

    // 로딩 시작
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

      if (data.message) {
        this.messages.push({ role: 'assistant', content: data.message });
        this.addMessage('assistant', data.message);

        // 교환 카운트 업데이트
        this.exchangeCount = data.exchangeCount || Math.floor(this.messages.length / 2);
        this.updateCounter();
      }
    } catch (err) {
      this.hideTyping();
      this.isLoading = false;
      this.addMessage('assistant', '잠시 연결이 불안정하네요. 다시 시도해주세요.');
      console.error('Chat error:', err);
    }
  },

  // ========== UI 렌더링 ==========

  addMessage(role, content) {
    const container = document.getElementById('chat-messages');
    const label = role === 'user' ? this.displayName : 'Aletheia';

    const msgEl = document.createElement('div');
    msgEl.className = `message ${role}`;
    msgEl.innerHTML = `
      <span class="message-label">${label}</span>
      <div class="message-bubble">${this.escapeHtml(content)}</div>
    `;

    container.appendChild(msgEl);
    this.scrollToBottom();
  },

  showTyping() {
    const container = document.getElementById('chat-messages');
    const existing = document.getElementById('typing');
    if (existing) return;

    const el = document.createElement('div');
    el.id = 'typing';
    el.className = 'message assistant';
    el.innerHTML = `
      <span class="message-label">Aletheia</span>
      <div class="typing-indicator"><span></span><span></span><span></span></div>
    `;
    container.appendChild(el);
    this.scrollToBottom();
  },

  hideTyping() {
    const el = document.getElementById('typing');
    if (el) el.remove();
  },

  scrollToBottom() {
    const area = document.getElementById('chat-area');
    setTimeout(() => {
      area.scrollTop = area.scrollHeight;
    }, 50);
  },

  // ========== Exchange Counter ==========

  updateCounter() {
    const fill = document.getElementById('counter-fill');
    const text = document.getElementById('counter-text');
    const btn = document.getElementById('essence-btn');

    text.textContent = this.exchangeCount;

    // 프로그레스 바 (threshold 기준)
    const progress = Math.min(100, (this.exchangeCount / this.essenceThreshold) * 100);
    fill.style.width = progress + '%';

    // Essence 버튼 활성화
    if (this.exchangeCount >= this.essenceThreshold) {
      btn.disabled = false;
      btn.title = 'Essence Snapshot 생성';
    }
  },

  // ========== Essence ==========

  async requestEssence() {
    const overlay = document.getElementById('essence-overlay');
    const content = document.getElementById('essence-content');

    // 로딩 표시
    content.innerHTML = `
      <div class="essence-loading">
        <p>당신의 이야기를 분석하고 있습니다...</p>
        <div class="loading-dots"><span></span><span></span><span></span></div>
      </div>
    `;
    overlay.classList.add('active');

    try {
      // 먼저 추출 실행
      await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          mode: 'extract',
        }),
      });

      // Essence Document 생성
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          mode: 'essence',
        }),
      });

      const data = await res.json();

      if (data.status === 'insufficient') {
        content.innerHTML = `
          <div class="essence-loading">
            <p>${data.message}</p>
            <p style="margin-top: 12px; font-size: 0.8rem; color: var(--text-muted);">
              현재 ${data.exchange_count}회 교환 · 최소 ${data.minimum_needed}회 필요
            </p>
          </div>
        `;
      } else if (data.status === 'success' && data.document) {
        content.innerHTML = this.renderMarkdown(data.document);
      } else {
        content.innerHTML = `
          <div class="essence-loading">
            <p>생성 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.</p>
          </div>
        `;
      }
    } catch (err) {
      console.error('Essence error:', err);
      content.innerHTML = `
        <div class="essence-loading">
          <p>연결이 불안정합니다. 다시 시도해주세요.</p>
        </div>
      `;
    }
  },

  closeEssence() {
    document.getElementById('essence-overlay').classList.remove('active');
  },

  // ========== 유틸리티 ==========

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

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
  },

  renderMarkdown(md) {
    // 간단한 마크다운 → HTML 변환
    return md
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^---$/gm, '<hr>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^(.+)$/gm, (match) => {
        if (match.startsWith('<')) return match;
        return `<p>${match}</p>`;
      });
  },

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
  },
};

// Enter 키로 시작
document.getElementById('nickname-input')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') app.start();
});
