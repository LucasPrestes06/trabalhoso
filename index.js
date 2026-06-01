const express = require('express');
const cors = require('cors');
const os = require('os');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

app.get('/api/system', (req, res) => {

    const totalMem = os.totalmem();
    const freeMem = os.freemem();

    const usedPercent =
        (((totalMem - freeMem) / totalMem) * 100).toFixed(2);

    const networkInterfaces = os.networkInterfaces();

    let ip = 'Não encontrado';

    for (const iface of Object.values(networkInterfaces)) {
        for (const detail of iface) {
            if (
                detail.family === 'IPv4' &&
                !detail.internal
            ) {
                ip = detail.address;
                break;
            }
        }
    }

    res.json({
        hostname: os.hostname(),
        platform: os.platform(),
        type: os.type(),
        release: os.release(),
        architecture: os.arch(),
        cpus: os.cpus().length,

        memory: {
            total: (totalMem / 1024 / 1024 / 1024).toFixed(2),
            free: (freeMem / 1024 / 1024 / 1024).toFixed(2),
            usedPercent
        },

        uptime: os.uptime(),

        nodeVersion: process.version,

        ip,

        environment:
            process.env.RENDER
                ? 'Cloud (Render)'
                : 'Local'
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});