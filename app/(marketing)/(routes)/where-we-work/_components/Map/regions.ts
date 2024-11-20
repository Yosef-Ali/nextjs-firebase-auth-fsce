export interface Region {
  id: string;
  title: string;
  d: string;
}

export const regions: Region[] = [
  {
    id: "ET-HA",
    title: "Harari People",
    d: "M 610 320 L 620 330 L 610 340 L 600 330 Z"
  },
  {
    id: "ET-DD",
    title: "Dire Dawa",
    d: "M 630 300 L 640 310 L 630 320 L 620 310 Z"
  },
  {
    id: "ET-SO",
    title: "Somali",
    d: "M 650 250 L 750 300 L 700 400 L 600 350 L 620 300 Z"
  },
  {
    id: "ET-AA",
    title: "Addis Ababa",
    d: "M 400 300 L 410 310 L 400 320 L 390 310 Z"
  },
  {
    id: "ET-BE",
    title: "Benshangul-Gumaz",
    d: "M 200 200 L 300 200 L 300 300 L 200 300 Z"
  },
  {
    id: "ET-OR",
    title: "Oromia",
    d: "M 300 250 L 500 250 L 600 300 L 550 400 L 400 400 L 300 350 Z"
  },
  {
    id: "ET-GA",
    title: "Gambela Peoples",
    d: "M 150 300 L 200 300 L 200 350 L 150 350 Z"
  },
  {
    id: "ET-SN",
    title: "SNNPR",
    d: "M 250 350 L 350 350 L 400 400 L 350 450 L 250 450 L 200 400 Z"
  },
  {
    id: "ET-AF",
    title: "Afar",
    d: "M 450 100 L 550 100 L 600 200 L 500 250 L 450 200 Z"
  },
  {
    id: "ET-TI",
    title: "Tigray",
    d: "M 400 50 L 500 50 L 500 150 L 400 150 Z"
  },
  {
    id: "ET-AM",
    title: "Amhara",
    d: "M 300 100 L 450 100 L 500 200 L 400 250 L 300 200 Z"
  }
];
