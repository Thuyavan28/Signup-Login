import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
function Forgot() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");

  const [confirmpassword, sendConfirmpassword] = useState("");
  const valid = (password) => {
    const special = /[!@#$%^&*(),.?":{}|<>]/;
    return password.length >= 6 && special.test(password);
  };

  const handleSendotp = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("fill the field");
      return;
    }
    try {
      const res = await axios.post("http://localhost:3001/send-otp", { email });
      if (res.data.success) {
        toast.success("OTP sent to your Email");
        setStep(2);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("failed to sent the OTP");
    }
  };
  const handleReset = async (e) => {
    e.preventDefault();
    if (!otp || !password || !confirmpassword) {
      toast.error("please fill the fields");
      return;
    }
    if (!valid(password)) {
      toast.error(
        "password must contain 6 character with one Special character"
      );
    }
    if (password !== confirmpassword) {
      toast.error("both password are not match");
    }
    try {
      const res = await axios.post("http://localhost:3001/reset-password", {
        email,
        otp,
        password,
      });
      if (res.data.success) {
        toast.success("Password reset successfully", {
          onClose: () => navigate("/login"),
        });
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Failed to reset password");
    }
  };
  return (
    <>
      <div className=" grid w-[430px] bg-white place-content-center rounded-2xl p-8">
        <h1 className="text-3xl p-5 mb-4 font-semibold text-fuchsia-700 ">
          Forgot Password
        </h1>
        {step === 1 ? (
          <form className="space-y-4" onSubmit={handleSendotp}>
            <input
              className=" w-full  p-3 border-b-3 border-gray-500 outline-none focus:border-rose-400 placeholder-gray-500"
              type="email"
              placeholder="Enter a email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="w-full  p-3 rounded-full bg-gradient-to-r from-rose-400 via-rose-500 to-rose-700 text-white font-medium hover:opacity-90 transition">
              SEND OTP
            </button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleReset}>
            <input
              type="text"
              placeholder="Enter OTP"
              className=" w-full  p-3 border-b-3 border-gray-500 outline-none focus:border-rose-400 placeholder-gray-500"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <input
              type="text"
              placeholder="New Password"
              className=" w-full  p-3 border-b-3 border-gray-500 outline-none focus:border-rose-400 placeholder-gray-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="text"
              className=" w-full  p-3 border-b-3  border-gray-500 outline-none focus:border-rose-400 placeholder-gray-500"
              placeholder="Confirm Password"
              value={confirmpassword}
              onChange={(e) => sendConfirmpassword(e.target.value)}
            />
            <button className="w-full  p-3 rounded-full bg-gradient-to-r from-rose-400 via-rose-500 to-rose-700 text-white font-medium hover:opacity-90 transition">
              Reset Password
            </button>
          </form>
        )}
        <p className="p-5 text-center text-gray-600">
          Back to{" "}
          <span
            className="text-blue-400 cursor-pointer "
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
export default Forgot;
