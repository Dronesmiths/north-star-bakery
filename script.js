// script.js - North Star Bakery

// menu items for the products page
const bakeryMenu = [
  { id: "sourdough-loaf", name: "Signature Sourdough Loaf", category: "breads", priceLabel: "$8.00", minPrice: 8.00 },
  { id: "wheat-loaf", name: "Whole Wheat Sandwich Loaf", category: "breads", priceLabel: "$6.50 - $8.00", minPrice: 6.50 },
  { id: "rosemary-focaccia", name: "Rosemary Focaccia", category: "breads", priceLabel: "$6.00 - $10.00", minPrice: 6.00 },
  { id: "butter-croissant", name: "Butter and Chocolate Croissants", category: "pastries", priceLabel: "$3.75 - $4.75", minPrice: 3.75 },
  { id: "cinnamon-roll", name: "Cinnamon Rolls and Berry Muffins", category: "pastries", priceLabel: "$3.50 - $4.50", minPrice: 3.50 },
  { id: "dozen-pastry-box", name: "Dozen Pastry Box", category: "pastries", priceLabel: "$38.00 - $44.00", minPrice: 38.00 },
  { id: "cake-6-inch", name: "6-Inch Custom Cake (Serves 8-10)", category: "cakes", priceLabel: "$35.00 - $45.00", minPrice: 35.00 },
  { id: "cake-9-inch", name: "9-Inch Custom Cake (Serves 16-20)", category: "cakes", priceLabel: "$55.00 - $70.00", minPrice: 55.00 }
];

// notes shown when filtering by category on products.html
const categoryInfo = {
  all: "Showing all 8 daily bakery items. Fresh bread and pastries are baked every morning starting at 6:30 AM.",
  breads: "Showing 3 Fresh Daily Breads. Loaves are mixed by hand and ready for pickup starting at 6:30 AM Tuesday through Sunday.",
  pastries: "Showing 3 Morning Pastries. Dozen Pastry Boxes can be reserved a day ahead for office meetings or family breakfasts.",
  cakes: "Showing 2 Custom Cake sizes. Please submit custom cake pre-orders at least 48 hours before your pickup date."
};

// settings for checking the contact and pre-order form
const validationRules = {
  minNameLength: 2,
  minDetailsLength: 10,
  closedDayOfWeek: 1
};

// list of item IDs saved by the user
let savedOrderItems = [];

const STORAGE_ITEMS_KEY = "northStarSavedItems";
const STORAGE_CATEGORY_KEY = "northStarCategory";
const STORAGE_CONTACT_KEY = "northStarCustomerDraft";

function loadSavedBakeryState() {
  const rawItems = localStorage.getItem(STORAGE_ITEMS_KEY);
  if (rawItems) {
    try {
      const parsed = JSON.parse(rawItems);
      if (Array.isArray(parsed)) {
        savedOrderItems = parsed;
      }
    } catch (err) {
      savedOrderItems = [];
    }
  }
}

function saveItemsToStorage() {
  localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(savedOrderItems));
}

function findMenuItemById(itemId) {
  for (let i = 0; i < bakeryMenu.length; i++) {
    if (bakeryMenu[i].id === itemId) {
      return bakeryMenu[i];
    }
  }
  return null;
}

function filterMenuByCategory(selectedCategory) {
  const cards = document.querySelectorAll(".product-category-card");
  const buttons = document.querySelectorAll(".filter-btn");
  const statusNote = document.getElementById("category-status-note");

  if (!cards.length) {
    return;
  }

  for (let i = 0; i < cards.length; i++) {
    const cardCategory = cards[i].getAttribute("data-category");
    if (selectedCategory === "all" || cardCategory === selectedCategory) {
      cards[i].style.display = "flex";
    } else {
      cards[i].style.display = "none";
    }
  }

  for (let j = 0; j < buttons.length; j++) {
    if (buttons[j].getAttribute("data-category") === selectedCategory) {
      buttons[j].classList.add("active-filter");
    } else {
      buttons[j].classList.remove("active-filter");
    }
  }

  if (statusNote && categoryInfo[selectedCategory]) {
    statusNote.textContent = categoryInfo[selectedCategory];
  }

  localStorage.setItem(STORAGE_CATEGORY_KEY, selectedCategory);
}

function toggleSavedItem(itemId) {
  const existingIndex = savedOrderItems.indexOf(itemId);
  if (existingIndex === -1) {
    savedOrderItems.push(itemId);
  } else {
    savedOrderItems.splice(existingIndex, 1);
  }
  saveItemsToStorage();
  renderSavedOrderBox(false);
}

function renderSavedOrderBox(loadedFromRefresh) {
  const countSpan = document.getElementById("saved-count");
  const listEl = document.getElementById("saved-items-list");
  const storageNote = document.getElementById("storage-status-note");
  const estimateEl = document.getElementById("saved-estimate");
  const itemButtons = document.querySelectorAll(".save-item-btn");

  for (let i = 0; i < itemButtons.length; i++) {
    const btn = itemButtons[i];
    const id = btn.getAttribute("data-item-id");
    if (savedOrderItems.indexOf(id) !== -1) {
      btn.textContent = "Saved to Pre-Order List";
      btn.classList.add("saved-active");
    } else {
      btn.textContent = "Add to Pre-Order List";
      btn.classList.remove("saved-active");
    }
  }

  if (!listEl || !countSpan) {
    return;
  }

  countSpan.textContent = String(savedOrderItems.length);
  listEl.innerHTML = "";

  if (savedOrderItems.length === 0) {
    storageNote.textContent = "No items saved yet. Click \"Add to Pre-Order List\" on any bakery item below to remember your selections.";
    estimateEl.textContent = "";
    return;
  }

  let minimumTotal = 0;
  for (let k = 0; k < savedOrderItems.length; k++) {
    const itemObj = findMenuItemById(savedOrderItems[k]);
    if (itemObj) {
      minimumTotal += itemObj.minPrice;
      const li = document.createElement("li");
      li.textContent = itemObj.name + " (" + itemObj.priceLabel + ")";
      listEl.appendChild(li);
    }
  }

  if (loadedFromRefresh) {
    storageNote.textContent = "Restored " + savedOrderItems.length + " saved item(s) from browser localStorage:";
  } else {
    storageNote.textContent = "Saved in browser localStorage for your pre-order request:";
  }

  estimateEl.textContent = "Estimated starting total: $" + minimumTotal.toFixed(2) + " - Open the Contact and Pre-Orders page to submit your pickup request.";
}

function populateContactPageFromStorage() {
  const detailsField = document.getElementById("item-details");
  const contactSavedNote = document.getElementById("contact-saved-note");
  const nameField = document.getElementById("name");
  const emailField = document.getElementById("email");

  if (!detailsField) {
    return;
  }

  if (savedOrderItems.length > 0 && !detailsField.value.trim()) {
    const names = [];
    for (let i = 0; i < savedOrderItems.length; i++) {
      const itemObj = findMenuItemById(savedOrderItems[i]);
      if (itemObj) {
        names.push("1x " + itemObj.name + " (" + itemObj.priceLabel + ")");
      }
    }
    detailsField.value = "Saved from Products page: " + names.join(", ");
    if (contactSavedNote) {
      contactSavedNote.textContent = "Loaded " + savedOrderItems.length + " saved bakery item(s) from localStorage into your pre-order form.";
    }
  }

  const savedDraft = localStorage.getItem(STORAGE_CONTACT_KEY);
  if (savedDraft) {
    try {
      const draftObj = JSON.parse(savedDraft);
      if (draftObj.name && nameField && !nameField.value) {
        nameField.value = draftObj.name;
      }
      if (draftObj.email && emailField && !emailField.value) {
        emailField.value = draftObj.email;
      }
    } catch (err) {
      // ignore invalid JSON
    }
  }
}

function showFieldError(inputEl, errorEl, message) {
  if (inputEl) {
    inputEl.classList.add("input-invalid");
  }
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add("visible-error");
  }
}

function clearAllErrors() {
  const errorSpans = document.querySelectorAll(".field-error");
  const invalidInputs = document.querySelectorAll(".input-invalid");
  const statusBox = document.getElementById("form-status-message");

  for (let i = 0; i < errorSpans.length; i++) {
    errorSpans[i].textContent = "";
    errorSpans[i].classList.remove("visible-error");
  }

  for (let j = 0; j < invalidInputs.length; j++) {
    invalidInputs[j].classList.remove("input-invalid");
  }

  if (statusBox) {
    statusBox.textContent = "";
    statusBox.classList.remove("visible-feedback");
  }
}

function validatePreOrderForm(event) {
  event.preventDefault();
  clearAllErrors();

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const typeSelect = document.getElementById("request-type");
  const dateInput = document.getElementById("pickup-date");
  const detailsInput = document.getElementById("item-details");
  const statusBox = document.getElementById("form-status-message");

  let isValid = true;

  const nameVal = nameInput.value.trim();
  if (nameVal.length < validationRules.minNameLength) {
    showFieldError(
      nameInput,
      document.getElementById("name-error"),
      "Please enter your full name (at least 2 characters)."
    );
    isValid = false;
  }

  const emailVal = emailInput.value.trim();
  if (!emailVal || emailVal.indexOf("@") < 1 || emailVal.lastIndexOf(".") < emailVal.indexOf("@") + 2) {
    showFieldError(
      emailInput,
      document.getElementById("email-error"),
      "Please enter a valid email address (for example, sarah@example.com)."
    );
    isValid = false;
  }

  if (!typeSelect.value) {
    showFieldError(
      typeSelect,
      document.getElementById("request-type-error"),
      "Please select whether this is a bread/pastry pre-order, custom cake order, or question."
    );
    isValid = false;
  }

  if (!dateInput.value) {
    showFieldError(
      dateInput,
      document.getElementById("pickup-date-error"),
      "Please choose a pickup date for your bakery order."
    );
    isValid = false;
  } else {
    const parts = dateInput.value.split("-");
    const pickedDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (pickedDate.getDay() === validationRules.closedDayOfWeek) {
      showFieldError(
        dateInput,
        document.getElementById("pickup-date-error"),
        "North Star Bakery is closed on Mondays. Please select a pickup date from Tuesday through Sunday."
      );
      isValid = false;
    }
  }

  const detailsVal = detailsInput.value.trim();
  if (detailsVal.length < validationRules.minDetailsLength) {
    showFieldError(
      detailsInput,
      document.getElementById("item-details-error"),
      "Please enter at least 10 characters with the bakery items and quantities you need."
    );
    isValid = false;
  }

  if (!isValid) {
    return;
  }

  const draftData = {
    name: nameVal,
    email: emailVal,
    lastRequestType: typeSelect.value,
    lastPickupDate: dateInput.value
  };
  localStorage.setItem(STORAGE_CONTACT_KEY, JSON.stringify(draftData));

  if (statusBox) {
    statusBox.textContent = "Thank you, " + nameVal + "! Your pre-order request for " + dateInput.value + " passed validation and your contact info has been saved in browser storage.";
    statusBox.classList.add("visible-feedback");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  loadSavedBakeryState();

  const filterButtons = document.querySelectorAll(".filter-btn");
  for (let i = 0; i < filterButtons.length; i++) {
    filterButtons[i].addEventListener("click", function () {
      const category = this.getAttribute("data-category");
      filterMenuByCategory(category);
    });
  }

  const saveButtons = document.querySelectorAll(".save-item-btn");
  for (let j = 0; j < saveButtons.length; j++) {
    saveButtons[j].addEventListener("click", function () {
      const itemId = this.getAttribute("data-item-id");
      toggleSavedItem(itemId);
    });
  }

  const clearBtn = document.getElementById("clear-saved-btn");
  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      savedOrderItems = [];
      saveItemsToStorage();
      renderSavedOrderBox(false);
    });
  }

  const savedCategory = localStorage.getItem(STORAGE_CATEGORY_KEY);
  if (savedCategory && categoryInfo[savedCategory]) {
    filterMenuByCategory(savedCategory);
  }
  renderSavedOrderBox(true);

  populateContactPageFromStorage();
  const preorderForm = document.getElementById("preorder-form");
  if (preorderForm) {
    preorderForm.addEventListener("submit", validatePreOrderForm);
  }
});
