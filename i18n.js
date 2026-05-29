/**
 * ABC Global Church - Internationalization (i18n) System
 * Supports: English (en) and Swahili (sw)
 * 
 * How it works:
 * - Adds a floating language toggle button (EN/SW) on the homepage only
 * - Uses data-i18n attributes on HTML elements to mark translatable text
 * - Stores the user's language preference in localStorage
 * - Automatically translates all elements with data-i18n on page load
 * - Works with SPA navigation (re-translates after page swaps)
 * - Also translates placeholder, aria-label, and title attributes
 */

(function() {
    'use strict';

    // ============================================
    // TRANSLATION DICTIONARIES
    // ============================================
    const translations = {
        en: {
            // --- Homepage ---
            'home.tagline.line1': 'RAISING A FIREBRAND GENERATION',
            'home.tagline.line2': 'HOLY UNTO GOD',
            'home.menu.verse': '"Here am I, and the children the LORD has given me — we are signs and symbols in Israel from the LORD Almighty." — Isaiah 8:18',

            // --- Navigation ---
            'nav.give': 'Give',
            'nav.testimonies': 'Testimonies',
            'nav.prayer': 'Prayer',
            'nav.connect': 'Connect',
            'nav.branches': 'Branches',
            'nav.history': 'History',
            'nav.back': 'Back',

            // --- Radio Player ---
            'radio.label': 'ABC RADIO',
            'radio.offline': 'Offline',
            'radio.connecting': 'Connecting...',
            'radio.live': 'LIVE',
            'radio.popup.title': 'ABC GLOBAL RADIO',
            'radio.popup.now': 'ABC GLOBAL RADIO',
            'radio.popup.back': 'Go Back',
            'radio.popup.connecting': 'Connecting...',
            'radio.popup.share_text': 'Share this link with others so they can',
            'radio.popup.share_highlight': 'listen to the Word of God',
            'radio.popup.share_btn': 'Share',
            'radio.autoplay.text': 'Listen to',
            'radio.autoplay.play': 'Play',
            'radio.autoplay.dismiss': 'Not Now',

            // --- Radio Visualizer & Share ---
            'radio.viz.bars': 'Bars',
            'radio.viz.circular': 'Ring',
            'radio.viz.particles': 'Particles',
            'radio.viz.spectrum': 'Curve',
            'radio.reconnecting': 'Reconnecting...',
            'radio.share.whatsapp': 'WhatsApp',
            'radio.share.text': "I'm listening to ABC Global Radio 🎵",

            // --- Giving Page ---
            'giving.heading': 'Give Cheerfully',
            'giving.subheading': 'Tithes & Offerings',
            'giving.tab_mobile': 'Mobile',
            'giving.tab_bank': 'Bank',
            'giving.vodampa': 'Voda / M-Pesa',
            'giving.tigo': 'Tigo / Mixx',
            'giving.crdb': 'CRDB Bank',
            'giving.copied': 'Copied!',

            // --- Prayer Page ---
            'prayer.heading': 'Share Your Prayer Request',
            'prayer.description': 'Our Lead Pastor and prayer team personally pray over every request.',
            'prayer.fullname': 'Full Name',
            'prayer.fullname_ph': 'John Doe',
            'prayer.category': 'Prayer Category',
            'prayer.category_ph': 'Select category',
            'prayer.cat_health': 'Health & Healing',
            'prayer.cat_family': 'Family & Relationships',
            'prayer.cat_financial': 'Financial Breakthrough',
            'prayer.cat_salvation': 'Salvation',
            'prayer.cat_career': 'Career & Purpose',
            'prayer.cat_character': 'Change of Character',
            'prayer.cat_marriage': 'Marriage',
            'prayer.cat_children': 'Children & Parenting',
            'prayer.cat_mental': 'Mental & Emotional Wellbeing',
            'prayer.cat_spiritual': 'Spiritual Growth',
            'prayer.cat_other': 'Other',
            'prayer.phone': 'Phone Number',
            'prayer.phone_ph': '712 345 678',
            'prayer.email': 'Email Address',
            'prayer.email_ph': 'name@email.com',
            'prayer.country': 'Country',
            'prayer.country_ph': 'Select country',
            'prayer.city': 'City / Area',
            'prayer.city_ph': 'Dar es Salaam',
            'prayer.request': 'Your Prayer Request',
            'prayer.request_ph': 'Type your prayer request here...',
            'prayer.call_opt': 'I am open to receiving a call',
            'prayer.submit': 'SEND MY PRAYER REQUEST',
            'prayer.success_heading': 'Thank You!',
            'prayer.success_msg': 'Be assured that your request has been received. Our Lead Pastor and prayer team will be praying over it.',
            'prayer.success_btn': 'SEND ANOTHER REQUEST',
            'prayer.verse': '"For where two or three gather in my name, there am I with them." — Matthew 18:20',
            'prayer.alert_required': 'Please fill out the required fields',
            'prayer.sending': 'Sending...',
            'prayer.error_server': 'Something went wrong. Please try again.',
            'prayer.error_network': 'Network error. Please check your connection and try again.',

            // --- Testimonies Page ---
            'testimonies.heading': 'Share Your Testimony',
            'testimonies.description': 'Your story has the power to encourage and bring hope to others.',
            'testimonies.fullname': 'Full Name',
            'testimonies.fullname_ph': 'John Doe',
            'testimonies.category': 'Testimony Category',
            'testimonies.category_ph': 'Select category',
            'testimonies.cat_health': 'Health & Healing',
            'testimonies.cat_family': 'Family & Relationships',
            'testimonies.cat_financial': 'Financial Breakthrough',
            'testimonies.cat_salvation': 'Salvation',
            'testimonies.cat_career': 'Career & Purpose',
            'testimonies.cat_character': 'Change of Character',
            'testimonies.cat_marriage': 'Marriage',
            'testimonies.cat_children': 'Children & Parenting',
            'testimonies.cat_mental': 'Mental & Emotional Wellbeing',
            'testimonies.cat_spiritual': 'Spiritual Growth',
            'testimonies.cat_other': 'Other',
            'testimonies.phone': 'Phone Number',
            'testimonies.phone_ph': '712 345 678',
            'testimonies.email': 'Email Address',
            'testimonies.email_ph': 'name@email.com',
            'testimonies.country': 'Country',
            'testimonies.country_ph': 'Select country',
            'testimonies.city': 'City / Area',
            'testimonies.city_ph': 'Dar es Salaam',
            'testimonies.testimony': 'Your Testimony',
            'testimonies.testimony_ph': 'Share what God has done in your life...',
            'testimonies.attach_picture': 'Attach Picture',
            'testimonies.choose_image': 'Choose Image',
            'testimonies.attach_audio': 'Attach Audio',
            'testimonies.choose_audio': 'Choose Audio',
            'testimonies.permit': 'I permit my testimony to be shared',
            'testimonies.submit': 'SUBMIT TESTIMONY',
            'testimonies.success_heading': 'Thank You!',
            'testimonies.success_msg': 'Your testimony has been submitted. We celebrate with you, and pray it encourages many!',
            'testimonies.success_btn': 'SHARE ANOTHER TESTIMONY',
            'testimonies.verse': '"And they overcame him by the blood of the Lamb, and by the word of their testimony." — Revelation 12:11',
            'testimonies.alert_required': 'Please fill out the required fields',
            'testimonies.sending': 'Sending...',
            'testimonies.error_server': 'Something went wrong. Please try again.',
            'testimonies.error_network': 'Network error. Please check your connection and try again.',

            // --- Connect Page ---
            'connect.heading': 'Connect',
            'connect.tab_bishop': 'Bishop Dickson',
            'connect.tab_abc': 'ABC Global',
            'connect.social_media': 'Social Media',
            'connect.podcasts': 'Podcasts',
            'connect.contact': 'Contact',
            'connect.address_label': 'Address',
            'connect.address': 'Ubungo - Kinzudi Goba, Dar es Salaam',
            'connect.phone_label': 'Phone',
            'connect.email_label': 'Email',
            'connect.verse': '"Go into all the world and proclaim the gospel to the whole creation." — Mark 16:15',

            // --- Branches Page ---
            'branches.heading': 'Our Branches',
            'branches.description': 'Find a location near you and join us for worship.',
            'branches.search_ph': 'Search by pastor or location...',
            'branches.no_phone': 'No phone available',
            'branches.no_results': 'No branches found matching your search.',
            'branches.verse': '"For where two or three gather in my name, there am I with them." — Matthew 18:20',

            // --- History Page ---
            'history.heading': 'Our History',
            'history.subtitle': 'A story of faith, resilience, and divine purpose',
            'history.founded_by': 'Founded By',
            'history.founder_title': 'Founder & General Overseer',
            'history.cofounder_title': 'Co-Founder',
            'history.est': 'Est. November 2016',
            'history.location': 'Kahama, Tanzania',
            'history.para1': 'ABC GLOBAL was founded in November 2016 in Kahama, Tanzania, by Bishop Dickson Corneli Kabigumila and his wife Mercy Ikupa. The church began its first gatherings under trees at a place called Nyahanga Kivulini — no building, no instruments, just believers coming together to worship and hear the Word of God. Those early days were simple, but the congregation grew steadily as people encountered God in a real and tangible way.',
            'history.para2': 'As the ministry expanded, it relocated to Dar es Salaam and established its headquarters in Kinzudi, Goba. From there, ABC GLOBAL began to plant branches across the country. Today, the church has multiple branches spread throughout Tanzania, each one committed to the same vision of raising a generation that is holy unto God. What started under the shade of trees has grown into a nationwide movement — and by God\'s grace, it continues to grow.',
            'history.invite': 'We invite you to be part of this story.',
            'history.invite_sub': 'Whether you are in Dar es Salaam, Kahama, or anywhere across Tanzania, there is a branch waiting to welcome you home.',
            'history.find_branch': 'Find a Branch Near You',
            'history.gallery': 'Our Journey in Pictures',
            'history.verse': '"For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, plans to give you hope and a future." — Jeremiah 29:11'
        },

        sw: {
            // --- Homepage ---
            'home.tagline.line1': 'KUKUZA KIZAZI CHENYE BIDII, KILICHOTENGWA,',
            'home.tagline.line2': 'KWA KAZI YA MUNGU',
            'home.menu.verse': '"Angalieni, mimi na watoto hawa niliopewa na BWANA tu ishara na ajabu." — Isaya 8:18',

            // --- Navigation ---
            'nav.give': 'Sadaka',
            'nav.testimonies': 'Shuhuda',
            'nav.prayer': 'Maombi',
            'nav.connect': 'Mawasiliano',
            'nav.branches': 'Matawi yetu',
            'nav.history': 'Historia',
            'nav.back': 'Rudi',

            // --- Radio Player ---
            'radio.label': 'REDIO YA ABC',
            'radio.offline': 'Hakuna Mtandao',
            'radio.connecting': 'Inaunganisha...',
            'radio.live': 'Live',
            'radio.popup.title': 'REDIO YA ABC GLOBAL',
            'radio.popup.now': 'REDIO YA ABC GLOBAL',
            'radio.popup.back': 'Rudi',
            'radio.popup.connecting': 'Inaunganisha...',
            'radio.popup.share_text': 'Shiriki na wengine',
            'radio.popup.share_highlight': 'kusikiliza Neno la Mungu',
            'radio.popup.share_btn': 'Shiriki',
            'radio.autoplay.text': 'Sikiliza',
            'radio.autoplay.play': 'Ndio',
            'radio.autoplay.dismiss': 'Sio Sasa',

            // --- Radio Visualizer & Share ---
            'radio.viz.bars': 'Mistari',
            'radio.viz.circular': 'Mduara',
            'radio.viz.particles': 'Vipande',
            'radio.viz.spectrum': 'Mkingo',
            'radio.reconnecting': 'Inaunganisha tena...',
            'radio.share.whatsapp': 'WhatsApp',
            'radio.share.text': 'Ninasikiliza Redio ya ABC Global 🎵',

            // --- Giving Page ---
            'giving.heading': 'Karibu kwa sadaka yako',
            'giving.subheading': 'Zaka & Sadaka',
            'giving.tab_mobile': 'Simu',
            'giving.tab_bank': 'Benki',
            'giving.vodampa': 'Voda / M-Pesa',
            'giving.tigo': 'Tigo / Mixx',
            'giving.crdb': 'Benki ya CRDB',
            'giving.copied': 'Imenakiliwa!',

            // --- Prayer Page ---
            'prayer.heading': 'Wasilisha Maombi yako',
            'prayer.description': 'Mchungaji wetu na timu ya maombi wanaomba pamoja nawe.',
            'prayer.fullname': 'Jina Kamili',
            'prayer.fullname_ph': 'Jina lako kamili',
            'prayer.category': 'Aina ya Ombi',
            'prayer.category_ph': 'Chagua aina',
            'prayer.cat_health': 'Afya na Uponyaji',
            'prayer.cat_family': 'Familia na Mahusiano',
            'prayer.cat_financial': 'Mafanikio ya Kiuchumi',
            'prayer.cat_salvation': 'Wokovu',
            'prayer.cat_career': 'Kazi na Kusudi',
            'prayer.cat_character': 'Mabadiliko ya Tabia',
            'prayer.cat_marriage': 'Ndoa',
            'prayer.cat_children': 'Watoto na Uzazi',
            'prayer.cat_mental': 'Afya ya Akili na Hisia',
            'prayer.cat_spiritual': 'Kukua Kiroho',
            'prayer.cat_other': 'Mengineyo',
            'prayer.phone': 'Nambari ya Simu',
            'prayer.phone_ph': '712 000 000',
            'prayer.email': 'Barua Pepe',
            'prayer.email_ph': 'jina@email.com',
            'prayer.country': 'Nchi',
            'prayer.country_ph': 'Chagua nchi',
            'prayer.city': 'Jiji / Eneo',
            'prayer.city_ph': 'Dar es Salaam',
            'prayer.request': 'Ombi lako la Maombi',
            'prayer.request_ph': 'Andika ombi lako la maombi hapa...',
            'prayer.call_opt': 'Niko tayari kuomba kwa njia ya simu',
            'prayer.submit': 'TUMA OMBI LANGU',
            'prayer.success_heading': 'Asante!',
            'prayer.success_msg': 'Ombi lako limepokelewa. Mchungaji wetu Mkuu na timu ya maombi watakuwa wakisali kwa ajili yako.',
            'prayer.success_btn': 'TUMA OMBI JINGINE',
            'prayer.verse': '"Kwa kuwa walipo wawili watatu wamekusanyika kwa jina langu, nami nipo papo hapo katikati yao." — Mathayo 18:20',
            'prayer.alert_required': 'Tafadhali jaza sehemu zinazohitajika',
            'prayer.sending': 'Inatuma...',
            'prayer.error_server': 'Hitilafu imetokea. Tafadhali jaribu tena.',
            'prayer.error_network': 'Hitilafu ya mtandao. Tafadhali angalia muunganisho wako na jaribu tena.',

            // --- Testimonies Page ---
            'testimonies.heading': 'Shiriki Ushuhuda Wako',
            'testimonies.description': 'Ushuhuda wako utainua imani na kuleta tumaini kwa wengine.',
            'testimonies.fullname': 'Jina Kamili',
            'testimonies.fullname_ph': 'Jina lako kamili',
            'testimonies.category': 'Aina ya Ushuhuda',
            'testimonies.category_ph': 'Chagua aina',
            'testimonies.cat_health': 'Afya na Uponyaji',
            'testimonies.cat_family': 'Familia na Mahusiano',
            'testimonies.cat_financial': 'Mafanikio ya Kiuchumi',
            'testimonies.cat_salvation': 'Wokovu',
            'testimonies.cat_career': 'Kazi na Kusudi',
            'testimonies.cat_character': 'Mabadiliko ya Tabia',
            'testimonies.cat_marriage': 'Ndoa',
            'testimonies.cat_children': 'Watoto na Uzazi',
            'testimonies.cat_mental': 'Afya ya Akili na Hisia',
            'testimonies.cat_spiritual': 'Kukua Kiroho',
            'testimonies.cat_other': 'Mengineyo',
            'testimonies.phone': 'Nambari ya Simu',
            'testimonies.phone_ph': '712 000 000',
            'testimonies.email': 'Barua Pepe',
            'testimonies.email_ph': 'jina@email.com',
            'testimonies.country': 'Nchi',
            'testimonies.country_ph': 'Chagua nchi',
            'testimonies.city': 'Jiji / Eneo',
            'testimonies.city_ph': 'Dar es Salaam',
            'testimonies.testimony': 'Ushuhuda Wako',
            'testimonies.testimony_ph': 'Shiriki aliychofanya Mungu katika maisha yako...',
            'testimonies.attach_picture': 'Ambatisha Picha',
            'testimonies.choose_image': 'Chagua Picha',
            'testimonies.attach_audio': 'Ambatisha Sauti',
            'testimonies.choose_audio': 'Chagua Sauti',
            'testimonies.permit': 'Ninaruhusu ushuhuda wangu kushirikishwa kwa wengine',
            'testimonies.submit': 'WASILISHA USHUHUDA',
            'testimonies.success_heading': 'Asante!',
            'testimonies.success_msg': 'Ushuhuda wako umewasilishwa. Tunasherehekea nawe, na MUNGU azidi kukutendea!',
            'testimonies.success_btn': 'SHIRIKI USHUHUDA MWINGINE',
            'testimonies.verse': '"Nao wakamshinda kwa damu ya Mwana-Kondoo, na kwa neno la ushuhuda wao." — Ufunuo 12:11',
            'testimonies.alert_required': 'Tafadhali jaza sehemu zinazohitajika',
            'testimonies.sending': 'Inatuma...',
            'testimonies.error_server': 'Hitilafu imetokea. Tafadhali jaribu tena.',
            'testimonies.error_network': 'Hitilafu ya mtandao. Tafadhali angalia muunganisho wako na jaribu tena.',

            // --- Connect Page ---
            'connect.heading': 'Wasiliana',
            'connect.tab_bishop': 'Bishop Dickson Kabigumila',
            'connect.tab_abc': 'ABC Global',
            'connect.social_media': 'Mitandao ya Kijamii',
            'connect.podcasts': 'Vipindi mtandaoni',
            'connect.contact': 'Mawasiliano',
            'connect.address_label': 'Anwani',
            'connect.address': 'Ubungo - Kinzudi Goba, Dar es Salaam',
            'connect.phone_label': 'Simu',
            'connect.email_label': 'Barua Pepe',
            'connect.verse': '"Enendeni ulimwenguni mwote, mkahubiri Injili kwa kila kiumbe." — Marko 16:15',

            // --- Branches Page ---
            'branches.heading': 'Matawi Yetu',
            'branches.description': 'Pata mahali karibu nawe na kujiunga nasi kwa ibada.',
            'branches.search_ph': 'Tafuta kwa mchungaji au eneo...',
            'branches.no_phone': 'Hakuna simu',
            'branches.no_results': 'Hakuna matawi yaliyopatikana kulingana na utafutaji wako.',
            'branches.verse': '"Kwa kuwa walipo wawili watatu wamekusanyika kwa jina langu, nami nipo papo hapo katikati yao." — Mathayo 18:20',

            // --- History Page ---
            'history.heading': 'Historia Yetu',
            'history.subtitle': 'Hadithi ya imani, ustahimilivu, na kusudi la kimungu',
            'history.founded_by': 'Ilianzishwa Na',
            'history.founder_title': 'Mwanzilishi na Mwangalizi Mkuu',
            'history.cofounder_title': 'Mwanzilishi Mwenza',
            'history.est': 'Illy. Novemba 2016',
            'history.location': 'Kahama, Tanzania',
            'history.para1': 'ABC GLOBAL ilianzishwa Novemba 2016 huko Kahama, Tanzania, na Bishop Dickson Corneli Kabigumila na mkewe Mercy Ikupa. Kanisa lilianza ibada zake za kwanza chini ya miti katika mahali panaitwa Nyahanga Kivulini — hakukuwa na jengo wala vyombo vya muziki, ni waumini tu wakikusanyika pamoja kuabudu na kusikiliza Neno la Mungu. Siku za mwanzo hazikuwa rahisi, lakini jumuiya ilikua kwa uthabiti kadiri watu walipokutana na MUNGU halisi na kupokea masuluhisho ya changamoto zao.',
            'history.para2': 'Kadiri huduma ilivyozidi kukua na uhitaji wa neno la MUNGU kuongezeka maeneno mbalimbali, huduma ilipanuka na kuelekea Dar es Salaam na kuanzisha makao makuu yake Kinzudi, Goba. Kutoka hapo, ABC GLOBAL ilianza kupanda matawi kote nchini. Leo, kanisa lina matawi mengi yaliyosambaa kote Tanzania, kila moja likijitolea kwa dira hiyo hiyo ya kuleta kizazi ambacho ni takatifu kwa Mungu. Kile kilichoanza chini ya vivuli vya miti kimekuwa na mgusi wa kitaifa — na kwa neema ya Mungu, inaendelea kukua.',
            'history.invite': 'Tunakualika uwe sehemu ya huduma hii.',
            'history.invite_sub': 'Iwe uko Dar es Salaam, Kahama, au popote Tanzania, kuna tawi linalokungoja nyumbani.',
            'history.find_branch': 'Tafuta Tawi Karibu Nawe',
            'history.gallery': 'Safari Yetu katika Picha',
            'history.verse': '"Maana nayajua mawazo ninayo wawazia ninyi, asema BWANA, ni mawazo ya amani wala so ya mabaya, kuwapa ninyi tumaini siky zenu za mwisho." — Yeremia 29:11'
        }
    };

    // ============================================
    // CURRENT LANGUAGE
    // ============================================
    let currentLang = localStorage.getItem('abc-lang') || 'en';

    // ============================================
    // LANGUAGE TOGGLE BUTTON (CSS + HTML)
    // ============================================
    const toggleStyles = document.createElement('style');
    toggleStyles.textContent = `
        /* Language Toggle — Glassmorphic slider switch */
        .lang-toggle {
            position: fixed;
            top: 24px;
            left: 24px;
            transform: none;
            z-index: 10001;
            display: flex;
            align-items: center;
            background: rgba(255, 255, 255, 0.22);
            -webkit-backdrop-filter: blur(24px) saturate(180%);
            backdrop-filter: blur(24px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.35);
            border-radius: 50px;
            padding: 4px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255,255,255,0.3);
            -webkit-tap-highlight-color: transparent;
            opacity: 0;
            cursor: pointer;
        }
        /* Show toggle — simple fade in, no drop animation */
        .lang-toggle.lang-ready {
            opacity: 1;
        }

        /* ====== ONLY MOTION: Vanish & Smooth Return from Above ====== */
        /* Override default shockwave bounce — we handle it with vanish/return */
        .lang-toggle.shocked {
            animation: none !important;
            transition: none !important;
        }
        /* Vanish state — instantly invisible */
        .lang-toggle.lang-vanished {
            opacity: 0 !important;
            pointer-events: none !important;
            transform: translateY(-40px) !important;
            transition: none !important;
        }
        /* Return from above — one smooth continuous glide */
        @keyframes langReturnFromAbove {
            from { opacity: 0; transform: translateY(-40px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .lang-toggle.lang-returning {
            animation: langReturnFromAbove 1.4s cubic-bezier(0.0, 0.0, 0.2, 1) forwards !important;
            transition: none !important;
            pointer-events: auto !important;
        }

        /* Slider track — each label is a clickable area */
        .lang-slider-label {
            position: relative;
            z-index: 2;
            padding: 7px 18px;
            font-family: 'Inter', sans-serif;
            font-size: 0.72rem;
            font-weight: 700;
            letter-spacing: 1.4px;
            text-transform: uppercase;
            color: #000000;
            cursor: pointer;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
            border-radius: 50px;
        }
        .lang-slider-label.active {
            color: #ffffff;
        }

        /* Sliding pill indicator */
        .lang-slider-thumb {
            position: absolute;
            top: 4px;
            left: 4px;
            height: calc(100% - 8px);
            width: calc(50% - 4px);
            background: linear-gradient(135deg, #C41E3A, #a1182e);
            border-radius: 50px;
            box-shadow: 0 2px 8px rgba(196, 30, 58, 0.35);
            transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 1;
        }
        .lang-slider-thumb.sw {
            transform: translateX(100%);
        }

        /* Hide toggle on all sub-pages (show on homepage only) */
        body:not(.spa-home) .lang-toggle,
        body.radio-open .lang-toggle,
        body.menu-open .lang-toggle,
        .radio-popup.active ~ .lang-toggle,
        .menu-overlay.active ~ .lang-toggle {
            opacity: 0 !important;
            pointer-events: none !important;
            visibility: hidden !important;
            animation: none !important;
            transform: translateY(-16px) scale(0.9) !important;
            transition: opacity 0.3s ease, transform 0.3s ease, visibility 0.3s ease;
        }
        /* Ensure toggle is hidden when radio popup is open on ANY screen size */
        .lang-toggle.lang-hidden {
            opacity: 0 !important;
            pointer-events: none !important;
            visibility: hidden !important;
            animation: none !important;
            transform: translateY(-16px) scale(0.9) !important;
        }
        body.spa-home .lang-toggle {
            transition: none;
        }

        @media (max-width: 767px) {
            .lang-toggle { top: 24px; left: 50%; transform: translateX(-50%); }
            .lang-slider-label { padding: 6px 14px; font-size: 0.66rem; letter-spacing: 1.1px; }
            .lang-toggle.lang-ready {
                transition: none;
            }
            /* Hide on small devices — keep translateX(-50%) */
            body:not(.spa-home) .lang-toggle,
            body.radio-open .lang-toggle,
            body.menu-open .lang-toggle {
                transform: translateX(-50%) translateY(-16px) scale(0.9) !important;
            }
            .lang-toggle.lang-hidden {
                transform: translateX(-50%) translateY(-16px) scale(0.9) !important;
            }
            /* Mobile vanish — preserve translateX(-50%) centering */
            .lang-toggle.lang-vanished {
                opacity: 0 !important;
                pointer-events: none !important;
                transform: translateX(-50%) translateY(-40px) !important;
                transition: none !important;
            }
            /* Mobile return from above — one smooth continuous glide, preserves centering */
            @keyframes langReturnFromAboveMobile {
                from { opacity: 0; transform: translateX(-50%) translateY(-40px); }
                to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
            .lang-toggle.lang-returning {
                animation: langReturnFromAboveMobile 1.4s cubic-bezier(0.0, 0.0, 0.2, 1) forwards !important;
                transition: none !important;
                pointer-events: auto !important;
            }
        }
        @media (max-width: 360px) {
            .lang-slider-label { padding: 5px 11px; font-size: 0.6rem; }
        }
        /* ===== Language Switch Entrance Animation ===== */
        [data-i18n] {
            transition: opacity 0.22s ease;
        }
        .lang-switching [data-i18n] {
            opacity: 0;
        }
        @keyframes langEntrance {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .lang-entrance [data-i18n] {
            animation: langEntrance 0.3s ease forwards;
        }
    `;
    document.head.appendChild(toggleStyles);

    // Create the slider toggle — EN | SW with sliding thumb indicator
    const toggleContainer = document.createElement('div');
    toggleContainer.className = 'lang-toggle shockwave-affected';
    toggleContainer.setAttribute('role', 'radiogroup');
    toggleContainer.setAttribute('aria-label', 'Language');
    toggleContainer.innerHTML =
        '<div class="lang-slider-thumb' + (currentLang === 'sw' ? ' sw' : '') + '"></div>' +
        '<span class="lang-slider-label' + (currentLang === 'en' ? ' active' : '') + '" data-lang="en" role="radio" aria-checked="' + (currentLang === 'en') + '" tabindex="0">EN</span>' +
        '<span class="lang-slider-label' + (currentLang === 'sw' ? ' active' : '') + '" data-lang="sw" role="radio" aria-checked="' + (currentLang === 'sw') + '" tabindex="0">SW</span>';
    document.body.appendChild(toggleContainer);

    // Trigger the entrance animation after a short delay
    setTimeout(function() {
        toggleContainer.classList.add('lang-ready');
    }, 1600);

    // ============================================
    // CORE TRANSLATION ENGINE
    // ============================================

    /**
     * Get translation for a given key
     */
    function t(key) {
        return (translations[currentLang] && translations[currentLang][key]) || 
               (translations['en'] && translations['en'][key]) || 
               key;
    }

    /**
     * Apply translations to all elements with data-i18n attributes
     */
    function applyTranslations() {
        // Translate text content
        document.querySelectorAll('[data-i18n]').forEach(function(el) {
            const key = el.getAttribute('data-i18n');
            const value = t(key);
            if (value && value !== key) {
                el.textContent = value;
            }
        });

        // Translate placeholders
        document.querySelectorAll('[data-i18n-ph]').forEach(function(el) {
            const key = el.getAttribute('data-i18n-ph');
            const value = t(key);
            if (value && value !== key) {
                el.setAttribute('placeholder', value);
            }
        });

        // Translate aria-labels
        document.querySelectorAll('[data-i18n-aria]').forEach(function(el) {
            const key = el.getAttribute('data-i18n-aria');
            const value = t(key);
            if (value && value !== key) {
                el.setAttribute('aria-label', value);
            }
        });

        // Translate select options
        document.querySelectorAll('[data-i18n-options]').forEach(function(select) {
            select.querySelectorAll('option[data-i18n]').forEach(function(opt) {
                const key = opt.getAttribute('data-i18n');
                const value = t(key);
                if (value && value !== key) {
                    opt.textContent = value;
                }
            });
        });

        // Update the HTML lang attribute
        document.documentElement.lang = currentLang === 'sw' ? 'sw' : 'en';

        // Update slider thumb position and active label
        var thumb = toggleContainer.querySelector('.lang-slider-thumb');
        if (thumb) {
            if (currentLang === 'sw') {
                thumb.classList.add('sw');
            } else {
                thumb.classList.remove('sw');
            }
        }
        toggleContainer.querySelectorAll('.lang-slider-label').forEach(function(label) {
            var isActive = label.getAttribute('data-lang') === currentLang;
            label.classList.toggle('active', isActive);
            label.setAttribute('aria-checked', isActive);
        });
    }

    /**
     * Switch language with smooth entrance transition
     */
    function switchLanguage(lang) {
        if (lang === currentLang) return;
        currentLang = lang;
        localStorage.setItem('abc-lang', lang);

        // Phase 1: Fade out text + slide down
        document.body.classList.add('lang-switching');
        document.body.classList.remove('lang-entrance');

        // Ensure toggle stays visible
        toggleContainer.classList.add('lang-ready');

        // Phase 2: After fade-out, apply translations + entrance animation
        setTimeout(function() {
            applyTranslations();
            // Fire a custom event so other scripts can react
            window.dispatchEvent(new CustomEvent('lang-change', { detail: { lang: lang } }));

            // Remove fade-out, add entrance animation
            document.body.classList.remove('lang-switching');
            document.body.classList.add('lang-entrance');

            // Clean up entrance class after animation completes
            setTimeout(function() {
                document.body.classList.remove('lang-entrance');
            }, 500);
        }, 250);
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================

    // ====== Shockwave Vanish & Return ======
    // When the logo shockwave hits the toggle, it vanishes
    // then returns from above after 2 seconds
    let langVanishTimer = null;
    let langReturnTimer = null;

    function triggerLangVanish() {
        // Clear any pending return from a previous shockwave
        clearTimeout(langVanishTimer);
        clearTimeout(langReturnTimer);
        // Phase 1: Vanish — slide up and fade out
        toggleContainer.classList.remove('lang-returning');
        toggleContainer.classList.add('lang-vanished');
        // Phase 2: After 2 seconds, return from above
        langVanishTimer = setTimeout(function() {
            toggleContainer.classList.remove('lang-vanished');
            toggleContainer.classList.add('lang-returning');
            // Clean up return class after animation completes
            langReturnTimer = setTimeout(function() {
                toggleContainer.classList.remove('lang-returning');
            }, 1400);
        }, 2000);
    }

    // Watch for .shocked class being added by the shockwave system
    var langShockObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(m) {
            if (m.type === 'attributes' && m.attributeName === 'class') {
                if (toggleContainer.classList.contains('shocked') && !toggleContainer.classList.contains('lang-vanished')) {
                    triggerLangVanish();
                }
            }
        });
    });
    langShockObserver.observe(toggleContainer, { attributes: true, attributeFilter: ['class'] });

    // Slider label clicks — tap EN or SW directly
    toggleContainer.querySelectorAll('.lang-slider-label').forEach(function(label) {
        label.addEventListener('click', function(e) {
            e.stopPropagation();
            var lang = this.getAttribute('data-lang');
            if (lang && lang !== currentLang) {
                switchLanguage(lang);
            }
        });
        // Keyboard accessibility — Enter/Space to select
        label.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                var lang = this.getAttribute('data-lang');
                if (lang && lang !== currentLang) {
                    switchLanguage(lang);
                }
            }
        });
    });

    // Helper: check if toggle should be hidden (radio popup or menu overlay open)
    function shouldHideToggle() {
        var rp = document.querySelector('.radio-popup');
        var mo = document.getElementById('menuOverlay');
        return (rp && rp.classList.contains('active')) || (mo && mo.classList.contains('active'));
    }

    function updateToggleVisibility() {
        if (shouldHideToggle()) {
            toggleContainer.classList.add('lang-hidden');
            toggleContainer.classList.remove('lang-vanished');
            toggleContainer.style.opacity = '0';
            toggleContainer.style.pointerEvents = 'none';
            toggleContainer.style.visibility = 'hidden';
        } else if (document.body.classList.contains('spa-home')) {
            toggleContainer.classList.remove('lang-hidden');
            toggleContainer.style.opacity = '';
            toggleContainer.style.pointerEvents = '';
            toggleContainer.style.visibility = '';
        }
    }

    // Add/remove body classes when radio popup or menu opens/closes
    // This provides CSS-level hiding that works on ALL screen sizes
    function updateBodyClasses() {
        var rp = document.querySelector('.radio-popup');
        var mo = document.getElementById('menuOverlay');
        if (rp && rp.classList.contains('active')) {
            document.body.classList.add('radio-open');
        } else {
            document.body.classList.remove('radio-open');
        }
        if (mo && mo.classList.contains('active')) {
            document.body.classList.add('menu-open');
        } else {
            document.body.classList.remove('menu-open');
        }
    }

    // Hide toggle when radio popup is active
    var radioPopup = document.querySelector('.radio-popup');
    if (radioPopup) {
        var radioObserver = new MutationObserver(function() {
            updateToggleVisibility();
            updateBodyClasses();
        });
        radioObserver.observe(radioPopup, { attributes: true, attributeFilter: ['class'] });
    }

    // Hide toggle when menu overlay (nav drawer) is active
    var menuOverlay = document.getElementById('menuOverlay');
    if (menuOverlay) {
        var menuObserver = new MutationObserver(function() {
            updateToggleVisibility();
            updateBodyClasses();
        });
        menuObserver.observe(menuOverlay, { attributes: true, attributeFilter: ['class'] });
    }

    // Re-apply translations when SPA navigates (content swap)
    window.addEventListener('spa-navigate', function(e) {
        // Small delay to let DOM settle after SPA content swap
        setTimeout(function() {
            applyTranslations();
            // Show/hide toggle based on current page
            var page = (e && e.detail && e.detail.page) || 'home';
            if (page === 'home') {
                toggleContainer.classList.add('lang-ready');
                toggleContainer.classList.remove('lang-hidden');
            } else {
                toggleContainer.classList.remove('lang-ready');
                toggleContainer.classList.add('lang-hidden');
            }
            // Also check if radio popup or menu is open + update body classes
            updateToggleVisibility();
            updateBodyClasses();
        }, 100);
    });

    // Also re-apply on DOMContentLoaded (for direct page loads)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            applyTranslations();
        });
    } else {
        applyTranslations();
    }

    // Observe DOM changes to auto-translate new elements (for dynamic content)
    const observer = new MutationObserver(function(mutations) {
        let needsTranslation = false;
        for (var i = 0; i < mutations.length; i++) {
            if (mutations[i].addedNodes.length > 0) {
                for (var j = 0; j < mutations[i].addedNodes.length; j++) {
                    var node = mutations[i].addedNodes[j];
                    if (node.nodeType === 1) { // Element node
                        if (node.hasAttribute && (node.hasAttribute('data-i18n') || node.hasAttribute('data-i18n-ph') || node.querySelector('[data-i18n], [data-i18n-ph]'))) {
                            needsTranslation = true;
                            break;
                        }
                    }
                }
            }
            if (needsTranslation) break;
        }
        if (needsTranslation && currentLang !== 'en') {
            applyTranslations();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // ============================================
    // EXPOSE FOR OTHER SCRIPTS
    // ============================================
    window.abcI18n = {
        currentLang: function() { return currentLang; },
        switchTo: switchLanguage,
        t: t,
        apply: applyTranslations
    };

})();
