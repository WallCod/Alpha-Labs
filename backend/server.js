const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const axios = require('axios');
const sanitizeHtml = require('sanitize-html');
const cors = require('cors');
const Joi = require('joi');
const pino = require('pino');
const retry = require('async-retry');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

// Esquema para agendar-demo
const demoValidationSchema = Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\d{10,11}$/).required(),
    date: Joi.date().iso().required(),
    message: Joi.string().max(500).allow('').optional()
});

// Esquema para contato
const contactValidationSchema = Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    message: Joi.string().max(500).required()
});

const sendError = (res, status, message) => {
    res.status(status).json({ success: false, message });
};

const app = express();

// Middleware para parsear JSON e URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/', rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // 100 requisições por IP
    message: { success: false, message: 'Limite de requisições excedido. Tente novamente mais tarde.' }
}));

const requiredEnvVars = ['MONGODB_URI', 'EMAIL_USER', 'EMAIL_PASSWORD', 'EMAIL_TO'];
requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
        logger.error(`Erro: Variável de ambiente ${varName} não definida.`);
        process.exit(1);
    }
});

// Configurar CORS para permitir origens específicas (ajuste para o servidor local do frontend e GitHub Pages)
const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500', 'https://wallcod.github.io/Alpha-Labs', 'https://alphalabs.lat']; // Substitua SEUNOME pelo seu username no GitHub
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            logger.error('Origem não permitida pelo CORS:', origin);
            callback(new Error('Origem não permitida pelo CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // Permite cookies, se necessário
}));

// Middleware para logar requests e verificar métodos HTTP
app.use((req, res, next) => {
    logger.info(`[${new Date().toISOString()}] ${req.method} ${req.url} - Body:`, req.body, '- Origem:', req.get('origin'), '- Método Permitido:', req.method);
    next();
});

// Conectar ao MongoDB (usando MongoDB Atlas)
const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 15000 // Tempo limite para seleção de servidor
}).then(() => {
    logger.info('Conectado ao MongoDB Atlas com sucesso!');
}).catch(err => {
    logger.error('Erro ao conectar ao MongoDB:', {
        message: err.message,
        code: err.code,
        hostname: err.hostname,
        stack: err.stack
    });
    process.exit(1); // Encerra o processo se a conexão falhar
});

// Definir o esquema do MongoDB para solicitações de demonstração
const demoSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    date: { type: Date, required: true },
    message: String,
    createdAt: { type: Date, default: Date.now }
});

const DemoRequest = mongoose.model('DemoRequest', demoSchema);

// Definir o esquema do MongoDB para mensagens de contato
const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', contactSchema);

// Configuração de transporte de email (usando Gmail) com mais depuração
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    logger: true, // Ativa logs detalhados do Nodemailer
    debug: true // Ativa depuração detalhada
});

// Testar a conexão com o Nodemailer antes de usar
transporter.verify((error, success) => {
    if (error) {
        logger.error('Erro ao verificar conexão com o Nodemailer:', {
            message: error.message,
            code: error.code,
            response: error.response,
            stack: error.stack
        });
    } else {
        logger.info('Conexão com o Nodemailer verificada com sucesso!');
    }
});

// Middleware para capturar erros inesperados
app.use((err, req, res, next) => {
    logger.error(err, 'Erro inesperado no middleware');
    sendError(res, 500, 'Erro interno no servidor. Tente novamente mais tarde.');
});

// Adicionar no início, antes das rotas POST  - recente
app.get('/', (req, res) => {
    res.status(200).json({ message: 'API da Alpha Labs - Use /api/contato ou /api/agendar-demo para envios.' });
});

// Rota para processar o agendamento de demonstração
app.post('/api/agendar-demo', async (req, res) => {
    const { error, value } = demoValidationSchema.validate(req.body, { abortEarly: false });
    if (error) {
        logger.error(error.details, 'Erro de validação');
        return sendError(res, 400, error.details.map(e => e.message).join(', '));
    }
    const { name, email, phone, date, message } = value;

    try {
        logger.info(`Processando POST /api/agendar-demo - Dados recebidos:`, { name, email, phone, date, message });
        if (!name || !email || !phone || !date) {
            logger.error('Campos obrigatórios ausentes:', { name, email, phone, date });
            return res.status(400).json({ success: false, message: 'Por favor, preencha todos os campos obrigatórios.' });
        }

        // Sanitizar a mensagem para evitar XSS
        const cleanMessage = message ? sanitizeHtml(message, {
            allowedTags: [], // Remove todas as tags HTML
            allowedAttributes: {}
        }) : '';
        const demoRequest = new DemoRequest({
            name,
            email,
            phone,
            date: parsedDate,
            message: cleanMessage
        });

        // Validações adicionais
        const phoneRegex = /^\d{10,11}$/;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!phoneRegex.test(phone)) {
            logger.error('Telefone inválido:', phone);
            return res.status(400).json({ success: false, message: 'Telefone deve ter 10 ou 11 dígitos.' });
        }
        if (!emailRegex.test(email)) {
            logger.error('E-mail inválido:', email);
            return res.status(400).json({ success: false, message: 'E-mail deve ser válido.' });
        }

        // Normalizar e validar a data
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
            logger.error('Data inválida:', date);
            return res.status(400).json({ success: false, message: 'Data e hora preferida inválida.' });
        }


        // Tentar salvar no MongoDB com timeout para evitar bloqueios
        const saveResult = await Promise.race([
            demoRequest.save(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout ao salvar no MongoDB')), 5000))
        ]);
        logger.info('Dados salvos no MongoDB com sucesso:', saveResult);

        // Enviar email de notificação com tratamento de erro detalhado e retry
        await retry(async () => {
            await transporter.sendMail({
                from: `Alpha Labs <${process.env.EMAIL_USER}>`,
                to: process.env.EMAIL_TO,
                subject: 'Nova Solicitação de Demonstração',
                text: `Nome: ${name}\nEmail: ${email}\nTelefone: ${phone}\nData/Hora: ${parsedDate.toLocaleString()}\nComentários: ${cleanMessage || 'Nenhum'}`
            });
        }, {
            retries: 3,
            minTimeout: 1000,
            maxTimeout: 5000
        })

        // Tentativa de reenvio após um pequeno delay
        try {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Espera 2 segundos
            const emailInfoRetry = await transporter.sendMail({
                from: `Alpha Labs <${process.env.EMAIL_USER}>`,
                to: process.env.EMAIL_TO,
                subject: 'Nova Solicitação de Demonstração (Tentativa de Reenvio)',
                text: `Nome: ${name}\nEmail: ${email}\nTelefone: ${phone}\nData/Hora: ${parsedDate.toLocaleString()}\nComentários: ${cleanMessage || 'Nenhum'}`
            });
            logger.info('E-mail enviado com sucesso na tentativa de reenvio para:', process.env.EMAIL_TO, '- Detalhes:', emailInfoRetry);
        } catch (retryError) {
            logger.error('Erro ao enviar e-mail na tentativa de reenvio:', {
                message: retryError.message,
                code: retryError.code,
                response: retryError.response,
                stack: retryError.stack
            });
            return res.status(500).json({ success: false, message: 'Erro ao enviar e-mail. Tente novamente mais tarde.' });
        }
        res.json({ success: true, message: 'Solicitação enviada com sucesso! Nossa equipe entrará em contato em breve.' });
    } catch (error) {
        logger.error('Erro geral ao processar a solicitação:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            data: { name, email, phone, date, message }
        });
        res.status(500).json({ success: false, message: 'Erro ao processar a solicitação. Tente novamente mais tarde.' });
    }
});

// Rota para processar o formulário de contato
app.post('/api/contato', async (req, res) => {
    const { error, value } = contactValidationSchema.validate(req.body, { abortEarly: false });
    if (error) {
        logger.error('Erro de validação:', error.details);
        return res.status(400).json({ success: false, message: error.details.map(e => e.message).join(', ') });
    }
    const { name, email, message } = value;

    try {
        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: 'Por favor, preencha todos os campos obrigatórios.' });
        }

        const contact = new Contact({
            name,
            email,
            message
        });

        await contact.save();

        // Enviar email de notificação
        await retry(async () => {
            await transporter.sendMail({
                from: `Alpha Labs <${process.env.EMAIL_USER}>`,
                to: process.env.EMAIL_TO,
                subject: 'Nova Mensagem de Contato',
                text: `Nome: ${name}\nEmail: ${email}\nMensagem: ${cleanMessage}`
            });
        }, {
            retries: 3,
            minTimeout: 1000,
            maxTimeout: 5000
        });

        // Iniciar o servidor
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            logger.info(`Servidor rodando na porta ${PORT}`);
        });
    } catch (error) {
        logger.error('Erro ao processar o formulário de contato:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            data: { name, email, message }
        });
        res.status(500).json({ success: false, message: 'Erro ao processar a solicitação de contato. Tente novamente mais tarde.' });
    }
});