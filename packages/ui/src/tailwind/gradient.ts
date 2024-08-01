import plugin from "tailwindcss/plugin";

export const gradientPlugin = () =>
  plugin(function ({ addUtilities }) {
    addUtilities({
      ".gradient-primary": {
        backgroundImage:
          "linear-gradient(var(--oui-gradient-angle, 28.29deg), rgb(var(--oui-gradient-primary-start)) 0%, rgb(var(--oui-gradient-primary-end)) 100%)",
      },
      ".gradient-secondary": {
        backgroundImage:
          "linear-gradient(var(--oui-gradient-angle, 0deg), rgb(var(--oui-gradient-secondary-start)) 0%, rgb(var(--oui-gradient-secondary-end)) 100%)",
      },
      ".gradient-success": {
        backgroundImage:
          "linear-gradient(var(--oui-gradient-angle, 28.29deg), rgb(var(--oui-gradient-success-start)) 0%, rgba(var(--oui-gradient-success-end)) 100%)",
      },
      ".gradient-warning": {
        backgroundImage:
          "linear-gradient(var(--oui-gradient-angle, 28.29deg),rgb(var(--oui-gradient-warning-start)) 0%, rgb(var(--oui-gradient-warning-end)) 100%)",
      },
      ".gradient-danger": {
        backgroundImage:
          "linear-gradient(var(--oui-gradient-angle, 28.29deg), rgb(var(--oui-gradient-danger-start)) 0%, rgb(var(--oui-gradient-danger-end)) 100%)",
      },
      ".gradient-neutral": {
        backgroundImage:
          "linear-gradient(var(--oui-gradient-angle, 28.29deg), rgb(var(--oui-gradient-neutral-start)) 0%, rgb(var(--oui-gradient-neutral-end)) 100%)",
      },
      ".gradient-brand": {
        backgroundImage:
          "linear-gradient(var(--oui-gradient-angle, 270deg), rgb(var(--oui-gradient-brand-start)) 0%, rgb(var(--oui-gradient-brand-end)) 100%)",
      },
      ".gradient-purpe": {
        backgroundImage:
          "linear-gradient(var(--oui-gradient-angle, 28.29deg), rgb(var(--oui-gradient-purpe-start)) 0%, rgb(var(--oui-gradient-purpe-end)) 100%)",
      },
    });
  });
/*
background: linear-gradient(28.29deg, #1828C3 21.6%, #608CFF 83.23%);
background: linear-gradient(28.29deg, #005A4F 21.6%, #00B49E 83.23%);
background: linear-gradient(28.29deg, #792E00 21.6%, #FFB65D 83.23%);
background: linear-gradient(28.29deg, #791438 21.6%, #FF447C 83.23%);
background: linear-gradient(28.29deg, #1B1D22 21.6%, #26292E 83.23%);
background: linear-gradient(28.29deg, #2D0061 21.6%, #BD6BED 83.23%);


background: linear-gradient(28.29deg, #2D0061 21.6%, #BD6BED 83.23%);

*/