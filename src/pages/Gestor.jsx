import { useMemo, useState } from "react";
import { CATEGORIAS } from "../data/constants";
import { contarPorStatus, listarAtendentes, listarChamados } from "../lib/tickets";
import { formatarData, irPara, mesmoMes } from "../lib/format";
import { PriorityBadge, StatusBadge } from "../components/Badges";

export default function Gestor() {
  const [status, setStatus] = useState("aberta");
  const [categoria, setCategoria] = useState("");
  const [atendenteId, setAtendenteId] = useState("");
  const [periodo, setPeriodo] = useState("mes");
  const [busca, setBusca] = useState("");

  const atendentes = listarAtendentes();
  const todos = listarChamados();

  const doPeriodo = useMemo(
    () => (periodo === "mes" ? todos.filter((item) => mesmoMes(item.criadoEm)) : todos),
    [todos, periodo]
  );

  const totais = contarPorStatus(doPeriodo);

  const filtrados = doPeriodo.filter((chamado) => {
    if (status && chamado.status !== status) return false;
    if (categoria && chamado.categoria !== categoria) return false;
    if (atendenteId && chamado.atendenteId !== atendenteId) return false;
    const texto = `${chamado.id} ${chamado.titulo} ${chamado.categoria}`.toLowerCase();
    if (busca.trim() && !texto.includes(busca.trim().toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Painel da equipe</h1>
          <p>Totais por status, fila de triagem e redistribuição de chamados.</p>
        </div>
      </div>

      <div className="grid-stats">
        <button className="stat clickable" type="button" onClick={() => setStatus("aberta")}>
          <em>Abertos</em><strong>{totais.aberta}</strong>
        </button>
        <button className="stat clickable" type="button" onClick={() => setStatus("em_andamento")}>
          <em>Em andamento</em><strong>{totais.em_andamento}</strong>
        </button>
        <button className="stat clickable" type="button" onClick={() => setStatus("encerrada")}>
          <em>Encerrados</em><strong>{totais.encerrada}</strong>
        </button>
        <button className="stat clickable" type="button" onClick={() => setStatus("cancelada")}>
          <em>Cancelados</em><strong>{totais.cancelada}</strong>
        </button>
      </div>

      <div className="filters">
        <select className="select" value={status} onChange={(e) => setStatus(e.target.value)} style={{ maxWidth: 200 }}>
          <option value="">Todos os status</option>
          <option value="aberta">Aberto</option>
          <option value="em_andamento">Em andamento</option>
          <option value="encerrada">Encerrado</option>
          <option value="cancelada">Cancelado</option>
        </select>
        <select className="select" value={categoria} onChange={(e) => setCategoria(e.target.value)} style={{ maxWidth: 200 }}>
          <option value="">Todas as categorias</option>
          {CATEGORIAS.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select className="select" value={atendenteId} onChange={(e) => setAtendenteId(e.target.value)} style={{ maxWidth: 240 }}>
          <option value="">Todos os atendentes</option>
          {atendentes.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}
        </select>
        <select className="select" value={periodo} onChange={(e) => setPeriodo(e.target.value)} style={{ maxWidth: 200 }}>
          <option value="mes">Mês corrente</option>
          <option value="todos">Todo o histórico</option>
        </select>
        <input className="input" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar protocolo ou título" style={{ maxWidth: 280 }} />
      </div>

      <div className="card table-wrap">
        {filtrados.length === 0 ? (
          <div className="empty">Nenhum chamado neste recorte.</div>
        ) : (
          <table className="data">
            <thead>
              <tr>
                <th>Protocolo</th>
                <th>Título</th>
                <th>Categoria</th>
                <th>Prioridade</th>
                <th>Status</th>
                <th>Atualizado</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((chamado) => (
                <tr key={chamado.id} className="clickable" onClick={() => irPara(`/chamado/${chamado.id}`)}>
                  <td>{chamado.id}</td>
                  <td>{chamado.titulo}</td>
                  <td>{chamado.categoria}</td>
                  <td><PriorityBadge prioridade={chamado.prioridade} /></td>
                  <td><StatusBadge status={chamado.status} /></td>
                  <td>{formatarData(chamado.atualizadoEm)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
