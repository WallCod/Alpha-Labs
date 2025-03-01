// Inicializar AOS (animações)
document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        duration: 1000,
        once: true
    });

    // Scroll suave com ajuste para o cabeçalho fixo
document.querySelectorAll('.nav-links a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const headerHeight = document.querySelector('header').offsetHeight; // Pega a altura do cabeçalho
            const targetPosition = targetElement.offsetTop - headerHeight; // Subtrai a altura do cabeçalho
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth' // Mantém a rolagem suave
            });
        }
    });
});

document.querySelector('#navToggle').addEventListener('click', function() {
    document.querySelector('.nav-links').classList.toggle('active');
});
    // Abrir Modal de Demonstração
    document.getElementById('demoBtn').addEventListener('click', function() {
        const modal = document.getElementById('demoModal');
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        document.getElementById('demoName').focus();
    });

    // Fechar Modal
    document.getElementById('closeModal').addEventListener('click', function() {
        const modal = document.getElementById('demoModal');
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        resetForm('demoForm');
    });

    // Fechar Modal ao clicar fora
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('demoModal');
        if (event.target === modal) {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
            resetForm('demoForm');
        }
    });

    // Validar e Enviar Formulário de Demonstração
    document.getElementById('demoForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const name = document.getElementById('demoName').value.trim();
        const email = document.getElementById('demoEmail').value.trim();
        const phone = document.getElementById('demoPhone').value.trim().replace(/[\s()-]/g, '');
        const date = document.getElementById('demoDate').value;
        const message = document.getElementById('demoMessage').value.trim();

        console.log('Dados enviados:', { name, email, phone, date, message });

        const successPopup = document.getElementById('demoSuccessPopup'); // Usando o pop-up específico do modal
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const phoneRegex = /^\d{10,11}$/;

        if (!name || !email || !phone || !date || !emailRegex.test(email) || !phoneRegex.test(phone)) {
            alert('Por favor, preencha todos os campos corretamente. Email deve ser válido e telefone deve ter 10 ou 11 dígitos.');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/agendar-demo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, date, message }),
                mode: 'cors'
            });

            console.log('Resposta bruta do servidor:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                headers: Object.fromEntries(response.headers.entries())
            });

            if (!response.ok) {
                let errorData = null;
                try {
                    errorData = await response.json();
                    console.log('Dados de erro JSON recebidos:', errorData);
                } catch (parseError) {
                    console.error('Erro ao parsear resposta JSON:', parseError);
                    const textResponse = await response.text();
                    console.log('Resposta de texto do servidor:', textResponse);
                    throw new Error('Resposta inválida do servidor.');
                }
                throw new Error(errorData?.message || 'Erro ao enviar solicitação. Resposta inválida do servidor.');
            }

            const data = await response.json();
            console.log('Dados JSON recebidos:', data);

            // Mostra o pop-up específico do modal
            successPopup.classList.remove('hidden');
            successPopup.style.display = 'flex';

            // Reseta o formulário e fecha o modal após 3 segundos
            setTimeout(() => {
                successPopup.classList.add('hidden');
                successPopup.style.display = 'none';
                document.getElementById('demoModal').style.display = 'none';
                document.getElementById('demoModal').setAttribute('aria-hidden', 'true');
                resetForm('demoForm');
            }, 3000);

        } catch (error) {
            console.error('Erro ao enviar solicitação:', {
                message: error.message,
                stack: error.stack
            });
            alert(`Erro: ${error.message}`);
        }
    });

    // Validar e Enviar Formulário de Contato
    document.getElementById('contactForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const name = document.getElementById('nome').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('mensagem').value.trim();

        console.log('Dados enviados (contato):', { name, email, message });

        const successPopup = document.getElementById('successPopup'); // Pop-up do footer
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!name || !email || !message || !emailRegex.test(email)) {
            alert('Por favor, preencha todos os campos corretamente. E-mail deve ser válido.');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/contato', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, message }),
                mode: 'cors'
            });

            console.log('Resposta bruta do servidor (contato):', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                headers: Object.fromEntries(response.headers.entries())
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || 'Erro ao enviar mensagem.');
            }

            const data = await response.json();
            console.log('Dados JSON recebidos (contato):', data);

            // Mostra o pop-up do footer
            successPopup.classList.remove('hidden');
            successPopup.style.display = 'flex';

            // Reseta o formulário após 3 segundos
            setTimeout(() => {
                successPopup.classList.add('hidden');
                successPopup.style.display = 'none';
                this.reset();
            }, 3000);

        } catch (error) {
            console.error('Erro ao enviar mensagem:', {
                message: error.message,
                stack: error.stack
            });
            alert(`Erro: ${error.message}`);
        }
    });

    // Chatbot Retrátil
const chatbotIcon = document.getElementById('chatbotIcon');
const chatbotContent = document.getElementById('chatbotContent');
const chatInput = document.getElementById('chatInput');
const chatOutput = document.getElementById('chatOutput');

// Estado do chatbot para lembrar o nome e contexto
let userName = '';
let conversationHistory = [];

chatbotIcon.addEventListener('click', function () {
    chatbotContent.classList.toggle('hidden');
    const isOpen = !chatbotContent.classList.contains('hidden');
    chatbotContent.setAttribute('aria-hidden', !isOpen);
    chatbotIcon.setAttribute('aria-expanded', isOpen);
    if (isOpen) {
        chatInput.focus();
        // Saudação inicial se for a primeira abertura
        if (conversationHistory.length === 0) {
            const greeting = "Oi! Eu sou o AlphaBot, seu assistente da Alpha Labs. Como posso te ajudar hoje? 😊 Qual é o seu nome?";
            chatOutput.innerHTML += `<p class="chat-message bot"><strong>AlphaBot:</strong> ${greeting}</p>`;
            chatOutput.scrollTop = chatOutput.scrollHeight;
        }
    }
});

chatInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && chatInput.value.trim()) {
        const userMessage = chatInput.value.trim();
        conversationHistory.push({ user: true, text: userMessage });

        // Adicionar mensagem do usuário
        chatOutput.innerHTML += `<p class="chat-message user"><strong>Você:</strong> ${userMessage}</p>`;
        chatOutput.scrollTop = chatOutput.scrollHeight;

        // Processar mensagem e gerar resposta humanizada
        setTimeout(() => {
            let botResponse = generateBotResponse(userMessage);
            chatOutput.innerHTML += `<p class="chat-message bot"><strong>AlphaBot:</strong> ${botResponse}</p>`;
            chatOutput.scrollTop = chatOutput.scrollHeight;
        }, 1000); // Simula atraso humano (1 segundo)

        chatInput.value = '';
    }
});

function generateBotResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    const lastUserMessage = conversationHistory[conversationHistory.length - 1]?.text.toLowerCase() || '';

    // Tentar identificar o nome do usuário
    if (!userName && lowerMessage.match(/meu nome é (.+)/i)) {
        userName = lowerMessage.match(/meu nome é (.+)/i)[1];
        return `Prazer em te conhecer, ${userName}! Como posso te ajudar hoje? 😊`;
    }

    // Respostas humanizadas e variadas
    const responses = {
        'oi': [
            `Olá! Tudo bem? Eu sou o AlphaBot da Alpha Labs. Como posso ajudar hoje?`,
            `Oi, tudo certo por aí? Estou à disposição para ajudar com a Alpha Labs!`
        ],
        'olá': [
            `E aí! Bem-vindo à Alpha Labs. O que você precisa?`,
            `Oi, prazer em te ver! Como posso te ajudar hoje? 😊`
        ],
        'serviços': [
            `Nós da Alpha Labs oferecemos atendimento humanizado, chatbots com IA, análise preditiva, automação de fluxos e muito mais! Quer saber mais sobre algo específico?`,
            `Aqui na Alpha Labs, temos serviços incríveis como IA para chatbots, automação e análise preditiva. Posso te contar mais?`
        ],
        'demonstração': [
            `Ótimo! Clique em 'Agendar Teste Grátis' na página inicial para marcar uma sessao com a gente. Quer que eu te guie até lá?`,
            `Legal, vamos agendar! Vá até a página inicial e clique em 'Agendar Demonstração'. Posso te ajudar com mais alguma coisa?`
        ],
        'preço': [
            `Os preços variam dependendo do projeto. Quer uma cotação personalizada? Envie um email para alphalabsia@gmail.com ou use o formulário no rodapé!`,
            `Nossos preços são customizados pra cada cliente. Quer falar com a gente pelo email alphalabsia@gmail.com ou pelo formulário?`
        ],
        'contato': [
            `Você pode nos contatar pelo formulário 'Entre em Contato' no rodapé ou por email em alphalabsia@gmail.com. Como posso facilitar isso pra você?`,
            `Fácil! Use o formulário no rodapé ou nos envie um email para alphalabsia@gmail.com. Posso te ajudar a preencher algo?`
        ],
        'sobre': [
            `Somos a Alpha Labs, especializados em automação com IA para transformar negócios. Quer saber mais sobre nossa missão ou serviços?`,
            `A Alpha Labs é referência em IA e automação, ajudando empresas a crescer. Posso contar mais ou te direcionar para algo específico?`
        ],
        'tchau': [
            `Até logo, ${userName || 'amigo'}! Se precisar, é só me chamar de novo. 😊`,
            `Tchau, ${userName || 'pessoa legal'}! Estou aqui quando você voltar. Boa sorte!`
        ]
    };

    // Resposta padrão para mensagens não reconhecidas
    if (!lowerMessage) {
        return "Hmm, parece que não entendi. Pode explicar melhor ou me perguntar algo sobre a Alpha Labs? 😅";
    }

    // Verificar se a mensagem contém uma chave de resposta
    for (let key in responses) {
        if (lowerMessage.includes(key)) {
            return responses[key][Math.floor(Math.random() * responses[key].length)];
        }
    }

    // Resposta genérica humanizada
    const genericResponses = [
        `Uau, interessante! Pode me contar mais ou perguntar algo sobre a Alpha Labs?`,
        `Hmm, não sei bem como responder, mas estou aqui pra ajudar. O que você quer saber sobre a Alpha Labs? 😊`,
        `Interessante! Quer saber mais sobre nossos serviços, contato, ou demonstração?`
    ];
    return genericResponses[Math.floor(Math.random() * genericResponses.length)];
}

    // Modo Escuro
    document.getElementById('themeToggle').addEventListener('click', function() {
        document.body.classList.toggle('dark');
        const isDark = document.body.classList.contains('dark');
        this.textContent = isDark ? '☀️' : '🌙';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    // Carregar tema salvo
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        document.getElementById('themeToggle').textContent = '☀️';
    }

    // Inicializar Carrossel (Owl Carousel)
    $(document).ready(function() {
        try {
            $(".owl-carousel").owlCarousel({
                loop: true,
                margin: 20,
                nav: true,
                dots: true,
                autoplay: true,
                autoplayTimeout: 5000,
                responsive: {
                    0: { items: 1 },
                    768: { items: 2 },
                    1000: { items: 3 }
                }
            });
        } catch (error) {
            console.error('Erro ao inicializar o Owl Carousel:', error);
        }
    });

    // Contadores de Estatísticas
    const stats = document.querySelectorAll('.stat-item h3');
    stats.forEach(stat => {
        const targetText = stat.textContent;
        const symbol = targetText.includes('+') ? '+' : targetText.includes('%') ? '%' : '';
        const number = parseInt(targetText.replace(/[^0-9]/g, '')) || 0;

        let count = 0;
        const duration = 2000;
        const start = performance.now();

        function updateCounter(timestamp) {
            const elapsed = timestamp - start;
            count = Math.min(number, (elapsed / duration) * number);
            stat.textContent = Math.round(count) + symbol;

            if (count < number) {
                requestAnimationFrame(updateCounter);
            }
        }

        requestAnimationFrame(updateCounter);
    });

    // Botão Voltar ao Topo
    const backToTop = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Fechar Pop-ups ao clicar no botão "Fechar"
    document.getElementById('closePopup').addEventListener('click', function() {
        const successPopup = document.getElementById('successPopup');
        successPopup.classList.add('hidden');
        successPopup.style.display = 'none';
    });

    document.getElementById('closeDemoPopup').addEventListener('click', function() {
        const demoSuccessPopup = document.getElementById('demoSuccessPopup');
        demoSuccessPopup.classList.add('hidden');
        demoSuccessPopup.style.display = 'none';
    });
});

function resetForm(formId) {
    document.getElementById(formId).reset();
    // Não precisa mais resetar o pop-up aqui, pois isso será tratado nos eventos de envio
}


//Obter IP público atual
async function getPublicIP() {
    try {
        const response = await axios.get('https://api.ipify.org');
        return response.data; // Retorna o IP público (ex.: "179.106.174.177")
    } catch (error) {
        console.error('Erro ao obter IP público:', error.message);
        throw error;
    }
}

// Função para autenticar com a API do Atlas
function getAtlasAuthHeader(publicKey, privateKey) {
    const auth = Buffer.from(`${publicKey}:${privateKey}`).toString('base64');
    return { Authorization: `Basic ${auth}` };
}

// Função para listar IPs na whitelist
async function listIPWhitelist(groupId, publicKey, privateKey) {
    try {
        const response = await axios.get(
            `https://cloud.mongodb.com/api/atlas/v2/groups/${groupId}/accessList`,
            { headers: getAtlasAuthHeader(publicKey, privateKey) }
        );
        return response.data.results;
    } catch (error) {
        console.error('Erro ao listar IPs na whitelist:', error.message);
        throw error;
    }
}

// Função para adicionar IP à whitelist
async function addIPToWhitelist(groupId, ip, publicKey, privateKey) {
    try {
        const response = await axios.post(
            `https://cloud.mongodb.com/api/atlas/v2/groups/${groupId}/accessList`,
            [{ ipAddress: ip, comment: `IP dinâmico atualizado em ${new Date().toISOString()}` }],
            { headers: getAtlasAuthHeader(publicKey, privateKey) }
        );
        console.log('IP adicionado à whitelist com sucesso:', ip);
        return response.data;
    } catch (error) {
        console.error('Erro ao adicionar IP à whitelist:', error.message);
        throw error;
    }
}

// Exemplo de uso
const groupId = 'SEU_GROUP_ID'; // Substitua pelo seu groupId do Atlas
const publicKey = 'SUA_PUBLIC_KEY'; // Substitua pela Public Key da API
const privateKey = 'SUA_PRIVATE_KEY'; // Substitua pela Private Key da API

async function updateAtlasIP() {
    try {
        const currentIP = await getPublicIP();
        const whitelist = await listIPWhitelist(groupId, publicKey, privateKey);

        // Verifica se o IP atual já está na whitelist
        const ipExists = whitelist.some(entry => entry.ipAddress === currentIP);
        if (!ipExists) {
            await addIPToWhitelist(groupId, currentIP, publicKey, privateKey);
        } else {
            console.log('IP já está na whitelist:', currentIP);
        }
    } catch (error) {
        console.error('Erro ao atualizar IP no Atlas:', error);
    }
}

// Executa uma vez para testar
updateAtlasIP();

// Teste local
getPublicIP().then(ip => console.log('IP Público:', ip));