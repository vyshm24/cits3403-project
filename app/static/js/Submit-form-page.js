/**
 * Main initialization logic
 *
 * Purpose:
 * - Wait until the DOM is fully loaded before accessing page elements
 * - Cache frequently used DOM nodes
 * - Ensure all day containers are wrapped inside #days-wrapper
 * - Initialize activity summary display and total day count
 * - Bind the click event for adding a new day
 */
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

            if (window.rebuildCustomDropdowns) {
                window.rebuildCustomDropdowns(newDay);
            }

            syncTotalDays();
            initializeActivitySummaries();
        });
    }

    function copyPreviousLocation(previousDay, newDay) {
        const prevState = previousDay.querySelector('[name="state_day' + previousDay.dataset.day + '"]');
        const prevCity = previousDay.querySelector('[name="city_day' + previousDay.dataset.day + '"]');
        const newState = newDay.querySelector('[name="state_day' + newDay.dataset.day + '"]');
        const newCity = newDay.querySelector('[name="city_day' + newDay.dataset.day + '"]');

        if (prevState && newState) {
            newState.value = prevState.value;
        }

        if (prevCity && newCity) {
            newCity.value = prevCity.value;
        }
    }

    /**
     * Global click event delegation
     *
     * Purpose:
     * - Handle adding a new activity within a day
     * - Handle collapsing or expanding an activity section
     * - Handle deleting an activity
     * - Handle deleting a day
     *
     * Why event delegation is used:
     * - Newly cloned buttons and elements do not need separate event bindings
     * - One listener can manage all matching clickable elements efficiently
     */

    document.addEventListener("click", function (e) {
        const addActivityBtn = e.target.closest(".add-activity-btn");
        if (addActivityBtn) {
            const dayContainer = addActivityBtn.closest(".day-container");
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

        const activitySummary = e.target.closest(".activity-summary");
        if (activitySummary) {
            const activityItem = activitySummary.closest(".activity-item");
            if (activityItem) {
                activityItem.classList.toggle("collapsed");
            }
        }

        const deleteActivityBtn = e.target.closest(".delete-activity-btn");
        if (deleteActivityBtn) {
            const activityItem = deleteActivityBtn.closest(".activity-item");
            const activitiesList = activityItem.closest(".activities-list");
            const activityItems = activitiesList.querySelectorAll(".activity-item");

            if (activityItems.length === 1) {
                alert("At least one activity is required.");
                return;
            }

            activityItem.remove();
            renumberActivities(activitiesList);
        }

        const deleteDayBtn = e.target.closest(".delete-day-btn");
        if (deleteDayBtn) {
            const dayContainer = deleteDayBtn.closest(".day-container");
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

    /**
     * Global change event delegation
     *
     * Purpose:
     * - Detect changes to the "Other transport" checkbox
     * - Enable the related text input when checked
     * - Disable and clear the text input when unchecked
     *
     * Why event delegation is used:
     * - It supports both existing and dynamically added day/activity sections
     * - No need to rebind change listeners after cloning elements
     */

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


    /**
     * Update all day-related attributes inside a day container
     *
     * Purpose:
     * - Set the correct data-day and id for the day container
     * - Update the visible day title such as "Day 1", "Day 2"
     * - Replace all id, name, and label[for] values inside the day
     * - Refresh the numbering of all activity items inside that day
     *
     * @param {HTMLElement} dayElement The day container to update
     * @param {number} dayNumber The new day number
     */
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

    /**
     * Update all numbering-related attributes inside a single activity block
     *
     * Purpose:
     * - Rewrite id, name, and label[for] values based on the current day number
     *   and activity number
     * - Keep all form fields correctly mapped after cloning or reordering
     * - Update the activity summary label shown in the UI
     *
     * @param {HTMLElement} activityElement The activity element to update
     * @param {number} dayNumber The day number this activity belongs to
     * @param {number} activityNumber The new activity number
     */
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

    /**
     * Reset all input values inside a day container
     *
     * Purpose:
     * - Clear text inputs, textareas, selects, checkboxes, and radio buttons
     * - Disable the "Other transport" text field
     * - Remove extra activity items and keep only the first one
     * - Reinitialize the remaining first activity as a clean starting block
     *
     * @param {HTMLElement} dayElement The day container to reset
     */
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

        if (window.resetSubmitFormUploadState) {
            window.resetSubmitFormUploadState(dayElement);
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


    /**
     * Reset all user-entered values inside a single activity block
     *
     * Purpose:
     * - Clear text input and textarea content
     * - Uncheck checkbox and radio fields
     * - Prepare a cloned activity block for fresh user input
     *
     * @param {HTMLElement} activityElement The activity block to reset
     */
    function resetActivityValues(activityElement) {
        activityElement.querySelectorAll("input, textarea").forEach(function (field) {
            if (field.type === "checkbox" || field.type === "radio") {
                field.checked = false;
            } else {
                field.value = "";
            }
        });

        if (window.resetSubmitFormUploadState) {
            window.resetSubmitFormUploadState(activityElement);
        }
    }


    /**
     * Renumber all activity items inside a specific activities list
     *
     * Purpose:
     * - Recalculate activity numbers after an activity is deleted
     * - Update summary labels such as "Activity 1", "Activity 2"
     * - Rewrite id, name, and label[for] values to stay consistent
     * - Keep the last activity expanded while collapsing others if needed
     *
     * @param {HTMLElement} activitiesList The activities list container
     */
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


    /**
     * Renumber all day containers after one day is deleted
     *
     * Purpose:
     * - Recalculate day numbers in order
     * - Update each day container's dataset, id, and title
     * - Rewrite all day-related id, name, and label[for] values
     * - Trigger activity renumbering inside each day as well
     */
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

    /**
     * Replace the day number pattern inside a string
     *
     * Purpose:
     * - Find all occurrences of patterns like "day1", "day2", etc.
     * - Replace them with the new day number
     * - Used by multiple helper functions to keep naming consistent
     *
     * @param {string} str The original string
     * @param {number} newDayNumber The new day number to inject
     * @returns {string} The updated string
     */
    function replaceDayNumber(str, newDayNumber) {
        return str.replace(/day\d+/g, "day" + newDayNumber);
    }

    /**
     * Synchronize the hidden or visible total day input with the current day count
     *
     * Purpose:
     * - Count the number of .day-container elements inside #days-wrapper
     * - Write that number into the total-days input field
     * - Keep the form value accurate after adding or deleting days
     */
    function syncTotalDays() {
        const totalDays = daysWrapper.querySelectorAll(".day-container").length;
        if (totalDaysInput) {
            totalDaysInput.value = totalDays;
        }
    }

    /**
     * Initialize activity summary labels and collapsed states
     *
     * Purpose:
     * - Set each activity summary text based on its position
     * - Collapse all activities except the last one in each list
     * - Make the UI cleaner and easier to scan when multiple activities exist
     */
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
