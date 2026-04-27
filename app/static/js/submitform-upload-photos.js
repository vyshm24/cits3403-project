document.addEventListener("DOMContentLoaded", function () {
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    const VALID_TYPES = ["image/png", "image/jpeg", "image/gif"];

    initializeCoverPhotoUpload();
    initializeActivityPhotoUploads(document);
    window.resetSubmitFormUploadState = resetSubmitFormUploadState;

    document.addEventListener("change", function (event) {
        if (event.target.id === "cover-photo") {
            handleCoverPhotoChange(event.target);
            return;
        }

        if (event.target.matches('input[name^="activity_photo_day"]')) {
            handleActivityPhotoChange(event.target);
        }
    });

    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            mutation.addedNodes.forEach(function (node) {
                if (!(node instanceof HTMLElement)) {
                    return;
                }

                if (node.matches(".activity-item")) {
                    initializeActivityPhotoUploads(node);
                    return;
                }

                initializeActivityPhotoUploads(node);
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    function initializeCoverPhotoUpload() {
        const input = document.getElementById("cover-photo");
        if (!input) {
            return;
        }

        const uploadPanel = input.closest(".cover-photo-panel");
        if (!uploadPanel || uploadPanel.querySelector(".upload-feedback")) {
            return;
        }

        const preview = document.createElement("img");
        preview.className = "upload-preview hidden";
        preview.alt = "Cover photo preview";

        const feedback = document.createElement("p");
        feedback.className = "upload-feedback text-sm text-gray-600";
        feedback.textContent = "No file selected";

        uploadPanel.appendChild(preview);
        uploadPanel.appendChild(feedback);
    }

    function initializeActivityPhotoUploads(root) {
        root.querySelectorAll('input[name^="activity_photo_day"]').forEach(function (input) {
            const wrapper = input.parentElement;
            if (!wrapper || wrapper.querySelector(".upload-feedback")) {
                return;
            }

            const feedback = document.createElement("p");
            feedback.className = "upload-feedback mt-2 text-sm text-gray-600";
            feedback.textContent = "No file selected";
            wrapper.appendChild(feedback);
        });
    }

    function handleCoverPhotoChange(input) {
        const uploadPanel = input.closest(".cover-photo-panel");
        const dropzone = input.closest(".cover-photo-dropzone");
        if (!uploadPanel || !dropzone) {
            return;
        }

        const preview = uploadPanel.querySelector(".upload-preview");
        const feedback = uploadPanel.querySelector(".upload-feedback");
        const file = input.files && input.files[0] ? input.files[0] : null;

        if (!file) {
            clearPreview(preview, feedback);
            dropzone.classList.remove("has-preview");
            updateCoverPhotoTrigger(false);
            return;
        }

        const validationMessage = validateImageFile(file);
        if (validationMessage) {
            input.value = "";
            clearPreview(preview, feedback);
            dropzone.classList.remove("has-preview");
            updateCoverPhotoTrigger(false);
            setFeedback(feedback, validationMessage, true);
            return;
        }

        setFeedback(feedback, file.name, false);
        dropzone.classList.add("has-preview");
        updateCoverPhotoTrigger(true);

        if (!preview) {
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        preview.src = objectUrl;
        preview.classList.remove("hidden");
        preview.onload = function () {
            URL.revokeObjectURL(objectUrl);
        };
    }

    function handleActivityPhotoChange(input) {
        const wrapper = input.parentElement;
        const feedback = wrapper ? wrapper.querySelector(".upload-feedback") : null;
        const file = input.files && input.files[0] ? input.files[0] : null;

        if (!feedback) {
            return;
        }

        if (!file) {
            setFeedback(feedback, "No file selected", false);
            return;
        }

        const validationMessage = validateImageFile(file);
        if (validationMessage) {
            input.value = "";
            setFeedback(feedback, validationMessage, true);
            return;
        }

        setFeedback(feedback, file.name, false);
    }

    function validateImageFile(file) {
        if (!VALID_TYPES.includes(file.type)) {
            return "Only PNG, JPG, and GIF files are allowed.";
        }

        if (file.size > MAX_FILE_SIZE) {
            return "File must be smaller than 10MB.";
        }

        return "";
    }

    function clearPreview(preview, feedback) {
        if (preview) {
            preview.src = "";
            preview.classList.add("hidden");
        }

        setFeedback(feedback, "No file selected", false);
    }

    function setFeedback(element, message, isError) {
        if (!element) {
            return;
        }

        element.textContent = message;
        element.classList.toggle("text-red-600", isError);
        element.classList.toggle("text-gray-600", !isError);
    }

    function updateCoverPhotoTrigger(hasPreview) {
        const triggerText = document.querySelector(".cover-photo-trigger span");
        if (!triggerText) {
            return;
        }

        triggerText.textContent = hasPreview ? "Change photo" : "Upload cover photo";
    }

    function resetSubmitFormUploadState(root) {
        if (!root || !(root instanceof HTMLElement || root instanceof Document)) {
            return;
        }

        resetCoverPhotoState(root);
        resetActivityPhotoState(root);
    }

    function resetCoverPhotoState(root) {
        const coverInput = root.querySelector ? root.querySelector("#cover-photo") : null;
        if (!coverInput) {
            return;
        }

        coverInput.value = "";

        const uploadPanel = coverInput.closest(".cover-photo-panel");
        const dropzone = coverInput.closest(".cover-photo-dropzone");
        const preview = uploadPanel ? uploadPanel.querySelector(".upload-preview") : null;
        const feedback = uploadPanel ? uploadPanel.querySelector(".upload-feedback") : null;

        clearPreview(preview, feedback);

        if (dropzone) {
            dropzone.classList.remove("has-preview");
        }

        updateCoverPhotoTrigger(false);
    }

    function resetActivityPhotoState(root) {
        root.querySelectorAll('input[name^="activity_photo_day"]').forEach(function (input) {
            input.value = "";

            const wrapper = input.parentElement;
            const feedback = wrapper ? wrapper.querySelector(".upload-feedback") : null;
            setFeedback(feedback, "No file selected", false);
        });
    }
});
