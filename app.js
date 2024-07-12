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
const groupDescriptionRef = database.ref('groupDescription');

const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const usernameInput = document.getElementById('usernameInput');
const sendButton = document.getElementById('sendButton');
const typingAlert = document.getElementById('typingAlert');
const customThemeButton = document.getElementById('customThemeButton');
const themeSelectionPage = document.getElementById('themeSelectionPage');
const closeThemeButton = document.getElementById('closeThemeButton');
const themeButtons = document.querySelectorAll('.theme-button');
const settingsButton = document.getElementById('settingsButton');
const settingsPanel = document.getElementById('settingsPanel');
const groupDescription = document.getElementById('groupDescription');
const claimAdminButton = document.getElementById('claimAdminButton');
const closeSettingsButton = document.getElementById('closeSettingsButton');

let isTyping = false;
let typingTimeout = null;
let username = '';
let currentUserRef = null;
let isAuthorized = false;
let isAdmin = false;

const restrictedUsernames = {
  'ceo': { pin: '2009', logo: 'Protection.png' },
  'founder': '2009',
  'co-founder': '2009'
};

function createCEOLogo() {
  const ceoLogo = document.createElement('img');
  ceoLogo.src = 'Protection.png';
  ceoLogo.alt = 'CEO';
  ceoLogo.classList.add('ceo-logo');
  ceoLogo.style.width = '20px';
  ceoLogo.style.height = '20px';
  ceoLogo.style.marginLeft = '5px';
  ceoLogo.style.verticalAlign = 'middle';
  ceoLogo.title = 'Official CEO';
  ceoLogo.onerror = function() {
    this.onerror = null;
    this.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D"http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg" width="20" height="20"%3E%3Ctext x="0" y="15" fill="gold"%3E👑%3C%2Ftext%3E%3C%2Fsvg%3E';
  };
  ceoLogo.addEventListener('click', () => {
    alert('Official CEO');
  });
  return ceoLogo;
}

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

    if (userData && userData.isAdmin) {
      const adminIcon = document.createElement('img');
      adminIcon.src = 'https://cdn-icons-png.flaticon.com/512/5509/5509636.png';
      adminIcon.alt = 'Admin';
      adminIcon.classList.add('admin-icon');
      usernameSpan.appendChild(adminIcon);
    }

    if (message.username.toLowerCase() === 'ceo' && !usernameSpan.querySelector('.ceo-logo')) {
      usernameSpan.appendChild(createCEOLogo());
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

sendButton.addEventListener('click', sendMessageHandler);
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessageHandler();
  }
});

function sendMessageHandler() {
  const messageText = messageInput.value.trim();
  const usernameText = usernameInput.value.trim().toLowerCase();

  if (messageText && usernameText) {
    if (restrictedUsernames[usernameText] && !isAuthorized) {
      const pin = prompt(`Please enter the PIN for "${usernameText}":`, '');
      if (pin === (typeof restrictedUsernames[usernameText] === 'object' ? restrictedUsernames[usernameText].pin : restrictedUsernames[usernameText])) {
        isAuthorized = true;
        sendMessage(messageText, usernameText);
      } else {
        alert('Incorrect PIN. Access denied.');
      }
    } else {
      sendMessage(messageText, usernameText);
    }
  }
}

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
      if (pin === (typeof restrictedUsernames[usernameText] === 'object' ? restrictedUsernames[usernameText].pin : restrictedUsernames[usernameText])) {
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

settingsButton.addEventListener('click', () => {
  settingsPanel.classList.toggle('open');
});

closeSettingsButton.addEventListener('click', () => {
  settingsPanel.classList.remove('open');
});

groupDescription.addEventListener('input', () => {
  groupDescriptionRef.set(groupDescription.value);
});

claimAdminButton.addEventListener('click', () => {
  if (!isAdmin) {
    isAdmin = true;
    updateAdminStatus(username, true);
  }
});

function updateAdminStatus(username, isAdmin) {
  usersRef.child(username).update({ isAdmin: isAdmin });
  if (isAdmin) {
    const adminIcon = document.createElement('img');
    adminIcon.src = 'https://cdn-icons-png.flaticon.com/512/5509/5509636.png';
    adminIcon.alt = 'Admin';
    adminIcon.classList.add('admin-icon');
    const userMessages = document.querySelectorAll(`.message .username`);
    userMessages.forEach(usernameElement => {
      if (usernameElement.textContent.trim() === username) {
        usernameElement.appendChild(adminIcon.cloneNode(true));
      }
    });
  }
}

groupDescriptionRef.on('value', (snapshot) => {
  const description = snapshot.val();
  groupDescription.value = description || '';
});

