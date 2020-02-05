create table users (
id int primary key not null, 
email varchar(128) unique not null, 
hash varchar(256) not null, 
salt varchar(256) not null, 
phone varchar(256) not null, 
first_name varchar(64) not null, 
last_name varchar(64) not null
);

create table professional_users (
id int primary key not null, 
email varchar(128) unique not null, 
hash varchar(256) not null, 
salt varchar(256) not null, 
phone varchar(256) not null, 
first_name varchar(64) not null, 
last_name varchar(64) not null
);

create table admin_users (
id int primary key not null, 
email varchar(128) unique not null, 
hash varchar(256) not null, 
salt varchar(256) not null, 
phone varchar(256) not null, 
first_name varchar(64) not null, 
last_name varchar(64) not null
);

create table listings(
id serial not null,
professional_id int references professional_users(id), 
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
