export type EducationFeature = {
  title: string;
  description: string;
};

export type EducationPricing = {
  title: string;
  features: [
    {
      [key: string]: boolean | string;
    }
  ];
  btnText: string;
  btnHref: string;
  btnNote?: string;
};
