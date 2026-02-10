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
   📅 PRAZO FIXO (+2 DIAS)
========================== */
function calcularPrazo() {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().split("T")[0];
}

/* ==========================
   📤 FORMULÁRIO (index.html)
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
      solicitante: document.getElementById("solicitante").value.trim(),
      setor: document.getElementById("setor").value.trim(),
      link: document.getElementById("link").value.trim(),
      tipoComunicacao: document.getElementById("tipoComunicacao").value,
      material: document.getElementById("material").value,
      info: document.getElementById("info").value.trim(),
      observacoes: document.getElementById("observacoes").value.trim(),
      prazo: calcularPrazo(),
      status: "Recebido"
    };

    try {
      await push(ref(db, "ordens-servico"), os);
      alert("✅ Ordem de serviço enviada com sucesso!");
      form.reset();
    } catch (error) {
      console.error(error);
      alert("❌ Erro ao enviar a ordem");
    } finally {
      enviando = false;
      if (botaoEnviar) botaoEnviar.disabled = false;
    }
  });
}

/* ==========================
   📥 PAINEL (painel.html)
========================== */
const lista = document.getElementById("listaOS");

if (lista) {
  const osRef = ref(db, "ordens-servico");

  onValue(osRef, (snapshot) => {
    lista.innerHTML = "";

    if (!snapshot.exists()) {
      lista.innerHTML = `
        <tr>
          <td colspan="7">Nenhuma ordem registrada.</td>
        </tr>
      `;
      return;
    }

    snapshot.forEach((child) => {
      const os = child.val();
      const id = child.key;

      /* 🔹 Linha principal */
      const trPrincipal = document.createElement("tr");
      trPrincipal.classList.add("linha-principal");
      trPrincipal.innerHTML = `
        <td>${os.dataCriacao || "-"}</td>
        <td>${os.solicitante || "-"}</td>
        <td>${os.setor || "-"}</td>
        <td>${os.tipoComunicacao || "-"}</td>
        <td>${os.material || "-"}</td>
        <td>${os.prazo || "-"}</td>
        <td>
          <select class="status" data-id="${id}">
            <option ${os.status === "Recebido" ? "selected" : ""}>Recebido</option>
            <option ${os.status === "Em produção" ? "selected" : ""}>Em produção</option>
            <option ${os.status === "Finalizado" ? "selected" : ""}>Finalizado</option>
            <option ${os.status === "Ajuste solicitado" ? "selected" : ""}>Ajuste solicitado</option>
          </select>
        </td>
      `;

      /* 🔹 Linha de informações */
      const trInfo = document.createElement("tr");
      trInfo.classList.add("linha-info");
      trInfo.innerHTML = `
        <td colspan="7">
          <strong>Informações:</strong>
          ${os.info || "—"}
          ${os.link ? `<br><strong>Link/Arquivo:</strong> ${os.link}` : ""}
        </td>
      `;

      /* 🔹 Linha de observações */
      const trObs = document.createElement("tr");
      trObs.classList.add("linha-obs");
      trObs.innerHTML = `
        <td colspan="7">
          <strong>Observações:</strong> ${os.observacoes || "—"}
        </td>
      `;

      lista.appendChild(trPrincipal);
      lista.appendChild(trInfo);
      lista.appendChild(trObs);
    });

    /* 🔄 Atualização de status */
    document.querySelectorAll(".status").forEach((select) => {
      select.addEventListener("change", (e) => {
        const id = e.target.dataset.id;
        update(ref(db, `ordens-servico/${id}`), {
          status: e.target.value
        });
      });
    });
  });
}
