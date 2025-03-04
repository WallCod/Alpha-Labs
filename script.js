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


//Menu Hamburguer
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
            const response = await fetch('https://alpha-labs.onrender.com/api/agendar-demo', {
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
            const response = await fetch('https://alpha-labs.onrender.com/api/contato', {
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

// Estado do chatbot para lembrar o nome, contexto e categoria
let userName = '';
let conversationHistory = [];
let currentCategory = '';

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
    if (lowerMessage.length < 2) {
        return `Hmm, mensagem muito curta, ${userName || 'amigo'}. Tente algo como 'Serviços', 'Suporte' ou 'Sobre Nós'. 😅`;
    }
    const lastUserMessage = conversationHistory[conversationHistory.length - 1]?.text.toLowerCase() || '';

    // Tentar identificar o nome do usuário
    if (!userName && lowerMessage.match(/meu nome é (.+)/i)) {
        userName = lowerMessage.match(/meu nome é (.+)/i)[1];
        return `Prazer em te conhecer, ${userName}! Como posso te ajudar hoje na Alpha Labs? 😊 Escolha uma opção: Produtos, Serviços, Suporte ou Sobre Nós.`;
    }

    // Respostas humanizadas e variadas por categorias
    const responses = {
        // Saudação inicial e genérica
        'oi': [
            `Olá, ${userName || 'amigo'}! Tudo bem? Eu sou o AlphaBot da Alpha Labs. Como posso te ajudar hoje? 😊 Escolha: Serviços, Suporte ou Sobre Nós.`,
            `Oi, tudo certo por aí? Estou aqui pra te guiar pela Alpha Labs. O que te interessa? Serviços, Suporte ou Sobre Nós? 🚀`
        ],
        'olá': [
            `E aí! Bem-vindo à Alpha Labs, ${userName || 'pessoa legal'}. O que você precisa? Serviços, Suporte ou Sobre Nós?`,
            `Oi, prazer em te ver! Como posso te ajudar hoje? Escolha uma opção: Serviços, Suporte ou Sobre Nós. 😊`
        ],

        // Categorias principais
        'software': [
            `Nossos softwares são perfeitos para automação! Incluem relatórios em tempo real e integração com APIs 🚀. Quer saber mais sobre Preços, Funcionalidades ou Demos? Digite uma opção!`,
            `Softwares da Alpha Labs: automação avançada, relatórios em tempo real, integração com APIs. O que te interessa? Preços, Funcionalidades ou Demos? 😊 Veja mais em <a href="/produtos/software">nossa página</a>.`
        ],
        'preços': [
            `Nossos preços variam: Softwares a partir de  R$ 199,00/mês. Quer uma cotação personalizada? Envie um email para alphalabsia@gmail.com ou use o formulário no rodapé!`,
            `Preços Alpha Labs: Softwares (R$ 199,90/mês). Quer mais detalhes? Email alphalabsia@gmail.com ou formulário no site. 😊`
        ],
        'funcionalidades': [
            `Nossos softwares têm automação avançada, relatórios em tempo real e APIs integráveis. Quer saber sobre automação, relatórios ou APIs? Digite uma opção!`,
            `Funcionalidades top: automação com 1 clique, relatórios dinâmicos, APIs personalizadas. O que te interessa? Automação, Relatórios ou APIs? 🚀 Veja mais em <a href="/produtos/software">aqui</a>.`
        ],
        'especificações': [
            `Hardwares com processadores de última geração, até 32GB de RAM e SSD de 1TB. Quer detalhes sobre desempenho, memória ou armazenamento? Digite uma opção!`,
            `Especificações incríveis: CPUs avançadas, 32GB RAM, SSD 1TB. O que te interessa? Desempenho, Memória ou Armazenamento? 😊 Confira em <a href="/produtos/hardware">aqui</a>.`
        ],
        'compatibilidade': [
            `Nossos Softwares são compatíveis com Windows, macOS, Linux e APIs customizadas. Quer saber mais sobre sistemas, dispositivos ou integrações? Digite uma opção!`,
            `Compatibilidade total: Windows, macOS, Linux, APIs customizadas. O que te interessa? Sistemas, Dispositivos ou Integrações? 😊 Veja em <a href="/produtos">aqui</a>.`
        ],
        'ofertas': [
            `Temos promoções incríveis! Com 20% off e pacotes de software por R$ 199,90/mês. Quer saber mais? Email alphalabsia@gmail.com ou veja em <a href="/ofertas">nossas promoções</a>.`,
            `Ofertas Alpha Labs: 20% off em  software a R$ 199,90/mês. Interessado? Contate-nos em alphalabsia@gmail.com ou veja em <a href="/ofertas">aqui</a> 😊`
        ],
        'serviços': [
            `Na Alpha Labs, oferecemos Consultoria, Implementação e Suporte Técnico. Qual te interessa? Digite 'Consultoria', 'Implementação' ou 'Suporte Técnico'.`,
            `Nossos serviços são tops: Consultoria, Implementação e Suporte Técnico. Quer saber mais sobre algum? Digite o nome! 😊`
        ],
        'consultoria': [
            `Nossa consultoria ajuda a otimizar negócios com IA e automação. Quer saber sobre Custos, Resultados ou Agendamento? Digite uma opção!`,
            `Consultoria Alpha Labs: IA e automação para crescer. O que te interessa? Custos, Resultados ou Agendamento? 😊 Veja em <a href="/servicos/consultoria">aqui</a>.`
        ],
        'consultoria de software': [
            `Nossa Consultoria de Software ajuda a otimizar negócios com automação e IA. Quer saber sobre Custos, Resultados ou Agendamento? Digite uma opção!`,
            `Consultoria de Software Alpha Labs: IA e automação para crescer. O que te interessa? Custos, Resultados ou Agendamento? 😊 Veja em <a href="/servicos/consultoria-software">aqui</a>.`
        ],
        'desenvolvimento de soluções': [
            `Nosso Desenvolvimento de Soluções cria softwares sob medida para automação e análise. Quer saber sobre Preços, Funcionalidades ou Cronograma? Digite uma opção!`,
            `Desenvolvimento de Soluções Alpha Labs: softwares personalizados para automação. O que te interessa? Preços, Funcionalidades ou Cronograma? 😊 Confira em <a href="/servicos/desenvolvimento-solucoes">aqui</a>.`
        ],
        'cronograma': [
            `Nosso cronograma para Desenvolvimento de Soluções é de 2 a 8 semanas, dependendo do projeto. Quer saber sobre etapas, prazos ou revisões? Digite uma opção!`,
            `Cronograma Alpha Labs: 2-8 semanas para soluções sob medida. O que te interessa? Etapas, Prazos ou Revisões? 😊 Confira em <a href="/servicos/desenvolvimento-solucoes">aqui</a>.`
        ],
        'processos': [
            `Nosso processo de suporte inclui tickets, chat e follow-up. Quer saber sobre abertura de tickets, resolução ou acompanhamento? Digite uma opção!`,
            `Processos Alpha Labs: tickets, chat, follow-up. O que te interessa? Abertura, Resolução ou Acompanhamento? 😊 Confira em <a href="/suporte">aqui</a>.`
        ],
        'implementação': [
            `Oferecemos implementação rápida de software e . Quer saber sobre Preços, Tempo ou Suporte? Digite uma opção!`,
            `Implementação Alpha Labs: rápida e eficiente. O que te interessa? Preços, Tempo ou Suporte? 😊 Confira em <a href="/servicos/implementacao">aqui</a>.`
        ],
        'suporte técnico': [
            `Nosso suporte é 24/7, com tickets e chat. Quer saber sobre Horários, Processos ou Contato? Digite uma opção!`,
            `Suporte Técnico Alpha Labs: 24/7, tickets e chat. O que te interessa? Horários, Processos ou Contato? 😊 Veja em <a href="/suporte">aqui</a>.`
        ],
        'suporte': [
            `Aqui na Alpha Labs, nosso Suporte Técnico é 24/7. Quer saber sobre Horários, Tutoriais ou Contato? Digite uma opção!`,
            `Suporte Alpha Labs: 24/7, com tutoriais e tickets. O que te interessa? Horários, Tutoriais ou Contato? 😊 Veja em <a href="/suporte">aqui</a>.`
        ],
        'sobre nós': [
            `Somos a Alpha Labs, especialistas em IA, automação e inovação. Quer saber sobre Missão, Equipe ou História? Digite uma opção!`,
            `Alpha Labs: IA e automação para o futuro! O que te interessa? Missão, Equipe ou História? 😊 Confira em <a href="/sobre">aqui</a>.`
        ],
        'missão': [
            `Nossa missão é transformar negócios com IA e automação, garantindo crescimento sustentável. Quer saber mais sobre valores ou impactos? Digite uma opção!`,
            `Missão Alpha Labs: IA para crescimento sustentável. O que te interessa? Valores ou Impactos? 😊 Veja em <a href="/sobre/missao">aqui</a>.`
        ],
        'equipe': [
            `Nossa equipe é composta por experts em IA, engenheiros e designers. Quer saber sobre Especialidades, Carreira ou Contato? Digite uma opção!`,
            `Equipe Alpha Labs: tops em IA e inovação. O que te interessa? Especialidades, Carreira ou Contato? 😊 Confira em <a href="/sobre/equipe">aqui</a>.`
        ],
        'história': [
            `Fundada em 2020, a Alpha Labs cresceu com IA e automação. Quer saber sobre Início, Crescimento ou Projetos? Digite uma opção!`,
            `História Alpha Labs: desde 2020, liderando com IA. O que te interessa? Início, Crescimento ou Projetos? 😊 Veja em <a href="/sobre/historia">aqui</a>.`
        ],
        'tchau': [
            `Até logo, ${userName || 'amigo'}! Se precisar, é só me chamar de novo. 😊`,
            `Tchau, ${userName || 'pessoa legal'}! Estou aqui quando você voltar. Boa sorte! 🚀`
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

    // Resposta genérica humanizada para mensagens não mapeadas
    const genericResponses = [
        `Uau, interessante, ${userName || 'amigo'}! Pode me contar mais ou perguntar algo sobre Produtos, Serviços, Suporte ou Sobre Nós?`,
        `Hmm, não sei bem como responder, mas estou aqui pra te guiar. O que você quer saber sobre a Alpha Labs? 😊`,
        `Interessante! Quer saber mais sobre nossos, Serviços, Suporte ou Sobre Nós? Digite uma dessas opções! 🚀`
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
