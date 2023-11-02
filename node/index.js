
function BD(){
    process.env.ORA_SDTZ = 'UTC-3';

    this.getConexao = async function (){
        if (global.conexao)
            return global.conexao;

        const oracledb = require('oracledb');
        const dbConfig = require('./dbconfig.js');

        try 
        {
            global.conexao = await oracledb.getConnection(dbConfig);
        }
        catch (exception){
            console.log('Não foi possível conectar ao BD');
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
                        "VALUES (:0, sysdate)";
        const dados = [cartao.numCartao];
        console.log(sqlInsert, dados);
        await conexao.execute(sql1, dados);
        
        const sqlCommit = 'COMMIT';
        await conexao.execute(sqlCommit);
    }

    this.getAllCartoes = async function (){
        const conexao = await this.bd.geConexao();

        const sqlSelect = "SELECT * FROM Cartoes";

        ret = await conexao.execute(sqlSelect);

        return ret.rows;
    }

    this.getOneCartaoByNum = async function (numero){
        const conexao = await this.bd.getConexao();

        const sqlSelectOne = "SELECT NUM_CARTAO,TO_CHAR(CREATED_DATE, 'YYYY-MM-DD HH24:MI:SS')" + 
                                "FROM Cartoes WHERE NUM_CARTAO = :0";
        
        const dados = [numero];
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


function middleWareGlobal(req, res, next)
{
    console.time('Requisição');
    console.log('Método: ' + req.method + '; URL: ' + req.url);

    next();

    console.log('Finalizou');

    console.timeEnd('Requisição');
}

async function criarCartao(req, res){
    if(req.body.numCartao || req.body.createdDate){
        return res.status(422).json();
    }

    const numCartao = req.params.numCartao;
    
    const cartao = new Cartao(numCartao, LocalDateTime.now());

    try{
        await global.cartoes.criarCartao(cartao);
        return res.status(201).json();
    }
    catch(exception){
        console.log('Cartão já existente com o número '+ numCartao);
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

    //if(get.length()==0)
    //{
    //    return res.status(200).json([]);
    //}
   
        const ret = [];
        for(i=0;i<get.length;i++)
            ret.push(new Cartao(get[i][0], get[i][1]));

        return res.status(200).json(ret);
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


async function ligarServidor()
{
    const bd = new BD();
    global.cartoes = new Cartoes (bd);

    const express = require('express');

    const app = express();

    app.use(express.json());
    app.use(middleWareGlobal);

    app.post('/cartoes/:numCartao', criarCartao);
    app.get('/cartoes', getAllCartoes);
    app.get('/cartoes/:numCartao', getOneCartaoByNum);

    //app.post('/servicos', criarServico);
    //app.get('/servicos', getAllServicos);
    //app.get('/servicos/:codigo', getOneServiceByCode)
    //app.get('/servicos/cartoes/:numCartoes', getAllServicesByNumCard);
    
    app.listen(3000, () => {
        console.log('App is running on port 3000');
    });
}

ligarServidor();