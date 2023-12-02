$(document).ready(function () {
    $.ajax({
        url: './new.json',
        dataType: 'json',
        success: function(data) {
            createUniversityRows(data);
        }
    });
});

let previousIndex = -1;

function createUniversityRows(data) {
    let tableBody = $('#myTable tbody');

    data.forEach((university, index) => {
        let newRow = $('<tr>');
        let universityNameCell = $(`<td>${university.universityName}</td>`);
        let universityDetailsContainer = $(`<div id="universityDetails_${index}" style="display: none;"></div>`);
        universityNameCell.click(() => {
            if (previousIndex === index) {
                $(`#universityDetails_${index}`).slideToggle();
            } else {
                $(`#universityDetails_${previousIndex}`).slideUp();
                $(`#universityDetails_${index}`).slideDown();
                previousIndex = index;
            }
            showUniversityDetails(university.programs, universityDetailsContainer);
        });
        newRow.append(universityNameCell);
        tableBody.append(newRow);
        tableBody.append(universityDetailsContainer);
    });
}


function showUniversityDetails(programs, container) {
    container.empty();

    let table = $('<table>');
    let thead = $('<thead>').append('<tr><th>ID ОП</th><th>№ ОК</th><th>Тип ОК</th><th>Назва ОК</th><th>Кількість кредитів</th><th>Загальна кількість задіяних ПРН</th><th>Загальна кількість задіяних стандартних ПРН</th><th>Номер стандартних ПРН</th><th>Загальна кількість задіяних компетентностей</th><th>Загальна кількість задіяних стандартних компетентностей</th><th>Номер стандартних компетентностей</th></tr>');
    table.append(thead);

    let tbody = $('<tbody>');
    programs.forEach(program => {
        let row = $('<tr>');
        Object.values(program).forEach(value => {
            row.append(`<td>${value}</td>`);
        });
        tbody.append(row);
    });

    table.append(tbody);
    container.append(table);

    let creditsPerPrnContainer = $('<div id="creditsPerPrnContainer"></div>');
    let modifiedTableContainer = $('<div id="modifiedTableContainer"></div>');
    let creditsPerCompetencyContainer = $('<div id="creditsPerCompetencyContainer"></div>');
    let modifiedCompetencyTableContainer = $('<div id="modifiedCompetencyTableContainer"></div>');

    container.after(creditsPerPrnContainer);
    creditsPerPrnContainer.after(modifiedTableContainer);
    modifiedTableContainer.after(creditsPerCompetencyContainer);
    creditsPerCompetencyContainer.after(modifiedCompetencyTableContainer);

    createCreditPerPrnTable(programs, creditsPerPrnContainer[0]);
    createModifiedTable(programs, modifiedTableContainer[0]);
    createCreditPerCompetencyTable(programs, creditsPerCompetencyContainer[0]);
    createModifiedCompetencyTable(programs, modifiedCompetencyTableContainer[0]);
}



function findMaxPrn(data) {
    let maxPrn = 0;
    data.forEach(item => {
        let prnString = item["Номер стандартних ПРН"];
        if (prnString && typeof prnString === 'string') {
            let prns = prnString.split(',').map(str => str.trim());
            prns.forEach(prn => {
                if (parseInt(prn) > maxPrn) {
                    maxPrn = parseInt(prn);
                }
            });
        }
    });

    return maxPrn;
}


function createCreditPerPrnTable(data, container) {
    let tableHTML = '<table>';
    tableHTML += '<thead>';
    tableHTML += '<tr><th>Освітній компонент</th>';
    let prnCount = findMaxPrn(data) || 1;
    for (let i = 1; i <= prnCount; i++) {
        tableHTML += `<th>ПРН ${i}</th>`;
    }
    tableHTML += '</tr>';
    tableHTML += '</thead>';
    tableHTML += '<tbody>';

    data.forEach(item => {
        tableHTML += '<tr>';
        tableHTML += `<td>${item["№ ОК"]}. ${item["Назва ОК"]} (${item["Кількість кредитів"]})</td>`;
        let totalPrn = item["Загальна кількість задіяних ПРН"] || 1;
        let prns = item["Номер стандартних ПРН"] ? item["Номер стандартних ПРН"].toString().split(',').map(str => str.trim()) : [];
        for (let i = 1; i <= prnCount; i++) {
            if (prns.includes(`${i}`)) {
                tableHTML += `<td>${item["Кількість кредитів"]}/${totalPrn}</td>`;
            } else {
                tableHTML += '<td></td>';
            }
        }
        tableHTML += '</tr>';
    });

    tableHTML += '</tbody>';
    tableHTML += '</table>';

    container.innerHTML = tableHTML;
}

function createModifiedTable(data, container) {
    let tableHTML = '<div style="margin-bottom: 15px;">';
    tableHTML += '<table style="border-collapse: collapse; width: 100%;">';
    tableHTML += '<thead>';
    tableHTML += '<tr><th style="border: 1px solid black; padding: 5px;">Освітній компонент</th>';
    let prnCount = findMaxPrn(data) || 1;
    for (let i = 1; i <= prnCount; i++) {
        tableHTML += `<th style="border: 1px solid black; padding: 5px;">ПРН ${i}</th>`;
    }
    tableHTML += '</tr>';
    tableHTML += '</thead>';
    tableHTML += '<tbody>';

    let prnCourses = {};
    let prnSums = {};

    data.forEach(item => {
        let prns = item["Номер стандартних ПРН"] ? item["Номер стандартних ПРН"].toString().split(',').map(str => str.trim()) : [];
        prns.forEach(prn => {
            if (!prnCourses[prn]) {
                prnCourses[prn] = [];
                prnSums[prn] = [];
            }
            let totalPrn = item["Загальна кількість задіяних ПРН"] || 1;
            let creditsPerPrn = parseFloat(item["Кількість кредитів"]) / totalPrn;
            prnCourses[prn].push(1);
            prnSums[prn].push(creditsPerPrn);
        });
    });

    data.forEach(item => {
        tableHTML += '<tr>';
        tableHTML += `<td style="border: 1px solid black; padding: 5px;">${item["№ ОК"]}. ${item["Назва ОК"]} (${item["Кількість кредитів"]})</td>`;
        let totalPrn = item["Загальна кількість задіяних ПРН"] || 1;
        let prns = item["Номер стандартних ПРН"] ? item["Номер стандартних ПРН"].toString().split(',').map(str => str.trim()) : [];
        for (let i = 1; i <= prnCount; i++) {
            if (prns.includes(`${i}`)) {
                let creditsPerPrn = parseFloat(item["Кількість кредитів"]) / totalPrn;
                tableHTML += `<td style="border: 1px solid black; padding: 5px;">${creditsPerPrn.toFixed(1)}</td>`;
            } else {
                tableHTML += '<td style="border: 1px solid black; padding: 5px;"></td>';
            }
        }
        tableHTML += '</tr>';
    });

    tableHTML += '<tr>';
    tableHTML += '<td style="border: 1px solid black; padding: 5px; font-weight: bold; background-color: lightgreen;">Кількість предметів</td>';
    for (let i = 1; i <= prnCount; i++) {
        tableHTML += `<td style="border: 1px solid black; padding: 5px; font-weight: bold; background-color: lightgreen;">${prnCourses[i] ? prnCourses[i].length : 0}</td>`;
    }
    tableHTML += '</tr>';

    tableHTML += '<tr>';
    tableHTML += '<td style="border: 1px solid black; padding: 5px; font-weight: bold; background-color: yellow;">Сума</td>';
    for (let i = 1; i <= prnCount; i++) {
        let sum = prnSums[i] ? prnSums[i].reduce((acc, val) => acc + val, 0) : 0;
        tableHTML += `<td style="border: 1px solid black; padding: 5px; font-weight: bold; background-color: yellow;">${sum.toFixed(1)}</td>`;
    }
    tableHTML += '</tr>';

    tableHTML += '</tbody>';
    tableHTML += '</table>';
    tableHTML += '</div>';
    container.innerHTML = tableHTML;
}

function formatFraction(numerator, denominator) {
    let gcd = function gcd(a, b) {
        return b ? gcd(b, a % b) : a;
    };
    let divisor = gcd(numerator, denominator);
    numerator /= divisor;
    denominator /= divisor;
    return denominator === 1 ? numerator.toString() : numerator + '/' + denominator;
}

function createCreditPerCompetencyTable(data, container) {
    let maxZk = findMaxZk(data);
    let maxSk = findMaxSk(data);
    let tableHTML = '<table>';
    tableHTML += '<thead>';
    tableHTML += '<tr><th>Освітній компонент</th>';
    for (let i = 1; i <= maxZk; i++) {
        tableHTML += `<th>ЗК ${i}</th>`;
    }
    for (let i = 1; i <= maxSk; i++) {
        tableHTML += `<th>СК ${i}</th>`;
    }
    tableHTML += '</tr>';
    tableHTML += '</thead>';
    tableHTML += '<tbody>';

    data.forEach(item => {
        tableHTML += '<tr>';
        tableHTML += `<td>${item["№ ОК"]}. ${item["Назва ОК"]} (${item["Кількість кредитів"]})</td>`;
        let totalZk = item["Загальна кількість задіяних компетентностей"];
        let zks = item["Номер стандартних компетентностей"] ? item["Номер стандартних компетентностей"].toString().split(',').map(str => str.trim()) : [];
        let totalSk = item["Загальна кількість задіяних компетентностей"];
        let sks = item["Номер стандартних компетентностей"] ? item["Номер стандартних компетентностей"].toString().split(',').map(str => str.trim()) : [];

        for (let i = 1; i <= maxZk; i++) {
            if (zks.includes(`ЗК${i}`)) {
                let creditsPerZk = item["Кількість кредитів"] + "/" + totalZk;
                tableHTML += `<td>${creditsPerZk}</td>`;
            } else {
                tableHTML += '<td></td>';
            }
        }
        for (let i = 1; i <= maxSk; i++) {
            if (sks.includes(`СК${i}`)) {
                let creditsPerSk = item["Кількість кредитів"] + "/" + totalSk;
                tableHTML += `<td>${creditsPerSk}</td>`;
            } else {
                tableHTML += '<td></td>';
            }
        }
        tableHTML += '</tr>';
    });

    tableHTML += '</tbody>';
    tableHTML += '</table>';
    container.innerHTML = tableHTML;
}


function createModifiedCompetencyTable(data, container) {
    let maxZk = findMaxZk(data);
    let maxSk = findMaxSk(data);
    let tableHTML = '<table>';
    tableHTML += '<thead>';
    tableHTML += '<tr><th>Освітній компонент</th>';

    for (let i = 1; i <= maxZk; i++) {
        tableHTML += `<th>ЗК ${i}</th>`;
    }

    for (let i = 1; i <= maxSk; i++) {
        tableHTML += `<th>СК ${i}</th>`;
    }

    tableHTML += '</tr>';
    tableHTML += '</thead>';
    tableHTML += '<tbody>';

    let countsZk = Array(maxZk).fill(0);
    let sumsZk = Array(maxZk).fill(0);
    let countsSk = Array(maxSk).fill(0);
    let sumsSk = Array(maxSk).fill(0);

    data.forEach(item => {
        tableHTML += '<tr>';
        tableHTML += `<td>${item["№ ОК"]}. ${item["Назва ОК"]} (${item["Кількість кредитів"]})</td>`;

        let totalZk = item["Загальна кількість задіяних компетентностей"];
        let zks = item["Номер стандартних компетентностей"] ? item["Номер стандартних компетентностей"].toString().split(',').map(str => str.trim()) : [];
        let totalSk = item["Загальна кількість задіяних компетентностей"]; // Change made here
        let sks = item["Номер стандартних компетентностей"] ? item["Номер стандартних компетентностей"].toString().split(',').map(str => str.trim()) : [];

        for (let i = 1; i <= maxZk; i++) {
            if (zks.includes(`ЗК${i}`)) {
                let creditsPerZk = parseFloat(item["Кількість кредитів"]) / totalZk;
                tableHTML += `<td>${creditsPerZk.toFixed(1)}</td>`;
                countsZk[i - 1] += 1;
                sumsZk[i - 1] += creditsPerZk;
            } else {
                tableHTML += '<td></td>';
            }
        }

        for (let i = 1; i <= maxSk; i++) {
            if (sks.includes(`СК${i}`)) {
                let creditsPerSk = parseFloat(item["Кількість кредитів"]) / totalSk;
                tableHTML += `<td>${creditsPerSk.toFixed(1)}</td>`;
                countsSk[i - 1] += 1;
                sumsSk[i - 1] += creditsPerSk;
            } else {
                tableHTML += '<td></td>';
            }
        }

        tableHTML += '</tr>';
    });

    tableHTML += '<tr style="background-color: lightgreen"><td style="font-weight: bold;">Кількість предметів</td>';
    for (let count of countsZk) {
        tableHTML += `<td style="font-weight: bold;">${count}</td>`;
    }
    for (let count of countsSk) {
        tableHTML += `<td style="font-weight: bold;">${count}</td>`;
    }
    tableHTML += '</tr>';

    tableHTML += '<tr style="background-color: yellow"><td style="font-weight: bold;">Сума</td>';
    for (let sum of sumsZk) {
        tableHTML += `<td style="font-weight: bold;">${sum.toFixed(1)}</td>`;
    }
    for (let sum of sumsSk) {
        tableHTML += `<td style="font-weight: bold;">${sum.toFixed(1)}</td>`;
    }
    tableHTML += '</tr>';

    tableHTML += '</tbody>';
    tableHTML += '</table>';
    container.innerHTML = tableHTML;
}


function findMaxZk(data) {
    let maxZk = 0;
    data.forEach(item => {
        let competencyString = item["Номер стандартних компетентностей"];
        if (competencyString && typeof competencyString === 'string') {
            let competencies = competencyString.split(',').map(str => str.trim());
            competencies.forEach(competency => {
                if (competency.startsWith("ЗК")) {
                    let competencyNumber = parseInt(competency.slice(2));
                    if (!isNaN(competencyNumber) && competencyNumber > maxZk) {
                        maxZk = competencyNumber;
                    }
                }
            });
        }
    });

    return maxZk;
}

function findMaxSk(data) {
    let maxSk = 0;
    data.forEach(item => {
        let competencyString = item["Номер стандартних компетентностей"];
        if (competencyString && typeof competencyString === 'string') {
            let competencies = competencyString.split(',').map(str => str.trim());
            competencies.forEach(competency => {
                if (competency.startsWith("СК")) {
                    let competencyNumber = parseInt(competency.slice(2));
                    if (!isNaN(competencyNumber) && competencyNumber > maxSk) {
                        maxSk = competencyNumber;
                    }
                }
            });
        }
    });

    return maxSk;
}
