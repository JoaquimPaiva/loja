import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js"
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js"
import { getStorage } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js"

const firebaseConfig = {
  apiKey: "AIzaSyAkDAsmoRPxndBjShGbycgwMS31Jl2wSu0",
  authDomain: "teste-39735.firebaseapp.com",
  databaseURL: "https://teste-39735-default-rtdb.firebaseio.com",
  projectId: "teste-39735",
  storageBucket: "teste-39735.appspot.com",
  messagingSenderId: "721154488183",
  appId: "1:721154488183:web:2ab2ad6f3fe3088cd3d372",
  measurementId: "G-25LNWWWDEV",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const database = getDatabase(app)
const storage = getStorage(app)

export { app, database, storage }

