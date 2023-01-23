import React from "react";
import { NextPage } from "next";
import Image from "next/image";

interface TextBlockProps {
  styling: string;
  brStyling?: string;
}
const TextBlock: React.FC<TextBlockProps> = ({ styling, brStyling }) => {
  return (
    <>
      <p className={`${styling}`}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </p>
      <br className={`${brStyling}`} />
    </>
  );
};

const About: NextPage = () => {
  return (
    <div className="bg-slate-600 h-[100vh] overflow-y-scroll scrollbar-hide grid place-items-center">
      <div className="bg-slate-300 p-8 md:rounded-xl w-full">
        <h1 className="text-4xl text-center mb-3">Our Story</h1>

        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="relative w-full aspect-[3/2] col-span-1">
            <Image
              alt={"buildings"}
              src={
                "https://images.unsplash.com/photo-1435575653489-b0873ec954e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
              }
              fill
              sizes="32rem"
            />
          </div>
          <div className="px-6 col-span-2">
            <TextBlock
              styling="text-sm md:text-base hidden md:block lg:text-lg"
              brStyling="hidden lg:block"
            />
            <TextBlock
              styling="text-sm md:text-base hidden lg:block lg:text-lg"
              brStyling="hidden xl:block"
            />
            <TextBlock
              styling="text-sm md:text-base hidden xl:block lg:text-lg"
              brStyling="hidden"
            />
          </div>
        </div>
        <div>
          <TextBlock
            styling="text-sm md:text-base block md:hidden lg:text-lg mt-4"
            brStyling="block md:hidden"
          />
          <TextBlock
            styling="text-sm md:text-base block lg:hidden lg:text-lg"
            brStyling="block lg:hidden"
          />
          <TextBlock
            styling="text-sm md:text-base block xl:hidden lg:text-lg"
            brStyling="hidden"
          />
        </div>
      </div>
    </div>
  );
};

export default About;
