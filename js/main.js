/**
 * Debt Book Z: Landing Page Interactive Scripts
 * Pure vanilla JavaScript, zero external dependencies, XSS-safe.
 */

let currentLang = 'en';
let activeMockupScreen = 'overview';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLanguage();
  initMockupSwitcher();
  initLoanCalculator();
  initFaqAccordion();
  initMobileDrawer();
});

/**
 * 1. Theme Management (Light / Dark Mode)
 */
function initTheme() {
  const themeToggles = document.querySelectorAll('.theme-toggle-btn, #theme-toggle');
  const storedTheme = localStorage.getItem('debtbookz_theme');
  const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  let currentTheme = storedTheme || (systemPrefersDark ? 'dark' : 'light');
  applyTheme(currentTheme);

  themeToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(currentTheme);
      localStorage.setItem('debtbookz_theme', currentTheme);
    });
  });

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeToggles.forEach(btn => {
      const sunIcon = btn.querySelector('.icon-sun');
      const moonIcon = btn.querySelector('.icon-moon');
      if (sunIcon && moonIcon) {
        if (theme === 'dark') {
          sunIcon.style.display = 'block';
          moonIcon.style.display = 'none';
          btn.setAttribute('aria-label', currentLang === 'vi' ? 'Chuyển sang giao diện sáng' : 'Switch to light mode');
        } else {
          sunIcon.style.display = 'none';
          moonIcon.style.display = 'block';
          btn.setAttribute('aria-label', currentLang === 'vi' ? 'Chuyển sang giao diện tối' : 'Switch to dark mode');
        }
      }
    });
  }
}

/**
 * 2. Language Management (9 Languages)
 */
function initLanguage() {
  const langBtn = document.getElementById('lang-btn');
  const langDropdown = document.getElementById('lang-dropdown');
  const langFlagEl = document.getElementById('lang-flag');
  const langNameEl = document.getElementById('lang-name');

  // Default language is English ('en') unless explicitly selected by user
  const storedUserLang = localStorage.getItem('debtbookz_user_lang');

  if (storedUserLang && TRANSLATIONS[storedUserLang]) {
    currentLang = storedUserLang;
  } else {
    currentLang = 'en';
  }

  // Populate dropdown options
  if (langDropdown) {
    langDropdown.innerHTML = '';
    Object.keys(TRANSLATIONS).forEach(code => {
      const lang = TRANSLATIONS[code];
      const opt = document.createElement('button');
      opt.type = 'button';
      opt.className = 'lang-option' + (code === currentLang ? ' active' : '');
      opt.setAttribute('data-lang', code);
      opt.innerHTML = `<span style="font-size:1.1rem;">${lang.flag}</span> <span>${lang.langName}</span>`;

      opt.addEventListener('click', () => {
        setLanguage(code, true);
        langDropdown.classList.remove('active');
      });

      langDropdown.appendChild(opt);
    });
  }

  // Toggle dropdown
  if (langBtn && langDropdown) {
    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langDropdown.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!langBtn.contains(e.target) && !langDropdown.contains(e.target)) {
        langDropdown.classList.remove('active');
      }
    });
  }

  // Apply default language without overriding explicit user preference
  setLanguage(currentLang, false);

  function setLanguage(langCode, savePreference = false) {
    if (!TRANSLATIONS[langCode]) return;
    currentLang = langCode;
    if (savePreference) {
      localStorage.setItem('debtbookz_user_lang', langCode);
    }

    const t = TRANSLATIONS[langCode];

    // Document tags
    document.documentElement.lang = langCode;
    document.title = t.pageTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', t.pageDesc);

    // Navbar language button
    if (langFlagEl) langFlagEl.textContent = t.flag;
    if (langNameEl) langNameEl.textContent = t.langName;

    // Dropdown active states
    if (langDropdown) {
      langDropdown.querySelectorAll('.lang-option').forEach(el => {
        el.classList.toggle('active', el.getAttribute('data-lang') === langCode);
      });
    }

    // Update all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = getNestedTranslation(t, key);
      if (val !== undefined && val !== null) {
        el.textContent = val;
      }
    });

    // Update Hero Title with highlight
    const heroTitleEl = document.getElementById('hero-main-title');
    if (heroTitleEl && t.hero) {
      heroTitleEl.innerHTML = `${t.hero.title} <span class="hero-highlight-word">${t.hero.titleHighlight}</span>`;
    }

    // Update currency suffix and default amount in loan calculator if present
    const amountSuffixEl = document.getElementById('calc-amount-suffix');
    if (amountSuffixEl) {
      const currMap = {
        en: 'USD',
        vi: 'VND',
        zh: 'CNY',
        es: 'EUR',
        ja: 'JPY',
        ko: 'KRW',
        fr: 'EUR',
        pt: 'BRL',
        hi: 'INR'
      };
      amountSuffixEl.textContent = currMap[langCode] || 'USD';
    }

    const amountInput = document.getElementById('calc-amount');
    if (amountInput) {
      if (langCode === 'vi' && (amountInput.value === '10000' || amountInput.value === '5000')) {
        amountInput.value = '50000000';
        amountInput.step = '5000000';
        amountInput.min = '1000000';
      } else if (langCode !== 'vi' && (amountInput.value === '50000000' || amountInput.value === '5000000')) {
        amountInput.value = '10000';
        amountInput.step = '1000';
        amountInput.min = '100';
      }
    }

    // Re-render active phone mockup screen with new language
    renderPhoneScreen(activeMockupScreen);

    // Re-calculate loan values if calculator is present
    if (typeof window.recalculateLoan === 'function') {
      window.recalculateLoan();
    }
  }
}

function getNestedTranslation(obj, path) {
  return path.split('.').reduce((prev, curr) => (prev ? prev[curr] : null), obj);
}

/**
 * 3. Interactive Phone Mockup Tab Switcher
 */
function initMockupSwitcher() {
  const tabButtons = document.querySelectorAll('.mockup-tab-btn');
  const navButtons = document.querySelectorAll('.phone-nav-btn');

  // Outer switcher tabs
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      switchScreen(target);
    });
  });

  // Phone inner nav buttons
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-nav');
      switchScreen(target);
    });
  });

  // Initial render
  switchScreen('overview');
}

function switchScreen(screenKey) {
  activeMockupScreen = screenKey;
  renderPhoneScreen(screenKey);

  const tabButtons = document.querySelectorAll('.mockup-tab-btn');
  const navButtons = document.querySelectorAll('.phone-nav-btn');

  tabButtons.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-target') === screenKey);
  });

  navButtons.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-nav') === screenKey);
  });
}

function renderPhoneScreen(screenKey) {
  const container = document.getElementById('phone-screen-content');
  if (!container) return;

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const m = t.mockup;

  const screenRenderers = {
    overview: `
      <div class="phone-app-header">
        <div class="phone-brand-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="4" width="20" height="16" rx="4"></rect>
            <path d="M16 12h.01"></path>
          </svg>
          Debt Book Z
        </div>
        <div class="phone-currency-pill">${m.currency}</div>
      </div>

      <!-- Net Balance Highlight Card -->
      <div class="app-card-highlight">
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; opacity:0.85;">
          <span>${m.net}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 20V10M12 20V4M6 20v-6"></path>
          </svg>
        </div>
        <div class="tabular-nums" style="font-size:24px; font-weight:800; margin: 4px 0 8px;">${m.netValue}</div>
        <div style="display:flex; align-items:center; gap:6px; font-size:11px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          <span>${m.localOnly}</span>
        </div>
      </div>

      <!-- Lent & Borrowed Tiles -->
      <div class="app-balance-row">
        <div class="app-balance-card">
          <div style="font-size:11px; color:var(--text-secondary); display:flex; align-items:center; gap:4px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
            ${m.lent}
          </div>
          <div class="tabular-nums" style="font-size:15px; font-weight:700; color:var(--success);">${m.lentValue}</div>
        </div>
        <div class="app-balance-card">
          <div style="font-size:11px; color:var(--text-secondary); display:flex; align-items:center; gap:4px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 19V5M5 12l7-7 7 7"/>
            </svg>
            ${m.borrowed}
          </div>
          <div class="tabular-nums" style="font-size:15px; font-weight:700; color:var(--warning);">${m.borrowedValue}</div>
        </div>
      </div>

      <!-- Main Action Button -->
      <div class="app-btn-main">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span>${m.addDebt}</span>
      </div>

      <!-- Upcoming Items -->
      <div style="font-size:12px; font-weight:700; margin-top:2px;">${m.upcomingTitle}</div>
      <div class="app-item-row">
        <div>
          <div style="font-weight:700; font-size:12px;">${m.item1Name}</div>
          <div style="font-size:11px; color:var(--text-secondary);">${m.item1Desc}</div>
        </div>
        <div class="tabular-nums" style="font-weight:700; font-size:13px; text-align:right;">
          ${m.item1Amount}
          <div style="font-size:10px; color:var(--success); font-weight:600;">${m.item1Sub}</div>
        </div>
      </div>
      <div class="app-item-row">
        <div>
          <div style="font-weight:700; font-size:12px;">${m.item2Name}</div>
          <div style="font-size:11px; color:var(--text-secondary);">${m.item2Desc}</div>
        </div>
        <div class="tabular-nums" style="font-weight:700; font-size:13px; color:var(--warning);">
          ${m.item2Amount}
        </div>
      </div>
    `,
    debts: `
      <div class="phone-app-header">
        <div class="phone-brand-title">${m.nav.debts}</div>
        <div class="phone-currency-pill">${m.currency}</div>
      </div>

      <!-- Filter chips -->
      <div style="display:flex; gap:6px; overflow-x:auto; padding-bottom:2px;">
        <span style="background:var(--primary); color:var(--text-inverse); padding:4px 10px; border-radius:12px; font-size:10px; font-weight:600;">${m.filterAll}</span>
        <span style="background:var(--surface); padding:4px 10px; border-radius:12px; font-size:10px; font-weight:600; border:1px solid var(--border);">${m.filterUnpaid}</span>
        <span style="background:var(--surface); padding:4px 10px; border-radius:12px; font-size:10px; font-weight:600; border:1px solid var(--border);">${m.filterPartial}</span>
      </div>

      <!-- List items -->
      <div class="app-item-row" style="flex-direction:column; align-items:stretch; gap:6px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="font-weight:700; font-size:12px;">${m.item1Name}</div>
          <span style="background:var(--success-soft); color:var(--success); font-size:10px; padding:2px 8px; border-radius:10px; font-weight:700;">${m.tagLent}</span>
        </div>
        <div style="font-size:11px; color:var(--text-secondary);">${m.item1Desc}</div>
        <div style="background:var(--surface-secondary); height:6px; border-radius:3px; overflow:hidden;">
          <div style="background:var(--success); width:60%; height:100%;"></div>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:11px;" class="tabular-nums">
          <span style="color:var(--text-secondary);">${m.item1Sub}</span>
          <span style="font-weight:700;">${m.item1Amount}</span>
        </div>
      </div>

      <div class="app-item-row" style="flex-direction:column; align-items:stretch; gap:6px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="font-weight:700; font-size:12px;">${m.item2Name}</div>
          <span style="background:var(--warning-soft); color:var(--warning); font-size:10px; padding:2px 8px; border-radius:10px; font-weight:700;">${m.tagBorrowed}</span>
        </div>
        <div style="font-size:11px; color:var(--text-secondary);">${m.item2Desc}</div>
        <div style="display:flex; justify-content:space-between; font-size:11px;" class="tabular-nums">
          <span style="color:var(--warning); font-weight:600;">${m.filterUnpaid}</span>
          <span style="font-weight:700;">${m.item2Amount}</span>
        </div>
      </div>

      <div class="app-item-row" style="flex-direction:column; align-items:stretch; gap:6px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="font-weight:700; font-size:12px;">Elena</div>
          <span style="background:var(--surface-secondary); color:var(--text-muted); font-size:10px; padding:2px 8px; border-radius:10px; font-weight:700;">${m.tagSettled}</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:11px;" class="tabular-nums">
          <span style="color:var(--success); font-weight:600;">${m.settledText}</span>
          <span style="text-decoration:line-through; color:var(--text-muted);">$85.00</span>
        </div>
      </div>
    `,
    banking: `
      <div class="phone-app-header">
        <div class="phone-brand-title">${m.nav.banking}</div>
        <div class="phone-currency-pill">${m.currency}</div>
      </div>

      <div class="app-card" style="border-left: 4px solid var(--highlight);">
        <div style="display:flex; justify-content:space-between;">
          <div style="font-weight:700; font-size:13px;">${m.loanHouseTitle}</div>
          <span style="font-size:11px; background:var(--surface-secondary); padding:2px 6px; border-radius:8px;">${m.loanHouseRate}</span>
        </div>
        <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">${m.loanHouseDesc}</div>
        <div style="margin-top:10px; padding-top:8px; border-top:1px solid var(--divider); display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:11px; color:var(--text-secondary);">${m.loanHouseMonthly}</span>
          <span class="tabular-nums" style="font-size:14px; font-weight:700;">${m.netValue}</span>
        </div>
      </div>

      <div class="app-card">
        <div style="display:flex; justify-content:space-between;">
          <div style="font-weight:700; font-size:13px;">${m.savingsTitle}</div>
          <span style="font-size:11px; background:var(--success-soft); color:var(--success); padding:2px 6px; border-radius:8px; font-weight:700;">${m.savingsRate}</span>
        </div>
        <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">${m.savingsDesc}</div>
        <div style="margin-top:10px; padding-top:8px; border-top:1px solid var(--divider); display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:11px; color:var(--text-secondary);">${m.savingsInterest}</span>
          <span class="tabular-nums" style="font-size:14px; font-weight:700; color:var(--success);">+${m.borrowedValue}</span>
        </div>
      </div>
    `,
    analysis: `
      <div class="phone-app-header">
        <div class="phone-brand-title">${m.nav.analysis}</div>
        <div class="phone-currency-pill">${m.currency}</div>
      </div>

      <div class="app-card">
        <div style="font-size:11px; color:var(--text-secondary);">${m.recoveryLabel}</div>
        <div style="display:flex; justify-content:space-between; align-items:flex-end; margin: 4px 0 8px;">
          <span class="tabular-nums" style="font-size:22px; font-weight:800; color:var(--success);">${m.recoveryValue}</span>
          <span style="font-size:11px; color:var(--text-secondary);">${m.recoveryRatio}</span>
        </div>
        <div style="background:var(--surface-secondary); height:8px; border-radius:4px; overflow:hidden;">
          <div style="background:var(--success); width:84%; height:100%;"></div>
        </div>
      </div>

      <div class="app-card">
        <div style="font-size:12px; font-weight:700; margin-bottom:8px;">${m.compositionTitle}</div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; justify-content:space-between; font-size:11px;" class="tabular-nums">
            <span>${m.item1Name}</span>
            <span style="font-weight:700;">45% (${m.item1Amount})</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:11px;" class="tabular-nums">
            <span>${m.item2Name}</span>
            <span style="font-weight:700;">30% (${m.item2Amount})</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:11px;" class="tabular-nums">
            <span>${m.other}</span>
            <span style="font-weight:700;">25%</span>
          </div>
        </div>
      </div>
    `
  };

  container.innerHTML = screenRenderers[screenKey] || screenRenderers.overview;
}

/**
 * 4. Interactive Loan Calculator (Sanitized, Safe & Multilingual)
 */
function initLoanCalculator() {
  const amountInput = document.getElementById('calc-amount');
  const rateInput = document.getElementById('calc-rate');
  const termInput = document.getElementById('calc-term');
  const methodButtons = document.querySelectorAll('.method-btn');

  const monthlyOut = document.getElementById('calc-result-monthly');
  const interestOut = document.getElementById('calc-result-interest');
  const totalOut = document.getElementById('calc-result-total');

  if (!amountInput || !rateInput || !termInput || !monthlyOut) return;

  let currentMethod = 'annuity'; // 'annuity' or 'declining'

  methodButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      methodButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMethod = btn.getAttribute('data-method');
      calculate();
    });
  });

  [amountInput, rateInput, termInput].forEach(input => {
    input.addEventListener('input', calculate);
  });

  function formatCurrency(value) {
    const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
    const rounded = Math.round(value);

    // Format based on current language
    const localeMap = {
      vi: { locale: 'vi-VN', suffix: ' ₫' },
      en: { locale: 'en-US', prefix: '$' },
      zh: { locale: 'zh-CN', prefix: '¥' },
      es: { locale: 'es-ES', suffix: ' €' },
      ja: { locale: 'ja-JP', prefix: '¥' },
      ko: { locale: 'ko-KR', prefix: '₩' },
      fr: { locale: 'fr-FR', suffix: ' €' },
      pt: { locale: 'pt-BR', prefix: 'R$ ' },
      hi: { locale: 'hi-IN', prefix: '₹' }
    };

    const conf = localeMap[currentLang] || localeMap.en;
    const formatted = new Intl.NumberFormat(conf.locale).format(rounded);

    return (conf.prefix || '') + formatted + (conf.suffix || '');
  }

  function calculate() {
    const rawAmount = parseFloat(amountInput.value) || 0;
    const rawRate = parseFloat(rateInput.value) || 0;
    const rawTerm = parseInt(termInput.value, 10) || 1;

    // Boundary protections
    const principal = Math.max(0, Math.min(rawAmount, 100000000000));
    const annualRate = Math.max(0, Math.min(rawRate, 100));
    const months = Math.max(1, Math.min(rawTerm, 360));

    const r = (annualRate / 100) / 12;

    let monthlyPayment = 0;
    let totalInterest = 0;
    let totalPayment = 0;

    const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
    const firstMonthSuffix = (t.calculator && t.calculator.firstMonthSuffix) || ' (1st month)';

    if (currentMethod === 'annuity') {
      if (r === 0) {
        monthlyPayment = principal / months;
        totalInterest = 0;
      } else {
        monthlyPayment = (principal * r) / (1 - Math.pow(1 + r, -months));
        totalInterest = (monthlyPayment * months) - principal;
      }
      totalPayment = principal + totalInterest;

      monthlyOut.textContent = formatCurrency(monthlyPayment);
    } else {
      const monthlyPrincipal = principal / months;
      const firstMonthInterest = principal * r;
      const firstMonthTotal = monthlyPrincipal + firstMonthInterest;

      totalInterest = (principal * r * (months + 1)) / 2;
      totalPayment = principal + totalInterest;

      monthlyOut.textContent = formatCurrency(firstMonthTotal) + firstMonthSuffix;
    }

    interestOut.textContent = formatCurrency(totalInterest);
    totalOut.textContent = formatCurrency(totalPayment);
  }

  // Expose for language re-renders
  window.recalculateLoan = calculate;

  // Initial calculation
  calculate();
}

/**
 * 5. FAQ Accordion
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all others
      faqItems.forEach(other => {
        other.classList.remove('active');
        const otherAns = other.querySelector('.faq-answer');
        if (otherAns) otherAns.style.maxHeight = null;
      });

      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 40 + 'px';
      }
    });
  });
}

/**
 * 6. Mobile Sidebar Drawer Navigation
 */
function initMobileDrawer() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const drawer = document.getElementById('mobile-drawer');
  const backdrop = document.getElementById('mobile-drawer-backdrop');
  const closeBtn = document.getElementById('drawer-close-btn');

  if (!menuBtn || !drawer || !backdrop) return;

  function openDrawer() {
    drawer.classList.add('active');
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  menuBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);

  // Close when clicking any nav link in drawer
  drawer.querySelectorAll('.drawer-nav-link, a').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // Close on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('active')) {
      closeDrawer();
    }
  });
}
