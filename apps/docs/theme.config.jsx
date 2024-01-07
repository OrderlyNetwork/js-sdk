import { NavbarExtra } from "@/components/navbarExtra";

export default {
  logo: (
    <div className="flex">
      <img
        src="https://mintlify.s3-us-west-1.amazonaws.com/orderly/logo/dark.png"
        style={{ height: "27px" }}
      />
    </div>
  ),
  logoLink: "/docs/hooks/overview",
  // project: {
  //   link: '#',
  //   icon: (
  //     <svg width="24" height="24" viewBox="0 0 256 256">
  //       <path
  //         fill="currentColor"
  //         d="m231.9 169.8l-94.8 65.6a15.7 15.7 0 0 1-18.2 0l-94.8-65.6a16.1 16.1 0 0 1-6.4-17.3L45 50a12 12 0 0 1 22.9-1.1L88.5 104h79l20.6-55.1A12 12 0 0 1 211 50l27.3 102.5a16.1 16.1 0 0 1-6.4 17.3Z"
  //       ></path>
  //     </svg>
  //   )
  // },
  darkMode: false,
  nextThemes: {
    defaultTheme: "dark",
  },
  primaryHue: {
    light: 263,
    dark: 270,
  },
  primarySaturation: {
    dark: 50,
  },
  navbar: {
    extraContent: NavbarExtra,
  },
  // i18n: [
  //   { locale: 'en-US', text: 'English' },
  //   { locale: 'zh-CN', text: '中文' }
  // ],
  sidebar: {
    defaultMenuCollapseLevel: 1,
    titleComponent({ title, type }) {
      if (title === "Theme builder") {
        return (
          <div className="flex gap-2 items-center">
            <span className="text-lg">🎨</span>
            <strong>{title}</strong>
          </div>
        );
      }
      if (title === "APIs") {
        return (
          <div className="flex gap-2 items-center">
            <span className="text-lg">📚</span>
            <strong>{title}</strong>
          </div>
        );
      }
      return title;
    },
  },
  footer: {
    text: "2023 © Orderly",
  },
  editLink: {
    component: null,
  },
  feedback: {
    content: null,
  },
  useNextSeoProps() {
    return {
      // titleTemplate: "%s",
      titleTemplate: "Orderly Network | SDK",    
      description:'Simplify Web3 applications development and enhance integration experience with the Orderly Omnichain SDK.'
    };
  },
  // ...
};
