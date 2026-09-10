export default function Brand({ light = false }) {
  return (
    <div className={`brand${light ? " brand-light" : ""}`}>
      <img
        className="brand-logo"
        src="./logo-atendefacil.png"
        alt="AtendeFácil — Sistema de Atendimento"
      />
      <small>Universidade Presbiteriana Mackenzie · Grupo 9</small>
    </div>
  );
}
