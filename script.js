// FORMULÁRIO
const form = document.getElementById("osForm");

if (form) {
  form.addEventListener("submit", e => {
    e.preventDefault();

    const os = {
      data: new Date().toLocaleDateString(),
      solicitante: form[0].value,
      setor: form[1].value,
      link: form[2].value,
      tipoComunicacao: form[3].value,
      material: form[4].value,
      info: form[5].value,
      prazo: form[6].value,
      status: "Recebido"
    };

    console.log("Enviar para o Firebase:", os);
    alert("Ordem de serviço enviada!");

    form.reset();
  });
}
