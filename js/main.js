//variaveis globais
let deck_info = {}
let player_hand = []
let computer_hand = []
let computer_blackJack
let player_blackJack
let player_life = 100;
let enemy_life = 100;
let dice;
let gameEnd;

//Ativa quando a pagina é carregada
document.addEventListener('DOMContentLoaded', (event) => {
    initGame();
});

//função que inicia o jogo
function initGame() {
    openModal('dados')
}

//função para recarregar a pagina para jogar novamente
function playAgain(){
    location.reload();
}

//função para abrir modal 
const openModal = (idModal) => {
    const modal = document.getElementById(idModal)
    modal.style.display = 'flex'
}

//função para fechar modal 
const closeModal = (event, id) => {
    if (id) {
        const modal = document.getElementById(id)
        modal.style.display = 'none'
        return
    }

    if (event?.target?.className === "modal") {
        const modal = document.getElementById(event.target.id)
        modal.style.display = 'none'
        return
    }
}

//função de criação do deck utilizando a API
async function addDeck() {
    try {
        const response = await fetch("https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6")
        const result = await response.json()
        if (!response.ok) {
            throw new Error("Erro ao buscar dados")
        }
        if (result) {
            //carrega informações importantes da criação do deck
            deck_info = {
                deck_id: result.deck_id,
                cartas: result.remaining
            }
        }
    } catch (error) {
        alert("erro ao consultar ação: " + error.message)
    }

}

//função para comprar carta por meio da API
async function drawCard(quantidade) {
    try {
        if (!deck_info.deck_id) {
            throw new Error("deck_id não definido")
        }
        const response = await fetch(`https://www.deckofcardsapi.com/api/deck/${deck_info.deck_id}/draw/?count=${quantidade}`)
        const result = await response.json()
        return result.cards;

    } catch (error) {
        alert("erro ao puxar carta: " + error.message)
    }
}

//função principal que controla o inicio do jogo
async function gameStart() {
    //inicia o jogo chamando a API para gerar um deck de cartas
    await addDeck()
    //inicia comprando as duas cartas do jogador
    const data = await drawCard(2)
    if (data) {
        player_hand = data.map(card => ({
            valor: card.value,
            naipe: card.suit,
            image: card.image
        }))
    }
    //compra a carta inicial do computador
    await computerInitialDraw();
    let numtotal = calcularTotal(player_hand)

    //verifica se o jogador conseguiu o Blackjack, ou seja atingiu 21 com as duas iniciais
    if (numtotal == 21) {
        player_blackJack = true
        document.getElementById('side_options').style.visibility = 'hidden';
        await (1000)
        computerPlay()
    }else{
         document.getElementById('side_options').style.visibility = 'visible';
    }
    
    //chama a função de exibição das cartas
    displayCards('player')
    displayCards('computer')
}

//função responsavel pela compra de cartas pelo player
async function moreCard() {
    //requisita a API para comprar uma carta
    const data = await drawCard(1)
    if (data) {
        data.forEach(card => {
            player_hand.push({
                valor: card.value,
                naipe: card.suit,
                image: card.image
            });
        });
        displayCards('player')
        //calcula o total das cartas utilizando a função calcularTotal
        let numtotal = calcularTotal(player_hand)

        //verifica se o player atingiu o valor 21 para que seja registrado o acerto critico
        //e tambem para desativar os botões de pedir cartas e para que o computador jogue
        if (numtotal == 21) {
            player_blackJack = true;
            document.getElementById('side_options').style.visibility = 'hidden';
            computerPlay()
        }

        //verifica se o plater passou de 21 para que o computador jogue
        if (numtotal > 21) {
            document.getElementById('side_options').style.visibility = 'hidden';
            computerPlay()
            return
        }
    }
}

//função usada para o botão de parar, ou seja, passando para o computador jogar
function stopCard() {
    computerPlay()
    document.getElementById('side_options').style.visibility = 'hidden';
}

//função que calcula o valor das cartas em posse
function calcularTotal(hand) {
    let total = 0
    let aces = 0
    hand.forEach(card => {
        let num = parseInt(card.valor)
        //verifica se o valor da carta é diferente de um numero
        if (isNaN(num)) {
            if (card.valor === "ACE") {
                aces++
                return
            } else {
                num = 10
            }
        }
        total += num
    })
    //calculo dos ÁS's que pode assumir valor 1 ou 11
    for (let i = 0; i < aces; i++) {
        if ((total + 11) <= 21) {
            total += 11
        } else {
            total += 1
        }
    }

    //atualiza o campo de soma no jogo 
    if (hand === player_hand) {
        document.getElementById('totalValuePlayer').textContent = total;
    }
    if (hand === computer_hand) {
        document.getElementById('totalValueEnemy').textContent = total;
    }
    return total
}

//função responsavel pela primeira carta a ser comprada pelo computador
async function computerInitialDraw() {
    const data = await drawCard(1);
    if (data) {
        computer_hand = data.map(card => ({
            valor: card.value,
            naipe: card.suit,
            image: card.image
        }));
    }
    calcularTotal(computer_hand)
}

//função responsavel pelas seguintes compras de cartas do computador 
async function computerDraw() {
    const data = await drawCard(1);
    if (data) {
        data.forEach(card => {
            computer_hand.push({
                valor: card.value,
                naipe: card.suit,
                image: card.image
            });
        });
    }
    //exibe a nova carta do computador na mesa
    displayCards('computer')
}

//função responsavel pelo controle da jogada do computador
async function computerPlay() {
    await delay(1000);

    //laço de repetição para que o computador pare de comprar cartas apenas quando se tiver 18 ou mais
    while (calcularTotal(computer_hand) <= 17) {
        await computerDraw();
        await delay(800);
    }

    //verifica se o computador conseguiu um acerto critico
    if (calcularTotal(computer_hand) == 21) {
        computer_blackJack = true;
    }
    //chama a função de fim de rodada
    end_game()
}

//função responsavel pelo controle do fim da rodada
async function end_game() {
    //chama as funções para descobrir o vencedor e o dano da rodada
    let vencedor = decideWinner()
    let dano = rolldice(dice)
    await delay(500)

    //chama a função para ser apresentado na tela o vencedor 
    showWinner(vencedor, dano)

    //verifica se houve algum 21 na rodada
    if (vencedor === 'jogador') {
        if(player_blackJack == true){
            dano = (dano*2)
            decreaseLife('computador',dano)
        }
        else{
            decreaseLife('computador', dano)
        }
    }
    else if (vencedor === 'computador') {
        if(computer_blackJack == true){
            dano = (dano*2)
            decreaseLife('jogador',dano)
        }
        else{
            decreaseLife('jogador', dano)
        }
    }

    //chama as funções para resetar as variaveis para a proxima rodada
    deleteCards()
    deleteDice()
    deleteBlackjacks()
    await delay(2000)

    //verifica se o jogador ou o computador chegou a 0 de vida
    if(gameEnd == true){
        openModal('fimdeJogo')
    }else{
       initGame() 
    }
    

}

//função responsavel pela comparação de cartas para se descobrir o vencedor
function decideWinner() {
    let player = calcularTotal(player_hand)
    let computer = calcularTotal(computer_hand)

    if (player > 21 && computer > 21) {
        return "empate";
    } else if (player > 21) {
        return "computador";
    } else if (computer > 21) {
        return "jogador";
    } else if (player === computer) {
        return "empate";
    } else if (player > computer) {
        return "jogador";
    } else {
        return "computador";
    }
}

//função que exibe o vencedor 
async function showWinner(vencedor, dano) {
    document.getElementById('vencedor').textContent = vencedor

    //em caso de impate não há dano
    if(vencedor == 'empate'){
        dano = 0
    }
    //em caso de 21, o dano é dobrado
    if(player_blackJack == true || computer_blackJack ==true){
        dano = (dano*2)
    }
    document.getElementById('danoRodado').textContent = dano

    //abre o modal e o fecha apos o delay 
    openModal('mostrarResultado')
    await delay(1800)
    closeModal(event, 'mostrarResultado')
}

//função que deleta as mãos do jogador e do computador
function deleteCards() {
    deck_info = {}
    player_hand = []
    computer_hand = []
    displayCards('player')
    displayCards('computer')
}

//função que deleta o dado de escolha do jogador
function deleteDice() {
    dice = {}
}

//função que reseta a variavel de 21
function deleteBlackjacks(){
    player_blackJack = {}
    computer_blackJack = {}
}

//função que seta o dado de dano selecionado
async function chosedice(valor) {
    dice = valor;
    await delay(200)
    gameStart()
}

//função de rolagem de dano, gerando um numero aleatorio com base no dado selecionado
function rolldice(dice) {
    let dano = Math.floor(Math.random() * (dice - 1 + 1)) + 1
    return dano
}

//função para a diminuição da barra de vida do jogador ou do computador
function decreaseLife(character, qtd) {
    if (character === 'jogador') {
        player_life -= qtd;
        //verificação se a barra de vida chegou a zero
        if (player_life < 0) {
            player_life = 0;
            gameEnd = true
        }
    } else if (character === 'computador') {
        enemy_life -= qtd;
        //verificação se a barra de vida chegou a zero
        if (enemy_life < 0) {
            enemy_life = 0;
            gameEnd = true
        }   
    }
    updateLifeBar(character);
}

//função que atualiza e exibe a barra de vida do jogador e do computador
function updateLifeBar(character) {
    let lifeBarInner;
    let currentLife;

    if (character === 'jogador') {
        lifeBarInner = document.getElementById('bar_user_pt');
        currentLife = player_life;
        document.getElementById('valueUser').textContent = player_life;

    } else if (character === 'computador') {
        lifeBarInner = document.getElementById('bar_enemy_pt');
        currentLife = enemy_life;
        document.getElementById('valueEnemy').textContent = enemy_life;
    }
    lifeBarInner.style.width = currentLife + '%';
}

//função que exibe as cartas na tela
function displayCards(playerType) {
    let hand, cardContainer;

    if (playerType === 'player') {
        hand = player_hand;
        cardContainer = document.getElementById('player_cards');
    } else if (playerType === 'computer') {
        hand = computer_hand;
        cardContainer = document.getElementById('computer_cards');
    }

    cardContainer.innerHTML = '';

    //carrega a img armazenada nas cartas puxadas pela API
    hand.forEach(card => {
        const img = document.createElement('img');
        img.src = card.image;
        cardContainer.appendChild(img);
    });
}

// Função delay que retorna uma Promise que resolve após o tempo especificado
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}