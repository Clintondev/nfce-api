// routes/nfce.js
const express = require('express');
const nfceController = require('../controllers/nfceController');
const { ensureAuthenticated } = require('../middlewares/auth');
const router = express.Router();

/**
 * @swagger
 * /nfce/{parametro}:
 *   get:
 *     summary: Consulta NFC-e
 *     description: Faz a consulta de uma NFC-e a partir de sua chave de acesso.
 *     parameters:
 *       - in: path
 *         name: parametro
 *         required: true
 *         description: Chave de acesso da NFC-e
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dados da NFC-e retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 vendor:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     CNPJ:
 *                       type: string
 *                     address:
 *                       type: string
 *                 totalInfo:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: string
 *                     totalAmount:
 *                       type: string
 *                     paymentMethod:
 *                       type: string
 *                     totalPaid:
 *                       type: string
 *                     change:
 *                       type: string
 *                 generalInfo:
 *                   type: object
 *                   properties:
 *                     number:
 *                       type: string
 *                     series:
 *                       type: string
 *                     emission:
 *                       type: string
 *                     authorizationProtocol:
 *                       type: string
 *                     xmlVersion:
 *                       type: string
 *                     xsltVersion:
 *                       type: string
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       code:
 *                         type: string
 *                       quantity:
 *                         type: string
 *                       unit:
 *                         type: string
 *                       unitPrice:
 *                         type: string
 *                       totalPrice:
 *                         type: string
 *                 accessKey:
 *                   type: string
 *                 consumerInfo:
 *                   type: string
 *       404:
 *         description: NFC-e não encontrada
 *       500:
 *         description: Erro no servidor
 */
router.get('/:parametro',ensureAuthenticated, nfceController.getNfceData);

module.exports = router;
