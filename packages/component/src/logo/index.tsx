import { FC } from "react";

export interface LogoProps {
  link: string;
  image: string;
}

export const Logo: FC<LogoProps> = ({ link = "/" }) => {
  return (
    <div
      className="flex flex-row justify-center items-center"
      style={{ width: "50px", height: "50px" }}
    >
      <a href={link}>WOO</a>
    </div>
  );
};
