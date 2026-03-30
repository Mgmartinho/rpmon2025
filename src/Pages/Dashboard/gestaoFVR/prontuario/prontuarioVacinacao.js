import { useEffect, useState } from "react";
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

const ProntuarioVacinacao = () => {
    const { numero } = useParams();

    const hoje = new Date().toISOString().split("T")[0];

    // Estados para vacinação
    const [vacinacao, setVacinacao] = useState({
        produto: "",
        partida: "",
        fabricacao: "",
        lote: "",
        dose: "",
        data_inicio: hoje,
        data_validade: "",
        usuario_aplicacao: "",
    });

    const [usuarios, setUsuarios] = useState([]);
    const [carregandoUsuarios, setCarregandoUsuarios] = useState(true);
    const [descricao, setDescricao] = useState("");
    const [dataFim, setDataFim] = useState("");
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        let ativo = true;

        api.listarVeterinarios()
            .then((data) => {
                if (!ativo) return;
                const lista = Array.isArray(data) ? data : [];
                setUsuarios(lista);
                if (lista.length > 0) {
                    setVacinacao((prev) => ({
                        ...prev,
                        usuario_aplicacao: prev.usuario_aplicacao || String(lista[0].id),
                    }));
                }
            })
            .catch(() => {
                if (!ativo) return;
                setUsuarios([]);
            })
            .finally(() => {
                if (ativo) setCarregandoUsuarios(false);
            });

        return () => {
            ativo = false;
        };
    }, []);

    const handleVacinacaoSubmit = async (e) => {
        e.preventDefault();

        if (!numero) {
            alert("Número do solípede não encontrado na rota.");
            return;
        }

        if (!vacinacao.produto || !vacinacao.produto.trim()) {
            alert("Produto (vacina) é obrigatório");
            return;
        }

        if (!vacinacao.usuario_aplicacao) {
            alert("Selecione o responsável pela aplicação.");
            return;
        }

        setSalvando(true);
        const payload = {
            numero_solipede: Number(numero),
            produto: vacinacao.produto?.trim() || "",
            partida: vacinacao.partida?.trim() || null,
            fabricacao: vacinacao.fabricacao || null,
            lote: vacinacao.lote?.trim() || null,
            dose: vacinacao.dose?.trim() || null,
            data_inicio: vacinacao.data_inicio || hoje,
            data_validade: vacinacao.data_validade || null,
            descricao: descricao?.trim() || null,
            data_fim: dataFim || null,
            status_conclusao: "concluido",
            usuario_aplicacao: Number(vacinacao.usuario_aplicacao),
        };

        console.log("=================================");
        console.log("💉 HANDLE VACINACAO SUBMIT");
        console.log("Dados recebidos:");
        console.log(payload);
        console.log("=================================");

        try {
            const resultado = await api.criarProntuarioVacinacao(payload);
            if (resultado?.success || resultado?.id) {
                alert("Vacinação salva com sucesso! ✅");
                setVacinacao({
                    produto: "",
                    partida: "",
                    fabricacao: "",
                    lote: "",
                    dose: "",
                    data_inicio: hoje,
                    data_validade: "",
                    usuario_aplicacao: usuarios[0]?.id ? String(usuarios[0].id) : "",
                });
                setDescricao("");
                setDataFim("");
            } else {
                alert(`Erro ao salvar vacinação: ${resultado?.erro || resultado?.error || "Falha desconhecida"}`);
            }
        } catch (error) {
            console.error("Erro ao enviar vacinação:", error);
            alert("Erro de conexão ao enviar vacinação para a API.");
        } finally {
            setSalvando(false);
        }
    };

    const handleReset = () => {
        setVacinacao({
            produto: "",
            partida: "",
            fabricacao: "",
            lote: "",
            dose: "",
            data_inicio: hoje,
            data_validade: "",
            usuario_aplicacao: usuarios[0]?.id ? String(usuarios[0].id) : "",
        });
        setDescricao("");
        setDataFim("");
    };

    return (
        <div>
            <Card className="shadow-sm border-0">
                <Card.Body>
                    <Form onSubmit={handleVacinacaoSubmit}>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">
                                Vacinação
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
                                            Produto (Vacina) *
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            size="sm"
                                            placeholder="Nome da vacina"
                                            value={vacinacao.produto}
                                            onChange={(e) =>
                                                setVacinacao({
                                                    ...vacinacao,
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
                                            value={vacinacao.partida}
                                            onChange={(e) =>
                                                setVacinacao({
                                                    ...vacinacao,
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
                                            value={vacinacao.fabricacao}
                                            onChange={(e) =>
                                                setVacinacao({
                                                    ...vacinacao,
                                                    fabricacao: e.target.value,
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
                                            value={vacinacao.data_validade}
                                            onChange={(e) =>
                                                setVacinacao({
                                                    ...vacinacao,
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
                                        value={vacinacao.data_inicio}
                                        onChange={(e) =>
                                            setVacinacao({
                                                ...vacinacao,
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
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">
                                        Responsável pela aplicação
                                    </Form.Label>
                                    <Form.Select
                                        value={vacinacao.usuario_aplicacao}
                                        onChange={(e) =>
                                            setVacinacao({
                                                ...vacinacao,
                                                usuario_aplicacao: e.target.value,
                                            })
                                        }
                                        required
                                        disabled={salvando || carregandoUsuarios}
                                    >
                                        <option value="">
                                            {carregandoUsuarios ? "Carregando usuários..." : "Selecione o responsável"}
                                        </option>
                                        {usuarios.map((usuario) => (
                                            <option key={usuario.id} value={usuario.id}>
                                                {usuario.nome}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">
                                        Data Final (Opcional)
                                    </Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={dataFim}
                                        onChange={(e) => setDataFim(e.target.value)}
                                        disabled={salvando}
                                    />
                                    <small className="text-muted">
                                        Data da conclusão do tratamento vacinador.
                                    </small>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">
                                Observações (Opcional)
                            </Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                maxLength={500}
                                placeholder="Observações adicionais sobre a vacinação..."
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                                disabled={salvando}
                            />
                            <small className="text-muted">
                                {descricao.length}/500 caracteres
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

export default ProntuarioVacinacao;