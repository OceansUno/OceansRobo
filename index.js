import express from 'express';
import cors from 'cors';
import { createClientFromServiceRole } from '@base44/sdk';

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 Segurança por API Key
app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// 🧠 Cliente Base44
const base44 = createClientFromServiceRole({
  appUrl: process.env.BASE44_APP_URL
});

// 🚀 Endpoint principal
app.post('/leads', async (req, res) => {
  try {
    const {
      empresa,
      telefone,
      servico,
      origem,
      cidade,
      estado,
      nicho,
      quadro_id
    } = req.body;

    if (!empresa || !telefone || !quadro_id) {
      return res.status(400).json({
        error: 'empresa, telefone e quadro_id são obrigatórios'
      });
    }

    const lead = await base44.entities.Lead.create({
      empresa,
      telefone,
      servico: servico || 'GMN',
      status: 'ativo',
      origem: origem || 'Automação',
      cidade: cidade || '',
      estado: estado || '',
      nicho: nicho || '',
      quadro_id
    });

    res.json({ success: true, leadId: lead.id });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Erro ao criar lead',
      details: String(err)
    });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('🚀 Mina Oceans API rodando');
});
