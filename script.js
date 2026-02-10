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

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// =======================
// 📅 PRAZO FIXO (+2 dias)
// =======================
function calcularPrazo() {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().split("T")[0];
}

// =======================
// 📤 FORMULÁRIO (index)
// =======================
const form = document.getElementById("osForm");

if (form) {
  console.log("🔥 Formulário detectado");

  form.addEventListener("submit", e => {
    e.preventDefault();

    const os = {
      dataCriacao: new Date().toLocaleString("pt-BR"),
      solicitante: document.getElementById("solicitante").value,
      setor: document.getElementById("setor").value,
      link: document.getElementById("link").value,
      tipoComunicacao: document.getElementById("tipoComunicacao").value,
      material: document.getElementById("material").value,
      info: document.getElementById("info").value,
      prazo: calcularPrazo(),
      status: "Recebido"
    };

    push(ref(db, "ordens-servico"), os)
      .then(() => {
        alert("✅ Ordem enviada com sucesso!");
        form.reset();
      })
      .catch(err => {
        console.error(err);
        alert("❌ Erro ao enviar");
      });
  });
}

// =======================
// 📥 PAINEL (painel)
// =======================
const lista = document.getElementById("listaOS");

if (lista) {
  console.log("🔥 Painel detectado");

  const osRef = ref(db, "ordens-servico");

  onValue(osRef, snapshot => {
    console.log("🔥 Dados recebidos:", snapshot.val());

    lista.innerHTML = "";

    snapshot.forEach(child => {
      const os = child.val();
      const id = child.key;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${os.dataCriacao || "-"}</td>
        <td>${os.solicitante || "-"}</td>
        <td>${os.setor || "-"}</td>
        <td>${os.tipoComunicacao || "-"}</td>
        <td>${os.prazo || "-"}</td>
        <td>
          <select data-id="${id}" class="status">
            <option ${os.status === "Recebido" ? "selected" : ""}>Recebido</option>
            <option ${os.status === "Em produção" ? "selected" : ""}>Em produção</option>
            <option ${os.status === "Finalizado" ? "selected" : ""}>Finalizado</option>
            <option ${os.status === "Ajuste solicitado" ? "selected" : ""}>Ajuste solicitado</option>
          </select>
        </td>
        <td>—</td>
      `;

      lista.appendChild(tr);
    });

    document.querySelectorAll(".status").forEach(select => {
      select.addEventListener("change", e => {
        update(ref(db, `ordens-servico/${e.target.dataset.id}`), {
          status: e.target.value
        });
      });
    });
  });
}
