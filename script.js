import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  update,
  remove
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";

/* ==========================
   🔥 FIREBASE CONFIG
========================== */
const firebaseConfig = {
  apiKey: "AIzaSyC2PhF95pAkWIbDk4Z_PWHG1JWFVARVLQc",
  authDomain: "ordem-de-servico-af727.firebaseapp.com",
  databaseURL: "https://ordem-de-servico-af727-default-rtdb.firebaseio.com",
  projectId: "ordem-de-servico-af727",
  storageBucket: "ordem-de-servico-af727.firebasestorage.app",
  messagingSenderId: "1005547143008",
  appId: "1:1005547143008:web:2d89836752ecba4d8c2805"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* ==========================
   📅 PRAZO FIXO
========================== */
function calcularPrazo() {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().split("T")[0];
}

/* ==========================
   🎨 STATUS
========================== */
function classeStatus(status) {
  if (status === "Finalizado") return "status status-finalizado";
  if (status === "Em produção") return "status status-producao";
  return "status status-recebido";
}

/* ==========================
   📤 FORMULÁRIO
========================== */
const form = document.getElementById("osForm");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    await push(ref(db, "ordens-servico"), {
      dataCriacao: new Date().toLocaleString("pt-BR"),
      solicitante: solicitante.value,
      setor: setor.value,
      link: link.value,
      tipoComunicacao: tipoComunicacao.value,
      material: material.value,
      info: info.value,
      observacoes: observacoes.value,
      prazo: calcularPrazo(),
      status: "Recebido"
    });

    form.reset();
  });
}

/* ==========================
   📥 PAINEL
========================== */

const lista = document.getElementById("listaOS");
const osRef = ref(db, "ordens-servico");

let editandoId = null;
let ultimoSnapshot = null;

/* ==========================
   🔗 GERAR LINKS
========================== */

function gerarLinksHTML(linkString) {
  if (!linkString) return "";

  const linksArray = linkString
    .split(/\n|,|;/)
    .map(l => l.trim())
    .filter(l => l !== "");

  if (!linksArray.length) return "";

  return `
    <br><strong>Links:</strong><br>
    ${linksArray.map(l => {
      const url = l.startsWith("http") ? l : "https://" + l;
      return `
        <a href="${url}" 
           target="_blank" 
           rel="noopener noreferrer"
           style="display:block; margin-top:4px;">
           🔗 ${l}
        </a>
      `;
    }).join("")}
  `;
}

/* ==========================
   🔄 RENDER
========================== */

function render(snapshot) {
  lista.innerHTML = "";
  ultimoSnapshot = snapshot;

  snapshot.forEach((child) => {
    const o = child.val();
    const id = child.key;
    const emEdicao = editandoId === id;

    lista.insertAdjacentHTML("beforeend", `
      <tr class="linha-principal">
        <td>${o.dataCriacao}</td>
        <td>${o.solicitante}</td>
        <td>${o.setor}</td>
        <td>${o.tipoComunicacao}</td>
        <td>${o.material}</td>
        <td>${o.prazo}</td>
        <td>
          <div class="status-container">
            <select class="${classeStatus(o.status)} status" data-id="${id}">
              <option ${o.status === "Recebido" ? "selected" : ""}>Recebido</option>
              <option ${o.status === "Em produção" ? "selected" : ""}>Em produção</option>
              <option ${o.status === "Finalizado" ? "selected" : ""}>Finalizado</option>
            </select>

            <button class="btn-editar" data-id="${id}">
              ${emEdicao ? "Salvar" : "Editar"}
            </button>

            <button class="btn-excluir" data-id="${id}">
              Excluir
            </button>
          </div>
        </td>
      </tr>

      <tr class="linha-info">
        <td colspan="7">
          <strong>Informações:</strong>
          ${
            emEdicao
              ? `
                <textarea class="edit-info" data-id="${id}" style="width:100%; box-sizing:border-box;">${o.info || ""}</textarea>
                <br><br>
                <strong>Links (um por linha, vírgula ou ;):</strong>
                <textarea class="edit-link" data-id="${id}" style="width:100%; box-sizing:border-box;">${o.link || ""}</textarea>
              `
              : `
                <span>${o.info || ""}</span>
                ${gerarLinksHTML(o.link)}
              `
          }
        </td>
      </tr>

      <tr class="linha-obs">
        <td colspan="7">
          <strong>Observações:</strong>
          ${
            emEdicao
              ? `<textarea class="edit-obs" data-id="${id}" style="width:100%; box-sizing:border-box;">${o.observacoes || ""}</textarea>`
              : `<span>${o.observacoes || ""}</span>`
          }
        </td>
      </tr>
    `);
  });
}

onValue(osRef, (snapshot) => {
  render(snapshot);
});

/* ==========================
   🖱️ CLICK (EDITAR / SALVAR / EXCLUIR)
========================== */

lista.addEventListener("click", async (e) => {

  /* EDITAR / SALVAR */
  const btnEditar = e.target.closest(".btn-editar");
  if (btnEditar) {
    const id = btnEditar.dataset.id;

    if (editandoId === id) {
      const novoInfo = document.querySelector(`.edit-info[data-id="${id}"]`).value;
      const novaObs = document.querySelector(`.edit-obs[data-id="${id}"]`).value;
      const novoLink = document.querySelector(`.edit-link[data-id="${id}"]`).value;

      await update(ref(db, `ordens-servico/${id}`), {
        info: novoInfo,
        observacoes: novaObs,
        link: novoLink
      });

      editandoId = null;

    } else {
      editandoId = id;
    }

    render(ultimoSnapshot); // 🔥 força render imediato
    return;
  }

  /* EXCLUIR */
  const btnExcluir = e.target.closest(".btn-excluir");
  if (btnExcluir) {
    const id = btnExcluir.dataset.id;

    const confirmar = confirm("Tem certeza que deseja excluir esta ordem?");
    if (!confirmar) return;

    await remove(ref(db, `ordens-servico/${id}`));

    if (editandoId === id) {
      editandoId = null;
    }
  }

});

/* ==========================
   🔄 STATUS
========================== */

lista.addEventListener("change", (e) => {
  if (!e.target.classList.contains("status")) return;

  const id = e.target.dataset.id;
  const novoStatus = e.target.value;

  update(ref(db, `ordens-servico/${id}`), { status: novoStatus });
});
