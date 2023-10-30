
function Cartao (numCartao, createdDate){
    this.numCartao = numCartao;
    this.createdDate = createdDate;
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

async function ligarServidor()
{
    const bd = new BD();
    await bd.estrutureSe();
    global.cartoes = new Cartoes (bd);

    const express = require('express');

    const app = express();

    app.use(express.json());
    app.use(middleWareGlobal);

    app.post('/cartoes', criarCartao);
    app.get('/cartoes', getAllCartoes);
    app.get('/cartoes/:numCartao', getOneCartaoByNum);

    app.post('/servicos', criarServico);
    app.get('/servicos', getAllServicos);
    app.get('/servicos/:codigo', getOneServiceByCode)
    app.get('/servicos/cartoes/:numCartoes', getAllServicesByNum);
    
    app.listen(3000, () => {
        console.log('App is running on port 3000');
    });
}

ligarServidor();