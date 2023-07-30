import React from "react";
import Link from "next/link";

interface Props {}

const TitleContainer = () => {
  return (
    <Link href="/" className="block grid place-items-center text-3xl">
      Navigation
    </Link>
  );
};

export default TitleContainer;
