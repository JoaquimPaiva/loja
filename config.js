import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js"
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js"
import {
  getDatabase,
  ref,
  onValue,
  push,
  set,
  remove,
  update,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js"

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`)
}

log("Iniciando configuração do Firebase")

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

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const database = getDatabase(app)

log("Firebase initialized")
log("Firebase app initialized:", app.name)
log("Firebase auth initialized:", auth)
log("Firebase database initialized:", database)

export { auth, database, ref, onValue, push, set, remove, update }

// Função para carregar produtos
export function loadProducts(callback) {
  log("Carregando produtos...")
  const productsRef = ref(database, "produtos")
  onValue(
    productsRef,
    (snapshot) => {
      const data = snapshot.val()
      if (data) {
        log("Produtos carregados com sucesso:", data)
        callback(data)
      } else {
        log("Nenhum produto disponível")
        callback({})
      }
    },
    (error) => {
      log("Erro ao carregar produtos:", error)
      callback({})
    },
  )
}

// Função para adicionar produto
export async function addProduct(product) {
  log("Adicionando produto:", product)
  try {
    const newProductRef = push(ref(database, "produtos"))
    await set(newProductRef, {
      nome: product.nome,
      preco: Number(product.preco),
      descricao: product.descricao,
      imagem: product.imagem,
      estoque: Number(product.estoque),
      categoria: product.categoria,
    })
    log("Produto adicionado com sucesso")
    return true
  } catch (error) {
    log("Erro ao adicionar produto:", error)
    return false
  }
}

// Função para atualizar produto
export async function updateProduct(productId, product) {
  log("Atualizando produto:", productId, product)
  try {
    await update(ref(database, `produtos/${productId}`), {
      nome: product.nome,
      preco: Number(product.preco),
      descricao: product.descricao,
      imagem: product.imagem,
      estoque: Number(product.estoque),
      categoria: product.categoria,
    })
    log("Produto atualizado com sucesso")
    return true
  } catch (error) {
    log("Erro ao atualizar produto:", error)
    return false
  }
}

// Função para excluir produto
export async function deleteProduct(productId) {
  log("Excluindo produto:", productId)
  try {
    await remove(ref(database, `produtos/${productId}`))
    log("Produto excluído com sucesso")
    return true
  } catch (error) {
    log("Erro ao excluir produto:", error)
    return false
  }
}

// Função para atualizar estoque
export async function updateStock(productId, newStock) {
  log("Atualizando estoque:", productId, newStock)
  try {
    await update(ref(database, `produtos/${productId}`), {
      estoque: Number(newStock),
    })
    log("Estoque atualizado com sucesso")
    return true
  } catch (error) {
    log("Erro ao atualizar estoque:", error)
    return false
  }
}

// Função para carregar pedidos
export function loadOrders(callback) {
  log("Carregando pedidos...")
  const ordersRef = ref(database, "pedidos")
  onValue(
    ordersRef,
    (snapshot) => {
      const data = snapshot.val()
      if (data) {
        log("Pedidos carregados com sucesso:", data)
        callback(data)
      } else {
        log("Nenhum pedido disponível")
        callback({})
      }
    },
    (error) => {
      log("Erro ao carregar pedidos:", error)
      callback({})
    },
  )
}

// Função para atualizar o status do pedido
export async function updateOrderStatus(orderId, newStatus) {
  log(`Atualizando status do pedido ${orderId} para ${newStatus}`)
  try {
    await update(ref(database, `pedidos/${orderId}`), {
      status: newStatus,
    })
    log(`Status do pedido ${orderId} atualizado com sucesso`)
    return true
  } catch (error) {
    log(`Erro ao atualizar status do pedido ${orderId}:`, error)
    return false
  }
}

// Função para adicionar avaliação
export async function adicionarAvaliacao(productId, avaliacao) {
  log(`Adicionando avaliação para o produto ${productId}:`, avaliacao)
  try {
    const newReviewRef = push(ref(database, `avaliacoes/${productId}`))
    await set(newReviewRef, {
      ...avaliacao,
      data: new Date().toISOString(),
    })
    log("Avaliação adicionada com sucesso")
    return true
  } catch (error) {
    log("Erro ao adicionar avaliação:", error)
    return false
  }
}

