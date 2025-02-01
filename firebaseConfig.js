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

export { auth, database, ref, onValue, push, set, remove, update }

// Função para carregar produtos
export function loadProducts(callback) {
  const productsRef = ref(database, "produtos")
  onValue(
    productsRef,
    (snapshot) => {
      const data = snapshot.val()
      if (data) {
        callback(data)
      } else {
        console.warn("Nenhum produto disponível")
        callback({})
      }
    },
    (error) => {
      console.error("Erro ao carregar produtos:", error)
      callback({})
    },
  )
}

// Função para adicionar produto
export async function addProduct(product) {
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
    return true
  } catch (error) {
    console.error("Erro ao adicionar produto:", error)
    return false
  }
}

// Função para atualizar produto
export async function updateProduct(productId, product) {
  try {
    await update(ref(database, `produtos/${productId}`), {
      nome: product.nome,
      preco: Number(product.preco),
      descricao: product.descricao,
      imagem: product.imagem,
      estoque: Number(product.estoque),
      categoria: product.categoria,
    })
    return true
  } catch (error) {
    console.error("Erro ao atualizar produto:", error)
    return false
  }
}

// Função para excluir produto
export async function deleteProduct(productId) {
  try {
    await remove(ref(database, `produtos/${productId}`))
    return true
  } catch (error) {
    console.error("Erro ao excluir produto:", error)
    return false
  }
}

// Função para atualizar estoque
export async function updateStock(productId, newStock) {
  try {
    await update(ref(database, `produtos/${productId}`), {
      estoque: Number(newStock),
    })
    return true
  } catch (error) {
    console.error("Erro ao atualizar estoque:", error)
    return false
  }
}

// Função para carregar pedidos
export function loadOrders(callback) {
  const ordersRef = ref(database, "pedidos")
  onValue(
    ordersRef,
    (snapshot) => {
      const data = snapshot.val()
      if (data) {
        callback(data)
      } else {
        console.warn("Nenhum pedido disponível")
        callback({})
      }
    },
    (error) => {
      console.error("Erro ao carregar pedidos:", error)
      callback({})
    },
  )
}

