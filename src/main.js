// Import Firebase and the services you need
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

// Your web app's Firebase configuration (replace with your config)
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Check if user is logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    if (window.location.pathname === '/src/home.html') {
      document.getElementById('user-name').innerText = user.email;
      getTasks();
    } else if (window.location.pathname === '/src/index.html') {
      window.location.href = 'home.html';
    }
  } else {
    if (window.location.pathname !== '/src/index.html') {
      window.location.href = 'index.html';
    }
  }
});

// Sign Up and Sign In Functions toggle in landing page
window.loginOrSignup = function () {
  document.getElementById('login').classList.toggle('hidden');
  document.getElementById('signup').classList.toggle('hidden');
  document.getElementById('login-error').innerText = '';
  document.getElementById('create-error').innerText = '';
};

// Sign Up Function
window.createAccount = function () {
    const email = document.getElementById('create-email').value;
    const password = document.getElementById('create-password').value;
    const confirmPassword = document.getElementById('create-confirm').value;

    if (email === '' || password === '') {
        document.getElementById('create-error').innerText = 'Please fill in all fields to continue.';
        return;
    }

    if (password !== confirmPassword) {
        document.getElementById('create-error').innerText = 'Passwords do not match.';
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            loginOrSignup();
        })
        .catch((error) => {
            document.getElementById('create-error').innerText = error.message;
            console.error(error);
        });
};

// Sign In Function
window.login = function () {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (email === '' || password === '') {
      document.getElementById('login-error').innerText = 'Please fill in all fields to continue.';
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Redirect to new page
            window.location.href = 'home.html';
            user = userCredential.user;
        })
        .catch((error) => {
            document.getElementById('login-error').innerText = error.message;
            console.error(error);
        });
};

// Sign Out Function
window.signOut = function () {
    signOut(auth)
        .then(() => {
            window.location.href = 'index.html';
        })
        .catch((error) => {
            alert(error.message);
        });
};

// Add a new task to the database
window.addListItem = async function () {
    const task = document.getElementById('task-input').value;
    const user = auth.currentUser;

    if (task === '') {
        document.getElementById('task-error').style.marginTop = '0';
        document.getElementById('task-error').innerText = 'Please enter a task to continue.';
        return;
    }

    try {
        await addDoc(collection(db, 'tasks'), {
            task: task,
            uid: user.uid,
            dateCreated: new Date(),
        });
        document.getElementById('task-error').innerText = '';
        document.getElementById('task-input').value = '';
        getTasks();
    } catch (e) {
        console.error('Error adding document: ', e);
    }
}

// get all tasks from the database
window.getTasks = async function () {
    const querySnapshot = await getDocs(collection(db, 'tasks'));
    document.getElementById('todo-list').innerHTML = '';
    querySnapshot.forEach((doc) => {
        document.getElementById('todo-list').innerHTML += `<li>${doc.data().task}<span onclick="markAsDone('${doc.id}')">✅<span></li>`;
    });
}

// Mark a task as done
window.markAsDone = async function (itemId) {
  try {
      await deleteDoc(doc(db, 'tasks', itemId));
      getTasks();
  } catch (e) {
      console.error('Error deleting document: ', e);
  }
}