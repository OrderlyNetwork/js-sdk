import plugin from "tailwindcss/plugin";

export const gradientPlugin = () =>
  plugin(function ({ addUtilities }) {
    addUtilities({
      ".gradient-primary": {
        backgroundImage:
          "linear-gradient(var(--oui-gradient-angle, 0deg), rgb(var(--oui-gradient-primary-start)) 0%, rgb(var(--oui-gradient-primary-end)) 100%)",
      },
      ".gradient-success": {
        backgroundImage:
          "linear-gradient(var(--oui-gradient-angle, 0deg), rgb(var(--oui-gradient-success-start)) 0%, rgba(var(--oui-gradient-success-end)) 100%)",
      },
      ".gradient-warning": {
        backgroundImage:
          "linear-gradient(var(--oui-gradient-angle, 0deg),rgb(var(--oui-gradient-warning-start)) 0%, rgb(var(--oui-gradient-warning-end)) 100%)",
      },
      ".gradient-danger": {
        backgroundImage:
          "linear-gradient(var(--oui-gradient-angle, 0deg), rgb(var(--oui-gradient-danger-start)) 0%, rgb(var(--oui-gradient-danger-end)) 100%)",
      },
      ".gradient-neutral": {
        backgroundImage:
          "linear-gradient(var(--oui-gradient-angle, 0deg), rgb(var(--oui-gradient-neutral-start)) 0%, rgb(var(--oui-gradient-neutral-end)) 100%)",
      },
      ".gradient-brand": {
        backgroundImage:
          "linear-gradient(var(--oui-gradient-angle, 0deg), rgb(var(--oui-gradient-brand-start)) 0%, rgb(var(--oui-gradient-brand-end)) 100%)",
      },
    });
  });
