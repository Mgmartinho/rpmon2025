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

const ProntuarioVermifugacao = () => {
    const { numero } = useParams();

    const hoje = new Date().toISOString().split("T")[0];

    const [vermifugacao, setVermifugacao] = useState({
        produto: "",
        partida: "",
        fabricacao: "",
        data_inicio: hoje,
        data_fabricacao: "",
        data_validade: "",
        descricao: "",
        status_conclusao: "concluido",
    });
    const [salvando, setSalvando] = useState(false);

    const handleVermifugacaoSubmit = async (e) => {
        e.preventDefault();

        if (!numero) {
            alert("Número do solípede não encontrado na rota.");
            return;
        }

        if (!vermifugacao.produto || !vermifugacao.produto.trim()) {
            alert("Produto (vermífugo) é obrigatório");
            return;
        }

        setSalvando(true);
        const payload = {
            numero_solipede: Number(numero),
            produto: vermifugacao.produto?.trim() || "",
            partida: vermifugacao.partida?.trim() || null,
            fabricacao: vermifugacao.fabricacao || null,
            data_inicio: vermifugacao.data_inicio || hoje,
            data_fabricacao: vermifugacao.data_fabricacao || null,
            data_validade: vermifugacao.data_validade || null,
            descricao: vermifugacao.descricao?.trim() || null,
            status_conclusao: "concluido",
        };

        console.log("=================================");
        console.log("💊 HANDLE VERMIFUGACAO SUBMIT");
        console.log("Dados recebidos:");
        console.log(payload);
        console.log("=================================");

        try {
            const resultado = await api.criarProntuarioVermifugacao(payload);
            if (resultado?.success || resultado?.id) {
                alert("Vermifugação salva com sucesso! ✅");
                setVermifugacao({
                    produto: "",
                    partida: "",
                    fabricacao: "",
                    data_inicio: hoje,
                    data_fabricacao: "",
                    data_validade: "",
                    descricao: "",
                    status_conclusao: "concluido",
                });
                window.location.reload();
            } else {
                alert(`Erro ao salvar vermifugação: ${resultado?.erro || resultado?.error || "Falha desconhecida"}`);
            }
        } catch (error) {
            console.error("Erro ao enviar vermifugação:", error);
            alert("Erro de conexão ao enviar vermifugação para a API.");
        } finally {
            setSalvando(false);
        }
    };

    const handleReset = () => {
        setVermifugacao({
            produto: "",
            partida: "",
            fabricacao: "",
            data_inicio: hoje,
            data_fabricacao: "",
            data_validade: "",
            descricao: "",
            status_conclusao: "concluido",
        });
    };

    return (
        <div>
            <Card className="shadow-sm border-0">
                <Card.Body>
                    <Form onSubmit={handleVermifugacaoSubmit}>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">
                                Vermifugação
                            </Form.Label>
                        </Form.Group>

                        <div
                            className="mt-3 mb-3 p-3 rounded"
                            style={{
                                backgroundColor: "#f8f9fa",
                                border: "1px solid #dee2e6",
                            }}
                        >
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold">
                                            Produto (Vermífugo) *
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            size="sm"
                                            placeholder="Nome do vermífugo utilizado"
                                            value={vermifugacao.produto}
                                            onChange={(e) =>
                                                setVermifugacao({
                                                    ...vermifugacao,
                                                    produto: e.target.value,
                                                })
                                            }
                                            disabled={salvando}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold">
                                            Partida
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            size="sm"
                                            placeholder="Número da partida"
                                            value={vermifugacao.partida}
                                            onChange={(e) =>
                                                setVermifugacao({
                                                    ...vermifugacao,
                                                    partida: e.target.value,
                                                })
                                            }
                                            disabled={salvando}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold">
                                           Data de Fabricação 
                                        </Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={vermifugacao.data_fabricacao}
                                            onChange={(e) =>
                                                setVermifugacao({
                                                    ...vermifugacao,
                                                    data_fabricacao: e.target.value,
                                                })
                                            }
                                            disabled={salvando}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold">
                                            Data de Validade
                                        </Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={vermifugacao.data_validade}
                                            onChange={(e) =>
                                                setVermifugacao({
                                                    ...vermifugacao,
                                                    data_validade: e.target.value,
                                                })
                                            }
                                            disabled={salvando}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                        </div>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">
                                        Data de Aplicação
                                    </Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={vermifugacao.data_inicio}
                                        onChange={(e) =>
                                            setVermifugacao({
                                                ...vermifugacao,
                                                data_inicio: e.target.value,
                                            })
                                        }
                                        disabled={salvando}
                                    />
                                    <small className="text-muted">
                                        Se não for selecionada, a data atual será usada.
                                    </small>
                                </Form.Group>
                            </Col>
                            <Col md={6}></Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">
                                Observações (Opcional)
                            </Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                maxLength={500}
                                placeholder="Observações adicionais sobre a vermifugação..."
                                value={vermifugacao.descricao}
                                onChange={(e) =>
                                    setVermifugacao({
                                        ...vermifugacao,
                                        descricao: e.target.value,
                                    })
                                }
                                disabled={salvando}
                            />
                            <small className="text-muted">
                                {vermifugacao.descricao.length}/500 caracteres
                            </small>
                        </Form.Group>

                        <div className="d-flex gap-2">
                            <Button
                                type="submit"
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
                                onClick={handleReset}
                                disabled={salvando}
                            >
                                Limpar
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default ProntuarioVermifugacao;