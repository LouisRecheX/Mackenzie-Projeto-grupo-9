import { rotuloPrioridade, rotuloStatus } from "../lib/format";

export function StatusBadge({ status }) {
  return <span className={`badge st-${status}`}>{rotuloStatus(status)}</span>;
}

export function PriorityBadge({ prioridade }) {
  return <span className={`badge pr-${prioridade}`}>{rotuloPrioridade(prioridade)}</span>;
}
