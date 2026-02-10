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
let enviando = false;

if (form) {
  const botaoEnviar = form.querySelector("button[type='submit']");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (enviando) return;

    enviando = true;
    if (botaoEnviar) botaoEnviar.disabled = true;

    const os = {
      createdAt: Date.now(),
      dataCriacao: new Date().toLocaleString("pt-BR"),
      solicitante: solicitante.value.trim(),
      setor: setor.value.trim(),
      link: link.value.trim(),
      tipoComunicacao: tipoComunicacao.value,
      material: material.value,
      info: info.value.trim(),
      observacoes: observacoes.value.trim(),
      prazo: calcularPrazo(),
      status: "Recebido"
    };

    await push(ref(db, "ordens-servico"), os);
    form.reset();
    enviando = false;
    if (botaoEnviar) botaoEnviar.disabled = false;
  });
}

/* ==========================
   📥 PAINEL
========================== */
const lista = document.getElementById("listaOS");
const osRef = ref(db, "ordens-servico");

onValue(osRef, (snapshot) => {
  lista.innerHTML = "";

  snapshot.forEach((child) => {
    const os = child.val();
    const id = child.key;

    /* Linha principal */
    lista.insertAdjacentHTML("beforeend", `
      <tr class="linha-principal" data-id="${id}">
        <td>${os.dataCriacao}</td>
        <td>${os.solicitante}</td>
        <td>${os.setor}</td>
        <td>${os.tipoComunicacao}</td>
        <td>${os.material}</td>
        <td>${os.prazo}</td>
        <td>
          <div class="status-container">
            <select class="${classeStatus(os.status)} status" data-id="${id}">
              <option ${os.status === "Recebido" ? "selected" : ""}>Recebido</option>
              <option ${os.status === "Em produção" ? "selected" : ""}>Em produção</option>
              <option ${os.status === "Finalizado" ? "selected" : ""}>Finalizado</option>
            </select>
            <button class="btn-editar" data-id="${id}">Editar</button>
          </div>
        </td>
      </tr>

      <tr class="linha-info">
        <td colspan="7">
          <strong>Informações:</strong>
          <span class="info-text">${os.info || ""}</span>
          ${os.link ? `<br><strong>Link:</strong> ${os.link}` : ""}
        </td>
      </tr>

      <tr class="linha-obs">
        <td colspan="7">
          <strong>Observações:</strong>
          <span class="obs-text">${os.observacoes || ""}</span>
        </td>
      </tr>
    `);
  });
});

/* ==========================
   🔄 EVENT DELEGATION
========================== */
lista.addEventListener("change", (e) => {
  if (!e.target.classList.contains("status")) return;

  const id = e.target.dataset.id;
  const novoStatus = e.target.value;

  update(ref(db, `ordens-servico/${id}`), { status: novoStatus });
  e.target.className = `${classeStatus(novoStatus)} status`;
});

lista.addEventListener("click", (e) => {
  if (!e.target.classList.contains("btn-editar")) return;

  const btn = e.target;
  const trPrincipal = btn.closest("tr");
  const trInfo = trPrincipal.nextElementSibling;
  const trObs = trInfo.nextElementSibling;

  const infoSpan = trInfo.querySelector(".info-text");
  const obsSpan = trObs.querySelector(".obs-text");
  const id = btn.dataset.id;

  if (btn.textContent === "Salvar") {
    const novoInfo = trInfo.querySelector("textarea").value;
    const novaObs = trObs.querySelector("textarea").value;

    update(ref(db, `ordens-servico/${id}`), {
      info: novoInfo,
      observacoes: novaObs
    });

    btn.textContent = "Editar";
    return;
  }

  infoSpan.innerHTML = `<textarea style="width:100%">${infoSpan.textContent}</textarea>`;
  obsSpan.innerHTML = `<textarea style="width:100%">${obsSpan.textContent}</textarea>`;
  btn.textContent = "Salvar";
});
