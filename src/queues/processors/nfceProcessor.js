// src/queues/processors/nfceProcessor.js
const nfceService = require('../../services/nfceService');
const cache = require('../../utils/cache');
const Vendor = require('../../models/vendor');
const NfceData = require('../../models/nfceData');
const Item = require('../../models/item');

module.exports = async (job) => {
  const { parametro, userId } = job.data;

  try {
    const nfceData = await nfceService.fetchNfceData(parametro);

    if (!nfceData) {
      throw new Error('Dados da NFC-e não encontrados.');
    }

    const existingNfce = await NfceData.findOne({
      where: {
        accessKey: nfceData.accessKey,
        authorizationProtocol: nfceData.generalInfo.authorizationProtocol,
      },
    });

    if (existingNfce) {
      console.log('NFC-e já existente. Retornando registro existente.');
      return existingNfce;
    }

    const { name, CNPJ, address } = nfceData.vendor;
    let vendor = await Vendor.findOne({ where: { CNPJ, userId } });
    if (!vendor) {
      vendor = await Vendor.create({
        name,
        CNPJ,
        address,
        userId,
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
      userId,
      vendorId: vendor.id,
    });

    if (nfceData.items && nfceData.items.length > 0) {
      for (const item of nfceData.items) {

        const duplicateItem = await Item.findOne({
          include: [{
            model: NfceData,
            required: true,
            where: {
              vendorId: vendor.id,
              emission: savedData.emission,
            },
          }],
          where: {
            code: item.code,
            unitPrice: item.unitPrice,
          },
        });

        if (!duplicateItem) {
          await Item.create({
            name: item.name,
            code: item.code,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            userId,
            accessKey: nfceData.accessKey,
            nfceDataId: savedData.id,
          });
        } else {
          console.log(`Item com código ${item.code} já existe para o mesmo comércio, valor e dia. Ignorando inserção.`);
        }
      }
    }
    
    await cache.set(parametro, nfceData);

    return nfceData;
  } catch (error) {
    console.error('Erro no processamento da NFC-e:', error.message);
    throw error;
  }
};