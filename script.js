// Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getDatabase, ref, push, onValue, update } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";

// Config
const firebaseConfig = {
  apiKey: "AIzaSyC2PhF95pAkWIbDk4Z_PWHG1JWFVARVLQc",
  authDomain: "ordem-de-servico-af727.firebaseapp.com",
  databaseURL: "https://ordem-de-servico-af727-default-rtdb.firebaseio.com",
  projectId: "ordem-de-servico-af727",
  storageBucket: "ordem-de-servico-af727.firebasestorage.app",
  messagingSenderId: "1005547143008",
  appId: "1:1005547143008:web:2d89836752ecba4d8c2805"
};

// Init
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 🔹 FUNÇÃO PRA CALCULAR PRAZO (+2 dias)
function calcularPrazo() {
  const data = new Date();
  data.setDate(data.getDate() + 2);
  return data.toISOString().split("T")[0];
}

// ================================
// 📤 FORMULÁRIO (index.html)
// ================================
const form = document.getElementById("osForm");

if (form) {
  form.addEventListener("submit", e => {
    e.preventDefault();

    const os = {
      dataCriacao: new Date().toLocaleString("pt-BR"),
      solicitante: form[0].value,
      setor: form[1].value,
      link: form[2].value,
      tipoComunicacao: form[3].value,
      material: form[4].value,
      info: form[5].value,
      prazo: calcularPrazo(),
      status: "Recebido"
    };

    push(ref(db, "ordens-servico"), os)
      .then(() => {
        alert("✅ Ordem de serviço enviada com sucesso!");
        form.reset();
      })
      .catch(err => {
        alert("❌ Erro ao enviar");
        console.error(err);
      });
  });
}

// ================================
// 📥 PAINEL (painel.html)
// ================================
const lista = document.getElementById("listaOS");

if (lista) {
  const osRef = ref(db, "ordens-servico");

  onValue(osRef, snapshot => {
    lista.innerHTML = "";

    snapshot.forEach(child => {
      const os = child.val();
      const id = child.key;

      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${os.dataCriacao}</td>
        <td>${os.solicitante}</td>
        <td>${os.setor}</td>
        <td>${os.tipoComunicacao}</td>
        <td>${os.prazo}</td>
        <td>
          <select class="status" data-id="${id}">
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

    // Atualiza status
    document.querySelectorAll(".status").forEach(select => {
      select.addEventListener("change", e => {
        const id = e.target.dataset.id;
        update(ref(db, `ordens-servico/${id}`), {
          status: e.target.value
        });
      });
    });
  });
}
