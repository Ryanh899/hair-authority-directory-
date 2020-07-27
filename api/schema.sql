
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Drop table

-- DROP TABLE public.admin_users;

CREATE TABLE public.admin_users (
	id uuid NOT NULL,
	email varchar(128) NOT NULL,
	hash varchar(256) NOT NULL,
	salt varchar(256) NOT NULL,
	phone varchar(256) NOT NULL,
	first_name varchar(64) NOT NULL,
	last_name varchar(64) NOT NULL,
	CONSTRAINT admin_users_pkey PRIMARY KEY (id)
);

-- Drop table

-- DROP TABLE public.existing_ids;

CREATE TABLE public.existing_ids (
	old_id text NOT NULL,
	newid uuid NULL DEFAULT uuid_generate_v4(),
	status text NULL
);

-- Drop table

-- DROP TABLE public.existing_image_ids;

CREATE TABLE public.existing_image_ids (
	old_id text NOT NULL,
	newid uuid NULL DEFAULT uuid_generate_v4()
);

-- Drop table

-- DROP TABLE public.extra_refresh;

CREATE TABLE public.extra_refresh (
	id serial NOT NULL,
	refresh_token varchar(100) NULL
);

-- Drop table

-- DROP TABLE public.faq;

CREATE TABLE public.faq (
	listing_id uuid NOT NULL,
	faq text NULL,
	faq_answer text NULL,
	id uuid NULL DEFAULT uuid_generate_v4()
);

-- Drop table

-- DROP TABLE public.hours;

CREATE TABLE public.hours (
	listing_id uuid NOT NULL,
	"day" varchar(32) NOT NULL,
	opening_hours varchar(64) NULL,
	closing_hours varchar(64) NULL
);

-- Drop table

-- DROP TABLE public.images;

CREATE TABLE public.images (
	image_id uuid NULL DEFAULT uuid_generate_v4(),
	listing_id uuid NULL,
	featured_image bool NULL DEFAULT false,
	image_path text NULL
);

-- Drop table

-- DROP TABLE public.inactive_listings;

CREATE TABLE public.inactive_listings (
	id uuid NOT NULL,
	professional_id uuid NULL,
	business_title text NOT NULL,
	business_description text NOT NULL,
	full_address text NULL,
	phone varchar(24) NULL,
	email varchar(64) NULL,
	category text NULL,
	mission_statement varchar(256) NULL,
	about varchar(256) NULL,
	lat float8 NULL,
	lng float8 NULL,
	feature_image text NULL,
	image_ids text NULL,
	date_published timestamptz NULL DEFAULT CURRENT_TIMESTAMP,
	date_created timestamp NULL,
	claimed bool NOT NULL DEFAULT false,
	tagline varchar(512) NULL,
	country text NULL,
	street_address text NULL,
	state varchar(64) NULL,
	city varchar(124) NULL,
	zip varchar(64) NULL,
	CONSTRAINT inactive_listings_pkey PRIMARY KEY (id)
);

-- Drop table

-- DROP TABLE public.listings;

CREATE TABLE public.listings (
	id uuid NOT NULL,
	professional_id uuid NULL,
	business_title text NOT NULL,
	business_description text NOT NULL,
	full_address text NULL,
	phone varchar(64) NULL,
	email varchar(64) NULL,
	category text NULL,
	mission_statement varchar(256) NULL,
	about varchar(256) NULL,
	lat float8 NULL,
	lng float8 NULL,
	feature_image varchar(256) NULL,
	image_ids text NULL,
	date_published timestamptz NULL DEFAULT CURRENT_TIMESTAMP,
	date_created timestamp NULL,
	claimed bool NOT NULL DEFAULT false,
	city varchar(124) NULL,
	state varchar(64) NULL,
	zip varchar(64) NULL,
	tagline varchar(512) NULL,
	street_address text NULL,
	country text NULL,
	CONSTRAINT listings_pkey PRIMARY KEY (id)
);

-- Drop table

-- DROP TABLE public.pageviews;

CREATE TABLE public.pageviews (
	id serial NOT NULL,
	listing_id uuid NOT NULL,
	count int4 NULL,
	"search" text NULL,
	date_viewed timestamp NULL DEFAULT CURRENT_TIMESTAMP
);

-- Drop table

-- DROP TABLE public.pending_listings;

CREATE TABLE public.pending_listings (
	id uuid NOT NULL DEFAULT uuid_generate_v4(),
	professional_id uuid NULL,
	business_title text NOT NULL,
	business_description text NULL,
	full_address text NULL,
	phone varchar(64) NULL,
	email varchar(64) NULL,
	category text NULL,
	mission_statement varchar(256) NULL,
	about varchar(256) NULL,
	lat float8 NULL,
	lng float8 NULL,
	feature_image varchar(256) NULL,
	image_ids text NULL,
	date_published timestamptz NULL DEFAULT CURRENT_TIMESTAMP,
	date_created timestamp NULL,
	claimed bool NOT NULL DEFAULT false,
	tagline varchar(512) NULL,
	city varchar(124) NULL,
	state varchar(64) NULL,
	zip varchar(64) NULL,
	street_address text NULL,
	country text NULL,
	CONSTRAINT pending_listings_pkey PRIMARY KEY (id)
);

-- Drop table

-- DROP TABLE public.professional_users;

CREATE TABLE public.professional_users (
	id uuid NOT NULL,
	email varchar(128) NOT NULL,
	hash varchar(256) NOT NULL,
	salt varchar(256) NOT NULL,
	phone varchar(256) NOT NULL,
	first_name varchar(64) NOT NULL,
	last_name varchar(64) NOT NULL,
	CONSTRAINT professional_users_pkey PRIMARY KEY (id)
);

-- Drop table

-- DROP TABLE public.quill_deltas;

CREATE TABLE public.quill_deltas (
	id serial NOT NULL,
	listing_id uuid NOT NULL,
	delta text NOT NULL
);

-- Drop table

-- DROP TABLE public.social_media;

CREATE TABLE public.social_media (
	listing_id uuid NOT NULL,
	platform text NOT NULL,
	url text NOT NULL
);

-- Drop table

-- DROP TABLE public.special_skills;

CREATE TABLE public.special_skills (
	listing_id uuid NOT NULL,
	skill varchar(128) NOT NULL
);

-- Drop table

-- DROP TABLE public.subscriptions;

CREATE TABLE public.subscriptions (
	user_id uuid NOT NULL,
	customer_id text NOT NULL,
	status varchar(64) NULL,
	subscription_id text NOT NULL,
	card_id text NULL,
	hosted_page_id text NULL,
	plan_code text NULL,
	listing_id uuid NULL,
	date_created timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	portal bool NULL DEFAULT false,
	CONSTRAINT subscriptions_pkey PRIMARY KEY (subscription_id)
);

-- Drop table

-- DROP TABLE public.users;

CREATE TABLE public.users (
	id uuid NOT NULL DEFAULT uuid_generate_v4(),
	email varchar(128) NOT NULL,
	hash varchar(256) NOT NULL,
	salt varchar(256) NOT NULL,
	phone varchar(256) NOT NULL,
	first_name varchar(64) NOT NULL,
	last_name varchar(64) NOT NULL,
	CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- Drop table

-- DROP TABLE public.zoho_auth;

CREATE TABLE public.zoho_auth (
	id serial NOT NULL,
	client_id varchar(128) NULL,
	refresh_token text NULL,
	access_token text NULL,
	created_at timestamp NOT NULL,
	expiry_time timestamp NOT NULL
);

-- Drop table

-- DROP TABLE public.pending_claims;

CREATE TABLE public.pending_claims (
	user_id uuid NOT NULL,
	listing_id uuid NOT NULL,
	claim_id uuid NOT NULL DEFAULT uuid_generate_v4(),
	subscription_id text NULL,
	date_created timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT pending_claims_pkey PRIMARY KEY (claim_id),
	CONSTRAINT pending_claims_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES listings(id)
);

-- Drop table

-- DROP TABLE public.saved_admin_listings;

CREATE TABLE public.saved_admin_listings (
	listing_id uuid NULL,
	admin_user_id uuid NULL,
	CONSTRAINT saved_admin_listings_admin_user_id_fkey FOREIGN KEY (admin_user_id) REFERENCES admin_users(id),
	CONSTRAINT saved_admin_listings_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES listings(id)
);

-- Drop table

-- DROP TABLE public.saved_listings;

CREATE TABLE public.saved_listings (
	listing_id uuid NULL,
	user_id uuid NULL,
	CONSTRAINT saved_listings_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES listings(id),
	CONSTRAINT saved_listings_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Drop table

-- DROP TABLE public.saved_professional_listings;

CREATE TABLE public.saved_professional_listings (
	listing_id uuid NULL,
	professional_user_id uuid NULL,
	CONSTRAINT saved_professional_listings_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES listings(id),
	CONSTRAINT saved_professional_listings_professional_user_id_fkey FOREIGN KEY (professional_user_id) REFERENCES professional_users(id)
);
