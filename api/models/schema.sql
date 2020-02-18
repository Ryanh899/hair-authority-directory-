CREATE EXTENSION "uuid-ossp";

create table users (
id uuid DEFAULT uuid_generate_v4 () primary key not null, 
email varchar(128) unique not null, 
hash varchar(256) not null, 
salt varchar(256) not null, 
phone varchar(256) not null, 
first_name varchar(64) not null, 
last_name varchar(64) not null
);

create table professional_users (
id uuid primary key not null, 
email varchar(128) unique not null, 
hash varchar(256) not null, 
salt varchar(256) not null, 
phone varchar(256) not null, 
first_name varchar(64) not null, 
last_name varchar(64) not null
);

create table admin_users (
id uuid primary key not null, 
email varchar(128) unique not null, 
hash varchar(256) not null, 
salt varchar(256) not null, 
phone varchar(256) not null, 
first_name varchar(64) not null, 
last_name varchar(64) not null
);

create table listings(
id uuid primary key not null,
professional_id uuid references professional_users(id), 
business_title varchar(64) not null, 
business_description varchar(128) not null, 
street_address varchar(64), 
city varchar(64), 
state varchar(32), 
zip varchar(64),
phone varchar(24), 
email varchar(64), 
website varchar(128), 
category varchar (64), 
monday varchar (64), 
tuesday varchar (64),
wednesday varchar (64),
thursday varchar (64),
friday varchar (64),
saturday varchar (64),
sunday varchar (64),
instagram varchar(128),
twitter varchar(128),
linkedin varchar(128),
facebook varchar(128),
youtube varchar(128), 
mission_statement varchar(256), 
about varchar(256), 
faq0 varchar(128),
answer0 varchar(128), 
faq1 varchar(128),
answer1 varchar(128), 
faq2 varchar(128), 
answer2 varchar(128), 
lat float, 
lng float
); 

create table pending_listings (
id uuid DEFAULT uuid_generate_v4 () primary key not null, 
professional_id uuid, 
business_title varchar(64) not null, 
business_description varchar(128) not null, 
street_address varchar(64), 
city varchar(64), 
state varchar(32), 
zip varchar(64),
phone varchar(24), 
email varchar(64), 
website varchar(128), 
category varchar (64), 
monday varchar (64), 
tuesday varchar (64),
wednesday varchar (64),
thursday varchar (64),
friday varchar (64),
saturday varchar (64),
sunday varchar (64),
instagram varchar(128),
twitter varchar(128),
linkedin varchar(128),
facebook varchar(128),
youtube varchar(128), 
mission_statement varchar(256), 
about varchar(256), 
faq0 varchar(128),
answer0 varchar(128), 
faq1 varchar(128),
answer1 varchar(128), 
faq2 varchar(128), 
answer2 varchar(128), 
lat float, 
lng float
);

create table inactive_listings (
id uuid primary key not null, 
professional_id uuid references professional_users(id), 
business_title varchar(64) not null, 
business_description varchar(128) not null, 
street_address varchar(64), 
city varchar(64), 
state varchar(32), 
zip varchar(64),
phone varchar(24), 
email varchar(64), 
website varchar(128), 
category varchar (64), 
monday varchar (64), 
tuesday varchar (64),
wednesday varchar (64),
thursday varchar (64),
friday varchar (64),
saturday varchar (64),
sunday varchar (64),
instagram varchar(128),
twitter varchar(128),
linkedin varchar(128),
facebook varchar(128),
youtube varchar(128), 
mission_statement varchar(256), 
about varchar(256), 
faq0 varchar(128),
answer0 varchar(128), 
faq1 varchar(128),
answer1 varchar(128), 
faq2 varchar(128), 
answer2 varchar(128), 
lat float, 
lng float, 
reason varchar(24)
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
);