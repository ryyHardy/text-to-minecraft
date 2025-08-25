import { useState } from "react";
import { Navigate } from "react-router";

import Button, { type ButtonProps } from "./Button";

type NavButtonProps = {
  destRoute: string;
} & ButtonProps;

export default function NavButton({ destRoute, ...props }: NavButtonProps) {
  const [toDest, setToDest] = useState(false);

  if (toDest) {
    return <Navigate to={destRoute} />;
  }

  return (
    <Button
      onClick={() => setToDest(true)}
      {...props}
    />
  );
}
