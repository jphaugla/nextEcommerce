import React, { useState } from "react";
import { NextPage } from "next";

interface Props {}

interface TextInputProps {
  labelName: string;
  placeholder: string;
  error: boolean;
  errorMessage: string;
  value: string;
  htmlAttr: string;
  handler: (e: React.ChangeEvent<HTMLInputElement>) => void;
  focusHandler?: () => void;
  blurHandler?: () => void;
}

const TextInput: React.FC<TextInputProps> = ({
  error,
  errorMessage = "",
  labelName,
  placeholder,
  value,
  handler,
  focusHandler,
  blurHandler,
  htmlAttr,
}) => {
  return (
    <div className="mb-6">
      <label
        htmlFor={htmlAttr}
        className={`block mb-2 text-sm font-medium ${
          error
            ? "text-red-700 dark:text-red-500"
            : "text-gray-700 dark:text-gray-500"
        }`}
      >
        {labelName}
      </label>
      <input
        type="text"
        id={htmlAttr}
        className={
          error
            ? `bg-red-50 border border-red-500 text-red-900 placeholder-red-700 text-sm rounded-lg focus:ring-red-500 dark:bg-gray-700 focus:border-red-500 block w-full p-2.5 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500`
            : `bg-green-50 border border-gray-500 text-gray-900 dark:text-gray-400 placeholder-gray-700 dark:placeholder-gray-500 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-500`
        }
        value={value}
        placeholder={placeholder}
        onChange={handler}
        onFocus={focusHandler}
        onBlur={blurHandler}
      />

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-500">
          <span className="font-medium">Error!</span> {`${errorMessage}`}
        </p>
      )}
    </div>
  );
};

const InfoContainer: React.FC = () => {
  return (
    <div className="text-gray-900 dark:text-gray-400 w-full sm:w-1/3 p-8 flex flex-col gap-3 justify-evenly">
      <div className="rounded-lg border-solid border-2 bg-slate-500 text-white border-gray-500 p-2 shadow-md">
        <h2>Phone:</h2>
        <p className="">999-999-9999</p>
      </div>

      <div className="rounded-lg border-solid border-2 bg-slate-500 text-white border-gray-500 p-2 shadow-md">
        <h2>Address:</h2>
        <p>123 fake St, 99999</p>
        <p className="">Fake city, Texas</p>
      </div>
      <div className="rounded-lg border-solid border-2 bg-slate-500 text-white border-gray-500 p-2 shadow-md">
        <h2>Hours:</h2>
        <table className="border-spacing-4 md:mb-0">
          <thead></thead>
          <tbody>
            <tr>
              <td className="pr-2 md:pr-1 lg:pr-2 text-base md:text-xs lg:text-sm">
                Mon
              </td>
              <td className="text-base md:text-xs lg:text-sm">8:00am</td>
              <td className="text-base md:text-xs lg:text-sm">-</td>
              <td className="text-base md:text-xs lg:text-sm">6:00pm</td>
            </tr>
            <tr>
              <td className="pr-2 md:pr-1 lg:pr-2 text-base md:text-xs lg:text-sm">
                Tue
              </td>
              <td className="text-base md:text-xs lg:text-sm">8:00am</td>
              <td className="text-base md:text-xs lg:text-sm">-</td>
              <td className="text-base md:text-xs lg:text-sm">6:00pm</td>
            </tr>
            <tr>
              <td className="pr-2 md:pr-1 lg:pr-2 text-base md:text-xs lg:text-sm">
                Wed
              </td>
              <td className="text-base md:text-xs lg:text-sm">8:00am</td>
              <td className="text-base md:text-xs lg:text-sm">-</td>
              <td className="text-base md:text-xs lg:text-sm">6:00pm</td>
            </tr>
            <tr>
              <td className="pr-2 md:pr-1 lg:pr-2 text-base md:text-xs lg:text-sm">
                Thr
              </td>
              <td className="text-base md:text-xs lg:text-sm">8:00am</td>
              <td className="text-base md:text-xs lg:text-sm">-</td>
              <td className="text-base md:text-xs lg:text-sm">6:00pm</td>
            </tr>
            <tr>
              <td className="pr-2 md:pr-1 lg:pr-2 text-base md:text-xs lg:text-sm">
                Fri
              </td>
              <td className="text-base md:text-xs lg:text-sm">8:00am</td>
              <td className="text-base md:text-xs lg:text-sm">-</td>
              <td className="text-base md:text-xs lg:text-sm">6:00pm</td>
            </tr>
            <tr>
              <td className="pr-2 md:pr-1 lg:pr-2 text-base md:text-xs lg:text-sm">
                Sat
              </td>
              <td className="text-base md:text-xs lg:text-sm">8:00am</td>
              <td className="text-base md:text-xs lg:text-sm">-</td>
              <td className="text-base md:text-xs lg:text-sm">3:00pm</td>
            </tr>
            <tr>
              <td className="pr-2 md:pr-1 lg:pr-2 text-base md:text-xs lg:text-sm">
                Sun
              </td>
              <td className="text-base md:text-xs lg:text-sm">8:00am</td>
              <td className="text-base md:text-xs lg:text-sm">-</td>
              <td className="text-base md:text-xs lg:text-sm">3:00pm</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ContactContainer: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");

  const [formErr, setFormErr] = useState(false);
  const [formSuccess, setformSuccess] = useState(false);

  const [nameErr, setNameErr] = useState(false);
  const [emailErr, setEmailErr] = useState(false);
  const [messageErr, setMessageErr] = useState(false);
  const [phoneErr, setPhoneErr] = useState(false);

  const [nameFocus, setNameFocus] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [messageFocus, setMessageFocus] = useState(false);
  const [phoneFocus, setPhoneFocus] = useState(false);

  const validPhone = new RegExp(
    /\+?1?[-]?[ ]?[\(]?(\d{3})[\)]?[ ]?[-]?(\d{3})[ ]?[-]?(\d{4})/m
  );
  const validEmail = new RegExp(/(\w*(?=@))@(\w*(?=\.))(\.com|\.net)/m);

  const handleName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName((name) => e.target.value);
  };
  const handleNameFocus = () => {
    setNameFocus(true);
  };
  const handleNameBlur = () => {
    setNameFocus(false);
  };

  const handleEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (
      !validEmail.test(e.target.value) &&
      e.target.value !== "" &&
      !emailFocus
    ) {
      setEmailErr(true);
    } else {
      setEmailErr(false);
    }
    setEmail((email) => e.target.value);
  };

  const handleEmailFocus = () => {
    setEmailFocus(true);
  };
  const handleEmailBlur = () => {
    setEmailFocus(false);
    if (!validEmail.test(email) && email !== "") {
      setEmailErr(true);
    } else {
      setEmailErr(false);
    }
  };

  const handleMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage((message) => e.target.value);
  };
  const handleMessageFocus = () => {
    setMessageFocus(true);
  };
  const handleMessageBlur = () => {
    setMessageFocus(false);
  };

  const handlePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    let validatedValue = e.target.value.replace(/[^0-9]/g, "");

    if (
      !validPhone.test(validatedValue) &&
      validatedValue !== "" &&
      !phoneFocus
    ) {
      setPhoneErr(true);
    } else {
      setPhoneErr(false);
    }

    setPhone((phone) => validatedValue);
  };
  const handlePhoneFocus = () => {
    setPhoneFocus(true);
  };
  const handlePhoneBlur = () => {
    setPhoneFocus(false);
    if (!validPhone.test(phone) && phone !== "") {
      setPhoneErr(true);
    } else {
      setPhoneErr(false);
    }
  };

  const resetAll = () => {
    setName("");
    setEmail("");
    setMessage("");
    setPhone("");
    setNameErr(false);
    setEmailErr(false);
    setMessageErr(false);
    setPhoneErr(false);
    setFormErr(false);
  };
  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();

    setNameErr(false);
    setEmailErr(false);
    setMessageErr(false);
    setPhoneErr(false);
    setFormErr(false);

    if (!name) {
      setNameErr(true);
      return;
    }
    if (!email) {
      setEmailErr(true);
      return;
    }
    if (!phone) {
      setPhoneErr(true);
      return;
    }
    if (!message) {
      setMessageErr(true);
      return;
    }
    if (!validPhone.test(phone)) {
      setPhoneErr(true);
      return;
    }
    if (!validEmail.test(email)) {
      setEmailErr(true);
      return;
    }
    setformSuccess(true);
    resetAll();
  };

  return (
    <div className="bg-slate-300 sm:rounded-xl w-full md:w-3/4 flex flex-col-reverse sm:flex-row relative">
      <InfoContainer />

      <div className="px-8 py-8 grow">
        <h1 className="text-center text-2xl text-gray-700 dark:text-gray-500 font-bold">
          Contact Us
        </h1>

        <form onSubmit={handleSubmit}>
          <TextInput
            labelName="Your Name"
            placeholder="enter your name"
            error={nameErr}
            errorMessage="Please enter your name"
            value={name}
            handler={handleName}
            htmlAttr={"name"}
            focusHandler={handleNameFocus}
            blurHandler={handleNameBlur}
          />
          <TextInput
            labelName="Your Email"
            placeholder="enter your email"
            error={emailErr}
            errorMessage="Incorrect Email Format"
            value={email}
            handler={handleEmail}
            htmlAttr={"email"}
            focusHandler={handleEmailFocus}
            blurHandler={handleEmailBlur}
          />
          <TextInput
            labelName="Your Phone"
            placeholder="enter your phone number"
            error={phoneErr}
            errorMessage="Incorrect Phone Number Format"
            value={phone}
            handler={handlePhone}
            htmlAttr={"phone"}
            focusHandler={handlePhoneFocus}
            blurHandler={handlePhoneBlur}
          />
          <TextInput
            labelName="Your Message"
            placeholder="enter your message"
            error={messageErr}
            errorMessage="Please enter your message"
            value={message}
            handler={handleMessage}
            htmlAttr={"message"}
            focusHandler={handleMessageFocus}
            blurHandler={handleMessageBlur}
          />
          <div className="px-4 py-3 text-right sm:px-6">
            <button
              type="reset"
              onClick={resetAll}
              className="inline-flex justify-center w-1/6 py-2 px-4 mr-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300"
            >
              Reset
            </button>

            <button
              type="submit"
              className="inline-flex justify-center w-1/4 py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-500 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300"
            >
              Send
            </button>
          </div>
        </form>
        {formSuccess && (
          <div className="bg-green-200 px-10 py-4 rounded-lg ">
            <span>Your Message has Successfully been sent!</span>
            <span
              className="ml-2 text-gray-500 cursor-pointer"
              onClick={() => setformSuccess(false)}
            >
              x
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const contact: NextPage<Props> = () => {
  return (
    <div className="bg-slate-600 h-[100vh] overflow-y-scroll scrollbar-hide grid place-items-center">
      <ContactContainer />
    </div>
  );
};

export default contact;
