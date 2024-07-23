const firebaseConfig = {
    apiKey: "AIzaSyAHSW4ettEHj3Y562zYSI_n0Z1OwFaGsgw",
    authDomain: "login-71866.firebaseapp.com",
    projectId: "login-71866",
    storageBucket: "login-71866.appspot.com",
    messagingSenderId: "434042354282",
    appId: "1:434042354282:web:fbc98eaefe2ef6513a2813"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const authForm = document.getElementById('auth-form');
const messageElement = document.getElementById('message');
const toggleLink = document.getElementById('toggle-link');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');

let isSignUp = true;

toggleLink.addEventListener('click', (e) => {
    e.preventDefault();
    isSignUp = !isSignUp;
    formTitle.textContent = isSignUp ? 'Sign Up' : 'Log In';
    submitBtn.textContent = isSignUp ? 'Sign Up' : 'Log In';
    toggleLink.textContent = isSignUp ? 'Log In' : 'Sign Up';
    messageElement.textContent = '';
});

authForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
        if (email && password) {
            let userCredential;
            if (isSignUp) {
                userCredential = await auth.createUserWithEmailAndPassword(email, password);
            } else {
                userCredential = await auth.signInWithEmailAndPassword(email, password);
            }
            // Redirect to the game page after successful sign up or login
            window.location.href = 'Home.html';
        } else {
            messageElement.textContent = 'Email and password are required.';
            messageElement.style.color = 'red';
        }
    } catch (error) {
        messageElement.textContent = 'Error: ' + error.message;
        messageElement.style.color = 'red';
    }
});

// Check if user is already logged in
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in, redirect to game page
        window.location.href = 'Home.html';
    }
});
