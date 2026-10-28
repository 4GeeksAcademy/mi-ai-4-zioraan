import { countries, dietaryOptions, referralOptions, messages } from "./data.js";

export function isAdult(value, today = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const birth = new Date(0);
  birth.setHours(0, 0, 0, 0);
  birth.setFullYear(year, month - 1, day);
  if (year < 1 || birth.getFullYear() !== year || birth.getMonth() !== month - 1 || birth.getDate() !== day) return false;
  const birthdayPending = today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day);
  return today.getFullYear() - year - Number(birthdayPending) >= 18;
}

export function validateValues(values, today = new Date()) {
  const errors = {};
  const words = values.fullName.trim().split(/\s+/);
  if (words.length < 2 || !words.every((word) => /\p{L}/u.test(word))) errors.fullName = messages.fullName;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = messages.email;
  const country = Object.hasOwn(countries, values.country) ? countries[values.country] : null;
  const phone = values.phone.trim();
  const normalizedPhone = phone.replace(/[\s()-]/g, "");
  if (!/^\+[\d\s()-]+$/.test(phone) || !/^\+(57|1)\d+$/.test(normalizedPhone) || (country && !normalizedPhone.startsWith(country.prefix))) errors.phone = messages.phone;
  if (!country) errors.country = messages.country;
  const city = country && Object.hasOwn(country.cities, values.city) ? country.cities[values.city] : null;
  if (!city) errors.city = messages.city;
  if (values.favoriteLocation && !city?.locations.includes(values.favoriteLocation)) errors.favoriteLocation = messages.favoriteLocation;
  if (values.dietaryPreferences.some((value) => !Object.hasOwn(dietaryOptions, value)) || (values.dietaryPreferences.includes("none") && values.dietaryPreferences.length > 1)) errors.dietaryPreferences = messages.dietaryPreferences;
  if (!Object.hasOwn(referralOptions, values.referralSource)) errors.referralSource = messages.referralSource;
  if (!isAdult(values.dateOfBirth, today)) errors.dateOfBirth = messages.dateOfBirth;
  if (!values.terms) errors.terms = messages.terms;
  return errors;
}

function initializeRegistration() {
  const form = document.querySelector("#registration-form");
  if (!form) return;
  const fields = document.querySelector("#registration-fields");
  const country = form.elements.namedItem("country");
  const city = form.elements.namedItem("city");
  const location = form.elements.namedItem("favoriteLocation");
  const summary = document.querySelector("#error-summary");
  const success = document.querySelector("#success");
  const touched = new Set();
  let submitted = false;

  function populate(select, options, placeholder) {
    select.replaceChildren(new Option(placeholder, ""), ...options.map(([value, label]) => new Option(label, value)));
  }

  function updateLocations() {
    const selectedCity = countries[country.value]?.cities[city.value];
    populate(location, (selectedCity?.locations ?? []).map((name) => [name, name]), messages.locationPlaceholder);
    location.disabled = !selectedCity;
  }

  function updateCities() {
    const selectedCountry = countries[country.value];
    populate(city, Object.entries(selectedCountry?.cities ?? {}).map(([value, details]) => [value, details.label]), messages.cityPlaceholder);
    city.disabled = !selectedCountry;
    updateLocations();
  }

  function values() {
    const data = new FormData(form);
    return {
      fullName: String(data.get("fullName") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      country: String(data.get("country") ?? ""),
      city: String(data.get("city") ?? ""),
      favoriteLocation: String(data.get("favoriteLocation") ?? ""),
      dietaryPreferences: data.getAll("dietaryPreferences").map(String),
      referralSource: String(data.get("referralSource") ?? ""),
      dateOfBirth: String(data.get("dateOfBirth") ?? ""),
      terms: data.get("terms") === "accepted",
      emailOffers: data.get("emailOffers") === "yes"
    };
  }

  function showErrors(errors, all = false) {
    for (const name of Object.keys(messages).filter((key) => document.getElementById(`${key}-error`))) {
      const error = document.getElementById(`${name}-error`);
      const message = (all || touched.has(name)) ? errors[name] : "";
      error.textContent = message ?? "";
      error.hidden = !message;
      for (const control of form.querySelectorAll(`[name="${name}"]`)) {
        if (message) control.setAttribute("aria-invalid", "true");
        else control.removeAttribute("aria-invalid");
      }
    }
    if (summary.textContent) {
      const count = Object.keys(errors).length;
      summary.textContent = count ? messages.errorSummary(count) : "";
    }
  }

  populate(country, Object.entries(countries).map(([value, details]) => [value, details.label]), messages.countryPlaceholder);
  populate(form.elements.namedItem("referralSource"), Object.entries(referralOptions), messages.referralPlaceholder);
  updateCities();
  fields.disabled = false;
  document.querySelector("#submit-registration").disabled = false;
  form.noValidate = true;

  form.addEventListener("focusout", (event) => {
    if (!event.target.name || submitted) return;
    touched.add(event.target.name);
    showErrors(validateValues(values()));
  });
  form.addEventListener("input", (event) => {
    if (submitted) return;
    if (touched.has(event.target.name)) showErrors(validateValues(values()));
  });
  form.addEventListener("change", (event) => {
    if (submitted) return;
    if (event.target === country) updateCities();
    if (event.target === city) updateLocations();
    if (event.target.name === "dietaryPreferences" && event.target.checked) {
      for (const checkbox of form.querySelectorAll('[name="dietaryPreferences"]')) {
        if (event.target.value === "none" && checkbox !== event.target) checkbox.checked = false;
        if (event.target.value !== "none" && checkbox.value === "none") checkbox.checked = false;
      }
    }
    touched.add(event.target.name);
    showErrors(validateValues(values()));
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (submitted) return;
    const errors = validateValues(values());
    Object.keys(errors).forEach((name) => touched.add(name));
    showErrors(errors, true);
    const names = Object.keys(errors);
    summary.textContent = names.length ? messages.errorSummary(names.length) : "";
    if (names.length) {
      form.querySelector(`[name="${names[0]}"]`).focus();
      return;
    }
    submitted = true;
    success.querySelector("h2").textContent = messages.successHeading;
    success.querySelector("[data-success-body]").textContent = messages.successBody;
    success.querySelector("[data-success-benefits]").textContent = messages.successBenefits;
    success.hidden = false;
    fields.disabled = true;
    document.querySelector("#submit-registration").disabled = true;
    success.focus();
  });
  form.addEventListener("reset", () => {
    submitted = false;
    touched.clear();
    fields.disabled = false;
    document.querySelector("#submit-registration").disabled = false;
    success.hidden = true;
    summary.textContent = "";
    setTimeout(() => {
      updateCities();
      showErrors({});
      form.elements.namedItem("fullName").focus();
    }, 0);
  });
}

if (typeof document !== "undefined") initializeRegistration();