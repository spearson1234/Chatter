// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyABy3v0M50jKoSl1CO8F_swJ203afQSODU",
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
 
 let isTyping = false;
 let typingTimeout = null;
 let username = '';
 let currentUserRef = null;
 
 // Listen for new messages
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
 
 // Send message
 sendButton.addEventListener('click', () => {
   const messageText = messageInput.value.trim();
   const usernameText = usernameInput.value.trim();
 
   if (messageText && usernameText) {
     messagesRef.push({ text: messageText, username: usernameText });
     messageInput.value = '';
     isTyping = false;
     typingAlert.textContent = '';
   }
 });
 
 // Typing alert
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
 
 // Online/Offline status
 window.addEventListener('focus', () => {
   if (currentUserRef) {
     currentUserRef.update({ online: true });
   }
 });
 
 window.addEventListener('blur', () => {
   if (currentUserRef) {
     currentUserRef.update({ online: false });
   }
 });
 
 // Set up user
 usernameInput.addEventListener('input', () => {
   const usernameText = usernameInput.value.trim();
 
   if (usernameText) {
     username = usernameText;
     currentUserRef = usersRef.child(username);
     currentUserRef.onDisconnect().update({ online: false });
     currentUserRef.set({ online: true });
   } else {
     if (currentUserRef) {
       currentUserRef.set(null);
       currentUserRef = null;
     }
   }
 });
 