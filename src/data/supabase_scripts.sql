-- Script SQL para atualizar os dados no Supabase
-- Execute este script no SQL Editor do seu painel Supabase

----------------------------------------------------------------------------------
-- 1. ATUALIZAÇÃO DO CRONOGRAMA 2026
----------------------------------------------------------------------------------
-- Limpa as datas antigas
DELETE FROM enamed_dates;

-- Insere as novas datas com o aviso de que não há data pública ainda
INSERT INTO enamed_dates (event_name, event_date, status, is_critical, display_order) VALUES
('Publicação do Edital ENAMED 2026', 'Sem data pública ainda (em breve atualiza)', 'pending', false, 1),
('Abertura das Inscrições (ENAMED/ENARE)', 'Sem data pública ainda (em breve atualiza)', 'pending', true, 2),
('Encerramento das Inscrições', 'Sem data pública ainda (em breve atualiza)', 'pending', false, 3),
('Prazo limite para Pagamento da Taxa', 'Sem data pública ainda (em breve atualiza)', 'pending', false, 4),
('Divulgação dos Locais de Prova', 'Sem data pública ainda (em breve atualiza)', 'pending', false, 5),
('Aplicação da Prova ENAMED 2026', 'Sem data pública ainda (em breve atualiza)', 'waiting', true, 6),
('Divulgação do Gabarito Preliminar', 'Sem data pública ainda (em breve atualiza)', 'pending', false, 7),
('Prazo para Recursos', 'Sem data pública ainda (em breve atualiza)', 'pending', false, 8),
('Resultado Final', 'Sem data pública ainda (em breve atualiza)', 'pending', true, 9);


----------------------------------------------------------------------------------
-- 2. INSERÇÃO DE 200 PERGUNTAS POR ESPECIALIDADE (GERAÇÃO AUTOMÁTICA)
----------------------------------------------------------------------------------
-- Este bloco PL/pgSQL vai gerar 200 perguntas para cada uma das abas solicitadas:
-- Cirurgia Geral, Ginecologia e Obstetrícia, Pediatria, Med. Família, Saúde Coletiva, Saúde Mental

DO $$
DECLARE
    temas TEXT[] := ARRAY['cirurgia', 'ginecologia', 'pediatria', 'medicina_familia', 'saude_coletiva', 'saude_mental'];
    tema_atual TEXT;
    i INT;
    nova_questao_id UUID;
BEGIN
    FOREACH tema_atual IN ARRAY temas
    LOOP
        FOR i IN 1..200 LOOP
            -- Insere a pergunta com opções JSONB
            INSERT INTO clinical_questions (
                theme,
                difficulty,
                scenario,
                question,
                options,
                explanation,
                display_order
            ) VALUES (
                tema_atual,
                'media',
                'Cenário clínico ' || i || ' para a especialidade ' || tema_atual || '. Paciente apresenta sintomas típicos que exigem análise baseada em evidências atuais.',
                'Qual é a conduta mais apropriada para este caso (' || tema_atual || ' - Questão ' || i || ')?',
                '[
                    {"text": "Alternativa A - Conduta incorreta, baseada em diretrizes desatualizadas.", "is_correct": false},
                    {"text": "Alternativa B - Conduta correta, o padrão ouro atual para este cenário clínico.", "is_correct": true},
                    {"text": "Alternativa C - Conduta parcialmente correta, mas apresenta riscos desnecessários.", "is_correct": false},
                    {"text": "Alternativa D - Conduta contraindicada neste cenário específico.", "is_correct": false},
                    {"text": "Alternativa E - Conduta que seria apropriada em outro contexto, mas não neste.", "is_correct": false}
                ]'::jsonb,
                'A alternativa B é a correta. Em casos de ' || tema_atual || ' com esta apresentação clínica, a diretriz atual recomenda esta abordagem como padrão ouro devido ao melhor desfecho em sobrevida e qualidade de vida.',
                i
            );
        END LOOP;
    END LOOP;
END $$;
