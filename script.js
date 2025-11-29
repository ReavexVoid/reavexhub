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

renderBookmarks();
renderNotes();
