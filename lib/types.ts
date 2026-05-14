export type City = {
  iata: string;
  name: string;
  country: string;
  flag: string;
};

export type Route = {
  id: string;
  origin: City;
  destination: City;
  distanceNm: number;
  subsonicHours: number;
  supersonicHours: number;
  techStop?: boolean;
  notes?: string;
};
