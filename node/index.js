

function BD(){
    this.getConexao = function (){
        if (global.conexao)
            return global.conexao;

        const oracledb = require('oracledb');

        try 
        {
            global.conexao = oracledb.getConnection({user: 'system', password: 'pioracle', connectString: 'localhost/xe', timezone: 'UTC-3'});
        }
        catch (err){
            console.error(err);
            process.exit(1);
        }

        return global.conexao;
    }
}

function Cartao (numCartao, createdDate, saldo){
    this.numCartao = numCartao;
    this.createdDate = createdDate;
    this.saldo = saldo;
}

function Cartoes (bd){
    this.bd = bd;

    this.criarCartao = async function (cartao){
        const conexao = await this.bd.getConexao();

        const sqlInsert = "INSERT INTO Cartoes (NUM_CARTAO, CREATED_DATE, SALDO)" + 
                        "VALUES (:numCartao, sysdate, :saldo)";
        const dados = {numCartao: cartao.numCartao, saldo: cartao.saldo};
        console.log(sqlInsert, dados);
        const result = await conexao.execute(sqlInsert, dados, {autoCommit: true});
        
        console.log(result);
    }

    this.getAllCartoes = async function (){
        const conexao = await this.bd.getConexao();

        const sqlSelect = "SELECT * FROM Cartoes";

        ret = await conexao.execute(sqlSelect);

        return ret.rows;
    }

    this.getOneCartaoByNum = async function (numCartao){
        const conexao = await this.bd.getConexao();

        const sqlSelectOne = "SELECT * FROM Cartoes WHERE NUM_CARTAO = :numCartao";
        
        const dados = {numCartao: numCartao};
        ret = await conexao.execute(sqlSelectOne, dados);
        
        return ret.rows;
    }

    this.alterarSaldoCartao = async function (numCartao, novoSaldo){
        const conexao = await this.bd.getConexao();

        const sqlUpdate = "UPDATE CARTOES " +
                            "SET SALDO = :novoSaldo " + 
                            "WHERE NUM_CARTAO = :numCartao";

        const dados = {novoSaldo: novoSaldo, numCartao: numCartao};
        const result = await conexao.execute(sqlUpdate, dados, {autoCommit: true});

        console.log(result);
    }
} 

function Servico (codServico, nome, descricao, numCartao, preco){
    this.codServico = codServico;
    this.nome = nome;
    this.descricao = descricao;
    this.numCartao = numCartao;
    this.preco = preco;
}

function Servicos(bd){
    this.bd = bd;

    this.criarServico = async function (servico){
        const conexao = await this.bd.getConexao();
        
        const sqlInsert = "INSERT INTO SERVICOS (COD_SERVICO, NOME, DESCRICAO, PRECO) " + 
                        "VALUES (:codServico, :nome, :descricao, :preco)";
        const dados = {codServico: servico.codServico, nome: servico.nome, descricao: servico.descricao, preco: servico.preco};
        console.log(sqlInsert, dados);
        const result = await conexao.execute(sqlInsert, dados, {autoCommit: true});
        
        console.log(result);
    }
    
    this.getAllServicos = async function (){
        const conexao = await this.bd.getConexao();
        console.log(conexao);

        const sqlSelectAll = "SELECT * FROM SERVICOS";
        
        ret = await conexao.execute(sqlSelectAll);

        //console.log(ret);
        return ret.rows;
    }

    this.getOneServiceByCode = async function(codServico){
        const conexao = await this.bd.getConexao();

        const sqlSelectOne = "SELECT * FROM SERVICOS WHERE COD_SERVICO = :codServico";
        const dados = {codServico: codServico};

        ret = await conexao.execute(sqlSelectOne, dados);

        console.log(ret);
        return ret.rows;
    }

    this.compraServico = async function(codServico, numCartao){
        const conexao = await this.bd.getConexao();

        const sqlInsert = "UPDATE SERVICOS " +
                            "SET NUM_CARTAO = :numCartao " + 
                            "WHERE COD_SERVICO = :codServico";

        const dados = {numCartao: numCartao, codServico: codServico};
        console.log(sqlInsert, dados);
        const result = await conexao.execute(sqlInsert, dados, {autoCommit: true});

        console.log(result);
    }

    this.getAllServicesBySaldoCartao = async function(numCartao){
        const conexao = await this.bd.getConexao();

        const sqlSelectByPrice = "SELECT * FROM SERVICOS WHERE " +
                                    "PRECO < (SELECT SALDO FROM CARTOES WHERE NUM_CARTAO = :numCartao)";

        const dados = {numCartao: numCartao};
        ret = await conexao.execute(sqlSelectByPrice, dados);

        console.log(ret);
        return ret.rows;
    }
}

function middleWareGlobal(req, res, next)
{
    console.time('Requisição');
    console.log('Método: ' + req.method + '; URL: ' + req.url);

    next();

    console.log('Finalizou');

    console.timeEnd('Requisição');
}

async function criarCartao(req, res){
    
    if(req.params.numCartao){
        return res.status(422).json();
    }

    const numCartao = req.body.numCartao;
    const saldoPadrao = 2000;

    const cartao = new Cartao(numCartao, req.body.createdDate, saldoPadrao);

    try{
        await global.cartoes.criarCartao(cartao);
        return res.status(201).json(numCartao);
    }
    catch(exception){
        console.log(exception);
        return res.status(409).json();
    }
}

async function getAllCartoes(req, res){
    if(req.body.numCartao || req.body.createdDate || req.body.saldo)
        return res.status(422).json();

    let get;

    try
    {
        get = await global.cartoes.getAllCartoes();
    }
    catch(exception)
    {}

    if(typeof get === 'undefined')
    {
        return res.status(404).json([]);
    }
    else{
        const ret = [];
        for(i=0;i<get.length;i++)
            ret.push(new Cartao(get[i][0], get[i][1], get[i][2]));

        return res.status(200).json(ret);
    }
}

async function getOneCartaoByNum(req, res){
    if(req.body.numCartao || req.body.createdDate)
        return res.status(422).json();

    const numCartao = req.params.numCartao;

    let ret;
    try{
        ret = await global.cartoes.getOneCartaoByNum(numCartao);
    }
    catch(exception){}

    if(ret.length == 0)
    {
        return res.status(404).json();
    }
    else {
        card = ret[0];
        console.log(card);
        card = new Cartao(card[0], card[1], card[2]);
        console.log(card);
        return res.status(200).json(card);
    }
}

async function alterarSaldoCartao(req, res){
    if(!req.body.novoSaldo)
        return res.status(422).json();

    const numCartao = req.params.numCartao;

    let put;
    try{
        put = await global.cartoes.alterarSaldoCartao(numCartao, req.body.novoSaldo);
        console.log(put);
        return res.status(201).json();
    }
    catch(exception){
        console.error(exception);
    }

}

async function getOneServiceByCode(req, res){
    if(req.body.codServico)
        return res.status(422).json();

    const codServico = req.params.codServico;

    let ret;
    try{
        ret = await global.servicos.getOneServiceByCode(codServico);  
        console.log(ret);  
    }
    catch(err){}

    if(ret.length == 0)
    {
        return res.status(404).json();
    }
    else {
        servico = ret[0];
        servico = new Servico(servico[0], servico[1], servico[2], servico[3], servico[4]);
        return res.status(200).json(servico);
    }
}

async function criarServico(req, res){
    if(req.params.codServico){
        return res.status(422).json();
    }

    const servico = new Servico(req.body.codServico, req.body.nome, req.body.descricao, null, req.body.preco);

    try{
        await global.servicos.criarServico(servico);
        return res.status(201).json(req.body.codServico);
    }
    catch(err){
        console.error(err);
        return res.status(409).json();
    }
}

async function getAllServicos(req, res){
    let get; 

    try
    {
        get = await global.servicos.getAllServicos();
    }
    catch(exception)
    {}

    if(get.length == 0)
    {
        return res.status(404).json([]);
    }
    else{
        const ret = [];
        for(i=0;i<get.length;i++)
            ret.push(new Servico(get[i][0], get[i][1], get[i][2], get[i][3],get[i][4]));

        console.log(ret);
        return res.status(200).json(ret);
    }
}

async function compraServico(req, res){
    if(req.body.codServico || req.body.numCartao)
        return res.status(422).json();
    
    const codServico = req.params.codServico;
    const numCartao = req.params.numCartao; 

    try{
        await global.servicos.compraServico(codServico, numCartao);
        return res.status(201).json({"codServico": codServico, "numCartao": numCartao});
    }
    catch(err){
        console.error(err);
        return res.status(409).json();
    }   
}

async function getAllServicesBySaldoCartao(req, res){
    if(req.body.numCartao)
        return res.status(422).json();

    let get;
    const numCartao = req.params.numCartao;

    try{
        get = await global.servicos.getAllServicesBySaldoCartao(numCartao);
    }catch(err){}

    if(get.length == 0){
        return res.status(404).json([]);
    } else{
        const ret = [];
        for(i=0;i<get.length;i++)
            ret.push(new Servico(get[i][0], get[i][1], get[i][2], get[i][3],get[i][4]));

        console.log(ret);
        return res.status(200).json(ret);    
    }
}

async function ligarServidor()
{
    const bd = new BD();
    global.servicos = new Servicos(bd);
    global.cartoes = new Cartoes (bd);

    const express = require('express');
    const cors = require('cors');
    const app = express();

    app.use(cors());
    app.use(express.json());
    app.use(middleWareGlobal);

    app.post('/cartoes', criarCartao);
    app.get('/cartoes', getAllCartoes);
    app.get('/cartoes/:numCartao', getOneCartaoByNum);
    app.put('/cartoes/:numCartao/saldo', alterarSaldoCartao);

    app.post('/servicos', criarServico);
    app.get('/servicos', getAllServicos);
    app.put('/servicos/:codServico/:numCartao', compraServico);
    app.get('/servicos/:codServico', getOneServiceByCode);
    app.get('/servicos/cartoes/:numCartao', getAllServicesBySaldoCartao);
    
    app.listen(3000, () => {
        console.log('App is running on port 3000');
    });
}

ligarServidor();