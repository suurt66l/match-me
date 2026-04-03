export const countriesByContinent: Record<string, string[]> = {
  Africa: [
    "Algeria", "Angola", "Cameroon", "Democratic Republic of the Congo", "Egypt",
    "Ethiopia", "Ghana", "Ivory Coast", "Kenya", "Libya", "Madagascar", "Mali",
    "Morocco", "Mozambique", "Nigeria", "Senegal", "Somalia", "South Africa",
    "Sudan", "Tanzania", "Tunisia", "Uganda", "Zambia", "Zimbabwe",
  ],
  Antarctica: [],
  Asia: [
    "Afghanistan", "Azerbaijan", "Bangladesh", "Cambodia", "China", "Georgia",
    "India", "Indonesia", "Iran", "Iraq", "Israel", "Japan", "Jordan",
    "Kazakhstan", "Kuwait", "Kyrgyzstan", "Lebanon", "Malaysia", "Mongolia",
    "Myanmar", "Nepal", "North Korea", "Oman", "Pakistan", "Philippines",
    "Qatar", "Russia", "Saudi Arabia", "Singapore", "South Korea", "Sri Lanka",
    "Syria", "Taiwan", "Tajikistan", "Thailand", "Turkey", "Turkmenistan",
    "United Arab Emirates", "Uzbekistan", "Vietnam", "Yemen",
  ],
  Europe: [
    "Albania", "Armenia", "Austria", "Azerbaijan", "Belarus", "Belgium",
    "Bosnia and Herzegovina", "Bulgaria", "Croatia", "Cyprus", "Czech Republic",
    "Denmark", "Estonia", "Finland", "France", "Georgia", "Germany", "Greece",
    "Hungary", "Iceland", "Ireland", "Italy", "Kosovo", "Latvia", "Lithuania",
    "Luxembourg", "Malta", "Moldova", "Montenegro", "Netherlands", "North Macedonia",
    "Norway", "Poland", "Portugal", "Romania", "Russia", "Serbia", "Slovakia",
    "Slovenia", "Spain", "Sweden", "Switzerland", "Ukraine", "United Kingdom",
  ],
  "North America": [
    "Bahamas", "Belize", "Canada", "Costa Rica", "Cuba", "Dominican Republic",
    "El Salvador", "Guatemala", "Haiti", "Honduras", "Jamaica", "Mexico",
    "Nicaragua", "Panama", "Puerto Rico", "Trinidad and Tobago", "United States",
  ],
  Oceania: [
    "Australia", "Fiji", "Kiribati", "Marshall Islands", "Micronesia",
    "Nauru", "New Zealand", "Palau", "Papua New Guinea", "Samoa",
    "Solomon Islands", "Tonga", "Tuvalu", "Vanuatu",
  ],
  "South America": [
    "Argentina", "Bolivia", "Brazil", "Chile", "Colombia", "Ecuador",
    "Guyana", "Paraguay", "Peru", "Suriname", "Uruguay", "Venezuela",
  ],
};

export const allCountries: string[] = Object.values(countriesByContinent)
  .flat()
  .sort();
