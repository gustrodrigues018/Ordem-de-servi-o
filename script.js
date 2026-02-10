import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";

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

// prazo fixo +2 dias
function calcularPrazo() {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().split("T")[0];
}

const form = document.getElementById("osForm");

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
      alert("❌ Erro ao enviar a ordem");
    });
});
