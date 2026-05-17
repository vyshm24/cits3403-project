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
    Austria: [
        "Burgenland",
        "Carinthia",
        "Lower Austria",
        "Salzburg",
        "Styria",
        "Tyrol",
        "Upper Austria",
        "Vienna",
        "Vorarlberg"
    ],
    Canada: [
        "Alberta",
        "British Columbia",
        "Manitoba",
        "New Brunswick",
        "Newfoundland and Labrador",
        "Northwest Territories",
        "Nova Scotia",
        "Nunavut",
        "Ontario",
        "Prince Edward Island",
        "Quebec",
        "Saskatchewan",
        "Yukon"
    ],
    China: [
        "Anhui",
        "Beijing",
        "Chongqing",
        "Fujian",
        "Gansu",
        "Guangdong",
        "Guangxi",
        "Guizhou",
        "Hainan",
        "Hebei",
        "Heilongjiang",
        "Henan",
        "Hong Kong",
        "Hubei",
        "Hunan",
        "Inner Mongolia",
        "Jiangsu",
        "Jiangxi",
        "Jilin",
        "Liaoning",
        "Macau",
        "Ningxia",
        "Qinghai",
        "Shaanxi",
        "Shandong",
        "Shanghai",
        "Shanxi",
        "Sichuan",
        "Taiwan",
        "Tianjin",
        "Tibet",
        "Xinjiang",
        "Yunnan",
        "Zhejiang"
    ],
    France: [
        "Auvergne-Rhone-Alpes",
        "Bourgogne-Franche-Comte",
        "Brittany",
        "Centre-Val de Loire",
        "Corsica",
        "Grand Est",
        "Hauts-de-France",
        "Ile-de-France",
        "Normandy",
        "Nouvelle-Aquitaine",
        "Occitanie",
        "Pays de la Loire",
        "Provence-Alpes-Cote d'Azur"
    ],
    Germany: [
        "Baden-Wurttemberg",
        "Bavaria",
        "Berlin",
        "Brandenburg",
        "Bremen",
        "Hamburg",
        "Hesse",
        "Lower Saxony",
        "Mecklenburg-Vorpommern",
        "North Rhine-Westphalia",
        "Rhineland-Palatinate",
        "Saarland",
        "Saxony",
        "Saxony-Anhalt",
        "Schleswig-Holstein",
        "Thuringia"
    ],
    Greece: [
        "Attica",
        "Central Greece",
        "Central Macedonia",
        "Crete",
        "East Macedonia and Thrace",
        "Epirus",
        "Ionian Islands",
        "North Aegean",
        "Peloponnese",
        "South Aegean",
        "Thessaly",
        "West Greece",
        "West Macedonia"
    ],
    India: [
        "Andaman and Nicobar Islands",
        "Andhra Pradesh",
        "Arunachal Pradesh",
        "Assam",
        "Bihar",
        "Chandigarh",
        "Chhattisgarh",
        "Dadra and Nagar Haveli and Daman and Diu",
        "Delhi",
        "Goa",
        "Gujarat",
        "Haryana",
        "Himachal Pradesh",
        "Jammu and Kashmir",
        "Jharkhand",
        "Karnataka",
        "Kerala",
        "Ladakh",
        "Lakshadweep",
        "Madhya Pradesh",
        "Maharashtra",
        "Manipur",
        "Meghalaya",
        "Mizoram",
        "Nagaland",
        "Odisha",
        "Puducherry",
        "Punjab",
        "Rajasthan",
        "Sikkim",
        "Tamil Nadu",
        "Telangana",
        "Tripura",
        "Uttar Pradesh",
        "Uttarakhand",
        "West Bengal"
    ],
    Indonesia: [
        "Aceh",
        "Bali",
        "Banten",
        "Bengkulu",
        "Central Java",
        "Central Kalimantan",
        "Central Papua",
        "Central Sulawesi",
        "East Java",
        "East Kalimantan",
        "East Nusa Tenggara",
        "Gorontalo",
        "Highland Papua",
        "Jakarta Special Capital Region",
        "Jambi",
        "Lampung",
        "Maluku",
        "North Kalimantan",
        "North Maluku",
        "North Papua",
        "North Sulawesi",
        "North Sumatra",
        "Papua",
        "Riau",
        "Riau Islands",
        "Southeast Sulawesi",
        "South Kalimantan",
        "South Papua",
        "South Sulawesi",
        "South Sumatra",
        "Southwest Papua",
        "West Java",
        "West Kalimantan",
        "West Nusa Tenggara",
        "West Papua",
        "West Sulawesi",
        "West Sumatra",
        "Yogyakarta Special Region"
    ],
    Ireland: [
        "Carlow",
        "Cavan",
        "Clare",
        "Cork",
        "Donegal",
        "Dublin",
        "Galway",
        "Kerry",
        "Kildare",
        "Kilkenny",
        "Laois",
        "Leitrim",
        "Limerick",
        "Longford",
        "Louth",
        "Mayo",
        "Meath",
        "Monaghan",
        "Offaly",
        "Roscommon",
        "Sligo",
        "Tipperary",
        "Waterford",
        "Westmeath",
        "Wexford",
        "Wicklow"
    ],
    Italy: [
        "Abruzzo",
        "Aosta Valley",
        "Apulia",
        "Basilicata",
        "Calabria",
        "Campania",
        "Emilia-Romagna",
        "Friuli Venezia Giulia",
        "Lazio",
        "Liguria",
        "Lombardy",
        "Marche",
        "Molise",
        "Piedmont",
        "Sardinia",
        "Sicily",
        "Trentino-South Tyrol",
        "Tuscany",
        "Umbria",
        "Veneto"
    ],
    Japan: [
        "Aichi",
        "Akita",
        "Aomori",
        "Chiba",
        "Ehime",
        "Fukui",
        "Fukuoka",
        "Fukushima",
        "Gifu",
        "Gunma",
        "Hiroshima",
        "Hokkaido",
        "Hyogo",
        "Ibaraki",
        "Ishikawa",
        "Iwate",
        "Kagawa",
        "Kagoshima",
        "Kanagawa",
        "Kochi",
        "Kumamoto",
        "Kyoto",
        "Mie",
        "Miyagi",
        "Miyazaki",
        "Nagano",
        "Nagasaki",
        "Nara",
        "Niigata",
        "Oita",
        "Okayama",
        "Okinawa",
        "Osaka",
        "Saga",
        "Saitama",
        "Shiga",
        "Shimane",
        "Shizuoka",
        "Tochigi",
        "Tokushima",
        "Tokyo",
        "Tottori",
        "Toyama",
        "Wakayama",
        "Yamagata",
        "Yamaguchi",
        "Yamanashi"
    ],
    Malaysia: [
        "Johor",
        "Kedah",
        "Kelantan",
        "Kuala Lumpur",
        "Labuan",
        "Malacca",
        "Negeri Sembilan",
        "Pahang",
        "Penang",
        "Perak",
        "Perlis",
        "Putrajaya",
        "Sabah",
        "Sarawak",
        "Selangor",
        "Terengganu"
    ],
    Mexico: [
        "Aguascalientes",
        "Baja California",
        "Baja California Sur",
        "Campeche",
        "Chiapas",
        "Chihuahua",
        "Coahuila",
        "Colima",
        "Durango",
        "Guanajuato",
        "Guerrero",
        "Hidalgo",
        "Jalisco",
        "Mexico City",
        "Mexico State",
        "Michoacan",
        "Morelos",
        "Nayarit",
        "Nuevo Leon",
        "Oaxaca",
        "Puebla",
        "Queretaro",
        "Quintana Roo",
        "San Luis Potosi",
        "Sinaloa",
        "Sonora",
        "Tabasco",
        "Tamaulipas",
        "Tlaxcala",
        "Veracruz",
        "Yucatan",
        "Zacatecas"
    ],
    Netherlands: [
        "Drenthe",
        "Flevoland",
        "Friesland",
        "Gelderland",
        "Groningen",
        "Limburg",
        "North Brabant",
        "North Holland",
        "Overijssel",
        "South Holland",
        "Utrecht",
        "Zeeland"
    ],
    "New Zealand": [
        "Auckland",
        "Bay of Plenty",
        "Canterbury",
        "Gisborne",
        "Hawke's Bay",
        "Manawatu-Whanganui",
        "Marlborough",
        "Nelson",
        "Northland",
        "Otago",
        "Southland",
        "Taranaki",
        "Tasman",
        "Waikato",
        "Wellington",
        "West Coast"
    ],
    Philippines: [
        "Abra",
        "Agusan del Norte",
        "Agusan del Sur",
        "Aklan",
        "Albay",
        "Antique",
        "Apayao",
        "Aurora",
        "Basilan",
        "Bataan",
        "Batanes",
        "Batangas",
        "Benguet",
        "Biliran",
        "Bohol",
        "Bukidnon",
        "Bulacan",
        "Cagayan",
        "Camarines Norte",
        "Camarines Sur",
        "Camiguin",
        "Capiz",
        "Catanduanes",
        "Cavite",
        "Cebu",
        "Cotabato",
        "Davao de Oro",
        "Davao del Norte",
        "Davao del Sur",
        "Davao Occidental",
        "Davao Oriental",
        "Dinagat Islands",
        "Eastern Samar",
        "Guimaras",
        "Ifugao",
        "Ilocos Norte",
        "Ilocos Sur",
        "Iloilo",
        "Isabela",
        "Kalinga",
        "La Union",
        "Laguna",
        "Lanao del Norte",
        "Lanao del Sur",
        "Leyte",
        "Maguindanao del Norte",
        "Maguindanao del Sur",
        "Marinduque",
        "Masbate",
        "Metro Manila",
        "Misamis Occidental",
        "Misamis Oriental",
        "Mountain Province",
        "Negros Occidental",
        "Negros Oriental",
        "Northern Samar",
        "Nueva Ecija",
        "Nueva Vizcaya",
        "Occidental Mindoro",
        "Oriental Mindoro",
        "Palawan",
        "Pampanga",
        "Pangasinan",
        "Quezon",
        "Quirino",
        "Rizal",
        "Romblon",
        "Samar",
        "Sarangani",
        "Siquijor",
        "Sorsogon",
        "South Cotabato",
        "Southern Leyte",
        "Sultan Kudarat",
        "Sulu",
        "Surigao del Norte",
        "Surigao del Sur",
        "Tarlac",
        "Tawi-Tawi",
        "Zambales",
        "Zamboanga del Norte",
        "Zamboanga del Sur",
        "Zamboanga Sibugay"
    ],
    Portugal: [
        "Aveiro",
        "Azores",
        "Beja",
        "Braga",
        "Braganca",
        "Castelo Branco",
        "Coimbra",
        "Evora",
        "Faro",
        "Guarda",
        "Leiria",
        "Lisbon",
        "Madeira",
        "Portalegre",
        "Porto",
        "Santarem",
        "Setubal",
        "Viana do Castelo",
        "Vila Real",
        "Viseu"
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
        "Chungcheongbuk-do",
        "Chungcheongnam-do",
        "Daegu",
        "Daejeon",
        "Gangwon-do",
        "Gwangju",
        "Gyeonggi-do",
        "Gyeongsangbuk-do",
        "Gyeongsangnam-do",
        "Incheon",
        "Jeju-do",
        "Jeollabuk-do",
        "Jeollanam-do",
        "Sejong",
        "Seoul",
        "Ulsan"
    ],
    Spain: [
        "Andalusia",
        "Aragon",
        "Asturias",
        "Balearic Islands",
        "Basque Country",
        "Canary Islands",
        "Cantabria",
        "Castile and Leon",
        "Castile-La Mancha",
        "Catalonia",
        "Ceuta",
        "Extremadura",
        "Galicia",
        "La Rioja",
        "Madrid",
        "Melilla",
        "Murcia",
        "Navarre",
        "Valencian Community"
    ],
    Switzerland: [
        "Aargau",
        "Appenzell Ausserrhoden",
        "Appenzell Innerrhoden",
        "Basel-Landschaft",
        "Basel-Stadt",
        "Bern",
        "Fribourg",
        "Geneva",
        "Glarus",
        "Graubunden",
        "Jura",
        "Lucerne",
        "Neuchatel",
        "Nidwalden",
        "Obwalden",
        "Schaffhausen",
        "Schwyz",
        "Solothurn",
        "St. Gallen",
        "Thurgau",
        "Ticino",
        "Uri",
        "Valais",
        "Vaud",
        "Zug",
        "Zurich"
    ],
    Thailand: [
        "Amnat Charoen",
        "Ang Thong",
        "Bangkok",
        "Bueng Kan",
        "Buri Ram",
        "Chachoengsao",
        "Chai Nat",
        "Chaiyaphum",
        "Chanthaburi",
        "Chiang Mai",
        "Chiang Rai",
        "Chon Buri",
        "Chumphon",
        "Kalasin",
        "Kamphaeng Phet",
        "Kanchanaburi",
        "Khon Kaen",
        "Krabi",
        "Lampang",
        "Lamphun",
        "Loei",
        "Lop Buri",
        "Mae Hong Son",
        "Maha Sarakham",
        "Mukdahan",
        "Nakhon Nayok",
        "Nakhon Pathom",
        "Nakhon Phanom",
        "Nakhon Ratchasima",
        "Nakhon Sawan",
        "Nakhon Si Thammarat",
        "Nan",
        "Narathiwat",
        "Nong Bua Lamphu",
        "Nong Khai",
        "Nonthaburi",
        "Pathum Thani",
        "Pattani",
        "Phang Nga",
        "Phatthalung",
        "Phayao",
        "Phetchabun",
        "Phetchaburi",
        "Phichit",
        "Phitsanulok",
        "Phra Nakhon Si Ayutthaya",
        "Phrae",
        "Phuket",
        "Prachin Buri",
        "Prachuap Khiri Khan",
        "Ranong",
        "Ratchaburi",
        "Rayong",
        "Roi Et",
        "Sa Kaeo",
        "Sakon Nakhon",
        "Samut Prakan",
        "Samut Sakhon",
        "Samut Songkhram",
        "Saraburi",
        "Satun",
        "Sing Buri",
        "Sisaket",
        "Songkhla",
        "Sukhothai",
        "Suphan Buri",
        "Surat Thani",
        "Surin",
        "Tak",
        "Trang",
        "Trat",
        "Ubon Ratchathani",
        "Udon Thani",
        "Uthai Thani",
        "Uttaradit",
        "Yala",
        "Yasothon"
    ],
    Turkey: [
        "Adana",
        "Adiyaman",
        "Afyonkarahisar",
        "Agri",
        "Aksaray",
        "Amasya",
        "Ankara",
        "Antalya",
        "Ardahan",
        "Artvin",
        "Aydin",
        "Balikesir",
        "Bartin",
        "Batman",
        "Bayburt",
        "Bilecik",
        "Bingol",
        "Bitlis",
        "Bolu",
        "Burdur",
        "Bursa",
        "Canakkale",
        "Cankiri",
        "Corum",
        "Denizli",
        "Diyarbakir",
        "Duzce",
        "Edirne",
        "Elazig",
        "Erzincan",
        "Erzurum",
        "Eskisehir",
        "Gaziantep",
        "Giresun",
        "Gumushane",
        "Hakkari",
        "Hatay",
        "Igdir",
        "Isparta",
        "Istanbul",
        "Izmir",
        "Kahramanmaras",
        "Karabuk",
        "Karaman",
        "Kars",
        "Kastamonu",
        "Kayseri",
        "Kilis",
        "Kirikkale",
        "Kirklareli",
        "Kirsehir",
        "Kocaeli",
        "Konya",
        "Kutahya",
        "Malatya",
        "Manisa",
        "Mardin",
        "Mersin",
        "Mugla",
        "Mus",
        "Nevsehir",
        "Nigde",
        "Ordu",
        "Osmaniye",
        "Rize",
        "Sakarya",
        "Samsun",
        "Sanliurfa",
        "Siirt",
        "Sinop",
        "Sivas",
        "Sirnak",
        "Tekirdag",
        "Tokat",
        "Trabzon",
        "Tunceli",
        "Usak",
        "Van",
        "Yalova",
        "Yozgat",
        "Zonguldak"
    ],
    "United Arab Emirates": [
        "Abu Dhabi",
        "Ajman",
        "Dubai",
        "Fujairah",
        "Ras Al Khaimah",
        "Sharjah",
        "Umm Al Quwain"
    ],
    "United Kingdom": [
        "England",
        "Northern Ireland",
        "Scotland",
        "Wales"
    ],
    "United States": [
        "Alabama",
        "Alaska",
        "Arizona",
        "Arkansas",
        "California",
        "Colorado",
        "Connecticut",
        "Delaware",
        "District of Columbia",
        "Florida",
        "Georgia",
        "Hawaii",
        "Idaho",
        "Illinois",
        "Indiana",
        "Iowa",
        "Kansas",
        "Kentucky",
        "Louisiana",
        "Maine",
        "Maryland",
        "Massachusetts",
        "Michigan",
        "Minnesota",
        "Mississippi",
        "Missouri",
        "Montana",
        "Nebraska",
        "Nevada",
        "New Hampshire",
        "New Jersey",
        "New Mexico",
        "New York",
        "North Carolina",
        "North Dakota",
        "Ohio",
        "Oklahoma",
        "Oregon",
        "Pennsylvania",
        "Rhode Island",
        "South Carolina",
        "South Dakota",
        "Tennessee",
        "Texas",
        "Utah",
        "Vermont",
        "Virginia",
        "Washington",
        "West Virginia",
        "Wisconsin",
        "Wyoming"
    ],
    Vietnam: [
        "An Giang",
        "Ba Ria-Vung Tau",
        "Bac Giang",
        "Bac Kan",
        "Bac Lieu",
        "Bac Ninh",
        "Ben Tre",
        "Binh Dinh",
        "Binh Duong",
        "Binh Phuoc",
        "Binh Thuan",
        "Ca Mau",
        "Can Tho",
        "Cao Bang",
        "Da Nang",
        "Dak Lak",
        "Dak Nong",
        "Dien Bien",
        "Dong Nai",
        "Dong Thap",
        "Gia Lai",
        "Ha Giang",
        "Ha Nam",
        "Ha Noi",
        "Ha Tinh",
        "Hai Duong",
        "Hai Phong",
        "Hau Giang",
        "Ho Chi Minh City",
        "Hoa Binh",
        "Hung Yen",
        "Khanh Hoa",
        "Kien Giang",
        "Kon Tum",
        "Lai Chau",
        "Lam Dong",
        "Lang Son",
        "Lao Cai",
        "Long An",
        "Nam Dinh",
        "Nghe An",
        "Ninh Binh",
        "Ninh Thuan",
        "Phu Tho",
        "Phu Yen",
        "Quang Binh",
        "Quang Nam",
        "Quang Ngai",
        "Quang Ninh",
        "Quang Tri",
        "Soc Trang",
        "Son La",
        "Tay Ninh",
        "Thai Binh",
        "Thai Nguyen",
        "Thanh Hoa",
        "Thua Thien-Hue",
        "Tien Giang",
        "Tra Vinh",
        "Tuyen Quang",
        "Vinh Long",
        "Vinh Phuc",
        "Yen Bai"
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
    initializeCountrySelect();
    initializeStateSelects();
    initializeFixedDropdowns();
    initializeCustomDropdowns(document);
});

document.addEventListener("change", function (event) {
    const countrySelect = event.target.closest("#trip-country");

    if (!countrySelect) {
        return;
    }

    document.querySelectorAll(".day-container").forEach(function (dayContainer) {
        const stateSelect = dayContainer.querySelector('select[name^="state_day"]');
        const cityInput = dayContainer.querySelector('input[name^="city_day"]');

        if (!stateSelect) {
            return;
        }

        populateStateOptions(stateSelect, countrySelect.value);
        updateCityInputState(cityInput, countrySelect.value);
    });
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

function initializeCountrySelect() {
    const select = document.getElementById("trip-country");
    if (!select) {
        return;
    }

    const selectedValue = select.value;

    setSelectOptions(select, Object.keys(countryStateMap), "Select Country");

    if (selectedValue && countryStateMap[selectedValue]) {
        select.value = selectedValue;
    }
}

function initializeStateSelects() {
    const countrySelect = document.getElementById("trip-country");
    const selectedCountry = countrySelect ? countrySelect.value : "";

    document.querySelectorAll(".day-container").forEach(function (dayContainer) {
        const stateSelect = dayContainer.querySelector('select[name^="state_day"]');
        const cityInput = dayContainer.querySelector('input[name^="city_day"]');

        if (!stateSelect) {
            return;
        }

        populateStateOptions(stateSelect, selectedCountry);
        updateCityInputState(cityInput, selectedCountry);
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
    document.querySelectorAll('select[name="trip_type"], select[name^="restaurant_dropdown_day"], select[name^="accommodation_dropdown_day"]').forEach(function (select) {
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
    dropdown.dataset.selectedValue = select.value || "";
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
                dropdown.dataset.selectedValue = option.value;
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
    dropdown.dataset.selectedValue = select.value || "";
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

    return select.name === "trip_type" ||
        select.name.startsWith("restaurant_dropdown_day") ||
        select.name.startsWith("accommodation_dropdown_day");
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
