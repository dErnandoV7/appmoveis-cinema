// Storage
const STORAGE_KEY = "cinemaFilmes"

const getFilmes = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
const saveFilmes = (filmes) => localStorage.setItem(STORAGE_KEY, JSON.stringify(filmes))

// Dom 
const addFilmeBtn = document.querySelector("#add-movie")
const modalOverlay = document.querySelector("#modal-add-filme-overlay")
const modalCloseBtn = document.querySelector("#modal-close-btn")
const modalTitulo = document.querySelector("#modal-titulo")
const form = document.querySelector("#form-add-filme")
const moviesList = document.querySelector("#movies-list")
const qntEl = document.querySelector("#qnt-registrados strong")

const inputNome = document.querySelector("#nome")
const inputGenero = document.querySelector("#genero")
const inputStatus = document.querySelector("#status")
const inputUrlImg = document.querySelector("#url-img")
const previewImg = document.querySelector("#preview-img")
const estrelas = document.querySelectorAll(".avaliacao-inputs i")

// State 
let editingId = null
let avaliacao = 0
let filtroAtivo = "todos"
let buscaAtual = ""

// Preview
const setPreview = (src) => {
    previewImg.src = src || ""
    previewImg.style.display = src ? "block" : "none"
}

inputUrlImg.addEventListener("input", () => setPreview(inputUrlImg.value.trim()))

// Modal
const abrirModal = (modo = "criar", filme = null) => {
    editingId = filme?.id ?? null
    modalTitulo.textContent = modo === "editar" ? "Editar Filme" : "Adicionar Filme"

    if (filme) {
        inputNome.value = filme.nome
        inputGenero.value = filme.genero
        inputStatus.value = filme.status
        inputUrlImg.value = filme.imagem || ""
        avaliacao = filme.avaliacao
        setPreview(filme.imagem || "")
    } else {
        form.reset()
        avaliacao = 0
        setPreview("")
    }

    renderEstrelas()
    modalOverlay.className = "modal-open"
    document.body.style.overflow = "hidden"
}

const fecharModal = () => {
    modalOverlay.className = "modal-close"
    document.body.style.overflow = ""
    editingId = null
    avaliacao = 0
    setPreview("")
}

// Stars 
const renderEstrelas = (hover = -1) => {
    const limite = hover >= 0 ? hover : avaliacao - 1
    estrelas.forEach((star, i) => {
        star.style.color = i <= limite ? "var(--accent)" : "var(--ink)"
    })
}

estrelas.forEach((star, i) => {
    star.addEventListener("mouseenter", () => renderEstrelas(i))
    star.addEventListener("mouseleave", () => renderEstrelas())
    star.addEventListener("click", () => { avaliacao = i + 1; renderEstrelas() })
})

// Render
const STATUS_LABEL = {
    assistido: "Assistido",
    assistindo: "Assistindo",
    "quero-ver": "Quero ver"
}

const starsHtml = (n) =>
    Array.from({ length: 5 }, (_, i) =>
        `<i class="fa-solid fa-star" style="color:${i < n ? "var(--accent)" : "var(--ink)"}"></i>`
    ).join("")

const createCard = (filme) => {
    const card = document.createElement("div")
    card.className = "movie-card"
    card.dataset.id = filme.id

    card.innerHTML = `
        <div class="movie-img">
            <span class="movie-status">${STATUS_LABEL[filme.status] || filme.status}</span>
            <div class="card-actions">
                <button class="btn-editar" type="button"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-deletar" type="button"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
        <div class="movie-info">
            <p class="movie-title">${filme.nome}</p>
            <div class="genre-and-available">
                <span class="genre">${filme.genero}</span>
                <div class="available">${starsHtml(filme.avaliacao)}</div>
            </div>
        </div>
    `

    if (filme.imagem) {
        card.querySelector(".movie-img").style.backgroundImage = `url('${filme.imagem}')`
    }

    card.querySelector(".btn-editar").addEventListener("click", () => abrirModal("editar", filme))
    card.querySelector(".btn-deletar").addEventListener("click", () => deletarFilme(filme.id))

    return card
}

const renderFilmes = () => {
    const todos = getFilmes()
    const busca = buscaAtual.toLowerCase()

    const visiveis = todos.filter(f => {
        const passaFiltro = filtroAtivo === "todos" || f.status === filtroAtivo
        const passaBusca = !busca
            || f.nome.toLowerCase().includes(busca)
            || f.genero.toLowerCase().includes(busca)
        return passaFiltro && passaBusca
    })

    moviesList.innerHTML = ""
    visiveis.forEach(f => moviesList.appendChild(createCard(f)))
    qntEl.textContent = todos.length
}

// CRUD
const salvarFilme = (e) => {
    e.preventDefault()

    const imagem = inputUrlImg.value.trim()

    const filme = {
        id: editingId ?? crypto.randomUUID(),
        nome: inputNome.value.trim(),
        genero: inputGenero.value.trim(),
        status: inputStatus.value,
        imagem,
        avaliacao
    }

    const filmes = getFilmes()

    if (editingId) {
        const idx = filmes.findIndex(f => f.id === editingId)
        filmes[idx] = filme
    } else {
        filmes.push(filme)
    }

    saveFilmes(filmes)
    renderFilmes()
    fecharModal()
}

const deletarFilme = (id) => {
    saveFilmes(getFilmes().filter(f => f.id !== id))
    renderFilmes()
}

// Filtros e busca 
const filterBtns = document.querySelectorAll("#filters button")

filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        filtroAtivo = btn.dataset.filtro
        filterBtns.forEach(b => b.classList.remove("filter-selected"))
        btn.classList.add("filter-selected")
        renderFilmes()
    })
})

document.querySelector("#search").addEventListener("input", (e) => {
    buscaAtual = e.target.value
    renderFilmes()
})

// Events
document.querySelector("#btn-abrir-acervo").addEventListener("click", () => {
    document.querySelector("#section-acervo-container").scrollIntoView({ behavior: "smooth" })
})

addFilmeBtn.addEventListener("click", () => abrirModal("criar"))
modalCloseBtn.addEventListener("click", fecharModal)
modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) fecharModal() })
form.addEventListener("submit", salvarFilme)

// Inicialização
renderFilmes()
