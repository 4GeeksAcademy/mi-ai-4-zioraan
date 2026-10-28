export const countries = {
  CO: {
    label: "Colombia",
    prefix: "+57",
    cities: {
      medellin: { label: "Medell\u00edn", locations: ["Brasaland El Poblado", "Brasaland Laureles", "Brasaland Envigado", "Brasaland Sabaneta"] },
      bogota: { label: "Bogot\u00e1", locations: ["Brasaland Usaqu\u00e9n", "Brasaland Chapinero", "Brasaland Zona Rosa"] },
      cali: { label: "Cali", locations: ["Brasaland Granada", "Brasaland Ciudad Jard\u00edn", "Brasaland Unicentro"] }
    }
  },
  US: {
    label: "United States",
    prefix: "+1",
    cities: {
      miami: { label: "Miami", locations: ["Brasaland Brickell", "Brasaland Coral Gables"] },
      orlando: { label: "Orlando", locations: ["Brasaland Downtown", "Brasaland International Drive"] }
    }
  }
};

export const dietaryOptions = {
  none: "No restrictions",
  vegetarian: "Vegetarian",
  glutenFree: "Gluten-free",
  other: "Other"
};

export const referralOptions = {
  socialMedia: "Social media",
  recommendation: "Recommendation",
  walkedBy: "Walked by",
  internetSearch: "Internet search",
  other: "Other"
};

export const messages = {
  fullName: "Enter your full name (first and last name)",
  email: "Enter a valid email (example: name@email.com)",
  phone: "Phone must include country code (example: +57 300 123 4567 or +1 305 123 4567)",
  country: "Select your country",
  city: "Select your city",
  favoriteLocation: "Select a location in your chosen country and city",
  dietaryPreferences: "Choose valid dietary preferences; no restrictions cannot be combined with other preferences",
  referralSource: "Tell us how you found Brasaland",
  dateOfBirth: "You must be 18 or older to register for Brasa Points",
  terms: "You must accept the Brasa Points program terms to continue",
  countryPlaceholder: "Select your country",
  cityPlaceholder: "Select your city",
  locationPlaceholder: "No favorite location",
  referralPlaceholder: "Select an option",
  errorSummary: (count) => `Please correct ${count} ${count === 1 ? "field" : "fields"} below.`,
  successHeading: "Welcome to Brasa Points!",
  successBody: "Your registration was successful. You will receive a confirmation email in the next few minutes with your account details and how to start earning points.",
  successBenefits: "You can now enjoy your benefits at any of our 14 locations!"
};