// 🔹 CONFIGURAÇÃO FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyBnlLE3-auOj2t4y-bMrweeuNoXclZuW_Y",
  authDomain: "sapataria-passos.firebaseapp.com",
  projectId: "sapataria-passos",
  storageBucket: "sapataria-passos.appspot.com",
  messagingSenderId: "1048911524511",
  appId: "1:1048911524511:web:ada0055b1c85bd8cc4e8aa",
  measurementId: "G-24GWQ36G39"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// 🔹 Login
const loginForm = document.getElementById("formLogin");
loginForm.addEventListener("submit", async e=>{
  e.preventDefault();
  const email = document.getElementById("emailLogin").value;
  const senha = document.getElementById("senhaLogin").value;
  try{
    await auth.signInWithEmailAndPassword(email, senha);
    document.getElementById("login").style.display="none";
    document.querySelectorAll(".aba").forEach(a=>a.style.display="block");
    renderizar();
  }catch(err){
    alert("Email ou senha incorretos!");
  }
});

auth.onAuthStateChanged(user=>{
  if(user){
    document.getElementById("login").style.display="none";
    document.querySelectorAll(".aba").forEach(a=>a.style.display="block");
    renderizar();
  }
});

// 🔹 Mostrar aba
function mostrarAba(id){
  document.querySelectorAll(".aba").forEach(a=>a.classList.remove("ativa"));
  document.getElementById(id).classList.add("ativa");
}

// 🔹 Renderizar dados
async function renderizar(){
  const listaOrc = document.getElementById("listaOrcamentos");
  listaOrc.innerHTML="";
  const orcamentos = await db.collection("orcamentos").get();
  orcamentos.forEach(docSnap=>{
    const o = docSnap.data();
    listaOrc.innerHTML+=`
      <div class="card">
        <b>${o.cliente}</b> - ${o.servico}<br>
        📅 Entrega: ${o.dataEntrega}<br>
        💰 Valor: R$ ${o.valor.toFixed(2)} (${o.entrada>0?"Entrada: R$"+o.entrada.toFixed(2):"Sem entrada"})
        <div>Fotos: ${o.fotos.map(f=><img src="${f}" alt="foto">).join("")}</div>
        <button onclick="fecharServico('${docSnap.id}')">Fechar Serviço</button>
      </div>
    `;
  });

  const listaAF = document.getElementById("listaAFazer");
  listaAF.innerHTML="";
  const aFazer = await db.collection("a_fazer").get();
  aFazer.forEach(docSnap=>{
    const s = docSnap.data();
    let restante = s.valor - s.entrada;
    listaAF.innerHTML+=`
      <div class="card">
        <b>${s.cliente}</b> - ${s.servico}<br>
        📅 Entrega: ${s.dataEntrega}<br>
        💰 Total: R$ ${s.valor.toFixed(2)}<br>
        ${s.entrada>0?"💵 Pago: R$"+s.entrada.toFixed(2)+" | Falta: R$"+restante.toFixed(2):"Não pago"}
        <div>Fotos: ${s.fotos.map(f=><img src="${f}" alt="foto">).join("")}</div>
        <button onclick="marcarPronto('${docSnap.id}')">Pronto</button>
      </div>
    `;
  });

  const listaP = document.getElementById("listaProntos");
  listaP.innerHTML="";
  const prontos = await db.collection("prontos").get();
  prontos.forEach(docSnap=>{
    const p = docSnap.data();
    listaP.innerHTML+=`
      <div class="card">
        <b>${p.cliente}</b> - ${p.servico}<br>
        ✅ Conserto Pronto<br>
        📅 Entrega: ${p.dataEntrega}<br>
        💰 Total: R$ ${p.valor.toFixed(2)} (${p.entrada>=p.valor?"Pago":"Falta pagar"})
        <div>Fotos: ${p.fotos.map(f=><img src="${f}" alt="foto">).join("")}</div>
      </div>
    `;
  });
}

// 🔹 Adicionar orçamento
document.getElementById("formOrcamento").addEventListener("submit", async e=>{
  e.preventDefault();
  const cliente = document.getElementById("cliente").value;
  const telefone = document.getElementById("telefone").value;
  const servico = document.getElementById("servico").value;
  const valor = parseFloat(document.getElementById("valor").value);
  const entrada = parseFloat(document.getElementById("entrada").value) || 0;
  const dataEntrega = document.getElementById("dataEntrega").value;
  const fotos = [];

  const files = document.getElementById("fotos").files;
  if(files.length===0){
    await db.collection("orcamentos").add({cliente,telefone,servico,valor,entrada,dataEntrega,fotos,status:"orcamento"});
    renderizar();
  }else{
    for(let f of files){
      let reader = new FileReader();
      reader.onload = async e=>{
        fotos.push(e.target.result);
        if(fotos.length===files.length){
          await db.collection("orcamentos").add({cliente,telefone,servico,valor,entrada,dataEntrega,fotos,status:"orcamento"});
          renderizar();
        }
      };
      reader.readAsDataURL(f);
    }
  }
});

// 🔹 Fechar serviço → enviar WhatsApp e mover para "a_fazer"
window.fecharServico = async function(id){
  const docRef = db.collection("orcamentos").doc(id);
  const docSnap = await docRef.get();
  const sData = docSnap.data();

  await db.collection("a_fazer").add(sData);
  await docRef.delete();

  window.open(https://wa.me/55${sData.telefone}?text=${encodeURIComponent(`Olá, aqui é da Sapataria Passos! Seu conserto estará pronto em ${sData.dataEntrega}.)}`, "_blank");
  renderizar();
}

// 🔹 Marcar como pronto → enviar WhatsApp e mover para "prontos"
window.marcarPronto = async function(id){
  const docRef = db.collection("a_fazer").doc(id);
  const sSnap = await docRef.get();
  const sData = sSnap.data();

  await db.collection("prontos").add(sData);
  await docRef.delete();

  window.open(https://wa.me/55${sData.telefone}?text=${encodeURIComponent("Olá, aqui é da Sapataria Passos! Seu concerto está pronto!")}, "_blank");
  renderizar();
}

// 🔹 Inicializar
renderizar();