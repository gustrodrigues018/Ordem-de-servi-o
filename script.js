import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getDatabase, ref, push, onValue, update } 
from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";

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

/* Prazo */
function calcularPrazo() {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().split("T")[0];
}

/* Status */
function classeStatus(s) {
  if (s === "Finalizado") return "status status-finalizado";
  if (s === "Em produção") return "status status-producao";
  return "status status-recebido";
}

/* Form */
const form = document.getElementById("osForm");
if (form) {
  form.addEventListener("submit", async e => {
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

/* Painel */
const lista = document.getElementById("listaOS");
if (lista) {
  const osRef = ref(db, "ordens-servico");

  onValue(osRef, snap => {
    lista.innerHTML = "";

    snap.forEach(child => {
      const o = child.val();
      const id = child.key;

      lista.insertAdjacentHTML("beforeend", `
        <tr data-id="${id}">
          <td>${o.dataCriacao}</td>
          <td>${o.solicitante}</td>
          <td>${o.setor}</td>
          <td>${o.tipoComunicacao}</td>
          <td>${o.material}</td>
          <td>${o.prazo}</td>
          <td>
            <div class="status-container">
              <select class="${classeStatus(o.status)} status" data-id="${id}">
                <option ${o.status==="Recebido"?"selected":""}>Recebido</option>
                <option ${o.status==="Em produção"?"selected":""}>Em produção</option>
                <option ${o.status==="Finalizado"?"selected":""}>Finalizado</option>
              </select>
              <button class="btn-editar" data-id="${id}">Editar</button>
            </div>
          </td>
        </tr>
        <tr class="linha-info">
          <td colspan="7"><strong>Informações:</strong> ${o.info}</td>
        </tr>
        <tr class="linha-obs">
          <td colspan="7"><strong>Observações:</strong> ${o.observacoes}</td>
        </tr>
      `);
    });
  });
}
