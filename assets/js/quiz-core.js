/**
 * Quiz Core Logic - Fixed Version
 */

let allQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let timerInterval;
let timeLeft;
let playerName = "";
let selectedCategory = "";
let userAnswers = [];

// 1. Inisialisasi: Cek Nama Player dengan Pengecekan Null yang Aman
document.addEventListener("DOMContentLoaded", () => {
    const savedName = localStorage.getItem("quiz_player_name");
    
    // Ambil elemen dengan aman
    const nameOverlay = document.getElementById('name-overlay');
    const categorySection = document.getElementById('category-section');

    if (savedName) {
        playerName = savedName;
        // Hanya eksekusi classList jika elemen ditemukan
        if (nameOverlay) nameOverlay.classList.add('hidden');
        if (categorySection) categorySection.classList.remove('hidden');
        updatePlayerUI();
    }
});

function saveName() {
    const nameInput = document.getElementById('player-name');
    const nameOverlay = document.getElementById('name-overlay');
    const categorySection = document.getElementById('category-section');

    if (!nameInput) return;

    const input = nameInput.value.trim();
    if (input.length < 3) {
        Swal.fire('Eits!', 'Nama minimal 3 karakter ya!', 'warning');
        return;
    }

    playerName = input;
    localStorage.setItem("quiz_player_name", input);

    if (nameOverlay) {
        nameOverlay.classList.add('animate__animated', 'animate__backOutUp');
        setTimeout(() => {
            nameOverlay.classList.add('hidden');
            if (categorySection) categorySection.classList.remove('hidden');
            updatePlayerUI();
        }, 600);
    }
}

function updatePlayerUI() {
    const display = document.getElementById('player-display');
    if (display) display.innerText = `Player: ${playerName}`;
}

// 2. Pilih Kategori & Load Data
async function selectCategory(category) {
    selectedCategory = category;
    
    const catSection = document.getElementById('category-section');
    const mainContainer = document.getElementById('quiz-main-container');

    if (catSection) catSection.classList.add('hidden');
    if (mainContainer) mainContainer.classList.remove('hidden');
    
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
        showLoading(false);
        Swal.fire('Error', 'Gagal memuat soal.', 'error');
    }
}

function showLoading(status) {
    const container = document.getElementById('quiz-content');
    if (!container) return;

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
    const container = document.getElementById('quiz-content');
    if (!container) return;

    if (currentQuestionIndex >= allQuestions.length) {
        finishQuiz();
        return;
    }

    const q = allQuestions[currentQuestionIndex];
    
    container.innerHTML = `
        <div class="animate__animated animate__fadeInRight">
            <span class="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                ${q.category} - Soal ${currentQuestionIndex + 1}/${allQuestions.length}
            </span>
            <h2 class="text-2xl font-bold text-gray-800 mt-4 mb-6">${q.text}</h2>
            <div class="space-y-3">
                ${q.options.map(opt => `
                    <button class="btn-option w-full p-4 text-left border-2 border-gray-100 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all font-medium" 
                            onclick="handleAnswer('${opt.replace(/'/g, "\\'")}')">
                        ${opt}
                    </button>
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
    
    if (!bar || !text) return;

    bar.classList.remove('timer-warning', 'bg-red-500');
    bar.classList.add('bg-indigo-500');
    bar.style.width = '100%';
    text.innerText = timeLeft;

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        text.innerText = timeLeft;
        bar.style.width = (timeLeft / duration * 100) + '%';

        if (timeLeft <= 5) {
            bar.classList.remove('bg-indigo-500');
            bar.classList.add('timer-warning', 'bg-red-500');
        }
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleAnswer(null); 
        }
    }, 1000);
}

// 5. Cek Jawaban
function handleAnswer(selected) {
    clearInterval(timerInterval);
    const q = allQuestions[currentQuestionIndex];
    const isCorrect = selected === q.correct;

    if (isCorrect) score += 10;

    userAnswers.push({
        question: q.text,
        selected: selected,
        correct: q.correct,
        isCorrect: isCorrect
    });

    currentQuestionIndex++;
    renderQuestion();
}

// 6. Finish & Review
function finishQuiz() {
    const container = document.getElementById('quiz-content');
    if (container) {
        container.innerHTML = `
            <div class="text-center p-6">
                <div class="fancy-loader mx-auto"></div>
                <p class="mt-4 font-bold text-indigo-600">Menghitung hasil akhir...</p>
            </div>`;
    }

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
    const modal = document.getElementById('review-modal');
    
    if (!container || !modal) return;

    container.innerHTML = userAnswers.map((item, i) => `
        <div class="p-4 rounded-xl mb-3 ${item.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}">
            <p class="font-bold text-gray-800">${i+1}. ${item.question}</p>
            <p class="text-sm mt-1">
                Jawabanmu: <span class="${item.isCorrect ? 'text-green-600' : 'text-red-600'} font-bold">${item.selected || 'Waktu Habis'}</span>
                ${!item.isCorrect ? `<br><span class="text-indigo-600 font-bold">Jawaban Benar: ${item.correct}</span>` : ''}
            </p>
        </div>
    `).join('');
    
    modal.classList.remove('hidden');
}

function closeReview() {
    location.reload();
}