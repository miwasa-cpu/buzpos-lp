/* BUZPOS SNS運用代行 LP v2 — 第1段・第1b段の動き（GSAP 3.13 + ScrollTrigger / jsdelivr）
   - 第1b段：03 = YouTube 横型の制作実績（背景「YOUTUBE」の scrub）、04 = ショート（背景文字なし）
   - hero の 0〜2.3 秒は CSS keyframes のみ（このファイルは関与しない）
   - GSAP が無い・失敗した時は .js を外して中身を全部見せる
   - prefers-reduced-motion: reduce の時は GSAP で何もしない */
(function () {
  'use strict';

  var d = document;
  var root = d.documentElement;
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqSP = window.matchMedia('(max-width: 750px)');
  var mqFine = window.matchMedia('(hover: hover) and (pointer: fine)');
  var LINE_URL = 'https://lin.ee/aN0JGeo';

  function $(sel, ctx) { return (ctx || d).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || d).querySelectorAll(sel)); }
  function onReady(fn) {
    if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', fn);
    else fn();
  }
  function releaseReveal() {
    clearTimeout(window.__motionTimer);
    root.classList.remove('js');
  }

  /* ---------- ヘッダー CTA：hero 通過後に「LINEで無料相談」へ ---------- */
  function initHeader() {
    var hero = $('#sns-top');
    var cta = $('#v2-header-cta');
    if (!hero || !cta || !('IntersectionObserver' in window)) return;
    var a = $('.v2-flip__a', cta);
    var b = $('.v2-flip__b', cta);
    var orig = { text: a ? a.textContent : cta.textContent, href: cta.getAttribute('href') };
    function set(passed) {
      var text = passed ? 'LINEで無料相談' : orig.text;
      if (a) a.textContent = text;
      if (b) b.textContent = text;
      cta.setAttribute('href', passed ? LINE_URL : orig.href);
      if (passed) { cta.setAttribute('target', '_blank'); cta.setAttribute('rel', 'noopener'); }
      else { cta.removeAttribute('target'); cta.removeAttribute('rel'); }
      cta.classList.toggle('is-line', passed);
    }
    new IntersectionObserver(function (entries) {
      var e = entries[0];
      set(!e.isIntersecting && e.boundingClientRect.top < 0);
    }, { rootMargin: '-64px 0px 0px 0px', threshold: 0 }).observe(hero);
  }

  /* ---------- LINE 固定バー（SP）：hero を抜けたら出す／#sns-contact が 30% 見えたら隠す ---------- */
  function initLineBar() {
    var bar = $('#v2-linebar');
    var hero = $('#sns-top');
    var contact = $('#sns-contact');
    if (!bar || !hero || !('IntersectionObserver' in window)) return;
    var passed = false;
    var nearForm = false;
    function update() { bar.classList.toggle('is-shown', passed && !nearForm); }
    new IntersectionObserver(function (entries) {
      var e = entries[0];
      passed = !e.isIntersecting && e.boundingClientRect.top < 0;
      update();
    }, { threshold: 0 }).observe(hero);
    if (contact) {
      new IntersectionObserver(function (entries) {
        var e = entries[0];
        nearForm = e.intersectionRatio >= 0.3 || (e.isIntersecting && e.intersectionRect.height >= window.innerHeight * 0.3);
        update();
      }, { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5] }).observe(contact);
    }
  }

  /* ---------- ティッカー（CSS アニメ時）：画面外では停止 ---------- */
  function initTickerIO() {
    var ticker = $('#v2-ticker');
    if (!ticker || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (entries) {
      ticker.classList.toggle('is-off', !entries[0].isIntersecting);
    }).observe(ticker);
  }

  /* ---------- 実績レール（YouTube 横型・ショート共用）：PC は矢印で送る。data-center のレールは SP で中央の 1 台だけ強調 ---------- */
  function initRails() {
    $$('.v2-rail').forEach(function (rail) {
      var items = $$('.v2-rail__item', rail);
      if (rail.hasAttribute('data-center') && 'IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) { e.target.classList.toggle('is-center', e.isIntersecting); });
        }, { root: rail, rootMargin: '0px -45% 0px -45%', threshold: 0 });
        items.forEach(function (it) { io.observe(it); });
      }
      var prev = rail.id ? $('[data-rail="prev"][aria-controls="' + rail.id + '"]') : null;
      var next = rail.id ? $('[data-rail="next"][aria-controls="' + rail.id + '"]') : null;
      var wrap = rail.closest('[data-rail-wrap]');
      var per = parseInt(rail.getAttribute('data-step') || '2', 10) || 2;
      function step() {
        var it = items[0];
        if (!it) return 300;
        var gap = parseFloat(getComputedStyle(rail).columnGap) || 24;
        return (it.getBoundingClientRect().width + gap) * per;
      }
      function state() {
        var max = rail.scrollWidth - rail.clientWidth - 2;
        if (prev) prev.disabled = rail.scrollLeft <= 2;
        if (next) next.disabled = rail.scrollLeft >= max;
        if (wrap) wrap.classList.toggle('is-fit', max <= 0);
      }
      function go(dir) {
        rail.scrollBy({ left: dir * step(), behavior: (mqReduce.matches ? 'auto' : 'smooth') });
      }
      if (prev) prev.addEventListener('click', function () { go(-1); });
      if (next) next.addEventListener('click', function () { go(1); });
      rail.addEventListener('scroll', state, { passive: true });
      window.addEventListener('resize', state);
      state();
    });
  }

  /* ---------- 端末枠の自動再生：可視 50% 以上で play、外れたら pause。同時再生 SP 1 本 / PC 2 本 ---------- */
  function initVideos() {
    var vids = $$('video[data-src]');
    if (!vids.length) return;
    function frame(v) { return v.closest('.v2-phone'); }
    function blocked(v) {
      var f = frame(v);
      if (f) { f.classList.remove('is-playing'); f.classList.add('is-blocked'); }
    }
    /* 動きを減らす設定：自動再生しない。<video> を読まず poster ＋「▶」を出す（タップでフルスクリーン再生は従来どおり） */
    if (mqReduce.matches) { vids.forEach(blocked); return; }
    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn && conn.saveData) return; /* 通信量節約モード：<video> を読まず poster のみ */
    if (!('IntersectionObserver' in window)) return;
    var playing = [];
    function limit() { return mqSP.matches ? 1 : 2; }
    function play(v) {
      if (mqReduce.matches) { pause(v); blocked(v); return; } /* 表示中に設定が変わった場合 */
      if (!v.getAttribute('src')) { v.src = v.getAttribute('data-src'); }
      v.muted = true;
      var idx = playing.indexOf(v);
      if (idx === -1) playing.push(v);
      while (playing.length > limit()) { var old = playing.shift(); old.pause(); }
      var p;
      try { p = v.play(); } catch (err) { blocked(v); return; }
      if (p && typeof p.then === 'function') {
        p.then(function () {
          var f = frame(v);
          if (f) { f.classList.remove('is-blocked'); f.classList.add('is-playing'); }
        }).catch(function () { blocked(v); });
      }
    }
    function pause(v) {
      var i = playing.indexOf(v);
      if (i > -1) playing.splice(i, 1);
      if (!v.paused) v.pause();
    }
    vids.forEach(function (v) {
      v.addEventListener('playing', function () {
        var f = frame(v);
        if (f) { f.classList.remove('is-blocked'); f.classList.add('is-playing'); }
      });
      v.addEventListener('error', function () { blocked(v); });
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.intersectionRatio >= 0.5) play(e.target);
        else pause(e.target);
      });
    }, { threshold: [0, 0.5, 1] });
    vids.forEach(function (v) { io.observe(v); });
    d.addEventListener('visibilitychange', function () {
      if (d.hidden) playing.slice().forEach(function (v) { v.pause(); });
    });
    function onReduce() {
      if (mqReduce.matches) vids.forEach(function (v) { pause(v); blocked(v); });
    }
    if (mqReduce.addEventListener) mqReduce.addEventListener('change', onReduce);
    else if (mqReduce.addListener) mqReduce.addListener(onReduce);
  }

  /* ---------- タップ再生：ショートは既存の YouTube ライトボックス、1 分紹介は音ありフルスクリーン ---------- */
  function initPlayers() {
    /* YouTube 横型：旧 sns-youtube と同じ 16:9 のライトボックス（タイトルはジャンル名）。
       data-noembed のカード（所有者が埋め込みを無効にしている動画。oEmbed 401）はライトボックスを開かず、
       href の YouTube を新しいタブで開く */
    $$('.v2-yt__card[data-video-id]:not([data-noembed])').forEach(function (el) {
      el.addEventListener('click', function (ev) {
        if (typeof window.openSnsModal !== 'function') return; /* 失敗時は YouTube へのリンクとして動く */
        ev.preventDefault();
        var g = $('.v2-yt__genre', el);
        window.openSnsModal(el.getAttribute('data-video-id'), g ? g.textContent : '', false);
      });
    });
    $$('.v2-phone[data-video-id]').forEach(function (el) {
      el.addEventListener('click', function (ev) {
        if (typeof window.openSnsModal !== 'function') return; /* 失敗時は YouTube へのリンクとして動く */
        ev.preventDefault();
        window.openSnsModal(el.getAttribute('data-video-id'), 'ショート動画', true);
      });
    });

    var overlay = $('#v2-fullvideo');
    var full = $('#v2-fullvideo-el');
    var closeBtn = $('.v2-fullvideo__close');
    var lastFocus = null;
    function fsEl() { return d.fullscreenElement || d.webkitFullscreenElement; }
    function closeFull() {
      if (!overlay || overlay.hidden) return;
      try { full.pause(); } catch (err) { /* noop */ }
      if (fsEl() && d.exitFullscreen) { d.exitFullscreen().catch(function () {}); }
      overlay.hidden = true;
      d.body.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    function openFull(src, trigger) {
      if (!overlay || !full) return false;
      lastFocus = trigger || null;
      if (full.getAttribute('src') !== src) full.src = src;
      full.muted = false;
      overlay.hidden = false;
      d.body.style.overflow = 'hidden';
      try { full.currentTime = 0; } catch (err) { /* noop */ }
      var p = full.play();
      if (p && p.catch) p.catch(function () { /* 再生はコントロールから */ });
      var req = full.requestFullscreen || full.webkitRequestFullscreen;
      if (req) {
        try {
          var r = req.call(full);
          if (r && r.catch) r.catch(function () {});
        } catch (err) { /* 固定オーバーレイのまま再生 */ }
      } else if (full.webkitEnterFullscreen) {
        try { full.webkitEnterFullscreen(); } catch (err) { /* noop */ }
      }
      if (closeBtn) closeBtn.focus({ preventScroll: true });
      return true;
    }
    $$('[data-fullvideo]').forEach(function (el) {
      el.addEventListener('click', function (ev) {
        if (openFull(el.getAttribute('data-fullvideo'), el)) ev.preventDefault();
      });
    });
    if (closeBtn) closeBtn.addEventListener('click', closeFull);
    if (full) {
      full.addEventListener('webkitendfullscreen', closeFull);
      full.addEventListener('ended', function () { if (!fsEl()) closeFull(); });
    }
    function onFsChange() { if (!fsEl()) closeFull(); }
    d.addEventListener('fullscreenchange', onFsChange);
    d.addEventListener('webkitfullscreenchange', onFsChange);
    d.addEventListener('keydown', function (ev) {
      if (ev.key !== 'Escape') return;
      closeFull();
      var modal = $('#sns-videoModal');
      if (modal && modal.style.display === 'flex' && typeof window.closeSnsModal === 'function') window.closeSnsModal();
    });
  }

  /* ---------- 1 文字 split-reveal 部品（Intl.Segmenter で書記素ごと） ---------- */
  function splitGraphemes(el) {
    if (el.getAttribute('data-split-done')) return $$('.v2-split__c', el);
    var text = el.textContent;
    var parts;
    if (window.Intl && Intl.Segmenter) {
      parts = Array.from(new Intl.Segmenter('ja', { granularity: 'grapheme' }).segment(text), function (s) { return s.segment; });
    } else {
      parts = Array.from(text);
    }
    var label = text.replace(/\s+/g, ' ').trim();
    var frag = d.createDocumentFragment();
    /* 見出しは aria-label で全文を持たせる。<p> などは aria-label が読まれないので、読み上げ用の全文を別に置く */
    if (/^H[1-6]$/.test(el.tagName)) {
      el.setAttribute('aria-label', label);
    } else {
      var sr = d.createElement('span');
      sr.className = 'v2-sr';
      sr.textContent = label;
      frag.appendChild(sr);
    }
    var box = d.createElement('span');
    box.setAttribute('aria-hidden', 'true');
    parts.forEach(function (ch) {
      if (/^\s+$/.test(ch)) { box.appendChild(d.createTextNode(' ')); return; }
      var m = d.createElement('span');
      m.className = 'v2-split__m';
      var c = d.createElement('span');
      c.className = 'v2-split__c';
      c.textContent = ch;
      m.appendChild(c);
      box.appendChild(m);
    });
    frag.appendChild(box);
    el.textContent = '';
    el.appendChild(frag);
    el.setAttribute('data-split-done', '1');
    return $$('.v2-split__c', el);
  }

  /* ---------- スロット数字部品（第2段以降の 5億 / 300万 / 95% / 0円 / 4円 用に汎用化）----------
     <span class="v2-odo" data-odo="3.2"></span> → セルを組み立てる。run(el) で回す */
  var Odometer = {
    build: function (el) {
      if (el.querySelector('.v2-odo__cells')) return el;
      var value = String(el.getAttribute('data-odo') || '');
      var spin = el.getAttribute('data-spin') !== '0';
      var sr = d.createElement('span');
      sr.className = 'v2-sr';
      sr.textContent = value;
      var cells = d.createElement('span');
      cells.className = 'v2-odo__cells';
      cells.setAttribute('aria-hidden', 'true');
      var digits = value.split('');
      var digitCount = digits.filter(function (c) { return /\d/.test(c); }).length;
      var k = 0;
      digits.forEach(function (c) {
        if (/\d/.test(c)) {
          var n = parseInt(c, 10);
          var cell = d.createElement('span');
          cell.className = 'v2-odo__cell' + (n === 1 ? ' is-1' : '');
          var ph = d.createElement('span');
          ph.className = 'v2-odo__ph';
          ph.setAttribute('data-d', c);
          var reel = d.createElement('span');
          reel.className = 'v2-odo__reel';
          reel.style.setProperty('--n', String((spin ? 11 : 1) + n));
          reel.style.setProperty('--d', ((digitCount - 1 - k) * 0.08).toFixed(2) + 's');
          cell.appendChild(ph);
          cell.appendChild(reel);
          cells.appendChild(cell);
          k++;
        } else {
          var s = d.createElement('span');
          s.className = 'v2-odo__dot';
          s.textContent = c;
          cells.appendChild(s);
        }
      });
      el.textContent = '';
      el.appendChild(sr);
      el.appendChild(cells);
      return el;
    },
    run: function (el) {
      el.classList.remove('v2-odo--run');
      void el.offsetWidth;
      el.classList.add('v2-odo--run');
    }
  };
  window.V2Odometer = Odometer;

  /* ---------- GSAP ---------- */
  function initMotion() {
    var gsap = window.gsap;
    var ST = window.ScrollTrigger;
    if (!gsap || !ST) { releaseReveal(); return; }
    var revealAlive = root.classList.contains('js');
    gsap.registerPlugin(ST);

    var mm = gsap.matchMedia();
    mm.add({ motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' }, function (ctx) {
      if (ctx.conditions.reduce) return; /* reduce：何もしない（CSS 側で全部表示） */

      var expo = 'expo.out';

      /* hero 離脱：文字 -12% / 写真 -4%（scrub・hero 高さの 0→60%） */
      var hero = $('#sns-top');
      var copy = $('#v2-hero-copy');
      var visual = $('#v2-hero-visual');
      if (hero && copy) {
        var heroST = { trigger: hero, start: 'top top', end: function () { return '+=' + Math.round(hero.offsetHeight * 0.6); }, scrub: true, invalidateOnRefresh: true };
        gsap.to(copy, { yPercent: -12, ease: 'none', scrollTrigger: heroST });
        if (visual) gsap.to(visual, { yPercent: -4, ease: 'none', scrollTrigger: Object.assign({}, heroST) });
      }

      /* ティッカー：GSAP の timeline で帯を動かし、スクロール速度で timeScale を上げる */
      var ticker = $('#v2-ticker');
      var track = ticker ? $('.v2-ticker__track', ticker) : null;
      var tickerTween = null;
      if (ticker && track) {
        ticker.classList.add('is-gsap');
        tickerTween = gsap.timeline({ repeat: -1 });
        tickerTween.fromTo(track, { xPercent: 0 }, { xPercent: -50, duration: 28, ease: 'none', force3D: true });
        var hovered = false;
        var visible = true;
        var idle = null;
        function sync() {
          if (hovered || !visible) tickerTween.pause(); else tickerTween.resume();
          ticker.classList.toggle('is-off', !visible);
        }
        ticker.addEventListener('mouseenter', function () { hovered = true; sync(); });
        ticker.addEventListener('mouseleave', function () { hovered = false; sync(); });
        if ('IntersectionObserver' in window) {
          new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; sync(); }).observe(ticker);
        }
        ST.create({
          start: 0,
          end: 'max',
          onUpdate: function (self) {
            var v = Math.abs(self.getVelocity());
            var ts = 1 + Math.min(v / 1500, 3);
            gsap.to(tickerTween, { timeScale: ts, duration: 0.2, overwrite: true });
            clearTimeout(idle);
            idle = setTimeout(function () { gsap.to(tickerTween, { timeScale: 1, duration: 0.8, overwrite: true }); }, 120);
          }
        });
      }

      /* 「YOUTUBE」背景文字：セクション全長で +6vw → -18vw（scrub はこれと hero 離脱の 2 本だけ） */
      var ytSec = $('#v2-youtube');
      var word = $('.v2-yt__bgword');
      if (ytSec && word) {
        gsap.fromTo(word,
          { x: function () { return window.innerWidth * 0.06; } },
          { x: function () { return window.innerWidth * -0.18; }, ease: 'none',
            scrollTrigger: { trigger: ytSec, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
      }

      if (!revealAlive) return; /* 安全タイマーで .js が外れた後は出現演出をしない（見えている中身を隠さない） */

      /* 毎月5社限定：帯の下端が viewport 75% に入ったら「5」→ .3 秒後にマーカー */
      var five = $('#v2-five');
      var marks = $$('#v2-limit .v2-marker');
      if (five && ticker) {
        var tl = gsap.timeline({ paused: true });
        tl.fromTo(five, { yPercent: 100, opacity: 1 }, { yPercent: 0, duration: 0.9, ease: expo, clearProps: 'transform' }, 0);
        if (marks.length) {
          tl.fromTo(marks, { backgroundSize: '0% 6px' }, { backgroundSize: '100% 6px', duration: 0.6, ease: expo, stagger: 0.12 }, 0.3);
        }
        ST.create({ trigger: ticker, start: 'bottom 75%', once: true, onEnter: function () { tl.play(); } });
      }

      /* ヘアライン draw */
      $$('[data-reveal="draw"]').forEach(function (el) {
        gsap.fromTo(el, { scaleX: 0, opacity: 1, transformOrigin: 'left center' },
          { scaleX: 1, duration: 0.8, ease: expo, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
      });

      /* フェードアップ */
      $$('[data-reveal="fade"]').forEach(function (el) {
        gsap.fromTo(el, { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.8, ease: expo, clearProps: 'transform', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
      });

      /* 強い理由：索引 ＋ ヘアライン ＋ 見出しの 1 文字 split-reveal */
      $$('.v2-reason').forEach(function (li) {
        var line = $('.v2-reason__line', li);
        var t = $('[data-reveal="split"]', li);
        var idx = $('.v2-reason__idx', li);
        var chars = t ? splitGraphemes(t) : [];
        var tl2 = gsap.timeline({ scrollTrigger: { trigger: li, start: 'top 85%', once: true } });
        if (idx) tl2.fromTo(idx, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, ease: expo }, 0);
        if (line) tl2.fromTo(line, { scaleX: 0, opacity: 1, transformOrigin: 'left center' }, { scaleX: 1, opacity: 1, duration: 0.8, ease: expo }, 0);
        if (t) {
          tl2.set(t, { opacity: 1 }, 0.1);
          tl2.fromTo(chars, { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: expo, stagger: 0.018, clearProps: 'transform' }, 0.1);
        }
      });

      /* 1 文字 split-reveal（強い理由以外：YouTube のサブコピーなど） */
      $$('[data-reveal="split"]').forEach(function (el) {
        if (el.closest('.v2-reason')) return;
        var cs = splitGraphemes(el);
        var tl3 = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
        tl3.set(el, { opacity: 1 }, 0);
        tl3.fromTo(cs, { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: expo, stagger: 0.025, clearProps: 'transform' }, 0);
      });

      /* カード・端末枠の入場（YouTube 横型・ショート共通）：viewport 70% で clip-path、左から stagger .08s */
      $$('.v2-rail').forEach(function (rail) {
        var railItems = $$('.v2-rail__item[data-reveal="rail"]', rail);
        if (!railItems.length) return;
        gsap.set(railItems, { opacity: 1, clipPath: 'inset(0 100% 0 0)' });
        ST.create({
          trigger: rail, start: 'top 70%', once: true,
          onEnter: function () {
            gsap.to(railItems, { clipPath: 'inset(0 0% 0 0)', duration: 0.7, ease: expo, stagger: 0.08, clearProps: 'clipPath' });
          }
        });
      });
      var logic = $('[data-reveal="clip"]');
      if (logic) {
        gsap.fromTo(logic, { opacity: 1, clipPath: 'inset(0 100% 0 0)' },
          { clipPath: 'inset(0 0% 0 0)', duration: 0.7, ease: expo, clearProps: 'clipPath', scrollTrigger: { trigger: logic, start: 'top 70%', once: true } });
      }

      /* 残った data-reveal（上で扱っていないもの）はフェードで */
      $$('[data-reveal]').forEach(function (el) {
        var kind = el.getAttribute('data-reveal');
        if (kind === '' || kind === null) {
          gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: expo, scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
        }
      });

      /* スロット数字（JS で起動するもの：data-odo） */
      $$('.v2-odo[data-odo]').forEach(function (el) {
        Odometer.build(el);
        ST.create({ trigger: el, start: 'top 85%', once: true, onEnter: function () { Odometer.run(el); } });
      });

      /* マグネティック CTA（PC・pointer:fine のみ） */
      if (mqFine.matches) {
        $$('[data-magnetic]').forEach(function (el) {
          var cur = { x: 0, y: 0 };
          var tgt = { x: 0, y: 0 };
          var raf = null;
          var inside = false;
          var setX = gsap.quickSetter(el, 'x', 'px');
          var setY = gsap.quickSetter(el, 'y', 'px');
          function loop() {
            cur.x += (tgt.x - cur.x) * 0.2;
            cur.y += (tgt.y - cur.y) * 0.2;
            setX(cur.x); setY(cur.y);
            if (inside || Math.abs(tgt.x - cur.x) > 0.05 || Math.abs(tgt.y - cur.y) > 0.05) raf = requestAnimationFrame(loop);
            else raf = null;
          }
          function onMove(ev) {
            var r = el.getBoundingClientRect();
            var dx = Math.max(r.left - ev.clientX, 0, ev.clientX - r.right);
            var dy = Math.max(r.top - ev.clientY, 0, ev.clientY - r.bottom);
            var near = Math.sqrt(dx * dx + dy * dy) <= 80;
            if (near) {
              var cx = r.left + r.width / 2;
              var cy = r.top + r.height / 2;
              var vx = ev.clientX - cx;
              var vy = ev.clientY - cy;
              var len = Math.sqrt(vx * vx + vy * vy) || 1;
              var reach = Math.max(r.width, r.height) / 2 + 80;
              var mag = Math.min(len / reach, 1) * 8;
              tgt.x = vx / len * mag;
              tgt.y = vy / len * mag;
              if (!inside) { inside = true; gsap.killTweensOf(el); }
              if (!raf) raf = requestAnimationFrame(loop);
            } else if (inside) {
              inside = false;
              if (raf) { cancelAnimationFrame(raf); raf = null; }
              tgt.x = 0; tgt.y = 0;
              gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.4)', onUpdate: function () {
                cur.x = gsap.getProperty(el, 'x'); cur.y = gsap.getProperty(el, 'y');
              } });
            }
          }
          window.addEventListener('pointermove', onMove, { passive: true });
        });
      }

      window.addEventListener('load', function () { ST.refresh(); });
    });
  }

  onReady(function () {
    initHeader();
    initLineBar();
    initTickerIO();
    initRails();
    initVideos();
    initPlayers();
    try {
      initMotion();
      window.__motionReady = true;
      clearTimeout(window.__motionTimer);
    } catch (err) {
      releaseReveal();
      if (window.console && console.warn) console.warn('[v2] motion init failed', err);
    }
  });
})();
