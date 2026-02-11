import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  update
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

/* 🔄 RENDER */
function render(snapshot) {
  ultimoSnapshot = snapshot;
  lista.innerHTML = "";

  snapshot.forEach((child) => {
    const o = child.val();
    const id = child.key;
    const emEdicao = editandoId === id;

    /* 🔗 MULTIPLOS LINKS */
    let linksHTML = "";

    if (!emEdicao && o.link) {
      const linksArray = o.link
        .split(/\n|,|;/)
        .map(l => l.trim())
        .filter(l => l !== "");

      linksHTML = `
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
          </div>
        </td>
      </tr>

      <tr class="linha-info">
        <td colspan="7">
          <strong>Informações:</strong>
          ${
            emEdicao
              ? `
                <textarea class="edit-info" data-id="${id}" 
                  style="width:100%; box-sizing:border-box;">
                  ${o.info || ""}
                </textarea>

                <br><br>
                <strong>Links (um por linha):</strong>
                <textarea class="edit-link" data-id="${id}" 
                  style="width:100%; box-sizing:border-box;">
                  ${o.link || ""}
                </textarea>
              `
              : `
                <span>${o.info || ""}</span>
                ${linksHTML}
              `
          }
        </td>
      </tr>

      <tr class="linha-obs">
        <td colspan="7">
          <strong>Observações:</strong>
          ${
            emEdicao
              ? `<textarea class="edit-obs" data-id="${id}" 
                   style="width:100%; box-sizing:border-box;">
                   ${o.observacoes || ""}
                 </textarea>`
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
   🖱️ CLICK (EDITAR / SALVAR)
========================== */

lista.addEventListener("click", async (e) => {
  const btn = e.target.closest(".btn-editar");
  if (!btn) return;

  const id = btn.dataset.id;

  // 🔁 SALVAR
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

    // 🔥 FORÇA RENDER IMEDIATO
    render(ultimoSnapshot);

    return;
  }

  // ✏️ ENTRAR EM EDIÇÃO
  editandoId = id;
  render(ultimoSnapshot);
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
