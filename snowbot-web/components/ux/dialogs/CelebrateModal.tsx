// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment } from "react";
import Image  from "next/image";
import Confetti from "react-confetti";

export default function CelebrateModal(props: { isLoading: boolean, error: any, title?: string, isOpen: boolean, setIsOpen: any, showSkellyInTitle: boolean, children: any }) {
  const { isLoading, error, title, isOpen, setIsOpen, showSkellyInTitle, children } = props;
  
  function closeModal(e: any) {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
  }

  if (isLoading) {
    return <div className="flex fixed inset-0 z-10 overflow-y-auto items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-white inline-flex">
        <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
        </span>
      </div>
        <div className="fixed inset-0 bg-black/50" aria-hidden="true"/>
      <span className="sr-only">Loading</span>
    </div>
  }
    return <Transition appear show={isOpen} as={Fragment}>
    <Dialog
      as="div"
      className="fixed inset-0 z-10 overflow-y-auto"
        onClose={() => { if (!isLoading) setIsOpen(false)}}
      >
        <div className="fixed inset-0 bg-black/50" aria-hidden="true">
          {!error && <Confetti className="motion-reduce:hidden" />}
        </div>
      <div className="min-h-screen px-4 text-center">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Dialog.Overlay className="fixed inset-0" />
        </Transition.Child>

        {/* This element is to trick the browser into centering the modal contents. */}
        <span
          className="inline-block h-screen align-middle"
          aria-hidden="true"
        >
          &#8203;
        </span>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-50"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div className="inline-block w-full max-w-md p-4 my-4 overflow-hidden text-left align-middle transition-all transform bg-gray-600 shadow-xl rounded-lg">
            <Dialog.Title
              as="h3"
              className="flex flex-row text-lg font-medium text-slate-100 uppercase pb-2 border-b-[1px] border-slate-800"
              >
                {showSkellyInTitle && <Image src="/assets/images/skellybrate.webp" alt="skellybrate" height={35} width={35} className="mr-2" />}
                {title}
                <button
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                  onClick={closeModal}>
                  <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"></path>
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
            </Dialog.Title>
            <div className="mt-2 text-gray-200 min-h-[200px]">
             {children}
            </div>
              
            <div className="mt-4">
                {!isLoading && <button
                  type="button"
                  className="inline-flex justify-center px-4 py-2 text-sm text-blue-500 rounded-md hover:bg-slate-200 duration-300"
                  onClick={closeModal}
                >
                  Close
                </button>}
                {isLoading && <div className="inline-flex justify-center px-4 py-2 text-sm text-blue-500 rounded-md">&#8203;</div>}
            </div>
          </div>
        </Transition.Child>
      </div>
    </Dialog>
  </Transition>
}