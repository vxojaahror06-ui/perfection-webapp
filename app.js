// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    
    // Select all nav items and sections
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.app-section');
    const pageTitle = document.querySelector('.app-title');
    
    // Tab switching logic
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const target = item.getAttribute('data-target');
            switchTab(target);
        });
    });

    // Make switchTab globally available
    window.switchTab = function(targetId) {
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(nav => {
            nav.classList.remove('active');
            // Check if this nav targets the requested section
            if(nav.getAttribute('data-target') === targetId) {
                nav.classList.add('active');
            }
        });

        // Hide all sections, show target
        document.querySelectorAll('.app-section').forEach(sec => {
            sec.classList.remove('active');
        });
        
        const targetSection = document.getElementById(targetId + '-section');
        if(targetSection) {
            targetSection.classList.add('active');
        }

        // Update Title dynamically based on section
        const titles = {
            'home': 'Perfection School',
            'lessons': 'Lessons',
            'rating': 'Ranking',
            'resources': 'Resources',
            'profile': 'My Profile'
        };
        
        if (titles[targetId]) {
            document.querySelector('.app-title').innerText = titles[targetId];
        }
    };

    // Toggle Role Logic for Demo
    window.toggleRole = function() {
        const studentStats = document.getElementById('student-stats');
        const teacherStats = document.getElementById('teacher-stats');
        const roleText = document.querySelector('.profile-role');
        const roleBtn = document.querySelector('.role-switch-btn');
        const titleName = document.querySelector('.profile-name');

        if (studentStats.style.display !== 'none') {
            // Switch to Teacher
            studentStats.style.display = 'none';
            teacherStats.style.display = 'flex';
            roleText.innerText = "Teacher • Senior";
            roleBtn.innerText = "Switch to Student Profile (Demo)";
            titleName.innerText = "Miss Malika";
        } else {
            // Switch to Student
            studentStats.style.display = 'flex';
            teacherStats.style.display = 'none';
            roleText.innerText = "Student • Pre-IELTS";
            roleBtn.innerText = "Switch to Teacher Profile (Demo)";
            titleName.innerText = "Azizbek Rustamov";
        }
    };

    // Initialize Telegram Web App
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.expand(); 
        
        // Match theme
        if (tg.colorScheme === 'dark') {
            document.documentElement.style.setProperty('--bg-main', '#1f2937');
            document.documentElement.style.setProperty('--bg-card', '#111827');
            document.documentElement.style.setProperty('--text-main', '#f9fafb');
            document.documentElement.style.setProperty('--text-muted', '#9ca3af');
            document.documentElement.style.setProperty('--border-color', '#374151');
            tg.setHeaderColor('#1f2937');
            tg.setBackgroundColor('#1f2937');
        } else {
            tg.setHeaderColor('#f3f4f6');
            tg.setBackgroundColor('#f3f4f6');
        }

        // Check if user info is available from Telegram
        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
            document.getElementById('reg-name').value = tg.initDataUnsafe.user.first_name + ' ' + (tg.initDataUnsafe.user.last_name || '');
        }
    }

    // User Data & XP System
    let userXP = parseInt(localStorage.getItem('user_xp') || '0');
    let userName = localStorage.getItem('user_name') || '';
    let userPhone = localStorage.getItem('user_phone') || '';
    let userLevel = localStorage.getItem('user_level') || '';
    
    window.nextAuthStep = function(stepNumber) {
        document.querySelectorAll('.auth-step').forEach(step => step.classList.remove('active'));
        const stepEl = document.getElementById('auth-step-' + stepNumber);
        if (stepEl) stepEl.classList.add('active');
    };

    function updateUserUI() {
        if (userName) {
            document.querySelector('.welcome-area h2').innerText = 'Hello, ' + userName.split(' ')[0] + ' 👋';
            document.querySelector('.profile-name').innerText = userName;
        }
        if (userLevel) {
            document.querySelector('.profile-role').innerText = "Student • " + userLevel;
        }
        if (userPhone) {
            let phoneEl = document.querySelector('.profile-phone');
            if(phoneEl) phoneEl.innerText = userPhone;
        }
        
        let avatar = localStorage.getItem('user_avatar');
        if(avatar) {
            document.querySelector('.profile-avatar img').src = avatar;
        }

        if (localStorage.getItem('dark_mode') === 'true') {
            document.body.classList.add('dark-mode');
            let dmToggle = document.getElementById('dark-mode-toggle');
            if(dmToggle) dmToggle.checked = true;
        }

        document.querySelectorAll('.stat-value').forEach(el => {
            if (el.nextElementSibling && el.nextElementSibling.innerText.includes('Total XP')) {
                el.innerText = userXP;
            }
        });
        document.querySelectorAll('.lb-score').forEach(el => {
            if (el.previousElementSibling && el.previousElementSibling.innerText.includes('You')) {
                el.innerText = userXP + ' xp';
            }
        });
    }

    window.addXP = function(amount) {
        userXP += amount;
        localStorage.setItem('user_xp', userXP);
        updateUserUI();
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }
    };

    // Check Login & Daily XP
    if (localStorage.getItem('registered') === 'true') {
        const lastLogin = localStorage.getItem('last_login');
        const today = new Date().toDateString();
        if (lastLogin !== today) {
            addXP(5); // Daily login
            localStorage.setItem('last_login', today);
            setTimeout(() => alert("Welcome back! +5 XP for daily login!"), 500);
        }
        updateUserUI();
        setTimeout(() => switchTab('home'), 10);
    }

    // Registration Form Submit
    const regNameForm = document.getElementById('reg-name-form');
    if (regNameForm) {
        regNameForm.addEventListener('submit', (e) => {
            e.preventDefault();
            switchTab('auth-phone');
        });
    }

    const regPhoneForm = document.getElementById('reg-phone-form');
    if (regPhoneForm) {
        regPhoneForm.addEventListener('submit', (e) => {
            e.preventDefault();
            switchTab('auth-level');
        });
    }

    const regLevelForm = document.getElementById('reg-level-form');
    if (regLevelForm) {
        regLevelForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name').value;
            const phone = document.getElementById('reg-phone').value;
            const level = document.getElementById('reg-level').value;

            localStorage.setItem('registered', 'true');
            localStorage.setItem('user_name', name);
            localStorage.setItem('user_phone', phone);
            localStorage.setItem('user_level', level);
            localStorage.setItem('last_login', new Date().toDateString());
            
            userName = name;
            userPhone = phone;
            userLevel = level;
            
            addXP(50); // Welcome bonus
            alert("Registration successful! +50 XP");
            
            updateUserUI();
            switchTab('home');
        });
    }

    // Open Resource details
    window.openResource = function(type) {
        document.querySelectorAll('.app-section').forEach(sec => sec.classList.remove('active'));
        const target = document.getElementById(type + '-section');
        if(target) target.classList.add('active');
        document.querySelector('.app-title').innerText = type === 'alphabet' ? 'Alphabet' : 'Numbers';
    };

    // Image Upload Logic
    let currentImageData = null;
    const imageInput = document.getElementById('writing-image');
    const previewContainer = document.getElementById('image-preview-container');
    const previewImg = document.getElementById('preview-img');
    const removeImageBtn = document.getElementById('remove-image-btn');

    if (imageInput) {
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    currentImageData = event.target.result; // Data URL (Base64)
                    previewImg.src = currentImageData;
                    previewContainer.style.display = 'block';
                    document.getElementById('upload-label').style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        });

        removeImageBtn.addEventListener('click', (e) => {
            e.preventDefault();
            imageInput.value = '';
            currentImageData = null;
            previewImg.src = '';
            previewContainer.style.display = 'none';
            document.getElementById('upload-label').style.display = 'flex';
        });
    }

    // AI Writing Validation Logic
    const checkWritingBtn = document.getElementById('check-writing-btn');
    if (checkWritingBtn) {
        checkWritingBtn.addEventListener('click', async () => {
            const text = document.getElementById('writing-text').value;
            const type = document.getElementById('writing-type').value;
            
            if (text.trim().length < 10 && !currentImageData) {
                if (window.Telegram && window.Telegram.WebApp) {
                    window.Telegram.WebApp.showAlert("Please write an essay or upload an image of your writing.");
                } else {
                    alert("Please write an essay or upload an image of your writing.");
                }
                return;
            }

            // Show loading
            document.getElementById('writing-loading').style.display = 'block';
            document.getElementById('writing-results').style.display = 'none';
            checkWritingBtn.disabled = true;

            try {
                // Production URL for the backend server
                const backendUrl = 'https://perfection-webapp.onrender.com/api/check_writing';
                
                const response = await fetch(backendUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        text: text,
                        task_type: type,
                        image_data: currentImageData
                    })
                });

                if (!response.ok) {
                    throw new Error("Server returned an error. It might be offline.");
                }

                const result = await response.json();
                
                // Natijalarni ekranga chiqarish
                document.getElementById('res-band').innerText = result.overall_band || 'N/A';
                document.getElementById('res-grammar').innerText = result.grammar_feedback || "No data";
                document.getElementById('res-vocab').innerText = result.vocabulary_feedback || "No data";
                document.getElementById('res-coherence').innerText = result.coherence_feedback || "No data";
                document.getElementById('res-general').innerText = result.general_feedback || "No data";

                // Show results
                document.getElementById('writing-loading').style.display = 'none';
                document.getElementById('writing-results').style.display = 'block';
                
            } catch (error) {
                console.error("Fetch xatolik:", error);
                document.getElementById('writing-loading').style.display = 'none';
                if (window.Telegram && window.Telegram.WebApp) {
                    window.Telegram.WebApp.showAlert("Error: " + error.message);
                } else {
                    alert("Error: " + error.message);
                }
            } finally {
                checkWritingBtn.disabled = false;
            }
        });
    }

    // Populate Dictionaries
    populateDictionaries();

    // Render Reading and Listening UI
    window.renderPracticeLevels = function(type) {
        const container = document.getElementById(`${type}-content-container`);
        if (!container) return;

        const ieltsLevels = ['5.0', '5.5', '6.0', '6.5', '7.0', '7.5', '8.0', '8.5', '9.0'];
        const cefrLevels = ['A2', 'B1', 'B2', 'C1'];

        let html = `<div class="mb-4">
            <h4 style="margin-bottom:10px; color:var(--text-muted);">IELTS Levels</h4>
            <div class="level-grid">`;
        
        ieltsLevels.forEach(l => {
            html += `<button class="level-btn" onclick="renderPracticeTests('${type}', 'IELTS ${l}')">${l}</button>`;
        });
        
        html += `</div></div><div class="mb-4">
            <h4 style="margin-bottom:10px; color:var(--text-muted);">Multilevel (CEFR)</h4>
            <div class="level-grid">`;
            
        cefrLevels.forEach(l => {
            html += `<button class="level-btn" onclick="renderPracticeTests('${type}', '${l}')">${l}</button>`;
        });
        
        html += `</div></div>`;
        container.innerHTML = html;
    };

    window.renderPracticeTests = function(type, level) {
        const container = document.getElementById(`${type}-content-container`);
        if (!container) return;
        
        let html = `
            <div style="display:flex; align-items:center; gap:10px; margin-bottom: 20px;">
                <button class="btn-icon" onclick="renderPracticeLevels('${type}')"><i class="ph ph-arrow-left"></i></button>
                <h3 style="margin:0;">${level}</h3>
            </div>
            <div class="tests-grid">
        `;
        
        for (let i = 1; i <= 30; i++) {
            const isCompleted = localStorage.getItem(`${type}_${level}_${i}`) === 'true';
            const cls = isCompleted ? 'test-btn completed' : 'test-btn';
            html += `<button class="${cls}" onclick="openTest('${type}', '${level}', ${i})">${i}</button>`;
        }
        
        html += `</div>`;
        container.innerHTML = html;
    };

    let practiceTestsData = null;

    async function loadTestsData() {
        if (practiceTestsData) return practiceTestsData;
        try {
            const res = await fetch('tests.json');
            practiceTestsData = await res.json();
            return practiceTestsData;
        } catch (e) {
            console.error("Failed to load tests", e);
            return null;
        }
    }

    window.openTest = async function(type, level, testNumber) {
        const container = document.getElementById(`${type}-content-container`);
        if (!container) return;

        const data = await loadTestsData();
        let testData = null;
        
        if (data && data[type] && data[type][level]) {
            testData = data[type][level].find(t => t.id === testNumber);
        }

        if (!testData) {
            alert(`Test #${testNumber} for ${level} is coming soon! Try the ones available (e.g. A2, B2, IELTS 6.0, IELTS 8.0, Test 1).`);
            return;
        }

        let html = `
            <div style="display:flex; align-items:center; gap:10px; margin-bottom: 20px;">
                <button class="btn-icon" onclick="renderPracticeTests('${type}', '${level}')"><i class="ph ph-arrow-left"></i></button>
                <h3 style="margin:0;">${level} - Test #${testNumber}</h3>
            </div>
        `;

        if (type === 'reading') {
            html += `
                <h4 style="margin-bottom:12px;">${testData.title}</h4>
                <div class="passage-box glass-card">
                    ${testData.content}
                </div>
            `;
        } else if (type === 'listening') {
            html += `
                <h4 style="margin-bottom:12px;">${testData.title}</h4>
                <div class="audio-player-card glass-card" style="padding:0; overflow:hidden; display:block;">
                    <iframe width="100%" height="200" src="https://www.youtube.com/embed/${testData.youtube_id}?rel=0&modestbranding=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
            `;
        }
        
        let correctAnswersArray = [];
        testData.questions.forEach((q, idx) => {
            correctAnswersArray.push(q.answer);
            html += `
                <div class="quiz-question glass-card">
                    <h4>${idx + 1}. ${q.q}</h4>
                    <div class="quiz-options">
            `;
            q.options.forEach(opt => {
                const optVal = opt.charAt(0);
                html += `
                    <label><input type="radio" name="q_${idx}" value="${optVal}"> ${opt}</label>
                `;
            });
            html += `
                    </div>
                </div>
            `;
        });
        
        const ansJson = JSON.stringify(correctAnswersArray).replace(/"/g, '&quot;');
        html += `<button class="btn-primary w-100" onclick="submitTest('${type}', '${level}', ${testNumber}, ${ansJson})" style="padding:14px; font-size:16px;">Submit Answers</button>`;
        
        container.innerHTML = html;
    };

    window.submitTest = function(type, level, testNumber, correctAnswers) {
        let correctCount = 0;
        const radios = document.querySelectorAll('input[type="radio"]:checked');
        radios.forEach((radio, index) => {
            if (radio.value === correctAnswers[index]) {
                correctCount++;
            }
        });
        
        if (radios.length < correctAnswers.length) {
            alert("Please answer all questions.");
            return;
        }

        const xpEarned = correctCount * 2;
        addXP(xpEarned);
        localStorage.setItem(`${type}_${level}_${testNumber}`, 'true');
        
        alert(`You got ${correctCount} correct! You earned +${xpEarned} XP.`);
        renderPracticeTests(type, level);
    };

    // Initialize the Practice Views
    renderPracticeLevels('reading');
    renderPracticeLevels('listening');
    populateDictionaries();

});

function populateDictionaries() {
    const alphabet = [
        { letter: 'A', pron: '[eı]', word: 'Apple', trans: 'Olma' },
        { letter: 'B', pron: '[bi:]', word: 'Book', trans: 'Kitob' },
        { letter: 'C', pron: '[si:]', word: 'Cat', trans: 'Mushuk' },
        { letter: 'D', pron: '[di:]', word: 'Dog', trans: 'It' },
        { letter: 'E', pron: '[i:]', word: 'Elephant', trans: 'Fil' },
        { letter: 'F', pron: '[ef]', word: 'Fish', trans: 'Baliq' },
        { letter: 'G', pron: '[dʒi:]', word: 'Good', trans: 'Yaxshi' },
        { letter: 'H', pron: '[eıtʃ]', word: 'House', trans: 'Uy' },
        { letter: 'I', pron: '[aı]', word: 'Ice', trans: 'Muz' },
        { letter: 'J', pron: '[dʒeı]', word: 'Jump', trans: 'Sakrash' },
        { letter: 'K', pron: '[keı]', word: 'Key', trans: 'Kalit' },
        { letter: 'L', pron: '[el]', word: 'Lion', trans: 'Sher' },
        { letter: 'M', pron: '[em]', word: 'Monkey', trans: 'Maymun' },
        { letter: 'N', pron: '[en]', word: 'Night', trans: 'Tun' },
        { letter: 'O', pron: '[oʊ]', word: 'Open', trans: 'Ochiq' },
        { letter: 'P', pron: '[pi:]', word: 'Pen', trans: 'Ruchka' },
        { letter: 'Q', pron: '[kju:]', word: 'Queen', trans: 'Qirolicha' },
        { letter: 'R', pron: '[ɑːr]', word: 'Red', trans: 'Qizil' },
        { letter: 'S', pron: '[es]', word: 'Sun', trans: 'Quyosh' },
        { letter: 'T', pron: '[ti:]', word: 'Tree', trans: 'Daraxt' },
        { letter: 'U', pron: '[ju:]', word: 'Umbrella', trans: 'Soyabon' },
        { letter: 'V', pron: '[vi:]', word: 'Voice', trans: 'Ovoz' },
        { letter: 'W', pron: '[dʌblju:]', word: 'Water', trans: 'Suv' },
        { letter: 'X', pron: '[eks]', word: 'X-ray', trans: 'Rentgen' },
        { letter: 'Y', pron: '[waı]', word: 'Yellow', trans: 'Sariq' },
        { letter: 'Z', pron: '[zi:]', word: 'Zoo', trans: 'Hayvonot bog\'i' }
    ];

    const numbers = [
        { num: '0', pron: '[zɪəroʊ]', trans: 'Nol' },
        { num: '1', pron: '[wʌn]', trans: 'Bir' },
        { num: '2', pron: '[tu:]', trans: 'Ikki' },
        { num: '3', pron: '[θri:]', trans: 'Uch' },
        { num: '4', pron: '[fɔ:r]', trans: 'To\'rt' },
        { num: '5', pron: '[faıv]', trans: 'Besh' },
        { num: '6', pron: '[sıks]', trans: 'Olti' },
        { num: '7', pron: '[sevn]', trans: 'Yetti' },
        { num: '8', pron: '[eıt]', trans: 'Sakkiz' },
        { num: '9', pron: '[naın]', trans: 'To\'qqiz' },
        { num: '10', pron: '[ten]', trans: 'O\'n' },
        { num: '20', pron: '[twenti]', trans: 'Yigirma' },
        { num: '30', pron: '[θɜːrti]', trans: 'O\'ttiz' },
        { num: '40', pron: '[fɔːrti]', trans: 'Qirq' },
        { num: '50', pron: '[fɪfti]', trans: 'Ellik' },
        { num: '100', pron: '[hʌndrəd]', trans: 'Yuz' }
    ];

    const alphaContainer = document.querySelector('#alphabet-section .dictionary-list');
    if (alphaContainer) {
        alphaContainer.innerHTML = alphabet.map(a => `
            <div class="dict-item">
                <div class="dict-main">${a.letter}</div>
                <div class="dict-info">
                    <div class="dict-pron">${a.pron}</div>
                    <div class="dict-trans">${a.word} - ${a.trans}</div>
                </div>
            </div>
        `).join('');
    }

    const numContainer = document.querySelector('#numbers-section .dictionary-list');
    if (numContainer) {
        numContainer.innerHTML = numbers.map(n => `
            <div class="dict-item">
                <div class="dict-main" style="font-size: 20px;">${n.num}</div>
                <div class="dict-info">
                    <div class="dict-pron">${n.pron}</div>
                    <div class="dict-trans">${n.trans}</div>
                </div>
            </div>
        `).join('');
    }

    // Add Phrases
    const phrases = [
        { en: "Hello / Hi", uz: "Salom" },
        { en: "Good morning", uz: "Xayrli tong" },
        { en: "Good evening", uz: "Xayrli kech" },
        { en: "How are you?", uz: "Qandaysiz?" },
        { en: "I'm fine, thank you", uz: "Men yaxshiman, rahmat" },
        { en: "What is your name?", uz: "Ismingiz nima?" },
        { en: "My name is...", uz: "Mening ismim..." },
        { en: "Nice to meet you", uz: "Tanishganimdan xursandman" },
        { en: "Please", uz: "Iltimos" },
        { en: "Thank you very much", uz: "Katta rahmat" },
        { en: "You're welcome", uz: "Arzimaydi" },
        { en: "Excuse me", uz: "Kechirasiz (e'tibor qaratish uchun)" },
        { en: "I'm sorry", uz: "Kechirasiz (uzr so'rash)" },
        { en: "I don't understand", uz: "Men tushunmadim" },
        { en: "Could you repeat that?", uz: "Qaytarib yubora olasizmi?" },
        { en: "Do you speak English?", uz: "Inglizcha gapirasizmi?" },
        { en: "How much is this?", uz: "Bu qancha turadi?" },
        { en: "Where is the bathroom?", uz: "Hojatxona qayerda?" },
        { en: "Help!", uz: "Yordam bering!" },
        { en: "Goodbye", uz: "Xayr" }
    ];
    const phrasesContainer = document.querySelector('#phrases-list');
    if (phrasesContainer) {
        phrasesContainer.innerHTML = phrases.map(p => `
            <div class="dict-item">
                <div class="dict-info" style="width:100%;">
                    <div class="dict-pron" style="font-size:16px; color:var(--text-main); font-weight:600;">${p.en}</div>
                    <div class="dict-trans">${p.uz}</div>
                </div>
            </div>
        `).join('');
    }

    // Add Grammar
    const grammar = [
        { topic: "Noun (Ot)", desc: "Shaxs, narsa, joy yoki g'oyani bildiradi. Masalan: dog, city, beauty." },
        { topic: "Pronoun (Olmosh)", desc: "Otning o'rnida ishlatiladi. Masalan: he, she, it, they." },
        { topic: "Verb (Fe'l)", desc: "Harakat yoki holatni bildiradi. Masalan: run, is, jump." },
        { topic: "Adjective (Sifat)", desc: "Otni tasvirlaydi. Masalan: big, red, beautiful." },
        { topic: "Present Simple", desc: "Doimiy va odatiy harakatlar uchun. (I work every day)" },
        { topic: "Present Continuous", desc: "Ayni paytda sodir bo'layotgan harakatlar. (I am working now)" },
        { topic: "Past Simple", desc: "O'tgan zamondagi tugallangan harakatlar. (I worked yesterday)" },
        { topic: "Future Simple", desc: "Kelajakdagi maqsad va harakatlar. (I will work tomorrow)" },
        { topic: "Articles (a/an/the)", desc: "Otlar oldida qo'llaniluvchi artikllar. Birlik otlar uchun 'a/an', aniq narsalar uchun 'the'." },
        { topic: "Prepositions (Predloglar)", desc: "O'rin-joy yoki vaqtni ko'rsatadi. Masalan: in, on, at, under." }
    ];
    const grammarContainer = document.querySelector('#grammar-list');
    if (grammarContainer) {
        grammarContainer.innerHTML = grammar.map(g => `
            <div class="dict-item">
                <div class="dict-info" style="width:100%;">
                    <div class="dict-pron" style="font-size:16px; color:var(--text-main); font-weight:600;">${g.topic}</div>
                    <div class="dict-trans">${g.desc}</div>
                </div>
            </div>
        `).join('');
    }
}

// Global functions for new settings
window.toggleDarkMode = function() {
    let isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('dark_mode', isDark);
};

window.logOut = function() {
    if(confirm("Tizimdan chiqmoqchimisiz? (Barcha xp va ma'lumotlar o'chib ketadi)")) {
        localStorage.clear();
        location.reload();
    }
};

window.uploadAvatar = function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64Str = e.target.result;
            try {
                localStorage.setItem('user_avatar', base64Str);
                document.querySelector('.profile-avatar img').src = base64Str;
                alert("Profil rasmi o'zgartirildi!");
            } catch (err) {
                alert("Rasm hajmi juda katta! Iltimos, kichikroq hajmdagi rasm tanlang.");
            }
        };
        reader.readAsDataURL(file);
    }
};
