/**
 * Quiz Core Logic - Optimized Version (No Leaderboard)
 * Features: Name Input, Category Filter, Timer, Scoring, Review
 */

let allQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let timerInterval;
let timeLeft;
let playerName = "";
let selectedCategory = "";
let userAnswers = []; // Riwayat untuk review

// 1. Inisialisasi: Cek Nama Player
document.addEventListener("DOMContentLoaded", () => {
    const savedName = localStorage.getItem("quiz_player_name");
    if (savedName) {
        playerName = savedName;
        document.getElementById('name-overlay').classList.add('hidden');
        document.getElementById('category-section').classList.remove('hidden');
        updatePlayerUI();
    }
});

function saveName() {
    const input = document.getElementById('player-name').value.trim();
    if (input.length < 3) {
        Swal.fire('Eits!', 'Nama minimal 3 karakter ya!', 'warning');
        return;
    }
    playerName = input;
    localStorage.setItem("quiz_player_name", input);
    document.getElementById('name-overlay').classList.add('animate__animated', 'animate__backOutUp');
    setTimeout(() => {
        document.getElementById('name-overlay').classList.add('hidden');
        document.getElementById('category-section').classList.remove('hidden');
        updatePlayerUI();
    }, 600);
}

function updatePlayerUI() {
    const display = document.getElementById('player-display');
    if (display) display.innerText = `Player: ${playerName}`;
}

// 2. Pilih Kategori & Load Data
async function selectCategory(category) {
    selectedCategory = category;
    document.getElementById('category-section').classList.add('hidden');
    document.getElementById('quiz-main-container').classList.remove('hidden');
    
    showLoading(true);
    try {
        const response = await fetch(`/.netlify/functions/get-quiz?category=${category}`);
        allQuestions = await response.json();
        showLoading(false);
        
        if (allQuestions.length > 0) {
            startQuiz();
        } else {
            Swal.fire('Kosong', 'Belum ada soal di kategori ini.', 'info').then(() => location.reload());
        }
    } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Gagal memuat soal.', 'error');
    }
}

function showLoading(status) {
    const container = document.getElementById('quiz-content');
    if (status) {
        container.innerHTML = `
            <div class="loader-wrapper text-center">
                <div class="fancy-loader mx-auto"></div>
                <p class="mt-4 text-indigo-600 font-bold animate__animated animate__pulse animate__infinite">Menyiapkan soal...</p>
            </div>`;
    }
}

// 3. Alur Kuis
function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];
    renderQuestion();
}

function renderQuestion() {
    if (currentQuestionIndex >= allQuestions.length) {
        finishQuiz();
        return;
    }

    const q = allQuestions[currentQuestionIndex];
    const container = document.getElementById('quiz-content');
    
    container.innerHTML = `
        <div class="animate__animated animate__fadeInRight">
            <span class="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                ${q.category} - Soal ${currentQuestionIndex + 1}/${allQuestions.length}
            </span>
            <h2 class="text-2xl font-bold text-gray-800 mt-4 mb-6">${q.text}</h2>
            <div class="space-y-3">
                ${q.options.map(opt => `
                    <button class="btn-option w-full" onclick="handleAnswer('${opt}')">${opt}</button>
                `).join('')}
            </div>
        </div>
    `;

    startTimer(q.timer || 15);
}

// 4. Timer Logic
function startTimer(duration) {
    timeLeft = duration;
    const bar = document.getElementById('timer-bar');
    const text = document.getElementById('timer-text');
    
    // Reset bar style
    bar.classList.remove('timer-warning');
    bar.style.width = '100%';
    text.innerText = timeLeft;

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        text.innerText = timeLeft;
        bar.style.width = (timeLeft / duration * 100) + '%';

        if (timeLeft <= 5) bar.classList.add('timer-warning');
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleAnswer(null); // Auto-fail saat waktu habis
        }
    }, 1000);
}

// 5. Cek Jawaban
function handleAnswer(selected) {
    clearInterval(timerInterval);
    const q = allQuestions[currentQuestionIndex];
    const isCorrect = selected === q.correct;

    if (isCorrect) score += 10;

    // Simpan riwayat untuk review modal
    userAnswers.push({
        question: q.text,
        selected: selected,
        correct: q.correct,
        isCorrect: isCorrect
    });

    currentQuestionIndex++;
    renderQuestion();
}

// 6. Finish & Review (Tanpa Leaderboard/Database)
function finishQuiz() {
    // Tampilan transisi singkat
    document.getElementById('quiz-content').innerHTML = `
        <div class="text-center p-6">
            <div class="fancy-loader mx-auto"></div>
            <p class="mt-4 font-bold text-indigo-600">Menghitung hasil akhir...</p>
        </div>`;

    setTimeout(() => {
        Swal.fire({
            title: 'Kuis Selesai!',
            html: `Halo <b>${playerName}</b>, skor kamu adalah:<br><b class="text-indigo-600 text-4xl">${score}</b>`,
            icon: 'success',
            showCancelButton: true,
            confirmButtonText: 'Review Jawaban',
            cancelButtonText: 'Main Lagi',
            confirmButtonColor: '#6366f1',
            cancelButtonColor: '#94a3b8'
        }).then((result) => {
            if (result.isConfirmed) {
                showReview();
            } else {
                location.reload();
            }
        });
    }, 800);
}

function showReview() {
    const container = document.getElementById('review-content');
    container.innerHTML = userAnswers.map((item, i) => `
        <div class="p-4 rounded-xl mb-3 ${item.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}">
            <p class="font-bold text-gray-800">${i+1}. ${item.question}</p>
            <p class="text-sm mt-1">
                Jawabanmu: <span class="${item.isCorrect ? 'text-green-600' : 'text-red-600'} font-bold">${item.selected || 'Waktu Habis (Kosong)'}</span>
                ${!item.isCorrect ? `<br><span class="text-indigo-600 font-bold">Jawaban Benar: ${item.correct}</span>` : ''}
            </p>
        </div>
    `).join('');
    document.getElementById('review-modal').classList.remove('hidden');
}

function closeReview() {
    location.reload();
}