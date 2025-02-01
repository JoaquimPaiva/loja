import { auth } from "./config.js"
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js"

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form")

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault()
    const email = document.getElementById("email").value
    const password = document.getElementById("password").value

    try {
      await signInWithEmailAndPassword(auth, email, password)
      console.log("Login bem-sucedido")
      window.location.href = "index.html"
    } catch (error) {
      console.error("Erro no login:", error)
      alert("Credenciais inválidas. Por favor, tente novamente.")
    }
  })
})

