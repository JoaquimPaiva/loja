function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`)
}

import { getProduto, listenToAvaliacoes, adicionarAvaliacao } from "./config.js"

const produtoContent = document.getElementById("produto-content")
const carrinhoItens = document.getElementById("carrinho-itens")
const carrinhoTotal = document.getElementById("carrinho-total")
const carrinho = JSON.parse(localStorage.getItem("carrinho")) || []
let produtoAtual = null

document.addEventListener("DOMContentLoaded", () => {
  log("DOM carregado na página de produto")
  const urlParams = new URLSearchParams(window.location.search)
  const produtoId = urlParams.get("id")

  if (produtoId) {
    carregarProduto(produtoId)
  } else {
    produtoContent.innerHTML = "<p>Produto não encontrado.</p>"
  }

  document.getElementById("carrinho-toggle").addEventListener("click", toggleCarrinho)
  document.getElementById("finalizar-compra").addEventListener("click", finalizarCompra)

  const formAvaliacao = document.getElementById("form-avaliacao")
  formAvaliacao.addEventListener("submit", enviarAvaliacao)

  atualizarCarrinho()
})

async function carregarProduto(id) {
  log(`Carregando produto com ID: ${id}`)
  try {
    const produto = await getProduto(id)
    if (produto) {
      produtoAtual = { id, ...produto }
      renderizarProduto(produtoAtual)
      listenToAvaliacoes(id, renderizarAvaliacoes)
    } else {
      produtoContent.innerHTML = "<p>Produto não encontrado.</p>"
    }
  } catch (error) {
    log("Erro ao carregar o produto:", error)
    produtoContent.innerHTML = "<p>Erro ao carregar o produto. Por favor, tente novamente.</p>"
  }
}

function renderizarProduto(produto) {
  log(`Renderizando produto: ${produto.nome}`)
  produtoContent.innerHTML = `
    <div class="produto-detalhes-grid">
      <div class="produto-imagem">
        <img src="${produto.imagem}" alt="${produto.nome}">
      </div>
      <div class="produto-info">
        <h1>${produto.nome}</h1>
        <p class="produto-preco">R$ ${produto.preco.toFixed(2)}</p>
        <p class="produto-descricao">${produto.descricao || "Descrição não disponível."}</p>
        <p class="produto-estoque">Estoque disponível: ${produto.estoque}</p>
        <div class="quantidade-selector">
          <label for="quantidade">Quantidade:</label>
          <select id="quantidade" name="quantidade">
            ${gerarOpcoesQuantidade(produto.estoque)}
          </select>
        </div>
        <button id="adicionar-ao-carrinho" class="button button-primary">Adicionar ao Carrinho</button>
      </div>
    </div>
    <div class="produto-avaliacoes">
      <h2>Avaliações</h2>
      <div id="avaliacoes-lista"></div>
    </div>
  `

  document.getElementById("adicionar-ao-carrinho").addEventListener("click", () => adicionarAoCarrinho(produto.id))
}

function gerarOpcoesQuantidade(estoque) {
  log(`Gerando opções de quantidade para estoque: ${estoque}`)
  let opcoes = ""
  for (let i = 1; i <= Math.min(estoque, 10); i++) {
    opcoes += `<option value="${i}">${i}</option>`
  }
  return opcoes
}

function renderizarAvaliacoes(avaliacoes) {
  log(`Renderizando avaliações`)
  const avaliacoesLista = document.getElementById("avaliacoes-lista")
  avaliacoesLista.innerHTML = ""

  if (!avaliacoes || Object.keys(avaliacoes).length === 0) {
    avaliacoesLista.innerHTML = "<p>Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>"
    return
  }

  Object.values(avaliacoes).forEach((avaliacao) => {
    const avaliacaoElement = document.createElement("div")
    avaliacaoElement.classList.add("avaliacao")
    avaliacaoElement.innerHTML = `
      <p>${"★".repeat(avaliacao.estrelas)}${"☆".repeat(5 - avaliacao.estrelas)}</p>
      <p>${avaliacao.comentario}</p>
      <p><small>Por ${avaliacao.usuario} em ${new Date(avaliacao.data).toLocaleDateString()}</small></p>
    `
    avaliacoesLista.appendChild(avaliacaoElement)
  })
}

async function enviarAvaliacao(e) {
  log("Enviando avaliação")
  e.preventDefault()
  const estrelas = document.getElementById("estrelas").value
  const comentario = document.getElementById("comentario").value
  const usuario = document.getElementById("usuario").value

  try {
    await adicionarAvaliacao(produtoAtual.id, { estrelas, comentario, usuario })
    log("Avaliação enviada com sucesso!")
    alert("Avaliação enviada com sucesso!")
    document.getElementById("form-avaliacao").reset()
    listenToAvaliacoes(produtoAtual.id, renderizarAvaliacoes)
  } catch (error) {
    log("Erro ao adicionar avaliação:", error)
    alert("Ocorreu um erro ao enviar a avaliação. Por favor, tente novamente.")
  }
}

function adicionarAoCarrinho(produtoId) {
  log(`Adicionando produto ao carrinho: ${produtoId}`)
  const quantidade = Number.parseInt(document.getElementById("quantidade").value)
  if (produtoAtual && produtoAtual.id === produtoId) {
    if (produtoAtual.estoque >= quantidade) {
      const item = carrinho.find((i) => i.id === produtoId)
      if (item) {
        if (item.quantidade + quantidade <= produtoAtual.estoque) {
          item.quantidade += quantidade
        } else {
          alert("Quantidade máxima disponível em estoque atingida.")
          return
        }
      } else {
        carrinho.push({ ...produtoAtual, quantidade: quantidade })
      }
      produtoAtual.estoque -= quantidade
      localStorage.setItem("carrinho", JSON.stringify(carrinho))
      atualizarCarrinho()
      renderizarProduto(produtoAtual)
      alert(`${quantidade} unidade(s) do produto adicionada(s) ao carrinho!`)
    } else {
      alert("Desculpe, não há estoque suficiente para a quantidade selecionada.")
    }
  }
}

function toggleCarrinho() {
  log("Alternando carrinho")
  const carrinho = document.getElementById("carrinho")
  carrinho.classList.toggle("show")
}

function atualizarCarrinho() {
  log("Atualizando carrinho")
  carrinhoItens.innerHTML = ""
  let total = 0

  carrinho.forEach((item, index) => {
    const itemElement = document.createElement("li")
    itemElement.innerHTML = `
      ${item.nome} - R$ ${item.preco.toFixed(2)} x ${item.quantidade}
      <button onclick="removerDoCarrinho(${index})">Remover</button>
    `
    carrinhoItens.appendChild(itemElement)
    total += item.preco * item.quantidade
  })

  carrinhoTotal.textContent = `Total: R$ ${total.toFixed(2)}`
}

window.removerDoCarrinho = (index) => {
  log(`Removendo item do carrinho: ${index}`)
  const item = carrinho[index]
  if (item) {
    produtoAtual.estoque += item.quantidade
    carrinho.splice(index, 1)
    localStorage.setItem("carrinho", JSON.stringify(carrinho))
    atualizarCarrinho()
    renderizarProduto(produtoAtual)
  }
}

function finalizarCompra() {
  log("Finalizando compra")
  if (carrinho.length === 0) {
    alert("Seu carrinho está vazio!")
    return
  }
  window.location.href = "finalizar-compra.html"
}

log("produto.js carregado")

