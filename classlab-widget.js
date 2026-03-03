/**
 * ClassLab Widget for Canvas LMS
 * Floating widget that embeds ClassLab.app simulator
 * 
 * Usage: Add this script to Canvas LMS via Theme Editor > Custom JavaScript
 * Or inject via: <script src="classlab-widget.js"><\/script>
 */
(function() {
  'use strict';

  const CLASSLAB_URL = 'https://classlab.app';
  const WIDGET_ID = 'classlab-widget-container';

  // ========================================
  // CONFIGURACIÓN: IDs de cursos permitidos
  // Dejar vacío [] para mostrar en TODOS los cursos
  // Ejemplo: ['12345', '67890']
  // ========================================
  const ALLOWED_COURSE_IDS = [];

  // Don't initialize twice
  if (document.getElementById(WIDGET_ID)) return;

  // Course filter: only show widget on matching course pages
  if (ALLOWED_COURSE_IDS.length > 0) {
    const courseMatch = window.location.pathname.match(/\/courses\/(\d+)/);
    if (!courseMatch || !ALLOWED_COURSE_IDS.includes(courseMatch[1])) return;
  }

  // CSS
  const style = document.createElement('style');
  style.textContent = `
    #${WIDGET_ID} {
      position: fixed;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Minimized state - positioned after Canvas left nav */
    #${WIDGET_ID}.minimized {
      left: 90px;
      top: 50%;
      transform: translateY(-50%);
      width: 64px;
      height: auto;
    }

    /* Expanded state - fills right of Canvas sidebar */
    #${WIDGET_ID}.expanded {
      left: 0;
      top: 0;
      width: 100%;
      height: 100vh;
      background: rgba(0,0,0,0.5);
    }

    /* Minimized widget button */
    .classlab-mini {
      width: 64px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 10px 6px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
      border: none;
      color: white;
      transition: transform 0.2s, box-shadow 0.2s;
      animation: classlab-pulse 3s ease-in-out infinite;
    }

    .classlab-mini:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 28px rgba(99, 102, 241, 0.6);
    }

    .classlab-mini-icon {
      width: 40px;
      height: 40px;
      background: rgba(255,255,255,0.2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
    }

    .classlab-mini-label {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      line-height: 1.2;
      text-align: center;
    }

    .classlab-mini-cta {
      font-size: 7px;
      opacity: 0.85;
      text-align: center;
      line-height: 1.3;
    }

    @keyframes classlab-pulse {
      0%, 100% { box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4); }
      50% { box-shadow: 0 4px 30px rgba(99, 102, 241, 0.7); }
    }

    /* Expanded panel */
    .classlab-panel {
      position: absolute;
      right: 0;
      top: 0;
      height: 100vh;
      background: #fff;
      box-shadow: -4px 0 30px rgba(0,0,0,0.2);
      display: flex;
      flex-direction: column;
      transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Account for Canvas left nav (~80px collapsed, ~260px expanded) */
    .classlab-panel {
      width: calc(100% - 80px);
    }

    @media (min-width: 1200px) {
      .classlab-panel {
        width: calc(100% - 80px);
      }
    }

    .classlab-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 20px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      min-height: 48px;
    }

    .classlab-panel-title {
      font-size: 16px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .classlab-panel-close {
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .classlab-panel-close:hover {
      background: rgba(255,255,255,0.35);
    }

    .classlab-iframe-wrap {
      flex: 1;
      overflow: hidden;
    }

    .classlab-iframe-wrap iframe {
      width: 100%;
      height: 100%;
      border: none;
    }

    /* Hide minimized button when expanded */
    #${WIDGET_ID}.expanded .classlab-mini { display: none; }
    #${WIDGET_ID}.minimized .classlab-panel { display: none; }
  `;
  document.head.appendChild(style);

  // Container
  const container = document.createElement('div');
  container.id = WIDGET_ID;
  container.className = 'minimized';

  // Minimized widget
  const mini = document.createElement('button');
  mini.className = 'classlab-mini';
  mini.setAttribute('aria-label', 'Abrir ClassLab - Simulador de Clases');
  mini.innerHTML = `
    <div class="classlab-mini-icon">🎓</div>
    <div class="classlab-mini-label">ClassLab</div>
    <div class="classlab-mini-cta">¡Practica tu clase!</div>
  `;
  mini.addEventListener('click', () => expand());

  // Expanded panel
  const panel = document.createElement('div');
  panel.className = 'classlab-panel';
  panel.innerHTML = `
    <div class="classlab-panel-header">
      <div class="classlab-panel-title">🎓 ClassLab — Simulador de Clases</div>
      <button class="classlab-panel-close" aria-label="Cerrar simulador">✕</button>
    </div>
    <div class="classlab-iframe-wrap">
      <iframe id="classlab-iframe" title="ClassLab Simulator" allow="microphone; camera; display-capture" loading="lazy"></iframe>
    </div>
  `;

  panel.querySelector('.classlab-panel-close').addEventListener('click', () => collapse());

  container.appendChild(mini);
  container.appendChild(panel);
  document.body.appendChild(container);

  // Close on backdrop click
  container.addEventListener('click', (e) => {
    if (e.target === container && container.classList.contains('expanded')) {
      collapse();
    }
  });

  // ESC to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && container.classList.contains('expanded')) {
      collapse();
    }
  });

  let iframeLoaded = false;

  function expand() {
    const iframe = document.getElementById('classlab-iframe');
    if (!iframeLoaded) {
      iframe.src = CLASSLAB_URL;
      iframeLoaded = true;
    }
    container.className = 'expanded';
  }

  function collapse() {
    container.className = 'minimized';
  }

  // Public API
  window.ClassLabWidget = {
    open: expand,
    close: collapse,
    setUrl: function(url) {
      const iframe = document.getElementById('classlab-iframe');
      iframe.src = url;
      iframeLoaded = true;
    }
  };
})();
