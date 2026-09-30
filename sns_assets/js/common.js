// ナビゲーションメニューのJavaScript
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    const navOverlay = document.getElementById('navOverlay');
    const navMenu = document.querySelector('.nav-menu');
    const fvWrap = document.querySelector('.fv-wrap');
    const menuItems = navLinks.querySelectorAll('a');

    // .fv-wrapの高さを取得してメニューの表示タイミングを制御
    function handleMenuVisibility() {
        const fvWrapHeight = fvWrap.offsetHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // .fv-wrapが見えなくなったらメニューを表示
        if (scrollTop > fvWrapHeight - 100) { // 100px手前から表示開始
            navMenu.classList.add('show');
        } else {
            navMenu.classList.remove('show');
            // ファーストビュー内に戻った時は強制的にメニューを閉じる
            if (navLinks.classList.contains('active')) {
                closeMenu();
            }
        }
    }

    // メニューの開閉
    function toggleMenu() {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        navOverlay.classList.toggle('active');
        
        // body要素のスクロールを制御
        if (navLinks.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    // メニューを閉じる
    function closeMenu() {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        navOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // イベントリスナー
    menuToggle.addEventListener('click', toggleMenu);
    navOverlay.addEventListener('click', closeMenu);

    // メニューアイテムをクリックしたときにメニューを閉じる
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // 即座にメニューを閉じる（アニメーション待ちなし）
                closeMenu();
                
                // URLにハッシュを追加
                history.pushState(null, null, targetId);
                
                // スクロール実行
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ESCキーでメニューを閉じる
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            closeMenu();
        }
    });

    // ウィンドウリサイズ時にメニューを閉じる
    window.addEventListener('resize', function() {
        if (navLinks.classList.contains('active')) {
            closeMenu();
        }
        handleMenuVisibility();
    });

    // スクロール時にアクティブなセクションをハイライト
    function highlightActiveSection() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100; // ヘッダーの高さ分調整

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                // 現在のアクティブリンクを削除
                menuItems.forEach(item => {
                    item.classList.remove('active');
                });
                
                // 対応するメニューアイテムをアクティブにする
                const activeLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
                
                // URLのハッシュを更新（ブラウザ履歴には追加しない）
                if (window.location.hash !== `#${sectionId}`) {
                    history.replaceState(null, null, `#${sectionId}`);
                }
            }
        });
    }

    // スクロールイベントリスナー（throttled）
    let scrollTimer = null;
    window.addEventListener('scroll', function() {
        if (scrollTimer) {
            clearTimeout(scrollTimer);
        }
        scrollTimer = setTimeout(() => {
            highlightActiveSection();
            handleMenuVisibility();
        }, 100);
    });

    // 初期ロード時にもハイライトとメニュー表示を設定
    highlightActiveSection();
    handleMenuVisibility();

    // 初期ロード時にもハイライトとメニュー表示を設定
    highlightActiveSection();
    handleMenuVisibility();

    // ページロード時にURLのハッシュがある場合の処理
    window.addEventListener('load', function() {
        if (window.location.hash) {
            const targetElement = document.querySelector(window.location.hash);
            if (targetElement) {
                setTimeout(() => {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 100);
            }
        }
    });

    // ブラウザの戻る/進むボタンでの履歴変更に対応
    window.addEventListener('popstate', function() {
        if (window.location.hash) {
            const targetElement = document.querySelector(window.location.hash);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// 追従ボタン表示
jQuery(function ($) {

  const $apply = $('#apply-bottom');

  function toggleApplyBottom() {
    // モバイル判定
    if (window.innerWidth <= 750) {
      // 100px 以上スクロールしたか
      if ($(window).scrollTop() > 100) {
        $apply.addClass('is-visible');
      } else {
        $apply.removeClass('is-visible');
      }
    } else {
      // PC は常に表示（必要ならこの行は削除）
      $apply.addClass('is-visible');
    }
  }

  // 初期表示＆イベント登録
  toggleApplyBottom();
  $(window).on('scroll resize', toggleApplyBottom);

});


// Youtube動画 - YouTube Player API使用版
// Swiperの初期化
const swiper = new Swiper('#swiper-youtube', {
    loop: true,
    centeredSlides: true,
    slidesPerView: 1.2,
    spaceBetween: 20,
    effect: 'coverflow',
    coverflowEffect: {
        rotate: 0,
        stretch: 0,
        depth: 100,
        modifier: 2,
        slideShadows: false
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
    },
    breakpoints: {
        768: {
            slidesPerView: 3
        }
    }
});

// Short
const swiper2 = new Swiper('#swiper-short', {
    loop: true,
    centeredSlides: true,
    slidesPerView: 1,
    spaceBetween: 20,
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
    },
    breakpoints: {
        768: {
            slidesPerView: 3
        }
    }
});

// YouTube Player APIの読み込み
let tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
let firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// グローバル変数
let player = null;
let apiCheckTimeout = null;

// モーダル要素の取得
const modal = document.getElementById('videoModal');
const modalTitle = document.getElementById('modalTitle');
const videoFrame = document.getElementById('videoFrame');

// YouTube APIが読み込まれた際のコールバック
window.onYouTubeIframeAPIReady = function() {
    console.log('YouTube API Ready');
};

// YouTube動画用のモーダルを開く関数
function openModal(videoId, title, isShort = false) {
    if (!videoId) {
        console.error('Video ID is required');
        return;
    }
    
    // 既存のタイムアウトをクリア
    if (apiCheckTimeout) {
        clearTimeout(apiCheckTimeout);
        apiCheckTimeout = null;
    }
    
    modalTitle.textContent = title;
    modal.classList.add('show');
    
    // ショート動画の場合は縦型モーダルクラスを追加
    if (isShort) {
        modal.classList.add('modal-short');
    } else {
        modal.classList.remove('modal-short');
    }
    
    document.body.style.overflow = 'hidden';

    // まず通常のiframeで音声付き自動再生を試みる
    const container = document.querySelector('.video-container');
    
    // allow属性を含めて音声付き自動再生を許可
    container.innerHTML = `<iframe 
        id="videoFrame" 
        src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&rel=0&controls=1&playsinline=1&modestbranding=1&iv_load_policy=3" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen></iframe>`;
    
    // YouTube Player APIをバックアップとして使用
    if (window.YT && window.YT.Player) {
        // 2秒後に再生されていない場合は、Player APIで試す
        apiCheckTimeout = setTimeout(() => {
            // モーダルが閉じられていない場合のみ実行
            if (modal.classList.contains('show')) {
                checkAndUsePlayerAPI(videoId);
            }
        }, 2000);
    }
}

// HTML5動画用のモーダルを開く関数
function openVideoModal(videoSrc, title, posterSrc = null, userInteracted = false) {
    console.log('Opening video modal:', videoSrc, title, 'User interacted:', userInteracted);
    
    // 既存のタイムアウトをクリア
    if (apiCheckTimeout) {
        clearTimeout(apiCheckTimeout);
        apiCheckTimeout = null;
    }
    
    if (!modal || !modalTitle) {
        console.error('Modal elements not found');
        return;
    }
    
    modalTitle.textContent = title;
    modal.classList.add('show');
    // 初期状態では通常モーダル（後で動画の縦横比で調整）
    modal.classList.remove('modal-short');
    
    document.body.style.overflow = 'hidden';

    // HTML5 videoタグでモーダルに表示
    const container = document.querySelector('.video-container');
    
    if (!container) {
        console.error('Video container not found');
        return;
    }
    
    // 動画ファイルのパスを確認・修正
    let correctedVideoSrc = videoSrc;
    if (!videoSrc.startsWith('http') && !videoSrc.startsWith('/')) {
        // 相対パスの場合、現在のディレクトリからの相対パスに修正
        correctedVideoSrc = './' + videoSrc;
    }
    
    console.log('Corrected video src:', correctedVideoSrc);
    
    // まずコンテナのスタイルを確実に設定（通常の16:9）
    container.style.cssText = `
        position: relative;
        width: 100%;
        height: 0;
        padding-bottom: 56.25%;
        background: #000;
    `;
    
    // ユーザーが操作した場合は音声ありで再生、そうでなければミュート
    const shouldAutoplay = userInteracted;
    const shouldMute = !userInteracted;
    
    const videoHTML = `
        <video 
            id="modalVideo" 
            controls 
            ${shouldAutoplay ? 'autoplay' : ''}
            ${shouldMute ? 'muted' : ''}
            playsinline 
            preload="metadata"
            style="
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: contain;
                background: #000;
            "
            ${posterSrc ? `poster="${posterSrc}"` : ''}
        >
            <source src="${correctedVideoSrc}" type="video/mp4">
            <source src="${videoSrc}" type="video/mp4">
            お使いのブラウザは動画再生に対応していません。
        </video>
    `;
    
    container.innerHTML = videoHTML;
    
    // 動画の読み込みとエラーハンドリング
    const video = document.getElementById('modalVideo');
    
    if (video) {
        // より詳細なイベントリスナー
        video.addEventListener('loadstart', function() {
            console.log('Video loading started');
        });
        
        video.addEventListener('loadedmetadata', function() {
            console.log('Video metadata loaded');
            console.log('Video dimensions:', this.videoWidth, 'x', this.videoHeight);
            console.log('Video duration:', this.duration);
            
            // 縦横比を判定して適切なモーダルスタイルを適用
            const aspectRatio = this.videoWidth / this.videoHeight;
            console.log('Video aspect ratio:', aspectRatio);
            
            if (aspectRatio < 1) {
                // 縦長動画の場合（9:16など）
                console.log('Detected vertical video, applying modal-short class');
                modal.classList.add('modal-short');
                
                // 縦長動画用のコンテナスタイル
                container.style.cssText = `
                    position: relative;
                    width: 100%;
                    height: 100%;
                    background: #000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                `;
            } else {
                // 横長動画の場合（16:9など）
                console.log('Detected horizontal video, keeping standard modal');
                modal.classList.remove('modal-short');
                
                // 横長動画用のコンテナスタイル
                container.style.cssText = `
                    position: relative;
                    width: 100%;
                    height: 0;
                    padding-bottom: 56.25%;
                    background: #000;
                `;
            }
        });
        
        video.addEventListener('loadeddata', function() {
            console.log('Video loaded successfully');
            console.log('Video ready state:', this.readyState);
        });
        
        video.addEventListener('canplay', function() {
            console.log('Video can play');
            console.log('Video element dimensions:', this.offsetWidth, 'x', this.offsetHeight);
            
            // ユーザーが操作した場合は音声ありで自動再生
            if (userInteracted) {
                console.log('User interacted, playing with sound');
                this.muted = false;
                this.volume = 1.0;
                
                this.play().then(() => {
                    console.log('Video playing successfully with sound');
                }).catch(function(error) {
                    console.log('Autoplay with sound failed:', error);
                    // 音声ありの自動再生が失敗した場合、再生ボタンを表示
                    showPlayButton(container, false); // false = 音声あり
                });
            } else {
                // ユーザー操作なしの場合はミュートで自動再生を試みる
                this.muted = true;
                this.play().then(() => {
                    console.log('Video playing successfully (muted)');
                    // ミュート解除ボタンを表示
                    showUnmuteButton();
                }).catch(function(error) {
                    console.log('Autoplay failed:', error);
                    // 再生ボタンを表示
                    showPlayButton(container, true); // true = ミュート
                });
            }
        });
        
        video.addEventListener('error', function(e) {
            console.error('Video loading error:', e);
            console.error('Video error details:', this.error);
            
            // エラーの詳細を表示
            let errorMessage = '動画の読み込みに失敗しました';
            if (this.error) {
                switch(this.error.code) {
                    case 1:
                        errorMessage = '動画の読み込みが中断されました';
                        break;
                    case 2:
                        errorMessage = 'ネットワークエラーが発生しました';
                        break;
                    case 3:
                        errorMessage = '動画のデコードでエラーが発生しました';
                        break;
                    case 4:
                        errorMessage = '動画形式がサポートされていません';
                        break;
                }
            }
            
            container.innerHTML = `
                <div style="
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    height: 100%; 
                    color: #666; 
                    font-size: 16px;
                    text-align: center;
                    padding: 20px;
                ">
                    ${errorMessage}<br>
                    <small>パス: ${videoSrc}</small>
                </div>
            `;
        });
        
        // 動画ファイルの存在確認
        fetch(correctedVideoSrc, { method: 'HEAD' })
            .then(response => {
                if (!response.ok) {
                    console.error('Video file not found:', correctedVideoSrc);
                    // 元のパスも試す
                    return fetch(videoSrc, { method: 'HEAD' });
                }
                console.log('Video file found:', correctedVideoSrc);
                return response;
            })
            .then(response => {
                if (!response.ok) {
                    console.error('Video file not found:', videoSrc);
                    throw new Error('Video file not accessible');
                }
            })
            .catch(error => {
                console.error('Video file check failed:', error);
                container.innerHTML = `
                    <div style="
                        display: flex; 
                        align-items: center; 
                        justify-content: center; 
                        height: 100%; 
                        color: #666; 
                        font-size: 16px;
                        text-align: center;
                        padding: 20px;
                    ">
                        動画ファイルが見つかりません<br>
                        <small>パス: ${videoSrc}</small>
                    </div>
                `;
            });
    }
}

// Player APIを使用した再生（バックアップ）
function checkAndUsePlayerAPI(videoId) {
    // 既に正常に再生されている場合は何もしない
    const iframe = document.getElementById('videoFrame');
    if (iframe && iframe.contentWindow) {
        return;
    }
    
    // 既存のプレイヤーがあれば破棄
    if (player) {
        try {
            if (player.destroy) {
                player.destroy();
            }
        } catch (e) {
            console.log('Error destroying existing player:', e);
        }
        player = null;
    }
    
    const container = document.querySelector('.video-container');
    container.innerHTML = '<div id="youtube-player"></div>';
    
    player = new YT.Player('youtube-player', {
        width: '100%',
        height: '100%',
        videoId: videoId,
        playerVars: {
            'autoplay': 1,
            'controls': 1,
            'rel': 0,
            'modestbranding': 1,
            'iv_load_policy': 3,
            'playsinline': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

// プレイヤーが準備完了時
function onPlayerReady(event) {
    // 音声付きで再生を試みる
    event.target.unMute();
    event.target.setVolume(100);
    event.target.playVideo();
    
    // それでもミュートされている場合はボタンを表示
    setTimeout(() => {
        if (event.target.isMuted && event.target.isMuted()) {
            showUnmuteButton();
        }
    }, 500);
}

// プレイヤーの状態変更時
function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
        // 再生中の処理
        console.log('Video is playing');
    }
}

// 再生ボタンを表示する関数
function showPlayButton(container, muted = true) {
    const playBtn = document.createElement('button');
    playBtn.innerHTML = muted ? '🔇 再生（音声なし）' : '▶ 再生';
    playBtn.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        border: none;
        padding: 15px 30px;
        border-radius: 25px;
        cursor: pointer;
        font-size: 16px;
        z-index: 1001;
    `;
    
    playBtn.onclick = function() {
        const video = document.getElementById('modalVideo');
        if (video) {
            if (!muted) {
                video.muted = false;
                video.volume = 1.0;
            }
            video.play();
            this.remove();
            
            if (muted) {
                // ミュート状態で再生した場合、ミュート解除ボタンを表示
                setTimeout(() => {
                    showUnmuteButton();
                }, 1000);
            }
        }
    };
    
    container.appendChild(playBtn);
}

// ミュート解除ボタンを表示（HTML5動画用）
function showUnmuteButton() {
    // 既存のボタンがあれば削除
    const existingBtn = document.querySelector('.unmute-btn');
    if (existingBtn) {
        existingBtn.remove();
    }
    
    // ミュート解除ボタンを作成
    const unmuteBtn = document.createElement('button');
    unmuteBtn.className = 'unmute-btn';
    unmuteBtn.innerHTML = '🔇 音声をオンにする';
    unmuteBtn.style.cssText = `
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
        z-index: 1000;
        transition: all 0.3s ease;
    `;
    
    unmuteBtn.onmouseover = function() {
        this.style.background = 'rgba(255, 0, 0, 0.8)';
    };
    
    unmuteBtn.onmouseout = function() {
        this.style.background = 'rgba(0, 0, 0, 0.8)';
    };
    
    unmuteBtn.onclick = function() {
        const video = document.getElementById('modalVideo');
        if (video) {
            video.muted = false;
            video.volume = 1.0;
            this.innerHTML = '🔊 音声オン';
            setTimeout(() => {
                this.style.display = 'none';
            }, 1000);
        } else if (player && player.unMute) {
            // YouTube動画の場合のフォールバック
            player.unMute();
            player.setVolume(100);
            this.innerHTML = '🔊 音声オン';
            setTimeout(() => {
                this.style.display = 'none';
            }, 1000);
        } else {
            // iframeの場合は新しいウィンドウで開く
            const iframe = document.getElementById('videoFrame');
            if (iframe) {
                const src = iframe.src;
                const newSrc = src.replace('mute=1', 'mute=0');
                iframe.src = newSrc;
                this.style.display = 'none';
            }
        }
    };
    
    document.querySelector('.modal-content').appendChild(unmuteBtn);
}

// モーダルを閉じる関数
function closeModal() {
    console.log('Closing modal');
    
    // タイムアウトをクリア
    if (apiCheckTimeout) {
        clearTimeout(apiCheckTimeout);
        apiCheckTimeout = null;
    }
    
    // YouTube動画を停止
    if (player && player.stopVideo) {
        try {
            player.stopVideo();
        } catch (e) {
            console.log('Error stopping YouTube video:', e);
        }
    }
    
    // YouTubeのiframeの場合も停止を試みる
    const iframe = document.getElementById('videoFrame');
    if (iframe) {
        iframe.src = '';
    }
    
    // HTML5動画を完全に停止・リセット
    const modalVideo = document.getElementById('modalVideo');
    if (modalVideo) {
        console.log('Stopping and resetting HTML5 video');
        
        // 再生を停止
        modalVideo.pause();
        
        // 時間をリセット
        modalVideo.currentTime = 0;
        
        // 音量とミュート状態をリセット
        modalVideo.volume = 1.0;
        modalVideo.muted = false;
        
        // ソースを削除して完全に停止
        modalVideo.removeAttribute('src');
        modalVideo.innerHTML = '';
        
        // 強制的にリロード
        modalVideo.load();
        
        console.log('HTML5 video reset complete');
    }
    
    // コンテナを即座にクリア
    const container = document.querySelector('.video-container');
    if (container) {
        container.innerHTML = '';
        // コンテナのスタイルもリセット
        container.style.cssText = '';
    }
    
    // YouTube Playerを破棄
    if (player) {
        try {
            if (player.destroy) {
                player.destroy();
            }
        } catch (e) {
            console.log('Error destroying player:', e);
        }
        player = null;
    }
    
    // モーダルを非表示
    if (modal) {
        modal.classList.remove('show');
        modal.classList.remove('modal-short');
    }
    document.body.style.overflow = 'auto';
    
    // ミュート解除ボタンを削除
    const unmuteBtn = document.querySelector('.unmute-btn');
    if (unmuteBtn) {
        unmuteBtn.remove();
    }
    
    // 再生ボタンも削除
    const playBtn = document.querySelector('button[style*="z-index: 1001"]');
    if (playBtn) {
        playBtn.remove();
    }
    
    console.log('Modal closed and cleaned up');
}

// DOM読み込み完了後の処理
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up all video events');
    
    // liタグのクリックイベント（通常YouTube動画）
    const workItems = document.querySelectorAll('.youtube-works li');
    
    workItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const slideElement = this.closest('.swiper-slide');
            if (!slideElement) {
                console.error('Could not find slide element');
                return;
            }
            
            const videoId = slideElement.getAttribute('data-video-id');
            const category = slideElement.getAttribute('data-category') || slideElement.querySelector('.youtube-head').textContent;
            const workType = this.textContent.trim();
            
            if (!videoId || videoId === 'xxxxxxxxxxx') {
                console.error('Valid Video ID not found');
                alert('この動画はまだ準備中です。');
                return;
            }
            
            const title = `${category} - ${workType}`;
            openModal(videoId, title, false);
        });
    });

    // サムネイルのクリックイベント（通常YouTube動画）
    const thumbnails = document.querySelectorAll('.youtube-thumb');
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const slideElement = this.closest('.swiper-slide');
            if (!slideElement) {
                console.error('Could not find slide element');
                return;
            }
            
            const videoId = slideElement.getAttribute('data-video-id');
            const category = slideElement.getAttribute('data-category') || slideElement.querySelector('.youtube-head').textContent;
            
            if (!videoId || videoId === 'xxxxxxxxxxx') {
                console.error('Valid Video ID not found');
                alert('この動画はまだ準備中です。');
                return;
            }
            
            openModal(videoId, category, false);
        });
    });
    
    // ショート動画のクリックイベント
    const shortVideos = document.querySelectorAll('#swiper-short .video-vertical');
    shortVideos.forEach(video => {
        video.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const slideElement = this.closest('.swiper-slide');
            if (!slideElement) {
                console.error('Could not find slide element');
                return;
            }
            
            const videoId = slideElement.getAttribute('data-video-id');
            
            if (!videoId || videoId === 'xxxxxxxxxx') {
                console.error('Valid Video ID not found');
                alert('この動画はまだ準備中です。');
                return;
            }
            
            openModal(videoId, 'ショート動画', true);
        });
    });
    
    // ショート動画のフルスクリーン再生ボタン
    const fullscreenBtn = document.querySelector('.fullscreen-btn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // 現在のスライドのvideo IDを取得
            const activeSlide = document.querySelector('#swiper-short .swiper-slide-active');
            if (activeSlide) {
                const videoId = activeSlide.getAttribute('data-video-id');
                if (videoId && videoId !== 'xxxxxxxxxx') {
                    openModal(videoId, 'ショート動画 - フルスクリーン', true);
                } else {
                    // logic-videoがある場合はそれを再生
                    const logicVideo = document.querySelector('.logic-video');
                    if (logicVideo) {
                        logicVideo.click();
                    } else {
                        alert('動画を選択してください。');
                    }
                }
            } else {
                // logic-videoがある場合はそれを再生
                const logicVideo = document.querySelector('.logic-video');
                if (logicVideo) {
                    logicVideo.click();
                } else {
                    alert('動画を選択してください。');
                }
            }
        });
    }

    // logic-videoのクリックイベントを追加
    const logicVideos = document.querySelectorAll('.logic-video');
    console.log('Found logic videos:', logicVideos.length);
    
    logicVideos.forEach((video, index) => {
        console.log(`Setting up video ${index}:`, video);
        console.log('Video element:', video);
        console.log('Video src:', video.getAttribute('src'));
        console.log('Video computed style display:', window.getComputedStyle(video).display);
        console.log('Video computed style pointer-events:', window.getComputedStyle(video).pointerEvents);
        
        // 複数のイベントでテスト
        ['click', 'touchstart', 'mousedown'].forEach(eventType => {
            video.addEventListener(eventType, function(e) {
                console.log(`Logic video ${eventType} event triggered`);
                
                if (eventType === 'click') {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log('Logic video clicked');
                    
                    const videoSrc = this.getAttribute('src');
                    const posterSrc = this.getAttribute('poster');
                    
                    console.log('Video src:', videoSrc);
                    console.log('Poster src:', posterSrc);
                    
                    if (!videoSrc) {
                        console.error('Video source not found');
                        alert('動画ファイルが見つかりません。');
                        return;
                    }
                    
                    // 動画ファイル名から適切なタイトルを生成
                    const fileName = videoSrc.split('/').pop().split('.')[0];
                    const title = fileName.charAt(0).toUpperCase() + fileName.slice(1) + ' 動画';
                    
                    console.log('Opening modal with title:', title);
                    // ユーザーが直接クリックしたので音声ありで再生
                    openVideoModal(videoSrc, title, posterSrc, true);
                }
            });
        });
        
        // ホバー効果を追加
        video.style.cursor = 'pointer';
        video.style.pointerEvents = 'auto'; // 明示的に設定
        
        video.addEventListener('mouseenter', function() {
            console.log('Mouse entered video');
            this.style.opacity = '0.8';
            this.style.transition = 'opacity 0.3s ease';
        });
        
        video.addEventListener('mouseleave', function() {
            console.log('Mouse left video');
            this.style.opacity = '1';
        });
    });

    // 動画プレースホルダー全体をクリッカブルにする
    const videoPlaceholders = document.querySelectorAll('.video-placeholder');
    console.log('Found video placeholders:', videoPlaceholders.length);
    
    videoPlaceholders.forEach((placeholder, index) => {
        console.log(`Setting up placeholder ${index}:`, placeholder);
        
        placeholder.style.cursor = 'pointer';
        placeholder.style.pointerEvents = 'auto'; // 明示的に設定
        
        // 複数のイベントでテスト
        ['click', 'touchstart'].forEach(eventType => {
            placeholder.addEventListener(eventType, function(e) {
                console.log(`Video placeholder ${eventType} event triggered`);
                
                if (eventType === 'click') {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log('Video placeholder clicked');
                    
                    const video = this.querySelector('.logic-video');
                    if (video) {
                        console.log('Found video in placeholder, triggering click');
                        
                        // 直接openVideoModalを呼び出す
                        const videoSrc = video.getAttribute('src');
                        const posterSrc = video.getAttribute('poster');
                        
                        if (videoSrc) {
                            const fileName = videoSrc.split('/').pop().split('.')[0];
                            const title = fileName.charAt(0).toUpperCase() + fileName.slice(1) + ' 動画';
                            // ユーザーが直接クリックしたので音声ありで再生
                            openVideoModal(videoSrc, title, posterSrc, true);
                        } else {
                            console.error('No video src found');
                        }
                    } else {
                        console.log('No video found in placeholder');
                    }
                }
            });
        });
        
        // ホバー効果
        placeholder.addEventListener('mouseenter', function() {
            console.log('Mouse entered placeholder');
            this.style.opacity = '0.9';
            this.style.transition = 'opacity 0.3s ease';
        });
        
        placeholder.addEventListener('mouseleave', function() {
            console.log('Mouse left placeholder');
            this.style.opacity = '1';
        });
    });

});

// モーダル外クリックで閉じる
if (modal) {
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// ESCキーでモーダルを閉じる
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal && modal.classList.contains('show')) {
        closeModal();
    }
});

// モーダルコンテンツ内でのクリックは伝播を停止
const modalContent = document.querySelector('.modal-content');
if (modalContent) {
    modalContent.addEventListener('click', function(e) {
        e.stopPropagation();
    });
}

// フォーム

// URLパラメータまたはリファラーに基づいてセレクトボックスを自動選択
function setInquiryType() {
    const inquiryTypeSelect = document.getElementById('inquiryType');
    if (!inquiryTypeSelect) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    
    // URLパラメータから判定
    if (type === 'contact') {
        inquiryTypeSelect.value = 'お見積り・お問い合わせ';
    } else if (type === 'request') {
        inquiryTypeSelect.value = '資料請求';
    } else {
        // sessionStorageから判定
        const clickType = sessionStorage.getItem('inquiryClickType');
        if (clickType === 'contact') {
            inquiryTypeSelect.value = 'お見積り・お問い合わせ';
            sessionStorage.removeItem('inquiryClickType');
        } else if (clickType === 'request') {
            inquiryTypeSelect.value = '資料請求';
            sessionStorage.removeItem('inquiryClickType');
        }
    }
}

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', function() {
    setInquiryType();
});

// contact-setクラスまたはrequest-setクラスの要素にイベントリスナーを追加
document.addEventListener('click', function(e) {
    const contactElement = e.target.closest('.contact-set');
    const requestElement = e.target.closest('.request-set');
    
    if (contactElement) {
        sessionStorage.setItem('inquiryClickType', 'contact');
        // 少し遅延させてからセレクトボックスを設定
        setTimeout(function() {
            setInquiryType();
        }, 100);
    } else if (requestElement) {
        sessionStorage.setItem('inquiryClickType', 'request');
        // 少し遅延させてからセレクトボックスを設定
        setTimeout(function() {
            setInquiryType();
        }, 100);
    }
});

// ハッシュ変更時にも実行（アンカーリンク対応）
window.addEventListener('hashchange', function() {
    if (window.location.hash === '#contact') {
        setTimeout(function() {
            setInquiryType();
        }, 100);
    }
});

// 「その他」チェックボックスの制御
document.addEventListener('DOMContentLoaded', function() {
    const otherCheckbox = document.getElementById('other');
    const otherInputGroup = document.getElementById('otherInputGroup');
    const otherInput = document.getElementById('otherSns');

    if (otherCheckbox && otherInputGroup && otherInput) {
        otherCheckbox.addEventListener('change', function() {
            if (this.checked) {
                otherInputGroup.style.display = 'block';
                otherInput.required = true;
            } else {
                otherInputGroup.style.display = 'none';
                otherInput.required = false;
                otherInput.value = '';
            }
        });
    }

    // フォーム送信処理
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // フォームバリデーション
            const requiredFields = document.querySelectorAll('input[required], textarea[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#e74c3c';
                } else {
                    field.style.borderColor = '#ddd';
                }
            });
            
            // SNSチェックボックスのバリデーション
            const snsCheckboxes = document.querySelectorAll('input[name="運用検討中のSNS[]"]');
            const snsChecked = Array.from(snsCheckboxes).some(checkbox => checkbox.checked);
            
            if (!snsChecked) {
                isValid = false;
                alert('運用検討中のSNSを少なくとも1つ選択してください。');
                return;
            }

            // 「その他」が選択されている場合の入力チェック
            if (otherCheckbox && otherCheckbox.checked && otherInput && !otherInput.value.trim()) {
                isValid = false;
                otherInput.style.borderColor = '#e74c3c';
                alert('「その他」を選択した場合は、SNS名を入力してください。');
                return;
            }

            const privacyCheckbox = document.getElementById('privacy');
            if (!privacyCheckbox.checked) {
                isValid = false;
                alert('個人情報保護方針に同意してください。');
                return;
            }
            
            if (isValid) {
                this.submit();
            } else {
                alert('必須項目をすべて入力してください。');
            }
        });
    }

    // リアルタイムバリデーション
    document.querySelectorAll('.form-input, .form-textarea').forEach(field => {
        field.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value.trim()) {
                this.style.borderColor = '#e74c3c';
            } else {
                this.style.borderColor = '#ddd';
            }
        });
    });
});