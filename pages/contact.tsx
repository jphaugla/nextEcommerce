import React, { useState } from "react";
import { NextPage } from "next";

interface Props {}
interface FormContainerProps {
  children?: JSX.Element[] | JSX.Element;
}
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
            : `bg-green-50 border border-gray-500 text-green-900 dark:text-gray-400 placeholder-gray-700 dark:placeholder-gray-500 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-500`
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

const FormContainer: React.FC<FormContainerProps> = ({ children }) => {
  return (
    <div className="w-1/2 bg-slate-300 px-8 py-8 rounded-xl">
      <h1 className="text-center text-2xl text-gray-700 dark:text-gray-500 font-bold">
        Contact Us
      </h1>
      <form>{children}</form>
    </div>
  );
};

const contact: NextPage<Props> = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");

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

  return (
    <div className="bg-slate-600 h-[100vh] grid place-items-center">
      <FormContainer>
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
      </FormContainer>
    </div>
  );
};

export default contact;
