-- Skytec Express integration — run this once in your Supabase SQL Editor.

-- One row per parcel handed to Skytec (keyed by our order_number = Skytec sifraExt).
create table if not exists skytec_shipments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  order_number text not null unique,
  order_date date,                 -- day the order was placed (export/announce day)
  product_prefix text,             -- MKK, AEX, HMR … for per-product stats
  ime text,
  telefon text,
  grad text,
  ptt text,
  sky_sifra text,                  -- Skytec shipment code (barcode)
  najava_sifra bigint,             -- consolidated announcement code
  postarina numeric(10,2),
  cod_amount numeric(10,2) not null default 0,

  -- normalised state: najava | preuzeto | u_dostavi | odgodjena | sporna |
  --                   dostavljena | vracena | povrat_dostavljen | otkazana
  state text not null default 'najava',
  state_label text,
  state_note text,
  state_at timestamptz,
  tracking_url text,

  -- cash-on-delivery remittance
  cod_paid_at timestamptz,
  cod_presjek_at timestamptz,
  cod_paid_amount numeric(10,2)
);

create index if not exists skytec_shipments_sifra_idx on skytec_shipments (sky_sifra);
create index if not exists skytec_shipments_state_idx on skytec_shipments (state);
create index if not exists skytec_shipments_date_idx on skytec_shipments (order_date);

-- Every status notification / poll result (history + webhook de-duplication).
create table if not exists skytec_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  callback_uid text unique,
  source text not null default 'webhook',   -- webhook | poll
  order_number text,
  sky_sifra text,
  status_code text,
  state text,
  label text,
  note text,
  status_at timestamptz,
  raw jsonb
);

create index if not exists skytec_events_order_idx on skytec_events (order_number);

-- Raw COD remittances from /cod-payments (also covers parcels sent via Excel).
create table if not exists skytec_cod_payments (
  sifra_otkupnine text primary key,
  created_at timestamptz not null default now(),
  sifra_izvorne_posiljke text,
  sifra_ext text,
  status int,
  iznos numeric(10,2),
  datum_slanja timestamptz,
  datum_dostave timestamptz,
  datum_presjeka timestamptz,
  nalog_sifra bigint,
  raw jsonb
);

create index if not exists skytec_cod_izvorna_idx on skytec_cod_payments (sifra_izvorne_posiljke);

-- These tables are only touched by the server (service role); keep them closed to the anon key.
alter table skytec_shipments enable row level security;
alter table skytec_events enable row level security;
alter table skytec_cod_payments enable row level security;
