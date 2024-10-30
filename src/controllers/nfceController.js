// controllers/nfceController.js
const { validationResult } = require('express-validator');
const nfceService = require('../services/nfceService');
const NfceData = require('../models/nfceData'); // Importe o modelo NfceData

exports.getNfceData = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { parametro } = req.params;

    const nfceData = await nfceService.fetchNfceData(parametro);

    if (!nfceData) {
      return res.status(404).json({ message: 'Dados da NFC-e não encontrados' });
    }

    const savedData = await NfceData.create({
      data: nfceData,
      userId: req.user.id, 
    });


    res.json(nfceData);
  } catch (error) {
    console.error('Erro ao obter ou salvar dados da NFC-e:', error);
    res.status(500).json({ error: 'Ocorreu um erro ao processar sua solicitação' });
  }
};


exports.getUserNfceData = async (req, res) => {
  try {
    const nfceDataList = await NfceData.findAll({
      where: { userId: req.user.id },
      attributes: ['id', 'data', 'createdAt'], 
      order: [['createdAt', 'DESC']], 
    });

    res.json(nfceDataList);
  } catch (error) {
    console.error('Erro ao obter dados das NFC-e do usuário:', error);
    res.status(500).json({ error: 'Ocorreu um erro ao processar sua solicitação' });
  }
};