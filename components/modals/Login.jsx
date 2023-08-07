import useLoginModal from "@/hooks/useLoginModal";
import useRegisterModal from "@/hooks/useRegisterModal";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import Modal from "./Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Image from "next/image";

const Login = () => {
  const { isOpen, onClose } = useLoginModal();
  const register = useRegisterModal();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    signIn("credentials", {
      ...loginData,
      redirect: false,
    }).then((callback) => {
      setIsLoading(false);

      if (callback?.ok) {
        onClose();
        router.reload();
      }

      if (callback?.error) {
      }
    });
  };

  const handleChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={`w-full h-full sm:px-4 md:px-6 py-3`}>
        <h1 className="text-xl md:text-2xl font-[600] leading-tight pt-4">
          Log in to your account
        </h1>
        <form className="mt-6" onSubmit={handleSubmit}>
          <Input
            type={"email"}
            name="email"
            id="loginEmail"
            label="Email"
            value={loginData.email}
            required={true}
            onChange={handleChange}
          />
          <Input
            type={"password"}
            name="password"
            id="loginPass"
            label="Password"
            value={loginData.password}
            onChange={handleChange}
            required={true}
            minlength={6}
          />
          <Button disabled={isLoading} type="submit" text="Log In" onClick={() => {}} />
        </form>
        <hr className="my-6 w-full" />
        <button
          onClick={() => signIn("github")}
          className="group px-6 py-3 w-full border-[1px] border-border rounded-full transition duration-300 
 hover:border-blue-400 focus:bg-blue-50 active:bg-blue-100"
        >
          <div className="relative flex items-center space-x-4 justify-center">
            <Image
              width={50}
              height={45}
              src="/github-amber.svg"
              className="absolute left-0 w-8"
              alt="github logo"
            />
            <span
              className="block w-max font-semibold tracking-wide text-sm transition duration-300
               group-hover:text-blue-600 sm:text-base"
            >
              Continue with Github
            </span>
          </div>
        </button>
        <p className="mt-8 text-center">
          Don&apos;t have an account?&nbsp;
          <span
            onClick={() => {
              register.onOpen();
              onClose();
            }}
            className="text-blue-500 hover:text-blue-700 font-semibold cursor-pointer"
          >
            Sign Up
          </span>
        </p>
      </div>
    </Modal>
  );
};

export default Login;
