import { FC } from "react";

export const USDCIcon: FC<{
    className?: string;
}> = (props) => {
  return (
    <svg
      width="21"
      height="20"
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={props.className}
    >
      <g clipPath="url(#a)">
        <path
          d="M10.5 20c5.542 0 10-4.458 10-10s-4.458-10-10-10S.5 4.458.5 10s4.458 10 10 10"
          fill="#2775CA"
        />
        <path
          d="M13.5 11.473c0-1.452-.94-1.95-2.82-2.158-1.344-.166-1.613-.498-1.613-1.078s.448-.955 1.343-.955c.806 0 1.254.25 1.478.872.045.124.18.207.313.207h.717c.179 0 .313-.125.313-.29v-.042c-.179-.913-.985-1.618-2.015-1.701v-.996c0-.166-.134-.29-.358-.332h-.671c-.18 0-.314.124-.359.332v.954c-1.343.166-2.194.996-2.194 2.034 0 1.369.896 1.908 2.776 2.116 1.254.207 1.657.456 1.657 1.12s-.627 1.12-1.477 1.12c-1.165 0-1.568-.456-1.702-1.078a.32.32 0 0 0-.313-.25h-.762c-.179 0-.313.125-.313.291v.042c.179 1.037.895 1.784 2.373 1.991v.996c0 .166.134.29.358.332h.672c.18 0 .313-.124.358-.332v-.996c1.344-.207 2.239-1.079 2.239-2.199"
          fill="#fff"
          fillOpacity=".98"
        />
        <path
          d="M8.24 16.57c-3.458-1.215-5.23-4.986-3.945-8.324.665-1.821 2.127-3.208 3.944-3.859.178-.086.266-.216.266-.433v-.607c0-.174-.088-.304-.266-.347-.044 0-.133 0-.177.043-4.21 1.3-6.516 5.68-5.186 9.798.798 2.428 2.704 4.292 5.186 5.072.177.087.355 0 .4-.173.043-.043.043-.087.043-.173v-.608c0-.13-.133-.303-.266-.39m4.698-13.527c-.178-.086-.355 0-.4.174-.043.043-.043.086-.043.173v.607c0 .174.133.347.266.434 3.457 1.213 5.23 4.985 3.944 8.323-.664 1.821-2.127 3.209-3.944 3.859-.178.086-.266.216-.266.433v.607c0 .174.088.304.266.347.044 0 .133 0 .177-.043 4.21-1.3 6.515-5.68 5.186-9.798-.798-2.471-2.748-4.335-5.186-5.116"
          fill="#fff"
          fillOpacity=".98"
        />
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M.5 0h20v20H.5z" />
        </clipPath>
      </defs>
    </svg>
  );
};
