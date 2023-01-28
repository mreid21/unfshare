--connect to db
\c postgres

--delete existing projects table
drop table if exists projects;

--create projects table
create table if not exists projects
(
  id int generated always as identity primary key,
  name varchar not null,
  repoLink varchar,
  liveSiteLink varchar
);

