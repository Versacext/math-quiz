let state = {
    idx: 0,
    answers: {},
    isExam: false,
    viewMode: 'desktop'
};

const UI = {
    qText: document.getElementById('question-text'),
    options: document.getElementById('options-box'),
    grid: document.getElementById('questions-grid'),
    qIdx: document.getElementById('q-idx'),
    qTotal: document.getElementById('q-total'),
    viewBtn: document.getElementById('view-toggle'),
    musicBtn: document.getElementById('music-toggle'),
    hintBtn: document.getElementById('hint-btn'),
    hintContent: document.getElementById('hint-content'),
    audio: document.getElementById('bg-audio')
};

let isPlaying = false;

function init() {
    const saved = localStorage.getItem('math_pro_v11');
    if (saved) state = JSON.parse(saved);

    UI.qTotal.textContent = quizData.length;
    document.body.className = state.viewMode + '-view';
    document.getElementById('mode-toggle').checked = state.isExam;

    setupEvents();
    render();
}

function setupEvents() {
    UI.viewBtn.onclick = () => {
        state.viewMode = (state.viewMode === 'desktop') ? 'mobile' : 'desktop';
        document.body.className = state.viewMode + '-view';
        save();
    };

    UI.musicBtn.onclick = () => {
        if (!isPlaying) {
            UI.audio.play().catch(() => alert("Нажми на экран для активации звука"));
            UI.musicBtn.textContent = "🎶 Музыка: Вкл";
            UI.musicBtn.style.background = "#10b981";
        } else {
            UI.audio.pause();
            UI.musicBtn.textContent = "🎵 Музыка: Выкл";
            UI.musicBtn.style.background = "#6366f1";
        }
        isPlaying = !isPlaying;
    };

    // Логика кнопки подсказки
    UI.hintBtn.onclick = () => {
        UI.hintContent.classList.toggle('hidden');
    };

    document.getElementById('next-btn').onclick = () => move(1);
    document.getElementById('prev-btn').onclick = () => move(-1);
    document.getElementById('mode-toggle').onchange = (e) => { state.isExam = e.target.checked; save(); render(); };
    document.getElementById('reset-btn').onclick = () => { if(confirm('Сбросить весь прогресс?')) { state.answers = {}; state.idx = 0; save(); render(); }};
}

function move(dir) {
    let newIdx = state.idx + dir;
    if (newIdx >= 0 && newIdx < quizData.length) {
        state.idx = newIdx;
        save(); render();
    }
}

function render() {
    const q = quizData[state.idx];
    UI.qIdx.textContent = state.idx + 1;
    UI.qText.innerHTML = q.question;
    UI.options.innerHTML = '';
    
    // Сброс и заполнение подсказки
    UI.hintContent.classList.add('hidden');
    UI.hintContent.innerHTML = q.hint || "Совет: внимательно проверьте свойства функций или используйте метод исключения.";

    const userAns = state.answers[state.idx];

    q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'opt-btn';
        btn.innerHTML = opt;

        if (userAns !== undefined) {
            btn.disabled = true;
            if (!state.isExam) {
                if (i === q.correct) btn.classList.add('correct');
                else if (i === userAns) btn.classList.add('wrong');
            } else if (i === userAns) {
                btn.classList.add('selected');
            }
        }

        btn.onclick = () => {
            if (state.answers[state.idx] !== undefined) return;
            state.answers[state.idx] = i;
            save();
            render();

            // АВТОПЕРЕХОД 1 СЕКУНДА
            setTimeout(() => {
                if (state.idx < quizData.length - 1) move(1);
            }, 1000);
        };
        UI.options.appendChild(btn);
    });

    renderGrid();
    if (window.renderMathInElement) renderMathInElement(document.body, { delimiters: [{left: "$", right: "$", display: false}] });
}

function renderGrid() {
    UI.grid.innerHTML = '';
    quizData.forEach((q, i) => {
        const dot = document.createElement('div');
        dot.className = `dot ${i === state.idx ? 'active' : ''}`;
        dot.textContent = i + 1;
        const ans = state.answers[i];
        if (ans !== undefined) {
            dot.classList.add(state.isExam ? 'answered' : (ans === q.correct ? 'right' : 'false'));
        }
        dot.onclick = () => { state.idx = i; save(); render(); };
        UI.grid.appendChild(dot);
    });
}

function save() { localStorage.setItem('math_pro_v11', JSON.stringify(state)); }

init();
