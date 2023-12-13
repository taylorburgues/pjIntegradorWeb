select * from cartoes;

alter table cartoes 
drop column saldo;

select * from servicos;
desc servicos;

delete from servicos where cod_servico = 1;

CREATE TABLE servicos(
COD_SERVICO INTEGER PRIMARY KEY NOT NULL,
NOME VARCHAR2(50) NOT NULL,
DESCRICAO VARCHAR2(100) NOT NULL,
COD_RECOMPENSA INTEGER,
CONSTRAINT fk_codRecompensa
FOREIGN KEY (COD_RECOMPENSA) REFERENCES RECOMPENSAS(cod_recompensa));

INSERT INTO SERVICOS (COD_SERVICO, NOME, DESCRICAO, COD_RECOMPENSA)
VALUES(1, 'TESTES', 'TESTES', null);

update servicos
set num_cartao = null
where cod_servico= 5;

SELECT s.cod_servico, s.nome, s.descricao, r.foi_obtido, r.data_recebimento, r.data_realizacao 
FROM SERVICOS s
JOIN RECOMPENSAS r on s.cod_recompensa = r.cod_recompensa
JOIN COMPRAS c on s.cod_servico = c.cod_servico
JOIN CARTOES ca on c.num_cartao = ca.num_cartao
WHERE ca.num_cartao = 7010 AND r.foi_obtido = 1; // SERVICOS RECOMPENSAS UTILIZADOS 


SELECT s.cod_servico, s.nome, s.descricao, r.foi_obtido, r.data_recebimento, r.data_realizacao 
FROM SERVICOS s
JOIN RECOMPENSAS r on s.cod_recompensa = r.cod_recompensa
JOIN COMPRAS c on s.cod_servico = c.cod_servico
JOIN CARTOES ca on c.num_cartao = ca.num_cartao
WHERE ca.num_cartao = 7010; // SERVICOS RECOMPENSAS UTILIZADOS 

ALTER TABLE servicos 
add cod_recompensa INTEGER;

alter table servicos 
ADD CONSTRAINT fk_cod_recompensa
    FOREIGN KEY (cod_recompensa)
    REFERENCES recompensas(cod_recompensa);

CREATE TABLE compras(
    cod_compra INTEGER PRIMARY KEY NOT NULL,
    cod_servico INTEGER NOT NULL,
    num_cartao INTEGER NOT NULL,
    data_compra DATE DEFAULT SYSDATE NOT NULL,
    data_utilizacao DATE,
    foi_utilizado NUMBER(1),
    CONSTRAINT fk_codServico 
    FOREIGN KEY (cod_servico) REFERENCES Servicos(cod_servico),
    CONSTRAINT fk_num_cartao 
    FOREIGN KEY (num_cartao) REFERENCES Cartoes(num_cartao)
);

SELECT * FROM COMPRAS WHERE NUM_CARTAO = 9813 AND DATA_UTILIZACAO IS NULL;

SELECT c.cod_compra, s.cod_servico, s.nome, s.descricao, s.cod_recompensa 
FROM Compras c 
JOIN Servicos s on c.cod_servico = s.cod_servico
AND c.num_cartao = 9813 AND c.foi_utilizado = 0;
                                
drop table compras;

select * from compras;
delete from compras where cod_compra = 10;

desc compras;

delete from compras where cod_compra = 50;
alter table compras
add cod_compra INTEGER PRIMARY KEY NOT NULL;

INSERT INTO COMPRAS (COD_COMPRA, COD_SERVICO, NUM_CARTAO, DATA_COMPRA, DATA_UTILIZACAO, FOI_UTILIZADO) 
VALUES(SEQ_COMPRAS.NEXTVAL, 12, 3292, SYSDATE, null, 0);

CREATE SEQUENCE SEQ_COMPRAS
    INCREMENT BY 1
    START WITH 10
    MINVALUE 1;
    
CREATE TABLE recompensas(
    cod_recompensa INTEGER PRIMARY KEY NOT NULL,
    data_obtencao DATE,
    foi_obtido NUMBER(1)
);

CREATE SEQUENCE seq_recompensa
    INCREMENT BY 1
    START WITH 1
    MINVALUE 1;
    
select * from recompensas;

alter table recompensas
drop column data_recebimento;

alter table recompensas
add data_recebimento DATE NOT NULL;

UPDATE RECOMPENSAS SET FOI_OBTIDO = 1, DATA_REALIZACAO = SYSDATE WHERE COD_RECOMPENSA = 24;

INSERT INTO RECOMPENSAS VALUES(SEQ_RECOMPENSA.NEXTVAL, 0, null, SYSDATE);
INSERT INTO RECOMPENSAS (COD_RECOMPENSA, FOI_OBTIDO, DATA_REALIZACAO, DATA_RECEBIMENTO)
VALUES (SEQ_RECOMPENSA.NEXTVAL, 0, null, SYSDATE);