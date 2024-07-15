// Firebase configuration and initialization
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

// DOM elements
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
const closeSettingsButton = document.getElementById('closeSettingsButton');
const messageProgressBar = document.getElementById('messageProgressBar');
const notificationToggle = document.getElementById('notificationToggle');

// Global variables
let username = '';
let currentUserRef = null;
let replyingTo = null;
let userMessageCount = 0;
let notificationsEnabled = false;

// Stats object
const stats = {
  totalMessages: 0,
  userMessageCounts: {},
  onlineUsers: new Set(),
  updateMessageStats: function(username) {
    this.totalMessages++;
    this.userMessageCounts[username] = (this.userMessageCounts[username] || 0) + 1;
    this.displayStats();
  },
  updateOnlineStats: function(username, isOnline) {
    if (isOnline) {
      this.onlineUsers.add(username);
    } else {
      this.onlineUsers.delete(username);
    }
    this.displayStats();
  },
  displayStats: function() {
    const statsElement = document.getElementById('statsDisplay');
    if (statsElement) {
      statsElement.innerHTML = `
        <h4>Chat Statistics</h4>
        <p>Total Messages: ${this.totalMessages}</p>
        <p>Active Users: ${this.onlineUsers.size}</p>
        <h5>Messages per User:</h5>
        <ul>
          ${Object.entries(this.userMessageCounts)
            .map(([user, count]) => `<li>${user}: ${count}</li>`)
            .join('')}
        </ul>
      `;
    }
  }
};

function createMessageElement(message) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  messageElement.dataset.id = message.id;

  const usernameSpan = document.createElement('span');
  usernameSpan.classList.add('username');
  usernameSpan.textContent = `${message.username}`;

  if (message.hasBadge) {
    const badgeImg = document.createElement('img');
    badgeImg.src = 'path/to/badge/image.png';
    badgeImg.alt = 'Active User Badge';
    badgeImg.classList.add('user-badge');
    usernameSpan.appendChild(badgeImg);
  }

  const onlineStatusSpan = document.createElement('span');
  onlineStatusSpan.classList.add('online-status');

  const messageTextSpan = document.createElement('span');
  messageTextSpan.textContent = `: ${message.text}`;

  const replyArrow = document.createElement('span');
  replyArrow.classList.add('reply-arrow');
  replyArrow.innerHTML = '↩️';
  replyArrow.addEventListener('click', () => {
    replyingTo = message;
    messageInput.placeholder = `Replying to ${message.username}...`;
    messageInput.focus();
  });

  messageElement.appendChild(usernameSpan);
  messageElement.appendChild(onlineStatusSpan);
  messageElement.appendChild(messageTextSpan);
  messageElement.appendChild(replyArrow);

  if (message.replyTo) {
    messageElement.classList.add('reply');
    const replyInfo = document.createElement('div');
    replyInfo.classList.add('reply-info');
    replyInfo.textContent = `Replying to ${message.replyTo.username}`;
    messageElement.insertBefore(replyInfo, messageElement.firstChild);
  }

  return messageElement;
}

messagesRef.on('child_added', (snapshot) => {
  const message = { ...snapshot.val(), id: snapshot.key };
  const messageElement = createMessageElement(message);

  if (message.username === username) {
    messageElement.classList.add('outgoing');
    userMessageCount++;
    updateProgressBar();
  } else {
    messageElement.classList.add('incoming');
    if (notificationsEnabled) {
      showNotification(`New message from ${message.username}`, message.text);
    }
  }

  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  usersRef.child(message.username).on('value', (snapshot) => {
    const userData = snapshot.val();
    const onlineStatusSpan = messageElement.querySelector('.online-status');
    if (userData && userData.online) {
      onlineStatusSpan.classList.remove('offline');
      onlineStatusSpan.classList.add('online');
    } else {
      onlineStatusSpan.classList.remove('online');
      onlineStatusSpan.classList.add('offline');
    }
  });

  stats.updateMessageStats(message.username);
});

function updateProgressBar() {
  const progress = (userMessageCount / 10000) * 100;
  messageProgressBar.style.width = `${Math.min(progress, 100)}%`;

  if (userMessageCount >= 10000) {
    showNotification('Congratulations!', 'You\'ve earned the Active User Badge!');
    usersRef.child(username).update({ hasBadge: true });
  }
}

function showNotification(title, message) {
  if (notificationsEnabled && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification(title, { body: message });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, { body: message });
        }
      });
    }
  }
}

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
    sendMessage(messageText, usernameText);
  }
}

function sendMessage(text, username) {
  const message = {
    text: text,
    username: username,
    timestamp: firebase.database.ServerValue.TIMESTAMP,
  };

  if (replyingTo) {
    message.replyTo = {
      id: replyingTo.id,
      username: replyingTo.username
    };
  }

  messagesRef.push(message);
  messageInput.value = '';
  updateOnlineStatus(username, true);

  replyingTo = null;
  messageInput.placeholder = "Type your message...";
}

function updateOnlineStatus(username, isOnline) {
  if (currentUserRef) {
    currentUserRef.update({ online: isOnline });
  }
  stats.updateOnlineStats(username, isOnline);
}

usernameInput.addEventListener('input', () => {
  clearTimeout(usernameInputTimeout);
  usernameInputTimeout = setTimeout(() => {
    const usernameText = usernameInput.value.trim().toLowerCase();
    if (usernameText && usernameText !== username) {
      setUsername(usernameText);
    } else if (!usernameText && currentUserRef) {
      currentUserRef.set(null);
      currentUserRef = null;
      username = '';
      stats.updateOnlineStats(username, false);
    }
  }, 500);
});

function setUsername(newUsername) {
  if (username) {
    stats.updateOnlineStats(username, false);
  }
  username = newUsername;
  currentUserRef = usersRef.child(username);
  currentUserRef.onDisconnect().update({ online: false });
  updateOnlineStatus(username, true);
}

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

window.addEventListener('beforeunload', () => {
  if (username) {
    updateOnlineStatus(username, false);
  }
});

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
  stats.displayStats();
});

closeSettingsButton.addEventListener('click', () => {
  settingsPanel.classList.remove('open');
});

notificationToggle.addEventListener('click', () => {
  if (!notificationsEnabled) {
    enableNotifications();
  } else {
    disableNotifications();
  }
});

function enableNotifications() {
  Notification.requestPermission().then(function (permission) {
    if (permission === 'granted') {
      notificationsEnabled = true;
      notificationToggle.textContent = 'Turn off Notifications';
      notificationToggle.classList.add('active');
      showNotification('Notifications Enabled', 'You will now receive notifications for new messages.');
    }
  });
}

function disableNotifications() {
  notificationsEnabled = false;
  notificationToggle.textContent = 'Turn on Notifications';
  notificationToggle.classList.remove('active');
  showNotification('Notifications Disabled', 'You will no longer receive notifications for new messages.');
}

// Initialize stats display
stats.displayStats();
