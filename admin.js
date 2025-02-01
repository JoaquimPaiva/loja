function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`)
}

import {
  auth,
  database,
  ref,
  onValue,
  remove,
  loadProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  updateStock,
} from "./config.js"
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js"

let currentProducts = {}

function checkAdminAuth() {
  log("Verificando autenticação do administrador")
  onAuthStateChanged(auth, (user) => {
    if (user && user.email === "adalberto.j.s.p@gmail.com") {
      log("Administrador autenticado:", user.email)
      initializeAdmin()
    } else {
      log("Usuário não autorizado")
      window.location.href = "login.html"
    }
  })
}

function initializeAdmin() {
  log("Inicializando painel administrativo")
  loadProducts((products) => {
    log("Produtos carregados:", products)
    currentProducts = products
    loadProductsTable()
    loadStockTable()
    loadReviewsTable()
  })
}

function loadProductsTable() {
  log("Carregando tabela de produtos")
  const tableBody = document.querySelector("#tabela-produtos tbody")
  tableBody.innerHTML = ""

  if (!currentProducts || Object.keys(currentProducts).length === 0) {
    log("Nenhum produto cadastrado")
    tableBody.innerHTML = "<tr><td colspan='6'>Nenhum produto cadastrado.</td></tr>"
    return
  }

  Object.entries(currentProducts).forEach(([productId, product]) => {
    if (product && typeof product.preco !== "undefined") {
      const row = tableBody.insertRow()
      row.innerHTML = `
        <td>${productId}</td>
        <td>${product.nome || "N/A"}</td>
        <td>R$ ${product.preco.toFixed(2)}</td>
        <td>${product.categoria || "N/A"}</td>
        <td>${product.estoque || 0}</td>
        <td>
          <button onclick="editProduct('${productId}')" class="button button-secondary">Editar</button>
          <button onclick="deleteProductHandler('${productId}')" class="button button-danger">Excluir</button>
        </td>
      `
    } else {
      log(`Produto inválido: ${productId}`, product)
    }
  })
  log("Tabela de produtos carregada")
}

function loadStockTable() {
  log("Carregando tabela de estoque")
  const tableBody = document.querySelector("#tabela-estoque tbody")
  tableBody.innerHTML = ""

  if (Object.keys(currentProducts).length === 0) {
    log("Nenhum produto cadastrado")
    tableBody.innerHTML = "<tr><td colspan='4'>Nenhum produto cadastrado.</td></tr>"
    return
  }

  Object.entries(currentProducts).forEach(([productId, product]) => {
    const row = tableBody.insertRow()
    row.innerHTML = `
      <td>${productId}</td>
      <td>${product.nome}</td>
      <td>${product.estoque}</td>
      <td>
        <button onclick="updateStockHandler('${productId}', ${product.estoque + 1})" class="button button-secondary">+</button>
        <button onclick="updateStockHandler('${productId}', ${product.estoque - 1})" 
          class="button button-secondary" ${product.estoque <= 0 ? "disabled" : ""}>-</button>
      </td>
    `
  })
  log("Tabela de estoque carregada")
}

function loadReviewsTable() {
  log("Carregando tabela de avaliações")
  const reviewsRef = ref(database, "avaliacoes")
  onValue(reviewsRef, (snapshot) => {
    const data = snapshot.val() || {}
    log("Avaliações carregadas:", data)
    const tableBody = document.querySelector("#tabela-avaliacoes tbody")
    tableBody.innerHTML = ""

    const hasReviews = Object.keys(data).length > 0
    if (!hasReviews) {
      log("Nenhuma avaliação encontrada")
      tableBody.innerHTML = "<tr><td colspan='4'>Nenhuma avaliação encontrada.</td></tr>"
      return
    }

    Object.entries(data).forEach(([productId, reviews]) => {
      const numReviews = Object.keys(reviews).length
      const productName = currentProducts[productId] ? currentProducts[productId].nome : "Produto não encontrado"

      const row = tableBody.insertRow()
      row.innerHTML = `
        <td>${productId}</td>
        <td>${productName}</td>
        <td>${numReviews}</td>
        <td>
          <button onclick="viewReviews('${productId}')" class="button button-secondary">Ver Avaliações</button>
        </td>
      `
    })
    log("Tabela de avaliações carregada")
  })
}

function setupProductForm() {
  log("Configurando formulário de produto")
  const form = document.getElementById("form-produto")
  form.addEventListener("submit", async (e) => {
    e.preventDefault()
    log("Formulário de produto submetido")

    const productData = {
      nome: form.nome_produto.value,
      preco: Number(form.preco_produto.value),
      categoria: form.categoria_produto.value,
      estoque: Number(form.estoque_produto.value),
      descricao: form.descricao_produto.value,
      imagem: form.imagem_produto.value,
    }

    const productId = form.produto_id.value

    try {
      if (productId) {
        log("Atualizando produto:", productId, productData)
        await updateProduct(productId, productData)
        alert("Produto atualizado com sucesso!")
      } else {
        log("Adicionando novo produto:", productData)
        await addProduct(productData)
        alert("Produto adicionado com sucesso!")
      }

      form.reset()
      form.produto_id.value = ""
      loadProducts((products) => {
        currentProducts = products
        loadProductsTable()
        loadStockTable()
      })
    } catch (error) {
      log("Erro ao salvar produto:", error)
      alert("Erro ao salvar produto. Por favor, tente novamente.")
    }
  })
}

// Funções Window
window.editProduct = (productId) => {
  log("Editando produto:", productId)
  const product = currentProducts[productId]
  const form = document.getElementById("form-produto")

  form.produto_id.value = productId
  form.nome_produto.value = product.nome
  form.preco_produto.value = product.preco
  form.categoria_produto.value = product.categoria
  form.estoque_produto.value = product.estoque
  form.descricao_produto.value = product.descricao || ""
  form.imagem_produto.value = product.imagem

  form.scrollIntoView({ behavior: "smooth" })
}

window.deleteProductHandler = async (productId) => {
  log("Solicitação para excluir produto:", productId)
  if (confirm("Tem certeza que deseja excluir este produto?")) {
    try {
      await deleteProduct(productId)
      alert("Produto excluído com sucesso!")
      loadProducts((products) => {
        currentProducts = products
        loadProductsTable()
        loadStockTable()
      })
    } catch (error) {
      log("Erro ao excluir produto:", error)
      alert("Erro ao excluir produto. Por favor, tente novamente.")
    }
  }
}

window.updateStockHandler = async (productId, newStock) => {
  log("Atualizando estoque:", productId, newStock)
  if (newStock < 0) return

  try {
    await updateStock(productId, newStock)
    loadProducts((products) => {
      currentProducts = products
      loadProductsTable()
      loadStockTable()
    })
  } catch (error) {
    log("Erro ao atualizar estoque:", error)
    alert("Erro ao atualizar estoque. Por favor, tente novamente.")
  }
}

window.viewReviews = (productId) => {
  log("Visualizando avaliações do produto:", productId)
  const reviewsRef = ref(database, `avaliacoes/${productId}`)
  onValue(reviewsRef, (snapshot) => {
    const reviews = snapshot.val()
    log("Avaliações carregadas:", reviews)
    const modal = document.getElementById("modal-avaliacoes")
    const modalContent = document.getElementById("avaliacoes-content")
    modalContent.innerHTML = ""

    if (reviews) {
      Object.entries(reviews).forEach(([reviewId, review]) => {
        const reviewElement = document.createElement("div")
        reviewElement.className = "avaliacao"
        reviewElement.innerHTML = `
          <p>${"★".repeat(review.estrelas)}${"☆".repeat(5 - review.estrelas)}</p>
          <p>${review.comentario}</p>
          <p><small>Por ${review.usuario} em ${new Date(review.data).toLocaleDateString()}</small></p>
          <button onclick="deleteReview('${productId}', '${reviewId}')" class="button button-danger">Excluir</button>
        `
        modalContent.appendChild(reviewElement)
      })
    } else {
      modalContent.innerHTML = "<p>Nenhuma avaliação encontrada para este produto.</p>"
    }

    modal.style.display = "block"
  })
}

window.deleteReview = async (productId, reviewId) => {
  log("Solicitação para excluir avaliação:", productId, reviewId)
  if (confirm("Tem certeza que deseja excluir esta avaliação?")) {
    try {
      await remove(ref(database, `avaliacoes/${productId}/${reviewId}`))
      log("Avaliação excluída com sucesso")
      alert("Avaliação excluída com sucesso!")
      viewReviews(productId) // Atualiza a lista de avaliações após a exclusão
    } catch (error) {
      log("Erro ao excluir avaliação:", error)
      alert("Erro ao excluir avaliação. Por favor, tente novamente.")
    }
  }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  log("DOM carregado, iniciando aplicação...")
  checkAdminAuth()
  setupProductForm()

  // Logout
  document.getElementById("logout-link").addEventListener("click", (e) => {
    e.preventDefault()
    log("Logout solicitado")
    signOut(auth)
      .then(() => {
        log("Administrador deslogado")
        window.location.href = "login.html"
      })
      .catch((error) => {
        log("Erro ao fazer logout:", error)
      })
  })

  // Modal
  const modal = document.getElementById("modal-avaliacoes")
  const span = document.getElementsByClassName("close")[0]

  span.onclick = () => {
    log("Fechando modal de avaliações")
    modal.style.display = "none"
  }

  window.onclick = (event) => {
    if (event.target === modal) {
      log("Fechando modal de avaliações (clique fora)")
      modal.style.display = "none"
    }
  }
})

log("admin.js carregado")

