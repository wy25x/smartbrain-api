BEGIN TRANSACTION;

insert into users (name, email, entries, joined) values ('tom', 'tom@gmail.com', 5, '2018-01-01');
insert into login (hash, email) values ('$2a$10$GFMMN2VrIjfenB1yLiyEYuOSJ5G1uHzWTEHyGyBx0MB0EbLJZCe.K', 'tom@gmail.com');

	COMMIT;