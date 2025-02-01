const express = require("express")
const fs = require("fs").promises
const path = require("path")

const app = express()
const PORT = process.env.PORT || 3000
const MEMORIA_DIR = path.join(__dirname, "memoria")
const DADOS_FILE = path.join(MEMORIA_DIR, "dados.json")

app.use(express.json())
app.use(express.static("public"))

// Garantir que a pasta memoria existe
async function ensureMemoriaDir() {
  try {
    await fs.mkdir(MEMORIA_DIR, { recursive: true })
  } catch (error) {
    console.error("Erro ao criar pasta memoria:", error)
  }
}

// Ler dados do arquivo
async function readData() {
  try {
    const data = await fs.readFile(DADOS_FILE, "utf8")
    return JSON.parse(data)
  } catch (error) {
    if (error.code === "ENOENT") {
      return { version: 25, produtos: [], pedidos: [] }
    }
    throw error
  }
}

// Escrever dados no arquivo
async function writeData(data) {
  await fs.writeFile(DADOS_FILE, JSON.stringify(data, null, 2))
}

// Rota para obter dados
app.get("/memoria/dados.json", async (req, res) => {
  try {
    const data = await readData()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: "Erro ao ler dados" })
  }
})

// Rota para salvar dados
app.post("/memoria/dados.json", async (req, res) => {
  try {
    await writeData(req.body)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: "Erro ao salvar dados" })
  }
})

// Rota para sincronização
app.get("/sincronizar", async (req, res) => {
  try {
    const data = await readData()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: "Erro ao sincronizar dados" })
  }
})

// Inicializar servidor
async function startServer() {
  await ensureMemoriaDir()
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
  })
}

startServer()

