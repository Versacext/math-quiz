let state = {
    idx: 0,
    answers: {},
    isExam: false,
    examFinished: false,
    viewMode: 'desktop' 
};

const UI = {
    qText: document.getElementById('question-text'),
    options: document.getElementById('options-box'),
    grid: document.getElementById('questions-grid'),
    qIdx: document.getElementById('q-idx'),
    qTotal: document.getElementById('q-total'),
    hintBox: document.getElementById('hint-content'),
    viewBtn: document.getElementById('view-toggle')
};

function init() {
    const saved = localStorage.getItem('math_v7');
    if (saved) state = JSON.parse(saved);

    UI.qTotal.textContent = quizData.length;
    // Применяем сохраненный вид сразу
    document.body.className = state.viewMode + '-view';
    document.getElementById('mode-toggle').checked = state.isExam;

    setupEvents();
    render();
}

function setupEvents() {
    // Безупречный переключатель вида
    UI.viewBtn.onclick = () => {
        state.viewMode = (state.viewMode === 'desktop') ? 'mobile' : 'desktop';
        document.body.className = state.viewMode + '-view';
        save();
    };

    document.getElementById('next-btn').onclick = () => move(1);
    document.getElementById('prev-btn').onclick = () => move(-1);
    
    document.getElementById('mode-toggle').onchange = (e) => {
        state.isExam = e.target.checked;
        state.examFinished = false;
        save(); render();
    };

    document.getElementById('hint-btn').onclick = () => UI.hintBox.classList.toggle('hidden');

    document.getElementById('reset-btn').onclick = () => {
        if(confirm('Сбросить весь прогресс?')) {
            state.answers = {}; state.idx = 0; state.examFinished = false;
            save(); render();
        }
    };
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
    
    UI.hintBox.innerHTML = q.hint || "Намек: Вспомните базовые свойства этой операции или формулу.";
    UI.hintBox.classList.add('hidden');

    UI.options.innerHTML = '';
    const userAns = state.answers[state.idx];

    q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'opt-btn';
        btn.innerHTML = opt;

        if (userAns !== undefined) {
            if (!state.isExam || state.examFinished) {
                btn.disabled = true;
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

            // АВТОПЕРЕХОД: РОВНО 1 СЕКУНДА
            setTimeout(() => {
                if (state.idx < quizData.length - 1) {
                    move(1);
                }
            }, 1000); 
        };
        UI.options.appendChild(btn);
    });

    renderGrid();
    
    if (window.renderMathInElement) {
        renderMathInElement(document.body, { delimiters: [{left: "$", right: "$", display: false}] });
    }
}

function renderGrid() {
    UI.grid.innerHTML = '';
    quizData.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = `dot ${i === state.idx ? 'active' : ''}`;
        dot.textContent = i + 1;

        const ans = state.answers[i];
        if (ans !== undefined) {
            if (!state.isExam || state.examFinished) {
                dot.classList.add(ans === quizData[i].correct ? 'right' : 'false');
            } else {
                dot.classList.add('answered');
            }
        }
        dot.onclick = () => { state.idx = i; save(); render(); };
        UI.grid.appendChild(dot);
    });
}

function save() { localStorage.setItem('math_v7', JSON.stringify(state)); }

init();