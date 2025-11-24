import { useState } from 'react'
import React from 'react';

function App() {
  return (
    <div className="min-h-screen flex">
      {/* Left side with image */}
      <div className="w-1/2 bg-blue-700 flex items-center justify-center p-8">
        <div className="relative w-full h-full">
          <img
            src="https://avatars.mds.yandex.net/i?id=a4ea893d09fdb7bc8c512a3b23e588c337072552-5150736-images-thumbs&n=13"
            alt="Campus Students"
            className="object-cover w-full h-full rounded-lg shadow-lg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900 to-transparent opacity-70 rounded-lg"></div>
          <div className="absolute bottom-8 left-8 text-white text-left">
            <h2 className="text-4xl font-bold mb-2">Welcome to Your Student Portal</h2>
            <p className="text-xl">Stay connected, access resources, and manage your academic journey.</p>
          </div>
        </div>
      </div>

      {/* Right side with sign-in form */}
      <div className="w-1/2 flex items-center justify-center bg-gray-50 p-8">
        <div className="bg-white p-10 rounded-lg shadow-xl w-full max-w-md">
          <div className="flex justify-center mb-8">
            {/* You can replace this with your university logo */}
            <img
              src="https://upload.wikimedia.org/wikipedia/en/thumb/5/52/University_of_Birmingham_crest.svg/1200px-University_of_Birmingham_crest.svg.png" // Example logo
              alt="University Logo"
              className="h-24 w-auto"
            />
          </div>
          <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-8">Sign In to Your Account</h2>

          <form className="space-y-6">
            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">
                Student ID
              </label>
              <div className="mt-1">
                <input
                  id="studentId"
                  name="studentId"
                  type="text"
                  autoComplete="studentId"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your Student ID"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 12a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
