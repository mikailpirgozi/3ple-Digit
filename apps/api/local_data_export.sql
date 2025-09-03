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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: mikailpirgozi
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO mikailpirgozi;

--
-- Name: asset_events; Type: TABLE; Schema: public; Owner: mikailpirgozi
--

CREATE TABLE public.asset_events (
    id text NOT NULL,
    "assetId" text NOT NULL,
    type text NOT NULL,
    amount double precision NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.asset_events OWNER TO mikailpirgozi;

--
-- Name: assets; Type: TABLE; Schema: public; Owner: mikailpirgozi
--

CREATE TABLE public.assets (
    id text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    description text,
    "currentValue" double precision NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "acquiredPrice" double precision,
    "salePrice" double precision,
    "saleDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.assets OWNER TO mikailpirgozi;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: mikailpirgozi
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    "userId" text,
    action text NOT NULL,
    entity text NOT NULL,
    "entityId" text NOT NULL,
    "oldData" text,
    "newData" text,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO mikailpirgozi;

--
-- Name: bank_balances; Type: TABLE; Schema: public; Owner: mikailpirgozi
--

CREATE TABLE public.bank_balances (
    id text NOT NULL,
    "accountName" text NOT NULL,
    "bankName" text,
    "accountType" text,
    amount double precision NOT NULL,
    currency text DEFAULT 'EUR'::text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.bank_balances OWNER TO mikailpirgozi;

--
-- Name: documents; Type: TABLE; Schema: public; Owner: mikailpirgozi
--

CREATE TABLE public.documents (
    id text NOT NULL,
    name text NOT NULL,
    "originalName" text NOT NULL,
    "r2Key" text NOT NULL,
    "mimeType" text NOT NULL,
    size integer NOT NULL,
    sha256 text,
    category text,
    description text,
    "uploadedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.documents OWNER TO mikailpirgozi;

--
-- Name: investor_cashflows; Type: TABLE; Schema: public; Owner: mikailpirgozi
--

CREATE TABLE public.investor_cashflows (
    id text NOT NULL,
    "investorId" text NOT NULL,
    type text NOT NULL,
    amount double precision NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.investor_cashflows OWNER TO mikailpirgozi;

--
-- Name: investor_snapshots; Type: TABLE; Schema: public; Owner: mikailpirgozi
--

CREATE TABLE public.investor_snapshots (
    id text NOT NULL,
    "snapshotId" text NOT NULL,
    "investorId" text NOT NULL,
    "capitalAmount" double precision NOT NULL,
    "ownershipPercent" double precision NOT NULL,
    "performanceFee" double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.investor_snapshots OWNER TO mikailpirgozi;

--
-- Name: investors; Type: TABLE; Schema: public; Owner: mikailpirgozi
--

CREATE TABLE public.investors (
    id text NOT NULL,
    "userId" text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    address text,
    "taxId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.investors OWNER TO mikailpirgozi;

--
-- Name: liabilities; Type: TABLE; Schema: public; Owner: mikailpirgozi
--

CREATE TABLE public.liabilities (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "currentBalance" double precision NOT NULL,
    "interestRate" double precision,
    "maturityDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.liabilities OWNER TO mikailpirgozi;

--
-- Name: period_snapshots; Type: TABLE; Schema: public; Owner: mikailpirgozi
--

CREATE TABLE public.period_snapshots (
    id text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "totalAssetValue" double precision NOT NULL,
    "totalBankBalance" double precision NOT NULL,
    "totalLiabilities" double precision NOT NULL,
    nav double precision NOT NULL,
    "performanceFeeRate" double precision,
    "totalPerformanceFee" double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.period_snapshots OWNER TO mikailpirgozi;

--
-- Name: users; Type: TABLE; Schema: public; Owner: mikailpirgozi
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    password text NOT NULL,
    role text DEFAULT 'INVESTOR'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO mikailpirgozi;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: mikailpirgozi
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
b7b78a94-97dd-4fc5-82be-21e7a9e1249d	85ee71b94ee9eb15f05573034fc975e1f530364370876b7a0f55449db62950c1	2025-09-03 13:34:45.971364+02	20250903113445_firma_migrate	\N	\N	2025-09-03 13:34:45.944962+02	1
\.


--
-- Data for Name: asset_events; Type: TABLE DATA; Schema: public; Owner: mikailpirgozi
--

COPY public.asset_events (id, "assetId", type, amount, date, note, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: assets; Type: TABLE DATA; Schema: public; Owner: mikailpirgozi
--

COPY public.assets (id, name, type, description, "currentValue", status, "acquiredPrice", "salePrice", "saleDate", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: mikailpirgozi
--

COPY public.audit_logs (id, "userId", action, entity, "entityId", "oldData", "newData", "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: bank_balances; Type: TABLE DATA; Schema: public; Owner: mikailpirgozi
--

COPY public.bank_balances (id, "accountName", "bankName", "accountType", amount, currency, date, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: mikailpirgozi
--

COPY public.documents (id, name, "originalName", "r2Key", "mimeType", size, sha256, category, description, "uploadedBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: investor_cashflows; Type: TABLE DATA; Schema: public; Owner: mikailpirgozi
--

COPY public.investor_cashflows (id, "investorId", type, amount, date, note, "createdAt", "updatedAt") FROM stdin;
cf_andrej	investor_andrej	DEPOSIT	427657	2025-06-30 00:00:00	Aktuálny kapitál k 30.6.2025	2025-09-03 13:51:02.241	2025-09-03 13:51:02.241
cf_mikail	investor_mikail	DEPOSIT	427657	2025-06-30 00:00:00	Aktuálny kapitál k 30.6.2025	2025-09-03 13:51:02.241	2025-09-03 13:51:02.241
cf_vladimir	investor_vladimir	DEPOSIT	126274	2025-06-30 00:00:00	Aktuálny kapitál k 30.6.2025	2025-09-03 13:51:02.241	2025-09-03 13:51:02.241
cf_marian	investor_marian	DEPOSIT	145724	2025-06-30 00:00:00	Aktuálny kapitál k 30.6.2025	2025-09-03 13:51:02.241	2025-09-03 13:51:02.241
cf_richard	investor_richard	DEPOSIT	70224	2025-06-30 00:00:00	Aktuálny kapitál k 30.6.2025	2025-09-03 13:51:02.241	2025-09-03 13:51:02.241
cf_roman	investor_roman	DEPOSIT	44129	2025-06-30 00:00:00	Aktuálny kapitál k 30.6.2025	2025-09-03 13:51:02.241	2025-09-03 13:51:02.241
cf_patrik	investor_patrik	DEPOSIT	86627	2025-06-30 00:00:00	Aktuálny kapitál k 30.6.2025	2025-09-03 13:51:02.241	2025-09-03 13:51:02.241
cf_kamil	investor_kamil	DEPOSIT	108462	2025-06-30 00:00:00	Aktuálny kapitál k 30.6.2025	2025-09-03 13:51:02.241	2025-09-03 13:51:02.241
cf_steffen	investor_steffen	DEPOSIT	95268	2025-06-30 00:00:00	Aktuálny kapitál k 30.6.2025	2025-09-03 13:51:02.241	2025-09-03 13:51:02.241
cf_jan	investor_jan	DEPOSIT	64515	2025-06-30 00:00:00	Aktuálny kapitál k 30.6.2025	2025-09-03 13:51:02.241	2025-09-03 13:51:02.241
cf_stanislava	investor_stanislava	DEPOSIT	57791	2025-06-30 00:00:00	Aktuálny kapitál k 30.6.2025	2025-09-03 13:51:02.241	2025-09-03 13:51:02.241
cf_matus	investor_matus	DEPOSIT	86687	2025-06-30 00:00:00	Aktuálny kapitál k 30.6.2025	2025-09-03 13:51:02.241	2025-09-03 13:51:02.241
cf_rezervny	investor_rezervny	DEPOSIT	13098	2025-06-30 00:00:00	Aktuálny kapitál k 30.6.2025	2025-09-03 13:51:02.241	2025-09-03 13:51:02.241
\.


--
-- Data for Name: investor_snapshots; Type: TABLE DATA; Schema: public; Owner: mikailpirgozi
--

COPY public.investor_snapshots (id, "snapshotId", "investorId", "capitalAmount", "ownershipPercent", "performanceFee", "createdAt", "updatedAt") FROM stdin;
cmf3xk45w0003atkot8s753n4	cmf3xk45u0001atko2hsgh2ms	investor_andrej	427657	24.38024232190287	\N	2025-09-03 12:05:09.524	2025-09-03 12:05:09.524
cmf3xk45x0005atko1pldqx21	cmf3xk45u0001atko2hsgh2ms	investor_mikail	427657	24.38024232190287	\N	2025-09-03 12:05:09.525	2025-09-03 12:05:09.525
cmf3xk45y0007atko4t1jasmg	cmf3xk45u0001atko2hsgh2ms	investor_vladimir	126274	7.198738051653457	\N	2025-09-03 12:05:09.526	2025-09-03 12:05:09.526
cmf3xk45y0009atkontluul4y	cmf3xk45u0001atko2hsgh2ms	investor_marian	145724	8.307560573349608	\N	2025-09-03 12:05:09.527	2025-09-03 12:05:09.527
cmf3xk45z000batkomrr7r0y4	cmf3xk45u0001atko2hsgh2ms	investor_richard	70224	4.0033908875882	\N	2025-09-03 12:05:09.527	2025-09-03 12:05:09.527
cmf3xk460000datkonwfgzmco	cmf3xk45u0001atko2hsgh2ms	investor_roman	44129	2.515744424675035	\N	2025-09-03 12:05:09.528	2025-09-03 12:05:09.528
cmf3xk460000fatkov2ckxwlg	cmf3xk45u0001atko2hsgh2ms	investor_patrik	86627	4.938507382363621	\N	2025-09-03 12:05:09.529	2025-09-03 12:05:09.529
cmf3xk461000hatko79z2txz5	cmf3xk45u0001atko2hsgh2ms	investor_kamil	108462	6.183296059033825	\N	2025-09-03 12:05:09.529	2025-09-03 12:05:09.529
cmf3xk461000jatkod2q2nsv7	cmf3xk45u0001atko2hsgh2ms	investor_steffen	95268	5.431121028120765	\N	2025-09-03 12:05:09.53	2025-09-03 12:05:09.53
cmf3xk462000latkonadaouiw	cmf3xk45u0001atko2hsgh2ms	investor_jan	64515	3.677927248700626	\N	2025-09-03 12:05:09.53	2025-09-03 12:05:09.53
cmf3xk462000natko2hrdyjag	cmf3xk45u0001atko2hsgh2ms	investor_stanislava	57791	3.294599606752815	\N	2025-09-03 12:05:09.531	2025-09-03 12:05:09.531
cmf3xk463000patkod2csxte4	cmf3xk45u0001atko2hsgh2ms	investor_matus	86687	4.941927914564228	\N	2025-09-03 12:05:09.531	2025-09-03 12:05:09.531
cmf3xk463000ratkor31hmpqz	cmf3xk45u0001atko2hsgh2ms	investor_rezervny	13098	0.7467021793920916	\N	2025-09-03 12:05:09.532	2025-09-03 12:05:09.532
\.


--
-- Data for Name: investors; Type: TABLE DATA; Schema: public; Owner: mikailpirgozi
--

COPY public.investors (id, "userId", name, email, phone, address, "taxId", "createdAt", "updatedAt") FROM stdin;
investor_andrej	inv_andrej	Andrej Pavlík	andrej.pavlik@example.com	\N	\N	\N	2025-09-03 13:50:50.289	2025-09-03 13:50:50.289
investor_mikail	inv_mikail	Mikail Pirgozi	mikail.pirgozi@example.com	\N	\N	\N	2025-09-03 13:50:50.289	2025-09-03 13:50:50.289
investor_vladimir	inv_vladimir	Vladimír Dužek	vladimir.duzek@example.com	\N	\N	\N	2025-09-03 13:50:50.289	2025-09-03 13:50:50.289
investor_marian	inv_marian	Marián Cingel	marian.cingel@example.com	\N	\N	\N	2025-09-03 13:50:50.289	2025-09-03 13:50:50.289
investor_richard	inv_richard	Richard Zimányi	richard.zimanyi@example.com	\N	\N	\N	2025-09-03 13:50:50.289	2025-09-03 13:50:50.289
investor_roman	inv_roman	Roman Priecel	roman.priecel@example.com	\N	\N	\N	2025-09-03 13:50:50.289	2025-09-03 13:50:50.289
investor_patrik	inv_patrik	Patrik Pavlík	patrik.pavlik@example.com	\N	\N	\N	2025-09-03 13:50:50.289	2025-09-03 13:50:50.289
investor_kamil	inv_kamil	Kamil Zavodsky	kamil.zavodsky@example.com	\N	\N	\N	2025-09-03 13:50:50.289	2025-09-03 13:50:50.289
investor_steffen	inv_steffen	Steffen Tatge	steffen.tatge@example.com	\N	\N	\N	2025-09-03 13:50:50.289	2025-09-03 13:50:50.289
investor_jan	inv_jan	Ján Lajda	jan.lajda@example.com	\N	\N	\N	2025-09-03 13:50:50.289	2025-09-03 13:50:50.289
investor_stanislava	inv_stanislava	Stanislava Záčiková	stanislava.zacikova@example.com	\N	\N	\N	2025-09-03 13:50:50.289	2025-09-03 13:50:50.289
investor_matus	inv_matus	Matúš Hološ	matus.holos@example.com	\N	\N	\N	2025-09-03 13:50:50.289	2025-09-03 13:50:50.289
investor_rezervny	inv_rezervny	Rezervný fond	rezervny.fond@example.com	\N	\N	\N	2025-09-03 13:50:50.289	2025-09-03 13:50:50.289
\.


--
-- Data for Name: liabilities; Type: TABLE DATA; Schema: public; Owner: mikailpirgozi
--

COPY public.liabilities (id, name, description, "currentBalance", "interestRate", "maturityDate", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: period_snapshots; Type: TABLE DATA; Schema: public; Owner: mikailpirgozi
--

COPY public.period_snapshots (id, date, "totalAssetValue", "totalBankBalance", "totalLiabilities", nav, "performanceFeeRate", "totalPerformanceFee", "createdAt", "updatedAt") FROM stdin;
cmf3xk45u0001atko2hsgh2ms	2025-06-30 00:00:00	0	0	0	0	\N	\N	2025-09-03 12:05:09.522	2025-09-03 12:05:09.522
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: mikailpirgozi
--

COPY public.users (id, email, name, password, role, "createdAt", "updatedAt") FROM stdin;
cmf3wh6420000eqd34zh3in5u	admin@3pledigit.com	Admin User	$2b$10$9mfbhzPrkHeWrC0x2xNJ2eRhUqC6YmoHplJiMA2bK9FHhNEwdJaai	ADMIN	2025-09-03 11:34:52.466	2025-09-03 11:34:52.466
inv_andrej	andrej.pavlik@example.com	Andrej Pavlík	$2b$10$dummy.hash.for.now	INVESTOR	2025-09-03 13:50:41.705	2025-09-03 13:50:41.705
inv_mikail	mikail.pirgozi@example.com	Mikail Pirgozi	$2b$10$dummy.hash.for.now	INVESTOR	2025-09-03 13:50:41.705	2025-09-03 13:50:41.705
inv_vladimir	vladimir.duzek@example.com	Vladimír Dužek	$2b$10$dummy.hash.for.now	INVESTOR	2025-09-03 13:50:41.705	2025-09-03 13:50:41.705
inv_marian	marian.cingel@example.com	Marián Cingel	$2b$10$dummy.hash.for.now	INVESTOR	2025-09-03 13:50:41.705	2025-09-03 13:50:41.705
inv_richard	richard.zimanyi@example.com	Richard Zimányi	$2b$10$dummy.hash.for.now	INVESTOR	2025-09-03 13:50:41.705	2025-09-03 13:50:41.705
inv_roman	roman.priecel@example.com	Roman Priecel	$2b$10$dummy.hash.for.now	INVESTOR	2025-09-03 13:50:41.705	2025-09-03 13:50:41.705
inv_patrik	patrik.pavlik@example.com	Patrik Pavlík	$2b$10$dummy.hash.for.now	INVESTOR	2025-09-03 13:50:41.705	2025-09-03 13:50:41.705
inv_kamil	kamil.zavodsky@example.com	Kamil Zavodsky	$2b$10$dummy.hash.for.now	INVESTOR	2025-09-03 13:50:41.705	2025-09-03 13:50:41.705
inv_steffen	steffen.tatge@example.com	Steffen Tatge	$2b$10$dummy.hash.for.now	INVESTOR	2025-09-03 13:50:41.705	2025-09-03 13:50:41.705
inv_jan	jan.lajda@example.com	Ján Lajda	$2b$10$dummy.hash.for.now	INVESTOR	2025-09-03 13:50:41.705	2025-09-03 13:50:41.705
inv_stanislava	stanislava.zacikova@example.com	Stanislava Záčiková	$2b$10$dummy.hash.for.now	INVESTOR	2025-09-03 13:50:41.705	2025-09-03 13:50:41.705
inv_matus	matus.holos@example.com	Matúš Hološ	$2b$10$dummy.hash.for.now	INVESTOR	2025-09-03 13:50:41.705	2025-09-03 13:50:41.705
inv_rezervny	rezervny.fond@example.com	Rezervný fond	$2b$10$dummy.hash.for.now	INTERNAL	2025-09-03 13:50:41.705	2025-09-03 13:50:41.705
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: mikailpirgozi
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: asset_events asset_events_pkey; Type: CONSTRAINT; Schema: public; Owner: mikailpirgozi
--

ALTER TABLE ONLY public.asset_events
    ADD CONSTRAINT asset_events_pkey PRIMARY KEY (id);


--
-- Name: assets assets_pkey; Type: CONSTRAINT; Schema: public; Owner: mikailpirgozi
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: mikailpirgozi
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: bank_balances bank_balances_pkey; Type: CONSTRAINT; Schema: public; Owner: mikailpirgozi
--

ALTER TABLE ONLY public.bank_balances
    ADD CONSTRAINT bank_balances_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: mikailpirgozi
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: investor_cashflows investor_cashflows_pkey; Type: CONSTRAINT; Schema: public; Owner: mikailpirgozi
--

ALTER TABLE ONLY public.investor_cashflows
    ADD CONSTRAINT investor_cashflows_pkey PRIMARY KEY (id);


--
-- Name: investor_snapshots investor_snapshots_pkey; Type: CONSTRAINT; Schema: public; Owner: mikailpirgozi
--

ALTER TABLE ONLY public.investor_snapshots
    ADD CONSTRAINT investor_snapshots_pkey PRIMARY KEY (id);


--
-- Name: investors investors_pkey; Type: CONSTRAINT; Schema: public; Owner: mikailpirgozi
--

ALTER TABLE ONLY public.investors
    ADD CONSTRAINT investors_pkey PRIMARY KEY (id);


--
-- Name: liabilities liabilities_pkey; Type: CONSTRAINT; Schema: public; Owner: mikailpirgozi
--

ALTER TABLE ONLY public.liabilities
    ADD CONSTRAINT liabilities_pkey PRIMARY KEY (id);


--
-- Name: period_snapshots period_snapshots_pkey; Type: CONSTRAINT; Schema: public; Owner: mikailpirgozi
--

ALTER TABLE ONLY public.period_snapshots
    ADD CONSTRAINT period_snapshots_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: mikailpirgozi
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: documents_r2Key_key; Type: INDEX; Schema: public; Owner: mikailpirgozi
--

CREATE UNIQUE INDEX "documents_r2Key_key" ON public.documents USING btree ("r2Key");


--
-- Name: investor_snapshots_snapshotId_investorId_key; Type: INDEX; Schema: public; Owner: mikailpirgozi
--

CREATE UNIQUE INDEX "investor_snapshots_snapshotId_investorId_key" ON public.investor_snapshots USING btree ("snapshotId", "investorId");


--
-- Name: investors_userId_key; Type: INDEX; Schema: public; Owner: mikailpirgozi
--

CREATE UNIQUE INDEX "investors_userId_key" ON public.investors USING btree ("userId");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: mikailpirgozi
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: asset_events asset_events_assetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mikailpirgozi
--

ALTER TABLE ONLY public.asset_events
    ADD CONSTRAINT "asset_events_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES public.assets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mikailpirgozi
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: investor_cashflows investor_cashflows_investorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mikailpirgozi
--

ALTER TABLE ONLY public.investor_cashflows
    ADD CONSTRAINT "investor_cashflows_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES public.investors(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: investor_snapshots investor_snapshots_investorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mikailpirgozi
--

ALTER TABLE ONLY public.investor_snapshots
    ADD CONSTRAINT "investor_snapshots_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES public.investors(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: investor_snapshots investor_snapshots_snapshotId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mikailpirgozi
--

ALTER TABLE ONLY public.investor_snapshots
    ADD CONSTRAINT "investor_snapshots_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES public.period_snapshots(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: investors investors_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mikailpirgozi
--

ALTER TABLE ONLY public.investors
    ADD CONSTRAINT "investors_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

