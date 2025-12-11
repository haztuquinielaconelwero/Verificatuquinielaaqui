document.addEventListener('DOMContentLoaded', () => {
const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRk217cEeiZ5wrJv2p9-1ArTcnAXTZovIyA50--NjxuK8_BBVCBL6ZqcpsZy7weoVjHyYM0g_hUnlda/pub?gid=0&single=true&output=csv';
let quinielasData = [];
let csvHeaders = [];
Swal.fire({
title: 'Verifica tu quiniela⚽',
showConfirmButton: false,
timer: 1500
});
fetch(csvUrl)
.then(response => response.text())
.then(text => {
quinielasData = parseCSV(text);
})
.catch(error => {
console.error('Error al cargar los datos:', error);
Swal.fire('Error', 'No se pudieron cargar los datos de las quinielas. Inténtalo de nuevo más tarde.', 'error');
});
function parseCSV(text) {
const rows = text.split(/\r?\n/).map(row => row.split(','));
csvHeaders = rows[0].map(h => h.trim());
const data = rows.slice(1).map(row => {
let obj = {};
csvHeaders.forEach((header, i) => {
obj[header] = row[i] ? row[i].trim() : '';
});
return obj;
});
return data;
}
document.getElementById('participanteBtn').addEventListener('click', () => {
promptForName('Participante', 'Nombre', 'Verificador📄', '¿Cuál es tu nombre? 🤔');
});
document.getElementById('vendedorBtn').addEventListener('click', () => {
promptForName('Vendedor', 'Vendedor', 'Verificador📄', '¿Cuál es tu nombre? 🤔');
});
function promptForName(role, searchColumn, headerTitle, questionText) {
Swal.fire({
title: headerTitle,
text: questionText,
input: 'text',
inputPlaceholder: 'Escribe tu nombre aquí...',
confirmButtonText: 'Buscar',
allowOutsideClick: false,
inputValidator: (value) => {
if (!value) {
return 'Escribe tu nombre para continuar ⚽';
}
}
}).then((result) => {
if (result.isConfirmed) {
const nameToSearch = result.value.trim().toLowerCase();
findQuinielas(nameToSearch, searchColumn, role);
}
});
}
function findQuinielas(name, column, role) {
const userQuinielas = quinielasData.filter(row => row[column] && row[column].toLowerCase() === name);
if (userQuinielas.length > 0) {
Swal.fire({
title: '¡Encontrado!',
text: `${userQuinielas.length} quinielas a tu nombre. ¿Deseas verificarlas?`,
icon: 'success',
showCancelButton: true,
confirmButtonText: 'Sí, verificar',
cancelButtonText: 'No, cancelar'
}).then((result) => {
if (result.isConfirmed) {
displayQuinielas(userQuinielas, column);
}
});
} else {
Swal.fire({
title: 'No encontrado',
text: `Verifica que el nombre esté escrito correctamente.`,
icon: 'error',
confirmButtonText: 'Aceptar'
});
}
}
function displayQuinielas(quinielas, searchColumn) {
const resultsContainer = document.getElementById('results-container');
const searchedName = quinielas[0][searchColumn];
resultsContainer.innerHTML = `<h3>Resultados para: ${searchedName}</h3>`;
const summary = document.createElement('p');
summary.innerHTML = `Se encontraron <strong>${quinielas.length}</strong> quinielas.`;
resultsContainer.appendChild(summary);
quinielas.sort((a, b) => parseInt(a['Folio'], 10) - parseInt(b['Folio'], 10));
quinielas.forEach((quiniela) => {
const quinielaDiv = document.createElement('div');
quinielaDiv.classList.add('quiniela-card');
let content = `<h4>Informacion de la quiniela</h4>`;
content += '<ul>';
content += `<li><strong>Nombre:</strong> ${quiniela['Nombre']}</li>`;
content += `<li><strong>Vendedor:</strong> ${quiniela['Vendedor'] || 'No'}</li>`;
content += `<li><strong>Folio:</strong> ${quiniela['Folio']}</li>`;
if (quiniela['Puntos']) {
content += `<li><strong>Puntos:</strong> ${quiniela['Puntos']}</li>`;
} else {
content += `<li><strong>Puntos:</strong> No disponible</li>`;
}
content += '</ul>';
content += `<p>Mucha suerte 🍀</p>`;
quinielaDiv.innerHTML = content;
resultsContainer.appendChild(quinielaDiv);
});
document.querySelector('h1').style.display = 'none';
document.querySelector('.button-container').style.display = 'none';
document.querySelector('.container').style.justifyContent = 'flex-start';
resultsContainer.style.display = 'block';
}
const pdfUrl = 'elwero.pdf';
let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
const scale = 2.5;
const canvas = document.getElementById('pdf-canvas');
const ctx = canvas.getContext('2d');
function renderPage(num) {
pageRendering = true;
pdfDoc.getPage(num).then((page) => {
const viewport = page.getViewport({ scale: scale });
canvas.height = viewport.height;
canvas.width = viewport.width;
const renderContext = {
canvasContext: ctx,
viewport: viewport
};
const renderTask = page.render(renderContext);
renderTask.promise.then(() => {
pageRendering = false;
if (pageNumPending !== null) {
renderPage(pageNumPending);
pageNumPending = null;
}
});
});
document.getElementById('page-num').textContent = num;
}
function queueRenderPage(num) {
if (pageRendering) {
pageNumPending = num;
} else {
renderPage(num);
}
}
document.getElementById('prev-page').addEventListener('click', () => {
if (pageNum <= 1) {
return;
}
pageNum--;
queueRenderPage(pageNum);
});
document.getElementById('next-page').addEventListener('click', () => {
if (pageNum >= pdfDoc.numPages) {
return;
}
pageNum++;
queueRenderPage(pageNum);
});
document.getElementById('pdfBtn').addEventListener('click', () => {
document.querySelector('.button-container').style.display = 'none';
document.querySelector('h1').style.display = 'none';
document.getElementById('pdf-viewer-container').style.display = 'block';
pdfjsLib.getDocument(pdfUrl).promise.then((pdfDoc_) => {
pdfDoc = pdfDoc_;
document.getElementById('page-count').textContent = pdfDoc.numPages;
renderPage(pageNum);
}).catch(err => {
console.error('Error al cargar el PDF:', err);
Swal.fire('Error', 'No se pudo encontrar o cargar el archivo "EL Wero.pdf". Asegúrate de que esté en la misma carpeta.', 'error');
});
});
});
