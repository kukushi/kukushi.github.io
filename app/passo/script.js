const STORE_LINKS = {
    ios: "https://apps.apple.com/app/id6757607918",
    mac: "https://apps.apple.com/app/id6757607918"
};

document.querySelectorAll("[data-store-link]").forEach((link) => {
    const target = link.getAttribute("data-store-link");
    if (target && STORE_LINKS[target]) {
        link.setAttribute("href", STORE_LINKS[target]);
    }
});

const translations = {
    en: {
        title: "Passo | Password Manager",
        description: "Passo is a beautiful, native password manager for iPhone and Mac with local libraries, biometric unlock, iCloud sync, and passkeys.",
        nav_features: "Features",
        nav_platforms: "Platforms",
        nav_privacy: "Privacy",
        cta_get: "Get Passo",
        hero_eyebrow: "<span class=\"pulse-dot\"></span> Next-gen Password Manager",
        hero_title: "Passwords &amp; passkeys,<br> <span class=\"text-gradient\">kept beautiful.</span>",
        hero_text: "Passo gives you one stunningly secure password manager for iPhone and Mac, featuring instantaneous unlock, seamless iCloud sync, and native biometric integration.",
        hero_dl_ios: "Download for iOS",
        hero_dl_mac: "Download for Mac",
        point_local: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\"></path></svg> Local Library",
        point_bio: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 7V5a2 2 0 0 1 2-2h2\"/><path d=\"M17 3h2a2 2 0 0 1 2 2v2\"/><path d=\"M21 17v2a2 2 0 0 1-2 2h-2\"/><path d=\"M7 21H5a2 2 0 0 1-2-2v-2\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/></svg> Face ID / Touch ID",
        point_sync: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M17.5 19c2.485 0 4.5-2.015 4.5-4.5S19.985 10 17.5 10c-.394 0-.77.05-1.127.143A6.985 6.985 0 0 0 10 4a7 7 0 0 0-6.91 8A4.5 4.5 0 0 0 4.5 21H17z\"></path></svg> iCloud sync",
        mock_all: "<div class=\"mock-icon\"></div> All Items",
        mock_fav: "<div class=\"mock-icon star\"></div> Favorites",
        mock_passkeys: "<div class=\"mock-icon key\"></div> Passkeys",
        mock_cards: "<div class=\"mock-icon card\"></div> Cards",
        mock_search: "<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"11\" cy=\"11\" r=\"8\"></circle><path d=\"m21 21-4.35-4.35\"></path></svg> Search passwords...",
        mock_unlocked: "Unlocked",
        feat_eyebrow: "Core features",
        feat_title: "Everything important,<br>without the noise.",
        feat1_title: "Secure by default",
        feat1_desc: "Local encrypted libraries and seamless biometric unlock support right out of the box.",
        feat2_title: "Moves with you",
        feat2_desc: "End-to-end encrypted iCloud sync keeps your credentials updated across all Apple devices.",
        feat3_title: "Easy to switch",
        feat3_desc: "Import instantly from 1Password, Bitwarden, Apple Passwords, Elpass, or a Passo export anytime.",
        feat4_title: "Browser-ready",
        feat4_desc: "Lightning-fast autofill for Safari and Chrome with native iOS and macOS extension support.",
        cta_eyebrow: "Get Passo",
        cta_title: "Clean, native password management for iPhone and Mac.",
        cta_dl_ios: "Download for iPhone",
        cta_dl_mac: "Download for Mac",
        chip_ios: "iOS &amp; iPadOS",
        chip_mac: "macOS Native",
        chip_safari: "Safari Extension",
        chip_passkeys: "Passkeys"
    },
    zh: {
        title: "Passo | 密码管理器",
        description: "Passo 是一款为 iPhone 和 Mac 打造的密码管理器，原生且精美。提供本地密码库、生物识别解锁、iCloud 同步及通行密钥支持。",
        nav_features: "功能",
        nav_platforms: "平台",
        nav_privacy: "隐私",
        cta_get: "获取 Passo",
        hero_eyebrow: "<span class=\"pulse-dot\"></span> 新一代密码管理器",
        hero_title: "密码与通行密钥，<br> <span class=\"text-gradient\">本该如此优美。</span>",
        hero_text: "Passo 是一款极为安全且赏心悦目的 iPhone 和 Mac 密码管理器。带来瞬间解锁、无缝 iCloud 同步以及原生的生物识别集成体验。",
        hero_dl_ios: "下载 iOS 版",
        hero_dl_mac: "下载 Mac 版",
        point_local: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\"></path></svg> 本地密码库",
        point_bio: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 7V5a2 2 0 0 1 2-2h2\"/><path d=\"M17 3h2a2 2 0 0 1 2 2v2\"/><path d=\"M21 17v2a2 2 0 0 1-2 2h-2\"/><path d=\"M7 21H5a2 2 0 0 1-2-2v-2\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/></svg> Face ID / Touch ID",
        point_sync: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M17.5 19c2.485 0 4.5-2.015 4.5-4.5S19.985 10 17.5 10c-.394 0-.77.05-1.127.143A6.985 6.985 0 0 0 10 4a7 7 0 0 0-6.91 8A4.5 4.5 0 0 0 4.5 21H17z\"></path></svg> iCloud 同步",
        mock_all: "<div class=\"mock-icon\"></div> 所有项目",
        mock_fav: "<div class=\"mock-icon star\"></div> 个人收藏",
        mock_passkeys: "<div class=\"mock-icon key\"></div> 通行密钥",
        mock_cards: "<div class=\"mock-icon card\"></div> 银行卡",
        mock_search: "<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"11\" cy=\"11\" r=\"8\"></circle><path d=\"m21 21-4.35-4.35\"></path></svg> 搜索密码...",
        mock_unlocked: "已解锁",
        feat_eyebrow: "核心功能",
        feat_title: "恰到好处的强大，<br>剔除所有繁杂。",
        feat1_title: "生来安全",
        feat1_desc: "开箱即用：本地加密存储，无缝支持生物识别解锁。",
        feat2_title: "如影随形",
        feat2_desc: "通过端到端加密的 iCloud 同步功能，让你的凭证在所有 Apple 设备间实时更新。",
        feat3_title: "轻松迁移",
        feat3_desc: "支持从 1Password、Bitwarden、Apple 密码、Elpass 一键导入，也能随时恢复 Passo 备份。",
        feat4_title: "完美支持浏览器",
        feat4_desc: "提供原生 iOS 与 macOS 扩展支持，在 Safari 和 Chrome 中体验极速自动填充。",
        cta_eyebrow: "获取 Passo",
        cta_title: "纯粹、原生的 iPhone 和 Mac 密码管理体验。",
        cta_dl_ios: "下载 iPhone 版",
        cta_dl_mac: "下载 Mac 版",
        chip_ios: "iOS &amp; iPadOS",
        chip_mac: "macOS 原生",
        chip_safari: "Safari 扩展",
        chip_passkeys: "通行密钥"
    },
    ja: {
        title: "Passo | パスワードマネージャー",
        description: "Passoは、iPhoneとMacのために作られた、美しくネイティブなパスワードマネージャーです。ローカルライブラリ、生体認証、iCloud同期、パスキーに完全対応しています。",
        nav_features: "機能",
        nav_platforms: "プラットフォーム",
        nav_privacy: "プライバシー",
        cta_get: "Passoを入手",
        hero_eyebrow: "<span class=\"pulse-dot\"></span> 次世代のパスワードマネージャー",
        hero_title: "パスワードとパスキーに、<br> <span class=\"text-gradient\">かつてない美しさを。</span>",
        hero_text: "Passoは、iPhoneとMacのためにデザインされた、安全で美しいパスワードマネージャー。瞬時のロック解除、シームレスなiCloud同期、そしてネイティブな生体認証で、あなたのデジタルライフを守ります。",
        hero_dl_ios: "iOS版をダウンロード",
        hero_dl_mac: "Mac版をダウンロード",
        point_local: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\"></path></svg> ローカル保存",
        point_bio: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 7V5a2 2 0 0 1 2-2h2\"/><path d=\"M17 3h2a2 2 0 0 1 2 2v2\"/><path d=\"M21 17v2a2 2 0 0 1-2 2h-2\"/><path d=\"M7 21H5a2 2 0 0 1-2-2v-2\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/></svg> Face ID / Touch ID",
        point_sync: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M17.5 19c2.485 0 4.5-2.015 4.5-4.5S19.985 10 17.5 10c-.394 0-.77.05-1.127.143A6.985 6.985 0 0 0 10 4a7 7 0 0 0-6.91 8A4.5 4.5 0 0 0 4.5 21H17z\"></path></svg> iCloud 同期",
        mock_all: "<div class=\"mock-icon\"></div> すべての項目",
        mock_fav: "<div class=\"mock-icon star\"></div> お気に入り",
        mock_passkeys: "<div class=\"mock-icon key\"></div> パスキー",
        mock_cards: "<div class=\"mock-icon card\"></div> カード",
        mock_search: "<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"11\" cy=\"11\" r=\"8\"></circle><path d=\"m21 21-4.35-4.35\"></path></svg> パスワードを検索...",
        mock_unlocked: "ロック解除済み",
        feat_eyebrow: "コア機能",
        feat_title: "洗練されたシンプルさの中に、<br>必要なすべてを。",
        feat1_title: "妥協のないセキュリティ",
        feat1_desc: "暗号化されたローカルライブラリと、シームレスな生体認証を標準サポート。",
        feat2_title: "いつでも、どこでも",
        feat2_desc: "エンドツーエンドで暗号化されたiCloud同期により、すべてのAppleデバイス間で認証情報を常に最新に保ちます。",
        feat3_title: "スムーズな移行",
        feat3_desc: "1Password、Bitwarden、Appleパスワード、Elpassからワンクリックでインポート。Passoのエクスポートファイルもいつでもインポートできます。",
        feat4_title: "ブラウザにも完璧に統合",
        feat4_desc: "ネイティブのiOSおよびmacOS拡張機能により、SafariやChromeでの超高速な自動入力を実現します。",
        cta_eyebrow: "Passoを入手",
        cta_title: "iPhoneとMacのための、洗練されたネイティブなパスワード管理体験。",
        cta_dl_ios: "iPhone版をダウンロード",
        cta_dl_mac: "Mac版をダウンロード",
        chip_ios: "iOS &amp; iPadOS",
        chip_mac: "macOS ネイティブ",
        chip_safari: "Safari 拡張機能",
        chip_passkeys: "パスキー"
    }
};

window.setLanguage = function(lang) {
    if (!translations[lang]) return;
    
    document.documentElement.lang = lang;
    localStorage.setItem('passo_lang', lang);
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            if (key === 'title') {
                document.title = translations[lang][key];
            } else if (key === 'description') {
                el.setAttribute('content', translations[lang][key]);
            } else {
                el.innerHTML = translations[lang][key];
            }
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('passo_lang');
    const browserLang = navigator.language.slice(0, 2);
    
    let defaultLang = 'en';
    if (savedLang && translations[savedLang]) {
        defaultLang = savedLang;
    } else if (translations[browserLang]) {
        defaultLang = browserLang;
    }
    
    const select = document.getElementById('lang-select');
    if (select) {
        select.value = defaultLang;
    }
    setLanguage(defaultLang);
});
