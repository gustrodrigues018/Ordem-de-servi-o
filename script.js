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

    alert("✅ Ordem enviada");
    form.reset();
  });
}

/* ==========================
   📥 PAINEL
========================== */
const lista = document.getElementById("listaOS");
const osRef = ref(db, "ordens-servico");

let editandoId = null;

/* 🔄 RENDER */
onValue(osRef, (snapshot) => {
  lista.innerHTML = "";

  snapshot.forEach((child) => {
    const o = child.val();
    const id = child.key;

    lista.insertAdjacentHTML("beforeend", `
      <tr class="linha-principal" data-id="${id}">
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
            <button class="btn-editar" data-id="${id}">Editar</button>
          </div>
        </td>
      </tr>

      <tr class="linha-info">
        <td colspan="7">
          <strong>Informações:</strong>
          <span class="info-text">${o.info || ""}</span>
        </td>
      </tr>

      <tr class="linha-obs">
        <td colspan="7">
          <strong>Observações:</strong>
          <span class="obs-text">${o.observacoes || ""}</span>
        </td>
      </tr>
    `);
  });
});

/* ==========================
   🖱️ EVENT DELEGATION (EDITAR / SALVAR)
========================== */
lista.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-editar");
  if (!btn) return;

  const id = btn.dataset.id;
  const trPrincipal = btn.closest("tr");
  const trInfo = trPrincipal.nextElementSibling;
  const trObs = trInfo.nextElementSibling;

  const infoSpan = trInfo.querySelector(".info-text");
  const obsSpan = trObs.querySelector(".obs-text");

  /* 💾 SALVAR */
  if (btn.textContent === "Salvar") {
    const infoTextarea = trInfo.querySelector("textarea");
    const obsTextarea = trObs.querySelector("textarea");

    const novoInfo = infoTextarea.value;
    const novaObs = obsTextarea.value;

    // 🔄 RESTAURA VISUAL IMEDIATA
    infoSpan.textContent = novoInfo;
    obsSpan.textContent = novaObs;

    update(ref(db, `ordens-servico/${id}`), {
      info: novoInfo,
      observacoes: novaObs
    });

    btn.textContent = "Editar";
    editandoId = null;
    return;
  }

  /* ✏️ EDITAR */
  if (editandoId && editandoId !== id) {
    alert("Finalize a edição atual primeiro.");
    return;
  }

  editandoId = id;

  infoSpan.innerHTML = `
    <textarea style="width:100%; max-width:100%; box-sizing:border-box;">
      ${infoSpan.textContent}
    </textarea>
  `;

  obsSpan.innerHTML = `
    <textarea style="width:100%; max-width:100%; box-sizing:border-box;">
      ${obsSpan.textContent}
    </textarea>
  `;

  btn.textContent = "Salvar";
});

/* ==========================
   🔄 STATUS CHANGE
========================== */
lista.addEventListener("change", (e) => {
  if (!e.target.classList.contains("status")) return;

  const id = e.target.dataset.id;
  const novoStatus = e.target.value;

  update(ref(db, `ordens-servico/${id}`), { status: novoStatus });
  e.target.className = `${classeStatus(novoStatus)} status`;
});
