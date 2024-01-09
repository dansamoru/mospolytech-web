const apiKey = "8ed772d7-a21f-4e85-b9e8-9c337d3b03ad";
const globalApiUrl = 'http://exam-2023-1-api.std-900.ist.mospolytech.ru/api';


const routeList = document.getElementById("route-list");
const paginationList = document.getElementById("pagination-list");


const routesPerPage = 5;
const cellMaxLength = 300;
let currentPage = 1;
let currentRouteNumber = null;
let currentGuideNumber = null;
let currentRoute = null;
let currentGuide = null;


async function getRoutes() {
    const apiUrl = new URL(
        `${globalApiUrl}/routes`
    );
    apiUrl.searchParams.append("api_key", apiKey);

    try {
        const response = await fetch(apiUrl);
        return await response.json();
    } catch (error) {
        console.error(error);
    }
}

async function getGuides() {
    if (currentRouteNumber === null) {
        return [];
    }

    const apiUrl = new URL(
        `${globalApiUrl}/routes/${currentRouteNumber}/guides`
    );
    apiUrl.searchParams.append("api_key", apiKey);

    try {
        const response = await fetch(apiUrl);
        return await response.json();
    } catch (error) {
        console.error(error);
    }
}


function renderRoutes(routes) {
    routeList.innerHTML = "";

    const routesTable = document.createElement("table");
    routesTable.className = "table table-striped";

    const routesTableHeader = document.createElement("thead");
    routesTableHeader.innerHTML = `
        <tr>
            <th>Название</th>
            <th>Описание</th>
            <th>Маршрут</th>
            <th></th>
        </tr>
    `;

    routesTable.appendChild(routesTableHeader);

    const routesTableBody = document.createElement("tbody");

    const start = (currentPage - 1) * routesPerPage;
    const end = start + routesPerPage;
    const routesToShow = routes.slice(start, end);

    routesToShow.forEach((route) => {
        const row = document.createElement("tr");
        if (currentRouteNumber === route.id) {
            row.classList.add("table-success");
        }

        const nameCell = document.createElement("td");
        nameCell.textContent = route.name;

        const descriptionCell = document.createElement("td");
        descriptionCell.classList.add("tt");
        if (route.description.length > cellMaxLength) {
            descriptionCell.textContent =
                route.description.substring(0, cellMaxLength) +
                "...";
            descriptionCell.setAttribute("title", route.description);
            descriptionCell.setAttribute("data-bs-toggle", "tooltip");
            descriptionCell.setAttribute("data-bs-placement", "bottom");
        } else {
            descriptionCell.textContent = route.description;
        }

        const mainObjectCell = document.createElement("td");
        descriptionCell.classList.add("tt");
        if (route.mainObject.length > cellMaxLength) {
            mainObjectCell.textContent =
                route.mainObject.substring(0, cellMaxLength) +
                "...";
            mainObjectCell.setAttribute("title", route.mainObject);
            mainObjectCell.setAttribute("data-bs-toggle", "tooltip");
            mainObjectCell.setAttribute("data-bs-placement", "bottom");
        } else {
            mainObjectCell.textContent = route.mainObject;
        }

        const selectCell = document.createElement("td");
        const selectButton = document.createElement("button");
        selectButton.className = "btn btn-primary";
        selectButton.textContent = "Выбрать";
        selectButton.addEventListener("click", () => {
            if (currentRouteNumber !== route.id) {
                currentRouteNumber = route.id;
                currentRoute = route;
            }
            renderGuides();
            renderRoutes(routes);
            window.location.href = "#guide-list";
        });
        row.appendChild(nameCell);
        row.appendChild(descriptionCell);
        row.appendChild(mainObjectCell);
        selectCell.appendChild(selectButton);
        row.appendChild(selectCell);

        routesTableBody.appendChild(row);
    });

    routesTable.appendChild(routesTableBody);
    routeList.appendChild(routesTable);

    renderPagination(routes.length, routes);
}

function renderOrderModal(isFirst) {
    let orderModal = document.getElementById("orderModal");
    let orderModalRouteName = document.getElementById("orderModalRouteName");
    let orderModalGuideName = document.getElementById("orderModalGuideName");
    let orderModalDate = document.getElementById("orderModalDate");
    let orderModalTime = document.getElementById("orderModalTime");
    let orderModalDuration = document.getElementById("orderModalDuration");
    let orderModalPeopleQuantity = document.getElementById("orderModalPeopleQuantity");
    let orderModalInteractive = document.getElementById("orderModalInteractive");
    let orderModalSignLanguage = document.getElementById("orderModalSignLanguage");
    let orderModalPrice = document.getElementById("orderModalPrice");

    if (isFirst) {

        orderModalRouteName.value = currentRoute.name;
        orderModalGuideName.value = currentGuide.name;

        orderModalDate.valueAsDate = new Date(Date.now() + 86400000);
        orderModalTime.value = "10:00";

        orderModalDuration.addEventListener("change", () => {
            renderOrderModal();
        });
        orderModalPeopleQuantity.addEventListener("input", () => {
            renderOrderModal();
        });
        orderModalInteractive.addEventListener("input", () => {
            renderOrderModal()
        });
        orderModalSignLanguage.addEventListener("input", () => {
            renderOrderModal()
        });
    }

    // Сопровождение сурдопереводчика. Увеличивает стоимость на 15%, если посетителей
    // от 1 до 5, на 25%, если от 5 до 10. При выборе количества посетителей больше 10,
    //     данная опция блокируется.

    if (orderModalPeopleQuantity.value > 10) {
        orderModalSignLanguage.checked = false;
        orderModalSignLanguage.disabled = true;
    } else {
        orderModalSignLanguage.disabled = false;
    }

    if (orderModalSignLanguage.checked) {
        if (orderModalPeopleQuantity.value <= 5) {
            orderModalPrice.value = currentGuide.pricePerHour * orderModalDuration.value * orderModalPeopleQuantity.value * (orderModalInteractive.checked ? 1.5 : 1) * 1.15;
        } else if (orderModalPeopleQuantity.value <= 10) {
            orderModalPrice.value = currentGuide.pricePerHour * orderModalDuration.value * orderModalPeopleQuantity.value * (orderModalInteractive.checked ? 1.5 : 1) * 1.25;
        } else {
            orderModalPrice.value = currentGuide.pricePerHour * orderModalDuration.value * orderModalPeopleQuantity.value * (orderModalInteractive.checked ? 1.5 : 1);
        }
    } else {
        orderModalPrice.value = currentGuide.pricePerHour * orderModalDuration.value * orderModalPeopleQuantity.value * (orderModalInteractive.checked ? 1.5 : 1);
    }
}

async function renderGuides(routeId) {
    const guidesContainer = document.getElementById("guide-list");
    guidesContainer.innerHTML = "";

    try {
        const guides = await getGuides(routeId);
        if (currentRouteNumber === null) {
            return;
        }
        if (guides.length === 0) {
            guidesContainer.innerHTML = "<p>Нет доступных гидов</p>";
            return;
        }

        const guidesTable = document.createElement("table");
        guidesTable.className = "table table-striped";

        const guidesTableHeader = document.createElement("thead");
        guidesTableHeader.innerHTML = `
            <tr>
                <th>Имя</th>
                <th>Язык</th>
                <th>Цена, ₽/час</th>
                <th>Стаж, лет</th>
                <th></th>
            </tr>
        `;
        guidesTable.appendChild(guidesTableHeader);

        const guidesTableBody = document.createElement("tbody");

        guides.forEach((guide) => {
            const row = document.createElement("tr");
            if (currentGuideNumber === guide.id) {
                row.classList.add("table-success");
            }

            const nameCell = document.createElement("td");
            nameCell.textContent = guide.name;

            const languageCell = document.createElement("td");
            languageCell.textContent = guide.language;

            const priceCell = document.createElement("td");
            priceCell.textContent = guide.pricePerHour;

            const experienceCell = document.createElement("td");
            experienceCell.textContent = guide.workExperience;

            const selectCell = document.createElement("td");
            selectCell.className = "d-flex justify-content-end";
            const selectButton = document.createElement("button");
            selectButton.className = "btn btn-primary";
            selectButton.setAttribute("data-bs-toggle", "modal");
            selectButton.setAttribute("data-bs-target", "#orderModal");
            selectButton.textContent = "Оформить заявку";
            selectButton.addEventListener("click", () => {
                if (currentGuideNumber !== guide.id) {
                    currentGuideNumber = guide.id;
                    currentGuide = guide;
                }
                renderGuides(routeId);

                renderOrderModal(true);

            });

            selectCell.appendChild(selectButton);

            row.appendChild(nameCell);
            row.appendChild(languageCell);
            row.appendChild(priceCell);
            row.appendChild(experienceCell);
            row.appendChild(selectCell);

            guidesTableBody.appendChild(row);
        });

        guidesTable.appendChild(guidesTableBody);
        guidesContainer.appendChild(guidesTable);
    } catch (error) {
        console.error(error);
    }
}


function renderPagination(totalRoutes, routes) {
    const totalPages = Math.ceil(totalRoutes / routesPerPage);
    paginationList.innerHTML = "";

    const firstButton = document.createElement("li");
    firstButton.className = "page-item";
    firstButton.innerHTML = `<a href="#" class="page-link"><<</a>`;
    firstButton.addEventListener("click", (e) => {
        e.preventDefault();
        currentPage = 1;
        renderRoutes(routes);
    });
    if (currentPage === 1) {
        firstButton.classList.add("disabled");
    }
    paginationList.appendChild(firstButton);

    const prevButton = document.createElement("li");
    prevButton.className = "page-item";
    prevButton.innerHTML = `<a href="#" class="page-link"><</a>`;
    prevButton.addEventListener("click", (e) => {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            renderRoutes(routes);
        }
    });
    if (currentPage === 1) {
        prevButton.classList.add("disabled");
    }
    paginationList.appendChild(prevButton);

    for (let i = Math.max(1, currentPage - 2);
         i <= Math.min(totalPages, currentPage + 2); i++) {
        const pageLink = document.createElement("li");
        pageLink.className = "page-item";
        if (i === currentPage) {
            pageLink.classList.add("active");
        }
        pageLink.innerHTML = `<a href="#" class="page-link">${i}</a>`;
        pageLink.addEventListener("click", (e) => {
            e.preventDefault();
            currentPage = i;
            renderRoutes(routes);
        });
        paginationList.appendChild(pageLink);
    }

    const nextButton = document.createElement("li");
    nextButton.className = "page-item";
    nextButton.innerHTML = `<a href="#" class="page-link">></a>`;
    nextButton.addEventListener("click", (e) => {
        e.preventDefault();
        if (currentPage < totalPages) {
            currentPage++;
            renderRoutes(routes);
        }
    });
    if (currentPage === totalPages) {
        nextButton.classList.add("disabled");
    }
    paginationList.appendChild(nextButton);

    const lastButton = document.createElement("li");
    lastButton.className = "page-item";
    lastButton.innerHTML = `<a href="#" class="page-link">>></a>`;
    lastButton.addEventListener("click", (e) => {
        e.preventDefault();
        currentPage = totalPages;
        renderRoutes(routes);
    });
    if (currentPage === totalPages) {
        lastButton.classList.add("disabled");
    }
    paginationList.appendChild(lastButton);

}

function tooltipInit() {
    const tooltips = document.querySelectorAll(".tt");
    tooltips.forEach((t) => {
        new bootstrap.Tooltip(t);
    });
}


function createFilters(routes) {
    const routesFiltersContainer = document.getElementById("route-filters");

    const nameFilter = document.createElement("div");
    nameFilter.className = "mb-3";
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Поиск по названию";
    nameInput.className = "form-control";

    renderRoutes(routes);
    nameInput.addEventListener("input", () => {
        currentPage = 1;
        const searchText = nameInput.value.toLowerCase();
        const filteredRoutes = routes.filter((route) =>
            route.name.toLowerCase().includes(searchText)
        );
        renderRoutes(filteredRoutes);
    });

    nameFilter.appendChild(nameInput);
    routesFiltersContainer.appendChild(nameFilter);
}

window.onload = async function () {
    tooltipInit();
    createFilters(await getRoutes());
};
