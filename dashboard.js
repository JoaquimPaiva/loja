import { auth, database, ref, remove, loadProducts, loadOrders, updateOrderStatus } from "./config.js"
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js"

let currentProducts = {}
let currentOrders = {}

function checkAdminAuth() {
  console.log("Verificando autenticação do administrador")
  onAuthStateChanged(auth, (user) => {
    if (user && user.email === "adalberto.j.s.p@gmail.com") {
      console.log("Administrador autenticado:", user.email)
      initializeDashboard()
    } else {
      console.log("Usuário não autorizado")
      window.location.href = "login.html"
    }
  })
}

function initializeDashboard() {
  console.log("Inicializando dashboard")
  loadProducts((products) => {
    console.log("Produtos carregados:", products)
    currentProducts = products
    updateProductStats()
  })

  loadOrders((orders) => {
    console.log("Pedidos carregados:", orders)
    currentOrders = orders
    updateOrderStats()
    updateRecentOrders()
    updateSalesChart()
    updateBestSellingProducts()
  })
}

function updateProductStats() {
  console.log("Atualizando estatísticas de produtos")
  const totalProducts = Object.keys(currentProducts).length
  const totalValue = Object.values(currentProducts).reduce(
    (sum, product) => sum + (product.preco || 0) * (product.estoque || 0),
    0,
  )

  document.getElementById("total-produtos").textContent = totalProducts
  document.getElementById("valor-total-produtos").textContent = `R$ ${totalValue.toFixed(2)}`
  console.log("Estatísticas de produtos atualizadas")
}

function updateOrderStats() {
  console.log("Atualizando estatísticas de pedidos")
  const totalOrders = Object.keys(currentOrders).length
  const totalRevenue = Object.values(currentOrders).reduce((sum, order) => sum + (order.total || 0), 0)

  document.getElementById("total-pedidos").textContent = totalOrders
  document.getElementById("valor-total-vendas").textContent = `R$ ${totalRevenue.toFixed(2)}`
  console.log("Estatísticas de pedidos atualizadas")
}

function updateBestSellingProducts() {
  console.log("Atualizando produtos mais vendidos...")
  const tableBody = document.querySelector("#tabela-mais-vendidos tbody")
  tableBody.innerHTML = ""

  const productSales = new Map()

  Object.values(currentOrders).forEach((order) => {
    order.itens.forEach((item) => {
      if (!productSales.has(item.nome)) {
        productSales.set(item.nome, {
          quantidade: 0,
          valorTotal: 0,
        })
      }
      const current = productSales.get(item.nome)
      current.quantidade += item.quantidade
      current.valorTotal += item.preco * item.quantidade
    })
  })

  const sortedProducts = Array.from(productSales.entries())
    .sort((a, b) => b[1].valorTotal - a[1].valorTotal)
    .slice(0, 5)

  sortedProducts.forEach(([productName, data]) => {
    const row = tableBody.insertRow()
    row.innerHTML = `
            <td>${productName}</td>
            <td>${data.quantidade}</td>
            <td>R$ ${data.valorTotal.toFixed(2)}</td>
        `
  })

  if (sortedProducts.length === 0) {
    tableBody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center">Nenhum produto vendido ainda</td>
            </tr>
        `
  }

  console.log("Tabela de produtos mais vendidos atualizada")
}

function updateRecentOrders() {
  console.log("Atualizando pedidos recentes...")
  const tableBody = document.querySelector("#tabela-pedidos-recentes tbody")
  tableBody.innerHTML = ""

  if (Object.keys(currentOrders).length === 0) {
    console.log("Nenhum pedido registrado")
    tableBody.innerHTML = "<tr><td colspan='7'>Nenhum pedido registrado.</td></tr>"
    return
  }

  const recentOrders = Object.entries(currentOrders)
    .sort((a, b) => new Date(b[1].data) - new Date(a[1].data))
    .slice(0, 10)

  recentOrders.forEach(([orderId, order]) => {
    const row = tableBody.insertRow()
    row.innerHTML = `
            <td>${orderId}</td>
            <td>${order.nome || "N/A"}</td>
            <td>R$ ${(order.total || 0).toFixed(2)}</td>
            <td>${new Date(order.data).toLocaleDateString()}</td>
            <td>
                <select class="status-select" data-order-id="${orderId}">
                    <option value="Pendente" ${order.status === "Pendente" ? "selected" : ""}>Pendente</option>
                    <option value="Em Processamento" ${order.status === "Em Processamento" ? "selected" : ""}>Em Processamento</option>
                    <option value="Enviado" ${order.status === "Enviado" ? "selected" : ""}>Enviado</option>
                    <option value="Entregue" ${order.status === "Entregue" ? "selected" : ""}>Entregue</option>
                    <option value="Cancelado" ${order.status === "Cancelado" ? "selected" : ""}>Cancelado</option>
                </select>
            </td>
            <td>
                <button class="view-details-btn" data-order-id="${orderId}">Ver Detalhes</button>
            </td>
            <td>
                <button class="delete-order-btn" data-order-id="${orderId}">Excluir</button>
            </td>
        `
  })

  setupStatusChangeListeners()
  setupViewDetailsListeners()
  setupDeleteOrderListeners()
  console.log("Pedidos recentes atualizados")
}

function updateSalesChart() {
  console.log("Atualizando gráfico de vendas...")
  const salesByDate = {}

  Object.values(currentOrders).forEach((order) => {
    const date = new Date(order.data).toLocaleDateString()
    if (!salesByDate[date]) {
      salesByDate[date] = 0
    }
    salesByDate[date] += order.total || 0
  })

  const chartContainer = document.getElementById("grafico-vendas")
  chartContainer.innerHTML = ""

  const maxValue = Math.max(...Object.values(salesByDate))

  Object.entries(salesByDate).forEach(([date, value]) => {
    const barHeight = (value / maxValue) * 100
    const bar = document.createElement("div")
    bar.className = "bar"
    bar.style.height = `${barHeight}%`
    bar.innerHTML = `
            <div class="bar-label">${date}</div>
            <div class="bar-value">R$ ${value.toFixed(2)}</div>
        `
    chartContainer.appendChild(bar)
  })

  console.log("Gráfico de vendas atualizado")
}

function setupStatusChangeListeners() {
  const statusSelects = document.querySelectorAll(".status-select")
  statusSelects.forEach((select) => {
    select.addEventListener("change", async (event) => {
      const orderId = event.target.getAttribute("data-order-id")
      const newStatus = event.target.value
      console.log(`Atualizando status do pedido ${orderId} para ${newStatus}`)
      try {
        await updateOrderStatus(orderId, newStatus)
        currentOrders[orderId].status = newStatus
        console.log(`Status do pedido ${orderId} atualizado com sucesso`)
      } catch (error) {
        console.log(`Erro ao atualizar status do pedido ${orderId}:`, error)
        alert(`Erro ao atualizar status do pedido. Por favor, tente novamente.`)
      }
    })
  })
}

function setupViewDetailsListeners() {
  const viewDetailsBtns = document.querySelectorAll(".view-details-btn")
  viewDetailsBtns.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      const orderId = event.target.getAttribute("data-order-id")
      showOrderDetails(orderId)
    })
  })
}

function setupDeleteOrderListeners() {
  const deleteButtons = document.querySelectorAll(".delete-order-btn")
  deleteButtons.forEach((btn) => {
    btn.addEventListener("click", async (event) => {
      const orderId = event.target.getAttribute("data-order-id")
      if (confirm(`Tem certeza que deseja excluir o pedido ${orderId}?`)) {
        console.log(`Excluindo pedido: ${orderId}`)
        try {
          await remove(ref(database, `pedidos/${orderId}`))
          delete currentOrders[orderId]
          updateOrderStats()
          updateRecentOrders()
          updateSalesChart()
          updateBestSellingProducts()
          alert("Pedido excluído com sucesso!")
        } catch (error) {
          console.log(`Erro ao excluir pedido ${orderId}:`, error)
          alert("Erro ao excluir pedido. Por favor, tente novamente.")
        }
      }
    })
  })
}

function showOrderDetails(orderId) {
  const order = currentOrders[orderId]
  if (!order) {
    console.log(`Pedido ${orderId} não encontrado`)
    return
  }

  const modal = document.getElementById("order-details-modal")
  const modalContent = document.getElementById("order-details-content")

  modalContent.innerHTML = `
        <h2>Detalhes do Pedido ${orderId}</h2>
        <p><strong>Cliente:</strong> ${order.nome}</p>
        <p><strong>Email:</strong> ${order.email}</p>
        <p><strong>Telefone:</strong> ${order.telefone}</p>
        <p><strong>Endereço:</strong> ${order.endereco}</p>
        <p><strong>Data:</strong> ${new Date(order.data).toLocaleString()}</p>
        <p><strong>Status:</strong> ${order.status}</p>
        <p><strong>Total:</strong> R$ ${order.total.toFixed(2)}</p>
        <h3>Itens do Pedido:</h3>
        <ul>
            ${order.itens
              .map(
                (item) => `
                <li>${item.nome} - Quantidade: ${item.quantidade} - R$ ${(item.preco * item.quantidade).toFixed(2)}</li>
            `,
              )
              .join("")}
        </ul>
    `

  modal.style.display = "block"
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM carregado, iniciando aplicação...")
  checkAdminAuth()

  document.getElementById("logout-link").addEventListener("click", (e) => {
    e.preventDefault()
    console.log("Logout solicitado")
    signOut(auth)
      .then(() => {
        console.log("Administrador deslogado")
        window.location.href = "login.html"
      })
      .catch((error) => {
        console.log("Erro ao fazer logout:", error)
      })
  })

  window.onclick = (event) => {
    const modal = document.getElementById("order-details-modal")
    if (event.target == modal) {
      modal.style.display = "none"
    }
  }

  document.querySelector(".close").onclick = () => {
    document.getElementById("order-details-modal").style.display = "none"
  }
})

console.log("dashboard.js carregado")

