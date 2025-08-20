import React from "react";
import { Container, Row, Col, Card, ListGroup } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import quartelDaLuz from "../../Imagens/nossaHistoria/historia2.jpg"

const DestaqueTimeline = ({ itens }) => (
  <Card className="shadow-sm mb-4">
    <Card.Header className="fw-bold">Linha do tempo (resumo)</Card.Header>
    <ListGroup variant="flush" className="mini-timeline">
      {itens.map((i, idx) => (
        <ListGroup.Item key={idx} className="mini-timeline-item">
          <div className="dot" />
          <div>
            <div className="fw-semibold">{i.ano}</div>
            <small className="text-muted">{i.evento}</small>
          </div>
        </ListGroup.Item>
      ))}
    </ListGroup>
  </Card>
);

const DestaqueFoto = ({ src, alt, legenda }) => (
  <Card className="shadow-sm mb-4">
    <Card.Img variant="top" src={src} alt={alt} />
    <Card.Body>
      <Card.Text className="text-muted small">{legenda}</Card.Text>
    </Card.Body>
  </Card>
);

const DestaqueCitacao = ({ texto, autor, cargo }) => (
  <Card className="shadow-sm mb-4">
    <Card.Body>
      <blockquote className="blockquote mb-0">
        <p className="lead mb-2">“{texto}”</p>
        <footer className="blockquote-footer">
          {autor} <cite className="text-muted">— {cargo}</cite>
        </footer>
      </blockquote>
    </Card.Body>
  </Card>
);

const nossaHistoria = () => {
  const timelineResumida = [
    { ano: "1831", evento: "Criação do núcleo inicial" },
    { ano: "1892", evento: "Corpo de Cavalaria" },
    { ano: "1906", evento: "Missão Francesa" },
    { ano: "1932", evento: "Revolução Constitucionalista" },
    { ano: "1972", evento: "Tombamento Quartel da Luz" },
  ];

  return (
    <Container className="py-5">
      {/* Estilos locais (somente para este componente) */}
      <style>{`
        .revista h1, .revista h2, .revista h3 { letter-spacing: .2px; }
        .revista p { line-height: 1.85; font-size: 1.05rem; }
        .revista .dropcap::first-letter {
          float: left; font-size: 3rem; line-height: 1; padding-right: .35rem;
          padding-top: .2rem; font-weight: 700;
        }
        /* Sidebar fixa no desktop */
        @media (min-width: 992px) {
          .sidebar-sticky { position: sticky; top: 90px; }
        }
        /* Mini timeline */
        .mini-timeline { position: relative; }
        .mini-timeline-item {
          display: flex; gap: .75rem; align-items: flex-start; position: relative;
          padding-left: .25rem;
        }
        .mini-timeline-item .dot {
          width: 10px; height: 10px; border-radius: 50%; margin-top: .35rem;
          background: #ffc107; flex: 0 0 10px;
          box-shadow: 0 0 0 4px rgba(255,193,7,.2);
        }
      `}</style>

      <Row className="revista">
        {/* TEXTO (artigo corrido) */}
        <Col lg={8} className="mb-4">
          <header className="mb-4">
            <h1 className="mb-2">Nossa História</h1>
            <p className="text-muted">
              Uma narrativa sobre origem, evolução e legado.
            </p>
          </header>

          <article>
            <h3 className="mt-4">Origens (1831–1891)</h3>
            <p className="dropcap">
              Em 1831, nasce o embrião que daria origem a uma tradição de
              disciplina, serviço e pertencimento. Entre improvisos e
              desafios, as primeiras missões moldaram o caráter da tropa e
              aproximaram a instituição da população que jurou proteger.
            </p>
            <p>
              As primeiras décadas consolidaram práticas, símbolos e ofícios.
              Núcleos foram estruturados, rotinas criadas e um vocabulário comum
              passou a definir a cultura de corporação.
            </p>

            <h3 className="mt-5">Afirmação (1892–1931)</h3>
            <p>
              O fim do século XIX e o início do XX marcaram uma fase de
              expansão e organização. A criação do Corpo de Cavalaria elevou o
              padrão operacional, e novos regulamentos trouxeram uniformidade
              e eficiência às atividades diárias.
            </p>

            <h3 className="mt-5">Modernização (1906–1924)</h3>
            <p>
              Com a Missão Francesa, técnicas, doutrina e treinamento foram
              atualizados. A profissionalização saltou de patamar, com ênfase
              em instrução, tática e padronização — legado que ecoa até hoje.
            </p>

            <h3 className="mt-5">Protagonismo cívico (1932)</h3>
            <p>
              Em 1932, a participação em defesa de princípios constitucionais
              colocou a corporação no centro da vida cívica paulista. O
              compromisso com a legalidade e a ordem consolidou um vínculo
              indissolúvel com a história do estado.
            </p>

            <h3 className="mt-5">Patrimônio e memória (1972–Presente)</h3>
            <p>
              O Quartel da Luz, tombado como patrimônio, simboliza a
              continuidade entre passado e presente. A preservação da memória,
              aliada à adoção de tecnologias e práticas contemporâneas, mantém
              viva a tradição enquanto projeta o futuro.
            </p>
          </article>
        </Col>

        {/* SIDEBAR (cards de destaques) */}
        <Col lg={4}>
          <div className="sidebar-sticky">
            <DestaqueTimeline itens={timelineResumida} />

            <DestaqueFoto
              src={quartelDaLuz}
              alt="Quartel histórico"
              legenda="Quartel da Luz — fachada histórica (acervo)."
            />

            <DestaqueCitacao
              texto="A história que honramos é a mesma que nos inspira a servir melhor."
              autor="Cel. J. M. Silva"
              cargo="Comandante (gestão 19XX–19XX)"
            />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default nossaHistoria;
