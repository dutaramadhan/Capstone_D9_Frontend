import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import RecycleImage from "@/../public/Recycle.jpg";
import { useRouter } from "next/router";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/login`,
        {
          username: username,
          password: password,
        }
      );

      localStorage.setItem("token", response.data.token);
      toast.success("Login Sukses!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Login Gagal");
    } finally {
      router.push("/");
    }
  };
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col md:flex-row justify-center">
      <div className="max-w-screen-xl min-h-screen lg:min-h-0 w-full sm:m-0 lg:m-28 bg-white shadow md:rounded-lg flex flex-col md:flex-row justify-center">
        <div className="w-full md:w-1/2 xl:w-5/12 p-6 sm:p-12 flex items-center order-2 md:order-1 px-4 sm:px-12">
          <div className="flex flex-col items-center w-full">
            <div className="w-full flex-1">
              <div className="mb-20 border-b text-center">
                <div className="text-[20px] sm:text-[24px] font-bold md:text-[26px] lg:text-[30px] leading-none px-2 inline-block text-gray-600 tracking-wide bg-white transform translate-y-1/2">
                  APLIKASI DASHBOARD TPST SINDUADI SLEMAN
                </div>
              </div>
              <div className="mx-auto max-w-xs">
                <input
                  className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                  type="username"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <input
                  className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  className="mt-5 tracking-wide font-semibold bg-green-400 text-white-500 w-full py-4 rounded-lg hover:bg-green-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
                  onClick={handleLogin}
                >
                  <svg
                    className="w-6 h-6 -ml-2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <path d="M20 8v6M23 11h-6" />
                  </svg>
                  <span className="ml-2">Sign In</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/2 h-64 md:h-auto flex items-center justify-center order-1 md:order-2">
          <div className="w-full h-full relative">
            <Image
              src={RecycleImage}
              alt="Recycle Items"
              fill
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
