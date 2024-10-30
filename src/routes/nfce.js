// routes/nfce.js
const express = require('express');
const nfceController = require('../controllers/nfceController');
const { ensureAuthenticated } = require('../middlewares/auth');
const { check, validationResult } = require('express-validator');

const router = express.Router();

/**
 * @swagger
 * /nfce/{parametro}:
 *   get:
 *     summary: Consulta NFC-e
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Não autorizado - Token inválido ou não fornecido
 *       404:
 *         description: NFC-e não encontrada
 *       500:
 *         description: Erro no servidor
 */
/**
 * @swagger
 * /nfce:
 *   get:
 *     summary: Lista as NFC-e do usuário
 *     description: Retorna todas as NFC-e consultadas pelo usuário autenticado.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de NFC-e retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   data:
 *                     type: object
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Não autorizado - Token inválido ou não fornecido
 *       500:
 *         description: Erro no servidor
 */

router.get(
    '/:parametro',
    ensureAuthenticated,
    [check('parametro').isString().trim().escape()],
    nfceController.getNfceData
  );

  router.get(
    '/:parametro',
    ensureAuthenticated,
    [
      check('parametro')
        .isString()
        .withMessage('O parâmetro deve ser uma string.')
        .trim()
        .escape(),
    ],
    nfceController.getNfceData
  );

module.exports = router;
