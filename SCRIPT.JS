// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCupwywO7QNb_e7JfaMVRDkCwZ-LJB_k1g",
    authDomain: "famebuilder-87b82.firebaseapp.com",
    databaseURL: "https://famebuilder-87b82-default-rtdb.firebaseio.com",
    projectId: "famebuilder-87b82",
    storageBucket: "famebuilder-87b82.appspot.com",
    messagingSenderId: "538875391483",
    appId: "1:538875391483:web:b511eacf276f699ef22f5e"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('message-input');
    const chatMessages = document.getElementById('chat-messages');
    const usernameInput = document.getElementById('username-input');
    const typingIndicator = document.getElementById('typing-indicator');

    // Load existing messages and listen for new ones
    db.ref('messages').on('value', snapshot => {
        chatMessages.innerHTML = ''; // Clear the chat
        snapshot.forEach(childSnapshot => {
            const messageData = childSnapshot.val();
            const messageElement = document.createElement('div');
            messageElement.className = 'message ' + (messageData.username === usernameInput.value ? 'sent' : 'received');
            messageElement.innerHTML = `<div class="username">${messageData.username}:</div><div class="content">${messageData.message}</div>`;
            chatMessages.appendChild(messageElement);
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });

    // Listen for typing status
    db.ref('typing').on('value', snapshot => {
        const typingData = snapshot.val();
        if (typingData && typingData.username !== usernameInput.value) {
            typingIndicator.innerText = `${typingData.username} is typing...`;
            typingIndicator.style.display = 'block';
        } else {
            typingIndicator.style.display = 'none';
        }
    });

    // Handle Enter key press to send message
    messageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });
});

let typingTimeout;
function updateTypingStatus() {
    const usernameInput = document.getElementById('username-input');
    const username = usernameInput.value.trim() || 'Anonymous';

    db.ref('typing').set({
        username: username
    });

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        db.ref('typing').remove();
    }, 2000); // Remove typing status after 2 seconds of inactivity
}

function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const usernameInput = document.getElementById('username-input');

    const messageText = messageInput.value.trim();
    const username = usernameInput.value.trim() || 'Anonymous';

    if (messageText === '') return;

    // Add a new message to the Realtime Database
    db.ref('messages').push({
        username: username,
        message: messageText,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });

    messageInput.value = '';
    db.ref('typing').remove(); // Remove typing status after sending message
}
