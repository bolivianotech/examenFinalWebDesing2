/**
 * ============================================
 * BANCO DE PREGUNTAS - EXAMEN FINAL
 * Diseño Web II
 * ============================================
 * 10 Preguntas de Opción Múltiple
 * 10 Preguntas de Drag and Drop
 * Cada pregunta vale 5 puntos (Total: 100 puntos)
 */

const examQuestions = {
    multipleChoice: [
        {
            id: 1,
            type: 'multiple',
            question: '¿Cuáles de las siguientes son etiquetas HTML5 semánticas válidas?',
            options: [
                { id: 'a', text: '&lt;header&gt;', correct: true },
                { id: 'b', text: '&lt;div&gt;', correct: false },
                { id: 'c', text: '&lt;article&gt;', correct: true },
                { id: 'd', text: '&lt;span&gt;', correct: false },
                { id: 'e', text: '&lt;nav&gt;', correct: true },
                { id: 'f', text: '&lt;section&gt;', correct: true }
            ],
            multipleCorrect: true,
            explanation: 'Las etiquetas semánticas de HTML5 (&lt;header&gt;, &lt;article&gt;, &lt;nav&gt;, &lt;section&gt;) describen el significado del contenido. &lt;div&gt; y &lt;span&gt; son contenedores genéricos sin valor semántico.',
            module: 'Módulo 1: Fundamentos HTML y CSS'
        },
        {
            id: 2,
            type: 'multiple',
            question: '¿Cuál es la especificidad CSS correcta para el selector "#principal .texto p"?',
            options: [
                { id: 'a', text: '0, 0, 1, 1 (11 puntos)', correct: false },
                { id: 'b', text: '0, 1, 1, 1 (111 puntos)', correct: true },
                { id: 'c', text: '0, 1, 0, 1 (101 puntos)', correct: false },
                { id: 'd', text: '0, 0, 2, 1 (21 puntos)', correct: false }
            ],
            multipleCorrect: false,
            explanation: 'La especificidad se calcula: 1 ID (#principal = 100) + 1 clase (.texto = 10) + 1 elemento (p = 1) = 111 puntos.',
            module: 'Módulo 1: Fundamentos HTML y CSS'
        },
        {
            id: 3,
            type: 'multiple',
            question: 'Con box-sizing: border-box, si un elemento tiene width: 200px, padding: 20px y border: 5px solid black, ¿cuál será su ancho total visible?',
            options: [
                { id: 'a', text: '250px', correct: false },
                { id: 'b', text: '200px', correct: true },
                { id: 'c', text: '250px más el margen', correct: false },
                { id: 'd', text: '150px', correct: false }
            ],
            multipleCorrect: false,
            explanation: 'Con box-sizing: border-box, el padding y border se INCLUYEN dentro del width declarado. Por lo tanto, el ancho total visible es exactamente 200px.',
            module: 'Módulo 2: Box Model'
        },
        {
            id: 4,
            type: 'multiple',
            question: '¿Cuáles son las características correctas de position: absolute? (Selecciona todas las correctas)',
            options: [
                { id: 'a', text: 'El elemento sale del flujo normal del documento', correct: true },
                { id: 'b', text: 'Se posiciona relativo al ancestro posicionado más cercano', correct: true },
                { id: 'c', text: 'Permanece fijo al hacer scroll', correct: false },
                { id: 'd', text: 'Responde a las propiedades top, right, bottom, left', correct: true },
                { id: 'e', text: 'Mantiene su espacio reservado en el flujo', correct: false }
            ],
            multipleCorrect: true,
            explanation: 'position: absolute saca el elemento del flujo (sin reservar espacio), se posiciona relativo al ancestro posicionado más cercano y responde a top/right/bottom/left.',
            module: 'Módulo 3: Posicionamiento CSS'
        },
        {
            id: 5,
            type: 'multiple',
            question: 'En Flexbox, ¿qué propiedad se usa para alinear los items en el eje transversal (cross axis)?',
            options: [
                { id: 'a', text: 'justify-content', correct: false },
                { id: 'b', text: 'align-items', correct: true },
                { id: 'c', text: 'flex-direction', correct: false },
                { id: 'd', text: 'flex-wrap', correct: false }
            ],
            multipleCorrect: false,
            explanation: 'align-items controla la alineación en el eje transversal (vertical si flex-direction: row). justify-content alinea en el eje principal.',
            module: 'Módulo 4: Layouts con Flexbox y Grid'
        },
        {
            id: 6,
            type: 'multiple',
            question: '¿Cuál es la sintaxis correcta para crear una galería responsive con CSS Grid que se adapte automáticamente?',
            options: [
                { id: 'a', text: 'grid-template-columns: repeat(3, 1fr);', correct: false },
                { id: 'b', text: 'grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));', correct: true },
                { id: 'c', text: 'grid-template-columns: 1fr 1fr 1fr;', correct: false },
                { id: 'd', text: 'grid-auto-columns: 250px;', correct: false }
            ],
            multipleCorrect: false,
            explanation: 'repeat(auto-fit, minmax(250px, 1fr)) crea tantas columnas como quepan con un mínimo de 250px y máximo de 1fr, adaptándose al contenedor automáticamente.',
            module: 'Módulo 4: Layouts con Flexbox y Grid'
        },
        {
            id: 7,
            type: 'multiple',
            question: '¿Cuáles son las formas correctas de declarar una variable en JavaScript moderno? (Selecciona las correctas)',
            options: [
                { id: 'a', text: 'let nombre = "María";', correct: true },
                { id: 'b', text: 'const PI = 3.14159;', correct: true },
                { id: 'c', text: 'var edad = 25;', correct: false },
                { id: 'd', text: 'variable x = 10;', correct: false }
            ],
            multipleCorrect: true,
            explanation: 'En JavaScript moderno (ES6+), se recomienda usar "let" para variables que cambian y "const" para constantes. "var" es la forma antigua con problemas de scope.',
            module: 'Módulo 8: JavaScript'
        },
        {
            id: 8,
            type: 'multiple',
            question: '¿Qué método se utiliza para seleccionar TODOS los elementos que coincidan con un selector CSS?',
            options: [
                { id: 'a', text: 'document.getElementById()', correct: false },
                { id: 'b', text: 'document.querySelector()', correct: false },
                { id: 'c', text: 'document.querySelectorAll()', correct: true },
                { id: 'd', text: 'document.getElementsById()', correct: false }
            ],
            multipleCorrect: false,
            explanation: 'querySelectorAll() retorna un NodeList con TODOS los elementos que coinciden con el selector. querySelector() solo retorna el primero.',
            module: 'Módulo 9: DOM'
        },
        {
            id: 9,
            type: 'multiple',
            question: '¿Cuáles son atributos de validación HTML5 válidos para campos de formulario? (Selecciona TODOS los correctos)',
            options: [
                { id: 'a', text: 'required - Campo obligatorio', correct: true },
                { id: 'b', text: 'minlength="3" - Longitud mínima de caracteres', correct: true },
                { id: 'c', text: 'validate="email" - Validar formato email', correct: false },
                { id: 'd', text: 'pattern="[0-9]{5}" - Expresión regular', correct: true },
                { id: 'e', text: 'mandatory - Campo obligatorio', correct: false },
                { id: 'f', text: 'max="100" - Valor máximo para números', correct: true },
                { id: 'g', text: 'type="email" - Input con validación de email', correct: true }
            ],
            multipleCorrect: true,
            explanation: 'Los atributos de validación HTML5 válidos son: required (obligatorio), minlength/maxlength (longitud de texto), min/max (valores numéricos), pattern (regex), y type="email/url/tel" que incluyen validación automática. Los atributos "validate" y "mandatory" NO existen en HTML5.',
            module: 'Módulo 10: Formularios'
        },
        {
            id: 10,
            type: 'multiple',
            question: '¿Cuál es la diferencia entre localStorage y sessionStorage?',
            options: [
                { id: 'a', text: 'localStorage persiste más allá de la sesión, sessionStorage se borra al cerrar la pestaña', correct: true },
                { id: 'b', text: 'localStorage es más rápido que sessionStorage', correct: false },
                { id: 'c', text: 'sessionStorage puede almacenar más datos', correct: false },
                { id: 'd', text: 'No hay diferencia, son lo mismo', correct: false }
            ],
            multipleCorrect: false,
            explanation: 'localStorage persiste los datos incluso después de cerrar el navegador. sessionStorage solo mantiene los datos mientras la pestaña esté abierta.',
            module: 'Módulo 11: APIs HTML5'
        }
    ],
    
    dragAndDrop: [
        {
            id: 11,
            type: 'dragdrop',
            question: 'Relaciona cada etiqueta HTML semántica con su uso correcto:',
            pairs: [
                { item: '&lt;header&gt;', target: 'Encabezado de página o sección' },
                { item: '&lt;nav&gt;', target: 'Navegación principal' },
                { item: '&lt;main&gt;', target: 'Contenido principal (único)' },
                { item: '&lt;article&gt;', target: 'Contenido independiente' },
                { item: '&lt;aside&gt;', target: 'Contenido complementario' }
            ],
            module: 'Módulo 1: Fundamentos HTML y CSS'
        },
        {
            id: 12,
            type: 'dragdrop',
            question: 'Ordena las capas del Box Model desde el interior hacia el exterior:',
            pairs: [
                { item: 'Content', target: 'Capa 1 (más interior)' },
                { item: 'Padding', target: 'Capa 2' },
                { item: 'Border', target: 'Capa 3' },
                { item: 'Margin', target: 'Capa 4 (más exterior)' }
            ],
            module: 'Módulo 2: Box Model'
        },
        {
            id: 13,
            type: 'dragdrop',
            question: 'Relaciona cada valor de position con su comportamiento:',
            pairs: [
                { item: 'static', target: 'Flujo normal, no responde a top/left' },
                { item: 'relative', target: 'Relativo a posición original, mantiene espacio' },
                { item: 'absolute', target: 'Sale del flujo, relativo a ancestro posicionado' },
                { item: 'fixed', target: 'Relativo al viewport, no se mueve al scroll' },
                { item: 'sticky', target: 'Híbrido que se pega al alcanzar umbral' }
            ],
            module: 'Módulo 3: Posicionamiento CSS'
        },
        {
            id: 14,
            type: 'dragdrop',
            question: 'Relaciona cada propiedad de Flexbox con su función:',
            pairs: [
                { item: 'justify-content', target: 'Alineación en eje principal' },
                { item: 'align-items', target: 'Alineación en eje transversal' },
                { item: 'flex-direction', target: 'Dirección del flujo de items' },
                { item: 'flex-wrap', target: 'Permitir saltos de línea' },
                { item: 'gap', target: 'Espacio entre items' }
            ],
            module: 'Módulo 4: Layouts con Flexbox y Grid'
        },
        {
            id: 15,
            type: 'dragdrop',
            question: 'Relaciona los conceptos de CSS Grid:',
            pairs: [
                { item: 'fr', target: 'Unidad de fracción del espacio disponible' },
                { item: 'repeat()', target: 'Función para repetir valores' },
                { item: 'auto-fit', target: 'Colapsa columnas vacías' },
                { item: 'minmax()', target: 'Define tamaño mínimo y máximo' }
            ],
            module: 'Módulo 4: Layouts con Flexbox y Grid'
        },
        {
            id: 16,
            type: 'dragdrop',
            question: 'Relaciona cada propiedad de animación CSS con su función:',
            pairs: [
                { item: 'animation-name', target: 'Nombre del @keyframes' },
                { item: 'animation-duration', target: 'Duración de la animación' },
                { item: 'animation-iteration-count', target: 'Número de repeticiones' },
                { item: 'animation-fill-mode', target: 'Estado al terminar (forwards/backwards)' },
                { item: 'animation-timing-function', target: 'Curva de velocidad (ease, linear)' }
            ],
            module: 'Módulo 7: Estilos Avanzados'
        },
        {
            id: 17,
            type: 'dragdrop',
            question: 'Relaciona cada tipo de dato JavaScript con su ejemplo:',
            pairs: [
                { item: 'String', target: '"Hola Mundo"' },
                { item: 'Number', target: '42 o 3.14' },
                { item: 'Boolean', target: 'true o false' },
                { item: 'Undefined', target: 'Variable sin valor asignado' },
                { item: 'Null', target: 'Valor nulo intencional' }
            ],
            module: 'Módulo 8: JavaScript'
        },
        {
            id: 18,
            type: 'dragdrop',
            question: 'Relaciona cada método del DOM con su función:',
            pairs: [
                { item: 'getElementById()', target: 'Seleccionar por ID único' },
                { item: 'querySelector()', target: 'Seleccionar primero por selector CSS' },
                { item: 'querySelectorAll()', target: 'Seleccionar todos por selector CSS' },
                { item: 'createElement()', target: 'Crear nuevo elemento HTML' },
                { item: 'appendChild()', target: 'Añadir hijo al final' }
            ],
            module: 'Módulo 9: DOM'
        },
        {
            id: 19,
            type: 'dragdrop',
            question: 'Relaciona cada evento de formulario con su descripción:',
            pairs: [
                { item: 'submit', target: 'Se dispara al enviar el formulario' },
                { item: 'input', target: 'Cambio continuo mientras escribe' },
                { item: 'change', target: 'Cambio confirmado (al perder foco)' },
                { item: 'focus', target: 'El input recibe el foco' },
                { item: 'blur', target: 'El input pierde el foco' }
            ],
            module: 'Módulo 10: Formularios'
        },
        {
            id: 20,
            type: 'dragdrop',
            question: 'Relaciona cada API HTML5 con su funcionalidad:',
            pairs: [
                { item: 'localStorage', target: 'Almacenamiento persistente en navegador' },
                { item: 'Geolocation', target: 'Obtener ubicación del usuario' },
                { item: 'Drag and Drop', target: 'Arrastrar y soltar elementos' },
                { item: 'Canvas', target: 'Dibujar gráficos con JavaScript' },
                { item: 'Fetch', target: 'Hacer peticiones HTTP' }
            ],
            module: 'Módulo 11: APIs HTML5'
        }
    ]
};

// Mezclar opciones/items para aleatorizar
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Combinar y preparar todas las preguntas
function prepareQuestions() {
    const allQuestions = [
        ...examQuestions.multipleChoice.map(q => ({
            ...q,
            options: shuffleArray(q.options)
        })),
        ...examQuestions.dragAndDrop.map(q => ({
            ...q,
            shuffledItems: shuffleArray(q.pairs.map(p => p.item)),
            shuffledTargets: shuffleArray(q.pairs.map(p => p.target))
        }))
    ];
    
    return shuffleArray(allQuestions);
}

// Exportar para uso global
window.examQuestions = examQuestions;
window.prepareQuestions = prepareQuestions;
window.shuffleArray = shuffleArray;
