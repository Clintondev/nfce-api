// src/routes/data.js
const express = require('express');
const { Op } = require('sequelize');
const { ensureAuthenticated } = require('../middlewares/auth');

// Importando os modelos
const NfceData = require('../models/nfceData');
const User = require('../models/user');
const Item = require('../models/item');
const Vendor = require('../models/vendor');

const router = express.Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     NfceData:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         totalItems:
 *           type: string
 *         totalAmount:
 *           type: string
 *         paymentMethod:
 *           type: string
 *         totalPaid:
 *           type: string
 *         change:
 *           type: string
 *         number:
 *           type: string
 *         series:
 *           type: string
 *         emission:
 *           type: string
 *         authorizationProtocol:
 *           type: string
 *         xmlVersion:
 *           type: string
 *         xsltVersion:
 *           type: string
 *         accessKey:
 *           type: string
 *         consumerInfo:
 *           type: string
 *         userId:
 *           type: integer
 *         vendorId:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         googleId:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         refreshToken:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     Item:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         code:
 *           type: string
 *         quantity:
 *           type: string
 *         unit:
 *           type: string
 *         unitPrice:
 *           type: string
 *         totalPrice:
 *           type: string
 *         userId:
 *           type: integer
 *         accessKey:
 *           type: string
 *         nfceDataId:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     Vendor:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         CNPJ:
 *           type: string
 *         address:
 *           type: string
 *         userId:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /data/nfce-data:
 *   get:
 *     summary: Lista dados de NFC-e com filtros opcionais
 *     description: Retorna os registros da tabela NfceData. É possível filtrar por userId, vendorId, emission, number e por período de criação (dateFrom e dateTo).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filtra os registros pelo ID do usuário.
 *       - in: query
 *         name: vendorId
 *         schema:
 *           type: integer
 *         description: Filtra os registros pelo ID do fornecedor.
 *       - in: query
 *         name: emission
 *         schema:
 *           type: string
 *         description: Filtra pela data de emissão.
 *       - in: query
 *         name: number
 *         schema:
 *           type: string
 *         description: Filtra pelo número da NFC-e.
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial para filtrar a data de criação.
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final para filtrar a data de criação.
 *     responses:
 *       200:
 *         description: Lista de registros de NFC-e.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/NfceData'
 *       401:
 *         description: Não autorizado.
 *       500:
 *         description: Erro ao buscar dados de NFC-e.
 */
router.get('/nfce-data', ensureAuthenticated, async (req, res) => {
  try {
    const { userId, vendorId, emission, number, dateFrom, dateTo } = req.query;
    const where = {};

    if (userId) {
      where.userId = userId;
    }
    if (vendorId) {
      where.vendorId = vendorId;
    }
    if (emission) {
      where.emission = emission;
    }
    if (number) {
      where.number = number;
    }
    if (dateFrom && dateTo) {
      where.createdAt = {
        [Op.between]: [new Date(dateFrom), new Date(dateTo)]
      };
    }

    const nfceData = await NfceData.findAll({ where });
    return res.json(nfceData);
  } catch (error) {
    console.error('Erro ao buscar dados de NFC-e:', error);
    return res.status(500).json({ error: 'Erro ao buscar dados de NFC-e' });
  }
});

/**
 * @swagger
 * /data/users:
 *   get:
 *     summary: Lista usuários com filtros opcionais
 *     description: Retorna a lista de usuários. É possível filtrar por googleId, email (partial match) e name (partial match).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: googleId
 *         schema:
 *           type: string
 *         description: Filtra pelo googleId do usuário.
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filtra pelo email do usuário (partial match).
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filtra pelo nome do usuário (partial match).
 *     responses:
 *       200:
 *         description: Lista de usuários.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Não autorizado.
 *       500:
 *         description: Erro ao buscar usuários.
 */
router.get('/users', ensureAuthenticated, async (req, res) => {
  try {
    const { googleId, email, name } = req.query;
    const where = {};

    if (googleId) {
      where.googleId = googleId;
    }
    if (email) {
      where.email = { [Op.like]: `%${email}%` };
    }
    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }

    const users = await User.findAll({ where });
    return res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

/**
 * @swagger
 * /data/items:
 *   get:
 *     summary: Lista items com filtros opcionais
 *     description: Retorna a lista de items. É possível filtrar por code, name (partial match), userId e nfceDataId.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Filtra pelo código do item.
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filtra pelo nome do item (partial match).
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filtra pelo ID do usuário.
 *       - in: query
 *         name: nfceDataId
 *         schema:
 *           type: integer
 *         description: Filtra pelo ID da NFC-e relacionada.
 *     responses:
 *       200:
 *         description: Lista de items.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 *       401:
 *         description: Não autorizado.
 *       500:
 *         description: Erro ao buscar items.
 */
router.get('/items', ensureAuthenticated, async (req, res) => {
  try {
    const { code, name, userId, nfceDataId } = req.query;
    const where = {};

    if (code) {
      where.code = code;
    }
    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }
    if (userId) {
      where.userId = userId;
    }
    if (nfceDataId) {
      where.nfceDataId = nfceDataId;
    }

    const items = await Item.findAll({ where });
    return res.json(items);
  } catch (error) {
    console.error('Erro ao buscar items:', error);
    return res.status(500).json({ error: 'Erro ao buscar items' });
  }
});

/**
 * @swagger
 * /data/vendors:
 *   get:
 *     summary: Lista vendors com filtros opcionais
 *     description: Retorna a lista de vendors. É possível filtrar por CNPJ, name (partial match) e userId.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: CNPJ
 *         schema:
 *           type: string
 *         description: Filtra pelo CNPJ do vendor.
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filtra pelo nome do vendor (partial match).
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filtra pelo ID do usuário associado.
 *     responses:
 *       200:
 *         description: Lista de vendors.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Vendor'
 *       401:
 *         description: Não autorizado.
 *       500:
 *         description: Erro ao buscar vendors.
 */
router.get('/vendors', ensureAuthenticated, async (req, res) => {
  try {
    const { CNPJ, name, userId } = req.query;
    const where = {};

    if (CNPJ) {
      where.CNPJ = CNPJ;
    }
    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }
    if (userId) {
      where.userId = userId;
    }

    const vendors = await Vendor.findAll({ where });
    return res.json(vendors);
  } catch (error) {
    console.error('Erro ao buscar vendors:', error);
    return res.status(500).json({ error: 'Erro ao buscar vendors' });
  }
});

module.exports = router;