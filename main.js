function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`)
}

import { auth, loadProducts } from "./config.js"
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js"

let allProducts = {}
let carrinho = []

function checkAuthState() {
  log("Verificando estado de autenticação")
  onAuthStateChanged(auth, (user) => {
    if (user) {
      log("Usuário está logado:", user.email)
      document.getElementById("login-link").style.display = "none"
      document.getElementById("register-link").style.display = "none"
      document.getElementById("logout-link").style.display = "inline-block"
    } else {
      log("Usuário não está logado")
      document.getElementById("login-link").style.display = "inline-block"
      document.getElementById("register-link").style.display = "inline-block"
      document.getElementById("logout-link").style.display = "none"
    }
  })
}

function displayProducts(products) {
  log("Exibindo produtos")
  allProducts = products
  const productsContainer = document.getElementById("categorias-container")
  productsContainer.innerHTML = ""

  if (!products || Object.keys(products).length === 0) {
    productsContainer.innerHTML = "<p>Nenhum produto disponível no momento.</p>"
    return
  }

  const categoryFilter = document.getElementById("categoria-filter")
  categoryFilter.innerHTML = '<option value="">Todas as categorias</option>'

  const categories = [...new Set(Object.values(products).map((product) => product.categoria))]

  categories.forEach((category) => {
    const option = document.createElement("option")
    option.value = category
    option.textContent = category
    categoryFilter.appendChild(option)

    const categoryElement = document.createElement("div")
    categoryElement.className = "categoria"
    categoryElement.innerHTML = `<h2>${category}</h2>`

    const productsGrid = document.createElement("div")
    productsGrid.className = "produtos-grid"

    Object.entries(products).forEach(([productId, product]) => {
      if (product.categoria === category) {
        const productElement = createProductElement(productId, product)
        productsGrid.appendChild(productElement)
      }
    })

    if (productsGrid.children.length > 0) {
      categoryElement.appendChild(productsGrid)
      productsContainer.appendChild(categoryElement)
    }
  })
}

function createProductElement(productId, product) {
  log("Criando elemento de produto:", productId)
  const productElement = document.createElement("div")
  productElement.className = "produto"
  productElement.innerHTML = `
    <img src="${product.imagem || ""}" alt="${product.nome || "Produto"}">
    <div class="produto-content">
      <h3>${product.nome || "Produto sem nome"}</h3>
      <p class="preco">R$ ${product.preco ? product.preco.toFixed(2) : "0.00"}</p>
      <a href="produto.html?id=${productId}" class="button">Ver Detalhes</a>
      <button onclick="adicionarAoCarrinho('${productId}')" class="button button-primary">Adicionar ao Carrinho</button>
    </div>
  `
  return productElement
}

window.adicionarAoCarrinho = (productId) => {
  log("Adicionando produto ao carrinho:", productId)
  const product = allProducts[productId]
  if (product) {
    const existingItem = carrinho.find((item) => item.id === productId)
    if (existingItem) {
      existingItem.quantidade += 1
    } else {
      carrinho.push({ ...product, id: productId, quantidade: 1 })
    }
    atualizarCarrinho()
    alert("Produto adicionado ao carrinho!")
  } else {
    log("Produto não encontrado:", productId)
    console.error("Produto não encontrado:", productId)
  }
}

function atualizarCarrinho() {
  log("Atualizando carrinho")
  const carrinhoItens = document.getElementById("carrinho-itens")
  const carrinhoTotal = document.getElementById("carrinho-total")
  carrinhoItens.innerHTML = ""
  let total = 0

  carrinho.forEach((item, index) => {
    const li = document.createElement("li")
    li.innerHTML = `
      ${item.nome} - R$ ${item.preco.toFixed(2)} x ${item.quantidade}
      <button onclick="removerDoCarrinho(${index})">Remover</button>
    `
    carrinhoItens.appendChild(li)
    total += item.preco * item.quantidade
  })

  carrinhoTotal.textContent = `Total: R$ ${total.toFixed(2)}`
  localStorage.setItem("carrinho", JSON.stringify(carrinho))
}

window.removerDoCarrinho = (index) => {
  log("Removendo produto do carrinho:", index)
  carrinho.splice(index, 1)
  atualizarCarrinho()
}

function setupFilters() {
  log("Configurando filtros")
  const categoriaFilter = document.getElementById("categoria-filter")
  const precoMin = document.getElementById("preco-min")
  const precoMax = document.getElementById("preco-max")
  const busca = document.getElementById("busca")
  ;[categoriaFilter, precoMin, precoMax, busca].forEach((element) => {
    element.addEventListener("change", aplicarFiltros)
  })

  busca.addEventListener("keyup", aplicarFiltros)
}

function aplicarFiltros() {
  log("Aplicando filtros")
  const categoria = document.getElementById("categoria-filter").value
  const precoMin = Number.parseFloat(document.getElementById("preco-min").value) || 0
  const precoMax = Number.parseFloat(document.getElementById("preco-max").value) || Number.POSITIVE_INFINITY
  const busca = document.getElementById("busca").value.toLowerCase()

  const produtosContainer = document.getElementById("categorias-container")
  produtosContainer.innerHTML = ""

  const filteredProducts = Object.entries(allProducts).filter(([id, product]) => {
    return (
      (!categoria || product.categoria === categoria) &&
      product.preco >= precoMin &&
      product.preco <= precoMax &&
      (product.nome.toLowerCase().includes(busca) || product.descricao.toLowerCase().includes(busca))
    )
  })

  if (filteredProducts.length === 0) {
    produtosContainer.innerHTML = "<p>Nenhum produto encontrado com os filtros aplicados.</p>"
    return
  }

  const categories = [...new Set(filteredProducts.map(([id, product]) => product.categoria))]

  categories.forEach((category) => {
    const categoryElement = document.createElement("div")
    categoryElement.className = "categoria"
    categoryElement.innerHTML = `<h2>${category}</h2>`

    const productsGrid = document.createElement("div")
    productsGrid.className = "produtos-grid"

    filteredProducts.forEach(([id, product]) => {
      if (product.categoria === category) {
        const productElement = createProductElement(id, product)
        productsGrid.appendChild(productElement)
      }
    })

    if (productsGrid.children.length > 0) {
      categoryElement.appendChild(productsGrid)
      produtosContainer.appendChild(categoryElement)
    }
  })
}

document.addEventListener("DOMContentLoaded", () => {
  log("DOM carregado, iniciando aplicação...")
  checkAuthState()
  loadProducts(displayProducts)
  setupFilters()

  // Carregar carrinho do localStorage
  const savedCarrinho = localStorage.getItem("carrinho")
  if (savedCarrinho) {
    carrinho = JSON.parse(savedCarrinho)
    atualizarCarrinho()
  }

  document.getElementById("logout-link").addEventListener("click", (e) => {
    e.preventDefault()
    log("Usuário clicou em logout")
    signOut(auth)
      .then(() => {
        log("Usuário deslogado")
        window.location.href = "index.html"
      })
      .catch((error) => {
        log("Erro ao fazer logout:", error)
        console.error("Erro ao fazer logout:", error)
      })
  })

  document.getElementById("carrinho-toggle").addEventListener("click", (e) => {
    e.preventDefault()
    log("Usuário clicou no carrinho")
    const carrinhoElement = document.getElementById("carrinho")
    carrinhoElement.classList.toggle("show")
  })

  document.getElementById("finalizar-compra").addEventListener("click", () => {
    log("Usuário clicou em finalizar compra")
    if (carrinho.length === 0) {
      alert("Seu carrinho está vazio!")
    } else {
      window.location.href = "finalizar-compra.html"
    }
  })
})

