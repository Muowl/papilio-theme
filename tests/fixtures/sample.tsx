// comentário de linha
import { Botao } from "./botao";

export function Cartao(props: CartaoProps) {
  const rotulo = `Item: ${props.titulo}`;
  return (
    <section className="cartao">
      <Botao onClick={props.enviar}>{rotulo}</Botao>
    </section>
  );
}
