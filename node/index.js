

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

    this.getOneCartaoByNum = async function (numCartao){
        const conexao = await this.bd.getConexao();

        const sqlSelectOne = "SELECT * FROM Cartoes WHERE NUM_CARTAO = :numCartao";
        
        const dados = {numCartao: numCartao};
        ret = await conexao.execute(sqlSelectOne, dados);
        
        return ret.rows;
    }
} 

function Servico (codServico, nome, descricao, codRecompensa){
    this.codServico = codServico;
    this.nome = nome;
    this.descricao = descricao;
    this.codRecompensa = codRecompensa;
}

function Servicos(bd){
    this.bd = bd;

    this.criarServico = async function (servico){
        const conexao = await this.bd.getConexao();
        
        const sqlInsert = "INSERT INTO SERVICOS (COD_SERVICO, NOME, DESCRICAO) " + 
                        "VALUES (:codServico, :nome, :descricao)";
        const dados = {codServico: servico.codServico, nome: servico.nome, descricao: servico.descricao};
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
}

function Compra(codCompra, codServico, numCartao, dataCompra, dataUtilizacao, foiUtilizado){
    this.codCompra = codCompra;
    this.codServico = codServico;
    this.numCartao = numCartao;
    this.dataCompra = dataCompra;
    this.dataUtilizacao = dataUtilizacao;
    this.foiUtilizado = foiUtilizado;
}

function Compras(bd){
    this.bd = bd;

    this.compraServico = async function(codServico, numCartao){
        const conexao = await this.bd.getConexao();

        const sqlInsert = "INSERT INTO COMPRAS (COD_COMPRA, COD_SERVICO, NUM_CARTAO, DATA_COMPRA, DATA_UTILIZACAO, FOI_UTILIZADO) "
                            + "VALUES (SEQ_COMPRAS.NEXTVAL, :codServico, :numCartao, SYSDATE, null, 0)";

        const dados = {codServico: codServico, numCartao: numCartao};
        console.log(sqlInsert, dados);
        const result = await conexao.execute(sqlInsert, dados, {autoCommit: true});

        console.log(result);
    }

    this.getAllCompras = async function(){
        const conexao = await this.bd.getConexao();

        const sqlSelectAll = "SELECT * FROM COMPRAS";

        ret = await conexao.execute(sqlSelectAll);

        return ret.rows;
    }

    this.getAllComprasNaoUtilizadas = async function(numCartao){
        const conexao = await this.bd.getConexao(); 

        const sqlSelectAll = "SELECT c.cod_compra, s.cod_servico, s.nome, s.descricao, s.cod_recompensa FROM Compras c" + 
                                " JOIN Servicos s on c.cod_servico = s.cod_servico" + 
                                " AND c.num_cartao = :numCartao AND c.foi_utilizado = 0";
                                
        const dados = {numCartao: numCartao};
        
        ret = await conexao.execute(sqlSelectAll, dados);

        return ret.rows;
    }
    
    this.getAllComprasByNumCartao = async function(numCartao){
        const conexao = await this.bd.getConexao();

        const sqlSelectByNum = "SELECT * FROM COMPRAS WHERE NUM_CARTAO = :numCartao";
        const dados = {numCartao: numCartao};
        
        ret = await conexao.execute(sqlSelectByNum, dados);
        console.log(ret);

        return ret.rows;
    }

    this.utilizaCompra = async function(codCompra, numCartao){
        const conexao = await this.bd.getConexao();

        const sqlUpdate = "UPDATE COMPRAS SET DATA_UTILIZACAO = SYSDATE, FOI_UTILIZADO = 1"
                            + "WHERE COD_COMPRA = :codCompra AND NUM_CARTAO = :numCartao";
        const dados = {codCompra: codCompra, numCartao: numCartao};

        result = await conexao.execute(sqlUpdate, dados, {autoCommit: true});
        console.log(result);

        return result;
    }
}

function Recompensa(codRecompensa, foiObtido, dataRecebimento, dataRealizacao){
    this.codRecompensa = codRecompensa;
    this.foiObtido = foiObtido;
    this.dataRecebimento = dataRecebimento;
    this.dataRealizacao = dataRealizacao;
}

function Recompensas(bd){
    this.bd = bd;

    this.criarRecompensa = async function(){
        const conexao = await this.bd.getConexao();

        sqlInsert = "INSERT INTO RECOMPENSAS (COD_RECOMPENSA, FOI_OBTIDO, DATA_REALIZACAO, DATA_RECEBIMENTO)"
                        + " VALUES (SEQ_RECOMPENSA.NEXTVAL, 0, null, SYSDATE)";
        
        const result = await conexao.execute(sqlInsert);
        await conexao.commit();
        console.log(result);

        return result;
    }

    this.utilizaRecompensa = async function(codRecompensa){
        const conexao = await this.bd.getConexao();

        sqlUpdate = "UPDATE RECOMPENSAS SET FOI_OBTIDO = 1, DATA_REALIZACAO = SYSDATE WHERE COD_RECOMPENSA = :codRecompensa";
        const dados = {codRecompensa: codRecompensa};

        const result = await conexao.execute(sqlUpdate, dados, {autoCommit: true});
        return result;
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
        console.log(card);
        card = new Cartao(card[0], card[1]);
        console.log(card);
        return res.status(200).json(card);
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
        servico = new Servico(servico[0], servico[1], servico[2], servico[3]);
        return res.status(200).json(servico);
    }
}

async function criarServico(req, res){
    if(req.params.codServico){
        return res.status(422).json();
    }

    const servico = new Servico(req.body.codServico, req.body.nome, req.body.descricao, null);

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
            ret.push(new Servico(get[i][0], get[i][1], get[i][2], get[i][3]));

        console.log(ret);
        return res.status(200).json(ret);
    }
}

async function getAllCompras(req, res){
    let get;

    try{
        get = await global.compras.getAllCompras();
        console.log(get);
    } catch(err){}

    if(get.length == 0){
        return res.status(404).json([]);
    } else {
        const ret = [];
        
        for(i=0;i<get.length;i++)
            ret.push(new Compra(get[i][0], get[i][1], get[i][2], get[i][3], get[i][4], get[i][5]));

        console.log(ret);
        return res.status(200).json(ret);
    }
}

async function getAllComprasNaoUtilizadas(req, res){
    if(req.body.numCartao)
        return res.status(422).json();

    let get;
    const numCartao = req.params.numCartao;

    try{
        get = await global.compras.getAllComprasNaoUtilizadas(numCartao);
    }catch(err){}

    if(get.length == 0){
        return res.status(404).json([]);
    } else{
        const ret = [];
        for(i=0;i<get.length;i++)
            ret.push(new Compra(get[i][0], get[i][1], get[i][2], get[i][3], get[i][4], get[i][5]));

        console.log(ret);
        return res.status(200).json(ret);    
    }
}

async function getAllComprasByNumCartao(req, res){
    if(req.body.numCartao)
        return res.status(422).json();

    const numCartao = req.params.numCartao; 
    let get;

    try{
        get = await global.compras.getAllComprasByNumCartao(numCartao);
    } catch(err){}

    if(get.length == 0){
        return res.status(404).json([]);
    } else {
        const ret = [];
        for(i=0;i<get.length;i++)
            ret.push(new Compra(get[i][0], get[i][1], get[i][2], get[i][3], get[i][4], get[i][5]));

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
        await global.compras.compraServico(codServico, numCartao);
        return res.status(201).json({"codServico": codServico, "numCartao": numCartao});
    }
    catch(err){
        console.error(err);
        return res.status(409).json();
    }   
}

async function criarRecompensa(req, res){
    try{
        await global.recompensas.criarRecompensa();
        return res.status(201).json();
    } catch(err){
        console.error(err);
        return res.status(409).json();
    }
}

async function utilizaServico(req, res){
    if(req.params.codServico)
        return res.status(422).json();

    const codServico = req.body.codServico;
    const servico = new Servico(codServico, req.body.nome, req.body.descricao, req.body.codRecompensa);

    const codRecompensa = servico.codRecompensa;
    const numCartao = req.params.numCartao; 

    try{
        if(codRecompensa != null){
            await global.recompensas.utilizaRecompensa(codRecompensa);
            await global.compras.compraServico(codServico, numCartao);
            return res.status(200).json();
        } else {
            await global.compras.utilizaCompra(servico.codServico, numCartao);
            return res.status(200).json();
        }
    } catch(err){
        console.error(err);
        return req.status(409).json();
    }
}

async function ligarServidor()
{
    const bd = new BD();
    global.servicos = new Servicos(bd);
    global.cartoes = new Cartoes (bd);
    global.compras = new Compras(bd);
    global.recompensas = new Recompensas(bd);

    const express = require('express');
    const cors = require('cors');
    const app = express();

    app.use(cors());
    app.use(express.json());
    app.use(middleWareGlobal);

    app.post('/cartoes', criarCartao);
    app.get('/cartoes', getAllCartoes);
    app.get('/cartoes/:numCartao', getOneCartaoByNum);

    app.post('/servicos', criarServico);
    app.get('/servicos', getAllServicos);
    app.get('/servicos/:codServico', getOneServiceByCode);

    app.post('/compras/:codServico/:numCartao', compraServico);
    app.get('/compras', getAllCompras);
    app.get('/compras/utiliza/:numCartao', getAllComprasNaoUtilizadas);
    app.get('/compras/:numCartao', getAllComprasByNumCartao);
    
    app.post('/recompensas', criarRecompensa);

    app.put('/utiliza/:numCartao', utilizaServico);

    app.listen(3000, () => {
        console.log('App is running on port 3000');
    });
}

ligarServidor();