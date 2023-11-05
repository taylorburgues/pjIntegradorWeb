
function BD(){
    //process.env.ORA_SDTZ = 'UTC-3';

    this.getConexao = async function (){
        if (global.conexao)
            return global.conexao;

        const oracledb = require('oracledb');

        try 
        {
            global.conexao = await oracledb.getConnection({user: 'system', password: 'pioracle', connectString: 'localhost/xe', timezone: 'UTC-3'});
        }
        catch (err){
            console.error(err);
            process.exit(1);
        }

        return global.conexao;
    }
}

function Cartao (numCartao, createdDate){
    this.numCartao = numCartao;
    this.createdDate = createdDate;
}

function Cartoes (bd){
    this.bd = bd;

    this.criarCartao = async function (cartao){
        const conexao = await this.bd.getConexao();

        const sqlInsert = "INSERT INTO Cartoes (NUM_CARTAO, CREATED_DATE)" + 
                        "VALUES (:numCartao, sysdate)";
        const dados = {numCartao: cartao.numCartao};
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

    this.getOneCartaoByNum = async function (numero){
        const conexao = await this.bd.getConexao();

        const sqlSelectOne = "SELECT NUM_CARTAO,TO_CHAR(CREATED_DATE, 'YYYY-MM-DD HH24:MI:SS')" + 
                                "FROM Cartoes WHERE NUM_CARTAO = :numCartao";
        
        const dados = {numCartao: numero};
        ret = await conexao.execute(sqlSelectOne, dados);
        
        return ret.rows;
    }
} 

function Servico (codigo, nome, descricao, numCartao){
    this.codigo = codigo;
    this.nome = nome;
    this.descricao = descricao;
    this.numCartao = numCartao;
}

function Servicos(bd){
    this.bd = bd;

    this.criarServico = async function (servico){
        const conexao = await this.bd.getConexao();
        
        const sqlInsert = "INSERT INTO SERVICOS (COD_SERVICO, NOME, DESCRICAO)" + 
                        "VALUES (:codServico, :nome, :descricao)";
        const dados = {codServico: servico.codigo, nome: servico.nome, descricao: servico.descricao};
        console.log(sqlInsert, dados);
        const result = await conexao.execute(sqlInsert, dados, {autoCommit: true});
        
        console.log(result);
    }
    
    this.getAllServicos = async function (){
        const conexao = await this.bd.getConexao();

        const sqlSelectAll = "SELECT * FROM SERVICOS";
        
        ret = await conexao.execute(sqlSelectAll);

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
    
    const cartao = new Cartao(numCartao, req.body.createdDate);

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
    if(req.body.numCartao || req.body.createdDate)
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
            ret.push(new Cartao(get[i][0], get[i][1]));

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
        card = new Cartao(card[0], card[1]);
        return res.status(200).json(card);
    }
}

async function criarServico(req, res){
    if(req.params.codServico){
        return res.status(422).json();
    }

    const codServico = req.body.codServico;
    const nome = req.body.nome;
    const desc = req.body.descricao;

    const servico = new Servico(codServico, nome, desc);

    try{
        await global.servicos.criarServico(servico);
        return res.status(201).json(codServico);
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

    if(typeof get === 'undefined')
    {
        return res.status(404).json([]);
    }
    else{
        const ret = [];
        for(i=0;i<get.length;i++)
            ret.push(new Servico(get[i][0], get[i][1], get[i][2], get[i][3]));

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
async function ligarServidor()
{
    const bd = new BD();
    global.cartoes = new Cartoes (bd);
    global.servicos = new Servicos(bd);

    const express = require('express');

    const app = express();

    app.use(express.json());
    app.use(middleWareGlobal);

    app.post('/cartoes', criarCartao);
    app.get('/cartoes', getAllCartoes);
    app.get('/cartoes/:numCartao', getOneCartaoByNum);

    app.post('/servicos', criarServico);
    app.get('/servicos', getAllServicos);
    app.post('/servicos/:codServico/:numCartao', compraServico);
    //app.get('/servicos/:codigo', getOneServiceByCode)
    //app.get('/servicos/cartoes/:numCartoes', getAllServicesByNumCard);
    
    app.listen(3000, () => {
        console.log('App is running on port 3000');
    });
}

ligarServidor();