// controllers/nfceController.js
const nfceService = require('../services/nfceService');

exports.getNfceData = async (req, res) => {
  try {
    const { parametro } = req.params;
    const nfceData = await nfceService.fetchNfceData(parametro);
    
    if (!nfceData) {
      return res.status(404).json({ message: 'NFC-e data not found' });
    }

    res.json(nfceData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
};
