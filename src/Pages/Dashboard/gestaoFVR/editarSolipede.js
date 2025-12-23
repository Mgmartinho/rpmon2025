import { useState, useEffect } from "react";
import { Container, Card, Row, Col, Form, Button } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import { api } from "../../../services/api";

const EditarSolipede = () => {
  const { numero } = useParams(); // pega o número do solípede da URL

  const [formData, setFormData] = useState({
    numero: "",
    nome: "",
    DataNascimento: "",
    sexo: "",
    pelagem: "",
    movimentacao: "",
    alocacao: "",
    restricoes: "",
    esquadrao: "",
    status: "",
    origem: "",
  });

  // busca os dados do solípede ao carregar a página
  useEffect(() => {
    const fetchSolipede = async () => {
      try {
        const data = await api.obterSolipede(numero);

        if (data.error) throw new Error(data.error);

        // 🔽 CONVERSÃO DA DATA PARA YYYY-MM-DD
        const dataFormatada = {
          ...data,
          DataNascimento: data.DataNascimento
            ? data.DataNascimento.split("T")[0]
            : "",
        };

        setFormData(dataFormatada);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar dados do solípede");
      }
    };

    fetchSolipede();
  }, [numero]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.atualizarSolipede(numero, formData);

      if (response.error) throw new Error(response.error);

      alert("Solípede atualizado com sucesso!");
      window.location.href = "/dashboard/gestaofvr";
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar dados");
    }
  };

  return (
    <Container fluid className="d-flex justify-content-center py-4">
      <div className="w-75">
        <Card className="shadow-sm">
          <Card.Body>
            {/* HEADER */}
            <h4 className="mb-3">Editar Solípede</h4>
            <small className="text-muted">
              Atualize os dados veterinários e operacionais
            </small>
            <hr />

            {/* FORM */}
            <Form onSubmit={handleSubmit}>
              {/* LINHA 1 */}
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>Número *</Form.Label>
                  <Form.Control
                    type="number"
                    name="numero"
                    value={formData.numero}
                    onChange={handleChange}
                    placeholder="Número da paleta"
                    required
                    disabled // geralmente não alteramos o número primário
                  />
                </Col>

                <Col md={6}>
                  <Form.Label>Nome *</Form.Label>
                  <Form.Control
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Digite o nome do solípede"
                    required
                  />
                </Col>
              </Row>

              {/* LINHA 2 */}
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>Data de Nascimento *</Form.Label>
                  <Form.Control
                    type="date"
                    name="DataNascimento"
                    value={formData.DataNascimento}
                    onChange={handleChange}
                    required
                  />
                </Col>

                <Col md={6}>
                  <Form.Label>Sexo *</Form.Label>
                  <Form.Select
                    name="sexo"
                    value={formData.sexo}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="Fêmea">Fêmea</option>
                    <option value="Macho castrado">Macho castrado</option>
                    <option value="Garanhão">Garanhão</option>
                    <option value="Criptorquida">Criptorquida</option>
                  </Form.Select>
                </Col>
              </Row>

              {/* LINHA 3 */}
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>Pelagem</Form.Label>
                  <Form.Select
                    name="pelagem"
                    value={formData.pelagem}
                    onChange={handleChange}
                  >
                    <option value="">Selecione</option>
                    <option value="Alazã">Alazã</option>
                    <option value="Baia">Baia</option>
                    <option value="Castanha">Castanha</option>
                    <option value="Isabel">Isabel</option>
                    <option value="Preta">Preta</option>
                    <option value="Rosilha">Rosilha</option>
                    <option value="Tordilha">Tordilha</option>
                    <option value="Lobuna">Lobuna</option>
                  </Form.Select>
                </Col>

                <Col md={6}>
                  <Form.Label>Origem *</Form.Label>
                  <Form.Select
                    name="origem"
                    value={formData.origem}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="Doação">Doação</option>
                    <option value="Remonta">Remonta</option>
                    <option value="Colina">Colina</option>
                    <option value="PMESP">PMESP</option>
                    <option value="Pirassununga">Pirassununga</option>
                  </Form.Select>
                </Col>
              </Row>

              {/* LINHA 4 */}
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>Alocação</Form.Label>
                  <Form.Select
                    name="alocacao"
                    value={formData.alocacao || ""}
                    onChange={handleChange}
                  >
                    <option value="">Selecione</option>
                    <option value=""></option>
                    <option value="RPMon">RPMon</option>
                    <option value="Barro Branco">Barro Branco</option>
                    <option value="Avaré">Avaré</option>
                    <option value="Bauru">Bauru</option>
                    <option value="Campinas">Campinas</option>
                    <option value="Taubaté">Taubaté</option>
                    <option value="Colina">Colina</option>
                    <option value="Itapetininga">Itapetininga</option>
                    <option value="Marília">Marília</option>
                    <option value="Mauá">Mauá</option>
                    <option value="Presidente Prudente">P. Prudente</option>
                    <option value="Hospital Veterinário">Hosp Vet</option>
                    <option value="Ribeirão Preto">Ribeirão Preto</option>
                    <option value="Rio de Janeiro">Rio de Janeiro</option>
                    <option value="Santos">Santos</option>
                    <option value="São Bernardo do Campo">São Bernardo</option>
                    <option value="Sorocaba">Sorocaba</option>
                    <option value="São José do Rio Preto">São José do Rio Preto</option>
                    <option value="Barretos">Barretos</option>
                  </Form.Select>
                </Col>


                <Col md={6}>
                  <Form.Label>Esquadrão </Form.Label>
                  <Form.Select
                    name="esquadrao"
                    value={formData.esquadrao}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="1 Esquadrao">1º Esquadrão</option>
                    <option value="2 Esquadrao">2º Esquadrão</option>
                    <option value="3 Esquadrao">3º Esquadrão</option>
                    <option value="4 Esquadrao">4º Esquadrão</option>
                    <option value="Equoterapia">Equoterapia</option>
                    <option value="Representacao">Representação</option>
                  </Form.Select>
                </Col>

                <Col md={6}>
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="">Selecione</option>
                    <option value="Ativo">Ativo</option>
                    <option value="Baixado">Baixado</option>
                  </Form.Select>
                </Col>
              </Row>

              {/* LINHA 5 */}
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>Movimentação</Form.Label>
                  <Form.Select
                    name="movimentacao"
                    value={formData.movimentacao}
                    onChange={handleChange}
                  >
                    <option value="">Selecione</option>
                    <option value=""> </option>
                    <option value="RPMon">RPMon</option>
                    <option value="Barro Branco">Barro Branco</option>
                    <option value="Hospital Veterinario">
                      Hospital Veterinário
                    </option>
                    <option value="Avare">Avaré</option>
                    <option value="Barretos">Barretos</option>
                    <option value="Bauru">Bauru</option>
                    <option value="Campinas">Campinas</option>
                    <option value="Colina">Colina</option>
                    <option value="Escola Equitacao Exercito">
                      Escola de Equitação do Exército
                    </option>
                    <option value="Itapetininga">Itapetininga</option>
                    <option value="Marilia">Marília</option>
                    <option value="Maua">Mauá</option>
                    <option value="Presidente Prudente">
                      Presidente Prudente
                    </option>
                    <option value="Ribeirao Preto">Ribeirão Preto</option>
                    <option value="Santos">Santos</option>
                    <option value="Sao Bernardo do Campo">
                      São Bernardo do Campo
                    </option>
                    <option value="Sao Jose do Rio Preto">
                      São José do Rio Preto
                    </option>
                    <option value="Sorocaba">Sorocaba</option>
                    <option value="Taubate">Taubaté</option>
                    <option value="Representacao">Representação</option>
                  </Form.Select>
                </Col>

                <Col md={6}>
                  <Form.Label>Restrições</Form.Label>
                  <Form.Control
                    name="restricoes"
                    value={formData.restricoes}
                    onChange={handleChange}
                  />
                </Col>
              </Row>

              {/* AÇÕES */}
              <div className="d-flex justify-content-end gap-2 mt-4">
                <Link to="/dashboard/gestaofvr">
                  <Button variant="outline-secondary">
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" variant="primary">
                  Salvar Alterações
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default EditarSolipede;
