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

// Estado do chatbot para lembrar o nome e histórico
let userName = '';
let conversationHistory = [];

// URL do webhook do n8n (substitua pela sua URL real)
const webhookUrl = 'https://n8n.alphalabs.lat/webhook/c6098f81-b4eb-4c83-8990-2cb52b819900/chat'; // Insira a URL do seu webhook aqui

chatbotIcon.addEventListener('click', function () {
    chatbotContent.classList.toggle('hidden');
    const isOpen = !chatbotContent.classList.contains('hidden');
    chatbotContent.setAttribute('aria-hidden', !isOpen);
    chatbotIcon.setAttribute('aria-expanded', isOpen);
    if (isOpen) {
        chatInput.focus();
        // Saudação inicial se for a primeira abertura
        if (conversationHistory.length === 0) {
            const greeting = "Oi! Eu sou o Alpha, seu assistente da Alpha Labs. Como posso te ajudar hoje?😊";
            chatOutput.innerHTML += `<p class="chat-message bot"><strong>Alpha:</strong> ${greeting}</p>`;
            chatOutput.scrollTop = chatOutput.scrollHeight;
        }
    }
});

chatInput.addEventListener('keypress', async function (e) {
    if (e.key === 'Enter' && chatInput.value.trim()) {
        const userMessage = chatInput.value.trim();
        conversationHistory.push({ user: true, text: userMessage });

        // Adicionar mensagem do usuário
        chatOutput.innerHTML += `<p class="chat-message user"><strong>Você:</strong> ${userMessage}</p>`;
        chatOutput.scrollTop = chatOutput.scrollHeight;

        // Enviar mensagem para o n8n e obter resposta do agente
        try {
            const botResponse = await sendMessageToN8n(userMessage);
            chatOutput.innerHTML += `<p class="chat-message bot"><strong>Alpha:</strong> ${botResponse}</p>`;
            chatOutput.scrollTop = chatOutput.scrollHeight;
        } catch (error) {
            console.error('Erro ao chamar o n8n:', error);
            chatOutput.innerHTML += `<p class="chat-message bot"><strong>Alpha:</strong> Desculpe, algo deu errado. Tente novamente! 😅</p>`;
            chatOutput.scrollTop = chatOutput.scrollHeight;
        }

        chatInput.value = '';
    }
});

// Função para enviar mensagem ao n8n e receber resposta
async function sendMessageToN8n(userMessage) {
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userMessage })
        });
        const data = await response.json();
        console.log("Resposta do n8n:", data);
        return data.reply || 'Desculpe, não consegui processar sua mensagem. Tente novamente mais tarde!';
    } catch (error) {
        console.error("Erro ao chamar o n8n:", error);
        return 'Desculpe, houve um erro ao processar sua mensagem. Por favor, tente novamente!';
    }
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
