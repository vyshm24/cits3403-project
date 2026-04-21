const countryStateMap = {
    Australia: [
        "Australian Capital Territory",
        "New South Wales",
        "Northern Territory",
        "Queensland",
        "South Australia",
        "Tasmania",
        "Victoria",
        "Western Australia"
    ],
    Canada: [
        "Alberta",
        "British Columbia",
        "Manitoba",
        "Nova Scotia",
        "Ontario",
        "Quebec"
    ],
    China: [
        "Beijing",
        "Fujian",
        "Guangdong",
        "Jiangsu",
        "Shandong",
        "Shanghai",
        "Sichuan",
        "Zhejiang"
    ],
    France: [
        "Auvergne-Rhone-Alpes",
        "Ile-de-France",
        "Normandy",
        "Nouvelle-Aquitaine",
        "Occitanie",
        "Provence-Alpes-Cote d'Azur"
    ],
    Germany: [
        "Bavaria",
        "Berlin",
        "Hamburg",
        "Hesse",
        "North Rhine-Westphalia",
        "Saxony"
    ],
    Indonesia: [
        "Bali",
        "Central Java",
        "East Java",
        "Jakarta",
        "West Java",
        "Yogyakarta"
    ],
    Italy: [
        "Campania",
        "Lazio",
        "Lombardy",
        "Sicily",
        "Tuscany",
        "Veneto"
    ],
    Japan: [
        "Fukuoka",
        "Hokkaido",
        "Kyoto",
        "Okinawa",
        "Osaka",
        "Tokyo"
    ],
    Malaysia: [
        "Johor",
        "Kuala Lumpur",
        "Penang",
        "Sabah",
        "Sarawak",
        "Selangor"
    ],
    "New Zealand": [
        "Auckland",
        "Canterbury",
        "Otago",
        "Queenstown-Lakes",
        "Waikato",
        "Wellington"
    ],
    Singapore: [
        "Central Region",
        "East Region",
        "North Region",
        "North-East Region",
        "West Region"
    ],
    "South Korea": [
        "Busan",
        "Gangwon",
        "Gyeonggi",
        "Incheon",
        "Jeju",
        "Seoul"
    ],
    Spain: [
        "Andalusia",
        "Balearic Islands",
        "Basque Country",
        "Catalonia",
        "Madrid",
        "Valencia"
    ],
    Switzerland: [
        "Bern",
        "Geneva",
        "Lucerne",
        "Ticino",
        "Vaud",
        "Zurich"
    ],
    Thailand: [
        "Bangkok",
        "Chiang Mai",
        "Krabi",
        "Pattaya",
        "Phuket",
        "Surat Thani"
    ],
    "United Kingdom": [
        "England",
        "Greater London",
        "Greater Manchester",
        "Northern Ireland",
        "Scotland",
        "Wales"
    ],
    "United States": [
        "California",
        "Florida",
        "Hawaii",
        "New York",
        "Texas",
        "Washington"
    ],
    Vietnam: [
        "Da Nang",
        "Hanoi",
        "Ho Chi Minh City",
        "Khanh Hoa",
        "Kien Giang",
        "Quang Ninh"
    ]
};

const restaurantOptions = [
    "Bar / Pub",
    "Buffet",
    "Cafe",
    "Dessert Shop",
    "Fast Food",
    "Fine Dining",
    "Local Restaurant",
    "Other",
    "Seafood Restaurant",
    "Street Food"
];

const accommodationOptions = [
    "Apartment",
    "Camping",
    "Guesthouse",
    "Homestay",
    "Hostel",
    "Hotel",
    "Motel",
    "Other",
    "Resort",
    "Villa"
];

document.addEventListener("DOMContentLoaded", function () {
    disablePlaceholderOptions();
    initializeMultiSelects();
    initializeCountrySelects();
    initializeStateSelects();
    initializeFixedDropdowns();
    initializeCustomDropdowns(document);
});

document.addEventListener("change", function (event) {
    const countrySelect = event.target.closest('select[name^="country_day"]');

    if (!countrySelect) {
        return;
    }

    const dayContainer = countrySelect.closest(".day-container");
    if (!dayContainer) {
        return;
    }

    const stateSelect = dayContainer.querySelector('select[name^="state_day"]');
    const cityInput = dayContainer.querySelector('input[name^="city_day"]');
    if (!stateSelect) {
        return;
    }

    populateStateOptions(stateSelect, countrySelect.value);
    updateCityInputState(cityInput, countrySelect.value);
});

document.addEventListener("click", function (event) {
    if (!event.target.closest(".custom-dropdown, .custom-dropdown-panel")) {
        closeAllCustomDropdowns();
    }
});

document.addEventListener("scroll", function () {
    syncOpenDropdownPanels();
}, true);

window.addEventListener("resize", function () {
    syncOpenDropdownPanels();
});

window.initializeCustomDropdowns = initializeCustomDropdowns;
window.rebuildCustomDropdowns = rebuildCustomDropdowns;

function initializeCountrySelects() {
    document.querySelectorAll('select[name^="country_day"]').forEach(function (select) {
        const selectedValue = select.value;

        setSelectOptions(select, Object.keys(countryStateMap), "Select Country");

        if (selectedValue && countryStateMap[selectedValue]) {
            select.value = selectedValue;
        }
    });
}

function initializeStateSelects() {
    document.querySelectorAll(".day-container").forEach(function (dayContainer) {
        const countrySelect = dayContainer.querySelector('select[name^="country_day"]');
        const stateSelect = dayContainer.querySelector('select[name^="state_day"]');
        const cityInput = dayContainer.querySelector('input[name^="city_day"]');

        if (!countrySelect || !stateSelect) {
            return;
        }

        populateStateOptions(stateSelect, countrySelect.value);
        updateCityInputState(cityInput, countrySelect.value);
    });
}

function initializeFixedDropdowns() {
    document.querySelectorAll('select[name^="restaurant_dropdown_day"]').forEach(function (select) {
        const selectedValue = select.value;

        setSelectOptions(select, restaurantOptions, "Select restaurant type...");

        if (!isMultiSelect(select) && selectedValue && restaurantOptions.includes(selectedValue)) {
            select.value = selectedValue;
        }
    });

    document.querySelectorAll('select[name^="accommodation_dropdown_day"]').forEach(function (select) {
        const selectedValue = select.value;

        setSelectOptions(select, accommodationOptions, "Select accommodation type...");

        if (selectedValue && accommodationOptions.includes(selectedValue)) {
            select.value = selectedValue;
        }
    });
}

function populateStateOptions(stateSelect, country) {
    const selectedValue = stateSelect.value;
    const states = countryStateMap[country] || [];

    setSelectOptions(stateSelect, states, "Select State/Province");
    stateSelect.disabled = !country;

    if (selectedValue && states.includes(selectedValue)) {
        stateSelect.value = selectedValue;
    }

    refreshCustomDropdown(stateSelect);
}

function setSelectOptions(select, options, placeholder) {
    select.innerHTML = "";

    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = placeholder;
    placeholderOption.selected = true;
    placeholderOption.disabled = true;

    select.appendChild(placeholderOption);

    options.forEach(function (optionText) {
        const option = document.createElement("option");
        option.value = optionText;
        option.textContent = optionText;
        select.appendChild(option);
    });

    refreshCustomDropdown(select);
}

function disablePlaceholderOptions() {
    document.querySelectorAll("select").forEach(function (select) {
        const firstOption = select.options[0];

        if (firstOption && firstOption.value === "") {
            firstOption.disabled = true;
        }
    });
}

function updateCityInputState(cityInput, country) {
    if (!cityInput) {
        return;
    }

    const isEnabled = Boolean(country);
    cityInput.disabled = !isEnabled;

    if (!isEnabled) {
        cityInput.value = "";
    }
}

function initializeMultiSelects() {
    document.querySelectorAll('select[name^="restaurant_dropdown_day"], select[name^="accommodation_dropdown_day"]').forEach(function (select) {
        select.multiple = true;
    });
}

function initializeCustomDropdowns(root) {
    root.querySelectorAll("select").forEach(function (select, index) {
        if (select.dataset.customDropdownReady === "true") {
            return;
        }

        buildCustomDropdown(select, index);
    });
}

function rebuildCustomDropdowns(root) {
    root.querySelectorAll("select").forEach(function (select) {
        select.dataset.customDropdownReady = "false";
        const nextSibling = select.nextElementSibling;

        if (nextSibling && nextSibling.classList.contains("custom-dropdown")) {
            nextSibling.remove();
        }
    });

    initializeCustomDropdowns(root);
}

function buildCustomDropdown(select, index) {
    select.dataset.customDropdownReady = "true";
    select.classList.add("custom-select-native");
    select.tabIndex = -1;

    const useSearch = shouldEnableDropdownSearch(select);
    const multiSelect = isMultiSelect(select);

    const dropdown = document.createElement("div");
    dropdown.className = "custom-dropdown";
    dropdown.dataset.selectId = select.id || select.name || "dropdown-" + index;
    if (!useSearch) {
        dropdown.classList.add("custom-dropdown-no-search");
    }

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "custom-dropdown-trigger";
    trigger.setAttribute("aria-expanded", "false");
    trigger.innerHTML = [
        '<span class="custom-dropdown-label"></span>',
        '<svg viewBox="0 0 16 16" aria-hidden="true" class="custom-dropdown-icon">',
        '<path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"></path>',
        "</svg>"
    ].join("");

    const panel = document.createElement("div");
    panel.className = "custom-dropdown-panel";
    panel.dataset.selectId = dropdown.dataset.selectId;
    if (multiSelect) {
        panel.classList.add("custom-dropdown-panel-multi");
    }

    const search = document.createElement("input");
    search.type = "text";
    search.className = "custom-dropdown-search";
    search.placeholder = "Search...";

    const list = document.createElement("div");
    list.className = "custom-dropdown-options";

    if (useSearch) {
        panel.appendChild(search);
    }
    panel.appendChild(list);
    dropdown.appendChild(trigger);
    select.insertAdjacentElement("afterend", dropdown);
    document.body.appendChild(panel);
    dropdown._panel = panel;

    trigger.addEventListener("click", function () {
        if (select.disabled) {
            return;
        }

        const isOpen = dropdown.classList.contains("is-open");
        closeAllCustomDropdowns();

        if (!isOpen) {
            dropdown.classList.add("is-open");
            raiseDropdownAncestors(dropdown);
            trigger.setAttribute("aria-expanded", "true");
            positionDropdownPanel(dropdown);
            if (useSearch) {
                search.value = "";
                renderCustomOptions(select, dropdown, "");
                search.focus();
            } else {
                renderCustomOptions(select, dropdown, "");
            }
        }
    });

    if (useSearch) {
        search.addEventListener("click", function (event) {
            event.stopPropagation();
        });

        search.addEventListener("input", function () {
            renderCustomOptions(select, dropdown, search.value);
        });
    }

    renderCustomOptions(select, dropdown, "");
}

function renderCustomOptions(select, dropdown, keyword) {
    const label = dropdown.querySelector(".custom-dropdown-label");
    const panel = dropdown._panel;
    const list = panel.querySelector(".custom-dropdown-options");
    const normalizedKeyword = keyword.trim().toLowerCase();
    const selectedValues = getSelectedValues(select);
    const visibleOptions = Array.from(select.options).filter(function (option, index) {
        if (index === 0 && option.value === "") {
            return true;
        }

        return option.textContent.toLowerCase().includes(normalizedKeyword);
    });

    renderDropdownLabel(select, label, selectedValues);
    dropdown.classList.toggle("is-disabled", select.disabled);
    list.innerHTML = "";

    visibleOptions.forEach(function (option, index) {
        if (index === 0 && option.value === "" && normalizedKeyword) {
            return;
        }

        const button = document.createElement("button");
        button.type = "button";
        button.className = "custom-dropdown-option";
        button.textContent = option.textContent;
        button.dataset.value = option.value;

        if (selectedValues.includes(option.value)) {
            button.classList.add("is-selected");
        }

        if (option.disabled) {
            button.disabled = true;
            button.classList.add("is-disabled");
        }

        button.addEventListener("click", function () {
            if (option.disabled) {
                return;
            }

            if (isMultiSelect(select)) {
                toggleMultiSelectOption(select, option.value);
            } else {
                select.value = option.value;
            }

            renderCustomOptions(select, dropdown, "");
            select.dispatchEvent(new Event("change", { bubbles: true }));

            if (!isMultiSelect(select)) {
                closeAllCustomDropdowns();
            }
        });

        list.appendChild(button);
    });

    if (!list.children.length) {
        const emptyState = document.createElement("div");
        emptyState.className = "custom-dropdown-empty";
        emptyState.textContent = "No matching options";
        list.appendChild(emptyState);
    }
}

function refreshCustomDropdown(select) {
    const dropdown = select.nextElementSibling;

    if (!dropdown || !dropdown.classList.contains("custom-dropdown")) {
        return;
    }

    const panel = dropdown._panel;
    const search = panel ? panel.querySelector(".custom-dropdown-search") : null;
    renderCustomOptions(select, dropdown, search ? search.value : "");

    if (dropdown.classList.contains("is-open")) {
        positionDropdownPanel(dropdown);
    }
}

function shouldEnableDropdownSearch(select) {
    const noSearchNames = ["trip_type", "budget_level"];
    const noSearchPrefixes = ["restaurant_dropdown_day", "accommodation_dropdown_day"];

    if (noSearchNames.includes(select.name)) {
        return false;
    }

    return !noSearchPrefixes.some(function (prefix) {
        return select.name && select.name.startsWith(prefix);
    });
}

function isMultiSelect(select) {
    if (!select.name) {
        return false;
    }

    return select.name.startsWith("restaurant_dropdown_day") || select.name.startsWith("accommodation_dropdown_day");
}

function getSelectedValues(select) {
    return Array.from(select.options)
        .filter(function (option) {
            return option.selected && option.value !== "";
        })
        .map(function (option) {
            return option.value;
        });
}

function getDropdownLabel(select, selectedValues) {
    const placeholder = select.options[0] ? select.options[0].textContent : "Select an option";

    if (!selectedValues.length) {
        return placeholder;
    }

    if (!isMultiSelect(select)) {
        return selectedValues[0];
    }

    if (selectedValues.length <= 2) {
        return selectedValues.join(", ");
    }

    return selectedValues.slice(0, 2).join(", ") + " +" + (selectedValues.length - 2);
}

function renderDropdownLabel(select, labelElement, selectedValues) {
    labelElement.innerHTML = "";
    labelElement.classList.remove("has-tags");

    if (!isMultiSelect(select)) {
        labelElement.textContent = getDropdownLabel(select, selectedValues);
        return;
    }

    const placeholder = select.options[0] ? select.options[0].textContent : "Select an option";

    if (!selectedValues.length) {
        labelElement.textContent = placeholder;
        return;
    }

    labelElement.classList.add("has-tags");

    selectedValues.slice(0, 2).forEach(function (value) {
        const tag = document.createElement("span");
        tag.className = "custom-dropdown-tag";
        tag.textContent = value;
        labelElement.appendChild(tag);
    });

    if (selectedValues.length > 2) {
        const summaryTag = document.createElement("span");
        summaryTag.className = "custom-dropdown-tag custom-dropdown-tag-muted";
        summaryTag.textContent = "+" + (selectedValues.length - 2);
        labelElement.appendChild(summaryTag);
    }
}

function toggleMultiSelectOption(select, value) {
    Array.from(select.options).forEach(function (option, index) {
        if (index === 0 && option.value === "") {
            option.selected = false;
            return;
        }

        if (option.value === value) {
            option.selected = !option.selected;
        }
    });
}

function closeAllCustomDropdowns() {
    document.querySelectorAll(".custom-dropdown.is-open").forEach(function (dropdown) {
        dropdown.classList.remove("is-open");
        resetDropdownAncestors(dropdown);

        const trigger = dropdown.querySelector(".custom-dropdown-trigger");
        if (trigger) {
            trigger.setAttribute("aria-expanded", "false");
        }

        if (dropdown._panel) {
            dropdown._panel.classList.remove("is-open");
        }
    });
}

function raiseDropdownAncestors(dropdown) {
    const ancestor = dropdown.closest(".general-info-section, .photo-upload-section, .daily-plan-section, .day-container, .activity-item");

    if (ancestor) {
        ancestor.classList.add("dropdown-layer-active");
    }
}

function resetDropdownAncestors(dropdown) {
    const ancestor = dropdown.closest(".general-info-section, .photo-upload-section, .daily-plan-section, .day-container, .activity-item");

    if (ancestor) {
        ancestor.classList.remove("dropdown-layer-active");
    }
}

function positionDropdownPanel(dropdown) {
    const trigger = dropdown.querySelector(".custom-dropdown-trigger");
    const panel = dropdown._panel;

    if (!trigger || !panel) {
        return;
    }

    const rect = trigger.getBoundingClientRect();
    const viewportPadding = 12;
    const panelGap = 6;
    const availableBelow = window.innerHeight - rect.bottom - viewportPadding;
    const availableAbove = rect.top - viewportPadding;
    const preferredHeight = 320;
    const shouldOpenUpward = availableBelow < 220 && availableAbove > availableBelow;
    const maxHeight = Math.max(
        140,
        Math.min(preferredHeight, shouldOpenUpward ? availableAbove - panelGap : availableBelow - panelGap)
    );

    panel.classList.toggle("open-upward", shouldOpenUpward);
    panel.style.left = rect.left + "px";
    panel.style.width = rect.width + "px";
    panel.style.maxHeight = maxHeight + "px";

    if (shouldOpenUpward) {
        panel.style.top = Math.max(viewportPadding, rect.top - maxHeight - panelGap) + "px";
    } else {
        panel.style.top = rect.bottom + panelGap + "px";
    }

    panel.classList.add("is-open");
}

function syncOpenDropdownPanels() {
    document.querySelectorAll(".custom-dropdown.is-open").forEach(function (dropdown) {
        positionDropdownPanel(dropdown);
    });
}
