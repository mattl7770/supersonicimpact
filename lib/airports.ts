/**
 * Curated list of major international airports.
 * Source: OurAirports.com (CC0 public-domain database).
 * Coordinates are decimal degrees, ICAO/IATA standard.
 */

export type Airport = {
  iata: string;
  name: string;
  city: string;
  country: string;
  flag: string;
  lat: number;
  lng: number;
};

export const airports: Airport[] = [
  // North America
  { iata: "JFK", name: "John F. Kennedy Intl", city: "New York", country: "USA", flag: "🇺🇸", lat: 40.6413, lng: -73.7781 },
  { iata: "EWR", name: "Newark Liberty Intl", city: "Newark", country: "USA", flag: "🇺🇸", lat: 40.6925, lng: -74.1687 },
  { iata: "BOS", name: "Logan Intl", city: "Boston", country: "USA", flag: "🇺🇸", lat: 42.3656, lng: -71.0096 },
  { iata: "IAD", name: "Dulles Intl", city: "Washington", country: "USA", flag: "🇺🇸", lat: 38.9531, lng: -77.4565 },
  { iata: "DCA", name: "Reagan National", city: "Washington", country: "USA", flag: "🇺🇸", lat: 38.8512, lng: -77.0402 },
  { iata: "ATL", name: "Hartsfield-Jackson", city: "Atlanta", country: "USA", flag: "🇺🇸", lat: 33.6407, lng: -84.4277 },
  { iata: "ORD", name: "O'Hare Intl", city: "Chicago", country: "USA", flag: "🇺🇸", lat: 41.9742, lng: -87.9073 },
  { iata: "DTW", name: "Detroit Metro", city: "Detroit", country: "USA", flag: "🇺🇸", lat: 42.2125, lng: -83.3534 },
  { iata: "MIA", name: "Miami Intl", city: "Miami", country: "USA", flag: "🇺🇸", lat: 25.7959, lng: -80.2870 },
  { iata: "MCO", name: "Orlando Intl", city: "Orlando", country: "USA", flag: "🇺🇸", lat: 28.4312, lng: -81.3081 },
  { iata: "DFW", name: "Dallas/Fort Worth", city: "Dallas", country: "USA", flag: "🇺🇸", lat: 32.8998, lng: -97.0403 },
  { iata: "IAH", name: "George Bush Intl", city: "Houston", country: "USA", flag: "🇺🇸", lat: 29.9902, lng: -95.3368 },
  { iata: "DEN", name: "Denver Intl", city: "Denver", country: "USA", flag: "🇺🇸", lat: 39.8617, lng: -104.6731 },
  { iata: "LAS", name: "Harry Reid Intl", city: "Las Vegas", country: "USA", flag: "🇺🇸", lat: 36.0840, lng: -115.1537 },
  { iata: "PHX", name: "Sky Harbor Intl", city: "Phoenix", country: "USA", flag: "🇺🇸", lat: 33.4373, lng: -112.0078 },
  { iata: "SEA", name: "Seattle-Tacoma", city: "Seattle", country: "USA", flag: "🇺🇸", lat: 47.4502, lng: -122.3088 },
  { iata: "PDX", name: "Portland Intl", city: "Portland", country: "USA", flag: "🇺🇸", lat: 45.5898, lng: -122.5951 },
  { iata: "SFO", name: "San Francisco Intl", city: "San Francisco", country: "USA", flag: "🇺🇸", lat: 37.6213, lng: -122.3790 },
  { iata: "LAX", name: "Los Angeles Intl", city: "Los Angeles", country: "USA", flag: "🇺🇸", lat: 33.9416, lng: -118.4085 },
  { iata: "SAN", name: "San Diego Intl", city: "San Diego", country: "USA", flag: "🇺🇸", lat: 32.7338, lng: -117.1933 },
  { iata: "HNL", name: "Daniel K. Inouye", city: "Honolulu", country: "USA", flag: "🇺🇸", lat: 21.3187, lng: -157.9224 },
  { iata: "YYZ", name: "Toronto Pearson", city: "Toronto", country: "Canada", flag: "🇨🇦", lat: 43.6777, lng: -79.6248 },
  { iata: "YUL", name: "Montréal-Trudeau", city: "Montreal", country: "Canada", flag: "🇨🇦", lat: 45.4577, lng: -73.7494 },
  { iata: "YVR", name: "Vancouver Intl", city: "Vancouver", country: "Canada", flag: "🇨🇦", lat: 49.1947, lng: -123.1844 },
  { iata: "MEX", name: "Mexico City Intl", city: "Mexico City", country: "Mexico", flag: "🇲🇽", lat: 19.4361, lng: -99.0719 },

  // Europe
  { iata: "LHR", name: "Heathrow", city: "London", country: "UK", flag: "🇬🇧", lat: 51.4700, lng: -0.4543 },
  { iata: "LGW", name: "Gatwick", city: "London", country: "UK", flag: "🇬🇧", lat: 51.1537, lng: -0.1821 },
  { iata: "MAN", name: "Manchester", city: "Manchester", country: "UK", flag: "🇬🇧", lat: 53.3537, lng: -2.2750 },
  { iata: "DUB", name: "Dublin", city: "Dublin", country: "Ireland", flag: "🇮🇪", lat: 53.4213, lng: -6.2701 },
  { iata: "CDG", name: "Charles de Gaulle", city: "Paris", country: "France", flag: "🇫🇷", lat: 49.0097, lng: 2.5479 },
  { iata: "ORY", name: "Paris-Orly", city: "Paris", country: "France", flag: "🇫🇷", lat: 48.7233, lng: 2.3794 },
  { iata: "FRA", name: "Frankfurt", city: "Frankfurt", country: "Germany", flag: "🇩🇪", lat: 50.0379, lng: 8.5622 },
  { iata: "MUC", name: "Munich", city: "Munich", country: "Germany", flag: "🇩🇪", lat: 48.3538, lng: 11.7861 },
  { iata: "BER", name: "Berlin Brandenburg", city: "Berlin", country: "Germany", flag: "🇩🇪", lat: 52.3667, lng: 13.5033 },
  { iata: "AMS", name: "Schiphol", city: "Amsterdam", country: "Netherlands", flag: "🇳🇱", lat: 52.3105, lng: 4.7683 },
  { iata: "BRU", name: "Brussels", city: "Brussels", country: "Belgium", flag: "🇧🇪", lat: 50.9014, lng: 4.4844 },
  { iata: "ZRH", name: "Zurich", city: "Zurich", country: "Switzerland", flag: "🇨🇭", lat: 47.4647, lng: 8.5492 },
  { iata: "GVA", name: "Geneva", city: "Geneva", country: "Switzerland", flag: "🇨🇭", lat: 46.2381, lng: 6.1090 },
  { iata: "VIE", name: "Vienna", city: "Vienna", country: "Austria", flag: "🇦🇹", lat: 48.1103, lng: 16.5697 },
  { iata: "CPH", name: "Copenhagen", city: "Copenhagen", country: "Denmark", flag: "🇩🇰", lat: 55.6180, lng: 12.6508 },
  { iata: "ARN", name: "Arlanda", city: "Stockholm", country: "Sweden", flag: "🇸🇪", lat: 59.6519, lng: 17.9186 },
  { iata: "OSL", name: "Oslo Gardermoen", city: "Oslo", country: "Norway", flag: "🇳🇴", lat: 60.1939, lng: 11.1004 },
  { iata: "HEL", name: "Helsinki-Vantaa", city: "Helsinki", country: "Finland", flag: "🇫🇮", lat: 60.3172, lng: 24.9633 },
  { iata: "KEF", name: "Keflavík", city: "Reykjavík", country: "Iceland", flag: "🇮🇸", lat: 63.9850, lng: -22.6056 },
  { iata: "MAD", name: "Madrid-Barajas", city: "Madrid", country: "Spain", flag: "🇪🇸", lat: 40.4983, lng: -3.5676 },
  { iata: "BCN", name: "Barcelona-El Prat", city: "Barcelona", country: "Spain", flag: "🇪🇸", lat: 41.2974, lng: 2.0833 },
  { iata: "LIS", name: "Lisbon", city: "Lisbon", country: "Portugal", flag: "🇵🇹", lat: 38.7813, lng: -9.1359 },
  { iata: "FCO", name: "Leonardo da Vinci", city: "Rome", country: "Italy", flag: "🇮🇹", lat: 41.8003, lng: 12.2389 },
  { iata: "MXP", name: "Malpensa", city: "Milan", country: "Italy", flag: "🇮🇹", lat: 45.6306, lng: 8.7281 },
  { iata: "ATH", name: "Athens", city: "Athens", country: "Greece", flag: "🇬🇷", lat: 37.9364, lng: 23.9445 },
  { iata: "IST", name: "Istanbul", city: "Istanbul", country: "Turkey", flag: "🇹🇷", lat: 41.2753, lng: 28.7519 },
  { iata: "WAW", name: "Warsaw Chopin", city: "Warsaw", country: "Poland", flag: "🇵🇱", lat: 52.1657, lng: 20.9671 },
  { iata: "PRG", name: "Václav Havel", city: "Prague", country: "Czechia", flag: "🇨🇿", lat: 50.1008, lng: 14.2632 },
  { iata: "BUD", name: "Budapest", city: "Budapest", country: "Hungary", flag: "🇭🇺", lat: 47.4369, lng: 19.2556 },
  { iata: "SVO", name: "Sheremetyevo", city: "Moscow", country: "Russia", flag: "🇷🇺", lat: 55.9726, lng: 37.4146 },

  // Asia
  { iata: "HND", name: "Haneda", city: "Tokyo", country: "Japan", flag: "🇯🇵", lat: 35.5494, lng: 139.7798 },
  { iata: "NRT", name: "Narita", city: "Tokyo", country: "Japan", flag: "🇯🇵", lat: 35.7720, lng: 140.3929 },
  { iata: "KIX", name: "Kansai", city: "Osaka", country: "Japan", flag: "🇯🇵", lat: 34.4348, lng: 135.2440 },
  { iata: "ICN", name: "Incheon", city: "Seoul", country: "South Korea", flag: "🇰🇷", lat: 37.4602, lng: 126.4407 },
  { iata: "GMP", name: "Gimpo", city: "Seoul", country: "South Korea", flag: "🇰🇷", lat: 37.5587, lng: 126.7944 },
  { iata: "PEK", name: "Beijing Capital", city: "Beijing", country: "China", flag: "🇨🇳", lat: 40.0801, lng: 116.5846 },
  { iata: "PKX", name: "Daxing Intl", city: "Beijing", country: "China", flag: "🇨🇳", lat: 39.5098, lng: 116.4106 },
  { iata: "PVG", name: "Shanghai Pudong", city: "Shanghai", country: "China", flag: "🇨🇳", lat: 31.1443, lng: 121.8083 },
  { iata: "CAN", name: "Baiyun Intl", city: "Guangzhou", country: "China", flag: "🇨🇳", lat: 23.3924, lng: 113.2988 },
  { iata: "HKG", name: "Hong Kong Intl", city: "Hong Kong", country: "Hong Kong", flag: "🇭🇰", lat: 22.3080, lng: 113.9185 },
  { iata: "TPE", name: "Taoyuan Intl", city: "Taipei", country: "Taiwan", flag: "🇹🇼", lat: 25.0797, lng: 121.2342 },
  { iata: "SIN", name: "Changi", city: "Singapore", country: "Singapore", flag: "🇸🇬", lat: 1.3644, lng: 103.9915 },
  { iata: "BKK", name: "Suvarnabhumi", city: "Bangkok", country: "Thailand", flag: "🇹🇭", lat: 13.6900, lng: 100.7501 },
  { iata: "KUL", name: "Kuala Lumpur Intl", city: "Kuala Lumpur", country: "Malaysia", flag: "🇲🇾", lat: 2.7456, lng: 101.7099 },
  { iata: "CGK", name: "Soekarno-Hatta", city: "Jakarta", country: "Indonesia", flag: "🇮🇩", lat: -6.1256, lng: 106.6558 },
  { iata: "MNL", name: "Ninoy Aquino", city: "Manila", country: "Philippines", flag: "🇵🇭", lat: 14.5086, lng: 121.0194 },
  { iata: "SGN", name: "Tan Son Nhat", city: "Ho Chi Minh City", country: "Vietnam", flag: "🇻🇳", lat: 10.8188, lng: 106.6519 },
  { iata: "HAN", name: "Noi Bai", city: "Hanoi", country: "Vietnam", flag: "🇻🇳", lat: 21.2212, lng: 105.8073 },
  { iata: "BOM", name: "Chhatrapati Shivaji", city: "Mumbai", country: "India", flag: "🇮🇳", lat: 19.0896, lng: 72.8656 },
  { iata: "DEL", name: "Indira Gandhi", city: "Delhi", country: "India", flag: "🇮🇳", lat: 28.5562, lng: 77.1000 },
  { iata: "BLR", name: "Kempegowda", city: "Bangalore", country: "India", flag: "🇮🇳", lat: 13.1986, lng: 77.7066 },
  { iata: "MAA", name: "Chennai Intl", city: "Chennai", country: "India", flag: "🇮🇳", lat: 13.0067, lng: 80.1709 },
  { iata: "HYD", name: "Rajiv Gandhi", city: "Hyderabad", country: "India", flag: "🇮🇳", lat: 17.2403, lng: 78.4294 },
  { iata: "CCU", name: "Netaji Subhas Chandra Bose", city: "Kolkata", country: "India", flag: "🇮🇳", lat: 22.6520, lng: 88.4463 },

  // Middle East & Africa
  { iata: "DXB", name: "Dubai Intl", city: "Dubai", country: "UAE", flag: "🇦🇪", lat: 25.2532, lng: 55.3657 },
  { iata: "AUH", name: "Abu Dhabi Intl", city: "Abu Dhabi", country: "UAE", flag: "🇦🇪", lat: 24.4330, lng: 54.6515 },
  { iata: "DOH", name: "Hamad Intl", city: "Doha", country: "Qatar", flag: "🇶🇦", lat: 25.2731, lng: 51.6080 },
  { iata: "RUH", name: "King Khalid Intl", city: "Riyadh", country: "Saudi Arabia", flag: "🇸🇦", lat: 24.9576, lng: 46.6988 },
  { iata: "JED", name: "King Abdulaziz Intl", city: "Jeddah", country: "Saudi Arabia", flag: "🇸🇦", lat: 21.6796, lng: 39.1561 },
  { iata: "CAI", name: "Cairo Intl", city: "Cairo", country: "Egypt", flag: "🇪🇬", lat: 30.1219, lng: 31.4056 },
  { iata: "TLV", name: "Ben Gurion", city: "Tel Aviv", country: "Israel", flag: "🇮🇱", lat: 32.0114, lng: 34.8867 },
  { iata: "JNB", name: "O. R. Tambo Intl", city: "Johannesburg", country: "South Africa", flag: "🇿🇦", lat: -26.1392, lng: 28.2460 },
  { iata: "CPT", name: "Cape Town Intl", city: "Cape Town", country: "South Africa", flag: "🇿🇦", lat: -33.9648, lng: 18.6017 },
  { iata: "NBO", name: "Jomo Kenyatta", city: "Nairobi", country: "Kenya", flag: "🇰🇪", lat: -1.3192, lng: 36.9278 },
  { iata: "ADD", name: "Bole Intl", city: "Addis Ababa", country: "Ethiopia", flag: "🇪🇹", lat: 8.9779, lng: 38.7993 },
  { iata: "LOS", name: "Murtala Muhammed", city: "Lagos", country: "Nigeria", flag: "🇳🇬", lat: 6.5774, lng: 3.3211 },

  // South America
  { iata: "GRU", name: "Guarulhos Intl", city: "São Paulo", country: "Brazil", flag: "🇧🇷", lat: -23.4322, lng: -46.4694 },
  { iata: "GIG", name: "Galeão Intl", city: "Rio de Janeiro", country: "Brazil", flag: "🇧🇷", lat: -22.8090, lng: -43.2506 },
  { iata: "EZE", name: "Ezeiza", city: "Buenos Aires", country: "Argentina", flag: "🇦🇷", lat: -34.8222, lng: -58.5358 },
  { iata: "SCL", name: "Comodoro Arturo Merino", city: "Santiago", country: "Chile", flag: "🇨🇱", lat: -33.3928, lng: -70.7855 },
  { iata: "LIM", name: "Jorge Chávez", city: "Lima", country: "Peru", flag: "🇵🇪", lat: -12.0219, lng: -77.1143 },
  { iata: "BOG", name: "El Dorado", city: "Bogotá", country: "Colombia", flag: "🇨🇴", lat: 4.7016, lng: -74.1469 },
  { iata: "UIO", name: "Mariscal Sucre", city: "Quito", country: "Ecuador", flag: "🇪🇨", lat: -0.1292, lng: -78.3575 },
  { iata: "CCS", name: "Simón Bolívar", city: "Caracas", country: "Venezuela", flag: "🇻🇪", lat: 10.6031, lng: -66.9907 },

  // Oceania
  { iata: "SYD", name: "Kingsford Smith", city: "Sydney", country: "Australia", flag: "🇦🇺", lat: -33.9461, lng: 151.1772 },
  { iata: "MEL", name: "Tullamarine", city: "Melbourne", country: "Australia", flag: "🇦🇺", lat: -37.6690, lng: 144.8410 },
  { iata: "BNE", name: "Brisbane Intl", city: "Brisbane", country: "Australia", flag: "🇦🇺", lat: -27.3842, lng: 153.1175 },
  { iata: "PER", name: "Perth Intl", city: "Perth", country: "Australia", flag: "🇦🇺", lat: -31.9385, lng: 115.9672 },
  { iata: "AKL", name: "Auckland Intl", city: "Auckland", country: "New Zealand", flag: "🇳🇿", lat: -37.0082, lng: 174.7917 },
  { iata: "WLG", name: "Wellington Intl", city: "Wellington", country: "New Zealand", flag: "🇳🇿", lat: -41.3272, lng: 174.8053 },
  { iata: "NAN", name: "Nadi Intl", city: "Nadi", country: "Fiji", flag: "🇫🇯", lat: -17.7553, lng: 177.4434 },
];

export function getAirportByIata(iata: string): Airport | undefined {
  return airports.find((a) => a.iata === iata);
}
