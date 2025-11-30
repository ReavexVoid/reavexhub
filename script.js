let settings = storage.getSettings();

// --- Section váltás ---
function showSection(id) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// --- Könyvjelzők ---
function renderBookmarks() {
    const list = document.getElementById('bookmarkList');
    list.innerHTML = '';
    storage.getBookmarks().forEach((bm, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="${bm.url}" target="_blank">${bm.name}</a> <button onclick="deleteBookmark(${idx})">🗑️</button>`;
        list.appendChild(li);
    });
    renderQuickLaunch();
}

function addBookmark() {
    const name = document.getElementById('bookmarkName').value;
    const url = document.getElementById('bookmarkURL').value;
    const type = document.getElementById('bookmarkType').value;
    if (!name || !url) return alert('Add meg a nevet és URL/fájl útvonalat!');

    let finalLink = url;
    if (type === 'file') {
        if (!url.startsWith('file://')) finalLink = 'file:///' + url.replace(/\\/g, '/');
    } else {
        if (!/^https?:\/\//i.test(url)) finalLink = 'https://' + url;
    }

    const bookmarks = storage.getBookmarks();
    bookmarks.push({name, url: finalLink, type});
    storage.saveBookmarks(bookmarks);
    renderBookmarks();
    document.getElementById('bookmarkName').value = '';
    document.getElementById('bookmarkURL').value = '';
}

function deleteBookmark(index) {
    const bookmarks = storage.getBookmarks();
    bookmarks.splice(index, 1);
    storage.saveBookmarks(bookmarks);
    renderBookmarks();
}

function searchBookmarks() {
    const query = document.getElementById('searchBookmark').value.toLowerCase();
    document.querySelectorAll('#bookmarkList li').forEach(li => {
        li.style.display = li.textContent.toLowerCase().includes(query) ? '' : 'none';
    });
}

// --- Quick Launch ---
function renderQuickLaunch() {
    const container = document.getElementById('quickLaunchContainer');
    container.innerHTML = '';
    storage.getBookmarks().slice(0, settings.quickLaunchNumber).forEach(bm => {
        const btn = document.createElement('button');
        btn.className = 'btn-animated';
        btn.textContent = bm.name + (bm.type === 'file' ? ' 📁' : '');
        btn.onclick = () => window.open(bm.url, '_blank');
        container.appendChild(btn);
    });
}

// --- Jegyzetek ---
function renderNotes() {
    const list = document.getElementById('notesList');
    list.innerHTML = '';
    storage.getNotes().forEach((note, idx) => {
        const li = document.createElement('li');
        li.textContent = note;
        const btn = document.createElement('button');
        btn.innerHTML = '🗑️';
        btn.onclick = () => deleteNote(idx);
        li.appendChild(btn);
        list.appendChild(li);
    });
}

function addNote() {
    const note = document.getElementById('noteInput').value;
    if (!note) return;
    const notes = storage.getNotes();
    notes.push(note);
    storage.saveNotes(notes);
    renderNotes();
    document.getElementById('noteInput').value = '';
}

function deleteNote(index) {
    const notes = storage.getNotes();
    notes.splice(index, 1);
    storage.saveNotes(notes);
    renderNotes();
}

// --- Számológép ---
function appendToDisplay(value) {
    const display = document.getElementById('calculatorDisplay');
    if (display.textContent === '0') {
        display.textContent = value;
    } else {
        display.textContent += value;
    }
}

function clearDisplay() {
    document.getElementById('calculatorDisplay').textContent = '0';
}

function calculate() {
    const display = document.getElementById('calculatorDisplay');
    try {
        display.textContent = eval(display.textContent);
    } catch {
        display.textContent = 'Hiba';
    }
}

// --- Időzítő ---
let timerInterval;
let timerTime = 0;

function startTimer() {
    const minutes = parseInt(document.getElementById('timerMinutes').value) || 0;
    const seconds = parseInt(document.getElementById('timerSeconds').value) || 0;
    timerTime = minutes * 60 + seconds;
    if (timerTime > 0) {
        timerInterval = setInterval(updateTimer, 1000);
    }
}

function stopTimer() {
    clearInterval(timerInterval);
}

function resetTimer() {
    stopTimer();
    timerTime = 0;
    updateTimerDisplay();
}

function updateTimer() {
    if (timerTime > 0) {
        timerTime--;
        updateTimerDisplay();
    } else {
        stopTimer();
        alert('Az idő lejárt!');
    }
}

function updateTimerDisplay() {
    const hours = Math.floor(timerTime / 3600);
    const minutes = Math.floor((timerTime % 3600) / 60);
    const seconds = timerTime % 60;
    document.getElementById('timerDisplay').textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// --- Settings ---
function toggleDarkMode() {
    settings.darkMode = document.getElementById('darkModeToggle').checked;
    document.body.classList.toggle('light-mode', !settings.darkMode);
    storage.saveSettings(settings);
}

function updateQuickLaunchNumber() {
    const val = parseInt(document.getElementById('quickLaunchNumber').value);
    if (val < 1 || val > 10) return;
    settings.quickLaunchNumber = val;
    storage.saveSettings(settings);
    renderQuickLaunch();
}

function toggleAutoStart() {
    settings.autoStart = document.getElementById('autoStartToggle').checked;
    storage.saveSettings(settings);
    alert('Auto-indítás PWA vagy Chrome extension esetén működik.');
}

// --- Init ---
document.getElementById('darkModeToggle').checked = settings.darkMode;
document.getElementById('quickLaunchNumber').value = settings.quickLaunchNumber;
document.getElementById('autoStartToggle').checked = settings.autoStart;
document.body.classList.toggle('light-mode', !settings.darkMode);

// --- To-Do List ---
function renderTodos() {
    const list = document.getElementById('todoList');
    list.innerHTML = '';
    storage.getTodos().forEach((todo, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `<input type="checkbox" ${todo.done ? 'checked' : ''} onchange="toggleTodo(${idx})"> ${todo.text} <button onclick="deleteTodo(${idx})">🗑️</button>`;
        list.appendChild(li);
    });
}

function addTodo() {
    const text = document.getElementById('todoInput').value;
    if (!text) return;
    const todos = storage.getTodos();
    todos.push({text, done: false});
    storage.saveTodos(todos);
    renderTodos();
    document.getElementById('todoInput').value = '';
}

function deleteTodo(index) {
    const todos = storage.getTodos();
    todos.splice(index, 1);
    storage.saveTodos(todos);
    renderTodos();
}

function toggleTodo(index) {
    const todos = storage.getTodos();
    todos[index].done = !todos[index].done;
    storage.saveTodos(todos);
    renderTodos();
}

// --- Weather ---
async function fetchWeather() {
    const city = document.getElementById('weatherCity').value;
    if (!city) return;
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=YOUR_API_KEY&units=metric`);
        const data = await response.json();
        document.getElementById('weatherDisplay').innerHTML = `Temperature: ${data.main.temp}°C, ${data.weather[0].description}`;
    } catch (e) {
        document.getElementById('weatherDisplay').innerHTML = 'Error fetching weather';
    }
}

// --- Currency Converter ---
async function convertCurrency() {
    const amount = document.getElementById('currencyAmount').value;
    const from = document.getElementById('currencyFrom').value;
    const to = document.getElementById('currencyTo').value;
    if (!amount) return;
    try {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
        const data = await response.json();
        const rate = data.rates[to];
        const result = amount * rate;
        document.getElementById('currencyResult').innerHTML = `${amount} ${from} = ${result.toFixed(2)} ${to}`;
    } catch (e) {
        document.getElementById('currencyResult').innerHTML = 'Error converting currency';
    }
}

// --- Unit Converter ---
function convertUnit() {
    const value = parseFloat(document.getElementById('unitValue').value);
    const from = document.getElementById('unitFrom').value;
    const to = document.getElementById('unitTo').value;
    if (isNaN(value)) return;
    let result;
    if (from === 'm' && to === 'km') result = value / 1000;
    else if (from === 'km' && to === 'm') result = value * 1000;
    else if (from === 'm' && to === 'ft') result = value * 3.28084;
    else if (from === 'ft' && to === 'm') result = value / 3.28084;
    else if (from === 'km' && to === 'ft') result = value * 3280.84;
    else if (from === 'ft' && to === 'km') result = value / 3280.84;
    else result = value;
    document.getElementById('unitResult').innerHTML = `${value} ${from} = ${result.toFixed(2)} ${to}`;
}

// --- Password Generator ---
function generatePassword() {
    const length = document.getElementById('passwordLength').value;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    document.getElementById('passwordDisplay').innerHTML = password;
}

// --- Random Quote ---
async function fetchQuote() {
    try {
        const response = await fetch('https://api.quotable.io/random');
        const data = await response.json();
        document.getElementById('quoteDisplay').innerHTML = `"${data.content}" - ${data.author}`;
    } catch (e) {
        document.getElementById('quoteDisplay').innerHTML = 'Error fetching quote';
    }
}

// --- Pomodoro Timer ---
let pomodoroTime = 25 * 60;
let pomodoroInterval;

function startPomodoro() {
    pomodoroInterval = setInterval(updatePomodoro, 1000);
}

function stopPomodoro() {
    clearInterval(pomodoroInterval);
}

function resetPomodoro() {
    stopPomodoro();
    pomodoroTime = 25 * 60;
    updatePomodoroDisplay();
}

function updatePomodoro() {
    if (pomodoroTime > 0) {
        pomodoroTime--;
        updatePomodoroDisplay();
    } else {
        stopPomodoro();
        alert('Pomodoro session complete!');
    }
}

function updatePomodoroDisplay() {
    const minutes = Math.floor(pomodoroTime / 60);
    const seconds = pomodoroTime % 60;
    document.getElementById('pomodoroDisplay').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// --- Habit Tracker ---
function renderHabits() {
    const list = document.getElementById('habitList');
    list.innerHTML = '';
    storage.getHabits().forEach((habit, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `${habit.name} - Streak: ${habit.streak} <button onclick="markHabitDone(${idx})">Done</button> <button onclick="deleteHabit(${idx})">🗑️</button>`;
        list.appendChild(li);
    });
}

function addHabit() {
    const name = document.getElementById('habitInput').value;
    if (!name) return;
    const habits = storage.getHabits();
    habits.push({name, streak: 0});
    storage.saveHabits(habits);
    renderHabits();
    document.getElementById('habitInput').value = '';
}

function deleteHabit(index) {
    const habits = storage.getHabits();
    habits.splice(index, 1);
    storage.saveHabits(habits);
    renderHabits();
}

function markHabitDone(index) {
    const habits = storage.getHabits();
    habits[index].streak++;
    storage.saveHabits(habits);
    renderHabits();
}

// --- Expense Tracker ---
function renderExpenses() {
    const list = document.getElementById('expenseList');
    list.innerHTML = '';
    storage.getExpenses().forEach((exp, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `${exp.desc}: $${exp.amount} <button onclick="deleteExpense(${idx})">🗑️</button>`;
        list.appendChild(li);
    });
}

function addExpense() {
    const desc = document.getElementById('expenseDesc').value;
    const amount = document.getElementById('expenseAmount').value;
    if (!desc || !amount) return;
    const expenses = storage.getExpenses();
    expenses.push({desc, amount: parseFloat(amount)});
    storage.saveExpenses(expenses);
    renderExpenses();
    document.getElementById('expenseDesc').value = '';
    document.getElementById('expenseAmount').value = '';
}

function deleteExpense(index) {
    const expenses = storage.getExpenses();
    expenses.splice(index, 1);
    storage.saveExpenses(expenses);
    renderExpenses();
}

// --- Calendar ---
function renderCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let html = `<h4>${now.toLocaleString('default', {month: 'long'})} ${year}</h4><table>`;
    html += '<tr><th>Mo</th><th>Tu</th><th>We</th><th>Th</th><th>Fr</th><th>Sa</th><th>Su</th></tr><tr>';
    const firstDay = new Date(year, month, 1).getDay();
    let day = 1;
    for (let i = 0; i < 42; i++) {
        if (i < firstDay - 1 || day > daysInMonth) {
            html += '<td></td>';
        } else {
            html += `<td>${day}</td>`;
            day++;
        }
        if ((i + 1) % 7 === 0) html += '</tr><tr>';
    }
    html += '</tr></table>';
    document.getElementById('calendarDisplay').innerHTML = html;
}

// --- File Organizer ---
function uploadFiles() {
    const files = document.getElementById('fileInput').files;
    const fileList = storage.getFiles();
    for (let file of files) {
        fileList.push({name: file.name, size: file.size});
    }
    storage.saveFiles(fileList);
    renderFiles();
}

function renderFiles() {
    const list = document.getElementById('fileList');
    list.innerHTML = '';
    storage.getFiles().forEach((file, idx) => {
        const li = document.createElement('li');
        li.textContent = `${file.name} (${file.size} bytes)`;
        const btn = document.createElement('button');
        btn.innerHTML = '🗑️';
        btn.onclick = () => deleteFile(idx);
        li.appendChild(btn);
        list.appendChild(li);
    });
}

function deleteFile(index) {
    const files = storage.getFiles();
    files.splice(index, 1);
    storage.saveFiles(files);
    renderFiles();
}

// --- Music Player ---
function loadMusic() {
    const file = document.getElementById('musicInput').files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        document.getElementById('musicPlayer').src = url;
        const musicList = storage.getMusic();
        musicList.push({name: file.name, url});
        storage.saveMusic(musicList);
        renderMusic();
    }
}

function renderMusic() {
    const list = document.getElementById('musicList');
    list.innerHTML = '';
    storage.getMusic().forEach((music, idx) => {
        const li = document.createElement('li');
        li.textContent = music.name;
        const btn = document.createElement('button');
        btn.innerHTML = '▶️';
        btn.onclick = () => document.getElementById('musicPlayer').src = music.url;
        li.appendChild(btn);
        const delBtn = document.createElement('button');
        delBtn.innerHTML = '🗑️';
        delBtn.onclick = () => deleteMusic(idx);
        li.appendChild(delBtn);
        list.appendChild(li);
    });
}

function deleteMusic(index) {
    const music = storage.getMusic();
    music.splice(index, 1);
    storage.saveMusic(music);
    renderMusic();
}

// --- Video Player ---
function loadVideo() {
    const file = document.getElementById('videoInput').files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        document.getElementById('videoPlayer').src = url;
        const videos = storage.getVideos();
        videos.push({name: file.name, url});
        storage.saveVideos(videos);
        renderVideos();
    }
}

function renderVideos() {
    const list = document.getElementById('videoList');
    list.innerHTML = '';
    storage.getVideos().forEach((video, idx) => {
        const li = document.createElement('li');
        li.textContent = video.name;
        const btn = document.createElement('button');
        btn.innerHTML = '▶️';
        btn.onclick = () => document.getElementById('videoPlayer').src = video.url;
        li.appendChild(btn);
        const delBtn = document.createElement('button');
        delBtn.innerHTML = '🗑️';
        delBtn.onclick = () => deleteVideo(idx);
        li.appendChild(delBtn);
        list.appendChild(li);
    });
}

function deleteVideo(index) {
    const videos = storage.getVideos();
    videos.splice(index, 1);
    storage.saveVideos(videos);
    renderVideos();
}

// --- Text Editor ---
function saveText() {
    const text = document.getElementById('textEditor').value;
    const texts = storage.getTexts();
    texts.push({content: text, date: new Date().toISOString()});
    storage.saveTexts(texts);
    renderTexts();
}

function renderTexts() {
    const list = document.getElementById('textList');
    list.innerHTML = '';
    storage.getTexts().forEach((text, idx) => {
        const li = document.createElement('li');
        li.textContent = text.content.substring(0, 50) + '...';
        const btn = document.createElement('button');
        btn.innerHTML = '🗑️';
        btn.onclick = () => deleteText(idx);
        li.appendChild(btn);
        list.appendChild(li);
    });
}

function deleteText(index) {
    const texts = storage.getTexts();
    texts.splice(index, 1);
    storage.saveTexts(texts);
    renderTexts();
}

// --- Drawing Canvas ---
let canvas = document.getElementById('drawingCanvas');
let ctx = canvas.getContext('2d');
let drawing = false;

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

function startDrawing(e) {
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
}

function draw(e) {
    if (!drawing) return;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
}

function stopDrawing() {
    drawing = false;
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function saveDrawing() {
    const dataURL = canvas.toDataURL();
    const drawings = storage.getDrawings();
    drawings.push({data: dataURL, date: new Date().toISOString()});
    storage.saveDrawings(drawings);
    renderDrawings();
}

function renderDrawings() {
    const list = document.getElementById('drawingList');
    list.innerHTML = '';
    storage.getDrawings().forEach((drawing, idx) => {
        const li = document.createElement('li');
        const img = document.createElement('img');
        img.src = drawing.data;
        img.width = 100;
        li.appendChild(img);
        const btn = document.createElement('button');
        btn.innerHTML = '🗑️';
        btn.onclick = () => deleteDrawing(idx);
        li.appendChild(btn);
        list.appendChild(li);
    });
}

function deleteDrawing(index) {
    const drawings = storage.getDrawings();
    drawings.splice(index, 1);
    storage.saveDrawings(drawings);
    renderDrawings();
}

// --- RSS Reader ---
function addRSS() {
    const url = document.getElementById('rssURL').value;
    const rss = storage.getRSS();
    rss.push({url});
    storage.saveRSS(rss);
    renderRSS();
}

function renderRSS() {
    const display = document.getElementById('rssDisplay');
    display.innerHTML = '';
    storage.getRSS().forEach((feed, idx) => {
        const div = document.createElement('div');
        div.textContent = feed.url;
        const btn = document.createElement('button');
        btn.innerHTML = '🗑️';
        btn.onclick = () => deleteRSS(idx);
        div.appendChild(btn);
        display.appendChild(div);
    });
}

function deleteRSS(index) {
    const rss = storage.getRSS();
    rss.splice(index, 1);
    storage.saveRSS(rss);
    renderRSS();
}

// --- Chat App ---
function sendMessage() {
    const message = document.getElementById('chatMessage').value;
    const chats = storage.getChats();
    chats.push({text: message, time: new Date().toLocaleTimeString()});
    storage.saveChats(chats);
    renderChats();
    document.getElementById('chatMessage').value = '';
}

function renderChats() {
    const display = document.getElementById('chatDisplay');
    display.innerHTML = '';
    storage.getChats().forEach(chat => {
        const div = document.createElement('div');
        div.textContent = `${chat.time}: ${chat.text}`;
        display.appendChild(div);
    });
}

// --- Tic-Tac-Toe ---
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameMode = 'pvp';
let aiDifficulty = 'easy';
let scores = { X: 0, O: 0, draws: 0 };

function renderGame() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    board.forEach((cell, idx) => {
        const btn = document.createElement('button');
        btn.textContent = cell;
        btn.onclick = () => makeMove(idx);
        gameBoard.appendChild(btn);
    });
    updateGameStatus();
    updateScoreBoard();
}

function makeMove(index) {
    if (board[index] === '' && !checkWinner()) {
        board[index] = currentPlayer;
        renderGame();
        if (checkWinner()) return;
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        if (gameMode === 'ai' && currentPlayer === 'O') {
            setTimeout(aiMove, 500);
        }
    }
}

function aiMove() {
    let move;
    if (aiDifficulty === 'easy') {
        move = getRandomMove();
    } else {
        move = getBestMove();
    }
    if (move !== -1) {
        board[move] = 'O';
        renderGame();
        if (checkWinner()) return;
        currentPlayer = 'X';
    }
}

function getRandomMove() {
    const available = board.map((cell, idx) => cell === '' ? idx : null).filter(idx => idx !== null);
    return available[Math.floor(Math.random() * available.length)];
}

function getBestMove() {
    let bestScore = -Infinity;
    let move = -1;
    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = 'O';
            let score = minimax(board, 0, false);
            board[i] = '';
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(board, depth, isMaximizing) {
    let result = checkWinner(true);
    if (result !== null) {
        return result;
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinner(silent = false) {
    const winPatterns = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ];
    for (let pattern of winPatterns) {
        if (board[pattern[0]] && board[pattern[0]] === board[pattern[1]] && board[pattern[1]] === board[pattern[2]]) {
            if (!silent) {
                scores[board[pattern[0]]]++;
                updateScoreBoard();
                setTimeout(() => alert(`${board[pattern[0]]} wins!`), 100);
                setTimeout(resetGame, 2000);
            }
            return board[pattern[0]] === 'O' ? 10 : -10;
        }
    }
    if (board.every(cell => cell !== '')) {
        if (!silent) {
            scores.draws++;
            updateScoreBoard();
            setTimeout(() => alert('Draw!'), 100);
            setTimeout(resetGame, 2000);
        }
        return 0;
    }
    return null;
}

function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    renderGame();
}

function resetScore() {
    scores = { X: 0, O: 0, draws: 0 };
    updateScoreBoard();
}

function changeMode() {
    gameMode = document.getElementById('gameMode').value;
    resetGame();
}

function changeDifficulty() {
    aiDifficulty = document.getElementById('aiDifficulty').value;
    resetGame();
}

function updateGameStatus() {
    const status = document.getElementById('gameStatus');
    if (checkWinner(true) !== null) return;
    status.textContent = gameMode === 'ai' && currentPlayer === 'O' ? "AI's turn" : `Player ${currentPlayer}'s turn`;
}

function updateScoreBoard() {
    const scoreBoard = document.getElementById('scoreBoard');
    scoreBoard.textContent = `X: ${scores.X} | O: ${scores.O} | Draws: ${scores.draws}`;
}

// --- News Aggregator ---
async function fetchNews() {
    try {
        const response = await fetch(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${settings.apiKeys.news}`);
        const data = await response.json();
        const news = storage.getNews();
        news.push(...data.articles);
        storage.saveNews(news);
        renderNews();
    } catch (e) {
        document.getElementById('newsDisplay').innerHTML = 'Error fetching news';
    }
}

function renderNews() {
    const display = document.getElementById('newsDisplay');
    display.innerHTML = '';
    storage.getNews().forEach((article, idx) => {
        const div = document.createElement('div');
        div.innerHTML = `<h4>${article.title}</h4><p>${article.description}</p>`;
        display.appendChild(div);
    });
}

// --- Reminders ---
function addReminder() {
    const text = document.getElementById('reminderText').value;
    const time = document.getElementById('reminderTime').value;
    const reminders = storage.getReminders();
    reminders.push({text, time});
    storage.saveReminders(reminders);
    renderReminders();
    document.getElementById('reminderText').value = '';
    document.getElementById('reminderTime').value = '';
}

function renderReminders() {
    const list = document.getElementById('reminderList');
    list.innerHTML = '';
    storage.getReminders().forEach((reminder, idx) => {
        const li = document.createElement('li');
        li.textContent = `${reminder.text} at ${reminder.time}`;
        const btn = document.createElement('button');
        btn.innerHTML = '🗑️';
        btn.onclick = () => deleteReminder(idx);
        li.appendChild(btn);
        list.appendChild(li);
    });
}

function deleteReminder(index) {
    const reminders = storage.getReminders();
    reminders.splice(index, 1);
    storage.saveReminders(reminders);
    renderReminders();
}

// --- Settings Functions ---
function updateTheme() {
    settings.theme = document.getElementById('themeSelect').value;
    storage.saveSettings(settings);
}

function updateFontSize() {
    settings.fontSize = document.getElementById('fontSizeInput').value;
    storage.saveSettings(settings);
    document.body.style.fontSize = settings.fontSize + 'px';
}

function updateFontFamily() {
    settings.fontFamily = document.getElementById('fontFamilySelect').value;
    storage.saveSettings(settings);
    document.body.style.fontFamily = settings.fontFamily;
}

function updateLanguage() {
    settings.language = document.getElementById('languageSelect').value;
    storage.saveSettings(settings);
}

function toggleNotifications() {
    settings.notifications = document.getElementById('notificationsToggle').checked;
    storage.saveSettings(settings);
}

function toggleSoundEffects() {
    settings.soundEffects = document.getElementById('soundEffectsToggle').checked;
    storage.saveSettings(settings);
}

function toggleAutoSave() {
    settings.autoSave = document.getElementById('autoSaveToggle').checked;
    storage.saveSettings(settings);
}

function updateBackupFrequency() {
    settings.backupFrequency = document.getElementById('backupFrequencySelect').value;
    storage.saveSettings(settings);
}

function updateExportFormat() {
    settings.exportFormat = document.getElementById('exportFormatSelect').value;
    storage.saveSettings(settings);
}

function updateImportFormat() {
    settings.importFormat = document.getElementById('importFormatSelect').value;
    storage.saveSettings(settings);
}

function toggleSyncEnabled() {
    settings.syncEnabled = document.getElementById('syncEnabledToggle').checked;
    storage.saveSettings(settings);
}

function updateSyncProvider() {
    settings.syncProvider = document.getElementById('syncProviderSelect').value;
    storage.saveSettings(settings);
}

function togglePrivacyMode() {
    settings.privacyMode = document.getElementById('privacyModeToggle').checked;
    storage.saveSettings(settings);
}

function updateDataRetention() {
    settings.dataRetention = document.getElementById('dataRetentionInput').value;
    storage.saveSettings(settings);
}

function toggleAccessibility() {
    settings.accessibility = document.getElementById('accessibilityToggle').checked;
    storage.saveSettings(settings);
}

function toggleKeyboardShortcuts() {
    settings.keyboardShortcuts = document.getElementById('keyboardShortcutsToggle').checked;
    storage.saveSettings(settings);
}

function toggleGestureSupport() {
    settings.gestureSupport = document.getElementById('gestureSupportToggle').checked;
    storage.saveSettings(settings);
}

function toggleOfflineMode() {
    settings.offlineMode = document.getElementById('offlineModeToggle').checked;
    storage.saveSettings(settings);
}

function updatePerformanceMode() {
    settings.performanceMode = document.getElementById('performanceModeSelect').value;
    storage.saveSettings(settings);
}

function toggleUpdateCheck() {
    settings.updateCheck = document.getElementById('updateCheckToggle').checked;
    storage.saveSettings(settings);
}

function toggleBetaFeatures() {
    settings.betaFeatures = document.getElementById('betaFeaturesToggle').checked;
    storage.saveSettings(settings);
}

function toggleAnalytics() {
    settings.analytics = document.getElementById('analyticsToggle').checked;
    storage.saveSettings(settings);
}

function toggleFeedback() {
    settings.feedback = document.getElementById('feedbackToggle').checked;
    storage.saveSettings(settings);
}

function toggleSupport() {
    settings.support = document.getElementById('supportToggle').checked;
    storage.saveSettings(settings);
}

function toggleTutorial() {
    settings.tutorial = document.getElementById('tutorialToggle').checked;
    storage.saveSettings(settings);
}

function toggleResetOnStart() {
    settings.resetOnStart = document.getElementById('resetOnStartToggle').checked;
    storage.saveSettings(settings);
}

function updateCustomCSS() {
    settings.customCSS = document.getElementById('customCSSInput').value;
    storage.saveSettings(settings);
    const style = document.getElementById('customStyle') || document.createElement('style');
    style.id = 'customStyle';
    style.textContent = settings.customCSS;
    document.head.appendChild(style);
}

function updateCustomJS() {
    settings.customJS = document.getElementById('customJSInput').value;
    storage.saveSettings(settings);
    eval(settings.customJS);
}

function updateAPIKeys() {
    settings.apiKeys.weather = document.getElementById('weatherAPIKeyInput').value;
    settings.apiKeys.currency = document.getElementById('currencyAPIKeyInput').value;
    settings.apiKeys.news = document.getElementById('newsAPIKeyInput').value;
    storage.saveSettings(settings);
}

// --- Init ---
document.getElementById('darkModeToggle').checked = settings.darkMode;
document.getElementById('quickLaunchNumber').value = settings.quickLaunchNumber;
document.getElementById('autoStartToggle').checked = settings.autoStart;
document.getElementById('themeSelect').value = settings.theme;
document.getElementById('fontSizeInput').value = settings.fontSize;
document.getElementById('fontFamilySelect').value = settings.fontFamily;
document.getElementById('languageSelect').value = settings.language;
document.getElementById('notificationsToggle').checked = settings.notifications;
document.getElementById('soundEffectsToggle').checked = settings.soundEffects;
document.getElementById('autoSaveToggle').checked = settings.autoSave;
document.getElementById('backupFrequencySelect').value = settings.backupFrequency;
document.getElementById('exportFormatSelect').value = settings.exportFormat;
document.getElementById('importFormatSelect').value = settings.importFormat;
document.getElementById('syncEnabledToggle').checked = settings.syncEnabled;
document.getElementById('syncProviderSelect').value = settings.syncProvider;
document.getElementById('privacyModeToggle').checked = settings.privacyMode;
document.getElementById('dataRetentionInput').value = settings.dataRetention;
document.getElementById('accessibilityToggle').checked = settings.accessibility;
document.getElementById('keyboardShortcutsToggle').checked = settings.keyboardShortcuts;
document.getElementById('gestureSupportToggle').checked = settings.gestureSupport;
document.getElementById('offlineModeToggle').checked = settings.offlineMode;
document.getElementById('performanceModeSelect').value = settings.performanceMode;
document.getElementById('updateCheckToggle').checked = settings.updateCheck;
document.getElementById('betaFeaturesToggle').checked = settings.betaFeatures;
document.getElementById('analyticsToggle').checked = settings.analytics;
document.getElementById('feedbackToggle').checked = settings.feedback;
document.getElementById('supportToggle').checked = settings.support;
document.getElementById('tutorialToggle').checked = settings.tutorial;
document.getElementById('resetOnStartToggle').checked = settings.resetOnStart;
document.getElementById('customCSSInput').value = settings.customCSS;
document.getElementById('customJSInput').value = settings.customJS;
document.getElementById('weatherAPIKeyInput').value = settings.apiKeys.weather;
document.getElementById('currencyAPIKeyInput').value = settings.apiKeys.currency;
document.getElementById('newsAPIKeyInput').value = settings.apiKeys.news;
document.body.classList.toggle('light-mode', !settings.darkMode);
document.body.style.fontSize = settings.fontSize + 'px';
document.body.style.fontFamily = settings.fontFamily;
updateCustomCSS();

renderBookmarks();
renderNotes();
renderTodos();
renderHabits();
renderExpenses();
renderCalendar();
renderFiles();
renderMusic();
renderVideos();
renderTexts();
renderDrawings();
renderRSS();
renderChats();
renderNews();
renderReminders();
renderGame();
