// Função para mostrar aba
function mostrarAba(id){
  document.querySelectorAll(".aba").forEach(a => a.classList.remove("ativa"));
  document.getElementById(id).classList.add("ativa");
}

// Funções para salvar e carregar do localStorage
function salvarDados(chave, dados){
  localStorage.setItem(chave, JSON.stringify(dados));
}

function carregarDados(chave){
  return JSON.parse(localStorage.getItem(chave)) || [];
}

// Renderizar todas as abas
function renderizar(){
  // Orçamentos
  const listaOrc = document.getElementById("listaOrcamentos");
  listaOrc.innerHTML = "";
  const orcamentos = carregarDados("orcamentos");
  orcamentos.forEach((o, index)=>{
    listaOrc.innerHTML += `
      <div class="card">
        <b>${o.cliente}</b> - ${o.servico}<br>
        📅 Entrega: ${o.dataEntrega}<br>
        💰 Valor: R$ ${o.valor.toFixed(2)} (${o.entrada>0?"Entrada: R$"+o.entrada.toFixed(2):"Sem entrada"})<br>
        Fotos: ${o.fotos.map(f=><img src="${f}">).join("")}<br>
        <button onclick="fecharServico(${index})">Fechar Serviço</button>
      </div>
    `;
  });

  // Serviços a Fazer
  const listaAF = document.getElementById("listaAFazer");
  listaAF.innerHTML = "";
  const aFazer = carregarDados("aFazer");
  aFazer.forEach((s,index)=>{
    let restante = s.valor - s.entrada;
    listaAF.innerHTML += `
      <div class="card">
        <b>${s.cliente}</b> - ${s.servico}<br>
        📅 Entrega: ${s.dataEntrega}<br>
        💰 Total: R$ ${s.valor.toFixed(2)}<br>
        ${s.entrada>0?"💵 Pago: R$"+s.entrada.toFixed(2)+" | Falta: R$"+restante.toFixed(2):"Não pago"}<br>
        Fotos: ${s.fotos.map(f=><img src="${f}">).join("")}<br>
        <button onclick="marcarPronto(${index})">Pronto</button>
      </div>
    `;
  });

  // Serviços Prontos
  const listaP = document.getElementById("listaProntos");
  listaP.innerHTML = "";
  const prontos = carregarDados("prontos");
  prontos.forEach((p,index)=>{
    listaP.innerHTML += `
      <div class="card">
        <b>${p.cliente}</b> - ${p.servico}<br>
        ✅ Conserto Pronto<br>
        📅 Entrega: ${p.dataEntrega}<br>
        💰 Total: R$ ${p.valor.toFixed(2)} (${p.entrada>=p.valor?"Pago":"Falta pagar"})<br>
        Fotos: ${p.fotos.map(f=><img src="${f}">).join("")}
      </div>
    `;
  });

  // Agenda
  const listaAgenda = document.getElementById("listaAgenda");
  listaAgenda.innerHTML = "";
  const dataSel = document.getElementById("dataAgenda").value;
  if(dataSel){
    const todos = [...aFazer, ...prontos];
    const doDia = todos.filter(s=>s.dataEntrega===dataSel);
    doDia.forEach(s=>{
      listaAgenda.innerHTML += <div class="card"><b>${s.cliente}</b> - ${s.servico} | Entrega: ${s.dataEntrega}</div>;
    });
  }
}

// Adicionar novo orçamento
document.getElementById("formOrcamento").addEventListener("submit", function(e){
  e.preventDefault();
  const cliente = document.getElementById("cliente").value;
  const telefone = document.getElementById("telefone").value;
  const servico = document.getElementById("servico").value;
  const valor = parseFloat(document.getElementById("valor").value);
  const entrada = parseFloat(document.getElementById("entrada").value) || 0;
  const dataEntrega = document.getElementById("dataEntrega").value;
  const fotosInput = document.getElementById("fotos");
  const fotos = [];
  for(let i=0;i<fotosInput.files.length;i++){
    const reader = new FileReader();
    reader.onload = function(e){
      fotos.push(e.target.result);
      if(fotos.length===fotosInput.files.length){
        const orcamentos = carregarDados("orcamentos");
        orcamentos.push({cliente,telefone,servico,valor,entrada,dataEntrega,fotos});
        salvarDados("orcamentos",orcamentos);
        renderizar();
      }
    }
    reader.readAsDataURL(fotosInput.files[i]);
  }
  if(fotosInput.files.length===0){
    const orcamentos = carregarDados("orcamentos");
    orcamentos.push({cliente,telefone,servico,valor,entrada,dataEntrega,fotos:[]});
    salvarDados("orcamentos",orcamentos);
    renderizar();
  }
});

// Fechar serviço → vai para a aba "aFazer" e envia WhatsApp
function fecharServico(index){
  const orcamentos = carregarDados("orcamentos");
  const s = orcamentos.splice(index,1)[0];
  const aFazer = carregarDados("aFazer");
  aFazer.push(s);
  salvarDados("orcamentos",orcamentos);
  salvarDados("aFazer",aFazer);
  window.open(https://wa.me/55${s.telefone}?text=${encodeURIComponent(`Olá, aqui é da Sapataria Passos! Seu conserto estará pronto em ${s.dataEntrega}.)}`,"_blank");
  renderizar();
}

// Marcar como pronto → vai para aba "prontos" e envia WhatsApp
function marcarPronto(index){
  const aFazer = carregarDados("aFazer");
  const s = aFazer.splice(index,1)[0];
  const prontos = carregarDados("prontos");
  prontos.push(s);
  salvarDados("aFazer",aFazer);
  salvarDados("prontos",prontos);
  window.open(https://wa.me/55${s.telefone}?text=${encodeURIComponent(`Olá, aqui é da Sapataria Passos! Seu conserto está pronto!)}`,"_blank");
  renderizar();
}

// Atualizar agenda quando muda a data
document.getElementById("dataAgenda").addEventListener("change", renderizar);

// Inicializar
renderizar();