create table users (
id serial primary key not null, 
email varchar(128) unique not null, 
hash varchar(256) not null, 
salt varchar(256) not null
); 

create table professional_users (
id int primary key not null, 
email varchar(128) unique not null, 
hash varchar(256) not null, 
salt varchar(256) not null
);

create table admin_users (
id int primary key not null, 
email varchar(128) unique not null, 
hash varchar(256) not null, 
salt varchar(256) not null 
);

create table listings(
id serial not null,
professional_id int references professional_users(id), 
business_title varchar(256) not null, 
address varchar(128), 
city varchar(64), 
state varchar(32), 
zip int,
phone varchar(24), 
website varchar(256), 
category varchar (24), 
hours varchar(256), 
social_media text[], 
FAQ varchar(512),
other_info varchar(512), 
main_image varchar(256) 
); 
