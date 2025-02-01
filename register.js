import { auth, database } from "./config.js"
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js"
import { ref, set } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js"

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("register-form")

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault()
    const email = document.getElementById("email").value
    const password = document.getElementById("password").value
    const confirmPassword = document.getElementById("confirm-password").value

    if (password !== confirmPassword) {
      alert("As senhas não coincidem. Por favor, tente novamente.")
      return
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Salvar informações adicionais do usuário no Realtime Database
      await set(ref(database, "users/" + user.uid), {
        email: email,
        // Adicione outros campos conforme necessário
      })

      console.log("Usuário registrado com sucesso")
      alert("Registro bem-sucedido! Você será redirecionado para a página de login.")
      window.location.href = "login.html"
    } catch (error) {
      console.error("Erro no registro:", error)
      alert("Ocorreu um erro durante o registro: " + error.message)
    }
  })
})

