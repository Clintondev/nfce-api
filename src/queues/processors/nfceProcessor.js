const nfceService = require('../../services/nfceService');
const cache = require('../../utils/cache');

module.exports = async (job) => {
  const { parametro } = job.data;

  try {
    const nfceData = await nfceService.fetchNfceData(parametro);

    if (nfceData) {
      await cache.set(parametro, nfceData);

      return nfceData;
    } else {
      throw new Error('Dados da NFC-e não encontrados.');
    }
  } catch (error) {
    console.error('Erro no processamento da NFC-e:', error.message);
    throw error;
  }
};