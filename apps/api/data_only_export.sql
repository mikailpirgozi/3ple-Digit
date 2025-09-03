--
-- PostgreSQL database dump
--

-- Dumped from database version 14.18 (Homebrew)
-- Dumped by pg_dump version 14.18 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: mikailpirgozi
--

INSERT INTO public.users VALUES ('cmf3wh6420000eqd34zh3in5u', 'admin@3pledigit.com', 'Admin User', '$2b$10$9mfbhzPrkHeWrC0x2xNJ2eRhUqC6YmoHplJiMA2bK9FHhNEwdJaai', 'ADMIN', '2025-09-03 11:34:52.466', '2025-09-03 11:34:52.466');
INSERT INTO public.users VALUES ('inv_andrej', 'andrej.pavlik@example.com', 'Andrej Pavlík', '$2b$10$dummy.hash.for.now', 'INVESTOR', '2025-09-03 13:50:41.705', '2025-09-03 13:50:41.705');
INSERT INTO public.users VALUES ('inv_mikail', 'mikail.pirgozi@example.com', 'Mikail Pirgozi', '$2b$10$dummy.hash.for.now', 'INVESTOR', '2025-09-03 13:50:41.705', '2025-09-03 13:50:41.705');
INSERT INTO public.users VALUES ('inv_vladimir', 'vladimir.duzek@example.com', 'Vladimír Dužek', '$2b$10$dummy.hash.for.now', 'INVESTOR', '2025-09-03 13:50:41.705', '2025-09-03 13:50:41.705');
INSERT INTO public.users VALUES ('inv_marian', 'marian.cingel@example.com', 'Marián Cingel', '$2b$10$dummy.hash.for.now', 'INVESTOR', '2025-09-03 13:50:41.705', '2025-09-03 13:50:41.705');
INSERT INTO public.users VALUES ('inv_richard', 'richard.zimanyi@example.com', 'Richard Zimányi', '$2b$10$dummy.hash.for.now', 'INVESTOR', '2025-09-03 13:50:41.705', '2025-09-03 13:50:41.705');
INSERT INTO public.users VALUES ('inv_roman', 'roman.priecel@example.com', 'Roman Priecel', '$2b$10$dummy.hash.for.now', 'INVESTOR', '2025-09-03 13:50:41.705', '2025-09-03 13:50:41.705');
INSERT INTO public.users VALUES ('inv_patrik', 'patrik.pavlik@example.com', 'Patrik Pavlík', '$2b$10$dummy.hash.for.now', 'INVESTOR', '2025-09-03 13:50:41.705', '2025-09-03 13:50:41.705');
INSERT INTO public.users VALUES ('inv_kamil', 'kamil.zavodsky@example.com', 'Kamil Zavodsky', '$2b$10$dummy.hash.for.now', 'INVESTOR', '2025-09-03 13:50:41.705', '2025-09-03 13:50:41.705');
INSERT INTO public.users VALUES ('inv_steffen', 'steffen.tatge@example.com', 'Steffen Tatge', '$2b$10$dummy.hash.for.now', 'INVESTOR', '2025-09-03 13:50:41.705', '2025-09-03 13:50:41.705');
INSERT INTO public.users VALUES ('inv_jan', 'jan.lajda@example.com', 'Ján Lajda', '$2b$10$dummy.hash.for.now', 'INVESTOR', '2025-09-03 13:50:41.705', '2025-09-03 13:50:41.705');
INSERT INTO public.users VALUES ('inv_stanislava', 'stanislava.zacikova@example.com', 'Stanislava Záčiková', '$2b$10$dummy.hash.for.now', 'INVESTOR', '2025-09-03 13:50:41.705', '2025-09-03 13:50:41.705');
INSERT INTO public.users VALUES ('inv_matus', 'matus.holos@example.com', 'Matúš Hološ', '$2b$10$dummy.hash.for.now', 'INVESTOR', '2025-09-03 13:50:41.705', '2025-09-03 13:50:41.705');
INSERT INTO public.users VALUES ('inv_rezervny', 'rezervny.fond@example.com', 'Rezervný fond', '$2b$10$dummy.hash.for.now', 'INTERNAL', '2025-09-03 13:50:41.705', '2025-09-03 13:50:41.705');


--
-- Data for Name: investors; Type: TABLE DATA; Schema: public; Owner: mikailpirgozi
--

INSERT INTO public.investors VALUES ('investor_andrej', 'inv_andrej', 'Andrej Pavlík', 'andrej.pavlik@example.com', NULL, NULL, NULL, '2025-09-03 13:50:50.289', '2025-09-03 13:50:50.289');
INSERT INTO public.investors VALUES ('investor_mikail', 'inv_mikail', 'Mikail Pirgozi', 'mikail.pirgozi@example.com', NULL, NULL, NULL, '2025-09-03 13:50:50.289', '2025-09-03 13:50:50.289');
INSERT INTO public.investors VALUES ('investor_vladimir', 'inv_vladimir', 'Vladimír Dužek', 'vladimir.duzek@example.com', NULL, NULL, NULL, '2025-09-03 13:50:50.289', '2025-09-03 13:50:50.289');
INSERT INTO public.investors VALUES ('investor_marian', 'inv_marian', 'Marián Cingel', 'marian.cingel@example.com', NULL, NULL, NULL, '2025-09-03 13:50:50.289', '2025-09-03 13:50:50.289');
INSERT INTO public.investors VALUES ('investor_richard', 'inv_richard', 'Richard Zimányi', 'richard.zimanyi@example.com', NULL, NULL, NULL, '2025-09-03 13:50:50.289', '2025-09-03 13:50:50.289');
INSERT INTO public.investors VALUES ('investor_roman', 'inv_roman', 'Roman Priecel', 'roman.priecel@example.com', NULL, NULL, NULL, '2025-09-03 13:50:50.289', '2025-09-03 13:50:50.289');
INSERT INTO public.investors VALUES ('investor_patrik', 'inv_patrik', 'Patrik Pavlík', 'patrik.pavlik@example.com', NULL, NULL, NULL, '2025-09-03 13:50:50.289', '2025-09-03 13:50:50.289');
INSERT INTO public.investors VALUES ('investor_kamil', 'inv_kamil', 'Kamil Zavodsky', 'kamil.zavodsky@example.com', NULL, NULL, NULL, '2025-09-03 13:50:50.289', '2025-09-03 13:50:50.289');
INSERT INTO public.investors VALUES ('investor_steffen', 'inv_steffen', 'Steffen Tatge', 'steffen.tatge@example.com', NULL, NULL, NULL, '2025-09-03 13:50:50.289', '2025-09-03 13:50:50.289');
INSERT INTO public.investors VALUES ('investor_jan', 'inv_jan', 'Ján Lajda', 'jan.lajda@example.com', NULL, NULL, NULL, '2025-09-03 13:50:50.289', '2025-09-03 13:50:50.289');
INSERT INTO public.investors VALUES ('investor_stanislava', 'inv_stanislava', 'Stanislava Záčiková', 'stanislava.zacikova@example.com', NULL, NULL, NULL, '2025-09-03 13:50:50.289', '2025-09-03 13:50:50.289');
INSERT INTO public.investors VALUES ('investor_matus', 'inv_matus', 'Matúš Hološ', 'matus.holos@example.com', NULL, NULL, NULL, '2025-09-03 13:50:50.289', '2025-09-03 13:50:50.289');
INSERT INTO public.investors VALUES ('investor_rezervny', 'inv_rezervny', 'Rezervný fond', 'rezervny.fond@example.com', NULL, NULL, NULL, '2025-09-03 13:50:50.289', '2025-09-03 13:50:50.289');


--
-- Data for Name: investor_cashflows; Type: TABLE DATA; Schema: public; Owner: mikailpirgozi
--

INSERT INTO public.investor_cashflows VALUES ('cf_andrej', 'investor_andrej', 'DEPOSIT', 427657, '2025-06-30 00:00:00', 'Aktuálny kapitál k 30.6.2025', '2025-09-03 13:51:02.241', '2025-09-03 13:51:02.241');
INSERT INTO public.investor_cashflows VALUES ('cf_mikail', 'investor_mikail', 'DEPOSIT', 427657, '2025-06-30 00:00:00', 'Aktuálny kapitál k 30.6.2025', '2025-09-03 13:51:02.241', '2025-09-03 13:51:02.241');
INSERT INTO public.investor_cashflows VALUES ('cf_vladimir', 'investor_vladimir', 'DEPOSIT', 126274, '2025-06-30 00:00:00', 'Aktuálny kapitál k 30.6.2025', '2025-09-03 13:51:02.241', '2025-09-03 13:51:02.241');
INSERT INTO public.investor_cashflows VALUES ('cf_marian', 'investor_marian', 'DEPOSIT', 145724, '2025-06-30 00:00:00', 'Aktuálny kapitál k 30.6.2025', '2025-09-03 13:51:02.241', '2025-09-03 13:51:02.241');
INSERT INTO public.investor_cashflows VALUES ('cf_richard', 'investor_richard', 'DEPOSIT', 70224, '2025-06-30 00:00:00', 'Aktuálny kapitál k 30.6.2025', '2025-09-03 13:51:02.241', '2025-09-03 13:51:02.241');
INSERT INTO public.investor_cashflows VALUES ('cf_roman', 'investor_roman', 'DEPOSIT', 44129, '2025-06-30 00:00:00', 'Aktuálny kapitál k 30.6.2025', '2025-09-03 13:51:02.241', '2025-09-03 13:51:02.241');
INSERT INTO public.investor_cashflows VALUES ('cf_patrik', 'investor_patrik', 'DEPOSIT', 86627, '2025-06-30 00:00:00', 'Aktuálny kapitál k 30.6.2025', '2025-09-03 13:51:02.241', '2025-09-03 13:51:02.241');
INSERT INTO public.investor_cashflows VALUES ('cf_kamil', 'investor_kamil', 'DEPOSIT', 108462, '2025-06-30 00:00:00', 'Aktuálny kapitál k 30.6.2025', '2025-09-03 13:51:02.241', '2025-09-03 13:51:02.241');
INSERT INTO public.investor_cashflows VALUES ('cf_steffen', 'investor_steffen', 'DEPOSIT', 95268, '2025-06-30 00:00:00', 'Aktuálny kapitál k 30.6.2025', '2025-09-03 13:51:02.241', '2025-09-03 13:51:02.241');
INSERT INTO public.investor_cashflows VALUES ('cf_jan', 'investor_jan', 'DEPOSIT', 64515, '2025-06-30 00:00:00', 'Aktuálny kapitál k 30.6.2025', '2025-09-03 13:51:02.241', '2025-09-03 13:51:02.241');
INSERT INTO public.investor_cashflows VALUES ('cf_stanislava', 'investor_stanislava', 'DEPOSIT', 57791, '2025-06-30 00:00:00', 'Aktuálny kapitál k 30.6.2025', '2025-09-03 13:51:02.241', '2025-09-03 13:51:02.241');
INSERT INTO public.investor_cashflows VALUES ('cf_matus', 'investor_matus', 'DEPOSIT', 86687, '2025-06-30 00:00:00', 'Aktuálny kapitál k 30.6.2025', '2025-09-03 13:51:02.241', '2025-09-03 13:51:02.241');
INSERT INTO public.investor_cashflows VALUES ('cf_rezervny', 'investor_rezervny', 'DEPOSIT', 13098, '2025-06-30 00:00:00', 'Aktuálny kapitál k 30.6.2025', '2025-09-03 13:51:02.241', '2025-09-03 13:51:02.241');


--
-- Data for Name: period_snapshots; Type: TABLE DATA; Schema: public; Owner: mikailpirgozi
--

INSERT INTO public.period_snapshots VALUES ('cmf3xk45u0001atko2hsgh2ms', '2025-06-30 00:00:00', 0, 0, 0, 0, NULL, NULL, '2025-09-03 12:05:09.522', '2025-09-03 12:05:09.522');


--
-- Data for Name: investor_snapshots; Type: TABLE DATA; Schema: public; Owner: mikailpirgozi
--

INSERT INTO public.investor_snapshots VALUES ('cmf3xk45w0003atkot8s753n4', 'cmf3xk45u0001atko2hsgh2ms', 'investor_andrej', 427657, 24.38024232190287, NULL, '2025-09-03 12:05:09.524', '2025-09-03 12:05:09.524');
INSERT INTO public.investor_snapshots VALUES ('cmf3xk45x0005atko1pldqx21', 'cmf3xk45u0001atko2hsgh2ms', 'investor_mikail', 427657, 24.38024232190287, NULL, '2025-09-03 12:05:09.525', '2025-09-03 12:05:09.525');
INSERT INTO public.investor_snapshots VALUES ('cmf3xk45y0007atko4t1jasmg', 'cmf3xk45u0001atko2hsgh2ms', 'investor_vladimir', 126274, 7.198738051653457, NULL, '2025-09-03 12:05:09.526', '2025-09-03 12:05:09.526');
INSERT INTO public.investor_snapshots VALUES ('cmf3xk45y0009atkontluul4y', 'cmf3xk45u0001atko2hsgh2ms', 'investor_marian', 145724, 8.307560573349608, NULL, '2025-09-03 12:05:09.527', '2025-09-03 12:05:09.527');
INSERT INTO public.investor_snapshots VALUES ('cmf3xk45z000batkomrr7r0y4', 'cmf3xk45u0001atko2hsgh2ms', 'investor_richard', 70224, 4.0033908875882, NULL, '2025-09-03 12:05:09.527', '2025-09-03 12:05:09.527');
INSERT INTO public.investor_snapshots VALUES ('cmf3xk460000datkonwfgzmco', 'cmf3xk45u0001atko2hsgh2ms', 'investor_roman', 44129, 2.515744424675035, NULL, '2025-09-03 12:05:09.528', '2025-09-03 12:05:09.528');
INSERT INTO public.investor_snapshots VALUES ('cmf3xk460000fatkov2ckxwlg', 'cmf3xk45u0001atko2hsgh2ms', 'investor_patrik', 86627, 4.938507382363621, NULL, '2025-09-03 12:05:09.529', '2025-09-03 12:05:09.529');
INSERT INTO public.investor_snapshots VALUES ('cmf3xk461000hatko79z2txz5', 'cmf3xk45u0001atko2hsgh2ms', 'investor_kamil', 108462, 6.183296059033825, NULL, '2025-09-03 12:05:09.529', '2025-09-03 12:05:09.529');
INSERT INTO public.investor_snapshots VALUES ('cmf3xk461000jatkod2q2nsv7', 'cmf3xk45u0001atko2hsgh2ms', 'investor_steffen', 95268, 5.431121028120765, NULL, '2025-09-03 12:05:09.53', '2025-09-03 12:05:09.53');
INSERT INTO public.investor_snapshots VALUES ('cmf3xk462000latkonadaouiw', 'cmf3xk45u0001atko2hsgh2ms', 'investor_jan', 64515, 3.677927248700626, NULL, '2025-09-03 12:05:09.53', '2025-09-03 12:05:09.53');
INSERT INTO public.investor_snapshots VALUES ('cmf3xk462000natko2hrdyjag', 'cmf3xk45u0001atko2hsgh2ms', 'investor_stanislava', 57791, 3.294599606752815, NULL, '2025-09-03 12:05:09.531', '2025-09-03 12:05:09.531');
INSERT INTO public.investor_snapshots VALUES ('cmf3xk463000patkod2csxte4', 'cmf3xk45u0001atko2hsgh2ms', 'investor_matus', 86687, 4.941927914564228, NULL, '2025-09-03 12:05:09.531', '2025-09-03 12:05:09.531');
INSERT INTO public.investor_snapshots VALUES ('cmf3xk463000ratkor31hmpqz', 'cmf3xk45u0001atko2hsgh2ms', 'investor_rezervny', 13098, 0.7467021793920916, NULL, '2025-09-03 12:05:09.532', '2025-09-03 12:05:09.532');


--
-- PostgreSQL database dump complete
--

