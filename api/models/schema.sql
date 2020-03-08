
create table users (
id uuid DEFAULT uuid_generate_v4() primary key, 
email varchar(128) not null, 
hash varchar(256) not null, 
salt varchar(256) not null, 
phone varchar(256) not null, 
first_name varchar(64) not null, 
last_name varchar(64) not null
);

create table professional_users (
id uuid primary key not null, 
email varchar(128)  not null, 
hash varchar(256) not null, 
salt varchar(256) not null, 
phone varchar(256) not null, 
first_name varchar(64) not null, 
last_name varchar(64) not null
);

create table admin_users (
id uuid primary key not null, 
email varchar(128)  not null, 
hash varchar(256) not null, 
salt varchar(256) not null, 
phone varchar(256) not null, 
first_name varchar(64) not null, 
last_name varchar(64) not null
);



CREATE TABLE listings (
	id uuid primary key NOT NULL,
	professional_id uuid NULL,
	business_title varchar(64) NOT NULL,
	business_description text NOT NULL,
	street_address varchar(64) NULL,
	city varchar(64) NULL,
	state varchar(32) NULL,
	zip varchar(64) NULL,
	phone varchar(24) NULL,
	email varchar(64) NULL,
	category varchar(64) NULL,
	mission_statement varchar(256) NULL,
	about varchar(256) NULL,
	lat float8 NULL,
	lng float8 NULL,
	feature_image varchar(256) NULL,
	image_ids varchar(256) NULL,
	date_published timestamptz NULL DEFAULT CURRENT_TIMESTAMP,
	date_created timestamp NULL,
	claimed bool NOT NULL DEFAULT false
);

CREATE TABLE pending_listings (
	id uuid DEFAULT uuid_generate_v4() primary key NOT NULL,
	professional_id uuid NULL,
	business_title varchar(64) NOT NULL,
	business_description text NOT NULL,
	street_address varchar(64) NULL,
	city varchar(64) NULL,
	state varchar(32) NULL,
	zip varchar(64) NULL,
	phone varchar(24) NULL,
	email varchar(64) NULL,
	category varchar(64) NULL,
	mission_statement varchar(256) NULL,
	about varchar(256) NULL,
	lat float8 NULL,
	lng float8 NULL,
	feature_image varchar(256) NULL,
	image_ids varchar(256) NULL,
	date_published timestamptz NULL DEFAULT CURRENT_TIMESTAMP,
	date_created timestamp NULL,
	claimed bool NOT NULL DEFAULT false
);

CREATE TABLE inactive_listings (
	id uuid primary key NOT NULL,
	professional_id uuid NULL,
	business_title varchar(64) NOT NULL,
	business_description text NOT NULL,
	street_address varchar(64) NULL,
	city varchar(64) NULL,
	state varchar(32) NULL,
	zip varchar(64) NULL,
	phone varchar(24) NULL,
	email varchar(64) NULL,
	category varchar(64) NULL,
	mission_statement varchar(256) NULL,
	about varchar(256) NULL,
	lat float8 NULL,
	lng float8 NULL,
	feature_image varchar(256) NULL,
	image_ids varchar(256) NULL,
	date_published timestamptz NULL DEFAULT CURRENT_TIMESTAMP,
	date_created timestamp NULL,
	claimed bool NOT NULL DEFAULT false
);

create table hours (
listing_id uuid not null, 
day varchar(32) not null, 
opening_hours varchar (64), 
closing_hours varchar (64)
); 

create table faq (
listing_id uuid not null, 
faq text not null, 
faq_answer text not null
); 

create table social_media (
listing_id uuid not null, 
platform text not null,
url varchar(256) not null
);

create table images (
image_id uuid not null, 
lising_id uuid not null, 
featured_image boolean default false, 
path text not null 
);

create table pending_claims (
user_id uuid not null, 
listing_id uuid not null
); 

create table saved_listings (
listing_id uuid references listings(id), 
user_id uuid references users(id)
); 

create table saved_professional_Listings(
listing_id uuid references listings(id), 
professional_user_id uuid references professional_users(id)
);

create table saved_admin_Listings(
listing_id uuid references listings(id), 
admin_user_id uuid references admin_users(id)
)

create table zoho_auth (
id serial not null, 
client_id varchar(100), 
refresh_token varchar(100),
access_token varchar(100), 
expiry_time bigint, 
created_at timestamptz NULL DEFAULT CURRENT_TIMESTAMP
); 

create table extra_refresh ( 
id serial not null, 
refresh_token varchar(100)
); 

create table zoho_status (
user_id uuid not null, 
customer_id text not null, 
balace int, 
payment_id text, 
plan_code uuid 
); 