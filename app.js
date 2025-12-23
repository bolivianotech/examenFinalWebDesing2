/**
 * ============================================
 * EXAMEN FINAL - DISEÑO WEB II
 * Lógica Principal de la Aplicación
 * ============================================
 */

// ====== Estado Global ======
const state = {
    studentInfo: null,
    questions: [],
    currentQuestion: 0,
    answers: {},
    startTime: null,
    endTime: null,
    timerInterval: null,
    submitted: false
};

// ====== Configuración de Google Sheets ======
// NOTA: Reemplace esta URL con su URL de Google Apps Script desplegado
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbzyzi-gJWYrpFMlp38ZNC6PHBKqFN41Al_NLdrN7iGS3ni50l9pOKyuc2K1bw7LlgRb/exec';

// ====== Inicialización ======
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // Configurar el formulario de registro
    setupRegistrationForm();
    
    // Configurar la navegación del examen
    setupExamNavigation();
    
    // Configurar el modal de confirmación
    setupConfirmModal();
    
    // Configurar el botón de revisión
    setupReviewSection();
}

// ====== Registro de Estudiante ======
function setupRegistrationForm() {
    const form = document.getElementById('registrationForm');
    const inputs = form.querySelectorAll('input');
    
    // Validación en tiempo real
    inputs.forEach(input => {
        input.addEventListener('input', () => validateInput(input));
        input.addEventListener('blur', () => validateInput(input));
    });
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let isValid = true;
        inputs.forEach(input => {
            if (!validateInput(input)) {
                isValid = false;
            }
        });
        
        if (isValid) {
            state.studentInfo = {
                name: document.getElementById('studentName').value.trim(),
                id: document.getElementById('studentId').value.trim(),
                email: document.getElementById('studentEmail').value.trim()
            };
            
            startExam();
        }
    });
}

function validateInput(input) {
    const errorElement = input.nextElementSibling;
    let isValid = true;
    let errorMessage = '';
    
    // Remover clases previas
    input.classList.remove('valid', 'invalid');
    
    if (!input.value.trim()) {
        isValid = false;
        errorMessage = 'Este campo es obligatorio';
    } else if (input.type === 'email' && !isValidEmail(input.value)) {
        isValid = false;
        errorMessage = 'Ingrese un correo electrónico válido';
    } else if (input.id === 'studentId' && !/^\d{10}$/.test(input.value)) {
        isValid = false;
        errorMessage = 'La matrícula debe tener 10 dígitos';
    } else if (input.id === 'studentName' && input.value.trim().length < 3) {
        isValid = false;
        errorMessage = 'El nombre debe tener al menos 3 caracteres';
    }
    
    input.classList.add(isValid ? 'valid' : 'invalid');
    errorElement.textContent = errorMessage;
    
    return isValid;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ====== Iniciar Examen ======
function startExam() {
    // Ocultar registro, mostrar examen
    document.getElementById('registrationSection').classList.add('hidden');
    document.getElementById('examSection').classList.remove('hidden');
    
    // Preparar preguntas (mezcladas)
    state.questions = prepareQuestions();
    state.startTime = new Date();
    
    // Iniciar timer
    startTimer();
    
    // Crear indicadores de preguntas
    createQuestionIndicators();
    
    // Mostrar primera pregunta
    showQuestion(0);
    
    // Mostrar toast
    showToast('success', '¡Examen iniciado! Buena suerte.');
}

function startTimer() {
    const timerElement = document.getElementById('timer');
    
    state.timerInterval = setInterval(() => {
        const elapsed = Math.floor((new Date() - state.startTime) / 1000);
        const hours = String(Math.floor(elapsed / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
        const seconds = String(elapsed % 60).padStart(2, '0');
        timerElement.textContent = `${hours}:${minutes}:${seconds}`;
    }, 1000);
}

function createQuestionIndicators() {
    const container = document.getElementById('questionIndicators');
    container.innerHTML = '';
    
    state.questions.forEach((_, index) => {
        const indicator = document.createElement('div');
        indicator.className = 'question-indicator';
        indicator.textContent = index + 1;
        indicator.addEventListener('click', () => goToQuestion(index));
        container.appendChild(indicator);
    });
    
    updateQuestionIndicators();
}

function updateQuestionIndicators() {
    const indicators = document.querySelectorAll('.question-indicator');
    
    indicators.forEach((indicator, index) => {
        indicator.classList.remove('current', 'answered');
        
        if (index === state.currentQuestion) {
            indicator.classList.add('current');
        } else if (state.answers[state.questions[index].id]) {
            indicator.classList.add('answered');
        }
    });
}

// ====== Navegación del Examen ======
function setupExamNavigation() {
    document.getElementById('prevBtn').addEventListener('click', () => {
        if (state.currentQuestion > 0) {
            goToQuestion(state.currentQuestion - 1);
        }
    });
    
    document.getElementById('nextBtn').addEventListener('click', () => {
        if (state.currentQuestion < state.questions.length - 1) {
            goToQuestion(state.currentQuestion + 1);
        }
    });
    
    document.getElementById('submitBtn').addEventListener('click', () => {
        showConfirmModal();
    });
}

function goToQuestion(index) {
    state.currentQuestion = index;
    showQuestion(index);
    updateNavigationButtons();
    updateQuestionIndicators();
    updateProgress();
}

function showQuestion(index) {
    const container = document.getElementById('questionsContainer');
    const question = state.questions[index];
    
    if (question.type === 'multiple') {
        container.innerHTML = renderMultipleChoiceQuestion(question, index);
        setupMultipleChoiceListeners(question);
    } else if (question.type === 'dragdrop') {
        container.innerHTML = renderDragDropQuestion(question, index);
        setupDragDropListeners(question);
    }
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    prevBtn.disabled = state.currentQuestion === 0;
    
    if (state.currentQuestion === state.questions.length - 1) {
        nextBtn.classList.add('hidden');
        submitBtn.classList.remove('hidden');
    } else {
        nextBtn.classList.remove('hidden');
        submitBtn.classList.add('hidden');
    }
}

function updateProgress() {
    const answered = Object.keys(state.answers).length;
    const total = state.questions.length;
    const percentage = (answered / total) * 100;
    
    document.getElementById('progressText').textContent = 
        `Pregunta ${state.currentQuestion + 1} de ${total}`;
    document.getElementById('scorePreview').textContent = 
        `Respondidas: ${answered}/${total}`;
    document.getElementById('progressFill').style.width = `${percentage}%`;
}

// ====== Renderizar Pregunta de Opción Múltiple ======
function renderMultipleChoiceQuestion(question, index) {
    const savedAnswer = state.answers[question.id] || [];
    
    return `
        <div class="question-card" data-question-id="${question.id}">
            <div class="question-type-badge">
                <span class="material-icons">${question.multipleCorrect ? 'check_box' : 'radio_button_checked'}</span>
                ${question.multipleCorrect ? 'Selección Múltiple' : 'Opción Única'}
            </div>
            <div class="question-header">
                <span class="question-number">${index + 1}</span>
                <p class="question-text">${question.question}</p>
                <span class="question-points">5 pts</span>
            </div>
            <div class="options-list">
                ${question.options.map((option, optIndex) => `
                    <div class="option-item ${savedAnswer.includes(option.id) ? 'selected' : ''}" 
                         data-option-id="${option.id}">
                        <div class="option-checkbox"></div>
                        <span class="option-letter">${String.fromCharCode(65 + optIndex)}.</span>
                        <span class="option-text">${option.text}</span>
                    </div>
                `).join('')}
            </div>
            ${question.multipleCorrect ? 
                '<p style="margin-top: 16px; font-size: 14px; color: #666; text-align: center;"><em>Selecciona todas las opciones correctas</em></p>' : 
                ''}
        </div>
    `;
}

function setupMultipleChoiceListeners(question) {
    const options = document.querySelectorAll('.option-item');
    
    options.forEach(option => {
        option.addEventListener('click', () => {
            const optionId = option.dataset.optionId;
            
            if (question.multipleCorrect) {
                // Múltiple selección
                option.classList.toggle('selected');
                
                // Actualizar respuestas
                const currentAnswer = state.answers[question.id] || [];
                if (currentAnswer.includes(optionId)) {
                    state.answers[question.id] = currentAnswer.filter(id => id !== optionId);
                } else {
                    state.answers[question.id] = [...currentAnswer, optionId];
                }
                
                // Limpiar si está vacío
                if (state.answers[question.id].length === 0) {
                    delete state.answers[question.id];
                }
            } else {
                // Selección única
                options.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                state.answers[question.id] = [optionId];
            }
            
            updateQuestionIndicators();
            updateProgress();
        });
    });
}

// ====== Renderizar Pregunta de Drag and Drop ======
function renderDragDropQuestion(question, index) {
    const savedAnswer = state.answers[question.id] || {};
    
    return `
        <div class="question-card" data-question-id="${question.id}">
            <div class="question-type-badge">
                <span class="material-icons">drag_indicator</span>
                Arrastrar y Soltar
            </div>
            <div class="question-header">
                <span class="question-number">${index + 1}</span>
                <p class="question-text">${question.question}</p>
                <span class="question-points">5 pts</span>
            </div>
            
            <div class="drag-drop-container">
                <div class="drag-column">
                    <div class="drag-column-header">
                        <span class="material-icons">inventory_2</span>
                        Opciones
                    </div>
                    <div class="draggable-items" id="sourceColumn">
                        ${question.shuffledItems.filter(item => 
                            !Object.values(savedAnswer).includes(item)
                        ).map(item => `
                            <div class="draggable-item" draggable="true" data-item="${item}">
                                <span class="material-icons drag-handle">drag_indicator</span>
                                <span>${item}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="drag-column">
                    <div class="drag-column-header">
                        <span class="material-icons">assignment</span>
                        Destinos
                    </div>
                    <div class="draggable-items" id="targetColumn">
                        ${question.shuffledTargets.map((target, idx) => {
                            const matchedItem = Object.entries(savedAnswer).find(([key, value]) => value === target)?.[1];
                            const sourceItem = Object.entries(savedAnswer).find(([_, t]) => {
                                const pair = question.pairs.find(p => p.target === target);
                                return pair && savedAnswer[pair.item] === pair.target;
                            });
                            
                            // Buscar si hay un item asignado a este target
                            let assignedItem = null;
                            for (const [item, assignedTarget] of Object.entries(savedAnswer)) {
                                if (assignedTarget === target) {
                                    assignedItem = item;
                                    break;
                                }
                            }
                            
                            return `
                                <div class="dd-question-statement">
                                    <div class="dd-statement-text">${target}</div>
                                    <div class="drop-zone ${assignedItem ? 'has-item' : ''}" 
                                         data-target="${target}">
                                        ${assignedItem ? 
                                            `<div class="dropped-item" draggable="true" data-item="${assignedItem}">
                                                ${assignedItem}
                                            </div>` : 
                                            '<span class="drop-zone-placeholder">Suelta aquí</span>'
                                        }
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function setupDragDropListeners(question) {
    const draggables = document.querySelectorAll('.draggable-item, .dropped-item');
    const dropZones = document.querySelectorAll('.drop-zone');
    const sourceColumn = document.getElementById('sourceColumn');
    
    let draggedItem = null;
    let draggedFromZone = null;
    
    // Eventos para elementos arrastrables
    draggables.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            draggedItem = item;
            draggedFromZone = item.closest('.drop-zone');
            item.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });
        
        item.addEventListener('dragend', () => {
            if (draggedItem) {
                draggedItem.classList.remove('dragging');
            }
            draggedItem = null;
            draggedFromZone = null;
        });
    });
    
    // Eventos para zonas de soltar
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });
        
        zone.addEventListener('dragleave', () => {
            zone.classList.remove('drag-over');
        });
        
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            
            if (!draggedItem) return;
            
            const itemValue = draggedItem.dataset.item;
            const targetValue = zone.dataset.target;
            
            // Si la zona ya tiene un item, devolverlo al source
            const existingItem = zone.querySelector('.dropped-item');
            if (existingItem) {
                const existingValue = existingItem.dataset.item;
                delete state.answers[question.id]?.[existingValue];
                
                // Crear nuevo elemento en source
                const newDraggable = document.createElement('div');
                newDraggable.className = 'draggable-item';
                newDraggable.draggable = true;
                newDraggable.dataset.item = existingValue;
                newDraggable.innerHTML = `
                    <span class="material-icons drag-handle">drag_indicator</span>
                    <span>${existingValue}</span>
                `;
                sourceColumn.appendChild(newDraggable);
                setupSingleDraggable(newDraggable, question);
            }
            
            // Si viene de otra zona, actualizar
            if (draggedFromZone) {
                // Remover de answers anterior
                const oldTarget = draggedFromZone.dataset.target;
                for (const [key, val] of Object.entries(state.answers[question.id] || {})) {
                    if (val === oldTarget) {
                        delete state.answers[question.id][key];
                    }
                }
                
                // Resetear zona anterior
                draggedFromZone.innerHTML = '<span class="drop-zone-placeholder">Suelta aquí</span>';
                draggedFromZone.classList.remove('has-item');
            } else {
                // Remover del source
                draggedItem.remove();
            }
            
            // Colocar en la nueva zona
            zone.innerHTML = `
                <div class="dropped-item" draggable="true" data-item="${itemValue}">
                    ${itemValue}
                </div>
            `;
            zone.classList.add('has-item');
            
            // Guardar respuesta
            if (!state.answers[question.id]) {
                state.answers[question.id] = {};
            }
            state.answers[question.id][itemValue] = targetValue;
            
            // Configurar nuevo draggable
            const newDropped = zone.querySelector('.dropped-item');
            setupSingleDraggable(newDropped, question);
            
            updateQuestionIndicators();
            updateProgress();
        });
    });
    
    // También permitir soltar de vuelta al source
    sourceColumn.addEventListener('dragover', (e) => {
        if (draggedFromZone) {
            e.preventDefault();
            sourceColumn.classList.add('drag-over');
        }
    });
    
    sourceColumn.addEventListener('dragleave', () => {
        sourceColumn.classList.remove('drag-over');
    });
    
    sourceColumn.addEventListener('drop', (e) => {
        if (!draggedFromZone) return;
        
        e.preventDefault();
        sourceColumn.classList.remove('drag-over');
        
        const itemValue = draggedItem.dataset.item;
        const targetValue = draggedFromZone.dataset.target;
        
        // Remover de answers
        delete state.answers[question.id]?.[itemValue];
        
        // Resetear zona
        draggedFromZone.innerHTML = '<span class="drop-zone-placeholder">Suelta aquí</span>';
        draggedFromZone.classList.remove('has-item');
        
        // Crear nuevo elemento en source
        const newDraggable = document.createElement('div');
        newDraggable.className = 'draggable-item';
        newDraggable.draggable = true;
        newDraggable.dataset.item = itemValue;
        newDraggable.innerHTML = `
            <span class="material-icons drag-handle">drag_indicator</span>
            <span>${itemValue}</span>
        `;
        sourceColumn.appendChild(newDraggable);
        setupSingleDraggable(newDraggable, question);
        
        updateQuestionIndicators();
        updateProgress();
    });
}

function setupSingleDraggable(item, question) {
    item.addEventListener('dragstart', (e) => {
        item.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        
        // Marcar si viene de una zona
        window.currentDraggedItem = item;
        window.currentDraggedFromZone = item.closest('.drop-zone');
    });
    
    item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
        window.currentDraggedItem = null;
        window.currentDraggedFromZone = null;
    });
}

// ====== Modal de Confirmación ======
function setupConfirmModal() {
    document.getElementById('cancelSubmit').addEventListener('click', () => {
        document.getElementById('confirmModal').classList.add('hidden');
    });
    
    document.getElementById('confirmSubmit').addEventListener('click', () => {
        document.getElementById('confirmModal').classList.add('hidden');
        submitExam();
    });
    
    // Cerrar al hacer clic en overlay
    document.querySelector('.modal-overlay').addEventListener('click', () => {
        document.getElementById('confirmModal').classList.add('hidden');
    });
}

function showConfirmModal() {
    const answered = Object.keys(state.answers).length;
    const total = state.questions.length;
    const unanswered = total - answered;
    
    const statusElement = document.getElementById('modalQuestionsStatus');
    
    if (unanswered > 0) {
        statusElement.innerHTML = `
            <span style="color: var(--warning-600);">
                ⚠️ <strong>${unanswered}</strong> pregunta(s) sin responder
            </span>
        `;
    } else {
        statusElement.innerHTML = `
            <span style="color: var(--success-600);">
                ✓ Todas las preguntas respondidas
            </span>
        `;
    }
    
    document.getElementById('confirmModal').classList.remove('hidden');
}

// ====== Enviar Examen ======
async function submitExam() {
    if (state.submitted) return;
    
    state.submitted = true;
    state.endTime = new Date();
    clearInterval(state.timerInterval);
    
    // Mostrar loading
    document.getElementById('loadingOverlay').classList.remove('hidden');
    
    // Calcular resultados
    const results = calculateResults();
    
    // Intentar enviar a Google Sheets
    try {
        await sendToGoogleSheets(results);
        showToast('success', 'Resultados guardados correctamente');
    } catch (error) {
        console.error('Error al enviar a Google Sheets:', error);
        showToast('error', 'No se pudo guardar en la nube, pero tus resultados están listos');
    }
    
    // Ocultar loading
    document.getElementById('loadingOverlay').classList.add('hidden');
    
    // Mostrar resultados
    showResults(results);
}

function calculateResults() {
    let correctCount = 0;
    let incorrectCount = 0;
    let totalPoints = 0;
    const details = [];
    
    state.questions.forEach(question => {
        const userAnswer = state.answers[question.id];
        let isCorrect = false;
        let points = 0;
        
        if (question.type === 'multiple') {
            // Para preguntas de opción múltiple
            const correctOptions = question.options
                .filter(opt => opt.correct)
                .map(opt => opt.id)
                .sort();
            
            const selectedOptions = (userAnswer || []).sort();
            
            // Verificar si las respuestas coinciden exactamente
            isCorrect = correctOptions.length === selectedOptions.length &&
                        correctOptions.every((opt, idx) => opt === selectedOptions[idx]);
            
            if (isCorrect) {
                points = 5;
                correctCount++;
            } else {
                incorrectCount++;
            }
        } else if (question.type === 'dragdrop') {
            // Para preguntas de drag and drop
            let correctPairs = 0;
            const totalPairs = question.pairs.length;
            
            question.pairs.forEach(pair => {
                if (userAnswer && userAnswer[pair.item] === pair.target) {
                    correctPairs++;
                }
            });
            
            // Considerar correcta si todos los pares están bien
            isCorrect = correctPairs === totalPairs;
            
            if (isCorrect) {
                points = 5;
                correctCount++;
            } else {
                // Puntos parciales proporcionales
                points = Math.round((correctPairs / totalPairs) * 5 * 10) / 10;
                incorrectCount++;
            }
        }
        
        totalPoints += points;
        
        details.push({
            question,
            userAnswer,
            isCorrect,
            points
        });
    });
    
    const timeSpent = Math.floor((state.endTime - state.startTime) / 1000);
    
    return {
        studentInfo: state.studentInfo,
        totalPoints: Math.round(totalPoints * 10) / 10,
        correctCount,
        incorrectCount,
        timeSpent,
        details,
        timestamp: new Date().toISOString()
    };
}

// ====== Enviar a Google Sheets ======
async function sendToGoogleSheets(results) {
    // Si no hay URL configurada, simular éxito
    if (GOOGLE_SHEETS_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL') {
        console.log('Google Sheets URL no configurada. Datos:', results);
        
        // Guardar en localStorage como respaldo
        const savedResults = JSON.parse(localStorage.getItem('examResults') || '[]');
        savedResults.push(results);
        localStorage.setItem('examResults', JSON.stringify(savedResults));
        
        return { success: true, message: 'Guardado localmente' };
    }
    
    const payload = {
        studentName: results.studentInfo.name,
        studentId: results.studentInfo.id,
        studentEmail: results.studentInfo.email,
        totalPoints: results.totalPoints,
        correctCount: results.correctCount,
        incorrectCount: results.incorrectCount,
        timeSpent: formatTime(results.timeSpent),
        timestamp: results.timestamp,
        answers: JSON.stringify(state.answers)
    };
    
    const response = await fetch(GOOGLE_SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    
    return { success: true };
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
}

// ====== Mostrar Resultados ======
function showResults(results) {
    document.getElementById('examSection').classList.add('hidden');
    document.getElementById('resultsSection').classList.remove('hidden');
    
    // Actualizar título según puntaje
    const scorePercent = results.totalPoints;
    const icon = document.querySelector('#resultsIcon .material-icons');
    const title = document.getElementById('resultsTitle');
    const subtitle = document.getElementById('resultsSubtitle');
    
    if (scorePercent >= 90) {
        icon.textContent = 'emoji_events';
        title.textContent = '¡Excelente!';
        subtitle.textContent = 'Has demostrado un dominio excepcional del material';
    } else if (scorePercent >= 70) {
        icon.textContent = 'thumb_up';
        title.textContent = '¡Buen trabajo!';
        subtitle.textContent = 'Has aprobado el examen satisfactoriamente';
    } else if (scorePercent >= 60) {
        icon.textContent = 'check_circle';
        title.textContent = 'Aprobado';
        subtitle.textContent = 'Has alcanzado el puntaje mínimo';
    } else {
        icon.textContent = 'trending_up';
        title.textContent = 'Sigue practicando';
        subtitle.textContent = 'Revisa el material y vuelve a intentarlo';
    }
    
    // Actualizar estadísticas
    document.getElementById('finalScore').textContent = Math.round(results.totalPoints);
    document.getElementById('correctCount').textContent = results.correctCount;
    document.getElementById('incorrectCount').textContent = results.incorrectCount;
    document.getElementById('timeSpent').textContent = formatTime(results.timeSpent);
    
    // Animar el círculo de puntuación
    setTimeout(() => {
        const progress = document.getElementById('scoreProgress');
        const dashOffset = 283 - (283 * results.totalPoints / 100);
        progress.style.strokeDashoffset = dashOffset;
        
        // Cambiar color según puntaje
        if (scorePercent >= 70) {
            progress.style.stroke = 'var(--success-500)';
        } else if (scorePercent >= 60) {
            progress.style.stroke = 'var(--warning-500)';
        } else {
            progress.style.stroke = 'var(--error-500)';
        }
    }, 100);
    
    // Guardar resultados para revisión
    state.results = results;
}

// ====== Sección de Revisión ======
function setupReviewSection() {
    document.getElementById('reviewBtn').addEventListener('click', () => {
        showReview();
    });
    
    document.getElementById('backToResults').addEventListener('click', () => {
        document.getElementById('reviewSection').classList.add('hidden');
        document.getElementById('resultsSection').classList.remove('hidden');
    });
}

function showReview() {
    document.getElementById('resultsSection').classList.add('hidden');
    document.getElementById('reviewSection').classList.remove('hidden');
    
    const container = document.getElementById('reviewContainer');
    container.innerHTML = '';
    
    state.results.details.forEach((detail, index) => {
        const card = createReviewCard(detail, index);
        container.appendChild(card);
    });
}

function createReviewCard(detail, index) {
    const { question, userAnswer, isCorrect, points } = detail;
    const card = document.createElement('div');
    card.className = 'review-card';
    
    // Determinar el estado del header
    let headerClass = isCorrect ? 'correct' : (points > 0 ? 'partial' : 'incorrect');
    let statusIcon = isCorrect ? 'check_circle' : (points > 0 ? 'remove_circle' : 'cancel');
    let statusText = isCorrect ? 'Correcto' : (points > 0 ? `Parcial (${points}/5 pts)` : 'Incorrecto');
    
    card.innerHTML = `
        <div class="review-card-header ${headerClass}">
            <div style="display: flex; align-items: center; gap: 8px;">
                <span class="question-number" style="background: rgba(255,255,255,0.3);">${index + 1}</span>
                <span>${question.module}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <span class="material-icons">${statusIcon}</span>
                <span>${statusText}</span>
            </div>
        </div>
        <div class="review-card-body">
            ${renderReviewContent(question, userAnswer, isCorrect)}
        </div>
    `;
    
    return card;
}

function renderReviewContent(question, userAnswer, isCorrect) {
    let content = `<p class="question-text" style="margin-bottom: 16px;">${question.question}</p>`;
    
    if (question.type === 'multiple') {
        content += `<div class="options-list">`;
        
        question.options.forEach(option => {
            const isSelected = userAnswer && userAnswer.includes(option.id);
            const isCorrectOption = option.correct;
            
            let optionClass = '';
            let feedback = '';
            
            if (isSelected && isCorrectOption) {
                optionClass = 'correct';
                feedback = '<span class="option-feedback correct"><span class="material-icons">check</span> Correcto</span>';
            } else if (isSelected && !isCorrectOption) {
                optionClass = 'incorrect';
                feedback = '<span class="option-feedback incorrect"><span class="material-icons">close</span> Incorrecto</span>';
            } else if (!isSelected && isCorrectOption) {
                optionClass = 'should-be-selected';
                feedback = '<span class="option-feedback correct"><span class="material-icons">arrow_back</span> Respuesta correcta</span>';
            }
            
            content += `
                <div class="option-item ${optionClass}">
                    <div class="option-checkbox"></div>
                    <span class="option-text">${option.text}</span>
                    ${feedback}
                </div>
            `;
        });
        
        content += `</div>`;
        
        // Agregar explicación
        content += `
            <div class="review-answer-section" style="margin-top: 16px; background: var(--primary-50); border-left: 4px solid var(--primary-500);">
                <div class="review-answer-label" style="color: var(--primary-700);">
                    <span class="material-icons" style="font-size: 16px; vertical-align: middle;">lightbulb</span> 
                    Explicación
                </div>
                <p style="color: var(--grey-700); margin-top: 8px;">${question.explanation}</p>
            </div>
        `;
    } else if (question.type === 'dragdrop') {
        content += `<div style="display: grid; gap: 12px;">`;
        
        question.pairs.forEach(pair => {
            const userMatch = userAnswer ? userAnswer[pair.item] : null;
            const isMatch = userMatch === pair.target;
            
            content += `
                <div style="display: flex; gap: 12px; align-items: center; padding: 12px; background: ${isMatch ? 'var(--success-50)' : 'var(--error-50)'}; border-radius: 8px; border-left: 4px solid ${isMatch ? 'var(--success-500)' : 'var(--error-500)'};">
                    <span class="material-icons" style="color: ${isMatch ? 'var(--success-600)' : 'var(--error-600)'};">
                        ${isMatch ? 'check_circle' : 'cancel'}
                    </span>
                    <div style="flex: 1;">
                        <strong>${pair.item}</strong>
                        <span style="color: var(--grey-500);"> → </span>
                        ${userMatch ? 
                            `<span style="text-decoration: ${isMatch ? 'none' : 'line-through'}; color: ${isMatch ? 'var(--grey-800)' : 'var(--error-600)'};">${userMatch}</span>` :
                            '<span style="color: var(--grey-400); font-style: italic;">Sin respuesta</span>'
                        }
                        ${!isMatch ? `<br><span style="color: var(--success-600); font-size: 14px;">✓ Correcto: ${pair.target}</span>` : ''}
                    </div>
                </div>
            `;
        });
        
        content += `</div>`;
    }
    
    return content;
}

// ====== Toast Notifications ======
function showToast(type, message) {
    const toast = document.getElementById('toast');
    const icon = toast.querySelector('.toast-icon');
    const msg = toast.querySelector('.toast-message');
    
    toast.className = `toast ${type}`;
    icon.textContent = type === 'success' ? 'check_circle' : 'error';
    msg.textContent = message;
    
    toast.classList.remove('hidden');
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 300);
    }, 3000);
}

// ====== Prevenir cierre accidental ======
window.addEventListener('beforeunload', (e) => {
    if (state.startTime && !state.submitted && Object.keys(state.answers).length > 0) {
        e.preventDefault();
        e.returnValue = '¿Estás seguro de salir? Perderás tu progreso en el examen.';
        return e.returnValue;
    }
});

// ============================================
// SECCIÓN DE SUBIDA DE ARCHIVOS A GOOGLE DRIVE
// ============================================

// URL del Apps Script para subir archivos (configurar después de desplegar)
const GOOGLE_DRIVE_UPLOAD_URL = 'https://script.google.com/macros/s/AKfycbzyzi-gJWYrpFMlp38ZNC6PHBKqFN41Al_NLdrN7iGS3ni50l9pOKyuc2K1bw7LlgRb/exec';

// Estado de archivos
const fileUploadState = {
    files: [],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['.zip', '.rar', '.pdf', '.html', '.css', '.js', '.png', '.jpg', '.jpeg'],
    uploading: false
};

// Inicializar subida de archivos
function initFileUpload() {
    const dropZone = document.getElementById('uploadDropZone');
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseBtn');
    const uploadBtn = document.getElementById('uploadToGoogleBtn');
    
    if (!dropZone || !fileInput) return;
    
    // Click en "busca en tu equipo"
    browseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        fileInput.click();
    });
    
    // Click en toda la zona
    dropZone.addEventListener('click', (e) => {
        if (e.target === browseBtn) return;
        fileInput.click();
    });
    
    // Cambio en input de archivos
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
    
    // Drag & Drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        handleFiles(e.dataTransfer.files);
    });
    
    // Botón de subir
    uploadBtn.addEventListener('click', () => {
        uploadFilesToDrive();
    });
}

// Manejar archivos seleccionados
function handleFiles(files) {
    for (const file of files) {
        // Validar tamaño
        if (file.size > fileUploadState.maxFileSize) {
            showToast('error', `${file.name} excede el límite de 10MB`);
            continue;
        }
        
        // Validar tipo
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        if (!fileUploadState.allowedTypes.includes(ext)) {
            showToast('error', `Tipo de archivo no permitido: ${ext}`);
            continue;
        }
        
        // Verificar si ya existe
        if (fileUploadState.files.some(f => f.name === file.name)) {
            showToast('error', `${file.name} ya está en la lista`);
            continue;
        }
        
        // Agregar archivo
        fileUploadState.files.push(file);
    }
    
    renderFilesList();
    updateUploadButton();
}

// Renderizar lista de archivos
function renderFilesList() {
    const container = document.getElementById('uploadedFilesList');
    if (!container) return;
    
    container.innerHTML = fileUploadState.files.map((file, index) => `
        <div class="uploaded-file-item" data-index="${index}">
            <div class="file-icon">
                <span class="material-icons">${getFileIcon(file.name)}</span>
            </div>
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
            </div>
            <button class="file-remove" onclick="removeFile(${index})" title="Eliminar">
                <span class="material-icons">close</span>
            </button>
        </div>
    `).join('');
}

// Obtener icono según tipo de archivo
function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
        'pdf': 'picture_as_pdf',
        'zip': 'folder_zip',
        'rar': 'folder_zip',
        'html': 'code',
        'css': 'style',
        'js': 'javascript',
        'png': 'image',
        'jpg': 'image',
        'jpeg': 'image'
    };
    return icons[ext] || 'insert_drive_file';
}

// Formatear tamaño de archivo
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// Eliminar archivo de la lista
function removeFile(index) {
    fileUploadState.files.splice(index, 1);
    renderFilesList();
    updateUploadButton();
}

// Actualizar visibilidad del botón de subir
function updateUploadButton() {
    const uploadActions = document.getElementById('uploadActions');
    if (uploadActions) {
        uploadActions.style.display = fileUploadState.files.length > 0 ? 'block' : 'none';
    }
}

// Subir archivos a Google Drive
async function uploadFilesToDrive() {
    if (fileUploadState.files.length === 0 || fileUploadState.uploading) return;
    
    fileUploadState.uploading = true;
    const statusEl = document.getElementById('uploadStatus');
    const uploadBtn = document.getElementById('uploadToGoogleBtn');
    
    // Mostrar estado de carga
    statusEl.className = 'upload-status show uploading';
    statusEl.innerHTML = `
        <span class="material-icons">cloud_upload</span>
        <span>Subiendo archivos...</span>
        <div class="upload-progress">
            <div class="upload-progress-bar" style="width: 0%"></div>
        </div>
    `;
    uploadBtn.disabled = true;
    
    try {
        const progressBar = statusEl.querySelector('.upload-progress-bar');
        let uploaded = 0;
        
        for (const file of fileUploadState.files) {
            // Convertir archivo a base64
            const base64 = await fileToBase64(file);
            
            // Si la URL está configurada, intentar subir
            if (GOOGLE_DRIVE_UPLOAD_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_UPLOAD_URL') {
                await fetch(GOOGLE_DRIVE_UPLOAD_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        fileName: `${state.studentInfo.id}_${state.studentInfo.name}_${file.name}`,
                        fileData: base64,
                        mimeType: file.type,
                        studentId: state.studentInfo.id,
                        studentName: state.studentInfo.name
                    })
                });
            } else {
                // Simular subida
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            uploaded++;
            const progress = (uploaded / fileUploadState.files.length) * 100;
            progressBar.style.width = progress + '%';
        }
        
        // Éxito
        statusEl.className = 'upload-status show success';
        statusEl.innerHTML = `
            <span class="material-icons">check_circle</span>
            <span>${fileUploadState.files.length} archivo(s) subido(s) correctamente</span>
        `;
        
        // Limpiar lista
        fileUploadState.files = [];
        renderFilesList();
        updateUploadButton();
        
        showToast('success', 'Archivos subidos a Google Drive');
        
    } catch (error) {
        console.error('Error al subir archivos:', error);
        
        statusEl.className = 'upload-status show error';
        statusEl.innerHTML = `
            <span class="material-icons">error</span>
            <span>Error al subir. Por favor, usa el enlace de Drive para subir manualmente.</span>
        `;
        
        showToast('error', 'Error al subir archivos');
    }
    
    fileUploadState.uploading = false;
    uploadBtn.disabled = false;
    
    // Ocultar estado después de 5 segundos
    setTimeout(() => {
        statusEl.classList.remove('show');
    }, 5000);
}

// Convertir archivo a base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}

// Inicializar cuando se muestran los resultados
const originalShowResults = showResults;
showResults = function(results) {
    originalShowResults(results);
    initFileUpload();
};

// Hacer removeFile global
window.removeFile = removeFile;
