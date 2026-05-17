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
            'lessons': 'Darslar',
            'rating': 'Reyting',
            'resources': 'Materiallar',
            'profile': 'Mening Profilim'
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
            roleText.innerText = "O'qituvchi • Senior";
            roleBtn.innerText = "O'quvchi profiliga o'tish (Demo)";
            titleName.innerText = "Miss Malika";
        } else {
            // Switch to Student
            studentStats.style.display = 'flex';
            teacherStats.style.display = 'none';
            roleText.innerText = "O'quvchi • Pre-IELTS";
            roleBtn.innerText = "O'qituvchi profiliga o'tish (Demo)";
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

    // Registration Form Submit
    const regForm = document.getElementById('reg-form');
    if (regForm) {
        regForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name').value;
            const level = document.getElementById('reg-level').value;

            // Update UI with user data
            document.querySelector('.welcome-area h2').innerText = 'Salom, ' + name.split(' ')[0] + ' 👋';
            document.querySelector('.profile-name').innerText = name;
            document.querySelector('.profile-role').innerText = "O'quvchi • " + level;
            
            // Switch to Home Section
            switchTab('home');
            
            // In a real bot, we would send this data back to the bot
            // if (window.Telegram && window.Telegram.WebApp) {
            //     window.Telegram.WebApp.sendData(JSON.stringify({name, level}));
            // }
        });
    }

    // Open Resource details
    window.openResource = function(type) {
        document.querySelectorAll('.app-section').forEach(sec => sec.classList.remove('active'));
        const target = document.getElementById(type + '-section');
        if(target) target.classList.add('active');
        document.querySelector('.app-title').innerText = type === 'alphabet' ? 'Alifbo' : 'Sonlar';
    };

    // Populate Dictionaries
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
}
