const storage = {
    getBookmarks: () => JSON.parse(localStorage.getItem('bookmarks') || '[]'),
    saveBookmarks: (data) => localStorage.setItem('bookmarks', JSON.stringify(data)),
    getNotes: () => JSON.parse(localStorage.getItem('notes') || '[]'),
    saveNotes: (data) => localStorage.setItem('notes', JSON.stringify(data)),
    getSettings: () => JSON.parse(localStorage.getItem('settings') || '{"darkMode":true,"quickLaunchNumber":4,"autoStart":false}'),
    saveSettings: (data) => localStorage.setItem('settings', JSON.stringify(data))
};
