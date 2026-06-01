async function carregarDados() {

    const resposta =
        await fetch('/api/system');

    const dados =
        await resposta.json();

    document.getElementById('hostname').textContent =
        dados.hostname;

    document.getElementById('platform').textContent =
        dados.platform;

    document.getElementById('arch').textContent =
        dados.architecture;

    document.getElementById('cpus').textContent =
        dados.cpus;

    document.getElementById('memTotal').textContent =
        dados.memory.total + ' GB';

    document.getElementById('memFree').textContent =
        dados.memory.free + ' GB';

    document.getElementById('memUsage').textContent =
        dados.memory.usedPercent + '%';

    document.getElementById('ip').textContent =
        dados.ip;

    document.getElementById('node').textContent =
        dados.nodeVersion;

    document.getElementById('environment').textContent =
        dados.environment;

    document.getElementById('release').textContent =
        dados.release;

    document.getElementById('uptime').textContent =
        formatarTempo(dados.uptime);
}

function formatarTempo(segundos){

    const horas =
        Math.floor(segundos / 3600);

    const minutos =
        Math.floor((segundos % 3600) / 60);

    return `${horas}h ${minutos}m`;
}

carregarDados();

setInterval(carregarDados, 5000);

document.getElementById('cpuLoad').textContent =
    dados.cpuLoad;

document.getElementById('arquivos').textContent =
    dados.totalArquivos;

document.getElementById('status').textContent =
    dados.status;