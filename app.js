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
    const regForm = document.getElementById('reg-form');
    if (regForm) {
        regForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name').value;
            const level = document.getElementById('reg-level').value;

            localStorage.setItem('registered', 'true');
            localStorage.setItem('user_name', name);
            localStorage.setItem('user_level', level);
            localStorage.setItem('last_login', new Date().toDateString());
            
            userName = name;
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

    window.openTest = function(type, level, testNumber) {
        if (testNumber !== 1) {
            alert(`Test #${testNumber} is not available in the demo. Please use Test #1.`);
            return;
        }

        const container = document.getElementById(`${type}-content-container`);
        if (!container) return;

        let html = `
            <div style="display:flex; align-items:center; gap:10px; margin-bottom: 20px;">
                <button class="btn-icon" onclick="renderPracticeTests('${type}', '${level}')"><i class="ph ph-arrow-left"></i></button>
                <h3 style="margin:0;">${level} - Test #${testNumber}</h3>
            </div>
        `;

        if (type === 'reading') {
            html += `
                <div class="passage-box glass-card">
                    <strong>The Future of Technology</strong><br><br>
                    Technology is evolving at an unprecedented rate. Artificial intelligence and machine learning are revolutionizing industries ranging from healthcare to finance. In the near future, autonomous vehicles are expected to reduce traffic accidents significantly. However, these advancements also raise important ethical questions regarding privacy and job security. It is crucial for society to find a balance between innovation and regulation to ensure that technology benefits everyone.
                </div>
                <div class="quiz-question glass-card">
                    <h4>1. What is the main idea of the passage?</h4>
                    <div class="quiz-options">
                        <label><input type="radio" name="rq1" value="A"> A) Technology only affects healthcare.</label>
                        <label><input type="radio" name="rq1" value="B"> B) AI is dangerous and should be stopped.</label>
                        <label><input type="radio" name="rq1" value="C"> C) Technology is advancing rapidly, bringing both benefits and challenges.</label>
                    </div>
                </div>
                <button class="btn-primary w-100" onclick="submitTest('${type}', '${level}', ${testNumber}, ['C'])" style="padding:14px; font-size:16px;">Submit Answers</button>
            `;
        } else if (type === 'listening') {
            html += `
                <div class="audio-player-card glass-card">
                    <button class="play-btn" id="audio-demo-btn" onclick="toggleAudioDemo()"><i class="ph-fill ph-play"></i></button>
                    <div class="audio-timeline-wrapper">
                        <div class="audio-timeline">
                            <div class="audio-progress" id="audio-demo-progress"></div>
                        </div>
                        <div class="audio-time">
                            <span>0:00</span>
                            <span>1:30</span>
                        </div>
                    </div>
                </div>
                <div class="quiz-question glass-card">
                    <h4>1. Where are the speakers planning to go?</h4>
                    <div class="quiz-options">
                        <label><input type="radio" name="lq1" value="A"> A) To the library</label>
                        <label><input type="radio" name="lq1" value="B"> B) To a coffee shop</label>
                        <label><input type="radio" name="lq1" value="C"> C) To the cinema</label>
                    </div>
                </div>
                <button class="btn-primary w-100" onclick="submitTest('${type}', '${level}', ${testNumber}, ['B'])" style="padding:14px; font-size:16px;">Submit Answers</button>
            `;
        }
        
        container.innerHTML = html;
    };

    let audioInterval;
    window.toggleAudioDemo = function() {
        const btn = document.getElementById('audio-demo-btn');
        const prog = document.getElementById('audio-demo-progress');
        if (btn.innerHTML.includes('play')) {
            btn.innerHTML = '<i class="ph-fill ph-pause"></i>';
            let width = parseFloat(prog.style.width || '0');
            audioInterval = setInterval(() => {
                width += 1;
                if (width > 100) width = 0;
                prog.style.width = width + '%';
            }, 500);
        } else {
            btn.innerHTML = '<i class="ph-fill ph-play"></i>';
            clearInterval(audioInterval);
        }
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
}
