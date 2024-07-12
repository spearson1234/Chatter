// Initialize Firebase
const firebaseConfig = {
  authDomain: "chat-34ed7.firebaseapp.com",
  databaseURL: "https://chat-34ed7-default-rtdb.firebaseio.com",
  projectId: "chat-34ed7",
  storageBucket: "chat-34ed7.appspot.com",
  messagingSenderId: "618695037030",
  appId: "1:618695037030:web:fb63e51d8de6d058a29da7"
};
firebase.initializeApp(firebaseConfig);

const database = firebase.database();
const messagesRef = database.ref('messages');
const usersRef = database.ref('users');

const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const usernameInput = document.getElementById('usernameInput');
const sendButton = document.getElementById('sendButton');
const typingAlert = document.getElementById('typingAlert');
const customThemeButton = document.getElementById('customThemeButton');
const themeSelectionPage = document.getElementById('themeSelectionPage');
const closeThemeButton = document.getElementById('closeThemeButton');
const themeButtons = document.querySelectorAll('.theme-button');

let isTyping = false;
let typingTimeout = null;
let username = '';
let currentUserRef = null;
let isAuthorized = false;

const restrictedUsernames = {
  'ceo': '2009',
  'founder': '2009',
  'co-founder': '2009'
};

messagesRef.on('child_added', (snapshot) => {
  const message = snapshot.val();
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');

  const usernameSpan = document.createElement('span');
  usernameSpan.classList.add('username');
  usernameSpan.textContent = `${message.username}`;

  const onlineStatusSpan = document.createElement('span');
  onlineStatusSpan.classList.add('online-status');

  usersRef.child(message.username).on('value', (snapshot) => {
    const userData = snapshot.val();
    if (userData && userData.online) {
      onlineStatusSpan.classList.remove('offline');
      onlineStatusSpan.classList.add('online');
    } else {
      onlineStatusSpan.classList.remove('online');
      onlineStatusSpan.classList.add('offline');
    }
  });

  const messageTextSpan = document.createElement('span');
  messageTextSpan.textContent = `: ${message.text}`;

  messageElement.appendChild(usernameSpan);
  messageElement.appendChild(onlineStatusSpan);
  messageElement.appendChild(messageTextSpan);

  if (message.username === username) {
    messageElement.classList.add('outgoing');
  } else {
    messageElement.classList.add('incoming');
  }

  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

sendButton.addEventListener('click', () => {
  const messageText = messageInput.value.trim();
  const usernameText = usernameInput.value.trim().toLowerCase();

  if (messageText && usernameText) {
    if (restrictedUsernames[usernameText] && !isAuthorized) {
      const pin = prompt(`Please enter the PIN for "${usernameText}":`, '');
      if (pin === restrictedUsernames[usernameText]) {
        isAuthorized = true;
        sendMessage(messageText, usernameText);
      } else {
        alert('Incorrect PIN. Access denied.');
      }
    } else {
      sendMessage(messageText, usernameText);
    }
  }
});

function sendMessage(text, username) {
  messagesRef.push({ text: text, username: username });
  messageInput.value = '';
  isTyping = false;
  typingAlert.textContent = '';
  updateOnlineStatus(username, true);
}

messageInput.addEventListener('input', () => {
  const usernameText = usernameInput.value.trim();

  if (usernameText) {
    isTyping = true;
    typingAlert.textContent = `${usernameText} is typing...`;

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      isTyping = false;
      typingAlert.textContent = '';
    }, 2000);
  }
});

window.addEventListener('focus', () => {
  if (currentUserRef) {
    updateOnlineStatus(username, true);
  }
});

window.addEventListener('blur', () => {
  if (currentUserRef) {
    updateOnlineStatus(username, false);
  }
});

usernameInput.addEventListener('input', () => {
  const usernameText = usernameInput.value.trim().toLowerCase();

  if (usernameText && usernameText !== username) {
    if (restrictedUsernames[usernameText] && !isAuthorized) {
      const pin = prompt(`Please enter the PIN for "${usernameText}":`, '');
      if (pin === restrictedUsernames[usernameText]) {
        setUsername(usernameText);
        isAuthorized = true;
      } else {
        alert('Incorrect PIN. Access denied.');
      }
    } else {
      setUsername(usernameText);
    }
  } else if (!usernameText && currentUserRef) {
    currentUserRef.set(null);
    currentUserRef = null;
    username = '';
    isAuthorized = false;
  }
});

function setUsername(newUsername) {
  username = newUsername;
  currentUserRef = usersRef.child(username);
  currentUserRef.onDisconnect().update({ online: false });
  updateOnlineStatus(username, true);
}

function updateOnlineStatus(username, isOnline) {
  if (currentUserRef) {
    currentUserRef.update({ online: isOnline });
  }
}

customThemeButton.addEventListener('click', () => {
  themeSelectionPage.style.display = 'flex';
});

closeThemeButton.addEventListener('click', () => {
  themeSelectionPage.style.display = 'none';
});

themeButtons.forEach(button => {
  button.addEventListener('click', () => {
    const theme = button.getAttribute('data-theme');
    document.body.className = theme !== 'default' ? `theme-${theme}` : '';
    themeSelectionPage.style.display = 'none';
  });
});
