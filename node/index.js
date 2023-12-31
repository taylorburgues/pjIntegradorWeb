

function BD(){
    this.getConexao = function (){
        if (global.conexao)
            return global.conexao;

        const oracledb = require('oracledb');

        try 
        {
            global.conexao = oracledb.getConnection({user: 'bd150923150', password: 'Qphci7', connectString: 'BD-ACD/xe', timezone: 'UTC-3'});
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
        
        const sqlInsert = "INSERT INTO SERVICOS (COD_SERVICO, NOME, DESCRICAO, COD_RECOMPENSA) " + 
                        "VALUES (:codServico, :nome, :descricao, :codRecompensa)";
        const dados = {codServico: servico.codServico, nome: servico.nome, descricao: servico.descricao, codRecompensa: servico.codRecompensa};
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


    this.getAllComprasNaoUtilizadasDeUmCartao = async function(numCartao){
        const conexao = await this.bd.getConexao(); 

        const sqlSelectAll = "SELECT c.cod_compra, s.cod_servico, s.nome, s.descricao, s.cod_recompensa FROM Compras c" + 
                                " JOIN Servicos s on c.cod_servico = s.cod_servico" + 
                                " AND c.num_cartao = :numCartao AND c.foi_utilizado = 0";
                                
        const dados = {numCartao: numCartao};
        
        ret = await conexao.execute(sqlSelectAll, dados);

        console.log(ret);
        return ret.rows;
    }
    
    this.getAllComprasByNumCartao = async function(numCartao){
        const conexao = await this.bd.getConexao();

        const sqlSelectByNum = "SELECT c.* FROM COMPRAS c"  +
                                " JOIN SERVICOS s on c.cod_servico = s.cod_servico" +
                                " WHERE s.cod_recompensa IS NULL"+ 
                                " AND c.num_cartao = :numCartao";
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

    this.getOneCompraByCodCompra = async function(codCompra){
        const conexao = await this.bd.getConexao();

        const sqlSelectOne = "SELECT c.cod_compra, s.cod_servico, s.nome, s.descricao, s.cod_recompensa FROM Compras c"
                            + " JOIN SERVICOS s on c.cod_servico = s.cod_servico"
                            + " AND c.cod_compra = :codCompra";
        
        const dados = {codCompra: codCompra};

        ret = await conexao.execute(sqlSelectOne, dados);

        return ret.rows;
    }

    this.getCountComprasRecompensas = async function(){
        const conexao = await this.bd.getConexao();

        const sqlSelectCount = "SELECT count(*) FROM Compras c" +
                                " JOIN Servicos s on c.cod_servico = s.cod_servico" +
                                " WHERE s.cod_recompensa IS NOT NULL";

        count = await conexao.execute(sqlSelectCount);
        console.log(count);
        return count.rows;
    }

    this.getCountComprasNaoUtilizadas = async function(){
        const conexao = await this.bd.getConexao();

        const sqlSelectCount = "Select count(*) from Compras c WHERE c.foi_utilizado = 0";

        count = await conexao.execute(sqlSelectCount);
        console.log(count);
        return count.rows;
    }

    this.getServicosRealizadosByType = async function(){
        const conexao = await this.bd.getConexao();

        const sqlSelectByType = "SELECT s.nome, count(*) from Compras c" + 
        " JOIN Servicos s on c.cod_servico = s.cod_servico" +
        " WHERE c.foi_utilizado = 1" +
        " GROUP BY s.nome";

        ret = await conexao.execute(sqlSelectByType);
        console.log(ret);
        return ret.rows;
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

function ServicoRecompensas(bd){
    this.bd = bd;

    this.getAllServicosRecompensasRealizadasByNumCartao = async function(numCartao){
        const conexao = await this.bd.getConexao();

        sqlSelect = "SELECT s.cod_servico, s.nome, s.descricao, c.foi_utilizado, c.data_compra, c.data_utilizacao, r.cod_recompensa FROM SERVICOS s" + 
        " JOIN RECOMPENSAS r on s.cod_recompensa = r.cod_recompensa" + 
        " JOIN COMPRAS c on s.cod_servico = c.cod_servico" +
        " JOIN CARTOES ca on c.num_cartao = ca.num_cartao" +
        " WHERE ca.num_cartao = :numCartao AND c.foi_utilizado = 1";

        const dados = {numCartao: numCartao};
        const ret = await conexao.execute(sqlSelect, dados);

        return ret.rows;
    }

    this.getAllServicosRecompensas = async function(){
        const conexao = await this.bd.getConexao();

        const sqlSelectAll = "SELECT s.cod_servico, s.nome, s.descricao, r.foi_obtido, r.data_recebimento, r.data_realizacao, r.cod_recompensa FROM SERVICOS s" + 
                        " JOIN RECOMPENSAS r on s.cod_recompensa = r.cod_recompensa";
        
        console.log(sqlSelectAll);
        const ret = await conexao.execute(sqlSelectAll);
        return ret.rows;
    }

    this.getAllServicosRecompensasByNumCartao = async function(numCartao){
        console.log("getAllServicosRecompensasByNumCartao");
        const conexao = await this.bd.getConexao();

        const SqlSelectAll = "SELECT s.cod_servico, s.nome, s.descricao, c.foi_utilizado, c.data_compra, c.data_utilizacao, r.cod_recompensa FROM SERVICOS s" +
        " JOIN RECOMPENSAS r on s.cod_recompensa = r.cod_recompensa" +
        " JOIN COMPRAS c on s.cod_servico = c.cod_servico" +
        " JOIN CARTOES ca on c.num_cartao = ca.num_cartao"+
        " WHERE ca.num_cartao = :numCartao";

        const dados = {numCartao: numCartao};
        const ret = await conexao.execute(SqlSelectAll,dados);

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

function Utilizacao(codCompra, codServico, nomeServico, descricaoServico, codRecompensa){
    this.codCompra = codCompra;
    this.codServico = codServico;
    this.nomeServico = nomeServico;
    this.descricaoServico = descricaoServico;
    this.codRecompensa = codRecompensa;
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
    console.log("getOne");
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

    const servico = new Servico(req.body.codServico, req.body.nome, req.body.descricao, req.body.codRecompensa);

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

async function getAllComprasNaoUtilizadasDeUmCartao(req, res){
    if(req.body.numCartao)
        return res.status(422).json();

    let get;
    const numCartao = req.params.numCartao;

    try{
        get = await global.compras.getAllComprasNaoUtilizadasDeUmCartao(numCartao);
    }catch(err){}

    if(get.length == 0){
        return res.status(404).json([]);
    } else{
        const ret = [];
        for(i=0;i<get.length;i++)
            ret.push(new Utilizacao(get[i][0], get[i][1], get[i][2], get[i][3], get[i][4]));

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

async function getOneCompraByCodCompra(req, res){
    if(req.body.codCompra)
        return res.status(422).json();

    const codCompra = req.params.codCompra;
    console.log(codCompra);
    let get;

    try{
        get = await global.compras.getOneCompraByCodCompra(codCompra);
    } catch(err){}
    if(get.length == 0){
        return res.status(404).json([]);
    } else {
        compra = get[0];
        compra = new Utilizacao(compra[0], compra[1], compra[2], compra[3], compra[4]); 
        console.log(compra);
        return res.status(200).json(compra);    
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

async function getCountComprasRecompensas(req, res){
    try{
        count = await global.compras.getCountComprasRecompensas();
        return res.status(200).json({"count": count[0][0]});
    } catch(err){
        console.error(err);
        return res.status(409).json();
    }
}

async function getCountComprasNaoUtilizadas(req,res){
    try{
        count = await global.compras.getCountComprasNaoUtilizadas();
        return res.status(200).json({"count": count[0][0]});
    } catch(err){
        console.error(err);
        return res.status(409).json();
    }
}

function TipoServico(tipo, qtd){
    this.tipo = tipo;
    this.qtd = qtd;
}

async function getServicosRealizadosByType(req,res){
    let get;
    try{
        get = await global.compras.getServicosRealizadosByType();
    } catch(err){
        console.error(err);
        return res.status(409).json();
    }
    if(get.length == 0){
        return res.status(404).json([]);
    } else {
        const ret = [];
        for(i=0;i<get.length;i++)
            ret.push(new TipoServico(get[i][0], get[i][1]));

        return res.status(200).json(ret);
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


function ServicoRecompensa(codServico, nomeServico, descServico, foiObtido, dataRecebimento, dataRealizacao, codRecompensa){
    this.codServico = codServico;
    this.nomeServico = nomeServico;
    this.descServico = descServico;
    this.foiObtido = foiObtido; 
    this.dataRecebimento = dataRecebimento;
    this.dataRealizacao = dataRealizacao;
    this.codRecompensa = codRecompensa;
}

async function utilizaServico(req, res){
    if(req.params.codServico)
        return res.status(422).json();

    const codRecompensa = req.body.codRecompensa;
    const codCompra = req.body.codCompra;
    const numCartao = req.body.numCartao; 

    console.log(codRecompensa);
    console.log(codCompra);

    try{
        if(codRecompensa != null){
            await global.recompensas.utilizaRecompensa(codRecompensa);
            console.log("Utilizou recompensa");
        }
        await global.compras.utilizaCompra(codCompra, numCartao);
        return res.status(200).json();
    } catch(err){
        console.error(err);
        return req.status(409).json();
    }
}

async function getAllServicosRecompensasRealizadasByNumCartao(req, res){
    if(req.body.numCartao)
        return res.status(422).json();

    const numCartao = req.params.numCartao;
    let get;

    try{
        get = await global.servicoRecompensas.getAllServicosRecompensasRealizadasByNumCartao(numCartao);     
        console.log("get"+ get);   
    } catch(err){}

    if(get.length == 0)
        return res.status(404).json(["Nenhum Servico Recompensa realizado"]);
    else {
        const ret = [];
        for(i=0;i<get.length;i++)
            ret.push(new ServicoRecompensa(get[i][0], get[i][1], get[i][2], get[i][3], get[i][4], get[i][5], get[i][6]));

        console.log(ret);
        return res.status(200).json(ret); 
    }
}
async function getAllServicosRecompensasByNumCartao(req, res){
    if(req.body.numCartao)
        return res.status(422).json();

    const numCartao = req.params.numCartao;
    let get;

    console.log(numCartao);
    try{
        get = await global.servicoRecompensas.getAllServicosRecompensasByNumCartao(numCartao);     
        console.log("get"+ get);   
    } catch(err){}

    if(get.length == 0)
        return res.status(404).json(["Nenhum Servico Recompensa para o cartão"]);
    else {
        const ret = [];
        for(i=0;i<get.length;i++)
            ret.push(new ServicoRecompensa(get[i][0], get[i][1], get[i][2], get[i][3], get[i][4], get[i][5], get[i][6]));

        console.log(ret);
        return res.status(200).json(ret); 
    }
}

async function getAllServicosRecompensas(req, res){
    if(req.body.numCartao)
        return res.status(422).json();

    let get;
    try{
        get = await global.servicoRecompensas.getAllServicosRecompensas();     
    } catch(err){}

    if(get.length == 0)
        return res.status(404).json([]);
    else {
        const ret = [];
        for(i=0;i<get.length;i++){
            ret.push(new ServicoRecompensa(get[i][0], get[i][1], get[i][2], get[i][3], get[i][4], get[i][5], get[i][6]));
        } 

        console.log(ret);
        return res.status(200).json(ret); 
    }
}

async function ligarServidor()
{
    const bd = new BD();
    global.servicos = new Servicos(bd);
    global.cartoes = new Cartoes (bd);
    global.compras = new Compras(bd);
    global.recompensas = new Recompensas(bd);
    global.servicoRecompensas = new ServicoRecompensas(bd);

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

    app.get('/compras/:codCompra', getOneCompraByCodCompra);
    app.post('/compras/:codServico/:numCartao', compraServico);
    app.get('/compras', getAllCompras);
    app.get('/compras/utiliza/:numCartao', getAllComprasNaoUtilizadasDeUmCartao);
    app.get('/compras/naoutilizadas/count', getCountComprasNaoUtilizadas);
    app.get('/compras/cartoes/:numCartao', getAllComprasByNumCartao);
    app.get('/compras/recompensas/count', getCountComprasRecompensas);
    app.get('/compras/servicos/tipos', getServicosRealizadosByType);
    
    app.post('/recompensas', criarRecompensa);

    app.put('/utiliza/:numCartao', utilizaServico);

    app.get('/recompensas/servicos', getAllServicosRecompensas);
    app.get('/servicos/recompensas/:numCartao', getAllServicosRecompensasRealizadasByNumCartao);
    app.get('/servicos/recompensas/all/:numCartao', getAllServicosRecompensasByNumCartao);

    app.listen(3000, () => {
        console.log('App is running on port 3000');
    });
}

ligarServidor();