// controllers/nfceController.js
const { validationResult } = require('express-validator');
const nfceService = require('../services/nfceService');
const NfceData = require('../models/nfceData');
const Vendor = require('../models/vendor');
const Item = require('../models/item');

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

    const { name, CNPJ, address } = nfceData.vendor;
    let vendor = await Vendor.findOne({ where: { CNPJ } });

    if (!vendor) {
      vendor = await Vendor.create({
        name,
        CNPJ,
        address,
        userId: req.user.id,
      });
    }

    const savedData = await NfceData.create({
      totalItems: nfceData.totalInfo.totalItems,
      totalAmount: nfceData.totalInfo.totalAmount,
      paymentMethod: nfceData.totalInfo.paymentMethod,
      totalPaid: nfceData.totalInfo.totalPaid,
      change: nfceData.totalInfo.change,
      number: nfceData.generalInfo.number,
      series: nfceData.generalInfo.series,
      emission: nfceData.generalInfo.emission,
      authorizationProtocol: nfceData.generalInfo.authorizationProtocol,
      xmlVersion: nfceData.generalInfo.xmlVersion,
      xsltVersion: nfceData.generalInfo.xsltVersion,
      accessKey: nfceData.accessKey,
      consumerInfo: nfceData.consumerInfo,
      userId: req.user.id,
      vendorId: vendor.id,
    });

    const items = nfceData.items.map(item => ({
      name: item.name,
      code: item.code,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      userId: req.user.id,
      accessKey: nfceData.accessKey,
      nfceDataId: savedData.id,
    }));

    await Item.bulkCreate(items);

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