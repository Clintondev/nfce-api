// services/nfceService.js
const puppeteer = require('puppeteer');

exports.fetchNfceData = async (parametro) => {
  const encodedParametro = encodeURIComponent(parametro);
  const urlNfce = `http://nfe.sefaz.go.gov.br/nfeweb/sites/nfce/d/danfeNFCe?p=${encodedParametro}`;

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  await page.goto(urlNfce, { waitUntil: 'networkidle2' });

  const iframeSrc = await page.evaluate(() => {
    const iframe = document.querySelector('iframe.iframe-danfe-nfce');
    return iframe ? iframe.src : null;
  });

  if (!iframeSrc) {
    await browser.close();
    return null;
  }

  const iframeUrl = iframeSrc.startsWith('http')
    ? iframeSrc
    : `http://nfe.sefaz.go.gov.br${iframeSrc}`;

  await page.goto(iframeUrl, { waitUntil: 'networkidle2' });

  const nfceData = await page.evaluate(() => {
    const cleanText = (text) => text ? text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim() : null;

    const vendorName = cleanText(document.querySelector('#u20')?.textContent);
    const vendorCNPJ = cleanText(document.querySelector('.text')?.textContent.replace('CNPJ:', '').trim());
    const vendorAddress = cleanText(document.querySelectorAll('.text')[1]?.textContent);

    const items = [];
    const itemRows = document.querySelectorAll('#tabResult tr');
    itemRows.forEach(row => {
      const itemName = cleanText(row.querySelector('.txtTit')?.textContent);
      const itemCode = cleanText(row.querySelector('.RCod')?.textContent.replace('(Código:', '').replace(')', ''));
      const quantity = cleanText(row.querySelector('.Rqtd')?.textContent.replace('Qtde.:', ''));
      const unit = cleanText(row.querySelector('.RUN')?.textContent.replace('UN:', ''));
      const unitPrice = cleanText(row.querySelector('.RvlUnit')?.textContent.replace('Vl. Unit.:', ''));
      const totalPrice = cleanText(row.querySelector('.valor')?.textContent);

      if (itemName && quantity && unitPrice && totalPrice) {
        items.push({
          name: itemName,
          code: itemCode,
          quantity: quantity,
          unit: unit,
          unitPrice: unitPrice,
          totalPrice: totalPrice
        });
      }
    });

    const totalItems = cleanText(document.querySelector('#totalNota .totalNumb')?.textContent);
    const totalAmount = cleanText(document.querySelector('#totalNota .txtMax')?.textContent);
    const paymentMethod = cleanText(document.querySelector('#linhaTotal .tx')?.textContent) || 'N/A';
    const totalPaid = cleanText(document.querySelectorAll('#linhaTotal .totalNumb')[1]?.textContent);
    const change = cleanText(document.querySelectorAll('#linhaTotal .totalNumb')[2]?.textContent) || 'N/A';

    const invoiceInfoText = document.querySelector('#infos ul li')?.textContent || '';
    const invoiceNumber = invoiceInfoText.match(/Número:\s*(\d+)/)?.[1] || null;
    const invoiceSeries = invoiceInfoText.match(/Série:\s*(\d+)/)?.[1] || null;
    const invoiceEmission = invoiceInfoText
      .match(/Emissão:\s*([\d\/\s\:\-]+)/)?.[1]
      ?.replace(/[\n\t]+/g, ' ')
      .trim();
    const authorizationProtocol = invoiceInfoText.match(/Protocolo de Autorização:\s*(\d+)/)?.[1] || null;
    const xmlVersion = invoiceInfoText.match(/Versão XML:\s*(\d+\.\d+)/)?.[1] || null;
    const xsltVersion = invoiceInfoText.match(/Versão XSLT:\s*(\d+\.\d+)/)?.[1] || null;

    const accessKey = cleanText(document.querySelector('.chave')?.textContent);
    const consumerInfo = cleanText(document.querySelector('#infos ul li')?.textContent) || 'Consumidor não identificado';

    return {
      vendor: {
        name: vendorName,
        CNPJ: vendorCNPJ,
        address: vendorAddress,
      },totalInfo: {
        totalItems,
        totalAmount,
        paymentMethod,
        totalPaid,
        change,
      },
      generalInfo: {
        number: invoiceNumber,
        series: invoiceSeries,
        emission: invoiceEmission,
        authorizationProtocol,
        xmlVersion,
        xsltVersion,
      },
      items,
      accessKey,
      consumerInfo,
    };
  });

  await browser.close();

  return nfceData;
};
