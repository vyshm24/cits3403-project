document.addEventListener("DOMContentLoaded", function () {
    const addDayBtn = document.querySelector(".add-day-btn");
    const totalDaysInput = document.getElementById("total-days");
    const dailyPlanSection = document.querySelector(".daily-plan-section");

    let daysWrapper = document.getElementById("days-wrapper");
    if (!daysWrapper) {
        daysWrapper = document.createElement("div");
        daysWrapper.id = "days-wrapper";

        const dayContainers = dailyPlanSection.querySelectorAll(".day-container");
        dayContainers.forEach(function (day) {
            daysWrapper.appendChild(day);
        });

        dailyPlanSection.insertBefore(daysWrapper, addDayBtn);
    }

    initializeActivitySummaries();
    syncTotalDays();

    if (addDayBtn) {
        addDayBtn.addEventListener("click", function () {
            const dayContainers = daysWrapper.querySelectorAll(".day-container");
            const lastDay = dayContainers[dayContainers.length - 1];
            const newDayNumber = dayContainers.length + 1;

            const newDay = lastDay.cloneNode(true);

            updateDayAttributes(newDay, newDayNumber);
            resetDayValues(newDay);
            copyPreviousLocation(lastDay, newDay);
            daysWrapper.appendChild(newDay);

            syncTotalDays();
            initializeActivitySummaries();
        });
    }
        function copyPreviousLocation(previousDay, newDay) {
        const prevCountry = previousDay.querySelector('[name^="country_day"]');
        const prevState = previousDay.querySelector('[name^="state_day"]');

        const newCountry = newDay.querySelector('[name^="country_day"]');
        const newState = newDay.querySelector('[name^="state_day"]');

        if (prevCountry && newCountry) {
            newCountry.value = prevCountry.value;
        }

        if (prevState && newState) {
            newState.value = prevState.value;
        }
    }

    document.addEventListener("click", function (e) {
        if (e.target.classList.contains("add-activity-btn")) {
            const dayContainer = e.target.closest(".day-container");
            const dayNumber = parseInt(dayContainer.dataset.day, 10);

            const activitiesList = dayContainer.querySelector(".activities-list");
            const activityItems = activitiesList.querySelectorAll(".activity-item");
            const lastActivity = activityItems[activityItems.length - 1];
            const newActivityNumber = activityItems.length + 1;

            activityItems.forEach(function (item, index) {
                item.classList.add("collapsed");

                const summary = item.querySelector(".activity-summary");
                if (summary) {
                    summary.textContent = "Activity " + (index + 1);
                }
            });

            const newActivity = lastActivity.cloneNode(true);

            updateActivityAttributes(newActivity, dayNumber, newActivityNumber);
            resetActivityValues(newActivity);

            newActivity.classList.remove("collapsed");

            const summary = newActivity.querySelector(".activity-summary");
            if (summary) {
                summary.textContent = "Activity " + newActivityNumber;
            }

            activitiesList.appendChild(newActivity);

            const firstInput = newActivity.querySelector("input, textarea, select");
            if (firstInput) {
                firstInput.focus();
            }
        }

        if (e.target.classList.contains("activity-summary")) {
            const activityItem = e.target.closest(".activity-item");
            if (activityItem) {
                activityItem.classList.toggle("collapsed");
            }
        }

        if (e.target.classList.contains("delete-activity-btn")) {
            const activityItem = e.target.closest(".activity-item");
            const activitiesList = activityItem.closest(".activities-list");
            const activityItems = activitiesList.querySelectorAll(".activity-item");

            if (activityItems.length === 1) {
                alert("At least one activity is required.");
                return;
            }

            activityItem.remove();
            renumberActivities(activitiesList);
        }

        if (e.target.classList.contains("delete-day-btn")) {
            const dayContainer = e.target.closest(".day-container");
            const dayContainers = daysWrapper.querySelectorAll(".day-container");

            if (dayContainers.length === 1) {
                alert("At least one day is required.");
                return;
            }

            dayContainer.remove();
            renumberDays();
            syncTotalDays();
        }
    });

    document.addEventListener("change", function (e) {
        if (e.target.classList.contains("transport-other-checkbox")) {
            const checkbox = e.target;
            const checkboxGroup = checkbox.closest(".checkbox-group");
            const textInput = checkboxGroup.querySelector(".transport-other-text");

            if (!textInput) return;

            if (checkbox.checked) {
                textInput.disabled = false;
                textInput.focus();
            } else {
                textInput.disabled = true;
                textInput.value = "";
            }
        }
    });

    function updateDayAttributes(dayElement, dayNumber) {
        dayElement.dataset.day = dayNumber;
        dayElement.id = "day-" + dayNumber;

        const title = dayElement.querySelector(".day-title");
        if (title) {
            title.textContent = "Day " + dayNumber;
        }

        dayElement.querySelectorAll("[id]").forEach(function (el) {
            el.id = replaceDayNumber(el.id, dayNumber);
        });

        dayElement.querySelectorAll("[name]").forEach(function (el) {
            el.name = replaceDayNumber(el.name, dayNumber);
        });

        dayElement.querySelectorAll("label[for]").forEach(function (label) {
            label.htmlFor = replaceDayNumber(label.htmlFor, dayNumber);
        });

        const activityItems = dayElement.querySelectorAll(".activity-item");
        activityItems.forEach(function (item, index) {
            updateActivityAttributes(item, dayNumber, index + 1);

            const summary = item.querySelector(".activity-summary");
            if (summary) {
                summary.textContent = "Activity " + (index + 1);
            }
        });
    }

    function updateActivityAttributes(activityElement, dayNumber, activityNumber) {
        activityElement.querySelectorAll("[id]").forEach(function (el) {
            el.id = el.id
                .replace(/day\d+/g, "day" + dayNumber)
                .replace(/-\d+$/, "-" + activityNumber);
        });

        activityElement.querySelectorAll("[name]").forEach(function (el) {
            el.name = el.name
                .replace(/day\d+/g, "day" + dayNumber)
                .replace(/_\d+$/, "_" + activityNumber);
        });

        activityElement.querySelectorAll("label[for]").forEach(function (label) {
            label.htmlFor = label.htmlFor
                .replace(/day\d+/g, "day" + dayNumber)
                .replace(/-\d+$/, "-" + activityNumber);
        });

        const summary = activityElement.querySelector(".activity-summary");
        if (summary) {
            summary.textContent = "Activity " + activityNumber;
        }
    }

    function resetDayValues(dayElement) {
        const inputs = dayElement.querySelectorAll("input, textarea, select");

        inputs.forEach(function (input) {
            if (input.type === "checkbox" || input.type === "radio") {
                input.checked = false;
            } else if (input.tagName === "SELECT") {
                input.selectedIndex = 0;
            } else {
                input.value = "";
            }
        });

        const otherText = dayElement.querySelector(".transport-other-text");
        if (otherText) {
            otherText.disabled = true;
        }

        const activitiesList = dayElement.querySelector(".activities-list");
        const activityItems = activitiesList.querySelectorAll(".activity-item");

        activityItems.forEach(function (item, index) {
            if (index > 0) {
                item.remove();
            }
        });

        const firstActivity = activitiesList.querySelector(".activity-item");
        if (firstActivity) {
            updateActivityAttributes(firstActivity, parseInt(dayElement.dataset.day, 10), 1);
            resetActivityValues(firstActivity);
            firstActivity.classList.remove("collapsed");

            const summary = firstActivity.querySelector(".activity-summary");
            if (summary) {
                summary.textContent = "Activity 1";
            }
        }
    }

    function resetActivityValues(activityElement) {
        activityElement.querySelectorAll("input, textarea").forEach(function (field) {
            if (field.type === "checkbox" || field.type === "radio") {
                field.checked = false;
            } else {
                field.value = "";
            }
        });
    }

    function renumberActivities(activitiesList) {
        const dayContainer = activitiesList.closest(".day-container");
        const dayNumber = parseInt(dayContainer.dataset.day, 10);
        const items = activitiesList.querySelectorAll(".activity-item");

        items.forEach(function (item, index) {
            const activityNumber = index + 1;

            const summary = item.querySelector(".activity-summary");
            if (summary) {
                summary.textContent = "Activity " + activityNumber;
            }

            item.querySelectorAll("[id]").forEach(function (el) {
                el.id = el.id
                    .replace(/day\d+/g, "day" + dayNumber)
                    .replace(/-\d+$/, "-" + activityNumber);
            });

            item.querySelectorAll("[name]").forEach(function (el) {
                el.name = el.name
                    .replace(/day\d+/g, "day" + dayNumber)
                    .replace(/_\d+$/, "_" + activityNumber);
            });

            item.querySelectorAll("label[for]").forEach(function (label) {
                label.htmlFor = label.htmlFor
                    .replace(/day\d+/g, "day" + dayNumber)
                    .replace(/-\d+$/, "-" + activityNumber);
            });

            if (index === items.length - 1) {
                item.classList.remove("collapsed");
            }
        });
    }

    function renumberDays() {
        const dayContainers = daysWrapper.querySelectorAll(".day-container");

        dayContainers.forEach(function (dayElement, index) {
            const dayNumber = index + 1;

            dayElement.dataset.day = dayNumber;
            dayElement.id = "day-" + dayNumber;

            const title = dayElement.querySelector(".day-title");
            if (title) {
                title.textContent = "Day " + dayNumber;
            }

            dayElement.querySelectorAll("[id]").forEach(function (el) {
                el.id = replaceDayNumber(el.id, dayNumber);
            });

            dayElement.querySelectorAll("[name]").forEach(function (el) {
                el.name = replaceDayNumber(el.name, dayNumber);
            });

            dayElement.querySelectorAll("label[for]").forEach(function (label) {
                label.htmlFor = replaceDayNumber(label.htmlFor, dayNumber);
            });

            const activitiesList = dayElement.querySelector(".activities-list");
            if (activitiesList) {
                renumberActivities(activitiesList);
            }
        });
    }

    function replaceDayNumber(str, newDayNumber) {
        return str.replace(/day\d+/g, "day" + newDayNumber);
    }

    function syncTotalDays() {
        const totalDays = daysWrapper.querySelectorAll(".day-container").length;
        if (totalDaysInput) {
            totalDaysInput.value = totalDays;
        }
    }

    function initializeActivitySummaries() {
        document.querySelectorAll(".activities-list").forEach(function (list) {
            const items = list.querySelectorAll(".activity-item");

            items.forEach(function (item, index) {
                const summary = item.querySelector(".activity-summary");
                if (summary) {
                    summary.textContent = "Activity " + (index + 1);
                }

                if (index === items.length - 1) {
                    item.classList.remove("collapsed");
                } else {
                    item.classList.add("collapsed");
                }
            });
        });
    }
});