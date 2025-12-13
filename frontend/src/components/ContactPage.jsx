import React from "react";
import { FaInstagram, FaTwitter, FaFacebook } from "react-icons/fa";
import { useState } from "react";
import axios from "axios";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/api/contact/send-mail", form);
      alert("Thanks for contacting us!");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to send message");
    }
  };

  return (
    <div className="min-h-screen flex flex-col app-bg]">
      <div className="flex-1 flex items-center justify-center">
        <div className="card-bg border border-gray-200 dark:border-gray-700 w-[80%] rounded-2xl shadow-lg p-12 flex justify-between">

          {/* LEFT SIDE */}
          <div className="w-[45%]">
            <blockquote className="text-3xl md:text-4xl font-semibold italic text-gray-900 dark:text-white bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 p-6 rounded-xl border-l-4 mb-8">
              <span className="block">“Struggling to find your nutritional matcha? We can help you blend.”</span>
              <cite className="text-sm text-green-700 mt-3 block text-right">~ Contact Us</cite>
            </blockquote>

            <div className="flex items-center space-x-6 text-2xl">
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-emerald-50 transition"
              >
                <FaInstagram className="hover:text-emerald-500 cursor-pointer" />
              </a>

              <a
                href="https://www.twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-emerald-50 transition"
              >
                <FaTwitter className="hover:text-emerald-500 cursor-pointer" />
              </a>

              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-emerald-50 transition"
              >
                <FaFacebook className="hover:text-emerald-500 cursor-pointer" />
              </a>
            </div>
          </div>

          {/* RIGHT SIDE FORM */}
          <div className="w-[45%]">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your Name"
                className="search-input p-3 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Your Email"
                className="search-input p-3 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />

              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows="5"
                placeholder="Your Feedback"
                className="search-input p-3 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              ></textarea>

              <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-md shadow-lg shadow-emerald-200 dark:shadow-none transition-transform active:scale-95 cursor-pointer">
                Send My Recipe for Success!
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* FOOTER MAP - clickable to open Google Maps at admin location */}
      <footer className="w-full flex justify-center py-8 bg-transparent">
        <div className="w-[80%] flex justify-center">
          <div className="relative w-full h-48 rounded-lg overflow-hidden card-bg border border-gray-200 dark:border-gray-700 shadow-md">
            <iframe
              title="Admin location"
              width="100%"
              height="100%"
              src="https://www.google.com/maps?q=31.2551178,75.7060709&z=15&output=embed"
              className="pointer-events-none"
              aria-hidden="true"
            />
            <a
              href="https://www.google.com/maps/search/?api=1&query=31.2551178,75.7060709"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0"
              aria-label="Open admin location in Google Maps"
            />
          </div>
        </div>
      </footer>
    </div>
  );
}
