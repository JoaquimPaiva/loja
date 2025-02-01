import { adicionarPedido, diminuirEstoque } from "./config.js"

const resumoCarrinho = document.getElementById("resumo-carrinho")
const formFinalizarCompra = document.getElementById("form-finalizar-compra")

document.addEventListener("DOMContentLoaded", () => {
  const carrinho = JSON.parse(localStorage.getItem("carrinho") || "[]")
  exibirResumoCarrinho(carrinho)

  formFinalizarCompra.addEventListener("submit", finalizarCompra)
})

function exibirResumoCarrinho(carrinho) {
  if (carrinho.length === 0) {
    resumoCarrinho.innerHTML = "<p>Seu carrinho está vazio.</p>"
    return
  }

  let html = "<h2>Resumo do Pedido</h2><ul>"
  let total = 0

  carrinho.forEach((item) => {
    html += `<li>${item.nome} - R$ ${item.preco.toFixed(2)} x ${item.quantidade}</li>`
    total += item.preco * item.quantidade
  })

  html += `</ul><p><strong>Total: R$ ${total.toFixed(2)}</strong></p>`
  resumoCarrinho.innerHTML = html
}

async function finalizarCompra(event) {
  event.preventDefault()

  const carrinho = JSON.parse(localStorage.getItem("carrinho") || "[]")
  if (carrinho.length === 0) {
    alert("Seu carrinho está vazio!")
    return
  }

  const nome = document.getElementById("nome").value
  const email = document.getElementById("email").value
  const telefone = document.getElementById("telefone").value
  const endereco = document.getElementById("endereco").value

  const pedido = {
    codigo: gerarCodigoPedido(),
    nome: nome,
    email: email,
    telefone: telefone,
    endereco: endereco,
    itens: carrinho,
    total: carrinho.reduce((total, item) => total + item.preco * item.quantidade, 0),
    data: new Date().toISOString(),
    status: "Pendente",
  }

  try {
    // Verificar e atualizar o estoque
    for (const item of carrinho) {
      const sucesso = await diminuirEstoque(item.id, item.quantidade)
      if (!sucesso) {
        alert(`Desculpe, não há estoque suficiente para ${item.nome}. Por favor, atualize seu carrinho.`)
        return
      }
    }

    await adicionarPedido(pedido)
    alert(`Pedido finalizado com sucesso! Seu código de pedido é: ${pedido.codigo}`)
    localStorage.removeItem("carrinho")
    window.location.href = "index.html"
  } catch (error) {
    console.error("Erro ao finalizar pedido:", error)
    alert("Ocorreu um erro ao finalizar o pedido. Por favor, tente novamente.")
  }
}

function gerarCodigoPedido() {
  return "PED-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase()
}

// Adicione logs para depuração
console.log("finalizar-compra.js carregado")

