import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Forgot from "./forgot";

function Login() {
  const navigate = useNavigate();
  const [islogin, setIslogin] = useState(true);
  const [formdata, setFormdata] = useState({
    name: "",
    email: "",
    password: "",
    confirmpassword: "",
  });
  const handlechange = (e) => {
    setFormdata({ ...formdata, [e.target.name]: e.target.value });
  };
  const valid = (password) => {
    const special = /[!@#$%^&*(),.?":{}|<>]/;
    return password.length >= 6 && special.test(password);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!islogin) {
      if (
        !formdata.name ||
        !formdata.email ||
        !formdata.password ||
        !formdata.confirmpassword
      ) {
        toast.error("Please fill all fields");
        return;
      }
      if (!valid(formdata.password)) {
        toast.error(
          "Password must be at least 6 characters and contain at least one special character."
        );
        return;
      }
      if (formdata.password !== formdata.confirmpassword) {
        toast.error("Passwords do not match");
        return;
      }

      try {
        const res = await axios.post("http://localhost:3001/signup", {
          name: formdata.name,
          email: formdata.email,
          password: formdata.password,
        });
        if (!res.data.success) {
          toast.error(res.data.message);
          return;
        }
        toast.success("successfully signup", {
          onClose: () => setIslogin(true),
        });
       
      } catch (err) {
        toast.error(err.message || "signup failed");
      }
       try {
          const res = await axios.post(
            "http://localhost:3001/email-send",
            {
              name: formdata.name,
              email: formdata.email,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          if (res.data.success) {
            toast.success("email is sented successfully");
          } else {
            toast.error("❌ Failed to send email");
          }
        } catch (err) {
          toast.error("server error ,please try again");
          console.log("error:", err);
        }
        setIslogin(true);
        setFormdata({
          name: "",
          email: "",
          password: "",
          confirmpassword: "",
        });
    }
    // ✅ LOGIN VALIDATION
    if (islogin) {
      if (!formdata.email || !formdata.password) {
        toast.error("Please fill all fields");
        return;
      }
      try {
        const res = await axios.post("http://localhost:3001/login", {
          email: formdata.email,
          password: formdata.password,
        });
        if (res.data.success) {
          toast.success(res.data.message, {
            onClose: () => navigate("/dashboard"),
          });
        } else {
          toast.error(res.data.message);
          if (res.data.message.includes("signup")) setIslogin(false);
        }
      } catch (err) {
        toast.error("somthing went wrong");
      }
    }
  };
  return (
    <>
      <div className="w-[430px] bg-amber-50 p-8 shadow-lg rounded-2xl">
        <div className="flex justify-center mb-4">
          <h2 className="text-center text-2xl font-semibold text-purple-800">
            {islogin ? "Login" : "Sign-up"}
          </h2>
        </div>
        <div className="relative flex h-12 mb-7 overflow-hidden border border-gray-400 rounded-full">
          <button
            className={`w-1/2 font-medium  transition-all z-10 ${
              islogin ? "text-amber-50" : "text-black"
            }`}
            onClick={() => setIslogin(true)}
          >
            Login
          </button>
          <button
            className={`w-1/2 font-medium  transition-all z-10 ${
              !islogin ? "text-amber-50" : "text-black"
            }`}
            onClick={() => setIslogin(false)}
          >
            Signup
          </button>

          <div
            className={`absolute top-0 h-full w-1/2 rounded-full bg-gradient-to-r from-rose-400 via-rose-500 to-rose-700 ${
              islogin ? "left-0" : "left-1/2"
            }`}
          ></div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {!islogin && (
            <input
              onChange={handlechange}
              value={formdata.name}
              name="name"
              placeholder="Enter a name "
              type="text"
              className="w-full p-3 border-b-2 border-gray-300 outline-none  focus:border-rose-400 placeholder-gray-500"
            />
          )}
          <input
            onChange={handlechange}
            value={formdata.email}
            name="email"
            type="email"
            placeholder="Enter a eamil"
            className="w-full p-3 border-b-2 border-gray-300 outline-none  focus:border-rose-400 placeholder-gray-500"
          />
          <input
            onChange={handlechange}
            value={formdata.password}
            name="password"
            type="password"
            placeholder="Password"
            className="w-full p-3 border-b-2 border-gray-300 outline-none  focus:border-rose-400 placeholder-gray-500"
          />
          {!islogin && (
            <input
              onChange={handlechange}
              value={formdata.confirmpassword}
              name="confirmpassword"
              placeholder="Conform Password"
              type="password"
              className="w-full p-3 border-b-2 border-gray-300 outline-none  focus:border-rose-400 placeholder-gray-500"
            />
          )}
          {islogin && (
            <div className="text-right">
              <p className="text-amber-400 hover:underline" onClick={()=>navigate('/forgot')}>Forgot Password?</p>
            </div>
          )}
          <button className="w-full p-3 rounded-full bg-gradient-to-r from-rose-400 via-rose-500 to-rose-700  text-white text-lg font-medium hover:opacity-90 transition">
            {islogin ? "Login" : "Sign-Up"}
          </button>
          <p className="text-center text-gray-600">
            {islogin ? "Don't have an account" : "Already have an account"}
            <a
              className="text-blue-400"
              onClick={(e) => {
                setIslogin(!islogin);
              }}
            >
              {!islogin ? " login" : " Signup"}
            </a>
          </p>
          <div>
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  const decode = JSON.parse(
                    atob(credentialResponse.credential.split(".")[1])
                  );
                  const { name, email } = decode;
                  const res = await axios.post(
                    "http://localhost:3001/google-auth",
                    { name, email }
                  );
                  if (res.data.success) {
                    toast.success(res.data.message, {
                      onClose: () => navigate("/dashboard"), // ✅ go to dashboard
                    });
                  } else {
                    toast.error(res.data.message);
                  }
                } catch (err) {
                  toast.error("google login failed");
                }
              }}
              onError={() => toast.error("login failed")}
              theme="filled_blue"
              text={islogin ? "signin_with" : "signup_with"}
              shape="pill"
            />
          </div>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
export default Login;
