document.addEventListener("DOMContentLoaded", function () {
    const bookCover = document.getElementById("book-cover");
    const book = document.getElementById("book");
    const leftPage = document.querySelector(".page-left");
    const rightPage = document.querySelector(".page-right");
    const prevPageButton = document.getElementById("prev-page");
    const nextPageButton = document.getElementById("next-page");
    const readButton = document.getElementById("readButton");
    const indexButton = document.getElementById("indexButton");
    const indexModal = new bootstrap.Modal(document.getElementById("indexModal"));
    let currentPage = 0;
    let diarioData = [];

    // Función para convertir fechas de "D/M/YYYY" a "YYYY-MM-DD"
    function convertDateFormat(dateString) {
        if (!dateString || typeof dateString !== 'string') {
            console.error("Fecha no válida:", dateString);
            return null;
        }

        const parts = dateString.split('/');
        if (parts.length !== 3) {
            console.error("Formato de fecha no válido:", dateString);
            return null;
        }

        const [day, month, year] = parts;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // Cargar los datos del JSON
    fetch('DiarioJson.json')
        .then(response => response.json())
        .then(data => {
            // Convertir las fechas en diarioData a formato YYYY-MM-DD y guardar las fechas originales
            diarioData = data.map(entry => ({
                ...entry,
                date: convertDateFormat(entry.date), // Convertir la fecha al formato correcto
                originalDate: entry.date // Guardar la fecha original
            }));

            showPages(currentPage); // Mostrar las primeras dos páginas
            initializeCalendar(); // Inicializar el calendario después de cargar los datos
        })
        .catch(error => console.error('Error al cargar el JSON:', error));

    // Abrir el libro y mostrar las primeras dos páginas
    readButton.addEventListener("click", function () {
        bookCover.classList.add("d-none"); // Ocultar la portada
        book.classList.remove("d-none"); // Mostrar el libro
        showPages(currentPage); // Mostrar las primeras páginas

        // Mostrar las flechas al abrir el libro
        prevPageButton.style.display = 'block';
        nextPageButton.style.display = 'block';
    });

    // Mostrar las páginas izquierda y derecha
    function showPages(pageNumber) {
        if (pageNumber < diarioData.length) {
            const leftData = diarioData[pageNumber];
            const rightData = diarioData[pageNumber + 1] || {}; // Si hay una página siguiente, mostrarla

            // Mostrar contenido de la página izquierda
            leftPage.innerHTML = `
                <div class="page-content">
                    <h5 id="date-left" class="text-muted">${leftData.originalDate}</h5> <!-- Usar la fecha original -->
                    <p id="content-left">${leftData.content}</p>
                </div>
                <footer id="footer-left" class="footer text-center">Página ${pageNumber + 1}</footer>
            `;

            // Mostrar contenido de la página derecha (si existe)
            rightPage.innerHTML = `
                <div class="page-content">
                    <h5 id="date-right" class="text-muted">${rightData.originalDate || ''}</h5> <!-- Usar la fecha original -->
                    <p id="content-right">${rightData.content || ''}</p>
                </div>
                <footer id="footer-right" class="footer text-center">Página ${pageNumber + 2}</footer>
            `;
        }
    }

    // Función para ir a la siguiente página
    function nextPage() {
        if (currentPage < diarioData.length - 2) {
            // Activar la animación
            book.classList.add("animating");

            // Ocultar el contenido gradualmente
            leftPage.style.opacity = 0;
            rightPage.style.opacity = 0;

            setTimeout(() => {
                currentPage += 2;
                showPages(currentPage);

                // Desactivar la animación y mostrar el contenido
                book.classList.remove("animating");
                leftPage.style.opacity = 1;
                rightPage.style.opacity = 1;
            }, 500); // Duración de la animación (1 segundo)
        }
    }

    // Función para ir a la página anterior
    function prevPage() {
        if (currentPage > 0) {
            // Activar la animación
            book.classList.add("animating");

            // Ocultar el contenido gradualmente
            leftPage.style.opacity = 0;
            rightPage.style.opacity = 0;

            setTimeout(() => {
                currentPage -= 2;
                showPages(currentPage);

                // Desactivar la animación y mostrar el contenido
                book.classList.remove("animating");
                leftPage.style.opacity = 1;
                rightPage.style.opacity = 1;
            }, 500); // Duración de la animación (1 segundo)
        }
    }

    // Inicializar FullCalendar
    function initializeCalendar() {
        const calendarEl = document.getElementById("calendar");

        // Obtener la primera y última fecha del JSON
        const startDate = diarioData[0].date; // Primera fecha
        const endDate = diarioData[diarioData.length - 1].date; // Última fecha

        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: "dayGridMonth", // Vista mensual
            locale: "es", // Idioma español
            initialDate: startDate, // Fecha inicial (primera fecha del JSON)
            validRange: {
                start: startDate, // Fecha de inicio (primera fecha del JSON)
                end: endDate // Fecha de fin (última fecha del JSON)
            },
            events: diarioData
                .filter(entry => entry.content.trim() !== "") // Filtrar fechas con contenido
                .map(entry => ({
                    title: "📖", // Icono para fechas con contenido
                    start: entry.date, // Usar la fecha ya convertida
                    allDay: true
                })),
            dateClick: function (info) {
                const dateString = info.dateStr; // La fecha ya está en formato YYYY-MM-DD
                const pageIndex = diarioData.findIndex(entry => entry.date === dateString); // Buscar la fecha en diarioData
                if (pageIndex !== -1) {
                    currentPage = pageIndex; // Actualizar la página actual
                    showPages(currentPage); // Mostrar la página correspondiente
                    indexModal.hide(); // Ocultar el modal después de seleccionar una fecha
                } else {
                    console.warn("No se encontró contenido para la fecha:", dateString);
                }
            }
        });

        calendar.render();

        // Mostrar el calendario al hacer clic en el botón "Índice"
        indexButton.addEventListener("click", () => {
            indexModal.show();
        });
    }

    // Funciones para las flechas de navegación
    nextPageButton.addEventListener("click", nextPage);
    prevPageButton.addEventListener("click", prevPage);
});