import { useState } from "react";
import {
    Col,
    Row,
    Card,
    Form,
    Button,
    Spinner,
} from "react-bootstrap";
import { useParams } from "react-router-dom";

import { api } from "../../../../services/api";
import { buildUserErrorMessage } from "../../../../utils/errorHandling";


const ProntuarioSuplementacao = () => {
    const { numero } = useParams();

    // Estados para suplementação (quando tipoObservacao === "Suplementação")
    const [suplementacao, setSuplementacao] = useState({
        produto: "",
        dose: "",
        frequencia: "",
        data_inicio: "",
        data_validade: "",
    });

    const [descricao, setDescricao] = useState("");
    const [dataFim, setDataFim] = useState("");
    const [salvando, setSalvando] = useState(false);


    const handleSuplementacaoSubmit = async (e) => {
        e.preventDefault();

        setSalvando(true);
        window.location.reload();
        if (!numero) {
            alert("Número do solípede não encontrado na rota.");
            setSalvando(false);
            return;
        }

        const payload = {
            numero_solipede: Number(numero),
            produto: suplementacao.produto?.trim() || "",
            dose: suplementacao.dose?.trim() || "",
            frequencia: suplementacao.frequencia?.trim() || "",
            descricao: descricao?.trim() || null,
            data_fim: dataFim || null,
        };

        try {
            const resultado = await api.criarProntuarioSuplementacao(payload);
            if (resultado?.success || resultado?.id) {
                alert("Suplementação salva com sucesso! ✅");
                setSuplementacao({
                    produto: "",
                    dose: "",
                    frequencia: "",
                    data_inicio: "",
                    data_validade: "",
                });
                setDescricao("");
                setDataFim("");
            } else {
                alert(
                    buildUserErrorMessage(
                        "Falha ao salvar suplementação",
                        resultado,
                        "A API rejeitou o lançamento de suplementação"
                    )
                );
            }
        } catch (error) {
            console.error("Erro ao enviar suplementação:", error);
            alert(
                buildUserErrorMessage(
                    "Erro ao enviar suplementação",
                    error,
                    "Falha na comunicação durante o envio da suplementação"
                )
            );
        } finally {
            setSalvando(false);
        }

    }

    return (
        <div>

            <Card className="shadow-sm border-0">
                <Card.Body>
                    <Form id="form-prontuario-suplementacao" onSubmit={handleSuplementacaoSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">
                                Suplementação 
                            </Form.Label>
                        </Form.Group>
                        <div className="mt-3 mb-3 p-3 rounded" style={{ backgroundColor: "#f8f9fa", border: "1px solid #dee2e6" }}>
                            <Row>
                                <Col md={4} xl={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold">Produto *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            size="sm"
                                            placeholder="Nome do produto/suplemento"
                                            value={suplementacao.produto}
                                            onChange={(e) => setSuplementacao({ ...suplementacao, produto: e.target.value })}
                                            disabled={salvando}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4} xl={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold">Dose *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            size="sm"
                                            placeholder="Dose do suplemento"
                                            value={suplementacao.dose}
                                            onChange={(e) => setSuplementacao({ ...suplementacao, dose: e.target.value })}
                                            disabled={salvando}
                                        />
                                    </Form.Group>
                                </Col>
                                <Row>
                                    <Col md={4} xl={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Frequência *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                size="sm"
                                                placeholder="Frequência do suplemento"
                                                value={suplementacao.frequencia}
                                                onChange={(e) => setSuplementacao({ ...suplementacao, frequencia: e.target.value })}
                                                disabled={salvando}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Row>


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
                                    value={suplementacao.data_inicio || ""}
                                    onChange={(e) => setSuplementacao({ ...suplementacao, data_inicio: e.target.value })}
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
                    <Form.Label className="fw-bold">Observações da suplementação(Opcional)</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={10}
                        aria-label="With textarea"
                        placeholder="Observações adicionais sobre a suplementação..."
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
                        type="submit"
                        form="form-prontuario-suplementacao"
                        variant="success"
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
                        type="button"
                        variant="secondary"
                        onClick={() => {
                            // Resetar campos de suplementação
                            setSuplementacao({
                                produto: "",
                                dose: "",
                                frequencia: "",
                                data_validade: "",
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



export default ProntuarioSuplementacao