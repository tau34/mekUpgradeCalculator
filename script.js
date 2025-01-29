function updateUpgrade(type, delta) {
    const input = document.getElementById(`${type}-upgrade`);
    let currentValue = parseInt(input.value, 10);
    currentValue = Math.max(0, Math.min(64, currentValue + delta));
    input.value = currentValue;
    calculate();
}

function formatWithSIPrefix(value) {
    const siPrefixes = [
        { prefix: 'Y', factor: 1e24 },
        { prefix: 'Z', factor: 1e21 },
        { prefix: 'E', factor: 1e18 },
        { prefix: 'P', factor: 1e15 },
        { prefix: 'T', factor: 1e12 },
        { prefix: 'G', factor: 1e9 },
        { prefix: 'M', factor: 1e6 },
        { prefix: 'k', factor: 1e3 },
        { prefix: '', factor: 1e0 },
        { prefix: 'm', factor: 1e-3 },
        { prefix: 'µ', factor: 1e-6 },
        { prefix: 'n', factor: 1e-9 },
        { prefix: 'p', factor: 1e-12 },
        { prefix: 'f', factor: 1e-15 },
        { prefix: 'a', factor: 1e-18 },
        { prefix: 'z', factor: 1e-21 },
        { prefix: 'y', factor: 1e-24 }
    ];

    if (value === 0) {
        return '0';
    }

    for (const { prefix, factor } of siPrefixes) {
        if (Math.abs(value) >= factor) {
            const scaledValue = value / factor;
            return scaledValue.toPrecision(8) + ' ' + prefix;
        }
    }
    return value.toExponential(8);
}

let ef = 1;
let ti = 200;

function changeMode(mode) {
    let flag = mode === 0;
    document.getElementById('label-base-energy').textContent = flag ? "アップグレードなしの効率(mb/tick)" : "アップグレードなしの必要な時間(tick)";
    document.getElementById('base-time').value = flag ? ef : ti;
    document.getElementById('label-result-time').textContent = flag ? "効率" : "必要な時間";
}

function calculate() {
    const baseEnergy = parseFloat(document.getElementById('base-energy').value) || 0;
    const baseTime = parseFloat(document.getElementById('base-time').value) || 0;

    const multiplier = parseFloat(document.getElementById('multiplier').value) || 1;
    const processingUnit = document.querySelector('input[name="processing-unit"]:checked').value;

    const speedUpgrade = parseInt(document.getElementById('speed-upgrade').value, 10) || 0;
    const energyUpgrade = parseInt(document.getElementById('energy-upgrade').value, 10) || 0;

    const baseCapacity = parseFloat(document.getElementById('base-capacity').value) || 0;

    const capacity = baseCapacity * (multiplier ** (energyUpgrade / 8));
    document.getElementById('result-capacity').textContent = formatWithSIPrefix(capacity) + " FE";

    if (processingUnit == "tick") {
        const efficiency = baseTime * (2 ** speedUpgrade);
        const energy = baseEnergy * (multiplier ** ((2 * speedUpgrade - Math.min(energyUpgrade, Math.max(8, speedUpgrade))) / 8)) * (2 ** speedUpgrade);

        const flag = energy < capacity;

        document.getElementById('result-time').textContent = formatWithSIPrefix(efficiency / 1000 * (flag ? 1 : capacity / energy)) + "b/tick" + (flag ? "" : " (内部電力容量の不足により最高速度でない)");
        document.getElementById('result-energy').textContent = formatWithSIPrefix(energy) + "FE/tick" + (flag ? "" : " (内部電力容量が不足)");
        ef = baseTime;
    } else {
        const time = baseTime / (multiplier ** (speedUpgrade / 8));
        const energy = baseEnergy * (multiplier ** ((2 * speedUpgrade - Math.min(energyUpgrade, Math.max(8, speedUpgrade))) / 8));

        document.getElementById('result-time').textContent = time >= 1 ? formatWithSIPrefix(time) + "tick" : "1/" + formatWithSIPrefix(1 / time) + " tick";
        document.getElementById('result-energy').textContent = formatWithSIPrefix(energy) + "FE/tick";
        ti = baseTime;
    }
}

// 初回計算
document.addEventListener('DOMContentLoaded', calculate);
