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
            if (localStorage.getItem('registered') !== 'true') {
                return; // Prevent navigating away during registration
            }
            const target = item.getAttribute('data-target');
            switchTab(target);
        });
    });

    // Make switchTab globally available
    window.switchTab = function(targetId) {
        const isAuthStep = targetId.startsWith('auth-') || targetId.startsWith('reg-');
        if (localStorage.getItem('registered') !== 'true' && !isAuthStep) {
            return; // Only allow auth steps if not registered
        }

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

        if (targetId === 'speaking') {
            if (window.renderSpeakingMain) window.renderSpeakingMain();
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
            const welcomeText = document.querySelector('#home-section .welcome-area h2');
            if (welcomeText) welcomeText.innerText = 'Hello, ' + userName.split(' ')[0] + ' 👋';
            const profileName = document.querySelector('.profile-name');
            if (profileName) profileName.innerText = userName;
        }
        if (userLevel) {
            const profileRole = document.querySelector('.profile-role');
            if (profileRole) profileRole.innerText = "Student • " + userLevel;
        }
        if (userPhone) {
            let phoneEl = document.querySelector('.profile-phone');
            if(phoneEl) phoneEl.innerText = userPhone;
        }
        
        let avatar = localStorage.getItem('user_avatar');
        if(avatar) {
            const avatarImg = document.querySelector('.profile-avatar img');
            if (avatarImg) avatarImg.src = avatar;
        }

        if (localStorage.getItem('dark_mode') === 'true') {
            document.body.classList.add('dark-mode');
            let dmToggle = document.getElementById('dark-mode-toggle');
            if(dmToggle) dmToggle.checked = true;
        }

        document.querySelectorAll('.stat-value').forEach(el => {
            if (el.nextElementSibling && el.nextElementSibling.textContent.includes('Total XP')) {
                el.textContent = userXP;
            }
        });
        document.querySelectorAll('.lb-score').forEach(el => {
            if (el.previousElementSibling && el.previousElementSibling.textContent.includes('You')) {
                el.textContent = userXP + ' xp';
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
        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
            appContainer.classList.remove('not-registered');
        }
        const lastLogin = localStorage.getItem('last_login');
        const today = new Date().toDateString();
        if (lastLogin !== today) {
            addXP(5); // Daily login
            localStorage.setItem('last_login', today);
            setTimeout(() => alert("Welcome back! +5 XP for daily login!"), 500);
        }
        updateUserUI();
        setTimeout(() => switchTab('home'), 10);
    } else {
        // Force auth name section if not registered
        setTimeout(() => switchTab('auth-name'), 10);
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

            const appContainer = document.querySelector('.app-container');
            if (appContainer) {
                appContainer.classList.remove('not-registered');
            }
            
            // Save to Firebase
            if (window.firebaseDB) {
                try {
                    window.firebaseAddDoc(window.firebaseCollection(window.firebaseDB, "users"), {
                        name: name,
                        phone: phone,
                        level: level,
                        xp: 50,
                        registered_at: new Date().toISOString()
                    });
                } catch (e) {
                    console.log("Firebase not ready yet", e);
                }
            }

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
                const backendUrl = getBackendUrl('/api/check_writing');
                
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
            if (window.firebaseDB && window.firebaseGetDocs && window.firebaseCollection) {
                const db = window.firebaseDB;
                const readingSnap = await window.firebaseGetDocs(window.firebaseCollection(db, "reading_tests"));
                const listeningSnap = await window.firebaseGetDocs(window.firebaseCollection(db, "listening_tests"));
                
                if (!readingSnap.empty || !listeningSnap.empty) {
                    const localData = { reading: {}, listening: {}, speaking: {} };
                    
                    readingSnap.forEach(doc => {
                        const data = doc.data();
                        const lvl = data.level;
                        if (!localData.reading[lvl]) {
                            localData.reading[lvl] = [];
                        }
                        localData.reading[lvl].push({
                            id: data.id,
                            title: data.title,
                            content: data.content,
                            questions: data.questions
                        });
                    });
                    
                    listeningSnap.forEach(doc => {
                        const data = doc.data();
                        const lvl = data.level;
                        if (!localData.listening[lvl]) {
                            localData.listening[lvl] = [];
                        }
                        localData.listening[lvl].push({
                            id: data.id,
                            title: data.title,
                            youtube_id: data.youtube_id,
                            questions: data.questions
                        });
                    });
                    
                    try {
                        const localRes = await fetch('tests.json');
                        const localJSON = await localRes.json();
                        localData.speaking = localJSON.speaking;
                    } catch (e) {
                        console.error("Failed to load speaking local fallback, using window.initialTestData", e);
                        if (window.initialTestData) {
                            localData.speaking = window.initialTestData.speaking;
                        }
                    }
                    
                    practiceTestsData = localData;
                    return practiceTestsData;
                }
            }
        } catch (e) {
            console.error("Failed to load tests from Firestore, falling back to local json", e);
        }
        
        try {
            const res = await fetch('tests.json');
            practiceTestsData = await res.json();
            return practiceTestsData;
        } catch (e) {
            console.error("Failed to load fallback tests.json, using window.initialTestData", e);
            if (window.initialTestData) {
                practiceTestsData = window.initialTestData;
                return practiceTestsData;
            }
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

    // SPEAKING LOGIC (CEFR / DTM Multi-level Format)
    let currentSpeakingPart = '';
    let currentSpeakingTopic = null;
    let currentSpeakingQuestionIdx = 0;
    let speakingAudioBlobs = [];
    let speakingMediaRecorder = null;
    let speakingAudioChunks = [];
    let speakingTimerInterval = null;
    let speakingPrepInterval = null;
    let speakingSecondsLeft = 0;
    let speakingPrepSecondsLeft = 0;
    let speakingMicStream = null;
    let speakingCurrentState = 'main'; // 'main', 'topics', 'prep', 'record', 'loading', 'results'
    let selectedSpeakingPart = '';

    function getBackendUrl(endpoint) {
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const base = isLocal ? 'http://localhost:8001' : 'https://perfection-webapp.onrender.com';
        return `${base}${endpoint}`;
    }

    function updateSpeakingHeader(state, partId = '') {
        speakingCurrentState = state;
        if (partId) selectedSpeakingPart = partId;

        const backBtn = document.getElementById('speaking-back-btn');
        const titleEl = document.getElementById('speaking-main-title');
        const subtitleEl = document.getElementById('speaking-main-subtitle');
        
        if (!titleEl || !subtitleEl) return;

        if (state === 'main') {
            titleEl.innerText = 'Speaking Practice';
            subtitleEl.innerText = 'CEFR / DTM Multi-level format';
            if (backBtn) {
                backBtn.innerHTML = '<i class="ph ph-arrow-left"></i>';
                backBtn.setAttribute('onclick', 'switchTab("home")');
            }
        } else if (state === 'topics') {
            titleEl.innerText = `Part ${selectedSpeakingPart} Topics`;
            subtitleEl.innerText = 'Mavzular ro\'yxati';
            if (backBtn) {
                backBtn.innerHTML = '<i class="ph ph-arrow-left"></i>';
                backBtn.setAttribute('onclick', 'renderSpeakingMain()');
            }
        } else if (state === 'prep') {
            titleEl.innerText = 'Preparation';
            subtitleEl.innerText = 'Gapirishga tayyorlaning';
            if (backBtn) {
                backBtn.innerHTML = '<i class="ph ph-arrow-left"></i>';
                backBtn.setAttribute('onclick', 'confirmCancelSpeaking()');
            }
        } else if (state === 'record') {
            titleEl.innerText = 'Recording...';
            subtitleEl.innerText = 'Javobingizni gapiring';
            if (backBtn) {
                backBtn.innerHTML = '<i class="ph ph-arrow-left"></i>';
                backBtn.setAttribute('onclick', 'confirmCancelSpeaking()');
            }
        } else if (state === 'loading') {
            titleEl.innerText = 'Analyzing';
            subtitleEl.innerText = 'AI tahlil qilmoqda...';
            if (backBtn) {
                backBtn.innerHTML = '<i class="ph ph-arrow-left"></i>';
                backBtn.setAttribute('onclick', 'void(0)'); 
            }
        } else if (state === 'results') {
            titleEl.innerText = 'Results';
            subtitleEl.innerText = 'AI Examiner bahosi';
            if (backBtn) {
                backBtn.innerHTML = '<i class="ph ph-arrow-left"></i>';
                backBtn.setAttribute('onclick', 'renderSpeakingMain()');
            }
        }
    }

    window.confirmCancelSpeaking = function() {
        if (confirm("Hozirgi gapirish mashqidan chiqmoqchimisiz? Natijalar saqlanmaydi.")) {
            clearInterval(speakingTimerInterval);
            clearInterval(speakingPrepInterval);
            if (speakingMicStream) {
                speakingMicStream.getTracks().forEach(track => track.stop());
            }
            renderSpeakingTopics(selectedSpeakingPart);
        }
    };

    window.handleSpeakingBack = function() {
        // Handled dynamically by updateSpeakingHeader
    };

    window.renderSpeakingMain = function() {
        const container = document.getElementById('speaking-content-container');
        if (!container) return;

        clearInterval(speakingTimerInterval);
        clearInterval(speakingPrepInterval);
        if (speakingMicStream) {
            speakingMicStream.getTracks().forEach(track => track.stop());
        }

        updateSpeakingHeader('main');

        container.innerHTML = `
            <div class="mb-4">
                <p style="color:var(--text-muted); font-size:14px; margin-bottom:20px;">
                    CEFR va DTM Multi-level yangi gapirish (speaking) imtihoni formati bo'yicha tayyorlaning va o'z nutqingizni AI examiner yordamida baholang.
                </p>
            </div>
            
            <div class="resource-grid" style="grid-template-columns: 1fr; gap: 16px;">
                <div class="resource-card glass-card" onclick="renderSpeakingTopics('1.1')" style="cursor:pointer; display:flex; gap:16px; align-items:center; border-left:4px solid var(--primary-color);">
                    <div class="r-icon bg-blue" style="margin-bottom:0; flex-shrink:0;"><i class="ph ph-user"></i></div>
                    <div>
                        <h4 style="margin:0 0 4px 0;">Part 1.1 (A1-A2)</h4>
                        <p style="margin:0; font-size:12px; color:var(--text-muted);">Shaxsiy ma'lumotlar. 3 ta savol. Har biriga 30s. Tayyorgarliksiz.</p>
                    </div>
                </div>
                
                <div class="resource-card glass-card" onclick="renderSpeakingTopics('1.2')" style="cursor:pointer; display:flex; gap:16px; align-items:center; border-left:4px solid var(--success-color);">
                    <div class="r-icon bg-green" style="margin-bottom:0; flex-shrink:0;"><i class="ph ph-image"></i></div>
                    <div>
                        <h4 style="margin:0 0 4px 0;">Part 1.2 (B1)</h4>
                        <p style="margin:0; font-size:12px; color:var(--text-muted);">2 ta rasm asosida tasvirlash va fikr bildirish. Q4: 45s, Q5-6: 30s. Tayyorgarliksiz.</p>
                    </div>
                </div>
                
                <div class="resource-card glass-card" onclick="renderSpeakingTopics('2')" style="cursor:pointer; display:flex; gap:16px; align-items:center; border-left:4px solid var(--secondary-color);">
                    <div class="r-icon bg-orange" style="margin-bottom:0; flex-shrink:0;"><i class="ph ph-presentation-chart"></i></div>
                    <div>
                        <h4 style="margin:0 0 4px 0;">Part 2 (B2)</h4>
                        <p style="margin:0; font-size:12px; color:var(--text-muted);">Mavzuni tahlil qilish (1 ta rasm, 3 ta savol). 1 daqiqa tayyorgarlik, 2 daqiqa gapirish.</p>
                    </div>
                </div>
                
                <div class="resource-card glass-card" onclick="renderSpeakingTopics('3')" style="cursor:pointer; display:flex; gap:16px; align-items:center; border-left:4px solid var(--purple-color);">
                    <div class="r-icon bg-purple" style="margin-bottom:0; flex-shrink:0;"><i class="ph ph-chat-circle-dots"></i></div>
                    <div>
                        <h4 style="margin:0 0 4px 0;">Part 3 (C1)</h4>
                        <p style="margin:0; font-size:12px; color:var(--text-muted);">Ikki tomonlama argument tahlili. 1 daqiqa tayyorgarlik, 2 daqiqa gapirish.</p>
                    </div>
                </div>
            </div>
        `;
    };

    let speakingTestData = null;

    async function loadSpeakingTestData() {
        if (speakingTestData) return speakingTestData;
        try {
            const res = await fetch('tests.json');
            const data = await res.json();
            speakingTestData = data.speaking;
            return speakingTestData;
        } catch (e) {
            console.error("Failed to load speaking tests, using window.initialTestData", e);
            if (window.initialTestData) {
                speakingTestData = window.initialTestData.speaking;
                return speakingTestData;
            }
            return null;
        }
    }

    window.renderSpeakingTopics = async function(partId) {
        const container = document.getElementById('speaking-content-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="text-center" style="padding: 20px 0;">
                <i class="ph ph-spinner ph-spin" style="font-size:32px; color:var(--primary-color);"></i>
                <p style="margin-top:10px; color:var(--text-muted);">Mavzular yuklanmoqda...</p>
            </div>
        `;

        const data = await loadSpeakingTestData();
        if (!data || !data[partId]) {
            container.innerHTML = `<div style="color:var(--danger-color); padding: 15px;">Mavzularni yuklashda xatolik yuz berdi.</div>`;
            return;
        }

        updateSpeakingHeader('topics', partId);

        let html = `
            <div class="mb-4">
                <h3 style="font-size:14px; font-weight:700; color:var(--text-muted); margin-bottom:12px; text-transform:uppercase;">Mavzuni tanlang:</h3>
                <div style="display:flex; flex-direction:column; gap:12px;">
        `;

        data[partId].forEach(topic => {
            html += `
                <div class="glass-card" onclick="startSpeakingSession('${partId}', ${topic.id})" style="cursor:pointer; padding:16px; display:flex; justify-content:space-between; align-items:center; border: 1px solid var(--border-color); border-radius:var(--border-radius-md); background:var(--bg-card); transition:0.2s;">
                    <div>
                        <span style="font-weight:600; color:var(--text-main); font-size:15px;">${topic.title}</span>
                    </div>
                    <i class="ph ph-caret-right" style="color:var(--text-muted);"></i>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
        container.innerHTML = html;
    };

    window.startSpeakingSession = async function(partId, topicId) {
        const data = await loadSpeakingTestData();
        const topic = data[partId].find(t => t.id === topicId);
        if (!topic) return;

        currentSpeakingPart = partId;
        currentSpeakingTopic = topic;
        currentSpeakingQuestionIdx = 0;
        speakingAudioBlobs = [];
        speakingAudioChunks = [];

        if (partId === '2' || partId === '3') {
            startSpeakingPrep();
        } else {
            startSpeakingRecord();
        }
    };

    function startSpeakingPrep() {
        updateSpeakingHeader('prep');
        const container = document.getElementById('speaking-content-container');
        if (!container) return;

        speakingPrepSecondsLeft = 60; // 1 minute preparation time
        
        let questionsHtml = '';
        let imageHtml = '';

        if (currentSpeakingPart === '2') {
            imageHtml = `<div style="text-align:center; margin-bottom:16px;">
                <img src="${currentSpeakingTopic.image}" style="max-height:180px; max-width:100%; border-radius:var(--border-radius-md); box-shadow:0 4px 10px rgba(0,0,0,0.1);" alt="Topic Image">
            </div>`;
            questionsHtml = `<ol style="margin-left: 20px; font-weight: 500; text-align: left; color: var(--text-main); font-size:14px; line-height:1.5;">
                ${currentSpeakingTopic.questions.map(q => `<li style="margin-bottom:8px;">${q}</li>`).join('')}
            </ol>`;
        } else if (currentSpeakingPart === '3') {
            questionsHtml = `
                <div style="background:var(--bg-main); padding:16px; border-radius:var(--border-radius-sm); border-left:4px solid var(--purple-color); font-style:italic; font-size:14px; color:var(--text-main); margin-bottom:16px; line-height:1.5; text-align:left;">
                    "${currentSpeakingTopic.argument}"
                </div>
                <div style="font-weight:600; font-size:14px; color:var(--text-main); text-align:left;">
                    Task: <span style="font-weight:400; color:var(--text-muted);">${currentSpeakingTopic.task}</span>
                </div>
            `;
        }

        container.innerHTML = `
            <div class="glass-card text-center" style="padding:20px; background:var(--bg-card); border-radius:var(--border-radius-lg); box-shadow:0 4px 15px rgba(0,0,0,0.03);">
                <div style="font-size:13px; font-weight:700; color:var(--secondary-color); text-transform:uppercase; margin-bottom:8px; display:flex; align-items:center; justify-content:center; gap:6px;">
                    <i class="ph ph-hourglass-medium"></i> Tayyorgarlik vaqti (Preparation Time)
                </div>
                
                <h3 style="font-size:18px; font-weight:700; color:var(--primary-color); margin-bottom:16px;">${currentSpeakingTopic.title}</h3>
                
                ${imageHtml}
                
                <div class="mb-4" style="background:rgba(0,0,0,0.02); padding:16px; border-radius:var(--border-radius-md); border:1px solid var(--border-color);">
                    ${questionsHtml}
                </div>

                <div style="margin:20px 0;">
                    <div style="position:relative; width:90px; height:90px; margin:0 auto; display:flex; align-items:center; justify-content:center; background:var(--primary-light); border-radius:50%;">
                        <span id="prep-timer-text" style="font-size:28px; font-weight:800; color:var(--primary-color);">60</span>
                    </div>
                    <p style="margin-top:10px; font-size:13px; color:var(--text-muted);">Mavzu va savollar bilan tanishib chiqing.</p>
                </div>

                <button class="btn-primary w-100" onclick="skipSpeakingPrep()" style="padding:14px; font-size:15px; border-radius:24px; background:var(--success-color);">
                    <i class="ph ph-play"></i> Tayyorman, hoziroq boshlash
                </button>
            </div>
        `;

        clearInterval(speakingPrepInterval);
        speakingPrepInterval = setInterval(() => {
            speakingPrepSecondsLeft--;
            const timerEl = document.getElementById('prep-timer-text');
            if (timerEl) {
                timerEl.innerText = speakingPrepSecondsLeft;
            }
            if (speakingPrepSecondsLeft <= 0) {
                clearInterval(speakingPrepInterval);
                startSpeakingRecord();
            }
        }, 1000);
    }

    window.skipSpeakingPrep = function() {
        clearInterval(speakingPrepInterval);
        startSpeakingRecord();
    };

    window.startSpeakingRecord = async function() {
        updateSpeakingHeader('record');
        const container = document.getElementById('speaking-content-container');
        if (!container) return;

        clearInterval(speakingTimerInterval);

        if (currentSpeakingPart === '1.1') {
            speakingSecondsLeft = 30; 
        } else if (currentSpeakingPart === '1.2') {
            speakingSecondsLeft = (currentSpeakingQuestionIdx === 0) ? 45 : 30; 
        } else {
            speakingSecondsLeft = 120; 
        }

        const totalRecordingTime = speakingSecondsLeft;

        let promptContent = '';
        if (currentSpeakingPart === '1.1') {
            promptContent = `
                <div style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:4px;">
                    Savol ${currentSpeakingQuestionIdx + 1} / 3
                </div>
                <h3 style="font-size:20px; font-weight:700; color:var(--text-main); margin-bottom:20px; line-height:1.4;">
                    "${currentSpeakingTopic.questions[currentSpeakingQuestionIdx]}"
                </h3>
            `;
        } else if (currentSpeakingPart === '1.2') {
            const qNum = currentSpeakingQuestionIdx + 4; 
            const sideBySideImages = `
                <div style="display:flex; gap:10px; margin-bottom:16px;">
                    <div style="flex:1; height:120px; border-radius:8px; overflow:hidden; box-shadow:0 2px 5px rgba(0,0,0,0.1);">
                        <img src="${currentSpeakingTopic.images[0]}" style="width:100%; height:100%; object-fit:cover;" alt="Image 1">
                    </div>
                    <div style="flex:1; height:120px; border-radius:8px; overflow:hidden; box-shadow:0 2px 5px rgba(0,0,0,0.1);">
                        <img src="${currentSpeakingTopic.images[1]}" style="width:100%; height:100%; object-fit:cover;" alt="Image 2">
                    </div>
                </div>
            `;
            promptContent = `
                ${sideBySideImages}
                <div style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:4px;">
                    Savol ${qNum} / 6
                </div>
                <h3 style="font-size:18px; font-weight:700; color:var(--text-main); margin-bottom:20px; line-height:1.4;">
                    "${currentSpeakingTopic.questions[currentSpeakingQuestionIdx]}"
                </h3>
            `;
        } else if (currentSpeakingPart === '2') {
            promptContent = `
                <div style="text-align:center; margin-bottom:16px;">
                    <img src="${currentSpeakingTopic.image}" style="max-height:140px; max-width:100%; border-radius:8px; box-shadow:0 2px 5px rgba(0,0,0,0.1);" alt="Topic Image">
                </div>
                <div style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:4px;">
                    Gapirish topshirig'i (3 ta savolga javob bering)
                </div>
                <ol style="margin-left:20px; font-weight:500; text-align:left; color:var(--text-main); font-size:13px; line-height:1.5; margin-bottom:20px;">
                    ${currentSpeakingTopic.questions.map(q => `<li style="margin-bottom:4px;">${q}</li>`).join('')}
                </ol>
            `;
        } else if (currentSpeakingPart === '3') {
            promptContent = `
                <div style="background:var(--bg-main); padding:12px; border-radius:var(--border-radius-sm); border-left:4px solid var(--purple-color); font-style:italic; font-size:13px; color:var(--text-main); margin-bottom:12px; text-align:left; line-height:1.4;">
                    "${currentSpeakingTopic.argument}"
                </div>
                <div style="font-weight:600; font-size:13px; color:var(--text-main); text-align:left; margin-bottom:20px;">
                    Task: <span style="font-weight:400; color:var(--text-muted);">${currentSpeakingTopic.task}</span>
                </div>
            `;
        }

        container.innerHTML = `
            <div class="glass-card text-center" style="padding:20px; background:var(--bg-card); border-radius:var(--border-radius-lg); box-shadow:0 4px 15px rgba(0,0,0,0.03);">
                ${promptContent}

                <div style="margin:20px 0;">
                    <div style="position:relative; width:110px; height:110px; margin:0 auto; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#fff1f2; border-radius:50%; border: 4px solid var(--danger-color); box-shadow: 0 0 15px rgba(239, 68, 68, 0.2);">
                        <span id="speaking-timer-text" style="font-size:28px; font-weight:800; color:var(--danger-color);">${speakingSecondsLeft}</span>
                        <span style="font-size:9px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">soniya</span>
                    </div>
                </div>

                <div class="recording-animation" id="rec-pulse-wrapper" style="display:none; justify-content:center; gap:4px; align-items:center; margin-bottom:16px;">
                    <span style="width:6px; height:12px; background:var(--danger-color); border-radius:3px; animation: soundwave 1s ease-in-out infinite alternate;"></span>
                    <span style="width:6px; height:24px; background:var(--danger-color); border-radius:3px; animation: soundwave 1s ease-in-out infinite alternate 0.2s;"></span>
                    <span style="width:6px; height:16px; background:var(--danger-color); border-radius:3px; animation: soundwave 1s ease-in-out infinite alternate 0.4s;"></span>
                    <span style="width:6px; height:28px; background:var(--danger-color); border-radius:3px; animation: soundwave 1s ease-in-out infinite alternate 0.6s;"></span>
                    <span style="width:6px; height:10px; background:var(--danger-color); border-radius:3px; animation: soundwave 1s ease-in-out infinite alternate 0.8s;"></span>
                </div>

                <p id="speaking-rec-status" style="font-size:13px; color:var(--text-muted); margin-bottom:20px;">Mikrofonga ruxsat berilmoqda...</p>

                <div style="display:flex; justify-content:center; align-items:center; gap:20px;">
                    <button id="btn-speaking-mic" style="border:none; border-radius:50%; width:70px; height:70px; font-size:28px; display:inline-flex; align-items:center; justify-content:center; box-shadow:0 4px 15px rgba(239,68,68,0.3); background:var(--danger-color); color:white; cursor:pointer;" disabled>
                        <i class="ph-fill ph-microphone"></i>
                    </button>
                </div>
                
                <div style="margin-top:20px; font-size:11px; color:var(--text-muted);" id="speaking-min-warning">
                    Kamida 5 soniya gapiring.
                </div>
            </div>
            
            <style>
                @keyframes soundwave {
                    from { transform: scaleY(1); }
                    to { transform: scaleY(2.2); }
                }
            </style>
        `;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            speakingMicStream = stream;
            
            speakingMediaRecorder = new MediaRecorder(stream);
            speakingAudioChunks = [];
            
            speakingMediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) speakingAudioChunks.push(e.data);
            };
            
            speakingMediaRecorder.onstop = () => {
                const audioBlob = new Blob(speakingAudioChunks, { type: 'audio/webm' });
                speakingAudioBlobs.push(audioBlob);
                
                stream.getTracks().forEach(track => track.stop());
                
                if (currentSpeakingPart === '1.1' || currentSpeakingPart === '1.2') {
                    if (currentSpeakingQuestionIdx < 2) {
                        currentSpeakingQuestionIdx++;
                        startSpeakingRecord(); 
                    } else {
                        submitAllSpeakingAudio();
                    }
                } else {
                    submitAllSpeakingAudio();
                }
            };
            
            speakingMediaRecorder.start();
            
            const micBtn = document.getElementById('btn-speaking-mic');
            if (micBtn) {
                micBtn.disabled = false;
                micBtn.innerHTML = '<i class="ph-fill ph-stop"></i>';
                
                micBtn.addEventListener('click', () => {
                    const elapsed = totalRecordingTime - speakingSecondsLeft;
                    if (elapsed < 5) {
                        alert("Iltimos, kamida 5 soniya gapiring!");
                        return;
                    }
                    stopRecordingEarly();
                });
            }
            
            document.getElementById('rec-pulse-wrapper').style.display = 'flex';
            document.getElementById('speaking-rec-status').innerText = 'Nutqingiz yozib olinmoqda... Erta to\'xtatish uchun qizil tugmani bosing.';
            
            speakingTimerInterval = setInterval(() => {
                speakingSecondsLeft--;
                const timerEl = document.getElementById('speaking-timer-text');
                if (timerEl) {
                    timerEl.innerText = speakingSecondsLeft;
                }
                
                if (speakingSecondsLeft <= 5) {
                    if (timerEl) timerEl.style.color = '#ef4444';
                }

                if (speakingSecondsLeft <= 0) {
                    clearInterval(speakingTimerInterval);
                    stopRecordingEarly();
                }
            }, 1000);
            
        } catch (err) {
            console.error("Mic access failed", err);
            container.innerHTML = `
                <div class="glass-card text-center" style="padding:30px; background:var(--bg-card);">
                    <i class="ph ph-warning-circle" style="font-size:48px; color:var(--danger-color); margin-bottom:16px;"></i>
                    <h3>Mikrofon topilmadi!</h3>
                    <p style="color:var(--text-muted); margin-top:8px; font-size:14px; line-height:1.5;">
                        Speaking mashqini bajarish uchun brauzeringizda mikrofonga ruxsat berishingiz shart. Iltimos, sozlamalarni tekshiring.
                    </p>
                    <button class="btn-primary w-100 mt-4" onclick="renderSpeakingMain()">Orqaga qaytish</button>
                </div>
            `;
        }
    };

    function stopRecordingEarly() {
        clearInterval(speakingTimerInterval);
        if (speakingMediaRecorder && speakingMediaRecorder.state !== 'inactive') {
            speakingMediaRecorder.stop();
        }
    }

    async function submitAllSpeakingAudio() {
        updateSpeakingHeader('loading');
        const container = document.getElementById('speaking-content-container');
        if (!container) return;

        container.innerHTML = `
            <div class="glass-card text-center" style="padding:40px 20px; background:var(--bg-card); border-radius:var(--border-radius-lg);">
                <i class="ph ph-spinner ph-spin" style="font-size: 48px; color: var(--primary-color);"></i>
                <h3 style="margin-top:20px; font-size:18px; font-weight:700;">Nutqingiz tahlil qilinmoqda...</h3>
                <p style="margin-top:10px; font-size:14px; color:var(--text-muted); line-height:1.5;">
                    AI examiner sizning talaffuzingiz, ravonligingiz, grammatikangiz va so'z boyligingizni baholamoqda. Iltimos, bir necha soniya kuting.
                </p>
            </div>
        `;

        const formData = new FormData();
        formData.append('part', currentSpeakingPart);
        formData.append('topic', currentSpeakingTopic.title);
        
        let questionsList = [];
        if (currentSpeakingPart === '1.1' || currentSpeakingPart === '1.2') {
            questionsList = currentSpeakingTopic.questions;
        } else if (currentSpeakingPart === '2') {
            questionsList = [currentSpeakingTopic.questions.join(', ')]; 
        } else if (currentSpeakingPart === '3') {
            questionsList = [currentSpeakingTopic.argument + " Task: " + currentSpeakingTopic.task];
        }
        formData.append('questions', JSON.stringify(questionsList));

        speakingAudioBlobs.forEach((blob, idx) => {
            formData.append('audios', blob, `q_${idx+1}.webm`);
        });

        try {
            const apiEndpoint = getBackendUrl('/api/evaluate_speaking');
            const res = await fetch(apiEndpoint, {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                throw new Error("Server xatoligi yuz berdi. Backend o'chiq bo'lishi mumkin.");
            }

            const results = await res.json();
            if (results.error) {
                throw new Error(results.error);
            }

            renderSpeakingResults(results);

            let xp = 20;
            if (currentSpeakingPart === '1.2') xp = 30;
            if (currentSpeakingPart === '2') xp = 40;
            if (currentSpeakingPart === '3') xp = 50;
            addXP(xp);

        } catch (err) {
            console.error("Submit speaking error", err);
            container.innerHTML = `
                <div class="glass-card text-center" style="padding:30px; background:var(--bg-card);">
                    <i class="ph ph-x-circle" style="font-size:48px; color:var(--danger-color); margin-bottom:16px;"></i>
                    <h3>Tahlilda xatolik yuz berdi</h3>
                    <p style="color:var(--text-muted); margin-top:8px; font-size:14px; line-height:1.5;">
                        ${err.message}
                    </p>
                    <button class="btn-primary w-100 mt-4" onclick="renderSpeakingMain()">Qayta urinish</button>
                </div>
            `;
        }
    }

    function renderSpeakingResults(data) {
        updateSpeakingHeader('results');
        const container = document.getElementById('speaking-content-container');
        if (!container) return;

        const ds = data.detailed_scores || {};
        const fluency = ds.fluency || "0%";
        const pronunciation = ds.pronunciation || "0%";
        const vocabulary = ds.vocabulary || "0%";
        const grammar = ds.grammar || "0%";
        const overall = data.overall_score || "N/A";
        const feedback = data.feedback || "Taqriz yozilmadi.";
        const transcripts = data.transcripts || [];

        let transcriptHtml = '';
        if (currentSpeakingPart === '1.1' || currentSpeakingPart === '1.2') {
            currentSpeakingTopic.questions.forEach((q, idx) => {
                const trText = transcripts[idx] || 'Gapirilmadi / Ovoz yozilmadi';
                transcriptHtml += `
                    <div class="mb-4" style="text-align:left; background:rgba(0,0,0,0.01); padding:12px; border-radius:var(--border-radius-sm); border:1px solid var(--border-color);">
                        <div style="font-size:11px; font-weight:700; color:var(--text-muted); margin-bottom:4px;">SAVOL ${idx+1}:</div>
                        <div style="font-size:13px; font-weight:600; color:var(--text-main); margin-bottom:8px;">${q}</div>
                        <div style="font-size:11px; font-weight:700; color:var(--primary-color); margin-bottom:4px;">SIZNING JAVOBINGIZ (TRANSCRIPT):</div>
                        <div style="font-size:13px; font-style:italic; color:var(--text-main);">"${trText}"</div>
                    </div>
                `;
            });
        } else {
            const trText = transcripts[0] || 'Gapirilmadi / Ovoz yozilmadi';
            transcriptHtml += `
                <div class="mb-4" style="text-align:left; background:rgba(0,0,0,0.01); padding:12px; border-radius:var(--border-radius-sm); border:1px solid var(--border-color);">
                    <div style="font-size:11px; font-weight:700; color:var(--primary-color); margin-bottom:4px;">SIZNING NUTQINGIZ (TRANSCRIPT):</div>
                    <div style="font-size:13px; font-style:italic; color:var(--text-main); line-height:1.5;">"${trText}"</div>
                </div>
            `;
        }

        container.innerHTML = `
            <div class="result-card band-card mb-4 text-center" style="background:var(--bg-card); padding:24px; border-radius:var(--border-radius-lg); box-shadow:0 4px 15px rgba(0,0,0,0.03);">
                <h3 style="font-size:13px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:8px;">Baholash natijasi</h3>
                <div class="band-score" style="font-size:48px; font-weight:800; color:var(--primary-color); line-height:1; margin:10px 0;">${overall}</div>
                <p style="font-size:12px; color:var(--text-muted);">Umumiy CEFR darajangiz</p>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:20px;">
                <div class="glass-card" style="padding:16px; background:var(--bg-card); text-align:center; border-radius:var(--border-radius-md); box-shadow:0 2px 8px rgba(0,0,0,0.02); display:flex; flex-direction:column; align-items:center;">
                    <div style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:6px;">Ravonlik (Fluency)</div>
                    <div style="font-size:20px; font-weight:800; color:var(--primary-color);">${fluency}</div>
                </div>
                <div class="glass-card" style="padding:16px; background:var(--bg-card); text-align:center; border-radius:var(--border-radius-md); box-shadow:0 2px 8px rgba(0,0,0,0.02); display:flex; flex-direction:column; align-items:center;">
                    <div style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:6px;">Talaffuz (Pronunciation)</div>
                    <div style="font-size:20px; font-weight:800; color:var(--success-color);">${pronunciation}</div>
                </div>
                <div class="glass-card" style="padding:16px; background:var(--bg-card); text-align:center; border-radius:var(--border-radius-md); box-shadow:0 2px 8px rgba(0,0,0,0.02); display:flex; flex-direction:column; align-items:center;">
                    <div style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:6px;">So'z boyligi (Vocabulary)</div>
                    <div style="font-size:20px; font-weight:800; color:var(--secondary-color);">${vocabulary}</div>
                </div>
                <div class="glass-card" style="padding:16px; background:var(--bg-card); text-align:center; border-radius:var(--border-radius-md); box-shadow:0 2px 8px rgba(0,0,0,0.02); display:flex; flex-direction:column; align-items:center;">
                    <div style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:6px;">Grammatika (Grammar)</div>
                    <div style="font-size:20px; font-weight:800; color:var(--purple-color);">${grammar}</div>
                </div>
            </div>

            <div class="glass-card mb-4" style="background:var(--bg-card); padding:20px; border-radius:var(--border-radius-lg); text-align:left; box-shadow:0 4px 15px rgba(0,0,0,0.03);">
                <h4 style="font-size:14px; font-weight:700; color:var(--text-main); margin-bottom:12px; display:flex; align-items:center; gap:6px;">
                    <i class="ph-fill ph-lightbulb text-yellow" style="font-size:18px;"></i> AI Examiner Taqrizi (Feedback)
                </h4>
                <div style="font-size:13px; line-height:1.6; color:var(--text-main); white-space:pre-line;">
                    ${feedback}
                </div>
            </div>

            <div class="glass-card mb-4" style="background:var(--bg-card); padding:20px; border-radius:var(--border-radius-lg); box-shadow:0 4px 15px rgba(0,0,0,0.03);">
                <h4 style="font-size:14px; font-weight:700; color:var(--text-main); margin-bottom:12px; display:flex; align-items:center; gap:6px;">
                    <i class="ph ph-text-aa text-blue" style="font-size:18px;"></i> Nima eshitildi? (Transcript)
                </h4>
                ${transcriptHtml}
            </div>

            <button class="btn-primary w-100" onclick="renderSpeakingMain()" style="padding:14px; font-size:15px; border-radius:24px; margin-bottom:20px;">
                <i class="ph ph-arrow-left"></i> Bosh sahifaga qaytish
            </button>
        `;
    }

    // Initialize the Practice Views
    renderPracticeLevels('reading');
    renderPracticeLevels('listening');
    if (window.renderSpeakingMain) window.renderSpeakingMain();
    populateDictionaries();

});

async function populateDictionaries() {
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

    let phrases = [];
    let grammar = [];

    try {
        if (window.firebaseDB && window.firebaseGetDocs && window.firebaseCollection) {
            const db = window.firebaseDB;
            
            const phrasesSnap = await window.firebaseGetDocs(window.firebaseCollection(db, "phrases"));
            if (!phrasesSnap.empty) {
                phrasesSnap.forEach(doc => {
                    phrases.push(doc.data());
                });
            }
            
            const grammarSnap = await window.firebaseGetDocs(window.firebaseCollection(db, "grammar"));
            if (!grammarSnap.empty) {
                grammarSnap.forEach(doc => {
                    grammar.push(doc.data());
                });
            }
        }
    } catch (e) {
        console.error("Firestore dictionary load failed, falling back to static lists", e);
    }

    if (phrases.length === 0) {
        phrases = [
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
    }

    if (grammar.length === 0) {
        grammar = [
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
    }

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
