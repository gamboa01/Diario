document.addEventListener("DOMContentLoaded", function () {
    const bookCover = document.getElementById("book-cover");
    const book = document.getElementById("book");
    const leftPage = document.querySelector(".page-left");
    const rightPage = document.querySelector(".page-right");
    const mobilePage = document.querySelector(".mobile-page");
    const prevPageButton = document.getElementById("prev-page");
    const nextPageButton = document.getElementById("next-page");
    const prevPageMobileButton = document.getElementById("prev-page-mobile");
    const nextPageMobileButton = document.getElementById("next-page-mobile");
    const readButton = document.getElementById("readButton");
    const indexButton = document.getElementById("indexButton");
    const indexModal = new bootstrap.Modal(document.getElementById("indexModal"));
    let currentPage = 0;
    let diarioData = [];

    readButton.addEventListener("click", function () {
    bookCover.classList.add("d-none");
    book.classList.remove("d-none");
    showPages(currentPage);
    // Mostrar botones
    document.getElementById("indexButton").classList.remove("d-none");
    document.querySelector(".mobile-navigation").classList.remove("d-none");
    prevPageButton.classList.remove("d-none");
    nextPageButton.classList.remove("d-none");
    });

    function convertDateFormat(dateString) {
        if (!dateString || typeof dateString !== 'string') return null;
        const parts = dateString.split('/');
        if (parts.length !== 3) return null;
        const [day, month, year] = parts;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    fetch('DiarioJson.json')
        .then(response => response.json())
        .then(data => {
            diarioData = data.map(entry => ({
                ...entry,
                date: convertDateFormat(entry.date),
                originalDate: entry.date
            }));
            showPages(currentPage);
            initializeCalendar();
        })
        .catch(error => console.error('Error al cargar el JSON:', error));

    readButton.addEventListener("click", function () {
        bookCover.classList.add("d-none");
        book.classList.remove("d-none");
        showPages(currentPage);
        prevPageButton.style.display = 'block';
        nextPageButton.style.display = 'block';
    });

    function showPages(pageNumber) {
        if (window.innerWidth < 768) {
            if (pageNumber < diarioData.length) {
                const data = diarioData[pageNumber];
                mobilePage.innerHTML = `
                    <div class="page-content">
                        <h5 class="text-muted">${data.originalDate}</h5>
                        <p>${data.content}</p>
                    </div>
                    <footer class="footer">Página ${pageNumber + 1} de ${diarioData.length}</footer>
                `;
            }
        } else {
            if (pageNumber < diarioData.length) {
                const leftData = diarioData[pageNumber];
                const rightData = diarioData[pageNumber + 1] || {};
                leftPage.innerHTML = `
                    <div class="page-content">
                        <h5 class="text-muted">${leftData.originalDate}</h5>
                        <p>${leftData.content}</p>
                    </div>
                    <footer class="footer text-center">Página ${pageNumber + 1}</footer>
                `;
                rightPage.innerHTML = `
                    <div class="page-content">
                        <h5 class="text-muted">${rightData.originalDate || ''}</h5>
                        <p>${rightData.content || ''}</p>
                    </div>
                    <footer class="footer text-center">Página ${pageNumber + 2}</footer>
                `;
            }
        }
    }

    function nextPage() {
        if (window.innerWidth < 768) {
            if (currentPage < diarioData.length - 1) {
                currentPage++;
                mobilePage.style.opacity = 0;
                requestAnimationFrame(() => {
                    showPages(currentPage);
                    mobilePage.style.opacity = 1;
                });
            }
        } else {
            if (currentPage < diarioData.length - 2) {
                leftPage.style.opacity = 0;
                rightPage.style.opacity = 0;
                setTimeout(() => {
                    currentPage += 2;
                    showPages(currentPage);
                    leftPage.style.opacity = 1;
                    rightPage.style.opacity = 1;
                }, 500);
            }
        }
    }

    function prevPage() {
        if (window.innerWidth < 768) {
            if (currentPage > 0) {
                currentPage--;
                mobilePage.style.opacity = 0;
                requestAnimationFrame(() => {
                    showPages(currentPage);
                    mobilePage.style.opacity = 1;
                });
            }
        } else {
            if (currentPage > 0) {
                leftPage.style.opacity = 0;
                rightPage.style.opacity = 0;
                setTimeout(() => {
                    currentPage -= 2;
                    showPages(currentPage);
                    leftPage.style.opacity = 1;
                    rightPage.style.opacity = 1;
                }, 500);
            }
        }
    }

    function initializeCalendar() {
        const calendarEl = document.getElementById("calendar");
        const startDate = diarioData[0]?.date || new Date();
        const endDate = diarioData[diarioData.length - 1]?.date || new Date();
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: "dayGridMonth",
            locale: "es",
            initialDate: startDate,
            validRange: { start: startDate, end: endDate },
            events: diarioData
                .filter(entry => entry.content.trim() !== "")
                .map(entry => ({
                    title: "📖",
                    start: entry.date,
                    allDay: true
                })),
            dateClick: function (info) {
                const dateString = info.dateStr;
                const pageIndex = diarioData.findIndex(entry => entry.date === dateString);
                if (pageIndex !== -1) {
                    currentPage = pageIndex;
                    showPages(currentPage);
                    indexModal.hide();
                }
            }
        });
        calendar.render();
        indexButton.addEventListener("click", () => indexModal.show());
    }

    nextPageButton.addEventListener("click", nextPage);
    prevPageButton.addEventListener("click", prevPage);
    nextPageMobileButton.addEventListener("click", nextPage);
    prevPageMobileButton.addEventListener("click", prevPage);

    window.addEventListener('resize', () => showPages(currentPage));
});



