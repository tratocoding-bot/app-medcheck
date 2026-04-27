-- ============================================================
-- PART 3: SEED DATA - Enamed Dates
-- ============================================================

INSERT INTO public.enamed_dates (event_name, event_date, status, is_critical, display_order) VALUES
('Publicação do Edital ENAMED 2026', 'Sem data pública ainda (em breve atualiza)', 'pending', false, 1),
('Abertura das Inscrições (ENAMED/ENARE)', 'Sem data pública ainda (em breve atualiza)', 'pending', true, 2),
('Encerramento das Inscrições', 'Sem data pública ainda (em breve atualiza)', 'pending', false, 3),
('Prazo limite para Pagamento da Taxa', 'Sem data pública ainda (em breve atualiza)', 'pending', false, 4),
('Divulgação dos Locais de Prova', 'Sem data pública ainda (em breve atualiza)', 'pending', false, 5),
('Aplicação da Prova ENAMED 2026', 'Sem data pública ainda (em breve atualiza)', 'waiting', true, 6),
('Divulgação do Gabarito Preliminar', 'Sem data pública ainda (em breve atualiza)', 'pending', false, 7),
('Prazo para Recursos', 'Sem data pública ainda (em breve atualiza)', 'pending', false, 8),
('Resultado Final', 'Sem data pública ainda (em breve atualiza)', 'pending', true, 9);
