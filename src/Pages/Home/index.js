import MidiasSociais from "../../Imagens/carroussel/sociais.jpeg";
import Poster1 from "../../Imagens/carroussel/cav024.jpg";
import Poster2 from "../../Imagens/carroussel/cav052.jpg";
import MapaSVG2 from "../../Imagens/home/SP_RG_Imediatas_2024.svg";

import SVG from "react-inlinesvg";
import { Container, Row, Col } from "react-bootstrap";
import { destacamentos } from "./infoMaps";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import { useState } from "react";

export default function Home() {
  const [destacamentoSelecionado, setDestacamentoSelecionado] = useState(null);

  return (
    <>
      <section className="bg-dark d-flex justify-content-center align-items-center w-100 h-100">
        <div className="w-100 px-0">
          <div className="row">
            <div className="col-12 px-0">
              <div
                id="carouselExampleIndicators"
                className="carousel slide"
                data-bs-ride="carousel"
              >
                <div className="carousel-inner">
                  <div className="carousel-item active">
                    <div className="shadow-carousel-wrapper rounded-3 overflow-hidden">
                      <img
                        src={Poster1}
                        className="d-block w-100"
                        alt="Carrossel 1"
                        style={{
                          height: "720px",
                          objectFit: "cover",
                          objectPosition: "center",
                        }}
                      />
                    </div>
                  </div>
                  <div className="carousel-item">
                    <img
                      src={Poster2}
                      className="d-block w-100"
                      alt="Carrossel 1"
                      style={{
                        height: "720px",
                        objectFit: "cover",
                        objectPosition: "center",
                      }}
                    />
                  </div>
                  <div className="carousel-item">
                    <img
                      src={MidiasSociais}
                      className="d-block w-100"
                      alt="Carrossel 1"
                      style={{
                        height: "720px",
                        objectFit: "cover",
                        objectPosition: "center",
                      }}
                    />
                  </div>
                </div>
                <button
                  className="carousel-control-prev"
                  type="button"
                  data-bs-target="#carouselExampleIndicators"
                  data-bs-slide="prev"
                >
                  <span
                    className="carousel-control-prev-icon"
                    aria-hidden="true"
                  ></span>
                  <span className="visually-hidden">Previous</span>
                </button>
                <button
                  className="carousel-control-next"
                  type="button"
                  data-bs-target="#carouselExampleIndicators"
                  data-bs-slide="next"
                >
                  <span
                    className="carousel-control-next-icon"
                    aria-hidden="true"
                  ></span>
                  <span className="visually-hidden">Next</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-light w-100">
        <Container fluid className="py-5 px-5">
          <Row className="g-4 justify-content-center">
            <Col xs={12} md={6} lg={3}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Missão</h5>
                  <p className="card-text">
                    Servir com honra, proteger com coragem e atuar com
                    excelência na segurança pública montada.
                  </p>
                </div>
              </div>
            </Col>

            <Col xs={12} md={6} lg={3}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Visão</h5>
                  <p className="card-text">
                    Ser referência nacional em policiamento montado, com foco na
                    disciplina, inovação e proximidade com a comunidade.
                  </p>
                </div>
              </div>
            </Col>

            <Col xs={12} md={6} lg={3}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Valores</h5>
                  <p className="card-text">
                    Ética, lealdade, respeito, comprometimento, coragem e
                    espírito de corpo no cumprimento do dever.
                  </p>
                </div>
              </div>
            </Col>

            <Col xs={12} md={6} lg={3}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">História</h5>
                  <p className="card-text">
                    Fundado há décadas, o Regimento 9 de Julho carrega uma rica
                    tradição na proteção do povo paulista.
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="bg-white py-4">
        <Container>
          <h2 className="text-center mb-4">Nossa Linha do Tempo</h2>
          <div className="timeline-horizontal">
            <div className="timeline-item">
              <div className="timeline-year">1831</div>
              <div className="timeline-content">
                <p>Criação do corpo de Cavalaria.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-year">1892</div>
              <div className="timeline-content">
                <p>Denominação Regimento de Policia Montada "9 de Julho"</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-year">1932</div>
              <div className="timeline-content">
                <p>Revolução Constitucionalista</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-year">1934</div>
              <div className="timeline-content">
                <p>Constituição de 1934</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-year">2024</div>
              <div className="timeline-content">
                <p>Patrimonio historico e cultaral</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-year">2025</div>
              <div className="timeline-content">
                <p>Dias atuais</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-light py-5">
        <Container>
          <h2 className="text-center mb-4">Nossa Estrutura</h2>
          <Row className="text-center">
            <Col xs={12} md={4}>
              <div className="mb-3">
                <i className="bi bi-shield-lock fs-1 text-primary"></i>
              </div>
              <h5>4 Esquadrões</h5>
              <p>
                Unidades de patrulha especializadas em policiamento montado.
              </p>
            </Col>
            <Col xs={12} md={4}>
              <div className="mb-3">
                <i className="bi bi-horse fs-1 text-primary"></i>
              </div>
              <h5>502 Cavalos</h5>
              <p>
                Animais treinados com disciplina e cuidado para operações
                urbanas e rurais.
              </p>
            </Col>
            <Col xs={12} md={4}>
              <div className="mb-3">
                <i className="bi bi-hospital fs-1 text-primary"></i>
              </div>
              <h5>Centro de Equoterapia</h5>
              <p>
                Projeto social de reabilitação e inclusão com uso terapêutico de
                cavalos.
              </p>
            </Col>
          </Row>
        </Container>
      </section>
      {/* mapa regional */}
      {/* Área de atuação - Mapa regional */}
       
    <section className="d-flex bg-white py-5">
      <Container>
        <h2 className="text-center mb-4">Área de atuação</h2>
        <Row className="g-3">
          <Col
            xs={12}
            md={4}
            lg={4}
            sm={6}
            className="text-center p-4 shadow-sm rounded-2 bg-light"
          >
            <div className="mb-3">
              <h5 className="mb-1 fw-bold">Região</h5>
              <p className="mb-0 fs-5 text-dark">
                {destacamentoSelecionado
                  ? destacamentoSelecionado.regiao
                  : "São Paulo"}
              </p>
            </div>
            <div className="mb-3">
              <h5 className="mb-1 fw-bold">Destacamento</h5>
              <p className="mb-0 fs-5 text-dark">
                {destacamentoSelecionado
                  ? destacamentoSelecionado.destacamento
                  : "14"}
              </p>
            </div>
            <div className="mb-3">
              <h5 className="mb-1 fw-bold">Centro de Equoterapia</h5>
              <p className="mb-0 fs-5 text-dark">
                {destacamentoSelecionado
                  ? destacamentoSelecionado.Equoterapia
                  : "10"}
              </p>
            </div>
            <div className="mb-3">
              <h5 className="mb-1 fw-bold">Atendimentos médio semanal</h5>
              <p className="mb-0 fs-5 text-dark">
                {destacamentoSelecionado
                  ? destacamentoSelecionado.atendimento + " pessoas"
                  : "220 pessoas"}
              </p>
            </div>
            <div className="mb-3">
              <h5 className="mb-1 fw-bold">Total de solípedes</h5>
              <p className="mb-0 fs-5 text-dark">
                {destacamentoSelecionado
                  ? destacamentoSelecionado.cavalos
                  : "502"}
              </p>
            </div>
          </Col>
          <Col xs={12} md={8} lg={8} sm={6} className="mapa-wrapper">
            <SVG
              src={MapaSVG2}
              className="mapa-svg"
              preProcessor={(code) =>
                code.replace(/<rect[^>]*fill="(#fff|#ffffff)"[^>]*\/>/gi, "")
              }
              onSVGReady={(svg) => {
                svg.querySelectorAll("path").forEach((pathEl) => {
                  pathEl.classList.add("municipio"); // adiciona classe pra estilizar

                  pathEl.setAttribute("stroke", "#333333");
                  pathEl.setAttribute("stroke-width", "0.5");

                  // Pega id ou data-id
                  const id = pathEl.getAttribute("id") || pathEl.getAttribute("data-id");

                  const dest = destacamentos.find((d) => d.id === id);

                  if (dest) {
                    if (dest.Equoterapia === "Sim") {
                      pathEl.setAttribute("fill", "#4CAF50"); // verde
                    } else {
                      pathEl.setAttribute("fill", "#FFC107"); // amarelo
                    }
                    pathEl.setAttribute("title", dest.destacamento);
                    pathEl.style.cursor = "pointer";

                    pathEl.onclick = () => setDestacamentoSelecionado(dest);
                  } else {
                    pathEl.setAttribute("fill", "#ccc"); // cinza padrão
                    pathEl.style.cursor = "default";
                    pathEl.onclick = null;
                  }
                });
              }}
            />
          </Col>
        </Row>
      </Container>
    </section>

      <section className="bg-light py-5">
        <Container>
          <h2 className="text-center mb-4">Conheça Nossos Projetos</h2>
          <Row className="g-4">
            <Col xs={12} md={4}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Projeto Cavalo Amigo</h5>
                  <p className="card-text">
                    Visitas a escolas e comunidades, promovendo interação com os
                    cavalos e conscientização sobre segurança.
                  </p>
                </div>
              </div>
            </Col>
            <Col xs={12} md={4}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Equoterapia Social</h5>
                  <p className="card-text">
                    Atendimentos gratuitos voltados a crianças com deficiência,
                    com apoio profissional.
                  </p>
                </div>
              </div>
            </Col>
            <Col xs={12} md={4}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Campanhas Solidárias</h5>
                  <p className="card-text">
                    Arrecadações de roupas e alimentos organizadas por policiais
                    e parceiros comunitários.
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
}
