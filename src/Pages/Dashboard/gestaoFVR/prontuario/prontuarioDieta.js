import { useEffect, useState } from "react";
import {
    Col,
    Row,
    Card,
    Form,
    Spinner,
    Button,
} from "react-bootstrap";

import { api } from "../../../../services/api";


const ProntuarioDieta = () => {
    const [loading, setLoading] = useState(true);

    const CarregarDieta = async () => {
        try {
            const response = await api.get("/dieta");
            console.log("Dieta carregada:", response.data);
            // Aqui você pode atualizar o estado com os dados da dieta, se necessário
        } catch (error) {
            console.error("Erro ao carregar a dieta:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        CarregarDieta();
    }, []);


    const data = new Date();
    const dataFormatada = data.toLocaleDateString("pt-BR"); // Formato data Brazileira (DD/MM/YYYY)

    const [dietaSelecionada, setDietaSelecionada] = useState({
        jejum: false,
        meiaRacao: false,
        fenoSoFeno: false,
        fenoSoFenoMolhado: false,
        fenoMolhadoMaisRacao: false
    });

    const [descricao, setDescricao] = useState("");
    const [dataInicio, setDataInicio] = useState("");
    const [dataFim, setDataFim] = useState("");
    const [salvando, setSalvando] = useState(false);


    const handleDietaSubmit = (e) => {
        e.preventDefault();

    }

    if (loading) {
        return (
            <div className="text-center my-5">
                <Spinner animation="border" />
                <p>Carregando...</p>
            </div>
        );
    }

    return (
        <div>

            <Card className="shadow-sm border-0">
                <Card.Header className="bg-light border-0 fw-bold">
                    Adicionar Dieta
                </Card.Header>
                <Card.Body>
                    <Form onSubmit={handleDietaSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">
                                Dieta
                            </Form.Label>
                        </Form.Group>
                        <div className="mt-3 mb-3 p-3 rounded" style={{ backgroundColor: "#f8f9fa", border: "1px solid #dee2e6" }}>
                            <Form.Label className="fw-bold mb-3">🥕 Selecione a(s) opção(ões) de dieta:</Form.Label>
                            <Form.Check
                                type="checkbox"
                                label="Jejum"
                                className="mb-2"
                                checked={dietaSelecionada.jejum}
                                onChange={(e) => setDietaSelecionada({ ...dietaSelecionada, jejum: e.target.checked })}
                            />
                            <Form.Check
                                type="checkbox"
                                label="1/2 ração"
                                className="mb-2"
                                checked={dietaSelecionada.meiaRacao}
                                onChange={(e) => setDietaSelecionada({ ...dietaSelecionada, meiaRacao: e.target.checked })}
                            />
                            <Form.Check
                                type="checkbox"
                                label="Feno (só feno)"
                                className="mb-2"
                                checked={dietaSelecionada.fenoSoFeno}
                                onChange={(e) => setDietaSelecionada({ ...dietaSelecionada, fenoSoFeno: e.target.checked })}
                            />
                            <Form.Check
                                type="checkbox"
                                label="Feno molhado"
                                className="mb-2"
                                checked={dietaSelecionada.fenoSoFenoMolhado}
                                onChange={(e) => setDietaSelecionada({ ...dietaSelecionada, fenoSoFenoMolhado: e.target.checked })}
                            />
                            <Form.Check
                                type="checkbox"
                                label="Feno molhado + Meia ração paga de ração"
                                className="mb-2"
                                checked={dietaSelecionada.fenoMolhadoMaisRacao}
                                onChange={(e) => setDietaSelecionada({ ...dietaSelecionada, fenoMolhadoMaisRacao: e.target.checked })}
                            />
                        </div>
                    </Form>
                </Card.Body>
                <Card.Body>
                    <Row>
                        <Col md={6} xl={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Inicio da Dieta (Opcional)</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={dataInicio}
                                    onChange={(e) => setDataInicio(e.target.value)}
                                />
                                <Form.Text className="text-muted">
                                    Se não informada, o sistema marcará com a data atual.
                                </Form.Text>
                            </Form.Group>
                        </Col>
                        <Col md={6} xl={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Data Final da Dieta (Opcional)</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={dataFim}
                                    onChange={(e) => setDataFim(e.target.value)}
                                />
                                <Form.Text className="text-muted">
                                    Data da finalização da dieta.
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
                <Card.Footer className="bg-light border-0">
                    <Form.Label className="fw-bold">Descrição da Dieta (Opcional)</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={10}
                        aria-label="With textarea"
                        placeholder="Observações adicionais sobre a dieta..."
                        value={descricao}
                        maxLength={500}
                        onChange={(e) => setDescricao(e.target.value)}
                        style={{ resize: "vertical" }} // ou remova completamente
                        disabled={salvando}
                    />
                    <small className="text-muted">
                        {descricao.length}/500 caracteres
                    </small>
                </Card.Footer>

                <div className="d-flex gap-2">
                    <Button
                        variant="success"
                        onClick={handleDietaSubmit}
                        disabled={salvando}
                    >
                        {salvando ? (
                            <>
                                <Spinner
                                    size="sm"
                                    className="me-2"
                                    animation="border"
                                />
                                Salvando...
                            </>
                        ) : (
                            <>💾 Salvar Registro</>
                        )}
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            // Resetar checkboxes de dieta
                            setDietaSelecionada({
                                jejum: false,
                                meiaRacao: false,
                                fenoSoFeno: false,
                                fenoSoFenoMolhado: false,
                                fenoMolhadoMaisRacao: false
                            });

                        }}
                        disabled={salvando}
                    >
                        Limpar
                    </Button>
                </div>
            </Card>

        </div>
    )
}



export default ProntuarioDieta