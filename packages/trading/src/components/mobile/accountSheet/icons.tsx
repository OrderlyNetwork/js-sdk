export const HeadIcon = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="oui-rounded-full"
    >
      <g clipPath="url(#a)">
        <path
          d="m31.002 14.493-8.326-22.51L.166.31l8.327 22.51z"
          fill="#03435D"
        />
        <path
          d="m4.456-8.716-18.03 15.84 15.84 18.03 18.03-15.84z"
          fill="#157CF2"
        />
        <path
          d="m17.548 38.67 22.825-7.416-7.416-22.825-22.826 7.416z"
          fill="#F3E200"
        />
      </g>
      <defs>
        <clipPath id="a">
          <rect width="24" height="24" rx="12" fill="#fff" />
        </clipPath>
      </defs>
    </svg>
  );
};

export const CopyIcon = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.832 2.492A3.333 3.333 0 0 0 2.5 5.826v5a3.333 3.333 0 0 0 3.333 3.333 3.333 3.333 0 0 0 3.334 3.333h5a3.333 3.333 0 0 0 3.333-3.333v-5a3.333 3.333 0 0 0-3.333-3.333 3.333 3.333 0 0 0-3.334-3.334zm8.334 5c.92 0 1.666.746 1.666 1.667v5c0 .92-.746 1.666-1.666 1.666h-5c-.92 0-1.667-.745-1.667-1.666h3.333a3.333 3.333 0 0 0 3.334-3.334z"
        fill="rgb(var(--oui-color-primary))"
      />
    </svg>
  );
};

export const USDCIcon = (props: { size?: number }) => {
  const { size = 20 } = props;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#a)">
        <path
          d="M10 20c5.542 0 10-4.458 10-10S15.542 0 10 0 0 4.458 0 10s4.458 10 10 10"
          fill="#2775CA"
        />
        <path
          d="M13 11.473c0-1.452-.94-1.95-2.82-2.158-1.344-.166-1.613-.498-1.613-1.078s.448-.955 1.343-.955c.806 0 1.254.25 1.478.872.045.124.18.207.313.207h.717c.179 0 .313-.125.313-.29v-.042c-.179-.913-.985-1.618-2.015-1.701v-.996c0-.166-.134-.29-.358-.332h-.671c-.18 0-.314.124-.359.332v.954c-1.343.166-2.194.996-2.194 2.034 0 1.369.896 1.908 2.776 2.116 1.254.207 1.657.456 1.657 1.12s-.627 1.12-1.477 1.12c-1.165 0-1.568-.456-1.702-1.078a.32.32 0 0 0-.313-.25h-.762c-.179 0-.313.125-.313.291v.042c.179 1.037.895 1.784 2.373 1.991v.996c0 .166.134.29.358.332h.672c.18 0 .313-.124.358-.332v-.996C12.105 13.465 13 12.593 13 11.473"
          fill="#fff"
          fillOpacity=".98"
        />
        <path
          d="M7.74 16.57c-3.458-1.215-5.23-4.986-3.945-8.324.665-1.821 2.127-3.208 3.944-3.859.178-.086.266-.216.266-.433v-.607c0-.174-.088-.304-.266-.347-.044 0-.133 0-.177.043-4.21 1.3-6.516 5.68-5.186 9.798.798 2.428 2.704 4.292 5.186 5.072.177.087.355 0 .399-.173.044-.043.044-.087.044-.173v-.608c0-.13-.133-.303-.266-.39m4.698-13.527c-.178-.086-.355 0-.4.174-.043.043-.043.086-.043.173v.607c0 .174.133.347.266.434 3.457 1.213 5.23 4.985 3.944 8.323-.664 1.821-2.127 3.209-3.944 3.859-.178.086-.266.216-.266.433v.607c0 .174.088.304.266.347.044 0 .133 0 .177-.043 4.21-1.3 6.515-5.68 5.186-9.798-.798-2.471-2.748-4.335-5.186-5.116"
          fill="#fff"
        />
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M0 0h20v20H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};

export const OrderlyIcon = (props: { size?: number }) => {
  const { size = 20 } = props;
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clip-path="url(#clip0_6403_64483)">
        <path
          d="M10.0245 19.9493C15.5198 19.9493 19.9747 15.4944 19.9747 9.99908C19.9747 4.50371 15.5198 0.0488281 10.0245 0.0488281C4.5291 0.0488281 0.0742188 4.50371 0.0742188 9.99908C0.0742188 15.4944 4.5291 19.9493 10.0245 19.9493Z"
          fill="url(#paint0_linear_6403_64483)"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M14.1553 4.89304C14.2199 4.94541 14.1821 5.04758 14.0989 5.04758H5.95035C5.86716 5.04758 5.82936 4.94541 5.894 4.89304C7.0223 3.97912 8.45953 3.43164 10.0246 3.43164C11.5898 3.43164 13.0269 3.97912 14.1553 4.89304Z"
          fill="white"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M7.47013 11.7869C7.42315 11.7199 7.34748 11.6777 7.26565 11.6777H3.82985C3.75113 11.6777 3.69375 11.7525 3.71563 11.8281C4.5078 14.565 7.0326 16.566 10.0247 16.566C13.017 16.566 15.5417 14.565 16.3339 11.8281C16.3558 11.7525 16.2984 11.6777 16.2197 11.6777H12.7839C12.702 11.6777 12.6264 11.7199 12.5795 11.7869C12.0155 12.5911 11.0815 13.1167 10.0248 13.1167C8.96803 13.1167 8.03406 12.5911 7.47013 11.7869Z"
          fill="white"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M12.3347 7.90519C12.3822 7.95756 12.449 7.9891 12.5196 7.9891H16.1137C16.1952 7.9891 16.253 7.90983 16.2261 7.83301C15.9724 7.10689 15.5948 6.43893 15.1187 5.85447C15.074 5.79961 15.0067 5.76855 14.9358 5.76855H5.11323C5.04247 5.76855 4.97512 5.79961 4.93044 5.85447C4.45429 6.43893 4.0767 7.10689 3.82306 7.83301C3.79622 7.90983 3.85398 7.9891 3.93536 7.9891H7.52952C7.60022 7.9891 7.66694 7.95756 7.71445 7.90519C8.28491 7.2763 9.10861 6.88136 10.0246 6.88136C10.9405 6.88136 11.7643 7.2763 12.3347 7.90519Z"
          fill="white"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M13.1164 10.9586C13.0553 10.9586 13.0118 10.899 13.0284 10.8401C13.1033 10.5722 13.1433 10.2898 13.1433 9.9981C13.1433 9.58758 13.064 9.19556 12.9199 8.83657C12.8954 8.77581 12.9392 8.70801 13.0046 8.70801H16.392C16.4349 8.70801 16.472 8.73831 16.4799 8.78052C16.5538 9.17511 16.5925 9.58216 16.5925 9.9982C16.5925 10.2978 16.5724 10.5926 16.5337 10.8815C16.5277 10.9258 16.4897 10.9586 16.4451 10.9586H13.1164ZM7.02223 10.8401C7.03868 10.899 6.99532 10.9586 6.93421 10.9586H3.60551C3.56084 10.9586 3.52285 10.9258 3.5169 10.8815C3.47807 10.5926 3.45801 10.2978 3.45801 9.9982C3.45801 9.58216 3.4967 9.17511 3.57069 8.78052C3.57859 8.73831 3.61563 8.70801 3.65856 8.70801H7.04593C7.11141 8.70801 7.15516 8.77581 7.13076 8.83657C6.98657 9.19556 6.90722 9.58758 6.90722 9.9981C6.90722 10.2898 6.94728 10.5722 7.02223 10.8401Z"
          fill="white"
        />
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_6403_64483"
          x1="10.0245"
          y1="0.0488561"
          x2="10.0245"
          y2="19.9493"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#C750FF" />
          <stop offset="1" stop-color="#5800E8" />
        </linearGradient>
        <clipPath id="clip0_6403_64483">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
