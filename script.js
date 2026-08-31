(function(){
  "use strict";

  /* ---------- Tab navigation ---------- */
  var tabButtons = document.querySelectorAll('[data-tab]');
  var panels = document.querySelectorAll('[data-panel]');
  var gotoButtons = document.querySelectorAll('[data-goto]');
  var drawer = document.getElementById('mobileDrawer');
  var hamburger = document.getElementById('hamburger');

  function activateTab(name){
    tabButtons.forEach(function(btn){
      btn.classList.toggle('is-active', btn.getAttribute('data-tab') === name);
    });
    panels.forEach(function(panel){
      panel.classList.toggle('is-active', panel.getAttribute('data-panel') === name);
    });
    if (drawer) drawer.classList.remove('is-open');
    if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  tabButtons.forEach(function(btn){
    btn.addEventListener('click', function(){
      activateTab(btn.getAttribute('data-tab'));
    });
  });

  gotoButtons.forEach(function(btn){
    btn.addEventListener('click', function(){
      var target = btn.getAttribute('data-goto');
      if (target === 'signup'){
        openModal('signup');
      } else {
        activateTab(target);
      }
    });
  });

  /* ---------- Mobile drawer ---------- */
  if (hamburger){
    hamburger.addEventListener('click', function(){
      var isOpen = drawer.classList.toggle('is-open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });
  }

  /* ---------- Auth modal ---------- */
  var overlay = document.getElementById('modalOverlay');
  var modalClose = document.getElementById('modalClose');
  var switchButtons = document.querySelectorAll('[data-authtab]');
  var forms = document.querySelectorAll('.auth-form');

  function openModal(which){
    overlay.classList.add('is-open');
    setAuthTab(which || 'login');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  function setAuthTab(which){
    switchButtons.forEach(function(btn){
      if (btn.hasAttribute('data-authtab')){
        btn.classList.toggle('is-active', btn.getAttribute('data-authtab') === which);
      }
    });
    forms.forEach(function(f){
      f.classList.toggle('is-active', f.getAttribute('data-form') === which);
    });
  }

  ['openLogin','openLoginMobile'].forEach(function(id){
    var el = document.getElementById(id);
    if (el) el.addEventListener('click', function(){ openModal('login'); });
  });
  ['openSignup','openSignupMobile','heroSignup'].forEach(function(id){
    var el = document.getElementById(id);
    if (el) el.addEventListener('click', function(){ openModal('signup'); });
  });

  switchButtons.forEach(function(btn){
    btn.addEventListener('click', function(){ setAuthTab(btn.getAttribute('data-authtab')); });
  });

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (overlay){
    overlay.addEventListener('click', function(e){
      if (e.target === overlay) closeModal();
    });
  }
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') closeModal();
  });

  /* ---------- Toast ---------- */
  var toast = document.getElementById('toast');
  var toastTimer = null;
  function showToast(message){
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-shown');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toast.classList.remove('is-shown'); }, 3200);
  }

  /* ---------- Forms (demo only — no backend wired up) ---------- */
  var loginForm = document.getElementById('loginForm');
  var signupForm = document.getElementById('signupForm');

  if (loginForm){
    loginForm.addEventListener('submit', function(e){
      e.preventDefault();
      closeModal();
      showToast('Logged in — welcome back, Scout.');
      loginForm.reset();
    });
  }
  if (signupForm){
    signupForm.addEventListener('submit', function(e){
      e.preventDefault();
      var name = signupForm.querySelector('[name="fullname"]').value.trim() || 'Scout';
      closeModal();
      showToast('Account created — welcome, ' + name + '.');
      signupForm.reset();
    });
  }

  /* ---------- Deep-link support: #leaders, #books etc. ---------- */
  var hash = window.location.hash.replace('#','');
  var validTabs = ['home','leaders','promotions','books','leaks'];
  if (validTabs.indexOf(hash) !== -1){
    activateTab(hash);
  }
})();
