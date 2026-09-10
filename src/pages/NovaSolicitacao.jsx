import { useState } from "react";
import { CATEGORIAS, PRIORIDADES } from "../data/constants";
import { abrirChamado } from "../lib/tickets";
import { irPara } from "../lib/format";

export default function NovaSolicitacao({ sessao }) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("TI");
  const [prioridade, setPrioridade] = useState("media");
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState("");

  function enviar(evento) {
    evento.preventDefault();
    const resultado = abrirChamado({ titulo, descricao, categoria, prioridade }, sessao);
    if (!resultado.ok) {
      setOk("");
      setErro(resultado.erro);
      return;
    }
    setErro("");
    setOk(`Protocolo ${resultado.chamado.id} gerado. Status inicial: Aberto.`);
    setTimeout(() => irPara(`/chamado/${resultado.chamado.id}`), 900);
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Nova solicitação</h1>
          <p>Preencha título, categoria, descrição e a prioridade que você sugere.</p>
        </div>
        <button className="btn btn-ghost" type="button" onClick={() => irPara("/solicitante")}>
          Voltar
        </button>
      </div>

      <form className="card card-pad" onSubmit={enviar} style={{ maxWidth: 720 }}>
        {erro ? <div className="erro">{erro}</div> : null}
        {ok ? <div className="ok">{ok}</div> : null}

        <label className="field">
          <span>Título</span>
          <input className="input" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Resumo do problema" />
        </label>

        <label className="field">
          <span>Categoria</span>
          <select className="select" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            {CATEGORIAS.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>

        <label className="field">
          <span>Descrição</span>
          <textarea className="textarea" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="O que aconteceu, onde e desde quando" />
        </label>

        <label className="field">
          <span>Prioridade sugerida</span>
          <select className="select" value={prioridade} onChange={(e) => setPrioridade(e.target.value)}>
            {Object.entries(PRIORIDADES).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>{rotulo}</option>
            ))}
          </select>
        </label>

        <button className="btn btn-primary" type="submit">Abrir chamado</button>
      </form>
    </>
  );
}
