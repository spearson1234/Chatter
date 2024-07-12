// Disable right-click context menu
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

// Disable F12 and other developer tools shortcuts
document.addEventListener('keydown', function(e) {
    if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && e.keyCode === 73) || (e.ctrlKey && e.keyCode === 85)) {
        e.preventDefault();
    }
});

// Disable console
console.log = function() {};
console.error = function() {};
console.warn = function() {};

// Disable context menu on long press (mobile devices)
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});
