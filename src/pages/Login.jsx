import { useState } from "react";
import Brand from "../components/Brand";
import { autenticar, rotaInicial } from "../lib/auth";
import { irPara } from "../lib/format";
import { SENHA_DEMO } from "../data/constants";

const CONTAS = [
  { perfil: "Solicitante", email: "ana.souza@mackenzie.br", nome: "Ana Souza" },
  { perfil: "Gestor", email: "carla.mendes@mackenzie.br", nome: "Carla Mendes" },
  { perfil: "Atendente", email: "rafael.costa@mackenzie.br", nome: "Rafael Costa" },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento) {
    evento.preventDefault();
    setErro("");
    setEnviando(true);
    const resultado = await autenticar(email, senha);
    setEnviando(false);
    if (!resultado.ok) {
      setErro(resultado.erro);
      return;
    }
    irPara(rotaInicial(resultado.sessao.perfil));
  }

  return (
    <div className="login-wrap">
      <section className="login-left">
        <div>
          <Brand light />
          <h1>Abra, atenda e encerre. Sem planilha.</h1>
          <p>
            O AtendeFácil organiza o ciclo de um chamado: o solicitante registra o pedido,
            o gestor tria e atribui, o atendente registra a solução e fecha.
          </p>
          <div className="steps">
            <div className="step"><b>1</b> Solicitante abre o chamado e recebe o protocolo.</div>
            <div className="step"><b>2</b> Gestor define prioridade e escolhe o atendente.</div>
            <div className="step"><b>3</b> Atendente registra a solução e encerra.</div>
          </div>
        </div>
        <p>Mackenzie · Prática Profissional em ADS · Grupo 9 · 2026</p>
      </section>

      <section className="login-right">
        <div className="login-card">
          <img className="login-logo" src="./logo-atendefacil.png" alt="AtendeFácil — Sistema de Atendimento" />
          <h2>Entrar</h2>
          <p style={{ color: "var(--ink-soft)", marginTop: 0 }}>
            Use uma conta de demonstração ou preencha e-mail e senha.
          </p>

          <div className="demo-list">
            {CONTAS.map((conta) => (
              <button
                key={conta.email}
                type="button"
                className="demo"
                onClick={() => {
                  setEmail(conta.email);
                  setSenha(SENHA_DEMO);
                  setErro("");
                }}
              >
                <strong>{conta.perfil} · {conta.nome}</strong>
                <span>{conta.email} · senha {SENHA_DEMO}</span>
              </button>
            ))}
          </div>

          <form onSubmit={enviar}>
            {erro ? <div className="erro">{erro}</div> : null}
            <label className="field">
              <span>E-mail</span>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label className="field">
              <span>Senha</span>
              <input className="input" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
            </label>
            <button className="btn btn-primary" type="submit" disabled={enviando} style={{ width: "100%" }}>
              {enviando ? "Validando..." : "Acessar o sistema"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
