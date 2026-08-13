// ============================================================
// VENZA — interactions
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- mobile nav toggle ---------- */
  const navToggle = document.querySelector('.nav-toggle');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      document.body.classList.toggle('nav-open');
      navToggle.classList.toggle('is-open');
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
    });
    document.querySelectorAll('.mobile-panel a').forEach(a => {
      a.addEventListener('click', () => {
        document.body.classList.remove('nav-open');
        navToggle.classList.remove('is-open');
      });
    });
  }

  /* ---------- accordion (FAQ) ---------- */
  document.querySelectorAll('.acc-item').forEach(item => {
    const trigger = item.querySelector('.acc-trigger');
    const panel = item.querySelector('.acc-panel');
    if (!trigger || !panel) return;
    if (item.classList.contains('open')) {
      panel.style.maxHeight = panel.scrollHeight + 'px';
    }
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // close siblings within the same accordion
      const parentAcc = item.closest('.accordion');
      if (parentAcc) {
        parentAcc.querySelectorAll('.acc-item.open').forEach(sib => {
          if (sib !== item) {
            sib.classList.remove('open');
            const sp = sib.querySelector('.acc-panel');
            if (sp) sp.style.maxHeight = null;
            sib.querySelector('.acc-trigger').setAttribute('aria-expanded', 'false');
          }
        });
      }
      item.classList.toggle('open', !isOpen);
      trigger.setAttribute('aria-expanded', String(!isOpen));
      panel.style.maxHeight = !isOpen ? panel.scrollHeight + 'px' : null;
    });
  });

  /* ---------- tabs ---------- */
  document.querySelectorAll('.tabbar').forEach(bar => {
    const group = bar.dataset.tabgroup;
    const buttons = bar.querySelectorAll('.tabbtn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll(`.tabpanel[data-tabgroup="${group}"]`).forEach(p => {
          p.classList.toggle('active', p.dataset.tab === btn.dataset.tab);
        });
      });
    });
  });

  /* ---------- filter pills (emprendimientos) ---------- */
  const filterBar = document.querySelector('.filter-bar');
  if (filterBar) {
    const pills = filterBar.querySelectorAll('.pill[data-filter]');
    const cards = document.querySelectorAll('.venture-card');
    const countEl = document.querySelector('[data-result-count]');

    function applyFilter(filter) {
      let visible = 0;
      cards.forEach(card => {
        const match = filter === 'todos' || card.dataset.category === filter;
        card.style.display = match ? '' : 'none';
        if (match) visible++;
      });
      if (countEl) countEl.textContent = visible;
    }

    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        applyFilter(pill.dataset.filter);
      });
    });

    // sort toggle
    const sortPills = document.querySelectorAll('.pill[data-sort]');
    const grid = document.querySelector('.card-grid');
    sortPills.forEach(pill => {
      pill.addEventListener('click', () => {
        sortPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const mode = pill.dataset.sort;
        const cardArr = Array.from(cards);
        cardArr.sort((a, b) => {
          if (mode === 'meta') return parseFloat(b.dataset.progress) - parseFloat(a.dataset.progress);
          if (mode === 'nuevos') return parseInt(b.dataset.newest) - parseInt(a.dataset.newest);
          return 0;
        });
        cardArr.forEach(c => grid.appendChild(c));
      });
    });

    applyFilter('todos');
  }

  /* ---------- modal (venture detail) ---------- */
  const overlay = document.querySelector('.modal-overlay');
  if (overlay) {
    const modalThumb = overlay.querySelector('.modal-thumb');
    const modalBody = overlay.querySelector('.modal-body');
    const closeBtn = overlay.querySelector('.modal-close');

    document.querySelectorAll('[data-open-modal]').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const card = trigger.closest('.venture-card');
        if (!card) return;
        const name = card.querySelector('h3').textContent;
        const cat = card.querySelector('.venture-thumb .tag')?.textContent || '';
        const desc = card.querySelector('p')?.textContent || '';
        const progress = card.dataset.progress || '0';
        const views = card.dataset.views || '—';
        const sales = card.dataset.sales || '—';
        const bg = getComputedStyle(card.querySelector('.venture-thumb')).backgroundImage;
        const featured = card.classList.contains('is-featured');

        modalThumb.style.backgroundImage = bg;
        modalThumb.innerHTML = `<button class="modal-close" aria-label="Cerrar">&times;</button>` +
          (featured ? '<span class="venture-badge" style="top:auto;bottom:12px;right:12px;">Destacado</span>' : '');

        modalBody.innerHTML = `
          <span class="badge-inline">${cat}</span>
          <h3>${name}</h3>
          <p>${desc}</p>
          <div class="progress-row">
            <div class="progress-label"><span>Progreso hacia la meta</span><b>${progress}%</b></div>
            <div class="progress"><i style="width:${progress}%"></i></div>
          </div>
          <div class="venture-meta" style="font-size:0.82rem;">
            <span>👁 ${views} vistas</span>
            <span>🛒 ${sales} ventas</span>
          </div>
          <div class="hero-actions" style="margin-top:6px;">
            <button class="btn btn-grad btn-sm" type="button" disabled>Visitar tienda — próximamente</button>
            <a class="btn btn-ghost btn-sm" href="contacto.html">Quiero apoyar este emprendimiento</a>
          </div>
        `;
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
        overlay.querySelector('.modal-close').addEventListener('click', closeModal);
      });
    });

    function closeModal() {
      overlay.classList.remove('show');
      document.body.style.overflow = '';
    }
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  }

  /* ---------- commission calculator ---------- */
  const calcInput = document.querySelector('#calc-amount');
  if (calcInput) {
    const rateInput = document.querySelector('#calc-rate');
    const rateOut = document.querySelector('#calc-rate-out');
    const outVenza = document.querySelector('#calc-out-venza');
    const outTuyo = document.querySelector('#calc-out-tuyo');

    function fmt(n) {
      return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
    }
    function recalc() {
      const amount = Math.max(0, parseFloat(calcInput.value) || 0);
      const rate = rateInput ? parseFloat(rateInput.value) : 6;
      if (rateOut) rateOut.textContent = rate.toFixed(1) + '%';
      const fee = amount * (rate / 100);
      const net = amount - fee;
      if (outVenza) outVenza.textContent = fmt(fee);
      if (outTuyo) outTuyo.textContent = fmt(net);
    }
    calcInput.addEventListener('input', recalc);
    if (rateInput) rateInput.addEventListener('input', recalc);
    recalc();
  }

  /* ---------- contact form ---------- */
  const form = document.querySelector('#apply-form');
  if (form) {
    const successPanel = document.querySelector('#form-success');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      form.querySelectorAll('[required]').forEach(input => {
        const field = input.closest('.field');
        let ok = true;
        if (input.type === 'checkbox') {
          ok = input.checked;
        } else {
          ok = input.value.trim().length > 0;
          if (ok && input.type === 'email') {
            ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
          }
        }
        if (field) field.classList.toggle('error', !ok);
        if (!ok) valid = false;
      });

      if (!valid) {
        const firstError = form.querySelector('.field.error');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      form.style.display = 'none';
      if (successPanel) {
        successPanel.classList.add('show');
        successPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    form.querySelectorAll('input, select, textarea').forEach(input => {
      input.addEventListener('input', () => {
        const field = input.closest('.field');
        if (field) field.classList.remove('error');
      });
    });
  }

  /* ---------- reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'none';
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(18px)';
      el.style.transition = 'opacity .6s ease, transform .6s ease';
      io.observe(el);
    });
  }

});
