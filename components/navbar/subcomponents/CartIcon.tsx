import React from "react";

interface Props {
  numItems: number;
}

const CartIcon: React.FC<Props> = ({ numItems }) => {
  return (
    <div className="group -m-2 p-2 flex items-center cursor-pointer">
      <svg
        className="flex-shrink-0 transition-transform duration-100 ease-in-out hover:scale-110 h-6 w-6 text-gray-400 group-hover:text-gray-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
      <span className="ml-2 text-sm font-medium text-gray-700 select-none group-hover:text-gray-800">
        {numItems}
      </span>
      <span className="sr-only">items in cart, view bag</span>
    </div>
  );
};

export default CartIcon;
