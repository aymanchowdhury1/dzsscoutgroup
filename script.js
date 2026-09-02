(function(){
  "use strict";

  /* ==========================================================
     ADMIN CREDENTIALS
     Change these before you deploy. Because this site has no
     server, the password check happens in the browser — fine
     for a small troop site, not for anything sensitive.
  ========================================================== */
  var ADMIN_EMAIL = 'admin@dinajpurscouts.org';
  var ADMIN_PASSWORD = 'ScoutAdmin1972';

  var STORAGE_KEYS = {
    auth: 'dzs_auth_v1',
    users: 'dzs_users_v1',
    posts: 'dzs_posts_v1'
  };

  /* ==========================================================
     STORAGE HELPERS  (falls back to in-memory if localStorage
     is blocked, e.g. inside a sandboxed preview)
  ========================================================== */
  var memoryStore = {};
  var storageWorks = (function(){
    try{
      var t = '__dzs_test__';
      window.localStorage.setItem(t, '1');
      window.localStorage.removeItem(t);
      return true;
    }catch(e){ return false; }
  })();

  function loadJSON(key, fallback){
    try{
      var raw = storageWorks ? window.localStorage.getItem(key) : memoryStore[key];
      return raw ? JSON.parse(raw) : fallback;
    }catch(e){ return fallback; }
  }
  function saveJSON(key, value){
    var raw = JSON.stringify(value);
    try{
      if (storageWorks){ window.localStorage.setItem(key, raw); }
      else { memoryStore[key] = raw; }
      return true;
    }catch(e){
      memoryStore[key] = raw;
      showToast('Saved for this session only — storage limit reached. Use links for large files.');
      return false;
    }
  }

  /* ==========================================================
     SEED DATA
  ========================================================== */
  function seedPosts(){
    return {
      leaders: [
        { id: 'l1', name: 'Md. Mizanur Kabir', description: 'Group Scout Leader. Steering the troop since 2016. Wood Badge holder, national jamboree contingent leader (2019).', image: '', pdf: '' },
        { id: 'l2', name: 'Rezaul Alam', description: 'Assistant Scout Leader. Runs pioneering and camp-craft. Fifteen years with the district scout council.', image: '', pdf: '' },
        { id: 'l3', name: 'Farzana Nasrin', description: 'Assistant Scout Leader. Leads first-aid and community service badge work; district first-aid trainer.', image: '', pdf: '' },
        { id: 'l4', name: 'Shahriar Hasan', description: 'Troop Leader, Senior Unit. Second-year troop leader, coordinating patrol rotations and inter-school events.', image: '', pdf: '' },
        { id: 'l5', name: 'Ayesha Islam', description: 'Patrol Leader, Falcon Patrol. Elected patrol leader; specialises in knotting and signalling instruction.', image: '', pdf: '' }
      ],
      promotions: [
        { id: 'p1', name: 'Apprentice Scout', description: 'Entry rank on joining the troop. Oath taken, uniform issued, patrol assigned.', image: '', pdf: '' },
        { id: 'p2', name: 'Second Class Scout', description: 'Tested on knotting, map & compass, first aid basics and troop history.', image: '', pdf: '' },
        { id: 'p3', name: 'First Class Scout', description: 'Pioneering, endurance hike, and a supervised service project in the community.', image: '', pdf: '' },
        { id: 'p4', name: 'Rover Scout', description: 'Senior rank for scouts aged 17+; district leadership training and mentoring duties begin here.', image: '', pdf: '' },
        { id: 'p5', name: "President's Rover Scout Award", description: "The group's highest honour — awarded to fewer than one scout per year, on record since 1972.", image: '', pdf: '' }
      ],
      books: [
        { id: 'b1', name: 'Bangladesh Scouts Handbook', description: 'National Council · Core Text. The foundational manual — oath, law, uniform standards and the full badge syllabus.', image: '', pdf: '' },
        { id: 'b2', name: 'Field Craft & Pioneering', description: 'Reference · Knots & Structures. Lashings, bridges, and camp construction, illustrated step by step.', image: '', pdf: '' },
        { id: 'b3', name: 'First Aid in the Field', description: 'Reference · Emergency Care. Triage basics, splinting, and evacuation procedure for camp and hike settings.', image: '', pdf: '' },
        { id: 'b4', name: 'Group Log, 1972–Present', description: 'Archive · Troop History. Bound minutes, camp registers and jamboree records since the founding year.', image: '', pdf: '' }
      ],
      leaks: [
        { id: 'k1', name: 'Monsoon camp site — rumor', description: "Word from the district office is that this year's monsoon camp may move to the Ramsagar site. Nothing signed yet.", image: '', pdf: '' },
        { id: 'k2', name: 'First Aid re-exam pushed back', description: "First Aid badge re-examinations have been pushed back one week to accommodate the school's mid-term schedule.", image: '', pdf: '' },
        { id: 'k3', name: 'New scarves have arrived', description: 'New uniform scarves have arrived at the troop store and will be issued at the next Saturday parade.', image: '', pdf: '' }
      ]
    };
  }

  var posts = loadJSON(STORAGE_KEYS.posts, null);
  if (!posts){ posts = seedPosts(); saveJSON(STORAGE_KEYS.posts, posts); }

  var users = loadJSON(STORAGE_KEYS.users, []);
  var auth = loadJSON(STORAGE_KEYS.auth, null); // { email, name, isAdmin }

  /* ==========================================================
     TAB NAVIGATION
  ========================================================== */
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
    btn.addEventListener('click', function(){ activateTab(btn.getAttribute('data-tab')); });
  });
  gotoButtons.forEach(function(btn){
    btn.addEventListener('click', function(){
      var target = btn.getAttribute('data-goto');
      if (target === 'signup') openAuthModal('signup');
      else activateTab(target);
    });
  });
  if (hamburger){
    hamburger.addEventListener('click', function(){
      var isOpen = drawer.classList.toggle('is-open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });
  }

  /* ==========================================================
     TOAST
  ========================================================== */
  var toastEl = document.getElementById('toast');
  var toastTimer = null;
  function showToast(message){
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('is-shown');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toastEl.classList.remove('is-shown'); }, 3400);
  }

  /* ==========================================================
     AUTH MODAL (login / sign up)
  ========================================================== */
  var authOverlay = document.getElementById('modalOverlay');
  var authClose = document.getElementById('modalClose');
  var authSwitchButtons = document.querySelectorAll('[data-authtab]');
  var authForms = document.querySelectorAll('.auth-form');
  var loginForm = document.getElementById('loginForm');
  var signupForm = document.getElementById('signupForm');

  function openAuthModal(which){
    authOverlay.classList.add('is-open');
    setAuthTab(which || 'login');
    document.body.style.overflow = 'hidden';
  }
  function closeAuthModal(){
    authOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  function setAuthTab(which){
    authSwitchButtons.forEach(function(btn){
      btn.classList.toggle('is-active', btn.getAttribute('data-authtab') === which);
    });
    authForms.forEach(function(f){
      f.classList.toggle('is-active', f.getAttribute('data-form') === which);
    });
  }
  ['openLogin','openLoginMobile'].forEach(function(id){
    var el = document.getElementById(id);
    if (el) el.addEventListener('click', function(){ openAuthModal('login'); });
  });
  ['openSignup','openSignupMobile','heroSignup'].forEach(function(id){
    var el = document.getElementById(id);
    if (el) el.addEventListener('click', function(){ openAuthModal('signup'); });
  });
  authSwitchButtons.forEach(function(btn){
    btn.addEventListener('click', function(){ setAuthTab(btn.getAttribute('data-authtab')); });
  });
  if (authClose) authClose.addEventListener('click', closeAuthModal);
  if (authOverlay){
    authOverlay.addEventListener('click', function(e){ if (e.target === authOverlay) closeAuthModal(); });
  }

  function setSession(sessionObj){
    auth = sessionObj;
    saveJSON(STORAGE_KEYS.auth, auth);
    renderAuthUI();
    renderAllPosts();
  }

  if (loginForm){
    loginForm.addEventListener('submit', function(e){
      e.preventDefault();
      var email = loginForm.querySelector('[name="identifier"]').value.trim();
      var password = loginForm.querySelector('[name="password"]').value;

      if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD){
        setSession({ email: ADMIN_EMAIL, name: 'Admin', isAdmin: true });
        closeAuthModal();
        showToast('Logged in as Admin — edit tools unlocked.');
        loginForm.reset();
        return;
      }
      var match = users.find(function(u){
        return u.email.toLowerCase() === email.toLowerCase() && u.password === password;
      });
      if (match){
        setSession({ email: match.email, name: match.fullname, isAdmin: false });
        closeAuthModal();
        showToast('Logged in — welcome back, ' + match.fullname.split(' ')[0] + '.');
        loginForm.reset();
        return;
      }
      showToast('Incorrect email or password.');
    });
  }

  if (signupForm){
    signupForm.addEventListener('submit', function(e){
      e.preventDefault();
      var fullname = signupForm.querySelector('[name="fullname"]').value.trim();
      var email = signupForm.querySelector('[name="email"]').value.trim();
      var troop = signupForm.querySelector('[name="troop"]').value.trim();
      var password = signupForm.querySelector('[name="password"]').value;

      if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()){
        showToast('That email is reserved. Try logging in instead.');
        return;
      }
      if (users.some(function(u){ return u.email.toLowerCase() === email.toLowerCase(); })){
        showToast('An account with that email already exists.');
        return;
      }
      users.push({ fullname: fullname, email: email, troop: troop, password: password });
      saveJSON(STORAGE_KEYS.users, users);
      setSession({ email: email, name: fullname, isAdmin: false });
      closeAuthModal();
      showToast('Account created — welcome, ' + fullname.split(' ')[0] + '.');
      signupForm.reset();
    });
  }

  /* ---------- logged-in topbar state ---------- */
  var loggedOutDesktop = document.getElementById('authActionsLoggedOut');
  var loggedInDesktop = document.getElementById('authActionsLoggedIn');
  var loggedOutMobile = document.getElementById('mobileAuthLoggedOut');
  var loggedInMobile = document.getElementById('mobileAuthLoggedIn');
  var userPillBadge = document.getElementById('userPillBadge');
  var userPillName = document.getElementById('userPillName');
  var userPillNameMobile = document.getElementById('userPillNameMobile');

  function renderAuthUI(){
    var isLoggedIn = !!auth;
    if (loggedOutDesktop) loggedOutDesktop.hidden = isLoggedIn;
    if (loggedInDesktop) loggedInDesktop.hidden = !isLoggedIn;
    if (loggedOutMobile) loggedOutMobile.hidden = isLoggedIn;
    if (loggedInMobile) loggedInMobile.hidden = !isLoggedIn;

    if (isLoggedIn){
      var label = auth.isAdmin ? 'Admin' : auth.name;
      var initial = (auth.name || 'U').trim().charAt(0).toUpperCase();
      if (userPillBadge) userPillBadge.textContent = initial;
      if (userPillName) userPillName.textContent = label;
      if (userPillNameMobile) userPillNameMobile.textContent = label;
    }

    document.querySelectorAll('.admin-only').forEach(function(el){
      el.hidden = !(auth && auth.isAdmin);
    });
  }

  function logout(){
    setSession(null);
    activateTab('home');
    showToast('Logged out.');
  }
  ['logoutBtn','logoutBtnMobile'].forEach(function(id){
    var el = document.getElementById(id);
    if (el) el.addEventListener('click', logout);
  });

  document.addEventListener('keydown', function(e){
    if (e.key !== 'Escape') return;
    closeAuthModal();
    closePostModal();
  });

  /* ==========================================================
     POST RENDERING (Leaders / Promotions / Books / Leaks)
  ========================================================== */
  var SECTION_LABELS = { leaders: 'Leaders', promotions: 'Promotions', books: 'Books', leaks: 'Leaks' };

  function escapeHTML(str){
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function renderSection(section){
    var grid = document.getElementById('grid-' + section);
    if (!grid) return;
    var list = posts[section] || [];
    var isAdmin = !!(auth && auth.isAdmin);

    if (list.length === 0){
      grid.innerHTML = '<div class="posts-empty">No posts yet' + (isAdmin ? ' — use “+ New Post” to add the first one.' : '.') + '</div>';
      return;
    }

    grid.innerHTML = list.map(function(post){
      var imageHTML = post.image
        ? '<img class="post-card__image" src="' + post.image + '" alt="' + escapeHTML(post.name) + '">'
        : '';
      var pdfHTML = post.pdf
        ? '<a class="post-card__pdf" href="' + post.pdf + '" target="_blank" rel="noopener">📄 View PDF ↗</a>'
        : '';
      var handleHTML = isAdmin ? '<span class="post-card__handle" title="Drag to reorder">⠿⠿</span>' : '';
      var adminHTML = isAdmin
        ? '<div class="post-card__admin">' +
            '<button class="post-card__edit" data-edit="' + post.id + '" data-section="' + section + '">Edit</button>' +
            '<button class="post-card__delete" data-delete="' + post.id + '" data-section="' + section + '">Delete</button>' +
          '</div>'
        : '';

      return '<article class="post-card' + (isAdmin ? ' post-card--draggable' : '') + '" data-id="' + post.id + '"' +
        (isAdmin ? ' draggable="true"' : '') + '>' +
        handleHTML +
        imageHTML +
        '<h3 class="post-card__name">' + escapeHTML(post.name) + '</h3>' +
        '<p class="post-card__desc">' + escapeHTML(post.description) + '</p>' +
        pdfHTML +
        adminHTML +
      '</article>';
    }).join('');

    if (isAdmin) wireDragToReorder(grid, section);
  }

  function renderAllPosts(){
    Object.keys(SECTION_LABELS).forEach(renderSection);
  }

  /* ---------- drag-to-reorder (admin only) ---------- */
  function wireDragToReorder(grid, section){
    var dragEl = null;

    grid.querySelectorAll('.post-card--draggable').forEach(function(card){
      card.addEventListener('dragstart', function(){
        dragEl = card;
        setTimeout(function(){ card.classList.add('is-dragging'); }, 0);
      });
      card.addEventListener('dragend', function(){
        card.classList.remove('is-dragging');
        dragEl = null;
        // Persist new order to the posts array
        var newOrderIds = Array.prototype.map.call(grid.querySelectorAll('.post-card'), function(el){
          return el.getAttribute('data-id');
        });
        posts[section] = newOrderIds.map(function(id){
          return posts[section].find(function(p){ return p.id === id; });
        }).filter(Boolean);
        saveJSON(STORAGE_KEYS.posts, posts);
        showToast('Order updated.');
      });
    });

    grid.addEventListener('dragover', function(e){
      e.preventDefault();
      if (!dragEl) return;
      var afterEl = getDragAfterElement(grid, e.clientY, e.clientX, grid.classList.contains('posts-grid--feed'));
      if (afterEl == null){
        grid.appendChild(dragEl);
      } else {
        grid.insertBefore(dragEl, afterEl);
      }
    });
  }

  function getDragAfterElement(container, y, x, isVerticalList){
    var els = Array.prototype.slice.call(container.querySelectorAll('.post-card--draggable:not(.is-dragging)'));
    var closest = { offset: -Infinity, element: null };
    els.forEach(function(el){
      var box = el.getBoundingClientRect();
      var offset = isVerticalList
        ? y - box.top - box.height / 2
        : (Math.abs(y - (box.top + box.height/2)) < box.height ? x - box.left - box.width / 2 : -Infinity);
      if (offset < 0 && offset > closest.offset){
        closest = { offset: offset, element: el };
      }
    });
    return closest.element;
  }

  /* ---------- edit / delete clicks (delegated) ---------- */
  document.getElementById('main').addEventListener('click', function(e){
    var editBtn = e.target.closest('[data-edit]');
    var delBtn = e.target.closest('[data-delete]');

    if (editBtn){
      var section = editBtn.getAttribute('data-section');
      var id = editBtn.getAttribute('data-edit');
      var post = (posts[section] || []).find(function(p){ return p.id === id; });
      if (post) openPostModal(section, post);
    }
    if (delBtn){
      var dsection = delBtn.getAttribute('data-section');
      var did = delBtn.getAttribute('data-delete');
      if (window.confirm('Delete this post? This cannot be undone.')){
        posts[dsection] = (posts[dsection] || []).filter(function(p){ return p.id !== did; });
        saveJSON(STORAGE_KEYS.posts, posts);
        renderSection(dsection);
        showToast('Post deleted.');
      }
    }
  });

  document.querySelectorAll('[data-add]').forEach(function(btn){
    btn.addEventListener('click', function(){
      openPostModal(btn.getAttribute('data-add'), null);
    });
  });

  /* ==========================================================
     POST EDITOR MODAL
  ========================================================== */
  var postOverlay = document.getElementById('postOverlay');
  var postModalClose = document.getElementById('postModalClose');
  var postModalTitle = document.getElementById('postModalTitle');
  var postModalSubtitle = document.getElementById('postModalSubtitle');
  var postForm = document.getElementById('postForm');
  var postIdInput = document.getElementById('postId');
  var postSectionInput = document.getElementById('postSection');
  var postNameInput = document.getElementById('postName');
  var postDescInput = document.getElementById('postDescription');
  var postCancel = document.getElementById('postCancel');

  var imageFileInput = document.getElementById('postImageFile');
  var imageLinkInput = document.getElementById('postImageLink');
  var imagePreview = document.getElementById('postImagePreview');
  var imagePreviewImg = document.getElementById('postImagePreviewImg');
  var imageRemoveBtn = document.getElementById('postImageRemove');

  var pdfFileInput = document.getElementById('postPdfFile');
  var pdfLinkInput = document.getElementById('postPdfLink');
  var pdfPreview = document.getElementById('postPdfPreview');
  var pdfPreviewName = document.getElementById('postPdfPreviewName');
  var pdfRemoveBtn = document.getElementById('postPdfRemove');

  var currentImageData = '';
  var currentPdfData = '';
  var currentPdfName = '';

  function openPostModal(section, existingPost){
    postForm.reset();
    currentImageData = existingPost ? (existingPost.image || '') : '';
    currentPdfData = existingPost ? (existingPost.pdf || '') : '';
    currentPdfName = '';

    postSectionInput.value = section;
    postIdInput.value = existingPost ? existingPost.id : '';
    postModalSubtitle.textContent = SECTION_LABELS[section] || section;
    postModalTitle.textContent = existingPost ? 'Edit Post' : 'New Post';
    postNameInput.value = existingPost ? existingPost.name : '';
    postDescInput.value = existingPost ? existingPost.description : '';

    resetModeToggle('image');
    resetModeToggle('pdf');
    updateImagePreview();
    updatePdfPreview();

    postOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    setTimeout(function(){ postNameInput.focus(); }, 50);
  }
  function closePostModal(){
    postOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  if (postModalClose) postModalClose.addEventListener('click', closePostModal);
  if (postCancel) postCancel.addEventListener('click', closePostModal);
  if (postOverlay){
    postOverlay.addEventListener('click', function(e){ if (e.target === postOverlay) closePostModal(); });
  }

  /* ---------- upload/link toggle ---------- */
  document.querySelectorAll('.toggle-pair').forEach(function(pair){
    var group = pair.getAttribute('data-toggle-for');
    pair.querySelectorAll('.toggle-pair__btn').forEach(function(btn){
      btn.addEventListener('click', function(){
        pair.querySelectorAll('.toggle-pair__btn').forEach(function(b){ b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        var mode = btn.getAttribute('data-mode');
        document.querySelectorAll('[data-mode-group="' + group + '"]').forEach(function(input){
          input.hidden = input.getAttribute('data-mode') !== mode;
        });
      });
    });
  });
  function resetModeToggle(group){
    var pair = document.querySelector('.toggle-pair[data-toggle-for="' + group + '"]');
    if (!pair) return;
    pair.querySelectorAll('.toggle-pair__btn').forEach(function(b){
      b.classList.toggle('is-active', b.getAttribute('data-mode') === 'upload');
    });
    document.querySelectorAll('[data-mode-group="' + group + '"]').forEach(function(input){
      input.hidden = input.getAttribute('data-mode') !== 'upload';
      if (input.tagName === 'INPUT' && (input.type === 'url' || input.type === 'file')) input.value = '';
    });
  }

  /* ---------- image handling ---------- */
  function updateImagePreview(){
    if (currentImageData){
      imagePreviewImg.src = currentImageData;
      imagePreview.hidden = false;
    } else {
      imagePreview.hidden = true;
      imagePreviewImg.src = '';
    }
  }
  imageFileInput.addEventListener('change', function(){
    var file = imageFileInput.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024){
      showToast('Image is over 3MB — try a smaller file or use a link instead.');
      imageFileInput.value = '';
      return;
    }
    var reader = new FileReader();
    reader.onload = function(){
      currentImageData = reader.result;
      updateImagePreview();
    };
    reader.readAsDataURL(file);
  });
  imageLinkInput.addEventListener('input', function(){
    currentImageData = imageLinkInput.value.trim();
    updateImagePreview();
  });
  imageRemoveBtn.addEventListener('click', function(){
    currentImageData = '';
    imageFileInput.value = '';
    imageLinkInput.value = '';
    updateImagePreview();
  });

  /* ---------- pdf handling ---------- */
  function updatePdfPreview(){
    if (currentPdfData){
      pdfPreviewName.textContent = currentPdfName || (currentPdfData.indexOf('data:') === 0 ? 'Uploaded PDF' : currentPdfData);
      pdfPreview.hidden = false;
    } else {
      pdfPreview.hidden = true;
    }
  }
  pdfFileInput.addEventListener('change', function(){
    var file = pdfFileInput.files[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024){
      showToast('PDF is over 4MB — try a smaller file or use a link instead.');
      pdfFileInput.value = '';
      return;
    }
    var reader = new FileReader();
    reader.onload = function(){
      currentPdfData = reader.result;
      currentPdfName = file.name;
      updatePdfPreview();
    };
    reader.readAsDataURL(file);
  });
  pdfLinkInput.addEventListener('input', function(){
    currentPdfData = pdfLinkInput.value.trim();
    currentPdfName = '';
    updatePdfPreview();
  });
  pdfRemoveBtn.addEventListener('click', function(){
    currentPdfData = '';
    currentPdfName = '';
    pdfFileInput.value = '';
    pdfLinkInput.value = '';
    updatePdfPreview();
  });

  /* ---------- save post ---------- */
  postForm.addEventListener('submit', function(e){
    e.preventDefault();
    if (!auth || !auth.isAdmin){
      showToast('Only the admin account can edit posts.');
      closePostModal();
      return;
    }
    var section = postSectionInput.value;
    var id = postIdInput.value;
    var name = postNameInput.value.trim();
    var description = postDescInput.value.trim();

    if (!posts[section]) posts[section] = [];

    if (id){
      var existing = posts[section].find(function(p){ return p.id === id; });
      if (existing){
        existing.name = name;
        existing.description = description;
        existing.image = currentImageData;
        existing.pdf = currentPdfData;
      }
      showToast('Post updated.');
    } else {
      posts[section].push({
        id: section + '_' + Date.now().toString(36),
        name: name,
        description: description,
        image: currentImageData,
        pdf: currentPdfData
      });
      showToast('Post published.');
    }

    saveJSON(STORAGE_KEYS.posts, posts);
    renderSection(section);
    closePostModal();
  });

  /* ==========================================================
     INIT
  ========================================================== */
  renderAuthUI();
  renderAllPosts();

  var hash = window.location.hash.replace('#','');
  var validTabs = ['home','leaders','promotions','books','leaks'];
  if (validTabs.indexOf(hash) !== -1) activateTab(hash);

  if (!storageWorks){
    showToast('Note: private/preview browsing detected — posts and login will reset on reload.');
  }
})();
