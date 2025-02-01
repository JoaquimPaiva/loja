import { listenToProdutos, listenToAvaliacoes, excluirAvaliacao } from "./config.js"

let produtos = {}
const avaliacoesPorProduto = {}

document.addEventListener("DOMContentLoaded", () => {
  const tabelaProdutosAvaliacoes = document
    .getElementById("tabela-produtos-avaliacoes")
    .getElementsByTagName("tbody")[0]
  const avaliacoesProduto = document.getElementById("avaliacoes-produto")
  const listaAvaliacoes = document.getElementById("lista-avaliacoes")
  const nomeProdutoAvaliacoes = document.getElementById("nome-produto-avaliacoes")

  function carregarProdutosComAvaliacoes() {
    listenToProdutos((novosProdutos) => {
      produtos = novosProdutos
      renderizarTabelaProdutosAvaliacoes()
    })
  }

  function renderizarTabelaProdutosAvaliacoes() {
    tabelaProdutosAvaliacoes.innerHTML = ""
    Object.entries(produtos).forEach(([id, produto]) => {
      const row = tabelaProdutosAvaliacoes.insertRow()
      row.innerHTML = `
                <td>${id}</td>
                <td>${produto.nome}</td>
                <td id="num-avaliacoes-${id}">Carregando...</td>
                <td>
                    <button onclick="verAvaliacoes('${id}')" class="button button-secondary">Ver Avaliações</button>
                </td>
            `
      carregarNumeroAvaliacoes(id)
    })
  }

  function carregarNumeroAvaliacoes(produtoId) {
    listenToAvaliacoes(produtoId, (avaliacoes) => {
      avaliacoesPorProduto[produtoId] = avaliacoes || {}
      const numAvaliacoes = Object.keys(avaliacoes || {}).length
      document.getElementById(`num-avaliacoes-${produtoId}`).textContent = numAvaliacoes
    })
  }

  window.verAvaliacoes = (produtoId) => {
    const produto = produtos[produtoId]
    nomeProdutoAvaliacoes.textContent = produto.nome
    renderizarAvaliacoes(produtoId)
    avaliacoesProduto.style.display = "block"
  }

  function renderizarAvaliacoes(produtoId) {
    const avaliacoes = avaliacoesPorProduto[produtoId] || {}
    listaAvaliacoes.innerHTML = ""
    Object.entries(avaliacoes).forEach(([avaliacaoId, avaliacao]) => {
      const avaliacaoElement = document.createElement("div")
      avaliacaoElement.classList.add("avaliacao")
      avaliacaoElement.innerHTML = `
                <p>${"★".repeat(avaliacao.estrelas)}${"☆".repeat(5 - avaliacao.estrelas)}</p>
                <p>${avaliacao.comentario}</p>
                <p><small>Por ${avaliacao.usuario} em ${new Date(avaliacao.data).toLocaleDateString()}</small></p>
                <button onclick="excluirAvaliacaoHandler('${produtoId}', '${avaliacaoId}')" class="button button-danger">Excluir</button>
            `
      listaAvaliacoes.appendChild(avaliacaoElement)
    })
  }

  window.excluirAvaliacaoHandler = async (produtoId, avaliacaoId) => {
    if (confirm("Tem certeza que deseja excluir esta avaliação?")) {
      try {
        await excluirAvaliacao(produtoId, avaliacaoId)
        alert("Avaliação excluída com sucesso!")
        renderizarAvaliacoes(produtoId)
      } catch (error) {
        console.error("Erro ao excluir avaliação:", error)
        alert("Ocorreu um erro ao excluir a avaliação. Por favor, tente novamente.")
      }
    }
  }

  carregarProdutosComAvaliacoes()
})

console.log("admin-avaliacoes.js carregado")

