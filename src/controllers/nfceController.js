const { validationResult } = require('express-validator');
const NfceData = require('../models/nfceData');
const Vendor = require('../models/vendor');
const Item = require('../models/item');
const nfceQueue = require('../queues/nfceQueue');
const cache = require('../utils/cache');

exports.getNfceData = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { parametro } = req.params;

    const cachedData = await cache.get(parametro);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    const job = await nfceQueue.add({ parametro, userId: req.user.id });
    
    res.status(202).json({
      message: 'Processamento iniciado. Consulte o status usando o jobId.',
      jobId: job.id,
    });
  } catch (error) {
    console.error('Erro ao adicionar tarefa à fila:', error.message);
    res.status(500).json({ error: 'Erro ao processar sua solicitação.' });
  }
};

exports.getUserNfceData = async (req, res) => {
  try {
    const nfceDataList = await NfceData.findAll({
      where: { userId: req.user.id },
      attributes: ['id', 'totalItems', 'totalAmount', 'createdAt'], 
      order: [['createdAt', 'DESC']],
    });

    res.json(nfceDataList);
  } catch (error) {
    console.error('Erro ao obter dados das NFC-e do usuário:', error.message);
    res.status(500).json({ error: 'Erro ao processar sua solicitação.' });
  }
};

exports.getJobStatus = async (req, res) => {
  const { jobId } = req.params;

  try {
    const job = await nfceQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Tarefa não encontrada.' });
    }

    const state = await job.getState();
    const progress = job.progress();

    res.json({
      state,
      progress,
      result: job.returnvalue || null, 
    });
  } catch (error) {
    console.error('Erro ao consultar status da tarefa:', error.message);
    res.status(500).json({ error: 'Erro ao consultar o status da tarefa.' });
  }
};