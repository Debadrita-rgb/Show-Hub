import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../../config";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};
const AddFeedback = () => {
  const [captchaText, setCaptchaText] = useState("");
  const [userCaptchaInput, setUserCaptchaInput] = useState("");
  const canvasRef = useRef(null);

  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let newCaptcha = "";
    for (let i = 0; i < 6; i++) {
      newCaptcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(newCaptcha);
    drawCaptcha(newCaptcha);
  };

  const drawCaptcha = (text) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#f3f3f3";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < text.length; i++) {
      const fontSize = 28 + Math.floor(Math.random() * 4);
      const x = 10 + i * 20;
      const y = 30 + Math.random() * 8;
      const angle = (Math.random() - 0.5) * 0.5;

      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = "#000";
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }

    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    status: "Feedback",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userCaptchaInput.trim().toLowerCase() !== captchaText.toLowerCase()) {
      toast.error("Invalid CAPTCHA. Please try again.");
      generateCaptcha();
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/user/submit-contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success(result.message);
        setFormData({ name: "", email: "", message: "", status: "" });
        setUserCaptchaInput("");
        generateCaptcha();
      } else {
        toast.error(result.error || "Failed to send message");
      }
    } catch (err) {
      toast.error("Server error");
      console.error(err);
    }
  };

  return (
    <section className="relative px-6 md:px-16 py-16 overflow-hidden">
      <ToastContainer position="top-right" autoClose={2000} />

      <div className="absolute inset-0 -z-10">
        <img
          src="https://media.cnn.com/api/v1/images/stellar/prod/221129103455-06-body-cruise-critic-editors-picks-2022-norwegian-prima.jpg?q=w_1110,c_fill"
          alt="Cruise"
          className="w-full h-full object-cover blur-md scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-cyan-900/60" />
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 backdrop-blur-md bg-white/10 border border-white/30 rounded-3xl p-8 md:p-12 shadow-[0_10px_40px_rgba(0,255,255,0.2)]">
        <div>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="text-white"
          >
            <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-teal-300 to-cyan-400 text-transparent bg-clip-text">
              Send a Feedback
            </h3>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            className="text-white space-y-5"
          >
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input name="status" value="Feedback" type="hidden" />
              <input
                name="name"
                value={formData.name}
                autoComplete="off"
                onChange={handleChange}
                type="text"
                className="w-full p-2 rounded-lg bg-white/20 placeholder-white/70 text-white"
                placeholder="Your Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                name="email"
                value={formData.email}
                autoComplete="off"
                onChange={handleChange}
                type="email"
                className="w-full p-2 rounded-lg bg-white/20 placeholder-white/70 text-white"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                className="w-full p-2 rounded-lg bg-white/20 placeholder-white/70 text-white"
                placeholder="Type your message..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Enter CAPTCHA
              </label>
              <canvas
                ref={canvasRef}
                width="150"
                height="50"
                className="border rounded bg-gray-100 dark:bg-white/10 mb-2"
              />
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Refresh
                </button>
              </div>
              <input
                type="text"
                value={userCaptchaInput}
                onChange={(e) => setUserCaptchaInput(e.target.value)}
                required
                placeholder="Type CAPTCHA here"
                className="w-full p-2 rounded-lg bg-gray-100 dark:bg-white/20 text-white"
              />
            </div>
            <button
              type="submit"
              className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-xl shadow-lg"
            >
              Submit
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default AddFeedback;
