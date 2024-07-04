import { useState } from "react";

export const layoutBuilder = () => {
  const [components, setComponents] = useState({});
  const [sideOpen, setSideOpen] = useState(true);

  return components;
};
