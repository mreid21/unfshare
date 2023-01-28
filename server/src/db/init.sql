--connect to db
\c postgres

--delete existing projects table
drop table if exists projects;

--create projects table
create table if not exists projects
(
  id int generated always as identity primary key,
  name varchar(25) not null unique,
  repoLink varchar(100),
  liveSiteLink varchar(100) 
);

